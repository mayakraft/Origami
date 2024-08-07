import { expect, test } from "vitest";
import fs from "fs";
import ear from "../src/index.js";

test("doEdgesOverlap, X overlapping", () => {
	const graph = {
		vertices_coords: [
			[0, 0],
			[1, 0],
			[1, 1],
			[0, 1],
		],
		edges_vertices: [
			[0, 2],
			[1, 3],
		],
	};
	expect(ear.graph.doEdgesOverlap(graph)).toBe(true);
});

test("doEdgesOverlap, + overlapping", () => {
	const graph = {
		vertices_coords: [
			[0, 0.5],
			[1, 0.5],
			[0.5, 0],
			[0.5, 1],
		],
		edges_vertices: [
			[0, 1],
			[2, 3],
		],
	};
	expect(ear.graph.doEdgesOverlap(graph)).toBe(true);
});

test("doEdgesOverlap, + diagonal overlapping", () => {
	const graph = {
		vertices_coords: [
			[0, 0],
			[1, 1],
			[0.5, 0],
			[0.5, 1],
		],
		edges_vertices: [
			[0, 1],
			[2, 3],
		],
	};
	expect(ear.graph.doEdgesOverlap(graph)).toBe(true);
});

test("doEdgesOverlap, square", () => {
	const graph = {
		vertices_coords: [
			[0, 0],
			[1, 0],
			[1, 1],
			[0, 1],
			[0.5, 0.5],
		],
		edges_vertices: [
			[0, 1],
			[1, 2],
			[2, 3],
			[3, 0],
		],
	};
	expect(ear.graph.doEdgesOverlap(graph, 0.1)).toBe(false);
});

test("doEdgesOverlap, square with X", () => {
	const graph = {
		vertices_coords: [
			[0, 0],
			[1, 0],
			[1, 1],
			[0, 1],
			[0.5, 0.5],
		],
		edges_vertices: [
			[0, 1],
			[1, 2],
			[2, 3],
			[3, 0],
			[0, 4],
			[1, 4],
			[2, 4],
			[3, 4],
		],
	};
	expect(ear.graph.doEdgesOverlap(graph, 0.1)).toBe(false);
});

test("doEdgesOverlap, square with X, overlapping", () => {
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
			[0, 2],
			[1, 3],
		],
	};
	expect(ear.graph.doEdgesOverlap(graph)).toBe(true);
});

test("doEdgesOverlap, random lines, un-planarized", () => {
	const graph = {
		vertices_coords: Array.from(Array(100)).map(() => [Math.random(), Math.random()]),
		edges_vertices: Array.from(Array(50)).map((_, i) => [i * 2, i * 2 + 1]),
	};
	expect(ear.graph.doEdgesOverlap(graph)).toBe(true);
});

test("doEdgesOverlap, random lines, planarized", () => {
	const graph = ear.graph.planarize({
		vertices_coords: Array.from(Array(20)).map(() => [Math.random(), Math.random()]),
		edges_vertices: Array.from(Array(10)).map((_, i) => [i * 2, i * 2 + 1]),
	});
	expect(ear.graph.doEdgesOverlap(graph)).toBe(false);
});

test("doEdgesOverlap, crease pattern", () => {
	const file = fs.readFileSync("./tests/files/fold/crane.fold", "utf-8");
	const fold = JSON.parse(file);
	const graph = ear.graph.getFramesByClassName(fold, "creasePattern")[0];
	expect(ear.graph.doEdgesOverlap(graph)).toBe(false);
});

test("doEdgesOverlap, crease pattern", () => {
	const file = fs.readFileSync("./tests/files/fold/kabuto.fold", "utf-8");
	const fold = JSON.parse(file);
	const graph = ear.graph.getFramesByClassName(fold, "creasePattern")[0];
	expect(ear.graph.doEdgesOverlap(graph)).toBe(false);
});
