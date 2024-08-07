import fs from "fs";
import { expect, test } from "vitest";
import ear from "../src/index.js";

test("coplanar faces groups", () => {
	const foldFile = fs.readFileSync("./tests/files/fold/maze-u.fold", "utf-8");
	const foldObject = JSON.parse(foldFile);
	const graph = ear.graph.getFramesByClassName(foldObject, "foldedForm")[0];
	graph.faceOrders = ear.layer.layer3D(graph).faceOrders();
	const faces_nudge = ear.graph.nudgeFacesWithFaceOrders(graph);
	fs.writeFileSync(`./tests/tmp/faces_nudge.json`, JSON.stringify(faces_nudge, null, 2));
});

test("linear order face orders", () => {
	const FOLD = fs.readFileSync("./tests/files/fold/square-fish-3d.fold", "utf-8");
	const graph = JSON.parse(FOLD);
	const vertices_coords = ear.graph.makeVerticesCoordsFolded(graph);
	const folded = { ...graph, vertices_coords };
	const faces_normal = ear.graph.makeFacesNormal(folded);
	const set1 = ear.graph.linearizeFaceOrders({
		faceOrders: [
			[0, 1, 1],
			[9, 14, 1],
			[1, 14, 1],
		],
		faces_normal,
	});
	const set2 = ear.graph.linearizeFaceOrders({
		faceOrders: [
			[2, 3, 1],
			[2, 13, 1],
			[8, 13, 1],
		],
		faces_normal,
	});
	expect(JSON.stringify(set1)).toBe(JSON.stringify([0, 14, 1, 9]));
	expect(JSON.stringify(set2)).toBe(JSON.stringify([2, 3, 8, 13]));
});

test("testing the inside of the linearizeFaceOrders method", () => {
	const FOLD = fs.readFileSync("./tests/files/fold/square-fish-3d.fold", "utf-8");
	const graph = JSON.parse(FOLD);
	const vertices_coords = ear.graph.makeVerticesCoordsFolded(graph);
	const folded = { ...graph, vertices_coords };
	const faces_normal = ear.graph.makeFacesNormal(folded);
	const faceOrders1 = [
		[0, 1, 1],
		[9, 14, 1],
		[1, 14, 1],
	];
	const faceOrders2 = [
		[2, 3, 1],
		[2, 13, 1],
		[8, 13, 1],
	];
	const faces1 = ear.general.uniqueSortedNumbers(
		faceOrders1.flatMap((order) => [order[0], order[1]]),
	);
	const faces2 = ear.general.uniqueSortedNumbers(
		faceOrders2.flatMap((order) => [order[0], order[1]]),
	);
	// the first face's normal will determine the linearization direction.
	const normal1 = faces_normal[faces1[0]];
	const normal2 = faces_normal[faces2[0]];
	const facesNormalMatch1 = [];
	faces1.forEach((f) => {
		facesNormalMatch1[f] = ear.math.dot(faces_normal[f], normal1) > 0;
	});
	const facesNormalMatch2 = [];
	faces2.forEach((f) => {
		facesNormalMatch2[f] = ear.math.dot(faces_normal[f], normal2) > 0;
	});
	// this pair states face [0] is above face [1]. according to the +1 -1 order,
	// and whether or not the reference face [1] normal is flipped. (xor either)
	const directedEdges1 = faceOrders1.map((order) =>
		(order[2] === -1) ^ !facesNormalMatch1[order[1]]
			? [order[0], order[1]]
			: [order[1], order[0]],
	);
	const directedEdges2 = faceOrders2.map((order) =>
		(order[2] === -1) ^ !facesNormalMatch2[order[1]]
			? [order[0], order[1]]
			: [order[1], order[0]],
	);
	expect(facesNormalMatch1[0]).toBe(true);
	expect(facesNormalMatch1[1]).toBe(false);
	expect(facesNormalMatch1[9]).toBe(false);
	expect(facesNormalMatch1[14]).toBe(true);
	expect(facesNormalMatch2[2]).toBe(true);
	expect(facesNormalMatch2[3]).toBe(false);
	expect(facesNormalMatch2[8]).toBe(true);
	expect(facesNormalMatch2[13]).toBe(false);
	expect(JSON.stringify(directedEdges1)).toBe(
		JSON.stringify([
			[0, 1],
			[14, 9],
			[14, 1],
		]),
	);
	expect(JSON.stringify(directedEdges2)).toBe(
		JSON.stringify([
			[2, 3],
			[2, 13],
			[8, 13],
		]),
	);
});

test("inside of nudgeFacesWithFaceOrders", () => {
	const FOLD = fs.readFileSync("./tests/files/fold/square-fish-3d.fold", "utf-8");
	const graph = JSON.parse(FOLD);
	const vertices_coords = ear.graph.makeVerticesCoordsFolded(graph);
	const folded = { ...graph, vertices_coords };
	const faceOrders = [
		[0, 1, 1],
		[2, 3, 1],
		[4, 5, 1],
		[6, 7, 1],
		[10, 11, 1],
		[2, 13, 1],
		[8, 13, 1],
		[9, 14, 1],
		[1, 14, 1],
		[12, 15, 1],
	];
	const faces_set = ear.graph.connectedComponents(
		ear.graph.makeVerticesVerticesUnsorted({
			edges_vertices: faceOrders.map((ord) => [ord[0], ord[1]]),
		}),
	);
	const sets_faces = ear.graph.invertFlatToArrayMap(faces_set);
	const faces_normal = ear.graph.makeFacesNormal(folded);
	const sets_layers_face = sets_faces
		.map((faces) => ear.graph.faceOrdersSubset(faceOrders, faces))
		.map((orders) => ear.graph.linearizeFaceOrders({ faceOrders: orders, faces_normal }));

	expect(JSON.stringify(faces_set)).toBe(
		JSON.stringify([0, 0, 1, 1, 2, 2, 3, 3, 1, 0, 4, 4, 5, 1, 0, 5]),
	);
	sets_faces.forEach((faces, i) =>
		expect(JSON.stringify(faces)).toBe(
			JSON.stringify(
				[
					[0, 1, 9, 14],
					[2, 3, 8, 13],
					[4, 5],
					[6, 7],
					[10, 11],
					[12, 15],
				][i],
			),
		),
	);
	expect(JSON.stringify(sets_layers_face)).toBe(
		JSON.stringify([
			[0, 14, 1, 9],
			[2, 3, 8, 13],
			[4, 5],
			[6, 7],
			[10, 11],
			[12, 15],
		]),
	);
});

test("linear order face orders with cycle", () => {
	const FOLD = fs.readFileSync("./tests/files/fold/windmill.fold", "utf-8");
	const fold = JSON.parse(FOLD);
	const folded = ear.graph.getFramesByClassName(fold, "foldedForm")[0];
	const faces_normal = ear.graph.makeFacesNormal(folded);
	const linear = ear.graph.linearizeFaceOrders({
		...folded,
		faces_normal,
	});
	// console.log(linear);
	// const set2 = ear.graph.linearizeFaceOrders({
	// 	faceOrders: [[2, 3, 1], [2, 13, 1], [8, 13, 1]],
	// 	faces_normal,
	// });
	// expect(JSON.stringify(set1)).toBe(JSON.stringify([0, 14, 1, 9]));
	// expect(JSON.stringify(set2)).toBe(JSON.stringify([2, 3, 8, 13]));
});
