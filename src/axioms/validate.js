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
  scale2,
  add2,
  resize2,
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
import {
	getFacesUnderPoint,
} from "../graph/overlap.js";
import {
	intersectLine,
	intersectLineVerticesEdges,
} from "../graph/intersect.js";
import {
	pointsToLine2,
} from "../math/convert.js";
import {
	doRangesOverlap,
} from "../math/range.js";
import {
  axiom3,
} from "./axioms.js";
import { convexHull } from "../math/convexHull.js";

/**
 * @todo this needs to work with non convex polygons
 */
const isPointInGraph = (graph, point) => {
	return getFacesUnderPoint(graph, point).length > 0;
};

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
 * @param {FOLD} graph a FOLD object, foldedForm or creasePattern
 * @param {[number, number]} point1 the point parameter for axiom 1 or 2
 * @param {[number, number]} point2 the point parameter for axiom 1 or 2
 * @returns {boolean[]} true if the parameters/solutions are valid
 */
export const validateAxiom1 = (graph, point1, point2) => {
	// intersect the segment with all the edges in the graph,
	// return result as the "a" parameter, sorted in increasing order
	const line = pointsToLine2(point1, point2);
	const intersections = intersectLineVerticesEdges(graph, line, includeS);
	const vParams = intersections.vertices.filter(a => a !== undefined);
	const eParams = intersections
		.edges
		.filter(a => a !== undefined)
		.map(({ a }) => a);
	const params = vParams.concat(eParams).sort((m, n) => m - n);

	// a new list of points that lie at the midpoints of all edge intersections
	const betweenPoints = params.length < 2
		? []
		: Array.from(Array(params.length - 1))
			.map((_, i) => (params[i] + params[i + 1]) / 2)
			.map(param => add2(line.origin, scale2(line.vector, param)));
	const pointsInside = [point1, point2, ...betweenPoints]
		.map(point => isPointInGraph(graph, point))
		.reduce((a, b) => a && b, true);
	return [pointsInside];
};

/**
 * @description Validate the input parameters to origami axiom 2 with
 * respect to a boundary polygon that represents the folding surface.
 * To validate axiom 2 check if the input points are inside the
 * boundary polygon, if so, the solution is valid.
 * @param {FOLD} graph a FOLD object, foldedForm or creasePattern
 * @param {[number, number]} point1 the point parameter for axiom 1 or 2
 * @param {[number, number]} point2 the point parameter for axiom 1 or 2
 * @returns {boolean[]} true if the parameters/solutions are valid
 */
export const validateAxiom2 = (graph, point1, point2) => [
	[point1, point2]
		.map(point => isPointInGraph(graph, point))
		.reduce((a, b) => a && b, true),
];

/**
 * @description Validate the input parameters to origami axiom 3 with
 * respect to a boundary polygon that represents the folding surface.
 * @param {FOLD} graph a FOLD object, foldedForm or creasePattern
 * @param {[VecLine2?, VecLine2?]} solutions to axiom3
 * @param {VecLine2} line1 the line parameter for axiom 3
 * @param {VecLine2} line2 the line parameter for axiom 3
 * @returns {boolean[]} array of booleans (true if valid) matching the solutions array
 */
export const validateAxiom3 = (graph, solutions, line1, line2) => {
	// bad code
	// needs work
  const vertices_coords2D = graph.vertices_coords.map(resize2);
  const polygon = convexHull(vertices_coords2D)
  	.map(v => vertices_coords2D[v]);

	const segments = [line1, line2]
		.map(line => clipLineConvexPolygon(
			polygon,
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
			polygon,
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
 * @algorithm There are two things tested:
 * 1. is the point parameter inside the boundary
 * 2. split the fold line into two halves at the perpendicular projection,
 *   reflect one side onto the other and ensure that at least one segment
 *   from either side overlap.
 * @param {FOLD} graph a FOLD object, foldedForm or creasePattern
 * @param {VecLine2} line the line parameter for axiom 4
 * @param {[number, number]} point the point parameter for axiom 4
 * @returns {boolean[]} true if the parameters/solutions are valid
 */
export const validateAxiom4 = (graph, line, point) => {
	// test 1: is the point parameter inside the graph
	if (!isPointInGraph(graph, point)) {
		return [false];
	}

	// test 2: do the two halves of the line overlap when folded?
	const perpendicular = { vector: rotate90(line.vector), origin: point };
	const intersectPoint = intersectLineLine(line, perpendicular).point;

	// if there is no intersection, the axiom produced no result
	// todo: should this mean, technically, that it's valid? (no result)
	if (!point) { return [false]; }

	// create a line collinear to the input line, but the line's origin
	// parameter is at the intersection point. this will allow us to
	// intersect with the graph and the parameter values will be positive
	// or negative for either side of the intersection point.
	const intersectLine = {
		vector: line.vector,
		origin: intersectPoint,
	};

	// at the intersection point, divide the line into two rays, intersect
	// both rays with the graph to create a list of segments for each ray,
	// reflect one ray's segments across the line, test if there is
	// at least one overlap between either sets of segments.
	const intersections = intersectLineVerticesEdges(graph, intersectLine);
	const vParams = intersections.vertices.filter(a => a !== undefined);
	const eParams = intersections
		.edges
		.filter(a => a !== undefined)
		.map(({ a }) => a);
	const params = vParams.concat(eParams).sort((m, n) => m - n);

	const paramPairs = (params.length < 2
		? []
		: Array.from(Array(params.length - 1))
			.map((_, i) => [params[i], params[i + 1]]));
	const betweenPoints = paramPairs
			.map(([a, b]) => (a + b) / 2)
			.map(param => add2(intersectLine.origin, scale2(intersectLine.vector, param)));
	const betweenPointsInside = betweenPoints
		.map(point => isPointInGraph(graph, point));

	const paramsRanges = paramPairs
		.filter((_, i) => betweenPointsInside[i])
		.flatMap(pair => (pair[0] < 0 && pair[1] > 0
			? [[pair[0], 0], [0, pair[1]]]
			: [pair]));

	// split the segments into two sets, behind and in front of the intersection
	const positiveSet = paramsRanges
		.filter(([a, b]) => a >= 0 && b >= 0);
	// make the negative set positive (reflect the line across the intersection)
	const negativeSet = paramsRanges
		.filter(([a, b]) => a <= 0 && b <= 0)
		.map(([a, b]) => [Math.abs(a), Math.abs(b)]);

	// console.log("params", params);
	// console.log("paramPairs", paramPairs);
	// console.log("betweenPoints", betweenPoints);
	// console.log("betweenPointsInside", betweenPointsInside);
	// console.log("paramsRanges", paramsRanges);
	// console.log("positiveSet", positiveSet);
	// console.log("negativeSet", negativeSet);

	// if there is any overlap between the two sets of ranges, the result is valid
	for (let i = 0; i < positiveSet.length; i += 1) {
		for (let j = 0; j < negativeSet.length; j += 1) {
			if (doRangesOverlap(positiveSet[i], negativeSet[j])) {
				return [true];
			}
		}
	}
	return [false];
};

/**
 * @description Validate the input parameters to origami axiom 5 with
 * respect to a boundary polygon that represents the folding surface.
 * @param {FOLD} graph a FOLD object, foldedForm or creasePattern
 * @param {VecLine2[]} solutions an array of solutions in vector-origin form
 * @param {VecLine2} line the line parameter for axiom 5
 * @param {[number, number]} point1 the point parameter for axiom 5
 * @param {[number, number]} point2 the point parameter for axiom 5
 * @returns {boolean[]} array of booleans (true if valid) matching the solutions array
 */
export const validateAxiom5 = (graph, solutions, line, point1, point2) => {
	// todo
	const vertices_coords2D = graph.vertices_coords.map(resize2);
  const polygon = convexHull(vertices_coords2D)
  	.map(v => vertices_coords2D[v]);

	if (solutions.length === 0) { return []; }
	const testParamPoints = [point1, point2]
		.map(point => overlapConvexPolygonPoint(polygon, point, include).overlap)
		.reduce((a, b) => a && b, true);
	const testReflections = solutions
		.map(foldLine => reflectPoint(foldLine, point2))
		.map(point => overlapConvexPolygonPoint(polygon, point, include).overlap);
	return testReflections.map(ref => ref && testParamPoints);
};

/**
 * @description Validate the input parameters to origami axiom 6 with
 * respect to a boundary polygon that represents the folding surface.
 * @param {FOLD} graph a FOLD object, foldedForm or creasePattern
 * @param {VecLine2[]} solutions an array of solutions in vector-origin form
 * @param {VecLine2} line1 the line parameter for axiom 6
 * @param {VecLine2} line2 the line parameter for axiom 6
 * @param {[number, number]} point1 the point parameter for axiom 6
 * @param {[number, number]} point2 the point parameter for axiom 6
 * @returns {boolean[]} array of booleans (true if valid) matching the solutions array
 */
export const validateAxiom6 = function (graph, solutions, line1, line2, point1, point2) {
	// todo
	const vertices_coords2D = graph.vertices_coords.map(resize2);
  const polygon = convexHull(vertices_coords2D)
  	.map(v => vertices_coords2D[v]);

	if (solutions.length === 0) { return []; }
	const testParamPoints = [point1, point2]
		.map(point => overlapConvexPolygonPoint(polygon, point, include).overlap)
		.reduce((a, b) => a && b, true);
	if (!testParamPoints) { return solutions.map(() => false); }
	const testReflect0 = solutions
		.map(foldLine => reflectPoint(foldLine, point1))
		.map(point => overlapConvexPolygonPoint(polygon, point, include).overlap);
	const testReflect1 = solutions
		.map(foldLine => reflectPoint(foldLine, point2))
		.map(point => overlapConvexPolygonPoint(polygon, point, include).overlap);
	return solutions.map((_, i) => testReflect0[i] && testReflect1[i]);
};

/**
 * @description Validate the input parameters to origami axiom 7 with
 * respect to a boundary polygon that represents the folding surface.
 * @param {FOLD} graph a FOLD object, foldedForm or creasePattern
 * @param {VecLine2[]} solutions an array of solutions in vector-origin form
 * @param {VecLine2} line1 the line parameter for axiom 7
 * @param {VecLine2} line2 the line parameter for axiom 7
 * @param {[number, number]} point the point parameter for axiom 7
 * @returns {boolean[]} true if the parameters/solutions are valid
 */
export const validateAxiom7 = (graph, solutions, line1, line2, point) => {
	// todo
	const vertices_coords2D = graph.vertices_coords.map(resize2);
  const polygon = convexHull(vertices_coords2D)
  	.map(v => vertices_coords2D[v]);

  // check if the point parameter is inside the polygon
	const paramPointTest = overlapConvexPolygonPoint(
		polygon,
		point,
		include,
	).overlap;
	// check if the reflected point on the fold line is inside the polygon
	if (!solutions.length) { return [false]; }
	const reflected = reflectPoint(solutions[0], point);
	const reflectTest = overlapConvexPolygonPoint(polygon, reflected, include).overlap;
	// check if the line to fold onto itself is somewhere inside the polygon
	const paramLineTest = (
		intersectPolygonLine(polygon, line2, includeL).length >= 2
	);
	// same test we do for axiom 4
	const intersect = intersectLineLine(
		line2,
		solutions[0],
		includeL,
		includeL,
	).point;
	const intersectInsideTest = intersect
		? overlapConvexPolygonPoint(polygon, intersect, include).overlap
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
