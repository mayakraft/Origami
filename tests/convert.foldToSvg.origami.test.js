import fs from "fs";
import { expect, test } from "vitest";
import xmldom from "@xmldom/xmldom";
import ear from "../src/index.js";

ear.window = xmldom;

test("svg.origami(), no options", () => {
	const foldFile = fs.readFileSync("./tests/files/fold/crane.fold", "utf-8");
	const fold = JSON.parse(foldFile);
	const graph = ear.graph.getFramesByClassName(fold, "foldedForm")[0];
	// create a Rabbit Ear SVG element.
	const svg = ear.svg();
	// draw an origami and append it to this SVG
	// by default, "viewBox" option is set to true.
	svg.origami(graph);
	const serializer = new xmldom.XMLSerializer();
	fs.writeFileSync(
		"./tests/tmp/svg-origami()-crane.svg",
		serializer.serializeToString(svg),
	);
});

test("svg.origami(), turn off viewBox", () => {
	const foldFile = fs.readFileSync("./tests/files/fold/crane.fold", "utf-8");
	const fold = JSON.parse(foldFile);
	const graph = ear.graph.getFramesByClassName(fold, "foldedForm")[0];
	// create a Rabbit Ear SVG element.
	const svg = ear.svg().strokeWidth(0.05);
	// draw an origami and append it to this SVG
	svg.origami(graph, { viewBox: false });
	const serializer = new xmldom.XMLSerializer();
	fs.writeFileSync(
		"./tests/tmp/svg-origami()-crane-no-viewbox.svg",
		serializer.serializeToString(svg),
	);
});

test("svg.origami(), options", () => {
	const foldFile = fs.readFileSync("./tests/files/fold/crane.fold", "utf-8");
	const fold = JSON.parse(foldFile);
	const graph = ear.graph.getFramesByClassName(fold, "foldedForm")[0];
	// create a Rabbit Ear SVG element.
	const svg = ear.svg();
	// draw an origami and append it to this SVG
	// style with an options object
	svg.origami(graph, {
		faces: false,
		edges: { mountain: { stroke: "red" }, valley: { stroke: "blue" } },
		vertices: true,
	});
	const serializer = new xmldom.XMLSerializer();
	fs.writeFileSync(
		"./tests/tmp/svg-origami()-crane-options.svg",
		serializer.serializeToString(svg),
	);
});

test("svg.origami(), custom methods", () => {
	const foldFile = fs.readFileSync("./tests/files/fold/crane.fold", "utf-8");
	const fold = JSON.parse(foldFile);
	const graph = ear.graph.getFramesByClassName(fold, "foldedForm")[0];
	const svg = ear.svg().viewBox([-1, -1, 3, 3]).strokeWidth(0.05);
	svg.circle(0.5, 0.5, 0.5).fill("#f003").stroke("purple");
	svg.origami(graph).fill("red").stroke("blue").strokeDasharray("0.1");
	const serializer = new xmldom.XMLSerializer();
	fs.writeFileSync(
		"./tests/tmp/svg-origami()-crane-style.svg",
		serializer.serializeToString(svg),
	);
});

test("svg.origami(), custom getters", () => {
	const foldFile = fs.readFileSync("./tests/files/fold/crane.fold", "utf-8");
	const fold = JSON.parse(foldFile);
	const graph = ear.graph.getFramesByClassName(fold, "foldedForm")[0];
	const svg = ear.svg().viewBox([-1, -1, 3, 3]).strokeWidth(0.05);
	const origami = svg.origami(graph);
	// returns the group
	origami.edges().strokeDasharray("0.1");
	origami.faces().fill("#F083").strokeDasharray("0.1");
	expect(origami.vertices()).toBeUndefined();
	const serializer = new xmldom.XMLSerializer();
	fs.writeFileSync(
		"./tests/tmp/svg-origami()-crane-getters.svg",
		serializer.serializeToString(svg),
	);
});
