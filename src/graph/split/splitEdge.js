/**
 * Rabbit Ear (c) Kraft
 */
import { midpoint } from "../../math/vector.js";
import { makeVerticesToEdge, makeVerticesToFace } from "../make/lookup.js";
import { remove } from "../remove.js";
import {
	makeVerticesFacesForVertex,
	makeFacesEdgesForVertex,
	makeEdgesFacesForEdge,
} from "./general.js";

/**
 * @description This is a subroutine of splitEdge(). This will build two
 * edges that share one vertex, returning an array of two objects containing:
 * { edges_vertices, edges_assignment, edges_foldAngle }
 * @param {FOLD} graph a FOLD object, modified in place
 * @param {number} edgeIndex the index of the edge that will be split by the new vertex
 * @param {number} newVertex the index of the new vertex
 * @returns {{
 *   edges_vertices: [number, number],
 *   edges_assignment?: string,
 *   edges_foldAngle?: number,
 * }[]} array of two edge objects, containing edge data as FOLD keys
 */
const makeNewEdges = (graph, edgeIndex, newVertex) => {
	const edge_vertices = graph.edges_vertices[edgeIndex];
	/** @type {{ edges_vertices: [number, number] }[]} */
	const new_edges = [
		{ edges_vertices: [edge_vertices[0], newVertex] },
		{ edges_vertices: [newVertex, edge_vertices[1]] },
	];
	new_edges.forEach((edgeDef) =>
		["edges_assignment", "edges_foldAngle"]
			.filter((key) => graph[key] && graph[key][edgeIndex] !== undefined)
			.forEach((key) => {
				edgeDef[key] = graph[key][edgeIndex];
			}),
	);
	return new_edges;
};

/**
 * @description Update three vertices' vertices_vertices arrays,
 * the vertex which was added, and the two vertices adjacent to it.
 * @param {FOLD} graph a FOLD object, modified in place
 * @param {number} vertex index of the new vertex
 * @param {[number, number]} vertices the two vertices that made up the edge
 * which was just now split by the addition of our new vertex.
 * @returns {undefined}
 */
const updateVerticesVertices = ({ vertices_vertices }, vertex, vertices) => {
	if (!vertices_vertices) {
		return;
	}

	// create a new entry for this new vertex
	// only 2 vertices, no need to worry about winding order.
	vertices_vertices[vertex] = [...vertices];

	// for each incident vertex's vertices_vertices array, get the index
	// of the other incident vertex, we will splice in our new vertex here.
	const verticesSpliceIndex = vertices.map((v, i, arr) =>
		vertices_vertices[v].indexOf(arr[(i + 1) % arr.length]),
	);

	// update the incident vertices' existing entries in vertices_vertices.
	vertices.forEach((v, i) =>
		verticesSpliceIndex[i] === -1
			? vertices_vertices[v].push(vertex)
			: vertices_vertices[v].splice(verticesSpliceIndex[i], 1, vertex),
	);
};

/**
 * @description Update three vertices' vertices_edges arrays,
 * the vertex which was added, and the two vertices adjacent to it.
 * @param {FOLD} graph a FOLD object, modified in place
 * @param {number} oldEdge the index of the old edge
 * @param {number} newVertex the index of the new vertex which split the edge
 * @param {[number, number]} vertices the old edge's two vertices,
 * must be aligned with "newEdges"
 * @param {[number, number]} newEdges the two new edges, must be aligned with "vertices"
 * @returns {undefined}
 */
const updateVerticesEdges = (
	{ vertices_edges },
	oldEdge,
	newVertex,
	vertices,
	newEdges,
) => {
	if (!vertices_edges) {
		return;
	}

	// our new vertex is adjacent to only the two new edges
	vertices_edges[newVertex] = [...newEdges];

	// the new vertex replaces the alternate vertex from each array.
	// find the matching index, replace it with the edge from the same index.
	// as "vertices" and "newEdges" are index-aligned.
	vertices
		.map((vertex) => vertices_edges[vertex].indexOf(oldEdge))
		.map((index, i) => ({ index, vertex: vertices[i], edge: newEdges[i] }))
		.filter((el) => el.index !== -1)
		.forEach(({ index, vertex, edge }) => {
			vertices_edges[vertex][index] = edge;
		});
};

/**
 * @description Update a vertex's vertices_faces entry, provided a list of
 * the new faces which have just been added to the graph.
 * @param {FOLD} graph a FOLD object, modified in place
 * @param {number} vertex the index of the new vertex
 * @param {number[]} faces a list of faces which were just added to the graph
 * @returns {undefined}
 */
const updateVerticesFaces = (
	{ vertices_vertices, vertices_edges, vertices_faces, edges_vertices, faces_vertices },
	vertex,
	faces,
) => {
	if (!vertices_faces) {
		return;
	}

	// if no faces exist, we should not be building vertices_faces, but we can't
	// proceed because everything after this point requires a faceMap.
	// so, simply add an unsorted set of faces to the list.
	if (!faces_vertices) {
		vertices_faces[vertex] = [...faces];
		return;
	}

	const verticesToFace = makeVerticesToFace({ faces_vertices }, faces);

	// we can use either vertices_vertices or vertices_edges to match winding order
	// these methods will also include any undefineds in the case of a boundary vertex.
	const vertex_faces = makeVerticesFacesForVertex(
		{ vertices_vertices, vertices_edges, edges_vertices },
		vertex,
		verticesToFace,
	);

	// if neither vertices_vertices or vertices_edges exists, we cannot
	// respect the winding order anyway, simply add the faces to the entry.
	vertices_faces[vertex] = vertex_faces === undefined ? [...faces] : vertex_faces;
};

/**
 * @description Update the two new edges' edges_faces to include
 * the (0, 1, or 2) faces on either side of the edges.
 * @param {FOLD} graph a FOLD object, modified in place
 * @param {[number, number]} newEdges array of 2 new edges
 * @param {number[]} faces array of 0, 1, or 2 incident faces.
 * @returns {undefined}
 */
const updateEdgesFaces = ({ edges_faces }, newEdges, faces) => {
	if (!edges_faces) {
		return;
	}
	newEdges.forEach((edge) => {
		edges_faces[edge] = [...faces];
	});
};

/**
 * @description Rebuild two faces' faces_vertices to include a
 * new vertex which was added in between two existing vertices
 * in each of the faces. Find the location of the two vertices and
 * splice in the new vertex.
 * @param {FOLD} graph a FOLD object, modified in place
 * @param {number} newVertex index of the new vertex
 * @param {[number, number]} incidentVertices neighbor vertices
 * @param {number[]} faces the faces adjacent to the old edge
 * @returns {undefined}
 */
const updateFacesVertices = ({ faces_vertices }, newVertex, incidentVertices, faces) => {
	if (!faces_vertices) {
		return;
	}

	// provide two vertices, do these vertices match (in any order) to the
	// incideVertices which made up the original edge before the splitting?
	/** @param {number} a @param {number} b @returns {boolean} */
	const matchFound = (a, b) =>
		(a === incidentVertices[0] && b === incidentVertices[1]) ||
		(a === incidentVertices[1] && b === incidentVertices[0]);

	faces
		.map((i) => faces_vertices[i])
		.forEach((face_vertices) =>
			face_vertices
				// iterate through the vertices of the face, search for a matching index
				// where i and i+1 are both incident vertices, in which case return the
				// i+1 index, as this will be the location we will splice into.
				.map((vertex, i, arr) =>
					matchFound(vertex, arr[(i + 1) % arr.length])
						? (i + 1) % arr.length
						: undefined,
				)
				.filter((a) => a !== undefined)
				// it's possible for a non-convex face to walk twice across our edges
				// in two different directions, if this happens, sort the splice indices
				// from largest to smallest so that multiple splice calls will work.
				.sort((a, b) => b - a)
				.forEach((i) => face_vertices.splice(i, 0, newVertex)),
		);
};

/**
 * @description Update two faces' faces_edges so that one edge is replaced
 * with two new edges, and because the direction of the edges matters,
 * and faces_edges must be aligned with faces_vertices, we will use
 * faces_vertices to reverse-reference edges and build faces_edges.
 * @param {FOLD} graph a FOLD object, modified in place
 * @param {number[]} faces the zero, one, or two adjacent faces
 * @param {[number, number]} newEdges the two new edges
 * @returns {undefined}
 */
const updateFacesEdges = (
	{ edges_vertices, faces_vertices, faces_edges },
	faces,
	newEdges,
) => {
	if (!faces_edges || !faces_vertices) {
		return;
	}

	// create a vertex-pair ("a b" string) to edge lookup table that only
	// includes the edges involved (both faces_edges and the new edges).
	const allEdges = faces
		.flatMap((f) => faces_edges[f])
		.concat(newEdges)
		.filter((a) => a !== undefined);
	const verticesToEdge = makeVerticesToEdge({ edges_vertices }, allEdges);

	// iterate through faces vertices, pairwise adjacent vertices, create
	// keys for the lookup table, convert the keys into edge indices.
	makeFacesEdgesForVertex({ faces_vertices }, faces, verticesToEdge).forEach(
		(edges, i) => {
			faces_edges[faces[i]] = edges;
		},
	);
};

/**
 * @description Update faces_faces for a list of faces.
 * @param {FOLD} graph a FOLD object
 * @param {number} vertex
 * @param {number[]} faces
 * @returns {undefined}
 */
const updateFacesFaces = ({ faces_vertices, faces_faces }, vertex, faces) => {
	if (!faces_vertices || !faces_faces) {
		return;
	}

	const facesSpliceIndex = faces.map((f) => faces_vertices[f].indexOf(vertex));

	const facesGrabIndex = facesSpliceIndex.map(
		(index, i) =>
			(index + faces_faces[faces[i]].length - 1) % faces_faces[faces[i]].length,
	);

	const facesCopyItem = facesGrabIndex.map((index, i) => faces_faces[faces[i]][index]);

	// update the incident vertices' existing entries in vertices_vertices.
	faces.forEach((f, i) =>
		facesSpliceIndex[i] === -1
			? undefined
			: faces_faces[f].splice(facesSpliceIndex[i], 0, facesCopyItem[i]),
	);
};

/**
 * @description Split an edge, place a new vertex between the existing
 * vertices and build two new edges between the three vertices.
 * This method creates a new vertex and new edges, but no new faces.
 * rebuilding these:
 * - vertices_coords, vertices_vertices, vertices_edges, vertices_faces,
 * - edges_vertices, edges_faces, edges_assignment, edges_foldAngle
 * - faces_vertices, faces_edges,
 * without needing to rebuild:
 * - faces_faces, faceOrders
 * without rebuilding (todo):
 * - edgeOrders
 * @param {FOLD} graph FOLD object, modified in place
 * @param {number} oldEdge index of old edge to be split
 * @param {number[]} [coords=undefined] coordinates of the new vertex to be
 * added, if omitted, a vertex will be generated at the edge's midpoint.
 * @returns {{
 *   vertex: number,
 *   edges: {
 *     map: (number|number[])[],
 *     add: [number, number],
 *     remove: number,
 *   },
 * }} a summary of the changes to the graph:
 * - "vertex" is the index of the new vertex (or old index, if similar)
 * - "edges" object contains:
 *   - "remove" the index of the edge that was removed
 *   - "add" the two new edges
 *   - "map" a nextmap, all values will be numbers except the value at
 *     the remove index, this will be an array containing both new indices.
 */
export const splitEdge = (graph, oldEdge, coords = undefined) => {
	// the old edge's two vertices, one vertex will be placed in between these,
	// and two new edges will be built to connect these to the new vertex.
	const incidentVertices = graph.edges_vertices[oldEdge];

	// if the user did not supply any coordinate parameter,
	// as a convenience, select the the midpoint of the two points
	if (!coords) {
		const [a, b] = incidentVertices.map((v) => graph.vertices_coords[v]);
		coords = midpoint(a, b);
	}

	// the index of the new vertex, added to the end of the existing vertex list
	const vertex = graph.vertices_coords.length;
	graph.vertices_coords[vertex] =
		coords.length === 3 ? [coords[0], coords[1], coords[2]] : [coords[0], coords[1]];

	// the new edge indices, they will be added to the end of the edges_ arrays.
	// "newEdges" and "incidentVertices" are aligned in their indices 0 and 1,
	// so that this vertex is in this edge. This is important for the update methods
	const [e0, e1] = [0, 1].map((i) => i + graph.edges_vertices.length);
	/** @type {[number, number]} */
	const newEdges = [e0, e1];

	// make 2 new edges_vertices, edges_assignment, and edges_foldAngle.
	// add these fields to the graph.
	makeNewEdges(graph, oldEdge, vertex).forEach((edge, i) =>
		Object.keys(edge).forEach((key) => {
			graph[key][newEdges[i]] = edge[key];
		}),
	);

	// at this point we are finished with:
	// vertices_coords, edges_vertices, edges_assignment, edges_foldAngle

	// update the relevant vertices arrays
	updateVerticesVertices(graph, vertex, incidentVertices);
	updateVerticesEdges(graph, oldEdge, vertex, incidentVertices, newEdges);

	// we are now done with all data which does not relate to faces

	// we don't need to make any new faces, we only need to modify the faces
	// (if they exist) incident to the old edge.
	// note: "incidentFaces" may only include 1 face, in the case of a
	// boundary edge. this needs to be taken account, for example,
	// to ensure winding order matches across component arrays.
	const incidentFaces = makeEdgesFacesForEdge(graph, oldEdge).filter(
		(a) => a !== undefined,
	);
	updateFacesVertices(graph, vertex, incidentVertices, incidentFaces);
	updateFacesEdges(graph, incidentFaces, newEdges);
	updateVerticesFaces(graph, vertex, incidentFaces);
	updateEdgesFaces(graph, newEdges, incidentFaces);
	updateFacesFaces(graph, vertex, incidentFaces);

	// until now we never removed the old edge, this way, when we call this
	// method, no matter where the edge was inside the edges_ arrays, all
	// the indices after it will shift up to fill in the hole and this
	// method handles all re-indexing, including inside the _edges arrays.
	const edgeMap = remove(graph, "edges", [oldEdge]);

	// at this point our graph is complete. prepare the changelog info to return

	// shift our new edge indices since these relate to the graph before remove()
	newEdges.forEach((_, i) => {
		newEdges[i] = edgeMap[newEdges[i]];
	});

	// we had to run "remove" with the new edges added, but the edgeMap should
	// relate to the graph before any changes. remove those new edge entries,
	// and set them to be the new edges under the "oldEdge" index.
	/** @type {(number|number[])[]} */
	const edgesMap = edgeMap.slice();
	edgesMap.splice(-2);
	edgesMap[oldEdge] = newEdges;

	return {
		vertex,
		edges: {
			map: edgesMap,
			add: newEdges,
			remove: oldEdge,
		},
	};
};
