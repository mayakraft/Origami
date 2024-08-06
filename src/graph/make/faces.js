/**
 * Rabbit Ear (c) Kraft
 */
import { getDimensionQuick } from "../../fold/spec.js";
import { makePolygonNonCollinear, centroid } from "../../math/polygon.js";
import { average2, average3, resize2, resize3 } from "../../math/vector.js";
import { walkPlanarFaces, filterWalkedBoundaryFace } from "../walk.js";
import { makeVerticesVertices } from "./verticesVertices.js";
import { makeVerticesSectors } from "./vertices.js";
import { makeVerticesToEdge } from "./lookup.js";

/**
 * @description Rebuild all faces in a 2D planar graph by walking counter-clockwise
 * down every edge (both ways). This does not include the outside face which winds
 * around the boundary backwards enclosing the outside space.
 * @param {FOLDExtended} graph a FOLD object
 * @returns {{
 *   faces_vertices: number[][],
 *   faces_edges: number[][],
 *   faces_sectors: number[][],
 * }} array of faces as objects containing "vertices", "edges", and "sectors"
 * @example
 * // to convert the return object into faces_vertices and faces_edges
 * const { faces_vertices, faces_edges } = makePlanarFaces(graph);
 */
export const makePlanarFaces = ({
	vertices_coords,
	vertices_vertices,
	vertices_edges,
	vertices_sectors,
	edges_vertices,
	edges_vector,
}) => {
	if (!vertices_vertices) {
		vertices_vertices = makeVerticesVertices({
			vertices_coords,
			edges_vertices,
			vertices_edges,
		});
	}
	if (!vertices_sectors) {
		vertices_sectors = makeVerticesSectors({
			vertices_coords,
			vertices_vertices,
			edges_vertices,
			edges_vector,
		});
	}
	const vertices_edges_map = makeVerticesToEdge({ edges_vertices });
	// removes the one face that outlines the piece with opposite winding.
	// walkPlanarFaces stores edges as vertex pair strings, "4 9",
	// convert these into edge indices
	const res = filterWalkedBoundaryFace(
		walkPlanarFaces({
			vertices_vertices,
			vertices_sectors,
		}),
	).map((f) => ({ ...f, edges: f.edges.map((e) => vertices_edges_map[e]) }));
	return {
		faces_vertices: res.map((el) => el.vertices),
		faces_edges: res.map((el) => el.edges),
		faces_sectors: res.map((el) => el.angles),
	};
};

// export const makePlanarFacesVertices = graph => makePlanarFaces(graph)
// 	.faces_vertices;
// export const makePlanarFacesEdges = graph => makePlanarFaces(graph)
// 	.faces_edges;

/**
 * @description map vertices_coords onto each face's set of vertices,
 * turning each face into an array of points, with an additional step:
 * ensure that each polygon has 0 collinear vertices.
 * this can result in a polygon with fewer vertices than is contained
 * in that polygon's faces_vertices array.
 * @param {FOLD} graph a FOLD object, with vertices_coords, faces_vertices
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {([number, number] | [number, number, number])[][]} an array
 * of array of points, where each point is an array of 2 or 3 numbers
 */
export const makeFacesPolygon = ({ vertices_coords, faces_vertices }, epsilon) =>
	faces_vertices
		.map((verts) => verts.map((v) => vertices_coords[v]))
		.map((polygon) => makePolygonNonCollinear(polygon, epsilon));

/**
 * @description map vertices_coords onto each face's set of vertices,
 * turning each face into an array of points. "Quick" meaning collinear vertices
 * are not removed, which in some cases, this will be the preferred method.
 * @param {FOLD} graph a FOLD object, with vertices_coords, faces_vertices
 * @returns {([number, number] | [number, number, number])[][]} an
 * array of array of points, where each point is an array of numbers
 */
export const makeFacesPolygonQuick = ({ vertices_coords, faces_vertices }) =>
	faces_vertices.map((verts) => verts.map((v) => vertices_coords[v]));

/**
 * @description For every face, get the face's centroid.
 * @param {FOLD} graph a FOLD object, with vertices_coords, faces_vertices
 * @returns {[number, number][]} array of points, where each point is an array of numbers
 */
export const makeFacesCentroid2D = ({ vertices_coords, faces_vertices }) =>
	faces_vertices
		.map((fv) => fv.map((v) => vertices_coords[v]))
		.map((coords) => coords.map(resize2))
		.map((coords) => centroid(coords));

/**
 * @description For every face, get the average of the face's vertices.
 * This is not not precise, and only relevant for faces which are convex.
 * @param {FOLD} graph a FOLD object, with vertices_coords, faces_vertices
 * @returns {[number, number][]} array of points, where each point is an array of numbers
 */
export const makeFacesCenter2DQuick = ({ vertices_coords, faces_vertices }) =>
	makeFacesPolygonQuick({ vertices_coords, faces_vertices })
		.map((coords) => coords.map(resize2))
		.map((coords) => average2(...coords));

/**
 * @description For every face, get the average of the face's vertices.
 * This is not not precise, and only relevant for faces which are convex.
 * @param {FOLD} graph a FOLD object, with vertices_coords, faces_vertices
 * @returns {[number, number, number][]} array of points, where each point is an array of numbers
 */
export const makeFacesCenter3DQuick = ({ vertices_coords, faces_vertices }) =>
	makeFacesPolygonQuick({ vertices_coords, faces_vertices })
		.map((coords) => coords.map(resize3))
		.map((coords) => average3(...coords))
		// assume vertices_coords is 3D, if not, center point[2] will be NaN, fix it
		.map((point) => (Number.isNaN(point[2]) ? [point[0], point[1], 0] : point));

/**
 * @description For every face, get the average of the face's vertices.
 * This is not not precise, and only relevant for faces which are convex.
 * @param {FOLD} graph a FOLD object, with vertices_coords, faces_vertices
 * @returns {[number, number][]|[number, number, number][]} array of points,
 * where each point is an array of either 2 or 3 numbers.
 */
export const makeFacesCenterQuick = ({ vertices_coords, faces_vertices }) => {
	const dimensions = getDimensionQuick({ vertices_coords });
	return dimensions === 2
		? makeFacesCenter2DQuick({ vertices_coords, faces_vertices })
		: makeFacesCenter3DQuick({ vertices_coords, faces_vertices });
};
