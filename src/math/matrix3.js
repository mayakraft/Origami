/**
 * Rabbit Ear (c) Kraft
 */
import { EPSILON } from "./constant.js";
import { normalize, resize, flip } from "./vector.js";
import { makeMatrix2Reflect } from "./matrix2.js";

/**
 * 3x4 matrix methods. the fourth column is a translation vector
 * these methods depend on arrays of 12 items, 3x3 matrices won't work.
 */

/**
 * @description the identity matrix for 3x3 matrices
 * @constant {number[]}
 * @default
 */
export const identity3x3 = Object.freeze([1, 0, 0, 0, 1, 0, 0, 0, 1]);

/**
 * @description the identity matrix for 3x4 matrices (zero translation)
 * @constant {number[]}
 * @default
 */
export const identity3x4 = Object.freeze(identity3x3.concat(0, 0, 0));

/**
 * @description test if a 3x4 matrix is the identity matrix within an epsilon
 * @param {number[]} m a 3x4 matrix
 * @returns {boolean} true if the matrix is the identity matrix
 */
export const isIdentity3x4 = (m) =>
	identity3x4.map((n, i) => Math.abs(n - m[i]) < EPSILON).reduce((a, b) => a && b, true);

/**
 * @description multiply one 3D vector by a 3x4 matrix
 * @param {number[]} m one matrix in array form
 * @param {[number, number, number]} vector in array form
 * @returns {[number, number, number]} the transformed vector
 */
export const multiplyMatrix3Vector3 = (m, vector) => [
	m[0] * vector[0] + m[3] * vector[1] + m[6] * vector[2] + m[9],
	m[1] * vector[0] + m[4] * vector[1] + m[7] * vector[2] + m[10],
	m[2] * vector[0] + m[5] * vector[1] + m[8] * vector[2] + m[11],
];

/**
 * @description multiply one 3D line by a 3x4 matrix
 * @param {number[]} m one matrix in array form
 * @param {[number, number, number]} vector the vector of the line
 * @param {[number, number, number]} origin the origin of the line
 * @returns {VecLine} the transformed line in vector-origin form
 */
export const multiplyMatrix3Line3 = (m, vector, origin) => ({
	vector: [
		m[0] * vector[0] + m[3] * vector[1] + m[6] * vector[2],
		m[1] * vector[0] + m[4] * vector[1] + m[7] * vector[2],
		m[2] * vector[0] + m[5] * vector[1] + m[8] * vector[2],
	],
	origin: [
		m[0] * origin[0] + m[3] * origin[1] + m[6] * origin[2] + m[9],
		m[1] * origin[0] + m[4] * origin[1] + m[7] * origin[2] + m[10],
		m[2] * origin[0] + m[5] * origin[1] + m[8] * origin[2] + m[11],
	],
});

/**
 * @description multiply two 3x4 matrices together
 * @param {number[]} m1 the first matrix
 * @param {number[]} m2 the second matrix
 * @returns {number[]} one matrix, the product of the two
 */
export const multiplyMatrices3 = (m1, m2) => [
	m1[0] * m2[0] + m1[3] * m2[1] + m1[6] * m2[2],
	m1[1] * m2[0] + m1[4] * m2[1] + m1[7] * m2[2],
	m1[2] * m2[0] + m1[5] * m2[1] + m1[8] * m2[2],
	m1[0] * m2[3] + m1[3] * m2[4] + m1[6] * m2[5],
	m1[1] * m2[3] + m1[4] * m2[4] + m1[7] * m2[5],
	m1[2] * m2[3] + m1[5] * m2[4] + m1[8] * m2[5],
	m1[0] * m2[6] + m1[3] * m2[7] + m1[6] * m2[8],
	m1[1] * m2[6] + m1[4] * m2[7] + m1[7] * m2[8],
	m1[2] * m2[6] + m1[5] * m2[7] + m1[8] * m2[8],
	m1[0] * m2[9] + m1[3] * m2[10] + m1[6] * m2[11] + m1[9],
	m1[1] * m2[9] + m1[4] * m2[10] + m1[7] * m2[11] + m1[10],
	m1[2] * m2[9] + m1[5] * m2[10] + m1[8] * m2[11] + m1[11],
];

/**
 * @description calculate the determinant of a 3x4 or 3x3 matrix.
 * in the case of 3x4, the translation component is ignored.
 * @param {number[]} m one matrix in array form
 * @returns {number} the determinant of the matrix
 */
export const determinant3 = (m) =>
	m[0] * m[4] * m[8] -
	m[0] * m[7] * m[5] -
	m[3] * m[1] * m[8] +
	m[3] * m[7] * m[2] +
	m[6] * m[1] * m[5] -
	m[6] * m[4] * m[2];

/**
 * @description invert a 3x4 matrix
 * @param {number[]} m one matrix in array form
 * @returns {number[]|undefined} the inverted matrix, or undefined if not possible
 */
export const invertMatrix3 = (m) => {
	const det = determinant3(m);
	if (
		Math.abs(det) < 1e-12 ||
		Number.isNaN(det) ||
		!Number.isFinite(m[9]) ||
		!Number.isFinite(m[10]) ||
		!Number.isFinite(m[11])
	) {
		return undefined;
	}
	const inv = [
		m[4] * m[8] - m[7] * m[5],
		-m[1] * m[8] + m[7] * m[2],
		m[1] * m[5] - m[4] * m[2],
		-m[3] * m[8] + m[6] * m[5],
		m[0] * m[8] - m[6] * m[2],
		-m[0] * m[5] + m[3] * m[2],
		m[3] * m[7] - m[6] * m[4],
		-m[0] * m[7] + m[6] * m[1],
		m[0] * m[4] - m[3] * m[1],
		-m[3] * m[7] * m[11] +
			m[3] * m[8] * m[10] +
			m[6] * m[4] * m[11] -
			m[6] * m[5] * m[10] -
			m[9] * m[4] * m[8] +
			m[9] * m[5] * m[7],
		m[0] * m[7] * m[11] -
			m[0] * m[8] * m[10] -
			m[6] * m[1] * m[11] +
			m[6] * m[2] * m[10] +
			m[9] * m[1] * m[8] -
			m[9] * m[2] * m[7],
		-m[0] * m[4] * m[11] +
			m[0] * m[5] * m[10] +
			m[3] * m[1] * m[11] -
			m[3] * m[2] * m[10] -
			m[9] * m[1] * m[5] +
			m[9] * m[2] * m[4],
	];
	const invDet = 1.0 / det;
	return inv.map((n) => n * invDet);
};

/**
 * @description make a 3x4 matrix representing a translation in 3D
 * @param {number} [x=0] the x component of the translation
 * @param {number} [y=0] the y component of the translation
 * @param {number} [z=0] the z component of the translation
 * @returns {number[]} one 3x4 matrix
 */
export const makeMatrix3Translate = (x = 0, y = 0, z = 0) => identity3x3.concat(x, y, z);

// i0 and i1 direct which columns and rows are filled
// sgn manages right hand rule
const singleAxisRotate = (angle, origin, i0, i1, sgn) => {
	const cos = Math.cos(angle);
	const sin = Math.sin(angle);
	const rotate = identity3x3.concat([0, 0, 0]);
	rotate[i0 * 3 + i0] = cos;
	rotate[i0 * 3 + i1] = (sgn ? +1 : -1) * sin;
	rotate[i1 * 3 + i0] = (sgn ? -1 : +1) * sin;
	rotate[i1 * 3 + i1] = cos;
	const origin3 = [0, 1, 2].map((i) => origin[i] || 0);
	const trans = identity3x3.concat(flip(origin3));
	const trans_inv = identity3x3.concat(origin3);
	return multiplyMatrices3(trans_inv, multiplyMatrices3(rotate, trans));
};

/**
 * @description make a 3x4 matrix representing a rotation in 3D around the x-axis
 * (allowing you to specify the center of rotation if needed).
 * @param {number} angle the angle of rotation in radians
 * @param {[number, number, number]} [origin=[0,0,0]] the center of rotation
 * @returns {number[]} one 3x4 matrix
 */
export const makeMatrix3RotateX = (angle, origin = [0, 0, 0]) =>
	singleAxisRotate(angle, origin, 1, 2, true);

/**
 * @description make a 3x4 matrix representing a rotation in 3D around the y-axis
 * (allowing you to specify the center of rotation if needed).
 * @param {number} angle the angle of rotation in radians
 * @param {[number, number, number]} [origin=[0,0,0]] the center of rotation
 * @returns {number[]} one 3x4 matrix
 */
export const makeMatrix3RotateY = (angle, origin = [0, 0, 0]) =>
	singleAxisRotate(angle, origin, 0, 2, false);

/**
 * @description make a 3x4 matrix representing a rotation in 3D around the z-axis
 * (allowing you to specify the center of rotation if needed).
 * @param {number} angle the angle of rotation in radians
 * @param {[number, number, number]} [origin=[0,0,0]] the center of rotation
 * @returns {number[]} one 3x4 matrix
 */
export const makeMatrix3RotateZ = (angle, origin = [0, 0, 0]) =>
	singleAxisRotate(angle, origin, 0, 1, true);

/**
 * @description make a 3x4 matrix representing a rotation in 3D
 * around a given vector and around a given center of rotation.
 * @param {number} angle the angle of rotation in radians
 * @param {[number, number, number]} [vector=[0,0,1]] the axis of rotation
 * @param {[number, number, number]} [origin=[0,0,0]] the center of rotation
 * @returns {number[]} one 3x4 matrix
 */
export const makeMatrix3Rotate = (angle, vector = [0, 0, 1], origin = [0, 0, 0]) => {
	const pos = [0, 1, 2].map((i) => origin[i] || 0);
	const [x, y, z] = resize(3, normalize(vector));
	const c = Math.cos(angle);
	const s = Math.sin(angle);
	const t = 1 - c;
	const trans = identity3x3.concat(-pos[0], -pos[1], -pos[2]);
	const trans_inv = identity3x3.concat(pos[0], pos[1], pos[2]);
	return multiplyMatrices3(
		trans_inv,
		multiplyMatrices3(
			[
				t * x * x + c,
				t * y * x + z * s,
				t * z * x - y * s,
				t * x * y - z * s,
				t * y * y + c,
				t * z * y + x * s,
				t * x * z + y * s,
				t * y * z - x * s,
				t * z * z + c,
				0,
				0,
				0,
			],
			trans,
		),
	);
};

// leave this in for legacy, testing. eventually this can be removed.
// const makeMatrix3RotateOld = (angle, vector = [0, 0, 1], origin = [0, 0, 0]) => {
// 	// normalize inputs
// 	const vec = resize(3, normalize(vector));
// 	const pos = [0, 1, 2].map(i => origin[i] || 0);
// 	const [a, b, c] = vec;
// 	const cos = Math.cos(angle);
// 	const sin = Math.sin(angle);
// 	const d = Math.sqrt((vec[1] * vec[1]) + (vec[2] * vec[2]));
// 	const b_d = Math.abs(d) < 1e-6 ? 0 : b / d;
// 	const c_d = Math.abs(d) < 1e-6 ? 1 : c / d;
// 	const t     = identity3x3.concat(-pos[0], -pos[1], -pos[2]);
// 	const t_inv = identity3x3.concat(pos[0], pos[1], pos[2]);
// 	const rx     = [1, 0, 0, 0, c_d, b_d, 0, -b_d, c_d, 0, 0, 0];
// 	const rx_inv = [1, 0, 0, 0, c_d, -b_d, 0, b_d, c_d, 0, 0, 0];
// 	const ry     = [d, 0, a, 0, 1, 0, -a, 0, d, 0, 0, 0];
// 	const ry_inv = [d, 0, -a, 0, 1, 0, a, 0, d, 0, 0, 0];
// 	const rz     = [cos, sin, 0, -sin, cos, 0, 0, 0, 1, 0, 0, 0];
// 	return multiplyMatrices3(t_inv,
// 		multiplyMatrices3(rx_inv,
// 			multiplyMatrices3(ry_inv,
// 				multiplyMatrices3(rz,
// 					multiplyMatrices3(ry,
// 						multiplyMatrices3(rx, t))))));
// };

/**
 * @description make a 3x4 matrix representing a non-uniform scale.
 * @param {[number, number, number]} [scale=[1,1,1]] non-uniform scaling vector
 * @param {[number, number, number]} [origin=[0,0,0]] the center of transformation
 * @returns {number[]} one 3x4 matrix
 */
export const makeMatrix3Scale = (scale = [1, 1, 1], origin = [0, 0, 0]) => [
	scale[0],
	0,
	0,
	0,
	scale[1],
	0,
	0,
	0,
	scale[2],
	scale[0] * -origin[0] + origin[0],
	scale[1] * -origin[1] + origin[1],
	scale[2] * -origin[2] + origin[2],
];

/**
 * @description make a 3x4 matrix representing a uniform scale.
 * @param {number} [scale=1] the uniform scale factor
 * @param {[number, number, number]} [origin=[0,0,0]] the center of transformation
 * @returns {number[]} one 3x4 matrix
 */
export const makeMatrix3UniformScale = (scale = 1, origin = [0, 0, 0]) =>
	makeMatrix3Scale([scale, scale, scale], origin);

/**
 * @description make a 3x4 representing a reflection across a line in the XY plane
 * This is a 2D operation, assumes everything is in the XY plane.
 * @param {[number, number]} vector one 2D vector specifying the reflection axis
 * @param {[number, number]} [origin=[0,0]] a 2D origin specifying a point of reflection
 * @returns {number[]} one 3x4 matrix
 */
export const makeMatrix3ReflectZ = (vector, origin = [0, 0]) => {
	const m = makeMatrix2Reflect(vector, origin);
	return [m[0], m[1], 0, m[2], m[3], 0, 0, 0, 1, m[4], m[5], 0];
};

/**
 * 2D operation, assuming everything is 0 in the z plane
 * @param line in vector-origin form
 * @returns matrix3
 */
// export const make_matrix3_reflect = (vector, origin = [0, 0, 0]) => {
//   // the line of reflection passes through origin, runs along vector
//   return [];
// };

//               __                                           _
//   _________  / /_  ______ ___  ____     ____ ___  ____ _  (_)___  _____
//  / ___/ __ \/ / / / / __ `__ \/ __ \   / __ `__ \/ __ `/ / / __ \/ ___/
// / /__/ /_/ / / /_/ / / / / / / / / /  / / / / / / /_/ / / / /_/ / /
// \___/\____/_/\__,_/_/ /_/ /_/_/ /_/  /_/ /_/ /_/\__,_/_/ /\____/_/
//                                                     /___/
