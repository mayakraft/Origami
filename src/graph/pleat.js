/**
 * Rabbit Ear (c) Kraft
 */
import { EPSILON } from "../math/constant.js";
import { includeL, includeS } from "../math/compare.js";
import { pleat as Pleat } from "../math/line.js";
import { intersectLineLine } from "../math/intersect.js";
import { add2, scale2 } from "../math/vector.js";
import { edgeToLine2, edgesToLines2 } from "./edges/lines.js";

/**
 * @description Create a series of pleat lines as segments, using two
 * lines as inputs. This is akin to origami axiom 3, but
 * that the result is not one bisector, but a fan of sectors.
 * @param {FOLD} graph a FOLD object
 * @param {VecLine2} lineA one of the two input lines
 * @param {VecLine2} lineB one of the two input lines
 * @param {number} count the number of pleats
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {[[number, number], [number, number]][][]} an
 * array of arrays of segments, where each segment is an array
 * of points, each point is an array of numbers.
 * The outer array always contains two inner arrays where the pleat lines
 * are sorted into two halves, both two angles between the lines.
 */
export const pleat = (
	{ vertices_coords, edges_vertices },
	lineA,
	lineB,
	count,
	epsilon = EPSILON,
) => {
	const edges_lines = edgesToLines2({ vertices_coords, edges_vertices });

	// the pleat() method returns two lists of lines (or one if parallel)
	// convert these two lists of lines into two lists of segments.
	return Pleat(lineA, lineB, count, epsilon).map((lines) =>
		lines
			.map((line) => {
				// intersect these lines with every edge in the graph,
				// gather a list of the line's intersection parameter.
				// these parameters can be converted back into points by
				// scaling the line's vector by the parameter amount (and add to origin).
				const dots = edges_lines
					.map(
						(edgeLine) =>
							intersectLineLine(line, edgeLine, includeL, includeS, epsilon).a,
					)
					.filter((a) => a !== undefined);
				if (dots.length < 2) {
					return undefined;
				}

				// if the max and min parameter are not epsilon equal,
				// we can create a valid segment.
				const min = Math.min(...dots);
				const max = Math.max(...dots);
				/** @type {[[number, number], [number, number]]} */
				const segment =
					Math.abs(max - min) < epsilon
						? undefined
						: [
								add2(line.origin, scale2(line.vector, min)),
								add2(line.origin, scale2(line.vector, max)),
							];
				return segment;
			})
			.filter((a) => a !== undefined),
	);
};

/**
 * @description Create a series of pleat lines as segments, using two
 * of a graph's edges as inputs. This is akin to origami axiom 3, but
 * that the result is not one bisector, but a fan of sectors.
 * @param {FOLD} graph a FOLD object
 * @param {number} edgeA one of two input edges
 * @param {number} edgeB one of two input edges
 * @param {number} count the number of pleats
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {number[][][][]} an array of arrays of segments.
 * The outer array always contains two inner arrays.
 * And each segment is an array of points, each point an array of numbers.
 */
export const pleatEdges = (
	{ vertices_coords, edges_vertices },
	edgeA,
	edgeB,
	count,
	epsilon = EPSILON,
) => {
	const lineA = edgeToLine2({ vertices_coords, edges_vertices }, edgeA);
	const lineB = edgeToLine2({ vertices_coords, edges_vertices }, edgeB);
	return pleat({ vertices_coords, edges_vertices }, lineA, lineB, count, epsilon);
};
