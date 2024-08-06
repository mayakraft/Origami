import { expect, test } from "vitest";
import ear from "../src/index.js";

const testEqualVectors = function (...args) {
	expect(ear.math.epsilonEqualVectors(...args)).toBe(true);
};

test("nearest point", () => {
	testEqualVectors(
		[5, 5],
		ear.math.nearestPoint2(
			[
				[0, 0],
				[1, 1],
				[2, 2],
				[3, 3],
				[4, 4],
				[5, 5],
				[6, 6],
				[7, 7],
				[8, 8],
				[9, 9],
			],
			[10, 0],
		),
	);
	testEqualVectors(
		[6, 6, 0],
		ear.math.nearestPoint(
			[
				[0, 0, 0],
				[1, 1, 0],
				[2, 2, 0],
				[3, 3, 0],
				[4, 4, 1],
				[5, 5, 10],
				[6, 6, 0],
				[7, 7, 0],
				[8, 8, 0],
				[9, 9, 0],
			],
			[10, 0, 0],
		),
	);
});

test("nearestPointOnPolygon", () => {
	const polygon = [
		[1, 0],
		[0, 1],
		[-1, 0],
		[0, -1],
	];
	const result = ear.math.nearestPointOnPolygon(polygon, [10, 10]);
	// result { point: [ 0.5, 0.5 ], edge: 0, distance: 13.435028842544403 }
	expect(result.point[0]).toBe(0.5);
	expect(result.point[1]).toBe(0.5);
	expect(result.distance).toBeCloseTo(13.435028842544403);
	expect(result.edge).toBe(0);
	expect(polygon[result.edge][0]).toBe(1);
	expect(polygon[result.edge][1]).toBe(0);

	expect(ear.math.nearestPointOnPolygon(polygon, [-10, 10]).edge).toBe(1);
	expect(ear.math.nearestPointOnPolygon(polygon, [-10, -10]).edge).toBe(2);
	expect(ear.math.nearestPointOnPolygon(polygon, [10, -10]).edge).toBe(3);
});

test("nearestPointOnPolygon nearest to vertex", () => {
	const polygon = [
		[1, 0],
		[0, 1],
		[-1, 0],
		[0, -1],
	];

	const result1 = ear.math.nearestPointOnPolygon(polygon, [10, 0]);
	const result2 = ear.math.nearestPointOnPolygon(polygon, [0, 10]);
	const result3 = ear.math.nearestPointOnPolygon(polygon, [-10, 0]);
	const result4 = ear.math.nearestPointOnPolygon(polygon, [0, -10]);

	expect(result1.point[0]).toBe(1);
	expect(result1.point[1]).toBe(0);
	expect(result2.point[0]).toBe(0);
	expect(result2.point[1]).toBe(1);
	expect(result3.point[0]).toBe(-1);
	expect(result3.point[1]).toBe(0);
	expect(result4.point[0]).toBe(0);
	expect(result4.point[1]).toBe(-1);

	expect(result1.edge).toBe(0);
	expect(result2.edge).toBe(0);
	expect(result3.edge).toBe(1);
	expect(result4.edge).toBe(2);
});

test("nearestPointOnCircle", () => {
	const circle = { radius: 1, origin: [0, 0] };

	const result1 = ear.math.nearestPointOnCircle(circle, [10, 0]);
	const result2 = ear.math.nearestPointOnCircle(circle, [0, 10]);
	const result3 = ear.math.nearestPointOnCircle(circle, [-10, 0]);
	const result4 = ear.math.nearestPointOnCircle(circle, [0, -10]);

	const result5 = ear.math.nearestPointOnCircle(circle, [10, 10]);
	const result6 = ear.math.nearestPointOnCircle(circle, [-10, 10]);
	const result7 = ear.math.nearestPointOnCircle(circle, [-10, -10]);
	const result8 = ear.math.nearestPointOnCircle(circle, [10, -10]);

	expect(result1[0]).toBeCloseTo(1);
	expect(result1[1]).toBeCloseTo(0);
	expect(result2[0]).toBeCloseTo(0);
	expect(result2[1]).toBeCloseTo(1);
	expect(result3[0]).toBeCloseTo(-1);
	expect(result3[1]).toBeCloseTo(0);
	expect(result4[0]).toBeCloseTo(0);
	expect(result4[1]).toBeCloseTo(-1);

	expect(result5[0]).toBeCloseTo(Math.SQRT1_2);
	expect(result5[1]).toBeCloseTo(Math.SQRT1_2);
	expect(result6[0]).toBeCloseTo(-Math.SQRT1_2);
	expect(result6[1]).toBeCloseTo(Math.SQRT1_2);
	expect(result7[0]).toBeCloseTo(-Math.SQRT1_2);
	expect(result7[1]).toBeCloseTo(-Math.SQRT1_2);
	expect(result8[0]).toBeCloseTo(Math.SQRT1_2);
	expect(result8[1]).toBeCloseTo(-Math.SQRT1_2);
});
