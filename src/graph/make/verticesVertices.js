/**
 * Rabbit Ear (c) Kraft
 */
import { makeVerticesEdgesUnsorted } from "./verticesEdges.js";
import { makeVerticesFacesUnsorted } from "./verticesFaces.js";
import { sortVerticesCounterClockwise } from "../vertices/sort.js";

/**
 * @description Make `vertices_vertices` sorted radially counter-clockwise.
 * @param {FOLD} graph a FOLD object, containing vertices_coords, vertices_edges, edges_vertices
 * @returns {number[][]} array of array of numbers, where each row corresponds to a
 * vertex index and the values in the inner array are vertex indices.
 */
export const makeVerticesVertices2D = ({
	vertices_coords,
	vertices_edges,
	edges_vertices,
}) => {
	if (!vertices_edges) {
		vertices_edges = makeVerticesEdgesUnsorted({ edges_vertices });
	}
	// use adjacent edges to find adjacent vertices
	const vertices_vertices = vertices_edges.map((edges, v) =>
		edges
			// the adjacent edge's edges_vertices also contains this vertex,
			// filter it out and we're left with the adjacent vertices
			.map((edge) => edges_vertices[edge].filter((i) => i !== v))
			.reduce((a, b) => a.concat(b), []),
	);
	return vertices_coords === undefined
		? vertices_vertices
		: vertices_vertices.map((verts, i) =>
				sortVerticesCounterClockwise({ vertices_coords }, verts, i),
			);
};

/**
 * @description Make `vertices_vertices` sorted radially counter-clockwise.
 * @param {FOLD} graph a FOLD object, containing vertices_coords, vertices_edges, edges_vertices
 * @returns {number[][]} array of array of numbers, where each row corresponds to a
 * vertex index and the values in the inner array are vertex indices.
 */
export const makeVerticesVerticesFromFaces = ({
	vertices_coords,
	vertices_faces,
	faces_vertices,
}) => {
	if (!vertices_faces) {
		vertices_faces = makeVerticesFacesUnsorted({ vertices_coords, faces_vertices });
	}
	// every iterate through every vertices_faces's faces_vertices
	const vertices_faces_vertices = vertices_faces.map((faces) =>
		faces.map((f) => faces_vertices[f]),
	);
	// for every vertex, find its index in its faces_vertices array.
	const vertices_faces_indexOf = vertices_faces_vertices.map((faces, vertex) =>
		faces.map((verts) => verts.indexOf(vertex)),
	);
	// get the three vertices (before, this vertex, after) in this vertex's
	// faces_vertices array maintaining the counter clockwise order.
	const vertices_faces_threeIndices = vertices_faces_vertices.map((faces, vertex) =>
		faces.map((verts, j) => [
			(vertices_faces_indexOf[vertex][j] + verts.length - 1) % verts.length,
			vertices_faces_indexOf[vertex][j],
			(vertices_faces_indexOf[vertex][j] + 1) % verts.length,
		]),
	);
	// convert these three indices in face_vertices arrays into absolute
	// indices to vertices, so that we have three consecutive vertex indices.
	// for example, vertex #7's entry might be an array containing:
	// [141, 7, 34]
	// [34, 7, 120]
	// [120, 7, 141]
	const vertices_faces_threeVerts = vertices_faces_threeIndices.map((faces, vertex) =>
		faces.map((indices, j) =>
			indices.map((index) => vertices_faces_vertices[vertex][j][index]),
		),
	);
	// convert the three neighbor vertices into two pairs, maintaining order,
	// which include the vertex in the middle, these represent the pairs of
	// vertices which make up the edge of the face, for all faces, in counter-
	// clockwise order around this vertex.
	const vertices_verticesLookup = vertices_faces_threeVerts.map((faces) => {
		// facesVerts matches the order in this vertex's faces_vertices array.
		// it contains vertex pair keys ([141, 7, 34] becomes ["141 7", "7 34"])
		// which represent this face's adjacent vertices to our vertex
		// coming to and from this vertex.
		const facesVerts = faces.map((verts) =>
			[
				[0, 1],
				[1, 2],
			].map((p) => p.map((x) => verts[x]).join(" ")),
		);
		const from = {};
		const to = {};
		facesVerts.forEach((keys, i) => {
			from[keys[0]] = i;
			to[keys[1]] = i;
		});
		return { facesVerts, to, from };
	});
	// using the data from above, walk around the vertex by starting with an
	// edge, an edge represented as a pair of vertices, and alternate:
	// 1. using the vertex-pair's adjacent face to get the other pair in
	//    the same face, and,
	// 2. swapping the vertices in the string ("141 7" becomes "7 141") to
	//    find jump to another face, this being the adjacent face in the walk.
	// care needs to be taken because this vertex may be adjacent to holes.
	// a solution is possible if there are up to two holes, but a vertex
	// with more than two holes is technically unsolvable.
	return vertices_verticesLookup.map((lookup) => {
		// locate any holes if they exist, holes are when the inverse of
		// a "to" key does not exist in the "from" lookup, or visa versa.
		const toKeys = Object.keys(lookup.to);
		const toKeysInverse = toKeys.map((key) => key.split(" ").reverse().join(" "));
		// hole keys are made from "from" indices, so each one can be
		// the start of a counter clockwise walk path
		const holeKeys = toKeys.filter((_, i) => !(toKeysInverse[i] in lookup.from));
		// console.log("holeKeys", holeKeys);
		if (holeKeys.length > 2) {
			console.warn("vertices_vertices found an unsolvable vertex");
			return [];
		}
		// the start keys will be either each hole key, or just pick a key
		// if no holes exist
		const startKeys = holeKeys.length ? holeKeys : [toKeys[0]];
		// vertex_vertices is each vertex's vertices_vertices
		const vertex_vertices = [];
		// in the case of no holes, "visited" will indicate we finished.
		const visited = {};
		for (let s = 0; s < startKeys.length; s += 1) {
			const startKey = startKeys[s];
			const walk = [startKey];
			visited[startKey] = true;
			let isDone = false;
			do {
				const prev = walk[walk.length - 1];
				const faceIndex = lookup.to[prev];
				// this indicates the end of a walk which ended at a hole
				if (!(faceIndex in lookup.facesVerts)) {
					break;
				}
				let nextKey;
				if (lookup.facesVerts[faceIndex][0] === prev) {
					nextKey = lookup.facesVerts[faceIndex][1];
				}
				if (lookup.facesVerts[faceIndex][1] === prev) {
					nextKey = lookup.facesVerts[faceIndex][0];
				}
				if (nextKey === undefined) {
					return [];
				}
				const nextKeyFlipped = nextKey.split(" ").reverse().join(" ");
				walk.push(nextKey);
				// this indicates the end of a walk which completed a cycle
				isDone = nextKeyFlipped in visited;
				if (!isDone) {
					walk.push(nextKeyFlipped);
				}
				// update the visited dictionary
				visited[nextKey] = true;
				visited[nextKeyFlipped] = true;
			} while (!isDone);
			// walk now contains keys like "4 0", "1 4", "4 1", "2 4", "4 2",
			// mod 2 so that every edge is represented only once, which
			// still works with odd numbers since we start at a hole, and get the
			// one vertex which isn't our vertex. now we have our vertices_vertices
			const vertexKeys = walk
				.filter((_, i) => i % 2 === 0)
				.map((key) => key.split(" ")[1])
				.map((str) => parseInt(str, 10));
			vertex_vertices.push(...vertexKeys);
		}
		return vertex_vertices;
	});
};

/**
 * @description Make `vertices_vertices` sorted radially counter-clockwise.
 * @param {FOLD} graph a FOLD object, containing vertices_coords, vertices_edges, edges_vertices
 * @returns {number[][]} array of array of numbers, where each row corresponds to a
 * vertex index and the values in the inner array are vertex indices.
 */
export const makeVerticesVertices = (graph) => {
	if (!graph.vertices_coords || !graph.vertices_coords.length) {
		return [];
	}
	const dimensions = graph.vertices_coords.filter(() => true).shift().length;
	switch (dimensions) {
		case 3:
			return makeVerticesVerticesFromFaces(graph);
		default:
			return makeVerticesVertices2D(graph);
	}
};

/**
 * @param {FOLD} graph a FOLD object
 */
export const makeVerticesVerticesUnsorted = ({ vertices_edges, edges_vertices }) => {
	if (!vertices_edges) {
		vertices_edges = makeVerticesEdgesUnsorted({ edges_vertices });
	}
	// use adjacent edges to find adjacent vertices
	return vertices_edges.map((edges, v) =>
		edges
			// the adjacent edge's edges_vertices also contains this vertex,
			// filter it out and we're left with the adjacent vertices
			.flatMap((edge) => edges_vertices[edge].filter((i) => i !== v)),
	);
};
