import { expect, test } from "vitest";
import ear from "../src/index.js";

const equalTest = (a, b) => expect(JSON.stringify(a)).toBe(JSON.stringify(b));

test("resize", () => {
	const a = [1, 2, 3];
	const _a = ear.math.resize(5, a);
	equalTest(_a, [1, 2, 3, 0, 0]);
});

test("resize empty", () => {
	const res = ear.math.resize(3, []);
	expect(ear.math.epsilonEqualVectors([0, 0, 0], res)).toBe(true);
});

test("resize undefined", () => {
	try {
		ear.math.resize(3);
	} catch (err) {
		expect(err).not.toBe(undefined);
	}
});

test("resizeUp", () => {
	const a = [1, 2, 3];
	const b = [4, 5];
	expect(a.length).toBe(3);
	expect(b.length).toBe(2);
	const [_a, _b] = ear.math.resizeUp(a, b);
	expect(_a.length).toBe(3);
	expect(_b.length).toBe(3);
});

// function is not included.
// since implementation it has never been used
// test("resizeDown", () => {
// 	const a = [1, 2, 3];
// 	const b = [4, 5];
// 	expect(a.length).toBe(3);
// 	expect(b.length).toBe(2);
// 	const [_a, _b] = ear.math.resizeDown(a, b);
// 	expect(_a.length).toBe(2);
// 	expect(_b.length).toBe(2);
// });
