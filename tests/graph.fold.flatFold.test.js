import { expect, test } from "vitest";
import fs from "fs";
import ear from "../src/index.js";

test("flatFold, square, valley fold", () => {
	const graph = ear.graph.square();
	ear.graph.flatFold(graph, { vector: [1, 0.1], origin: [0.5, 0.5] });
	expect(ear.graph.countVertices(graph)).toBe(6);
	expect(ear.graph.countEdges(graph)).toBe(7);
	expect(ear.graph.countFaces(graph)).toBe(2);
	ear.graph.flatFold(graph, { vector: [0.1, 1], origin: [0.5, 0.5] });
	expect(ear.graph.countVertices(graph)).toBe(9);
	expect(ear.graph.countEdges(graph)).toBe(12);
	expect(ear.graph.countFaces(graph)).toBe(4);
	fs.writeFileSync("./tests/tmp/flatFold-square.fold", JSON.stringify(graph));
});

test("flatFold, crane", () => {
	const foldfile = fs.readFileSync("./tests/files/fold/crane.fold", "utf-8");
	const fold = JSON.parse(foldfile);
	const graph = ear.graph.getFramesByClassName(fold, "creasePattern")[0];

	ear.graph.flatFold(graph, { vector: [1, -1], origin: [0.45, 0.45] });
	const folded = {
		...graph,
		vertices_coords: ear.graph.makeVerticesCoordsFlatFolded(graph),
	};

	expect(ear.graph.countVertices(folded)).toBe(88);
	expect(ear.graph.countEdges(folded)).toBe(175);
	expect(ear.graph.countFaces(folded)).toBe(88);

	fs.writeFileSync("./tests/tmp/flatFold-crane-cp.fold", JSON.stringify(graph));
	fs.writeFileSync("./tests/tmp/flatFold-crane-folded.fold", JSON.stringify(folded));
});
