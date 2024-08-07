/**
 * Rabbit Ear (c) Kraft
 */
import { remapKey } from "./maps.js";

/**
 * @description This method will re-index all component arrays so that
 * there are no arrays with holes (if vertices_ contains vertex 4 but not 3).
 * Arrays with holes are a result of some methods, like subgraph() which is
 * designed so that the user can re-merge the graphs. Alternatively, you can
 * run this method to make a subgraph a valid FOLD object with no holes.
 * @param {FOLD} graph a FOLD object
 * @returns {FOLD} a copy of the input FOLD graph, with no array holes.
 */
export const normalize = (graph) => {
	const maps = { vertices: [], edges: [], faces: [] };
	let v = 0;
	let e = 0;
	let f = 0;
	graph.vertices_coords.forEach((_, i) => {
		maps.vertices[i] = v++;
	});
	graph.edges_vertices.forEach((_, i) => {
		maps.edges[i] = e++;
	});
	graph.faces_vertices.forEach((_, i) => {
		maps.faces[i] = f++;
	});
	remapKey(graph, "vertices", maps.vertices);
	remapKey(graph, "edges", maps.edges);
	remapKey(graph, "faces", maps.faces);
	return graph;
};
