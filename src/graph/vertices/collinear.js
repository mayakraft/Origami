/**
 * Rabbit Ear (c) Kraft
 */
import { EPSILON } from "../../math/constant.js";
import { collinearBetween } from "../../math/line.js";
import { makeVerticesEdgesUnsorted } from "../make/verticesEdges.js";

/**
 * @description Given one vertex, and a list of edges which contain this vertex,
 * get one vertex for every edge which is not the input parameter vertex.
 * @param {FOLD} graph a FOLD object with edges_vertices
 * @param {number} vertex one vertex index
 * @param {number[]} edges a list of edge indices
 * @returns {number[]} for every edge, one vertex that is the opposite vertex
 */
export const getOtherVerticesInEdges = ({ edges_vertices }, vertex, edges) =>
	edges.map((edge) =>
		edges_vertices[edge][0] === vertex
			? edges_vertices[edge][1]
			: edges_vertices[edge][0],
	);

/**
 * @description determine if a vertex exists between two and only two edges,
 * and those edges are both parallel and on opposite ends of the vertex.
 * In a lot of cases, this vertex can be removed and the graph would
 * function the same.
 * O(1) if vertices_edges exists, if not, O(n) where n=edges
 * @param {FOLD} graph a FOLD object
 * @param {number} vertex an index of a vertex in the graph
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {boolean} true if the vertex is collinear and can be removed.
 */
export const isVertexCollinear = (
	{ vertices_coords, vertices_edges, edges_vertices },
	vertex,
	epsilon = EPSILON,
) => {
	if (!vertices_coords || !edges_vertices) {
		return false;
	}
	if (!vertices_edges) {
		vertices_edges = makeVerticesEdgesUnsorted({ edges_vertices });
	}
	const edges = vertices_edges[vertex];
	if (edges === undefined || edges.length !== 2) {
		return false;
	}
	// don't just check if they are parallel, use the direction of the vertex
	// to make sure the center vertex is inbetween, instead of the odd
	// case where the two edges are on top of one another with
	// a leaf-like vertex.
	const vertices = getOtherVerticesInEdges({ edges_vertices }, vertex, edges);
	const [a, b, c] = [vertices[0], vertex, vertices[1]].map((v) => vertices_coords[v]);
	return collinearBetween(a, b, c, false, epsilon);
};

// /**
//  * @description this is located in planarize.js. see if we can generalize
//  * it and bring it out here.
//  * Also, there is a method makeFacesNonCollinear inside make.js.
//  */
// export const removeCollinearVertex = ({ edges_vertices, vertices_edges }, vertex) => {};
