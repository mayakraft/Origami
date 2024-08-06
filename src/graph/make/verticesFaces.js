/**
 * Rabbit Ear (c) Kraft
 */
import { countImpliedVertices } from "../count.js";
import { makeVerticesToFace } from "./lookup.js";

/**
 * @description Make `vertices_faces` **not sorted** counter-clockwise,
 * which should be used sparingly. Prefer makeVerticesFaces().
 * @param {FOLD} graph a FOLD object, containing vertices_coords, faces_vertices
 * @returns {(number | null | undefined)[][]} array of array of numbers,
 * where each row corresponds to a vertex index
 * and the values in the inner array are face indices.
 */
export const makeVerticesFacesUnsorted = ({
	vertices_coords,
	vertices_edges,
	faces_vertices,
}) => {
	const vertArray = vertices_coords || vertices_edges;
	if (!faces_vertices) {
		return (vertArray || []).map(() => []);
	}
	// instead of initializing the array ahead of time (we would need to know
	// the length of something like vertices_coords or vertices_edges)
	const vertices_faces =
		vertArray !== undefined
			? vertArray.map(() => [])
			: Array.from(Array(countImpliedVertices({ faces_vertices }))).map(() => []);
	// iterate over every face, then iterate over each of the face's vertices
	faces_vertices.forEach((face, f) => {
		// in the case that one face visits the same vertex multiple times,
		// this hash acts as an intermediary, basically functioning like a set,
		// and only allow one occurence of each vertex index.
		const hash = [];
		face.forEach((vertex) => {
			hash[vertex] = f;
		});
		hash.forEach((fa, v) => vertices_faces[v].push(fa));
	});
	return vertices_faces;
};

/**
 * @description Make `vertices_faces` sorted counter-clockwise.
 * @param {FOLD} graph a FOLD object, containing vertices_coords, vertices_vertices, faces_vertices
 * @returns {(number | null | undefined)[][]} array of array of numbers,
 * where each row corresponds to a vertex index
 * and the values in the inner array are face indices.
 */
export const makeVerticesFaces = ({
	vertices_coords,
	vertices_vertices,
	faces_vertices,
}) => {
	if (!faces_vertices) {
		return vertices_coords.map(() => []);
	}
	if (!vertices_vertices) {
		return makeVerticesFacesUnsorted({ vertices_coords, faces_vertices });
	}
	const face_map = makeVerticesToFace({ faces_vertices });
	return vertices_vertices
		.map((verts, v) => verts.map((vert) => [v, vert].join(" ")))
		.map((keys) =>
			keys
				// .filter(key => face_map[key] !== undefined) // removed. read below.
				.map((key) => face_map[key]),
		);
};

// this method used to contain a filter to remove "undefined",
// because in the case of a boundary vertex of a closed polygon shape, there
// is no face that winds backwards around the piece and encloses infinity.
// unfortunately, this disconnects the index match with vertices_vertices.
