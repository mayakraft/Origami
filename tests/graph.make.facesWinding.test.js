import { expect, test } from "vitest";
import fs from "fs";
import ear from "../src/index.js";

test("faces winding, flat cp", () => {
	const foldfile = fs.readFileSync("./tests/files/fold/crane-cp.fold");
	const crane = JSON.parse(foldfile);
	const windings = ear.graph.makeFacesWinding(crane);
	// all must be true (counter-clockwise)
	expect(windings.reduce((a, b) => a && b, true)).toBe(true);
});

test("faces winding, folded", () => {
	const foldfile = fs.readFileSync("./tests/files/fold/crane-cp.fold");
	const crane = JSON.parse(foldfile);
	const folded = ear.graph(crane).folded();
	const windings = ear.graph.makeFacesWinding(folded);
	const up = windings.filter((a) => a === true).length;
	const down = windings.filter((a) => a === false).length;
	// about half of the faces (within 5%) should be flipped
	expect(Math.abs(up - down) < crane.faces_vertices.length * 0.05).toBe(true);
});

test("faces_coloring", () => {
	// const foldfile = fs.readFileSync("./tests/files/fold/crane-cp.fold");
	// const crane = JSON.parse(foldfile);
	expect(true).toBe(true);
	// todo bring this back

	// const tree = ear.graph.makeFaceSpanningTree(crane);
	// const winding = ear.graph.makeFacesWinding(crane);
	// crane.faces_matrix = ear.graph.makeFacesMatrix(crane);
	// const coloring2 = ear.graph.makeFacesWindingFromMatrix(crane.faces_matrix);
	// expect(winding.length).toBe(coloring2.length);
	// winding.forEach((color, i) => expect(color).toBe(coloring2[i]));
});
