/**
 * Rabbit Ear (c) Kraft
 */
import * as S from "../../general/strings.js";
import { EPSILON } from "../../math/general/constant.js";
import { average } from "../../math/algebra/vector.js";
import { getVerticesClusters } from "./clusters.js";
import replace from "../replace.js";
/**
 * @description Get the indices of all vertices which lie close to other vertices.
 * @param {FOLD} graph a FOLD graph
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {number[][]} arrays of clusters of similar vertices. todo check this
 * @linkcode Origami ./src/graph/verticesViolations.js 15
 */
export const duplicateVertices = (graph, epsilon) => (
	getVerticesClusters(graph, epsilon)
		.filter(arr => arr.length > 1)
);
/**
 * @description This will shrink the number of vertices in the graph,
 * if vertices are close within an epsilon, it will keep the first one,
 * find the average of close points, and assign it to the remaining vertex.
 * **this has the potential to create circular and duplicate edges**.
 * @param {FOLD} graph a FOLD graph
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {object} summary of changes
 * @linkcode Origami ./src/graph/verticesViolations.js 129
 */
export const removeDuplicateVertices = (graph, epsilon = EPSILON) => {
	// replaces array will be [index:value] index is the element to delete,
	// value is the index this element will be replaced by.
	const replace_indices = [];
	// "remove" is only needed for the return value summary.
	const remove_indices = [];
	// clusters is array of indices, for example: [ [4, 13, 7], [0, 9] ]
	const clusters = getVerticesClusters(graph, epsilon)
		.filter(arr => arr.length > 1);
	// for each cluster of n, all indices from [1...n] will be replaced with [0]
	clusters.forEach(cluster => {
		// replace() must maintain index > value, ensure index[0] is the
		// smallest of the set (most of the time it is)
		if (Math.min(...cluster) !== cluster[0]) {
			cluster.sort((a, b) => a - b);
		}
		for (let i = 1; i < cluster.length; i += 1) {
			replace_indices[cluster[i]] = cluster[0];
			remove_indices.push(cluster[i]);
		}
	});
	// for each cluster, average all vertices-to-merge to get their new point.
	// set the vertex at the index[0] (the index to keep) to the new point.
	clusters
		.map(arr => arr.map(i => graph.vertices_coords[i]))
		.map(arr => average(...arr))
		.forEach((point, i) => { graph.vertices_coords[clusters[i][0]] = point; });
	return {
		map: replace(graph, S._vertices, replace_indices),
		remove: remove_indices,
	};
};
