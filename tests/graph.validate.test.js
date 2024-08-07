import fs from "fs";
import { expect, test } from "vitest";
import ear from "../src/index.js";

test("validate, valid", () => {
	const graphsViolations = ["disjoint-triangles-3d.fold", "two-bird-cp.fold"]
		.map((filename) => `./tests/files/fold/${filename}`)
		.map((path) => fs.readFileSync(path, "utf-8"))
		.map((contents) => JSON.parse(contents))
		.map((graph) => ear.graph.validate(graph));

	graphsViolations.forEach((violations) => expect(violations.length).toBe(0));
});

test("validate, contains null at top level", () => {
	const graph = {
		vertices_vertices: [[2], undefined, [0]],
	};
	const violations = ear.graph.validate(graph);
	expect(violations.length).toBe(4);
});

test("validate, contains null inside arrays", () => {
	const graph = {
		vertices_coords: [
			[0, 1, 0],
			[1, 1, null],
			[1, 0, 0],
		],
		edges_vertices: [
			[0, 1],
			[1, 2],
			[2, 0],
			[undefined, 0],
		],
		vertices_faces: [[0, 1, 2]],
	};
	const violations = ear.graph.validate(graph);
	expect(violations.length).toBe(2);
});

test("validate, contains null inside arrays, but its okay", () => {
	const graph = {
		faces_faces: [
			[1, null],
			[undefined, 0],
		],
	};
	expect(ear.graph.validate(graph).length).toBe(0);
});

test("validate, winding order violations", () => {
	const graphsViolations = ["invalid-box-pleat-3d.fold", "kissing-squares.fold"]
		.map((filename) => `./tests/files/fold/${filename}`)
		.map((path) => fs.readFileSync(path, "utf-8"))
		.map((contents) => JSON.parse(contents))
		.map((graph) => ear.graph.validate(graph));

	const graphsNonWindingViolations = graphsViolations.map((violations) =>
		violations.filter((str) => str.substring(0, 8) !== "windings"),
	);

	graphsViolations.forEach((violations) => expect(violations.length).not.toBe(0));
	graphsNonWindingViolations.forEach((violations) => expect(violations.length).toBe(0));
});

test("validate, invalid array lengths", () => {
	const fold = fs.readFileSync(
		"./tests/files/fold/invalid-mismatch-length.fold",
		"utf-8",
	);
	const graph = JSON.parse(fold);
	const result = ear.graph.validate(graph);
	expect(result.length).toBe(2);
});

test("validate, invalid references", () => {
	const fold = fs.readFileSync(
		"./tests/files/fold/invalid-mismatch-references.fold",
		"utf-8",
	);
	const graph = JSON.parse(fold);
	const result = ear.graph.validate(graph);
	expect(result.length).toBe(1);
});

test("validate, contains duplicate faceOrders", () => {
	const graph = {
		faceOrders: [
			[0, 1, 1],
			[0, 2, 1],
			[1, 2, 1],
			[1, 0, -1],
		],
	};
	const violations = ear.graph.validate(graph);
	expect(violations.length).toBe(1);
});

test("validate, contains poorly formed faceOrders", () => {
	const graph = {
		faceOrders: [
			[0, 1, 1],
			[2, 2, 1],
			[1, 2, 1],
			[1, 1, -1],
		],
	};
	const violations = ear.graph.validate(graph);
	expect(violations.length).toBe(2);
});
