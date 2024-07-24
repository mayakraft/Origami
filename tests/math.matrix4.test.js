import { expect, test } from "vitest";
import ear from "../src/index.js";

test("isIdentity", () => {
	expect(ear.math.isIdentity4x4([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]))
		.toBe(false);
	expect(ear.math.isIdentity4x4([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 4, 5, 6, 1]))
		.toBe(false);
	expect(ear.math.isIdentity4x4([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]))
		.toBe(true);
});

test("multiply", () => {
	const m = ear.math.multiplyMatrices4(
		ear.math.makeMatrix4RotateX(Math.PI / 4),
		ear.math.makeMatrix4RotateZ(Math.PI / 4),
	);
	const sq = Math.SQRT1_2;
	[sq, 0.5, 0.5, 0, -sq, 0.5, 0.5, 0, 0, -sq, sq, 0, 0, 0, 0, 1]
		.forEach((a, i) => expect(a).toBeCloseTo(m[i]));
});

test("determinant", () => {
	// randomly made matrices, made using these affine transforms,
	// even their inverted forms, should all have a determinant of 1
	expect(ear.math.determinant4([...ear.math.identity4x4])).toBeCloseTo(1);
	expect(ear.math.determinant4(ear.math.makeMatrix4RotateX(Math.random() * Math.PI * 2)))
		.toBeCloseTo(1);
	expect(ear.math.determinant4(ear.math.makeMatrix4RotateZ(Math.random() * Math.PI * 2)))
		.toBeCloseTo(1);
	expect(ear.math.determinant4(ear.math.makeMatrix4Translate(1, 2, 3)))
		.toBeCloseTo(1);
	expect(ear.math.determinant4(ear.math.invertMatrix4(
		ear.math.makeMatrix4Rotate(Math.random() * Math.PI * 2, [1, 5, 8]),
	))).toBeCloseTo(1);
});

test("inverse", () => {
	const m = ear.math.invertMatrix4([0, -1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
	[0, 1, 0, 0, -1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
		.forEach((a, i) => expect(a).toBeCloseTo(m[i]));

	const bad = ear.math.invertMatrix4([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, Infinity, 0, 1]);
	expect(bad).toBe(undefined);
});

test("translate", () => {
	const m = ear.math.makeMatrix4Translate(4, 5, 6);
	expect(m[12]).toBe(4);
	expect(m[13]).toBe(5);
	expect(m[14]).toBe(6);
});

test("rotateX", () => {
	const sq = Math.SQRT1_2;
	const m = ear.math.makeMatrix4RotateX(Math.PI / 4);
	[1, 0, 0, 0, 0, sq, sq, 0, 0, -sq, sq, 0, 0, 0, 0, 1]
		.forEach((a, i) => expect(a).toBeCloseTo(m[i]));
});

test("rotateY", () => {
	const sq = Math.SQRT1_2;
	const m = ear.math.makeMatrix4RotateY(Math.PI / 4);
	[sq, 0, -sq, 0, 0, 1, 0, 0, sq, 0, sq, 0, 0, 0, 0, 1]
		.forEach((a, i) => expect(a).toBeCloseTo(m[i]));
});

test("rotateZ", () => {
	const sq = Math.SQRT1_2;
	const m = ear.math.makeMatrix4RotateZ(Math.PI / 4);
	[sq, sq, 0, 0, -sq, sq, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
		.forEach((a, i) => expect(a).toBeCloseTo(m[i]));
});

test("rotate", () => {
	const m = ear.math.makeMatrix4Rotate(Math.PI / 2, [1, 1, 1], [0, 0, 0]);
	expect(m[2]).toBeCloseTo(m[4]);
	expect(m[4]).toBeCloseTo(m[9]);
	expect(m[0]).toBeCloseTo(m[5]);
	expect(m[5]).toBeCloseTo(m[10]);
	expect(m[1]).toBeCloseTo(m[6]);
	expect(m[6]).toBeCloseTo(m[8]);
});

test("scale", () => {
	const m = ear.math.makeMatrix4Scale([0.5, 0.5, 0.5]);
	[0.5, 0, 0, 0, 0, 0.5, 0, 0, 0, 0, 0.5, 0, 0, 0, 0, 1]
		.forEach((a, i) => expect(a).toBeCloseTo(m[i]));
});

test("makeMatrix4Scale", () => {
	const m0 = ear.math.makeMatrix4Scale();
	[1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
		.forEach((n, i) => expect(n).toBeCloseTo(m0[i]));
	const m1 = ear.math.makeMatrix4Scale([0.5, 0.5, 0.5]);
	[0.5, 0, 0, 0, 0, 0.5, 0, 0, 0, 0, 0.5, 0, 0, 0, 0, 1]
		.forEach((n, i) => expect(n).toBeCloseTo(m1[i]));
	const m2 = ear.math.makeMatrix4UniformScale();
	[1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
		.forEach((n, i) => expect(n).toBeCloseTo(m2[i]));
	const m3 = ear.math.makeMatrix4UniformScale(0.5);
	[0.5, 0, 0, 0, 0, 0.5, 0, 0, 0, 0, 0.5, 0, 0, 0, 0, 1]
		.forEach((n, i) => expect(n).toBeCloseTo(m3[i]));
});

test("combine operations", () => {
	const result = ear.math.multiplyMatrices4(
		ear.math.makeMatrix4RotateX(Math.PI / 2),
		ear.math.makeMatrix4Translate(40, 20, 10),
	);
	[1, 0, 0, 0, 0, 0, 1, 0, 0, -1, 0, 0, 40, -10, 20, 1]
		.forEach((n, i) => expect(n).toBeCloseTo(result[i]));
});

test("reflectZ", () => {
	const m = ear.math.makeMatrix4ReflectZ([1, 1, 1], [0, 0, 0]);
	[0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
		.forEach((n, i) => expect(n).toBeCloseTo(m[i]));
});

test("transform", () => {
	const matrix = ear.math.multiplyMatrices4(
		ear.math.makeMatrix4RotateZ(Math.PI / 2),
		ear.math.makeMatrix4Translate(4, 5, 6),
	);
	const segment = [[-1, 0, 0], [1, 0, 0]];
	const result = segment
		.map(p => ear.math.multiplyMatrix4Vector3(matrix, p));
	[[-5, 3, 6], [-5, 5, 6]]
		.forEach((p, i) => p
			.forEach((n, j) => expect(n).toBe(result[i][j])));
});

test("transformVector", () => {
	const vector = [1, 2, 3];
	const result = ear.math.multiplyMatrix4Vector3(
		ear.math.makeMatrix4Scale([0.5, 0.5, 0.5]),
		vector,
	);
	expect(result[0]).toBeCloseTo(0.5);
	expect(result[1]).toBeCloseTo(1);
	expect(result[2]).toBeCloseTo(1.5);
});

test("transformLine", () => {
	const result = ear.math.multiplyMatrix4Line3(
		ear.math.makeMatrix4Scale([0.5, 0.5, 0.5]),
		[0.707, 0.707, 0],
		[1, 0, 0],
	);
	expect(result.vector[0]).toBeCloseTo(0.3535);
	expect(result.vector[1]).toBeCloseTo(0.3535);
	expect(result.vector[2]).toBeCloseTo(0);
	expect(result.origin[0]).toBeCloseTo(0.5);
	expect(result.origin[1]).toBeCloseTo(0);
	expect(result.origin[2]).toBeCloseTo(0);
});
/**
 * WebGL Matrices
 */
test("perspective matrix", () => {
	const res1 = ear.math.makePerspectiveMatrix4(Math.PI / 2, 1, 1, 10);
	[1, 0, 0, 0, 0, 1, 0, 0, 0, 0, -(11 / 9), -1, 0, 0, -(20 / 9), 0]
		.forEach((n, i) => expect(res1[i]).toBeCloseTo(n));

	// fov 180deg results in 0 in x and y diagonal
	const res2 = ear.math.makePerspectiveMatrix4(Math.PI, 1, 1, 10);
	expect(res2[0]).toBeCloseTo(0);
	expect(res2[5]).toBeCloseTo(0);
});

test("orthographic matrix", () => {
	const res1 = ear.math.makeOrthographicMatrix4(1, 1, -1, -1, 1, 10);
	[1, 0, 0, 0, 0, 1, 0, 0, 0, 0, -(2 / 9), 0, 0, 0, -(11 / 9), 1]
		.forEach((n, i) => expect(res1[i]).toBeCloseTo(n));
});

test("lookat matrix", () => {
	const res1 = ear.math.makeLookAtMatrix4([0, 0, 1], [0, 0, 0], [0, 1, 0]);
	[1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, -1, 1]
		.forEach((n, i) => expect(res1[i]).toBeCloseTo(n));

	const res2 = ear.math.makeLookAtMatrix4([1, 0, 0], [0, 0, 0], [0, 1, 0]);
	[0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, 0, -1, 0, 0, 1]
		.forEach((n, i) => expect(res2[i]).toBeCloseTo(n));

	const res3 = ear.math.makeLookAtMatrix4([0, 0, -1], [0, 0, 0], [0, 1, 0]);
	[-1, 0, 0, 0, 0, 1, 0, 0, 0, 0, -1, 0, 0, 0, 1, 1]
		.forEach((n, i) => expect(res3[i]).toBeCloseTo(n));

	const res4 = ear.math.makeLookAtMatrix4([0, 0, 1], [0, 0, 0], [0, -1, 0]);
	[-1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1, 0, 0, 0, -1, 1]
		.forEach((n, i) => expect(res4[i]).toBeCloseTo(n));
});
