import { expect, test } from "vitest";
import ear from "../src/index.js";

test("removed until all validate() methods are done", () => {});

// test("axiom validate, axiom1", () => {
// 	const boundary = [[0, 0], [1, 0], [1, 1], [0, 1]];
// 	const args = [[0.75, 0.75], [0.15, 0.85]];
// 	const solutions = ear.axiom.axiom1InPolygon(boundary, ...args)
// 		.filter(a => a);
// 	expect(solutions.length).toBe(1);
// });

// test("axiom validate, axiom2", () => {
// 	const boundary = [[0, 0], [1, 0], [1, 1], [0, 1]];
// 	const args = [[0.75, 0.75], [0.15, 0.85]];
// 	const solutions = ear.axiom.axiom2InPolygon(boundary, ...args)
// 		.filter(a => a);
// 	expect(solutions.length).toBe(1);
// });

// test("axiom validate, axiom3", () => {
// 	const boundary = [[0, 0], [1, 0], [1, 1], [0, 1]];
// 	const args = [
// 		{ vector: [0.0, -0.5], origin: [0.25, 0.75] },
// 		{ vector: [0.5, 0.0], origin: [0.5, 0.75] },
// 	];
// 	const solutions = ear.axiom.axiom3InPolygon(boundary, ...args)
// 		.filter(a => a);
// 	expect(solutions.length).toBe(2);
// });

// test("axiom validate, axiom4", () => {
// 	const boundary = [[0, 0], [1, 0], [1, 1], [0, 1]];
// 	const args = [
// 		{ vector: [-0.10, 0.11], origin: [0.62, 0.37] },
// 		[0.83, 0.51],
// 	];
// 	const solutions = ear.axiom.axiom4InPolygon(boundary, ...args)
// 		.filter(a => a);
// 	expect(solutions.length).toBe(1);
// });

// test("axiom validate, axiom5", () => {
// 	const boundary = [[0, 0], [1, 0], [1, 1], [0, 1]];
// 	const args = [
// 		{ vector: [-0.37, -0.13], origin: [0.49, 0.71] },
// 		[0.5, 0.5],
// 		[0.15, 0.85],
// 	];
// 	const solutions = ear.axiom.axiom5InPolygon(boundary, ...args)
// 		.filter(a => a);
// 	expect(solutions.length).toBe(2);
// });

// test("axiom validate, axiom6", () => {
// 	const boundary = [[0, 0], [1, 0], [1, 1], [0, 1]];
// 	const args = [
// 		{ vector: [0.1, -0.5], origin: [0.45, 0.8] },
// 		{ vector: [0.2, -0.25], origin: [0.35, 0.5] },
// 		[0.65, 0.55],
// 		[0.45, 0.25],
// 	];
// 	const solutions = ear.axiom.axiom6InPolygon(boundary, ...args)
// 		.filter(a => a);
// 	expect(solutions.length).toBe(3);
// });

// test("axiom validate, axiom7", () => {
// 	const boundary = [[0, 0], [1, 0], [1, 1], [0, 1]];
// 	const args = [
// 		{ vector: [-0.20, -0.25], origin: [0.62, 0.93] },
// 		{ vector: [-0.42, 0.61], origin: [0.52, 0.25] },
// 		[0.25, 0.85],
// 	];
// 	const solutions = ear.axiom.axiom7InPolygon(boundary, ...args)
// 		.filter(a => a);
// 	expect(solutions.length).toBe(1);
// });

// test("axiom validate, no solutions, axiom1", () => {
// 	const boundary = [[0, 0], [1, 0], [1, 1], [0, 1]];
// 	const args = [[1.75, 0.75], [0.15, 0.85]];
// 	const solutions = ear.axiom.axiom1InPolygon(boundary, ...args)
// 		.filter(a => a);
// 	expect(solutions).toHaveLength(0);
// });

// test("axiom validate, no solutions, axiom2", () => {
// 	const boundary = [[0, 0], [1, 0], [1, 1], [0, 1]];
// 	const args = [[0.75, 0.75], [-0.15, 0.85]];
// 	const solutions = ear.axiom.axiom2InPolygon(boundary, ...args)
// 		.filter(a => a);
// 	expect(solutions).toHaveLength(0);
// });

// test("axiom validate, no solutions, axiom3", () => {
// 	const boundary = [[0, 0], [1, 0], [1, 1], [0, 1]];
// 	const args = [
// 		{ vector: [0, -1], origin: [1.25, 0] },
// 		{ vector: [1, 0], origin: [0.5, 0.75] },
// 	];
// 	const solutions = ear.axiom.axiom3InPolygon(boundary, ...args)
// 		.filter(a => a);
// 	expect(solutions).toHaveLength(0);
// });

// test("axiom validate, no solutions, axiom4", () => {
// 	const boundary = [[0, 0], [1, 0], [1, 1], [0, 1]];
// 	const args = [
// 		{ vector: [-0.10, 0.11], origin: [0.62, 0.37] },
// 		[1.1, 0.5],
// 	];
// 	const solutions = ear.axiom.axiom4InPolygon(boundary, ...args)
// 		.filter(a => a);
// 	expect(solutions).toHaveLength(0);
// });

// test("axiom validate, no solutions, axiom5", () => {
// 	const boundary = [[0, 0], [1, 0], [1, 1], [0, 1]];
// 	const args = [
// 		{ vector: [-0.37, -0.13], origin: [0.49, 0.71] },
// 		[0.75, 0.75],
// 		[1.1, 0.85],
// 	];
// 	const solutions = ear.axiom.axiom5InPolygon(boundary, ...args)
// 		.filter(a => a);
// 	expect(solutions).toHaveLength(0);
// });

// test("axiom validate, no solutions, axiom6", () => {
// 	const boundary = [[0, 0], [1, 0], [1, 1], [0, 1]];
// 	const args = [
// 		{ vector: [0.1, -0.5], origin: [0.4, 0.8] },
// 		{ vector: [0.2, -0.25], origin: [0.1, 0.5] },
// 		[0.65, 0.7],
// 		[0.15, 0.15],
// 	];
// 	const solutions = ear.axiom.axiom6InPolygon(boundary, ...args)
// 		.filter(a => a);
// 	expect(solutions).toHaveLength(1); // still need an axiom 6 with no solutions
// });

// test("axiom validate, no solutions, axiom7", () => {
// 	const boundary = [[0, 0], [1, 0], [1, 1], [0, 1]];
// 	const args = [
// 		{ vector: [-0.20, -0.25], origin: [0.62, 0.93] },
// 		{ vector: [-0.42, 0.61], origin: [0.52, 0.25] },
// 		[0.25, 1.1],
// 	];
// 	const solutions = ear.axiom.axiom7InPolygon(boundary, ...args)
// 		.filter(a => a);
// 	expect(solutions).toHaveLength(0);
// });
