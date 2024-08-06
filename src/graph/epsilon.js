/**
 * Rabbit Ear (c) Kraft
 */
import { boundingBox } from "./boundary.js";
import { distance } from "../math/vector.js";

/**
 * @description We ignore any segment lengths which are smaller than 1e-4,
 * assuming that these are errors, circular edges, etc...
 * @param {FOLD} graph a FOLD object
 * @returns {number} the length of the shortest edge in the graph
 */
export const shortestEdgeLength = ({ vertices_coords, edges_vertices }) => {
	const lengths = edges_vertices
		.map((ev) => ev.map((v) => vertices_coords[v]))
		.map(([a, b]) => distance(a, b))
		.filter((len) => len > 1e-4);
	const minLen = lengths.reduce((a, b) => Math.min(a, b), Infinity);
	return minLen === Infinity ? undefined : minLen;
};

/**
 * @description Epsilon will be based on a factor of the edge lengths
 * and a factor of the size of the total crease pattern, whichever is
 * smaller
 * @param {FOLD} graph a FOLD object
 * @returns {number} a suitable epsilon
 */
export const getEpsilon = ({ vertices_coords, edges_vertices }) => {
	const shortest = shortestEdgeLength({ vertices_coords, edges_vertices });
	const bounds = boundingBox({ vertices_coords });
	const graphSpan = bounds && bounds.span ? Math.max(...bounds.span) : 1;
	const spanScale = graphSpan * 1e-2;
	const edgeScale = shortest / 20;
	return shortest === undefined ? spanScale : Math.min(spanScale, edgeScale);
};

// currently used by the layer solver, it's so similar to the other method,
// we need to deprecate this method in favor of the other.
export const makeEpsilon = ({ vertices_coords, edges_vertices }) => {
	const shortest = shortestEdgeLength({ vertices_coords, edges_vertices });
	if (shortest) {
		return Math.max(shortest * 1e-4, 1e-10);
	}
	const bounds = boundingBox({ vertices_coords });
	return bounds && bounds.span ? Math.max(1e-6 * Math.max(...bounds.span), 1e-10) : 1e-6;
};
