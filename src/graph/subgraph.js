/**
 * Rabbit Ear (c) Kraft
 */
import { foldKeys, filterKeysWithPrefix, filterKeysWithSuffix } from "../fold/spec.js";
import { uniqueSortedNumbers } from "../general/array.js";

/**
 * @description Given a self-relational array like faces_faces or
 * vertices_vertices, and a list of indices with which to keep,
 * copy the array so that only those elements found in "indices"
 * are copied over, including the data in the inner most arrays.
 * This will produce an array with holes, but the inner arrays
 * will have no holes.
 * @param {number[][]} array_array a self-relational index array,
 * such as "faces_faces".
 * @param {number[]} indices a list of indices to keep.
 * @returns {number[][]} a copy of the array_array but excluding
 * all indices which were not included in the "indices" parameter set.
 */
export const selfRelationalArraySubset = (array_array, indices) => {
	// quick lookup, is an index to be included?
	const hash = {};
	indices.forEach((f) => {
		hash[f] = true;
	});

	// only include those faces which are in the group, both at
	// the top level and inside the inside reference arrays.
	const result = [];
	indices.forEach((i) => {
		result[i] = array_array[i].filter((j) => hash[j]);
	});
	return result;
};

/**
 * @description Create a subgraph from a graph, with shallow pointers
 * to arrays by providing a list of vertices, edges, and faces which
 * will be carried over.
 * This subgraph method is exclusive, meaning, if an edge is carried
 * over but its vertices are not explicitly included, those vertices
 * will not exist, and the edge's edges_vertices entry will be empty.
 * The subgraph component arrays will contain holes, meaning the
 * indices are preserved, making it useful for performing operations
 * on a subgraph, then carrying that information back to the original.
 * If you want to close all holes and remap indices, call normalize().
 * @param {FOLD} graph a FOLD object
 * @param {object} indicesToKeep an object containing:
 * { vertices: [], edges: [], faces: [] }
 * all of which contains a list of indices to keep in the copied graph.
 * the values can be integers or integer-strings, doesn't matter.
 * @returns {FOLD} a shallow copy of the graph parameter provided.
 */
export const subgraphExclusive = (graph, indicesToKeep = {}) => {
	const indices = {
		vertices: [],
		edges: [],
		faces: [],
		...indicesToKeep,
	};
	const components = Object.keys(indices);
	// shallow copy, excluding all geometry arrays, to preserve metadata.
	const copy = { ...graph };
	foldKeys.graph.forEach((key) => delete copy[key]);
	delete copy.file_frames;
	// create a lookup which will be used when a component is a suffix
	// and we need to filter out elements which don't appear in other arrays
	const lookup = {};
	components.forEach((component) => {
		lookup[component] = {};
	});
	components.forEach((component) =>
		indices[component].forEach((i) => {
			lookup[component][i] = true;
		}),
	);
	// get all prefix arrays ("edges_") and suffix arrays ("_edges")
	// for all geometry component type.
	const keys = {};
	components.forEach((c) => {
		filterKeysWithPrefix(graph, c).forEach((key) => {
			keys[key] = {};
		});
		filterKeysWithSuffix(graph, c).forEach((key) => {
			keys[key] = {};
		});
	});
	components.forEach((c) => {
		filterKeysWithPrefix(graph, c).forEach((key) => {
			keys[key].prefix = c;
		});
		filterKeysWithSuffix(graph, c).forEach((key) => {
			keys[key].suffix = c;
		});
	});
	// use prefixes and suffixes to make sure we initialize all
	// geometry array types. this even supports out of spec arrays,
	// like: faces_matrix, colors_edges...
	Object.keys(keys).forEach((key) => {
		copy[key] = [];
	});
	Object.keys(keys).forEach((key) => {
		const { prefix, suffix } = keys[key];
		// if prefix exists, filter outer array elements (creating holes)
		// if suffix exists, filter inner elements using the quick lookup
		if (prefix && suffix) {
			indices[prefix].forEach((i) => {
				copy[key][i] = graph[key][i].filter((j) => lookup[suffix][j]);
			});
		} else if (prefix) {
			indices[prefix].forEach((i) => {
				copy[key][i] = graph[key][i];
			});
		} else if (suffix) {
			copy[key] = graph[key].map((arr) => arr.filter((j) => lookup[suffix][j]));
		} else {
			copy[key] = graph[key];
		}
	});
	return copy;
};

/**
 * @description Create a subgraph from a graph, with shallow pointers
 * to arrays by providing a list of vertices, edges, and faces which
 * will be carried over.
 * This subgraph method is inclusive, meaning, if an edge or a face
 * is included, even if the user didn't explicitly include its vertices,
 * they will be included anyway.
 * The subgraph component arrays will contain holes, meaning the
 * indices are preserved, making it useful for performing operations
 * on a subgraph, then carrying that information back to the original.
 * If you want to close all holes and remap indices, call normalize().
 * @param {FOLD} graph a FOLD object
 * @param {object} indicesToKeep an object containing:
 * { vertices: [], edges: [], faces: [] }
 * all of which contains a list of indices to keep in the copied graph.
 * the values can be integers or integer-strings, doesn't matter.
 * @returns {FOLD} a shallow copy of the graph parameter provided.
 */
export const subgraph = (graph, indicesToKeep = {}) => {
	const indices = {
		vertices: [],
		edges: [],
		faces: [],
		...indicesToKeep,
	};
	const lookup = { vertices: {}, edges: {}, faces: {} };
	// add vertices to the lookup table, all vertices from
	// vertices, edges' edges_vertices, and faces' faces_vertices.
	indices.vertices.forEach((v) => {
		lookup.vertices[v] = true;
	});
	indices.edges.forEach((e) => {
		lookup.edges[e] = true;
	});
	indices.edges.forEach((edge) =>
		graph.edges_vertices[edge].forEach((v) => {
			lookup.vertices[v] = true;
		}),
	);
	indices.faces.forEach((f) => {
		lookup.faces[f] = true;
	});
	indices.faces.forEach((face) =>
		graph.faces_vertices[face].forEach((v) => {
			lookup.vertices[v] = true;
		}),
	);
	// now, our selection of vertices is complete.
	// use this to check all edges and faces, and if the full set of
	// the element's vertices are included, include it as well.
	graph.faces_vertices
		.map((_, f) => f)
		.filter((f) =>
			graph.faces_vertices[f]
				.map((v) => lookup.vertices[v])
				.reduce((a, b) => a && b, true),
		)
		.forEach((f) => {
			lookup.faces[f] = true;
		});
	graph.edges_vertices
		.map((_, e) => e)
		.filter((e) =>
			graph.edges_vertices[e]
				.map((v) => lookup.vertices[v])
				.reduce((a, b) => a && b, true),
		)
		.forEach((e) => {
			lookup.edges[e] = true;
		});
	return subgraphExclusive(graph, {
		vertices: Object.keys(lookup.vertices),
		edges: Object.keys(lookup.edges),
		faces: Object.keys(lookup.faces),
	});
};

/**
 * @description Create a subgraph from a graph, with shallow pointers
 * to arrays by providing a list of faces which will be carried over,
 * and this list of faces will determine which vertices and edges
 * get carried over as well.
 * The subgraph component arrays will contain holes, meaning the
 * indices are preserved, making it useful for performing operations
 * on a subgraph, then carrying that information back to the original.
 * @param {FOLD} graph a FOLD object
 * @param {number[]} faces a list of face indices which will
 * be carried over into the subgraph.
 * @returns {FOLD} a shallow copy of the graph parameter provided.
 */
export const subgraphWithFaces = (graph, faces) => {
	// vertices will be take from one place:
	// - faces_vertices, every vertex involved in the subset of faces
	// there is no way to take it from edges_vertices, as edges_vertices
	// itself needs to be determined by this "vertices" array.
	let vertices = [];
	if (graph.faces_vertices) {
		vertices = uniqueSortedNumbers(faces.flatMap((f) => graph.faces_vertices[f]));
	}
	// edges will be taken from one of two places, either:
	// - faces edges, the edges involved in the subset of faces
	// - edges_vertices where BOTH vertices involved are in "vertices".
	// otherwise, no edges will be carried over.
	let edges = [];
	if (graph.faces_edges) {
		edges = uniqueSortedNumbers(faces.flatMap((f) => graph.faces_edges[f]));
	} else if (graph.edges_vertices) {
		const vertices_lookup = {};
		vertices.forEach((v) => {
			vertices_lookup[v] = true;
		});
		edges = graph.edges_vertices
			.map((v, i) => (vertices_lookup[v[0]] && vertices_lookup[v[1]] ? i : undefined))
			.filter((a) => a !== undefined);
	}
	return subgraphExclusive(graph, {
		vertices,
		edges,
		faces,
	});
};

export const subgraphWithVertices = (graph, vertices = []) => {
	// these will be in the form of index:value number:boolean.
	// later to be converted into a list of indices.
	const components = { vertices: [], edges: [] };
	vertices.forEach((v) => {
		components.vertices[v] = true;
	});
	if (graph.vertices_edges) {
		components.vertices.forEach((_, v) =>
			graph.vertices_edges[v].forEach((e) => {
				components.edges[e] = true;
			}),
		);
	}
	if (graph.edges_vertices) {
		components.edges.forEach((_, e) =>
			graph.edges_vertices[e].forEach((v) => {
				components.vertices[v] = true;
			}),
		);
	}
	return subgraphExclusive(graph, {
		vertices: components.vertices
			.map((v, i) => (v ? i : undefined))
			.filter((a) => a !== undefined),
		edges: components.edges
			.map((e, i) => (e ? i : undefined))
			.filter((a) => a !== undefined),
	});
};
