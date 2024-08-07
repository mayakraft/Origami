/**
 * Rabbit Ear (c) Kraft
 */
import { EPSILON } from "./constant.js";

/**
 * @description Are two inputs equal within an epsilon of each other?
 * @param {number} a any number input
 * @param {number} b any number input
 * @returns {boolean} true if the numbers are near each other
 */
export const epsilonEqual = (a, b, epsilon = EPSILON) => Math.abs(a - b) < epsilon;

/**
 * @description Compare two numbers within an epsilon of each other,
 * so that "-1": a < b, "+1": a > b, and "0": a ~= b (epsilon equal).
 * This can be used inside Javascript's Array.sort() to sort increasing.
 * @param {number} a any number
 * @param {number} b any number
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {number} -1, 0, +1
 */
export const epsilonCompare = (a, b, epsilon = EPSILON) =>
	epsilonEqual(a, b, epsilon) ? 0 : Math.sign(a - b);

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
 */
export const epsilonEqualVectors = (a, b, epsilon = EPSILON) => {
	for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
		if (!epsilonEqual(a[i] || 0, b[i] || 0, epsilon)) {
			return false;
		}
	}
	return true;
};

/**
 * @description the inclusive test used in intersection algorithms, returns
 * true if the number is positive, including the epsilon between -epsilon and 0.
 * @param {number} n the number to test against
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {boolean} -Infinity...{false}...-epsilon...{true}...+Infinity
 */
export const include = (n, epsilon = EPSILON) => n > -epsilon;

/**
 * @description the exclusive test used in intersection algorithms, returns
 * true if the number is positive, excluding the epsilon between 0 and +epsilon.
 * @param {number} n the number to test against
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {boolean} -Infinity...{false}...+epsilon...{true}...+Infinity
 */
export const exclude = (n, epsilon = EPSILON) => n > epsilon;

/**
 * @description the domain function for an inclusive line
 * @param {number} _ the number to test against
 * @param {number} [__] an optional epsilon
 * @returns {boolean} true
 */
// eslint-disable-next-line no-unused-vars
export const includeL = (_, __) => true;

/**
 * @description the domain function for an exclusive line
 * @param {number} _ the number to test against
 * @param {number} [__=1e-6] an optional epsilon
 * @returns {boolean} true
 */
// eslint-disable-next-line no-unused-vars
export const excludeL = (_, __) => true;

/**
 * @description the domain function for an inclusive ray
 */
export const includeR = include;

/**
 * @description the domain function for an exclusive ray
 */
export const excludeR = exclude;

/**
 * @description the domain function for an inclusive segment
 * @param {number} n the number to test against
 * @param {number} [e=1e-6] an optional epsilon
 */
export const includeS = (n, e = EPSILON) => n > -e && n < 1 + e;

/**
 * @description the domain function for an exclusive segment
 * @param {number} n the number to test against
 * @param {number} [e=1e-6] an optional epsilon
 */
export const excludeS = (n, e = EPSILON) => n > e && n < 1 - e;
