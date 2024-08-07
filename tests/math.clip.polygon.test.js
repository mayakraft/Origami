import { expect, test } from "vitest";
import ear from "../src/index.js";

const testEqualVectorVectors = function (a, b) {
	expect(a.length).toBe(b.length);
	a.forEach((_, i) => expect(ear.math.epsilonEqualVectors(a[i], b[i])).toBe(true));
};

test("clipPolygonPolygon edge adjacent non intersecting", () => {
	const poly1 = [
		[0, 0],
		[1, 0],
		[1, 1],
		[0, 1],
	];
	const poly2 = [
		[1, 0],
		[2, 0],
		[2, 1],
		[1, 1],
	];
	const res1 = ear.math.clipPolygonPolygon(poly1, poly2);
	const res2 = ear.math.clipPolygonPolygon(poly1, poly2, 0.1);
	const res3 = ear.math.clipPolygonPolygon(poly1, poly2, -0.1);
	expect(res1).toBe(undefined);
	expect(res2).toBe(undefined);
	expect(res3).not.toBe(undefined);
});

test("clipPolygonPolygon overlapping collinear edges, axis-aligned", () => {
	const poly1 = [
		[0, 0],
		[2, 0],
		[2, 1],
		[0, 1],
	];
	const poly2 = [
		[1, 0],
		[3, 0],
		[3, 1],
		[1, 1],
	];
	const res1 = ear.math.clipPolygonPolygon(poly1, poly2);
	testEqualVectorVectors(res1, [
		[1, 1],
		[1, 0],
		[2, 0],
		[2, 1],
	]);
});

test("clipPolygonPolygon overlapping collinear edges, angled edges", () => {
	const poly1 = [
		[2, 0],
		[0, 2],
		[-2, 0],
		[0, -2],
	];
	const poly2 = [
		[1, -1],
		[3, 1],
		[1, 3],
		[-1, 1],
	];
	const res1 = ear.math.clipPolygonPolygon(poly1, poly2);
	testEqualVectorVectors(res1, [
		[-1, 1],
		[1, -1],
		[2, 0],
		[0, 2],
	]);
});

test("clipPolygonPolygon enclosing polygons", () => {
	const poly1 = [
		[0, 0],
		[10, 0],
		[10, 10],
		[0, 10],
	];
	const poly2 = [
		[4, 4],
		[5, 4],
		[5, 5],
		[4, 5],
	];
	const res1 = ear.math.clipPolygonPolygon(poly1, poly2);
	const res2 = ear.math.clipPolygonPolygon(poly2, poly1);
	testEqualVectorVectors(
		[
			[4, 5],
			[4, 4],
			[5, 4],
			[5, 5],
		],
		res1,
	);
	testEqualVectorVectors(
		[
			[4, 4],
			[5, 4],
			[5, 5],
			[4, 5],
		],
		res2,
	);
});

test("clipPolygonPolygon same vertex, edge on vertex", () => {
	// all vertices exist on top of each other
	const poly1 = [
		[0, 0],
		[1, 0],
		[1, 1],
		[0, 1],
	];
	const poly2 = [
		[1, 0],
		[1, 1],
		[0, 1],
	];
	const res1 = ear.math.clipPolygonPolygon(poly1, poly2);
	testEqualVectorVectors(res1, [
		[0, 1],
		[1, 0],
		[1, 1],
	]);

	const poly3 = [
		[3, -2],
		[3, 3],
		[-2, 3],
	];
	const res2 = ear.math.clipPolygonPolygon(poly1, poly3);
	testEqualVectorVectors(res2, [
		[1, 0],
		[1, 1],
		[0, 1],
	]);
});

test("clipPolygonPolygon ensure input parameters did not modify", () => {
	const poly1 = [
		[2, 0],
		[0, 2],
		[-2, 0],
		[0, -2],
	];
	const poly2 = [
		[1, -1],
		[3, 1],
		[1, 3],
		[-1, 1],
	];
	ear.math.clipPolygonPolygon(poly1, poly2);
	ear.math.clipPolygonPolygon(poly2, poly1);
	testEqualVectorVectors(poly1, [
		[2, 0],
		[0, 2],
		[-2, 0],
		[0, -2],
	]);
	testEqualVectorVectors(poly2, [
		[1, -1],
		[3, 1],
		[1, 3],
		[-1, 1],
	]);
});
