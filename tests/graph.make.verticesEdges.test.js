import { expect, test } from "vitest";
import ear from "../src/index.js";

test("make vertices_edges 1", () => {
	const result = ear.graph.makeVerticesEdgesUnsorted({
		edges_vertices: [
			[0, 1],
			[1, 2],
			[2, 3],
			[3, 0],
		],
	});
	expect(result[0]).toEqual(expect.arrayContaining([0, 3]));
	expect(result[1]).toEqual(expect.arrayContaining([0, 1]));
	expect(result[2]).toEqual(expect.arrayContaining([1, 2]));
	expect(result[3]).toEqual(expect.arrayContaining([2, 3]));
});

test("make vertices_edges 2", () => {
	const result = ear.graph.makeVerticesEdgesUnsorted({
		edges_vertices: [
			[0, 1],
			[0, 2],
			[0, 3],
			[0, 4],
		],
	});
	expect(result[0]).toEqual(expect.arrayContaining([0, 1, 2, 3]));
	expect(result[1]).toEqual(expect.arrayContaining([0]));
	expect(result[2]).toEqual(expect.arrayContaining([1]));
	expect(result[3]).toEqual(expect.arrayContaining([2]));
	expect(result[4]).toEqual(expect.arrayContaining([3]));
});

test("make vertices_edges 3", () => {
	// technically these edges are invalid
	const result = ear.graph.makeVerticesEdgesUnsorted({
		edges_vertices: [
			[0, 1, 2, 3, 4],
			[5, 6],
		],
	});
	[[0], [0], [0], [0], [0], [1], [1]].forEach((arr, i) => {
		expect(result[i]).toEqual(expect.arrayContaining(arr));
	});
});

test("make vertices_edges 4", () =>
	new Promise((done) => {
		try {
			const result = ear.graph.makeVerticesEdgesUnsorted({
				edges_vertices: [[0], [1], undefined, [2]],
			});
		} catch (error) {
			expect(error).not.toBe(undefined);
			done();
		}
	}));

test("make vertices_edges 5", () =>
	new Promise((done) => {
		try {
			const result = ear.graph.makeVerticesEdgesUnsorted();
		} catch (error) {
			expect(error).not.toBe(undefined);
			done();
		}
	}));

test("make vertices_edges 6", () =>
	new Promise((done) => {
		try {
			const result = ear.graph.makeVerticesEdgesUnsorted({});
		} catch (error) {
			expect(error).not.toBe(undefined);
			done();
		}
	}));

test("make vertices_edges 7", () => {
	const result = ear.graph.makeVerticesEdgesUnsorted({ edges_vertices: [] });
	expect(result.length).toBe(0);
});
