/**
 * Rabbit Ear (c) Kraft
 */
import Messages from "../../environment/messages.js";
import Window from "../../environment/window.js";

/**
 * @description Initialize a WebGL context
 * @param {HTMLCanvasElement} canvasElement an HTML canvas element
 * @param {number} [preferredVersion] the preferred version of WebGL
 * @returns {{
 *   gl: WebGLRenderingContext | WebGL2RenderingContext,
 *   version: number,
 * }} an object with a
 * WebGL rendering context, and the version of WebGL it was initialized under.
 */
export const initializeWebGL = (canvasElement, preferredVersion) => {
	// set the size of the drawingBuffer to include retina display level pixels (if exist),
	// the size can still change after, even with CSS, this only matters for getContext
	const devicePixelRatio = Window().devicePixelRatio || 1;
	// eslint-disable-next-line no-param-reassign
	canvasElement.width = canvasElement.clientWidth * devicePixelRatio;
	// eslint-disable-next-line no-param-reassign
	canvasElement.height = canvasElement.clientHeight * devicePixelRatio;

	// if there was a user preference
	switch (preferredVersion) {
		case 1:
			return { gl: canvasElement.getContext("webgl"), version: 1 };
		case 2:
			return { gl: canvasElement.getContext("webgl2"), version: 2 };
		default:
			break;
	}

	// no user preference. attempt version 2, if fails, return version 1.
	const gl2 = canvasElement.getContext("webgl2");
	if (gl2) {
		return { gl: gl2, version: 2 };
	}
	const gl1 = canvasElement.getContext("webgl");
	if (gl1) {
		return { gl: gl1, version: 1 };
	}
	throw new Error(Messages.noWebGL);
};

// WebGL boilerplate from https://webglfundamentals.org

/**
 * @description Creates and compiles a shader.
 * @param {WebGLRenderingContext|WebGL2RenderingContext} gl The WebGL Context.
 * @param {string} shaderSource The GLSL source code for the shader.
 * @param {number} shaderType The type of shader, VERTEX_SHADER or
 *     FRAGMENT_SHADER.
 * @returns {WebGLShader} The shader.
 */
const compileShader = (gl, shaderSource, shaderType) => {
	const shader = gl.createShader(shaderType);
	gl.shaderSource(shader, shaderSource);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		throw new Error(gl.getShaderInfoLog(shader));
	}
	return shader;
};

/**
 * @description Creates a program from 2 shaders.
 * @param {WebGLRenderingContext|WebGL2RenderingContext} gl The WebGL context.
 * @param {WebGLShader} vertexShader A vertex shader.
 * @param {WebGLShader} fragmentShader A fragment shader.
 * @returns {WebGLProgram} A program.
 */
const createProgramAndAttachShaders = (gl, vertexShader, fragmentShader) => {
	const program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		// something went wrong with the link
		throw new Error(gl.getProgramInfoLog(program));
	}
	gl.deleteShader(vertexShader);
	gl.deleteShader(fragmentShader);
	return program;
};

/**
 * Creates a program from 2 script tags.
 *
 * @param {WebGLRenderingContext|WebGL2RenderingContext} gl The WebGL Context.
 * @param {string} vertexSource vertex shader as raw text
 * @param {string} fragmentSource fragment shader as raw text
 * @returns {WebGLProgram} a WebGL program
 */
export const createProgram = (gl, vertexSource, fragmentSource) => {
	const vertexShader = compileShader(gl, vertexSource, gl.VERTEX_SHADER);
	const fragmentShader = compileShader(gl, fragmentSource, gl.FRAGMENT_SHADER);
	return createProgramAndAttachShaders(gl, vertexShader, fragmentShader);
};
