/**
 * Rabbit Ear (c) Kraft
 */
import {
	makeVerticesToEdge,
	makeVerticesToFace,
	makeEdgesToFace,
} from "../make/lookup.js";

/**
 * @description Validate that the winding around each vertex
 * matches across arrays.
 * @param {FOLD} graph a FOLD object
 * @returns {string[]} list of errors, empty if none
 */
export const validateVerticesWinding = ({
	vertices_vertices,
	vertices_edges,
	vertices_faces,
	edges_vertices,
	faces_vertices,
	faces_edges,
}) => {
	const errors = [];
	const verticesToEdge = edges_vertices
		? makeVerticesToEdge({ edges_vertices })
		: undefined;
	const verticesToFace = faces_vertices
		? makeVerticesToFace({ faces_vertices })
		: undefined;
	const edgesToFace = faces_edges ? makeEdgesToFace({ faces_edges }) : undefined;
	try {
		if (vertices_vertices && vertices_edges && verticesToEdge) {
			const vAndE = vertices_vertices
				.flatMap((vertices, v) =>
					vertices
						.map((v2) => [v, v2])
						.map((pair) => pair.join(" "))
						.map((key) => verticesToEdge[key])
						.map((edge, i) =>
							vertices_edges[v][i] !== edge
								? [v, i, edge, vertices_edges[v][i]]
								: undefined,
						),
				)
				.filter((a) => a !== undefined)
				.map(
					([a, b, e1, e2]) =>
						`windings of vertices_vertices and vertices_edges at [${a}][${b}] do not match (${e1} ${e2})`,
				);
			errors.push(...vAndE);
		}

		if (vertices_vertices && vertices_faces && verticesToFace) {
			const vAndF = vertices_vertices
				.flatMap((vertices, v) =>
					vertices
						.map((vertex) => [v, vertex])
						// .map((vertex, index, arr) => [arr[(index + 1) % arr.length], v, vertex])
						.map((three) => three.join(" "))
						.map((key) => verticesToFace[key])
						// single not-equals to be able to compare null == undefined as true
						.map((face, i) =>
							vertices_faces[v][i] != face
								? [v, i, face, vertices_faces[v][i]]
								: undefined,
						),
				)
				.filter((a) => a !== undefined)
				.map(
					([a, b, f1, f2]) =>
						`windings of vertices_vertices and vertices_faces at [${a}][${b}] do not match (${f1} ${f2})`,
				);
			errors.push(...vAndF);
		}

		if (vertices_edges && vertices_faces && edgesToFace) {
			const eAndF = vertices_edges
				.flatMap((edges, v) =>
					edges
						.map((edge, index, arr) => [arr[(index + 1) % arr.length], edge])
						.map((pair) => pair.join(" "))
						.map((key) => edgesToFace[key])
						// single not-equals to be able to compare null == undefined as true
						.map((face, i) =>
							vertices_faces[v][i] != face
								? [v, i, face, vertices_faces[v][i]]
								: undefined,
						),
				)
				.filter((a) => a !== undefined)
				.map(
					([a, b, f1, f2]) =>
						`windings of vertices_edges and vertices_faces at [${a}][${b}] do not match (${f1} ${f2})`,
				);
			errors.push(...eAndF);
		}
	} catch (error) {
		errors.push("vertices winding validation failed due to bad index access");
	}
	return errors;
};

/**
 * @description Validate that the winding around each face definition matches
 * across arrays.
 * @param {FOLD} graph a FOLD object
 * @returns {string[]} list of errors, empty if none
 */
export const validateFacesWinding = ({
	edges_vertices,
	edges_faces,
	faces_vertices,
	faces_edges,
	faces_faces,
}) => {
	const errors = [];
	const verticesToEdge = edges_vertices
		? makeVerticesToEdge({ edges_vertices })
		: undefined;
	const verticesToFace = faces_vertices
		? makeVerticesToFace({ faces_vertices })
		: undefined;
	try {
		if (faces_vertices && faces_edges && verticesToEdge) {
			const vAndE = faces_vertices
				.flatMap((vertices, f) =>
					vertices
						.map((_, i, arr) => [0, 1].map((n) => arr[(i + n) % arr.length]))
						.map((pair) => pair.join(" "))
						.map((key) => verticesToEdge[key])
						.map((edge, j) =>
							faces_edges[f][j] !== edge ? [f, j, edge, faces_edges[f][j]] : undefined,
						),
				)
				.filter((a) => a !== undefined)
				.map(
					([a, b, e1, e2]) =>
						`windings of faces_vertices and faces_edges at [${a}][${b}] do not match (${e1} ${e2})`,
				);
			errors.push(...vAndE);
		}

		if (faces_vertices && faces_faces && verticesToFace) {
			const vAndF = faces_vertices
				.flatMap((vertices, i) =>
					vertices
						.map((_, index, arr) => [1, 0].map((n) => arr[(index + n) % arr.length]))
						.map((pair) => pair.join(" "))
						.map((key) => verticesToFace[key])
						// single not-equals to be able to compare null == undefined as true
						.map((face, j) =>
							faces_faces[i][j] != face ? [i, j, face, faces_faces[i][j]] : undefined,
						),
				)
				.filter((a) => a !== undefined)
				.map(
					([a, b, f1, f2]) =>
						`windings of faces_vertices and faces_faces at [${a}][${b}] do not match (${f1} ${f2})`,
				);
			errors.push(...vAndF);
		}

		if (faces_edges && faces_faces && edges_faces) {
			const eAndF = faces_edges
				.flatMap((edges, i) =>
					edges
						.map((edge) => edges_faces[edge].filter((f) => f !== i).shift())
						// single not-equals to be able to compare null == undefined as true
						.map((face, j) =>
							faces_faces[i][j] != face ? [i, j, face, faces_faces[i][j]] : undefined,
						),
				)
				.filter((a) => a !== undefined)
				.map(
					([a, b, f1, f2]) =>
						`windings of faces_edges and faces_faces at [${a}][${b}] do not match (${f1} ${f2})`,
				);
			errors.push(...eAndF);
		}
	} catch (error) {
		errors.push("faces winding validation failed due to bad index access");
	}
	return errors;
};

/**
 * @description Ensure that component indices across different suffix
 * values match in their winding orders. For example, a face's vertices in
 * faces_vertices should match it's edges in faces_edges where index 0
 * vertex is in the edge in index 0 from its faces_edges.
 * @param {FOLD} graph a FOLD object
 * @returns {string[]} a list of errors if they exist
 */
export const validateWinding = (graph) => {
	const verticesWindingErrors = validateVerticesWinding(graph);
	const facesWindingErrors = validateFacesWinding(graph);
	return verticesWindingErrors.concat(facesWindingErrors);
};
