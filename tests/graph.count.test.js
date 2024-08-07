import { expect, test } from "vitest";
import ear from "../src/index.js";

test("count, empty, invalid", () =>
	new Promise((done) => {
		try {
			ear.graph.countVertices();
		} catch (error) {
			expect(error).not.toBe(undefined);
			done();
		}
	}));

test("general function", () => {
	expect(ear.graph.count({ robby_vertices: ["a", "b", "c", "d"] }, "robby")).toBe(4);
	expect(ear.graph.count({ vertices_robby: ["a", "b", "c", "d"] }, "robby")).toBe(0);
});

test("count, empty", () => {
	expect(ear.graph.countVertices({})).toBe(0);
	expect(ear.graph.countEdges({})).toBe(0);
	expect(ear.graph.countFaces({})).toBe(0);
});

test("irrelevant arrays", () => {
	expect(
		ear.graph.countVertices({
			faces_edges: [
				[4, 6, 7],
				[11, 9, 6],
				[14, 12, 5],
				[11, 6, 9],
			],
			edges_vertices: [
				[4, 6],
				[11, 9],
				[14, 12],
				[11, 6],
			],
		}),
	).toBe(0);
	expect(
		ear.graph.countEdges({
			vertices_coords: [
				[1, 0],
				[1, 1],
				[0, 1],
				[0.5, 0.5],
				[0, 0],
			],
			faces_vertices: [
				[4, 6, 7],
				[11, 9, 6],
				[14, 12, 5],
				[11, 6, 9],
			],
		}),
	).toBe(0);
	expect(
		ear.graph.countFaces({
			vertices_coords: [
				[1, 0],
				[1, 1],
				[0, 1],
				[0.5, 0.5],
				[0, 0],
			],
			edges_vertices: [
				[4, 6],
				[11, 9],
				[14, 12],
				[11, 6],
			],
		}),
	).toBe(0);
});

test("relevant arrays", () => {
	expect(
		ear.graph.countVertices({
			vertices_coords: [
				[1, 0],
				[1, 1],
				[0, 1],
				[0.5, 0.5],
				[0, 0],
			],
			faces_vertices: [
				[4, 6, 7],
				[11, 9, 6],
				[14, 12, 5],
				[11, 6, 9],
			],
		}),
	).toBe(5);
	expect(
		ear.graph.countEdges({
			vertices_coords: [
				[1, 0],
				[1, 1],
				[0, 1],
				[0.5, 0.5],
				[0, 0],
			],
			edges_vertices: [
				[4, 6],
				[11, 9],
				[14, 12],
				[11, 6],
			],
		}),
	).toBe(4);
	expect(
		ear.graph.countFaces({
			faces_edges: [
				[4, 6, 7],
				[11, 9, 6],
				[14, 12, 5],
				[11, 6, 9],
			],
			edges_vertices: [
				[4, 6],
				[11, 9],
				[14, 12],
				[11, 6],
			],
		}),
	).toBe(4);
});

test("vertices count", () => {
	expect(
		ear.graph.countVertices({
			vertices_coords: [
				[1, 0],
				[1, 1],
				[0, 1],
				[0.5, 0.5],
				[0, 0],
			],
		}),
	).toBe(5);
	expect(
		ear.graph.countVertices({
			vertices_faces: [
				[1, 0],
				[1, 1],
				[0, 1],
				[0.5, 0.5],
				[0, 0],
			],
		}),
	).toBe(5);
});

test("non standard geometry", () => {
	expect(
		ear.graph.countVertices({
			vertices_fakeGeometry: [
				[1, 0],
				[1, 1],
				[0, 1],
				[0.5, 0.5],
				[0, 0],
			],
		}),
	).toBe(0);
});

test("edges count", () => {
	expect(
		ear.graph.countEdges({
			edges_vertices: [
				[4, 6],
				[11, 9],
				[14, 12],
				[11, 6],
			],
		}),
	).toBe(4);
});

test("edges count edgeOrders", () => {
	expect(
		ear.graph.countEdges({
			edgeOrders: [
				[4, 6, 0],
				[11, 9, -1],
				[14, 12, 0],
				[11, 6, 1],
			],
		}),
	).toBe(0);
});
