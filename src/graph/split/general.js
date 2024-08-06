/**
 * Rabbit Ear (c) Kraft
 */
import { uniqueElements } from "../../general/array.js";

/**
 * @description create a vertices_faces entry for a single vertex by
 * matching the winding order with vertices_vertices.
 * @param {FOLD} graph a FOLD object
 * @param {number} vertex
 * @param {{ [key: string]: number }} verticesToFace,
 * @returns {number[]|undefined} face indices or undefined if
 * not enough sufficient input data exists.
 */
export const makeVerticesFacesForVertex = (
	{ vertices_vertices, vertices_edges, edges_vertices },
	vertex,
	verticesToFace,
) => {
	if (vertices_vertices) {
		return vertices_vertices[vertex]
			.map((v) => [vertex, v].join(" "))
			.map((key) => verticesToFace[key]);
	}
	if (vertices_edges && edges_vertices) {
		return (
			vertices_edges[vertex]
				.map((edge) => edges_vertices[edge])
				// for each edge's edges_vertices, get the vertex that isn't "vertex".
				.map(([a, b]) => (vertex === a ? [vertex, b] : [vertex, a]))
				.map((pair) => pair.join(" "))
				.map((key) => verticesToFace[key])
		);
	}
	return undefined;
};

/**
 * @description Make a faces_edges entry for a single vertex using
 * the faces_vertices array, matching winding order.
 * @param {FOLD} graph a FOLD object
 * @param {number[]} faces
 * @param {{ [key: string]: number }} verticesToEdge
 * @return {number[][]}
 */
export const makeFacesEdgesForVertex = ({ faces_vertices }, faces, verticesToEdge) =>
	faces
		// iterate through faces vertices, pairwise adjacent vertices, create
		// keys for the lookup table, convert the keys into edge indices.
		.map((f) =>
			faces_vertices[f]
				.map((vertex, i, arr) => [vertex, arr[(i + 1) % arr.length]])
				.map((pair) => pair.join(" "))
				.map((key) => verticesToEdge[key]),
		);

/**
 * for each face, filter it's vertices to only include those inside this edge
 * and make sure the list only contains unique numbers, as it's possible for
 * a face to visit a vertex twice, make sure vertices are unique and check if
 * the number of matching vertices in this face is 2.
 * @param {FOLD} graph a FOLD object
 * @param {number[]} faces
 * @param {{ [key: number]: boolean }} verticesHash
 * @returns {number[]} face indices
 */
const filterFacesWithTwoMatches = ({ faces_vertices }, faces, verticesHash) =>
	faces.filter(
		(face) => new Set(faces_vertices[face].filter((v) => verticesHash[v])).size === 2,
	);
// const filterFacesWithTwoMatches = ({ faces_vertices }, faces, verticesHash) => (faces
// 	.filter(face => faces_vertices[face]
// 		.map(vvv => vvv.filter(v => verticesHash[v]))
// 		.map(subset => new Set(subset))
// 		.map(set => set.size === 2)
// 		.reduce((a, b) => a || b, false)));

/**
 * @description Get an edge's adjacent face(s). This does not follow the FOLD
 * spec recommendation to order the result according to the edge's direction,
 * and if the edge is a boundary edge this will not necessarily include nulls.
 * If edges_faces does not exist, this method will hunt via the edge's
 * vertices, via faces_vertices or faces_edges until matches are found.
 * @param {FOLD} graph a FOLD object
 * @param {number} edge index of the edge in the graph
 * @returns {number[]} array of 0, 1, or 2 face indices adjacent to the edge
 */
export const makeEdgesFacesForEdge = (
	{ vertices_faces, edges_vertices, edges_faces, faces_vertices, faces_edges },
	edge,
) => {
	// if edges_faces already exists, return this entry
	if (edges_faces && edges_faces[edge]) {
		return edges_faces[edge];
	}

	// if edges_vertices does not exist, we have no way of knowing the edge's
	// vertices (unless we can really trust the graph winding for example and
	// match a faces_edges in winding order to faces_vertices), but practically,
	// we can't go from edges to faces without going through vertices first.
	if (!edges_vertices) {
		return [];
	}

	if (faces_vertices) {
		// here is a vertex hash so we can quickly identify which edge
		// (according to its vertices) is our edge.
		const vertexHash = {
			[edges_vertices[edge][0]]: true,
			[edges_vertices[edge][1]]: true,
		};

		// if edges_vertices and vertices_faces both exist we can use these to get
		// a subset of faces, otherwise we will have to test all faces.
		// vertices_faces will bring the O(n) run time down to O(1).
		const faces = vertices_faces
			? uniqueElements(edges_vertices[edge].flatMap((v) => vertices_faces[v]))
			: faces_vertices.map((_, f) => f);

		return filterFacesWithTwoMatches({ faces_vertices }, faces, vertexHash);
	}

	if (faces_edges) {
		return faces_edges
			.map((_, f) => f)
			.filter((face) => faces_edges[face].includes(edge));
	}

	return [];
};
