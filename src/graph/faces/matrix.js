/**
 * Rabbit Ear (c) Kraft
 */
import { makeEdgesIsFolded } from "../../fold/spec.js";
import { subtract2, subtract3, resize2, resize3 } from "../../math/vector.js";
import {
	identity2x3,
	makeMatrix2Reflect,
	multiplyMatrices2,
} from "../../math/matrix2.js";
import { identity3x4, makeMatrix3Rotate, multiplyMatrices3 } from "../../math/matrix3.js";
import { makeVerticesToEdge } from "../make/lookup.js";
import { makeEdgesFoldAngle } from "../make/edgesFoldAngle.js";
import { makeEdgesAssignmentSimple } from "../make/edgesAssignment.js";
import { makeFacesFaces } from "../make/facesFaces.js";
import { rotateCircularArray } from "../../general/array.js";
import { minimumSpanningTrees } from "../trees.js";

/**
 * @description Given two lists of vertices intended to represent adjacent
 * faces, find the shared vertices between the two. This method is strict
 * about maintaining winding order with the first list, and will return
 * the list of vertices as a list of pairs of vertices, where for each pair,
 * these vertices appear next to each other in the face.
 * This ensures that "vertices in common" list can be easily remapped to
 * "edges in common", via these pairs of vertices.
 * @param {number[]} verticesA a list of vertices comprising a face
 * @param {number[]} verticesB a list of vertices comprising a face
 * @returns {number[][]} a list of pairs of vertices, where each pair are
 * adjacent vertices from the first "verticesA", maintaining winding order.
 */
export const facesSharedEdgesVertices = (verticesA, verticesB) => {
	const hash = {};
	verticesB.forEach((v) => {
		hash[v] = true;
	});
	const inCommon = verticesA.map((v) => (hash[v] ? v : undefined));
	return rotateCircularArray(inCommon, inCommon.indexOf(undefined))
		.map((v, i, arr) => [v, arr[(i + 1) % arr.length]])
		.filter((pair) => pair[0] !== undefined && pair[1] !== undefined);
};

const unassigned_angle = { U: true, u: true };

/**
 * @description Create one transformation matrix for every face which
 * represents the transformation of the face AFTER the graph has been folded
 * along all of the creases (this works in 3D too).
 * This traverses a face-adjacency tree (edge-adjacent faces) and
 * recursively applies the affine transform that represents a fold
 * across the edge between the faces. "flat" creases are ignored.
 * @param {FOLD} graph a FOLD object
 * @param {number[]} [rootFaces=[]] the index of the face that will remain in place
 * @returns {number[][]} for every face, a 3x4 matrix (an array of 12 numbers).
 */
export const makeFacesMatrix = (
	{
		vertices_coords,
		edges_vertices,
		edges_foldAngle,
		edges_assignment,
		faces_vertices,
		faces_faces,
	},
	rootFaces,
) => {
	if (!edges_assignment && edges_foldAngle) {
		edges_assignment = makeEdgesAssignmentSimple({ edges_foldAngle });
	}
	if (!edges_foldAngle) {
		if (edges_assignment) {
			edges_foldAngle = makeEdgesFoldAngle({ edges_assignment });
		} else {
			// if no edges_foldAngle data exists, everyone gets identity matrix
			edges_foldAngle = Array(edges_vertices.length).fill(0);
		}
	}
	if (!faces_faces) {
		faces_faces = makeFacesFaces({ faces_vertices });
	}
	const edge_map = makeVerticesToEdge({ edges_vertices });
	const faces_matrix = faces_vertices.map(() => [...identity3x4]);
	minimumSpanningTrees(faces_faces, rootFaces).forEach((tree) =>
		tree
			.slice(1) // remove the first level, it has no parent face
			.forEach((level) =>
				level.forEach((entry) => {
					const edge_vertices = facesSharedEdgesVertices(
						faces_vertices[entry.index],
						faces_vertices[entry.parent],
					).shift();
					const coords = edge_vertices.map((v) => vertices_coords[v]).map(resize3);
					const edgeKey = edge_vertices.join(" ");
					const edge = edge_map[edgeKey];
					// if the assignment is unassigned, assume it is a flat fold.
					const foldAngle = unassigned_angle[edges_assignment[edge]]
						? Math.PI
						: (edges_foldAngle[edge] * Math.PI) / 180;
					const local_matrix = makeMatrix3Rotate(
						foldAngle, // rotation angle
						subtract3(coords[1], coords[0]), // line-vector
						coords[0], // line-origin
					);
					faces_matrix[entry.index] = multiplyMatrices3(
						faces_matrix[entry.parent],
						local_matrix,
					);
					// to build the inverse matrix, switch these two parameters
					// .multiplyMatrices3(local_matrix, faces_matrix[entry.parent]);
				}),
			),
	);
	return faces_matrix;
};

/**
 * @description Create one transformation matrix for every face which
 * represents the transformation of the face AFTER the graph has been folded
 * along all of the creases.
 * This ignores any 3D data, and treats all creases as flat-folded.
 * This will generate a 2D matrix for every face by virtually folding the graph
 * at every edge according to the assignment or foldAngle.
 * @param {FOLD} graph a FOLD object
 * @param {number[]} [rootFaces=[]] the index of the face that will remain in place
 * @returns {number[][]} for every face, a 2x3 matrix (an array of 6 numbers).
 */
export const makeFacesMatrix2 = (
	{
		vertices_coords,
		edges_vertices,
		edges_foldAngle,
		edges_assignment,
		faces_vertices,
		faces_faces,
	},
	rootFaces,
) => {
	if (!edges_foldAngle) {
		if (edges_assignment) {
			edges_foldAngle = makeEdgesFoldAngle({ edges_assignment });
		} else {
			// if no edges_foldAngle data exists, everyone gets identity matrix
			edges_foldAngle = Array(edges_vertices.length).fill(0);
		}
	}
	if (!faces_faces) {
		faces_faces = makeFacesFaces({ faces_vertices });
	}

	// However, if there is no edges_assignments, and we have to use edges_foldAngle,
	// the "unassigned" trick will no longer work, only +/- non zero numbers get
	// counted as folded edges (true).
	// For this reason, treating "unassigned" as a folded edge, this method's
	// functionality is better considered to be specific to makeFacesMatrix2,
	// instead of a generalized method.
	const edges_is_folded = makeEdgesIsFolded({
		edges_vertices,
		edges_foldAngle,
		edges_assignment,
	});
	const edge_map = makeVerticesToEdge({ edges_vertices });
	const faces_matrix = faces_vertices.map(() => identity2x3);
	minimumSpanningTrees(faces_faces, rootFaces).forEach((tree) =>
		tree
			.slice(1) // remove the first level, it has no parent face
			.forEach((level) =>
				level.forEach((entry) => {
					const edge_vertices = facesSharedEdgesVertices(
						faces_vertices[entry.index],
						faces_vertices[entry.parent],
					).shift();
					// const edge_vertices = chooseTwoPairs(arrayIntersection(
					// 	faces_vertices[entry.index],
					// 	faces_vertices[entry.parent],
					// )).find(pair => edge_map[pair.join(" ")] !== undefined)
					const coords = edge_vertices.map((v) => vertices_coords[v]);
					const edgeKey = edge_vertices.join(" ");
					const edge = edge_map[edgeKey];
					const reflect_vector = subtract2(coords[1], coords[0]);
					const reflect_origin = resize2(coords[0]);
					const local_matrix = edges_is_folded[edge]
						? makeMatrix2Reflect(reflect_vector, reflect_origin)
						: identity2x3;
					faces_matrix[entry.index] = multiplyMatrices2(
						faces_matrix[entry.parent],
						local_matrix,
					);
					// to build the inverse matrix, switch these two parameters
					// .multiplyMatrices2(local_matrix, faces_matrix[entry.parent]);
				}),
			),
	);
	return faces_matrix;
};
