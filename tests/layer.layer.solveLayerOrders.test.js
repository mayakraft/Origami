import { expect, test } from "vitest";
import fs from "fs";
import ear from "../src/index.js";

test("layer strip weave", () => {
	const foldfile = fs.readFileSync("./tests/files/fold/strip-weave.fold", "utf-8");
	const fold = JSON.parse(foldfile);
	const folded = ear.graph.getFramesByClassName(fold, "foldedForm")[0];
	const { orders, branches } = ear.layer.solveLayerOrders(folded);

	// these are all adjacent faces
	// the first call to propagate() resulted in nothing
	expect(orders).toMatchObject({
		"0 1": 2,
		"4 5": 1,
		"1 2": 1,
		"2 3": 2,
		"5 6": 2,
	});

	// three branches, only one pair in each
	expect(branches).toMatchObject([
		[{ orders: { "1 4": 1 } }, { orders: { "1 4": 2 } }],
		[{ orders: { "2 5": 1 } }, { orders: { "2 5": 2 } }],
		[{ orders: { "3 6": 1 } }, { orders: { "3 6": 2 } }],
	]);
});

test("layer panels 4x2", () => {
	const foldfile = fs.readFileSync("./tests/files/fold/panels-4x2.fold", "utf-8");
	const fold = JSON.parse(foldfile);
	const folded = ear.graph.getFramesByClassName(fold, "foldedForm")[0];
	const { orders, branches } = ear.layer.solveLayerOrders(folded);

	expect(orders).toMatchObject({
		"0 1": 2,
		"4 5": 2,
		"1 2": 1,
		"5 6": 1,
		"2 3": 1,
		"6 7": 1,
		"1 3": 1,
		"5 7": 1,
	});

	// only one branch
	// the one branch has two solutions
	expect(branches).toMatchObject([
		[
			{ orders: { "0 3": 1, "4 6": 1, "4 7": 1, "0 2": 1 } },
			{ orders: { "0 3": 2, "4 6": 2, "4 7": 2, "0 2": 2 } },
		],
	]);
});

test("layer panels 3x3", () => {
	const foldfile = fs.readFileSync("./tests/files/fold/panels-3x3.fold", "utf-8");
	const fold = JSON.parse(foldfile);
	const folded = ear.graph.getFramesByClassName(fold, "foldedForm")[0];

	const expectedJSON = fs.readFileSync(
		"./tests/files/json/panels-3x3-layer-solver.json",
		"utf-8",
	);
	const expected = JSON.parse(expectedJSON);
	delete expected.faces_winding;

	const { faces_winding, ...solution } = ear.layer.solveLayerOrders(folded);

	expect(solution).toMatchObject(expected);
});

test("layer panels 3x3 no solution", () => {
	const foldfile = fs.readFileSync("./tests/files/fold/panels-3x3-invalid.fold", "utf-8");
	const fold = JSON.parse(foldfile);
	const folded = ear.graph.getFramesByClassName(fold, "foldedForm")[0];

	try {
		ear.layer.solveLayerOrders(folded);
	} catch (error) {
		expect(error).not.toBe(undefined);
	}
});

test("layer panels 5", () => {
	const foldfile = fs.readFileSync("./tests/files/fold/panels-5.fold", "utf-8");
	const fold = JSON.parse(foldfile);
	const folded = ear.graph.getFramesByClassName(fold, "foldedForm")[0];
	const { orders, branches } = ear.layer.solveLayerOrders(folded);

	expect(orders).toMatchObject({
		"3 4": 1,
		"2 3": 1,
		"1 2": 1,
		"0 1": 2,
		"1 4": 1,
		"1 3": 1,
		"2 4": 1,
	});

	// two top-level possibilities
	// - one complete solution
	// - another with branches
	expect(branches).toMatchObject([
		[
			{ orders: { "0 3": 1, "0 4": 1, "0 2": 1 } },
			{
				orders: { "0 3": 2, "0 2": 2 },
				branches: [[{ orders: { "0 4": 1 } }, { orders: { "0 4": 2 } }]],
			},
		],
	]);
});

test("layer windmill faces with a cycle", () => {
	const foldfile = fs.readFileSync("./tests/files/fold/windmill.fold", "utf-8");
	const fold = JSON.parse(foldfile);
	const folded = ear.graph.getFramesByClassName(fold, "foldedForm")[0];
	const { orders, branches } = ear.layer.solveLayerOrders(folded);

	expect(orders).toMatchObject({
		"0 1": 1,
		"7 8": 1,
		"4 6": 1,
		"0 6": 1,
		"5 7": 1,
		"0 2": 2,
		"1 4": 1,
		"4 5": 1,
		"2 3": 2,
		"3 6": 1,
		"6 7": 2,
		"3 8": 2,
		"0 4": 1,
		"3 7": 2,
		"1 6": 1,
		"4 7": 1,
		"2 6": 1,
		"0 3": 2,
		"5 6": 1,
		"6 8": 2,
	});

	expect(branches).toBe(undefined);
});

test("layer panels zig-zag", () => {
	const foldfile = fs.readFileSync("./tests/files/fold/panels-zig-zag.fold", "utf-8");
	const fold = JSON.parse(foldfile);
	const folded = ear.graph.getFramesByClassName(fold, "foldedForm")[0];
	const { orders, branches } = ear.layer.solveLayerOrders(folded);

	expect(orders).toMatchObject({
		"0 4": 2,
		"3 4": 1,
		"2 3": 1,
		"1 2": 1,
		"2 4": 1,
		"1 4": 1,
		"0 1": 2,
		"0 3": 2,
		"1 3": 1,
		"0 2": 2,
	});
	expect(branches).toBe(undefined);
});

test("layer four flaps", () => {
	const foldfile = fs.readFileSync("./tests/files/fold/layer-4-flaps.fold", "utf-8");
	const fold = JSON.parse(foldfile);
	const folded = ear.graph.getFramesByClassName(fold, "foldedForm")[0];
	const { orders, branches } = ear.layer.solveLayerOrders(folded);

	expect(orders).toMatchObject({
		"0 1": 2,
		"1 2": 1,
		"1 3": 1,
		"1 4": 1,
	});

	// four branches, each branch has 2 solutions
	expect(branches.length).toBe(4);
	expect(branches).toMatchObject([
		[{ orders: { "0 4": 1 } }, { orders: { "0 4": 2 } }],
		[{ orders: { "0 3": 1 } }, { orders: { "0 3": 2 } }],
		[{ orders: { "2 3": 1 } }, { orders: { "2 3": 2 } }],
		[{ orders: { "2 4": 1 } }, { orders: { "2 4": 2 } }],
	]);
});

test("layer Kabuto", () => {
	const foldfile = fs.readFileSync("./tests/files/fold/kabuto.fold", "utf-8");
	const fold = JSON.parse(foldfile);
	const folded = ear.graph.getFramesByClassName(fold, "foldedForm")[0];

	// remove existing solution from FOLD file
	delete folded.faceOrders;

	const solution = ear.layer.solveLayerOrders(folded);

	const expectedJSON = fs.readFileSync(
		"./tests/files/json/kabuto-layer-solver.json",
		"utf-8",
	);
	const expected = JSON.parse(expectedJSON);
	delete expected.faces_winding;

	expect(solution).toMatchObject(expected);
});

test("layer Randlett flapping bird", () => {
	const foldfile = fs.readFileSync(
		"./tests/files/fold/randlett-flapping-bird.fold",
		"utf-8",
	);
	const fold = JSON.parse(foldfile);
	const folded = ear.graph.getFramesByClassName(fold, "foldedForm")[0];
	const solution = ear.layer.solveLayerOrders(folded);

	const expectedJSON = fs.readFileSync(
		"./tests/files/json/randlett-flapping-bird-layer-solver.json",
		"utf-8",
	);
	const expected = JSON.parse(expectedJSON);
	delete expected.faces_winding;

	expect(solution).toMatchObject(expected);
});

test("layer crane", () => {
	const foldfile = fs.readFileSync("./tests/files/fold/crane.fold", "utf-8");
	const fold = JSON.parse(foldfile);
	const folded = ear.graph.getFramesByClassName(fold, "foldedForm")[0];

	// remove existing solution from FOLD file
	delete folded.faceOrders;

	const solution = ear.layer.solveLayerOrders(folded);

	const expectedJSON = fs.readFileSync(
		"./tests/files/json/crane-layer-solver.json",
		"utf-8",
	);
	const expected = JSON.parse(expectedJSON);
	expect(solution).toMatchObject(expected);
});

// test("layer bird", () => {
// 	const foldfile = fs.readFileSync("./tests/files/fold/kraft-bird-base.fold", "utf-8");
// 	const fold = JSON.parse(foldfile);
// 	const folded = {
// 		...fold,
// 		vertices_coords: ear.graph.makeVerticesCoordsFlatFolded(fold),
// 	}
// 	const solution = ear.layer.solveLayerOrders(folded);

// 	// const expectedJSON = fs.readFileSync(
// 	// 	"./tests/files/json/crane-layer-solver.json",
// 	// 	"utf-8",
// 	// );
// 	// const expected = JSON.parse(expectedJSON);
// 	// expect(solution).toMatchObject(expected);
// });
