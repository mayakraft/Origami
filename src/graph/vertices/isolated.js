/**
 * Rabbit Ear (c) Kraft
 */
import { remove } from "../remove.js";

/**
 * @description Get the indices of all vertices which make no appearance in any edge.
 * @param {FOLD} graph a FOLD object
 * @returns {number[]} the indices of the isolated vertices
 */
export const edgeIsolatedVertices = ({ vertices_coords, edges_vertices }) => {
	if (!vertices_coords || !edges_vertices) {
		return [];
	}
	let count = vertices_coords.length;
	const seen = Array(count).fill(false);
	edges_vertices.forEach((ev) => {
		ev.filter((v) => !seen[v]).forEach((v) => {
			seen[v] = true;
			count -= 1;
		});
	});
	return seen.map((s, i) => (s ? undefined : i)).filter((a) => a !== undefined);
};

/**
 * @description Get the indices of all vertices which make no appearance in any face.
 * @param {FOLD} graph a FOLD object
 * @returns {number[]} the indices of the isolated vertices
 */
export const faceIsolatedVertices = ({ vertices_coords, faces_vertices }) => {
	if (!vertices_coords || !faces_vertices) {
		return [];
	}
	let count = vertices_coords.length;
	const seen = Array(count).fill(false);
	faces_vertices.forEach((fv) => {
		fv.filter((v) => !seen[v]).forEach((v) => {
			seen[v] = true;
			count -= 1;
		});
	});
	return seen.map((s, i) => (s ? undefined : i)).filter((a) => a !== undefined);
};

// todo this could be improved. for loop instead of forEach + filter.
// break the loop early.
/**
 * @description Get the indices of all vertices which make no appearance in any edge or face.
 * @param {FOLD} graph a FOLD object
 * @returns {number[]} the indices of the isolated vertices
 */
export const isolatedVertices = ({ vertices_coords, edges_vertices, faces_vertices }) => {
	if (!vertices_coords) {
		return [];
	}
	let count = vertices_coords.length;
	const seen = Array(count).fill(false);
	if (edges_vertices) {
		edges_vertices.forEach((ev) => {
			ev.filter((v) => !seen[v]).forEach((v) => {
				seen[v] = true;
				count -= 1;
			});
		});
	}
	if (faces_vertices) {
		faces_vertices.forEach((fv) => {
			fv.filter((v) => !seen[v]).forEach((v) => {
				seen[v] = true;
				count -= 1;
			});
		});
	}
	return seen.map((s, i) => (s ? undefined : i)).filter((a) => a !== undefined);
};

/**
 * @description Remove any vertices which are not a part of any edge or
 * face. This will shift up the remaining vertices indices so that the
 * vertices arrays will not have any holes, and, additionally it searches
 * through all _vertices reference arrays and updates the index
 * references for the shifted vertices.
 * @param {FOLD} graph a FOLD object
 * @param {number[]} [remove_indices] Leave this empty. Otherwise, if
 * isolatedVertices() has already been called, provide the result here to speed
 * up the algorithm.
 * @returns {object} summary of changes
 */
export const removeIsolatedVertices = (graph, remove_indices) => {
	if (!remove_indices) {
		remove_indices = isolatedVertices(graph);
	}
	return {
		map: remove(graph, "vertices", remove_indices),
		remove: remove_indices,
	};
};
