import fs from "fs";
import { expect, test } from "vitest";
import ear from "../src/index.js";

test("disjointGraphsIndices", () => {
	const foldFile = fs.readFileSync(
		"./tests/files/fold/disjoint-triangles-3d.fold",
		"utf-8",
	);
	const graph = JSON.parse(foldFile);
	const indices = ear.graph.disjointGraphsIndices(graph);
	expect(indices.length).toBe(5);
});

test("disjointGraphs", () => {
	const foldFile = fs.readFileSync(
		"./tests/files/fold/disjoint-triangles-3d.fold",
		"utf-8",
	);
	const graph = JSON.parse(foldFile);
	const indices = ear.graph.disjointGraphs(graph);
	expect(indices.length).toBe(5);
});

test("disjointGraphsIndices, connected graph", () => {
	const foldFile = fs.readFileSync("./tests/files/fold/crane-cp.fold", "utf-8");
	const graph = JSON.parse(foldFile);
	const indices = ear.graph.disjointGraphsIndices(graph);
	expect(indices.length).toBe(1);
});
