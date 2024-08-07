/**
 * Rabbit Ear (c) Kraft
 */
import { dot2, normalize2, subtract2 } from "../math/vector.js";
import { assignmentCanBeFolded } from "../fold/spec.js";
import { makeVerticesEdgesUnsorted } from "../graph/make/verticesEdges.js";
import {
	counterClockwiseOrder2,
	counterClockwiseAngleRadians,
	isCounterClockwiseBetween,
} from "../math/radial.js";

/**
 * @description Given a list of numbers, this method will sort them by
 * even and odd indices and sum the two categories, returning two sums.
 * @param {number[]} numbers one list of numbers
 * @returns {number[]} one array of two sums, even and odd indices
 */
export const alternatingSum = (numbers) =>
	[0, 1].map((even_odd) =>
		numbers.filter((_, i) => i % 2 === even_odd).reduce((a, b) => a + b, 0),
	);

/**
 * @description Separate out a list of numbers by their indices,
 * odd and even, sum the numbers in each of the two lists, and
 * return for each list, the deviation from the average of the sum.
 * @param {number[]} sectors one list of numbers
 * @returns {number[]} one array of two numbers. if both alternating sets sum
 * to the same, the result will be [0, 0]. if the first set is 2 more than the
 * second, the result will be [1, -1]. (not [2, 0] or something with a 2 in it)
 */
export const alternatingSumDifference = (sectors) => {
	const halfsum = sectors.reduce((a, b) => a + b, 0) / 2;
	return alternatingSum(sectors).map((s) => s - halfsum);
};

/**
 * @description given a set of edges around a single vertex (expressed as an array
 * of radian angles), find all possible single-ray additions which
 * when added to the set, the set satisfies Kawasaki's theorem.
 * @usage this is hard coded to work for flat-plane, where sectors sum to 360deg
 * @param {number[]} radians the angle of the edges in radians,
 * like vectors around a vertex. pre-sorted.
 * @returns {number[]} for every sector either one vector (as an angle in radians)
 * or undefined if that sector contains no solution.
 */
export const kawasakiSolutionsRadians = (radians) =>
	radians
		// counter clockwise angle between this index and the next
		.map((v, i, arr) => [v, arr[(i + 1) % arr.length]])
		.map(([a, b]) => counterClockwiseAngleRadians(a, b))

		// for every sector, make an array of all the OTHER sectors
		.map((_, i, arr) => arr.slice(i + 1, arr.length).concat(arr.slice(0, i)))

		// for every sector, use the sector score from the OTHERS two to split it
		.map((opposite_sectors) => alternatingSum(opposite_sectors).map((s) => Math.PI - s))

		// add the deviation to the edge to get the absolute position
		.map((kawasakis, i) => radians[i] + kawasakis[0])

		// sometimes this results in a solution OUTSIDE the sector. ignore these
		.map((angle, i) =>
			isCounterClockwiseBetween(angle, radians[i], radians[(i + 1) % radians.length])
				? angle
				: undefined,
		);

// or should we remove the indices so the array reports [ empty x2, ...]
/**
 * @description given a set of edges around a single vertex (expressed as an array
 * of vectors), find all possible single-ray additions which
 * when added to the set, the set satisfies Kawasaki's theorem.
 * @usage this is hard coded to work for flat-plane, where sectors sum to 360deg
 * @param {number[][]} vectors array of vectors, the edges around a single vertex. pre-sorted.
 * @returns {[number, number][]} for every sector either one vector
 * or undefined if that sector contains no solution.
 */
export const kawasakiSolutionsVectors = (vectors) =>
	kawasakiSolutionsRadians(vectors.map((v) => Math.atan2(v[1], v[0]))).map((a) =>
		a === undefined ? undefined : [Math.cos(a), Math.sin(a)],
	);

// todo: this is doing too much work in preparation
/**
 * @description given a single vertex in a graph which does not yet satisfy Kawasaki's theorem,
 * find all possible single-ray additions which when added to the set, the set
 * satisfies Kawasaki's theorem.
 * @usage this is hard coded to work for flat-plane, where sectors sum to 360deg
 * @param {FOLD} graph a FOLD object
 * @param {number} vertex the index of the vertex
 * @returns {number[][]} for every sector either one vector or
 * undefined if that sector contains no solution.
 */
export const kawasakiSolutions = (
	{ vertices_coords, vertices_edges, edges_assignment, edges_vertices },
	vertex,
) => {
	// to calculate Kawasaki's theorem, we need the 3 edges
	// as vectors, and we need them sorted radially.
	if (!vertices_edges) {
		// eslint-disable-next-line no-param-reassign
		vertices_edges = makeVerticesEdgesUnsorted({ edges_vertices });
	}
	// for each of the vertex's adjacent edges,
	// get the edge's vertices, order them such that
	// the vertex is in spot 0, the other is spot 1.
	const edges = edges_assignment
		? vertices_edges[vertex].filter((e) => assignmentCanBeFolded[edges_assignment[e]])
		: vertices_edges[vertex];
	if (edges.length % 2 === 0) {
		return [];
	}
	const vert_edges_vertices = edges.map((edge) =>
		edges_vertices[edge][0] === vertex
			? edges_vertices[edge]
			: [edges_vertices[edge][1], edges_vertices[edge][0]],
	);
	const vert_edges_coords = vert_edges_vertices.map((ev) =>
		ev.map((v) => vertices_coords[v]),
	);
	const vert_edges_vector = vert_edges_coords.map((coords) =>
		subtract2(coords[1], coords[0]),
	);
	const sortedVectors = counterClockwiseOrder2(vert_edges_vector).map(
		(i) => vert_edges_vector[i],
	);
	const result = kawasakiSolutionsVectors(sortedVectors);
	const normals = sortedVectors.map(normalize2);
	const filteredResults = result
		.filter((a) => a !== undefined)
		.filter(
			(vector) =>
				!normals
					.map((v) => dot2(vector, v))
					.map((d) => Math.abs(1 - d) < 1e-3)
					.reduce((a, b) => a || b, false),
		);
	return filteredResults;
};
