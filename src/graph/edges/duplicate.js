/**
 * Rabbit Ear (c) Kraft
 */
import { EPSILON } from "../../math/constant.js";
import { makeVerticesEdgesUnsorted, makeVerticesEdges } from "../make/verticesEdges.js";
import { makeVerticesVertices } from "../make/verticesVertices.js";
import { makeVerticesFaces } from "../make/verticesFaces.js";
import { replace } from "../replace.js";
import { invertArrayToFlatMap } from "../maps.js";
import { clusterUnsortedIndices } from "../../general/cluster.js";
import { getVerticesClusters } from "../vertices/clusters.js";
import { sweepEdges } from "../sweep.js";

/**
 * @description Get the indices of all duplicate edges by marking the
 * second/third/... as duplicate (not the first of the duplicates).
 * The result is given as an array with holes, where:
 * - the indices are the indices of the duplicate edges.
 * - the values are the indices of the first occurence of the duplicate.
 * Under this system, many edges can be duplicates of the same edge.
 * Order is not important. [5,9] and [9,5] are still duplicate.
 * @param {FOLD} graph a FOLD object
 * @returns {number[]} an array where the redundant edges are the indices,
 * and the values are the indices of the first occurence of the duplicate.
 * @example
 * {number[]} array, [4:3, 7:5, 8:3, 12:3, 14:9] where indices
 * (3, 4, 8, 12) are all duplicates. (5,7), (9,14) are also duplicates.
 */
export const duplicateEdges = ({ edges_vertices }) => {
	if (!edges_vertices) {
		return [];
	}

	const hash = {};
	const duplicates = [];

	// convert edges to space-separated vertex pair strings ("a b" where a < b)
	// store them into the hash table with a value of the current edge index,
	// unless a match already exists, then add an entry into duplicates where
	// the index is the edge index, and the value is the matching edge vertex.
	edges_vertices
		.map((verts) => (verts[0] < verts[1] ? verts : verts.slice().reverse()))
		.map((pair) => pair.join(" "))
		.forEach((key, e) => {
			if (hash[key] !== undefined) {
				duplicates[e] = hash[key];
			} else {
				// only update the hash once, at the first appearance of these vertices,
				// this prevents chains of duplicate relationships where
				// A points to B points to C points to D...
				hash[key] = e;
			}
		});

	return duplicates;
};

/**
 * @description Get similar edges, where "similarity" is defined geometrically,
 * two similar edges have both of their vertices in the same place, order
 * of vertices does not matter.
 * @param {FOLD} graph a FOLD object
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {number[][]} clusters_edges, the result is an array of clusters
 * where each cluster contains a list of edge indices.
 */
export const getSimilarEdges = (
	{ vertices_coords, vertices_edges, edges_vertices },
	epsilon = EPSILON,
) => {
	const clusters_vertices = getVerticesClusters({ vertices_coords }, epsilon);
	const vertices_cluster = invertArrayToFlatMap(clusters_vertices);

	/**
	 * @param {number} a edge index
	 * @param {number} b edge index
	 */
	const comparison = (a, b) => {
		const [a0, a1] = edges_vertices[a].map((v) => vertices_cluster[v]);
		const [b0, b1] = edges_vertices[b].map((v) => vertices_cluster[v]);
		return (a0 === b0 && a1 === b1) || (a0 === b1 && a1 === b0);
	};

	const edgeSweep = sweepEdges({
		vertices_coords,
		vertices_edges,
		edges_vertices,
	});

	return edgeSweep
		.map(({ start }) => start)
		.flatMap((edges) => clusterUnsortedIndices(edges, comparison));
};

/**
 * @description Find and remove all duplicate edges from a graph.
 * If an edge is removed, it will mess up the vertices data (vertices_vertices,
 * vertices_edges, vertices_faces) so if this method successfully found and
 * removed a duplicate edge, the vertices arrays will be rebuilt as well.
 * @param {FOLD} graph a FOLD object
 * @param {number[]} [replace_indices=undefined] Leave this empty. Otherwise, if
 * duplicateEdges() has already been called, provide the result here to speed
 * up the algorithm.
 * @returns {{ remove: number[], map: number[] }} a summary of changes where
 * "remove" contains all indices which were removed
 * "map" is a nextmap of changes to the list of edges
 */
export const removeDuplicateEdges = (graph, replace_indices) => {
	// index: edge to remove, value: the edge which should replace it.
	if (!replace_indices) {
		replace_indices = duplicateEdges(graph);
	}
	const removeObject = Object.keys(replace_indices).map((n) => parseInt(n, 10));
	const map = replace(graph, "edges", replace_indices);

	// if edges were removed, we need to rebuild vertices_edges and then
	// vertices_vertices since that was built from vertices_edges, and then
	// vertices_faces since that was built from vertices_vertices.
	if (removeObject.length) {
		// currently we are rebuilding the entire arrays, if possible,
		// update these specific vertices directly:
		// const vertices = removeObject
		//   .map(edge => graph.edges_vertices[edge])
		//   .reduce((a, b) => a.concat(b), []);
		if (graph.vertices_edges || graph.vertices_vertices || graph.vertices_faces) {
			graph.vertices_edges = makeVerticesEdgesUnsorted(graph);
			graph.vertices_vertices = makeVerticesVertices(graph);
			graph.vertices_edges = makeVerticesEdges(graph);
			graph.vertices_faces = makeVerticesFaces(graph);
		}
	}
	return { map, remove: removeObject };
};
