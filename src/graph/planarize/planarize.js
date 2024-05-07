/**
 * Rabbit Ear (c) Kraft
 */
import {
	EPSILON,
} from "../../math/constant.js";
import {
	mergeNextmaps,
} from "../maps.js";
import {
	makePlanarFaces,
} from "../make/faces.js";
import {
	planarizeCollinearEdges,
} from "./planarizeCollinearEdges.js";
import {
	planarizeOverlaps,
} from "./planarizeOverlaps.js";
import {
	planarizeCollinearVertices,
} from "./planarizeCollinearVertices.js";
import {
	makeFacesMap,
} from "./makeFacesMap.js";

/**
 * @description To be renamed to "planarize" and replace the current method
 * @param {FOLD} graph a FOLD object
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {FOLD}
 */
export const planarizeEdges = ({
	vertices_coords,
	edges_vertices,
	edges_assignment,
	edges_foldAngle,
}, epsilon = EPSILON) => {
	// first step: resolve all collinear and overlapping edges,
	// after this point, no two edges parallel-overlap each other.
	const { result: result1 } = planarizeCollinearEdges({
		vertices_coords,
		edges_vertices,
		edges_assignment,
		edges_foldAngle,
	}, epsilon);

	// second step: resolve all crossing edges,
	// after this point the graph is planar, no two edges overlap.
	const { result: result2 } = planarizeOverlaps(result1, epsilon);

	// third step: remove all degree-2 vertices which lie between
	// two parallel edges of the same assignment (currently, any assignment)
	const { result: result3 } = planarizeCollinearVertices(result2, epsilon);
	return result3;
};

/**
 * @description To be renamed to "planarize" and replace the current method
 * @param {FOLD} graph a FOLD object
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {FOLD}
 */
export const planarize = (graph, epsilon = EPSILON) => {
	const result = planarizeEdges(graph, epsilon);
	const {
		faces_vertices,
		faces_edges,
	} = makePlanarFaces(result);
	result.faces_vertices = faces_vertices;
	result.faces_edges = faces_edges;
	return result;
};

/**
 * @param {FOLD} graph a FOLD object
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {{
 *   result: FOLD,
 *   changes: {
 *     vertices: { map: number[][] },
 *     edges: { map: number[][] },
 *   }
 * }}
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
		}
	} = planarizeOverlaps(graphNonCollinear, epsilon);

	// third step: remove all degree-2 vertices which lie between
	// two parallel edges of the same assignment (currently, any assignment)
	const {
		result: planarGraph,
		changes: {
			vertices: { map: verticesMap3 },
			edges: { map: edgesMap3 }
		}
	} = planarizeCollinearVertices(graphNoOverlaps, epsilon);

	const vertexNextMap = mergeNextmaps(verticesMap1, verticesMap2, verticesMap3);
	const edgeNextMap = mergeNextmaps(edgesMap1, edgesMap2, edgesMap3);

	return {
		result: planarGraph,
		changes: {
			vertices: { map: vertexNextMap },
			edges: { map: edgeNextMap },
		}
	};
};

/**
 * @description To be renamed to "planarize" and replace the current method
 * @param {FOLD} graph a FOLD object
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {{
 *   result: FOLD,
 *   changes: {
 *     vertices: { map: number[][] },
 *     edges: { map: number[][] },
 *     faces: { map: number[][] },
 *   }
 * }}
 */
export const planarizeVerbose = (graph, epsilon = EPSILON) => {
	const {
		result,
		changes: {
			vertices: { map: vertexNextMap },
			edges: { map: edgeNextMap },
		}
	} = planarizeEdgesVerbose(graph, epsilon);

	const {
		faces_vertices,
		faces_edges,
	} = makePlanarFaces(result);
	result.faces_vertices = faces_vertices;
	result.faces_edges = faces_edges;

	const faceMap = makeFacesMap(graph, result, {
		vertices: { map: vertexNextMap },
		edges: { map: edgeNextMap },
	});

	return {
		result,
		changes: {
			vertices: { map: vertexNextMap },
			edges: { map: edgeNextMap },
			faces: { map: faceMap },
		}
	};
};
