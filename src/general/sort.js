/**
 * Rabbit Ear (c) Kraft
 */
import { normalize2, dot, subtract, basisVectors3 } from "../math/vector.js";
import { projectPointOnPlane } from "../math/plane.js";

/**
 * @description Provide a comparison function and use it to sort an array
 * of any type of object against a single item. The returned array will be
 * the indices of the original array in sorted order.
 * @param {any[]} array an array of elements to be sorted
 * @param {any} item the item which to compare against all array elements
 * @param {Function} compareFn the comparison function to be run against
 * every element in the array with the input item parameter, placing
 * the array element first, the input item second: fn(arrayElem, paramItem)
 * @returns {number[]} the indices of the original array, in sorted order
 */
const sortAgainstItem = (array, item, compareFn) =>
	array
		.map((el, i) => ({ i, n: compareFn(el, item) }))
		.sort((a, b) => a.n - b.n)
		.map((a) => a.i);

/**
 * @description Sort an array of n-dimensional points along an
 * n-dimensional vector, get the indices in sorted order.
 * @param {number[][]} points array of points (which are arrays of numbers)
 * @param {number[]} vector one vector
 * @returns {number[]} a list of sorted indices to the points array.
 */
export const sortPointsAlongVector = (points, vector) =>
	sortAgainstItem(points, vector, dot);

/**
 * @description Radially sort a list of 2D unit vectors
 * counter-clockwise, starting from the +X axis, [1, 0].
 * Vectors must be normalized within the 2nd dimension.
 * @param {[number, number][]} vectors a list of 2D unit vectors
 * @returns {number[]} a list of indices that reference the input list.
 * @notes
 *
 *       (+y)
 *        |
 *  -d +c |  +d +c
 *        |
 * -------|------- (+x, [1, 0])
 *        |
 *  -d -c |  +d -c
 *        |
 *
 * which maps to these indices:
 *
 * 0 | 0
 * -----
 * 1 | 1
 */
export const radialSortUnitVectors2 = (vectors) => {
	// we filter each vector into two categories based on the sign of the Y value
	// and later will sort the vectors within each category based on the X value.
	// we are storing the indices here, not the vectors themselves.
	const sidesVectors = [[], []];
	vectors.map((vec) => (vec[1] >= 0 ? 0 : 1)).forEach((s, v) => sidesVectors[s].push(v));

	// each side can be sorted by simply comparing the x value since these
	// vectors are normalized. decreasing or increasing, for +Y and -Y.
	const sorts = [
		/** @param {number} a @param {number} b */
		(a, b) => vectors[b][0] - vectors[a][0],
		/** @param {number} a @param {number} b */
		(a, b) => vectors[a][0] - vectors[b][0],
	];

	// now we can sort each side, and since the sides themselves are
	// already sorted counter-clockwise, the flattened list will be sorted.
	return sidesVectors.flatMap((indices, i) => indices.sort(sorts[i]));
};

/**
 * @description Radially sort a list of points in 3D space around a line.
 * Imagine the line as a plane's normal, project the points down into the
 * plane, normalized, and use them as input to the related method which
 * radially sorts 2D normalized vectors, using our projected plane.
 * @param {[number, number, number][]} points a list of 3D points
 * @param {[number, number, number]} vector a 3D vector describing the line's vector
 * @param {[number, number, number]} origin a point which this line passes through,
 * by default this is set to be the origin.
 * @returns {number[]} a list of indices that reference the input list.
 */
export const radialSortVectors3 = (points, vector = [1, 0, 0], origin = [0, 0, 0]) => {
	// the line's vector is the plane's normal, using the plane's normal,
	// generate three orthogonal vectors to be our basis vectors in 3D.
	const threeVectors = basisVectors3(vector);

	// order the basis vectors such that the plane's normal is the Z vector
	const basis = [threeVectors[1], threeVectors[2], threeVectors[0]];

	// project the input points down into the 3D plane.
	const projectedPoints = points.map((point) =>
		projectPointOnPlane(point, vector, origin),
	);

	// convert the projected points into vectors
	const projectedVectors = projectedPoints.map((point) => subtract(point, origin));

	// convert the 2D vectors into our new basis frame (UV space)
	const pointsUV = projectedVectors.map((vec) => [
		dot(vec, basis[0]),
		dot(vec, basis[1]),
	]);

	// normalize the 2D vectors and send them to the sorting method
	const vectorsUV = pointsUV.map(normalize2);
	return radialSortUnitVectors2(vectorsUV);
};
