/**
 * Rabbit Ear (c) Kraft
 */
import { EPSILON } from "../../math/general/constant.js";
import {
	cross2,
	subtract2,
} from "../../math/algebra/vector.js";
import {
	invertMatrix2,
	multiplyMatrix2Line2,
	multiplyMatrices2,
	makeMatrix2Reflect,
} from "../../math/algebra/matrix2.js";
import populate from "../populate.js";
import { mergeNextmaps } from "../maps.js";
import {
	makeFacesMatrix2,
	multiplyVerticesFacesMatrix2,
} from "../faces/matrix.js";
import { makeEdgesLineParallelOverlap } from "../intersect.js";
import { makeFacesWindingFromMatrix2 } from "../faces/winding.js";
import splitConvexFace from "../splitFace/index.js";
import { edgeAssignmentToFoldAngle } from "../../fold/spec.js";
import { foldFacesLayer } from "./facesLayer.js";
/**
 * @description this determines which side of a line (using cross product)
 * a face lies in a folded form, except, the face is the face in
 * the crease pattern and the line (vector origin) is transformed
 * by the face matrix. because of this, we use face_winding to know
 * if this face was flipped over, reversing the result.
 * @note by flipping the < and > in the return, this one change
 * will modify the entire method to toggle which side of the line
 * are the faces which will be folded over.
 */
const make_face_side = (vector, origin, face_center, face_winding) => {
	const center_vector = subtract2(face_center, origin);
	const determinant = cross2(vector, center_vector);
	return face_winding ? determinant > 0 : determinant < 0;
};
/**
 * for quickly determining which side of a crease a face lies
 * this uses point average, not centroid, faces must be convex
 * and again it's not precise, but this doesn't matter because
 * the faces which intersect the line (and could potentially cause
 * discrepencies) don't use this method, it's only being used
 * for faces which lie completely on one side or the other.
 */
const make_face_center = (graph, face) => (!graph.faces_vertices[face]
	? [0, 0]
	: graph.faces_vertices[face]
		.map(v => graph.vertices_coords[v])
		.reduce((a, b) => [a[0] + b[0], a[1] + b[1]], [0, 0])
		.map(el => el / graph.faces_vertices[face].length));

const unfolded_assignment = {
	F: true, f: true, U: true, u: true,
};
const opposite_lookup = {
	M: "V", m: "V", V: "M", v: "M",
};
/**
 * @description for a mountain or valley, return the opposite.
 * in the case of any other crease (boundary, flat, ...) return the input.
 */
const get_opposite_assignment = assign => opposite_lookup[assign] || assign;
/**
 * @description shallow copy these entries for one face in the graph.
 * this is intended to capture the values, in the case of the face
 * being removed from the graph (not deep deleted, just unreferenced).
 */
const face_snapshot = (graph, face) => ({
	center: graph.faces_center[face],
	matrix: graph.faces_matrix2[face],
	winding: graph.faces_winding[face],
	crease: graph.faces_crease[face],
	side: graph.faces_side[face],
	layer: graph.faces_layer[face],
});
/**
 * @description make a crease that passes through the entire origami and modify the
 * faces order to simulate one side of the faces flipped over and set on top.
 * @param {object} graph a FOLD graph in crease pattern form, will be modified in place
 * @param {number[]} vector a 2D vector describing the line as an array of numbers
 * @param {number[]} origin a 2D origin describing the line as an array of numbers
 * @param {string} assignment (M/V/F) a FOLD spec encoding of the direction of the fold
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {object} a summary of changes to faces/edges.
 * @algorithm Because we want to return the new modified origami in crease pattern form,
 * as we iterate through the faces, splitting faces which cross the crease
 * line, we have to be modifying the crease pattern, as opposed to modifying
 * a folded form then unfolding the vertices, which would be less precise.
 * So, we will create copies of the crease line, one per face, transformed
 * into place by its face's matrix, which superimposes many copies of the
 * crease line onto the crease pattern, each in place
 * @linkcode Origami ./src/graph/flatFold/index.js 96
 */
const flatFold = (graph, { vector, origin }, assignment = "V", epsilon = EPSILON) => {
	const opposite_assignment = get_opposite_assignment(assignment);
	// make sure the input graph contains the necessary data.
	// this takes care of all standard FOLD-spec arrays.
	// todo: this could be optimized by trusting that the existing arrays
	// are accurate, checking if they exist and skipping them if so.
	populate(graph);
	// additionally, we need to ensure faces layer exists.
	// todo: if it doesn't exist, should we use the solver?
	if (!graph.faces_layer) {
		graph.faces_layer = Array(graph.faces_vertices.length).fill(0);
	}
	// these will be properties on the graph. as we iterate through faces,
	// splitting (removing 1 face, adding 2) inside "splitFace", the remove
	// method will automatically shift indices for arrays starting with "faces_".
	// we will remove these arrays at the end of this method.
	graph.faces_center = graph.faces_vertices
		.map((_, i) => make_face_center(graph, i));
	// faces_matrix is built from the crease pattern, but reflects
	// the faces in their folded state.
	if (!graph.faces_matrix2) {
		graph.faces_matrix2 = makeFacesMatrix2(graph, 0);
	}
	graph.faces_winding = makeFacesWindingFromMatrix2(graph.faces_matrix2);
	graph.faces_crease = graph.faces_matrix2
		.map(invertMatrix2)
		.map(matrix => multiplyMatrix2Line2(matrix, vector, origin));
	graph.faces_side = graph.faces_vertices
		.map((_, i) => make_face_side(
			graph.faces_crease[i].vector,
			graph.faces_crease[i].origin,
			graph.faces_center[i],
			graph.faces_winding[i],
		));
	// before we start splitting faces, we have to handle the case where
	// a flat crease already exists along the fold crease, already splitting
	// two faces (assignment "F" or "U" only), the splitFace method
	// will not catch these. we need to find these edges before we modify
	// the graph, find the face they are attached to and whether the face
	// is flipped, and set the edge to the proper "V" or "M" (and foldAngle).
	const vertices_coords_folded = multiplyVerticesFacesMatrix2(
		graph,
		graph.faces_matrix2,
	);
	// get all (folded) edges which lie parallel and overlap the crease line
	const collinear_edges = makeEdgesLineParallelOverlap({
		vertices_coords: vertices_coords_folded,
		edges_vertices: graph.edges_vertices,
	}, vector, origin, epsilon)
		.map((is_collinear, e) => (is_collinear ? e : undefined))
		.filter(e => e !== undefined)
		.filter(e => unfolded_assignment[graph.edges_assignment[e]]);
	// get the first valid adjacent face for each edge, get that face's winding,
	// which determines the crease assignment, and assign it to the edge
	collinear_edges
		.map(e => graph.edges_faces[e].find(f => f != null))
		.map(f => graph.faces_winding[f])
		.map(winding => (winding ? assignment : opposite_assignment))
		.forEach((assign, e) => {
			graph.edges_assignment[collinear_edges[e]] = assign;
			graph.edges_foldAngle[collinear_edges[e]] = edgeAssignmentToFoldAngle(
				assign,
			);
		});
	// before we start splitting, capture the state of face 0. we will use
	// it when rebuilding the graph's matrices after all splitting is finished.
	const face0 = face_snapshot(graph, 0);
	// now, iterate through faces (reverse order), rebuilding the custom
	// arrays for the newly added faces when a face is split.
	const split_changes = graph.faces_vertices
		.map((_, i) => i)
		.reverse()
		.map((i) => {
			// this is the face about to be removed. if the face is successfully
			// split the face will be removed but we still need to reference
			// values from it to complete the 2 new faces which replace it.
			const face = face_snapshot(graph, i);
			// split the polygon (if possible), get back a summary of changes.
			const change = splitConvexFace(
				graph,
				i,
				face.crease.vector,
				face.crease.origin,
				epsilon,
			);
			// console.log("split convex polygon change", change);
			if (change === undefined) { return undefined; }
			// const face_winding = folded.faces_winding[i];
			// console.log("face change", face, change);
			// update the assignment of the newly added edge separating the 2 new faces
			graph.edges_assignment[change.edges.new] = face.winding
				? assignment
				: opposite_assignment;
			graph.edges_foldAngle[change.edges.new] = edgeAssignmentToFoldAngle(
				graph.edges_assignment[change.edges.new],
			);
			// these are the two faces that replaced the removed face after the split
			const new_faces = change.faces.map[change.faces.remove];
			new_faces.forEach(f => {
				// no need right now to build faces_winding, faces_matrix, ...
				graph.faces_center[f] = make_face_center(graph, f);
				graph.faces_side[f] = make_face_side(
					face.crease.vector,
					face.crease.origin,
					graph.faces_center[f],
					face.winding,
				);
				graph.faces_layer[f] = face.layer;
			});
			return change;
		})
		.filter(a => a !== undefined);
	// all faces have been split. get a summary of changes to the graph.
	// "faces_map" is actually needed. the others are just included in the return
	const faces_map = mergeNextmaps(...split_changes.map(el => el.faces.map));
	const edges_map = mergeNextmaps(...split_changes.map(el => el.edges.map)
		.filter(a => a !== undefined));
	const faces_remove = split_changes.map(el => el.faces.remove).reverse();
	// const vert_dict = {};
	// split_changes.forEach(el => el.vertices.forEach(v => { vert_dict[v] = true; }));
	// const new_vertices = Object.keys(vert_dict).map(s => parseInt(s));
	// build a new face layer ordering
	graph.faces_layer = foldFacesLayer(
		graph.faces_layer,
		graph.faces_side,
	);
	// build new face matrices for the folded state. use face 0 as reference
	// we need its original matrix, and if face 0 was split we need to know
	// which of its two new faces doesn't move as the new faces matrix
	// calculation requires we provide the one face that doesn't move.
	const face0_was_split = faces_map && faces_map[0] && faces_map[0].length === 2;
	const face0_newIndex = (face0_was_split
		? faces_map[0].filter(f => graph.faces_side[f]).shift()
		: 0);
	// only if face 0 lies on the not-flipped side (sidedness is false),
	// and it wasn't creased-through, can we use its original matrix.
	// if face 0 lies on the flip side (sidedness is true), or it was split,
	// face 0 needs to be multiplied by its crease's reflection matrix, but
	// only for valley or mountain folds, "flat" folds need to copy the matrix
	let face0_preMatrix = face0.matrix;
	// only if the assignment is valley or mountain, do this. otherwise skip
	if (assignment !== opposite_assignment) {
		face0_preMatrix = (!face0_was_split && !graph.faces_side[0]
			? face0.matrix
			: multiplyMatrices2(
				face0.matrix,
				makeMatrix2Reflect(
					face0.crease.vector,
					face0.crease.origin,
				),
			)
		);
	}
	// build our new faces_matrices using face 0 as the starting point,
	// setting face 0 as the identity matrix, then multiply every
	// face's matrix by face 0's actual starting matrix
	graph.faces_matrix2 = makeFacesMatrix2(graph, face0_newIndex)
		.map(matrix => multiplyMatrices2(face0_preMatrix, matrix));
	// these are no longer needed. some of them haven't even been fully rebuilt.
	delete graph.faces_center;
	delete graph.faces_winding;
	delete graph.faces_crease;
	delete graph.faces_side;
	// summary of changes to the graph
	return {
		faces: { map: faces_map, remove: faces_remove },
		edges: { map: edges_map },
		// vertices: { new: new_vertices },
	};
};

export default flatFold;
