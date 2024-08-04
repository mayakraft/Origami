/**
 * Rabbit Ear (c) Kraft
 */
import {
	includeR,
	includeS,
} from "../math/compare.js";
import {
	normalize2,
	dot2,
	cross2,
	scale2,
	add2,
	distance2,
	midpoint2,
	flip2,
	rotate90,
} from "../math/vector.js";
import {
	clipLineConvexPolygon,
} from "../math/clip.js";
import {
	intersectLineLine,
	// intersectConvexPolygonLine,
} from "../math/intersect.js";

/**
 * @description Given a polygon and a line, clip the line and return the
 * midpoint of the resulting segment.
 * @param {[number, number][]} polygon a convex polygon as an array of 2D points,
 * each point an array of numbers
 * @param {VecLine2} line a line in the form of a vector and origin
 * @returns {[number, number]} a 2D point
 */
const getLineMidpointInPolygon = (polygon, line) => {
	const segment = clipLineConvexPolygon(polygon, line);
	return segment === undefined
		? undefined
		: midpoint2(segment[0], segment[1]);
};

/**
 * @description Given a polygon and a line which passes through it,
 * create a segment perpendicular to the line which fits nicely
 * inside the polygon, but is also balanced in its length on either side
 * of the input line, so, whichever side of the perpendicular segment
 * is the shortest, the other side will be equal in length to it.
 * By default the midpoint of the line (the line's segment inside the polygon)
 * will be chosen to build the perpendicular line through,
 * if you like, you can specify this point.
 * @param {[number, number][]} polygon a convex polygon as an array of 2D points,
 * each point an array of numbers
 * @param {VecLine2} line a line in the form of a vector and origin
 * @param {[number, number]} [point] an optional point along the line
 * through which the perpendicular line will pass.
 * @returns {[number, number][]|undefined} a segment as an array of two points.
 */
export const perpendicularBalancedSegment = (polygon, line, point) => {
	// if provided, use the point as the origin, otherwise use the line midpoint
	const origin = point === undefined
		? getLineMidpointInPolygon(polygon, line)
		: point;

	// the vector of our line is simply the perpendicular
	const vector = rotate90(line.vector); // rotate270

	// compare the two lengths from the origin of our new line to both
	// ends of the segment clipped in the polygon, return the shortest.
	const clip = clipLineConvexPolygon(polygon, line);
	if (!clip) {
		return undefined;
	}

	const shortest = clip
		.map(pt => distance2(origin, pt))
		.sort((a, b) => a - b)
		.shift();

	// build a vector in the direction of our perpendicular line but
	// with a scale that is half of the length of the final segment.
	const scaled = scale2(normalize2(vector), shortest);

	// our segment stretches in both directions from the origin
	// by an equal amount
	return [
		add2(origin, flip2(scaled)),
		add2(origin, scaled),
	];
};

/**
 * like in axiom 3 when two segments don't intersect and the fold
 * line lies exactly between them
 * In this case, the segments are parallel, and the fold line sits
 * @param {VecLine2} foldLine the fold line, the (single) result of axiom 3
 * @param {VecLine2[]} lines two lines, the inputs to axiom 3
 * @param {[number, number][][]} segments two segments the visible portion of the input lines
 */
export const betweenTwoSegments = (foldLine, lines, segments) => {
	// two midpoints, the midpoint of each of the two segments
	const midpoints = segments.map(seg => midpoint2(seg[0], seg[1]));

	// construct a line through the two midpoints
	// const midpointLine = pointsToLine(...midpoints);

	// find the place... this is not needed. just get the midpoint
	// const origin = intersectLineLine(foldLine, midpointLine).point;
	const origin = midpoint2(midpoints[0], midpoints[1]);

	// perpendicular to the fold line, passing through
	// the midpoint between the two segment's midpoints.
	const perpendicular = { vector: rotate90(foldLine.vector), origin };

	return lines.map(line => intersectLineLine(line, perpendicular).point);
};

/**
 * please refactor dear god please refactor
 */
export const betweenTwoIntersectingSegments = (lines, intersect, foldLine, boundary) => {
	// the input lines as vectors, and the same vectors flipped around
	const paramVectors = lines.map(l => l.vector);
	const flippedVectors = paramVectors.map(flip2);

	// four rays, extending outwards from the intersection point,
	// tracing the path of each of the two input lines.
	const paramRays = paramVectors
		.concat(flippedVectors)
		.map(vector => ({ vector, origin: intersect }));

	// for each ray, apply the dot and cross product with the foldLine.
	// to be used in the upcoming section.
	const dots = paramRays.map(ray => dot2(ray.vector, foldLine.vector));
	const crosses = paramRays.map(ray => cross2(ray.vector, foldLine.vector));

	// we know the two "lines" intersect, and the "foldLine" passes through this
	// intersection and is an angle bisector between the two lines,
	// therefore, the four rays that follow "lines" from the intersection lie
	// each one in one of the four quadrants formed by the axis of the foldLine.
	// We can find exactly which ray is in which quadrant by consulting
	// their dot and cross products.
	const a1 = paramRays
		.filter((ray, i) => dots[i] > 0 && crosses[i] > 0)
		.shift();
	const a2 = paramRays
		.filter((ray, i) => dots[i] > 0 && crosses[i] < 0)
		.shift();
	const b1 = paramRays
		.filter((ray, i) => dots[i] < 0 && crosses[i] > 0)
		.shift();
	const b2 = paramRays
		.filter((ray, i) => dots[i] < 0 && crosses[i] < 0)
		.shift();

	// intersect each of the four rays with the polygon, returning a list
	// of four points, and we know the order of these points now.
	const rayClips = [a1, a2, b1, b2].map(ray => clipLineConvexPolygon(
		boundary,
		ray,
		includeS,
		includeR,
	));

	// just added
	if (rayClips.includes(undefined)) { return; }

	const rayEndpoints = rayClips.map(clips => clips.shift()); // ).shift().shift());

	// we can now build two arrows between the four points, however,
	// we still need to... do something
	const rayLengths = rayEndpoints.map(pt => distance2(pt, intersect));

	const arrow1Start = (rayLengths[0] < rayLengths[1]
		? rayEndpoints[0]
		: rayEndpoints[1]);
	const arrow1End = (rayLengths[0] < rayLengths[1]
		? add2(a2.origin, scale2(normalize2(a2.vector), rayLengths[0]))
		: add2(a1.origin, scale2(normalize2(a1.vector), rayLengths[1])));
	const arrow2Start = (rayLengths[2] < rayLengths[3]
		? rayEndpoints[2]
		: rayEndpoints[3]);
	const arrow2End = (rayLengths[2] < rayLengths[3]
		? add2(b2.origin, scale2(normalize2(b2.vector), rayLengths[2]))
		: add2(b1.origin, scale2(normalize2(b1.vector), rayLengths[3])));

	return [
		[arrow1Start, arrow1End],
		[arrow2Start, arrow2End],
	];
};
