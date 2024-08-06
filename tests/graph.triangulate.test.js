import fs from "fs";
import { expect, test } from "vitest";
import earcut from "earcut";
import ear from "../src/index.js";

const convexHexagon = {
	vertices_coords: [
		[0, 0],
		[1, 1],
		[1, 2],
		[0, 3],
		[-1, 2],
		[-1, 1],
	],
	edges_vertices: [
		[0, 1],
		[1, 2],
		[2, 3],
		[3, 4],
		[4, 5],
		[5, 0],
	],
	edges_assignment: ["B", "B", "B", "B", "B", "B"],
	faces_vertices: [[0, 1, 2, 3, 4, 5]],
};

const blintz = {
	vertices_coords: [
		[0, 0],
		[0.5, 0],
		[1, 0],
		[1, 0.5],
		[1, 1],
		[0.5, 1],
		[0, 1],
		[0, 0.5],
	],
	edges_vertices: [
		[0, 1],
		[1, 2],
		[2, 3],
		[3, 4],
		[4, 5],
		[5, 6],
		[6, 7],
		[7, 0],
		[1, 3],
		[3, 5],
		[5, 7],
		[7, 1],
	],
	edges_assignment: ["B", "B", "B", "B", "B", "B", "B", "B", "V", "V", "V", "V"],
	faces_vertices: [
		[1, 3, 5, 7],
		[0, 1, 7],
		[2, 3, 1],
		[4, 5, 3],
		[6, 7, 5],
	],
};

test("triangulate", () => {
	const fold = JSON.parse(JSON.stringify(convexHexagon));
	const { result, changes } = ear.graph.triangulate(fold);
	expect(result.edges_assignment.length).toBe(9);
	expect(result.edges_assignment[6]).toBe("J");
	expect(result.edges_assignment[7]).toBe("J");
	expect(result.edges_assignment[8]).toBe("J");
	expect(result.faces_vertices.length).toBe(4);
	expect(result.faces_edges.length).toBe(4);
	// all indices in the map will be 0. all came from face 0.
	expect(JSON.stringify(changes.faces.map)).toBe(JSON.stringify([[0, 1, 2, 3]]));
	expect(JSON.stringify(changes.edges.new)).toBe(JSON.stringify([6, 7, 8]));
});

test("triangulate with and without earcut 1", () => {
	const fold1 = JSON.parse(JSON.stringify(blintz));
	const fold2 = JSON.parse(JSON.stringify(blintz));
	const { changes: changes1 } = ear.graph.triangulate(fold1);
	const { changes: changes2 } = ear.graph.triangulate(fold2, earcut);
	expect(JSON.stringify(changes1.faces.map)).toBe(JSON.stringify(changes2.faces.map));
	expect(changes1.edges.new).toHaveLength(1);
	expect(JSON.stringify(changes1.edges.new)).toBe(JSON.stringify(changes2.edges.new));
});

test("triangulate with and without earcut 2", () => {
	const bird = JSON.parse(fs.readFileSync("./tests/files/fold/kraft-bird-base.fold"));
	const fold1 = JSON.parse(JSON.stringify(bird));
	const fold2 = JSON.parse(JSON.stringify(bird));
	const { result: result1, changes: changes1 } = ear.graph.triangulate(fold1);
	const { result: result2, changes: changes2 } = ear.graph.triangulate(fold2, earcut);
	expect(JSON.stringify(changes1.faces.map)).toBe(JSON.stringify(changes2.faces.map));
	expect(JSON.stringify(changes1.edges.new)).toBe(JSON.stringify(changes2.edges.new));
	expect(result1.edges_assignment.filter((a) => a === "J").length).toBe(112);
	expect(result1.edges_assignment.filter((a) => a === "J").length).toBe(
		result2.edges_assignment.filter((a) => a === "J").length,
	);
});

test("triangulate with only faces_vertices", () => {
	const graph = {
		faces_vertices: [
			[1, 3, 5, 7],
			[0, 1, 7],
			[2, 3, 1],
			[4, 5, 3],
			[6, 7, 5],
		],
	};
	const { result } = ear.graph.triangulate(graph);
	expect(result.faces_edges.length).toBe(result.faces_vertices.length);
	expect(result.edges_vertices.length).not.toBe(0);
});

test("triangulate with only faces_vertices, with earcut", () => {
	const graph = {
		faces_vertices: [
			[1, 3, 5, 7],
			[0, 1, 7],
			[2, 3, 1],
			[4, 5, 3],
			[6, 7, 5],
		],
	};
	let err;
	try {
		ear.graph.triangulate(graph, earcut);
	} catch (error) {
		err = error;
	}
	expect(err).not.toBe(undefined);
});
