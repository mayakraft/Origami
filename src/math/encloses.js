/**
 * Rabbit Ear (c) Kraft
 */
import { EPSILON } from "./constant.js";

/**
 * @description Is a point fully contained inside of a bounding box?
 * @param {number[]} point the point
 * @param {Box} box the bounding box
 * @param {number} [epsilon=1e-6] an optional epsilon to pad the area
 * around the outer bounding box; a negative number will make
 * the boundary exclusive.
 * @returns {boolean} is the "inner" polygon completely inside the "outer"
 */
export const pointInBoundingBox = (point, box, epsilon = EPSILON) => {
	for (let d = 0; d < point.length; d += 1) {
		if (point[d] < box.min[d] - epsilon || point[d] > box.max[d] + epsilon) {
			return false;
		}
	}
	return true;
};

/**
 * @description does one bounding box (outer) completely enclose
 * another bounding box (inner)?
 * @param {Box} outer an n-dimensional bounding box
 * @param {Box} inner an n-dimensional bounding box
 * @param {number} [epsilon=1e-6] an optional epsilon to pad the area
 * around the outer bounding box; a negative number will make
 * the boundary exclusive.
 * @returns {boolean} is the "inner" polygon completely inside the "outer"
 */
export const enclosingBoundingBoxes = (outer, inner, epsilon = EPSILON) => {
	const dimensions = Math.min(outer.min.length, inner.min.length);
	for (let d = 0; d < dimensions; d += 1) {
		// if one minimum is above the other's maximum, or visa versa
		if (inner.min[d] < outer.min[d] - epsilon || inner.max[d] > outer.max[d] + epsilon) {
			return false;
		}
	}
	return true;
};
