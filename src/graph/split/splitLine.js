/**
 * Rabbit Ear (c) Kraft
 */
import { EPSILON } from "../../math/constant.js";
import { includeL } from "../../math/compare.js";
import { remapKey } from "../maps.js";
import { intersectLineAndPoints } from "../intersect.js";

/**
 * @description
 * @param {FOLD} graph a fold object in creasePattern or foldedForm
 * @param {VecLine2} line a line/ray/segment in vector origin form
 * @param {Function} [lineDomain=() => true] the function which characterizes
 * "line" parameter into a line, ray, or segment.
 * @param {[number, number][]} [interiorPoints=[]] in the case of a ray or segment,
 * place in here the endpoint(s), and they will be included in the result.
 * @param {number} [epsilon=1e-6] an optional epsilon
 */
export const splitLineToSegments = (
	{ vertices_coords, edges_vertices, faces_vertices, faces_edges },
	{ vector, origin },
	lineDomain = includeL,
	interiorPoints = [],
	epsilon = EPSILON,
) => {
	// intersect the line with the graph, vertices, edges, and faces info
	const { vertices, edges, faces } = intersectLineAndPoints(
		{ vertices_coords, edges_vertices, faces_vertices, faces_edges },
		{ vector, origin },
		lineDomain,
		interiorPoints,
		epsilon,
	);

	// sum the number of all these intersection events inside of this face.
	// any face that contains only 2 intersection events is simple enough
	// for us to create a new straight edge between the pair of points.
	// delete all faces which contain anything other than 2 points.
	faces
		.map((face) =>
			["vertices", "edges", "points"]
				.map((key) => face[key].length)
				.reduce((a, b) => a + b, 0),
		)
		.map((count, f) => (count !== 2 ? f : undefined))
		.filter((a) => a !== undefined)
		.forEach((f) => delete faces[f]);

	// our segments will be a little mini graph, with components:
	// - vertices: with any combination of { a, b, t, point, vertex, edge, face}
	//   - where vertices from a vertex have { a, point, vertex}
	//   - vertices from an edge have { a, b, point, edge }
	//   - vertices from inside a face have { t, point, face }
	// - edges_vertices: pairs of indices relating to "vertices" array.
	// - edges_face: for each of these new edges, which face FROM THE INPUT GRAPH
	//   does this edge lie inside? For example, this is useful to reference the
	//   winding of the face (flipped or no) and give an assignment based on this
	/** @type {{ vertices: any[], edges_face: number[], edges_vertices?: any }} */
	const segments = {
		vertices: [],
		// because of the previous delete operation on this faces array, we can do this
		edges_face: faces.map((_, face) => face).filter((a) => a !== undefined),
	};

	// keep track of any vertices we have already created and added to the graph,
	// if one of these exists, use its reference, don't create a duplicate entry.
	const vertexVertex = {};
	const edgeVertex = {};

	segments.edges_vertices = faces
		.map((el, face) => {
			const vertsVerts = el.vertices.map(({ a, vertex }) => {
				const index = segments.vertices.length;
				if (vertexVertex[vertex] !== undefined) {
					return vertexVertex[vertex];
				}
				segments.vertices.push({ a, vertex, point: [...vertices_coords[vertex]] });
				vertexVertex[vertex] = index;
				return index;
			});
			const edgesVerts = el.edges.map(({ a, b, point, edge }) => {
				const index = segments.vertices.length;
				if (edgeVertex[edge] !== undefined) {
					return edgeVertex[edge];
				}
				segments.vertices.push({ a, b, point, edge });
				edgeVertex[edge] = index;
				return index;
			});
			const pointsVerts = el.points.map(({ point, t }) => {
				const index = segments.vertices.length;
				segments.vertices.push({ point, t, face });
				return index;
			});
			// create an edge_vertices by joining all results from the new vertex
			// indices from the vertices/edges/points. it will result in only 2.
			return vertsVerts.concat(edgesVerts).concat(pointsVerts);
		})
		.filter((a) => a !== undefined);

	return {
		vertices,
		edges,
		faces,
		segments,
	};
};

/**
 * @description Given a 2D line and a graph with vertices in 2D, split
 * the line at every vertex/edge, resulting in a graph containing only
 * the new line, prepared as a list of vertices and edges. The indices
 * of the resulting graph are made into arrays with a large hole
 * at the start making sure there is no overlap with the existing graph's
 * indices. This allows the two graphs to very simply be able to be merged.
 * The edge indices will make use of existing vertices when possible, so,
 * edges_vertices may reference vertex indices from the source graph.
 * @param {FOLD} graph a fold object in creasePattern or foldedForm
 * @param {VecLine2} line a line/ray/segment in vector origin form
 * @param {Function} [lineDomain=() => true] the function which characterizes
 * "line" parameter into a line, ray, or segment.
 * @param {[number, number][]} [interiorPoints=[]] in the case of a ray or segment,
 * place in here the endpoint(s), and they will be included in the result.
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {{
 *   vertices?: number[],
 *   edges_vertices?: number[][],
 *   edges_collinear?: boolean[],
 *   edges_face?: number[],
 * }} graph a FOLD graph containing only the line's geometry,
 * as a list of vertices and edges, where all new geometry's indices are
 * indexed to start after the input graph's components end, so there is no
 * confusion as to which graph's indices we are referring.
 * - vertices: for each vertex, this is the result of the
 *   intersection algorithm which calculated this vertex's coordinate.
 *   including a "point" property on all entries, which is the vertex's coords.
 * - edges_vertices: new edges, as pairs of vertices, can include references
 *   to new vertices or vertices from the input graph.
 * - edges_face: note "face" not "faces", which face does this new edge lie in
 * - edges_collinear: list of edges from the input graph containing a boolean,
 *   true if the edge lies collinear to the input line.
 */
export const splitLineIntoEdges = (
	{ vertices_coords, edges_vertices, faces_vertices, faces_edges },
	line,
	lineDomain = includeL,
	interiorPoints = [],
	epsilon = EPSILON,
) => {
	if (!vertices_coords || !edges_vertices || !faces_vertices) {
		return undefined;
	}

	// intersect the line with the graph, vertices, edges, and faces info.
	const { vertices, segments } = splitLineToSegments(
		{ vertices_coords, edges_vertices, faces_vertices, faces_edges },
		line,
		lineDomain,
		interiorPoints,
		epsilon,
	);

	// rename "vertices" into any name that includes a "_" so that when
	// we run "remapKey" it will include this array in the remapping.
	// treat is as a FOLD type, so we can pass it into remapKey
	const segmentsAsFOLD = {
		...segments,
		vertices_info: segments.vertices,
	};
	delete segmentsAsFOLD.vertices;

	// create a map that moves the vertices and edges so that there is a large
	// hole at the start of the array and that the indices start after the
	// current graph's components. this allows the two arrays to be later merged.
	// additionally, vertices will be mapped so that the final vertex list
	// excludes those vertices which are pointing to existing vertex indices
	// from the input graph; only including vertices which will become new points.
	let count = 0;
	const vertexMap = segmentsAsFOLD.vertices_info.map((el) =>
		el.vertex === undefined ? vertices_coords.length + count++ : el.vertex,
	);
	const edgeMap = segmentsAsFOLD.edges_vertices.map((_, i) => edges_vertices.length + i);
	remapKey(segmentsAsFOLD, "vertices", vertexMap);
	remapKey(segmentsAsFOLD, "edges", edgeMap);

	// we are done requiring the vertices_ array have an underbar. rename it back
	segmentsAsFOLD.vertices = segmentsAsFOLD.vertices_info;
	delete segmentsAsFOLD.vertices_info;

	// this also populates the coords for vertices which already exist in the
	// input graph, we just need to check the input graph and delete these.
	segmentsAsFOLD.vertices
		.map((_, v) => v)
		.filter((v) => vertices_coords[v] !== undefined)
		.forEach((v) => delete segmentsAsFOLD.vertices[v]);

	// using the overlapped vertices, make a list of edges collinear to the line
	const verticesCollinear = vertices.map((v) => v !== undefined);
	const edges_collinear = edges_vertices.map(
		(verts) => verticesCollinear[verts[0]] && verticesCollinear[verts[1]],
	);

	return {
		...segmentsAsFOLD,
		edges_collinear,
	};
};
