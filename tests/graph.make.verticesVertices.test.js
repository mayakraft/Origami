import fs from "fs";
import { expect, test } from "vitest";
import ear from "../src/index.js";

test("vertices vertices", () => {
	const result = ear.graph.makeVerticesVertices({
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
			[0, 2],
		],
	});
	expect(result[0]).toEqual(expect.arrayContaining([1, 2, 3]));
	expect(result[1]).toEqual(expect.arrayContaining([2, 0]));
	expect(result[2]).toEqual(expect.arrayContaining([3, 0, 1]));
	expect(result[3]).toEqual(expect.arrayContaining([2, 0]));
});

test("vertices vertices, circle, starting at +X", () => {
	const result = ear.graph.makeVerticesVertices({
		vertices_coords: Array.from(Array(12))
			.map((_, i) => i / 12)
			.map((t) => [Math.cos(t * Math.PI * 2), Math.sin(t * Math.PI * 2)])
			.concat([[0, 0]]),
		edges_vertices: Array.from(Array(12)).map((_, i) => [i, 12]),
	});
	result[12].forEach((n, i) => expect(n).toBe(i));
});

test("vertices vertices, circle, starting at -X", () => {
	const result = ear.graph.makeVerticesVertices({
		vertices_coords: Array.from(Array(12))
			.map((_, i) => i / 12)
			.map((t) => [
				Math.cos(t * Math.PI * 2 + Math.PI),
				Math.sin(t * Math.PI * 2 + Math.PI),
			])
			.concat([[0, 0]]),
		edges_vertices: Array.from(Array(12)).map((_, i) => [i, 12]),
	});
	result[12].forEach((n, i) => expect(n).toBe((i + 6) % 12));
});
