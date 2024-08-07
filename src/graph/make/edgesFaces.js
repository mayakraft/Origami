/**
 * Rabbit Ear (c) Kraft
 */
import { subtract2, cross2 } from "../../math/vector.js";
import { countImpliedEdges } from "../count.js";
import { makeFacesVerticesFromEdges } from "./facesVertices.js";
import { makeFacesEdgesFromVertices } from "./facesEdges.js";
import { makeEdgesVector } from "./edges.js";
import { makeFacesCenterQuick } from "./faces.js";

/**
 * @description Make `edges_faces` where each edge is paired with its incident faces.
 * This is unsorted, prefer makeEdgesFaces()
 * @param {FOLD} graph a FOLD object, with entries edges_vertices, faces_edges
 * @returns {(number | null | undefined)[][]} each entry relates
 * to an edge, each array contains indices
 * of adjacent faces.
 */
export const makeEdgesFacesUnsorted = ({
	edges_vertices,
	faces_vertices,
	faces_edges,
}) => {
	// faces_vertices is only needed to build this array, if it doesn't exist.
	if (!faces_edges) {
		faces_edges = makeFacesEdgesFromVertices({ edges_vertices, faces_vertices });
	}
	// instead of initializing the array ahead of time (we would need to know
	// the length of something like edges_vertices)
	const edges_faces =
		edges_vertices !== undefined
			? edges_vertices.map(() => [])
			: Array.from(Array(countImpliedEdges({ faces_edges }))).map(() => []);
	faces_edges.forEach((face, f) => {
		const hash = [];
		// in the case that one face visits the same edge multiple times,
		// this hash acts as a set allowing one occurence of each edge index.
		face.forEach((edge) => {
			hash[edge] = f;
		});
		hash.forEach((fa, e) => edges_faces[e].push(fa));
	});
	return edges_faces;
};

/**
 * @description Make `edges_faces` where each edge is paired with its incident faces.
 * This is sorted according to the FOLD spec, sorting faces on either side of an edge.
 * @param {FOLDExtended} graph a FOLD object, with entries vertices_coords,
 * edges_vertices, faces_vertices, faces_edges
 * @returns {(number | null | undefined)[][]} each entry relates to an edge,
 * each array contains indices of adjacent faces.
 */
export const makeEdgesFaces = ({
	vertices_coords,
	edges_vertices,
	edges_vector,
	faces_vertices,
	faces_edges,
	faces_center,
}) => {
	if (!edges_vertices || (!faces_vertices && !faces_edges)) {
		// alert, we just made UNSORTED edges faces
		return makeEdgesFacesUnsorted({ faces_edges });
	}
	if (!faces_vertices) {
		faces_vertices = makeFacesVerticesFromEdges({ edges_vertices, faces_edges });
	}
	if (!faces_edges) {
		faces_edges = makeFacesEdgesFromVertices({ edges_vertices, faces_vertices });
	}
	if (!edges_vector) {
		edges_vector = makeEdgesVector({ vertices_coords, edges_vertices });
	}
	const edges_origin = edges_vertices.map((pair) => vertices_coords[pair[0]]);
	if (!faces_center) {
		faces_center = makeFacesCenterQuick({ vertices_coords, faces_vertices });
	}
	const edges_faces = edges_vertices.map(() => []);
	faces_edges.forEach((face, f) => {
		const hash = [];
		// in the case that one face visits the same edge multiple times,
		// this hash acts as a set allowing one occurence of each edge index.
		face.forEach((edge) => {
			hash[edge] = f;
		});
		hash.forEach((fa, e) => edges_faces[e].push(fa));
	});
	// sort edges_faces in 2D based on which side of the edge's vector
	// each face lies, sorting the face on the left first. see FOLD spec.
	edges_faces.forEach((faces, e) => {
		const faces_cross = faces
			.map((f) => faces_center[f])
			.map((center) => subtract2(center, edges_origin[e]))
			.map((vector) => cross2(vector, edges_vector[e]));
		faces.sort((a, b) => faces_cross[a] - faces_cross[b]);
	});
	return edges_faces;
};
