/**
 * Rabbit Ear (c) Kraft
 */
import {
	EPSILON,
} from "../../math/constant.js";
import {
	includeL,
	includeR,
	includeS,
} from "../../math/compare.js";
import {
	pointsToLine2,
} from "../../math/convert.js";
import {
	resize2,
} from "../../math/vector.js";
import {
	clone,
} from "../../general/clone.js";
import {
	assignmentFlatFoldAngle,
	invertAssignment,
} from "../../fold/spec.js";
import {
	makeVerticesCoordsFolded,
} from "../vertices/folded.js";
import {
	getFaceUnderPoint,
} from "../overlap.js";
import {
	makeFacesWinding,
} from "../faces/winding.js";
import {
	splitGraphWithLineAndPoints,
} from "../split/splitGraph.js";
import {
	transferPointInFaceBetweenGraphs,
} from "../transfer.js";
import {
	makeEdgesFacesUnsorted,
} from "../make/edgesFaces.js";
import {
	makeEdgesFoldAngle,
} from "../make/edgesFoldAngle.js";
import {
	recalculatePointAlongEdge,
	reassignCollinearEdges,
	updateFaceOrders,
} from "./general.js";

/**
 * @typedef FoldGraphEvent
 * @type {{
 *   vertices?: {
 *     folded: [number, number][]|[number, number, number][],
 *   },
 *   edges?: {
 *     new: number[],
 *     map: (number|number[])[],
 *     collinear: number[],
 *     reassign: number[],
 *   },
 *   faces?: {
 *     new: number[],
 *     map: number[][],
 *   },
 * }}
 * @description an object which summarizes the changes to the graph.
 */

/**
 * @description Crease a fold line/ray/segment through a folded origami model.
 * This method takes in and returns a crease pattern but performs the fold
 * on the folded form; this approach maintains better precision especially
 * in the case of repeated calls to fold an origami model.
 * @param {FOLD} graph a FOLD object, in creasePattern form, modified in place
 * @param {VecLine2} foldLine a fold line
 * @param {Function} [lineDomain=includeL] a domain function
 * characterizing the line into a line, ray, or segment
 * @param {{
 *   assignment?: string,
 *   foldAngle?: number,
 *   vertices_coordsFolded?: [number, number][]|[number, number, number][],
 *   points?: [number, number][],
 * }} options where
 * - points in the case of a ray or segement, supply the endpoint(s).
 * these are points which will be included inside faces which they appear.
 * - assignment: to be applied to the intersected faces with counter-clockwise
 * winding. Clockwise-wound faces will get the opposite assignment
 * - foldAngle: the fold angle to be applied, similarly as the assignment.
 * - vertices_coordsFolded a copy of the vertices_coords, in folded form,
 * this will be computed if it does not exist.
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {FoldGraphEvent} an object summarizing the changes to the graph
 */
export const foldGraph = (
	graph,
	{ vector, origin },
	lineDomain = includeL,
	{ assignment = "F", foldAngle, vertices_coordsFolded, points = [] } = {},
	epsilon = EPSILON,
) => {
	// if the user asks for a foldAngle, but edges_foldAngle array does not exist,
	// we have to explicitly add it otherwise it will be skipped later on.
	if (foldAngle !== undefined && !graph.edges_foldAngle && graph.edges_assignment) {
		graph.edges_foldAngle = makeEdgesFoldAngle(graph);
	}
	if (!graph.edges_faces) {
		graph.edges_faces = makeEdgesFacesUnsorted(graph);
	}

	// if user only specifies assignment, fill in the (flat) fold angle for them
	if (foldAngle === undefined) {
		foldAngle = assignmentFlatFoldAngle[assignment] || 0;
	}

	if (vertices_coordsFolded === undefined) {
		const rootFace = getFaceUnderPoint(graph, origin, vector);
		vertices_coordsFolded = makeVerticesCoordsFolded(graph, [rootFace]);
	}

	// Only M and V will exchange. all others, this will be the same assignment
	const oppositeAssignment = invertAssignment(assignment);
	const oppositeFoldAngle = foldAngle === 0 ? 0 : -foldAngle;

	// we will run the method on the same graph, but swap out the vertices_coords.
	// run the splitGraph method on the folded form but then swap out the coords
	// for the crease pattern coords once finished. backup the cp coords here.
	const vertices_coordsCP = clone(graph.vertices_coords);

	// the split operation will happen to the folded graph.
	// the vertices_coords will be modified in place, so, create a copy in case
	// the user is passing in an argument they don't want modified.
	Object.assign(graph, { vertices_coords: clone(vertices_coordsFolded) });

	// split all edges and faces that are crossed by our line, and place
	// new vertices at the split edges, and inside faces in the case of segment.
	const splitGraphResult = splitGraphWithLineAndPoints(
		graph,
		{ vector, origin },
		lineDomain,
		points,
		epsilon,
	);

	// new faces, used for the return object, and used to update faceOrders
	const newFaces = Array.from(new Set(splitGraphResult.edges.new
		.flatMap(e => graph.edges_faces[e])));

	// now that the split operation is complete and new faces have been built,
	// capture the winding of the faces while still in folded form.
	const faces_winding = makeFacesWinding(graph);

	// we need to hold onto these for the upcoming point-transfer methods.
	// vertices_coords from the crease pattern and folded form now differ
	// in length, the folded form contain additional vertices_coords at the end,
	// however, during the parts that do overlap, the vertices match 1:1.
	// (albeit, folded and cp coordinates are different, of course).
	// note: in the case of a fold operation with a "M" or "V", this list does
	// not contain the folded vertices coords that includes that new fold line.
	// Imagine our new fold line having an "F" assignment.
	const vertices_coordsFoldedNew = clone(graph.vertices_coords);

	// reassign the crease pattern's vertices back onto the graph. it's likely
	// that the graph is now invalid, as the split created new vertices which
	// are no longer here, but this is only temporary, in the upcoming section
	// we will rebuild and set these new vertices back into the crease pattern
	// space using the intersection information that made them.
	Object.assign(graph, { vertices_coords: vertices_coordsCP });

	// build a copy of the folded form for the transfer method
	const foldedForm = {
		...graph,
		vertices_coords: vertices_coordsFoldedNew,
	};

	// at this point, the crease pattern coords have been returned to the graph,
	// aside from the additional vertices that were created during
	// the splitFace / splitEdge methods. Currently, these are still in
	// the folded-form space. the splitGraph method result contains
	// information on how these points were made in folded form space,
	// transfer these points into cp space, via the paramters that created them.
	const splitGraphVerticesSource = splitGraphResult.vertices.source
		.map((intersect, vertex) => ({ ...intersect, vertex }));

	// these points lie somewhere in the inside of a face. use trilateration
	// to move the point from the same location in the folded face to the cp face.
	splitGraphVerticesSource
		.map(el => ("point" in el && "face" in el && "faces" in el && "vertex" in el
			? el
			: undefined))
		.filter(a => a !== undefined)
		// .forEach(({ point, face, faces, vertex }) => {
		.forEach(({ point, faces, vertex }) => {
			// "face" relates to the graph before splitGraphWithLineAndPoints was called.
			// "faces" indices relate to the new graph, it will have one or two indices.
			// which of the two face indices should we use?
			// console.log("transfer in face", point, face, vertex);
			graph.vertices_coords[vertex] = transferPointInFaceBetweenGraphs(
				foldedForm,
				graph,
				faces[0], // todo, ensure that this is okay
				point,
			);
		});

	// these points were made along an edge, instead of using trilateration,
	// we can use the edge vector intersection parameter for more precision.
	splitGraphVerticesSource
		.map(el => ("vertices" in el && "vertex" in el && "b" in el ? el : undefined))
		.filter(a => a !== undefined)
		.forEach(({ b, vertices, vertex }) => {
			graph.vertices_coords[vertex] = recalculatePointAlongEdge(
				vertices.map(v => graph.vertices_coords[v]).map(resize2),
				b,
			);
		});

	// the result of calling splitGraph contains a list of all new edges that
	// were created, each edge contains a reference to the face(s) it lies inside:
	// "face": the index of the edge's face before the graph was modified
	// "faces": the indices of the edge's new faces in the graph after being split
	// use "faces" to grab the edge's face, look up the winding of this face, and
	// assign either the assignment or the inverted assignment accordingly.
	const edgesAttributes = splitGraphResult.edges.source
		.map(({ faces }) => ({
			assign: faces_winding[faces[0]] ? assignment : oppositeAssignment,
			angle: faces_winding[faces[0]] ? foldAngle : oppositeFoldAngle,
		}));

	// only apply the assignment and fold angle if the graph contains these
	// arrays, this way, a simple flat-folded graph won't be forced to
	// include edges_foldAngle if it is unnecessary.
	if (graph.edges_assignment) {
		edgesAttributes.forEach(({ assign }, edge) => {
			graph.edges_assignment[edge] = assign;
		});
	}
	if (graph.edges_foldAngle) {
		edgesAttributes.forEach(({ angle }, edge) => {
			graph.edges_foldAngle[edge] = angle;
		});
	}

	// collinear edges should be dealt in this way: folded edges can be ignored,
	// flat edges which lie collinear to the fold line must be folded,
	// these edges were missed in the edge construction and assignment inside
	// "splitFace", because these edges already existed.
	const { collinear, reassigned } = reassignCollinearEdges(
		graph,
		{ assignment, foldAngle, oppositeAssignment, oppositeFoldAngle },
		faces_winding,
		splitGraphResult,
	);

	// splitGraph just indiscriminately created new faceOrders from old ones.
	// (this happens inside splitFace() inside of splitGraphWithLineAndPoints())
	// The pattern goes: for every face A that is split into faces B and C,
	// all faceOrders rules involving face A are replaced with two rules where
	// A is replaced by B and C.
	// For example, if face A is replaced by faces B and C,
	// faceOrders rule [A, N, _] is replaced by rules [B, N, _] and [C, N, _].
	// Keep in mind, this is before the assignment has been applied to the
	// new crease line (before the vertices have been folded over it), the new
	// crease assignment should be thought of as "F" flat for now.
	// This now needs to be cleaned up in one very important way:
	// - Of the pair B and C, only one now overlaps with N. we have to
	// identify which this is and remove the other one.
	// Additionally:
	// - Now, in the special case where the new crease assignment is "V" or "M"
	// and it's a flat fold, not 3D, we can create new faceOrders between
	// the new neighbors that were formed by the split crease.
	updateFaceOrders(
		graph,
		{ ...graph, vertices_coords: vertices_coordsFoldedNew },
		{ vector, origin },
		foldAngle,
		[...splitGraphResult.edges.new, ...reassigned],
		newFaces,
	);

	// "reassign" contains a subset of existing collinear edges to the fold line.
	// Let's say you would like to modify the graph after a fold to convert a
	// valley into a reverse fold, not all collinear lines need reassigning,
	// for example, a valley crease creating a flap of two faces which only
	// happens to lie collinear to this fold line, but is entirely independent
	// of this fold, it should be ignored. So, consult "new" and "reassign" for
	// a list of edges which are involved in this fold.
	return {
		vertices: {
			folded: vertices_coordsFoldedNew,
		},
		edges: {
			map: splitGraphResult.edges.map,
			new: splitGraphResult.edges.new,
			collinear,
			reassign: reassigned,
		},
		faces: {
			map: splitGraphResult.faces.map,
			new: newFaces,
		},
	};
};

/**
* @description Crease a fold line through a folded origami model.
* This method takes in and returns a crease pattern but performs the fold
* on the folded form; this approach maintains better precision especially
* in the case of repeated calls to fold an origami model.
 * @param {FOLD} graph a FOLD object
 * @param {VecLine2} line the fold line
 * @param {{
 *   assignment?: string,
 *   foldAngle?: number,
 *   vertices_coordsFolded?: [number, number][]|[number, number, number][],
 * }} options including the new edge assignment and fold angle, and the
 * folded vertices_coords
 * @param {number} [epsilon=1e-6]
 * @returns {FoldGraphEvent} an object summarizing the changes to the graph
 */
export const foldLine = (
	graph,
	line,
	{ assignment = "F", foldAngle, vertices_coordsFolded } = {},
	epsilon = EPSILON,
) => (
	foldGraph(
		graph,
		line,
		includeL,
		{ points: [], assignment, foldAngle, vertices_coordsFolded },
		epsilon,
	));

/**
* @description Crease a fold ray through a folded origami model.
* This method takes in and returns a crease pattern but performs the fold
* on the folded form; this approach maintains better precision especially
* in the case of repeated calls to fold an origami model.
 * @param {FOLD} graph a FOLD object
 * @param {VecLine2} ray the fold line as a ray
 * @param {{
 *   assignment?: string,
 *   foldAngle?: number,
 *   vertices_coordsFolded?: [number, number][]|[number, number, number][],
 * }} options including the new edge assignment and fold angle, and the
 * folded vertices_coords
 * @param {number} [epsilon=1e-6]
 * @returns {FoldGraphEvent} an object summarizing the changes to the graph
 */
export const foldRay = (
	graph,
	ray,
	{ assignment = "F", foldAngle, vertices_coordsFolded } = {},
	epsilon = EPSILON,
) => (
	foldGraph(
		graph,
		ray,
		includeR,
		{ points: [ray.origin], assignment, foldAngle, vertices_coordsFolded },
		epsilon,
	));

/**
* @description Crease a fold segment through a folded origami model.
* This method takes in and returns a crease pattern but performs the fold
* on the folded form; this approach maintains better precision especially
* in the case of repeated calls to fold an origami model.
 * @param {FOLD} graph a FOLD object
 * @param {[[number, number], [number, number]]} segment the fold segment
 * @param {{
 *   assignment?: string,
 *   foldAngle?: number,
 *   vertices_coordsFolded?: [number, number][]|[number, number, number][],
 * }} options including the new edge assignment and fold angle, and the
 * folded vertices_coords
 * @param {number} [epsilon=1e-6]
 * @returns {FoldGraphEvent} an object summarizing the changes to the graph
 */
export const foldSegment = (
	graph,
	segment,
	{ assignment = "F", foldAngle, vertices_coordsFolded } = {},
	epsilon = EPSILON,
) => (
	foldGraph(
		graph,
		pointsToLine2(segment[0], segment[1]),
		includeS,
		{ points: segment, assignment, foldAngle, vertices_coordsFolded },
		epsilon,
	));
