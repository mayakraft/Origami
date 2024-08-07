import fs from "fs";
import { expect, test } from "vitest";
import ear from "../src/index.js";

test("prepareForRendering, flapping-bird", () => {
	const FOLD = fs.readFileSync("./tests/files/fold/randlett-flapping-bird.fold", "utf-8");
	const fold = JSON.parse(FOLD);
	const folded = ear.graph.getFramesByClassName(fold, "foldedForm")[0];
	const backup = structuredClone(fold);
	const result = ear.graph.prepareForRendering(folded);
	expect(fold).toMatchObject(backup);

	expect(result.edges_assignment).toMatchObject([
		"B",
		"V",
		"J",
		"J",
		"V",
		"M",
		"M",
		"V",
		"J",
		"J",
		"V",
		"B",
		"B",
		"F",
		"V",
		"B",
		"V",
		"F",
		"B",
		"F",
		"J",
		"J",
		"V",
		"M",
		"M",
		"M",
		"V",
		"B",
		"F",
		"V",
		"V",
		"M",
		"M",
		"M",
		"V",
		"J",
		"J",
		"F",
		"B",
		"B",
		"V",
		"F",
		"F",
		"V",
		"M",
		"M",
		"V",
		"F",
		"F",
		"V",
		"M",
		"M",
		"M",
		"V",
		"V",
		"M",
		"M",
		"M",
		"V",
		"F",
		"V",
		"M",
		"J",
		"J",
		"V",
		"V",
		"V",
		"V",
		"J",
		"J",
		"M",
		"V",
		"M",
		"V",
		"M",
		"M",
		"V",
		"M",
		"B",
		"V",
		"V",
		"V",
		"V",
		"B",
		"F",
		"B",
		"M",
		"M",
		"B",
		"J",
		"J",
		"V",
		"V",
		"V",
		"V",
		"J",
		"J",
		"B",
		"M",
		"M",
		"B",
		"F",
	]);
	expect(result.vertices_coords).toHaveLength(102);
	expect(result.edges_vertices).toHaveLength(102);
	expect(result.faces_vertices).toHaveLength(34);
});

test("prepareForRendering, windmill", () => {
	const FOLD = fs.readFileSync("./tests/files/fold/windmill.fold", "utf-8");
	const fold = JSON.parse(FOLD);
	const folded = ear.graph.getFramesByClassName(fold, "foldedForm")[0];
	const backup = structuredClone(fold);
	const result = ear.graph.prepareForRendering(folded);
	expect(fold).toMatchObject(backup);

	expect(result.edges_assignment).toMatchObject([
		"V",
		"B",
		"J",
		"J",
		"B",
		"J",
		"J",
		"B",
		"V",
		"V",
		"B",
		"J",
		"J",
		"B",
		"J",
		"J",
		"B",
		"V",
		"J",
		"B",
		"J",
		"J",
		"B",
		"V",
		"V",
		"B",
		"J",
		"V",
		"B",
		"J",
		"J",
		"B",
		"J",
		"J",
		"B",
		"V",
		"B",
		"V",
		"V",
		"J",
		"V",
		"J",
		"J",
		"J",
		"V",
		"B",
		"V",
		"V",
		"J",
		"V",
		"J",
		"J",
		"J",
		"V",
		"J",
		"V",
		"J",
		"J",
		"J",
		"V",
		"B",
		"V",
		"V",
		"B",
		"V",
		"V",
		"J",
		"V",
		"J",
		"J",
		"J",
		"V",
	]);
	expect(result.vertices_coords).toHaveLength(72);
	expect(result.edges_vertices).toHaveLength(72);
	expect(result.faces_vertices).toHaveLength(24);
});

test("prepareForRendering, square-twist", () => {
	const FOLD = fs.readFileSync("./tests/files/fold/square-twist.fold", "utf-8");
	const fold = JSON.parse(FOLD);
	const folded = ear.graph.getFramesByClassName(fold, "foldedForm")[0];
	const backup = structuredClone(fold);
	const result = ear.graph.prepareForRendering(folded);
	expect(fold).toMatchObject(backup);

	expect(result.edges_assignment).toMatchObject([
		"J",
		"B",
		"J",
		"J",
		"M",
		"M",
		"M",
		"J",
		"J",
		"J",
		"J",
		"M",
		"M",
		"J",
		"J",
		"J",
		"B",
		"M",
		"M",
		"B",
		"J",
		"J",
		"B",
		"J",
		"J",
		"J",
		"M",
		"M",
		"J",
		"J",
		"J",
		"B",
		"M",
		"M",
		"B",
		"J",
		"J",
		"B",
		"J",
		"J",
		"J",
		"M",
		"M",
		"J",
		"J",
		"J",
		"B",
		"M",
		"M",
		"B",
		"J",
		"J",
		"B",
		"J",
		"M",
		"B",
		"J",
		"J",
		"B",
		"J",
		"V",
		"B",
		"J",
		"J",
		"J",
		"J",
		"J",
		"V",
		"V",
		"V",
		"V",
		"J",
		"J",
		"V",
		"J",
		"J",
		"B",
		"J",
		"J",
		"B",
		"J",
		"J",
		"B",
		"V",
		"V",
		"V",
		"J",
		"J",
		"V",
		"J",
		"J",
		"B",
		"J",
		"J",
		"B",
		"J",
		"J",
		"B",
		"V",
		"V",
		"V",
		"J",
		"J",
		"V",
		"J",
		"J",
		"B",
		"J",
		"J",
		"B",
		"J",
		"J",
		"B",
		"V",
		"J",
		"B",
		"J",
		"J",
		"B",
		"V",
	]);
	expect(result.vertices_coords).toHaveLength(120);
	expect(result.edges_vertices).toHaveLength(120);
	expect(result.faces_vertices).toHaveLength(40);
});

test("prepareForRendering, no-faces-3d", () => {
	const FOLD = fs.readFileSync("./tests/files/fold/no-faces.fold", "utf-8");
	const fold = JSON.parse(FOLD);
	const backup = structuredClone(fold);
	const result = ear.graph.prepareForRendering(fold);
	expect(fold).toMatchObject(backup);
	// expect(result).toMatchObject(fold);
	// console.log(result);

	// expect(result.edges_assignment).toMatchObject([])
	// expect(result.vertices_coords).toHaveLength(120);
	// expect(result.edges_vertices).toHaveLength(120);
	// expect(result.faces_vertices).toHaveLength(40);
});

test("prepareForRendering, cycles-3d", () => {
	const FOLD = fs.readFileSync("./tests/files/fold/cycles-3d.fold", "utf-8");
	const fold = JSON.parse(FOLD);
	const backup = structuredClone(fold);
	const result = ear.graph.prepareForRendering(fold);
	expect(fold).toMatchObject(backup);
	fs.writeFileSync(
		"./tests/tmp/prepareForRendering-cycles-3d.fold",
		JSON.stringify(result),
	);
});
