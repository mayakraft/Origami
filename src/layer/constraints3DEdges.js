/**
 * Rabbit Ear (c) Kraft
 */
import { EPSILON } from "../math/constant.js";
import { arrayArrayToLookupArray } from "../general/array.js";
import { connectedComponentsPairs } from "../graph/connectedComponents.js";
import { invertFlatToArrayMap } from "../graph/maps.js";
import { mergeWithoutOverwrite } from "./general.js";
import { getEdgesEdgesCollinearOverlap, getFacesEdgesOverlap } from "../graph/overlap.js";

/**
 * @description There are two kinds of arrangements of edges/faces that
 * don't generate solver conditions, instead, they solve relationships
 * between pairs of faces.
 * @param {FOLD} graph a FOLD object
 * @param {{ clusters_graph: FOLD[], faces_plane: number[] }} clusterInfo,
 * the result of calling constraints3DFaceClusters()
 * @returns {{ edge: number, tortilla: number, coplanar: number, angled: number}[]}
 * solutions to face-pair layer orders
 */
export const getOverlapFacesWith3DEdge = (
	{ edges_faces },
	{ clusters_graph, faces_plane },
	epsilon = EPSILON,
) => {
	// edges that we care about are edges which have two adjacent faces,
	// and both adjacent faces are not in the same plane (fold angle is 3D).
	const edgesKeep = edges_faces.map(
		(faces) => faces.length === 2 && faces_plane[faces[0]] !== faces_plane[faces[1]],
	);

	// makes use of vertices_coords, edges_vertices, faces_vertices, faces_edges
	const clusters_graphNoBoundary = clusters_graph.map((graph) => ({
		vertices_coords: graph.vertices_coords,
		edges_vertices: graph.edges_vertices,
		faces_vertices: graph.faces_vertices,
		faces_edges: graph.faces_edges,
	}));

	// each clusters_graph's vertices_coords have been transformed into 2D,
	// compute the faces-edges overlap between only the components within
	// each subgraph, then, filter out any boundary edges from the result.
	//
	// we can't filter out boundary edges before computing faces-edges overlap,
	// because boundary edges are needed as a part of each face definition.
	const clustersFacesEdges = clusters_graphNoBoundary
		.map((graph) => getFacesEdgesOverlap(graph, epsilon))
		.map((facesEdges) =>
			facesEdges.map((edges) => edges.filter((edge) => edgesKeep[edge])),
		);

	const facesEdges3DInfo = clustersFacesEdges.flatMap((facesEdges) =>
		facesEdges.flatMap((edges, face) =>
			edges.map((edge) => ({
				edge,
				faces: edges_faces[edge],
				facesPlanes: edges_faces[edge].map((f) => faces_plane[f]),
				tortilla: face,
				tortillaPlane: faces_plane[face],
			})),
		),
	);

	return facesEdges3DInfo.map(
		({ edge, faces, facesPlanes, tortilla, tortillaPlane }) => ({
			edge,
			tortilla,
			coplanar: faces.filter((_, i) => facesPlanes[i] === tortillaPlane).shift(),
			angled: faces.filter((_, i) => facesPlanes[i] !== tortillaPlane).shift(),
		}),
	);
};

/**
 * @description There are two kinds of arrangements of edges/faces that
 * don't generate solver conditions, instead, they solve relationships
 * between pairs of faces.
 * @param {FOLD} graph a FOLD object
 * @param {{ edge: number, tortilla: number, coplanar: number, angled: number}[]}
 * edgeFace3DOverlaps an array of edge-face-3D overlap objects
 * @param {boolean[]} faces_winding for every face true if counter-clockwise.
 * @returns {{ [key: string]: number }} solutions to face-pair layer orders
 */
export const solveOverlapFacesWith3DEdge = (
	{ edges_foldAngle },
	edgeFace3DOverlaps,
	faces_winding,
) => {
	// get the two faces whose order will be solved.
	const facePairs = edgeFace3DOverlaps.map(({ tortilla, coplanar }) => [
		tortilla,
		coplanar,
	]);

	// are the face pairs in the correct order for the solver? where A < B?
	const facePairsCorrectOrder = facePairs.map(([a, b]) => a < b);

	// order the pair of faces so the smaller index comes first.
	facePairs
		.map((_, i) => i)
		.filter((i) => !facePairsCorrectOrder[i])
		.forEach((i) => facePairs[i].reverse());

	const facePairKeys = facePairs.map((pair) => pair.join(" "));

	// true is positive/valley, false is negative/mountain
	// a valley places the coplanar face above the tortilla face
	// a mountain places the coplanar face below the tortilla face
	const facePairLocalBendDirection = edgeFace3DOverlaps
		.map(({ edge }) => edges_foldAngle[edge])
		.map(Math.sign)
		.map((n) => n === 1);

	// for every face-pair, check the face adjacent to the 3D fold angle,
	// is it aligned with the normal of the plane?
	const facePairsAligned = edgeFace3DOverlaps.map(
		({ coplanar }) => faces_winding[coplanar],
	);

	// now, if the coplanar face from the coplanar-angled pair is flipped
	// in relation to the plane's normal (the face is upside-down),
	// then the bend direction should be inverted. valley = false, M = true.
	// This amounts to the XNOR between bend-dir and winding
	const facePairGlobalBendDirection = facePairLocalBendDirection
		// .map((dir, i) => !(dir ^ facePairsAligned[i]));
		.map((dir, i) => !(dir !== facePairsAligned[i]));

	// solver notation, where 1 means A is above B. 2 means B is above A.
	// also, if we flipped the order of the faces for the solution key,
	const facePairSolution = facePairGlobalBendDirection
		.map((bool) => (bool ? 1 : 0))
		.map((result, i) => (facePairsCorrectOrder[i] ? result : 1 - result))
		.map((result) => result + 1);

	// a dictionary with keys: face pairs ("5 23"), and values: 1 or 2.
	return mergeWithoutOverwrite(
		facePairKeys.map((key, i) => ({ [key]: facePairSolution[i] })),
	);
};

/**
 * @description Given a situation where two non-boundary edges are
 * parallel overlapping, and two of the faces lie in the same plane,
 * and need to be layer-solved. Consult the fold-angles, which imply the
 * position of the two other faces, this will determine the layer order
 * between the two faces. (given that the special case where both edges
 * are flat 0 angles which would be the tortilla-tortilla 2D case).
 * @param {{ edges_foldAngle: number[], faces_winding: boolean[] }} graph
 * a FOLD object with faces_winding
 * @param {number[]} edges
 * @param {number[]} faces
 * @returns {{ [key: string]: number }} face pair order solution
 */
export const solveFacePair3D = ({ edges_foldAngle, faces_winding }, edges, faces) => {
	// so the idea is, if we align the faces within the plane, meaning that if
	// a face is flipped, we "flip" it by negating the foldAngle, then we can
	// say that the face (edge) with the larger fold angle should be on top.
	// then we have to work backwards-if we flipped a face, we need to flip
	// the order, or if the faces are not ordered where A < B, also flip the order.
	const facesAligned = faces.map((face) => faces_winding[face]);
	const edgesFoldAngleAligned = edges
		.map((edge) => edges_foldAngle[edge])
		.map((angle, i) => (facesAligned[i] ? angle : -angle));
	const indicesInOrder = edgesFoldAngleAligned[0] > edgesFoldAngleAligned[1];
	const facesInOrder = faces[0] < faces[1];
	// 0 becomes 1, 1 becomes 2.
	// const orderValue = (indicesInOrder ^ facesInOrder) + 1;
	const orderValue = indicesInOrder !== facesInOrder ? 2 : 1;
	const faceKey = facesInOrder ? faces.join(" ") : [faces[1], faces[0]].join(" ");
	return { [faceKey]: orderValue };
};

/**
 * @param {{
 *   edges_faces: number[][],
 *   faces_plane: number[],
 *   facesFacesLookup: boolean[][],
 * }} info
 * - 0: bent (3D)
 * - 1: tortilla
 * - 2: taco
 * @returns {number[]} a classification for edges
 */
const getEdgesAngleClass = ({ edges_faces, faces_plane, facesFacesLookup }) => {
	/** @type {number[]} for every edge, a 0, 1, or 2 */
	const edges_angleClass = [];

	// filter only edges with two adjacent faces
	const degreeTwoEdges = edges_faces
		.map((_, edge) => edge)
		.filter((edge) => edges_faces[edge].length === 2);

	// filter only edges whose both faces are in the same plane
	degreeTwoEdges
		.filter((e) => faces_plane[edges_faces[e][0]] === faces_plane[edges_faces[e][1]])
		.forEach((edge) => {
			const [f0, f1] = edges_faces[edge];
			edges_angleClass[edge] = facesFacesLookup[f0][f1] ? 2 : 1;
		});

	// filter only edges whose both faces are not in the same plane
	degreeTwoEdges
		.filter((e) => faces_plane[edges_faces[e][0]] !== faces_plane[edges_faces[e][1]])
		.forEach((edge) => {
			edges_angleClass[edge] = 0;
		});
	return edges_angleClass;
};

/**
 * @description Given an overlapping pair of edges, classify it based on the
 * arrangements of the four faces in 3D space. The four faces
 * - 0: flat, or no overlaps to solve (ignore)
 * - 1: T-junction (generates order)
 * - 2: Y-junction (generates order)
 * - 3: bent-flat-tortillas (generates order)
 * - 4: bent-tortillas (generates tortilla_tortilla)
 * - 5: bent-tortilla-flat-taco (generates taco_tortilla)
 * - 6: unclassified (something went wrong)
 * @param {{
 *   faces: [number, number, number, number],
 *   planes: [number, number, number, number],
 *   angleClasses: [number, number],
 * }} for each edge, it's
 * - faces: four faces with stride matching the edges [e0, e0, e1, e1],
 * - planes: for every face (4), the index of the plane the face lies in
 * - angleClasses:
 * @param {boolean[][]} facesFacesLookup
 * @returns {number} 0-6 class id number
 */
const classifyEdgePair = ({ faces, planes, angleClasses }, facesFacesLookup) => {
	const [c0, c1] = angleClasses;
	const [f0, f1, f2, f3] = faces;
	const [p0, p1, p2, p3] = planes;

	// additional:
	// - four-plane: A-B and C-D

	if (c0 && c1) {
		return 0;
	}

	// true if any one pair's face overlaps any face from the other pair.
	const interPairOverlap =
		facesFacesLookup[f0][f2] ||
		facesFacesLookup[f0][f3] ||
		facesFacesLookup[f1][f2] ||
		facesFacesLookup[f1][f3];

	if (!interPairOverlap) {
		return 0;
	}

	// (letters are face planes in 3D: A, B, C, ...)

	// bent-flat tortillas
	// true if either includes "tortilla" and interPairOverlap
	// A1-A2 and A3-B, where A1-A2 do NOT overlap,
	// but A3 does overlap with either A1 or A2
	if (c0 === 1 || c1 === 1) {
		return 3;
	}

	// bent-tortilla-flat-taco
	// true if either includes "taco" and interPairOverlap
	// A1-A2 and A3-B, where A1-A2-A3 all overlap
	if (c0 === 2 || c1 === 2) {
		return 5;
	}

	// Y-junction
	// A1-B and A2-C, where A1-A2 overlap
	if (
		(p0 === p2 && p1 !== p3 && facesFacesLookup[f0][f2]) ||
		(p0 === p3 && p1 !== p2 && facesFacesLookup[f0][f3]) ||
		(p1 === p2 && p0 !== p3 && facesFacesLookup[f1][f2]) ||
		(p1 === p3 && p0 !== p2 && facesFacesLookup[f1][f3])
	) {
		return 2;
	}

	// T-junction
	// A1-B1 and A2-B2, where A1-A2 overlap and B1-B2 do NOT overlap
	if (
		(p0 === p2 && p1 === p3 && facesFacesLookup[f0][f2] && !facesFacesLookup[f1][f3]) ||
		(p0 === p3 && p1 === p2 && facesFacesLookup[f0][f3] && !facesFacesLookup[f1][f2]) ||
		(p1 === p2 && p0 === p3 && facesFacesLookup[f1][f2] && !facesFacesLookup[f0][f3]) ||
		(p1 === p3 && p0 === p2 && facesFacesLookup[f1][f3] && !facesFacesLookup[f0][f2])
	) {
		return 1;
	}

	// bent-tortillas
	// A1-B1 and A2-B2, where A1-A2 overlap and B1-B2 overlap
	if (
		(p0 === p2 && p1 === p3 && facesFacesLookup[f0][f2] && facesFacesLookup[f1][f3]) ||
		(p0 === p3 && p1 === p2 && facesFacesLookup[f0][f3] && facesFacesLookup[f1][f2]) ||
		(p1 === p2 && p0 === p3 && facesFacesLookup[f1][f2] && facesFacesLookup[f0][f3]) ||
		(p1 === p3 && p0 === p2 && facesFacesLookup[f1][f3] && facesFacesLookup[f0][f2])
	) {
		return 4;
	}

	// unclassified
	return 6;
};

/**
 * @description Given a FOLD graph in 3D, find all overlapping edge pairs
 * which create solvable face-pairs between faces adjacent to the edges.
 * Important: ensure that all edgePairs are edges which have been
 * pre-established to be edges which have two adjacent faces (no boundary edges)
 * @param {{
 *   edges_faces: number[][],
 *   edgePairs: [number, number][],
 *   faces_plane: number[],
 *   facesFacesLookup: boolean[][],
 * }} edgeAndFaceInfo
 * @returns {{
 *   tJunctions: number[],
 *   yJunctions: number[],
 *   bentFlatTortillas: number[],
 *   bentTortillas: number[],
 *   bentTortillasFlatTaco: number[],
 * }} for each class, a list of edgePairs indices which fit under this class.
 */
export const getSolvable3DEdgePairs = ({
	edges_faces,
	faces_plane,
	edgePairs,
	facesFacesLookup,
}) => {
	const edges_angleClass = getEdgesAngleClass({
		edges_faces,
		faces_plane,
		facesFacesLookup,
	});

	// gather info regarding each edgePair to pass off to the classification
	// edge pairs has been
	/**
	 * @type {{
	 *   faces: [number, number, number, number],
	 *   planes: [number, number, number, number],
	 *   angleClasses: [number, number],
	 * }[]}
	 * the second map function is there to satisfy the typescript linter
	 */
	const edgePairsClassInfo = edgePairs
		.map((edges) => ({
			faces: edges.flatMap((e) => edges_faces[e]),
			planes: edges.flatMap((e) => edges_faces[e].map((face) => faces_plane[face])),
			angleClasses: edges.map((edge) => edges_angleClass[edge]),
		}))
		.map(({ faces, planes, angleClasses }) => ({
			faces: [faces[0], faces[1], faces[2], faces[3]],
			planes: [planes[0], planes[1], planes[2], planes[3]],
			angleClasses: [angleClasses[0], angleClasses[1]],
		}));

	// each edgePair gets one of these assignments.
	// 0: ignore the first entry
	// 1: T-junction (generates order)
	// 2: Y-junction (generates order)
	// 3: bent-flat-tortillas (generates order)
	// 4: bent-tortillas (generates tortilla_tortilla)
	// 5: bent-tortilla-flat-taco (generates taco_tortilla)
	const edgePairsClass = edgePairsClassInfo.map((info) =>
		classifyEdgePair(info, facesFacesLookup),
	);

	// invert map to collate each edgePair index into its class array
	const [
		,
		tJunctions,
		yJunctions,
		bentFlatTortillas,
		bentTortillas,
		bentTortillasFlatTaco,
		uncaught,
	] = invertFlatToArrayMap(edgePairsClass);

	if (uncaught && uncaught.length) {
		console.warn("getSolvable3DEdgePairs uncaught edge pairs");
	}

	return {
		tJunctions: tJunctions || [],
		yJunctions: yJunctions || [],
		bentFlatTortillas: bentFlatTortillas || [],
		bentTortillas: bentTortillas || [],
		bentTortillasFlatTaco: bentTortillasFlatTaco || [],
	};
};

/**
 * @description Given a FOLD object which has 3D edges, generate an additional
 * set of solutions and constraints in preparation of solving the layer order,
 * the set of solutions includes solved orderings between pairs of faces, and
 * the additional constraints includes taco-tortilla and tortilla-tortilla.
 * @param {FOLD} graph a FOLD object
 * @param {{
 *   faces_plane: number[],
 *   faces_winding: boolean[],
 *   facesFacesOverlap: number[][],
 * }} info additional graph information where
 * - faces_plane: for every face, which plane does it inhabit
 * - faces_winding: for every face, is it aligned in its plane (true) or flipped
 * - facesFacesOverlap: for every face, a list of other faces which overlap.
 * @returns {{
 *   orders: { [key: string]: number },
 *   taco_tortilla: TacoTortillaConstraint[],
 *   tortilla_tortilla: TortillaTortillaConstraint[],
 * }}
 */
export const constraints3DEdges = (
	{ vertices_coords, edges_vertices, edges_faces, edges_foldAngle },
	{ faces_plane, faces_winding, facesFacesOverlap },
	epsilon = EPSILON,
) => {
	// a copy of edges_vertices with only edges with two adjacent faces
	const edges_vertices2 = edges_vertices.slice();
	edges_faces
		.map((_, e) => e)
		.filter((e) => edges_faces[e].length !== 2)
		.forEach((e) => delete edges_vertices2[e]);

	// all edge-edge overlap between pairs of edges, only including edges
	// which have two adjacent faces.
	const edgesEdgesOverlap = getEdgesEdgesCollinearOverlap(
		{
			vertices_coords,
			edges_vertices: edges_vertices2,
		},
		epsilon,
	);

	// all pairings of overlapping edges, only including edges which have
	// two adjacent faces. otherwise, this including pairs of edges which
	// hold no value to us at this stage
	const edgePairs = connectedComponentsPairs(edgesEdgesOverlap);

	const facesFacesLookup = arrayArrayToLookupArray(facesFacesOverlap);

	const {
		tJunctions,
		yJunctions,
		bentFlatTortillas,
		bentTortillas,
		bentTortillasFlatTaco,
	} = getSolvable3DEdgePairs({
		edges_faces,
		faces_plane,
		edgePairs,
		facesFacesLookup,
	});

	/**
	 * @description Given a pair of edges, already established to be the case
	 * where one face from each edge (and only one) lie coplanar together,
	 * solve the order between these two faces by checking the fold angle
	 * of the faces with the two other non-overlapping faces.
	 * @param {[number, number]} edges a pair of overlapping edges
	 * already established where one face from each edge (and only one)
	 * lie coplanar.
	 * @returns {{ [key: string]: number }} a face-pair solution for the solver
	 * where the key is a space-separated pair of face indices, and the value
	 * is a 1 or 2.
	 */
	const solveYTJunction = (edges) => {
		const [f0, f1, f2, f3] = edges.flatMap((e) => edges_faces[e]);
		// one face from edge[0] (f0 or f1) should be overlapping with another
		// face from edge[1] (f2 or f3). find and get this pair of faces.
		const faces = [
			[f0, f2],
			[f0, f3],
			[f1, f2],
			[f1, f3],
		]
			.filter(([a, b]) => facesFacesLookup[a][b])
			.shift();
		if (!faces) {
			return undefined;
		}
		return solveFacePair3D({ edges_foldAngle, faces_winding }, edges, faces);
	};

	/**
	 * @description This creates a taco-tortilla constraint
	 * @param {[number, number]} edges a pair of overlapping edges
	 * already established to form a bent-tortilla-flat-taco combo.
	 * @returns {TacoTortillaConstraint | undefined}
	 */
	const makeBentTortillaFlatTaco = (edges) => {
		const [f0, f1, f2, f3] = edges.flatMap((e) => edges_faces[e]);
		// every permutation of 3 faces (the fourth face is ignored in the overlap)
		// the order of the 3 faces is already in TacoTortillaConstraint form, where
		// the first and last are connected (taco) and the middle face is the tortilla
		const result = [
			[f0, f2, f1],
			[f2, f1, f3],
			[f2, f0, f3],
			[f0, f3, f1],
		]
			.filter(([a, b, c]) => facesFacesLookup[a][b] && facesFacesLookup[a][c])
			.shift();
		return result ? [result[0], result[1], result[2]] : undefined;
	};

	/**
	 * @description This creates a tortilla-tortilla constraint
	 * @param {[number, number]} edges a pair of overlapping edges
	 * already established to form a bent-tortilla combo.
	 * @returns {TortillaTortillaConstraint}
	 */
	const makeBentTortillas = (edges) => {
		const faces = edges.flatMap((edge) => edges_faces[edge]);
		/** @type {[number, number, number, number]} */
		const tortillas = [faces[0], faces[1], faces[2], faces[3]];

		// we now have a tortilla-tortilla pair in the form of [A, B, X, Y]
		// where A-B are connected, and X-Y are connected, now we need to make sure
		// that A is above/below X, and B is above/below Y.
		// if A is not in the same plane as X, reverse the X and Y.
		if (faces_plane[tortillas[0]] !== faces_plane[tortillas[2]]) {
			[tortillas[2], tortillas[3]] = [tortillas[3], tortillas[2]];
		}

		// Finally, each planar cluster chose a normal for that plane at random,
		// (the normal from whichever was the first face from that cluster).
		// Because these are bent tortillas, it's possible that the normal direction
		// flips moving from one face to the other inside of one tortilla.
		// The solver works by placing a face "above" or "below" the other, and
		// repeating that same action on the other side of the edge, but if the
		// normal flips, "below" and "above" flip too, and if we don't fix this,
		// the solver will have just created a self-intersecting tortilla-tortilla.
		// The solution is to check faces A and B's winding direction, do they match?
		// If they don't match, swap B and Y, so that the result is [A, Y, X, B]
		// which no longer means that each pair shares an edge in common, but that
		// does not matter.
		if (faces_winding[tortillas[0]] !== faces_winding[tortillas[1]]) {
			// swap face order [A, B, X, Y] into [A, Y, X, B]
			[tortillas[1], tortillas[3]] = [tortillas[3], tortillas[1]];
		}
		return tortillas;
	};

	const tortilla_tortilla = bentTortillas.map((i) => edgePairs[i]).map(makeBentTortillas);

	// taco-tortilla constraints could be undefined, filter these out.
	const taco_tortilla = bentTortillasFlatTaco
		.map((i) => edgePairs[i])
		.map(makeBentTortillaFlatTaco)
		.filter((a) => a !== undefined);

	// T-Junctions, Y-Junctions, and bent-flat-tortillas all get solved
	// by passing them into the same "solveYTJunction" method.
	const arrayOfOrders = [...tJunctions, ...yJunctions, ...bentFlatTortillas]
		.map((i) => edgePairs[i])
		.map(solveYTJunction);

	const orders = mergeWithoutOverwrite(arrayOfOrders);

	return {
		orders,
		tortilla_tortilla,
		taco_tortilla,
	};
};
