import { expect, test } from "vitest";
import ear from "../src/index.js";

const equalTest = (a, b) => expect(JSON.stringify(a)).toBe(JSON.stringify(b));

test("sortPointsAlongVector", () => {
	const points = [
		[1, 0],
		[0, 1],
		[-1, 0],
		[0, -1],
	];
	const result = ear.general.sortPointsAlongVector(points, [1, 0]);
	expect(result[0]).toBe(2);
	expect([result[1], result[2]].sort((a, b) => a - b).join(" ")).toBe("1 3");
	expect(result[3]).toBe(0);
});

// no longer included in API
// test("clusterIndicesOfSortedNumbers", () => {
// 	const result = ear.general.clusterIndicesOfSortedNumbers([0, 1, 2, 3, 4, 5]);
// 	equalTest(result, [[0], [1], [2], [3], [4], [5]]);
// 	const result1 = ear.general.clusterIndicesOfSortedNumbers([0, 1, 2, 3, 4, 5], 1);
// 	equalTest(result1, [[0], [1], [2], [3], [4], [5]]);
//	const result2 = ear.general
//	.clusterIndicesOfSortedNumbers([0, 1, 2, 3, 4, 5], 1 + ear.math.EPSILON * 2);
// 	equalTest(result2, [[0, 1, 2, 3, 4, 5]]);
// });

test("convexHullRadialSortPoints", () => {
	equalTest(ear.math.convexHullRadialSortPoints(), []);

	const result0 = ear.math.convexHullRadialSortPoints([
		[1, 0],
		[0, 1],
		[-1, 0],
	]);
	equalTest(result0, [[2], [0], [1]]);
	const result1 = ear.math.convexHullRadialSortPoints([
		[0, 1],
		[-1, 0],
		[1, 0],
	]);
	equalTest(result1, [[1], [2], [0]]);
	const result2 = ear.math.convexHullRadialSortPoints([
		[-1, 0],
		[1, 0],
		[0, 1],
	]);
	equalTest(result2, [[0], [1], [2]]);

	const result3 = ear.math.convexHullRadialSortPoints(
		[
			[1, 0],
			[0, 1],
			[-1, 0],
		],
		2,
	);
	equalTest(result3, [[2], [1, 0]]);
	const result4 = ear.math.convexHullRadialSortPoints(
		[
			[0, 1],
			[-1, 0],
			[1, 0],
		],
		2,
	);
	equalTest(result4, [[1], [0, 2]]);
	const result5 = ear.math.convexHullRadialSortPoints(
		[
			[-1, 0],
			[1, 0],
			[0, 1],
		],
		2,
	);
	equalTest(result5, [[0], [2, 1]]);
});

test("radialSortVectors3", () => {
	const points = Array.from(Array(24)).map(() => [
		Math.random() * 2 - 1,
		Math.random() * 2 - 1,
		Math.random() * 2 - 1,
	]);
	points.push([0, 0, 0]);
	const result = ear.general.radialSortVectors3(points, [1, 0, 0]);
	expect(result.length).toBe(25);
});

test("radialSortVectors3", () => {
	const points = [
		[1, 1, 1],
		[-1, -1, -1],
		[-1, -1, 1],
		[1, 1, -1],
	];
	const resultX = ear.general.radialSortVectors3(points, [1, 0, 0]);
	const resultY = ear.general.radialSortVectors3(points, [0, 1, 0]);
	const resultZ = ear.general.radialSortVectors3(points, [0, 0, 1]);
	const resultXn = ear.general.radialSortVectors3(points, [-1, 0, 0]);
	const resultYn = ear.general.radialSortVectors3(points, [0, -1, 0]);
	const resultZn = ear.general.radialSortVectors3(points, [0, 0, -1]);
	expect(JSON.stringify(resultX)).toBe(JSON.stringify([3, 0, 2, 1]));
	expect(JSON.stringify(resultY)).toBe(JSON.stringify([0, 3, 1, 2]));
	expect(JSON.stringify(resultZ)).toBe(JSON.stringify([0, 3, 1, 2]));
	expect(JSON.stringify(resultXn)).toBe(JSON.stringify([0, 3, 1, 2]));
	expect(JSON.stringify(resultYn)).toBe(JSON.stringify([3, 0, 2, 1]));
	expect(JSON.stringify(resultZn)).toBe(JSON.stringify([0, 3, 1, 2]));
});

// test("smallestVector2 easy", () => {
// 	expect(ear.math.smallestVector2()).toBe(undefined);
// 	expect(ear.math.smallestVector2([])).toBe(undefined);
// 	expect(ear.math.smallestVector2([[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]])).toBe(0);
// 	expect(ear.math.smallestVector2([[4, 0], [3, 0], [2, 0], [1, 0], [0, 0]])).toBe(4);
// 	expect(ear.math.smallestVector2([[2, 0], [1, 0], [0, 0], [4, 0], [3, 0]])).toBe(2);
// });

// test("smallestVector2 vertically aligned", () => {
// 	expect(ear.math.smallestVector2([[3, 0], [3, 1], [3, 2], [3, 3], [3, 4]])).toBe(0);
// 	expect(ear.math.smallestVector2([[3, 1], [3, 2], [3, 3], [3, 4], [3, 0]])).toBe(4);
// 	expect(ear.math.smallestVector2([[3, 2], [3, 3], [3, 4], [3, 0], [3, 1]])).toBe(3);
// 	expect(ear.math.smallestVector2([[3, 3], [3, 4], [3, 0], [3, 1], [3, 2]])).toBe(2);
// });
