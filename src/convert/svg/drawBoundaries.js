/**
 * Rabbit Ear (c) Kraft
 */
import SVG from "../../svg/index.js";
import { addClass } from "../../svg/general/dom.js";
import { boundaries } from "../../graph/boundary.js";
import { isFoldedForm } from "../../fold/spec.js";
import { setKeysAndValues } from "../general/svg.js";

/**
 * @description the default styles of the boundary polygon,
 * depending on if it is a folded model or crease pattern
 */
const BOUNDARY_FOLDED = {
	fill: "none",
};
const BOUNDARY_CP = {
	stroke: "black",
	fill: "white",
};

/**
 * @param {FOLD} graph
 * @param {object} options
 * @returns {SVGElement} an SVG <g> group element
 */
export const drawBoundaries = (graph, options = {}) => {
	const g = SVG.g();
	if (!graph) {
		return g;
	}

	// get the boundary of the graph as a list of points
	const polygons = boundaries(graph)
		.map(({ vertices }) => vertices.map((v) => graph.vertices_coords[v]))
		.filter((polygon) => polygon.length);

	// give the boundary polygons a class and add them to the group
	polygons.forEach((polygon) => {
		const svgPolygon = SVG.polygon(polygon);
		addClass(svgPolygon, "boundary");
		g.appendChild(svgPolygon);
	});

	// default and user styles will be applied to the group, not the polygon
	setKeysAndValues(g, isFoldedForm(graph) ? BOUNDARY_FOLDED : BOUNDARY_CP);
	setKeysAndValues(g, options);
	return g;
};
