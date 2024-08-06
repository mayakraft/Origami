/**
 * Rabbit Ear (c) Kraft
 */

/**
 * @description In the case where two identical but opposite arrays exist,
 * this will test to make sure that every item in one array appears in the
 * other; for example, in vertices_faces and faces_vertices.
 */
const pairwiseReferenceTest = (a_b, b_a, aName, bName) => {
	try {
		// when we iterate through each array at its second level depth, we need
		// to be sure to filter out any null or undefined, as for example it's
		// requird by the spec to include undefined inside of vertices_faces,
		// but only inside the inner arrays. at the top level no nulls should exist.
		const abHash = {};
		a_b.forEach((_, a) => {
			abHash[a] = {};
		});
		a_b.forEach((arr, a) =>
			arr
				.filter((el) => el !== null && el !== undefined)
				.forEach((b) => {
					abHash[a][b] = true;
				}),
		);

		const baHash = {};
		b_a.forEach((_, b) => {
			baHash[b] = {};
		});
		b_a.forEach((arr, b) =>
			arr
				.filter((el) => el !== null && el !== undefined)
				.forEach((a) => {
					baHash[b][a] = true;
				}),
		);

		const abErrors = a_b.flatMap((arr, a) =>
			arr
				.filter((el) => el !== null && el !== undefined)
				.map((b) =>
					!baHash[b] || !baHash[b][a]
						? `${bName}_${aName}[${b}] missing ${a} referenced in ${aName}_${bName}`
						: undefined,
				)
				.filter((el) => el !== undefined),
		);
		const baErrors = b_a.flatMap((arr, b) =>
			arr
				.filter((el) => el !== null && el !== undefined)
				.map((a) =>
					!abHash[a] || !abHash[a][b]
						? `${aName}_${bName}[${a}] missing ${b} referenced in ${bName}_${aName}`
						: undefined,
				)
				.filter((el) => el !== undefined),
		);

		return abErrors.concat(baErrors);
	} catch (error) {
		return ["pairwise reference validation failed due to bad index access"];
	}
};

/**
 * @description This will test a reflexive array, like vertices_vertices,
 * to ensure that every reference also exists
 */
const reflexiveTest = (a_a, aName) => pairwiseReferenceTest(a_a, a_a, aName, aName);

/**
 * @description test reflexive component relationships.
 * @param {FOLD} graph a FOLD object
 * @returns {string[]} a list of errors if they exist
 */
export const validateReflexive = (graph) => {
	const reflexiveErrors = [];
	if (graph.faces_vertices && graph.vertices_faces) {
		reflexiveErrors.push(
			...pairwiseReferenceTest(
				graph.faces_vertices,
				graph.vertices_faces,
				"faces",
				"vertices",
			),
		);
	}
	if (graph.edges_vertices && graph.vertices_edges) {
		reflexiveErrors.push(
			...pairwiseReferenceTest(
				graph.edges_vertices,
				graph.vertices_edges,
				"edges",
				"vertices",
			),
		);
	}
	if (graph.faces_edges && graph.edges_faces) {
		reflexiveErrors.push(
			...pairwiseReferenceTest(graph.faces_edges, graph.edges_faces, "faces", "edges"),
		);
	}

	if (graph.vertices_vertices) {
		reflexiveErrors.push(...reflexiveTest(graph.vertices_vertices, "vertices"));
	}
	if (graph.faces_faces) {
		reflexiveErrors.push(...reflexiveTest(graph.faces_faces, "faces"));
	}
	return reflexiveErrors;
};
