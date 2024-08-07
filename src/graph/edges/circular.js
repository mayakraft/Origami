/**
 * Rabbit Ear (c) Kraft
 */
import { filterKeysWithSuffix } from "../../fold/spec.js";
import { remove } from "../remove.js";

/**
 * @description Get the indices of all circular edges. Circular edges are
 * edges where both of its edges_vertices is the same vertex.
 * @param {FOLD} graph a FOLD object
 * @returns {number[]} array of indices of circular edges. empty if none.
 */
export const circularEdges = ({ edges_vertices = [] }) =>
	edges_vertices
		.map((vertices, i) => (vertices[0] === vertices[1] ? i : undefined))
		.filter((a) => a !== undefined);

/**
 * @description Given a set of graph geometry (vertices/edges/faces) indices,
 * get all the arrays which reference these geometries, (eg: end in _edges),
 * and remove (splice) that entry from the array if it contains a remove value.
 * @param {FOLD} graph a FOLD object
 * @param {string} suffix a component intended as a suffix,
 * like "vertices" for "edges_vertices"
 * @example
 * removing indices [4, 7] from "edges", then a faces_edges entry
 * which was [15, 13, 4, 9, 2] will become [15, 13, 9, 2].
 */
const spliceRemoveValuesFromSuffixes = (graph, suffix, remove_indices) => {
	const remove_map = {};
	remove_indices.forEach((n) => {
		remove_map[n] = true;
	});
	filterKeysWithSuffix(graph, suffix).forEach((sKey) =>
		graph[sKey] // faces_edges or vertices_edges...
			.forEach((elem, i) => {
				// faces_edges[0], faces_edges[1], ...
				// reverse iterate through array, remove elements with splice
				for (let j = elem.length - 1; j >= 0; j -= 1) {
					if (remove_map[elem[j]] === true) {
						graph[sKey][i].splice(j, 1);
					}
				}
			}),
	);
};

/**
 * @description Find and remove all circular edges from a graph.
 * @param {FOLD} graph a FOLD object
 * @param {number[]} [remove_indices=undefined] Leave this empty. Otherwise, if
 * circularEdges() has already been called, provide the result here to speed
 * up the algorithm.
 * @returns {{ remove: number[], map: number[] }} a summary of changes where
 * "remove" contains all indices which were removed
 * "map" is a nextmap of changes to the list of edges
 */
export const removeCircularEdges = (graph, remove_indices) => {
	if (!remove_indices) {
		remove_indices = circularEdges(graph);
	}
	if (remove_indices.length) {
		// remove every instance of a circular edge in every _edge array.
		// assumption is we can simply remove them because a face that includes
		// a circular edge is still the same face when you just remove the edge
		spliceRemoveValuesFromSuffixes(graph, "edges", remove_indices);
		// console.warn("circular edge found. please rebuild");
		// todo: figure out which arrays need to be rebuilt, if it exists.
	}
	return {
		map: remove(graph, "edges", remove_indices),
		remove: remove_indices,
	};
};
