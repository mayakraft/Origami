/**
 * Rabbit Ear (c) Kraft
 */
import { EPSILON } from "../../math/constant.js";
import { epsilonEqual } from "../../math/compare.js";
import { dot2, subtract2, resize2 } from "../../math/vector.js";
import { uniqueElements } from "../../general/array.js";
import { clusterSortedGeneric } from "../../general/cluster.js";
import { invertFlatToArrayMap, invertArrayMap, invertArrayToFlatMap } from "../maps.js";
import { getEdgesLine } from "../edges/lines.js";
import { makeVerticesEdgesUnsorted } from "../make/verticesEdges.js";

/**
 * @param {number[][][]} lines_verticesClusters
 * @returns {number[]} a nextmap for each vertex
 */
const lineVertexClustersToNewVertices = (lines_verticesClusters) => {
	const nextMap = [];
	let newIndex = 0;
	lines_verticesClusters.map((clusters) =>
		clusters.map((verticesCluster) => {
			const match = verticesCluster.map((v) => nextMap[v]).shift();
			const matchFound = match !== undefined;
			const index = matchFound ? match : newIndex;
			verticesCluster.forEach((v) => {
				nextMap[v] = index;
			});
			return matchFound ? match : newIndex++;
		}),
	);
	// it's possible for two or more vertices to lie at the same point and
	// each be involved in two or more crossing lines (folded form windmill base).
	// as a result, multiple lines are trying to claim the same vertex, causing
	// nextMap[v] above to be overwritten multiple times, one of those values
	// possibly getting left out, causing a situation where when the backmap is
	// created, a row is missing. a real simple and elegant solution is simply to
	// create the backmap, remove any empty rows, then convert it back into
	// a next map, this will decrement all indices to cover the gaps in the counting.
	const backMap = invertFlatToArrayMap(nextMap).filter((a) => a);
	return invertArrayToFlatMap(backMap);
};

/**
 * @param {number[][][]} lines_edgesClusters
 */
const lineEdgeClustersToNewEdges = (lines_edgesClusters) => {
	const map = [];
	let newIndex = 0;
	// edgeClusters can contain empty arrays which are the gap between
	// collinear edges where no edge exists, this area does not get turned
	// into an edge, and should be skipped.
	lines_edgesClusters.map((clusters) =>
		clusters.map((cluster) => {
			cluster
				.filter((i) => map[i] === undefined)
				.forEach((i) => {
					map[i] = [];
				});
			cluster.forEach((i) => map[i].push(newIndex));
			return cluster.length ? newIndex++ : newIndex;
		}),
	);
	return map;
};

/**
 * @description When more than one overlapping edge is going to be merged
 * into one, we need to know which assignment to carry over. This is a
 * subjective ranking of which assignment should win out (lower is better).
 * The logic goes like this:
 * - boundary is most important and similarly are cut lines.
 * - valley and mountain come before anything remaining.
 * - join and flat, it's unclear which should come first, to be honest.
 * - unassigned should be last. it is the absense of information. everything
 *   should be able to override unassigned.
 */
const assignmentPriority = { B: 1, C: 2, V: 3, M: 4, J: 5, F: 6, U: 7 };
Object.keys(assignmentPriority).forEach((key) => {
	assignmentPriority[key.toLowerCase()] = assignmentPriority[key];
});

/**
 * @description Given a list of assignments of overlapping edges, competing
 * to be the assignment which "wins out", return the index in the array
 * which has the best priority value, according to the priority lookup.
 * @param {string[]} assignments a list of edges_assignments
 * @returns {number} the index of the input array with the highest priority
 */
const highestPriorityAssignmentIndex = (assignments) => {
	if (assignments.length === 1) {
		return 0;
	}
	let index = 0;
	assignments.forEach((a, i) => {
		if (assignmentPriority[a] < assignmentPriority[assignments[index]]) {
			index = i;
		}
	});
	return index;
};

/**
 * @description Make one step to planarize a graph into the 2D XY plane
 * by fixing all instances of two collinear edges overlapping. This does not
 * resolve edges crossing edges, or multiple vertices overlapping at the same
 * coordinate. Call "planarize" instead for the complete method.
 * @param {FOLD} graph a FOLD object
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {{
 *   result: FOLD,
 *   changes: {
 *     vertices: { map: number[] },
 *     edges: { map: number[][] },
 *   }
 * }}
 * a new FOLD object, with
 * an info object which describes all changes to the graph.
 */
export const planarizeCollinearEdges = (
	{ vertices_coords, edges_vertices, edges_assignment, edges_foldAngle },
	epsilon = EPSILON,
) => {
	const { lines, edges_line } = getEdgesLine(
		{ vertices_coords, edges_vertices },
		epsilon,
	);

	const vertices_edges = makeVerticesEdgesUnsorted({ edges_vertices });

	// one to many mapping of a line and the edges along it.
	const lines_edges = invertFlatToArrayMap(edges_line);

	// for every line, project every vertex down onto the line, sort the list
	// in order of the parameter along the line. this only includes vertices
	// in edges which lie collinear to the line, it does not include other
	// orthogonal edges which happen to have one collinear vertex.
	// this method ignores these types of overlap entirely, dealing with these
	// happens if you instead call the main "planarize" method.
	const lines_verticesInfo = lines_edges
		.map((edges) => uniqueElements(edges.flatMap((edge) => edges_vertices[edge])))
		.map((vertices, l) =>
			vertices
				.map((v) => ({
					v,
					p: dot2(subtract2(vertices_coords[v], lines[l].origin), lines[l].vector),
				}))
				.sort((a, b) => a.p - b.p),
		);

	const lines_vertices = lines_verticesInfo.map((objs) => objs.map(({ v }) => v));
	const lines_verticesParameter = lines_verticesInfo.map((objs) =>
		objs.map(({ p }) => p),
	);

	// for each line, all vertices along the line are put into arrays where
	// similar vertices are grouped into the same list. even unique vertices
	// are placed into arrays with just one item.
	const lines_verticesClusters = lines_verticesParameter.map((params, l) =>
		clusterSortedGeneric(params, epsilonEqual).map((cluster) =>
			cluster.map((i) => lines_vertices[l][i]),
		),
	);

	const vertexNextMap = lineVertexClustersToNewVertices(lines_verticesClusters);
	const vertexBackMap = invertFlatToArrayMap(vertexNextMap);

	// along each line, for every fencepost between clusters of vertices,
	// each fencepost contains a list of edges which are currently between
	// these two vertices. it can contain an empty list which represents a
	// gap between collinear edges, where no edge exists in this gap.
	// [[ 12, 28], [29], [], [13]]
	// a graph with circular edges will break here.
	const lines_edgesClusters = lines_verticesClusters.map((verticesClusters, l) => {
		// this lookup contains all edges which lie along this line
		const edgesLookup = {};
		lines_edges[l].forEach((e) => {
			edgesLookup[e] = true;
		});
		// push edges onto the stack and pop them off.
		/** @type {Set<number>} */
		const edges = new Set();
		// fencepost between the clusters of vertices to make new edges
		return Array.from(Array(verticesClusters.length - 1))
			.map((_, i) => verticesClusters[i])
			.map((vertices) => {
				// we want to return a list of all edges which are currently on the stack.
				// these are edges which either start or end at this point along the line.
				const adjacentEdges = uniqueElements(
					vertices
						.flatMap((vertex) => vertices_edges[vertex])
						// only edges which are along this line are allowed
						.filter((edge) => edgesLookup[edge]),
				);
				// true: if the edge is not already on the stack, false if it is.
				const adjacentEdgesIsNew = adjacentEdges.map((e) => !edges.has(e));
				adjacentEdges.forEach((edge, i) =>
					adjacentEdgesIsNew[i] ? edges.add(edge) : edges.delete(edge),
				);
				return Array.from(edges);
			});
	});

	/** @type {[number, number][]} */
	const newEdgesVertices = lines_verticesClusters
		// .map(clusters => clusters.map(cluster => vertexNextMap[cluster[0]][0]))
		.map((clusters) => clusters.map((cluster) => vertexNextMap[cluster[0]]))
		.flatMap((vertices, i) =>
			Array.from(Array(vertices.length - 1))
				// if the edgeCluster is empty, no edge exists between these vertices
				.map((_, j) =>
					lines_edgesClusters[i][j].length ? [vertices[j], vertices[j + 1]] : undefined,
				),
		)
		// filter out the undefineds, where no edge exists between vertices
		.filter((a) => a !== undefined)
		.map(([a, b]) => [a, b]);

	const edgesNextMap = lineEdgeClustersToNewEdges(lines_edgesClusters);

	const newVerticesCoords = vertexBackMap
		.map((vertices) => vertices_coords[vertices[0]])
		.map(resize2);

	const result = {
		vertices_coords: newVerticesCoords,
		edges_vertices: newEdgesVertices,
	};

	if (edges_assignment || edges_foldAngle) {
		const edgesBackMap = invertArrayMap(edgesNextMap);
		// for the trivial cases (new edge maps to one old edge) simply carry over
		// the previous assignment and fold angle (index 0 in backmap inner array).
		// any other time, when a new edge comes from more than one previous edge,
		// we have to choose which assignment "wins out". This list contains,
		// for every edge, the index in the backmap (0, 1, 2...) of the edge which
		// "wins out", use this edge to carry over assignment/foldAngle if exists.
		const edgesBackMapIndexToUse = edges_assignment
			? edgesBackMap
					.map((edges) => edges.map((edge) => edges_assignment[edge]))
					.map(highestPriorityAssignmentIndex)
			: edgesBackMap.map(() => 0);
		if (edges_assignment) {
			result.edges_assignment = edgesBackMapIndexToUse.map(
				(index, i) => edges_assignment[edgesBackMap[i][index]],
			);
		}
		if (edges_foldAngle) {
			result.edges_foldAngle = edgesBackMapIndexToUse.map(
				(index, i) => edges_foldAngle[edgesBackMap[i][index]],
			);
		}
	}

	// vertex list can only shrink
	// edge list may expand or shrink
	const changes = {
		vertices: { map: vertexNextMap },
		edges: { map: edgesNextMap },
		edges_line,
		lines,
	};

	return { result, changes };
};
