/**
 * Rabbit Ear (c) Kraft
 */
import { dot, cross3, magnitude, normalize } from "./vector.js";
import { multiplyMatrices4 } from "./matrix4.js";

/**
 * Quaternions encoded as an array of numbers
 * with indices 0-3 as x, y, z, w in that order.
 */

/**
 * @description Create a quaternion which represents a rotation from
 * one 3D vector to another. Quaternion encoded as 0:x, 1:y, 2:z, 3:w.
 * @param {[number, number, number]} u a 3D vector
 * @param {[number, number, number]} v a 3D vector
 * @returns {[number, number, number, number]} a quaternion representing a rotation
 */
export const quaternionFromTwoVectors = (u, v) => {
	const w = cross3(u, v);
	const q = [w[0], w[1], w[2], dot(u, v)];
	q[3] += magnitude(q);
	const [a, b, c, d] = normalize(q);
	return [a, b, c, d];
};

/**
 * @description Create a 4x4 matrix from a quaternion,
 * the quaternion encoded as 0:x, 1:y, 2:z, 3:w.
 * @param {[number, number, number, number]} q a quaternion
 * @returns {number[]} a 4x4 matrix (array of 16 numbers)
 */
export const matrix4FromQuaternion = (q) =>
	multiplyMatrices4(
		[
			+q[3],
			+q[2],
			-q[1],
			+q[0],
			-q[2],
			+q[3],
			+q[0],
			+q[1],
			+q[1],
			-q[0],
			+q[3],
			+q[2],
			-q[0],
			-q[1],
			-q[2],
			+q[3],
		],
		[
			+q[3],
			+q[2],
			-q[1],
			-q[0],
			-q[2],
			+q[3],
			+q[0],
			-q[1],
			+q[1],
			-q[0],
			+q[3],
			-q[2],
			+q[0],
			+q[1],
			+q[2],
			+q[3],
		],
	);
