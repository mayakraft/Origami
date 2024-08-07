/**
 * Rabbit Ear (c) Kraft
 */
import SVG from "../../svg/index.js";
import { setKeysAndValues } from "../general/svg.js";

/**
 * @description Convert the vertices of a FOLD graph into SVG circle elements.
 * Return the result as a group element <g> containing the circles.
 * @param {FOLD} graph
 * @param {object} options
 * @returns {SVGElement} an SVG <g> group element
 */
export const drawVertices = (graph, options = {}) => {
	const g = SVG.g();
	if (!graph || !graph.vertices_coords) {
		return g;
	}

	// radius will be overwritten inside render(), in applyTopLevelOptions()
	// leave a default radius here in case this method is called directly
	graph.vertices_coords
		.map((v) => SVG.circle(v[0], v[1], 0.01))
		.forEach((v) => g.appendChild(v));

	// any user-specified style will be applied to the group
	setKeysAndValues(g, options);

	return g;
};
