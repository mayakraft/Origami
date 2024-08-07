import { expect, test } from "vitest";
import ear from "../src/index.js";

const testEqualVectorVectors = function (a, b) {
	expect(a.length).toBe(b.length);
	a.forEach((_, i) => expect(ear.math.epsilonEqualVectors(a[i], b[i])).toBe(true));
};

test("signedArea", () => {
	expect(
		ear.math.signedArea([
			[1, 0],
			[0, 1],
			[-1, 0],
			[0, -1],
		]),
	).toBeCloseTo(2);
	expect(
		ear.math.signedArea([
			[1, 0],
			[0, 1],
			[-1, 0],
		]),
	).toBeCloseTo(1);
});

test("centroid", () => {
	expect(
		ear.math.centroid([
			[1, 0],
			[0, 1],
			[-1, 0],
			[0, -1],
		])[0],
	).toBeCloseTo(0);
	expect(
		ear.math.centroid([
			[1, 0],
			[0, 1],
			[-1, 0],
			[0, -1],
		])[1],
	).toBeCloseTo(0);
	expect(
		ear.math.centroid([
			[1, 0],
			[0, 1],
			[-1, 0],
		])[0],
	).toBeCloseTo(0);
	expect(
		ear.math.centroid([
			[1, 0],
			[0, 1],
			[-1, 0],
		])[1],
	).toBeCloseTo(1 / 3);
});

test("boundingBox", () => {
	const box = ear.math.boundingBox([
		[1, 0],
		[0, 1],
		[-1, 0],
		[0, -1],
	]);
	expect(box.min[0]).toBe(-1);
	expect(box.min[1]).toBe(-1);
	expect(box.span[0]).toBe(2);
	expect(box.span[1]).toBe(2);
	const badBox = ear.math.boundingBox();
	expect(badBox).toBe(undefined);
});

test("makePolygonCircumradius", () => {
	expect(ear.math.makePolygonCircumradius().length).toBe(3);
	const vert_square = ear.math.makePolygonCircumradius(4);
	expect(vert_square[0][0]).toBe(1);
	expect(vert_square[0][1]).toBe(0);
	const vert_square_2 = ear.math.makePolygonCircumradius(4, 2);
	expect(vert_square_2[0][0]).toBe(2);
	expect(vert_square_2[0][1]).toBe(0);

	const tri1 = ear.math.makePolygonCircumradius(3);
	const tri2 = ear.math.makePolygonCircumradius(3, 2);
	// first coord (1,0)
	expect(tri1[0][0]).toBeCloseTo(1);
	expect(tri1[0][1]).toBeCloseTo(0);
	expect(tri1[1][0]).toBeCloseTo(-0.5);
	expect(tri1[1][1]).toBeCloseTo(Math.sqrt(3) / 2);
	expect(tri1[2][0]).toBeCloseTo(-0.5);
	expect(tri1[2][1]).toBeCloseTo(-Math.sqrt(3) / 2);
	// 2
	expect(tri2[0][0]).toBeCloseTo(2);
	expect(tri2[1][0]).toBeCloseTo(-1);
});

test("make regular polygon side aligned", () => {
	const tri = ear.math.makePolygonCircumradiusSide();
	expect(tri.length).toBe(3);
	const square = ear.math.makePolygonCircumradiusSide(4);
	expect(square[0][0]).toBeCloseTo(Math.sqrt(2) / 2);
	const square2 = ear.math.makePolygonCircumradiusSide(4, 2);
	expect(square2[0][0]).toBeCloseTo(Math.sqrt(2));
});

test("make regular polygon inradius", () => {
	const tri = ear.math.makePolygonInradius();
	expect(tri.length).toBe(3);
	const square = ear.math.makePolygonInradius(4);
	expect(square[0][0]).toBeCloseTo(Math.sqrt(2));
	expect(square[0][1]).toBeCloseTo(0);
});

test("make_polygon_inradius_s", () => {
	const tri = ear.math.makePolygonInradiusSide();
	expect(tri.length).toBe(3);
	const square = ear.math.makePolygonInradiusSide(4);
	expect(square[0][0]).toBeCloseTo(1);
	const square2 = ear.math.makePolygonInradiusSide(4, 2);
	expect(square2[0][0]).toBeCloseTo(2);
});

test("make_polygon_side_length", () => {
	const tri = ear.math.makePolygonSideLength();
	expect(tri.length).toBe(3);
	const square = ear.math.makePolygonSideLength(4);
	expect(square[0][0]).toBeCloseTo(Math.sqrt(2) / 2);
	expect(square[0][1]).toBeCloseTo(0);
	const square2 = ear.math.makePolygonSideLength(4, 2);
	expect(square2[0][0]).toBeCloseTo(Math.sqrt(2));
	expect(square2[0][1]).toBeCloseTo(0);
});

test("make_polygon_side_length_s", () => {
	const tri = ear.math.makePolygonSideLengthSide();
	expect(tri.length).toBe(3);
	const square = ear.math.makePolygonSideLengthSide(4);
	expect(square[0][0]).toBeCloseTo(0.5);
	const square2 = ear.math.makePolygonSideLengthSide(4, 2);
	expect(square2[0][0]).toBeCloseTo(1);
});

test("makePolygonNonCollinear", () => {
	const polygon = [
		[0, 0],
		[1, 0],
		[2, 0],
		[2, 2],
		[0, 2],
	];
	const result = ear.math.makePolygonNonCollinear(polygon);
	testEqualVectorVectors(
		[
			[0, 0],
			[2, 0],
			[2, 2],
			[0, 2],
		],
		result,
	);
});
