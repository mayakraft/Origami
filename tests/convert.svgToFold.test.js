import { expect, test } from "vitest";
import fs from "fs";
import xmldom from "@xmldom/xmldom";
import ear from "../src/index.js";

ear.window = xmldom;

test("convert svgToFold empty svg", () => {
	ear.convert.svgToFold("<svg xmlns='http://www.w3.org/2000/svg'></svg>");
	expect(true).toBe(true);
});

test("convert svgToFold, fish base", () => {
	const testfile = fs.readFileSync("./tests/files/svg/fish.svg", "utf-8");
	const result = ear.convert.svgToFold(testfile);
	expect(result.vertices_coords.length).toBe(11);
	expect(result.edges_vertices.length).toBe(22);
	expect(result.faces_vertices.length).toBe(12);
	const boundaries = result.edges_assignment.filter((a) => a === "B" || a === "b");
	expect(boundaries.length).toBe(8);
});

test("convert svgToFold, crane all assignments", () => {
	const testfile = fs.readFileSync(
		"./tests/files/svg/crane-cp-all-assignments.svg",
		"utf-8",
	);
	const result = ear.convert.svgToFold(testfile);
	expect(result.vertices_coords.length).toBe(68);
	expect(result.edges_vertices.length).toBe(187);
	expect(result.faces_vertices.length).toBe(120);
	const b = result.edges_assignment.filter((a) => a === "B" || a === "b");
	const m = result.edges_assignment.filter((a) => a === "M" || a === "m");
	const v = result.edges_assignment.filter((a) => a === "V" || a === "v");
	const f = result.edges_assignment.filter((a) => a === "F" || a === "f");
	const u = result.edges_assignment.filter((a) => a === "U" || a === "u");
	const j = result.edges_assignment.filter((a) => a === "J" || a === "j");
	const c = result.edges_assignment.filter((a) => a === "C" || a === "c");
	expect(b.length).toBe(14);
	expect(m.length).toBe(61);
	expect(v.length).toBe(42);
	expect(f.length).toBe(8);
	expect(u.length).toBe(14);
	expect(j.length).toBe(46);
	expect(c.length).toBe(2);
});

test("convert svgToFold, crane all assignments", () => {
	const svg01 = fs.readFileSync("./tests/files/svg/backslash-01.svg", "utf-8");
	const svg02 = fs.readFileSync("./tests/files/svg/backslash-02.svg", "utf-8");
	const svg03 = fs.readFileSync("./tests/files/svg/backslash-03.svg", "utf-8");
	const svg04 = fs.readFileSync("./tests/files/svg/backslash-04.svg", "utf-8");
	const svg05 = fs.readFileSync("./tests/files/svg/backslash-05.svg", "utf-8");
	const svg06 = fs.readFileSync("./tests/files/svg/backslash-06.svg", "utf-8");
	const svg07 = fs.readFileSync("./tests/files/svg/backslash-07.svg", "utf-8");
	const svg08 = fs.readFileSync("./tests/files/svg/backslash-08.svg", "utf-8");
	const svg09 = fs.readFileSync("./tests/files/svg/backslash-09.svg", "utf-8");
	const svg10 = fs.readFileSync("./tests/files/svg/backslash-10.svg", "utf-8");
	const res01 = ear.convert.svgToFold(svg01);
	const res02 = ear.convert.svgToFold(svg02);
	const res03 = ear.convert.svgToFold(svg03);
	const res04 = ear.convert.svgToFold(svg04);
	const res05 = ear.convert.svgToFold(svg05);
	const res06 = ear.convert.svgToFold(svg06);
	const res07 = ear.convert.svgToFold(svg07);
	const res08 = ear.convert.svgToFold(svg08);
	const res09 = ear.convert.svgToFold(svg09);
	const res10 = ear.convert.svgToFold(svg10);
	expect(res01.vertices_coords.length).toBe(7);
	expect(res01.edges_vertices.length).toBe(10);
	expect(res01.faces_vertices.length).toBe(4);

	expect(res02.vertices_coords.length).toBe(7);
	expect(res02.edges_vertices.length).toBe(10);
	expect(res02.faces_vertices.length).toBe(4);

	expect(res03.vertices_coords.length).toBe(7);
	expect(res03.edges_vertices.length).toBe(10);
	expect(res03.faces_vertices.length).toBe(4);

	expect(res04.vertices_coords.length).toBe(7);
	expect(res04.edges_vertices.length).toBe(10);
	expect(res04.faces_vertices.length).toBe(4);

	expect(res05.vertices_coords.length).toBe(7);
	expect(res05.edges_vertices.length).toBe(10);
	expect(res05.faces_vertices.length).toBe(4);

	expect(res06.vertices_coords.length).toBe(7);
	expect(res06.edges_vertices.length).toBe(10);
	expect(res06.faces_vertices.length).toBe(4);

	// expect(res07.vertices_coords.length).toBe(7);
	// expect(res07.edges_vertices.length).toBe(10);
	// expect(res07.faces_vertices.length).toBe(4);

	expect(res08.vertices_coords.length).toBe(7);
	expect(res08.edges_vertices.length).toBe(10);
	expect(res08.faces_vertices.length).toBe(4);

	expect(res09.vertices_coords.length).toBe(7);
	expect(res09.edges_vertices.length).toBe(10);
	expect(res09.faces_vertices.length).toBe(4);

	expect(res10.vertices_coords.length).toBe(7);
	expect(res10.edges_vertices.length).toBe(10);
	expect(res10.faces_vertices.length).toBe(4);

	expect(res01.edges_assignment.filter((a) => a === "B" || a === "b").length).toBe(6);
	expect(res01.edges_assignment.filter((a) => a === "V" || a === "v").length).toBe(2);
	expect(res01.edges_assignment.filter((a) => a === "F" || a === "f").length).toBe(2);

	expect(res02.edges_assignment.filter((a) => a === "B" || a === "b").length).toBe(6);
	expect(res02.edges_assignment.filter((a) => a === "V" || a === "v").length).toBe(2);
	expect(res02.edges_assignment.filter((a) => a === "F" || a === "f").length).toBe(2);

	expect(res03.edges_assignment.filter((a) => a === "B" || a === "b").length).toBe(6);
	expect(res03.edges_assignment.filter((a) => a === "V" || a === "v").length).toBe(2);
	expect(res03.edges_assignment.filter((a) => a === "F" || a === "f").length).toBe(2);

	expect(res04.edges_assignment.filter((a) => a === "B" || a === "b").length).toBe(6);
	expect(res04.edges_assignment.filter((a) => a === "V" || a === "v").length).toBe(2);
	expect(res04.edges_assignment.filter((a) => a === "F" || a === "f").length).toBe(2);

	expect(res05.edges_assignment.filter((a) => a === "B" || a === "b").length).toBe(6);
	expect(res05.edges_assignment.filter((a) => a === "V" || a === "v").length).toBe(2);
	expect(res05.edges_assignment.filter((a) => a === "F" || a === "f").length).toBe(2);

	// expect(res06.edges_assignment.filter(a => a === "B" || a === "b").length).toBe(6);
	// expect(res06.edges_assignment.filter(a => a === "V" || a === "v").length).toBe(2);
	// expect(res06.edges_assignment.filter(a => a === "F" || a === "f").length).toBe(2);

	// expect(res07.edges_assignment.filter(a => a === "B" || a === "b").length).toBe(6);
	// expect(res07.edges_assignment.filter(a => a === "V" || a === "v").length).toBe(2);
	// expect(res07.edges_assignment.filter(a => a === "F" || a === "f").length).toBe(2);

	// expect(res08.edges_assignment.filter(a => a === "B" || a === "b").length).toBe(6);
	// expect(res08.edges_assignment.filter(a => a === "V" || a === "v").length).toBe(2);
	// expect(res08.edges_assignment.filter(a => a === "F" || a === "f").length).toBe(2);

	// expect(res09.edges_assignment.filter(a => a === "B" || a === "b").length).toBe(6);
	// expect(res09.edges_assignment.filter(a => a === "V" || a === "v").length).toBe(2);
	// expect(res09.edges_assignment.filter(a => a === "F" || a === "f").length).toBe(2);

	expect(res10.edges_assignment.filter((a) => a === "B" || a === "b").length).toBe(6);
	expect(res10.edges_assignment.filter((a) => a === "V" || a === "v").length).toBe(2);
	expect(res10.edges_assignment.filter((a) => a === "F" || a === "f").length).toBe(2);
});

// these fail (which is fine), but I can't seem to setup a
// try-catch that won't break the testing environment.

// test("convert svgToFold no param", () => {
// 	let error;
// 	try {
// 		ear.convert.svgToFold();
// 	} catch (err) {
// 		error = err;
// 	}
// 	expect(error).not.toBe(undefined);
// });

// test("convert svgToFold empty", () => {
// 	ear.convert.svgToFold("");
// 	expect(true).toBe(true);
// });

// <svg xmlns="http://www.w3.org/2000/svg" viewBox="-10 -10 20 20" stroke-width="0.2" fill="none">
// <line x1="0" y1="9" x2="0" y2="7.5" stroke="black" />
// <rect x="0" y="0" width="8" height="8" stroke="purple" />
// <rect x="0" y="1" width="6" height="6" stroke="red" />
// <rect x="0" y="2" width="4" height="4" stroke="green" />
// <rect x="0" y="3" width="2" height="2" stroke="blue" />
// <line x1="0" y1="-1" x2="0" y2="2.5" stroke="black" />
// </svg>

test("svgEdgeGraph, overlapping edges", () => {
	const svg = `<svg>
		<line x1="0" y1="9" x2="0" y2="7.5" stroke="black" />
		<rect x="0" y="0" width="8" height="8" stroke="purple" />
		<rect x="0" y="1" width="6" height="6" stroke="red" />
		<rect x="0" y="2" width="4" height="4" stroke="green" />
		<rect x="0" y="3" width="2" height="2" stroke="blue" />
		<line x1="0" y1="-1" x2="0" y2="2.5" stroke="black" />
	</svg>`;
	const graph = ear.convert.svgEdgeGraph(svg);
	fs.writeFileSync(
		"./tests/tmp/svgEdgeGraph-overlapping-edges.fold",
		JSON.stringify(graph, null, 2),
		"utf8",
	);
});
