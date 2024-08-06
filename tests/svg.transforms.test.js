import { expect, test } from "vitest";
import xmldom from "@xmldom/xmldom";
import ear from "../src/index.js";

ear.svg.window = xmldom;

test("parseTransform", () => {
	const transformString = "translate(20 100) rotate(45) scale(2 1) matrix(0 -1 1 0 0 0)";
	const result = ear.svg.parseTransform(transformString);
	["translate", "rotate", "scale", "matrix"].forEach((name, i) =>
		expect(result[i].transform).toBe(name),
	);
});

test("transformStringToMatrix", () => {
	const transformString = "translate(20 100) rotate(45) scale(2 1) matrix(0 -1 1 0 0 0)";
	expect(ear.svg.transformStringToMatrix(transformString).length).toBe(6);

	const transformString2 = "translate(20) skewX(4) rotate(45 2 3) skewY(2) scale(2)";
	expect(ear.svg.transformStringToMatrix(transformString2).length).toBe(6);
});

test("transformStringToMatrix bad input", () => {
	const transformString = "translate() rotate() scale() skewX() skewY()";
	expect(ear.svg.transformStringToMatrix(transformString).length).toBe(6);
});

test("transforms", () => {
	const svg = ear.svg();

	const transformString =
		"translate(20 100) rotate(45) translate(50 50) matrix(0 -1 1 0 0 0)";

	["svg", "g", "circle", "ellipse", "line", "path", "polygon", "polyline", "rect"]
		// , "text"
		.map((node) =>
			svg[node]()
				.translate("20 100")
				.rotate(45)
				.translate(50, 50)
				.matrix(0, -1, 1, 0, 0, 0),
		)
		.forEach((p) => expect(p.getAttribute("transform")).toBe(transformString));
});

test("clear transform", () => {
	const svg = ear.svg();
	const l = svg.line(0, 0, 400, 400).rotate(45).translate(50, 50).clearTransform();
	const transform = l.getAttribute("transform");
	expect(transform == null || transform === "").toBe(true);
});
