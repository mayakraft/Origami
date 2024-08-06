/**
 * Rabbit Ear (c) Kraft
 */
import { createProgram } from "../general/webgl.js";
import { touches_100_vert, touches_100_frag } from "./shaders.js";
import { makeUniforms } from "./uniforms.js";

/**
 * @param {WebGLRenderingContext|WebGL2RenderingContext} gl WebGL context
 * @param {object} program
 * @returns {WebGLVertexArray[]}
 */
const makeVertexArrays = (gl, program) => [
	{
		location: gl.getAttribLocation(program, "v_position"),
		buffer: gl.createBuffer(),
		type: gl.FLOAT,
		length: 2,
		data: new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
	},
];

/**
 * @param {WebGLRenderingContext|WebGL2RenderingContext} gl WebGL context
 * @returns {WebGLElementArray[]}
 */
const makeElementArrays = (gl) => [
	{
		mode: gl.TRIANGLE_STRIP,
		buffer: gl.createBuffer(),
		data: new Uint32Array([0, 1, 2, 3]),
	},
];

/**
 * @param {WebGLRenderingContext|WebGL2RenderingContext} gl The WebGL Context.
 * @returns {WebGLModel}
 */
export const indicatorsV1 = (gl) => {
	const program = createProgram(gl, touches_100_vert, touches_100_frag);
	return {
		program,
		vertexArrays: makeVertexArrays(gl, program),
		elementArrays: makeElementArrays(gl),
		flags: [], // flags: [gl.DEPTH_TEST],
		makeUniforms,
	};
};

/**
 * @param {WebGLRenderingContext|WebGL2RenderingContext} gl The WebGL Context.
 * @param {number} version the version of the WebGL
 * @returns {WebGLModel[]}
 */
export const touchIndicators = (gl, version = 1) => {
	switch (version) {
		case 1:
			return [indicatorsV1(gl)];
		default:
			return [indicatorsV1(gl)];
	}
};
