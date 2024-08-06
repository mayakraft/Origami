import { expect, test } from "vitest";
import ear from "../src/index.js";

// because there are no faces to build edges_faces, the question is:
// should edges_faces be empty, or contain empty arrays one for each edge
test("no face graph", () => {
	const origami = ear.graph({
		vertices_coords: [
			[0, 0],
			[0.5, 0.5],
			[1, 0],
		],
		edges_vertices: [
			[0, 1],
			[1, 2],
		],
		edges_assignment: ["B", "B"],
	});

	expect(origami.edges_faces.length).toBe(2);
	expect(origami.edges_faces[0].length).toBe(0);
	expect(origami.edges_faces[1].length).toBe(0);
});

test("edges_faces square", () => {
	const result = ear.graph.makeEdgesFaces({
		faces_edges: [
			[0, 4, 3],
			[1, 2, 4],
		],
	});
	expect(result[0]).toEqual(expect.arrayContaining([0]));
	expect(result[1]).toEqual(expect.arrayContaining([1]));
	expect(result[2]).toEqual(expect.arrayContaining([1]));
	expect(result[3]).toEqual(expect.arrayContaining([0]));
	expect(result[4]).toEqual(expect.arrayContaining([0, 1]));
});

test("edges_faces", () => {
	const result = ear.graph.makeEdgesFaces({
		faces_edges: [
			[8, 7, 6],
			[5, 4, 3],
		],
	});
	expect(result[0].length).toBe(0);
	expect(result[1].length).toBe(0);
	expect(result[2].length).toBe(0);
	expect(result[3]).toEqual(expect.arrayContaining([1]));
	expect(result[4]).toEqual(expect.arrayContaining([1]));
	expect(result[5]).toEqual(expect.arrayContaining([1]));
	expect(result[6]).toEqual(expect.arrayContaining([0]));
	expect(result[7]).toEqual(expect.arrayContaining([0]));
	expect(result[8]).toEqual(expect.arrayContaining([0]));
});

test("edges faces direction", () => {
	const graph = {
		vertices_coords: [
			[0, 0],
			[1, 0],
			[1, 1],
			[0, 1],
		],
		edges_vertices: [
			[0, 1],
			[1, 2],
			[2, 3],
			[3, 0],
			[2, 0],
		],
		edges_assignment: ["B", "B", "B", "B", "M"],
	};
	// prepare
	const planar_faces = ear.graph.makePlanarFaces(graph);
	graph.faces_vertices = planar_faces.faces_vertices;
	graph.faces_edges = planar_faces.faces_edges;

	const edges_faces1 = ear.graph.makeEdgesFaces(graph);
	expect(edges_faces1[4][0]).toBe(0);
	expect(edges_faces1[4][1]).toBe(1);

	graph.edges_vertices = [
		[0, 1],
		[1, 2],
		[2, 3],
		[3, 0],
		[0, 2],
	];

	const edges_faces2 = ear.graph.makeEdgesFaces(graph);
	expect(edges_faces2[4][0]).toBe(1);
	expect(edges_faces2[4][1]).toBe(0);
});
