/**
 * Rabbit Ear (c) Kraft
 */

/**
 * @description Make `edges_edges` containing all vertex-adjacent edges.
 * This will be radially sorted if you call makeVerticesEdges before calling this.
 * @param {FOLD} graph a FOLD object, with entries edges_vertices, vertices_edges
 * @returns {number[][]} each entry relates to an edge, each array contains indices
 * of other edges.
 */
export const makeEdgesEdges = ({ edges_vertices, vertices_edges }) =>
	edges_vertices.map((verts, i) => {
		const side0 = vertices_edges[verts[0]].filter((e) => e !== i);
		const side1 = vertices_edges[verts[1]].filter((e) => e !== i);
		return side0.concat(side1);
	});
