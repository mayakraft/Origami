/**
 * Rabbit Ear (c) Kraft
 */
import { EPSILON } from "../math/constant.js";
import { epsilonEqual } from "../math/compare.js";
import { uniqueElements } from "../general/array.js";
import { clusterScalars } from "../general/cluster.js";
import { makeVerticesEdgesUnsorted } from "./make/verticesEdges.js";
// import { invertArrayToFlatMap } from "./maps.js";

/**
 * @description convert a faces_vertices into an edge-style list, where
 * each face only has two vertices, the min and max vertex along the
 * spanning axis. This is useful for projecting faces down to an axis.
 */
const edgeifyFaces = ({ vertices_coords, faces_vertices }, axis = 0) =>
	faces_vertices.map((vertices) => [
		vertices.reduce((a, b) =>
			vertices_coords[a][axis] < vertices_coords[b][axis] ? a : b,
		),
		vertices.reduce((a, b) =>
			vertices_coords[a][axis] > vertices_coords[b][axis] ? a : b,
		),
	]);

/**
 * @description Perform a line sweep through the vertices of a graph,
 * the default direction is to sweep along the +X axis.
 * This method will sort the vertices along the sweep direction and
 * group those which have a similar value within an epsilon.
 * This is not interchangeable with getVerticesClusters, this only clusters
 * vertices along one axis, it does not make vertices clusters.
 * @param {FOLD} graph a FOLD object
 * @param {number} [axis=0] which axis to sweep along
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {{ t: number, vertices: number[] }[]} an array of event objects,
 * each event contains:
 * - t: the position along the axis
 * - vertices: the vertices (one or more) at this event along the axis
 */
export const sweepVertices = ({ vertices_coords }, axis = 0, epsilon = EPSILON) =>
	clusterScalars(
		vertices_coords.map((p) => p[axis]),
		epsilon,
	).map((vertices) => ({
		vertices,
		t: vertices.reduce((p, c) => p + vertices_coords[c][axis], 0) / vertices.length,
	}));

/**
 * @description This is the sweep method used by sweepEdges and sweepFaces.
 * note: sweepFaces constructs new edges that span the entire
 * face, so this has no relation to the graph's original edges_vertices.
 * @param {FOLD} graph FOLD format graph with edges_vertices defining
 * connections between indices in the "values" array.
 * @param {number[]} values an array of scalars constructed from the
 * vertices_coords array where for each coord, only the relevant value is taken
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {SweepEvent[]} an array of sweep line events, indicating at every
 * event a list of values which start, end, or are currently overlapping.
 */
export const sweepValues = (
	{ edges_vertices, vertices_edges },
	values,
	epsilon = EPSILON,
) => {
	if (!vertices_edges) {
		// eslint-disable-next-line no-param-reassign
		vertices_edges = makeVerticesEdgesUnsorted({ edges_vertices });
	}
	const edgesValues = edges_vertices.map((edge) => edge.map((e) => values[e]));

	// is the edge degenerate along the sweep axis?
	// (both values are an epsilon away from each other)
	const isDegenerate = edgesValues.map(([a, b]) => epsilonEqual(a, b, epsilon));

	// for each edge, which of its two vertices is first along the sweep axis.
	// this does not handle the degenerate case, the upcoming object will
	// combine this and the degenerate information into a more complete version.
	const edgesDirection = edgesValues.map(([a, b]) => Math.sign(a - b));

	// for each edge, for each of its two vertices, what is the ordering of
	// each of its vertices, where each vertex is stored as:
	// -1: first point's coordinate is smaller
	//  0: coordinates are same (within an epsilon)
	// +1: second point's coordinate is smaller
	const edgesVertexSide = edges_vertices.map(([v1, v2], i) =>
		isDegenerate[i]
			? { [v1]: 0, [v2]: 0 }
			: { [v1]: edgesDirection[i], [v2]: -edgesDirection[i] },
	);

	// within each cluster, if there are a lot of consecutive lines orthogonal
	// to the sweep axis, there will be repeats of edges when converting these
	// vertices into their adjacent edges by looking at vertices_edges.
	// we have to pile these into a Set and extract an array of unique values.
	return (
		clusterScalars(values, epsilon)
			// ensure that every vertex is used in the graph, filter out any vertices
			// which aren't found in vertices_edges, and if this creates empty clusters
			// with no vertices, filter out these clusters
			.map((vertices) => vertices.filter((v) => vertices_edges[v]))
			.filter((vertices) => vertices.length)
			.map((vertices) => ({
				vertices,
				// values will be equivalent within an epsilon, we can choose to either
				// grab just one, grab the mode value, or average them all together.
				t: vertices.reduce((p, c) => p + values[c], 0) / vertices.length,
				start: uniqueElements(
					vertices.flatMap((v) =>
						vertices_edges[v].filter((edge) => edgesVertexSide[edge][v] <= 0),
					),
				),
				end: uniqueElements(
					vertices.flatMap((v) =>
						vertices_edges[v].filter((edge) => edgesVertexSide[edge][v] >= 0),
					),
				),
			}))
	);
};

/**
 * @description Perform a line sweep through the edges of a graph,
 * This method will create an array of events, each event will either
 * "start" edges or "end" edges, and for those edges which are orthogonal
 * to the sweep axis within an epsilon, they will only exist inside one
 * event and be present in both the "start" and the "end" arrays.
 * @param {FOLD} graph a FOLD object
 * @param {number} [axis=0] which axis to sweep along
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {SweepEvent[]} an array of event objects, each event contains:
 * - t: the position along the axis
 * - vertices: the vertices (one or more) at this event along the axis
 * - start: the edges which begin at this event in the sweep
 * - end: the edges which end at this event in the sweep
 */
export const sweepEdges = (
	{ vertices_coords, edges_vertices, vertices_edges },
	axis = 0,
	epsilon = EPSILON,
) =>
	sweepValues(
		{ edges_vertices, vertices_edges },
		vertices_coords.map((p) => p[axis]),
		epsilon,
	);

/**
 * @description Perform a line sweep through the faces of a graph,
 * This method will create an array of events, each event will either
 * "start" faces or "end" faces. In the case of degenerate faces whose
 * vertices all lie on a line and that line is orthogonal to the sweep
 * axis, within an epsilon, these faces will only exist inside one
 * event and be present in both the "start" and the "end" arrays.
 * @param {FOLD} graph a FOLD object
 * @param {number} [axis=0] which axis to sweep along
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {SweepEvent[]} an array of event objects, each event contains:
 * - t: the position along the axis
 * - vertices: the vertices (one or more) at this event along the axis
 * - start: the faces which begin at this event in the sweep
 * - end: the faces which end at this event in the sweep
 */
export const sweepFaces = (
	{ vertices_coords, faces_vertices },
	axis = 0,
	epsilon = EPSILON,
) =>
	sweepValues(
		// get the min/max vertex for each face along the sweep axis.
		// this will serve as the "edge" that spans the breadth of the face
		{ edges_vertices: edgeifyFaces({ vertices_coords, faces_vertices }, axis) },
		vertices_coords.map((p) => p[axis]),
		epsilon,
	);

/**
 * @description Perform a line sweep through all components of a graph,
 * This method will create an array of events, each event occurs at
 * a vertex (or vertices), and each event will either "start" or "end"
 * edges and faces. In the case of degenerate edges or faces whose
 * vertices all lie on a line orthogonal to the sweep axis within an epsilon,
 * These components will only exist inside one event and be present in both
 * "start" and "end" arrays.
 * @param {FOLD} graph a FOLD object
 * @param {number} [axis=0] which axis to sweep along
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {{
 *   vertices: number[],
 *   t: number,
 *   edges: { start: number[], end: number[] },
 *   faces: { start: number[], end: number[] },
 * }[]} an array of event objects, each event contains:
 * - t: the position along the axis
 * - vertices: the vertices (one or more) at this event along the axis
 * - edges, faces: where each contains:
 *   - start: the index which begin at this event in the sweep
 *   - end: the index which end at this event in the sweep
 */
export const sweep = (
	{ vertices_coords, edges_vertices, faces_vertices },
	axis = 0,
	epsilon = EPSILON,
) => {
	const values = vertices_coords.map((p) => p[axis]);
	// "faces_vertices" contains only two vertices for each face,
	// and can be treated just like edges_vertices.
	const faces_edgeVertices = edgeifyFaces({ vertices_coords, faces_vertices }, axis);
	const vertices_edges = makeVerticesEdgesUnsorted({ edges_vertices });
	const vertices_faces = makeVerticesEdgesUnsorted({
		edges_vertices: faces_edgeVertices,
	});
	const edgesValues = edges_vertices.map((edge) => edge.map((e) => values[e]));
	const facesValues = faces_edgeVertices.map((face) => face.map((e) => values[e]));
	// is the span degenerate? (both values are an epsilon away from each other)
	const edgesDegenerate = edgesValues.map(([a, b]) => epsilonEqual(a, b, epsilon));
	const facesDegenerate = facesValues.map(([a, b]) => epsilonEqual(a, b, epsilon));
	// which vertex comes first along the sweep axis
	const edgesDirection = edgesValues.map(([a, b]) => Math.sign(a - b));
	const facesDirection = facesValues.map(([a, b]) => Math.sign(a - b));
	// for each edge, for each of its two vertices, is the vertex +1, 0, -1?
	// -1: first point's coordinate is smaller
	//  0: coordinates are same (within an epsilon)
	// +1: second point's coordinate is smaller
	const edgesVertexSide = edges_vertices.map(([v1, v2], i) =>
		edgesDegenerate[i]
			? { [v1]: 0, [v2]: 0 }
			: { [v1]: edgesDirection[i], [v2]: -edgesDirection[i] },
	);
	const facesVertexSide = faces_vertices.map(([v1, v2], i) =>
		facesDegenerate[i]
			? { [v1]: 0, [v2]: 0 }
			: { [v1]: facesDirection[i], [v2]: -facesDirection[i] },
	);
	// within each cluster, if there are a lot of consecutive lines orthogonal
	// to the sweep axis, there will be repeats of edges when converting these
	// vertices into their adjacent edges by looking at vertices_edges.
	// we have to pile these into a Set and extract an array of unique values.
	return clusterScalars(values, epsilon).map((vertices) => ({
		vertices,
		t: vertices.reduce((p, c) => p + values[c], 0) / vertices.length,
		edges: {
			start: uniqueElements(
				vertices
					.filter((v) => vertices_edges[v] !== undefined)
					.flatMap((v) =>
						vertices_edges[v].filter((edge) => edgesVertexSide[edge][v] <= 0),
					),
			),
			end: uniqueElements(
				vertices
					.filter((v) => vertices_edges[v] !== undefined)
					.flatMap((v) =>
						vertices_edges[v].filter((edge) => edgesVertexSide[edge][v] >= 0),
					),
			),
		},
		faces: {
			start: uniqueElements(
				vertices
					.filter((v) => vertices_faces[v] !== undefined)
					.flatMap((v) =>
						vertices_faces[v].filter((face) => facesVertexSide[face][v] <= 0),
					),
			),
			end: uniqueElements(
				vertices
					.filter((v) => vertices_faces[v] !== undefined)
					.flatMap((v) =>
						vertices_faces[v].filter((face) => facesVertexSide[face][v] >= 0),
					),
			),
		},
	}));
};

/**
 *
 */
// export const sweepRanges = (ranges, epsilon = EPSILON) => {
// 	const values = vertices_coords.map(p => p[axis]);

// };

/**
 * @param {FOLD} graph a FOLD object
 * @param {number} axis the direction of movement the sweep line sweeps
 * @param {number} [epsilon=1e-6] an optional epsilon
 */
// export const edgeSweep = (
// 	{ vertices_coords, edges_vertices, vertices_edges },
// 	axis = 0,
// 	epsilon = EPSILON,
// ) => {
// 	if (!vertices_edges) {
// 		vertices_edges = makeVerticesEdgesUnsorted({ edges_vertices });
// 	}

// 	// let's call the "sweep axis" the direction that the sweep line travels.
// 	// let's call the "cross axis" the direction of the sweep line itself.
// 	const crossAxis = axis === 0 ? 1 : 0;

// 	// these are the values of the vertices_coords along the sweep axis
// 	const sweepValues = vertices_coords.map(p => p[axis]);
// 	const crossValues = vertices_coords.map(p => p[crossAxis]);

// 	// cluster the vertices along the sweep axis
// 	const clusters_vertices = clusterScalars(sweepValues, epsilon)
// 		.map(vertices => vertices.sort((a, b) => crossValues[a] - crossValues[b]));
// 	const vertices_cluster = invertArrayToFlatMap(clusters_vertices);

// 	console.log("clusters_vertices", clusters_vertices);
// 	console.log("vertices_cluster", vertices_cluster);

// 	const edgesValues = edges_vertices.map(edge => edge.map(e => sweepValues[e]));
// 	// is the span degenerate along the sweep axis (both endpoints similar)
// 	const edgesDegenerate = edgesValues.map(([a, b]) => epsilonEqual(a, b, epsilon));
// 	// which vertex comes first along the sweep axis
// 	const edgesDirection = edgesValues.map(([a, b]) => Math.sign(a - b));

// 	// for each edge, for each of its two vertices, is the vertex +1, 0, -1?
// 	// -1: first point's coordinate is smaller
// 	//  0: coordinates are same (within an epsilon)
// 	// +1: second point's coordinate is smaller
// 	const edgesVertexSide = edges_vertices
// 		.map(([v1, v2], i) => (edgesDegenerate[i]
// 			? { [v1]: 0, [v2]: 0 }
// 			: { [v1]: edgesDirection[i], [v2]: -edgesDirection[i] }));

// 	// build an initial ordering of the edges along the cross axis.
// 	// const set0Verts = clusters_vertices[0];
// 	const clusters_vertices_edges = clusters_vertices
// 		.map(vertices => vertices.map(v => vertices_edges[v]));

// 	console.log("clusters_vertices_edges", clusters_vertices_edges);

// 	const edgeSeen = {};
// 	const clusterEdgeSpan = clusters_vertices_edges.map(cluster => {
// 		const start = {};
// 		const end = {};
// 		cluster.forEach((edges, i) => edges.forEach(edge => {
// 			if (!edgeSeen[edge]) {
// 				start[edge] = i;
// 				edgeSeen[edge] = true;
// 			} else {
// 				end[edge] = i;
// 				delete edgeSeen[edge];
// 			}
// 		}));
// 		return { start, end };
// 	});

// 	console.log("clusterEdgeSpan", clusterEdgeSpan);

// 	// const fencepost = Array.from(Array(clusters_vertices_edges.length - 1))
// 	// 	.map((_, i) => );

// 	clusters_vertices.forEach(vertices => {
// 		// const edges = vertices.map(v => vertices_edges[v]);
// 		const start = uniqueElements(vertices
// 			.filter(v => vertices_edges[v] !== undefined)
// 			.flatMap(v => vertices_edges[v]
// 				.filter(edge => edgesVertexSide[edge][v] <= 0)));
// 		const end = uniqueElements(vertices
// 			.filter(v => vertices_edges[v] !== undefined)
// 			.flatMap(v => vertices_edges[v]
// 				.filter(edge => edgesVertexSide[edge][v] >= 0)));
// 	});

// 	console.log("edgesVertexSide", edgesVertexSide);
// 	// within each cluster, if there are a lot of consecutive lines orthogonal
// 	// to the sweep axis, there will be repeats of edges when converting these
// 	// vertices into their adjacent edges by looking at vertices_edges.
// 	// we have to pile these into a Set and extract an array of unique sweepValues.
// 	return clusters_vertices
// 		.map(vertices => ({
// 			vertices,
// 			t: vertices.reduce((p, c) => p + sweepValues[c], 0) / vertices.length,
// 			start: uniqueElements(vertices
// 				.filter(v => vertices_edges[v] !== undefined)
// 				.flatMap(v => vertices_edges[v]
// 					.filter(edge => edgesVertexSide[edge][v] <= 0))),
// 			end: uniqueElements(vertices
// 				.filter(v => vertices_edges[v] !== undefined)
// 				.flatMap(v => vertices_edges[v]
// 					.filter(edge => edgesVertexSide[edge][v] >= 0))),
// 		}));
// };
