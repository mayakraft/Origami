import { expect, test } from "vitest";
import ear from "../src/index.js";

test("overlapConvexPolygonPoint bad inputs", () => {
	// invalid point
	expect(
		ear.math.overlapConvexPolygonPoint(
			[
				[0, 0],
				[1, 0],
				[1, 1],
				[0, 1],
			],
			[],
			ear.math.exclude,
		).overlap,
	).toBe(true);
});

test("overlapConvexPolygonPoint counter-clockwise point on boundary", () => {
	// counter-clockwise
	const square = [
		[0, 0],
		[1, 0],
		[1, 1],
		[0, 1],
	];
	expect(
		ear.math.overlapConvexPolygonPoint(square, [0.5, 0], ear.math.exclude).overlap,
	).toBe(false);
	expect(
		ear.math.overlapConvexPolygonPoint(square, [1, 0.5], ear.math.exclude).overlap,
	).toBe(false);
	expect(
		ear.math.overlapConvexPolygonPoint(square, [0.5, 1], ear.math.exclude).overlap,
	).toBe(false);
	expect(
		ear.math.overlapConvexPolygonPoint(square, [0, 0.5], ear.math.exclude).overlap,
	).toBe(false);

	expect(
		ear.math.overlapConvexPolygonPoint(square, [0.5, 0], ear.math.include).overlap,
	).toBe(true);
	expect(
		ear.math.overlapConvexPolygonPoint(square, [1, 0.5], ear.math.include).overlap,
	).toBe(true);
	expect(
		ear.math.overlapConvexPolygonPoint(square, [0.5, 1], ear.math.include).overlap,
	).toBe(true);
	expect(
		ear.math.overlapConvexPolygonPoint(square, [0, 0.5], ear.math.include).overlap,
	).toBe(true);
});

test("overlapConvexPolygonPoint clockwise point on boundary", () => {
	// clockwise
	const square = [
		[0, 0],
		[0, 1],
		[1, 1],
		[1, 0],
	];
	expect(
		ear.math.overlapConvexPolygonPoint(square, [0.5, 0], ear.math.exclude).overlap,
	).toBe(false);
	expect(
		ear.math.overlapConvexPolygonPoint(square, [1, 0.5], ear.math.exclude).overlap,
	).toBe(false);
	expect(
		ear.math.overlapConvexPolygonPoint(square, [0.5, 1], ear.math.exclude).overlap,
	).toBe(false);
	expect(
		ear.math.overlapConvexPolygonPoint(square, [0, 0.5], ear.math.exclude).overlap,
	).toBe(false);

	expect(
		ear.math.overlapConvexPolygonPoint(square, [0.5, 0], ear.math.include).overlap,
	).toBe(true);
	expect(
		ear.math.overlapConvexPolygonPoint(square, [1, 0.5], ear.math.include).overlap,
	).toBe(true);
	expect(
		ear.math.overlapConvexPolygonPoint(square, [0.5, 1], ear.math.include).overlap,
	).toBe(true);
	expect(
		ear.math.overlapConvexPolygonPoint(square, [0, 0.5], ear.math.include).overlap,
	).toBe(true);
});

test("overlapConvexPolygonPoint counter-clockwise point on vertex", () => {
	// counter-clockwise
	const square = [
		[0, 0],
		[1, 0],
		[1, 1],
		[0, 1],
	];
	expect(
		ear.math.overlapConvexPolygonPoint(square, [0, 0], ear.math.exclude).overlap,
	).toBe(false);
	expect(
		ear.math.overlapConvexPolygonPoint(square, [1, 0], ear.math.exclude).overlap,
	).toBe(false);
	expect(
		ear.math.overlapConvexPolygonPoint(square, [1, 1], ear.math.exclude).overlap,
	).toBe(false);
	expect(
		ear.math.overlapConvexPolygonPoint(square, [0, 1], ear.math.exclude).overlap,
	).toBe(false);

	expect(
		ear.math.overlapConvexPolygonPoint(square, [0, 0], ear.math.include).overlap,
	).toBe(true);
	expect(
		ear.math.overlapConvexPolygonPoint(square, [1, 0], ear.math.include).overlap,
	).toBe(true);
	expect(
		ear.math.overlapConvexPolygonPoint(square, [1, 1], ear.math.include).overlap,
	).toBe(true);
	expect(
		ear.math.overlapConvexPolygonPoint(square, [0, 1], ear.math.include).overlap,
	).toBe(true);
});

test("overlapConvexPolygonPoint clockwise point on vertex", () => {
	// clockwise
	const square = [
		[0, 0],
		[0, 1],
		[1, 1],
		[1, 0],
	];
	expect(
		ear.math.overlapConvexPolygonPoint(square, [0, 0], ear.math.exclude).overlap,
	).toBe(false);
	expect(
		ear.math.overlapConvexPolygonPoint(square, [1, 0], ear.math.exclude).overlap,
	).toBe(false);
	expect(
		ear.math.overlapConvexPolygonPoint(square, [1, 1], ear.math.exclude).overlap,
	).toBe(false);
	expect(
		ear.math.overlapConvexPolygonPoint(square, [0, 1], ear.math.exclude).overlap,
	).toBe(false);

	expect(
		ear.math.overlapConvexPolygonPoint(square, [0, 0], ear.math.include).overlap,
	).toBe(true);
	expect(
		ear.math.overlapConvexPolygonPoint(square, [1, 0], ear.math.include).overlap,
	).toBe(true);
	expect(
		ear.math.overlapConvexPolygonPoint(square, [1, 1], ear.math.include).overlap,
	).toBe(true);
	expect(
		ear.math.overlapConvexPolygonPoint(square, [0, 1], ear.math.include).overlap,
	).toBe(true);
});

test("overlapConvexPolygonPoint counter-clockwise point inside", () => {
	// counter-clockwise
	const square = [
		[0, 0],
		[1, 0],
		[1, 1],
		[0, 1],
	];
	expect(
		ear.math.overlapConvexPolygonPoint(square, [0.5, 0.5], ear.math.exclude).overlap,
	).toBe(true);
	expect(
		ear.math.overlapConvexPolygonPoint(square, [0.5, 0.5], ear.math.include).overlap,
	).toBe(true);
});

test("overlapConvexPolygonPoint clockwise point inside", () => {
	// clockwise
	const square = [
		[0, 0],
		[0, 1],
		[1, 1],
		[1, 0],
	];
	expect(
		ear.math.overlapConvexPolygonPoint(square, [0.5, 0.5], ear.math.exclude).overlap,
	).toBe(true);
	expect(
		ear.math.overlapConvexPolygonPoint(square, [0.5, 0.5], ear.math.include).overlap,
	).toBe(true);
});

test("overlapConvexPolygonPoint counter-clockwise point outside", () => {
	// counter-clockwise
	const square = [
		[0, 0],
		[1, 0],
		[1, 1],
		[0, 1],
	];
	expect(
		ear.math.overlapConvexPolygonPoint(square, [2, 0.5], ear.math.exclude).overlap,
	).toBe(false);
	expect(
		ear.math.overlapConvexPolygonPoint(square, [0.5, 2], ear.math.exclude).overlap,
	).toBe(false);
	expect(
		ear.math.overlapConvexPolygonPoint(square, [-2, 0.5], ear.math.exclude).overlap,
	).toBe(false);
	expect(
		ear.math.overlapConvexPolygonPoint(square, [0.5, -2], ear.math.exclude).overlap,
	).toBe(false);

	expect(
		ear.math.overlapConvexPolygonPoint(square, [2, 0.5], ear.math.include).overlap,
	).toBe(false);
	expect(
		ear.math.overlapConvexPolygonPoint(square, [0.5, 2], ear.math.include).overlap,
	).toBe(false);
	expect(
		ear.math.overlapConvexPolygonPoint(square, [-2, 0.5], ear.math.include).overlap,
	).toBe(false);
	expect(
		ear.math.overlapConvexPolygonPoint(square, [0.5, -2], ear.math.include).overlap,
	).toBe(false);
});

test("overlapConvexPolygonPoint clockwise point outside", () => {
	// clockwise
	const square = [
		[0, 0],
		[0, 1],
		[1, 1],
		[1, 0],
	];
	expect(
		ear.math.overlapConvexPolygonPoint(square, [2, 0.5], ear.math.exclude).overlap,
	).toBe(false);
	expect(
		ear.math.overlapConvexPolygonPoint(square, [0.5, 2], ear.math.exclude).overlap,
	).toBe(false);
	expect(
		ear.math.overlapConvexPolygonPoint(square, [-2, 0.5], ear.math.exclude).overlap,
	).toBe(false);
	expect(
		ear.math.overlapConvexPolygonPoint(square, [0.5, -2], ear.math.exclude).overlap,
	).toBe(false);

	expect(
		ear.math.overlapConvexPolygonPoint(square, [2, 0.5], ear.math.include).overlap,
	).toBe(false);
	expect(
		ear.math.overlapConvexPolygonPoint(square, [0.5, 2], ear.math.include).overlap,
	).toBe(false);
	expect(
		ear.math.overlapConvexPolygonPoint(square, [-2, 0.5], ear.math.include).overlap,
	).toBe(false);
	expect(
		ear.math.overlapConvexPolygonPoint(square, [0.5, -2], ear.math.include).overlap,
	).toBe(false);
});

test("overlapConvexPolygons", () => {
	const square1 = [
		[0, 0],
		[1, 0],
		[1, 1],
		[0, 1],
	];
	const square2 = [
		[1, 0],
		[2, 0],
		[2, 1],
		[1, 1],
	];
	// nudge squares by an amount larger than the epsilon
	const square2Plus = [
		[1, 0],
		[2, 0],
		[2, 1],
		[1, 1],
	].map((p) => [p[0] + 1e-2, p[1]]);
	const square2Minus = [
		[1, 0],
		[2, 0],
		[2, 1],
		[1, 1],
	].map((p) => [p[0] - 1e-2, p[1]]);

	expect(ear.math.overlapConvexPolygons(square1, square2)).toBe(false);
	expect(ear.math.overlapConvexPolygons(square2, square1)).toBe(false);

	expect(ear.math.overlapConvexPolygons(square1, square2Plus)).toBe(false);
	expect(ear.math.overlapConvexPolygons(square2Plus, square1)).toBe(false);

	expect(ear.math.overlapConvexPolygons(square1, square2Minus)).toBe(true);
	expect(ear.math.overlapConvexPolygons(square2Minus, square1)).toBe(true);

	// increase epsilon until they overlap again
	// this is not possible, you cannot adjust the epsilon to convert a
	// non-overlapping to overlapping or visa-versa.
	// expect(ear.math.overlapConvexPolygons(square1, square2Minus), 1e-3).toBe(false);
	// expect(ear.math.overlapConvexPolygons(square2Minus, square1), 1e-3).toBe(false);
});
