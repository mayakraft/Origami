import fs from "fs";
import { expect, test } from "vitest";
import ear from "../src/index.js";

test("3D layer solver, all 3D special cases", () => {
	const foldfile = fs.readFileSync(
		"./tests/files/fold/layers-3d-edge-edge.fold",
		"utf-8",
	);
	const fold = JSON.parse(foldfile);
	const frames = ear.graph.getFileFramesAsArray(fold);
	const foldedForms = frames.map((frame) => ({
		...frame,
		vertices_coords: ear.graph.makeVerticesCoordsFolded(frame),
	}));
	foldedForms.forEach((folded) => ear.graph.populate(folded));

	// the final
	const results = foldedForms.map((graph) => {
		try {
			return ear.layer.layer3D(graph);
		} catch (error) {
			return "error";
		}
	});

	expect(results).toMatchObject([
		// 0 and 4 face each other's normals
		{ orders: [[0, 4, 1]] },
		// both pairs of faces face each other's normals
		{
			orders: [
				[1, 4, 1],
				[2, 3, 1],
			],
		},
		// same as above
		{
			orders: [
				[1, 4, 1],
				[2, 3, 1],
			],
		},
		// all 3 pairs face into each other's normals
		{
			orders: [
				[2, 3, 1],
				[1, 4, 1],
				[0, 5, 1],
			],
		},
		// 0-1 normals point away from each other
		// 2-3 normals point towards each other
		// 1-4 normals point towards each other
		// 0-4 0 is above 4's normal
		{
			orders: [
				[0, 1, -1],
				[2, 3, 1],
				[1, 4, 1],
				[0, 4, 1],
			],
		},
		// todo
		{
			orders: [
				[1, 9, -1],
				[3, 7, -1],
				[2, 8, -1],
			],
		},
		// todo
		{
			orders: [
				[1, 10, -1],
				[4, 5, 1],
				[5, 6, -1],
				[6, 7, -1],
				[4, 6, -1],
				[5, 7, -1],
				[2, 9, -1],
				[4, 7, -1],
				[3, 8, -1],
			],
		},
		"error",
		{ orders: [] }, // this is a layer-crossing error. undetected for now
		"error",
		"error",
	]);
});

test("3D layer solver, cube octagon", () => {
	const foldfile = fs.readFileSync("./tests/files/fold/cube-octagon.fold", "utf-8");
	const fold = JSON.parse(foldfile);
	const folded0 = ear.graph.getFramesByClassName(fold, "foldedForm")[0];
	const folded1 = ear.graph.getFramesByClassName(fold, "foldedForm")[1];
	const result0 = ear.layer.layer3D(folded0);
	const result1 = ear.layer.layer3D(folded1);
	expect(result0.orders).toMatchObject(folded0.faceOrders);
	expect(result1.orders).toMatchObject(folded1.faceOrders);
	expect(result0.branches).toBe(undefined);
	expect(result1.branches).toBe(undefined);
});

test("3D layer solver, square-fish base", () => {
	const FOLD = fs.readFileSync("./tests/files/fold/square-fish-3d.fold", "utf-8");
	const graph = JSON.parse(FOLD);
	const vertices_coords = ear.graph.makeVerticesCoordsFolded(graph);
	const folded = { ...graph, vertices_coords };
	const solution = ear.layer.layer3D(folded);
	const faceOrders = solution.faceOrders();
	const faceOrdersStrings = faceOrders.map((order) => JSON.stringify(order));

	expect(faceOrders.length).toBe(10);

	// 0 and 1, adjacent, facing each other
	expect(
		faceOrdersStrings.includes(JSON.stringify([0, 1, 1])) ||
			faceOrdersStrings.includes(JSON.stringify([1, 0, 1])),
	).toBe(true);
	// 2 and 3, adjacent, facing each other
	expect(
		faceOrdersStrings.includes(JSON.stringify([2, 3, 1])) ||
			faceOrdersStrings.includes(JSON.stringify([3, 2, 1])),
	).toBe(true);
	// 4 and 5, adjacent, facing each other
	expect(
		faceOrdersStrings.includes(JSON.stringify([4, 5, 1])) ||
			faceOrdersStrings.includes(JSON.stringify([5, 4, 1])),
	).toBe(true);
	// 6 and 7, adjacent, facing each other
	expect(
		faceOrdersStrings.includes(JSON.stringify([6, 7, 1])) ||
			faceOrdersStrings.includes(JSON.stringify([7, 6, 1])),
	).toBe(true);
	// 10 and 11, adjacent, facing each other
	expect(
		faceOrdersStrings.includes(JSON.stringify([10, 11, 1])) ||
			faceOrdersStrings.includes(JSON.stringify([11, 10, 1])),
	).toBe(true);
	// 2 and 13, adjacent, facing each other
	expect(
		faceOrdersStrings.includes(JSON.stringify([2, 13, 1])) ||
			faceOrdersStrings.includes(JSON.stringify([13, 2, 1])),
	).toBe(true);
	// 8 and 13, adjacent, facing each other
	expect(
		faceOrdersStrings.includes(JSON.stringify([8, 13, 1])) ||
			faceOrdersStrings.includes(JSON.stringify([13, 8, 1])),
	).toBe(true);
	// 9 and 14, adjacent, facing each other
	expect(
		faceOrdersStrings.includes(JSON.stringify([9, 14, 1])) ||
			faceOrdersStrings.includes(JSON.stringify([14, 9, 1])),
	).toBe(true);
	// 1 and 14, adjacent, facing each other
	expect(
		faceOrdersStrings.includes(JSON.stringify([1, 14, 1])) ||
			faceOrdersStrings.includes(JSON.stringify([14, 1, 1])),
	).toBe(true);
	// 12 and 15, facing each other
	expect(
		faceOrdersStrings.includes(JSON.stringify([12, 15, 1])) ||
			faceOrdersStrings.includes(JSON.stringify([15, 12, 1])),
	).toBe(true);
});

test("3D layer solver, square-fish base, faces sets", () => {
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
	const nudge = ear.graph.nudgeFacesWithFaceOrders({ ...folded, faceOrders });

	// faces
	[0, 14, 1, 9].forEach((f) =>
		nudge[f].vector.forEach((n, i) => expect(n).toBeCloseTo([0, 0, 1][i])),
	);
	[2, 3, 8, 13].forEach((f) =>
		nudge[f].vector.forEach((n, i) => expect(n).toBeCloseTo([0, 0, -1][i])),
	);
	[4, 5].forEach((f) =>
		nudge[f].vector.forEach((n, i) =>
			expect(n).toBeCloseTo([0.9238795325112866, -0.38268343236509034, 0][i]),
		),
	);
	[6, 7].forEach((f) =>
		nudge[f].vector.forEach((n, i) =>
			expect(n).toBeCloseTo([0.9238795325112863, 0.3826834323650909, 0][i]),
		),
	);
	[10, 11].forEach((f) =>
		nudge[f].vector.forEach((n, i) => expect(n).toBeCloseTo([0, -1, 0][i])),
	);
	[12, 15].forEach((f) =>
		nudge[f].vector.forEach((n, i) => expect(n).toBeCloseTo([0, 1, 0][i])),
	);

	[0, 14, 1, 9].forEach((f, i) => expect(nudge[f].layer).toBe(i));
	[2, 3, 8, 13].forEach((f, i) => expect(nudge[f].layer).toBe(i));
	[4, 5].forEach((f, i) => expect(nudge[f].layer).toBe(i));
	[6, 7].forEach((f, i) => expect(nudge[f].layer).toBe(i));
	[10, 11].forEach((f, i) => expect(nudge[f].layer).toBe(i));
	[12, 15].forEach((f, i) => expect(nudge[f].layer).toBe(i));
});

test("3D layer solver, Mooser's train", () => {
	const FOLD = fs.readFileSync("./tests/files/fold/moosers-train.fold", "utf-8");
	const folded = JSON.parse(FOLD);
	const { orders, branches } = ear.layer.layer3D(folded);

	// something so confusing.
	// in the source code for "getEdgesLine", the line:
	// const edgesLine = edgesToLines3({ vertices_coords, edges_vertices });
	// switch it out for "edgesToLines" and 1633 becomes 1581.

	expect(JSON.stringify(folded.vertices_coords.map(ear.math.resize3))).toMatchObject(
		JSON.stringify(folded.vertices_coords),
	);

	expect(JSON.stringify(ear.graph.edgesToLines(folded))).toMatchObject(
		JSON.stringify(ear.graph.edgesToLines3(folded)),
	);

	// expect(Object.keys(orders).length).toBe(1713);
	expect(Object.keys(orders).length).toBe(1633);
	// expect(Object.keys(orders).length).toBe(1581);
	expect(ear.layer.getBranchStructure({ branches })).toMatchObject([
		[[], []],
		[[], []],
		[[], []],
		[[], []],
		[[], []],
		[[], []],
		[[], []],
		[[], []],
		[[], []],
		[[], []],
		[[], []],
		[[], []],
		// [[], []], [[], []],
		// [[], []], [[], []],
		// [[], []], [[], []],
	]);

	// expect(branches).toMatchObject([
	// 	[
	// 		{ orders: [[52, 115, 1], [52, 131, 1], [52, 128, -1], [52, 113, -1]]},
	// 		{ orders: [[52, 115, -1], [52, 131, -1], [52, 128, 1], [52, 113, 1]]},
	// 	], [
	// 		{ orders: [[108, 114, -1], [108, 136, -1], [108, 137, 1], [108, 116, 1]]},
	// 		{ orders: [[108, 114, 1], [108, 136, 1], [108, 137, -1], [108, 116, -1]]},
	// 	]
	// ]);
	folded.faceOrders = ear.layer.compile({ orders, branches });
	fs.writeFileSync(`./tests/tmp/moosers-train-layer-solved.fold`, JSON.stringify(folded));
});

test("3D layer solver, maze-u", () => {
	const FOLD = fs.readFileSync("./tests/files/fold/maze-u.fold", "utf-8");
	const graph = JSON.parse(FOLD);
	const foldedFrame = ear.graph.getFramesByClassName(graph, "foldedForm")[0];
	foldedFrame.faceOrders = ear.layer.layer3D(foldedFrame).faceOrders();
	fs.writeFileSync(`./tests/tmp/maze-u-layer-solved.fold`, JSON.stringify(foldedFrame));

	// every face has some order associated with it
	const facesFound = [];
	foldedFrame.faceOrders.forEach((order) => {
		facesFound[order[0]] = true;
		facesFound[order[1]] = true;
	});
	expect(facesFound.filter((a) => a !== undefined).length).toBe(
		foldedFrame.faces_vertices.length,
	);
});

test("3D layer solver, maze-s", () => {
	const FOLD = fs.readFileSync("./tests/files/fold/maze-s.fold", "utf-8");
	const graph = JSON.parse(FOLD);
	const foldedFrame = ear.graph.getFramesByClassName(graph, "foldedForm")[0];
	const solution = ear.layer.layer3D(foldedFrame);
	const solutionCounts = solution.count();
	foldedFrame.faceOrders = solution.faceOrders();
	foldedFrame.file_frames = solutionCounts.flatMap((count, i) =>
		Array.from(Array(count))
			.map((_, j) => {
				const solutionIndices = solutionCounts.map(() => 0);
				solutionIndices[i] = j;
				return solutionIndices;
			})
			.map((solutionIndices) => ({
				frame_parent: 0,
				frame_inherit: true,
				faceOrders: solution.faceOrders(...solutionIndices),
			})),
	);
	fs.writeFileSync(`./tests/tmp/maze-s-layer-solved.fold`, JSON.stringify(foldedFrame));
	expect(true).toBe(true);
});

// test("3D layer solver, 8x8 maze", () => {
// 	const FOLD = fs.readFileSync("./tests/files/fold/maze-8x8.fold", "utf-8");
// 	const graph = JSON.parse(FOLD);
// 	const foldedFrame = ear.graph.getFramesByClassName(graph, "foldedForm")[0];
// 	foldedFrame.faceOrders = ear.layer.layer3D(foldedFrame).faceOrders();
// 	fs.writeFileSync(`./tests/tmp/maze-8x8-layer-solved.fold`, JSON.stringify(foldedFrame));
// 	expect(true).toBe(true);
// });
