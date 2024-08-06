/**
 * Rabbit Ear (c) Kraft
 */
import { subtract, magnitude, resize2, resize3 } from "../../math/vector.js";
import { boundingBox } from "../../math/polygon.js";
import { getDimensionQuick } from "../../fold/spec.js";

/**
 * @description map vertices_coords onto edges_vertices so that the result
 * is an edge array where each edge contains its two points. Each point being
 * the 2D or 3D coordinate as an array of numbers.
 * @param {FOLD} graph a FOLD object with vertices and edges
 * @returns {[([number, number]|[number, number, number]),
 * ([number, number]|[number, number, number])][]} an array
 * of array of points
 * (which are arrays of numbers)
 */
export const makeEdgesCoords = ({ vertices_coords, edges_vertices }) =>
	edges_vertices.map((ev) => [vertices_coords[ev[0]], vertices_coords[ev[1]]]);

/**
 * @description Turn every edge into a vector, basing the direction on the order of
 * the pair of vertices in each edges_vertices entry.
 * @param {FOLD} graph a FOLD object, with vertices_coords, edges_vertices
 * @returns {([number, number]|[number, number, number])[]} each entry
 * relates to an edge, each array contains a 2D vector
 */
export const makeEdgesVector = ({ vertices_coords, edges_vertices }) => {
	const dimensions = getDimensionQuick({ vertices_coords });
	const resize = dimensions === 2 ? resize2 : resize3;
	return makeEdgesCoords({ vertices_coords, edges_vertices }).map(([a, b]) =>
		resize(subtract(b, a)),
	);
};

/**
 * @description For every edge, find the length between the edges pair of vertices.
 * @param {FOLD} graph a FOLD object, with vertices_coords, edges_vertices
 * @returns {number[]} the distance between each edge's pair of vertices
 */
export const makeEdgesLength = ({ vertices_coords, edges_vertices }) =>
	makeEdgesVector({ vertices_coords, edges_vertices }).map(magnitude);

/**
 * @description Make an array of axis-aligned bounding boxes, one for each edge,
 * that encloses the edge, and will work in n-dimensions. Intended for
 * fast line-sweep algorithms.
 * @param {FOLD} graph a FOLD object with vertices and edges.
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {Box[]} an array of boxes, length matching the number of edges
 */
export const makeEdgesBoundingBox = ({ vertices_coords, edges_vertices }, epsilon) =>
	makeEdgesCoords({ vertices_coords, edges_vertices }).map((coords) =>
		boundingBox(coords, epsilon),
	);
