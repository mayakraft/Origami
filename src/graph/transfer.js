/**
 * Rabbit Ear (c) Kraft
 */
import { distance2, resize2 } from "../math/vector.js";
import { collinearPoints } from "../math/line.js";
import { trilateration2 } from "../math/triangle.js";

/**
 * @description Transfer a point from one graph to another, given the
 * two graphs are isomorphic, but contain different vertices coords.
 * Supply a face index which contains the point and the new point's
 * coordinates will be calculated via. trilateration.
 * @param {FOLD} from a fold graph which the point now lies inside
 * @param {FOLD} to a fold graph we want to move the point into
 * @param {number} face the index of the face which contains this point
 * @param {[number, number]} point the point, as it exists inside the "from" graph
 * @returns {[number, number]} a new point
 */
export const transferPointInFaceBetweenGraphs = (from, to, face, point) => {
	// Assuming the graphs are isomorphic except for the vertices_coords,
	// we have to account for the possibility that vertices_coords might have
	// invalid references or non existent coordinate data.

	// Filter out any vertices which have non existent coords or are collinear.
	const faceVerticesInitial = to.faces_vertices[face].filter(
		(v) => from.vertices_coords[v] && to.vertices_coords[v],
	);

	// Trilateration will fail if the three chosen vertices are collinear.
	// For every vertex, check collinearity between prev-this-next vertex.
	const faceVertsInitialCollinear = faceVerticesInitial
		.map((v, i, arr) => [
			arr[(i + arr.length - 1) % arr.length],
			v,
			arr[(i + 1) % arr.length],
		])
		.map((verts) => {
			const [a, b, c] = verts.map((v) => from.vertices_coords[v]);
			const [d, e, f] = verts.map((v) => to.vertices_coords[v]);
			return [a, b, c, d, e, f];
		})
		.map(([a, b, c, d, e, f]) => collinearPoints(a, b, c) || collinearPoints(d, e, f));

	// we want only vertices which are not collinear
	const faceVertsValid = faceVerticesInitial.filter(
		(_, i) => !faceVertsInitialCollinear[i],
	);

	if (faceVertsValid.length < 3) {
		return undefined;
	}
	// const faceVertices = resize3(faceVertsValid);
	const [a, b, c] = faceVertsValid;

	/** @type {[[number, number], [number, number], [number, number]]} */
	const toPoly = [
		resize2(to.vertices_coords[a]),
		resize2(to.vertices_coords[b]),
		resize2(to.vertices_coords[c]),
	];

	/** @type {[number, number, number]} */
	const distances = [
		distance2(from.vertices_coords[a], point),
		distance2(from.vertices_coords[b], point),
		distance2(from.vertices_coords[c], point),
	];

	return trilateration2(toPoly, distances);
};
