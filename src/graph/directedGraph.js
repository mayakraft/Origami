/**
 * Rabbit Ear (c) Kraft
 */
import { uniqueSortedNumbers } from "../general/array.js";
import { invertFlatMap } from "./maps.js";

/**
 * @description Perform a topological sort on a directed acyclic graph.
 * This method assumes your graph is acyclic and will *not* do any testing.
 * If your graph contains cycles this will still return an (invalid) ordering.
 * @param {[number, number][]} directedEdges an array of directed edges
 * where each edge contains two vertex indices with the direction going
 * from index 0 towards 1
 * @returns {number[]} an ordering of the vertices from the edges provided.
 */
export const topologicalSortQuick = (directedEdges) => {
	// flat list of all vertices involved (can contain holes)
	const vertices = uniqueSortedNumbers(directedEdges.flat());

	// array where indices are vertices and values are arrays of vertices
	// which are "parents" of this vertex (other vertices point to this one).
	const verticesParents = [];
	vertices.forEach((v) => {
		verticesParents[v] = [];
	});
	directedEdges.forEach((edge) => {
		verticesParents[edge[1]].push(edge[0]);
	});
	const ordering = [];
	const visited = {};
	/** @param {number} vertex */
	const recurse = (vertex) => {
		if (visited[vertex]) {
			return;
		}
		visited[vertex] = true;
		verticesParents[vertex].forEach(recurse);
		ordering.push(vertex);
	};
	vertices.forEach(recurse);
	return ordering;
};

/**
 * @description Perform a topological sort on a directed acyclic graph.
 * If a cycle exists, this method will return undefined.
 * @param {[number, number][]} directedEdges an array of directed edges
 * where each edge contains two vertex indices with the direction going
 * from index 0 towards 1
 * @returns {number[]|undefined} an ordering of the vertices
 * from the edges provided, or undefined if a cycle is detected.
 */
export const topologicalSort = (directedEdges) => {
	const ordering = topologicalSortQuick(directedEdges);
	const orderMap = invertFlatMap(ordering);
	const violations = directedEdges.filter(([a, b]) => orderMap[a] > orderMap[b]);
	return violations.length ? undefined : ordering;
};
