/* Math (c) Kraft, MIT License */
import { EPSILON } from './constant.js';

/**
 * Math (c) Kraft
 */
/**
 * common functions that get reused, especially inside of map/reduce etc...
 */
/**
 * @description Are two inputs equal within an epsilon of each other?
 * @param {number} a any number input
 * @param {number} b any number input
 * @returns {boolean} true if the numbers are near each other
 * @linkcode Math ./src/general/functions.js 13
 */
const epsilonEqual = (a, b, epsilon = EPSILON) => Math.abs(a - b) < epsilon;
/**
 * @description Compare two numbers within an epsilon of each other,
 * so that "1": a < b, "-1": a > b, and "0": a ~= b (epsilon equal).
 * @param {number} a any number
 * @param {number} b any number
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {number} -1, 0, +1
 * @linkcode Math ./src/general/functions.js 23
 */
const epsilonCompare = (a, b, epsilon = EPSILON) => (
	epsilonEqual(a, b, epsilon) ? 0 : Math.sign(b - a)
);
/**
 * @description are two vectors equal to each other within an epsilon.
 * This method uses a axis-aligned bounding box to check equality
 * for speed. If the two vectors are of differing lengths, assume
 * the remaining values are zero, compare until the end of the
 * longest vector.
 * @param {number[]} a an array of numbers
 * @param {number[]} b an array of numbers
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {boolean} true if the vectors are similar within an epsilon
 * @linkcode Math ./src/general/functions.js 37
 */
const epsilonEqualVectors = (a, b, epsilon = EPSILON) => {
	for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
		if (!epsilonEqual(a[i] || 0, b[i] || 0, epsilon)) { return false; }
	}
	return true;
};
/**
 * @description the inclusive test used in intersection algorithms, returns
 * true if the number is positive, including the epsilon between -epsilon and 0.
 * @param {number} n the number to test against
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {boolean} -Infinity...{false}...-epsilon...{true}...+Infinity
 * @linkcode Math ./src/general/functions.js 49
 */
const include = (n, epsilon = EPSILON) => n > -epsilon;
/**
 * @description the exclusive test used in intersection algorithms, returns
 * true if the number is positive, excluding the epsilon between 0 and +epsilon.
 * @param {number} n the number to test against
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {boolean} -Infinity...{false}...+epsilon...{true}...+Infinity
 * @linkcode Math ./src/general/functions.js 56
 */
const exclude = (n, epsilon = EPSILON) => n > epsilon;
/**
 * @description the function parameter for an inclusive line
 * @returns {boolean} true
 * @linkcode Math ./src/general/functions.js 61
 */
const includeL = () => true;
/**
 * @description the function parameter for an exclusive line
 * @returns {boolean} true
 * @linkcode Math ./src/general/functions.js 66
 */
const excludeL = () => true;
/**
 * @description the function parameter for an inclusive ray
 * @linkcode Math ./src/general/functions.js 71
 */
const includeR = include;
/**
 * @description the function parameter for an exclusive ray
 * @linkcode Math ./src/general/functions.js 76
 */
const excludeR = exclude;
/**
 * @description the function parameter for an inclusive segment
 * @param {number} n the number to test against
 * @param {number} [e=1e-6] an optional epsilon
 * @linkcode Math ./src/general/functions.js 81
 */
const includeS = (n, e = EPSILON) => n > -e && n < 1 + e;
/**
 * @description the function parameter for an exclusive segment
 * @param {number} n the number to test against
 * @param {number} [e=1e-6] an optional epsilon
 * @linkcode Math ./src/general/functions.js 86
 */
const excludeS = (n, e = EPSILON) => n > e && n < 1 - e;
/**
 * @description These clamp functions process lines/rays/segments intersections.
 * The line method allows all values.
 * @param {number} dist the length along the vector
 * @returns {number} the clamped input value (line does not clamp)
 * @linkcode Math ./src/general/functions.js 94
 */
const clampLine = dist => dist;
/**
 * @description These clamp functions process lines/rays/segments intersections.
 * The ray method clamps values below -epsilon to be 0.
 * @param {number} dist the length along the vector
 * @returns {number} the clamped input value
 * @linkcode Math ./src/general/functions.js 102
 */
const clampRay = dist => (dist < -EPSILON ? 0 : dist);
/**
 * @description These clamp functions process lines/rays/segments intersections.
 * The segment method clamps values below -epsilon to be 0 and above 1+epsilon to 1.
 * @param {number} dist the length along the vector
 * @returns {number} the clamped input value
 * @linkcode Math ./src/general/functions.js 110
 */
const clampSegment = (dist) => {
	if (dist < -EPSILON) { return 0; }
	if (dist > 1 + EPSILON) { return 1; }
	return dist;
};

export { clampLine, clampRay, clampSegment, epsilonCompare, epsilonEqual, epsilonEqualVectors, exclude, excludeL, excludeR, excludeS, include, includeL, includeR, includeS };