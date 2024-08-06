/**
 * Rabbit Ear (c) Kraft
 */
import { EPSILON } from "./constant.js";
import { epsilonEqual, epsilonEqualVectors } from "./compare.js";
import {
	dot,
	cross2,
	normalize,
	normalize2,
	add2,
	subtract,
	subtract2,
	subtract3,
	scale2,
	lerp,
	flip,
	flip2,
	parallel2,
	parallel3,
} from "./vector.js";
import { counterClockwiseSubsect2 } from "./radial.js";

/**
 * @description These clamp functions process lines/rays/segments intersections.
 * The line method allows all values.
 * @param {number} dist the length along the vector
 * @returns {number} the clamped input value (line does not clamp)
 */
export const clampLine = (dist) => dist;

/**
 * @description These clamp functions process lines/rays/segments intersections.
 * The ray method clamps values below -epsilon to be 0.
 * @param {number} dist the length along the vector
 * @returns {number} the clamped input value
 */
export const clampRay = (dist) => (dist < -EPSILON ? 0 : dist);

/**
 * @description These clamp functions process lines/rays/segments intersections.
 * The segment method clamps values below -epsilon to be 0 and above 1+epsilon to 1.
 * @param {number} dist the length along the vector
 * @returns {number} the clamped input value
 */
export const clampSegment = (dist) => {
	if (dist < -EPSILON) {
		return 0;
	}
	if (dist > 1 + EPSILON) {
		return 1;
	}
	return dist;
};

// /**
//  * @description Resize an n-dimensional line into 2D.
//  * @param {VecLine} line
//  * @returns {VecLine2} a 2D line
//  */
// export const resizeLine2 = ({ vector, origin }) => ({
// 	vector: resize2(vector),
// 	origin: resize2(origin),
// });

// /**
//  * @description Resize an n-dimensional line into 3D, filling 0 if
//  * any fields were previously empty.
//  * @param {VecLine} line
//  * @returns {VecLine3} a 3D line
//  */
// export const resizeLine3 = ({ vector, origin }) => ({
// 	vector: resize3(vector),
// 	origin: resize3(origin),
// });

/**
 * @description Do three points lie collinear to each other?
 * @param {number[]} p0 a point
 * @param {number[]} p1 a point
 * @param {number[]} p2 a point
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {boolean} true if the points lies collinear.
 */
export const collinearPoints = (p0, p1, p2, epsilon = EPSILON) => {
	const vectors = [
		[p0, p1],
		[p1, p2],
	]
		.map((pts) => subtract(pts[1], pts[0]))
		.map((vector) => normalize(vector));
	return epsilonEqual(1.0, Math.abs(dot(vectors[0], vectors[1])), epsilon);
};

/**
 * @description Check if a point is collinear and between two other points.
 * @param {number[]} p0 a point
 * @param {number[]} p1 the point to test collinearity and between-ness
 * @param {number[]} p2 a point
 * @param {boolean} [inclusive=false] if the point is the same as the endpoints
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {boolean} true if the point lies collinear and between the other two points.
 */
export const collinearBetween = (p0, p1, p2, inclusive = false, epsilon = EPSILON) => {
	const similar = [p0, p2]
		.map((p) => epsilonEqualVectors(p1, p, epsilon))
		.reduce((a, b) => a || b, false);
	if (similar) {
		return inclusive;
	}
	const vectors = [
		[p0, p1],
		[p1, p2],
	]
		.map((segment) => subtract(segment[1], segment[0]))
		.map((vector) => normalize(vector));
	return epsilonEqual(1.0, dot(vectors[0], vectors[1]), EPSILON);
};

/**
 * @description Test if two lines are parallel and collinear in 2D
 * @param {VecLine2} a a line in 2D
 * @param {VecLine2} b a line in 2D
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {boolean} true if the two lines are parallel and collinear
 */
export const collinearLines2 = (a, b, epsilon = EPSILON) =>
	parallel2(a.vector, b.vector, epsilon) &&
	parallel2(a.vector, subtract2(b.origin, a.origin), epsilon);

/**
 * @description Test if two lines are parallel and collinear in 3D
 * @param {VecLine3} a a line in 3D
 * @param {VecLine3} b a line in 3D
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {boolean} true if the two lines are parallel and collinear
 */
export const collinearLines3 = (a, b, epsilon = EPSILON) =>
	parallel3(a.vector, b.vector, epsilon) &&
	parallel3(a.vector, subtract3(b.origin, a.origin), epsilon);

/**
 * @description linear interpolate between two lines
 * @param {VecLine} a a line with a "vector" and "origin" component
 * @param {VecLine} b a line with a "vector" and "origin" component
 * @param {number} t one scalar between 0 and 1 (not clamped)
 * @returns {VecLine} one line
 */
// export const lerpLines = (a, b, t) => {
// 	const vector = lerp(a.vector, b.vector, t);
// 	const origin = lerp(a.origin, b.origin, t);
// 	return { vector, origin };
// };

/**
 * @description a subroutine of pleat(). If we know that the two lines are
 * parallel, this will pleat between the two parallel lines, additionally,
 * it will handle the case where two lines are parallel, but their vectors
 * are 180 flipped from each other, ensuring the pleat lines do not lerp
 * between two 180-degree flipped states.
 * @param {VecLine2} a
 * @param {VecLine2} b
 * @param {number} count
 * @returns {[VecLine2[], VecLine2[]]} an array of lines
 */
const parallelPleat = (a, b, count) => {
	const isOpposite = dot(a.vector, b.vector) < 0;
	// if the vectors are parallel but opposite, we need to
	// orient the vectors in the same direction.
	const aVector = a.vector; // isParallel && dotProd < 0 ? a.vector : a.vector;
	const bVector = isOpposite ? flip(b.vector) : b.vector;
	const origins = Array.from(Array(count - 1)).map((_, i) =>
		lerp(a.origin, b.origin, (i + 1) / count),
	);
	const vectors = Array.from(Array(count - 1)).map((_, i) =>
		lerp(aVector, bVector, (i + 1) / count),
	);
	/** @type {VecLine2[]} */
	const lines = vectors.map((vector, i) => ({
		vector: [vector[0], vector[1]],
		origin: [origins[i][0], origins[i][1]],
	}));
	/** @type {[VecLine2[], VecLine2[]]} */
	const solution = [lines, lines];
	solution[isOpposite ? 0 : 1] = [];
	return solution;
};

/**
 * @description Between two lines, make a repeating sequence of
 * evenly-spaced lines to simulate a series of pleats.
 * @param {VecLine2} a a line with a "vector" and "origin" component
 * @param {VecLine2} b a line with a "vector" and "origin" component
 * @param {number} count the number of faces, the number of lines will be n-1.
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {[VecLine2[], VecLine2[]]} an array of lines, objects with "vector" and "origin"
 */
export const pleat = (a, b, count, epsilon = EPSILON) => {
	const determinant = cross2(a.vector, b.vector);
	const numerator = cross2(subtract2(b.origin, a.origin), b.vector);
	const t = numerator / determinant;
	const [aNormalized, bNormalized] = [a.vector, b.vector].map(normalize2);
	const isParallel = Math.abs(cross2(aNormalized, bNormalized)) < epsilon;
	if (isParallel) {
		return parallelPleat(a, b, count);
	}
	// two sets of pleats will be generated, between either pairs
	// of interior angles, unless the lines are parallel.
	/** @type {[[[number, number], [number, number]], [[number, number], [number, number]]]} */
	const sides =
		determinant > -epsilon
			? [
					[a.vector, b.vector],
					[flip2(b.vector), a.vector],
				]
			: [
					[b.vector, a.vector],
					[flip2(a.vector), b.vector],
				];
	/** @type {[[number, number][], [number, number][]]} */
	// const pleatVectors = sides
	// 	.map(pair => counterClockwiseSubsect2(pair[0], pair[1], count));
	const pleatVectors = [
		counterClockwiseSubsect2(sides[0][0], sides[0][1], count),
		counterClockwiseSubsect2(sides[1][0], sides[1][1], count),
	];
	// there is an intersection as long as the lines are not parallel
	const intersection = add2(a.origin, scale2(a.vector, t));
	// the origin of the lines will be either the intersection,
	// or in the case of parallel, a lerp between the two line origins.
	const origins = Array.from(Array(count - 1)).map(() => intersection);

	const [sideA, sideB] = pleatVectors.map((side) =>
		side.map((vector, i) => ({ vector, origin: origins[i] })),
	);
	return [sideA, sideB];
};

/**
 * @description given two lines, find two lines which bisect the given lines,
 * if the given lines have an intersection, or return one
 * line if they are parallel.
 * @param {VecLine2} a a line with a "vector" and "origin" component
 * @param {VecLine2} b a line with a "vector" and "origin" component
 * @param {number} [epsilon=1e-6] an optional epsilon for testing parallel-ness.
 * @returns {[VecLine2?, VecLine2?]} an array of lines, objects with "vector" and "origin"
 */
export const bisectLines2 = (a, b, epsilon = EPSILON) => {
	const [biA, biB] = pleat(a, b, 2, epsilon).map((arr) => arr[0]);
	/** @type {[VecLine2, VecLine2]} */
	const solution = [biA, biB];
	solution.forEach((val, i) => {
		if (val === undefined) {
			delete solution[i];
		}
	});
	return solution;
};
