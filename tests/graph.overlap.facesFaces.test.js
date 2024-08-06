import { expect, test } from "vitest";
import fs from "fs";
import ear from "../src/index.js";

test("getFacesFacesOverlap strip weave", () => {
	const foldfile = fs.readFileSync("./tests/files/fold/strip-weave.fold", "utf-8");
	const fold = JSON.parse(foldfile);
	const folded = ear.graph.getFramesByClassName(fold, "foldedForm")[0];
	ear.graph.populate(folded);

	const result = ear.graph.getFacesFacesOverlap(folded);
	result.forEach((arr) => arr.sort((a, b) => a - b));
	expect(result).toMatchObject([
		[1, 4],
		[0, 2, 4],
		[1, 3, 5],
		[2, 6],
		[0, 1, 5],
		[2, 4, 6],
		[3, 5],
	]);
});

test("getFacesFacesOverlap four panel square", () => {
	const foldfile = fs.readFileSync("./tests/files/fold/panels-4x2.fold", "utf-8");
	const fold = JSON.parse(foldfile);
	const folded = ear.graph.getFramesByClassName(fold, "foldedForm")[0];
	ear.graph.populate(folded);

	const result = ear.graph.getFacesFacesOverlap(folded);
	result.forEach((arr) => arr.sort((a, b) => a - b));
	expect(result).toMatchObject([
		[1, 2, 3],
		[0, 2, 3],
		[0, 1, 3],
		[0, 1, 2],
		[5, 6, 7],
		[4, 6, 7],
		[4, 5, 7],
		[4, 5, 6],
	]);
});

test("getFacesFacesOverlap zig-zag panels", () => {
	const foldfile = fs.readFileSync("./tests/files/fold/panels-zig-zag.fold", "utf-8");
	const fold = JSON.parse(foldfile);
	const folded = ear.graph.getFramesByClassName(fold, "foldedForm")[0];
	ear.graph.populate(folded);

	const result = ear.graph.getFacesFacesOverlap(folded);
	result.forEach((arr) => arr.sort((a, b) => a - b));
	expect(result).toMatchObject([
		[1, 2, 3, 4],
		[0, 2, 3, 4],
		[0, 1, 3, 4],
		[0, 1, 2, 4],
		[0, 1, 2, 3],
	]);
});

test("getFacesFacesOverlap bird base, faces-faces", () => {
	const cp = ear.graph.bird();
	const folded = {
		...cp,
		vertices_coords: ear.graph.makeVerticesCoordsFlatFolded(cp),
	};
	ear.graph.populate(folded);

	const result = ear.graph.getFacesFacesOverlap(folded);
	result.forEach((arr) => arr.sort((a, b) => a - b));
	expect(result).toMatchObject([
		[1, 4, 5, 6, 7, 8, 11],
		[0, 4, 5, 6, 7, 8, 11],
		[3, 9, 10, 12, 13, 14, 15],
		[2, 9, 10, 12, 13, 14, 15],
		[0, 1, 5, 6, 7, 8, 11],
		[0, 1, 4, 6, 7, 8, 11],
		[0, 1, 4, 5, 7, 8, 11, 16, 19],
		[0, 1, 4, 5, 6, 8, 11, 16, 19],
		[0, 1, 4, 5, 6, 7, 11],
		[2, 3, 10, 12, 13, 14, 15],
		[2, 3, 9, 12, 13, 14, 15],
		[0, 1, 4, 5, 6, 7, 8],
		[2, 3, 9, 10, 13, 14, 15],
		[2, 3, 9, 10, 12, 14, 15],
		[2, 3, 9, 10, 12, 13, 15, 17, 18],
		[2, 3, 9, 10, 12, 13, 14, 17, 18],
		[6, 7, 19],
		[14, 15, 18],
		[14, 15, 17],
		[6, 7, 16],
	]);
});

test("edges-faces bird base, edges-edges", () => {
	const cp = ear.graph.bird();
	const folded = {
		...cp,
		vertices_coords: ear.graph.makeVerticesCoordsFlatFolded(cp),
	};
	ear.graph.populate(folded);
	expect(ear.graph.getEdgesEdgesCollinearOverlap(folded).flat().length).toBe(194);
});

test("getFacesFacesOverlap kabuto", () => {
	const foldfile = fs.readFileSync("./tests/files/fold/kabuto.fold", "utf-8");
	const fold = JSON.parse(foldfile);
	const folded = ear.graph.getFramesByClassName(fold, "foldedForm")[0];
	ear.graph.populate(folded);

	const expectedJSON = fs.readFileSync(
		"./tests/files/json/kabuto-faces-faces-overlap.json",
		"utf-8",
	);
	const expected = JSON.parse(expectedJSON);

	const result = ear.graph.getFacesFacesOverlap(folded);
	result.forEach((arr) => arr.sort((a, b) => a - b));
	expect(result).toMatchObject(expected);
});

test("getFacesFacesOverlap crane", () => {
	const foldfile = fs.readFileSync("./tests/files/fold/crane.fold", "utf-8");
	const fold = JSON.parse(foldfile);
	const folded = ear.graph.getFramesByClassName(fold, "foldedForm")[0];
	ear.graph.populate(folded);

	const expectedJSON = fs.readFileSync(
		"./tests/files/json/crane-faces-faces-overlap.json",
		"utf-8",
	);
	const expected = JSON.parse(expectedJSON);

	const result = ear.graph.getFacesFacesOverlap(folded);
	result.forEach((arr) => arr.sort((a, b) => a - b));
	expect(result).toMatchObject(expected);
});

test("getFacesFacesOverlap Kraft bird", () => {
	const foldfile = fs.readFileSync("./tests/files/fold/kraft-bird-base.fold", "utf-8");
	const cp = JSON.parse(foldfile);
	const folded = {
		...cp,
		vertices_coords: ear.graph.makeVerticesCoordsFlatFolded(cp),
	};
	ear.graph.populate(folded);

	const expectedJSON = fs.readFileSync(
		"./tests/files/json/kraft-bird-faces-faces-overlap.json",
		"utf-8",
	);
	const expected = JSON.parse(expectedJSON);

	const result = ear.graph.getFacesFacesOverlap(folded);
	result.forEach((arr) => arr.sort((a, b) => a - b));
	expect(result).toMatchObject(expected);
});
