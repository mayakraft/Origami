/**
 * Rabbit Ear (c) Kraft
 */
import { subtract2, subtract3, distance, resize } from "../math/vector.js";
import { nearestPointOnLine } from "../math/nearest.js";
import { arrayMinimumIndex } from "../general/array.js";
import { clampSegment } from "../math/line.js";
import { getDimensionQuick } from "../fold/spec.js";
import { makeFacesCenterQuick } from "./make/faces.js";
import { getFaceUnderPoint } from "./overlap.js";

/**
 * @description Iterate through all vertices in a graph and find the one nearest to a
 * provided point. This is the only of the "nearest" graph operations that works in 3D.
 * @param {FOLD} graph a FOLD object
 * @param {number[]} point the point to find the nearest vertex
 * @returns {number} the index of the nearest vertex
 * @todo improve with space partitioning
 */
export const nearestVertex = ({ vertices_coords }, point) => {
	if (!vertices_coords) {
		return undefined;
	}
	const dimension = getDimensionQuick({ vertices_coords });
	if (dimension === undefined) {
		return undefined;
	}
	// resize our point to be the same dimension as the first vertex
	const p = resize(dimension, point);
	// sort by distance, hold onto the original index in vertices_coords
	const nearest = vertices_coords
		.map((v, i) => ({ d: distance(p, v), i }))
		.sort((a, b) => a.d - b.d)
		.shift();
	// return index, not vertex
	return nearest ? nearest.i : undefined;
};

const nearestPoints2 = ({ vertices_coords, edges_vertices }, point) =>
	edges_vertices
		.map((e) => e.map((ev) => vertices_coords[ev]))
		.map((e) =>
			nearestPointOnLine(
				{ vector: subtract2(e[1], e[0]), origin: e[0] },
				point,
				clampSegment,
			),
		);

const nearestPoints3 = ({ vertices_coords, edges_vertices }, point) =>
	edges_vertices
		.map((e) => e.map((ev) => vertices_coords[ev]))
		.map((e) =>
			nearestPointOnLine(
				{ vector: subtract3(e[1], e[0]), origin: e[0] },
				point,
				clampSegment,
			),
		);

/**
 * @description Iterate through all edges in a graph and find the one nearest to a provided point.
 * @param {FOLD} graph a FOLD object
 * @param {number[]} point the point to find the nearest edge
 * @returns {number|undefined} the index of the nearest edge, or undefined
 * if there are no vertices_coords or edges_vertices
 */
export const nearestEdge = ({ vertices_coords, edges_vertices }, point) => {
	if (!vertices_coords || !edges_vertices) {
		return undefined;
	}
	const nearest_points =
		getDimensionQuick({ vertices_coords }) === 2
			? nearestPoints2({ vertices_coords, edges_vertices }, point)
			: nearestPoints3({ vertices_coords, edges_vertices }, point);
	return arrayMinimumIndex(nearest_points, (p) => distance(p, point));
};

/**
 * @description Iterate through all faces in a graph and find one nearest to a point.
 * This method assumes the graph is in 2D, it ignores any z components.
 * @param {FOLD} graph a FOLD object
 * @param {[number, number]} point the point to find the nearest face
 * @returns {number|undefined} the index of the face, or undefined if edges_faces is not defined.
 * @todo make this work if edges_faces is not defined (not hard)
 */
export const nearestFace = (graph, point) => {
	const face = getFaceUnderPoint(graph, point);
	if (face !== undefined) {
		return face;
	}
	if (graph.edges_faces) {
		const edge = nearestEdge(graph, point);
		if (edge === undefined) {
			return undefined;
		}
		const faces = graph.edges_faces[edge];
		if (faces.length === 1) {
			return faces[0];
		}
		if (faces.length > 1) {
			const faces_center = makeFacesCenterQuick({
				vertices_coords: graph.vertices_coords,
				faces_vertices: faces.map((f) => graph.faces_vertices[f]),
			});
			const distances = faces_center.map((center) => distance(center, point));
			let shortest = 0;
			for (let i = 0; i < distances.length; i += 1) {
				if (distances[i] < distances[shortest]) {
					shortest = i;
				}
			}
			return faces[shortest];
		}
	}
	return undefined;
};
