/**
 * Rabbit Ear (c) Kraft
 */

/**
 * 2x3 matrix methods for two dimensional transformations.
 * the third column is a 2D translation vector
 */

/**
 * @description the identity matrix for 2x2 matrices
 * @constant {number[]}
 * @default
 */
export const identity2x2 = [1, 0, 0, 1];

/**
 * @description the identity matrix for 2x3 matrices (zero translation)
 * @constant {number[]}
 * @default
 */
export const identity2x3 = identity2x2.concat(0, 0);

/**
 * @param {[number, number]} vector, in array form
 * @param {number[]} matrix, in array form
 * @returns {[number, number]} vector, the input vector transformed by the matrix
 */
export const multiplyMatrix2Vector2 = (matrix, vector) => [
	matrix[0] * vector[0] + matrix[2] * vector[1] + matrix[4],
	matrix[1] * vector[0] + matrix[3] * vector[1] + matrix[5],
];

/**
 * @param {number[]} matrix, in array form
 * @param {VecLine2} line to be transformed
 * @returns {VecLine2} the transformed line in vector-origin form
 */
export const multiplyMatrix2Line2 = (matrix, { vector, origin }) => ({
	vector: [
		matrix[0] * vector[0] + matrix[2] * vector[1],
		matrix[1] * vector[0] + matrix[3] * vector[1],
	],
	origin: [
		matrix[0] * origin[0] + matrix[2] * origin[1] + matrix[4],
		matrix[1] * origin[0] + matrix[3] * origin[1] + matrix[5],
	],
});

/**
 * @description Multiply two matrices where the left/right order
 * matches what you would see on a page
 * @param {number[]} m1 a matrix as an array of numbers
 * @param {number[]} m2 a matrix as an array of numbers
 * @returns {number[]} matrix
 */
export const multiplyMatrices2 = (m1, m2) => [
	m1[0] * m2[0] + m1[2] * m2[1],
	m1[1] * m2[0] + m1[3] * m2[1],
	m1[0] * m2[2] + m1[2] * m2[3],
	m1[1] * m2[2] + m1[3] * m2[3],
	m1[0] * m2[4] + m1[2] * m2[5] + m1[4],
	m1[1] * m2[4] + m1[3] * m2[5] + m1[5],
];

/**
 * @description calculate the determinant of a 2x3 or 2x2 matrix.
 * in the case of 2x3, the translation component is ignored.
 * @param {number[]} m a matrix as an array of numbers
 * @returns {number} the determinant of the matrix
 */
export const determinant2 = (m) => m[0] * m[3] - m[1] * m[2];

/**
 * @description invert a 2x3 matrix
 * @param {number[]} m a matrix as an array of numbers
 * @returns {number[]|undefined} the inverted matrix, or undefined if not possible
 */
export const invertMatrix2 = (m) => {
	const det = determinant2(m);
	if (
		Math.abs(det) < 1e-12 ||
		Number.isNaN(det) ||
		!Number.isFinite(m[4]) ||
		!Number.isFinite(m[5])
	) {
		return undefined;
	}
	return [
		m[3] / det,
		-m[1] / det,
		-m[2] / det,
		m[0] / det,
		(m[2] * m[5] - m[3] * m[4]) / det,
		(m[1] * m[4] - m[0] * m[5]) / det,
	];
};

/**
 * @param {number} x
 * @param {number} y
 * @returns {number[]} matrix
 */
export const makeMatrix2Translate = (x = 0, y = 0) => identity2x2.concat(x, y);

/**
 * @param {[number, number]} scale non-uniform scaling vector for each axis
 * @param {[number, number]} origin homothetic center of the scale, default [0, 0]
 * @returns {number[]} matrix
 */
export const makeMatrix2Scale = (scale = [1, 1], origin = [0, 0]) => [
	scale[0],
	0,
	0,
	scale[1],
	scale[0] * -origin[0] + origin[0],
	scale[1] * -origin[1] + origin[1],
];

/**
 * @param {number} scale scale factor
 * @param {[number, number]} origin homothetic center of the scale, default [0, 0]
 * @returns {number[]} matrix
 */
export const makeMatrix2UniformScale = (scale = 1, origin = [0, 0]) =>
	makeMatrix2Scale([scale, scale], origin);

/**
 * @param {number} angle the angle of rotation, origin of transformation
 * @param {[number, number]} [origin=[0, 0]] optional origin of rotation
 * @returns {number[]} matrix
 */
export const makeMatrix2Rotate = (angle, origin = [0, 0]) => {
	const cos = Math.cos(angle);
	const sin = Math.sin(angle);
	return [cos, sin, -sin, cos, origin[0], origin[1]];
};

/**
 * remember vector comes before origin. origin comes last, so that it's easy
 * to leave it empty and make a reflection through the origin.
 * @param {[number, number]} vector one 2D vector specifying the reflection axis
 * @param {[number, number]} [origin=[0,0]] a 2D origin specifying a point of reflection
 * @returns {number[]} matrix
 */
export const makeMatrix2Reflect = (vector, origin = [0, 0]) => {
	// the line of reflection passes through origin, runs along vector
	const angle = Math.atan2(vector[1], vector[0]);
	const cosAngle = Math.cos(angle);
	const sinAngle = Math.sin(angle);
	const cos_Angle = Math.cos(-angle);
	const sin_Angle = Math.sin(-angle);
	const a = cosAngle * cos_Angle + sinAngle * sin_Angle;
	const b = cosAngle * -sin_Angle + sinAngle * cos_Angle;
	const c = sinAngle * cos_Angle + -cosAngle * sin_Angle;
	const d = sinAngle * -sin_Angle + -cosAngle * cos_Angle;
	const tx = origin[0] + a * -origin[0] + -origin[1] * c;
	const ty = origin[1] + b * -origin[0] + -origin[1] * d;
	return [a, b, c, d, tx, ty];
};

//               __                                           _
//   _________  / /_  ______ ___  ____     ____ ___  ____ _  (_)___  _____
//  / ___/ __ \/ / / / / __ `__ \/ __ \   / __ `__ \/ __ `/ / / __ \/ ___/
// / /__/ /_/ / / /_/ / / / / / / / / /  / / / / / / /_/ / / / /_/ / /
// \___/\____/_/\__,_/_/ /_/ /_/_/ /_/  /_/ /_/ /_/\__,_/_/ /\____/_/
//                                                     /___/
