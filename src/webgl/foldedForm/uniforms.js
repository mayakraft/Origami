/**
 * Rabbit Ear (c) Kraft
 */
import { multiplyMatrices4 } from "../../math/algebra/matrix4.js";
import { hexToRgb } from "../../svg/colors/convert.js";

const makeUniforms = (gl, {
	projectionMatrix, viewMatrix, modelMatrix, canvas,
	opacity, touchPoint, frontColor, backColor, strokeWidth,
}) => ({
	u_matrix: {
		func: "uniformMatrix4fv",
		value: multiplyMatrices4(multiplyMatrices4(
			projectionMatrix,
			viewMatrix,
		), modelMatrix),
	},
	u_projection: {
		func: "uniformMatrix4fv",
		value: projectionMatrix,
	},
	u_modelView: {
		func: "uniformMatrix4fv",
		value: multiplyMatrices4(viewMatrix, modelMatrix),
	},
	u_opacity: {
		func: "uniform1f",
		value: opacity,
	},
	u_touch: {
		func: "uniform2fv",
		value: touchPoint,
	},
	u_resolution: {
		func: "uniform2fv",
		value: [canvas.clientWidth, canvas.clientHeight]
			.map(n => n * window.devicePixelRatio || 1),
	},
	u_frontColor: {
		func: "uniform3fv",
		value: hexToRgb(frontColor).map(n => n / 255),
	},
	u_backColor: {
		func: "uniform3fv",
		value: hexToRgb(backColor).map(n => n / 255),
	},
	u_strokeWidth: {
		func: "uniform1f",
		value: strokeWidth,
	},
});

export default makeUniforms;
