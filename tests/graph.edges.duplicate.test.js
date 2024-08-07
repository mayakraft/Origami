import { expect, test } from "vitest";
import fs from "fs";
import ear from "../src/index.js";

test("duplicate edges", () => {
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
			[2, 4],
			[4, 2],
			[2, 3],
			[3, 0],
		],
		edges_assignment: ["B", "B", "B", "B", "B", "B"],
		faces_vertices: [[0, 1, 2, 4, 2, 3]],
		faces_edges: [[0, 1, 2, 3, 4, 5]],
	};
	ear.graph.populate(graph);

	const duplicates = ear.graph.duplicateEdges(graph);
	expect(JSON.stringify(duplicates)).toBe(JSON.stringify([, , , 2]));

	ear.graph.removeDuplicateEdges(graph);

	// removeDuplicateEdges now automatically fixes the vertices
	// we don't need to run populate
	// expect(graph.vertices_vertices[2].length).toBe(4);
	// expect(graph.vertices_edges[2].length).toBe(4);
	// ear.graph.populate(graph);

	expect(graph.vertices_vertices[2].length).toBe(3);
	expect(graph.vertices_edges[2].length).toBe(3);
});

test("duplicate edges", () => {
	const graph = {
		edges_vertices: [
			[0, 1],
			[1, 2],
			[2, 3],
			[3, 0],
			[0, 3],
			[0, 2],
			[1, 3],
			[0, 2],
			[0, 4],
			[1, 4],
			[2, 4],
			[3, 4],
			[4, 0],
		],
	};
	const result = ear.graph.duplicateEdges(graph);
	expect(result[4]).toBe(3);
	expect(result[7]).toBe(5);
	expect(result[12]).toBe(8);
	expect(JSON.stringify(result)).toBe(JSON.stringify([, , , , 3, , , 5, , , , , 8]));
});

test("invalid edges", () => {
	const graph1 = {
		edges_vertices: [
			[0, 1, 2],
			[3, 4, 5],
			[2, 1, 0],
		],
	};
	const result1 = ear.graph.duplicateEdges(graph1);
	expect(result1[0]).toBe(undefined);
	expect(result1[1]).toBe(undefined);
	expect(result1[2]).toBe(0);

	const graph2 = {
		edges_vertices: [
			[0, 1, 2],
			[3, 4, 5],
			[0, 1, 2],
		],
	};
	const result2 = ear.graph.duplicateEdges(graph2);
	expect(result2[0]).toBe(undefined);
	expect(result2[1]).toBe(undefined);
	expect(result2[2]).toBe(0);
});

test("duplicate edges, invalid input 1", () =>
	new Promise((done) => {
		try {
			ear.graph.duplicateEdges();
		} catch (error) {
			expect(error).not.toBe(undefined);
			done();
		}
	}));

test("duplicate edges, invalid input 2", () => {
	const result = ear.graph.duplicateEdges({});
	expect(result.length).toBe(0);
});

test("duplicate edges, with undefined", () =>
	new Promise((done) => {
		try {
			ear.graph.duplicateEdges({
				edges_vertices: [[0, 1], undefined, [1, 0]],
			});
		} catch (error) {
			expect(error).not.toBe(undefined);
			done();
		}
	}));

test("duplicate edges", () => {
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
			[2, 4],
			[4, 2],
			[2, 3],
			[3, 0],
		],
		edges_assignment: ["B", "B", "B", "B", "B", "B"],
		faces_vertices: [[0, 1, 2, 4, 2, 3]],
		faces_edges: [[0, 1, 2, 3, 4, 5]],
	};
	ear.graph.populate(graph);
	expect(graph.faces_faces).toMatchObject([
		[undefined, undefined, undefined, undefined, undefined, undefined],
	]);
});

test("similar edges bird base", () => {
	const cp = ear.graph.bird();
	const graph = {
		...cp,
		vertices_coords: ear.graph.makeVerticesCoordsFlatFolded(cp),
	};
	expect(ear.graph.getSimilarEdges(graph)).toMatchObject([
		[5, 6, 0, 26, 7, 2, 1, 4, 30, 3],
		[14, 13, 15, 12],
		[25, 24],
		[8, 10, 9, 11],
		[20, 33, 22, 29],
		[31, 27],
		[32, 18, 16, 28],
		[19, 17],
		[21, 23],
	]);
});

test("similar edges crane", () => {
	const json = fs.readFileSync("./tests/files/fold/crane.fold", "utf-8");
	const fold = JSON.parse(json);
	const graph = ear.graph.getFramesByClassName(fold, "foldedForm")[0];
	expect(ear.graph.getSimilarEdges(graph)).toMatchObject([
		[11],
		[15],
		[67, 69],
		[56, 65],
		[62],
		[17, 79, 23, 83, 24, 25, 26, 89],
		[80],
		[90, 110, 106, 100],
		[30, 28, 64],
		[87, 98, 101, 103, 107],
		[99, 105, 109, 113],
		[10, 13, 57],
		[22, 55],
		[85, 58],
		[86],
		[61, 60],
		[66],
		[59],
		[12, 84],
		[18, 9],
		[31, 40, 46, 27],
		[102, 88, 108, 104, 97],
		[16, 78],
		[36, 37, 34, 35, 38, 19, 32, 33],
		[41, 51, 39, 14, 47],
		[29, 50],
		[70, 68],
		[0],
		[1, 6],
		[4, 52],
		[8],
		[63],
		[81],
		[73],
		[20, 45, 49, 43],
		[77, 44, 48],
		[42],
		[74],
		[2, 5, 54],
		[3],
		[95, 96, 111, 112, 91, 92, 93, 94],
		[53, 76],
		[72],
		[71, 75],
		[7, 21],
		[82],
	]);
});
