/**
 * Rabbit Ear (c) Kraft
 */
import {
	epsilonEqual,
} from "../../math/compare.js";
import {
	pointsToLine2,
} from "../../math/convert.js";
import {
	scale2,
	cross2,
	add2,
	subtract2,
	resize2,
	average2,
} from "../../math/vector.js";
import {
	edgeFoldAngleIsFlatFolded,
} from "../../fold/spec.js";
import {
	invertFlatMap,
} from "../maps.js";

/**
 * @param {[number, number][]} points the points which make up the edge
 * in order, where point[0] is at parameter 0, point[1] is at parameter 1.
 * @param {number} parameter
 * @returns {[number, number]} a recalculated point
 */
export const recalculatePointAlongEdge = (points, parameter) => {
	const edgeLine = pointsToLine2(points[0], points[1]);
	return add2(edgeLine.origin, scale2(edgeLine.vector, parameter));
};

/**
 * @description The fold operation begins by splitting the graph with new
 * edge segments and assigning those segments. This method takes care of
 * the edges which already existed in the graph, collinear to the fold line.
 * Depending on the assignment of these collinear edges, they may be
 * involved in the fold and require reasssignment, or ignored.
 * Ignored collinear edges are those already with a "M" or "V" where both
 * adjacent faces lie on one side of the fold line in the folded form.
 * @param {FOLD} graph a FOLD object, with edges_faces among other arrays
 * @param {{
 *   assignment: string,
 *   foldAngle: number,
 *   oppositeAssignment: string,
 *   oppositeFoldAngle: number,
 * }} assignment info about assignment
 * @param {boolean[]} faces_winding the winding direction for each face
 * @param {{ edges?: { new: number[] }, vertices?: { intersect: number[] } }} splitGraphResult
 * @returns {{ collinear: number[], reassigned: number[] }} a list
 * of edge indices which were reassigned
 */
export const reassignCollinearEdges = (
	{ edges_vertices, edges_faces, edges_assignment, edges_foldAngle },
	{ assignment, foldAngle, oppositeAssignment, oppositeFoldAngle },
	faces_winding,
	splitGraphResult,
) => {
	// edges which were created from the splitGraph method can be skipped,
	// they have already been assigned and shouldn't be considered "collinear"
	// anyway. "collinear" refers to preexisting collinear to the input line.
  const newEdgeMap = invertFlatMap(splitGraphResult.edges.new);

	// using the overlapped vertices, get a list of edges collinear to the line
	// these (old) vertex indices will match with the original input graph.
	const verticesCollinear = splitGraphResult.vertices.intersect
		.map(v => v !== undefined);

	// these are new edge indices, relating to the graph after modification.
	// skip the edges which were created in splitGraphResult.edges.new
	// only keep the edges which existed before the split occurred.
	const collinearEdges = edges_vertices
		.map(verts => verticesCollinear[verts[0]] && verticesCollinear[verts[1]])
		.map((collinear, e) => (collinear ? e : undefined))
		.filter(a => a !== undefined)
		.filter(e => newEdgeMap[e] === undefined);

	// no assignments to reassign. quit
	if (!edges_assignment && !edges_foldAngle) {
		return { collinear: collinearEdges, reassigned: [] };
	}

	// This upcoming section can be done without edges_assignments.
	// Now, from the list of collinear edges, we need to filter out the ones to
	// ignore from the ones we need to change. One way of doing this, which works
	// in 2D at least, is to check the adjacent faces' windings, if they are the
	// same winding (assuming they lie in the same plane) the crease between them
	// is flat, and should become folded, in which case we can simply take either
	// of its adjacent faces to know which assignment direction to assign.
	const reassignableEdgesInfo = collinearEdges
		.map(edge => ({
			edge,
			faces: edges_faces[edge].filter(a => a !== undefined),
		}))
		.filter(({ faces }) => faces.length === 2)
		.filter(({ faces: [f0, f1] }) => faces_winding[f0] === faces_winding[f1]);

	reassignableEdgesInfo.forEach(({ edge, faces }) => {
		const winding = faces.map(face => faces_winding[face]).shift();
		edges_assignment[edge] = winding ? assignment : oppositeAssignment;
		edges_foldAngle[edge] = winding ? foldAngle : oppositeFoldAngle;
	});

	// list of edge indices which were reassigned
	return {
		collinear: collinearEdges,
		reassigned: reassignableEdgesInfo.map(({ edge }) => edge),
	};
};

/**
 * @param {number} f0 face index
 * @param {number} f1 face index
 * @param {string} assignment
 * @returns {[number, number, number]|undefined}
 */
const adjacentFacesOrdersAssignments = (f0, f1, assignment) => {
	switch (assignment) {
	case "V":
	case "v": return [f0, f1, 1];
	case "M":
	case "m": return [f0, f1, -1];
	default: return undefined;
	}
};

/**
 * @param {number} f0 face index
 * @param {number} f1 face index
 * @param {number} foldAngle
 * @returns {[number, number, number]|undefined}
 */
const adjacentFacesOrdersFoldAngles = (f0, f1, foldAngle) => {
	if (epsilonEqual(foldAngle, 180)) { return [f0, f1, 1]; }
	if (epsilonEqual(foldAngle, -180)) { return [f0, f1, -1]; }
	return undefined;
};

/**
 * @description all pairs of faces are adjacent faces, so they should have
 * similar windings if unfolded. so there are only two arrangements:
 * V: both face's normals point towards the other face. (+1 order)
 * M: both face's normals point away from the other face. (-1 order)
 * in both cases, it doesn't matter which face comes first with respect
 * to the +1 or -1 ordering.
 * @param {FOLD} graph a FOLD object, with edges_faces among other arrays
 * @param {number[]} newEdges a list of new edges
 * @returns {[number, number, number][]} new faceOrders
 */
export const makeNewFlatFoldFaceOrders = ({
	edges_faces, edges_assignment, edges_foldAngle,
}, newEdges) => {
	const edges = newEdges.filter(e => edges_faces[e].length === 2);
	const edgesAdjacentFaces = edges.map(e => edges_faces[e]);

	if (edges_assignment) {
		const assignments = edges.map(e => edges_assignment[e]);
		return edgesAdjacentFaces
			.map(([f0, f1], i) => adjacentFacesOrdersAssignments(f0, f1, assignments[i]))
			.filter(a => a !== undefined);
	}

	if (edges_foldAngle) {
		const angles = edges.map(e => edges_foldAngle[e]);
		return edgesAdjacentFaces
			.map(([f0, f1], i) => adjacentFacesOrdersFoldAngles(f0, f1, angles[i]))
			.filter(a => a !== undefined);
	}

	return [];
};

/**
 * @description This method is meant to accompany foldGraph, or any operation
 * which divides many overlapping faces in the same graph. During the splitting
 * splitFace(), wherever a face was split (face A split into faces B and C),
 * each faceOrder containing face A is replaced with two faceOrders, each
 * replacing face A with face B and C.
 * However, only one of those two new faceOrders is valid (the overlapped face
 * only overlaps with B or C, not both, due to the splitting line).
 * This can be easily calculated since we know the dividing line, compare
 * the center of the faces to find which side of the line they lie, for face
 * pairs which lie on opposite sides, return this index in the faceOrders array.
 * @param {FOLD} graph a FOLD object with vertices_coords in the same state
 * when the split occured (in most cases this is the folded form vertices).
 * @param {VecLine2} line the line used to split the graph
 * @param {number[]} newFaces a list of the new faces that were created during
 * the splitting operation.
 * @returns {number[]} a list of indices in the faceOrders array which are now
 * invalid due to now being two faces on the opposite sides of the split line.
 */
export const getInvalidFaceOrders = (
	{ vertices_coords, faces_vertices, faceOrders },
	line,
	newFaces,
) => {
	if (!faceOrders) { return []; }

	const newFacesLookup = invertFlatMap(newFaces);

	// this is a 2D only method, but could be extended into 3D.
	const facesSide = faces_vertices
		.map(vertices => vertices.map(v => vertices_coords[v]))
		.map(poly => poly.map(resize2)).map(poly => average2(...poly))
		.map(point => cross2(subtract2(point, line.origin), line.vector))
		.map(Math.sign);

	// these are indices of faceOrders which have a relationship between
	// two faces from either side of the cut line. These are new faces which
	// were just made from two old faces which used to be overlapping before
	// becoming split. We can either:
	// - throw these relationships away
	// - in the case of a flat-fold, we can calculate the new relationship
	//   between the faces.
	// if the fold was 3D (not flat folded) we definitely need to throw them away.
	return faceOrders
		.map(([a, b], i) => (
			(newFacesLookup[a] !== undefined || newFacesLookup[b] !== undefined)
			&& ((facesSide[a] === 1 && facesSide[b] === -1)
			|| (facesSide[a] === -1 && facesSide[b] === 1))
				? i
				: undefined))
		.filter(a => a !== undefined);
};

/**
 * @description This method accompanies foldGraph() and accomplishes two things:
 * Due to many faces being split by a common line, many new faceOrders have
 * been updated/correct to include pairs of faces which don't even overlap.
 * This method finds and removes the now non-overlapping faces.
 * Additionally, in the specific case that the fold line is flat 180 M or V,
 * we are able to create new faceOrders between all edge-adjacent faces,
 * by considering the winding directions, and the assignment of the fold line.
 * @param {FOLD} graph a FOLD graph, faceOrders array is modified in place
 * @param {FOLD} folded the same graph with folded vertices_coords
 * @param {VecLine2} line
 * @param {number} foldAngle
 * @param {number[]} newEdges
 * @param {number[]} newFaces
 * @returns {undefined}
 */
export const updateFaceOrders = (
	graph,
	folded,
	line,
	foldAngle,
	newEdges,
	newFaces,
) => {
	// true if 180deg "M" or "V", false if flat "F" or 3D.
	const isFlatFolded = edgeFoldAngleIsFlatFolded(foldAngle);

	// if this is a flat fold and the model currently has no faceOrders
	// let's create an empty array and fill it with what we know.
	// This often happens when a brand new FOLD object, like an empty square,
	// is being folded for the first time.
	if (!graph.faceOrders && isFlatFolded) { graph.faceOrders = []; }

	// if the assignment is 180 M or V, we generate new face orders between
	// new faces which were just made by splitting a face with a new edge,
	// depending on the edge's assignemnt, we can make a new faceOrder.
	// These are adjacent faces only, so their solution is not geometric,
	// we can be certain that the two faces in each pair overlap.
	if (isFlatFolded) {
		const newFaceOrders = makeNewFlatFoldFaceOrders(graph, newEdges);
		graph.faceOrders = graph.faceOrders.concat(newFaceOrders);
	}

	// from this point on we are only operating on the graph's faceOrders,
	// if the model is only a 3D model with no faceOrders, exit now.
	if (!graph.faceOrders) { return; }

	// the splitGraph operation created many new faceOrders out of the old ones,
	// for every old face's orders, each old face became two new faces, so
	// every one of the old face's orders was replaced with two, referencing the
	// new indices.
	// This generates a bunch of relationships between faces which no longer
	// overlap, we will identify these as "nowInvalidFaceOrders" and
	// delete these faceOrders
	const invalidOrderLookup = {};
	const nowInvalidFaceOrders = getInvalidFaceOrders(
		folded,
		line,
		newFaces,
	);
	nowInvalidFaceOrders.forEach(i => { invalidOrderLookup[i] = true; });
	graph.faceOrders = graph.faceOrders.filter((_, i) => !invalidOrderLookup[i]);
};
