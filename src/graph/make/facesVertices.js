/**
 * Rabbit Ear (c) Kraft
 */

/**
 * @description Make `faces_vertices` from `faces_edges`.
 * @param {FOLD} graph a FOLD object, with faces_edges, edges_vertices
 * @returns {number[][]} a `faces_vertices` array
 */
export const makeFacesVerticesFromEdges = ({ edges_vertices, faces_edges }) =>
	faces_edges.map((edges) =>
		edges
			.map((edge) => edges_vertices[edge])
			.map((pairs, i, arr) => {
				const next = arr[(i + 1) % arr.length];
				return pairs[0] === next[0] || pairs[0] === next[1] ? pairs[1] : pairs[0];
			}),
	);
