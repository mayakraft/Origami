/**
 * Rabbit Ear (c) Kraft
 */

/**
 * @description Add an edge to a graph, and only update the edges_ properties,
 * making a graph invalid assuming fields like vertices_vertices faces_edges.
 * For creasePatterns, call planarize() to fix the graph.
 * For foldedForms, use an alternate method like splitFaceWithEdge.
 * @param {FOLD} graph a FOLD object
 * @param {[number, number]} vertices the two vertices to connect and make a new edge
 * @param {number[]} [faces=[]] two faces to become the edges_faces
 * @param {string} [assignment="U"] this will become edges_assignment
 * @param {number} [foldAngle=0] this will become edges_foldAngle
 * @returns {number} the index of the new edge
 */
export const addEdge = (graph, vertices, faces = [], assignment = "U", foldAngle = 0) => {
	if (!graph.edges_vertices) {
		graph.edges_vertices = [];
	}

	// the index of our new edge
	const edge = graph.edges_vertices.length;

	// construct data for our new edge (vertices, assignent, foldAngle...)
	graph.edges_vertices[edge] = vertices;
	if (graph.edges_faces) {
		graph.edges_faces[edge] = faces;
	}
	if (graph.edges_assignment) {
		graph.edges_assignment[edge] = assignment;
	}
	if (graph.edges_foldAngle) {
		graph.edges_foldAngle[edge] = foldAngle;
	}

	return edge;
};

/**
 * @description Add an isolated edge to a graph, specifically, this is a
 * face-isolated edge, it has no face associations, it's possible to connect
 * two existing vertices with this method, and these two vertice's existing
 * data will be maintained (and appended to, although, in an unsorted manner!)
 * @param {FOLD} graph a FOLD object
 * @param {[number, number]} vertices the two vertices to connect and make a new edge
 * @param {string} [assignment="U"] this will become edges_assignment
 * @param {number} [foldAngle=0] this will become edges_foldAngle
 * @returns {number} the index of the new edge
 */
export const addIsolatedEdge = (graph, vertices, assignment = "U", foldAngle = 0) => {
	const edge = addEdge(graph, vertices, [], assignment, foldAngle);

	// No face data is to be touched.
	// Regarding vertex data, do not overwrite existing vertex arrays
	// for our two vertices, instead, ensure it exists and then append this new
	// data to the arrays.
	// This makes this method able to be
	if (graph.vertices_vertices) {
		// ensure the arrays for these vertices exist
		vertices
			.filter((vertex) => !graph.vertices_vertices[vertex])
			.forEach((vertex) => {
				graph.vertices_vertices[vertex] = [];
			});
		const otherVertices = [vertices[1], vertices[0]];
		vertices.forEach((vertex, i) => {
			graph.vertices_vertices[vertex].push(otherVertices[i]);
		});
	}
	if (graph.vertices_edges) {
		// ensure the arrays for these vertices exist
		vertices
			.filter((vertex) => !graph.vertices_edges[vertex])
			.forEach((vertex) => {
				graph.vertices_edges[vertex] = [];
			});
		vertices.forEach((vertex) => {
			graph.vertices_edges[vertex].push(edge);
		});
	}
	if (graph.vertices_faces) {
		// ensure the arrays for these vertices exist. that is all. empty arrays.
		vertices
			.filter((vertex) => !graph.vertices_faces[vertex])
			.forEach((vertex) => {
				graph.vertices_faces[vertex] = [];
			});
	}
	return edge;
};

/**
 * @description Add an edge to a graph, ideally a graph without faces,
 * update the edges_ properties, and update the affected vertices_vertices
 * and vertices_edges unsorted, which will break sorting order in any
 * graph that contains faces.
 * @param {FOLD} graph a FOLD object
 * @param {number[]} vertices the two vertices to connect and make a new edge
 * @param {number[]} [faces=[]] two faces to become the edges_faces
 * @param {string} [assignment="U"] this will become edges_assignment
 * @param {number} [foldAngle=0] this will become edges_foldAngle
 * @returns {number} the index of the new edge
 */
// export const addUnsortedEdge = (
// 	graph,
// 	vertices,
// 	faces = [],
// 	assignment = "U",
// 	foldAngle = 0,
// ) => {
// 	const edge = addEdge(graph, vertices, faces, assignment, foldAngle);

// 	// for each of the two vertices_vertices, add the opposite vertex.
// 	if (graph.vertices_vertices) {
// 		const opposite = [vertices[1], vertices[0]];
// 		vertices.forEach((v, i) => {
// 			graph.vertices_vertices[v] = Array
// 				.from(new Set([...graph.vertices_vertices[v], opposite[i]]));
// 		});
// 	}

// 	// for each of the two vertices_edges, add this new edge
// 	if (graph.vertices_edges) {
// 		vertices.forEach(v => {
// 			graph.vertices_edges[v] = Array
// 				.from(new Set([...graph.vertices_edges[v], edge]));
// 		});
// 	}

// 	// we will not be creating or modifying any faces, so no changes to
// 	// vertices_faces, edges_faces, faces_vertices, or faces_edges.
// 	return edge;
// };
