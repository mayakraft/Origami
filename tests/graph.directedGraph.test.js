import { expect, test } from "vitest";
import fs from "fs";
import ear from "../src/index.js";

test("topologicalSort, Empty graph", () => {
	const directedEdges = [];
	const result = ear.graph.topologicalSort(directedEdges);
	expect(result).toMatchObject([]);
});

test("topologicalSort, Single node graph", () => {
	const directedEdges = [[0, 0]];
	const result = ear.graph.topologicalSort(directedEdges);
	expect(result).toMatchObject([0]);
});

test("topologicalSort, Linear graph", () => {
	const directedEdges = [
		[0, 1],
		[1, 2],
		[2, 3],
	];
	const result = ear.graph.topologicalSort(directedEdges);
	expect(result).toMatchObject([0, 1, 2, 3]);
});

test("topologicalSort, Graph with cycles", () => {
	const directedEdges = [
		[0, 1],
		[1, 2],
		[2, 0],
	];
	const result = ear.graph.topologicalSort(directedEdges);
	// Since the graph contains a cycle, the result should be undefined
	expect(result).toMatchObject(undefined);
});

test("topologicalSort, Graph with disconnected components", () => {
	const directedEdges = [
		[0, 1],
		[1, 2],
		[3, 4],
		[4, 5],
	];
	const result = ear.graph.topologicalSort(directedEdges);
	expect(result).toMatchObject([0, 1, 2, 3, 4, 5]);
});

test("topologicalSort, Graph with multiple possible orders", () => {
	const directedEdges = [
		[0, 1],
		[0, 2],
		[1, 3],
		[2, 3],
	];
	const result = ear.graph.topologicalSort(directedEdges);
	expect(result).toMatchObject([0, 1, 2, 3]);
});

test("topologicalSort, Large acyclic graph", () => {
	const directedEdges = [];
	for (let i = 0; i < 1000; i++) {
		directedEdges.push([i, i + 1]);
	}
	const result = ear.graph.topologicalSort(directedEdges);
	expect(result).toHaveLength(1001);
	expect(result[0]).toBe(0);
	expect(result[1000]).toBe(1000);
});

test("topologicalSort, Graph with self-referencing nodes", () => {
	const directedEdges = [
		[0, 1],
		[1, 2],
		[2, 2],
		[2, 3],
	];
	const result = ear.graph.topologicalSort(directedEdges);
	expect(result).toMatchObject([0, 1, 2, 3]);
});

test("topologicalSort, Graph with duplicate edges", () => {
	const directedEdges = [
		[0, 1],
		[1, 2],
		[2, 3],
		[0, 1],
		[2, 3],
	];
	const result = ear.graph.topologicalSort(directedEdges);
	expect(result).toMatchObject([0, 1, 2, 3]);
});

test("topologicalSort, Graph with multiple disconnected components", () => {
	const directedEdges = [
		[0, 1],
		[1, 2],
		[2, 0],
		[3, 4],
		[4, 5],
		[5, 3],
	];
	const result = ear.graph.topologicalSort(directedEdges);
	expect(result).toMatchObject(undefined);
});

test("topologicalSort, Graph with loops", () => {
	const directedEdges = [
		[0, 1],
		[1, 2],
		[2, 3],
		[3, 1],
	];
	const result = ear.graph.topologicalSort(directedEdges);
	expect(result).toMatchObject(undefined);
});

test("topologicalSort, Graph with negative vertex indices", () => {
	const directedEdges = [
		[-1, 0],
		[0, 1],
		[1, 2],
		[2, 3],
	];
	const result = ear.graph.topologicalSort(directedEdges);
	expect(result).toEqual([-1, 0, 1, 2, 3]);
});

test("topologicalSort, Graph with negative and positive vertex indices", () => {
	const directedEdges = [
		[-2, -1],
		[-1, 0],
		[0, 1],
		[1, 2],
		[2, 3],
	];
	const result = ear.graph.topologicalSort(directedEdges);
	expect(result).toEqual([-2, -1, 0, 1, 2, 3]);
});

test("topologicalSort", () => {
	const ordering = ear.graph.topologicalSort([
		[5, 2],
		[2, 1],
		[5, 1],
		[1, 0],
		[1, 3],
	]);
	expect(ordering).toMatchObject([5, 2, 1, 0, 3]);
});

test("topologicalSort, with cycle", () => {
	const ordering = ear.graph.topologicalSort([
		[5, 2],
		[2, 1],
		[1, 5],
	]);
	expect(ordering).toMatchObject(undefined);
});

test("topologicalSort, crane", () => {
	const json = fs.readFileSync("./tests/files/fold/crane.fold", "utf-8");
	const fold = JSON.parse(json);
	const graph = ear.graph.getFramesByClassName(fold, "foldedForm")[0];
	graph.faces_normal = ear.graph.makeFacesNormal(graph);
	const ordering = ear.graph.linearizeFaceOrders(graph);
	const expected = [
		37, 46, 36, 30, 2, 39, 43, 35, 29, 3, 0, 4, 28, 15, 9, 27, 22, 16, 12, 20, 11, 19, 10,
		13, 8, 14, 26, 55, 54, 51, 58, 57, 52, 53, 56, 18, 21, 17, 23, 25, 5, 24, 31, 34, 42,
		45, 40, 32, 33, 41, 44, 38, 47, 50, 7, 48, 49, 6, 1,
	];
	expect(ordering).toMatchObject(expected);
});

test("topologicalSort, subset of crane faces", () => {
	// only contain orderings for a subset of the faces involved.
	const json = fs.readFileSync("./tests/files/fold/crane.fold", "utf-8");
	const fold = JSON.parse(json);
	const crane = ear.graph.getFramesByClassName(fold, "foldedForm")[0];
	const graph = {
		vertices_coords: crane.vertices_coords,
		faces_vertices: crane.faces_vertices,
		faceOrders: [
			[14, 12, -1],
			[14, 15, -1],
			[14, 11, 1],
			[14, 13, 1],
			[12, 15, -1],
			[11, 15, -1],
			[11, 12, -1],
			[20, 16, 1],
			[19, 20, -1],
			[19, 16, 1],
			[17, 18, -1],
			[18, 16, 1],
			[18, 19, 1],
			[18, 20, -1],
			[17, 16, 1],
			[17, 19, 1],
			[17, 20, -1],
			[13, 12, -1],
			[13, 15, -1],
			[13, 11, 1],
		],
	};
	graph.faces_normal = ear.graph.makeFacesNormal(graph);
	const ordering = ear.graph.linearizeFaceOrders(graph);
	const expected = [15, 12, 11, 13, 14, 16, 20, 19, 18, 17];
	expect(ordering).toMatchObject(expected);
});

test("topologicalSort, subset of crane faces. again", () => {
	// only contain orderings for a subset of the faces involved.
	const json = fs.readFileSync("./tests/files/fold/crane.fold", "utf-8");
	const fold = JSON.parse(json);
	const crane = ear.graph.getFramesByClassName(fold, "foldedForm")[0];
	const graph = {
		vertices_coords: crane.vertices_coords,
		faces_vertices: crane.faces_vertices,
		faceOrders: [
			[32, 30, 1],
			[31, 35, -1],
			[32, 36, -1],
			[31, 39, -1],
			[32, 37, -1],
			[35, 39, -1],
			[36, 37, -1],
			[38, 30, 1],
			[33, 30, 1],
			[33, 36, -1],
			[38, 36, -1],
			[33, 37, -1],
			[38, 37, -1],
			[30, 36, -1],
			[30, 37, -1],
			[34, 35, -1],
			[34, 39, -1],
			[34, 31, 1],
			[33, 32, 1],
			[38, 32, 1],
			[38, 33, -1],
		],
	};
	graph.faces_normal = ear.graph.makeFacesNormal(graph);
	const ordering = ear.graph.linearizeFaceOrders(graph);
	const expected = [37, 36, 30, 39, 35, 31, 32, 33, 34, 38];
	expect(ordering).toMatchObject(expected);
});

test("topologicalSortQuick, Graph with cycles", () => {
	const directedEdges = [
		[0, 1],
		[1, 2],
		[2, 0],
	];
	const result = ear.graph.topologicalSortQuick(directedEdges);
	// Since the graph contains a cycle, the result should be undefined
	expect(result).toMatchObject([1, 2, 0]);
});

test("topologicalSortQuick, Graph with cycles", () => {
	const directedEdges = [
		[11, 12],
		[12, 13],
		[13, 14],
		[14, 15],
		[15, 11],
	];
	const result = ear.graph.topologicalSortQuick(directedEdges);
	// Since the graph contains a cycle, the result should be undefined
	expect(result).toMatchObject([12, 13, 14, 15, 11]);
});

test("topologicalSortQuick, Graph with multiple disconnected components", () => {
	const directedEdges = [
		[0, 1],
		[1, 2],
		[2, 0],
		[3, 4],
		[4, 5],
		[5, 3],
	];
	const result = ear.graph.topologicalSortQuick(directedEdges);
	// two separate cycles, two elements in this result
	expect(result).toMatchObject([1, 2, 0, 4, 5, 3]);
});

test("topologicalSortQuick, Graph with loops", () => {
	const directedEdges = [
		[0, 1],
		[1, 2],
		[2, 3],
		[3, 1],
	];
	const result = ear.graph.topologicalSortQuick(directedEdges);
	expect(result).toMatchObject([0, 2, 3, 1]);
});
