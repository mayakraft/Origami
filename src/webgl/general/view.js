/**
 * Rabbit Ear (c) Kraft
 */
import {
	identity4x4,
	makeOrthographicMatrix4,
	makePerspectiveMatrix4,
	invertMatrix4,
} from "../../math/matrix4.js";
import { midpoint, resize } from "../../math/vector.js";
import { boundingBox } from "../../graph/boundary.js";

/**
 * @description Initialize a viewport for a WebGL context
 * based on the dimensions of the canvas.
 * @param {WebGLRenderingContext|WebGL2RenderingContext} gl a WebGL instance
 * @param {HTMLCanvasElement} canvas an HTML canvas
 * @returns {undefined}
 */
export const rebuildViewport = (gl, canvas) => {
	if (!gl) {
		return;
	}
	const devicePixelRatio = window.devicePixelRatio || 1;
	const size = [canvas.clientWidth, canvas.clientHeight].map((n) => n * devicePixelRatio);
	if (canvas.width !== size[0] || canvas.height !== size[1]) {
		// eslint-disable-next-line no-param-reassign
		canvas.width = size[0];
		// eslint-disable-next-line no-param-reassign
		canvas.height = size[1];
	}
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
};

/**
 * @description Create a 4x4 projection matrix for either a
 * perspective or orthographic view.
 * @param {[number, number]} size the size of the HTML canvas
 * @param {string} perspective "orthographic" or "perspective"
 * @param {number} fov the field of view (perspective only)
 * @returns {number[]} a 4x4 projection matrix
 */
export const makeProjectionMatrix = (
	[width, height],
	perspective = "perspective",
	fov = 45,
) => {
	const Z_NEAR = 0.1;
	const Z_FAR = 20;
	const ORTHO_FAR = -100;
	const ORTHO_NEAR = 100;
	const vmin = Math.min(width, height);
	const padding = [(width - vmin) / vmin / 2, (height - vmin) / vmin / 2];
	const side = padding.map((p) => p + 0.5);
	return perspective === "orthographic"
		? makeOrthographicMatrix4(side[1], side[0], -side[1], -side[0], ORTHO_FAR, ORTHO_NEAR)
		: makePerspectiveMatrix4(fov * (Math.PI / 180), width / height, Z_NEAR, Z_FAR);
};

/**
 * @description build an aspect-fit model matrix
 * (possibly an inverse-model matrix)
 * which brings the vertices inside of a 2x2x2 origin-centered bounding box.
 * @param {FOLD} graph a FOLD object
 * @returns {number[]} a 4x4 model matrix
 */
export const makeModelMatrix = (graph) => {
	if (!graph) {
		return [...identity4x4];
	}
	const bounds = boundingBox(graph);
	if (!bounds) {
		return [...identity4x4];
	}
	const scale = Math.max(...bounds.span); // * Math.SQRT2;
	if (scale === 0) {
		return [...identity4x4];
	}
	const center = resize(3, midpoint(bounds.min, bounds.max));
	const scalePositionMatrix = [
		scale,
		0,
		0,
		0,
		0,
		scale,
		0,
		0,
		0,
		0,
		scale,
		0,
		...center,
		1,
	];
	return invertMatrix4(scalePositionMatrix) || [...identity4x4];
};
