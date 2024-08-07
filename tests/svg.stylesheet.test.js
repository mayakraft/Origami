import { expect, test } from "vitest";
import xmldom from "@xmldom/xmldom";
import ear from "../src/index.js";

ear.svg.window = xmldom;

test("style", () => {
	const styleString = "line{stroke:purple};";
	const svg = ear.svg();
	svg.stylesheet(styleString);
	const style = Array.from(svg.childNodes)
		.filter((a) => a.nodeName === "style")
		.shift();
	expect(style.childNodes[0].textContent).toBe(styleString);
});

test("style setTextContent", () => {
	const styleString = "line{stroke:purple};";
	const styleString2 = "circle { fill: '#000' }";
	const svg = ear.svg();
	const stylesheet = svg.stylesheet(styleString);
	stylesheet.setTextContent(styleString2);
	const style = Array.from(svg.childNodes)
		.filter((a) => a.nodeName === "style")
		.shift();
	expect(style.childNodes[0].textContent).toBe(styleString2);
});
