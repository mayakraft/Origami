/**
 * Rabbit Ear (c) Kraft
 */
import { makeVerticesToEdge } from "./lookup.js";

/**
 * @description Make `faces_edges` from `faces_vertices`.
 * @param {FOLD} graph a FOLD object, with
 * edges_vertices and faces_vertices
 * @returns {number[][]} a `faces_edges` array
 */
export const makeFacesEdgesFromVertices = ({ edges_vertices, faces_vertices }) => {
	const map = makeVerticesToEdge({ edges_vertices });
	return faces_vertices
		.map((face) => face.map((v, i, arr) => [v, arr[(i + 1) % arr.length]].join(" ")))
		.map((face) => face.map((pair) => map[pair]));
};
