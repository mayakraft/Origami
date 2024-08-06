import { expect, test } from "vitest";
import ear from "../src/index.js";

test("axiom 1", () => {
	const res0 = ear.axiom.axiom1([2 / 3, 1 / 3], [1 / 3, 2 / 3]);
	const res1 = ear.axiom.axiom1([2 / 3, 1 / 3, 0], [1 / 3, 2 / 3, 0]);
	const expected = {
		origin: [2 / 3, 1 / 3],
		vector: [-Math.SQRT1_2, Math.SQRT1_2],
	};
	expect(ear.math.epsilonEqualVectors(res0[0].vector, expected.vector)).toBe(true);
	expect(ear.math.epsilonEqualVectors(res0[0].origin, expected.origin)).toBe(true);
	expect(ear.math.epsilonEqualVectors(res1[0].vector, expected.vector)).toBe(true);
	expect(ear.math.epsilonEqualVectors(res1[0].origin, expected.origin)).toBe(true);
});

test("axiom 2", () => {
	const res0 = ear.axiom.axiom2([2 / 3, 1 / 3], [1 / 3, 2 / 3]);
	const res1 = ear.axiom.axiom2([2 / 3, 1 / 3, 0], [1 / 3, 2 / 3, 0]);
	const expected = {
		origin: [0.5, 0.5],
		vector: [-Math.SQRT1_2, -Math.SQRT1_2],
	};
	expect(ear.math.epsilonEqualVectors(res0[0].vector, expected.vector)).toBe(true);
	expect(ear.math.epsilonEqualVectors(res0[0].origin, expected.origin)).toBe(true);
	expect(ear.math.epsilonEqualVectors(res1[0].vector, expected.vector)).toBe(true);
	expect(ear.math.epsilonEqualVectors(res1[0].origin, expected.origin)).toBe(true);
});

test("axiom 3", () => {
	const res = ear.axiom.axiom3(
		{ vector: [0, 1], origin: [0.5, 0.5] },
		{ vector: [1, 0], origin: [0, 0.5] },
	);
	const expected = [
		{ origin: [0.5, 0.5], vector: [Math.SQRT1_2, Math.SQRT1_2] },
		{ origin: [0.5, 0.5], vector: [Math.SQRT1_2, -Math.SQRT1_2] },
	];
	expect(ear.math.epsilonEqualVectors(res[0].vector, expected[0].vector)).toBe(true);
	expect(ear.math.epsilonEqualVectors(res[0].origin, expected[0].origin)).toBe(true);
	expect(ear.math.epsilonEqualVectors(res[1].vector, expected[1].vector)).toBe(true);
	expect(ear.math.epsilonEqualVectors(res[1].origin, expected[1].origin)).toBe(true);
});

test("axiom 4", () => {
	const line = { vector: [1, 1] }; // no origin needed for axiom 4
	const pointB = [3, 1];
	const res = ear.axiom.axiom4(line, pointB);
	expect(res[0].vector[0]).toBeCloseTo(-Math.SQRT1_2);
	expect(res[0].vector[1]).toBeCloseTo(Math.SQRT1_2);
	expect(res[0].origin[0]).toBe(3);
	expect(res[0].origin[1]).toBe(1);
});

test("axiom 5", () => {
	const res = ear.axiom.axiom5({ vector: [0, 1], origin: [0.5, 0.5] }, [0, 0], [1, 0]);
	expect(res[0].vector[0]).toBeCloseTo(Math.sqrt(3) / 2);
	expect(res[0].vector[1]).toBeCloseTo(-0.5);
	expect(res[1].vector[0]).toBeCloseTo(-Math.sqrt(3) / 2);
	expect(res[1].vector[1]).toBeCloseTo(-0.5);
	expect(res[0].origin[0]).toBeCloseTo(0.75);
	expect(res[0].origin[1]).toBeCloseTo(-0.4330127);
	expect(res[1].origin[0]).toBeCloseTo(0.75);
	expect(res[1].origin[1]).toBeCloseTo(0.4330127);
});

test("axiom 6", () => {
	const params = {
		points: [
			[0.3, 0.86],
			[0.14, 0.07],
		],
		lines: [
			{ vector: [0.74, 0.42], origin: [-0.16, 0.21] },
			{ vector: [-1.17, 0.44], origin: [0.91, 0.25] },
		],
	};

	expect(true).toBe(true);
});

test("axiom 6 with no params", () => {
	try {
		ear.axiom.axiom6({ vector: [], origin: [] }, { vector: [], origin: [] }, [], []);
	} catch (err) {
		expect(err).not.toBe(undefined);
	}
});

test("axiom 6 with 3 results", () => {
	const vectorA = [0, 1];
	const originA = [1, 0];
	const vectorB = [1, 0];
	const originB = [0, 1];
	const pointA = [0.75, 0];
	const pointB = [0, 0.75];
	const res = ear.axiom.axiom6(
		{ vector: vectorA, origin: originA },
		{ vector: vectorB, origin: originB },
		pointA,
		pointB,
	);
	const lines = [
		{
			origin: [0.8535533905932738, 0.14644660940672635],
			vector: [0.16910197872576288, -0.9855985596534887],
		},
		{
			origin: [0.14644660940672627, 0.8535533905932738],
			vector: [0.9855985596534889, -0.16910197872576277],
		},
		{
			origin: [0.4999999999999999, 0.4999999999999999],
			vector: [0.7071067811865475, -0.7071067811865475],
		},
	];
	for (let i = 0; i < lines.length; i += 1) {
		expect(res[i].vector[0]).toBeCloseTo(lines[i].vector[0]);
		expect(res[i].vector[1]).toBeCloseTo(lines[i].vector[1]);
		expect(res[i].origin[0]).toBeCloseTo(lines[i].origin[0]);
		expect(res[i].origin[1]).toBeCloseTo(lines[i].origin[1]);
	}
});

test("axiom 6 with 2 results", () => {
	const vectorA = [1.0, 0.0];
	const originA = [0.0, 1.0];
	const vectorB = [1.0, 0.0];
	const originB = [0.0, 0.0];
	const pointA = [0.9, 0.1];
	const pointB = [0.1, 0.9];
	const res = ear.axiom.axiom6(
		{ vector: vectorA, origin: originA },
		{ vector: vectorB, origin: originB },
		pointA,
		pointB,
	);
	const lines = [
		{
			origin: [-0.0625, 0.0846405430584631],
			vector: [0.8044504602885519, 0.5940197445721286],
		},
		{
			origin: [-0.06249999999999996, 0.41535945694153714],
			vector: [0.9888677651443275, 0.14879698605302136],
		},
	];
	for (let i = 0; i < lines.length; i += 1) {
		expect(res[i].vector[0]).toBeCloseTo(lines[i].vector[0]);
		expect(res[i].vector[1]).toBeCloseTo(lines[i].vector[1]);
		expect(res[i].origin[0]).toBeCloseTo(lines[i].origin[0]);
		expect(res[i].origin[1]).toBeCloseTo(lines[i].origin[1]);
	}
});

test("axiom 7", () => {
	const line1 = { vector: [1, 1], origin: [-1, 0] };
	const line2 = { vector: [1, -1] }; // no origin needed
	const res = ear.axiom.axiom7(line1, line2, [1, 0]);
	expect(res[0].vector[0]).toBeCloseTo(-Math.SQRT1_2);
	expect(res[0].vector[1]).toBeCloseTo(-Math.SQRT1_2);
	expect(res[0].origin[0]).toBe(0.5);
	expect(res[0].origin[1]).toBe(0.5);
});
