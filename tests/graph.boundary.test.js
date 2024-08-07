import fs from "fs";
import { expect, test } from "vitest";
import ear from "../src/index.js";

test("boundaries", () => {
	const foldString = fs.readFileSync(
		"./tests/files/fold/disjoint-triangles-3d.fold",
		"utf-8",
	);
	const fold = JSON.parse(foldString);
	const graph = ear.graph.getFramesByClassName(fold, "creasePattern")[0];
	const result = ear.graph.boundaries(graph);
	expect(result[0].vertices.length).toBe(6);
	expect(result[1].vertices.length).toBe(6);
	expect(result[2].vertices.length).toBe(4);
	expect(result[3].vertices.length).toBe(4);
	expect(result[4].vertices.length).toBe(4);
	result.forEach(({ vertices, edges }) => {
		expect(vertices.length).toBe(edges.length);
	});
});

test("bounding box", () => {
	const graph = ear.graph.square();
	const box2d = ear.graph.boundingBox(graph);
	// make 3D
	graph.vertices_coords.forEach((coord, i) => {
		graph.vertices_coords[i] = [...coord, 0];
	});
	const box3d = ear.graph.boundingBox(graph);
	expect(box2d.min.length).toBe(2);
	expect(box2d.max.length).toBe(2);
	expect(box2d.span.length).toBe(2);
	expect(box3d.min.length).toBe(3);
	expect(box3d.max.length).toBe(3);
	expect(box3d.span.length).toBe(3);
	expect(box3d.min[2]).toBeCloseTo(0);
	expect(box3d.max[2]).toBeCloseTo(0);
	expect(box3d.span[2]).toBeCloseTo(0);
	graph.vertices_coords.push([1, 1, 1]);
	const box3dUpdate = ear.graph.boundingBox(graph);
	expect(box3dUpdate.min[2]).toBeCloseTo(0);
	expect(box3dUpdate.max[2]).toBeCloseTo(1);
	expect(box3dUpdate.span[2]).toBeCloseTo(1);
});

test("bounding vertices", () => {
	const fold = fs.readFileSync("./tests/files/fold/bird-disjoint-edges.fold", "utf-8");
	const graph = JSON.parse(fold);
	const boundaryVertices = ear.graph.boundaryVertices(graph);
	expect(JSON.stringify(boundaryVertices)).toBe(
		JSON.stringify([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]),
	);
	graph.edges_assignment = graph.edges_assignment.map(() => "U");
	const boundaryVertices2 = ear.graph.boundaryVertices(graph);
	expect(JSON.stringify(boundaryVertices2)).toBe(JSON.stringify([]));
	delete graph.edges_assignment;
	const boundaryVertices3 = ear.graph.boundaryVertices(graph);
	expect(JSON.stringify(boundaryVertices3)).toBe(JSON.stringify([]));
});

test("planar boundary", () => {
	const fish = ear.graph.fish();
	delete fish.edges_assignment;
	delete fish.edges_foldAngle;
	const result = ear.graph.planarBoundary(fish);
	expect(JSON.stringify(result.vertices)).toBe(JSON.stringify([2, 3, 4, 5, 6, 7, 0, 1]));
	expect(JSON.stringify(result.edges)).toBe(JSON.stringify([2, 3, 4, 5, 6, 7, 0, 1]));
});

test("planar boundaries, multiple boundaries", () => {
	const foldString = fs.readFileSync(
		"./tests/files/fold/disjoint-triangles-3d.fold",
		"utf-8",
	);
	const fold = JSON.parse(foldString);
	const graph = ear.graph.getFramesByClassName(fold, "creasePattern")[0];
	const singleBoundary = ear.graph.planarBoundary(graph);
	const boundaries = ear.graph.planarBoundaries(graph);
	const allEdges = boundaries.flatMap((el) => el.edges);
	expect(singleBoundary.edges.length < allEdges.length).toBe(true);
	expect(allEdges.length).toBe(24);
});
