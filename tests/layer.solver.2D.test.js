import fs from "fs";
import { expect, test } from "vitest";
import ear from "../src/index.js";

// mostly 2D.
// there is some overlap between 2D and 3D, for comparison sake.

test("2D layer solver, Randlett flapping bird", () => {
	const foldfile = fs.readFileSync("./tests/files/fold/randlett-flapping-bird.fold", "utf-8");
	const fold = JSON.parse(foldfile);
	const folded = ear.graph.getFramesByClassName(fold, "foldedForm")[0];
	const {
		orders,
		branches,
	} = ear.layer(folded);
	expect(orders).toMatchObject(folded.faceOrders);
	expect(branches).toBe(undefined);
});

test("2D layer solver, preliminary fold", () => {
	const FOLD = fs.readFileSync("./tests/files/fold/preliminary-offset-cp.fold", "utf-8");
	const graph = JSON.parse(FOLD);
	const vertices_coords = ear.graph.makeVerticesCoordsFlatFolded(graph);
	const folded = { ...graph, vertices_coords };
	const solution = ear.layer(folded);
	const faceOrders = solution.faceOrders();
	// going bottom up, two paths on either side
	// 0 to 2 to 4 to 5
	// 0 to 1 to 3 to 5
	const faceOrdersStrings = faceOrders.map(order => JSON.stringify(order));
	// 0 and 5, both facing each other
	expect(faceOrdersStrings.includes(JSON.stringify([0, 5, 1]))
		|| faceOrdersStrings.includes(JSON.stringify([5, 0, 1]))).toBe(true);
	// 0 and 1, both facing each other
	expect(faceOrdersStrings.includes(JSON.stringify([0, 1, 1]))
		|| faceOrdersStrings.includes(JSON.stringify([1, 0, 1]))).toBe(true);
	// 0 and 3, both facing same direction, 3 on top
	expect(faceOrdersStrings.includes(JSON.stringify([0, 3, -1]))
		|| faceOrdersStrings.includes(JSON.stringify([3, 0, 1]))).toBe(true);
	// 1 and 3, both facing away from each other
	expect(faceOrdersStrings.includes(JSON.stringify([1, 3, -1]))
		|| faceOrdersStrings.includes(JSON.stringify([3, 1, -1]))).toBe(true);
	// 1 and 5, both facing same direction, 1 on top
	expect(faceOrdersStrings.includes(JSON.stringify([1, 5, 1]))
		|| faceOrdersStrings.includes(JSON.stringify([5, 1, -1]))).toBe(true);
	// 3 and 5, both facing each other
	expect(faceOrdersStrings.includes(JSON.stringify([3, 5, 1]))
		|| faceOrdersStrings.includes(JSON.stringify([5, 3, 1]))).toBe(true);
	// 0 and 2, both facing each other
	expect(faceOrdersStrings.includes(JSON.stringify([0, 2, 1]))
		|| faceOrdersStrings.includes(JSON.stringify([2, 0, 1]))).toBe(true);
	// 0 and 4, both facing same direction, 3 on top
	expect(faceOrdersStrings.includes(JSON.stringify([0, 4, -1]))
		|| faceOrdersStrings.includes(JSON.stringify([4, 0, 1]))).toBe(true);
	// 2 and 4, both facing away from each other
	expect(faceOrdersStrings.includes(JSON.stringify([2, 4, -1]))
		|| faceOrdersStrings.includes(JSON.stringify([4, 2, -1]))).toBe(true);
	// 2 and 5, both facing same direction, 1 on top
	expect(faceOrdersStrings.includes(JSON.stringify([2, 5, 1]))
		|| faceOrdersStrings.includes(JSON.stringify([5, 2, -1]))).toBe(true);
	// 4 and 5, both facing each other
	expect(faceOrdersStrings.includes(JSON.stringify([4, 5, 1]))
		|| faceOrdersStrings.includes(JSON.stringify([5, 4, 1]))).toBe(true);
});

test("3D layer solver, preliminary fold", () => {
	const FOLD = fs.readFileSync("./tests/files/fold/preliminary-offset-cp.fold", "utf-8");
	const graph = JSON.parse(FOLD);
	const vertices_coords = ear.graph.makeVerticesCoordsFlatFolded(graph);
	const folded = { ...graph, vertices_coords };
	const solution = ear.layer.layer3D(folded);
	const faceOrders = solution.faceOrders();
	// going bottom up, two paths on either side
	// 0 to 2 to 4 to 5
	// 0 to 1 to 3 to 5
	const faceOrdersStrings = faceOrders.map(order => JSON.stringify(order));
	// 0 and 5, both facing each other
	expect(faceOrdersStrings.includes(JSON.stringify([0, 5, 1]))
		|| faceOrdersStrings.includes(JSON.stringify([5, 0, 1]))).toBe(true);
	// 0 and 1, both facing each other
	expect(faceOrdersStrings.includes(JSON.stringify([0, 1, 1]))
		|| faceOrdersStrings.includes(JSON.stringify([1, 0, 1]))).toBe(true);
	// 0 and 3, both facing same direction, 3 on top
	expect(faceOrdersStrings.includes(JSON.stringify([0, 3, -1]))
		|| faceOrdersStrings.includes(JSON.stringify([3, 0, 1]))).toBe(true);
	// 1 and 3, both facing away from each other
	expect(faceOrdersStrings.includes(JSON.stringify([1, 3, -1]))
		|| faceOrdersStrings.includes(JSON.stringify([3, 1, -1]))).toBe(true);
	// 1 and 5, both facing same direction, 1 on top
	expect(faceOrdersStrings.includes(JSON.stringify([1, 5, 1]))
		|| faceOrdersStrings.includes(JSON.stringify([5, 1, -1]))).toBe(true);
	// 3 and 5, both facing each other
	expect(faceOrdersStrings.includes(JSON.stringify([3, 5, 1]))
		|| faceOrdersStrings.includes(JSON.stringify([5, 3, 1]))).toBe(true);
	// 0 and 2, both facing each other
	expect(faceOrdersStrings.includes(JSON.stringify([0, 2, 1]))
		|| faceOrdersStrings.includes(JSON.stringify([2, 0, 1]))).toBe(true);
	// 0 and 4, both facing same direction, 3 on top
	expect(faceOrdersStrings.includes(JSON.stringify([0, 4, -1]))
		|| faceOrdersStrings.includes(JSON.stringify([4, 0, 1]))).toBe(true);
	// 2 and 4, both facing away from each other
	expect(faceOrdersStrings.includes(JSON.stringify([2, 4, -1]))
		|| faceOrdersStrings.includes(JSON.stringify([4, 2, -1]))).toBe(true);
	// 2 and 5, both facing same direction, 1 on top
	expect(faceOrdersStrings.includes(JSON.stringify([2, 5, 1]))
		|| faceOrdersStrings.includes(JSON.stringify([5, 2, -1]))).toBe(true);
	// 4 and 5, both facing each other
	expect(faceOrdersStrings.includes(JSON.stringify([4, 5, 1]))
		|| faceOrdersStrings.includes(JSON.stringify([5, 4, 1]))).toBe(true);
});

test("2D layer solver, preliminary fold, layers linearized", () => {
	const FOLD = fs.readFileSync("./tests/files/fold/preliminary-offset-cp.fold", "utf-8");
	const graph = JSON.parse(FOLD);
	const vertices_coords = ear.graph.makeVerticesCoordsFlatFolded(graph);
	const folded = { ...graph, vertices_coords };
	const solution = ear.layer(folded);
	const faceOrders = solution.faceOrders();
	// going bottom up, two paths on either side
	// 0 to 2 to 4 to 5
	// 0 to 1 to 3 to 5
	// this just happens to generate 0, 1, 2, 3, 4, 5
	// but a few others would still be valid.
	const linearize = ear.graph.linearize2DFaces({ ...folded, faceOrders });
	expect(linearize).toMatchObject([0, 1, 2, 3, 4, 5]);
});

test("2D layer solver, kabuto", () => {
	const foldfile = fs.readFileSync("./tests/files/fold/kabuto.fold", "utf-8");
	const fold = JSON.parse(foldfile);
	const folded = ear.graph.getFramesByClassName(fold, "foldedForm")[0];

	// remove existing solution from FOLD file
	delete folded.faceOrders;

	const solution = ear.layer(folded);
	expect(solution.structure()).toMatchObject([
		[[[[], []]], []],
		[[[[], []]], []],
	]);
	const layerSolutions = solution.compileAll();
	expect(layerSolutions).toHaveLength(9);
	layerSolutions.forEach(orders => expect(orders).toHaveLength(117));
});

test("2D layer solver, kraft-bird", () => {
	const foldfile = fs.readFileSync("./tests/files/fold/kraft-bird-base.fold", "utf-8");
	const fold = JSON.parse(foldfile);
	const folded = {
		...fold,
		vertices_coords: ear.graph.makeVerticesCoordsFlatFolded(fold),
	};

	const faceOrders = ear.layer(folded).faceOrders();
	expect(faceOrders).toHaveLength(5848);

	fs.writeFileSync(`./tests/tmp/kraft-bird-base-solved.fold`, JSON.stringify({
		...folded,
		faceOrders,
	}));
});

// // takes about 2 seconds
// test("2D layer solver, zipper", () => {
// 	const foldfile = fs.readFileSync("./tests/files/fold/layers-zipper.fold", "utf-8");
// 	const fold = JSON.parse(foldfile);
// 	const folded = {
// 		...fold,
// 		vertices_coords: ear.graph.makeVerticesCoordsFlatFolded(fold),
// 	}
// 	const result = ear.layer(folded);
// 	fs.writeFileSync(
// 		`./tests/tmp/layers-zipper-solution.fold`,
// 		JSON.stringify(result),
// 	);
// 	const {
// 		faces_winding,
// 		...resultFlat
// 	} = ear.layer.solveLayerOrdersSingleBranches(folded);
// 	fs.writeFileSync(
// 		`./tests/tmp/layers-zipper-solution-flat.fold`,
// 		JSON.stringify(resultFlat),
// 	);
// });
