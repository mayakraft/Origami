/**
 * Rabbit Ear (c) Kraft
 */
import { EPSILON, TWO_PI } from "./constant.js";
import { vectorToAngle, angleToVector } from "./convert.js";
import { epsilonEqual } from "./compare.js";
import { cross2, normalize2, subtract2, distance2 } from "./vector.js";

/**
 * measurements involving vectors and radians
 */

/**
 * @description check if the first parameter is counter-clockwise between A and B.
 * floor and ceiling can be unbounded, this method takes care of 0-2pi wrap around.
 * @param {number} angle angle in radians
 * @param {number} floor angle in radians, lower bound
 * @param {number} ceiling angle in radians, upper bound
 * @returns {boolean} is the angle between floor and ceiling
 */
export const isCounterClockwiseBetween = (angle, floor, ceiling) => {
	// eslint-disable-next-line no-param-reassign
	while (ceiling < floor) {
		ceiling += TWO_PI;
	}
	// eslint-disable-next-line no-param-reassign
	while (angle > floor) {
		angle -= TWO_PI;
	}
	// eslint-disable-next-line no-param-reassign
	while (angle < floor) {
		angle += TWO_PI;
	}
	return angle < ceiling;
};

/**
 * @description There are 2 interior angles between 2 vectors (as an angle in radians),
 * A-to-B clockwise, and A-to-B counter-clockwise. Get the clockwise one from A to B.
 * @param {number} a vector as an angle in radians
 * @param {number} b vector as an angle in radians
 * @returns {number} interior angle in radians
 */
export const clockwiseAngleRadians = (a, b) => {
	// this is on average 50 to 100 times faster than clockwiseAngle2
	// eslint-disable-next-line no-param-reassign
	while (a < 0) {
		a += TWO_PI;
	}
	// eslint-disable-next-line no-param-reassign
	while (b < 0) {
		b += TWO_PI;
	}
	// eslint-disable-next-line no-param-reassign
	while (a > TWO_PI) {
		a -= TWO_PI;
	}
	// eslint-disable-next-line no-param-reassign
	while (b > TWO_PI) {
		b -= TWO_PI;
	}
	const a_b = a - b;
	return a_b >= 0 ? a_b : TWO_PI - (b - a);
};

/**
 * @description There are 2 interior angles between 2 vectors (as an angle in radians),
 * A-to-B clockwise, and A-to-B counter-clockwise. Get the counter-clockwise one from A to B.
 * @param {number} a vector as an angle in radians
 * @param {number} b vector as an angle in radians
 * @returns {number} interior angle in radians, counter-clockwise from a to b
 */
export const counterClockwiseAngleRadians = (a, b) => {
	// this is on average 50 to 100 times faster than counterClockwiseAngle2
	// eslint-disable-next-line no-param-reassign
	while (a < 0) {
		a += TWO_PI;
	}
	// eslint-disable-next-line no-param-reassign
	while (b < 0) {
		b += TWO_PI;
	}
	// eslint-disable-next-line no-param-reassign
	while (a > TWO_PI) {
		a -= TWO_PI;
	}
	// eslint-disable-next-line no-param-reassign
	while (b > TWO_PI) {
		b -= TWO_PI;
	}
	const b_a = b - a;
	return b_a >= 0 ? b_a : TWO_PI - (a - b);
};

/**
 * @description There are 2 interior angles between 2 vectors, A-to-B clockwise,
 * and A-to-B counter-clockwise. Get the clockwise one from A to B.
 * @param {[number, number]} a 2D vector as an array of two numbers
 * @param {[number, number]} b 2D vector as an array of two numbers
 * @returns {number} interior angle in radians, clockwise from a to b
 */
export const clockwiseAngle2 = (a, b) => {
	const dotProduct = b[0] * a[0] + b[1] * a[1];
	const determinant = b[0] * a[1] - b[1] * a[0];
	let angle = Math.atan2(determinant, dotProduct);
	if (angle < 0) {
		angle += TWO_PI;
	}
	return angle;
};

/**
 * @description There are 2 interior angles between 2 vectors, A-to-B clockwise,
 * and A-to-B counter-clockwise. Get the counter-clockwise one from A to B.
 * @param {[number, number]} a 2D vector as an array of two numbers
 * @param {[number, number]} b 2D vector as an array of two numbers
 * @returns {number} interior angle in radians, counter-clockwise from a to b
 */
export const counterClockwiseAngle2 = (a, b) => {
	const dotProduct = a[0] * b[0] + a[1] * b[1];
	const determinant = a[0] * b[1] - a[1] * b[0];
	let angle = Math.atan2(determinant, dotProduct);
	if (angle < 0) {
		angle += TWO_PI;
	}
	return angle;
};

/**
 * this calculates an angle bisection between the pair of vectors
 * clockwise from the first vector to the second
 *
 *     a  x
 *       /     . bisection
 *      /   .
 *     / .
 *     --------x  b
 */

/**
 * @description calculate the angle bisection clockwise from the first vector to the second.
 * @param {[number, number]} a one 2D vector
 * @param {[number, number]} b one 2D vector
 * @returns {[number, number]} one 2D vector
 */
export const clockwiseBisect2 = (a, b) =>
	angleToVector(vectorToAngle(a) - clockwiseAngle2(a, b) / 2);

/**
 * @description calculate the angle bisection counter-clockwise from the first vector to the second.
 * @param {[number, number]} a one 2D vector
 * @param {[number, number]} b one 2D vector
 * @returns {[number, number]} one 2D vector
 */
export const counterClockwiseBisect2 = (a, b) =>
	angleToVector(vectorToAngle(a) + counterClockwiseAngle2(a, b) / 2);

/**
 * @description subsect into n-divisions the angle clockwise from one angle to the next
 * @param {number} divisions number of angles minus 1
 * @param {number} angleA one angle in radians
 * @param {number} angleB one angle in radians
 * @returns {number[]} array of angles in radians
 */
export const clockwiseSubsectRadians = (angleA, angleB, divisions) => {
	const angle = clockwiseAngleRadians(angleA, angleB) / divisions;
	return Array.from(Array(divisions - 1)).map((_, i) => angleA + angle * (i + 1));
};

/**
 * @description subsect into n-divisions the angle counter-clockwise from one angle to the next
 * @param {number} divisions number of angles minus 1
 * @param {number} angleA one angle in radians
 * @param {number} angleB one angle in radians
 * @returns {number[]} array of angles in radians
 */
export const counterClockwiseSubsectRadians = (angleA, angleB, divisions) => {
	const angle = counterClockwiseAngleRadians(angleA, angleB) / divisions;
	return Array.from(Array(divisions - 1)).map((_, i) => angleA + angle * (i + 1));
};

/**
 * @description subsect into n-divisions the angle clockwise from one vector to the next
 * @param {number} divisions number of angles minus 1
 * @param {[number, number]} vectorA one vector in array form
 * @param {[number, number]} vectorB one vector in array form
 * @returns {[number, number][]} array of vectors (which are arrays of numbers)
 */
export const clockwiseSubsect2 = (vectorA, vectorB, divisions) => {
	const angleA = Math.atan2(vectorA[1], vectorA[0]);
	const angleB = Math.atan2(vectorB[1], vectorB[0]);
	return clockwiseSubsectRadians(angleA, angleB, divisions).map(angleToVector);
};

/**
 * @description subsect into n-divisions the angle counter-clockwise from one vector to the next
 * @param {number} divisions number of angles minus 1
 * @param {[number, number]} vectorA one 2D vector in array form
 * @param {[number, number]} vectorB one 2D vector in array form
 * @returns {[number, number][]} array of vectors (which are arrays of numbers)
 */
export const counterClockwiseSubsect2 = (vectorA, vectorB, divisions) => {
	const angleA = Math.atan2(vectorA[1], vectorA[0]);
	const angleB = Math.atan2(vectorB[1], vectorB[0]);
	return counterClockwiseSubsectRadians(angleA, angleB, divisions).map(angleToVector);
};

/**
 * @description sort an array of angles in radians by getting an array of
 * reference indices to the input array, instead of an array of angles.
 * @todo maybe there is such thing as an absolute radial origin (x axis?)
 * but this chooses the first element as the first element
 * and sort everything else counter-clockwise around it.
 * @param {number[]} radians array of angles in radians
 * @returns {number[]} array of indices of the input array, indicating
 * the counter-clockwise sorted arrangement.
 */
export const counterClockwiseOrderRadians = (radians) => {
	const counter_clockwise = radians
		.map((_, i) => i)
		.sort((a, b) => radians[a] - radians[b]);
	return counter_clockwise
		.slice(counter_clockwise.indexOf(0), counter_clockwise.length)
		.concat(counter_clockwise.slice(0, counter_clockwise.indexOf(0)));
};

/**
 * @description sort an array of vectors by getting an array of
 * reference indices to the input array, instead of a sorted array of vectors.
 * @param {[number, number][]} vectors array of vectors (which are arrays of numbers)
 * @returns {number[]} array of indices of the input array, indicating
 * the counter-clockwise sorted arrangement.
 */
export const counterClockwiseOrder2 = (vectors) =>
	counterClockwiseOrderRadians(vectors.map(vectorToAngle));

/**
 * @description given an array of angles, return the sector angles between
 * consecutive parameters. if radially unsorted, this will sort them.
 * @param {number[]} radians array of angles in radians
 * @returns {number[]} array of sector angles in radians
 */
export const counterClockwiseSectorsRadians = (radians) =>
	counterClockwiseOrderRadians(radians)
		.map((i) => radians[i])
		.map((rad, i, arr) => [rad, arr[(i + 1) % arr.length]])
		.map((pair) => counterClockwiseAngleRadians(pair[0], pair[1]));

/**
 * @description given an array of vectors, return the sector angles between
 * consecutive parameters. if radially unsorted, this will sort them.
 * @param {[number, number][]} vectors array of 2D vectors (higher dimensions will be ignored)
 * @returns {number[]} array of sector angles in radians
 */
export const counterClockwiseSectors2 = (vectors) =>
	counterClockwiseSectorsRadians(vectors.map(vectorToAngle));

/**
 * subsect the angle between two lines, can handle parallel lines
 */
// export const subsect = function (divisions, pointA, vectorA, pointB, vectorB) {
//   const denominator = vectorA[0] * vectorB[1] - vectorB[0] * vectorA[1];
//   if (Math.abs(denominator) < EPSILON) { /* parallel */
//     const solution = [midpoint(pointA, pointB), [vectorA[0], vectorA[1]]];
//     const array = [solution, solution];
//     const dot = vectorA[0] * vectorB[0] + vectorA[1] * vectorB[1];
//     delete array[(dot > 0 ? 1 : 0)];
//     return array;
//   }
//   const numerator = (pointB[0] - pointA[0]) * vectorB[1] - vectorB[0] * (pointB[1] - pointA[1]);
//   const t = numerator / denominator;
//   const x = pointA[0] + vectorA[0] * t;
//   const y = pointA[1] + vectorA[1] * t;
//   const bisects = bisect_vectors(vectorA, vectorB);
//   bisects[1] = [-bisects[0][1], bisects[0][0]];
//   return bisects.map(el => [[x, y], el]);
// };

/**
 * @description which turn direction do 3 points make?
 * clockwise or counter-clockwise?
 * @param {[number, number]} p0 the start point
 * @param {[number, number]} p1 the middle point
 * @param {[number, number]} p2 the end point
 * @param {number} [epsilon=1e-6] optional epsilon
 * @returns {number|undefined} with 4 possible results:
 * - "0": collinear, no turn, forward
 * - "1": counter-clockwise turn, 0+epsilon < x < 180-epsilon
 * - "-1": clockwise turn, 0-epsilon > x > -180+epsilon
 * - "undefined": collinear but with a 180 degree turn.
 */
export const threePointTurnDirection = (p0, p1, p2, epsilon = EPSILON) => {
	const v = normalize2(subtract2(p1, p0));
	const u = normalize2(subtract2(p2, p0));
	// not collinear
	const cross = cross2(v, u);
	if (!epsilonEqual(cross, 0, epsilon)) {
		return Math.sign(cross);
	}
	// collinear. now we have to ensure the order is 0, 1, 2, and point
	// 1 lies between 0 and 2. otherwise we made a 180 degree turn (return undefined)
	return epsilonEqual(distance2(p0, p1) + distance2(p1, p2), distance2(p0, p2))
		? 0
		: undefined;
};
