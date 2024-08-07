/**
 * Rabbit Ear (c) Kraft
 */
import { triangulateConvexFacesVertices } from "../../graph/triangulate.js";
import { resize2 } from "../../math/vector.js";
import { makeCPEdgesVertexData } from "./data.js";

/**
 * @param {WebGLRenderingContext|WebGL2RenderingContext} gl WebGL context
 * @param {object} program
 * @param {FOLD} graph a FOLD object
 * @returns {WebGLVertexArray[]}
 */
export const makeCPEdgesVertexArrays = (gl, program, graph, options) => {
	if (!graph || !graph.vertices_coords || !graph.edges_vertices) {
		return [];
	}
	const {
		vertices_coords,
		vertices_color,
		vertices_foldAngle,
		verticesEdgesVector,
		vertices_vector,
	} = makeCPEdgesVertexData(graph, options);

	// todo: better
	if (!vertices_coords) {
		return [];
	}
	return [
		{
			location: gl.getAttribLocation(program, "v_position"),
			buffer: gl.createBuffer(),
			type: gl.FLOAT,
			length: 2,
			data: new Float32Array(vertices_coords.flat()),
		},
		{
			location: gl.getAttribLocation(program, "v_color"),
			buffer: gl.createBuffer(),
			type: gl.FLOAT,
			length: vertices_color.length ? vertices_color[0].length : 2, // should this be 3?
			data: new Float32Array(vertices_color.flat()),
		},
		{
			location: gl.getAttribLocation(program, "edge_vector"),
			buffer: gl.createBuffer(),
			type: gl.FLOAT,
			length: verticesEdgesVector.length ? verticesEdgesVector[0].length : 2,
			data: new Float32Array(verticesEdgesVector.flat()),
		},
		{
			location: gl.getAttribLocation(program, "edge_foldAngle"),
			buffer: gl.createBuffer(),
			type: gl.FLOAT,
			length: 1,
			data: new Float32Array(vertices_foldAngle.flat()),
		},
		{
			location: gl.getAttribLocation(program, "vertex_vector"),
			buffer: gl.createBuffer(),
			type: gl.FLOAT,
			length: vertices_vector.length ? vertices_vector[0].length : 2,
			data: new Float32Array(vertices_vector.flat()),
		},
	].filter((el) => el.location !== -1);
};

/**
 * @param {WebGLRenderingContext|WebGL2RenderingContext} gl WebGL context
 * @param {number} version the WebGL version
 * @param {FOLD} graph a FOLD object
 * @returns {WebGLElementArray[]}
 */
export const makeCPEdgesElementArrays = (gl, version = 1, graph = {}) => {
	if (!graph || !graph.edges_vertices) {
		return [];
	}
	const edgesTriangles = graph.edges_vertices
		.map((_, i) => i * 4)
		.flatMap((i) => [i + 0, i + 1, i + 2, i + 2, i + 3, i + 0]);
	return [
		{
			mode: gl.TRIANGLES,
			buffer: gl.createBuffer(),
			data:
				version === 2 ? new Uint32Array(edgesTriangles) : new Uint16Array(edgesTriangles),
		},
	];
};

/**
 * @param {WebGLRenderingContext|WebGL2RenderingContext} gl WebGL context
 * @param {object} program
 * @param {FOLD} graph a FOLD object
 * @returns {WebGLVertexArray[]}
 */
export const makeCPFacesVertexArrays = (gl, program, graph) => {
	if (!graph || !graph.vertices_coords) {
		return [];
	}
	return [
		{
			location: gl.getAttribLocation(program, "v_position"),
			buffer: gl.createBuffer(),
			type: gl.FLOAT,
			length: 2,
			data: new Float32Array(graph.vertices_coords.flatMap(resize2)),
		},
	].filter((el) => el.location !== -1);
};

/**
 * @param {WebGLRenderingContext|WebGL2RenderingContext} gl WebGL context
 * @param {number} version the WebGL version
 * @param {FOLD} graph a FOLD object
 * @returns {WebGLElementArray[]}
 */
export const makeCPFacesElementArrays = (gl, version = 1, graph = {}) => {
	if (!graph || !graph.vertices_coords || !graph.faces_vertices) {
		return [];
	}
	return [
		{
			mode: gl.TRIANGLES,
			buffer: gl.createBuffer(),
			data:
				version === 2
					? new Uint32Array(triangulateConvexFacesVertices(graph).flat())
					: new Uint16Array(triangulateConvexFacesVertices(graph).flat()),
		},
	];
};
