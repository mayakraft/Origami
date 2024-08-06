/**
 * Rabbit Ear (c) Kraft
 */
import { makeVerticesToEdge } from "./lookup.js";

/**
 * @description Make `vertices_edges` from `edges_vertices`, unsorted, which should
 * be used sparingly. Prefer makeVerticesEdges().
 * @param {FOLD} graph a FOLD object, containing edges_vertices
 * @returns {number[][]} array of array of numbers, where each row corresponds to a
 * vertex index and the values in the inner array are edge indices.
 */
export const makeVerticesEdgesUnsorted = ({ edges_vertices }) => {
	const vertices_edges = [];
	// iterate over edges_vertices and swap the index for each of the contents
	// each edge (index 0: [3, 4]) will be converted into (index 3: [0], index 4: [0])
	// repeat. append to each array.
	edges_vertices.forEach((ev, i) =>
		ev.forEach((v) => {
			if (vertices_edges[v] === undefined) {
				vertices_edges[v] = [];
			}
			vertices_edges[v].push(i);
		}),
	);
	return vertices_edges;
};

/**
 * @description Make `vertices_edges` sorted, so that the edges are sorted
 * radially around the vertex, corresponding with the order in `vertices_vertices`.
 * @param {FOLD} graph a FOLD object, containing edges_vertices, vertices_vertices
 * @returns {number[][]} array of array of numbers, where each row corresponds to a
 * vertex index and the values in the inner array are edge indices.
 */
export const makeVerticesEdges = ({ edges_vertices, vertices_vertices }) => {
	const edge_map = makeVerticesToEdge({ edges_vertices });
	return vertices_vertices.map((verts, i) => verts.map((v) => edge_map[`${i} ${v}`]));
};
