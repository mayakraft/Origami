/**
 * Rabbit Ear (c) Kraft
 */
import { EPSILON } from "../../math/constant.js";
import { invertArrayMap, mergeNextmaps } from "../maps.js";
import { makePlanarFaces } from "../make/faces.js";
import { makeEdgesVerticesFromFaces } from "../make/edgesVertices.js";
import { planarizeCollinearEdges } from "./planarizeCollinearEdges.js";
import { planarizeOverlaps } from "./planarizeOverlaps.js";
import { planarizeCollinearVertices } from "./planarizeCollinearVertices.js";
import { makeFacesMap } from "./makeFacesMap.js";
import { remove } from "../remove.js";

/**
 * @description We need edges to planarize, if a graph is missing
 * edges_vertices but contains faces_vertices, we can use the face outlines
 * as edges and planarize those. This will create edges_vertices from
 * faces_vertices for the purpose of planarizing.
 * @param {FOLD} graph a FOLD object
 * @returns {FOLD} an edges_vertices array
 */
const makeSureEdgesExist = (graph) => {
	if (graph.edges_vertices) {
		return graph;
	}
	// exit with an empty graph if no faces exist. nothing to planarize
	// no need to check faces_edges, if there are no edges_vertices then
	// faces_edges doesn't help us because we would still need to connect
	// edges to vertices.
	if (!graph.faces_vertices) {
		return {};
	}
	return {
		...graph,
		edges_vertices: makeEdgesVerticesFromFaces(graph),
	};
};

/**
 * @description Using a face's map, remove all faces which exist in the
 * new planar graph which have no mapping to any previously existing face
 * implying that these faces were never faces but holes in the graph.
 * @param {FOLD} graph a FOLD object
 * @param {number[][]} facesNextmap
 */
const removeHoles = (graph, facesNextmap) => {
	const backmap = invertArrayMap(facesNextmap);
	const removeIndices = graph.faces_vertices
		.map((_, i) => i)
		.filter((i) => backmap[i] === undefined);
	return remove(graph, "faces", removeIndices);
	// .forEach(f => {
	// 	// delete graph.faces_vertices[f];
	// 	// delete graph.faces_edges[f];
	// });
};

/**
 * @description Planarize a graph into the 2D XY plane forming a valid
 * planar graph. This will neatly resolve any overlapping collinear edges,
 * resolve all crossing edges, but do nothing with face information.
 * @param {FOLD} graph a FOLD object
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {{
 *   result: FOLD,
 *   changes: {
 *     vertices: { map: number[][] },
 *     edges: { map: number[][] },
 *   }
 * }} a planar graph only containing vertex and edge data, along with
 * an object describing changes to the graph.
 */
export const planarizeEdgesVerbose = (graph, epsilon = EPSILON) => {
	// first step: resolve all collinear and overlapping edges,
	// after this point, no two edges parallel-overlap each other.
	const {
		result: graphNonCollinear,
		changes: {
			vertices: { map: verticesMap1 },
			edges: { map: edgesMap1 },
			// edges_line,
			// lines,
		},
	} = planarizeCollinearEdges(graph, epsilon);

	// second step: resolve all crossing edges,
	// after this point the graph is planar, no two edges overlap.
	const {
		result: graphNoOverlaps,
		changes: {
			vertices: { map: verticesMap2 },
			edges: { map: edgesMap2 },
		},
	} = planarizeOverlaps(graphNonCollinear, epsilon);

	// third step: remove all degree-2 vertices which lie between
	// two parallel edges of the same assignment (currently, any assignment)
	const {
		result: planarGraph,
		changes: {
			vertices: { map: verticesMap3 },
			edges: { map: edgesMap3 },
		},
	} = planarizeCollinearVertices(graphNoOverlaps, epsilon);

	const vertexNextMap = mergeNextmaps(verticesMap1, verticesMap2, verticesMap3);
	const edgeNextMap = mergeNextmaps(edgesMap1, edgesMap2, edgesMap3);

	return {
		result: planarGraph,
		changes: {
			vertices: { map: vertexNextMap },
			edges: { map: edgeNextMap },
		},
	};
};

/**
 * @description Planarize a graph into the 2D XY plane forming a valid
 * planar graph. This will neatly resolve any overlapping collinear edges,
 * resolve all crossing edges, but do nothing with face information.
 * @param {FOLD} graph a FOLD object
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {FOLD} a planar graph only containing vertex and edge data
 */
export const planarizeEdges = (
	{ vertices_coords, edges_vertices, edges_assignment, edges_foldAngle },
	epsilon = EPSILON,
) => {
	// first step: resolve all collinear and overlapping edges,
	// after this point, no two edges parallel-overlap each other.
	const { result: result1 } = planarizeCollinearEdges(
		{
			vertices_coords,
			edges_vertices,
			edges_assignment,
			edges_foldAngle,
		},
		epsilon,
	);

	// second step: resolve all crossing edges,
	// after this point the graph is planar, no two edges overlap.
	const { result: result2 } = planarizeOverlaps(result1, epsilon);

	// third step: remove all degree-2 vertices which lie between
	// two parallel edges of the same assignment (currently, any assignment)
	const { result: result3 } = planarizeCollinearVertices(result2, epsilon);
	return result3;
};

/**
 * @description Planarize a graph into the 2D XY plane forming a valid
 * planar graph. This will neatly resolve any overlapping collinear edges,
 * resolve all crossing edges, rebuild faces, and remove holes.
 * @param {FOLD} graph a FOLD object
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {{
 *   result: FOLD,
 *   changes: {
 *     vertices: { map: number[][] },
 *     edges: { map: number[][] },
 *     faces: { map: number[][] },
 *   }
 * }} a planar graph containing vertices, edges, and faces except holes,
 * along with an object describing changes to the graph.
 */
export const planarizeVerbose = (graph, epsilon = EPSILON) => {
	const graphWithEdges = makeSureEdgesExist(graph);
	const {
		result,
		changes: {
			vertices: { map: vertexNextMap },
			edges: { map: edgeNextMap },
		},
	} = planarizeEdgesVerbose(graphWithEdges, epsilon);

	const { faces_vertices, faces_edges } = makePlanarFaces(result);
	result.faces_vertices = faces_vertices;
	result.faces_edges = faces_edges;

	const faceMapBeforeHoles = makeFacesMap(graphWithEdges, result, {
		vertices: { map: vertexNextMap },
		edges: { map: edgeNextMap },
	});

	// holes are faces which were made where no face existed previously.
	// this method will remove all holes.
	// in the case of a graph which had zero holes previously, this will cause
	// all faces that were just build to be removed.
	const removeMap = removeHoles(result, faceMapBeforeHoles);
	const faceMap = mergeNextmaps(faceMapBeforeHoles, removeMap);

	return {
		result,
		changes: {
			vertices: { map: vertexNextMap },
			edges: { map: edgeNextMap },
			faces: { map: faceMap },
		},
	};
};

/**
 * @description Planarize a graph into the 2D XY plane forming a valid
 * planar graph. This will neatly resolve any overlapping collinear edges,
 * resolve all crossing edges, rebuild faces, and remove holes.
 * @param {FOLD} graph a FOLD object
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {FOLD} a planar graph containing vertices, edges,
 * and faces except holes.
 */
export const planarize = (graph, epsilon = EPSILON) => {
	// unfortunately, for removeHoles to work, we need to create the face map,
	// which requires the edge map, which require we run the verbose methods
	// and capture all change data. so this method does not save any time,
	// it only simplifies the type of the return object,
	const { result } = planarizeVerbose(graph, epsilon);
	return result;
};

/**
 * @description Planarize a graph into the 2D XY plane forming a valid
 * planar graph. This will neatly resolve any overlapping collinear edges,
 * resolve all crossing edges, and rebuild faces WITHOUT removing any holes,
 * all faces which were discovered will be kept.
 * @param {FOLD} graph a FOLD object
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {FOLD} a planar graph containing vertices, edges, and all faces,
 * no holes are removed.
 */
export const planarizeAllFaces = (graph, epsilon = EPSILON) => {
	const graphWithEdges = makeSureEdgesExist(graph);
	const result = planarizeEdges(graphWithEdges, epsilon);
	const { faces_vertices, faces_edges } = makePlanarFaces(result);
	result.faces_vertices = faces_vertices;
	result.faces_edges = faces_edges;
	return result;
};
