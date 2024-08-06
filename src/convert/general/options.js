/**
 * Rabbit Ear (c) Kraft
 */
import { getEpsilon } from "../../graph/epsilon.js";
import { boundingBox } from "../../graph/boundary.js";
import { cleanNumber } from "../../general/number.js";

/**
 * @description Given an options object, typically the final parameter in
 * a method's parameters, look for an epsilon value which may be located inside
 * the object under an "epsilon" parameter, or if the object itself is a number.
 * @param {FOLD} graph a FOLD object
 * @param {object|number} object the options object
 * @param {string} key the key under which this epsilon value might lie.
 * @returns {number} an epsilon value, either from the user, or found via
 * analysis by looking at the vertices of the graph.
 */
export const findEpsilonInObject = (graph, object, key = "epsilon") => {
	if (typeof object === "object" && typeof object[key] === "number") {
		return object[key];
	}
	return typeof object === "number" ? object : getEpsilon(graph);
};

/**
 * @description Invert the vertices and re-center them to
 * be inside the same bounding box as before.
 * @param {[number, number][]|[number, number, number][]} vertices_coords,
 * modified in place
 * @returns {undefined}
 */
export const invertVertical = (vertices_coords) => {
	const box = boundingBox({ vertices_coords });
	const center = box.min[1] + box.span[1] / 2;
	const invMin = Math.min(-box.min[1], -box.max[1]);
	const invMax = Math.max(-box.min[1], -box.max[1]);
	const invSpan = invMax - invMin;
	const invCenter = invMin + invSpan / 2;
	const difference = center - invCenter;
	const yTranslate = cleanNumber(difference, 8);
	for (let i = 0; i < vertices_coords.length; i += 1) {
		vertices_coords[i][1] = -vertices_coords[i][1] + yTranslate;
	}
};
