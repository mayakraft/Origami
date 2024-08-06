/**
 * Rabbit Ear (c) Kraft
 */
import { EPSILON } from "./constant.js";

/**
 * @description Get a new range that fully encloses two ranges.
 * Note that if the two ranges are separated and do not overlap,
 * this "union" will include the area between them.
 * @param {number[]} a a range
 * @param {number[]} b another range
 * @returns a range that is built from the minimum and maximum-most value
 * from both ranges.
 */
export const rangeUnion = (a, b) => {
	const bSorted = b[0] <= b[1];
	return a[0] <= a[1]
		? [Math.min(a[0], bSorted ? b[0] : b[1]), Math.max(a[1], bSorted ? b[1] : b[0])]
		: [Math.min(a[1], bSorted ? b[0] : b[1]), Math.max(a[0], bSorted ? b[1] : b[0])];
};

/**
 * @description a range is an array of two numbers [start, end]
 * not necessarily in sorted order.
 * Do the two spans overlap on the numberline?
 * @param {number[]} a range with two numbers
 * @param {number[]} b range with two numbers
 * @param {number} [epsilon=1e-6] a positive value makes the range
 * endpoints exclusive, a negative value makes range endpoints inclusive.
 */
export const doRangesOverlap = (a, b, epsilon = EPSILON) => {
	// make sure ranges are well formed (sorted low to high)
	const r1 = a[0] < a[1] ? a : [a[1], a[0]];
	const r2 = b[0] < b[1] ? b : [b[1], b[0]];
	const overlap = Math.min(r1[1], r2[1]) - Math.max(r1[0], r2[0]);
	return overlap > epsilon;
};
