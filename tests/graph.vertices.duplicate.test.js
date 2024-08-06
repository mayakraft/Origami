import fs from "fs";
import { expect, test } from "vitest";
import ear from "../src/index.js";

test("duplicateVertices", () => {
	const graph = JSON.parse(
		fs.readFileSync("./tests/files/fold/bird-disjoint-edges.fold", "utf-8"),
	);
	const duplicates = ear.graph.duplicateVertices(graph);
	// every point in this graph should be duplicate.
	expect(duplicates.length).toBe(ear.graph.bird().vertices_coords.length);
	expect(duplicates.flat().length).toBe(graph.vertices_coords.length);
});

test("clusters", () => {
	const clusters = ear.graph.getVerticesClusters({
		vertices_coords: [
			[0, 0],
			[1, 1],
			[0.00000000001, 0],
			[0.2, 0.2],
			[0.20000000001, 0.2000000001],
			[0.20000000001, 0.4],
		],
	});
	expect(clusters[0][0]).toBe(0);
	expect(clusters[0][1]).toBe(2);
	expect(clusters[1][0]).toBe(3);
	expect(clusters[1][1]).toBe(4);
	expect(clusters[2][0]).toBe(5);
	expect(clusters[3][0]).toBe(1);
});

test("clusters, inside epsilon", () => {
	const epsilon = ear.math.EPSILON * 0.9;
	const clusters = ear.graph.getVerticesClusters({
		vertices_coords: [
			[0.5, 0.5],
			[0.5, 0.5 + epsilon],
			[0.5, 0.5 + epsilon * 2],
			[0.5, 0.5 + epsilon * 3],
			[0.5, 0.5 + epsilon * 4],
			[0.5, 0.5 + epsilon * 5],
			[0.5, 0.5 + epsilon * 6],
		],
	});
	expect(clusters.length).toBe(1);
	expect(clusters[0].length).toBe(7);
});

test("clusters, outside epsilon", () => {
	const epsilon = ear.math.EPSILON * 1.1;
	const clusters = ear.graph.getVerticesClusters({
		vertices_coords: [
			[0.5, 0.5],
			[0.5, 0.5 + epsilon],
			[0.5, 0.5 + epsilon * 2],
			[0.5, 0.5 + epsilon * 3],
			[0.5, 0.5 + epsilon * 4],
			[0.5, 0.5 + epsilon * 5],
			[0.5, 0.5 + epsilon * 6],
		],
	});
	expect(clusters.length).toBe(7);
});

test("merge duplicate vertices", () => {
	const graph = {
		vertices_coords: [
			[0, 0],
			[1, 1],
			[0.00000000001, 0],
			[0.2, 0.2],
			[0.20000000001, 0.2000000001],
			[0.20000000001, 0.4],
		],
	};
	ear.graph.removeDuplicateVertices(graph);
	expect(graph.vertices_coords.length).toBe(4);
});

test("merge duplicate vertices, inside epsilon, point averaging", () => {
	const epsilon = ear.math.EPSILON * 0.9;
	const graph = {
		vertices_coords: [
			[0.5, 0.5],
			[0.5, 0.5 + epsilon],
			[0.5, 0.5 + epsilon * 2],
			[0.5, 0.5 + epsilon * 3],
			[0.5, 0.5 + epsilon * 4],
			[0.5, 0.5 + epsilon * 5],
			[0.5, 0.5 + epsilon * 6],
		],
	};
	ear.graph.removeDuplicateVertices(graph);
	expect(graph.vertices_coords.length).toBe(1);
	// vertices should be averaged together, the y value should be halfway
	// between 0 and 6 epsilons
	expect(graph.vertices_coords[0][1] > 0.5 + epsilon * 2).toBe(true);
	expect(graph.vertices_coords[0][1] < 0.5 + epsilon * 4).toBe(true);
});

test("merge duplicate vertices, outside epsilon", () => {
	const epsilon = ear.math.EPSILON * 1.1;
	const graph = {
		vertices_coords: [
			[0.5, 0.5],
			[0.5, 0.5 + epsilon],
			[0.5, 0.5 + epsilon * 2],
			[0.5, 0.5 + epsilon * 3],
			[0.5, 0.5 + epsilon * 4],
			[0.5, 0.5 + epsilon * 5],
			[0.5, 0.5 + epsilon * 6],
		],
	};
	ear.graph.removeDuplicateVertices(graph);
	expect(graph.vertices_coords.length).toBe(7);
});

// merge duplicate vertices, graph with both 2D and 3D vertices
// where the first vertex is a 2D vertex.
// this graph is considered poorly formed.
// all vertices will be treated as 2D. and this will remove vertices
// that aren't actually duplicate. not good but technically correct.
test("removeDuplicateVertices with 2D and 3D vertices", () => {
	const graph = {
		vertices_coords: [
			[0, 0],
			[1, 0],
			[2, 0],
			[1, 0, 1],
			[2, 0, -2],
			[0, 0, 3],
		],
		edges_vertices: [
			[0, 1],
			[1, 2],
			[2, 3],
			[3, 4],
			[4, 0],
		],
	};
	expect(graph.vertices_coords.length).toBe(6);
	expect(graph.edges_vertices.length).toBe(5);
	ear.graph.removeDuplicateVertices(graph);
	expect(graph.vertices_coords.length).toBe(3);
	expect(graph.edges_vertices.length).toBe(5);
});
