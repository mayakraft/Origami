/**
 * Rabbit Ear (c) Kraft
 */
import { boundingBox as BoundingBox } from "../math/polygon.js";
import { assignmentIsBoundary } from "../fold/spec.js";
import { uniqueElements } from "../general/array.js";
import { disjointGraphs } from "./disjoint.js";
import { invertFlatToArrayMap } from "./maps.js";
import { makeVerticesEdgesUnsorted } from "./make/verticesEdges.js";
import {
	makeVerticesVertices2D,
	makeVerticesVerticesUnsorted,
} from "./make/verticesVertices.js";
import { makeVerticesToEdge } from "./make/lookup.js";
import { connectedComponents } from "./connectedComponents.js";

/**
 * @description Make an axis-aligned bounding box that encloses the vertices of
 * a FOLD object. the optional padding is used to make the bounding box
 * inclusive / exclusive by adding padding on all sides, or inset in the case
 * of negative number. (positive=inclusive boundary, negative=exclusive boundary)
 * @param {FOLD} graph a FOLD object
 * @param {number} [padding] an optional padding around the vertices
 * to be included in the bounding box.
 * @returns {Box?} dimensions stored as "span" "min" and "max".
 * "undefined" if no vertices exist in the graph.
 */
export const boundingBox = ({ vertices_coords }, padding) =>
	BoundingBox(vertices_coords, padding);

/**
 * @description A vertex is a boundary vertex if it is a member of a boundary
 * edge, as defined by edges_assignment. If edges_assignment is not present,
 * or does not contain boundary edges, this will return an empty array.
 * If you need *sorted* vertices, use the boundary() or boundaries() method.
 * @param {FOLD} graph a FOLD object
 * @returns {number[]} unsorted list of vertex indices which lie along the boundary.
 */
export const boundaryVertices = ({ edges_vertices, edges_assignment = [] }) =>
	uniqueElements(
		edges_vertices.filter((_, i) => assignmentIsBoundary[edges_assignment[i]]).flat(),
	);

/**
 * @description return value for "boundary" method.
 */
const emptyBoundaryObject = () => ({ vertices: [], edges: [] });

/**
 * @description Use this method if edges are already marked with a "boundary"
 * assignment, and this will get the boundary of a FOLD graph in terms of
 * both vertices and edges. Use this method when you know there is only one
 * connected boundary in the graph. If there are more than one,
 * use the "boundaries" method.
 * @param {FOLD} graph a FOLD object
 * @returns {{
 *   vertices: number[],
 *   edges: number[],
 * }} with "vertices" and "edges", each arrays of indices.
 */
export const boundary = ({ vertices_edges, edges_vertices, edges_assignment }) => {
	if (!edges_assignment || !edges_vertices) {
		return emptyBoundaryObject();
	}
	if (!vertices_edges) {
		vertices_edges = makeVerticesEdgesUnsorted({ edges_vertices });
	}
	// true or false if an edge is a boundary edge, additionally,
	// turn a true into a false once we use the edge
	const edgesBoundary = edges_assignment.map((a) => a === "B" || a === "b");

	// inverse of "edgesBoundary", every time we visit a vertex, mark it true.
	const usedVertices = {};

	// the resulting boundary is stored in these two arrays
	const vertices = [];
	const edges = [];

	// get the first available edge index that is a boundary
	let edgeIndex = edgesBoundary
		.map((isBoundary, e) => (isBoundary ? e : undefined))
		.filter((a) => a !== undefined)
		.shift();
	if (edgeIndex === undefined) {
		return emptyBoundaryObject();
	}

	// add the first edge and remove it from the available edge list
	edgesBoundary[edgeIndex] = false;
	edges.push(edgeIndex);

	// add the edge's first vertex to the result, mark it used, set the second
	// vertex to the "nextVertex" which we will use to walk around the boundary
	vertices.push(edges_vertices[edgeIndex][0]);
	usedVertices[edges_vertices[edgeIndex][0]] = true;
	let nextVertex = edges_vertices[edgeIndex][1];

	// loop as long as "nextVertex" is not in the used vertices list.
	while (!usedVertices[nextVertex]) {
		// add nextVertex to our solutions list, mark it as used
		vertices.push(nextVertex);
		usedVertices[nextVertex] = true;

		// find the next edge index by consulting the nextVertex's adjacent edges,
		// filtering out the first one that has not yet been visited.
		edgeIndex = vertices_edges[nextVertex].filter((v) => edgesBoundary[v]).shift();

		// the boundary is not a nice, neat cycle.
		if (edgeIndex === undefined) {
			return emptyBoundaryObject();
		}

		// advance nextVertex, look at our current edge and select the
		// other vertex that isn't the current "nextVertex".
		if (edges_vertices[edgeIndex][0] === nextVertex) {
			[, nextVertex] = edges_vertices[edgeIndex];
		} else {
			[nextVertex] = edges_vertices[edgeIndex];
		}

		// add the next edge to our solution, mark it as used
		edges.push(edgeIndex);
		edgesBoundary[edgeIndex] = false;
	}
	return { vertices, edges };
};

/**
 * @description Use this method if edges are already marked with a "boundary"
 * assignment, and this will get the boundaries of a FOLD graph in terms of
 * both vertices and edges. This method will safely find all boundaries,
 * in case of a graph that has two disjoint sets.
 * @param {FOLD} graph a FOLD object
 * @returns {{
 *   vertices: number[],
 *   edges: number[],
 * }[]} an array of boundary solutions, where each boundary
 * is an object with "vertices" and "edges", each arrays of indices.
 */
export const boundaries = ({ vertices_edges, edges_vertices, edges_assignment }) => {
	if (!edges_assignment || !edges_vertices) {
		return [emptyBoundaryObject()];
	}
	if (!vertices_edges) {
		vertices_edges = makeVerticesEdgesUnsorted({ edges_vertices });
	}

	// create a copy of edges_vertices that only contains boundary edges, this
	// array will have holes, no indices change they will match the input graph.
	const edges_verticesBoundary = [...edges_vertices];

	// delete the non-boundary edges
	edges_assignment
		.map((a) => a === "B" || a === "b")
		.map((isBoundary, e) => (!isBoundary ? e : undefined))
		.filter((e) => e !== undefined)
		.forEach((e) => delete edges_verticesBoundary[e]);

	// a copy of vertices_edges, but only includes boundary edges
	const vertices_edgesBoundary = makeVerticesEdgesUnsorted({
		edges_vertices: edges_verticesBoundary,
	});

	// an adjacent vertices_vertices list, but only include boundary vertices
	const verticesVertices = makeVerticesVerticesUnsorted({
		vertices_edges: vertices_edgesBoundary,
		edges_vertices: edges_verticesBoundary,
	});

	// using the boundary-only vertices_vertices, make a connected components,
	// each vertex (index) will contain a group number that it is a part of (value)
	const connectedVertices = connectedComponents(verticesVertices);

	// using the connected components, create a list of groups where, each group
	// is a list of vertices, then, for each group, take just one vertex.
	const groupsVertex = invertFlatToArrayMap(connectedVertices).map(
		(vertices) => vertices[0],
	);

	// given a start vertex and the list of verticesVertices, walk through
	// the adjacent vertex list, modifying the verticesVertices object as we go
	// by removing visited vertices, until we reach a verticesVertices with no
	// available vertices to travel to. return the list of vertices walked.
	const walkVerticesVertices = (startVertex) => {
		let prevVertex;
		let currVertex = startVertex;
		let nextVertex;
		const result = [];
		const filterFunc = (v) => v !== prevVertex;
		while (true) {
			// in an ideal situation, the current verticesVertices array will have
			// the vertex from which we just came, and the one to head to next.
			// remove the vertex from which we just came, and set the next vertex.
			verticesVertices[currVertex] = verticesVertices[currVertex].filter(filterFunc);
			nextVertex = verticesVertices[currVertex].shift();

			// if the array was empty, there is nowhere else to go. we're done.
			if (nextVertex === undefined) {
				return result;
			}

			// add the current vertex to the result list, then increment the walk.
			result.push(currVertex);
			prevVertex = currVertex;
			currVertex = nextVertex;
		}
	};

	// for each group of connected vertices, using the first vertex from
	// the group, walk the connected vertices and get back a list of vertices.
	const boundariesVertices = groupsVertex.map((vertex) => walkVerticesVertices(vertex));

	// backwards lookup, which edge is made of a pair of vertices.
	// we only need to use the boundary edges, should be a little faster.
	const edgeMap = makeVerticesToEdge({
		edges_vertices: edges_verticesBoundary,
	});

	// group vertices into pairs, find the edge that connects each pair.
	const boundariesEdges = boundariesVertices.map((vertices) =>
		vertices
			.map((v, i, arr) => [v, arr[(i + 1) % arr.length]])
			.map((pair) => edgeMap[pair.join(" ")]),
	);

	return boundariesVertices.map((vertices, i) => ({
		vertices,
		edges: boundariesEdges[i],
	}));
};

/**
 * @description Get a FOLD object's boundary as a list of points. Use this
 * method in the case where there might be more than one boundary cycle.
 * @param {FOLD} graph a FOLD object
 * @returns {([number, number]|[number, number, number])[][]} array of polygons
 */
export const boundaryPolygons = ({
	vertices_coords,
	vertices_edges,
	edges_vertices,
	edges_assignment,
}) =>
	boundaries({ vertices_edges, edges_vertices, edges_assignment }).map(({ vertices }) =>
		vertices.map((v) => vertices_coords[v]),
	);

/**
 * @description Get a FOLD object's boundary as a list of points. Use this
 * method if you are certain that there is only one boundary.
 * @param {FOLD} graph a FOLD object
 * @returns {([number, number]|[number, number, number])[]} a polygon
 */
export const boundaryPolygon = ({
	vertices_coords,
	vertices_edges,
	edges_vertices,
	edges_assignment,
}) =>
	boundary({ vertices_edges, edges_vertices, edges_assignment }).vertices.map(
		(v) => vertices_coords[v],
	);

/**
 * @description Use this method when you know there is only one connected
 * boundary in the graph. If there are more than one, use "planarBoundaries".
 * When a graph does not have boundary assignment information,
 * this method is used to uncover the boundary, so long as the graph is planar.
 * Get the boundary as two arrays of vertices and edges
 * by walking the boundary edges in 2D and uncovering the concave hull.
 * Does not consult edges_assignment, but does require vertices_coords.
 * For repairing crease patterns, this will uncover boundary edges_assignments.
 * @param {FOLD} graph a FOLD object
 * (vertices_coords, vertices_vertices, edges_vertices)
 * (vertices edges only required in case vertices_vertices needs to be built)
 * @returns {{
 *   vertices: number[],
 *   edges: number[],
 * }} "vertices" and "edges" with arrays of indices.
 * @usage call populate() before to ensure this works.
 */
export const planarBoundary = ({
	vertices_coords,
	vertices_edges,
	vertices_vertices,
	edges_vertices,
}) => {
	if (!vertices_vertices) {
		vertices_vertices = makeVerticesVertices2D({
			vertices_coords,
			vertices_edges,
			edges_vertices,
		});
	}
	const edge_map = makeVerticesToEdge({ edges_vertices });
	const edge_walk = [];
	const vertex_walk = [];
	const walk = {
		vertices: vertex_walk,
		edges: edge_walk,
	};

	let largestX = -Infinity;
	let first_vertex_i = -1;
	vertices_coords.forEach((v, i) => {
		if (v[0] > largestX) {
			largestX = v[0];
			first_vertex_i = i;
		}
	});

	if (first_vertex_i === -1) {
		return walk;
	}
	vertex_walk.push(first_vertex_i);
	const first_vc = vertices_coords[first_vertex_i];
	const first_neighbors = vertices_vertices[first_vertex_i];
	if (!first_neighbors) {
		return walk;
	}
	// sort adjacent vertices by next most clockwise vertex;
	const counter_clock_first_i = first_neighbors
		.map((i) => vertices_coords[i])
		.map((vc) => [vc[0] - first_vc[0], vc[1] - first_vc[1]])
		.map((vec) => Math.atan2(vec[1], vec[0]))
		.map((angle) => (angle < 0 ? angle + Math.PI * 2 : angle))
		.map((a, i) => ({ a, i }))
		.sort((a, b) => a.a - b.a)
		.shift().i;
	const second_vertex_i = first_neighbors[counter_clock_first_i];
	// find this edge that connects these 2 vertices
	const first_edge_lookup =
		first_vertex_i < second_vertex_i
			? `${first_vertex_i} ${second_vertex_i}`
			: `${second_vertex_i} ${first_vertex_i}`;
	const first_edge = edge_map[first_edge_lookup];
	// vertex_walk.push(second_vertex_i);
	edge_walk.push(first_edge);

	// now we begin the loop

	// walking the graph, we look at 3 vertices at a time. in sequence:
	// prev_vertex, this_vertex, next_vertex
	let prev_vertex_i = first_vertex_i;
	let this_vertex_i = second_vertex_i;
	// because this is an infinite loop, and it relies on vertices_vertices
	// being well formed (if it was user-made, we cannot guarantee), we will
	// break the loop if we walk past the same pair of vertices (in the same dir)
	const visitedVertexPairs = { [`${prev_vertex_i} ${this_vertex_i}`]: true };
	while (true) {
		const next_neighbors = vertices_vertices[this_vertex_i];
		const from_neighbor_i = next_neighbors.indexOf(prev_vertex_i);
		const next_neighbor_i = (from_neighbor_i + 1) % next_neighbors.length;
		const next_vertex_i = next_neighbors[next_neighbor_i];
		const next_edge_lookup =
			this_vertex_i < next_vertex_i
				? `${this_vertex_i} ${next_vertex_i}`
				: `${next_vertex_i} ${this_vertex_i}`;
		const next_edge_i = edge_map[next_edge_lookup];
		// exit loop condition
		if (visitedVertexPairs[`${this_vertex_i} ${next_vertex_i}`]) {
			// if the first and upcoming edge do not match, this means we somehow
			// walked around the boundary and ended up somewhere in the middle,
			// which would put us in a never ending cycle, so we need to break
			// out anyway, but at least warn the user the result is poorly formed.
			// todo: we can get rid of this message if we modify the structure
			// of the return object so that it traverses the circular part only,
			// or, includes a there-and-back traversal of the branch(es).
			if (next_edge_i !== edge_walk[0]) {
				console.warn("bad boundary");
			}
			return walk;
		}
		visitedVertexPairs[`${this_vertex_i} ${next_vertex_i}`] = true;
		vertex_walk.push(this_vertex_i);
		edge_walk.push(next_edge_i);
		prev_vertex_i = this_vertex_i;
		this_vertex_i = next_vertex_i;
	}
};

/**
 * @description When a graph does not have boundary assignment information,
 * this method is used to uncover the boundaries, so long as the graph is planar.
 * This works for disjoint graphs, the return value is an array of results.
 * Each boundary result is two arrays of vertices and edges, discovered
 * by walking the boundary edges in 2D and uncovering the concave hull.
 * Does not consult edges_assignment, but does require vertices_coords.
 * @param {FOLD} graph a FOLD object
 * (vertices_coords, vertices_vertices, edges_vertices)
 * (vertices edges only required in case vertices_vertices needs to be built)
 * @returns {{
 *   vertices: number[],
 *   edges: number[],
 * }[]} array of objects with "vertices" and "edges" with arrays of indices.
 * @usage call populate() before to ensure this works.
 */
export const planarBoundaries = ({
	vertices_coords,
	vertices_edges,
	vertices_vertices,
	edges_vertices,
}) => {
	if (!vertices_vertices) {
		vertices_vertices = makeVerticesVertices2D({
			vertices_coords,
			vertices_edges,
			edges_vertices,
		});
	}
	return disjointGraphs({
		vertices_coords,
		vertices_vertices,
		edges_vertices,
	}).map(planarBoundary);
};
