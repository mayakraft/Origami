/**
 * Rabbit Ear (c) Kraft
 */
import { removeDuplicateVertices } from "./vertices/duplicate.js";
import { removeIsolatedVertices } from "./vertices/isolated.js";
import { removeDuplicateEdges } from "./edges/duplicate.js";
import { removeCircularEdges } from "./edges/circular.js";
import { mergeFlatNextmaps, invertFlatMap } from "./maps.js";

/**
 * @description This method will remove bad graph data. this includes:
 * - duplicate (distance in 2D/3D) and isolated vertices
 * - circular and duplicate edges.
 * @param {FOLD} graph a FOLD object
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {object} summary of changes, a nextmap and the indices removed.
 */
export const clean = (graph, epsilon) => {
	// duplicate vertices has to be done first as it's possible that
	// this will create circular/duplicate edges.
	const change_v1 = removeDuplicateVertices(graph, epsilon);
	const change_e1 = removeCircularEdges(graph);
	const change_e2 = removeDuplicateEdges(graph);

	// isolated vertices is last. removing edges can create isolated vertices
	const change_v2 = removeIsolatedVertices(graph);

	// return a summary of changes.
	// use the maps to update the removed indices from the second step
	// to their previous index before change 1 occurred.
	const change_v1_backmap = invertFlatMap(change_v1.map);
	const change_v2_remove = change_v2.remove.map((e) => change_v1_backmap[e]);
	const change_e1_backmap = invertFlatMap(change_e1.map);
	const change_e2_remove = change_e2.remove.map((e) => change_e1_backmap[e]);
	return {
		vertices: {
			map: mergeFlatNextmaps(change_v1.map, change_v2.map),
			remove: change_v1.remove.concat(change_v2_remove),
		},
		edges: {
			map: mergeFlatNextmaps(change_e1.map, change_e2.map),
			remove: change_e1.remove.concat(change_e2_remove),
		},
	};
};
