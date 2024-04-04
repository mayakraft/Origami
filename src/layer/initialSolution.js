/**
 * Rabbit Ear (c) Kraft
 */
import {
	EPSILON,
} from "../math/constant.js";
import {
	exclude,
	excludeS,
} from "../math/compare.js";
import {
	subtract2,
} from "../math/vector.js";
import {
	multiplyMatrix4Vector3,
} from "../math/matrix4.js";
import {
	overlapConvexPolygonPoint,
} from "../math/overlap.js";
import {
	clipLineConvexPolygon,
} from "../math/clip.js";

/**
 * @description Given a FOLD graph, already folded, find the layer arrangement
 * between neighboring faces (using edges_faces), and assign this facePair
 * a 1 or 2, checking whether faces have been flipped or not.
 * @param {FOLD} graph a FOLD object
 * @param {string[]} facePairs an array of space-separated face-pair strings
 * @param {boolean[]} faces_winding for every face, true if the face's
 * winding is counter-clockwise, false if clockwise.
 * @returns {{[key: string]: number}} an object describing all the
 * solved facePairs (keys) and their layer order 1 or 2 (value),
 * the object only includes those facePairs
 * which are solved, so, no 0-value entries will exist.
 * @linkcode
 */
export const solveFlatAdjacentEdges = (
	{ edges_faces, edges_assignment },
	faces_winding,
) => {
	// flip 1 and 2 to be the other, leaving 0 to be 0.
	const flipCondition = { 0: 0, 1: 2, 2: 1 };

	// neighbor faces determined by crease between them
	const assignmentOrder = { M: 1, m: 1, V: 2, v: 2 };

	// "solution" contains solved orders (1, 2) for face-pair keys.
	/** @type {{ [key: string]: number }} */
	const solution = {};
	edges_faces.forEach((faces, edge) => {
		// the crease assignment determines the order between pairs of faces.
		const assignment = edges_assignment[edge];
		const localOrder = assignmentOrder[assignment];

		// skip boundary edges, non-manifold edges, and irrelevant assignments
		if (faces.length !== 2 || localOrder === undefined) { return; }

		// face[0] is the origin face.
		// the direction of "m" or "v" will be inverted if face[0] is flipped.
		const upright = faces_winding[faces[0]];

		// now we know from a global perspective the order between the face pair.
		const globalOrder = upright
			? localOrder
			: flipCondition[localOrder];

		// all face-pairs are stored "a b" where a < b. Our globalOrder is the
		// relationship from faces[0] to faces[1], so if faces[0] > [1] we need
		// to flip the order of faces, and flip the result.
		const inOrder = faces[0] < faces[1];
		const key = inOrder ? faces.join(" ") : faces.slice().reverse().join(" ");
		const value = inOrder ? globalOrder : flipCondition[globalOrder];

		solution[key] = value;
	});
	return solution;
};

/**
 *
 */
const polygonSegmentOverlap = (polygon, segment, epsilon = EPSILON) => {
	const pointInPolygon = segment
		.map(point => overlapConvexPolygonPoint(
			polygon,
			point,
			exclude,
			epsilon,
		).overlap).reduce((a, b) => a || b, false);
	if (pointInPolygon) { return true; }
	const edgeClip = clipLineConvexPolygon(
		polygon,
		{ vector: subtract2(segment[1], segment[0]), origin: segment[0] },
		exclude,
		excludeS,
		epsilon,
	);
	return edgeClip !== undefined;
};

/**
 * @description There are two kinds of arrangements of edges/faces that
 * don't generate solver conditions, instead, they solve relationships
 * between pairs of faces.
 * @param {number[][]} edges_sets remember this only contains definitions
 * for edges which are members of 2 sets. anything made from this will
 * automatically have a non-flat edges_foldAngle.
 * @returns {{ [key: string]: number }} solutions to face-pair layer orders
 */
export const solveEdgeFaceOverlapOrders = (
	{ vertices_coords, edges_vertices, edges_faces, edges_foldAngle },
	sets_transformXY,
	sets_faces,
	faces_set,
	faces_polygon,
	faces_winding,
	edges_sets,
	epsilon = EPSILON,
) => {
	// sets_facesBunch are sets with more than 1 face in the set.
	const sets_facesBunch = sets_faces.slice();
	sets_facesBunch.forEach((arr, i) => {
		if (arr.length < 2) { delete sets_facesBunch[i]; }
	});
	// convert edges_faces into a quick hash lookup where the face is the index
	const edges_facesLookup = edges_faces.map(faces => {
		const lookup = {};
		faces.forEach(face => { lookup[face] = true; });
		return lookup;
	});
	// for each edge (which is a member of 1 or 2 sets, but in this case only
	// edges in 2 sets are inside edges_sets), get all faces in the same sets.
	const edgesSetsFaces = edges_sets
		.map(sets => sets
			.filter(set => sets_facesBunch[set] !== undefined)
			.map(set => sets_facesBunch[set]));
	// because sets_facesBunch may have been empty (if it contains only 1 face),
	// remove all edgesSetsFaces which only have one set, meaning, only one
	// group of planar faces are available so there is nothing to compare
	// these against and uncover face-pair order solutions.
	edges_sets
		.map((_, i) => i)
		.filter(e => edgesSetsFaces[e].length < 2)
		.forEach(e => delete edgesSetsFaces[e]);
	// from the set of all edgesSetsFaces, filter them into 2 categories:
	// 1: those which are adjacent to the edge (and cannot overlap this edge),
	// 2: those which are non-adjacent, and are candidates for overlap.
	// these arrays are built from edges_sets and edges_sets only contains
	// definitions for edges in 2 sets, so all edges have non-flat fold angles.
	const edgesSetsFacesAdjacent = edgesSetsFaces
		.map((sets, edge) => sets
			.map(faces => faces
				.filter(face => edges_facesLookup[edge][face])));
	const edgesSetsFacesAllNonAdjacent = edgesSetsFaces
		.map((sets, edge) => sets
			.map(faces => faces
				.filter(face => !edges_facesLookup[edge][face])));
	// convert all edges into 3D segments, pairs of 3D vertices.
	// use "edgesSetsFaces" instead of "edges_sets" because we filtered out
	// edges that only contain only one group of planar faces.
	const edgesSegment3D = edgesSetsFaces
		.map((_, e) => edges_vertices[e]
			.map(v => vertices_coords[v]));
	// console.log(
	// 	"edges",
	// 	edgesSegment3D.length,
	// 	"faces",
	// 	edgesSetsFacesAllNonAdjacent.map(sets => sets.map(faces => faces.length)),
	// );
	// 3,386ms
	// console.time("solveOrders3d.js polygon-segment-overlap");
	// now, iterate through the non-adjacent faces for every edge and
	// check if they overlap with the edge. this requires applying the same
	// transform to the edge which was applied to the face, remove the Z
	// component (because the transform only rotates), and compute the overlap.
	// subset of all non-adjacent faces that overlap the edge
	const edgesSetsFacesNonAdjacent = edgesSetsFacesAllNonAdjacent
		.map((sets, edge) => sets
			.map(faces => faces
				.map(face => {
					const segmentTransform = edgesSegment3D[edge]
						.map(point => multiplyMatrix4Vector3(
							sets_transformXY[faces_set[face]],
							point,
						));
					const segment2D = segmentTransform.map(p => [p[0], p[1]]);
					// return segmentPolygonOverlap2Exclusive(faces_polygon[face], segment2D, epsilon);
					return polygonSegmentOverlap(faces_polygon[face], segment2D, epsilon)
						? face
						: undefined;
				})
				.filter(a => a !== undefined)));
	// console.timeEnd("solveOrders3d.js polygon-segment-overlap");
	// create a set of objects where each "edge" has two adjacent "faces",
	// and the first faces index [0] is coplanar with the face in "overlap".
	// faces index [1] deviates from the plane by the edge's edges_foldAngle.
	// this implies in a known layer order between "faces[0]" and "overlap".
	const tacoTortillas3D = edgesSetsFaces
		.flatMap((_, edge) => edgesSetsFacesNonAdjacent[edge]
			.flatMap((faces, setIndex) => {
				const otherSetIndex = 1 - setIndex; // 0 becomes 1. 1 becomes 0.
				const adjacent = edgesSetsFacesAdjacent[edge];
				return faces.map(face => ({
					edge,
					faces: [adjacent[setIndex][0], adjacent[otherSetIndex][0]],
					overlap: face,
					set: faces_set[face],
				}));
			}));
	// get the two faces whose order will be solved.
	const tacoTortillas3DFacePairs = tacoTortillas3D
		.map(el => [el.faces[0], el.overlap]);
	// are the face pairs in the correct order for the solver? where A < B?
	const tacoTortillas3DFacePairsCorrect = tacoTortillas3DFacePairs
		.map(pair => pair[0] < pair[1]);
	// order the pair of faces so the smaller index comes first.
	tacoTortillas3DFacePairsCorrect.forEach((correct, i) => {
		if (!correct) { tacoTortillas3DFacePairs[i].reverse(); }
	});
	// is the first face (faces[0]) aligned with the planar-set's normal?
	const tacoTortillas3DAligned = tacoTortillas3D
		.map(el => faces_winding[el.faces[0]]);
	// true is positive/valley, false is negative/mountain
	const tacoTortillas3DBendDir = tacoTortillas3D
		.map(el => edges_foldAngle[el.edge])
		.map(Math.sign)
		.map(n => n === 1);
	// 0 means A is above B, 1 means B is above A.
	// where A is the adjacent face, B is the overlapped face.
	const tacoTortillas3DXOR = tacoTortillas3D
		.map((_, i) => tacoTortillas3DAligned[i] ^ tacoTortillas3DBendDir[i]);
	// solver notation, where 1 means A is above B. 2 means B is above A.
	// also, if we flipped the order of the faces for the solution key,
	// flip this solution as well
	const tacoTortillas3DSolution = tacoTortillas3DXOR
		.map((xor, i) => (tacoTortillas3DFacePairsCorrect[i] ? xor : 1 - xor))
		.map(xor => xor + 1);
	// a dictionary with keys: face pairs ("5 23"), and values: 1 or 2.
	const orders = {};
	tacoTortillas3DFacePairs.forEach((pair, i) => {
		orders[pair.join(" ")] = tacoTortillas3DSolution[i];
	});
	// console.log("sets_facesBunch", sets_facesBunch);
	// console.log("edges_facesLookup", edges_facesLookup);
	// console.log("edgesSetsFaces", edgesSetsFaces);
	// console.log("edgesSetsFacesAdjacent", edgesSetsFacesAdjacent);
	// console.log("edgesSetsFacesAllNonAdjacent", edgesSetsFacesAllNonAdjacent);
	// console.log("edgesSetsFacesNonAdjacent", edgesSetsFacesNonAdjacent);
	// console.log("edgesSegment3D", edgesSegment3D);
	// console.log("tacoTortillas3D", tacoTortillas3D);
	// console.log("tacoTortillas3DAligned", tacoTortillas3DAligned);
	// console.log("tacoTortillas3DBendDir", tacoTortillas3DBendDir);
	// console.log("tacoTortillas3DXOR", tacoTortillas3DXOR);
	// console.log("tacoTortillas3DSolution", tacoTortillas3DSolution);
	// console.log("tacoTortillas3DFacePairs", tacoTortillas3DFacePairs);
	// console.log("tacoTortillas3DFacePairsCorrect", tacoTortillas3DFacePairsCorrect);
	// console.log("orders", orders);
	return orders;
};

/**
 * @description Given a situation where two non-boundary edges are
 * parallel overlapping, and two of the faces lie in the same plane,
 * and need to be layer-solved. Consult the fold-angles, which imply the
 * position of the two other faces, this will determine the layer order
 * between the two faces. (given that the special case where both edges
 * are flat 0 angles which would be the tortilla-tortilla 2D case).
 *
 * @todo as we build the dictionary we need to make sure we aren't
 * overwriting the same key with different values, we need to throw
 * an error.
 */
// const solveFacePair3D = ({
// 	edges_foldAngle, faces_winding,
// }, tortillaEdges, tortillaFaces) => {
// 	// so the idea is, if we align the faces within the plane, meaning that if
// 	// a face is flipped, we "flip" it by negating the foldAngle, then we can
// 	// say that the face (edge) with the larger fold angle should be on top.
// 	// then we have to work backwards-if we flipped a face, we need to flip
// 	// the order, or if the faces are not ordered where A < B, also flip the order.
// 	const tortillaEdgesFoldAngle = tortillaEdges
// 		.map(edges => edges
// 			.map(edge => edges_foldAngle[edge]));
// 	const tortillaFacesAligned = tortillaFaces
// 		.map(faces => faces
// 			.map(f => faces_winding[f]));
// 	const tortillaEdgesFoldAngleAligned = tortillaEdgesFoldAngle
// 		.map((angles, i) => angles
// 			.map((angle, j) => (tortillaFacesAligned[i][j] ? angle : -angle)));
// 	const indicesInOrder = tortillaEdgesFoldAngleAligned
// 		.map(angles => angles[0] > angles[1]);
// 	const facesInOrder = tortillaFaces.map(faces => faces[0] < faces[1]);
// 	const switchNeeded = tortillaFaces
// 		.map((_, i) => indicesInOrder[i] ^ facesInOrder[i]);
// 	const result = {};
// 	const faceKeys = tortillaFaces
// 		.map((pair, i) => (facesInOrder[i] ? pair : pair.slice().reverse()))
// 		.map(pair => pair.join(" "));
// 	switchNeeded
// 		.map(n => n + 1) // 0 becomes 1, 1 becomes 2.
// 		.forEach((order, i) => { result[faceKeys[i]] = order; });
// 	// console.log("tortilla", tortilla);
// 	// console.log("tortillaEdges", tortillaEdges);
// 	// console.log("tortillaEdgesFoldAngle", tortillaEdgesFoldAngle);
// 	// console.log("tortillaFaces", tortillaFaces);
// 	// console.log("tortillaOtherFaces", tortillaOtherFaces);
// 	// console.log("tortillaFacesAligned", tortillaFacesAligned);
// 	// console.log("tortillaEdgesFoldAngleAligned", tortillaEdgesFoldAngleAligned);
// 	// console.log("indicesOrder", indicesOrder);
// 	// console.log("indicesInOrder", indicesInOrder);
// 	// console.log("facesInOrder", facesInOrder);
// 	// console.log("switchNeeded", switchNeeded);
// 	// console.log("result", result);
// 	return result;
// };

/**
 * @description Given a list of Y-junctions, solve the relationship between the
 * two faces which overlap each other, resulting in a layer-solution mapping
 * space-separated face-pair strings to a value of 1 or 2.
 * @returns {{ [key: string]: number }} a subset of layer order solutions
 */
// const solveYJunctions = ({ edges_foldAngle, faces_winding }, edgePairData) => {
// 	const tortilla = edgePairData
// 		.map(el => Object.values(el.sets)
// 			.sort((a, b) => b.faces.length - a.faces.length)
// 			.shift());
// 	const tortillaEdges = tortilla.map(el => el.edges);
// 	const tortillaFaces = tortilla.map(el => el.faces);
// 	return solveFacePair3D({ edges_foldAngle, faces_winding }, tortillaEdges, tortillaFaces);
// };

/**
 * @description Given a list of T-junctions, solve the relationship between the
 * two faces which overlap each other, resulting in a layer-solution mapping
 * space-separated face-pair strings to a value of 1 or 2.
 * @returns {{ [key: string]: number }} a subset of layer order solutions
 */
// const solveTJunctions = ({ edges_foldAngle, faces_winding }, edgePairData) => {
// 	const tortilla = edgePairData
// 		.map(el => Object.values(el.sets)
// 			.filter(row => row.facesSameSide)
// 			.shift());
// 	const tortillaEdges = tortilla.map(el => el.edges);
// 	const tortillaFaces = tortilla.map(el => el.faces);
// 	return solveFacePair3D({ edges_foldAngle, faces_winding }, tortillaEdges, tortillaFaces);
// };

/**
 * @description Given a list of bent-flat-tortillas, solve the relationship
 * between the two faces which overlap each other, resulting in a layer-
 * solution mapping space-separated face-pair strings to a value of 1 or 2.
 * @returns {{ [key: string]: number }} a subset of layer order solutions
 */
// const solveBentFlatTortillas = ({ edges_foldAngle, faces_winding }, edgePairData) => {
// 	// console.log("solveBentFlatTortillas", edgePairData);
// 	// const tortilla = edgePairData
// 	// 	.map(el => Object.values(el.sets)
// 	// 		.filter(row => row.facesSameSide)
// 	// 		.shift());
// 	// console.log("bentFlatTortillas", edgePairData);
// 	// console.log("tortilla", tortilla);
// 	return {};
// };

/**
 * @description
 * @returns {{ [key: string]: number }} a subset of layer order solutions
 */
// export const solveEdgeEdgeOverlapOrders = ({
// 	edges_foldAngle, faces_winding,
// }, YJunctions, TJunctions, bentFlatTortillas) => {
// 	const result1 = solveYJunctions({ edges_foldAngle, faces_winding }, YJunctions);
// 	const result2 = solveTJunctions({ edges_foldAngle, faces_winding }, TJunctions);
// 	const result3 = solveBentFlatTortillas({ edges_foldAngle, faces_winding }, bentFlatTortillas);
// 	// console.log("result1", result1);
// 	// console.log("result2", result2);
// 	// console.log("result3", result3);

// 	// todo: if results have a different solution to the same face-pair we need
// 	// to throw an error and state that there is no valid layer solution.
// 	return {
// 		...result1,
// 		...result2,
// 		...result3,
// 	};
// };
