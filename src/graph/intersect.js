/**
 * Rabbit Ear (c) Kraft
 */
import { EPSILON } from "../math/constant.js";
import { exclude, includeL, includeS } from "../math/compare.js";
import { magSquared, dot2, cross2, subtract2, resize2 } from "../math/vector.js";
import { pointsToLine2 } from "../math/convert.js";
import { intersectLineLine } from "../math/intersect.js";
import { overlapConvexPolygonPoint } from "../math/overlap.js";
import { clusterSortedGeneric } from "../general/cluster.js";
import { makeFacesEdgesFromVertices } from "./make/facesEdges.js";

/**
 * @description Intersect a line/ray/segment with a FOLD graph but only
 * consider the graph's vertices.
 * @param {FOLD} graph a fold object in creasePattern or foldedForm
 * @param {VecLine2} line a line/ray/segment in vector origin form
 * @param {Function} lineDomain the function which characterizes the line
 * into a line, ray, or segment.
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {(number|undefined)[]} an array matching the length of vertices,
 * in the case of an intersection, the number is the parameter along the line's
 * vector, if there is no intersection the value is undefined.
 */
export const intersectLineVertices = (
	{ vertices_coords },
	{ vector, origin },
	lineDomain = includeL,
	epsilon = EPSILON,
) => {
	const lineMagSq = magSquared(vector);
	const lineMag = Math.sqrt(lineMagSq);
	if (lineMag < epsilon) {
		return Array(vertices_coords.length).fill(undefined);
	}
	return vertices_coords
		.map((coord) => subtract2(coord, origin))
		.map((vec) => {
			const parameter = dot2(vec, vector) / lineMagSq;
			return Math.abs(cross2(vec, vector)) < epsilon &&
				lineDomain(parameter, epsilon / lineMag)
				? parameter
				: undefined;
		});
};

/**
 * @description Intersect a line/ray/segment with a FOLD graph but only
 * consider the graph's vertices and edges.
 * Intersections are endpoint-exclusive, and will not include collinear edges.
 * Vertex intersection information is available under the "vertices" key,
 * and collinear edges can be found by checking if both vertices are overlapped.
 * @param {FOLD} graph a fold object in creasePattern or foldedForm
 * @param {VecLine2} line a line/ray/segment in vector origin form
 * @param {Function} lineDomain the function which characterizes "line"
 * parameter into a line, ray, or segment.
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {{ vertices: number[], edges: LineLineEvent[] }} an object
 * summarizing the intersections with edges and vertices:
 * - vertices: for every vertex, a number or undefined. If there is an
 *   intersection with the line, the number is the parameter along the line's
 *   vector, if there is no intersection the value is undefined.
 * - edges: a list of intersections, undefined if no intersection or collinear,
 *   or an intersection object which describes:
 *   - a: {number} the input line's parameter of the intersection
 *   - b: {number} the edge's parameter of the intersection
 *   - point: {number[]} the intersection point
 */
export const intersectLineVerticesEdges = (
	{ vertices_coords, edges_vertices },
	{ vector, origin },
	lineDomain = includeL,
	epsilon = EPSILON,
) => {
	if (!vertices_coords) {
		return { vertices: [], edges: [] };
	}

	// for every vertex, does that vertex lie along the line.
	const vertices = intersectLineVertices(
		{ vertices_coords },
		{ vector, origin },
		lineDomain,
		epsilon,
	);

	if (!edges_vertices) {
		return { vertices, edges: [] };
	}

	// for every edge, a list of its vertices that lie along the line (0, 1, or 2)
	// if an edge has 1-2 overlapping vertices, we can skip the intersection call
	// if an edge has no overlapping vertices, we must run the edge-intersection.
	const edgesVerticesOverlap = edges_vertices.map((ev) =>
		ev
			.map((v) => (vertices[v] !== undefined ? v : undefined))
			.filter((a) => a !== undefined),
	);

	// if the edge contains no vertices which overlap the line,
	// perform a line-segment intersection, otherwise do nothing.
	// it's possible the intersection returns no result, which looks like
	// an object with all undefined values, if so, replace these objects
	// with a single undefined.
	// Additionally, add a { vertex: undefined } key/value to all intersections.
	// const edgesNoOverlapIntersection = edges_vertices
	const edges = edges_vertices
		.map((ev) => ev.map((v) => vertices_coords[v]))
		.map(([s0, s1], e) =>
			edgesVerticesOverlap[e].length === 0
				? intersectLineLine(
						{ vector, origin },
						pointsToLine2(s0, s1),
						lineDomain,
						includeS,
					)
				: undefined,
		)
		.map((res) => (res === undefined || !res.point ? undefined : res));

	// if our line crosses the edge at one vertex, we still want to include the
	// intersection information, but we can construct it ourselves without
	// running the intersection algorithm. this should save us a little time.
	// const edges = edgesVerticesOverlap
	// 	.map((verts, e) => (verts.length === 1
	// 		? ({
	// 			a: (dot2(vector, subtract2(vertices_coords[verts[0]], origin))
	// 				/ magSquared(vector)),
	// 			b: edges_vertices[e][0] === verts[0] ? 0 : 1,
	// 			point: [...vertices_coords[verts[0]]],
	// 			vertex: verts[0],
	// 		})
	// 		: edgesNoOverlapIntersection[e]));

	return { vertices, edges };
};

/**
 * @description Intersect a line/ray/segment with a FOLD graph, and return
 * intersect information with vertices, edges, and faces.
 * - Vertex intersection is padded with an epsilon, inclusive to this region.
 * - Edge intersection is endpoint-exclusive, if there is a vertex intersection
 *   look for it in the "vertices" array. Also, edges parallel with the line
 *   are excluded, find these collinear edges by checking "vertices" array.
 * - Face intersections very simply include all vertex and edge intersections
 *   which are included in the face. This can cause some issues, for example,
 *   two vertices which are neighbors are simply a collinear edge,
 *   "filterCollinearFacesData" will handle these, but if you are dealing with
 *   non-convex polygons you might have a lot of work parsing this data.
 * @param {FOLD} graph a FOLD object
 * @param {VecLine2} line a line/ray/segment in vector origin form
 * @param {Function} lineDomain the function which characterizes "line"
 * parameter into a line, ray, or segment.
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {{
 *   vertices: number[],
 *   edges: LineLineEvent[],
 *   faces: (FaceEdgeEvent | FaceVertexEvent)[][],
 * }} an object summarizing the intersections with vertices, edges, and faces:
 * - vertices: for every vertex, true or false, does the vertex overlap the line
 * - edges: a list of intersections, undefined if no intersection or collinear,
 *   or an intersection object which describes:
 *   - a: {number} the input line's parameter of the intersection
 *   - b: {number} the edge's parameter of the intersection
 *   - point: {number[]} the intersection point
 * - faces: for every intersected face, an array of intersection objects,
 *   objects similar to but slightly different from those in the "edges" array.
 *   Basically there are two types of intersection: "vertex" and "edge":
 *   - a: {number} the input line's parameter of the intersection
 *   - b: {number|undefined} the edge's parameter of the intersection, or
 *     undefined if intersected with a vertex
 *   - point: {number[]} the intersection point
 *   - vertex: {number|undefined} if the intersection crosses a vertex
 *   - edge: {number|undefined} if the intersection crosses an edge
 */
export const intersectLine = (
	{ vertices_coords, edges_vertices, faces_vertices, faces_edges },
	{ vector, origin },
	lineDomain = includeL,
	epsilon = EPSILON,
) => {
	// intersect the line with every edge. the intersection should be inclusive
	// with respect to the segment endpoints. this will cause duplicate points
	// for every face when a line crosses exactly at its vertex, but this is
	// necessary because we need to know this point, so we will filter later.
	const { vertices, edges } = intersectLineVerticesEdges(
		{ vertices_coords, edges_vertices },
		{ vector, origin },
		lineDomain,
		epsilon,
	);

	if (!faces_vertices) {
		return { vertices, edges, faces: [] };
	}

	if (!faces_edges) {
		// eslint-disable-next-line no-param-reassign
		faces_edges = makeFacesEdgesFromVertices({ edges_vertices, faces_vertices });
	}

	// for every face, get every edge of that face's intersection with our line,
	// filter out any edges which had no intersection.
	// it's possible for faces to have 0, 1, 2, 3... any number of intersections.
	const facesEdgeIntersections = faces_edges.map((fe) =>
		fe
			.map((edge) => (edges[edge] ? { ...edges[edge], edge } : undefined))
			.filter((a) => a !== undefined),
	);
	const facesVertexIntersections = faces_vertices.map((fv) =>
		fv
			.map((vertex) =>
				vertices[vertex] !== undefined ? { a: vertices[vertex], vertex } : undefined,
			)
			.filter((a) => a !== undefined),
	);

	const facesIntersections = faces_vertices.map((_, v) => [
		...facesVertexIntersections[v],
		...facesEdgeIntersections[v],
	]);

	// this epsilon function will compare the object's "a" property
	// which is the intersections's "a" parameter (line parameter).
	const epsilonEqual = (p, q) => Math.abs(p.a - q.a) < epsilon * 2;

	// For every face, sort and cluster the face's intersection events using
	// our input line's parameter. This results in, for every face,
	// its intersection events are clustered inside of sub arrays.
	// Finally, filter out any invalid intersections from the face which
	// includes two vertices that form a collinear edge
	const faces = facesIntersections
		.map((intersections) => intersections.sort((p, q) => p.a - q.a))
		.map((intersections) =>
			clusterSortedGeneric(intersections, epsilonEqual).map((cluster) =>
				cluster.map((index) => intersections[index]),
			),
		)
		.map((clusters) => clusters.map((cluster) => cluster[0]));

	return { vertices, edges, faces };
};

/**
 * @description Intersect a line/ray/segment with a FOLD graph and
 * check a list of input points to see which faces each point lies inside,
 * returning the intersect information with vertices, edges, and faces.
 * @param {FOLD} graph a FOLD object
 * @param {VecLine2} line a line/ray/segment in vector origin form
 * @param {Function} lineDomain the function which characterizes "line"
 * parameter into a line, ray, or segment.
 * @param {[number, number][]} [interiorPoints=[]] in the case of a ray or segment,
 * include the endpoint(s) and they will be included if they appear in a face.
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {{
 *   vertices: number[],
 *   edges: LineLineEvent[],
 *   faces: {
 *     vertices: FaceVertexEvent[],
 *     edges: FaceEdgeEvent[],
 *     points: FacePointEvent[],
 *   }[],
 * }} an object summarizing the intersections with vertices, edges, and faces:
 * - vertices: for every vertex, true or false, does the vertex overlap the line
 * - edges: a list of intersections, undefined if no intersection or collinear,
 *   or an intersection object which describes:
 *   - a: {number} the input line's parameter of the intersection
 *   - b: {number} the edge's parameter of the intersection
 *   - point: {number[]} the intersection point
 *   - vertex: {number|undefined} in the case of an intersection which crosses
 *     a vertex, indicate which vertex, otherwise, mark it as undefined.
 * - faces: for every intersected face, a list of intersection objects
 *   filtered into three categories: "vertices", "edges", "points" where
 *   each category holds a list of objects with intersection information:
 *   - vertices: { a, point, vertex }
 *   - edges: { a, b, point, edge }
 *   - points: { t, point }
 *   where the data in each object is:
 *   - point: {number[]} the intersection point
 *   - a: {number} the input line's parameter of the intersection
 *   - b: {number} the edge's parameter of the intersection
 *   - t: {number[]} the point-in-polygon's overlap parameters
 *   - vertex: {number} if the intersection crosses a vertex
 *   - edge: {number} if the intersection crosses an edge
 */
export const intersectLineAndPoints = (
	{ vertices_coords, edges_vertices, faces_vertices, faces_edges },
	{ vector, origin },
	lineDomain = includeL,
	interiorPoints = [],
	epsilon = EPSILON,
) => {
	// intersect the line with every edge. the intersection should be inclusive
	// with respect to the segment endpoints. this will cause duplicate points
	// for every face when a line crosses exactly at its vertex, but this is
	// necessary because we need to know this point, so we will filter later.
	const { vertices, edges, faces } = intersectLine(
		{ vertices_coords, edges_vertices, faces_vertices, faces_edges },
		{ vector, origin },
		lineDomain,
		epsilon,
	);

	if (!vertices_coords || !faces_vertices) {
		return { vertices, edges, faces: [] };
	}

	// If there are ray or segment points, we have to query every single face,
	// does a point lie inside of the face, and if so, include it in this list.
	// The result is an object containing a "point" {number[]} and "t" {number[]}
	// this "t" parameter can be used later to trilaterate the position again.
	const vertices_coords2 = vertices_coords.map(resize2);
	/** @type {{ point: [number, number], overlap: boolean, t: number[] }[][]} */
	const facesInteriorPoints = !interiorPoints.length
		? faces.map(() => [])
		: faces.map((_, face) => {
				const polygon = faces_vertices[face].map((v) => vertices_coords2[v]);
				const pointsOverlap = interiorPoints.map((point) => ({
					...overlapConvexPolygonPoint(polygon, point, exclude, epsilon),
					point,
				}));
				return pointsOverlap.filter((el) => el.overlap);
			});

	// Every face in this list will contain a list of intersection events
	// that occur inside this face. The events are one of three categories:
	// - edges: intersections event that crosses over an edge
	// - vertices: intersections that cross exactly over a vertex
	// - point: an object describing a point lying interior to the face
	const newFacesData = faces.map((intersections, f) => ({
		edges: intersections
			.map((el) =>
				"edge" in el && "a" in el && "b" in el && "point" in el ? el : undefined,
			)
			.filter((a) => a !== undefined),
		vertices: intersections
			.map((el) => ("vertex" in el && "a" in el ? el : undefined))
			.filter((a) => a !== undefined),
		points: facesInteriorPoints[f],
	}));

	return { vertices, edges, faces: newFacesData };
};

/**
 * @description This is a helper method to accompany the intersection
 * methods. Having already computed vertices/edges/faces intersections
 * (via. intersectLineAndPoints), pass the result in here, and this method
 * will filter out any collinear edges from the faces, edges are not stored
 * but vertices are, so it will filter out pairs of vertices which
 * form a collinear edge.
 * @param {FOLD} graph a FOLD object
 * @param {{
 *   vertices: number[],
 *   edges: LineLineEvent[],
 *   faces: {
 *     vertices: FaceVertexEvent[],
 *     edges: FaceEdgeEvent[],
 *     points: FacePointEvent[],
 *   }[],
 * }} the result of intersectLineAndPoints, modified in place
 */
export const filterCollinearFacesData = ({ edges_vertices }, { vertices, faces }) => {
	// For the upcoming filtering, we need a list of collinear edges, but in
	// the form of vertices, so, pairs of vertices which form a collinear edge.
	const collinearVertices = [];
	edges_vertices
		.map((verts) => vertices[verts[0]] !== undefined && vertices[verts[1]] !== undefined)
		.map((collinear, edge) => (collinear ? edge : undefined))
		.filter((a) => a !== undefined)
		.map((edge) => edges_vertices[edge])
		.forEach((verts) => collinearVertices.push(verts));

	const facesVertices = faces.map((face) => face.vertices.map(({ vertex }) => vertex));
	const facesVerticesHash = [];
	facesVertices.forEach((_, f) => {
		facesVerticesHash[f] = {};
	});
	facesVertices.forEach((verts, f) =>
		verts.forEach((v) => {
			facesVerticesHash[f][v] = true;
		}),
	);

	faces.forEach((face, f) => {
		const removeVertices = {};
		collinearVertices
			.filter((pair) => facesVerticesHash[f][pair[0]] && facesVerticesHash[f][pair[1]])
			.forEach((pair) => {
				removeVertices[pair[0]] = true;
				removeVertices[pair[1]] = true;
			});
		// eslint-disable-next-line no-param-reassign
		faces[f].vertices = face.vertices.filter((el) => !removeVertices[el.vertex]);
	});
};
