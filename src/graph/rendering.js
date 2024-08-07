/**
 * Rabbit Ear (c) Kraft
 */
import { scale3, add3, resize3 } from "../math/vector.js";
import { invertMatrix4, multiplyMatrix4Vector3 } from "../math/matrix4.js";
import { clone } from "../general/clone.js";
import { faceOrdersSubset, nudgeFacesWithFaceOrders } from "./orders.js";
import { countEdges, countImpliedEdges } from "./count.js";
import { invertArrayToFlatMap } from "./maps.js";
import { triangulate } from "./triangulate.js";
import { explodeFaces } from "./explode.js";
import { fixCycles } from "./cycles.js";
import { getFacesPlane } from "./faces/planes.js";
import { subgraphWithFaces } from "./subgraph.js";
import { join } from "./join.js";

const LAYER_NUDGE = 5e-6;

/**
 * @description This is a subroutine of prepareForRendering, if the layer order
 * of faces in a graph is found to have cycles, this method is called instead.
 * This explodes a graph so that faces which otherwise share
 * vertices are separated (creating more vertices). This method will also
 * nudge coplanar faces away from each other, based on their layer ordering
 * (via. faceOrders or faces_layer) by a tiny amount in the cross axis to
 * prevent z-fighting between coplanar faces.
 * @param {FOLDExtended} inputGraph a FOLD object
 * @param {{ earcut?: Function, layerNudge?: number }} options a small amount
 * to nudge the faces in the cross axis to prevent Z-fighting.
 * @returns {FOLD} a copy of the input FOLD graph, with exploded faces
 */
export const prepareForRenderingWithCycles = (
	inputGraph,
	{ earcut, layerNudge } = {},
) => {
	const graph = clone(inputGraph);
	const {
		// planes,
		planes_faces,
		planes_transform,
		// faces_plane,
		// faces_winding,
	} = getFacesPlane(graph);
	if (!graph.faceOrders) {
		return triangulate(graph, earcut).result;
	}
	const planes_inverseTransform = planes_transform.map(invertMatrix4);

	const planes_faceOrders = planes_faces.map((faces) =>
		faceOrdersSubset(graph.faceOrders, faces),
	);

	// ensure the vertices are in 3D before creating a bunch of subgraphs
	const graph3 = {
		...graph,
		vertices_coords: graph.vertices_coords.map(resize3),
	};

	const planes_graphs = planes_faces.map((faces) => subgraphWithFaces(graph3, faces));

	const planes_graphXY = planes_graphs.map((g, p) => ({
		...g,
		vertices_coords: g.vertices_coords.map((coord) =>
			multiplyMatrix4Vector3(planes_transform[p], coord),
		),
	}));

	// this resizes the length of the coordinates back to 2.
	const planes_graphXYFixed = planes_graphXY.map((g, p) =>
		fixCycles({
			...g,
			faceOrders: planes_faceOrders[p],
		}),
	);

	const planes_graphFixed = planes_graphXYFixed.map((graphXY, p) => ({
		...graphXY,
		vertices_coords: graphXY.vertices_coords
			.map(resize3)
			.map((coord) => multiplyMatrix4Vector3(planes_inverseTransform[p], coord)),
	}));

	const planes_facesNudge = planes_graphFixed.map((graphXY) =>
		nudgeFacesWithFaceOrders(graphXY),
	);

	// triangulate will modify faces and edges.
	// this will store the changes to the graph from the triangulation
	const planes_triangulatedVerbose = planes_graphFixed.map((g) => triangulate(g, earcut));

	const planes_graphExploded = planes_triangulatedVerbose
		.map(({ result }) => result)
		.map(explodeFaces);

	planes_triangulatedVerbose.forEach(({ changes }, p) => {
		const backmap = invertArrayToFlatMap(changes.faces.map);
		const verticesOffset = planes_graphExploded[p].vertices_coords.map(() => undefined);
		backmap.forEach((oldFace, face) => {
			const nudge = planes_facesNudge[p][oldFace];
			if (!nudge) {
				return;
			}
			planes_graphExploded[p].faces_vertices[face].forEach((v) => {
				verticesOffset[v] = scale3(nudge.vector, nudge.layer * layerNudge);
			});
		});
		verticesOffset.forEach((offset, v) => {
			if (!offset) {
				return;
			}
			planes_graphExploded[p].vertices_coords[v] = add3(
				resize3(planes_graphExploded[p].vertices_coords[v]),
				offset,
			);
		});
	});

	// join all graphs into one
	if (planes_graphExploded.length > 1) {
		planes_graphExploded.forEach((exploded, i) => {
			if (i === 0) {
				return;
			}
			join(planes_graphExploded[0], exploded);
		});
	}

	return planes_graphExploded[0];
};

/**
 * @description This explodes a graph so that faces which otherwise share
 * vertices are separated (creating more vertices). This method will also
 * nudge coplanar faces away from each other, based on their layer ordering
 * (via. faceOrders or faces_layer) by a tiny amount in the cross axis to
 * prevent z-fighting between coplanar faces.
 * @param {FOLDExtended} inputGraph a FOLD object
 * @param {{ earcut?: Function, layerNudge?: number }} options a small amount to nudge
 * the faces in the cross axis to prevent Z-fighting
 * @returns {FOLD} a copy of the input FOLD graph, with exploded faces
 */
export const prepareForRendering = (
	inputGraph,
	{ earcut, layerNudge = LAYER_NUDGE } = {},
) => {
	// todo: remove the structured clone as long as everything is working.
	// update: shallow copy is not working. the input parameter is still modified.
	const graph = clone(inputGraph);
	// const copy = { ...graph };

	// we render "J" joined edges differently from all others. if edges_assignment
	// doesn't exist, make it with all assignments set to "U".
	// the user will never see this data, it's just for visualization.
	if (!graph.edges_assignment) {
		const edgeCount = countEdges(graph) || countImpliedEdges(graph);
		if (edgeCount) {
			graph.edges_assignment = Array(edgeCount).fill("U");
		}
	}

	// if no faceOrders exist, all we need to do is triangulate the graph
	// and return the modified copy.
	if (!graph.faceOrders) {
		return explodeFaces(triangulate(graph, earcut).result);
	}

	// figure out as soon as possible whether or not this graph contains cycles
	// if so, we need to heavily modify the graph: isolated the coplanar sets
	// of faces, find any with cycles and planarize them (creating a vastly
	// different graph), build new face orders, and reassemble the graph
	const faces_nudge = nudgeFacesWithFaceOrders(graph);
	if (!faces_nudge) {
		return prepareForRenderingWithCycles(inputGraph, { earcut, layerNudge });
	}

	// triangulate will modify faces and edges.
	// use face information to match data.
	const { changes, result: triangulated } = triangulate(graph, earcut);

	// explode will modify edges and vertices.
	// we don't need the return information for anything just yet.
	const exploded = explodeFaces(triangulated);
	// Object.assign(changes, change2);

	if (changes.faces) {
		const backmap = invertArrayToFlatMap(changes.faces.map);
		backmap.forEach((oldFace, face) => {
			const nudge = faces_nudge[oldFace];
			if (!nudge) {
				return;
			}
			exploded.faces_vertices[face].forEach((v) => {
				const vec = scale3(nudge.vector, nudge.layer * layerNudge);
				exploded.vertices_coords[v] = add3(resize3(exploded.vertices_coords[v]), vec);
			});
		});
	}

	return exploded;
};
