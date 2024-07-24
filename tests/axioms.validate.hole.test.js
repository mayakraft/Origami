import { expect, test } from "vitest";
import fs from "fs";
import ear from "../src/index.js";

test("validate axiom 1, square with hole", () => {
	const FOLD = fs.readFileSync("./tests/files/fold/square-with-hole.fold", "utf-8");
	const graph = JSON.parse(FOLD);
	const params = [[0.5, 0.5], [2.5, 0.5]];
	expect(ear.axiom.validateAxiom1(graph, ...params))
		.toMatchObject([true]);
});

test("validate axiom 1, square with hole, crosses hole", () => {
	// axiom 1 must have a direct line of sight
	const FOLD = fs.readFileSync("./tests/files/fold/square-with-hole.fold", "utf-8");
	const graph = JSON.parse(FOLD);
	const params = [[0.5, 1.5], [2.5, 1.5]];
	expect(ear.axiom.validateAxiom1(graph, ...params))
		.toMatchObject([false]);
});

test("validate axiom 2, square with hole", () => {
	const FOLD = fs.readFileSync("./tests/files/fold/square-with-hole.fold", "utf-8");
	const graph = JSON.parse(FOLD);
	const params = [[0.5, 0.5], [2.5, 0.5]];
	expect(ear.axiom.validateAxiom2(graph, ...params))
		.toMatchObject([true]);
});

test("validate axiom 2, square with hole, crosses hole", () => {
	// axiom 2 is allowed to not have a direct line of sight
	const FOLD = fs.readFileSync("./tests/files/fold/square-with-hole.fold", "utf-8");
	const graph = JSON.parse(FOLD);
	const params = [[0.5, 1.5], [2.5, 1.5]];
	expect(ear.axiom.validateAxiom2(graph, ...params))
		.toMatchObject([true]);
});

test("validate axiom 4, square with hole, projection crosses hole", () => {
	// it's okay for the projection line to pass through the hole
	const FOLD = fs.readFileSync("./tests/files/fold/square-with-hole.fold", "utf-8");
	const graph = JSON.parse(FOLD);
	const line = ear.math.pointsToLine2([0, 0.5], [3, 0.5]);
	const point = [1.5, 2.5];
	expect(ear.axiom.validateAxiom4(graph, line, point))
		.toMatchObject([true]);
});

test("validate axiom 4, square with hole, point in hole", () => {
	// it's okay for the projection line to pass through the hole
	const FOLD = fs.readFileSync("./tests/files/fold/square-with-hole.fold", "utf-8");
	const graph = JSON.parse(FOLD);
	const line = ear.math.pointsToLine2([0, 0.5], [3, 0.5]);
	const point = [1.5, 1.5];
	expect(ear.axiom.validateAxiom4(graph, line, point))
		.toMatchObject([false]);
});

test("validate axiom 4, square with hole, projection in hole", () => {
	// it's okay for the point's projection to lie inside a hole
	const FOLD = fs.readFileSync("./tests/files/fold/square-with-hole.fold", "utf-8");
	const graph = JSON.parse(FOLD);
	const line = ear.math.pointsToLine2([0, 0.5], [2.5, 3]);
	const point = [3, 0];
	expect(ear.axiom.validateAxiom4(graph, line, point))
		.toMatchObject([true]);
});

test("validate axiom 4, square with hole, projection on hole boundary", () => {
	const FOLD = fs.readFileSync("./tests/files/fold/square-with-hole.fold", "utf-8");
	const graph = JSON.parse(FOLD);
	const line = ear.math.pointsToLine2([0, 0.5], [2.5, 3]);
	const point = [2.5, 0];
	expect(ear.axiom.validateAxiom4(graph, line, point))
		.toMatchObject([true]);
});

test("validate axiom 4, square with hole, no segments overlap", () => {
	// both sides produce segments, but none overlap
	const FOLD = fs.readFileSync("./tests/files/fold/square-with-hole.fold", "utf-8");
	const graph = JSON.parse(FOLD);
	const line = ear.math.pointsToLine2([0, 0], [3, 3]);
	const point = [2, 0];
	expect(ear.axiom.validateAxiom4(graph, line, point))
		.toMatchObject([false]);
});

test("validate axiom 4, square with hole, segments overlap, mirror image", () => {
	// both sides produce segments, but now they barely overlap
	const FOLD = fs.readFileSync("./tests/files/fold/square-with-hole.fold", "utf-8");
	const graph = JSON.parse(FOLD);
	const line = ear.math.pointsToLine2([0, 0], [3, 3]);
	const point = [3, 0];
	expect(ear.axiom.validateAxiom4(graph, line, point))
		.toMatchObject([true]);
});

test("validate axiom 4, square with hole, segments overlap", () => {
	// both sides produce segments, but now they barely overlap
	const FOLD = fs.readFileSync("./tests/files/fold/square-with-hole.fold", "utf-8");
	const graph = JSON.parse(FOLD);
	const line = ear.math.pointsToLine2([0, 0], [3, 3]);
	const point = [2.25, 0];
	expect(ear.axiom.validateAxiom4(graph, line, point))
		.toMatchObject([true]);
});
