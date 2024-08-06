import fs from "fs";
import { expect, test } from "vitest";
import xmldom from "@xmldom/xmldom";
import ear from "../src/index.js";

ear.window = xmldom;

// this fails and will throw an error even inside the testing environment
// test("convert opxToFold no param", () => {
// 	let error;
// 	try {
// 		ear.convert.opxToFold();
// 	} catch (err) {
// 		error = err;
// 	}
// 	expect(error).not.toBe(undefined);
// });

test("opxToFold, empty xml", () => {
	expect(ear.convert.opxToFold("<void></void>")).toBeUndefined();
});

test("opxToFold, almost empty", () => {
	ear.convert.opxToFold("<void></void>");
	expect(true).toBe(true);
});

test("opxToFold, invalid", () => {
	ear.convert.opxToFold(`<?xml version="1.0" encoding="UTF-8"?>
<java version="1.5.0_13" class="java.beans.XMLDecoder">
 <object class="oripa.DataSet"></object>
</java>
`);
	expect(true).toBe(true);
});

test("opxToFold, file metadata", () => {
	const oneCreaseOPX = fs.readFileSync("./tests/files/opx/one-crease.opx", "utf-8");
	expect(ear.convert.opxToFold(oneCreaseOPX)).toMatchObject({
		file_spec: 1.2,
		file_creator: "Rabbit Ear",
		file_classes: ["singleModel"],
		frame_classes: ["creasePattern"],
		file_title: "one single crease",
		file_author: "Kraft, traditional",
		file_description: "no references, this is a square with one diagonal crease",
	});
});

test("opxToFold, test file", () => {
	const testfile = fs.readFileSync("./tests/files/opx/test.opx", "utf-8");
	const result = ear.convert.opxToFold(testfile);
	expect(result.vertices_coords.length).toBe(8);
	expect(result.edges_vertices.length).toBe(10);
	expect(result.faces_vertices.length).toBe(3);
	const boundaries = result.edges_assignment.filter((a) => a === "B" || a === "b");
	expect(boundaries.length > 0 && boundaries.length < result.edges_vertices.length).toBe(
		true,
	);
});

test("opxToFold, old OPX file format", () => {
	const birdBase = fs.readFileSync("./tests/files/opx/bird-base-2012.opx", "utf-8");
	const result = ear.convert.opxToFold(birdBase);
	expect(result.vertices_coords.length).toBe(9);
	expect(result.edges_vertices.length).toBe(20);
	expect(result.faces_vertices.length).toBe(12);
	const boundaries = result.edges_assignment.filter((a) => a === "B" || a === "b");
	expect(boundaries.length > 0 && boundaries.length < result.edges_vertices.length).toBe(
		true,
	);
});

test("opxToFold, bird base", () => {
	const birdBase = fs.readFileSync("./tests/files/opx/bird-base.opx", "utf-8");
	const result = ear.convert.opxToFold(birdBase);
	expect(result.vertices_coords.length).toBe(13);
	expect(result.edges_vertices.length).toBe(28);
	expect(result.faces_vertices.length).toBe(16);
	const boundaries = result.edges_assignment.filter((a) => a === "B" || a === "b");
	expect(boundaries.length > 0 && boundaries.length < result.edges_vertices.length).toBe(
		true,
	);
});
