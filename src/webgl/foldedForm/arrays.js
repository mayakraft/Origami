/**
 * Rabbit Ear (c) Kraft
 */
import { makeFacesVertexData, makeThickEdgesVertexData } from "./data.js";
import { makeFacesEdgesFromVertices } from "../../graph/make/facesEdges.js";

/**
 * @param {WebGLRenderingContext|WebGL2RenderingContext} gl WebGL context
 * @param {object} program
 * @param {FOLDExtended} graph a FOLD object
 * @param {{ showTriangulation?: boolean }} options
 * @returns {WebGLVertexArray[]}
 */
export const makeFoldedVertexArrays = (
	gl,
	program,
	{
		vertices_coords,
		edges_vertices,
		edges_assignment,
		faces_vertices,
		faces_edges,
		faces_normal,
	} = {},
	options = {},
) => {
	if (!vertices_coords || !faces_vertices) {
		return [];
	}
	if (!faces_edges && edges_vertices && faces_vertices) {
		// eslint-disable-next-line no-param-reassign
		faces_edges = makeFacesEdgesFromVertices({ edges_vertices, faces_vertices });
	}
	const {
		vertices_coords: vertices_coords3,
		vertices_normal,
		vertices_barycentric,
	} = makeFacesVertexData(
		{
			vertices_coords,
			edges_assignment,
			faces_vertices,
			faces_edges,
			faces_normal,
		},
		options,
	);
	return [
		{
			location: gl.getAttribLocation(program, "v_position"),
			buffer: gl.createBuffer(),
			type: gl.FLOAT,
			length: vertices_coords3.length ? vertices_coords3[0].length : 3,
			data: new Float32Array(vertices_coords3.flat()),
		},
		{
			location: gl.getAttribLocation(program, "v_normal"),
			buffer: gl.createBuffer(),
			type: gl.FLOAT,
			length: vertices_normal.length ? vertices_normal[0].length : 3,
			data: new Float32Array(vertices_normal.flat()),
		},
		{
			location: gl.getAttribLocation(program, "v_barycentric"),
			buffer: gl.createBuffer(),
			type: gl.FLOAT,
			length: 3,
			data: new Float32Array(vertices_barycentric.flat()),
		},
		// { location: gl.getAttribLocation(program, "v_rawEdge"),
		// 	buffer: gl.createBuffer(),
		// 	type: gl.FLOAT,
		// 	// type: gl.INT,
		// 	// type: gl.UNSIGNED_BYTE,
		// 	length: 1,
		// 	data: new Float32Array(rawEdges.flat()) },
	].filter((el) => el.location !== -1);
};

/**
 * WebGL 2 can handle Uint32Array. WebGL 1 cannot and must use 16 bit.
 */

/**
 * @param {WebGLRenderingContext|WebGL2RenderingContext} gl WebGL context
 * @param {number} version the WebGL version
 * @param {FOLD} graph a FOLD object
 * @returns {WebGLElementArray[]}
 */
export const makeFoldedElementArrays = (gl, version = 1, graph = {}) => {
	if (!graph || !graph.vertices_coords || !graph.faces_vertices) {
		return [];
	}
	return [
		{
			mode: gl.TRIANGLES,
			buffer: gl.createBuffer(),
			data:
				version === 2
					? new Uint32Array(graph.faces_vertices.flat())
					: new Uint16Array(graph.faces_vertices.flat()),
		},
	];
};

// thick edges

/**
 * @param {WebGLRenderingContext|WebGL2RenderingContext} gl WebGL context
 * @param {object} program
 * @param {FOLD} graph a FOLD object
 * @param {{ assignment_color?: any }} options
 * @returns {WebGLVertexArray[]}
 */
export const makeThickEdgesVertexArrays = (gl, program, graph, options = {}) => {
	if (!graph || !graph.vertices_coords || !graph.edges_vertices) {
		return [];
	}
	const { vertices_coords, vertices_color, verticesEdgesVector, vertices_vector } =
		makeThickEdgesVertexData(graph, options.assignment_color);

	// todo: better
	if (!vertices_coords) {
		return [];
	}

	return [
		{
			location: gl.getAttribLocation(program, "v_position"),
			buffer: gl.createBuffer(),
			type: gl.FLOAT,
			length: vertices_coords.length ? vertices_coords[0].length : 3,
			data: new Float32Array(vertices_coords.flat()),
		},
		{
			location: gl.getAttribLocation(program, "v_color"),
			buffer: gl.createBuffer(),
			type: gl.FLOAT,
			length: vertices_color.length ? vertices_color[0].length : 3,
			data: new Float32Array(vertices_color.flat()),
		},
		{
			location: gl.getAttribLocation(program, "edge_vector"),
			buffer: gl.createBuffer(),
			type: gl.FLOAT,
			length: verticesEdgesVector.length ? verticesEdgesVector[0].length : 3,
			data: new Float32Array(verticesEdgesVector.flat()),
		},
		{
			location: gl.getAttribLocation(program, "vertex_vector"),
			buffer: gl.createBuffer(),
			type: gl.FLOAT,
			length: vertices_vector.length ? vertices_vector[0].length : 3,
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
export const makeThickEdgesElementArrays = (gl, version = 1, graph = {}) => {
	if (!graph || !graph.edges_vertices) {
		return [];
	}
	const edgesTriangles = graph.edges_vertices
		.map((_, i) => i * 8)
		.flatMap((i) => [
			i + 0,
			i + 1,
			i + 4,
			i + 4,
			i + 1,
			i + 5,
			i + 1,
			i + 2,
			i + 5,
			i + 5,
			i + 2,
			i + 6,
			i + 2,
			i + 3,
			i + 6,
			i + 6,
			i + 3,
			i + 7,
			i + 3,
			i + 0,
			i + 7,
			i + 7,
			i + 0,
			i + 4,
		]);
	return [
		{
			mode: gl.TRIANGLES,
			buffer: gl.createBuffer(),
			data:
				version === 2 ? new Uint32Array(edgesTriangles) : new Uint16Array(edgesTriangles),
		},
	];
};
