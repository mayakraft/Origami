/**
 * Rabbit Ear (c) Kraft
 */
import { EPSILON } from "./constant.js";

/**
 * This entire library operates on a vector/point object type that is
 * nothing more than a Javascript array; no fancy prototype, no nothing.
 * Vectors as Javascript Objects, like { x:_ y:_ }, will not work.
 * Vector-related method naming follows a convention, if it ends with a
 * number, that relates to the dimension, (magnitude2() is for 2D vectors),
 * and if it is missing a number, it will work with any dimension,
 * (magnitude() for N-dimensional vectors).
 */

/**
 * @description many methods here are operations on two arrays where
 * the first array determines the number of loops. it's possible the
 * array sizes mismatch, in which case, fill in any empty data with 0.
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
const safeAdd = (a, b) => a + (b || 0);

/**
 * @description compute the magnitude an n-dimensional vector.
 * @param {number[]} v one vector, n-dimensions
 * @returns {number} one scalar
 */
export const magnitude = (v) => Math.sqrt(v.map((n) => n * n).reduce(safeAdd, 0));

/**
 * @description compute the magnitude a 2D vector.
 * @param {[number, number] | [number, number, number]} v one 2D vector
 * @returns {number} one scalar
 */
export const magnitude2 = (v) => Math.sqrt(v[0] * v[0] + v[1] * v[1]);

/**
 * @description compute the magnitude a 3D vector.
 * @param {[number, number, number]} v one 3D vector
 * @returns {number} one scalar
 */
export const magnitude3 = (v) => Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);

/**
 * @description compute the square-magnitude a 2D vector.
 * @param {[number, number] | [number, number, number]} v one 2D vector
 * @returns {number} one scalar
 */
export const magSquared2 = (v) => v[0] * v[0] + v[1] * v[1];

/**
 * @description compute the square-magnitude an n-dimensional vector.
 * @param {number[]} v one vector, n-dimensions
 * @returns {number} one scalar
 */
export const magSquared = (v) => v.map((n) => n * n).reduce(safeAdd, 0);

/**
 * @description normalize the input vector and return a new vector as a copy.
 * @param {number[]} v one vector, n-dimensions
 * @returns {number[]} one vector, dimension matching the input vector
 */
export const normalize = (v) => {
	const m = magnitude(v);
	return m === 0 ? v : v.map((c) => c / m);
};

/**
 * @description normalize the input vector and return a new vector as a copy.
 * @param {[number, number] | [number, number, number]} v one 2D vector
 * @returns {[number, number]} one 2D vector
 */
export const normalize2 = (v) => {
	const m = magnitude2(v);
	return m === 0 ? [v[0], v[1]] : [v[0] / m, v[1] / m];
};

/**
 * @description normalize the input vector and return a new vector as a copy.
 * @param {[number, number, number]} v one 3D vector
 * @returns {[number, number, number]} one 3D vector
 */
export const normalize3 = (v) => {
	const m = magnitude3(v);
	return m === 0 ? v : [v[0] / m, v[1] / m, v[2] / m];
};

/**
 * @description scale an input vector by one number, return a copy.
 * @param {number[]} v one vector, n-dimensions
 * @param {number} s one scalar
 * @returns {number[]} one vector
 */
export const scale = (v, s) => v.map((n) => n * s);

/**
 * @description scale an input vector by one number, return a copy.
 * @param {[number, number] | [number, number, number]} v one 2D vector
 * @param {number} s one scalar
 * @returns {[number, number]} one 2D vector
 */
export const scale2 = (v, s) => [v[0] * s, v[1] * s];

/**
 * @description scale an input vector by one number, return a copy.
 * @param {[number, number, number]} v one 3D vector
 * @param {number} s one scalar
 * @returns {[number, number, number]} one 3D vector
 */
export const scale3 = (v, s) => [v[0] * s, v[1] * s, v[2] * s];

/**
 * @description scale an input vector by one number, return a copy.
 * @param {number[]} v one vector, n-dimensions
 * @param {number[]} s one scale vector, n-dimensions
 * @returns {number[]} one vector
 */
export const scaleNonUniform = (v, s) => v.map((n, i) => n * s[i]);

/**
 * @description scale an input vector by one number, return a copy.
 * @param {[number, number] | [number, number, number]} v one 2D vector
 * @param {[number, number] | [number, number, number]} s one 2D scale vector
 * @returns {[number, number]} one 2D vector
 */
export const scaleNonUniform2 = (v, s) => [v[0] * s[0], v[1] * s[1]];

/**
 * @description scale an input vector by one number, return a copy.
 * @param {[number, number, number]} v one 3D vector
 * @param {[number, number, number]} s one 3D scale vector
 * @returns {[number, number, number]} one 3D vector
 */
export const scaleNonUniform3 = (v, s) => [v[0] * s[0], v[1] * s[1], v[2] * s[2]];

/**
 * @description add two vectors and return the sum as another vector,
 * do not modify the input vectors.
 * @param {number[]} v one vector, n-dimensions
 * @param {number[]} u one vector, n-dimensions
 * @returns {number[]} one vector, dimension matching first parameter
 */
export const add = (v, u) => v.map((n, i) => n + (u[i] || 0));

/**
 * @description add two vectors and return the sum as another vector,
 * do not modify the input vectors.
 * @param {[number, number] | [number, number, number]} v one 2D vector
 * @param {[number, number] | [number, number, number]} u one 2D vector
 * @returns {[number, number]} one 2D vector
 */
export const add2 = (v, u) => [v[0] + u[0], v[1] + u[1]];

/**
 * @description add two vectors and return the sum as another vector,
 * do not modify the input vectors.
 * @param {[number, number, number]} v one 3D vector
 * @param {[number, number, number]} u one 3D vector
 * @returns {[number, number, number]} one 3D vector
 */
export const add3 = (v, u) => [v[0] + u[0], v[1] + u[1], v[2] + u[2]];

/**
 * @description subtract the second vector from the first,
 * return the result as a copy.
 * @param {number[]} v one vector, n-dimensions
 * @param {number[]} u one vector, n-dimensions
 * @returns {number[]} one vector, dimension matching first parameter
 */
export const subtract = (v, u) => v.map((n, i) => n - (u[i] || 0));

/**
 * @description subtract the second vector from the first,
 * return the result as a copy.
 * @param {[number, number] | [number, number, number]} v one 2D vector
 * @param {[number, number] | [number, number, number]} u one 2D vector
 * @returns {[number, number]} one 2D vector
 */
export const subtract2 = (v, u) => [v[0] - u[0], v[1] - u[1]];

/**
 * @description subtract the second vector from the first,
 * return the result as a copy.
 * @param {[number, number, number]} v one 3D vector
 * @param {[number, number, number]} u one 3D vector
 * @returns {[number, number, number]} one 3D vector
 */
export const subtract3 = (v, u) => [v[0] - u[0], v[1] - u[1], v[2] - u[2]];

/**
 * @description compute the dot product of two vectors.
 * @param {number[]} v one vector, n-dimensions
 * @param {number[]} u one vector, n-dimensions
 * @returns {number} one scalar
 */
export const dot = (v, u) => v.map((_, i) => v[i] * u[i]).reduce(safeAdd, 0);

/**
 * @description compute the dot product of two 2D vectors.
 * @param {[number, number] | [number, number, number]} v one 2D vector
 * @param {[number, number] | [number, number, number]} u one 2D vector
 * @returns {number} one scalar
 */
export const dot2 = (v, u) => v[0] * u[0] + v[1] * u[1];

/**
 * @description compute the dot product of two 3D vectors.
 * @param {[number, number, number]} v one 3D vector
 * @param {[number, number, number]} u one 3D vector
 * @returns {number} one scalar
 */
export const dot3 = (v, u) => v[0] * u[0] + v[1] * u[1] + v[2] * u[2];

/**
 * @description compute the midpoint of two vectors.
 * @param {number[]} v one vector, n-dimensions
 * @param {number[]} u one vector, n-dimensions
 * @returns {number[]} one vector, dimension matching first parameter
 */
export const midpoint = (v, u) => v.map((n, i) => (n + u[i]) / 2);

/**
 * @description compute the midpoint of two 2D vectors.
 * @param {[number, number] | [number, number, number]} v one 2D vector
 * @param {[number, number] | [number, number, number]} u one 2D vector
 * @returns {[number, number]} one 2D vector
 */
export const midpoint2 = (v, u) => scale2(add2(v, u), 0.5);

/**
 * @description compute the midpoint of two 3D vectors.
 * @param {[number, number, number]} v one 3D vector
 * @param {[number, number, number]} u one 3D vector
 * @returns {[number, number, number]} one 3D vector
 */
export const midpoint3 = (v, u) => scale3(add3(v, u), 0.5);

/**
 * @description the average of any number of vectors (not numbers),
 * similar to midpoint but this can accept more than two inputs.
 * @param {...number[]} args any number of input vectors
 * @returns {number[]} one vector, dimension matching first parameter
 */
export const average = (...args) => {
	if (args.length === 0) {
		return undefined;
	}
	const dimension = args[0].length > 0 ? args[0].length : 0;
	const sum = Array(dimension).fill(0);
	Array.from(args).forEach((vec) =>
		sum.forEach((_, i) => {
			sum[i] += vec[i] || 0;
		}),
	);
	return sum.map((n) => n / args.length);
};

/**
 * @description the average of any number of 2D vectors (not numbers),
 * similar to midpoint but this can accept more than two inputs.
 * @param {...[number, number]} vectors any number of input vectors
 * @returns {[number, number]} one 2D vector
 */
export const average2 = (...vectors) => {
	if (!vectors || !vectors.length) {
		return undefined;
	}
	const sum = vectors.reduce((a, b) => add2(a, b), [0, 0]);
	return [sum[0] / vectors.length, sum[1] / vectors.length];
};

/**
 * @description the average of any number of 3D vectors (not numbers),
 * similar to midpoint but this can accept more than two inputs.
 * @param {...[number, number, number]} vectors any number of input vectors
 * @returns {[number, number, number]} one 3D vector
 */
export const average3 = (...vectors) => {
	if (!vectors || !vectors.length) {
		return undefined;
	}
	const sum = vectors.reduce((a, b) => add3(a, b), [0, 0, 0]);
	return [sum[0] / vectors.length, sum[1] / vectors.length, sum[2] / vectors.length];
};

/**
 * @description linear interpolate between two vectors
 * @param {number[]} v one vector, n-dimensions
 * @param {number[]} u one vector, n-dimensions
 * @param {number} t one scalar between 0 and 1 (not clamped)
 * @returns {number[]} one vector, dimensions matching first parameter
 */
export const lerp = (v, u, t = 0) => {
	const inv = 1.0 - t;
	return v.map((n, i) => n * inv + (u[i] || 0) * t);
};

/**
 * @description the determinant of the matrix of the 2 vectors
 * (possible bad name, 2D cross product is undefined)
 * @param {[number, number] | [number, number, number]} v one 2D vector
 * @param {[number, number] | [number, number, number]} u one 2D vector
 * @returns {number} one scalar; the determinant; the magnitude
 * of the 2D cross product vector.
 */
export const cross2 = (v, u) => v[0] * u[1] - v[1] * u[0];

/**
 * @description the 3D cross product of two 3D vectors
 * @param {[number, number, number]} v one 3D vector
 * @param {[number, number, number]} u one 3D vector
 * @returns {[number, number, number]} one 3D vector
 */
export const cross3 = (v, u) => [
	v[1] * u[2] - v[2] * u[1],
	v[2] * u[0] - v[0] * u[2],
	v[0] * u[1] - v[1] * u[0],
];

/**
 * @description compute the distance between two vectors
 * @param {number[]} v one vector, n-dimensions
 * @param {number[]} u one vector, n-dimensions
 * @returns {number} one scalar
 */
export const distance = (v, u) =>
	Math.sqrt(v.map((_, i) => (v[i] - u[i]) ** 2).reduce(safeAdd, 0));

/**
 * @description compute the distance between two 2D vectors
 * @param {[number, number] | [number, number, number]} v one 2D vector
 * @param {[number, number] | [number, number, number]} u one 2D vector
 * @returns {number} one scalar
 */
export const distance2 = (v, u) => {
	const p = v[0] - u[0];
	const q = v[1] - u[1];
	return Math.sqrt(p * p + q * q);
};

/**
 * @description compute the distance between two 3D vectors
 * @param {[number, number, number]} v one 3D vector
 * @param {[number, number, number]} u one 3D vector
 * @returns {number} one scalar
 */
export const distance3 = (v, u) => {
	const a = v[0] - u[0];
	const b = v[1] - u[1];
	const c = v[2] - u[2];
	return Math.sqrt(a * a + b * b + c * c);
};

/**
 * @description return a copy of the input vector where
 * each element's sign flipped
 * @param {number[]} v one vector, n-dimensions
 * @returns {number[]} one vector, dimensions matching input parameter
 */
export const flip = (v) => v.map((n) => -n);

/**
 * @description return a copy of the input vector where
 * each element's sign flipped
 * @param {[number, number] | [number, number, number]} v one 2D vector
 * @returns {[number, number]} one 2D vector
 */
export const flip2 = (v) => [-v[0], -v[1]];

/**
 * @description return a copy of the input vector where
 * each element's sign flipped
 * @param {[number, number, number]} v one 3D vector
 * @returns {[number, number, number]} one 3D vector
 */
export const flip3 = (v) => [-v[0], -v[1], -v[2]];

/**
 * @description return a copy of the input vector rotated
 * 90 degrees counter-clockwise
 * @param {[number, number] | [number, number, number]} v one 2D vector
 * @returns {[number, number]} one 2D vector
 */
export const rotate90 = (v) => [-v[1], v[0]];

/**
 * @description return a copy of the input vector rotated
 * 270 degrees counter-clockwise
 * @param {[number, number] | [number, number, number]} v one 2D vector
 * @returns {[number, number]} one 2D vector
 */
export const rotate270 = (v) => [v[1], -v[0]];

/**
 * @description check if a vector is degenerate, meaning its
 * magnitude is below an epsilon limit.
 * @param {number[]} v one vector, n-dimensions
 * @param {number} [epsilon=1e-6] an optional epsilon with a default value of 1e-6
 * @returns {boolean} is the magnitude of the vector smaller than the epsilon?
 */
export const degenerate = (v, epsilon = EPSILON) =>
	v.map((n) => Math.abs(n)).reduce(safeAdd, 0) < epsilon;

/**
 * @description check if two already normalized vectors are parallel
 * to each other, within an epsilon. Parallel includes the case where
 * the vectors are exactly 180 degrees flipped from one another.
 * @param {number[]} v one vector, n-dimensions
 * @param {number[]} u one vector, n-dimensions
 * @param {number} [epsilon=1e-6] an optional epsilon with a default value of 1e-6
 * @returns {boolean} are the two vectors parallel within an epsilon?
 */
export const parallelNormalized = (v, u, epsilon = EPSILON) =>
	1 - Math.abs(dot(v, u)) < epsilon;

/**
 * @description check if two vectors are parallel to each other,
 * within an epsilon. Parallel includes the case where the
 * vectors are exactly 180 degrees flipped from one another.
 * @param {number[]} v one vector, n-dimensions
 * @param {number[]} u one vector, n-dimensions
 * @param {number} [epsilon=1e-6] an optional epsilon with a default value of 1e-6
 * @returns {boolean} are the two vectors parallel within an epsilon?
 */
export const parallel = (v, u, epsilon = EPSILON) =>
	parallelNormalized(normalize(v), normalize(u), epsilon);

/**
 * @description check if two 2D vectors are parallel to each other within an epsilon
 * @param {[number, number] | [number, number, number]} v one 2D vector
 * @param {[number, number] | [number, number, number]} u one 2D vector
 * @param {number} [epsilon=1e-6] an optional epsilon with a default value of 1e-6
 * @returns {boolean} are the two vectors parallel within an epsilon?
 */
export const parallel2 = (v, u, epsilon = EPSILON) => Math.abs(cross2(v, u)) < epsilon;

/**
 * @description check if two 3D vectors are parallel to each other within an epsilon
 * @param {[number, number, number]} v one 3D vector
 * @param {[number, number, number]} u one 3D vector
 * @param {number} [epsilon=1e-6] an optional epsilon with a default value of 1e-6
 * @returns {boolean} are the two vectors parallel within an epsilon?
 */
export const parallel3 = (v, u, epsilon = EPSILON) => magnitude3(cross3(v, u)) < epsilon;

/**
 * @description Resize a vector to a particular length (duplicating it
 * in memory in the process) by either lengthening or shortening it.
 * In the case of lengthening, fill 0.
 * @param {number} dimension the desired length
 * @param {number[]} vector the vector to resize
 * @returns {number[]} a copy of the vector resized to the desired length.
 */
export const resize = (dimension, vector) =>
	vector.length === dimension
		? vector
		: Array(dimension)
				.fill(0)
				.map((z, i) => (vector[i] ? vector[i] : z));

/**
 * @description Resize a vector to 2D, filling any missing values with 0.
 * @param {number[]} vector the vector to resize
 * @returns {[number, number]} a copy of the vector in 2D.
 */
export const resize2 = (vector) => [vector[0] || 0, vector[1] || 0];

/**
 * @description Resize a vector to 3D, filling any missing values with 0.
 * @param {number[]} vector the vector to resize
 * @returns {[number, number, number]} a copy of the vector in 3D.
 */
export const resize3 = (vector) => [vector[0] || 0, vector[1] || 0, vector[2] || 0];

/**
 * @description Make the two vectors match in dimension by appending the
 * smaller vector with 0s to match the dimension of the larger vector.
 * @param {number[]} a a vector
 * @param {number[]} b a vector
 * @returns {number[][]} an array containing two vectors, a copy of
 * each of the input parameters.
 */
export const resizeUp = (a, b) =>
	[a, b].map((v) => resize(Math.max(a.length, b.length), v));

/**
 * @description Make the two vectors match in dimension by clamping the
 * larger vector to match the dimension of the smaller vector.
 * @param {number[]} a a vector
 * @param {number[]} b a vector
 * @returns {number[][]} an array containing two vectors, a copy of
 * each of the input parameters.
 */
// export const resizeDown = (a, b) => [a, b]
//   .map(v => resize(Math.min(a.length, b.length), v));

/**
 * @description Using a given 2D vector as the first basis vector for
 * two-dimensions, return two normalized basis vectors, the second
 * vector being the 90 degree rotation of the first.
 * @param {[number, number] | [number, number, number]} vector a 2D vector
 * @returns {[number, number][]} array of two 2D basis vectors
 */
export const basisVectors2 = (vector = [1, 0]) => {
	const normalized = normalize2(vector);
	return [normalized, rotate90(normalized)];
};

/**
 * @description Using a 3D vector as the first basis vector
 * find additional perpendicular vectors which, taken together,
 * span 3D space most effectively (vectors are perpendicular).
 * @param {[number, number, number]} vector a 3D vector
 * @returns {[number, number, number][]} array of three 3D basis vectors
 */
export const basisVectors3 = (vector = [1, 0, 0]) => {
	const normalized = normalize3(vector);

	// find a good candidate for a second basis vector
	/** @type {[number, number, number][]} */
	const candidates = [
		[1, 0, 0],
		[0, 1, 0],
		[0, 0, 1],
	];
	const crosses = candidates.map((v) => cross3(v, normalized));

	// before normalizing the cross products, find the result with
	// the largest magnitude, use this for the second basis vector
	const index = crosses
		.map(magnitude3)
		.map((n, i) => ({ n, i }))
		.sort((a, b) => b.n - a.n)
		.map((el) => el.i)
		.shift();

	// normalize the second basis vector
	const perpendicular = normalize3(crosses[index]);

	// the third basis vector is the cross product of the previous two
	return [normalized, perpendicular, cross3(normalized, perpendicular)];
};

/**
 * @description Given a vector (2D or 3D), using this vector as the
 * first basis vector, find additional perpendicular vectors which
 * all three span the space (2D or 3D) most effectively.
 * (the vectors are all perpendicular).
 * @param {number[]} vector a 2D or 3D vector
 * @returns {number[][]} an array of basis vectors
 */
export const basisVectors = (vector) =>
	vector.length === 2
		? basisVectors2([vector[0], vector[1]])
		: basisVectors3([vector[0], vector[1], vector[2]]);
