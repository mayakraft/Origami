/**
 * Rabbit Ear (c) Kraft
 */
import { EPSILON } from "../../math/constant.js";
import { includeL } from "../../math/compare.js";
import { foldGraph } from "./foldGraph.js";
import { getEdgesUnderPoint, getFaceUnderPoint } from "../overlap.js";
import { makeVerticesCoordsFolded } from "../vertices/folded.js";

/**
 * @description To perform a squash fold we need a vertex and two adjacent
 * edges. One edge must currently be folded and will become flat, and one edge
 * is currently flat and will become folded. The vertex is the point of
 * rotation, out of which new fold rays will be cast. The vertex can be
 * inferred to be the vertex at the point of intersection between the two edges
 * @param {FOLD} graph a FOLD object
 * @returns {object} a summary of changes to the graph
 */
export const reverseFold = (
	graph,
	{ vector, origin },
	// foldedEdge,
	// flatEdge,
	vertices_coordsFolded = undefined,
	epsilon = EPSILON,
) => {
	console.warn("DO NOT USE. This method is in progress...");
	const lineDomain = includeL;
	const interiorPoints = [];
	const assignment = "V";

	if (vertices_coordsFolded === undefined) {
		const rootFace = getFaceUnderPoint(graph, origin, vector);
		vertices_coordsFolded = makeVerticesCoordsFolded(graph, [rootFace]);
	}

	const folded = {
		...graph,
		vertices_coords: vertices_coordsFolded,
	};

	const reverseEdges = getEdgesUnderPoint(folded, origin);

	// const changes = foldGraph(
	// 	graph,
	// 	{ vector, origin },
	// 	lineDomain,
	// 	interiorPoints,
	// 	"F", // set this to flat for now.
	// 	0, // fold angle
	// 	vertices_coordsFolded,
	// 	epsilon,
	// );
	// // console.log(reverseEdges);
	// // console.log(changes);

	return {};
};
