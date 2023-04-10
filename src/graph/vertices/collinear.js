/**
 * Rabbit Ear (c) Kraft
 */
import { EPSILON } from "../../math/general/constant.js";
import { excludeS } from "../../math/general/function.js";
import { collinearBetween } from "../../math/geometry/line.js";
import { overlapLinePoint } from "../../math/intersect/overlap.js";
import {
	makeVerticesEdgesUnsorted,
	makeEdgesVector,
} from "../make.js";
import { getOtherVerticesInEdges } from "../edges/general.js";
import { sweepEdges } from "../sweep.js";
/**
 * @description determine if a vertex exists between two and only two edges, and
 * those edges are both parallel and on opposite ends of the vertex. In a lot of
 * cases, this vertex can be removed and the graph would function the same.
 * @param {FOLD} graph a FOLD object
 * @param {number} vertex an index of a vertex in the graph
 * @returns {boolean} true if the vertex is collinear and can be removed.
 * @linkcode Origami ./src/graph/verticesCollinear.js 19
 * @bigO O(1) if vertices_edges exists, if not, O(n) where n=edges
 */
export const isVertexCollinear = ({
	vertices_coords, vertices_edges, edges_vertices,
}, vertex, epsilon = EPSILON) => {
	if (!vertices_coords || !edges_vertices) { return false; }
	if (!vertices_edges) {
		vertices_edges = makeVerticesEdgesUnsorted({ edges_vertices });
	}
	const edges = vertices_edges[vertex];
	if (edges === undefined || edges.length !== 2) { return false; }
	// don't just check if they are parallel, use the direction of the vertex
	// to make sure the center vertex is inbetween, instead of the odd
	// case where the two edges are on top of one another with
	// a leaf-like vertex.
	const vertices = getOtherVerticesInEdges({ edges_vertices }, vertex, edges);
	const points = [vertices[0], vertex, vertices[1]]
		.map(v => vertices_coords[v]);
	return collinearBetween(...points, false, epsilon);
};
/**
 * check each vertex against each edge, we want to know if a vertex is
 * lying collinear along an edge, the usual intention is to substitute
 * the edge with 2 edges that include the collinear vertex.
 */
/**
 * this DOES NOT return vertices that are already connected
 * between two adjacent and collinear edges, in a valid graph
 *    O------------O------------O
 * for this you want: ___________ method
 */
/**
 * @description Get a list of lists where for every edge there is a
 * list filled with vertices that lies collinear to the edge, where
 * collinearity only counts if the vertex lies between the edge's endpoints,
 * excluding the endpoints themselves.
 * @param {FOLD} graph a FOLD object
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {number[][]} size matched to the edges_ arrays, with an empty array
 * unless a vertex lies collinear, the edge's array will contain that vertex's index.
 * @linkcode Origami ./src/graph/verticesCollinear.js 59
 * @bigO O(e*v) where e=edges, v=vertices.
 */
// export const getVerticesEdgesOverlap = ({
// 	vertices_coords, edges_vertices, edges_coords,
// }, epsilon = EPSILON) => {
// 	if (!edges_coords) {
// 		edges_coords = edges_vertices.map(ev => ev.map(v => vertices_coords[v]));
// 	}
// 	const edges_span_vertices = getEdgesVerticesOverlappingSpan({
// 		vertices_coords, edges_vertices, edges_coords,
// 	}, epsilon);
// 	// todo, consider pushing values into a results array instead of modifying,
// 	// then filtering the existing one
// 	for (let e = 0; e < edges_coords.length; e += 1) {
// 		for (let v = 0; v < vertices_coords.length; v += 1) {
// 			if (!edges_span_vertices[e][v]) { continue; }
// 			edges_span_vertices[e][v] = overlapLinePoint(
// 				{
// 					vector: subtract(edges_coords[e][1], edges_coords[e][0]),
// 					origin: edges_coords[e][0],
// 				},
// 				vertices_coords[v],
// 				excludeS,
// 				epsilon,
// 			);
// 		}
// 	}
// 	return edges_span_vertices
// 		.map(verts => verts
// 			.map((vert, i) => (vert ? i : undefined))
// 			.filter(i => i !== undefined));
// };

export const getVerticesEdgesOverlap = ({
	vertices_coords, edges_vertices, vertices_edges, edges_vector,
}, epsilon = EPSILON) => {
	if (!edges_vector) {
		edges_vector = makeEdgesVector({ vertices_coords, edges_vertices });
	}
	const edgesLine = edges_vertices.map((_, i) => ({
		vector: edges_vector[i],
		origin: vertices_coords[edges_vertices[i][0]],
	}));
	// check the Y value against the bounding box and skip the call to the
	// overlap method if possible. results in 2x speed up (200ms to 100ms)
	const edgesYs = edges_vertices
		.map(ev => ev.map(v => vertices_coords[v][1]))
		.map(ys => (ys[0] < ys[1] ? ys : [ys[1], ys[0]]))
		// inclusive, so, we expand the y-span
		.map(ys => [ys[0] - epsilon, ys[1] + epsilon]);
	const overlaps = [];
	const setOfEdges = [];
	sweepEdges({ vertices_coords, edges_vertices, vertices_edges }, epsilon)
		.forEach(event => {
			event.add.forEach(e => { setOfEdges[e] = true; });
			setOfEdges
				.forEach((_, e) => event.vertices
					.forEach(v => {
						if (edges_vertices[e][0] === v || edges_vertices[e][1] === v) { return; }
						const vertY = vertices_coords[v][1];
						if (vertY < edgesYs[e][0] || vertY > edgesYs[e][1]) { return; }
						if (!overlaps[e]) { overlaps[e] = []; }
						overlaps[e][v] = overlapLinePoint(
							edgesLine[e],
							vertices_coords[v],
							excludeS,
							epsilon,
						);
					}));
			event.remove.forEach(e => delete setOfEdges[e]);
		});

	return overlaps
		.map(verts => verts
			.map((vert, i) => (vert ? i : undefined))
			.filter(i => i !== undefined));
};
