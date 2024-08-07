import { expect, test } from "vitest";
import fs from "fs";
import ear from "../src/index.js";

test("foldGraph, faceOrders, square folding, valley, valley", () => {
	const graph = ear.graph.square();
	let vertices_coordsFolded;

	ear.graph.foldGraph(graph, { vector: [3, 1], origin: [0.5, 0.5] }, ear.math.includeL, {
		assignment: "V",
	});
	graph.faceOrders = [[0, 1, 1]];
	expect(graph.faceOrders).toMatchObject([[0, 1, 1]]);
	ear.graph.foldGraph(graph, { vector: [-1, 5], origin: [0.5, 0.5] }, ear.math.includeL, {
		assignment: "V",
	});

	// splitFace (first): 0 becomes 2, 3
	// [0, 1, 1] becomes two rules: [2, 1, 1], [3, 1, 1].
	// remap: 0->X 1->0 2->1 3->2
	// rules become: [1, 0, 1] and [2, 0, 1]
	// splitFace (second): 0 becomes 3, 4
	// [1, 0, 1] becomes [1, 3, 1] and [1, 4, 1]
	// [2, 0, 1] becomes [2, 3, 1] and [2, 4, 1], the order should be:
	// [1, 3, 1], [2, 3, 1], [1, 4, 1], [2, 4, 1]
	// faces get remapped, 0->X, 1->0, 2->1, 3->2, 4->3
	// [0, 2, 1], [1, 2, 1], [0, 3, 1], [1, 3, 1]
	// finally, we deal with the faces which no longer overlap
	// 0, 2 no longer overlap, 1, 3 no longer overlap
	// split line separated by a "valley"
	// windings: 0 true, 1 true, 2 false, 3 false
	// 0-2 face 2 is second one, false on valley results in -1
	// 1-3 face 3 is second one, false on valley, results in -1. becomes:
	// [0, 2, -1], [1, 2, 1], [0, 3, 1], [1, 3, -1]
	// two new orders:
	// - 0-1 (true winding) valley 1.
	// - 2-3 (false winding) valley -1.
	expect(graph.faceOrders).toMatchObject([
		[1, 2, 1],
		[0, 3, 1],
		// [0, 1, 1], // simple fold yes, not foldGraph
		// [2, 3, -1], // simple fold yes, not foldGraph
		// [0, 2, -1], // simple fold yes, not foldGraph
		// [1, 3, -1], // simple fold yes, not foldGraph
	]);

	// run the layer solver
	vertices_coordsFolded = ear.graph.makeVerticesCoordsFlatFolded(graph, [0]);
	graph.faceOrders = ear
		.layer({ ...graph, vertices_coords: vertices_coordsFolded })
		.faceOrders();

	expect(graph.faceOrders).toMatchObject([
		[1, 2, 1],
		[0, 3, 1],
		[0, 1, 1], // fold
		[2, 3, -1], // fold
		[0, 2, -1], // fold
		[1, 3, -1], // fold
	]);

	ear.graph.foldGraph(
		graph,
		{ vector: [4, -1], origin: [0.25, 0.25] },
		ear.math.includeL,
		{ assignment: "V" },
	);
	expect(graph.faceOrders).toMatchObject([
		[0, 4, -1],
		[2, 6, -1],
		[1, 6, 1],
		[1, 2, 1],
		[3, 4, 1],
		[0, 3, 1],
		[2, 5, 1],
		[5, 6, -1],
		[1, 5, -1],
		[0, 7, 1],
		[4, 7, -1],
		[3, 7, -1],
		// [0, 1, -1], // simple fold yes, not foldGraph
		// [2, 3, 1], // simple fold yes, not foldGraph
		// [4, 5, -1], // simple fold yes, not foldGraph
		// [6, 7, 1], // simple fold yes, not foldGraph
	]);

	// run the layer solver
	vertices_coordsFolded = ear.graph.makeVerticesCoordsFlatFolded(graph, [0]);
	graph.faceOrders = ear
		.layer({ ...graph, vertices_coords: vertices_coordsFolded })
		.faceOrders();

	expect(graph.faceOrders).toMatchObject([
		[0, 4, -1],
		[2, 6, -1],
		[1, 6, 1],
		[1, 2, 1],
		[3, 4, 1],
		[0, 3, 1],
		[2, 5, 1],
		[5, 6, -1],
		[1, 5, -1],
		[0, 7, 1],
		[4, 7, -1],
		[3, 7, -1],
		[0, 1, -1], // found
		[2, 3, 1], // found
		[4, 5, -1], // found
		[6, 7, 1], // found
		[1, 4, -1], // found
		[3, 6, 1], // found
		[0, 6, 1], // found
		[0, 2, 1], // found
		[2, 4, -1], // found
		[4, 6, 1], // found
		[1, 3, 1], // found
		[3, 5, -1], // found
		[0, 5, -1], // found
		[1, 7, 1], // found
		[2, 7, 1], // found
		[5, 7, 1], // found
	]);
});

test("foldGraph, faceOrders, square folding, valley, mountain", () => {
	const graph = ear.graph.square();
	ear.graph.foldGraph(graph, { vector: [3, 1], origin: [0.5, 0.5] }, ear.math.includeL, {
		assignment: "V",
	});
	graph.faceOrders = [[0, 1, 1]];
	expect(graph.faceOrders).toMatchObject([[0, 1, 1]]);
	ear.graph.foldGraph(graph, { vector: [-1, 5], origin: [0.5, 0.5] }, ear.math.includeL, {
		assignment: "M",
	});

	// splitFace (first): 0 becomes 2, 3
	// [0, 1, 1] becomes two rules: [2, 1, 1], [3, 1, 1].
	// remap: 0->X 1->0 2->1 3->2
	// rules become: [1, 0, 1] and [2, 0, 1]
	// splitFace (second): 0 becomes 3, 4
	// [1, 0, 1] becomes [1, 3, 1] and [1, 4, 1]
	// [2, 0, 1] becomes [2, 3, 1] and [2, 4, 1], the order should be:
	// [1, 3, 1], [2, 3, 1], [1, 4, 1], [2, 4, 1]
	// faces get remapped, 0->X, 1->0, 2->1, 3->2, 4->3
	// [0, 2, 1], [1, 2, 1], [0, 3, 1], [1, 3, 1]
	// finally, we deal with the faces which no longer overlap
	// 0, 2 no longer overlap, 1, 3 no longer overlap
	// split line separated by a "mountain"
	// windings: 0 true, 1 true, 2 false, 3 false
	// 0-2 face 2 is second one, false on mountain results in 1
	// 1-3 face 3 is second one, false on mountain, results in 1. becomes:
	// [0, 2, 1], [1, 2, 1], [0, 3, 1], [1, 3, 1]
	// two new orders:
	// - 0-1 (true winding) mountain -1.
	// - 2-3 (false winding) mountain 1.

	expect(graph.faceOrders).toMatchObject([
		[1, 2, 1],
		[0, 3, 1],
		// [0, 1, -1], // simple fold yes, not foldGraph
		// [2, 3, 1], // simple fold yes, not foldGraph
	]);

	// run the layer solver
	const vertices_coordsFolded = ear.graph.makeVerticesCoordsFlatFolded(graph, [0]);
	graph.faceOrders = ear
		.layer({ ...graph, vertices_coords: vertices_coordsFolded })
		.faceOrders();

	expect(graph.faceOrders).toMatchObject([
		[1, 2, 1],
		[0, 3, 1],
		[0, 1, -1], // found
		[2, 3, 1], // found
		[0, 2, 1], // found
		[1, 3, 1], // found
	]);
});

test("foldGraph, faceOrders, square folding", () => {
	const graph = ear.graph.square();

	const sequence = {
		...structuredClone(graph),
		file_frames: [],
	};

	// fold step
	ear.graph.foldGraph(graph, { vector: [3, 1], origin: [0.5, 0.5] }, ear.math.includeL, {
		assignment: "V",
	});
	sequence.file_frames.push(structuredClone(graph));
	sequence.file_frames.push({
		...structuredClone(graph),
		vertices_coords: ear.graph.makeVerticesCoordsFlatFolded(graph),
		frame_classes: ["foldedForm"],
	});

	expect(graph.faceOrders).toBeUndefined(); // simple fold yes, not foldGraph

	// fold step
	ear.graph.foldGraph(graph, { vector: [-1, 5], origin: [0.5, 0.5] }, ear.math.includeL, {
		assignment: "V",
	});
	sequence.file_frames.push(structuredClone(graph));
	sequence.file_frames.push({
		...structuredClone(graph),
		vertices_coords: ear.graph.makeVerticesCoordsFlatFolded(graph),
		frame_classes: ["foldedForm"],
	});

	// splitFace (first): 0 becomes 2, 3
	// [0, 1, 1] becomes two rules: [2, 1, 1], [3, 1, 1].
	// remap: 0->X 1->0 2->1 3->2
	// rules become: [1, 0, 1] and [2, 0, 1]
	// splitFace (second): 0 becomes 3, 4
	// [1, 0, 1] becomes [1, 3, 1] and [1, 4, 1]
	// [2, 0, 1] becomes [2, 3, 1] and [2, 4, 1], the order should be:
	// [1, 3, 1], [2, 3, 1], [1, 4, 1], [2, 4, 1]
	// faces get remapped, 0->X, 1->0, 2->1, 3->2, 4->3
	// [0, 2, 1], [1, 2, 1], [0, 3, 1], [1, 3, 1]
	// expect(graph.faceOrders).toMatchObject([
	// 	[0, 2, 1], [1, 2, 1], [0, 3, 1], [1, 3, 1], [0, 1, 1], [2, 3, -1],
	// ]);

	// fold step
	ear.graph.foldGraph(
		graph,
		{ vector: [4, -1], origin: [0.25, 0.25] },
		ear.math.includeL,
		{ assignment: "V" },
	);
	sequence.file_frames.push(structuredClone(graph));
	sequence.file_frames.push({
		...structuredClone(graph),
		vertices_coords: ear.graph.makeVerticesCoordsFlatFolded(graph),
		frame_classes: ["foldedForm"],
	});

	// fold step
	ear.graph.foldGraph(
		graph,
		{ vector: [1, 4], origin: [0.25, 0.25] },
		ear.math.includeL,
		{ assignment: "V" },
	);
	sequence.file_frames.push(structuredClone(graph));
	sequence.file_frames.push({
		...structuredClone(graph),
		vertices_coords: ear.graph.makeVerticesCoordsFlatFolded(graph),
		frame_classes: ["foldedForm"],
	});

	// fold step
	ear.graph.foldGraph(
		graph,
		{ vector: [1, 0], origin: [0.125, 0.125] },
		ear.math.includeL,
		{ assignment: "V" },
	);
	sequence.file_frames.push(structuredClone(graph));
	sequence.file_frames.push({
		...structuredClone(graph),
		vertices_coords: ear.graph.makeVerticesCoordsFlatFolded(graph),
		frame_classes: ["foldedForm"],
	});

	// fold step
	ear.graph.foldGraph(
		graph,
		{ vector: [0, 1], origin: [0.125, 0.125] },
		ear.math.includeL,
		{ assignment: "V" },
	);
	sequence.file_frames.push(structuredClone(graph));
	sequence.file_frames.push({
		...structuredClone(graph),
		vertices_coords: ear.graph.makeVerticesCoordsFlatFolded(graph),
		frame_classes: ["foldedForm"],
	});

	// fold step
	ear.graph.foldGraph(
		graph,
		{ vector: [1, 1], origin: [0.05, 0.05] },
		ear.math.includeL,
		{ assignment: "V" },
	);
	sequence.file_frames.push(structuredClone(graph));
	sequence.file_frames.push({
		...structuredClone(graph),
		vertices_coords: ear.graph.makeVerticesCoordsFlatFolded(graph),
		frame_classes: ["foldedForm"],
	});

	// fold step
	ear.graph.foldGraph(
		graph,
		{ vector: [-1, 1], origin: [0.05, 0.05] },
		ear.math.includeL,
		{ assignment: "V" },
	);
	sequence.file_frames.push(structuredClone(graph));
	sequence.file_frames.push({
		...structuredClone(graph),
		vertices_coords: ear.graph.makeVerticesCoordsFlatFolded(graph),
		frame_classes: ["foldedForm"],
	});

	fs.writeFileSync(
		"./tests/tmp/foldGraph-fold-sequence.fold",
		JSON.stringify(sequence),
		"utf8",
	);
});
