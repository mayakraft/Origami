/**
 * Rabbit Ear (c) Kraft
 */
import { EPSILON, D2R } from "../math/constant.js";
import {
	identity3x4,
	invertMatrix3,
	makeMatrix3RotateX,
	makeMatrix3RotateZ,
	multiplyMatrices3,
} from "../math/matrix3.js";
import { makeVerticesVertices } from "../graph/make/verticesVertices.js";
import { makeVerticesEdges } from "../graph/make/verticesEdges.js";
import { makeVerticesFaces } from "../graph/make/verticesFaces.js";
import { makeVerticesVerticesVector } from "../graph/make/vertices.js";

/**
 * @description Given a crease pattern, this method will test every vertex
 * to determine if it is possible to be folded by walking around each vertex
 * face by face and checking if we meet back up exactly where we started.
 * This does not test for self-intersection, if the faces of a single vertex
 * pokes through one another, this method may still consider it to be valid.
 * This method supports 3D or 2D foldings.
 * @attribution Implementation of the algorithm described in
 * the origami foldability paper by belcastro-Hull.
 * @param {FOLDExtended} graph a FOLD object with vertices in creasePattern layout
 * @returns {number[]} for every vertex, 0 if the vertex has
 * a valid folded state, or a number indicating the amount of error.
 */
export const verticesFoldability = ({
	vertices_coords,
	vertices_vertices,
	vertices_edges,
	vertices_faces,
	edges_vertices,
	edges_foldAngle,
	edges_vector,
	faces_vertices,
}) => {
	if (!vertices_vertices) {
		// eslint-disable-next-line no-param-reassign
		vertices_vertices = makeVerticesVertices({
			vertices_coords,
			vertices_edges,
			vertices_faces,
			edges_vertices,
			faces_vertices,
		});
	}
	if (!vertices_edges) {
		// eslint-disable-next-line no-param-reassign
		vertices_edges = makeVerticesEdges({ edges_vertices, vertices_vertices });
	}
	if (!vertices_faces) {
		// eslint-disable-next-line no-param-reassign
		vertices_faces = makeVerticesFaces({
			vertices_coords,
			vertices_vertices,
			faces_vertices,
		});
	}
	const vertices_vectors = makeVerticesVerticesVector({
		vertices_coords,
		vertices_vertices,
		vertices_edges,
		vertices_faces,
		edges_vertices,
		edges_vector,
		faces_vertices,
	});

	// for each vertex, create a sequence of matrices which represent the
	// 3D transformations involved in walking around the vertex along the
	// folded faces. If the product of the matrices becomes the identity
	// matrix (we return from where we started), the folding is valid.
	return vertices_coords.map((_, v) => {
		// if the vertex lies along a boundary (missing a face), it's foldable
		if (vertices_faces[v].includes(undefined) || vertices_faces[v].includes(null)) {
			return 0;
		}

		// this vertex's edges as a sorted list of radians of the angle
		// of the edge's vector (not the sector angle or fold angle).
		const edgesAngles = vertices_vectors[v].map((vec) => Math.atan2(vec[1], vec[0]));

		// the vertex's edges' fold angles. in radians
		const edgesFoldAngle = vertices_edges[v]
			.map((e) => edges_foldAngle[e])
			.map((angle) => angle * D2R);

		// for each edge, create two (three) 3D rotation matrices:
		// aM: a rotation around the Z axis which rotates the edge to lie along
		//     the (1, 0, 0) X axis (and it's inverse matrix).
		// fM: a rotation around the X axis which rotates the YZ plane
		//     by the amount of the fold-angle.
		const aM = edgesAngles.map((a) => makeMatrix3RotateZ(a));
		const aiM = aM.map((m) => invertMatrix3(m));
		const fM = edgesFoldAngle.map((a) => makeMatrix3RotateX(a));

		// for each edge, create a single transform that represents the motion
		// from face[i] to face[i+1]. Use the inverse of the XY-plane angle to
		// bring the edge along the X axis, apply the fold angle matrix, then
		// apply the XY-plane transformation to move the X-axis to the edge.
		const localMatrices = vertices_vectors[v].map((__, i) =>
			multiplyMatrices3(aM[i], multiplyMatrices3(fM[i], aiM[i])),
		);

		// walk around the vertex and cumulatively apply each edge's transform,
		// if the vertex is foldable, the matrix will end up back as the identity.
		let matrix = [...identity3x4];
		localMatrices.forEach((m) => {
			matrix = multiplyMatrices3(matrix, m);
		});

		// only check the first 9 elements, we don't care about the translate part.
		return Array.from(Array(9))
			.map((__, i) => Math.abs(matrix[i] - identity3x4[i]))
			.reduce((a, b) => a + b, 0);
	});
};

/**
 * @description Given a crease pattern, this method will test every vertex
 * to determine if it is possible to be folded by walking around each vertex
 * face by face and checking if we meet back up exactly where we started.
 * This does not test for self-intersection, if the faces of a single vertex
 * pokes through one another, this method may still consider it to be valid.
 * This method supports 3D or 2D foldings.
 * @attribution Implementation of the algorithm described in
 * the origami foldability paper by belcastro-Hull.
 * @param {FOLD} graph a FOLD object with vertices in creasePattern layout
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {boolean[]} indices of vertices which have a valid folded state.
 */
export const verticesFoldable = (graph, epsilon = EPSILON) =>
	verticesFoldability(graph).map((deviation) => Math.abs(deviation) < epsilon);

// would be nice if we can use faces_matrix. but this doesn't work
// keeping this around as a reminder. try this again sometime.
// export const VerticesFoldableFirst = derived(
// 	[FrameEdgesAreFlat, VerticesMatrices, VerticesInverseMatrices],
// 	([$FrameEdgesAreFlat, $VerticesMatrices, $VerticesInverseMatrices]) => {
// 		if ($FrameEdgesAreFlat) { return []; }
// 		try {
// 			return $VerticesMatrices.map((matrices, v) => {
// 				if (matrices.includes(undefined)) { return true; }
// 				if (matrices.length < 2) { return true; }
// 				const locals = matrices
// 					.map((_, i, arr) => [i, (i + 1) % arr.length])
// 					.map(([a, b]) => [
// 						$VerticesMatrices[v][b],
// 						$VerticesInverseMatrices[v][a],
// 					])
// 					.map(([m1, m2]) => multiplyMatrices3(m1, m2));
// 				let result = identity3x4;
// 				locals.forEach(m => { result = multiplyMatrices3(m, result); });
// 				// console.log("locals", locals);
// 				// console.log("result", result); // [9], result[10], result[11]);
// 				return Array.from(Array(9))
// 					.map((_, i) => Math.abs(result[i] - identity3x4[i]) < 1e-3)
// 					.reduce((a, b) => a && b, true);
// 			});
// 		} catch (error) {}
// 		return [];
// 	},
// 	[],
// );
