import { expect, test } from "vitest";
import ear from "../src/index.js";

test("makeVerticesFacesUnsorted, with vertices, isolated", () => {
	const result = ear.graph.makeVerticesFacesUnsorted({
		vertices_coords: [
			[0, 0],
			[1, 1],
			[0, 1],
			[1, 0],
			[0.5, 1],
			[0.5, 0],
			[1, 0.5],
		],
		faces_vertices: [
			[3, 4, 5],
			[3, 6, 4],
		],
	});
	expect(JSON.stringify(result)).toBe("[[],[],[],[0,1],[0,1],[0],[1]]");
});

test("makeVerticesFacesUnsorted, with vertices, no vertices", () => {
	const result = ear.graph.makeVerticesFacesUnsorted({
		faces_vertices: [
			[3, 4, 5],
			[3, 6, 4],
		],
	});
	expect(JSON.stringify(result)).toBe("[[],[],[],[0,1],[0,1],[0],[1]]");
});

test("makeVerticesFacesUnsorted, with vertices, not enough vertices", () => {
	let error;
	try {
		ear.graph.makeVerticesFacesUnsorted({
			vertices_coords: [],
			faces_vertices: [
				[3, 4, 5],
				[3, 6, 4],
			],
		});
	} catch (e) {
		error = e;
	}
	expect(error).not.toBe(undefined);
});

test("makeVerticesFacesUnsorted, with vertices_edges", () => {
	const result = ear.graph.makeVerticesFacesUnsorted({
		vertices_edges: [[0, 1, 3], [2, 3], [0, 4], [0], [0, 1], [2, 3], [3]],
		faces_vertices: [
			[3, 4, 5],
			[3, 6, 4],
		],
	});
	expect(JSON.stringify(result)).toBe("[[],[],[],[0,1],[0,1],[0],[1]]");
});

test("vertices faces", () => {
	const result = ear.graph.makeVerticesFaces({
		vertices_coords: [
			[0, 0],
			[1, 1],
			[0, 3],
		],
		vertices_vertices: [
			[1, 2],
			[0, 2],
			[0, 1],
		],
		faces_vertices: [[0, 1, 2]],
	});
	expect(JSON.stringify(result)).toBe("[[0,null],[null,0],[0,null]]");
});
