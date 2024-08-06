/**
 * Rabbit Ear (c) Kraft
 */
import { prepareForRendering } from "../../graph/rendering.js";
import { createProgram } from "../general/webgl.js";
import {
	makeFoldedVertexArrays,
	makeFoldedElementArrays,
	makeThickEdgesVertexArrays,
	makeThickEdgesElementArrays,
} from "./arrays.js";
import { makeUniforms } from "./uniforms.js";
import {
	model_100_vert,
	model_100_frag,
	model_300_vert,
	model_300_frag,
	outlined_model_100_vert,
	outlined_model_100_frag,
	outlined_model_300_vert,
	outlined_model_300_frag,
	thick_edges_100_vert,
	thick_edges_300_vert,
	simple_100_frag,
	simple_300_frag,
} from "./shaders.js";

/**
 * @param {WebGLRenderingContext|WebGL2RenderingContext} gl The WebGL Context.
 * @param {number} version the version of WebGL (1 or 2)
 * @param {FOLD} graph a FOLD object
 * @param {{ earcut?: Function, layerNudge?: number, showTriangulation?: boolean }} options
 * @returns {WebGLModel}
 */
export const foldedFormFaces = (gl, version = 1, graph = {}, options = {}) => {
	const exploded = prepareForRendering(graph, options);
	const program =
		version === 1
			? createProgram(gl, model_100_vert, model_100_frag)
			: createProgram(gl, model_300_vert, model_300_frag);
	return {
		program,
		vertexArrays: makeFoldedVertexArrays(gl, program, exploded, options),
		elementArrays: makeFoldedElementArrays(gl, version, exploded), // , options),
		flags: [gl.DEPTH_TEST],
		makeUniforms,
	};
};

/**
 * @param {WebGLRenderingContext|WebGL2RenderingContext} gl The WebGL Context.
 * @param {number} version the version of WebGL (1 or 2)
 * @param {FOLD} graph a FOLD object
 * @param {{ earcut?: Function, layerNudge?: number, showTriangulation?: boolean }} options
 * @returns {WebGLModel}
 */
export const foldedFormFacesOutlined = (gl, version = 1, graph = {}, options = {}) => {
	const exploded = prepareForRendering(graph, options);
	const program =
		version === 1
			? createProgram(gl, outlined_model_100_vert, outlined_model_100_frag)
			: createProgram(gl, outlined_model_300_vert, outlined_model_300_frag);
	return {
		program,
		vertexArrays: makeFoldedVertexArrays(gl, program, exploded, options),
		elementArrays: makeFoldedElementArrays(gl, version, exploded), // , options),
		flags: [gl.DEPTH_TEST],
		makeUniforms,
	};
};

/**
 * @param {WebGLRenderingContext|WebGL2RenderingContext} gl The WebGL Context.
 * @param {number} version the version of WebGL (1 or 2)
 * @param {FOLD} graph a FOLD object
 * @param {{ assignment_color?: any }} options
 * @returns {WebGLModel}
 */
export const foldedFormEdges = (gl, version = 1, graph = {}, options = {}) => {
	const program =
		version === 1
			? createProgram(gl, thick_edges_100_vert, simple_100_frag)
			: createProgram(gl, thick_edges_300_vert, simple_300_frag);
	return {
		program,
		vertexArrays: makeThickEdgesVertexArrays(gl, program, graph, options),
		elementArrays: makeThickEdgesElementArrays(gl, version, graph),
		flags: [gl.DEPTH_TEST],
		makeUniforms,
	};
};

/**
 * @param {WebGLRenderingContext|WebGL2RenderingContext} gl The WebGL Context.
 * @param {number} version the version of the WebGL
 * @param {FOLD} graph a FOLD object
 * @param {{
 *   edges?: boolean,
 *   faces?: boolean,
 *   outlines?: boolean,
 *   earcut?: Function,
 *   layerNudge?: number,
 *   showTriangulation?: boolean,
 *   assignment_color?: any,
 * }} options
 * @returns {WebGLModel[]}
 */
export const foldedForm = (gl, version = 1, graph = {}, options = {}) => {
	const programs = [];
	// either Faces, or FacesOutlined
	if (options.faces !== false) {
		if (options.outlines === false) {
			programs.push(foldedFormFaces(gl, version, graph, options));
		} else {
			programs.push(foldedFormFacesOutlined(gl, version, graph, options));
		}
	}
	// if edges option is on, also add thick edges
	if (options.edges === true) {
		programs.push(foldedFormEdges(gl, version, graph, options));
	}
	return programs;
};
