/**
 * Rabbit Ear (c) Kraft
 */
import { dot, resize3 } from "../math/vector.js";
import { uniqueSortedNumbers } from "../general/array.js";
import { makeFacesNormal } from "./normals.js";
import { topologicalSort } from "./directedGraph.js";
import { makeVerticesVerticesUnsorted } from "./make/verticesVertices.js";
import { connectedComponents } from "./connectedComponents.js";
import { invertFlatMap, invertFlatToArrayMap, invertArrayToFlatMap } from "./maps.js";
// import {
// 	makeFacesWinding,
// } from "../graph/faces/winding.js";
// import {
// 	makeEdgesFaces,
// } from "../graph/make.js";
// import {
// 	allLayerConditions,
// } from "./globalSolver/index.js";

/**
 * @description
 * @param {[number, number, number][]} faceOrders
 * @param {number[][]} nextMap
 * @returns {[number, number, number][]} a new copy of face orders
 */
// export const updateFaceOrdersWithMap = (faceOrders, nextMap) => {
// 	const faceOrdersResult = faceOrders
// };

/**
 * @description given faceOrders and a list of faces, filter the list
 * of faceOrders so that it only contains orders between faces where
 * both faces are contained in the argument subset faces array.
 * @param {[number, number, number][]} faceOrders faceOrders array, as in the FOLD spec
 * @param {number[]} faces a list of face indices
 * @returns {[number, number, number][]} a subset of faceOrders
 */
export const faceOrdersSubset = (faceOrders, faces) => {
	const facesHash = {};
	faces.forEach((f) => {
		facesHash[f] = true;
	});
	return faceOrders.filter((order) => facesHash[order[0]] && facesHash[order[1]]);
};

/**
 * @description Using a graph's faceOrders data, cluster faces into groups
 * where at least one face overlaps a face from the same group. Separate the
 * faceOrders array into clusters as well, each containing only those faces
 * present in that cluster.
 * @param {FOLD} graph a FOLD object with faceOrders
 * @returns {{
 *   clusters_faces: number[][],
 *   clusters_faceOrders: [number, number, number][][],
 * }} clusters_faces, for every cluster, a list of faces
 */
export const overlappingFaceOrdersClusters = ({ faceOrders }) => {
	const faces_cluster = connectedComponents(
		makeVerticesVerticesUnsorted({
			edges_vertices: faceOrders.map(([a, b]) => [a, b]),
		}),
	);
	const clusters_faces = invertFlatToArrayMap(faces_cluster);
	const clusters_faceOrders = clusters_faces.map((faces) =>
		faceOrdersSubset(faceOrders, faces),
	);
	return {
		clusters_faces,
		clusters_faceOrders,
	};
};

/**
 * @description Convert a set of faceOrders into a list of directed edges
 * of pairs of faces. A global direction will be decided, and for every pair
 * of overlapping faces, the two will be sorted such that, for faces [A, B],
 * along the global direction, the ordering goes from face A to B.
 * The optional rootFace parameter will decide the global direction, otherwise
 * face index 0 will be chosen.
 * @param {FOLDExtended} graph a FOLD object with faceOrders, and either faces_normal
 * pre-calculated, or faces_vertices and vertices_coords to get the normals.
 * @param {number} [rootFace] the user can choose which face determines the normal
 * direction, which for flat foldable models for example will linearize upwards
 * or downwards depending on this chosen face's winding.
 * @returns {[number, number][]} a list of directed edges of face pairs
 */
export const faceOrdersToDirectedEdges = (
	{ vertices_coords, faces_vertices, faceOrders, faces_normal },
	rootFace,
) => {
	if (!faceOrders || !faceOrders.length) {
		return [];
	}
	if (!faces_normal) {
		// eslint-disable-next-line no-param-reassign
		faces_normal = makeFacesNormal({ vertices_coords, faces_vertices });
	}

	// get a flat, unique, array of all faces present in faceOrders
	const faces = uniqueSortedNumbers(faceOrders.flatMap(([a, b]) => [a, b]));

	// we need to pick one face which determines the linearization direction.
	// if the user supplied rootFace is not in "faces", ignore it.
	const normal =
		rootFace !== undefined && faces.includes(rootFace)
			? faces_normal[rootFace]
			: faces_normal[faces[0]];

	// create a lookup. for every face, does its normal match the normal
	// we just chose to represent the linearization direction?
	/** @type {{[key: number]: boolean}} */
	const facesNormalMatch = {};
	faces.forEach((f) => {
		// normal will likely be near +1 or -1, no need to bother with epsilon here
		facesNormalMatch[f] = dot(faces_normal[f], normal) > 0;
	});

	// this pair states face [0] is above face [1]. according to the +1 -1 order,
	// and whether or not the reference face [1] normal is flipped. (xor either)
	/** @type {[number, number][]} */
	return faceOrders.map((order) =>
		(order[2] === -1) !== !facesNormalMatch[order[1]] // a ^ b
			? [order[0], order[1]]
			: [order[1], order[0]],
	);
};

/**
 * @description Find a topological ordering from a set of faceOrders.
 * The user can supply the face for which the normal will set the
 * direction of the linearization, if none is selected the face with
 * the lowest index number is chosen.
 * The faceOrders should contain faces which all lie in a plane, otherwise
 * this will attempt to linearize faces along a direction that is
 * meaningless (a vector inside of the plane of the faces).
 * So, for 3D models, this method should be run multiple times, each time
 * on a subset of faceOrders, containing only those faces which are coplanar
 * (and ideally, connected and overlapping).
 * This will not return a linearization including all faces in a graph,
 * it only includes faces found in faceOrders.
 * @param {FOLDExtended} graph a FOLD object with faceOrders, and either faces_normal
 * pre-calculated, or faces_vertices and vertices_coords to get the normals.
 * @param {number} [rootFace] the user can choose which face determines the normal
 * direction, which for flat foldable models for example will linearize upwards
 * or downwards depending on this chosen face's winding.
 * @returns {number[]|undefined} layers_face, for every layer (key)
 * which face (value) inhabits it. This only includes faces which are found
 * in faceOrders. Undefined if no ordering exists (if a cycle is present)
 */
export const linearizeFaceOrders = (
	{ vertices_coords, faces_vertices, faceOrders, faces_normal },
	rootFace,
) =>
	topologicalSort(
		faceOrdersToDirectedEdges(
			{
				vertices_coords,
				faces_vertices,
				faceOrders,
				faces_normal,
			},
			rootFace,
		),
	);

/**
 * todo: assuming faces_vertices instead of faces_edges
 * @returns {number[]} layers_face
 */
const fillInMissingFaces = ({ faces_vertices }, faces_layer) => {
	if (!faces_vertices) {
		return faces_layer;
	}
	const missingFaces = faces_vertices
		.map((_, i) => i)
		.filter((i) => faces_layer[i] == null);
	return missingFaces.concat(invertFlatMap(faces_layer));
};

/**
 * @description Find a topological ordering of all faces in a graph.
 * This method is intended for 2D flat foldings. This requires
 * the graph with folded vertices_coords, a crease pattern will not work.
 * This method is inclusive and will include all faces from the graph
 * in the result, even those which have no ordering. The method will first
 * sort all faces which do have an ordering, then find any remaining faces,
 * and add these faces in no particular order onto the beginning of the list,
 * so that the faces with an order will be at the end (on top, painters algorithm).
 * @param {FOLDExtended} graph a FOLD object with either faceOrders or faces_layer.
 * @param {number} [rootFace] the user can choose which face determines the normal
 * direction, which for flat foldable models for example will linearize upwards
 * or downwards depending on this chosen face's winding.
 * @returns {number[]} layers_face, for every layer (key),
 * which face (value) inhabits it.
 */
export const linearize2DFaces = (
	{ vertices_coords, faces_vertices, faceOrders, faces_layer, faces_normal },
	rootFace,
) => {
	if (!faces_normal) {
		// eslint-disable-next-line no-param-reassign
		faces_normal = makeFacesNormal({ vertices_coords, faces_vertices });
	}
	if (faceOrders) {
		const linearization = linearizeFaceOrders({ faceOrders, faces_normal }, rootFace);
		return !linearization
			? []
			: fillInMissingFaces({ faces_vertices }, invertFlatMap(linearization));
	}
	if (faces_layer) {
		return fillInMissingFaces({ faces_vertices }, faces_layer);
	}
	// no face order exists, just return all face indices.
	// if the array has any holes filter these out
	return faces_vertices.map((_, i) => i).filter(() => true);
};

/**
 * @description Given a graph which contains a faceOrders, get an array
 * of information for each face, what is its displacement vector, and
 * what is its displacement magnitude integer, indicating which layer
 * this face lies on.
 * @param {FOLDExtended} graph a FOLD object with faceOrders.
 * @returns {{
 *   vector: [number, number, number],
 *   layer: number,
 * }[]} face-aligned array, one object per face,
 * each object with properties "vector" and "layer".
 */
export const nudgeFacesWithFaceOrders = ({
	vertices_coords,
	faces_vertices,
	faceOrders,
	faces_normal: facesNormal,
}) => {
	const faces_normal = facesNormal
		? facesNormal.map(resize3)
		: makeFacesNormal({ vertices_coords, faces_vertices });

	// create a graph where the vertices are the faces, and edges
	// are connections between faces according to faceOrders
	// using this representation, find the disjoint sets of faces,
	// those which are isolated from each other according to layer orders
	const { clusters_faces, clusters_faceOrders } = overlappingFaceOrdersClusters({
		faceOrders,
	});

	// if a cluster contains a cycle, it's entry will be undefined.
	const clusters_layers_face = clusters_faceOrders.map((orders) =>
		linearizeFaceOrders({ faceOrders: orders, faces_normal }),
	);

	// if one of the clusters contains a cycle, even though some
	// clusters may be valid, exit early.
	if (clusters_layers_face.includes(undefined)) {
		return undefined;
	}

	const clusters_normals = clusters_faces.map((faces) => faces_normal[faces[0]]);
	/** @type {{ vector: [number, number, number], layer: number }[]} */
	const faces_nudge = [];
	clusters_layers_face.forEach((set, i) =>
		set.forEach((face, index) => {
			faces_nudge[face] = {
				vector: clusters_normals[i],
				layer: index,
			};
		}),
	);
	return faces_nudge;
};

/**
 * @description Given a graph with a faces_layer, a topological sorting
 * of faces, for a flat-folded 2D graph, get an array where every face
 * is given a layer and a vector, which will always be [0, 0, 1].
 * @param {FOLDExtended} graph a FOLD object with the parameter faces_layer.
 * @returns {{
 *     vector: [number, number]|[number, number, number],
 *     layer: number,
 * }[]} face-aligned array, one object per face,
 * each object with properties "vector" and "layer".
 */
export const nudgeFacesWithFacesLayer = ({ faces_layer }) => {
	/** @type {{ vector: [number, number, number], layer: number }[]} */
	const faces_nudge = [];
	const layers_face = invertFlatMap(faces_layer);
	layers_face.forEach((face, layer) => {
		faces_nudge[face] = {
			vector: [0, 0, 1],
			layer,
		};
	});
	return faces_nudge;
};

/**
 * @description for a flat-foldable origami, one in which all
 * of its folded state vertices are in 2D, this will return
 * one valid layer arrangement of the faces.
 * first it finds all pairwise face layer conditions, then
 * finds a topological ordering of each condition.
 * @param {FOLDExtended} graph a FOLD object, make sure the vertices
 * have already been folded.
 * @returns {number[]} a faces_layer object, describing,
 * for each face (key) which layer the face inhabits (value)
 */
export const makeFacesLayer = ({
	vertices_coords,
	faces_vertices,
	faceOrders,
	faces_normal,
}) => {
	if (!faces_normal) {
		// eslint-disable-next-line no-param-reassign
		faces_normal = makeFacesNormal({ vertices_coords, faces_vertices });
	}
	const linearization = linearizeFaceOrders({ faceOrders, faces_normal });
	return !linearization ? [] : invertFlatMap(linearization);
};

/**
 * @description Flip a model over by reversing the order of the faces
 * in a faces_layer encoding.
 * @param {number[]} faces_layer a faces_layer array
 * @returns {number[]} a new faces_layer array
 */
export const flipFacesLayer = (faces_layer) =>
	invertArrayToFlatMap(invertFlatToArrayMap(faces_layer).reverse());

// export const faceOrdersToFacesLayer = (graph) => {
// 	return topologicalOrder({ faceOrders, faces_normal }, faces);
// };

// const makeFacesLayer = (graph, epsilon) => {
// 	const conditions = allLayerConditions(graph, epsilon)[0];
// 	return invertMap(topologicalOrder(conditions, graph));
// };

/**
 * @description Given a faces_layer ordering of faces in a graph,
 * complute the edges_assignments, including "B", "F", "V", and "M".
 * @param {FOLD} graph a FOLD object, with the vertices already folded.
 * @param {number[]} faces_layer a faces_layer array
 * @returns {string[]} an edges_assignment array.
 */
// export const facesLayerToEdgesAssignments = (graph, faces_layer) => {
// 	const edges_assignment = [];
// 	const faces_winding = makeFacesWinding(graph);
// 	// set boundary creases
// 	const edges_faces = graph.edges_faces
// 		? graph.edges_faces
// 		: makeEdgesFaces(graph);
// 	edges_faces.forEach((faces, e) => {
// 		if (faces.length === 1) { edges_assignment[e] = "B"; }
// 		if (faces.length === 2) {
// 			const windings = faces.map(f => faces_winding[f]);
// 			if (windings[0] === windings[1]) {
// 				edges_assignment[e] = "F";
// 				return;
// 			}
// 			const layers = faces.map(f => faces_layer[f]);
// 			const local_dir = layers[0] < layers[1];
// 			const global_dir = windings[0] ? local_dir : !local_dir;
// 			edges_assignment[e] = global_dir ? "V" : "M";
// 		}
// 	});
// 	return edges_assignment;
// };

/**
 * @description Convert a set of face-pair layer orders (+1,-1,0)
 * into a face-face relationship matrix.
 * @param {number[]} faceOrders an array of FOLD spec faceOrders.
 * @returns {number[][]} NxN matrix, number of faces, containing +1,-1,0
 * as values showing the relationship between i to j in face[i][j].
 */
// export const faceOrdersToMatrix = (faceOrders) => {
// 	const faces = [];
// 	faceOrders.forEach(order => {
// 		faces[order[0]] = undefined;
// 		faces[order[1]] = undefined;
// 	});
// 	const matrix = faces.map(() => []);
// 	faceOrders
// 		// .filter((_, i) => orders[condition_keys[i]] !== 0)
// 		.forEach(([a, b, c]) => {
// 			matrix[a][b] = c;
// 			matrix[b][a] = -c;
// 		});
// 	return matrix;
// };
