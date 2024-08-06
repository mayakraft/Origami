import { expect, test } from "vitest";
import ear from "../src/index.js";

test("implied count, empty, invalid", () =>
	new Promise((done) => {
		try {
			ear.graph.countImpliedVertices();
		} catch (error) {
			expect(error).not.toBe(undefined);
			done();
		}
	}));

test("implied count, empty", () => {
	expect(ear.graph.countImpliedVertices({})).toBe(0);
	expect(ear.graph.countImpliedEdges({})).toBe(0);
	expect(ear.graph.countImpliedFaces({})).toBe(0);
});

test("irrelevant arrays", () => {
	expect(
		ear.graph.countImpliedEdges({
			faces_vertices: [
				[4, 6, 7],
				[11, 9, 6],
				[14, 12, 5],
				[11, 6, 9],
			],
		}),
	).toBe(0);
	expect(
		ear.graph.countImpliedFaces({
			faces_vertices: [
				[4, 6, 7],
				[11, 9, 6],
				[14, 12, 5],
				[11, 6, 9],
			],
		}),
	).toBe(0);
	expect(
		ear.graph.countImpliedVertices({
			vertices_edges: [
				[4, 6, 7],
				[11, 9, 6],
				[14, 12, 5],
				[11, 6, 9],
			],
		}),
	).toBe(0);
});

test("implied vertices", () => {
	expect(
		ear.graph.countImpliedVertices({
			faces_vertices: [
				[4, 6, 7],
				[11, 9, 6],
				[14, 12, 5],
				[11, 6, 9],
			],
		}),
	).toBe(15);
});

test("implied edgeOrders", () => {
	expect(
		ear.graph.countImpliedEdges({
			edgeOrders: [
				[4, 6, 0],
				[11, 9, -1],
				[14, 12, 0],
				[11, 6, 1],
			],
		}),
	).toBe(15);
});
