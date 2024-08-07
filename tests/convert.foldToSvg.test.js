import fs from "fs";
import { expect, test } from "vitest";
import xmldom from "@xmldom/xmldom";
import ear from "../src/index.js";

ear.window = xmldom;

test("convert foldToSvg no param", () => {
	let error;
	try {
		ear.convert.foldToSvg();
	} catch (err) {
		error = err;
	}
	expect(error).not.toBe(undefined);
});

test("convert foldToSvg empty", () => {
	const empty = {};
	ear.convert.foldToSvg(empty);
	expect(true).toBe(true);
});

test("convert foldToSvg FOLD object", () => {
	const cp = ear.graph.fish();
	ear.convert.foldToSvg(cp);
	expect(true).toBe(true);
});

test("convert foldToSvg FOLD string", () => {
	const cp = ear.graph.fish();
	const FOLD = JSON.stringify(cp);
	ear.convert.foldToSvg(FOLD);
	expect(true).toBe(true);
});

test("convert FOLD file", () => {
	const foldfile = fs.readFileSync("./tests/files/fold/crane-cp.fold", "utf-8");
	const FOLD = JSON.parse(foldfile);
	ear.convert.foldToSvg(FOLD);
	expect(true).toBe(true);
});

test("foldToSvg CP all assignments, no opacity", () => {
	const foldFile = fs.readFileSync("./tests/files/fold/crane-cp-bmvfcj.fold", "utf-8");
	const fold = JSON.parse(foldFile);
	const graph = ear.graph.getFramesByClassName(fold, "creasePattern")[0];
	const svg = ear.convert.foldToSvg(graph);
	const serializer = new xmldom.XMLSerializer();
	fs.writeFileSync(
		"./tests/tmp/svg-crane-cp-bmvfcj.svg",
		serializer.serializeToString(svg),
	);
});

test("foldToSvg CP foldAngles and opacity", () => {
	const foldfile = fs.readFileSync("./tests/files/fold/bird-base-3d-cp.fold", "utf-8");
});

test("foldToSvg folded form, flat folded", () => {
	const foldFile = fs.readFileSync("./tests/files/fold/crane.fold", "utf-8");
	const fold = JSON.parse(foldFile);
	const graph = ear.graph.getFramesByClassName(fold, "foldedForm")[0];
	const svg = ear.convert.foldToSvg(graph);
	const serializer = new xmldom.XMLSerializer();
	fs.writeFileSync("./tests/tmp/svg-crane-folded.svg", serializer.serializeToString(svg));
});

test("foldToSvg folded form, with foldAngles", () => {
	const foldFile = fs.readFileSync("./tests/files/fold/bird-base-3d.fold", "utf-8");
	const fold = JSON.parse(foldFile);
	const graph = ear.graph.getFramesByClassName(fold, "foldedForm")[0];
	const svg = ear.convert.foldToSvg(graph);
	const serializer = new xmldom.XMLSerializer();
	fs.writeFileSync("./tests/tmp/svg-bird-base-3d.svg", serializer.serializeToString(svg));
});

test("foldToSvg, custom methods on SVG element", () => {
	const foldFile = fs.readFileSync("./tests/files/fold/crane.fold", "utf-8");
	const fold = JSON.parse(foldFile);
	const graph = ear.graph.getFramesByClassName(fold, "foldedForm")[0];
	const svg = ear.convert.foldToSvg(graph);
	svg.fill("red");
	svg.stroke("blue");
	svg.strokeDasharray("0.1");
	svg.circle(0.5, 0.5, 0.5).fill("#f003").stroke("purple");
	const serializer = new xmldom.XMLSerializer();
	fs.writeFileSync(
		"./tests/tmp/svg-crane-folded-style.svg",
		serializer.serializeToString(svg),
	);
});

test("foldToSvg, 3D fold", () => {
	const foldFile = fs.readFileSync("./tests/files/fold/crane-3d.fold", "utf-8");
	const fold = JSON.parse(foldFile);
	const graph = ear.graph.getFramesByClassName(fold, "foldedForm")[0];
	const svg = ear.convert.foldToSvg(graph, { faces: true });
	const serializer = new xmldom.XMLSerializer();
	fs.writeFileSync(
		"./tests/tmp/svg-crane-3d-folded-style.svg",
		serializer.serializeToString(svg),
	);
});
