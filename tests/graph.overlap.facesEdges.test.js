import { expect, test } from "vitest";
import fs from "fs";
import ear from "../src/index.js";

test("edges-faces, triangle cut by edge", () => {
	const graph = ear.graph.populate({
		vertices_coords: [
			[0, 0],
			[0.5, 0.5],
			[0, 1],
			[-1, 0.5],
		],
		edges_vertices: [
			[0, 1],
			[1, 2],
			[2, 0],
			[1, 3],
		],
		edges_assignment: Array.from("BBBB"),
		faces_vertices: [[0, 1, 2]],
	});
	// const facesEdges = ear.graph.getFacesEdgesOverlapAllData(graph);
	// expect(facesEdges).toMatchObject([
	// 	[
	// 		, // edge 0, already a part of face 0
	// 		, // edge 1, already a part of face 0
	// 		, // edge 2, already a part of face 0
	// 		{ v: [1], e: [2], p: [] }, // edge 3, overlaps vert 1 and crosses edge 2
	// 	],
	// ]);
	expect(ear.graph.getFacesEdgesOverlap(graph)).toMatchObject([[3]]);
});

test("edges-faces, square cut by edge through vertex", () => {
	// square cut by edge between two of its vertices
	const graph1 = ear.graph.populate({
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
		edges_assignment: Array.from("BBBBB"),
		faces_vertices: [[0, 1, 2, 3]],
	});
	// square cut by edge between one of its vertices, through another vertex
	const graph2 = ear.graph.populate({
		vertices_coords: [
			[0, 0],
			[1, 0],
			[1, 1],
			[0, 1],
			[2, 2],
		],
		edges_vertices: [
			[0, 1],
			[1, 2],
			[2, 3],
			[3, 0],
			[0, 4],
		],
		edges_assignment: Array.from("BBBBB"),
		faces_vertices: [[0, 1, 2, 3]],
	});

	// expect(ear.graph.getFacesEdgesOverlapAllData(graph1)).toMatchObject([
	// 	[
	// 		,
	// 		,
	// 		,
	// 		,
	// 		{ v: [0, 2], e: [], p: [] },
	// 	],
	// ]);

	// expect(ear.graph.getFacesEdgesOverlapAllData(graph2)).toMatchObject([
	// 	[
	// 		,
	// 		,
	// 		,
	// 		,
	// 		{ v: [0, 2], e: [], p: [] },
	// 	],
	// ]);

	expect(ear.graph.getFacesEdgesOverlap(graph1)).toMatchObject([[4]]);
	expect(ear.graph.getFacesEdgesOverlap(graph2)).toMatchObject([[4]]);
});

test("edges-faces all data, two adjacent faces one point overlap", () => {
	const graph = ear.graph.populate({
		vertices_coords: [
			[0, 0],
			[0.5, 0.5],
			[0, 1],
			[0, 1],
		],
		edges_vertices: [
			[0, 3],
			[3, 1],
			[1, 2],
			[2, 0],
			[0, 1],
		],
		edges_assignment: Array.from("BBBBV"),
		faces_vertices: [
			[0, 2, 1],
			[0, 1, 3],
		],
	});

	expect(ear.graph.getFacesEdgesOverlap(graph)).toMatchObject([[], []]);

	// expect(ear.graph.getFacesEdgesOverlapAllData(graph))
	// 	.toMatchObject([[], []]);
});

test("edges-faces all data, two adjacent faces no overlap points, two crossing edges", () => {
	const graph = ear.graph.populate({
		vertices_coords: [
			[0, 0],
			[0.5, 0.5],
			[0, 1],
			[-0.1, 0.9],
		],
		edges_vertices: [
			[0, 3],
			[3, 1],
			[1, 2],
			[2, 0],
			[0, 1],
		],
		edges_assignment: Array.from("BBBBV"),
		faces_vertices: [
			[0, 2, 1],
			[0, 1, 3],
		],
	});

	expect(ear.graph.getFacesEdgesOverlap(graph)).toMatchObject([[1], [3]]);

	// expect(ear.graph.getFacesEdgesOverlapAllData(graph)).toMatchObject([
	// 	[
	// 		{ v: [0], e: [], p: [] },
	// 		{ v: [1], e: [3], p: [] },
	// 	], [
	// 		,
	// 		,
	// 		{ v: [1], e: [], p: [] },
	// 		{ v: [0], e: [1], p: [] },
	// 	],
	// ]);
});

test("edges-faces all data, two separate faces, identical", () => {
	const graph = ear.graph.populate({
		vertices_coords: [
			[0, 0],
			[0.5, 0.5],
			[0, 1],
			[0, 0],
			[0.5, 0.5],
			[0, 1],
		],
		edges_vertices: [
			[0, 1],
			[1, 2],
			[2, 0],
			[3, 4],
			[4, 5],
			[5, 3],
		],
		edges_assignment: Array.from("BBBBBB"),
		faces_vertices: [
			[0, 1, 2],
			[3, 4, 5],
		],
	});

	expect(ear.graph.getFacesEdgesOverlap(graph)).toMatchObject([[], []]);

	// expect(ear.graph.getFacesEdgesOverlapAllData(graph))
	// 	.toMatchObject([[], []]);
});

test("edges-faces all data, two separate faces, one point in common", () => {
	// one upside down triangle (point at origin)
	// copy of other triangle, scaled shorter in the Y axis (point at origin)
	// the second triangle's top line cuts through the other triangle's sides
	const graph = ear.graph.populate({
		vertices_coords: [
			[0, 0],
			[1, 1],
			[-1, 1],
			[0, 0],
			[1, 0.5],
			[-1, 0.5],
		],
		edges_vertices: [
			[0, 1],
			[1, 2],
			[2, 0],
			[3, 4],
			[4, 5],
			[5, 3],
		],
		edges_assignment: Array.from("BBBBBB"),
		faces_vertices: [
			[0, 1, 2],
			[3, 4, 5],
		],
	});

	expect(ear.graph.getFacesEdgesOverlap(graph)).toMatchObject([[4], [0, 2]]);

	// expect(ear.graph.getFacesEdgesOverlapAllData(graph)).toMatchObject([
	// 	[
	// 		,
	// 		,
	// 		,
	// 		{ v: [0], e: [], p: [] },
	// 		{ v: [], e: [0, 2], p: [] },
	// 		{ v: [0], e: [], p: [] },
	// 	], [
	// 		{ v: [3], e: [4], p: [] },
	// 		,
	// 		{ v: [3], e: [4], p: [] },
	// 	],
	// ]);
});

test("edges-faces kite base", () => {
	const cp = ear.graph.kite();
	const folded = {
		...cp,
		vertices_coords: ear.graph.makeVerticesCoordsFlatFolded(cp),
	};
	ear.graph.populate(folded);

	expect(ear.graph.getFacesEdgesOverlap(folded)).toMatchObject([[], [1], [4], []]);

	// // edge 1 overlaps face 1
	// // edge 4 overlaps face 2
	// expect(ear.graph.getFacesEdgesOverlapAllData(folded)).toMatchObject([
	// 	[
	// 		,
	// 		,
	// 		{ v: [2], e: [], p: [] },
	// 		,
	// 		{ v: [1], e: [], p: [] },
	// 		,
	// 		,
	// 		{ v: [0], e: [], p: [] },
	// 	],
	// 	[
	// 		{ v: [0], e: [8], p: [] }, // edge 8 contains vertex 0. will not overlap.
	// 		{ v: [2], e: [8], p: [] }, // face 1 and edge 1 should overlap
	// 		,
	// 		{ v: [3], e: [], p: [] },
	// 		{ v: [], e: [8], p: [] },
	// 		{ v: [0], e: [8], p: [] },
	// 		,
	// 		{ v: [0], e: [], p: [] },
	// 	],
	// 	[
	// 		{ v: [0], e: [8], p: [] },
	// 		{ v: [], e: [8], p: [] },
	// 		{ v: [3], e: [], p: [] },
	// 		,
	// 		{ v: [4], e: [8], p: [] }, // face 2 and edge 4 should overlap
	// 		{ v: [0], e: [8], p: [] },
	// 		{ v: [0], e: [], p: [] },
	// 	],
	// 	[
	// 		,
	// 		{ v: [5], e: [], p: [] },
	// 		,
	// 		{ v: [4], e: [], p: [] },
	// 		,
	// 		,
	// 		{ v: [0], e: [], p: [] },
	// 	],
	// ]);
});

test("edges-faces, bird base", () => {
	const cp = ear.graph.bird();
	const folded = {
		...cp,
		vertices_coords: ear.graph.makeVerticesCoordsFlatFolded(cp),
	};
	ear.graph.populate(folded);

	expect(ear.graph.getFacesEdgesOverlap(folded)).toMatchObject([
		[],
		[],
		[],
		[],
		[],
		[],
		[16, 18, 28, 32],
		[16, 18, 28, 32],
		[],
		[],
		[],
		[],
		[],
		[],
		[20, 22, 29, 33],
		[20, 22, 29, 33],
		[],
		[],
		[],
		[],
	]);
});

test("edges-faces kabuto", () => {
	const foldfile = fs.readFileSync("./tests/files/fold/kabuto.fold", "utf-8");
	const fold = JSON.parse(foldfile);
	const folded = ear.graph.getFramesByClassName(fold, "foldedForm")[0];
	ear.graph.populate(folded);

	expect(ear.graph.getFacesEdgesOverlap(folded)).toMatchObject([
		[6, 7, 8, 12, 13, 15, 16, 18, 19, 22, 23, 31, 32],
		[6, 7, 8, 12, 13, 15, 16, 18, 19, 22, 23, 31, 32],
		[6, 7, 8, 12, 13, 15, 16, 18, 19, 22, 23, 31, 32],
		[6, 7, 12, 13, 15, 16, 18, 19, 22, 23, 31, 32],
		[6, 7, 12, 13, 15, 16, 18, 19, 22, 23],
		[6, 7, 8, 12, 13, 15, 16, 18, 19],
		[8, 12, 22, 31],
		[8, 16, 23, 32],
		[6, 8, 12, 18, 22, 31],
		[7, 8, 16, 19, 23, 32],
		[6, 8, 12, 18, 22, 31],
		[7, 8, 16, 19, 23, 32],
		[8, 12, 22, 31],
		[8, 16, 23, 32],
		[0, 8, 10, 21, 22, 25, 28],
		[1, 8, 9, 20, 23, 26, 35],
		[0, 8, 10, 21, 22, 25, 28],
		[1, 8, 9, 20, 23, 26, 35],
	]);
});

test("edges-faces four flaps", () => {
	const foldfile = fs.readFileSync("./tests/files/fold/layer-4-flaps.fold", "utf-8");
	const fold = JSON.parse(foldfile);
	const folded = ear.graph.getFramesByClassName(fold, "foldedForm")[0];
	ear.graph.populate(folded);

	expect(ear.graph.getFacesEdgesOverlap(folded)).toMatchObject([
		[2, 3], // vertical face, overlapped by two horizontal edges
		[0, 1, 2, 3], // all overlap the center face
		[2, 3], // vertical face, overlapped by two horizontal edges
		[0, 1], // horizontal face, overlapped by two vertical edges
		[0, 1], // horizontal face, overlapped by two vertical edges
	]);
});

test("edges-faces randlett flapping bird", () => {
	const foldfile = fs.readFileSync(
		"./tests/files/fold/randlett-flapping-bird.fold",
		"utf-8",
	);
	const fold = JSON.parse(foldfile);
	const folded = ear.graph.getFramesByClassName(fold, "foldedForm")[0];
	ear.graph.populate(folded);

	// manually checked the faces with no overlaps, they seem correct
	// they are the four small triangles which have no overlapping edges.
	expect(ear.graph.getFacesEdgesOverlap(folded)).toMatchObject([
		[1, 2, 3, 4, 10, 11, 18, 19, 23, 27, 30, 33],
		[1, 2, 3, 4, 10, 11, 18, 19, 23, 27, 30, 33],
		[],
		[6, 10, 11, 30, 33, 35, 36],
		[6, 18, 19, 21, 22, 25, 26, 35, 36],
		[6, 35, 36],
		[6, 10, 11, 30, 33, 35, 36],
		[6, 35, 36],
		[6, 18, 19, 21, 22, 25, 26, 35, 36],
		[],
		[20, 24, 29, 32],
		[20, 24, 29, 32],
		[18, 19],
		[18, 19],
		[18, 19],
		[18, 19],
		[7, 28, 31, 43, 48],
		[7, 28, 31, 43, 48],
		[8, 44, 47],
		[8, 44, 47],
		[8, 44, 47],
		[8, 44, 47],
		[],
		[7, 28, 31, 43, 48],
		[7, 28, 31, 43, 48],
		[],
	]);
});

test("edges-faces crane", () => {
	const foldfile = fs.readFileSync("./tests/files/fold/crane.fold", "utf-8");
	const fold = JSON.parse(foldfile);
	const folded = ear.graph.getFramesByClassName(fold, "foldedForm")[0];
	ear.graph.populate(folded);

	const expectedJSON = fs.readFileSync(
		"./tests/files/json/crane-faces-edges-overlap.json",
		"utf-8",
	);
	const expected = JSON.parse(expectedJSON);

	const facesEdges = ear.graph.getFacesEdgesOverlap(folded);

	expect(facesEdges.flat().length).toBe(1167);
	expect(facesEdges).toMatchObject(expected);
});

test("edges-faces kraft bird", () => {
	const foldfile = fs.readFileSync("./tests/files/fold/kraft-bird-base.fold", "utf-8");
	const fold = JSON.parse(foldfile);
	const folded = {
		...fold,
		vertices_coords: ear.graph.makeVerticesCoordsFlatFolded(fold),
	};
	ear.graph.populate(folded);

	const start = performance.now();
	const facesEdges = ear.graph.getFacesEdgesOverlap(folded);
	const end = performance.now();
	const elapsed = end - start;
	// console.log(`${elapsed} ms. Kraft bird faces-edges overlap`);

	expect(facesEdges.flat().length).toBe(7544);
});
