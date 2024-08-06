import { expect, test } from "vitest";
import xmldom from "@xmldom/xmldom";
import ear from "../src/index.js";

ear.svg.window = xmldom;

test("argument parsing, line", () => {
	const lines = [
		ear.svg.line(1, 2, 3, 4),
		ear.svg.line([1, 2, 3, 4]),
		ear.svg.line([[1, 2, 3, 4]]),
		ear.svg.line([1, 2], [3, 4]),
		ear.svg.line({ x: 1, y: 2 }, { x: 3, y: 4 }),
		ear.svg.line([
			{ x: 1, y: 2 },
			{ x: 3, y: 4 },
		]),
		ear.svg.line([1, 2, 9], [3, 4, 9]),
		ear.svg.line([
			[1, 2, 9],
			[3, 4, 9],
		]),
		ear.svg.line({ x: 1, y: 2, z: 9 }, { x: 3, y: 4, z: 9 }),
	];
	// ear.svg.line([1], [2], [3], [4]),
	// ear.svg.line([{x:1, y:2}], [{x:3, y:4}]),
	// ear.svg.line([[{x:1, y:2}], [{x:3, y:4}]]),
	const result = lines
		.map((el) =>
			["x1", "y1", "x2", "y2"]
				.map((attr) => el.getAttribute(attr))
				.map((value, i) => value === String(i + 1))
				.reduce((a, b) => a && b, true),
		)
		.reduce((a, b) => a && b, true);
	expect(result).toBe(true);
});

test("line arguments, missing arguments", () => {
	const result1 = ear.svg.line(1, 2, 3);
	expect(result1.getAttribute("x2")).toBe("3");
	expect(result1.getAttribute("y2")).toBe("");

	const result2 = ear.svg.line({ x: 1, y: 2 }, { x: 3 });
	expect(result2.getAttribute("x2")).toBe("3");
	// expect(result2.getAttribute("y2")).toBe("");
});

test("line setters", () => {
	const attrs = ["x1", "y1", "x2", "y2"];

	let l = ear.svg.line();
	l.setPoints(1, 2, 3, 4);
	attrs.forEach((attr, i) => expect(l.getAttribute(attr)).toBe(String([1, 2, 3, 4][i])));

	l.setPoints([[1, 2, 3, 4]]);
	attrs.forEach((attr, i) => expect(l.getAttribute(attr)).toBe(String([1, 2, 3, 4][i])));

	l.setPoints([
		[1, 2],
		[3, 4],
	]);
	attrs.forEach((attr, i) => expect(l.getAttribute(attr)).toBe(String([1, 2, 3, 4][i])));
	expect(l.attributes.length).toBe(4);

	// this will not work
	l.setPoints([[1, 2], [3, 4], 5, [6, 7]]);
	// attrs.forEach((attr, i) => expect(l.getAttribute(attr)).toBe(String([1, 2, 3, 4][i])));
	// expect(l.attributes.length).toBe(4);

	// this will not work
	l.setPoints("9", "8", "7", "6");
	// attrs.forEach((attr, i) => expect(l.getAttribute(attr)).toBe(String([1, 2, 3, 4][i])));

	l.setPoints({ x: 5, y: 6 }, { x: 7, y: 8 }, { x: 9, y: 10 });
	attrs.forEach((attr, i) => expect(l.getAttribute(attr)).toBe(String([5, 6, 7, 8][i])));
	expect(l.attributes.length).toBe(4);
});
