/**
 * Rabbit Ear (c) Kraft
 */
import math from "../../math";
import { filterKeysWithPrefix } from "../../fold/spec";
import { invertMap } from "../../graph/maps";
import {
	makeEdgesFacesUnsorted,
	makeFacesEdgesFromVertices,
} from "../../graph/make";
import { selfRelationalUniqueIndexPairs } from "../../general/arrays";
import {
	overlappingFacesGroups,
} from "../../graph/overlap";
import makeTacosTortillas from "./makeTacosTortillas";
import makeTransitivityTrios from "./makeTransitivityTrios";
import filterTransitivity from "./filterTransitivity";
// import { makeFacesWinding } from "../../graph/facesWinding";
import {
	makeConstraints,
	makeConstraintsLookup,
} from "./makeConstraints";
import solveEdgeAdjacent from "./solveEdgeAdjacent";
import make3DTacoTacos from "./make3DTacoTacos";

const graphGroupCopies = (graph, overlapInfo, groups_faces) => {
	// make shallow copies of the graph, one for every group
	const copies = overlapInfo.groups_transformXY.map(() => ({ ...graph }));
	// delete all vertices data. delete some edges data.
	filterKeysWithPrefix(graph, "vertices")
		.forEach(key => copies.forEach(obj => delete obj[key]));
	copies.forEach(obj => delete obj.edges_edges);
	copies.forEach(obj => delete obj.edges_faces);

	// the faces will determine which vertices and edges get carried over to each copy
	const faceKeys = filterKeysWithPrefix(graph, "faces");
	copies.forEach((obj, i) => faceKeys.forEach(key => {
		obj[key] = [];
		groups_faces[i].forEach(f => { obj[key][f] = graph[key][f]; });
	}));

	// given each group's faces, only carry over the adjacent vertices for each group.
	const vertices_coords_3d = graph.vertices_coords
		.map(coord => math.core.resize(3, coord));
	const groups_vertices_hash = groups_faces.map(() => ({}));
	groups_faces
		.forEach((faces, i) => faces
			.forEach(face => graph.faces_vertices[face]
				.forEach(v => { groups_vertices_hash[i][v] = true; })));
	const groups_vertices = groups_vertices_hash
		.map(obj => Object.keys(obj).map(n => parseInt(n, 10)));
	copies.forEach(obj => { obj.vertices_coords = []; });
	overlapInfo.groups_transformXY
		.forEach((transform, i) => groups_vertices[i]
			.forEach(v => {
				const res = math.core.multiplyMatrix4Vector3(transform, vertices_coords_3d[v]);
				copies[i].vertices_coords[v] = [res[0], res[1]];
			}));

	// given each group's faces, only carry over the adjacent edges for each group.
	const groups_edges_hash = groups_faces.map(() => ({}));
	groups_faces
		.forEach((faces, i) => faces
			.forEach(face => graph.faces_edges[face]
				.forEach(e => { groups_edges_hash[i][e] = true; })));
	const groups_edges = groups_edges_hash
		.map(obj => Object.keys(obj).map(n => parseInt(n, 10)));
	const edgeKeys = filterKeysWithPrefix(graph, "edges");
	copies.forEach((obj, i) => edgeKeys.forEach(key => {
		obj[key] = [];
		groups_edges[i].forEach(e => { obj[key][e] = graph[key][e]; });
	}));
	copies.forEach(obj => { obj.edges_faces = makeEdgesFacesUnsorted(obj); });
	// const makeEdgesFacesUnsorted = ({ edges_vertices, faces_edges }) => {
	// console.log("groups_faces", groups_faces);
	// console.log("groups_vertices", groups_vertices);
	// console.log("groups_edges", groups_edges);
	return copies;
};

const prepare = (graphInput, epsilon = 1e-6) => {
	const graph = { ...graphInput };
	if (!graph.faces_edges) {
		graph.faces_edges = makeFacesEdgesFromVertices(graph);
	}
	const overlapInfo = overlappingFacesGroups(graph, epsilon);
	// these groups have more than 1 face in them.
	// const groups = groups_faces
	// 	.map((faces, i) => ({ faces, i }))
	// 	.filter(el => el.faces.length > 1)
	// 	.map(el => el.i);
	const groups_faces = invertMap(overlapInfo.faces_group)
		.map(el => (el.constructor === Array ? el : [el]));
	const graphCopies = graphGroupCopies(graph, overlapInfo, groups_faces);
	const faces_polygon = [];
	groups_faces
		.map((faces, g) => faces
			.map(face => graph.faces_vertices[face])
			.map(vertices => vertices.map(v => graphCopies[g].vertices_coords[v]))
			.forEach((polygon, f) => { faces_polygon[faces[f]] = polygon; }));
	const faces_center = faces_polygon
		.map(polygon => polygon
			.reduce((a, b) => math.core.add(a, b), [0, 0])
			.map(el => el / polygon.length));
	graphCopies.forEach(el => {
		el.faces_center = el.faces_vertices.map((_, i) => faces_center[i]);
	});
	const groups_tacos_tortillas = graphCopies
		.map(el => makeTacosTortillas(el, epsilon));
	const groups_unfiltered_trios = graphCopies
		.map(el => makeTransitivityTrios(
			el,
			overlapInfo.faces_facesOverlap,
			overlapInfo.faces_winding,
			epsilon,
		));
	const groups_transitivity_trios = groups_unfiltered_trios
		.map((trios, i) => filterTransitivity(trios, groups_tacos_tortillas[i]));
	const groups_constraints = groups_tacos_tortillas
		.map((tacos_tortillas, i) => makeConstraints(
			tacos_tortillas,
			groups_transitivity_trios[i],
		));
	const facePairsInts = selfRelationalUniqueIndexPairs(overlapInfo.faces_facesOverlap);
	const facePairs = facePairsInts.map(pair => pair.join(" "));
	// const groups_edgeAdjacentOrders = graphCopies
	// 	.map(el => solveEdgeAdjacent(el, facePairs, overlapInfo.faces_winding));
	const facePairsIndex_group = facePairsInts
		.map(pair => overlapInfo.faces_group[pair[0]]);
	const groups_facePairsIndex = invertMap(facePairsIndex_group)
		.map(el => (el.constructor === Array ? el : [el]));
	const groups_facePairsWithHoles = groups_facePairsIndex
		.map(indices => indices.map(i => facePairs[i]));
	const groups_facePairs = groups_constraints
		.map((_, i) => (groups_facePairsWithHoles[i] ? groups_facePairsWithHoles[i] : []));
	// console.log("prepare", overlapInfo);
	// console.log("graphCopies", graphCopies);
	// console.log("faces_polygon", faces_polygon);
	// console.log("faces_center", faces_center);
	// console.log("groups_tacos_tortillas", groups_tacos_tortillas);
	// console.log("groups_unfiltered_trios", groups_unfiltered_trios);
	// console.log("groups_transitivity_trios", groups_transitivity_trios);
	// console.log("groups_constraints", groups_constraints);
	// console.log("groups_constraintsLookup", groups_constraintsLookup);
	// console.log("facePairsInts", facePairsInts);
	// console.log("facePairs", facePairs);
	// console.log("groups_edgeAdjacentOrders", groups_edgeAdjacentOrders);
	// console.log("facePairsIndex_group", facePairsIndex_group);
	// console.log("groups_facePairsIndex", groups_facePairsIndex);
	// console.log("groups_facePairs", groups_facePairsWithHoles);

	// now we join all the data from the separate groups together.
	// make sure edges_faces is added here, not any sooner
	if (!graph.edges_faces) {
		graph.edges_faces = makeEdgesFacesUnsorted(graph);
	}
	const constraints = {
		taco_taco: [],
		taco_tortilla: [],
		tortilla_tortilla: [],
		transitivity: [],
	};
	groups_constraints.forEach(group => {
		constraints.taco_taco.push(...group.taco_taco);
		constraints.taco_tortilla.push(...group.taco_tortilla);
		constraints.tortilla_tortilla.push(...group.tortilla_tortilla);
		constraints.transitivity.push(...group.transitivity);
	});
	const taco_taco_3D = make3DTacoTacos(graph, overlapInfo, epsilon).map(el => [
		el[0][0], el[1][0], el[0][1], el[1][1],
	]);
	constraints.tortilla_tortilla.push(...taco_taco_3D);
	const constraintsLookup = makeConstraintsLookup(constraints);
	const facePairsFlat = groups_facePairs.flat();
	const edgeAdjacentOrders = solveEdgeAdjacent(graph, facePairs, overlapInfo.faces_winding);
	// console.log("constraints", constraints);
	// console.log("taco_taco_3D", taco_taco_3D);
	// console.log("constraintsLookup", constraintsLookup);
	// console.log("facePairsFlat", facePairsFlat);
	// console.log("edgeAdjacentOrders", edgeAdjacentOrders);
	return {
		constraints,
		constraintsLookup,
		facePairs: facePairsFlat,
		edgeAdjacentOrders,
		faces_winding: overlapInfo.faces_winding,
	};
	// return {
	// 	groups_constraints,
	// 	groups_constraintsLookup,
	// 	groups_facePairs,
	// 	groups_edgeAdjacentOrders,
	// 	faces_winding: overlapInfo.faces_winding,
	// };
};

export default prepare;