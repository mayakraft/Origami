import { expect, test } from "vitest";
import ear from "../src/index.js";

test("convexHull", () => {
	const rect = [
		[1, 0],
		[0, 0],
		[1, 1],
		[0, 1],
	];
	const res0 = ear.math.convexHull(rect).map((v) => rect[v]);
	const res1 = ear.math.convexHull(rect, true).map((v) => rect[v]);
	expect(res0.length).toBe(4);
	expect(res1.length).toBe(4);
});

test("convexHull collinear", () => {
	const rect_collinear = [
		[1, 0],
		[0, 0],
		[1, 1],
		[0, 1],
		[0.5, 0],
		[0, 0.5],
		[1, 0.5],
		[0.5, 1],
	];
	const res0 = ear.math.convexHull(rect_collinear).map((v) => rect_collinear[v]);
	const res1 = ear.math.convexHull(rect_collinear, true).map((v) => rect_collinear[v]);
	expect(res0.length).toBe(4);
	expect(res1.length).toBe(8);
});

test("convexHull collinear", () => {
	const rect_collinear = [
		[3, 0],
		[0, 0],
		[3, 3],
		[0, 3],
		// collinear points
		[1, 0],
		[0, 1],
		[3, 1],
		[1, 3],
		[2, 0],
		[0, 2],
		[3, 2],
		[2, 3],
	];
	const res0 = ear.math.convexHull(rect_collinear).map((v) => rect_collinear[v]);
	const res1 = ear.math.convexHull(rect_collinear, true).map((v) => rect_collinear[v]);
	expect(res0.length).toBe(4);
	expect(res1.length).toBe(12);
});

test("convexHull axisaligned", () => {
	const rect = [
		[1, 0],
		[-1, 0],
		[0, 1],
		[0, -1],
	];
	const res0 = ear.math.convexHull(rect).map((v) => rect[v]);
	const res1 = ear.math.convexHull(rect, true).map((v) => rect[v]);
	expect(res0.length).toBe(4);
	expect(res1.length).toBe(4);
});

test("convexHull collinear axisaligned", () => {
	const rect = [
		[1, 0],
		[-1, 0],
		[0, 1],
		[0, -1],
		[0.5, 0.5],
		[0.5, -0.5],
		[-0.5, -0.5],
		[-0.5, 0.5],
	];
	const res0 = ear.math.convexHull(rect).map((v) => rect[v]);
	const res1 = ear.math.convexHull(rect, true).map((v) => rect[v]);
	expect(res0.length).toBe(4);
	expect(res1.length).toBe(8);
});

test("convexHull collinear axisaligned", () => {
	const rect = [
		[3, 0],
		[-3, 0],
		[0, 3],
		[0, -3],
		// collinear points
		[1, 2],
		[2, 1],
		[1, -2],
		[2, -1],
		[-1, -2],
		[-2, -1],
		[-1, 2],
		[-2, 1],
	];
	const res0 = ear.math.convexHull(rect).map((v) => rect[v]);
	const res1 = ear.math.convexHull(rect, true).map((v) => rect[v]);
	expect(res0.length).toBe(4);
	expect(res1.length).toBe(12);
});
