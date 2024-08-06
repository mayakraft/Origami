import { expect, test } from "vitest";
import fs from "fs";
import ear from "../src/index.js";

test("splitFaceWithEdge no change", () => {
	const FOLD = fs.readFileSync("./tests/files/fold/surrounded-square.fold", "utf-8");
	const graph = JSON.parse(FOLD);
	const clone = structuredClone(graph);
	const result = ear.graph.splitFaceWithEdge(graph, 0, [4, 5]);
	expect(graph).toMatchObject(clone);
	expect(result).toMatchObject({});
});

test("splitFaceWithEdge between existing vertices", () => {
	const FOLD = fs.readFileSync("./tests/files/fold/surrounded-square.fold", "utf-8");
	const graph = JSON.parse(FOLD);
	const result = ear.graph.splitFaceWithEdge(graph, 0, [4, 6]);

	// diagonal cut from bottom left to top right.
	// face 4 is on top
	// face 5 is on bottom
	expect(result).toMatchObject({
		edge: 12,
		faces: { map: [[4, 5], 0, 1, 2, 3], new: [4, 5], remove: 0 },
	});

	// 4: vertex 6 inserted between 5 and 7
	// 6: vertex 4 inserted between 7 and 5
	expect(graph.vertices_vertices).toMatchObject([
		[1, 4, 3],
		[2, 5, 0],
		[3, 6, 1],
		[0, 7, 2],
		[5, 6, 7, 0],
		[6, 4, 1],
		[7, 4, 5, 2],
		[4, 6, 3],
	]);
	// at 4 and 6, new edge 12 matches vertices_vertices
	expect(graph.vertices_edges).toMatchObject([
		[0, 8, 3],
		[1, 9, 0],
		[2, 10, 1],
		[3, 11, 2],
		[4, 12, 7, 8],
		[5, 4, 9],
		[6, 12, 5, 10],
		[7, 6, 11],
	]);
	// aligns with vertices_vertices/vertices_edges
	// 4: face 5 matches with vertices 5,6 and edges 4,12. should go 5 then 4
	// 6: face 4 matches with vertices 7,4 and edges 6,12. should go 4 then 5
	expect(graph.vertices_faces).toMatchObject([
		[0, 3, undefined],
		[1, 0, undefined],
		[2, 1, undefined],
		[3, 2, undefined],
		[5, 4, 3, 0],
		[5, 0, 1],
		[4, 5, 1, 2],
		[4, 2, 3],
	]);
	expect(graph.edges_vertices).toMatchObject([
		[0, 1],
		[1, 2],
		[2, 3],
		[3, 0], // outer
		[4, 5],
		[5, 6],
		[6, 7],
		[7, 4], // inner
		[0, 4],
		[1, 5],
		[2, 6],
		[3, 7], // diagonal connectors
		[4, 6], // new edge
	]);
	expect(graph.edges_assignment).toMatchObject([
		"B",
		"B",
		"B",
		"B",
		"F",
		"F",
		"F",
		"F",
		"J",
		"J",
		"J",
		"J",
		"U",
	]);
	expect(graph.edges_foldAngle).toMatchObject([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
	expect(graph.edges_faces).toMatchObject([
		[0],
		[1],
		[2],
		[3],
		[5, 0],
		[5, 1],
		[4, 2],
		[4, 3],
		[3, 0],
		[0, 1],
		[1, 2],
		[2, 3],
		[4, 5], // new edge
	]);
	expect(graph.faces_vertices).toMatchObject([
		[0, 1, 5, 4],
		[1, 2, 6, 5],
		[2, 3, 7, 6],
		[3, 0, 4, 7],
		[6, 7, 4],
		[4, 5, 6], // new faces
	]);
	// 4: edge 6 matches vertices 6,7 and should come first
	// 5: edge 4 matches vertices 4,5 and should come first
	expect(graph.faces_edges).toMatchObject([
		[0, 9, 4, 8],
		[1, 10, 5, 9],
		[2, 11, 6, 10],
		[3, 8, 7, 11],
		[6, 7, 12],
		[4, 5, 12], // new faces
	]);
	// faces_faces matches faces_edges in winding order.
	expect(graph.faces_faces).toMatchObject([
		[undefined, 1, 5, 3],
		[undefined, 2, 5, 0],
		[undefined, 3, 4, 1],
		[undefined, 0, 4, 2],
		[2, 3, 5],
		[0, 1, 4],
	]);
});

test("splitFace after two calls to splitEdge", () => {
	const FOLD = fs.readFileSync("./tests/files/fold/surrounded-square.fold", "utf-8");

	const graph = JSON.parse(FOLD);

	// split edges 4 and 6
	ear.graph.splitEdge(graph, 4);
	ear.graph.splitEdge(graph, 5); // used to be 6
	// the result of these two splitEdge calls are tested in splitEdge.test file

	const result = ear.graph.splitFace(graph, 0, [8, 9], "U", 0);

	expect(result).toMatchObject({
		edge: 14,
		faces: { map: [[4, 5], 0, 1, 2, 3], new: [4, 5], remove: 0 },
	});

	// vertex 8 is on the bottom, vertex 9 is on the top
	// face 4 is on the left, face 5 is on the right
	// edges 10, 11 are on the bottom, edges 12, 13 are on the top
	// edge 14 is the new edge from splitFace

	expect(graph).toMatchObject({
		// the two new vertices are counter-clockwise
		vertices_vertices: [
			[1, 4, 3],
			[2, 5, 0],
			[3, 6, 1],
			[0, 7, 2],
			[8, 7, 0],
			[6, 8, 1],
			[9, 5, 2],
			[4, 9, 3],
			[9, 4, 5],
			[8, 6, 7],
		],
		// two new vertices's edges are counter-clockwise
		vertices_edges: [
			[0, 6, 3],
			[1, 7, 0],
			[2, 8, 1],
			[3, 9, 2],
			[10, 5, 6],
			[4, 11, 7],
			[12, 4, 8],
			[5, 13, 9],
			[14, 10, 11],
			[14, 12, 13],
		],
		// two new vertices's faces are counter-clockwise
		vertices_faces: [
			[0, 3, undefined],
			[1, 0, undefined],
			[2, 1, undefined],
			[3, 2, undefined],
			[4, 3, 0],
			[5, 0, 1],
			[5, 1, 2],
			[4, 2, 3],
			[4, 0, 5],
			[5, 2, 4],
		],
		edges_vertices: [
			[0, 1],
			[1, 2],
			[2, 3],
			[3, 0], // boundary
			[5, 6],
			[7, 4], // inner square, sides
			[0, 4],
			[1, 5],
			[2, 6],
			[3, 7], // diagonals
			[4, 8],
			[8, 5],
			[6, 9],
			[9, 7], // split edges new edges
			[8, 9], // split face new edge
		],
		edges_assignment: [
			"B",
			"B",
			"B",
			"B",
			"F",
			"F",
			"J",
			"J",
			"J",
			"J",
			"F",
			"F",
			"F",
			"F",
			"U",
		],
		edges_foldAngle: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		// correct faces, in no particular order
		edges_faces: [
			[0],
			[1],
			[2],
			[3], // boundary edges
			[5, 1],
			[4, 3], // inner square, sides
			[3, 0],
			[0, 1],
			[1, 2],
			[2, 3], // diagonals
			[4, 0],
			[5, 0],
			[5, 2],
			[4, 2], // split edges new edges
			[4, 5], // split face new edge
		],
		// new faces have correct winding
		faces_vertices: [
			[0, 1, 5, 8, 4],
			[1, 2, 6, 5],
			[2, 3, 7, 9, 6],
			[3, 0, 4, 7],
			[9, 7, 4, 8], // new faces
			[8, 5, 6, 9], // new faces
		],
		// new faces match winding for faces_vertices
		faces_edges: [
			[0, 7, 11, 10, 6],
			[1, 8, 4, 7],
			[2, 9, 13, 12, 8],
			[3, 6, 5, 9],
			[13, 5, 10, 14], // new faces
			[11, 4, 12, 14], // new faces
		],
		// face 0: goes 5 then 4
		// face 2: goes 4 then 5
		// new faces match winding with faces_edges
		faces_faces: [
			[undefined, 1, 5, 4, 3],
			[undefined, 2, 5, 0],
			[undefined, 3, 4, 5, 1],
			[undefined, 0, 4, 2],
			[2, 3, 0, 5],
			[0, 1, 2, 4],
		],
	});

	expect(ear.graph.validate(graph).length).toBe(0);
});
