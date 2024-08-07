import { expect, test } from "vitest";
import ear from "../src/index.js";

test("duplicate edge", () => {
	const graph = ear.graph({
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
			[2, 1],
		],
		edges_assignment: ["B", "B", "B", "B", "B"],
	});
	expect(graph.edges_vertices.length).toBe(5);
	graph.clean();
	expect(graph.edges_vertices.length).toBe(4);
});

test("circular edge", () => {
	const graph = ear.graph({
		vertices_coords: [
			[0, 0],
			[1, 0],
			[1, 1],
			[0, 1],
		],
		edges_vertices: [
			[0, 1],
			[1, 2],
			[3, 3],
			[2, 3],
			[3, 0],
		],
		edges_assignment: ["B", "B", "B", "B", "B"],
	});
	expect(graph.edges_vertices.length).toBe(5);
	graph.clean();
	expect(graph.edges_vertices.length).toBe(4);
});

test("circular, duplicate edges and isolated, duplicate vertices", () => {
	// these are all permutations of the same graph.
	const graph1 = ear.graph({
		vertices_coords: [
			[0, 0],
			[1, 1],
			[1, 0],
			[0.5, 0.5],
			[1, 1],
			[0, 1],
		],
		edges_vertices: [
			[0, 2],
			[2, 1],
			[2, 4],
			[3, 3],
			[4, 5],
			[5, 0],
		],
		edges_assignment: ["B", "B", "B", "M", "B", "B"],
	});
	const res1 = graph1.clean();
	expect(JSON.stringify(res1.vertices.map)).toBe(JSON.stringify([0, 1, 2, null, 1, 3]));
	expect(JSON.stringify(res1.vertices.remove)).toBe(JSON.stringify([4, 3]));
	expect(JSON.stringify(res1.edges.map)).toBe(JSON.stringify([0, 1, 1, null, 2, 3]));
	expect(JSON.stringify(res1.edges.remove)).toBe(JSON.stringify([3, 2]));

	const graph2 = ear.graph({
		vertices_coords: [
			[0, 0],
			[1, 1],
			[1, 0],
			[0.5, 0.5],
			[1, 1],
			[0, 1],
		],
		edges_vertices: [
			[0, 2],
			[2, 1],
			[3, 3],
			[4, 5],
			[5, 0],
			[2, 4],
		],
		edges_assignment: ["B", "B", "M", "B", "B", "B"],
	});
	const res2 = graph2.clean();
	expect(JSON.stringify(res2.vertices.map)).toBe(JSON.stringify([0, 1, 2, null, 1, 3]));
	expect(JSON.stringify(res2.vertices.remove)).toBe(JSON.stringify([4, 3]));
	expect(JSON.stringify(res2.edges.map)).toBe(JSON.stringify([0, 1, null, 2, 3, 1]));
	expect(JSON.stringify(res2.edges.remove)).toBe(JSON.stringify([2, 5]));
});
