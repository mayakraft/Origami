/**
 * Rabbit Ear (c) Kraft
 */
import { EPSILON, TWO_PI } from "./constant.js";
import { cross2, scale2, add2, subtract, subtract3, parallel } from "./vector.js";

/**
 * the radius parameter measures from the center to the midpoint of the edge
 * vertex-axis aligned
 * todo: also possible to parameterize the radius as the center to the points
 * todo: can be edge-aligned
 */
const angleArray = (count) =>
	Array.from(Array(Math.floor(count))).map((_, i) => TWO_PI * (i / count));

const anglesToVecs = (angles, radius) =>
	angles.map((a) => [radius * Math.cos(a), radius * Math.sin(a)]);

// a = 2r tan(π/n)

/**
 * @description Make a regular polygon from a circumradius,
 * the first point is +X aligned.
 * @param {number} sides the number of sides in the polygon
 * @param {number} [circumradius=1] the polygon's circumradius
 * @returns {[number, number][]} an array of 2D points
 */
export const makePolygonCircumradius = (sides = 3, circumradius = 1) =>
	anglesToVecs(angleArray(sides), circumradius);

/**
 * @description Make a regular polygon from a circumradius,
 * the middle of the first side is +X aligned.
 * @param {number} sides the number of sides in the polygon
 * @param {number} [circumradius=1] the polygon's circumradius
 * @returns {[number, number][]} an array of points, each point as an arrays of numbers
 */
export const makePolygonCircumradiusSide = (sides = 3, circumradius = 1) => {
	const halfwedge = Math.PI / sides;
	const angles = angleArray(sides).map((a) => a + halfwedge);
	return anglesToVecs(angles, circumradius);
};

/**
 * @description Make a regular polygon from a inradius,
 * the first point is +X aligned.
 * @param {number} sides the number of sides in the polygon
 * @param {number} [inradius=1] the polygon's inradius
 * @returns {[number, number][]} an array of points, each point as an arrays of numbers
 */
export const makePolygonInradius = (sides = 3, inradius = 1) =>
	makePolygonCircumradius(sides, inradius / Math.cos(Math.PI / sides));

/**
 * @description Make a regular polygon from a inradius,
 * the middle of the first side is +X aligned.
 * @param {number} sides the number of sides in the polygon
 * @param {number} [inradius=1] the polygon's inradius
 * @returns {[number, number][]} an array of points, each point as an arrays of numbers
 */
export const makePolygonInradiusSide = (sides = 3, inradius = 1) =>
	makePolygonCircumradiusSide(sides, inradius / Math.cos(Math.PI / sides));

/**
 * @description Make a regular polygon from a side length,
 * the first point is +X aligned.
 * @param {number} sides the number of sides in the polygon
 * @param {number} [length=1] the polygon's side length
 * @returns {[number, number][]} an array of points, each point as an arrays of numbers
 */
export const makePolygonSideLength = (sides = 3, length = 1) =>
	makePolygonCircumradius(sides, length / 2 / Math.sin(Math.PI / sides));

/**
 * @description Make a regular polygon from a side length,
 * the middle of the first side is +X aligned.
 * @param {number} sides the number of sides in the polygon
 * @param {number} [length=1] the polygon's side length
 * @returns {[number, number][]} an array of points, each point as an arrays of numbers
 */
export const makePolygonSideLengthSide = (sides = 3, length = 1) =>
	makePolygonCircumradiusSide(sides, length / 2 / Math.sin(Math.PI / sides));

/**
 * @description Remove any collinear vertices from a n-dimensional polygon.
 * @param {([number, number] | [number, number, number])[]} polygon a polygon
 * as an array of ordered points in array form
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {([number, number] | [number, number, number])[]} a copy of
 * the polygon with collinear points removed
 */
export const makePolygonNonCollinear = (polygon, epsilon = EPSILON) => {
	// index map [i] to [i, i+1]
	const edges_vector = polygon
		.map((v, i, arr) => [v, arr[(i + 1) % arr.length]])
		.map((pair) => subtract(pair[1], pair[0]));
	// the vertex to be removed. true=valid, false=collinear.
	// ask if an edge is parallel to its predecessor, this way,
	// the edge index will match to the collinear vertex.
	const vertex_collinear = edges_vector
		.map((vector, i, arr) => [vector, arr[(i + arr.length - 1) % arr.length]])
		.map((pair) => !parallel(pair[1], pair[0], epsilon));
	return polygon.filter((_, v) => vertex_collinear[v]);
};

/**
 * @description Remove any collinear vertices from a n-dimensional polygon.
 * @param {[number, number, number][]} polygon a polygon
 * as an array of ordered points in array form
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {[number, number, number][]} a copy of
 * the polygon with collinear points removed
 */
export const makePolygonNonCollinear3 = (polygon, epsilon = EPSILON) => {
	// index map [i] to [i, i+1]
	const edges_vector = polygon
		.map((v, i, arr) => [v, arr[(i + 1) % arr.length]])
		.map((pair) => subtract3(pair[1], pair[0]));
	// the vertex to be removed. true=valid, false=collinear.
	// ask if an edge is parallel to its predecessor, this way,
	// the edge index will match to the collinear vertex.
	const vertex_collinear = edges_vector
		.map((vector, i, arr) => [vector, arr[(i + arr.length - 1) % arr.length]])
		.map((pair) => !parallel(pair[1], pair[0], epsilon));
	return polygon.filter((_, v) => vertex_collinear[v]);
};

/**
 * @description Calculates the signed area of a polygon.
 * This requires the polygon be non-self-intersecting.
 * @param {[number, number][]} points an array of 2D points,
 * which are arrays of numbers
 * @returns {number} the area of the polygon
 * @example
 * var area = polygon.signedArea([ [1,2], [5,6], [7,0] ])
 */
export const signedArea = (points) =>
	0.5 *
	points
		.map((el, i, arr) => [el, arr[(i + 1) % arr.length]])
		.map(([a, b]) => cross2(a, b))
		.reduce((a, b) => a + b, 0);

/**
 * @description Calculates the centroid or the center of mass of the polygon.
 * @param {[number, number][]} points an array of 2D points, which are arrays of numbers
 * @returns {[number, number]} one 2D point as an array of numbers
 * @example
 * var centroid = polygon.centroid([ [1,2], [8,9], [8,0] ])
 */
export const centroid = (points) => {
	const sixthArea = 1 / (6 * signedArea(points));
	const sum = points
		.map((el, i, arr) => [el, arr[(i + 1) % arr.length]])
		.map(([a, b]) => scale2(add2(a, b), cross2(a, b)))
		.reduce((a, b) => add2(a, b), [0, 0]);
	return [sum[0] * sixthArea, sum[1] * sixthArea];
};

/**
 * @description Given a list of points, get the dimension of the first
 * point in the list, return the dimension. Expecting either 2 or 3.
 * @param {number[][]} points
 * @returns {number} the dimension of the first point in the list
 */
const getDimension = (points) => {
	for (let i = 0; i < points.length; i += 1) {
		if (points[i] && points[i].length) {
			return points[i].length;
		}
	}
	return 0;
};

/**
 * @description Make an axis-aligned bounding box that encloses a set of points.
 * the optional padding is used to make the bounding box inclusive / exclusive
 * by adding padding on all sides, or inset in the case of negative number.
 * (positive=inclusive boundary, negative=exclusive boundary)
 * @param {number[][]} points an array of unsorted points, in any dimension
 * @param {number} [padding=0] optionally add padding around the box
 * @returns {Box?} an object where "min" and "max" are two points and
 * "span" is the lengths. returns "undefined" if no points were provided.
 */
export const boundingBox = (points, padding = 0) => {
	if (!points || !points.length) {
		return undefined;
	}
	const dimension = getDimension(points);
	const min = Array(dimension).fill(Infinity);
	const max = Array(dimension).fill(-Infinity);
	points
		.filter((p) => p !== undefined)
		.forEach((point) =>
			point.forEach((c, i) => {
				if (c < min[i]) {
					min[i] = c - padding;
				}
				if (c > max[i]) {
					max[i] = c + padding;
				}
			}),
		);
	const span = max.map((m, i) => m - min[i]);
	return { min, max, span };
};
