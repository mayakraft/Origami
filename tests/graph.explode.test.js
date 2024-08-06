import fs from "fs";
import { expect, test } from "vitest";
import ear from "../src/index.js";

test("explodeFaces and explodeEdges", () => {
	const bird = ear.graph.bird();
	const explodeEdges = ear.graph.explodeEdges(bird);
	const explodeFaces = ear.graph.explodeFaces(bird);
	expect(explodeEdges.edges_vertices.length).toBe(bird.edges_vertices.length);
	expect(explodeFaces.faces_vertices.length).toBe(bird.faces_vertices.length);
	explodeFaces.faces_vertices.flat().forEach((v, i) => expect(v).toBe(i));
});

test("empty graphs", () => {
	expect(ear.graph.explodeEdges({})).toMatchObject({});
	expect(ear.graph.explodeFaces({})).toMatchObject({});
});

test("simple graphs", () => {
	const edgesOnly = ear.graph.explodeEdges({
		edges_vertices: [
			[0, 1],
			[1, 2],
		],
	});
	const facesOnly = ear.graph.explodeFaces({
		faces_vertices: [
			[0, 1, 2],
			[1, 3, 2],
		],
	});
	expect(JSON.stringify(edgesOnly.edges_vertices.flat())).toBe(
		JSON.stringify([0, 1, 2, 3]),
	);
	expect(JSON.stringify(facesOnly.faces_vertices.flat())).toBe(
		JSON.stringify([0, 1, 2, 3, 4, 5]),
	);
});

test("explodeFaces 3D", () => {
	const graph = JSON.parse(
		fs.readFileSync("./tests/files/fold/bird-base-3d.fold", "utf-8"),
	);
	ear.graph.explodeEdges(graph);
	ear.graph.explodeFaces(graph);
	expect(true).toBe(true);
});
