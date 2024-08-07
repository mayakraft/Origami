import { expect, test } from "vitest";
import ear from "../src/index.js";

test("sweepVertices", () => {
	const vertices_coords = [
		[0, 0],
		[1e-3, 10],
		[2e-3, 4],
		[3e-3, -10],
		[4e-3, -4],
		[5e-3, 0],
	];
	const res = ear.graph.sweepVertices({ vertices_coords }, 0, 1e-2);
	expect(res[0].t).toBeCloseTo(0.0025);
	expect(res[0].vertices.length).toBe(6);
});

test("sweepVertices exactly at the epsilon", () => {
	const res = ear.graph.sweepVertices(
		{
			vertices_coords: [
				[0, 0],
				[1, 10],
				[2, 4],
				[3, -10],
				[4, -4],
				[5, 0],
			],
		},
		0,
		1,
	);
	expect(res.length).toBe(6);
	expect(res[0].t).toBeCloseTo(0);
	expect(res[5].t).toBeCloseTo(5);
});

test("sweepVertices shuffled", () => {
	const res = ear.graph.sweepVertices(
		{
			vertices_coords: [
				[5, 0],
				[3, -10],
				[0, 0],
				[2, 4],
				[4, -4],
				[1, 10],
			],
		},
		0,
		1.5,
	);
	expect(res.length).toBe(1);
	expect(JSON.stringify(res[0].vertices)).toBe(JSON.stringify([2, 5, 3, 1, 4, 0]));
});

test("sweepVertices shuffled, spaced", () => {
	const res = ear.graph.sweepVertices(
		{
			vertices_coords: [
				[5, 0],
				[3, -10],
				[0, 0],
				[4, -4],
				[1, 10],
			],
		},
		0,
		1.5,
	);
	expect(res.length).toBe(2);
	expect(JSON.stringify(res[0].vertices)).toBe(JSON.stringify([2, 4]));
});

test("sweepVertices large values", () => {
	const res1 = ear.graph.sweepVertices(
		{
			vertices_coords: [
				[1e11 + 0, 0],
				[1e11 + 1e-3, 10],
				[1e11 + 2e-3, 4],
				[1e11 + 3e-3, -10],
				[1e11 + 4e-3, -4],
				[1e11 + 5e-3, 0],
			],
		},
		0,
		1e-2,
	);
	expect(res1[0].t).toBeCloseTo(1e11 + 0.0025);
	expect(res1[0].vertices.length).toBe(6);
	const res2 = ear.graph.sweepVertices(
		{
			vertices_coords: [
				[1e14 + 0, 0],
				[1e14 + 1, 10],
				[1e14 + 2, 4],
				[1e14 + 3, -10],
				[1e14 + 4, -4],
				[1e14 + 5, 0],
			],
		},
		0,
		1e-2,
	);
	expect(res2[0].t).toBeCloseTo(1e14);
	expect(res2.length).toBe(6);
	expect(res2[0].vertices.length).toBe(1);
});

// test("sweepValues", () => {

// });

test("sweepEdges", () => {
	const res = ear.graph.sweepEdges({
		vertices_coords: [
			[0.01, 0],
			[2, 0],
			[1.01, 0],
			[3, 0],
			[2.01, 0],
			[4, 0],
			[3.01, 0],
			[5, 0],
			[4.01, 0],
			[6, 0],
			[5.01, 0],
			[7, 0],
		],
		edges_vertices: [
			[0, 1],
			[2, 3],
			[4, 5],
			[6, 7],
			[8, 9],
			[10, 11],
		],
	});
	for (let i = 1; i < 11; i += 1) {
		if (i % 2) {
			expect(res[i].start.length).toBe(1);
			expect(res[i].end.length).toBe(0);
		} else {
			expect(res[i].start.length).toBe(0);
			expect(res[i].end.length).toBe(1);
		}
	}
});

test("sweepFaces", () => {
	const res = ear.graph.sweepFaces({
		vertices_coords: [
			[0.01, 0],
			[2, 0],
			[1.01, 0],
			[3, 0],
			[2.01, 0],
			[4, 0],
			[3.01, 0],
			[5, 0],
			[4.01, 0],
			[6, 0],
			[5.01, 0],
			[7, 0],
		],
		faces_vertices: [
			[0, 1],
			[2, 3],
			[4, 5],
			[6, 7],
			[8, 9],
			[10, 11],
		],
	});
	for (let i = 1; i < 11; i += 1) {
		if (i % 2) {
			expect(res[i].start.length).toBe(1);
			expect(res[i].end.length).toBe(0);
		} else {
			expect(res[i].start.length).toBe(0);
			expect(res[i].end.length).toBe(1);
		}
	}
});

test("sweep", () => {});
