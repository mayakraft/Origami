import { expect, test } from "vitest";
import ear from "../src/index.js";

test("off for now", () => {});

// test("validate, valid results", () => {
// 	const boundary = [[0, 0], [1, 0], [1, 1], [0, 1]];

// 	const args1 = [[0.75, 0.75], [0.15, 0.85]];
// 	const args2 = [[0.75, 0.75], [0.15, 0.85]];
// 	const args3 = [
// 		{ vector: [0.0, -0.5], origin: [0.25, 0.75] },
// 		{ vector: [0.5, 0.0], origin: [0.5, 0.75] },
// 	];
// 	const args4 = [
// 		{ vector: [-0.10, 0.11], origin: [0.62, 0.37] },
// 		[0.83, 0.51],
// 	];
// 	const args5 = [
// 		{ vector: [-0.37, -0.13], origin: [0.49, 0.71] },
// 		[0.5, 0.5],
// 		[0.15, 0.85],
// 	];
// 	const args6 = [
// 		{ vector: [0.1, -0.5], origin: [0.45, 0.8] },
// 		{ vector: [0.2, -0.25], origin: [0.35, 0.5] },
// 		[0.65, 0.55],
// 		[0.45, 0.25],
// 	];
// 	const args7 = [
// 		{ vector: [-0.20, -0.25], origin: [0.62, 0.93] },
// 		{ vector: [-0.42, 0.61], origin: [0.52, 0.25] },
// 		[0.25, 0.85],
// 	];

// 	// const solutions1 = ear.axiom.axiom1(...args1);
// 	// const solutions2 = ear.axiom.axiom2(...args2);
// 	const solutions3 = ear.axiom.axiom3(...args3);
// 	const solutions4 = ear.axiom.axiom4(...args4);
// 	const solutions5 = ear.axiom.axiom5(...args5);
// 	const solutions6 = ear.axiom.axiom6(...args6);
// 	const solutions7 = ear.axiom.axiom7(...args7);

// 	const valid1 = ear.axiom.validateAxiom1(boundary, ...args1);
// 	const valid2 = ear.axiom.validateAxiom2(boundary, ...args2);
// 	const valid3 = ear.axiom.validateAxiom3(boundary, solutions3, ...args3);
// 	const valid4 = ear.axiom.validateAxiom4(boundary, solutions4, ...args4);
// 	const valid5 = ear.axiom.validateAxiom5(boundary, solutions5, ...args5);
// 	const valid6 = ear.axiom.validateAxiom6(boundary, solutions6, ...args6);
// 	const valid7 = ear.axiom.validateAxiom7(boundary, solutions7, ...args7);

// 	expect(valid1.reduce((a, b) => a && b, true)).toBe(true);
// 	expect(valid2.reduce((a, b) => a && b, true)).toBe(true);
// 	expect(valid3.reduce((a, b) => a && b, true)).toBe(true);
// 	expect(valid4.reduce((a, b) => a && b, true)).toBe(true);
// 	expect(valid5.reduce((a, b) => a && b, true)).toBe(true);
// 	expect(valid6.reduce((a, b) => a && b, true)).toBe(true);
// 	expect(valid7.reduce((a, b) => a && b, true)).toBe(true);
// });

// test("validate, invalid results due to point (or line) outside boundary", () => {
// 	const boundary = [[0, 0], [1, 0], [1, 1], [0, 1]];

// 	const args1 = [[1.75, 0.75], [0.15, 0.85]];
// 	const args2 = [[0.75, 0.75], [-0.15, 0.85]];
// 	const args3 = [
// 		{ vector: [0, -1], origin: [1.25, 0] },
// 		{ vector: [1, 0], origin: [0.5, 0.75] },
// 	];
// 	const args4 = [
// 		{ vector: [-0.10, 0.11], origin: [0.62, 0.37] },
// 		[1.1, 0.5],
// 	];
// 	const args5 = [
// 		{ vector: [-0.37, -0.13], origin: [0.49, 0.71] },
// 		[0.75, 0.75],
// 		[1.1, 0.85],
// 	];
// 	const args6 = [
// 		{ vector: [0.1, -0.5], origin: [0.4, 0.8] },
// 		{ vector: [0.2, -0.25], origin: [0.1, 0.5] },
// 		[0.65, 0.7],
// 		[0.15, 0.15],
// 	];
// 	const args7 = [
// 		{ vector: [-0.20, -0.25], origin: [0.62, 0.93] },
// 		{ vector: [-0.42, 0.61], origin: [0.52, 0.25] },
// 		[0.25, 1.1],
// 	];

// 	// const solutions1 = ear.axiom.axiom1(...args1);
// 	// const solutions2 = ear.axiom.axiom2(...args2);
// 	const solutions3 = ear.axiom.axiom3(...args3);
// 	const solutions4 = ear.axiom.axiom4(...args4);
// 	const solutions5 = ear.axiom.axiom5(...args5);
// 	const solutions6 = ear.axiom.axiom6(...args6);
// 	const solutions7 = ear.axiom.axiom7(...args7);

// 	const valid1 = ear.axiom.validateAxiom1(boundary, ...args1);
// 	const valid2 = ear.axiom.validateAxiom2(boundary, ...args2);
// 	const valid3 = ear.axiom.validateAxiom3(boundary, solutions3, ...args3);
// 	const valid4 = ear.axiom.validateAxiom4(boundary, solutions4, ...args4);
// 	const valid5 = ear.axiom.validateAxiom5(boundary, solutions5, ...args5);
// 	const valid6 = ear.axiom.validateAxiom6(boundary, solutions6, ...args6);
// 	const valid7 = ear.axiom.validateAxiom7(boundary, solutions7, ...args7);

// 	expect(valid1.reduce((a, b) => a || b, false)).toBe(false);
// 	expect(valid2.reduce((a, b) => a || b, false)).toBe(false);
// 	expect(valid3.reduce((a, b) => a || b, false)).toBe(false);
// 	expect(valid4.reduce((a, b) => a || b, false)).toBe(false);
// 	expect(valid5.reduce((a, b) => a || b, false)).toBe(false);
// 	expect(valid6[0]).toBe(false);
// 	expect(valid6[1]).toBe(false);
// 	expect(valid6[2]).toBe(true);
// 	// expect(valid7.reduce((a, b) => a || b, false)).toBe(false);
// });

// test("axiom 6 with 2 results", () => {
// 	const args6 = [
// 		{ vector: [0, 0.5], origin: [0.2, 0.85] },
// 		{ vector: [0, -0.25], origin: [0.5, 0.5] },
// 		[0.35, 0.25],
// 		[0.25, 0.6],
// 	];
// 	const result = ear.axiom.validateAxiom6(
// 		[[0, 0], [1, 0], [1, 1], [0, 1]],
// 		ear.axiom.axiom6(...args6),
// 		...args6,
// 	);
// 	expect(result.length).toBe(2);
// 	expect(result[0]).toBe(true);
// 	expect(result[1]).toBe(true);
// });
