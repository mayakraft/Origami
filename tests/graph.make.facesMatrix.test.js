import { expect, test } from "vitest";
import ear from "../src/index.js";

test("faces matrix, diagonal fold", () => {
	const result = ear.graph.makeFacesMatrix({
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
			[1, 3],
		],
		edges_foldAngle: [0, 0, 0, 0, 90],
		faces_vertices: [
			[0, 1, 3],
			[2, 3, 1],
		],
	});
	const _707 = Math.sqrt(2) / 2;
	[0.5, -0.5, _707, -0.5, 0.5, _707, -_707, -_707, 0, 0.5, 0.5, -_707].forEach((v, i) =>
		expect(result[1][i]).toBeCloseTo(v),
	);
});

test("faces matrix, book fold", () => {
	const result = ear.graph.makeFacesMatrix({
		vertices_coords: [
			[0, 0],
			[0.5, 0],
			[1, 0],
			[1, 1],
			[0.5, 1],
			[0, 1],
		],
		edges_vertices: [
			[0, 1],
			[1, 2],
			[2, 3],
			[3, 4],
			[4, 5],
			[5, 0],
			[1, 4],
		],
		edges_foldAngle: [0, 0, 0, 0, 0, 0, 180],
		faces_vertices: [
			[0, 1, 4, 5],
			[1, 2, 3, 4],
		],
	});
	[-1, 0, 0, 0, 1, 0, 0, 0, -1, 1, 0, 0].forEach((v, i) =>
		expect(result[1][i]).toBeCloseTo(v),
	);
});

test("faces matrix, book fold, rectangle", () => {
	const result = ear.graph.makeFacesMatrix({
		vertices_coords: [
			[0, 0],
			[1, 0],
			[2, 0],
			[2, 1],
			[1, 1],
			[0, 1],
		],
		edges_vertices: [
			[0, 1],
			[1, 2],
			[2, 3],
			[3, 4],
			[4, 5],
			[5, 0],
			[1, 4],
		],
		edges_foldAngle: [0, 0, 0, 0, 0, 0, 180],
		faces_vertices: [
			[0, 1, 4, 5],
			[1, 2, 3, 4],
		],
	});
	[-1, 0, 0, 0, 1, 0, 0, 0, -1, 2, 0, 0].forEach((v, i) =>
		expect(result[1][i]).toBeCloseTo(v),
	);
});

test("faces matrix, assignment, no foldAngle", () => {
	const result = ear.graph.makeFacesMatrix({
		vertices_coords: [
			[0, 0],
			[0.5, 0],
			[1, 0],
			[1, 1],
			[0.5, 1],
			[0, 1],
		],
		edges_vertices: [
			[0, 1],
			[1, 2],
			[2, 3],
			[3, 4],
			[4, 5],
			[5, 0],
			[1, 4],
		],
		edges_assignment: ["B", "B", "B", "B", "B", "B", "V"],
		faces_vertices: [
			[0, 1, 4, 5],
			[1, 2, 3, 4],
		],
	});
	[-1, 0, 0, 0, 1, 0, 0, 0, -1, 1, 0, 0].forEach((v, i) =>
		expect(result[1][i]).toBeCloseTo(v),
	);
});
