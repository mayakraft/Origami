/**
 * Rabbit Ear (c) Kraft
 */
import { makeEdgesIsFolded, edgesFoldAngleAreAllFlat } from "../../fold/spec.js";
import {
	normalize2,
	dot,
	scale2,
	add2,
	subtract2,
	rotate270,
	rotate90,
	resize2,
	resize3,
} from "../../math/vector.js";
import { identity2x3, multiplyMatrix2Vector2 } from "../../math/matrix2.js";
import { identity3x4, multiplyMatrix3Vector3 } from "../../math/matrix3.js";
import { makeVerticesFaces } from "../make/verticesFaces.js";
import { makeVerticesToEdge } from "../make/lookup.js";
import { makeFacesFaces } from "../make/facesFaces.js";
import { minimumSpanningTrees } from "../trees.js";
import { makeFacesMatrix, facesSharedEdgesVertices } from "../faces/matrix.js";

/**
 * @description Fold a graph along its edges and return the position
 * of the folded vertices. This method works in both 2D and 3D
 * unassigned edges are treated as flat fold (mountain/valley 180deg)
 * as a way of (assuming the user is giving a flat folded origami), help
 * solve things about an origami that is currently being figured out.
 * @param {FOLDExtended} graph a FOLD object
 * @param {number[]} [rootFaces=[]] the index of the face that will remain in place
 * @returns {[number, number, number][]} a new set of `vertices_coords` with the new positions.
 */
export const makeVerticesCoords3DFolded = (
	{
		vertices_coords,
		vertices_faces,
		edges_vertices,
		edges_foldAngle,
		edges_assignment,
		faces_vertices,
		faces_faces,
		faces_matrix,
	},
	rootFaces,
) => {
	if (!vertices_coords || !vertices_coords.length) {
		return [];
	}
	if (!faces_vertices || !faces_vertices.length) {
		return vertices_coords.map(resize3);
	}
	faces_matrix = makeFacesMatrix(
		{
			vertices_coords,
			edges_vertices,
			edges_foldAngle,
			edges_assignment,
			faces_vertices,
			faces_faces,
		},
		rootFaces,
	);
	if (!vertices_faces) {
		vertices_faces = makeVerticesFaces({ faces_vertices });
	}

	// assign one matrix to every vertex from faces, identity matrix if none exist
	const vertices_matrix = vertices_faces
		.map((faces) => faces.find((f) => f != null))
		.map((face) => (face === undefined ? [...identity3x4] : faces_matrix[face]));
	return vertices_coords
		.map(resize3)
		.map((coord, i) => multiplyMatrix3Vector3(vertices_matrix[i], coord));
};

/**
 * @description Fold a graph along its edges and return the position of the folded
 * vertices. this method works for 2D only (no z value).
 * if an edges_assignment is "U", assumed to be folded ("V" or "M").
 * Finally, if no edge foldAngle or assignments exist, this method will
 * assume all edges are flat-folded (except boundary) and will fold everything.
 * @param {FOLD} graph a FOLD object
 * @param {number[]} [rootFaces=[]] the index of the face that will remain in place
 * @returns {[number, number][]} a new set of `vertices_coords` with the new positions.
 */
export const makeVerticesCoordsFlatFolded = (
	{
		vertices_coords,
		edges_vertices,
		edges_foldAngle,
		edges_assignment,
		faces_vertices,
		faces_faces,
	},
	rootFaces = [],
) => {
	if (!vertices_coords || !vertices_coords.length) {
		return [];
	}
	if (!faces_vertices || !faces_vertices.length) {
		return vertices_coords.map(resize2);
	}
	if (!faces_faces) {
		faces_faces = makeFacesFaces({ faces_vertices });
	}
	const edges_isFolded = makeEdgesIsFolded({
		edges_vertices,
		edges_foldAngle,
		edges_assignment,
	});
	const vertices_coordsFolded = [];
	const faces_flipped = [];
	const edgesMap = makeVerticesToEdge({ edges_vertices });

	// if the graph is disjoint, make sure we fold all disjoint sets,
	// each set chooses a starting face (first set is decided by rootFaces),
	// ensure this exists, then set all of its vertices to "no change".
	minimumSpanningTrees(faces_faces, rootFaces).forEach((tree) => {
		const rootRow = tree.shift();
		if (!rootRow || !rootRow.length) {
			return;
		}
		// root tree item is the first item in the first row (only item in the row)
		const root = rootRow[0];
		// set this root face's initial conditions.
		faces_flipped[root.index] = false;
		faces_vertices[root.index].forEach((v) => {
			vertices_coordsFolded[v] = [...vertices_coords[v]];
		});
		tree.forEach((level) =>
			level.forEach((entry) => {
				// coordinates and vectors of the reflecting edge
				const edgeKey = facesSharedEdgesVertices(
					faces_vertices[entry.index],
					faces_vertices[entry.parent],
				)
					.shift()
					.join(" ");
				const edge = edgesMap[edgeKey];
				// build a basis axis using the folding edge, normalized.
				const coords = edges_vertices[edge].map((v) => vertices_coordsFolded[v]);
				if (coords[0] === undefined || coords[1] === undefined) {
					return;
				}
				const coords_cp = edges_vertices[edge].map((v) => vertices_coords[v]);
				// the basis axis origin, x-basis axis (vector) and y-basis (normal)
				const origin_cp = coords_cp[0];
				const vector_cp = normalize2(subtract2(coords_cp[1], coords_cp[0]));
				const normal_cp = rotate90(vector_cp);
				// if we are crossing a flipping edge (m/v), set this face to be
				// flipped opposite of the parent face. otherwise keep it the same.
				faces_flipped[entry.index] = edges_isFolded[edge]
					? !faces_flipped[entry.parent]
					: faces_flipped[entry.parent];
				const vector_folded = normalize2(subtract2(coords[1], coords[0]));
				const origin_folded = coords[0];
				const normal_folded = faces_flipped[entry.index]
					? rotate270(vector_folded)
					: rotate90(vector_folded);
				// remaining_faces_vertices
				faces_vertices[entry.index]
					.filter((v) => vertices_coordsFolded[v] === undefined)
					.forEach((v) => {
						const to_point = subtract2(vertices_coords[v], origin_cp);
						const project_norm = dot(to_point, normal_cp);
						const project_line = dot(to_point, vector_cp);
						const walk_up = scale2(vector_folded, project_line);
						const walk_perp = scale2(normal_folded, project_norm);
						const folded_coords = add2(add2(origin_folded, walk_up), walk_perp);
						vertices_coordsFolded[v] = folded_coords;
					});
			}),
		);
	});
	return vertices_coordsFolded;
};

/**
 * @description Fold a graph along its edges and return the position of the folded
 * vertices. This method will fold vertices in either 2D or 3D.
 * If an edges_assignment is "U", assumed to be folded ("V" or "M").
 * Finally, if no edge foldAngle or assignments exist, this method will
 * assume all edges are flat-folded (except boundary) and will fold everything.
 * @param {FOLD} graph a FOLD object
 * @param {number[]} [rootFaces=[]] the indices of the faces that will remain in place
 * @returns {[number, number][]|[number, number, number][]} a new set of
 * `vertices_coords` with the new positions.
 */
export const makeVerticesCoordsFolded = (graph, rootFaces) =>
	edgesFoldAngleAreAllFlat(graph)
		? makeVerticesCoordsFlatFolded(graph, rootFaces)
		: makeVerticesCoords3DFolded(graph, rootFaces);

/**
 *
 */
// const makeVerticesCoordsUnfolded = ({
// 	vertices_coords, vertices_faces, edges_vertices, edges_foldAngle,
// 	edges_assignment, faces_vertices, faces_faces, faces_matrix,
// }) => {};

/**
 * @description Given a FOLD object and a set of 2x3 matrices, one per face,
 * "fold" the vertices by finding one matrix per vertex and multiplying them.
 * @param {FOLD} graph a FOLD object with vertices_coords, faces_vertices, and
 * if vertices_faces does not exist it will be built.
 * @param {number[][]} faces_matrix an array of 2x3 matrices. one per face.
 * @returns {[number, number][]} a new set of vertices_coords, transformed.
 */
export const makeVerticesCoordsFoldedFromMatrix2 = (
	{ vertices_coords, vertices_faces, faces_vertices },
	faces_matrix,
) => {
	if (!vertices_faces) {
		vertices_faces = makeVerticesFaces({ faces_vertices });
	}

	// get the first face in each vertex's adjacent faces list. the null filtering
	// is important, this check removes undefined and null, null often arises when
	// importing a FOLD object from a FOLD file with JSON decoding.
	const vertices_face = vertices_faces.map((faces) => faces.find((f) => f != null));

	const vertices_matrix = vertices_face.map((face) =>
		face === undefined ? identity2x3 : faces_matrix[face],
	);

	return vertices_coords
		.map(resize2)
		.map((point, i) => multiplyMatrix2Vector2(vertices_matrix[i], point));
};
