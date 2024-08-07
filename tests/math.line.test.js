import { expect, test } from "vitest";
import ear from "../src/index.js";

test("collinearBetween", () => {
	const [p0, p2] = [
		[0, 0],
		[1, 0],
	];
	const p1 = [0.5, 0];
	expect(ear.math.collinearBetween(p0, p1, p2, false)).toBe(true);
});

test("collinearBetween on endpoint, inclusive", () => {
	const [p0, p2] = [
		[0, 0],
		[1, 0],
	];
	const p1 = [1e-12, 0];
	expect(ear.math.collinearBetween(p0, p1, p2, true)).toBe(true);
});

test("collinearBetween on endpoint, exclusive", () => {
	const [p0, p2] = [
		[0, 0],
		[1, 0],
	];
	const p1 = [1e-12, 0];
	expect(ear.math.collinearBetween(p0, p1, p2)).toBe(false);
});

test("collinearBetween almost near endpoint, exclusive", () => {
	const [p0, p2] = [
		[0, 0],
		[1, 0],
	];
	const p1 = [1e-4, 0];
	expect(ear.math.collinearBetween(p0, p1, p2)).toBe(true);
});

test("collinearBetween perpendicularly away too far", () => {
	const [p0, p2] = [
		[0, 0],
		[1, 0],
	];
	expect(ear.math.collinearBetween(p0, [0.5, 1e-2], p2)).toBe(false);
	expect(ear.math.collinearBetween(p0, [0.5, 1e-3], p2)).toBe(false);
	expect(ear.math.collinearBetween(p0, [0.5, 1e-4], p2)).toBe(true);
	expect(ear.math.collinearBetween(p0, [0.5, 1e-5], p2)).toBe(true);
});

test("collinearBetween perpendicularly away near", () => {
	const [p0, p2] = [
		[0, 0],
		[1, 0],
	];
	const p1 = [0.5, 1e-12];
	expect(ear.math.collinearBetween(p0, p1, p2)).toBe(true);
});

test("pleats", () => {
	const a = { vector: [1, 0], origin: [0, 0] };
	const b = { vector: [1, 0], origin: [10, 0] };
	const pleats = ear.math.pleat(a, b, 10);
	pleats[0].forEach((line, i) => {
		expect(line.origin[0]).toBeCloseTo(i + 1);
	});
	pleats[0].forEach((line) => {
		expect(line.vector[0]).toBeCloseTo(1);
		expect(line.vector[1]).toBeCloseTo(0);
	});
});

test("pleats, opposite vector", () => {
	const a = { vector: [1, 0], origin: [0, 0] };
	const b = { vector: [-1, 0], origin: [1, 0] };
	const pleats = ear.math.pleat(a, b, 4);
	expect(pleats[0].length).toBe(0);
	pleats[1].forEach((line) => {
		expect(line.vector[0]).toBeCloseTo(1);
		expect(line.vector[1]).toBeCloseTo(0);
	});
});

// test("lerp lines, opposite vectors", () => {
// 	const a = { vector: [1, 0], origin: [0, 0] };
// 	const b = { vector: [-1, 0], origin: [1, 0] };
// 	expect(ear.math.lerpLines(a, b, 0.25).origin[0]).toBeCloseTo(0.25);
// 	expect(ear.math.lerpLines(a, b, 0.5).origin[0]).toBeCloseTo(0.5);
// 	expect(ear.math.lerpLines(a, b, 0.75).origin[0]).toBeCloseTo(0.75);
// 	expect(ear.math.lerpLines(a, b, 0.25).origin[1]).toBeCloseTo(0);
// 	expect(ear.math.lerpLines(a, b, 0.5).origin[1]).toBeCloseTo(0);
// 	expect(ear.math.lerpLines(a, b, 0.75).origin[1]).toBeCloseTo(0);
// 	expect(ear.math.lerpLines(a, b, 0.25).vector[0]).toBeCloseTo(0.5);
// 	expect(ear.math.lerpLines(a, b, 0.5).vector[0]).toBeCloseTo(0);
// 	expect(ear.math.lerpLines(a, b, 0.75).vector[0]).toBeCloseTo(-0.5);
// 	expect(ear.math.lerpLines(a, b, 0.25).vector[1]).toBeCloseTo(0);
// 	expect(ear.math.lerpLines(a, b, 0.5).vector[1]).toBeCloseTo(0);
// 	expect(ear.math.lerpLines(a, b, 0.75).vector[1]).toBeCloseTo(0);
// });
