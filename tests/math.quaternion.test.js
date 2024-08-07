import { expect, test } from "vitest";
import ear from "../src/index.js";

test("quaternionFromTwoVectors", () => {
	const res1 = ear.math.quaternionFromTwoVectors([1, 0, 0], [0, 1, 0]);
	[0, 0, Math.SQRT1_2, Math.SQRT1_2].forEach((n, i) => expect(res1[i]).toBeCloseTo(n));

	const res2 = ear.math.quaternionFromTwoVectors([1, 0, 0], [0, 0, 1]);
	[0, -Math.SQRT1_2, 0, Math.SQRT1_2].forEach((n, i) => expect(res2[i]).toBeCloseTo(n));

	const res3 = ear.math.quaternionFromTwoVectors([0, 1, 0], [0, 0, 1]);
	[Math.SQRT1_2, 0, 0, Math.SQRT1_2].forEach((n, i) => expect(res3[i]).toBeCloseTo(n));
});

test("matrix4FromQuaternion", () => {
	const res1 = ear.math.matrix4FromQuaternion([0, 0, 0, 1]);
	ear.math.identity4x4.forEach((n, i) => expect(res1[i]).toBeCloseTo(n));

	const res2 = ear.math.matrix4FromQuaternion([1, 0, 0, 0]);
	[1, 0, 0, 0, 0, -1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1].forEach((n, i) =>
		expect(res2[i]).toBeCloseTo(n),
	);

	const res3 = ear.math.matrix4FromQuaternion([0, 1, 0, 0]);
	[-1, 0, 0, 0, 0, 1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1].forEach((n, i) =>
		expect(res3[i]).toBeCloseTo(n),
	);

	const res4 = ear.math.matrix4FromQuaternion([0, 0, 1, 0]);
	[-1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1].forEach((n, i) =>
		expect(res4[i]).toBeCloseTo(n),
	);
});
