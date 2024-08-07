import { expect, test } from "vitest";
import xmldom from "@xmldom/xmldom";
import ear from "../src/index.js";

ear.svg.window = xmldom;

const NodeAndChildren = {
	svg: [
		"svg",
		"defs",
		"desc",
		"filter",
		"metadata",
		"style",
		"script",
		"title",
		"view",
		"linearGradient",
		"radialGradient",
		"pattern",
		"marker",
		"symbol",
		"clipPath",
		"mask",
		"g",
		"circle",
		"ellipse",
		"line",
		"path",
		"polygon",
		"polyline",
		"rect",
		"text",
	],
	g: ["g", "circle", "ellipse", "line", "path", "polygon", "polyline", "rect", "text"],
	// text: ["textPath", "tspan"], // text has another "text" child node that doesn't match
	linearGradient: ["stop"],
	radialGradient: ["stop"],
	defs: [
		"desc",
		"filter",
		"metadata",
		"style",
		"script",
		"title",
		"view",
		"linearGradient",
		"radialGradient",
		"pattern",
		"marker",
		"symbol",
		"clipPath",
		"mask",
	],
	filter: [
		"feBlend",
		"feColorMatrix",
		"feComponentTransfer",
		"feComposite",
		"feConvolveMatrix",
		"feDiffuseLighting",
		"feDisplacementMap",
		"feDistantLight",
		"feDropShadow",
		"feFlood",
		"feFuncA",
		"feFuncB",
		"feFuncG",
		"feFuncR",
		"feGaussianBlur",
		"feImage",
		"feMerge",
		"feMergeNode",
		"feMorphology",
		"feOffset",
		"fePointLight",
		"feSpecularLighting",
		"feSpotLight",
		"feTile",
		"feTurbulence",
	],
	marker: [
		"g",
		"circle",
		"ellipse",
		"line",
		"path",
		"polygon",
		"polyline",
		"rect",
		"text",
	],
	symbol: [
		"g",
		"circle",
		"ellipse",
		"line",
		"path",
		"polygon",
		"polyline",
		"rect",
		"text",
	],
	clipPath: [
		"g",
		"circle",
		"ellipse",
		"line",
		"path",
		"polygon",
		"polyline",
		"rect",
		"text",
	],
	mask: ["g", "circle", "ellipse", "line", "path", "polygon", "polyline", "rect", "text"],
};

const NodesNames = [
	"svg",
	"line",
	"rect",
	"circle",
	"ellipse",
	"polygon",
	"polyline",
	"path",
	"mask",
	"symbol",
	"clipPath",
	"marker",
	"linearGradient",
	"radialGradient",
	"stop",
	"pattern",
	"defs",
	"desc",
	"filter",
	"metadata",
	"style",
	"script",
	"title",
	"view",
	"cdata",
	"g",
	"text",
	"textPath",
	"tspan",
	"feBlend",
	"feColorMatrix",
	"feComponentTransfer",
	"feComposite",
	"feConvolveMatrix",
	"feDiffuseLighting",
	"feDisplacementMap",
	"feDistantLight",
	"feDropShadow",
	"feFlood",
	"feFuncA",
	"feFuncB",
	"feFuncG",
	"feFuncR",
	"feGaussianBlur",
	"feImage",
	"feMerge",
	"feMergeNode",
	"feMorphology",
	"feOffset",
	"fePointLight",
	"feSpecularLighting",
	"feSpotLight",
	"feTile",
	"feTurbulence",
];

test("node test", () => {
	const svg = ear.svg();
	Object.keys(NodeAndChildren).forEach((parent) => {
		const node = svg[parent]();
		NodeAndChildren[parent].forEach((child) => node[child]());
		expect(node.childNodes.length).toBe(NodeAndChildren[parent].length);
		NodeAndChildren[parent].forEach((child, i) =>
			expect(node.childNodes[i].nodeName).toBe(child),
		);
	});
	expect(svg.childNodes.length).toBe(Object.keys(NodeAndChildren).length);
	Object.keys(NodeAndChildren).forEach((child, i) =>
		expect(svg.childNodes[i].nodeName).toBe(child),
	);
});

test("node names", () => {
	const createElements = NodesNames.map((nodeName) => ear.svg[nodeName]())
		.map((node, i) => node.nodeName === NodesNames[i])
		.reduce((a, b) => a && b, true);
	expect(createElements).toBe(true);
});
