/**
 * Rabbit Ear (c) Kraft
 */
import { EPSILON } from "../../math/constant.js";
import { subtract } from "../../math/vector.js";
import { sortPointsAlongVector } from "../../general/sort.js";

/**
 * @description This is a subroutine for building vertices_vertices. This will
 * take a set of vertices indices and a vertex index to be the center point,
 * and sort the indices radially counter-clockwise.
 * @param {FOLD} graph a FOLD object
 * @param {number[]} vertices an array of vertex indices to be sorted
 * @param {number} vertex the origin vertex, around which
 * the vertices will be sorted
 * @returns {number[]} indices of vertices, in sorted order
 */
export const sortVerticesCounterClockwise = ({ vertices_coords }, vertices, vertex) =>
	vertices
		.map((v) => vertices_coords[v])
		.map((coord) => subtract(coord, vertices_coords[vertex]))
		.map((vec) => Math.atan2(vec[1], vec[0]))
		// optional line, this makes the cycle loop start/end along the +X axis
		.map((angle) => (angle > -EPSILON ? angle : angle + Math.PI * 2))
		.map((a, i) => ({ a, i }))
		.sort((a, b) => a.a - b.a)
		.map((el) => el.i)
		.map((i) => vertices[i]);

/**
 * @description sort a subset of vertices from a graph along a vector.
 * eg: given the vector [1,0], points according to their X value.
 * @param {FOLD} graph a FOLD object
 * @param {number[]} vertices the indices of vertices to be sorted
 * @param {number[]} vector a vector along which to sort vertices
 * @returns {number[]} indices of vertices, in sorted order
 */
export const sortVerticesAlongVector = ({ vertices_coords }, vertices, vector) =>
	sortPointsAlongVector(
		vertices.map((v) => vertices_coords[v]),
		vector,
	).map((i) => vertices[i]);
