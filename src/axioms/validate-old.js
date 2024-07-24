/**
 * Rabbit Ear (c) Kraft
 */
import {
	include,
	includeL,
	includeS,
} from "../math/compare.js";
import {
	subtract2,
	rotate90,
} from "../math/vector.js";
import {
	makeMatrix2Reflect,
	multiplyMatrix2Vector2,
} from "../math/matrix2.js";
import {
	overlapLinePoint,
	overlapConvexPolygonPoint,
} from "../math/overlap.js";
import {
	intersectLineLine,
	intersectPolygonLine,
} from "../math/intersect.js";
import {
	clipLineConvexPolygon,
} from "../math/clip.js";

/**
 * @param {VecLine2} foldLine
 * @param {[number, number]} point
 * @returns {[number, number]}
 */
const reflectPoint = (foldLine, point) => {
	const matrix = makeMatrix2Reflect(foldLine.vector, foldLine.origin);
	return multiplyMatrix2Vector2(matrix, point);
};

/**
 * @description Validate the input parameters to origami axiom 1 with
 * respect to a boundary polygon that represents the folding surface.
 * To validate axiom 1 check if the input points are inside the
 * boundary polygon, and if there is an uninterrupted straight line
 * connecting the two points (without leaving the material).
 * @param {[number, number][]} boundary an array of 2D points,
 * each point is an array of numbers
 * @param {[number, number]} point1 the point parameter for axiom 1 or 2
 * @param {[number, number]} point2 the point parameter for axiom 1 or 2
 * @returns {boolean[]} true if the parameters/solutions are valid
 */
export const validateAxiom1 = (boundary, point1, point2) => [
	[point1, point2]
		.map(p => overlapConvexPolygonPoint(boundary, p, include).overlap)
		.reduce((a, b) => a && b, true),
];

/**
 * @description Validate the input parameters to origami axiom 2 with
 * respect to a boundary polygon that represents the folding surface.
 * To validate axiom 2 check if the input points are inside the
 * boundary polygon, if so, the solution is valid.
 * @param {[number, number][]} boundary an array of 2D points,
 * each point is an array of numbers
 * @param {[number, number]} point1 the point parameter for axiom 1 or 2
 * @param {[number, number]} point2 the point parameter for axiom 1 or 2
 * @returns {boolean[]} true if the parameters/solutions are valid
 */
export const validateAxiom2 = (boundary, point1, point2) => [
	[point1, point2]
		.map(p => overlapConvexPolygonPoint(boundary, p, include).overlap)
		.reduce((a, b) => a && b, true),
];

/**
 * @description Validate the input parameters to origami axiom 3 with
 * respect to a boundary polygon that represents the folding surface.
 * @param {[number, number][]} boundary an array of 2D points,
 * each point is an array of numbers
 * @param {VecLine2[]} solutions an array of solutions in vector-origin form
 * @param {VecLine2} line1 the line parameter for axiom 3
 * @param {VecLine2} line2 the line parameter for axiom 3
 * @returns {boolean[]} array of booleans (true if valid) matching the solutions array
 */
export const validateAxiom3 = (boundary, solutions, line1, line2) => {
	const segments = [line1, line2]
		.map(line => clipLineConvexPolygon(
			boundary,
			line,
			include,
			includeL,
		));

	// if line parameters lie outside polygon, no solution possible
	if (segments[0] === undefined || segments[1] === undefined) {
		return [false, false];
	}

	// test A:
	// make sure the results themselves lie in the polygon
	// exclusive! an exterior line collinear to polygon's point is excluded
	// const results_clip = results
	//   .map(line => line === undefined ? undefined : math
	//     .intersectConvexPolygonLine(
	//       boundary,
	//       line,
	//       includeS,
	//       excludeL));
	const results_clip = solutions.map(line => (line === undefined
		? undefined
		: clipLineConvexPolygon(
			boundary,
			line,
			include,
			includeL,
		)));
	const results_inside = [0, 1].map((i) => results_clip[i] !== undefined);
	// test B:
	// make sure that for each of the results, the result lies between two
	// of the parameters, in other words, reflect the segment 0 both ways
	// (both fold solutions) and make sure there is overlap with segment 1
	const seg0Reflect = solutions.map(foldLine => (foldLine === undefined
		? undefined
		: [
			reflectPoint(foldLine, segments[0][0]),
			reflectPoint(foldLine, segments[0][1]),
		]));
	const reflectMatch = seg0Reflect.map(seg => (seg === undefined
		? false
		: (overlapLinePoint(
			{ vector: subtract2(segments[1][1], segments[1][0]), origin: segments[1][0] },
			seg[0],
			includeS,
		)
		|| overlapLinePoint(
			{ vector: subtract2(segments[1][1], segments[1][0]), origin: segments[1][0] },
			seg[1],
			includeS,
		)
		|| overlapLinePoint(
			{ vector: subtract2(seg[1], seg[0]), origin: seg[0] },
			segments[1][0],
			includeS,
		)
		|| overlapLinePoint(
			{ vector: subtract2(seg[1], seg[0]), origin: seg[0] },
			segments[1][1],
			includeS,
		))));
	// valid if A and B
	return [0, 1].map(i => reflectMatch[i] === true && results_inside[i] === true);
};

/**
 * @description Validate the input parameters to origami axiom 4 with
 * respect to a boundary polygon that represents the folding surface.
 * To validate axiom 4 check if the input point lies within
 * the boundary and the intersection between the solution line and the
 * input line lies within the boundary.
 * @param {[number, number][]} boundary an array of 2D points,
 * each point is an array of numbers
 * @param {VecLine2[]} solutions an array of solutions in vector-origin form
 * @param {VecLine2} line the line parameter for axiom 4
 * @param {[number, number]} point the point parameter for axiom 4
 * @returns {boolean[]} true if the parameters/solutions are valid
 */
export const validateAxiom4 = (boundary, solutions, line, point) => {
	const perpendicular = { vector: rotate90(line.vector), origin: point };
	const intersect = intersectLineLine(line, perpendicular).point;

	// todo: false or...?
	if (!intersect) { return [false]; }
	return [
		[point, intersect]
			.map(p => overlapConvexPolygonPoint(boundary, p, include).overlap)
			.reduce((a, b) => a && b, true),
	];
};

/**
 * @description Validate the input parameters to origami axiom 5 with
 * respect to a boundary polygon that represents the folding surface.
 * @param {[number, number][]} boundary an array of 2D points,
 * each point is an array of numbers
 * @param {VecLine2[]} solutions an array of solutions in vector-origin form
 * @param {VecLine2} line the line parameter for axiom 5
 * @param {[number, number]} point1 the point parameter for axiom 5
 * @param {[number, number]} point2 the point parameter for axiom 5
 * @returns {boolean[]} array of booleans (true if valid) matching the solutions array
 */
export const validateAxiom5 = (boundary, solutions, line, point1, point2) => {
	if (solutions.length === 0) { return []; }
	const testParamPoints = [point1, point2]
		.map(point => overlapConvexPolygonPoint(boundary, point, include).overlap)
		.reduce((a, b) => a && b, true);
	const testReflections = solutions
		.map(foldLine => reflectPoint(foldLine, point2))
		.map(point => overlapConvexPolygonPoint(boundary, point, include).overlap);
	return testReflections.map(ref => ref && testParamPoints);
};

/**
 * @description Validate the input parameters to origami axiom 6 with
 * respect to a boundary polygon that represents the folding surface.
 * @param {[number, number][]} boundary an array of 2D points,
 * each point is an array of numbers
 * @param {VecLine2[]} solutions an array of solutions in vector-origin form
 * @param {VecLine2} line1 the line parameter for axiom 6
 * @param {VecLine2} line2 the line parameter for axiom 6
 * @param {[number, number]} point1 the point parameter for axiom 6
 * @param {[number, number]} point2 the point parameter for axiom 6
 * @returns {boolean[]} array of booleans (true if valid) matching the solutions array
 */
export const validateAxiom6 = function (boundary, solutions, line1, line2, point1, point2) {
	if (solutions.length === 0) { return []; }
	const testParamPoints = [point1, point2]
		.map(point => overlapConvexPolygonPoint(boundary, point, include).overlap)
		.reduce((a, b) => a && b, true);
	if (!testParamPoints) { return solutions.map(() => false); }
	const testReflect0 = solutions
		.map(foldLine => reflectPoint(foldLine, point1))
		.map(point => overlapConvexPolygonPoint(boundary, point, include).overlap);
	const testReflect1 = solutions
		.map(foldLine => reflectPoint(foldLine, point2))
		.map(point => overlapConvexPolygonPoint(boundary, point, include).overlap);
	return solutions.map((_, i) => testReflect0[i] && testReflect1[i]);
};

/**
 * @description Validate the input parameters to origami axiom 7 with
 * respect to a boundary polygon that represents the folding surface.
 * @param {[number, number][]} boundary an array of 2D points,
 * each point is an array of numbers
 * @param {VecLine2[]} solutions an array of solutions in vector-origin form
 * @param {VecLine2} line1 the line parameter for axiom 7
 * @param {VecLine2} line2 the line parameter for axiom 7
 * @param {[number, number]} point the point parameter for axiom 7
 * @returns {boolean[]} true if the parameters/solutions are valid
 */
export const validateAxiom7 = (boundary, solutions, line1, line2, point) => {
	// check if the point parameter is inside the polygon
	const paramPointTest = overlapConvexPolygonPoint(
		boundary,
		point,
		include,
	).overlap;
	// check if the reflected point on the fold line is inside the polygon
	if (!solutions.length) { return [false]; }
	const reflected = reflectPoint(solutions[0], point);
	const reflectTest = overlapConvexPolygonPoint(boundary, reflected, include).overlap;
	// check if the line to fold onto itself is somewhere inside the polygon
	const paramLineTest = (
		intersectPolygonLine(boundary, line2, includeL).length >= 2
	);
	// same test we do for axiom 4
	const intersect = intersectLineLine(
		line2,
		solutions[0],
		includeL,
		includeL,
	).point;
	const intersectInsideTest = intersect
		? overlapConvexPolygonPoint(boundary, intersect, include).overlap
		: false;
	return [paramPointTest && reflectTest && paramLineTest && intersectInsideTest];
};

// /**
//  * @description Validate an axiom, this will run one of
//  * the submethods ("validateAxiom1", "validateAxiom2", ...).
//  * @param {number} number the axiom number, 1-7
//  * @param {number[][]} boundary an array of points, each point is an array of numbers
//  * @param {VecLine[]} solutions an array of solutions in vector-origin form
//  * @param {number[] | VecLine} ...args the input parameters to the axiom method
//  * @returns {boolean|boolean[]} for every solution, true if valid. Axioms 1, 2, 4, 7
//  * return one boolean, 3, 5, 6 return arrays of booleans.
//  */
// export const validateAxiom = (number, boundary, solutions, ...args) => [null,
// 	validateAxiom1,
// 	validateAxiom2,
// 	validateAxiom3,
// 	validateAxiom4,
// 	validateAxiom5,
// 	validateAxiom6,
// 	validateAxiom7,
// ][number](boundary, solutions, ...args);
