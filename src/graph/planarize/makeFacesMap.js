/**
 * Rabbit Ear (c) Kraft
 */
import { chooseTwoPairs, uniqueElements } from "../../general/array.js";
import { connectedComponents } from "../connectedComponents.js";
import { makeEdgesFacesUnsorted } from "../make/edgesFaces.js";
import { makeFacesEdgesFromVertices } from "../make/facesEdges.js";
import { makeFacesFaces } from "../make/facesFaces.js";
import { invertArrayMap, invertFlatToArrayMap } from "../maps.js";
import { minimumSpanningTrees } from "../trees.js";

/**
 * @param {FOLD} oldGraph a FOLD object
 * @param {FOLD} newGraph a FOLD object
 * @param {{ vertices: { map: number[][] }, edges: { map: number[][] }}} changes
 * @returns {number[][]} a face map
 */
export const makeFacesMap = (oldGraph, newGraph, changes) => {
	if (!oldGraph.faces_vertices) {
		return [];
	}
	// get rid of the undefinedes, these will break the connected components
	const faces_edgesNew = newGraph.faces_edges || makeFacesEdgesFromVertices(newGraph);
	const faces_facesNew = makeFacesFaces(newGraph).map((arr) =>
		arr.filter((a) => a !== null && a !== undefined),
	);
	const edges_facesNew = makeEdgesFacesUnsorted(newGraph);
	const edges_facesOld = makeEdgesFacesUnsorted(oldGraph);

	// this must work even with disjoint sets of faces. get the connected sets of
	// faces and invert so that the array contains arrays of (connected) faces.
	// if all faces connect, "groups" will contain only one array.
	const connectedFaces = connectedComponents(faces_facesNew);
	const facesGroups = invertFlatToArrayMap(connectedFaces);
	const edgesGroups = facesGroups
		.map((faces) => faces.flatMap((f) => faces_edgesNew[f]))
		.map(uniqueElements);

	// for each group, get the first edge which contains only one adjacent face
	// convert this list of edges into a list of faces. these are the starting
	// faces from which we build the minimum spanning tree.
	// These relate to the newGraph.
	const startEdges = edgesGroups.map((group) =>
		group.find((e) => edges_facesNew[e].length === 1),
	);
	const startFaces = startEdges.map((edge) => edges_facesNew[edge][0]);

	//
	const facesEdgeMap = {};
	edges_facesNew.forEach((faces, e) =>
		chooseTwoPairs(faces).forEach((pair) => {
			facesEdgeMap[pair.join(" ")] = e;
			facesEdgeMap[pair.reverse().join(" ")] = e;
		}),
	);

	// console.log("faces_facesNew", faces_facesNew);
	// console.log("connectedFaces", connectedFaces);
	// console.log("facesGroups", facesGroups);
	// console.log("edgesGroups", edgesGroups);
	// console.log("startEdges", startEdges);
	// console.log("startFaces", startFaces);
	// console.log("facesEdgeMap", facesEdgeMap);
	// console.log("changes.edges.map", changes.edges.map);
	// console.log("edgesBackmap", edgesBackmap);

	const edgesBackmap = invertArrayMap(changes.edges.map);
	const faceBackMapSets = [];
	minimumSpanningTrees(faces_facesNew, startFaces).forEach((tree, t) => {
		const rootRow = tree.shift();
		if (!rootRow || !rootRow.length) {
			return;
		}
		// root tree item is the first item in the first row (only item in the row)
		const root = rootRow[0];
		const startNewEdge = startEdges[t];
		const startOldEdges = edgesBackmap[startNewEdge];
		faceBackMapSets[root.index] = new Set(
			startOldEdges.flatMap((edge) => edges_facesOld[edge]),
		);
		tree.forEach((level) =>
			level.forEach(({ index, parent }) => {
				const edge = facesEdgeMap[`${index} ${parent}`];
				const oldEdges = edgesBackmap[edge];
				const oldFaces = oldEdges.flatMap((e) => edges_facesOld[e]);
				// create a copy of the parent's faces, modify it and set it to this face.
				const parentFaces = new Set(faceBackMapSets[parent]);
				// add oldFaces to the stack if they don't exist, remove if they do.
				oldFaces.forEach((f) =>
					parentFaces.has(f) ? parentFaces.delete(f) : parentFaces.add(f),
				);
				faceBackMapSets[index] = parentFaces;
			}),
		);
	});
	const faceBackMap = faceBackMapSets.map((set) => Array.from(set));
	return invertArrayMap(faceBackMap);
};
