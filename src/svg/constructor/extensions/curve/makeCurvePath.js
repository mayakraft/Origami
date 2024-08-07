/* SVG (c) Kraft */
import { svg_sub2, svg_add2, svg_scale2 } from "../../../general/algebra.js";

/**
 * Rabbit Ear (c) Kraft
 */

// endpoints is an array of 4 numbers
const makeCurvePath = (endpoints = [], bend = 0, pinch = 0.5) => {
	/** @type {[number, number]} */
	const tailPt = [endpoints[0] || 0, endpoints[1] || 0];
	/** @type {[number, number]} */
	const headPt = [endpoints[2] || 0, endpoints[3] || 0];
	const vector = svg_sub2(headPt, tailPt);
	const midpoint = svg_add2(tailPt, svg_scale2(vector, 0.5));
	/** @type {[number, number]} */
	const perpendicular = [vector[1], -vector[0]];
	const bezPoint = svg_add2(midpoint, svg_scale2(perpendicular, bend));
	const tailControl = svg_add2(tailPt, svg_scale2(svg_sub2(bezPoint, tailPt), pinch));
	const headControl = svg_add2(headPt, svg_scale2(svg_sub2(bezPoint, headPt), pinch));
	return `M${tailPt[0]},${tailPt[1]}C${tailControl[0]},${tailControl[1]} ${headControl[0]},${headControl[1]} ${headPt[0]},${headPt[1]}`;
};

export { makeCurvePath as default };
