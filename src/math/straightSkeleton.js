/**
 * Rabbit Ear (c) Kraft
 */
import { excludeR } from "./compare.js";
import { subtract2, distance, flip2 } from "./vector.js";
import { clockwiseBisect2 } from "./radial.js";
import { nearestPointOnLine } from "./nearest.js";
import { intersectLineLine } from "./intersect.js";

/**
 * @description this recursive algorithm works outwards-to-inwards, each repeat
 * decreases the size of the polygon by one point/side. (removes 2, adds 1)
 * and repeating the algorithm on the smaller polygon.
 * @param {[number, number][]} points array of point objects (arrays of numbers, [x, y]).
 * the counter-clockwise sorted points of the polygon. as we recurse this
 * list shrinks by removing the points that are "finished".
 * @param {VecLine2[]} lines
 * @param {[number, number][]} bisectors 2D vectors
 * @returns {object[]} array of line segments as objects with keys:
 * "points": array of 2 points in array form [ [x, y], [x, y] ]
 * "type": "skeleton" or "kawasaki", the latter being the projected
 * perpendicular dropped edges down to the sides of the polygon.
 */
const recurseSkeleton = (points, lines, bisectors) => {
	// every point has an interior angle bisector vector, this ray is
	// tested for intersections with its neighbors on both sides.
	// "intersects" is fencepost mapped (i) to "points" (i, i+1)
	// because one point/ray intersects with both points on either side,
	// so in reverse, every point (i) relates to intersection (i-1, i)
	const intersects = points
		// .map((p, i) => math.ray(bisectors[i], p))
		// .map((ray, i, arr) => ray.intersect(arr[(i + 1) % arr.length]));
		.map((origin, i) => ({ vector: bisectors[i], origin }))
		.map(
			(ray, i, arr) =>
				intersectLineLine(ray, arr[(i + 1) % arr.length], excludeR, excludeR).point,
		);
	// project each intersection point down perpendicular to the edge of the polygon
	// const projections = lines.map((line, i) => line.nearestPoint(intersects[i]));
	/** @type {[number, number][]} */
	const projections = lines
		.map((line, i) => nearestPointOnLine(line, intersects[i]))
		.map(([a, b]) => [a, b]);
	// when we reach only 3 points remaining, we are at the end. we can return early
	// and skip unnecessary calculations, all 3 projection lengths will be the same.
	if (points.length === 3) {
		return points
			.map((p) => ({ type: "skeleton", points: [p, intersects[0]] }))
			.concat([{ type: "perpendicular", points: [projections[0], intersects[0]] }]);
	}
	// measure the lengths of the projected lines, these will be used to identify
	// the smallest length, or the point we want to operate on this round.
	const projectionLengths = intersects.map((intersect, i) =>
		distance(intersect, projections[i]),
	);
	let shortest = 0;
	projectionLengths.forEach((len, i) => {
		if (len < projectionLengths[shortest]) {
			shortest = i;
		}
	});
	// we have the shortest length, we now have the solution for this round
	// (all that remains is to prepare the arguments for the next recursive call)
	const solutions = [
		{
			type: "skeleton",
			points: [points[shortest], intersects[shortest]],
		},
		{
			type: "skeleton",
			points: [points[(shortest + 1) % points.length], intersects[shortest]],
		},
		// perpendicular projection
		// we could expand this algorithm here to include all three instead of just one.
		// two more of the entries in "intersects" will have the same length as shortest
		{ type: "perpendicular", points: [projections[shortest], intersects[shortest]] },
		// ...projections.map(p => ({ type: "perpendicular", points: [p, intersects[shortest]] }))
	];
	// our new smaller polygon, missing two points now, but gaining one more (the intersection)
	// this is to calculate the new angle bisector at this new point.
	// we are now operating on the inside of the polygon, the lines that will be built from
	// this bisection will become interior skeleton lines.
	// first, flip the first vector so that both of the vectors originate at the
	// center point, and extend towards the neighbors.
	const newVector = clockwiseBisect2(
		flip2(lines[(shortest + lines.length - 1) % lines.length].vector),
		lines[(shortest + 1) % lines.length].vector,
	);
	// delete 2 entries from "points" and "bisectors" and add each array's new element.
	// delete 1 entry from lines.
	const shortest_is_last_index = shortest === points.length - 1;
	points.splice(shortest, 2, intersects[shortest]);
	lines.splice(shortest, 1);
	bisectors.splice(shortest, 2, newVector);
	if (shortest_is_last_index) {
		// in the case the index was at the end of the array,
		// we tried to remove two elements but only removed one because
		// it was the last element. remove the first element too.
		points.splice(0, 1);
		bisectors.splice(0, 1);
		// also, the fencepost mapping of the lines array is off by one,
		// move the first element to the end of the array.
		lines.push(lines.shift());
	}
	return solutions.concat(recurseSkeleton(points, lines, bisectors));
};

/**
 * @description create a straight skeleton inside of a convex polygon
 * @param {[number, number][]} points counter-clockwise polygon as an array of points
 * (which are arrays of numbers)
 * @returns {object[]} list of objects containing "points" {number[][]}: two points
 * defining a line segment, and "type" {string}: either "skeleton" or "perpendicular"
 *
 * make sure:
 *  - your polygon is convex (todo: make this algorithm work with non-convex)
 *  - your polygon points are sorted counter-clockwise
 */
export const straightSkeleton = (points) => {
	// first time running this function, create the 2nd and 3rd parameters
	// convert the edges of the polygons into lines
	const lines = points
		.map((p, i, arr) => [p, arr[(i + 1) % arr.length]])
		// .map(side => math.line.fromPoints(...side));
		.map((side) => ({ vector: subtract2(side[1], side[0]), origin: side[0] }));
	// get the interior angle bisectors for every corner of the polygon
	// index map match to "points"
	const bisectors = points
		// each element into 3 (previous, current, next)
		.map((_, i, ar) =>
			[(i - 1 + ar.length) % ar.length, i, (i + 1) % ar.length].map((j) => ar[j]),
		)
		// make 2 vectors, from current point to previous/next neighbors
		.map((p) => [subtract2(p[0], p[1]), subtract2(p[2], p[1])])
		// it is a little counter-intuitive but the interior angle between three
		// consecutive points in a counter-clockwise wound polygon is measured
		// in the clockwise direction
		.map(([a, b]) => clockwiseBisect2(a, b));
	// points is modified in place. create a copy
	// const points_clone = JSON.parse(JSON.stringify(points));
	// console.log("ss points", points_clone, points);
	return recurseSkeleton([...points], lines, bisectors);
};
