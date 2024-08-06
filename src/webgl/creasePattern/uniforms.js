/**
 * Rabbit Ear (c) Kraft
 */
import { identity4x4, multiplyMatrices4 } from "../../math/matrix4.js";
import { parseColorToWebGLColor } from "../general/colors.js";

/**
 * @description Uniforms must exist so there are protections to ensure
 * that at least some value gets passed.
 * @return {{ [key: string]: WebGLUniform }}
 */
export const makeUniforms = ({
	projectionMatrix,
	modelViewMatrix,
	cpColor,
	strokeWidth,
}) => ({
	u_matrix: {
		func: "uniformMatrix4fv",
		value: multiplyMatrices4(
			projectionMatrix || identity4x4,
			modelViewMatrix || identity4x4,
		),
	},
	u_projection: {
		func: "uniformMatrix4fv",
		value: projectionMatrix || identity4x4,
	},
	u_modelView: {
		func: "uniformMatrix4fv",
		value: modelViewMatrix || identity4x4,
	},
	u_cpColor: {
		func: "uniform3fv",
		value: parseColorToWebGLColor(cpColor || "white"),
	},
	u_strokeWidth: {
		func: "uniform1f",
		value: strokeWidth || 0.05,
	},
});
