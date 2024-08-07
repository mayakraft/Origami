import { expect, test } from "vitest";
import ear from "../src/index.js";

const t = 0.38268343236509;
const n = 0.92387953251129;
const s = Math.SQRT1_2;

// [
// 	{u:[ 0, 1], d:0},
// 	{u:[-t, n], d:0},
// 	{u:[-s, s], d:0},
// 	{u:[-n, t], d:0},
// 	{u:[-1, 0], d:0},
// 	{u:[-n,-t], d:0},
// 	{u:[-s,-s], d:0},
// 	{u:[-t,-n], d:0},
// 	{u:[ 0,-1], d:0},
// 	{u:[ t,-n], d:0},
// 	{u:[ s,-s], d:0},
// 	{u:[ n,-t], d:0},
// 	{u:[ 1, 0], d:0},
// 	{u:[ n, t], d:0},
// 	{u:[ s, s], d:0},
// 	{u:[ t, n], d:0},
// ]
test("16 angles of lines, through the origin", () => {
	const angles = Array.from(Array(16)).map((_, i) => ((Math.PI * 2) / 16) * i);
	const vectors = angles.map((a) => [Math.cos(a), Math.sin(a)]);
	const origins = angles.map(() => [0, 0]);
	vectors
		.map((vector, i) => ({ vector, origin: origins[i] }))
		.map((vec_or) => ear.math.vecLineToUniqueLine(vec_or))
		.map((norm_dist) => ear.math.uniqueLineToVecLine(norm_dist))
		.forEach((el, i) => {
			expect(el.vector[0]).toBeCloseTo(vectors[i][0]);
			expect(el.vector[1]).toBeCloseTo(vectors[i][1]);
			expect(el.origin[0]).toBeCloseTo(origins[i][0]);
			expect(el.origin[1]).toBeCloseTo(origins[i][1]);
		});
});

// [
// 	{u:[-0, 1], d:1},
// 	{u:[-t, n], d:1},
// 	{u:[-s, s], d:1},
// 	{u:[-n, t], d:1},
// 	{u:[-1, 0], d:1},
// 	{u:[-n,-t], d:1},
// 	{u:[-s,-s], d:1},
// 	{u:[-t,-n], d:1},
// 	{u:[-0,-1], d:1},
// 	{u:[ t,-n], d:1},
// 	{u:[ s,-s], d:1},
// 	{u:[ n,-t], d:1},
// 	{u:[ 1,-0], d:1},
// 	{u:[ n, t], d:1},
// 	{u:[ s, s], d:1},
// 	{u:[ t, n], d:1},
// ];
test("16 angles of lines, not through the origin, dir 1", () => {
	const angles = Array.from(Array(16)).map((_, i) => ((Math.PI * 2) / 16) * i);
	const vectors = angles.map((a) => [Math.cos(a), Math.sin(a)]);
	const origins = angles.map((a) => [
		Math.cos(a + Math.PI / 2),
		Math.sin(a + Math.PI / 2),
	]);
	vectors
		.map((vector, i) => ({ vector, origin: origins[i] }))
		.map((vec_or) => ear.math.vecLineToUniqueLine(vec_or))
		.map((norm_dist) => ear.math.uniqueLineToVecLine(norm_dist))
		.forEach((el, i) => {
			expect(el.vector[0]).toBeCloseTo(vectors[i][0]);
			expect(el.vector[1]).toBeCloseTo(vectors[i][1]);
			expect(el.origin[0]).toBeCloseTo(origins[i][0]);
			expect(el.origin[1]).toBeCloseTo(origins[i][1]);
		});
});

test("16 angles of lines, not through the origin, dir 2", () => {
	const angles = Array.from(Array(16)).map((_, i) => ((Math.PI * 2) / 16) * i);
	const vectors = angles.map((a) => [Math.cos(a), Math.sin(a)]);
	const origins = angles.map((a) => [
		Math.cos(a - Math.PI / 2),
		Math.sin(a - Math.PI / 2),
	]);
	vectors
		.map((vector, i) => ({ vector, origin: origins[i] }))
		.map((vec_or) => ear.math.vecLineToUniqueLine(vec_or))
		.map((norm_dist) => ear.math.uniqueLineToVecLine(norm_dist))
		.forEach((el, i) => {
			expect(el.vector[0]).toBeCloseTo(vectors[i][0]);
			expect(el.vector[1]).toBeCloseTo(vectors[i][1]);
			expect(el.origin[0]).toBeCloseTo(origins[i][0]);
			expect(el.origin[1]).toBeCloseTo(origins[i][1]);
		});
});
