import { expect, test } from "vitest";
import ear from "../src/index.js";

test("intersectPolygonLine, edge collinear", () => {
	// all cases will have length of 2
	const square = [
		[0, 0],
		[1, 0],
		[1, 1],
		[0, 1],
	];
	const lineHoriz1 = { vector: [1, 0], origin: [0, 0] };
	const lineHoriz2 = { vector: [1, 0], origin: [1, 1] };
	const lineVert1 = { vector: [0, 1], origin: [0, 0] };
	const lineVert2 = { vector: [0, 1], origin: [1, 1] };
	const results = [
		ear.math.intersectPolygonLine(square, lineHoriz1, ear.math.includeL),
		ear.math.intersectPolygonLine(square, lineHoriz2, ear.math.includeL),
		ear.math.intersectPolygonLine(square, lineVert1, ear.math.includeL),
		ear.math.intersectPolygonLine(square, lineVert2, ear.math.includeL),
	];
	results.forEach((res) => expect(res).toHaveLength(2));
});

test("intersectPolygonLine, through two vertices", () => {
	const square = [
		[0, 0],
		[1, 0],
		[1, 1],
		[0, 1],
	];
	const lineDiag1 = { vector: [1, 1], origin: [0, 0] };
	const lineDiag2 = { vector: [-1, 1], origin: [1, 0] };
	expect(
		ear.math.intersectPolygonLine(square, lineDiag1, ear.math.includeL),
	).toHaveLength(2);
	expect(
		ear.math.intersectPolygonLine(square, lineDiag2, ear.math.includeL),
	).toHaveLength(2);

	expect(
		ear.math.intersectPolygonLine(square, lineDiag1, ear.math.includeS),
	).toHaveLength(2);
	expect(
		ear.math.intersectPolygonLine(square, lineDiag2, ear.math.includeS),
	).toHaveLength(2);

	expect(
		ear.math.intersectPolygonLine(square, lineDiag1, ear.math.excludeS),
	).toHaveLength(0);
	expect(
		ear.math.intersectPolygonLine(square, lineDiag2, ear.math.excludeS),
	).toHaveLength(0);
});
