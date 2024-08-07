/**
 * Rabbit Ear (c) Kraft
 */
import { EPSILON } from "../math/constant.js";
import { resize2 } from "../math/vector.js";
import { counterClockwiseSectors2 } from "../math/radial.js";
import { assignmentCanBeFolded, assignmentFlatFoldAngle } from "../fold/spec.js";
import { makeVerticesVertices } from "../graph/make/verticesVertices.js";
import { makeVerticesEdgesUnsorted } from "../graph/make/verticesEdges.js";
import { makeVerticesVerticesVector } from "../graph/make/vertices.js";
import { boundaryVertices } from "../graph/boundary.js";
import { alternatingSum } from "./kawasaki.js";

/**
 * @description Get a list of vertex indices which are not able to be
 * used in Maekawa's and Kawasaki's theorems, where the edges around each
 * vertex have no mountains or valleys, so that all surrounding assignments
 * are either flat, cut, join, or boundary.
 * @param {FOLD} graph a FOLD object
 * @returns {number[]} a list of vertex indices which have no folds.
 */
const getVerticesWithNoFolds = ({ vertices_edges, edges_assignment }) =>
	vertices_edges
		.map((edges) =>
			edges
				.map((e) => !assignmentCanBeFolded[edges_assignment[e]])
				.reduce((a, b) => a && b, true),
		)
		.map((valid, i) => (valid ? i : undefined))
		.filter((a) => a !== undefined);

/**
 * @description using edges_assignment, check if Maekawa's theorem is satisfied
 * for each vertex. This assumes that you are passing in a flat-foldable
 * crease pattern, it assumes that all mountain/valley are flat folded.
 * @param {FOLD} graph a FOLD object
 * @returns {number[]} for every vertex, the number of its edges which violate
 * Maekawa's theorem (0 means that the theorem is satisfied).
 */
export const verticesFlatFoldabilityMaekawa = ({
	edges_vertices,
	vertices_edges,
	edges_assignment,
}) => {
	if (!vertices_edges) {
		// eslint-disable-next-line no-param-reassign
		vertices_edges = makeVerticesEdgesUnsorted({ edges_vertices });
	}
	const verticesValidCount = vertices_edges
		.map((edges) =>
			edges
				.map((e) => assignmentFlatFoldAngle[edges_assignment[e]])
				.filter((a) => a !== 0 && a !== undefined)
				.map(Math.sign)
				.reduce((a, b) => a + b, 0),
		)
		.map((sum) => Math.abs(sum) - 2);

	// set all boundary and flat vertices to be valid
	boundaryVertices({ edges_vertices, edges_assignment }).forEach((v) => {
		verticesValidCount[v] = 0;
	});
	getVerticesWithNoFolds({ vertices_edges, edges_assignment }).forEach((v) => {
		verticesValidCount[v] = 0;
	});

	return verticesValidCount;
};

/**
 * @description For every vertex, check if Kawasaki's theorem is satisfied.
 * The result is in the form of a scalar value, how much the vertex deviates
 * from being satisfied, where a 0 (or near to 0) means the vertex is valid.
 * @param {FOLD} graph a FOLD object
 * @returns {number[]} for every vertex, a deviation value, where a value
 * of near-zero indicates the theorem is satisfied for this vertex, if not,
 * the number will be positive if even-numbered-sectors (sectors including [0])
 * are larger than odd-numbered ones, and negative if visa-versa.
 */
export const verticesFlatFoldabilityKawasaki = ({
	vertices_coords,
	vertices_vertices,
	vertices_edges,
	edges_vertices,
	edges_assignment,
}) => {
	if (!vertices_vertices) {
		// eslint-disable-next-line no-param-reassign
		vertices_vertices = makeVerticesVertices({
			vertices_coords,
			vertices_edges,
			edges_vertices,
		});
	}
	if (!vertices_edges) {
		// eslint-disable-next-line no-param-reassign
		vertices_edges = makeVerticesEdgesUnsorted({ edges_vertices });
	}
	const verticesValidAmount = makeVerticesVerticesVector({
		vertices_coords,
		vertices_vertices,
		edges_vertices,
	})
		.map((vectors, v) =>
			vectors.filter(
				(_, i) => assignmentCanBeFolded[edges_assignment[vertices_edges[v][i]]],
			),
		)
		.map((vectors) => vectors.map(resize2))
		.map((vectors) => (vectors.length > 1 ? counterClockwiseSectors2(vectors) : [0, 0]))
		.map((sectors) => alternatingSum(sectors))
		.map(([a, b]) => a - b);

	// set all boundary and flat vertices to be valid
	boundaryVertices({ edges_vertices, edges_assignment }).forEach((v) => {
		verticesValidAmount[v] = 0;
	});
	getVerticesWithNoFolds({ vertices_edges, edges_assignment }).forEach((v) => {
		verticesValidAmount[v] = 0;
	});

	return verticesValidAmount;
};

/**
 * @description using edges_assignment, check if Maekawa's theorem is satisfied
 * for each vertex. This assumes that you are passing in a flat-foldable
 * crease pattern, it assumes that all mountain/valley are flat folded.
 * @param {FOLD} graph a FOLD object
 * @returns {boolean[]} for every vertex, true if Maekawa's theorm is satisfied
 */
export const verticesFlatFoldableMaekawa = (graph) =>
	verticesFlatFoldabilityMaekawa(graph).map((deviation) => deviation === 0);

/**
 * @description For every vertex in a graph, check if Kawasaki's theorem
 * is satisfied.
 * @param {FOLD} graph a FOLD object
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {boolean[]} for every vertex, is Kawasaki's theorem satisfied?
 */
export const verticesFlatFoldableKawasaki = (graph, epsilon = EPSILON) =>
	verticesFlatFoldabilityKawasaki(graph)
		.map(Math.abs)
		.map((deviation) => deviation < epsilon);

/**
 * @description Perform Kawasaki's and Maekawa's theorem on all vertices,
 * return for every vertex, is either (or both) theorem violated?
 * @param {FOLD} graph a FOLD object
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {number[]} for every vertex, an indicator as to which theorems
 * (if any) have been violated where, 0: no violations, 1: Maekawa only,
 * 2: Kawasaki only, 3: Maekawa and Kawasaki are both violated.
 */
export const verticesFlatFoldability = (graph, epsilon) => {
	// convert results into 1 (false) or 0 (true)
	const maekawa = verticesFlatFoldableMaekawa(graph).map((m) => (m ? 0 : 1));
	const kawasaki = verticesFlatFoldableKawasaki(graph, epsilon).map((k) => (k ? 0 : 1));
	// "logical or" maekawa in the ones place, kawasaki in the twos place
	// results: 1: maekawa, 2: kawasaki, 3: maekawa and kawasaki
	return maekawa.map((mae, v) => mae | (kawasaki[v] << 1));
};

/**
 * @description Perform Kawasaki's and Maekawa's theorem on all vertices and
 * return a boolean for every vertex, true if both theorems are valid.
 * @param {FOLD} graph a FOLD object
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {boolean[]} for every vertex, true if both theorems are valid.
 */
export const verticesFlatFoldable = (graph, epsilon) =>
	verticesFlatFoldability(graph, epsilon).map((n) => n === 0);

/**
 * @description using edges_assignment, check if Maekawa's theorem is satisfied
 * for all vertices, and if not, return the vertices which violate the theorem.
 * todo: this assumes that valley/mountain folds are flat folded.
 * @param {FOLD} graph a FOLD object
 * @returns {number[]} indices of vertices which violate the theorem.
 * an empty array has no errors.
 */
// export const validateMaekawa = (graph) => (
// 	verticesFlatFoldableMaekawa(graph)
// 		.map((valid, v) => (!valid ? v : undefined))
// 		.filter(a => a !== undefined)
// );

/**
 *
 */
// export const validateKawasaki = (graph, epsilon) => (
// 	verticesFlatFoldableKawasaki(graph, epsilon)
// 		.map((valid, v) => (!valid ? v : undefined))
// 		.filter(a => a !== undefined)
// );
