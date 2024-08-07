import fs from "fs";
import { expect, test } from "vitest";
import ear from "../src/index.js";

test("makeFacesWinding", () => {
	const foldfile = fs.readFileSync("./tests/files/fold/crane-cp.fold", "utf-8");
	const graph = JSON.parse(foldfile);
	const vertices_coords = ear.graph.makeVerticesCoordsFlatFolded(graph);
	const folded = {
		...graph,
		vertices_coords,
	};
	ear.graph.makeFacesWinding(graph).forEach((side) => expect(side).toBe(true));
	const foldedWinding = ear.graph.makeFacesWinding(folded);
	// difference between up and flipped should be 1. (at least less than 5)
	const up = foldedWinding.filter((a) => a).length;
	const down = foldedWinding.filter((a) => !a).length;
	expect(Math.abs(up - down) < 5).toBe(true);
});

test("makeFacesWindingFromMatrix and makeFacesWindingFromMatrix2", () => {
	const foldfile = fs.readFileSync("./tests/files/fold/crane-cp.fold", "utf-8");
	const graph = JSON.parse(foldfile);
	const vertices_coords = ear.graph.makeVerticesCoordsFlatFolded(graph);
	const folded = {
		...graph,
		vertices_coords,
	};
	const foldedWinding = ear.graph.makeFacesWinding(folded);
	const cpMatrices = ear.graph.makeFacesMatrix(graph);
	const cpMatrices2 = ear.graph.makeFacesMatrix2(graph);
	const foldedMatrices = ear.graph.makeFacesMatrix(folded);
	const foldedMatrices2 = ear.graph.makeFacesMatrix2(folded);
	const cpMatrixWinding = ear.graph.makeFacesWindingFromMatrix(cpMatrices);
	const cpMatrix2Winding = ear.graph.makeFacesWindingFromMatrix2(cpMatrices2);
	const foldedMatrixWinding = ear.graph.makeFacesWindingFromMatrix(foldedMatrices);
	const foldedMatrix2Winding = ear.graph.makeFacesWindingFromMatrix2(foldedMatrices2);
	foldedWinding.forEach((side, i) => expect(side).toBe(cpMatrixWinding[i]));
	foldedWinding.forEach((side, i) => expect(side).toBe(cpMatrix2Winding[i]));
	foldedWinding.forEach((side, i) => expect(side).toBe(foldedMatrixWinding[i]));
	foldedWinding.forEach((side, i) => expect(side).toBe(foldedMatrix2Winding[i]));
});

test("makeFacesWinding", () => {
	const foldfile = fs.readFileSync("./tests/files/fold/kissing-squares.fold", "utf-8");
	const graph = JSON.parse(foldfile);
	const vertices_coords = ear.graph.makeVerticesCoordsFlatFolded(graph);
	const folded = {
		...graph,
		vertices_coords,
	};
	ear.graph.makeFacesWinding(graph).forEach((side) => expect(side).toBe(true));
	const foldedWinding = ear.graph.makeFacesWinding(folded);
	expect(foldedWinding[0]).toBe(true);
	expect(foldedWinding[1]).toBe(false);
	expect(foldedWinding[2]).toBe(true);
	expect(foldedWinding[3]).toBe(false);
});
