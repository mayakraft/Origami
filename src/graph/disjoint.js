/**
 * Rabbit Ear (c) Kraft
 */
import { filterKeysWithPrefix } from "../fold/spec.js";
import { uniqueElements } from "../general/array.js";
import { connectedComponents } from "./connectedComponents.js";
import { makeVerticesVerticesUnsorted } from "./make/verticesVertices.js";
import { makeVerticesEdgesUnsorted } from "./make/verticesEdges.js";
import { makeVerticesFacesUnsorted } from "./make/verticesFaces.js";
import { invertFlatToArrayMap } from "./maps.js";

/**
 * @description In the case that your graph is a disjoint union
 * of graphs, return an array of all graphs separated, where each
 * graph's components maintain their indices, the component arrays
 * will have holes.
 * @param {FOLD} graph a FOLD object
 * @returns {{ vertices: number[], edges: number[], faces: number[] }[]}
 * an array of objects where each element represents a disjoint graph, and
 * includes all vertices, edges, and faces indices of this graph.
 */
export const disjointGraphsIndices = (graph) => {
	const edges_vertices = graph.edges_vertices || [];
	const faces_vertices = graph.faces_vertices || [];
	const vertices_edges = graph.vertices_edges
		? graph.vertices_edges
		: makeVerticesEdgesUnsorted({ edges_vertices });
	const vertices_vertices = graph.vertices_vertices
		? graph.vertices_vertices
		: makeVerticesVerticesUnsorted({ vertices_edges, edges_vertices });
	const vertices_faces = graph.vertices_faces
		? graph.vertices_faces
		: makeVerticesFacesUnsorted({ vertices_edges, faces_vertices });

	// everything needs to come from just the one array, whether it's
	// vertices_vertices or faces_faces or whatever, we need to pick just one.
	const vertices = invertFlatToArrayMap(connectedComponents(vertices_vertices));
	const edges = vertices
		.map((verts) => verts.flatMap((v) => vertices_edges[v]))
		.map(uniqueElements);
	const faces = vertices
		.map((verts) => verts.flatMap((v) => vertices_faces[v]))
		.map(uniqueElements);
	return Array.from(Array(vertices.length)).map((_, i) => ({
		vertices: vertices[i] || [],
		edges: edges[i] || [],
		faces: faces[i] || [],
	}));
};

/**
 * @description In the case that your graph is a disjoint union
 * of graphs, return an array of all graphs separated, where each
 * graph's components maintain their indices, the component arrays
 * will have holes.
 * @param {FOLD} graph a FOLD object
 * @returns {FOLD[]} an array of graphs where each graph is a disjoint subgraph
 * of the input, and the component array indices are not modified, so the
 * arrays have holes, but the indices are still relevant to the input graph.
 */
export const disjointGraphs = (graph) => {
	// get our disjoint graphs as lists of vertices, edges, and faces indices.
	const graphs = disjointGraphsIndices(graph);

	// get all relevant geometry keys from the graphs. any additional metadata
	// keys/values will not be carried over into the subgraphs.
	const verticesKeys = filterKeysWithPrefix(graph, "vertices");
	const edgesKeys = filterKeysWithPrefix(graph, "edges");
	const facesKeys = filterKeysWithPrefix(graph, "faces");

	// iterate through all graphs, create shallow copies of the vertices, edges,
	// and faces arrays but only include those indices which are a member of
	// the disjoint graph. we won't need to do any filtering inside each component
	// value array because we already established that graphs are disjoint,
	// and will not contain any spurious references in their value arrays
	return graphs.map(({ vertices, edges, faces }) => {
		const subgraph = {};
		verticesKeys.forEach((key) => {
			subgraph[key] = [];
			vertices.forEach((v) => {
				subgraph[key][v] = graph[key][v];
			});
		});
		edgesKeys.forEach((key) => {
			subgraph[key] = [];
			edges.forEach((v) => {
				subgraph[key][v] = graph[key][v];
			});
		});
		facesKeys.forEach((key) => {
			subgraph[key] = [];
			faces.forEach((v) => {
				subgraph[key][v] = graph[key][v];
			});
		});
		return subgraph;
	});
};
