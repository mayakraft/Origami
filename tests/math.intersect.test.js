import { expect, test } from "vitest";
import ear from "../src/index.js";

test("intersectLineLine include exclude", () => {
	const res0 = ear.math.intersectLineLine(
		{ vector: [0, 1], origin: [1, 0] },
		{ vector: [1, 0], origin: [0, 1] },
	).point;
	const res1 = ear.math.intersectLineLine(
		{ vector: [0, 1], origin: [1, 0] },
		{ vector: [1, 0], origin: [0, 1] },
		ear.math.includeS,
		ear.math.includeS,
	).point;
	const res2 = ear.math.intersectLineLine(
		{ vector: [0, 1], origin: [1, 0] },
		{ vector: [1, 0], origin: [0, 1] },
		ear.math.excludeS,
		ear.math.excludeS,
	).point;
	expect(res0).not.toBe(undefined);
	expect(res1).not.toBe(undefined);
	expect(res2).toBe(undefined);
});

test("collinear line intersections", () => {
	const intersect = (a, b, c, d, ...args) =>
		ear.math.intersectLineLine(
			{ vector: a, origin: b },
			{ vector: c, origin: d },
			...args,
		).point;
	[
		// INCLUDE horizontal
		intersect([1, 0], [2, 2], [1, 0], [-1, 2], ear.math.includeL, ear.math.includeL),
		intersect([1, 0], [2, 2], [-1, 0], [-1, 2], ear.math.includeL, ear.math.includeL),
		intersect([-1, 0], [2, 2], [1, 0], [-1, 2], ear.math.includeL, ear.math.includeL),
		// INCLUDE vertical
		intersect([0, 1], [3, 0], [0, 1], [3, 3], ear.math.includeL, ear.math.includeL),
		intersect([0, 1], [3, 0], [0, -1], [3, 3], ear.math.includeL, ear.math.includeL),
		intersect([0, -1], [3, 0], [0, 1], [3, 3], ear.math.includeL, ear.math.includeL),
		// INCLUDE diagonal
		intersect([1, 1], [2, 2], [1, 1], [-1, -1], ear.math.includeL, ear.math.includeL),
		intersect([-1, -1], [2, 2], [1, 1], [-1, -1], ear.math.includeL, ear.math.includeL),
		intersect([1, 1], [2, 2], [-1, -1], [-1, -1], ear.math.includeL, ear.math.includeL),
		// EXCLUDE horizontal
		intersect([1, 0], [2, 2], [1, 0], [-1, 2], ear.math.excludeL, ear.math.excludeL),
		intersect([1, 0], [2, 2], [-1, 0], [-1, 2], ear.math.excludeL, ear.math.excludeL),
		intersect([-1, 0], [2, 2], [1, 0], [-1, 2], ear.math.excludeL, ear.math.excludeL),
		// EXCLUDE vertical
		intersect([0, 1], [3, 0], [0, 1], [3, 3], ear.math.excludeL, ear.math.excludeL),
		intersect([0, 1], [3, 0], [0, -1], [3, 3], ear.math.excludeL, ear.math.excludeL),
		intersect([0, -1], [3, 0], [0, 1], [3, 3], ear.math.excludeL, ear.math.excludeL),
		// EXCLUDE diagonal
		intersect([1, 1], [2, 2], [1, 1], [-1, -1], ear.math.excludeL, ear.math.excludeL),
		intersect([-1, -1], [2, 2], [1, 1], [-1, -1], ear.math.excludeL, ear.math.excludeL),
		intersect([1, 1], [2, 2], [-1, -1], [-1, -1], ear.math.excludeL, ear.math.excludeL),
	].forEach((res) => expect(res).toBe(undefined));
});

test("collinear ray intersections", () => {
	const intersect = (a, b, c, d, ...args) =>
		ear.math.intersectLineLine(
			{ vector: a, origin: b },
			{ vector: c, origin: d },
			...args,
		).point;
	[
		// INCLUDE horizontal
		intersect([1, 0], [2, 2], [1, 0], [-1, 2], ear.math.includeR, ear.math.includeR),
		intersect([1, 0], [2, 2], [-1, 0], [-1, 2], ear.math.includeR, ear.math.includeR),
		intersect([-1, 0], [2, 2], [1, 0], [-1, 2], ear.math.includeR, ear.math.includeR),
		// INCLUDE vertical
		intersect([0, 1], [3, 0], [0, 1], [3, 3], ear.math.includeR, ear.math.includeR),
		intersect([0, 1], [3, 0], [0, -1], [3, 3], ear.math.includeR, ear.math.includeR),
		intersect([0, -1], [3, 0], [0, 1], [3, 3], ear.math.includeR, ear.math.includeR),
		// INCLUDE diagonal
		intersect([1, 1], [2, 2], [1, 1], [-1, -1], ear.math.includeR, ear.math.includeR),
		intersect([-1, -1], [2, 2], [1, 1], [-1, -1], ear.math.includeR, ear.math.includeR),
		intersect([1, 1], [2, 2], [-1, -1], [-1, -1], ear.math.includeR, ear.math.includeR),
		// EXCLUDE horizontal
		intersect([1, 0], [2, 2], [1, 0], [-1, 2], ear.math.excludeR, ear.math.excludeR),
		intersect([1, 0], [2, 2], [-1, 0], [-1, 2], ear.math.excludeR, ear.math.excludeR),
		intersect([-1, 0], [2, 2], [1, 0], [-1, 2], ear.math.excludeR, ear.math.excludeR),
		// EXCLUDE vertical
		intersect([0, 1], [3, 0], [0, 1], [3, 3], ear.math.excludeR, ear.math.excludeR),
		intersect([0, 1], [3, 0], [0, -1], [3, 3], ear.math.excludeR, ear.math.excludeR),
		intersect([0, -1], [3, 0], [0, 1], [3, 3], ear.math.excludeR, ear.math.excludeR),
		// EXCLUDE diagonal
		intersect([1, 1], [2, 2], [1, 1], [-1, -1], ear.math.excludeR, ear.math.excludeR),
		intersect([-1, -1], [2, 2], [1, 1], [-1, -1], ear.math.excludeR, ear.math.excludeR),
		intersect([1, 1], [2, 2], [-1, -1], [-1, -1], ear.math.excludeR, ear.math.excludeR),
	].forEach((res) => expect(res).toBe(undefined));
});

test("collinear segment intersections", () => {
	const intersect = (a, b, c, d, ...args) =>
		ear.math.intersectLineLine(
			{ vector: a, origin: b },
			{ vector: c, origin: d },
			...args,
		).point;
	[
		// INCLUDE horizontal
		intersect([1, 0], [2, 2], [1, 0], [-1, 2], ear.math.includeS, ear.math.includeS),
		intersect([1, 0], [2, 2], [-1, 0], [-1, 2], ear.math.includeS, ear.math.includeS),
		intersect([-1, 0], [2, 2], [1, 0], [-1, 2], ear.math.includeS, ear.math.includeS),
		// INCLUDE vertical
		intersect([0, 1], [3, 0], [0, 1], [3, 3], ear.math.includeS, ear.math.includeS),
		intersect([0, 1], [3, 0], [0, -1], [3, 3], ear.math.includeS, ear.math.includeS),
		intersect([0, -1], [3, 0], [0, 1], [3, 3], ear.math.includeS, ear.math.includeS),
		// INCLUDE diagonal
		intersect([1, 1], [2, 2], [1, 1], [-1, -1], ear.math.includeS, ear.math.includeS),
		intersect([-1, -1], [2, 2], [1, 1], [-1, -1], ear.math.includeS, ear.math.includeS),
		intersect([1, 1], [2, 2], [-1, -1], [-1, -1], ear.math.includeS, ear.math.includeS),
		// EXCLUDE horizontal
		intersect([1, 0], [2, 2], [1, 0], [-1, 2], ear.math.excludeS, ear.math.excludeS),
		intersect([1, 0], [2, 2], [-1, 0], [-1, 2], ear.math.excludeS, ear.math.excludeS),
		intersect([-1, 0], [2, 2], [1, 0], [-1, 2], ear.math.excludeS, ear.math.excludeS),
		// EXCLUDE vertical
		intersect([0, 1], [3, 0], [0, 1], [3, 3], ear.math.excludeS, ear.math.excludeS),
		intersect([0, 1], [3, 0], [0, -1], [3, 3], ear.math.excludeS, ear.math.excludeS),
		intersect([0, -1], [3, 0], [0, 1], [3, 3], ear.math.excludeS, ear.math.excludeS),
		// EXCLUDE diagonal
		intersect([1, 1], [2, 2], [1, 1], [-1, -1], ear.math.excludeS, ear.math.excludeS),
		intersect([-1, -1], [2, 2], [1, 1], [-1, -1], ear.math.excludeS, ear.math.excludeS),
		intersect([1, 1], [2, 2], [-1, -1], [-1, -1], ear.math.excludeS, ear.math.excludeS),
	].forEach((res) => expect(res).toBe(undefined));
});

test("collinear segment intersections, types not core", () => {
	const intersect = (a, b) => ear.math.intersectLineLine(a, b).point;
	[
		// horizontal
		intersect(
			ear.math.pointsToLine([0, 2], [2, 2]),
			ear.math.pointsToLine([-1, 2], [10, 2]),
		),
		intersect(
			ear.math.pointsToLine([0, 2], [2, 2]),
			ear.math.pointsToLine([10, 2], [-1, 2]),
		),
		// vertical
		intersect(
			ear.math.pointsToLine([2, 0], [2, 2]),
			ear.math.pointsToLine([2, -1], [2, 10]),
		),
		intersect(
			ear.math.pointsToLine([2, 0], [2, 2]),
			ear.math.pointsToLine([2, 10], [2, -1]),
		),
		// diagonal
		intersect(
			ear.math.pointsToLine([0, 0], [2, 2]),
			ear.math.pointsToLine([-1, -1], [5, 5]),
		),
		intersect(
			ear.math.pointsToLine([0, 0], [2, 2]),
			ear.math.pointsToLine([5, 5], [-1, -1]),
		),
	].forEach((res) => expect(res).toBe(undefined));
});

test("clip polygon polygon, same polygon", () => {
	// all of the "b" cases are flipped clockwise and should return no solution
	// same polygon
	const res1 = ear.math.clipPolygonPolygon(
		[
			[60, 10],
			[50, 50],
			[20, 20],
		],
		[
			[50, 50],
			[20, 20],
			[60, 10],
		],
	);
	expect(res1.length).toBe(3);

	const res2 = ear.math.clipPolygonPolygon(
		[
			[50, 50],
			[25, 25],
			[50, 0],
		],
		[
			[50, 50],
			[25, 25],
			[50, 0],
		],
	);
	expect(res2.length).toBe(3);

	const res2b = ear.math.clipPolygonPolygon(
		[
			[50, 0],
			[25, 25],
			[50, 50],
		],
		[
			[50, 0],
			[25, 25],
			[50, 50],
		],
	);
	expect(res2b).toBe(undefined);

	// same polygon, array rotated
	const res3 = ear.math.clipPolygonPolygon(
		[
			[50, 50],
			[25, 25],
			[50, 0],
		],
		[
			[25, 25],
			[50, 0],
			[50, 50],
		],
	);
	expect(res3.length).toBe(3);

	const res3b = ear.math.clipPolygonPolygon(
		[
			[50, 0],
			[25, 25],
			[50, 50],
		],
		[
			[50, 50],
			[50, 0],
			[25, 25],
		],
	);
	expect(res3b).toBe(undefined);
});

test("polygon polygon, edge aligned", () => {
	// edge aligned

	const poly3 = [
		[40, 40],
		[100, 40],
		[80, 80],
	];
	const poly4 = [
		[100, 40],
		[40, 40],
		[80, 0],
	];
	const res2 = ear.math.clipPolygonPolygon(poly3, poly4);
	expect(res2).toBe(undefined);

	const poly5 = [
		[40, 40],
		[100, 40],
		[80, 80],
	];
	const poly6 = [
		[90, 40],
		[50, 40],
		[80, 0],
	];
	const res3 = ear.math.clipPolygonPolygon(poly5, poly6);
	expect(res3).toBe(undefined);

	const poly7 = [
		[40, 40],
		[100, 40],
		[80, 80],
	];
	const poly8 = [
		[200, 40],
		[50, 40],
		[80, 0],
	];
	const res4 = ear.math.clipPolygonPolygon(poly7, poly8);
	expect(res4).toBe(undefined);

	const poly9 = [
		[40, 40],
		[100, 40],
		[80, 80],
	];
	const poly10 = [
		[200, 40],
		[20, 40],
		[80, 0],
	];
	const res5 = ear.math.clipPolygonPolygon(poly9, poly10);
	expect(res5).toBe(undefined);
});

test("polygon polygon, epsilon", () => {
	// now with epsilon
	const ep = 1e-10;
	const poly11 = [
		[40, 40 - ep],
		[100, 40 - ep],
		[80, 80],
	];
	const poly12 = [
		[100, 40],
		[40, 40],
		[80, 0],
	];
	const res6 = ear.math.clipPolygonPolygon(poly11, poly12);
	expect(res6).toBe(undefined);
	const res7 = ear.math.clipPolygonPolygon(poly12, poly11);
	expect(res7).toBe(undefined);

	const poly13 = [
		[60, 10],
		[50, 50],
		[20, 20],
	];
	const poly14 = [
		[50 + ep, 50 + ep],
		[20, 20],
		[60, 10],
	];
	const res8 = ear.math.clipPolygonPolygon(poly13, poly14);
	expect(res8.length).toBe(3);
	const res9 = ear.math.clipPolygonPolygon(poly14, poly13);
	expect(res9.length).toBe(3);

	const poly15 = [
		[60, 10],
		[50, 50],
		[20, 20],
	];
	const poly16 = [
		[50 - ep, 50 - ep],
		[20, 20],
		[60, 10],
	];
	const res10 = ear.math.clipPolygonPolygon(poly15, poly16);
	expect(res10.length).toBe(3);
	const res11 = ear.math.clipPolygonPolygon(poly16, poly15);
	expect(res11.length).toBe(3);
});

test("polygon polygon collinear edge", () => {
	// these two polygons overlap and have 2 overlapping edges
	const poly1clock = [
		[0, 0],
		[-1, 1],
		[0, 2],
		[2, 0],
	];
	const poly2clock = [
		[0, 2],
		[1, 1],
		[1, -1],
		[-1, 1],
	];
	const poly1counter = poly1clock.slice().reverse();
	const poly2counter = poly2clock.slice().reverse();

	// the only one guaranteed to work
	expect(ear.math.clipPolygonPolygon(poly1counter, poly2counter)).not.toBeUndefined();
	expect(ear.math.clipPolygonPolygon(poly2counter, poly1counter)).not.toBeUndefined();

	// all of these have undefined behavior
	expect(ear.math.clipPolygonPolygon(poly1clock, poly2clock)).toBeUndefined();
	expect(ear.math.clipPolygonPolygon(poly2clock, poly1clock)).toBeUndefined();

	expect(ear.math.clipPolygonPolygon(poly1clock, poly2counter)).not.toBeUndefined();
	expect(ear.math.clipPolygonPolygon(poly2counter, poly1clock)).toBeUndefined();

	expect(ear.math.clipPolygonPolygon(poly1counter, poly2clock)).toBeUndefined();
	expect(ear.math.clipPolygonPolygon(poly2clock, poly1counter)).not.toBeUndefined();
});

test("intersect lines", () => {
	const clipLine = ear.math.intersectCircleLine(
		{ radius: 1, origin: [0, 0] },
		{ vector: [0, 1], origin: [0.5, 0] },
	);
	const shouldBeLine = [
		[0.5, -Math.sqrt(3) / 2],
		[0.5, Math.sqrt(3) / 2],
	];
	ear.math.epsilonEqualVectors(clipLine[0], shouldBeLine[0]);
	ear.math.epsilonEqualVectors(clipLine[1], shouldBeLine[1]);
	// no intersect
	expect(
		ear.math.intersectCircleLine(
			{ radius: 1, origin: [2, 2] },
			{ vector: [0, 1], origin: [10, 0] },
		),
	).toBe(undefined);
	// tangent
	const tangent = ear.math.intersectCircleLine(
		{ radius: 1, origin: [2, 0] },
		{ vector: [0, 1], origin: [3, 0] },
	);
	expect(tangent[0][0]).toBe(3);
	expect(tangent[0][1]).toBe(0);

	const shouldBeRay = [Math.SQRT1_2, Math.SQRT1_2];
	const clipRay = ear.math.intersectCircleLine(
		{ radius: 1, origin: [0, 0] },
		{ vector: [0.1, 0.1], origin: [0, 0] },
		ear.math.include,
		ear.math.includeR,
	);
	ear.math.epsilonEqualVectors(shouldBeRay, clipRay[0]);

	const shouldBeSeg = [Math.SQRT1_2, Math.SQRT1_2];
	const clipSeg = ear.math.intersectCircleLine(
		{ radius: 1, origin: [0, 0] },
		{ vector: [10, 10], origin: [0, 0] },
		ear.math.include,
		ear.math.includeS,
	);
	ear.math.epsilonEqualVectors(shouldBeSeg, clipSeg[0]);
});
