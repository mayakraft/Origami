import { expect, test } from "vitest";
import xmldom from "@xmldom/xmldom";
import ear from "../src/index.js";

ear.svg.window = xmldom;
const { DOMParser } = xmldom;

test("argument parsing, svg", () => {
	const svg0 = ear.svg();
	const vb0 = svg0.getAttribute("viewBox");
	expect(vb0 == null || vb0 === "").toBe(true);

	const svg1 = ear.svg(400, 500);
	expect(svg1.getAttribute("viewBox")).toBe("0 0 400 500");

	const svg2 = ear.svg(1, 2, 400, 500);
	expect(svg2.getAttribute("viewBox")).toBe("1 2 400 500");

	const svg3 = ear.svg(1, 400, 500);
	const vb3 = svg3.getAttribute("viewBox");
	expect(vb3 == null || vb3 === "").toBe(true);
});

test("no parent", () => {
	const svg = ear.svg(600, 600);
	expect(svg.parentNode).toBe(null);
});

test("parent element", () => {
	const parent = new DOMParser().parseFromString(
		"<div></div>",
		"text/xml",
	).documentElement;
	const svg = ear.svg(600, 600, parent);
	expect(svg.parentNode.nodeName).toBe("div");
});

// test("svg embed as string", () => {
// 	// this string contains \n newlines, the load method targets and removes them
// 	// by testing the <line> element at [0] this is also testing the newline removal
// 	const svgString = `<svg version="1.1" xmlns="http://www.w3.org/2000/svg">
// 	<line x1="0" y1="0" x2="300" y2="150" stroke="black" stroke-width="5"/>
// </svg>`;
// 	const svg = ear.svg(svgString);
// 	expect(svg.childNodes.length).toBe(1);
// 	expect(svg.childNodes[0].nodeName).toBe("line");
// });
