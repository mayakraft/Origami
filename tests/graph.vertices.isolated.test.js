import { expect, test } from "vitest";
import ear from "../src/index.js";

test("isolated vertex", () => {
	const graph = {
		vertices_coords: [
			[0, 0],
			[0.5, 0.5],
			[1, 0],
			[1, 1],
			[0, 1],
		],
		edges_vertices: [
			[0, 2],
			[2, 3],
			[3, 4],
			[4, 0],
		],
		edges_assignment: ["B", "B", "B", "B"],
		faces_vertices: [[0, 2, 3, 4]],
	};
	ear.graph.populate(graph);
	expect(graph.vertices_coords.length).toBe(5);
	expect(graph.vertices_edges.length).toBe(5);
	expect(graph.vertices_faces.length).toBe(5);
	expect(graph.vertices_vertices.length).toBe(5);
	expect(graph.faces_vertices.length).toBe(1);
	expect(graph.faces_edges.length).toBe(1);
	expect(graph.faces_faces.length).toBe(1);
	expect(JSON.stringify(graph.faces_vertices[0])).toBe(JSON.stringify([0, 2, 3, 4]));

	const res = ear.graph.removeIsolatedVertices(graph);

	expect(graph.vertices_coords.length).toBe(4);
	expect(graph.vertices_edges.length).toBe(4);
	expect(graph.vertices_faces.length).toBe(4);
	expect(graph.vertices_vertices.length).toBe(4);
	expect(JSON.stringify(graph.faces_vertices[0])).toBe(JSON.stringify([0, 1, 2, 3]));

	expect(res.remove[0]).toBe(1);
	expect(JSON.stringify(res.map)).toBe(JSON.stringify([0, undefined, 1, 2, 3]));
});

test("isolated vertices", () => {
	const graph = {
		file_spec: 1.1,
		vertices_coords: [
			[0, 1],
			[1, 0],
			[0.2928932188134524, 0.2928932188134526],
			[0, 0],
			[0.7071067811865475, 0.7071067811865476],
			[1, 1],
		],
		edges_vertices: [
			[1, 3],
			[0, 3],
			[1, 5],
			[0, 5],
		],
		edges_assignment: ["B", "B", "B", "B"],
		edges_foldAngle: [0, 0, 0, 0],
		edges_length: [1, 1, 1, 1],
		vertices_vertices: [[3, 5], [5, 3], [], [1, 0], [], [1, 0]],
		faces_vertices: [[5, 0, 3, 1]],
		faces_edges: [[3, 1, 0, 2]],
		edges_faces: [[0], [0], [0], [0]],
		vertices_faces: [[0], [0], [], [0], [], [0]],
		faces_faces: [[]],
		vertices_edges: [[1, 3], [0, 2], null, [0, 1], null, [2, 3]],
	};

	const isolated = ear.graph.isolatedVertices(graph);
	expect(isolated.length).toBe(2);
	expect(isolated[0]).toBe(2);
	expect(isolated[1]).toBe(4);
});
