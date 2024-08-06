import { expect, test } from "vitest";
import ear from "../src/index.js";

// const {
// 	exclude,
// 	include,
// 	includeL,
// 	excludeL,
// 	includeR,
// 	excludeR,
// 	includeS,
// 	excludeS,
// } = math;

const clip_line_in_convex_poly_inclusive = function () {
	return ear.math.clipLineConvexPolygon(
		...arguments,
		ear.math.include,
		ear.math.includeL,
	);
};
const clip_line_in_convex_poly_exclusive = function () {
	return ear.math.clipLineConvexPolygon(
		...arguments,
		ear.math.exclude,
		ear.math.excludeL,
	);
};
const clip_ray_in_convex_poly_inclusive = function () {
	return ear.math.clipLineConvexPolygon(
		...arguments,
		ear.math.include,
		ear.math.includeR,
	);
};
const clip_ray_in_convex_poly_exclusive = function () {
	return ear.math.clipLineConvexPolygon(
		...arguments,
		ear.math.exclude,
		ear.math.excludeR,
	);
};
const clip_segment_in_convex_poly_inclusive = function (poly, s0, s1) {
	const vector = [s1[0] - s0[0], s1[1] - s0[1]];
	return ear.math.clipLineConvexPolygon(
		poly,
		{ vector, origin: s0 },
		ear.math.include,
		ear.math.includeS,
	);
};
const clip_segment_in_convex_poly_exclusive = function (poly, s0, s1) {
	const vector = [s1[0] - s0[0], s1[1] - s0[1]];
	return ear.math.clipLineConvexPolygon(
		poly,
		{ vector, origin: s0 },
		ear.math.exclude,
		ear.math.excludeS,
	);
};

test("collinear line", () => {
	// all inclusive cases will return a segment with unique endpoints
	// all exclusive cases will return undefined
	const rect = [
		[0, 0],
		[1, 0],
		[1, 1],
		[0, 1],
	];
	const lineHoriz1 = { vector: [1, 0], origin: [0.5, 0] };
	const lineHoriz2 = { vector: [1, 0], origin: [0.5, 1] };
	const lineVert1 = { vector: [0, 1], origin: [0, 0.5] };
	const lineVert2 = { vector: [0, 1], origin: [1, 0.5] };
	const result1 = ear.math.clipLineConvexPolygon(
		rect,
		lineHoriz1,
		ear.math.include,
		ear.math.includeL,
	);
	const result2 = ear.math.clipLineConvexPolygon(
		rect,
		lineHoriz2,
		ear.math.include,
		ear.math.includeL,
	);
	const result3 = ear.math.clipLineConvexPolygon(
		rect,
		lineVert1,
		ear.math.include,
		ear.math.includeL,
	);
	const result4 = ear.math.clipLineConvexPolygon(
		rect,
		lineVert2,
		ear.math.include,
		ear.math.includeL,
	);
	const result5 = ear.math.clipLineConvexPolygon(
		rect,
		lineHoriz1,
		ear.math.exclude,
		ear.math.excludeL,
	);
	const result6 = ear.math.clipLineConvexPolygon(
		rect,
		lineHoriz2,
		ear.math.exclude,
		ear.math.excludeL,
	);
	const result7 = ear.math.clipLineConvexPolygon(
		rect,
		lineVert1,
		ear.math.exclude,
		ear.math.excludeL,
	);
	const result8 = ear.math.clipLineConvexPolygon(
		rect,
		lineVert2,
		ear.math.exclude,
		ear.math.excludeL,
	);
	expect(result1.length).toBe(2);
	expect(result2.length).toBe(2);
	expect(result3.length).toBe(2);
	expect(result4.length).toBe(2);
	expect(result5).toBe(undefined);
	expect(result6).toBe(undefined);
	expect(result7).toBe(undefined);
	expect(result8).toBe(undefined);
	expect(JSON.stringify(result1[0])).not.toBe(JSON.stringify(result1[1]));
	expect(JSON.stringify(result2[0])).not.toBe(JSON.stringify(result2[1]));
	expect(JSON.stringify(result3[0])).not.toBe(JSON.stringify(result3[1]));
	expect(JSON.stringify(result4[0])).not.toBe(JSON.stringify(result4[1]));
});

test("vertex-incident line", () => {
	// all cases will return undefined
	const quad = [
		[1, 0],
		[0, 1],
		[-1, 0],
		[0, -1],
	];
	const lineHoriz1 = { vector: [1, 0], origin: [-1, 1] };
	const lineHoriz2 = { vector: [1, 0], origin: [-1, -1] };
	const lineVert1 = { vector: [0, 1], origin: [-1, -1] };
	const lineVert2 = { vector: [0, 1], origin: [1, -1] };
	const results = [
		ear.math.clipLineConvexPolygon(quad, lineHoriz1, ear.math.include, ear.math.includeL),
		ear.math.clipLineConvexPolygon(quad, lineHoriz2, ear.math.include, ear.math.includeL),
		ear.math.clipLineConvexPolygon(quad, lineVert1, ear.math.include, ear.math.includeL),
		ear.math.clipLineConvexPolygon(quad, lineVert2, ear.math.include, ear.math.includeL),
		ear.math.clipLineConvexPolygon(quad, lineHoriz1, ear.math.exclude, ear.math.excludeL),
		ear.math.clipLineConvexPolygon(quad, lineHoriz2, ear.math.exclude, ear.math.excludeL),
		ear.math.clipLineConvexPolygon(quad, lineVert1, ear.math.exclude, ear.math.excludeL),
		ear.math.clipLineConvexPolygon(quad, lineVert2, ear.math.exclude, ear.math.excludeL),
	];
	results.forEach((res) => expect(res).toBe(undefined));
});

test("collinear core, segment", () => {
	const rect = [
		[0, 0],
		[1, 0],
		[1, 1],
		[0, 1],
	];
	const segHoriz1 = { vector: [1, 0], origin: [0.5, 0] };
	const segHoriz2 = { vector: [1, 0], origin: [-0.5, 0] };
	const segVert1 = { vector: [0, 1], origin: [0, 0.5] };
	const segVert2 = { vector: [0, 1], origin: [1, 0.5] };
	const result1 = ear.math.clipLineConvexPolygon(
		rect,
		segHoriz1,
		ear.math.include,
		ear.math.includeS,
	);
	const result2 = ear.math.clipLineConvexPolygon(
		rect,
		segHoriz2,
		ear.math.include,
		ear.math.includeS,
	);
	const result3 = ear.math.clipLineConvexPolygon(
		rect,
		segVert1,
		ear.math.include,
		ear.math.includeS,
	);
	const result4 = ear.math.clipLineConvexPolygon(
		rect,
		segVert2,
		ear.math.include,
		ear.math.includeS,
	);
	const result5 = ear.math.clipLineConvexPolygon(
		rect,
		segHoriz1,
		ear.math.exclude,
		ear.math.excludeS,
	);
	const result6 = ear.math.clipLineConvexPolygon(
		rect,
		segHoriz2,
		ear.math.exclude,
		ear.math.excludeS,
	);
	const result7 = ear.math.clipLineConvexPolygon(
		rect,
		segVert1,
		ear.math.exclude,
		ear.math.excludeS,
	);
	const result8 = ear.math.clipLineConvexPolygon(
		rect,
		segVert2,
		ear.math.exclude,
		ear.math.excludeS,
	);
	expect(result1.length).toBe(2);
	expect(result2.length).toBe(2);
	expect(result3.length).toBe(2);
	expect(result4.length).toBe(2);
	expect(result5).toBe(undefined);
	expect(result6).toBe(undefined);
	expect(result7).toBe(undefined);
	expect(result8).toBe(undefined);
	expect(JSON.stringify(result1[0])).not.toBe(JSON.stringify(result1[1]));
	expect(JSON.stringify(result2[0])).not.toBe(JSON.stringify(result2[1]));
	expect(JSON.stringify(result3[0])).not.toBe(JSON.stringify(result3[1]));
	expect(JSON.stringify(result4[0])).not.toBe(JSON.stringify(result4[1]));
	expect(result1[0][0]).toBe(0.5);
	expect(result1[0][1]).toBe(0);
	expect(result1[1][0]).toBe(1);
	expect(result1[1][1]).toBe(0);
	expect(result2[0][0]).toBe(0);
	expect(result2[0][1]).toBe(0);
	expect(result2[1][0]).toBe(0.5);
	expect(result2[1][1]).toBe(0);
	// remember these are VECTORS, ORIGIN
	const segHoriz3 = { vector: [0.5, 0], origin: [0.25, 0] };
	const segVert3 = { vector: [0, 2], origin: [0, -0.5] };
	const result9 = ear.math.clipLineConvexPolygon(
		rect,
		segHoriz3,
		ear.math.include,
		ear.math.includeS,
	);
	const result10 = ear.math.clipLineConvexPolygon(
		rect,
		segVert3,
		ear.math.include,
		ear.math.includeS,
	);
	const result11 = ear.math.clipLineConvexPolygon(
		rect,
		segHoriz3,
		ear.math.exclude,
		ear.math.excludeS,
	);
	const result12 = ear.math.clipLineConvexPolygon(
		rect,
		segVert3,
		ear.math.exclude,
		ear.math.excludeS,
	);
	expect(result9[0][0]).toBe(0.25);
	expect(result9[0][1]).toBe(0);
	expect(result9[1][0]).toBe(0.75);
	expect(result9[1][1]).toBe(0);
	expect(result10[0][0]).toBe(0);
	expect(result10[0][1]).toBe(0);
	expect(result10[1][0]).toBe(0);
	expect(result10[1][1]).toBe(1);
});

test("vertex-incident segment", () => {
	// all cases will return undefined
	const quad = [
		[1, 0],
		[0, 1],
		[-1, 0],
		[0, -1],
	];
	const horiz1 = { vector: [1, 0], origin: [-1, 1] };
	const horiz2 = { vector: [1, 0], origin: [-1, -1] };
	const vert1 = { vector: [0, 1], origin: [-1, -1] };
	const vert2 = { vector: [0, 1], origin: [1, -1] };
	const results = [
		ear.math.clipLineConvexPolygon(quad, horiz1, ear.math.include, ear.math.includeS),
		ear.math.clipLineConvexPolygon(quad, horiz2, ear.math.include, ear.math.includeS),
		ear.math.clipLineConvexPolygon(quad, vert1, ear.math.include, ear.math.includeS),
		ear.math.clipLineConvexPolygon(quad, vert2, ear.math.include, ear.math.includeS),
		ear.math.clipLineConvexPolygon(quad, horiz1, ear.math.exclude, ear.math.excludeS),
		ear.math.clipLineConvexPolygon(quad, horiz2, ear.math.exclude, ear.math.excludeS),
		ear.math.clipLineConvexPolygon(quad, vert1, ear.math.exclude, ear.math.excludeS),
		ear.math.clipLineConvexPolygon(quad, vert2, ear.math.exclude, ear.math.excludeS),
	];
	results.forEach((res) => expect(res).toBe(undefined));
});

test("collinear core, ray", () => {
	const rect = [
		[0, 0],
		[1, 0],
		[1, 1],
		[0, 1],
	];
	const rayHoriz1 = { vector: [1, 0], origin: [0.5, 0] };
	const rayHoriz2 = { vector: [1, 0], origin: [0.5, 1] };
	const rayVert1 = { vector: [0, 1], origin: [0, 0.5] };
	const rayVert2 = { vector: [0, 1], origin: [1, 0.5] };
	const result1 = ear.math.clipLineConvexPolygon(
		rect,
		rayHoriz1,
		ear.math.include,
		ear.math.includeR,
	);
	const result2 = ear.math.clipLineConvexPolygon(
		rect,
		rayHoriz2,
		ear.math.include,
		ear.math.includeR,
	);
	const result3 = ear.math.clipLineConvexPolygon(
		rect,
		rayVert1,
		ear.math.include,
		ear.math.includeR,
	);
	const result4 = ear.math.clipLineConvexPolygon(
		rect,
		rayVert2,
		ear.math.include,
		ear.math.includeR,
	);
	const result5 = ear.math.clipLineConvexPolygon(
		rect,
		rayHoriz1,
		ear.math.exclude,
		ear.math.excludeR,
	);
	const result6 = ear.math.clipLineConvexPolygon(
		rect,
		rayHoriz2,
		ear.math.exclude,
		ear.math.excludeR,
	);
	const result7 = ear.math.clipLineConvexPolygon(
		rect,
		rayVert1,
		ear.math.exclude,
		ear.math.excludeR,
	);
	const result8 = ear.math.clipLineConvexPolygon(
		rect,
		rayVert2,
		ear.math.exclude,
		ear.math.excludeR,
	);
	expect(result1.length).toBe(2);
	expect(result2.length).toBe(2);
	expect(result3.length).toBe(2);
	expect(result4.length).toBe(2);
	expect(result5).toBe(undefined);
	expect(result6).toBe(undefined);
	expect(result7).toBe(undefined);
	expect(result8).toBe(undefined);
	expect(JSON.stringify(result1[0])).not.toBe(JSON.stringify(result1[1]));
	expect(JSON.stringify(result2[0])).not.toBe(JSON.stringify(result2[1]));
	expect(JSON.stringify(result3[0])).not.toBe(JSON.stringify(result3[1]));
	expect(JSON.stringify(result4[0])).not.toBe(JSON.stringify(result4[1]));
});

test("vertex-incident ray", () => {
	// all cases will return undefined
	const quad = [
		[1, 0],
		[0, 1],
		[-1, 0],
		[0, -1],
	];
	const horiz1 = { vector: [1, 0], origin: [-1, 1] };
	const horiz2 = { vector: [1, 0], origin: [-1, -1] };
	const vert1 = { vector: [0, 1], origin: [-1, -1] };
	const vert2 = { vector: [0, 1], origin: [1, -1] };
	const results = [
		ear.math.clipLineConvexPolygon(quad, horiz1, ear.math.include, ear.math.includeR),
		ear.math.clipLineConvexPolygon(quad, horiz2, ear.math.include, ear.math.includeR),
		ear.math.clipLineConvexPolygon(quad, vert1, ear.math.include, ear.math.includeR),
		ear.math.clipLineConvexPolygon(quad, vert2, ear.math.include, ear.math.includeR),
		ear.math.clipLineConvexPolygon(quad, horiz1, ear.math.exclude, ear.math.excludeR),
		ear.math.clipLineConvexPolygon(quad, horiz2, ear.math.exclude, ear.math.excludeR),
		ear.math.clipLineConvexPolygon(quad, vert1, ear.math.exclude, ear.math.excludeR),
		ear.math.clipLineConvexPolygon(quad, vert2, ear.math.exclude, ear.math.excludeR),
	];
	results.forEach((res) => expect(res).toBe(undefined));
});

test("collinear core, segment", () => {
	const rect = [
		[0, 0],
		[1, 0],
		[1, 1],
		[0, 1],
	];
	const segHoriz1 = [
		[1, 0],
		[0.5, 0],
	];
	const segHoriz2 = [
		[1, 0],
		[0.5, 1],
	];
	const segVert1 = [
		[0, 1],
		[0, 0.5],
	];
	const segVert2 = [
		[0, 1],
		[1, 0.5],
	];
	const result1 = clip_segment_in_convex_poly_exclusive(rect, ...segHoriz1);
	const result2 = clip_segment_in_convex_poly_exclusive(rect, ...segHoriz2);
	const result3 = clip_segment_in_convex_poly_exclusive(rect, ...segVert1);
	const result4 = clip_segment_in_convex_poly_exclusive(rect, ...segVert2);
});

test("collinear core, segment, spanning multiple points", () => {
	const poly = [
		[0, 0],
		[5, 0],
		[5, 1],
		[5, 2],
		[5, 3],
		[5, 4],
		[5, 5],
		[0, 5],
	];
	const seg = [
		[5, -1],
		[5, 6],
	];
	const res = ear.math.clipLineConvexPolygon(
		poly,
		{ vector: ear.math.subtract(seg[1], seg[0]), origin: seg[0] },
		ear.math.include,
		ear.math.includeS,
	);
	expect(res[0][0]).toBe(5);
	expect(res[0][1]).toBe(0);
	expect(res[1][0]).toBe(5);
	expect(res[1][1]).toBe(5);
});

test("collinear core, segment, spanning multiple points, inside", () => {
	const poly = [
		[0, 0],
		[5, 0],
		[5, 1],
		[5, 2],
		[5, 3],
		[5, 4],
		[5, 5],
		[0, 5],
	];
	const seg = [
		[5, 0.5],
		[5, 4.5],
	];
	const res = clip_segment_in_convex_poly_inclusive(poly, ...seg);
	expect(res[0][0]).toBe(5);
	expect(res[0][1]).toBe(0.5);
	expect(res[1][0]).toBe(5);
	expect(res[1][1]).toBe(4.5);
});
