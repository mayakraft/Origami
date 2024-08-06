/**
 * Rabbit Ear (c) Kraft
 */
import { filterKeysWithPrefix, filterKeysWithSuffix } from "../fold/spec.js";

const ordersArrayNames = {
	edges: "edgeOrders",
	faces: "faceOrders",
};

/**
 * @description Given an array of arrays, count the length of each array
 * and return the maximum length. Ensure the array exists too.
 * @param {any[]} arrays any number of arrays
 * @returns {number} the length of the longest array
 */
const maxArraysLength = (arrays) =>
	Math.max(0, ...arrays.filter((el) => el !== undefined).map((el) => el.length));

/**
 * @description Search inside arrays inside arrays inside arrays
 * and return the largest number.
 * @param {number[][][]} arrays an array of arrays of numbers
 * @returns {number} largest number in array in arrays.
 */
const maxValueInArrayInArray = (arrays) => {
	let max = -1; // will become 0 if nothing is found
	arrays
		.filter((a) => a !== undefined)
		.forEach((arr) =>
			arr.forEach((el) =>
				el.forEach((e) => {
					if (e > max) {
						max = e;
					}
				}),
			),
		);
	return max;
};

/**
 * @description Search inside arrays inside arrays and return
 * the largest number by only checking indices 0 and 1 in the
 * inner arrays; meant for faceOrders or edgeOrders.
 * @param {number[][]} array a faceOrders or edgeOrders array
 * @returns {number} largest number in indices 0 or 1 of array in arrays.
 */
const maxValueInOrders = (array) => {
	let max = -1; // will become 0 if nothing is found
	array.forEach((el) => {
		// exception. index 2 is orientation, not index. check only 0, 1
		if (el[0] > max) {
			max = el[0];
		}
		if (el[1] > max) {
			max = el[1];
		}
	});
	return max;
};

/**
 * @description Get the number of vertices, edges, or faces in the graph by
 * simply checking the length of arrays starting with the key; in the case
 * of differing array lengths (which shouldn't happen) return the largest number.
 *
 * This works even with custom component names in place of "vertices", "edges"...
 *
 * This will fail in the case of abstract graphs, for example where no vertices
 * are defined in a vertex_ array, but still exist as mentions in faces_vertices.
 * In that case, use the implied count method. "count_implied.js"
 * @param {FOLD} graph a FOLD object
 * @param {string} key the prefix for a key, eg: "vertices"
 * @returns {number} the number of the requested element type in the graph
 */
export const count = (graph, key) =>
	maxArraysLength(filterKeysWithPrefix(graph, key).map((k) => graph[k]));

/**
 * @description Get the number of vertices in a graph.
 * @param {FOLD} graph a FOLD object
 * @returns {number} the number of vertices in the graph
 */
export const countVertices = ({
	vertices_coords,
	vertices_vertices,
	vertices_edges,
	vertices_faces,
}) =>
	maxArraysLength([vertices_coords, vertices_vertices, vertices_edges, vertices_faces]);

/**
 * @description Get the number of edges in a graph.
 * @param {FOLD} graph a FOLD object
 * @returns {number} the number of edges in the graph
 */
export const countEdges = ({ edges_vertices, edges_faces }) =>
	maxArraysLength([edges_vertices, edges_faces]);

/**
 * @description Get the number of faces in a graph.
 * @param {FOLD} graph a FOLD object
 * @returns {number} the number of faces in the graph
 */
export const countFaces = ({ faces_vertices, faces_edges, faces_faces }) =>
	maxArraysLength([faces_vertices, faces_edges, faces_faces]);

/**
 * @description Get the number of vertices, edges, or faces in the graph, as
 * evidenced by their appearance in other arrays; ie: searching faces_vertices
 * for the largest vertex index, and inferring number of vertices is that long.
 * @param {FOLD} graph a FOLD object
 * @param {string} key the prefix for a key, eg: "vertices"
 * @returns {number} the number of vertices, edges, or faces in the graph.
 */
export const countImplied = (graph, key) =>
	Math.max(
		// return the maximum value between (1/2):
		// 1. a found geometry in another geometry's array ("vertex" in "faces_vertices")
		maxValueInArrayInArray(filterKeysWithSuffix(graph, key).map((str) => graph[str])),
		// 2. a found geometry in a faceOrders or edgeOrders type of array (special case)
		graph[ordersArrayNames[key]] ? maxValueInOrders(graph[ordersArrayNames[key]]) : -1,
	) + 1;

/**
 * @param {FOLD} graph a FOLD object
 * @returns {number} the number of components
 */
export const countImpliedVertices = (graph) => countImplied(graph, "vertices");

/**
 * @param {FOLD} graph a FOLD object
 * @returns {number} the number of components
 */
export const countImpliedEdges = (graph) => countImplied(graph, "edges");

/**
 * @param {FOLD} graph a FOLD object
 * @returns {number} the number of components
 */
export const countImpliedFaces = (graph) => countImplied(graph, "faces");
