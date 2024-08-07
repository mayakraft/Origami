/**
 * Rabbit Ear (c) Kraft
 */
import { boundingBox } from "../../graph/boundary.js";
import { makeEdgesLength } from "../../graph/make/edges.js";

/**
 * @description the default bounds, the unit square
 */
const unitBounds = { min: [0, 0], span: [1, 1] };

/**
 * @description Given an attribute dictionary with keys and values,
 * Set each key/value as an attribute on the SVG element.
 * @param {Element} el any SVG / DOM element
 * @param {object} attributes an object with keys and values, intended that
 * the values be simple primitives (boolean, number, string)
 */
export const setKeysAndValues = (el, attributes = {}) =>
	Object.keys(attributes).forEach((key) => el.setAttributeNS(null, key, attributes[key]));

/**
 * @description Convert a bounding box type into a viewbox string
 * @param {Box?} box an object with "min" and "span" as two points
 * @returns {string} an SVG viewBox string
 */
export const boundingBoxToViewBox = (box) =>
	[box.min, box.span].flatMap((p) => [p[0], p[1]]).join(" ");

/**
 * @description Given a FOLD graph, get the 2D viewbox that
 * encloses all vertices.
 * @param {FOLD} graph a FOLD object
 * @returns {string} an SVG viewBox string
 */
export const getViewBox = (graph) => {
	const box = boundingBox(graph);
	return box === undefined ? "" : boundingBoxToViewBox(box);
};

/**
 * @todo this method is O(n log n) but could be improved to O(n)
 * possibly with a kind of bucket sort, but then the nth selection
 * would be much less precise and this method should be no longer
 * exported but rather hard coded as a subroutine for getStrokeWidth.
 * @description Get the Nth percentile edge length of edges from a graph.
 * This is useful to get a sense for how thick the strokeWidth should be
 * to make a reasonable rendering.
 * @param {FOLD} graph a FOLD object
 * @param {number} n a scale between 0.0 and 1.0, looking for the
 * nth smallest or largest edge length.
 * @returns {number} the length of the edge at the nth percent of edges
 * sorted by length.
 */
export const getNthPercentileEdgeLength = (
	{ vertices_coords, edges_vertices, edges_length },
	n = 0.1,
) => {
	if (!vertices_coords || !edges_vertices) {
		return undefined;
	}
	if (!edges_length) {
		edges_length = makeEdgesLength({ vertices_coords, edges_vertices });
	}
	const sortedLengths = edges_length.slice().sort((a, b) => a - b);
	const index_tenth_percent = Math.max(
		0,
		Math.min(Math.floor(sortedLengths.length * n), sortedLengths.length - 1),
	);
	return sortedLengths[index_tenth_percent];
};

/**
 * @description Given a FOLD graph, find a suitable stroke-width for
 * the purposes of rendering the edges.
 * @param {FOLD} graph a FOLD object
 * @param {number} [vmax] if the dimensions of the graph are already
 * calculated, provide the longest length along one axis here.
 * @returns {number} a suitable value for a stroke-width
 */
export const getStrokeWidth = (graph, vmax) => {
	const v_max =
		vmax === undefined ? Math.max(...(boundingBox(graph) || unitBounds).span) : vmax;
	const edgeTenthPercent = getNthPercentileEdgeLength(graph, 0.1);
	return edgeTenthPercent ? edgeTenthPercent * 0.1 : v_max * 0.01;
};
