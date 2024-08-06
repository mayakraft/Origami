/**
 * Rabbit Ear (c) Kraft
 */
import { EPSILON } from "../math/constant.js";
import { include, exclude, excludeS, includeS } from "../math/compare.js";
import { dot, resize2, add2, scale2 } from "../math/vector.js";
import { boundingBox } from "../math/polygon.js";
import { intersectLineLine } from "../math/intersect.js";
import {
	overlapLinePoint,
	overlapConvexPolygonPoint,
	overlapBoundingBoxes,
	overlapConvexPolygons,
} from "../math/overlap.js";
import { doRangesOverlap } from "../math/range.js";
import {
	chooseTwoPairs,
	clustersToReflexiveArrays,
	arrayArrayToLookupArray,
} from "../general/array.js";
import { getEdgesLine, edgesToLines2 } from "./edges/lines.js";
import { makeFacesPolygon } from "./make/faces.js";
import { makeEdgesCoords } from "./make/edges.js";
import { sweepFaces } from "./sweep.js";
import { invertFlatToArrayMap } from "./maps.js";
import { getVerticesClusters } from "./vertices/clusters.js";
// import {
// 	getSimilarEdges,
// } from "./edges/duplicate.js";

/**
 * @description Get all edges underneath a point in 2D.
 * @param {FOLD} graph a FOLD object
 * @param {[number, number] | [number, number, number]} point a 2D point
 * (the third dimension will be ignored).
 * @param {any} [domainFunction=includeS]
 */
export const getEdgesUnderPoint = (
	{ vertices_coords, edges_vertices },
	point,
	domainFunction = includeS,
) => {
	const edgesLine = edgesToLines2({ vertices_coords, edges_vertices });
	return edgesLine
		.map((_, e) => e)
		.filter((e) => overlapLinePoint(edgesLine[e], point, domainFunction));
};

/**
 * @description Given a point, get the indices of all faces which this point
 * lies inside. An optional domain function allows you to specify
 * inclusive or exclusive. This method is 2D only.
 * @param {FOLD} graph a FOLD object
 * @param {[number, number]} point the point to test
 * @param {Function} [domainFunction=include], an optional domain function
 * to specificy inclusive or exclusive.
 * @returns {number[]} an array of face indices
 */
export const getFacesUnderPoint = (
	{ vertices_coords, faces_vertices = [] },
	point,
	// vector = undefined, // would be nice to include this nudging behavior
	domainFunction = include,
) =>
	!vertices_coords
		? []
		: faces_vertices
				.map((fv, i) => ({ face: fv.map((v) => vertices_coords[v]), i }))
				.filter((f) => overlapConvexPolygonPoint(f.face, point, domainFunction).overlap)
				.map((el) => el.i);

/**
 * @description Given a point, get the index of a face that this point
 * exists within. In the case when the point lies along an edge or
 * vertex, an additional vector parameter can be used to nudge the point
 * by a very tiny amount, then there will be a preference to return the
 * index of the face which encloses the nudged point.
 * This is a 2D-only method, any z-axis data will be ignored.
 * @param {FOLD} graph a FOLD object
 * @param {[number, number]} point the point to test
 * @param {[number, number]} [vector] an optional vector, used in the case that
 * the point exists along an edge or a vertex.
 * @returns {number|undefined} the index of a face, or undefined
 * if the point does not lie inside any face.
 */
export const getFaceUnderPoint = ({ vertices_coords, faces_vertices }, point, vector) => {
	// The inclusive test includes the boundary around each face when computing
	// whether a point is inside a face or not. If this method returns:
	// - 0 solutions: then no solutions are possible. exit with no solution.
	// - 1 solution: we are done, exit and return this solution.
	// - 2 solutions: proceed with the rest of the algorithm.
	// this variable contains a list of face indices
	const facesInclusive = getFacesUnderPoint(
		{ vertices_coords, faces_vertices },
		point,
		include,
	);
	switch (facesInclusive.length) {
		case 0:
			return undefined;
		case 1:
			return facesInclusive[0];
		default:
			break;
	}

	// from this point on, we will use the optional vector parameter to nudge
	// the point and find the best match for a face. if user did not provide
	// a vector, we can't do anything, simply return the first face in the list.
	if (!vector) {
		return facesInclusive[0];
	}

	// continue search by nudging point.
	const nudgePoint = add2(point, scale2(vector, 1e-2));
	const polygons = facesInclusive.map((face) =>
		faces_vertices[face].map((v) => vertices_coords[v]),
	);

	// filter the list of face indices to include only those which
	// the nudged point lies inside of, excluding the area around the boundary.
	const facesExclusive = facesInclusive.filter(
		(_, i) => overlapConvexPolygonPoint(polygons[i], nudgePoint, exclude).overlap,
	);

	switch (facesExclusive.length) {
		// it's possible that the nudge went in the exact same direction as an edge,
		// in which case, we have to re-run an inclusive test with the nudged point,
		// then return the first face which satisfies the inclusive overlap test.
		case 0:
			return facesInclusive.find(
				(_, i) => overlapConvexPolygonPoint(polygons[i], nudgePoint, include).overlap,
			);

		// the ideal case, only one face exists underneath the nudged point
		case 1:
			return facesExclusive[0];

		// the nudged point lies inside of all these faces, so it shouldn't matter
		// this implies that there are faces that overlap each other.
		default:
			return facesExclusive[0];
	}
};

/**
 * @description For every face, get a list of all other faces
 * that geometrically overlap this face.
 * @param {FOLD} graph a FOLD object
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {number[][]} for every face, a list of overlapping face indices
 */
export const getFacesFacesOverlap = (
	{ vertices_coords, faces_vertices },
	epsilon = EPSILON,
) => {
	// these polygons have no collinear vertices
	const facesPolygon = makeFacesPolygon({ vertices_coords, faces_vertices }).map((poly) =>
		poly.map(resize2),
	);
	const facesBounds = facesPolygon.map((polygon) => boundingBox(polygon));

	/** @type {number[][]} */
	const facesFacesOverlap = faces_vertices.map(() => []);

	// store here string-separated face pair keys "a b" where a < b
	// to avoid doing duplicate work
	const history = {};

	// as we progress through the line sweep, maintain a list (hash table)
	// of the set of faces which are currently overlapping this sweep line.
	// at the beginning of an event, add new faces, at the end, remove faces.
	const setOfFaces = [];
	sweepFaces({ vertices_coords, faces_vertices }, 0, epsilon).forEach(
		({ start, end }) => {
			// these are new faces to the sweep line, add them to the set
			start.forEach((e) => {
				setOfFaces[e] = true;
			});

			// iterate through the set of all current faces crossed by the line,
			// but compare them only to the list of new faces which just joined.
			setOfFaces.forEach((_, f1) =>
				start
					.filter((f2) => f2 !== f1)
					.forEach((f2) => {
						// prevent ourselves from doing duplicate work
						const key = f1 < f2 ? `${f1} ${f2}` : `${f2} ${f1}`;
						if (history[key]) {
							return;
						}
						history[key] = true;

						// computing the bounding box overlap first will remove all cases
						// where the pair of faces are far away in the cross-axis.
						if (
							!overlapBoundingBoxes(facesBounds[f1], facesBounds[f2], epsilon) ||
							!overlapConvexPolygons(facesPolygon[f1], facesPolygon[f2], epsilon)
						) {
							return;
						}

						facesFacesOverlap[f1].push(f2);
						facesFacesOverlap[f2].push(f1);
					}),
			);

			// these are faces which are leaving the sweep line, remove them from the set
			end.forEach((e) => delete setOfFaces[e]);
		},
	);

	return facesFacesOverlap;
};

/**
 * @description For every edge, a list of other edge indices which are
 * collinear and overlap this edge.
 * @param {FOLD} graph a FOLD object
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {number[][]} for every edge, a list of other edges which
 * are collinear and overlap this edge.
 */
export const getEdgesEdgesCollinearOverlap = (
	{ vertices_coords, edges_vertices },
	epsilon = EPSILON,
) => {
	//
	const { lines, edges_line } = getEdgesLine(
		{ vertices_coords, edges_vertices },
		epsilon,
	);

	// we're going to project each edge onto the shared line, we can't use
	// each edge's vector, we have to use the edge's line's common vector.
	const edges_range = makeEdgesCoords({ vertices_coords, edges_vertices }).map(
		(points, e) => points.map((point) => dot(lines[edges_line[e]].vector, point)),
	);

	/** @type {number[][]} */
	const edgesEdgesOverlap = edges_vertices.map(() => []);

	invertFlatToArrayMap(edges_line)
		.flatMap((edges) => chooseTwoPairs(edges))
		.filter((pair) => {
			const [a, b] = pair.map((edge) => edges_range[edge]);
			return doRangesOverlap(a, b, epsilon);
		})
		.forEach(([a, b]) => {
			edgesEdgesOverlap[a].push(b);
			edgesEdgesOverlap[b].push(a);
		});

	return edgesEdgesOverlap;
};

/**
 * @description Given a FOLD graph with overlapping components, compute all
 * overlap between vertices and vertices, vertices and edges, edges and edges,
 * and faces and vertices. This leaves out faces and edges, but those can be
 * computed via edges-edges using faces_edges.
 * @param {FOLD} graph a FOLD object
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {{
 *   verticesVertices: boolean[][],
 *   verticesEdges: boolean[][],
 *   edgesEdges: boolean[][],
 *   facesVertices: boolean[][],
 * }}
 */
export const getOverlappingComponents = (
	{ vertices_coords, edges_vertices, faces_vertices },
	epsilon = EPSILON,
) => {
	// prepare edges and faces into their geometric forms (line, polygon)
	const vertices_coords2 = vertices_coords.map(resize2);
	const edgesLine = edgesToLines2({ vertices_coords, edges_vertices });
	const facesPolygon = faces_vertices.map((vertices) =>
		vertices.map((v) => vertices_coords2[v]),
	);

	const similarVertices = getVerticesClusters({ vertices_coords }, epsilon);
	const verticesVertices = arrayArrayToLookupArray(
		clustersToReflexiveArrays(similarVertices),
	);
	vertices_coords.forEach((_, v) => {
		verticesVertices[v][v] = true;
	});

	const verticesEdges = vertices_coords.map(() => []);
	vertices_coords.map((coord, v) =>
		edgesLine
			.map((_, e) => e)
			// .filter(e => overlapLinePoint(edgesLine[e], coord, excludeS, epsilon)
			// 	&& !edges_vertices[e].includes(v))
			.filter((e) => overlapLinePoint(edgesLine[e], coord, excludeS, epsilon))
			.forEach((e) => {
				verticesEdges[v][e] = true;
			}),
	);

	const edgesEdges = edges_vertices.map(() => []);
	edgesLine.map((line1, e1) =>
		edgesLine
			.map((_, e2) => e2)
			.filter(
				(e2) =>
					e1 !== e2 &&
					intersectLineLine(line1, edgesLine[e2], excludeS, excludeS, epsilon).point !==
						undefined,
			)
			.forEach((e2) => {
				edgesEdges[e1][e2] = true;
				edgesEdges[e2][e1] = true;
			}),
	);
	// edges_vertices.forEach((_, e) => { edgesEdges[e][e] = true; });

	const facesVertices = faces_vertices.map(() => []);
	facesPolygon.map((polygon, f) =>
		vertices_coords
			.map((_, v) => v)
			// .filter(v => !faces_vertices[f].includes(v)
			// 	&& overlapConvexPolygonPoint(polygon, vertices_coords[v], exclude, epsilon).overlap)
			.filter(
				(v) =>
					overlapConvexPolygonPoint(polygon, vertices_coords2[v], exclude, epsilon)
						.overlap,
			)
			.forEach((v) => {
				facesVertices[f][v] = true;
			}),
	);

	return {
		verticesVertices,
		verticesEdges,
		edgesEdges,
		facesVertices,
	};
};

/**
 * @description Given a FOLD object with overlapping components (typically a
 * folded form), get all overlapping faces edges.
 * @param {FOLD} graph a FOLD object
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {number[][]} for every face, a list of edge indices
 * which overlap this face.
 */
export const getFacesEdgesOverlap = (
	{ vertices_coords, edges_vertices, faces_vertices, faces_edges },
	epsilon = EPSILON,
) => {
	// - vertex overlaps: taken from both vertices-vertices and edges-vertices
	//   using faces_vertices[face]
	// - edge overlaps: taken from edges-edges using faces_edges[face] and
	//   vertex-edge overlaps
	// - point overlaps: taken from vertices-polygon overlaps. simple.

	const { verticesVertices, verticesEdges, edgesEdges, facesVertices } =
		getOverlappingComponents(
			{
				vertices_coords,
				edges_vertices,
				faces_vertices,
			},
			epsilon,
		);

	/**
	 * @description Given a face's vertices, and a list of vertex indices
	 * in no particular order, filter out any pairs of indices which are
	 * neighbors according to the ordering in face_vertices.
	 * @param {number[]} face_vertices the vertices of one face
	 * @param {number[]} indices a list of vertices from this face
	 * @returns {number[]} a copy of indices, where all neighbor indices
	 * have been removed.
	 */
	const filterFaceVerticesNeighbors = (face_vertices, indices) => {
		// create a lookup for all indices
		const lookup = {};
		indices.forEach((i) => {
			lookup[i] = true;
		});

		// iterate through face_vertices, take each adjacent pairwise combination
		// of vertices, if "lookup" contains both pairs of vertices, we can mark
		// both vertices as "false" (to be removed).
		face_vertices
			.map((v, i, arr) => [v, arr[(i + 1) % arr.length]])
			.filter(([a, b]) => lookup[a] && lookup[b])
			.forEach(([a, b]) => {
				lookup[a] = false;
				lookup[b] = false;
			});
		return indices.filter((i) => lookup[i]);
	};

	/**
	 * @description Get the vertices involved in the overlap between
	 * an edge and a face. Get the vertices of the edge which are a
	 * @example
	 * - an edge crossing a face at two vertices should return both
	 * of the face's vertices, but only if they are not adjacent in the face.
	 * - a square face with vertices (4, 5, 6, 7) and an edge
	 * between vertices (4, 6) should return vertices (4, 6).
	 * - a square face with vertices (4, 5, 6, 7) and an edge
	 * between vertices (8, 9) where 8 and 9 lie on top of 4 and 6 respectively
	 * should return vertices (4, 6).
	 * @param {number} edge an edge index
	 * @param {number} face a face index
	 * @returns {number[]} a list of vertices involved in the overlap
	 */
	const getVerticesOverlap = (edge, face) => {
		// a list of the face's vertices which this edge crosses and
		// overlaps somewhere in the interior (not endpoints) of the edge.
		const verticesInterior = faces_vertices[face].filter((v) => verticesEdges[v][edge]);

		// a list of the face's vertices which lie on top of one of the edge's
		// endpoints. This can include an edge endpoint itself
		// if it is also a face vertex.
		const [v0, v1] = edges_vertices[edge];
		const verticesEndpoints = faces_vertices[face].filter(
			(v) => verticesVertices[v][v0] || verticesVertices[v][v1],
		);

		// get the union of both arrays (no duplicates), run it through the filter
		// method which will remove vertices if they are neighbors in the face.
		return filterFaceVerticesNeighbors(
			faces_vertices[face],
			Array.from(new Set([...verticesEndpoints, ...verticesInterior])),
		);
	};

	const getEdgesOverlap = (edge, face) => {
		const [v0, v1] = edges_vertices[edge];
		const edgesEndpoints = faces_edges[face].filter(
			(e) => verticesEdges[v0][e] || verticesEdges[v1][e],
		);
		const edgesMiddle = faces_edges[face].filter((e) => edgesEdges[edge][e]);
		return Array.from(new Set([...edgesEndpoints, ...edgesMiddle]));
	};

	const getPointsOverlap = (edge, face) =>
		edges_vertices[edge].filter((v) => facesVertices[face][v]);

	// for every face, gather all intersected edges and vertices and filter
	//   by the formula i've written many times, either: edges + vertces = 2
	//   where vertices are not adjacent
	/** @type {number[][]} */
	const facesEdgesOverlap = faces_vertices.map(() => []);
	faces_vertices.forEach((_, face) =>
		edges_vertices.forEach((__, edge) => {
			const vertices = getVerticesOverlap(edge, face);
			const edges = getEdgesOverlap(edge, face);
			const points = getPointsOverlap(edge, face);
			if (vertices.length + edges.length + points.length !== 2) {
				return;
			}
			// filter faces which have one edge being crossed and
			// one vertex being overlapped, and if that edge's edges_vertices
			// contains this vertex, then the "overlap" is simply a collinear overlap.
			if (vertices.length === 1 && edges.length === 1) {
				if (edges_vertices[edges[0]].includes(vertices[0])) {
					return;
				}
			}

			facesEdgesOverlap[face].push(edge);
		}),
	);

	return facesEdgesOverlap;
};

// a valid face has 2 of these conditions:
// - face_vertices which are crossed by this edge
// - face_edges which are crossed by this edge
// - this edge's one or two endpoints lie inside of this face

// the data we have available is:
// - vertices-vertices overlap: are edge endpoints touching or not?
// - edges-vertices-overlap, exclusive.
// - edges-edges, exclusive
// - vertices-polygon-overlap, exclusive. (must be exclusive)
// and how this plays out in terms of between a face and an edge
// - vertex overlaps: taken from both vertices-vertices and edges-vertices
//   using faces_vertices[face]
// - edge overlaps: taken from edges-edges using faces_edges[face]
// - point overlaps: taken from vertices-polygon overlaps. simple.

// alternatively:
// - edges-vertices-overlap, exclusive. this edge, iterate over face_vertices
//   exclude case where 2 vertices make up an edge
// - edges-edges, exclusive
// - vertices-polygon-overlap, inclusive
// this does not work because vertices-polygon overlap now includes cases where
// both points of the same edge lie along a single polygon boundary edge.

/**
 * @description Given a FOLD object with overlapping components (typically a
 * folded form), get all overlapping faces edges.
 * @param {FOLD} graph a FOLD object
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {number[][]} for every edge, a list of face indices
 * which overlap this edge.
 */
export const getEdgesFacesOverlap = (
	{ vertices_coords, edges_vertices, faces_vertices, faces_edges },
	epsilon = EPSILON,
) => {
	const edgesFaces = edges_vertices.map(() => []);
	const facesEdges = getFacesEdgesOverlap(
		{
			vertices_coords,
			edges_vertices,
			faces_vertices,
			faces_edges,
		},
		epsilon,
	);
	facesEdges.forEach((edges, face) =>
		edges.forEach((edge) => {
			edgesFaces[edge].push(face);
		}),
	);
	return edgesFaces;
};
