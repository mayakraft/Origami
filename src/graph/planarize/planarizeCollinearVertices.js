/**
 * Rabbit Ear (c) Kraft
 */
import { EPSILON } from "../../math/constant.js";
import {
	isVertexCollinear,
	// removeCollinearVertex, // this method could move here someday
} from "../vertices/collinear.js";
import { removeDuplicateEdges } from "../edges/duplicate.js";
import { mergeNextmaps } from "../maps.js";
import { remove } from "../remove.js";
import { makeVerticesEdgesUnsorted } from "../make/verticesEdges.js";

/**
 * @description This will remove a collinear vertex between two edges by
 * rebuilding the first edge (the one with the smaller index) to span across
 * the two adjacent vertices, leaving the other edge in place and containing
 * invalid info. This method returns the index of the edge to be removed.
 * No edges are removed or added, indices do not shift around.
 * @param {FOLD} graph a FOLD object
 * @param {number} vertex
 * @returns {number} the index of the edge which should be removed.
 */
const removeCollinearVertex = ({ edges_vertices, vertices_edges }, vertex) => {
	// edges[0] will remain. edges[1] will be removed
	// [0] and [1] are sorted so that [0] < [1].
	const edges = vertices_edges[vertex].sort((a, b) => a - b);

	// for each edge, the other vertex (not the vertex they share in common)
	const [v0, v1] = edges.flatMap((e) => edges_vertices[e]).filter((v) => v !== vertex);

	/** @type {[number, number]} */
	edges_vertices[edges[0]] = [v0, v1];
	edges_vertices[edges[1]] = undefined;

	[v0, v1].forEach((v) => {
		const oldEdgeIndex = vertices_edges[v].indexOf(edges[1]);
		if (oldEdgeIndex === -1) {
			return;
		}
		vertices_edges[v][oldEdgeIndex] = edges[0];
	});
	return edges[1];
};

/**
 * @param {FOLD} graph a FOLD object
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {{
 *   result: FOLD,
 *   changes: {
 *     vertices: { map: number[] },
 *     edges: { map: number[][] },
 *   }
 * }}
 */
export const planarizeCollinearVertices = (
	graph,
	// { vertices_coords, vertices_edges, edges_vertices, edges_assignment, edges_foldAngle },
	epsilon = EPSILON,
) => {
	// if (!vertices_edges) {
	// 	vertices_edges = makeVerticesEdgesUnsorted({ edges_vertices });
	// }
	if (!graph.vertices_edges) {
		graph.vertices_edges = makeVerticesEdgesUnsorted(graph);
	}

	// const graph = {
	// 	vertices_coords,
	// 	vertices_edges,
	// 	edges_vertices,
	// 	edges_assignment,
	// 	edges_foldAngle,
	// };

	const collinearVertices = graph.vertices_edges
		.map((edges, i) => (edges.length === 2 ? i : undefined))
		.filter((a) => a !== undefined)
		.filter((v) => isVertexCollinear(graph, v, epsilon))
		.reverse();

	// const collinearVertices = vertices_edges
	// 	.map((edges, i) => (edges.length === 2 ? i : undefined))
	// 	.filter(a => a !== undefined)
	// 	.filter(v => isVertexCollinear({ vertices_coords, vertices_edges, edges_vertices }, v, epsilon))
	// 	.reverse();

	// console.log("collinearVertices", result.vertices_edges
	// 	.map((edges, i) => (edges.length === 2 ? i : undefined))
	// 	.filter(a => a !== undefined));

	const edgesToRemove = collinearVertices.map((v) => removeCollinearVertex(graph, v));

	delete graph.vertices_edges;

	const edgesMapCollinear = remove(graph, "edges", edgesToRemove);
	const verticesMap = remove(graph, "vertices", collinearVertices);
	const { map: edgesMapDuplicates } = removeDuplicateEdges(graph);
	const edgesMap = mergeNextmaps(edgesMapCollinear, edgesMapDuplicates);

	return {
		result: graph,
		changes: {
			vertices: { map: verticesMap },
			edges: { map: edgesMap },
		},
	};
};
