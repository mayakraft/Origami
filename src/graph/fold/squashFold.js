/**
 * Rabbit Ear (c) Kraft
 */
import { EPSILON } from "../../math/constant.js";

/**
 * @description To perform a squash fold we need a vertex and two adjacent
 * edges. One edge must currently be folded and will become flat, and one edge
 * is currently flat and will become folded. The vertex is the point of
 * rotation, out of which new fold rays will be cast. The vertex can be
 * inferred to be the vertex at the point of intersection between the two edges
 * @param {FOLD} graph a FOLD object
 * @param {number} foldedEdge
 * @param {number} flatEdge
 * @returns {object} a summary of changes to the graph
 */
export const simpleSquashFold = (
	graph,
	foldedEdge,
	flatEdge,
	vertices_coordsFolded = undefined,
	epsilon = EPSILON,
) => {
	console.warn("DO NOT USE. This method is in progress...");
	return {};
};
