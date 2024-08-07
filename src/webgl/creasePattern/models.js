/**
 * Rabbit Ear (c) Kraft
 */
import { createProgram } from "../general/webgl.js";
import {
	makeCPEdgesVertexArrays,
	makeCPEdgesElementArrays,
	makeCPFacesVertexArrays,
	makeCPFacesElementArrays,
} from "./arrays.js";
import { makeUniforms } from "./uniforms.js";
import {
	cp_100_vert,
	cp_100_frag,
	cp_300_vert,
	cp_300_frag,
	thick_edges_100_vert,
	thick_edges_100_frag,
	thick_edges_300_vert,
	thick_edges_300_frag,
} from "./shaders.js";

/**
 * @param {WebGLRenderingContext|WebGL2RenderingContext} gl The WebGL Context.
 * @param {FOLD} graph a FOLD object
 * @param {object} options
 * @returns {WebGLModel}
 */
export const cpFacesV1 = (gl, graph = {}, options = undefined) => {
	const program = createProgram(gl, cp_100_vert, cp_100_frag);
	return {
		program,
		vertexArrays: makeCPFacesVertexArrays(gl, program, graph), // , options),
		elementArrays: makeCPFacesElementArrays(gl, 1, graph),
		flags: [],
		makeUniforms,
	};
};

/**
 * @param {WebGLRenderingContext|WebGL2RenderingContext} gl The WebGL Context.
 * @param {FOLD} graph a FOLD object
 * @param {object} options
 * @returns {WebGLModel}
 */
export const cpEdgesV1 = (gl, graph = {}, options = undefined) => {
	const program = createProgram(gl, thick_edges_100_vert, thick_edges_100_frag);
	return {
		program,
		vertexArrays: makeCPEdgesVertexArrays(gl, program, graph, options),
		elementArrays: makeCPEdgesElementArrays(gl, 1, graph),
		flags: [],
		makeUniforms,
	};
};

/**
 * @param {WebGLRenderingContext|WebGL2RenderingContext} gl The WebGL Context.
 * @param {FOLD} graph a FOLD object
 * @param {object} options
 * @returns {WebGLModel}
 */
export const cpFacesV2 = (gl, graph = {}, options = undefined) => {
	const program = createProgram(gl, cp_300_vert, cp_300_frag);
	return {
		program,
		vertexArrays: makeCPFacesVertexArrays(gl, program, graph), // , options),
		elementArrays: makeCPFacesElementArrays(gl, 2, graph),
		flags: [],
		makeUniforms,
	};
};

/**
 * @param {WebGLRenderingContext|WebGL2RenderingContext} gl The WebGL Context.
 * @param {FOLD} graph a FOLD object
 * @param {object} options
 * @returns {WebGLModel}
 */
export const cpEdgesV2 = (gl, graph = {}, options = undefined) => {
	const program = createProgram(gl, thick_edges_300_vert, thick_edges_300_frag);
	return {
		program,
		vertexArrays: makeCPEdgesVertexArrays(gl, program, graph, options),
		elementArrays: makeCPEdgesElementArrays(gl, 2, graph),
		flags: [],
		makeUniforms,
	};
};

/**
 * @param {WebGLRenderingContext|WebGL2RenderingContext} gl The WebGL Context.
 * @param {number} version the version of the WebGL
 * @param {FOLD} graph a FOLD object
 * @param {object} options
 * @returns {WebGLModel[]}
 */
export const creasePattern = (gl, version = 1, graph = {}, options = undefined) => {
	switch (version) {
		case 1:
			return [cpFacesV1(gl, graph, options), cpEdgesV1(gl, graph, options)];
		case 2:
		default:
			return [cpFacesV2(gl, graph, options), cpEdgesV2(gl, graph, options)];
	}
};
