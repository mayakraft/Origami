import { expect, test } from "vitest";
import ear from "../src/index.js";

test("sortPointsAlongVector empty", () => {
	expect(ear.general.sortPointsAlongVector([], [1, 0])).toMatchObject([]);
	expect(ear.general.sortPointsAlongVector([, , , , ,], [1, 0])).toMatchObject([
		,
		,
		,
		,
		,
	]);
});

test("sortPointsAlongVector", () => {
	const points = [
		[4, -0.0001],
		[3, 0.0001],
		[2, -100],
		[1, 99],
		[0, 0],
	];
	expect(ear.general.sortPointsAlongVector(points, [1, 0])).toMatchObject([
		4, 3, 2, 1, 0,
	]);
	expect(ear.general.sortPointsAlongVector(points, [-1, 0])).toMatchObject([
		0, 1, 2, 3, 4,
	]);
	expect(ear.general.sortPointsAlongVector(points, [0, 1])).toMatchObject([
		2, 0, 4, 1, 3,
	]);
	expect(ear.general.sortPointsAlongVector(points, [0, -1])).toMatchObject([
		3, 1, 4, 0, 2,
	]);
});

test("radialSortUnitVectors2", () => {
	const vectors = [
		[1, 0.5],
		[1, 1.5],
		[1, -1.5],
		[-1, -1.5],
		[-2, -5],
		[-2, 5],
		[-2, 2.2],
		[-2, 1],
		[2, -1.2],
	].map(ear.math.normalize);
	const result = ear.general.radialSortUnitVectors2(vectors);
	expect(JSON.stringify(result)).toBe(JSON.stringify([0, 1, 5, 6, 7, 3, 4, 2, 8]));
});
