import { expect, test } from "vitest";
import ear from "../src/index.js";

test("validate axiom 1, square", () => {
	const graph = ear.graph.square();
	const params = [[0.25, 0.25], [0.75, 0.5]];
	expect(ear.axiom.validateAxiom1(graph, ...params))
		.toMatchObject([true]);
});

test("validate axiom 1, square, on boundary", () => {
	const graph = ear.graph.square();
	const params = [[0, 0.25], [1, 0.75]];
	expect(ear.axiom.validateAxiom1(graph, ...params))
		.toMatchObject([true]);
});

test("validate axiom 1, square, outside boundary", () => {
	const graph = ear.graph.square();
	const params = [[0, 1.25], [1, -0.75]];
	expect(ear.axiom.validateAxiom1(graph, ...params))
		.toMatchObject([false]);
});

test("validate axiom 2, square", () => {
	const graph = ear.graph.square();
	const params = [[0.25, 0.25], [0.75, 0.5]];
	expect(ear.axiom.validateAxiom2(graph, ...params))
		.toMatchObject([true]);
});

test("validate axiom 2, square, on boundary", () => {
	const graph = ear.graph.square();
	const params = [[0, 0.25], [1, 0.75]];
	expect(ear.axiom.validateAxiom2(graph, ...params))
		.toMatchObject([true]);
});

test("validate axiom 2, square, outside boundary", () => {
	const graph = ear.graph.square();
	const params = [[0, 1.25], [1, -0.75]];
	expect(ear.axiom.validateAxiom2(graph, ...params))
		.toMatchObject([false]);
});

test("validate axiom 4, square", () => {
	const graph = ear.graph.square();
	const line = ear.math.pointsToLine2([0, 0.25], [1, 0.75]);
	const point = [1, 0];
	expect(ear.axiom.validateAxiom4(graph, line, point))
		.toMatchObject([true]);
});

test("validate axiom 4, square, point outside", () => {
	const graph = ear.graph.square();
	const line = ear.math.pointsToLine2([0, 0.25], [1, 0.75]);
	const point = [1, -1];
	expect(ear.axiom.validateAxiom4(graph, line, point))
		.toMatchObject([false]);
});

test("validate axiom 4, square, intersection outside boundary", () => {
	const graph = ear.graph.square();
	const line = ear.math.pointsToLine2([0, 0.25], [1, 0.75]);
	const point = [0.9, 1];
	expect(ear.axiom.validateAxiom4(graph, line, point))
		.toMatchObject([false]);
});

test("validate axiom 4, square, intersection on boundary", () => {
	// the intersection point lies exactly on the boundary
	const graph = ear.graph.square();
	const line = ear.math.pointsToLine2([0, 0.25], [1, 0.75]);
	const point = [0.875, 1];
	expect(ear.axiom.validateAxiom4(graph, line, point))
		.toMatchObject([false]);
});

test("validate axiom 4, square, intersection barely inside boundary", () => {
	// the intersection point lies almost exactly on the boundary,
	// but technically inside, technically giving us a line to match onto
	const graph = ear.graph.square();
	const line = ear.math.pointsToLine2([0, 0.25], [1, 0.75]);
	const point = [0.85, 1];
	expect(ear.axiom.validateAxiom4(graph, line, point))
		.toMatchObject([true]);
});
