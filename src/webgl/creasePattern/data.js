/**
 * Rabbit Ear (c) Kraft
 */
import { makeEdgesVector } from "../../graph/make/edges.js";
import { light, dark } from "../general/colors.js";

/**
 * @param {([number, number]|[number, number, number])[]} coords
 * @returns {[number, number][]}
 */
const make2D = (coords) => coords.map(([x, y]) => [x || 0, y || 0]);

/**
 * @param {FOLD} graph a FOLD object
 * @param {object} options
 * @returns {{
 *   vertices_coords: any,
 *   vertices_color: any,
 *   verticesEdgesVector: any,
 *   vertices_foldAngle: any,
 *   vertices_vector: any,
 * }}
 */
export const makeCPEdgesVertexData = (graph, options) => {
	if (!graph || !graph.vertices_coords || !graph.edges_vertices) {
		return undefined;
	}
	const assignmentColors = options && options.dark ? dark : light;
	const assignment_color = {
		...assignmentColors,
		...options,
	};
	const vertices_coords = make2D(
		graph.edges_vertices
			.flatMap((edge) => edge.map((v) => graph.vertices_coords[v]))
			.flatMap((coord) => [coord, coord]),
	);
	// for every edge, one 2D vector
	const edgesVector = make2D(makeEdgesVector(graph));
	// in this upcoming section, we gather 4 vertices for every edge.
	// these vertices will be used to form a very long thin rectangle (2 triangles)
	// for every edge, 4 color values for each vertex of the rectangle
	const vertices_color = graph.edges_assignment
		? graph.edges_assignment.flatMap((a) => [
				assignment_color[a],
				assignment_color[a],
				assignment_color[a],
				assignment_color[a],
			])
		: graph.edges_vertices.flatMap(() => [
				assignment_color.U,
				assignment_color.U,
				assignment_color.U,
				assignment_color.U,
			]);
	// for every edge, 4 opacity values for each vertex of the rectangle
	const vertices_foldAngle = graph.edges_foldAngle
		? graph.edges_foldAngle.flatMap((a) => [a, a, a, a])
		: graph.edges_vertices.flatMap(() => [0, 0, 0, 0]);
	// for every edge, 4 identical copies of the edge's vector
	const verticesEdgesVector = edgesVector.flatMap((el) => [el, el, el, el]);
	// the rectangle's vertices are arranged counter clockwise,
	// these values indicate where along the edge this vertex lies.
	const vertices_vector = graph.edges_vertices.flatMap(() => [
		[1, 0],
		[-1, 0],
		[-1, 0],
		[1, 0],
	]);
	return {
		vertices_coords,
		vertices_color,
		vertices_foldAngle,
		verticesEdgesVector,
		vertices_vector,
	};
};
