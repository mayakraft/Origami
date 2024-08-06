/**
 * Rabbit Ear (c) Kraft
 */
import { topologicalSort } from "./directedGraph.js";
import { makeFacesWinding } from "./faces/winding.js";
import { join } from "./join.js";
import { makeEdgesFacesUnsorted } from "./make/edgesFaces.js";
import { invertArrayMap } from "./maps.js";
import { makeFacesNormal } from "./normals.js";
import { faceOrdersToDirectedEdges } from "./orders.js";
import { planarizeVerbose } from "./planarize/planarize.js";

/**
 * @description Given a graph, reassign edge assignments to be "J" join
 * if the two adjacent faces (according to the face map) are from
 * the same face.
 * @param {FOLD} planar
 * @param {number[]} flatBackmap
 * @return {FOLD}
 */
const makeOneSide = (planar, flatBackmap) => {
	planar.edges_faces.forEach((faces, e) => {
		if (faces.length !== 2) {
			return;
		}
		// get the top-most face in the stack, this is the face which will be visible
		const [a, b] = faces.map((f) => flatBackmap[f]);
		// if a === b, the two adjacent faces came from the same face. change the
		// assignment between them to be a "join".
		if (a === b && planar.edges_assignment) {
			planar.edges_assignment[e] = "J";
		}
		// this is kind of unnecessary, but it will ensure that the graph is valid
		if (a === b && planar.edges_foldAngle) {
			planar.edges_foldAngle[e] = 0;
		}
	});
	return planar;
};

/**
 * @description Flip the winding order of faces in a graph according to
 * the facemap, make the winding of a face match the winding of the reference
 * face from the facemap.
 * @param {FOLD} planar
 * @param {boolean[]} faces_winding
 * @param {number[]} flatBackmap
 */
const correctFaceWinding = (planar, faces_winding, flatBackmap) =>
	planar.faces_vertices
		.map((_, i) => i)
		.filter((f) => !faces_winding[flatBackmap[f]])
		.forEach((f) => {
			planar.faces_vertices[f].reverse();
			planar.faces_edges[f].reverse();
			// winding order between the two is not correct until this happens
			planar.faces_edges[f].push(planar.faces_edges[f].shift());
		});

/**
 * @description Create a copy of a graph suitable for rendering, fixing
 * any cycles of orders between faces so that no cycles exist. The resulting
 * graph will be very different in its graph structure, but appear correct
 * from both front and back.
 * @param {FOLD} graph a FOLD object in foldedForm, can contain holes,
 * vertices_coords should be in 2D.
 * @returns {FOLD} a (heavily modified) version of the graph but one which
 * appears the same in renderings.
 */
export const fixCycles = (graph) => {
	const {
		result: planar,
		changes: {
			faces: { map },
		},
	} = planarizeVerbose(graph);
	planar.edges_faces = makeEdgesFacesUnsorted(planar);
	const facesBackMap = invertArrayMap(map);

	if (!planar.edges_assignment && planar.edges_vertices) {
		planar.edges_assignment = planar.edges_vertices.map(() => "U");
	}

	// faceOrdersToDirectedEdges normally chooses a rootFace on its own,
	// but we need to know if the root face's winding is flipped or not,
	// at the very end of this method, this will determine the order between
	// the "front" and "back" planes, which side of each other they should lie.
	const rootFace =
		graph.faceOrders && graph.faceOrders.length ? graph.faceOrders[0][0] : undefined;

	// this should happen on the input graph, not the planar graph.
	const faces_normal = makeFacesNormal(graph);
	const directedFacesOld = faceOrdersToDirectedEdges(
		{ ...graph, faces_normal },
		rootFace,
	);
	const faces_winding = makeFacesWinding(graph);

	// todo: need to optimize this block
	// backmap contains values with old face indices
	const facesBackMapOrdered = facesBackMap.map((faces) => {
		const lookup = {};
		faces.forEach((f) => {
			lookup[f] = true;
		});
		const theseFaces = directedFacesOld.filter(([a, b]) => lookup[a] && lookup[b]);
		const facesSorted = topologicalSort(theseFaces);
		const missingFaces = faces.filter((f) => facesSorted.indexOf(f) === -1);
		return missingFaces.concat(facesSorted);
	});

	// now that our backmap is ordered along one axis, create two flat backmaps
	// one for each side: front and back. create each by grabbing the first or
	// last face from the ordered list, respectively.
	const faceMapFront = facesBackMapOrdered.map((arr) => arr[0]);
	const faceMapBack = facesBackMapOrdered.map((arr) => arr.slice().reverse()[0]);

	// duplicate the graph so that each graph represents what the graph appears
	// like from both front and back directions. This involves reassigning some
	// creases to be "J" join assignment in the case where two adjacent faces
	// came from the same original face (as appears from this side).
	const front = makeOneSide(structuredClone(planar), faceMapFront);
	const back = makeOneSide(planar, faceMapBack);

	// all face windings are upright due to the planarize method.
	// correct the winding of each front/back graph to match the
	// topmost/bottommost face winding from the original graph.
	correctFaceWinding(front, faces_winding, faceMapFront);
	correctFaceWinding(back, faces_winding, faceMapBack);

	// we are about to join two copies of the same graph, create an ordering between
	// pairs of copies of the same face (index difference by +length) where one set
	// is always placed in front of the other. "in front of" means something relative
	// to the g face ([f, g, order]) depending on its winding, so, order accordingly.
	// Additionally, "in front of" is relative to one axis, the axis which was chosen
	// by the root face (it's okay if "rootFace" is undefined).
	const faceOrdersPairs = front.faces_vertices.map((_, f) => [
		front.faces_vertices.length + f,
		f,
	]);
	/** @type {[number, number, number][]} */
	const faceOrders = faceOrdersPairs.map(([a, b], f) =>
		faces_winding[faceMapFront[f]]
			? faces_winding[rootFace]
				? [a, b, 1]
				: [a, b, -1]
			: faces_winding[rootFace]
				? [a, b, -1]
				: [a, b, 1],
	);

	// console.log(front.faces_vertices, back.faces_vertices);
	// join two graphs into one, the result is stored into "front" graph.
	join(front, back);
	return {
		...front,
		faceOrders,
		frame_classes: ["foldedForm"],
	};
};
