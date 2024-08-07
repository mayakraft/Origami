import fs from "fs";
import { expect, test } from "vitest";
import ear from "../src/index.js";

test("minimumSpanningTrees, faces", () => {
	const foldfile = fs.readFileSync(
		"./tests/files/fold/disjoint-triangles-3d.fold",
		"utf-8",
	);
	const graph = JSON.parse(foldfile);
	const faces_faces = ear.graph.makeFacesFaces(graph);
	const trees = ear.graph.minimumSpanningTrees(faces_faces);
	expect(trees.flat(2).length).toBe(faces_faces.length);
	expect(trees.length).toBe(5);
	trees.forEach((tree) => expect(tree[0].length).toBe(1));
	expect(ear.general.uniqueElements(trees.flat(2).map((el) => el.index)).length).toBe(
		faces_faces.length,
	);
});

test("minimumSpanningTrees, vertices", () => {
	const foldfile = fs.readFileSync(
		"./tests/files/fold/disjoint-triangles-3d.fold",
		"utf-8",
	);
	const graph = JSON.parse(foldfile);
	const vertices_vertices = ear.graph.makeFacesFaces(graph);
	const trees = ear.graph.minimumSpanningTrees(vertices_vertices);
	expect(trees.flat(2).length).toBe(vertices_vertices.length);
	expect(trees.length).toBe(5);
	trees.forEach((tree) => expect(tree[0].length).toBe(1));
	expect(ear.general.uniqueElements(trees.flat(2).map((el) => el.index)).length).toBe(
		vertices_vertices.length,
	);
});

// tree object is an array inside an array, looks like:
// [
//   [ { face: 0 } ],
//   [
//     { face: 1, parent: 0, edge_vertices: [Array] },
//     { face: 2, parent: 0, edge_vertices: [Array] },
//     { face: 5, parent: 0, edge_vertices: [Array] }
//   ],
//   [
//     { face: 3, parent: 1, edge_vertices: [Array] },
//     { face: 38, parent: 1, edge_vertices: [Array] },
//     { face: 39, parent: 1, edge_vertices: [Array] },
//     { face: 4, parent: 2, edge_vertices: [Array] },
//     { face: 11, parent: 5, edge_vertices: [Array] },
//     { face: 20, parent: 5, edge_vertices: [Array] }
//   ],
//   ...
// ]

test("face walk tree, crane", () => {
	const craneJSON = fs.readFileSync("./tests/files/fold/crane-cp.fold");
	const crane = JSON.parse(craneJSON);
	const faces_faces = ear.graph.makeFacesFaces(crane);

	const startingFace = 0;
	const tree = ear.graph.minimumSpanningTrees(faces_faces, [startingFace])[0];

	expect(tree[0].length).toBe(1);
	expect(tree[1].length).toBe(3);
	expect(tree[2].length).toBe(6);
	expect(tree[3].length).toBe(7);
	expect(tree[4].length).toBe(7);
	expect(tree[5].length).toBe(8);
	expect(tree[6].length).toBe(9);
	expect(tree[7].length).toBe(10);
	expect(tree[8].length).toBe(7);
	expect(tree[9].length).toBe(1);

	// test that every face and edge was only ever visited once
	const uniqueFace = {};
	uniqueFace[startingFace] = true;
	tree.slice(1).forEach((level) =>
		level.forEach((el) => {
			expect(uniqueFace[el.parent]).toBe(true);
			expect(uniqueFace[el.index]).toBe(undefined);
			uniqueFace[el.index] = true;
		}),
	);

	// try to check edges vertices data
	// tree.slice(1)
	// 	.forEach(level => level
	// 		.forEach(el => expect(el.edge_vertices.length).toBe(2)));
});

test("face walk tree, no param", () => {
	expect(ear.graph.minimumSpanningTrees()).toStrictEqual([]);
});

test("face walk tree, empty graph", () => {
	expect(ear.graph.minimumSpanningTrees([])).toStrictEqual([]);
});

test("face walk tree, empty graph", () => {
	const result = ear.graph.minimumSpanningTrees([[]]);
	expect(result.length).toBe(1);
	expect(result[0].length).toBe(1);
	expect(result[0][0][0].index).toBe(0);
});

test("face walk tree, no edges_vertices", () => {
	const faces_faces = ear.graph.makeFacesFaces({
		faces_vertices: [
			[0, 1, 3],
			[2, 3, 1],
		],
	});
	const result = ear.graph.minimumSpanningTrees(faces_faces)[0];
	expect(result.length).toBe(2);
	expect(result[1].length).toBe(1);
	expect(result[1][0].index).toBe(1);
	expect(result[1][0].parent).toBe(0);
});

test("face walk tree, empty edges_vertices. same as test above", () => {
	const result = ear.graph.minimumSpanningTrees(
		ear.graph.makeFacesFaces({
			edges_vertices: [],
			faces_vertices: [
				[0, 1, 3],
				[2, 3, 1],
			],
		}),
	)[0];
	expect(result.length).toBe(2);
	expect(result[1].length).toBe(1);
	expect(result[1][0].index).toBe(1);
	expect(result[1][0].parent).toBe(0);
	// this edge order: [3, 1] needs to match order of these indices in
	// the second face. 3, then 1.
	// expect(result[1][0].edge_vertices[0]).toBe(3);
	// expect(result[1][0].edge_vertices[1]).toBe(1);
});

test("face walk tree, empty edges_vertices. same as test above", () => {
	const result = ear.graph.minimumSpanningTrees(
		ear.graph.makeFacesFaces({
			edges_vertices: [],
			faces_vertices: [
				[0, 1, 3],
				[2, 3, 1],
			],
		}),
	)[0];
	expect(result.length).toBe(2);
	expect(result[1].length).toBe(1);
	expect(result[1][0].index).toBe(1);
	expect(result[1][0].parent).toBe(0);
	// this edge order: [3, 1] needs to match order of these indices in
	// the second face. 3, then 1.
	// expect(result[1][0].edge_vertices[0]).toBe(3);
	// expect(result[1][0].edge_vertices[1]).toBe(1);
});

test("face walk tree, finding an edge match. bad edge formations", () => {
	// good edge
	const result0 = ear.graph.minimumSpanningTrees(
		ear.graph.makeFacesFaces({
			edges_vertices: [[1, 3]],
			faces_vertices: [
				[0, 1, 3],
				[2, 3, 1],
			],
		}),
	)[0];
	// expect(result0[1][0].edge_vertices[0]).toBe(3);
	// expect(result0[1][0].edge_vertices[1]).toBe(1);

	// bad edge formation
	const result1 = ear.graph.minimumSpanningTrees(
		ear.graph.makeFacesFaces({
			edges_vertices: [[3, 1, 0]],
			faces_vertices: [
				[0, 1, 3],
				[2, 3, 1],
			],
		}),
	)[0];
	// expect(result1[1][0].edge_vertices[0]).toBe(3);
	// expect(result1[1][0].edge_vertices[1]).toBe(1);
	const result2 = ear.graph.minimumSpanningTrees(
		ear.graph.makeFacesFaces({
			edges_vertices: [[3, 0, 1]],
			faces_vertices: [
				[0, 1, 3],
				[2, 3, 1],
			],
		}),
	)[0];
	// expect(result2[1][0].edge_vertices[0]).toBe(3);
	// expect(result2[1][0].edge_vertices[1]).toBe(1);
});

test("face walk tree, two graphs, joined at a single vertex", () => {
	const foldfile = fs.readFileSync("./tests/files/fold/kissing-squares.fold", "utf-8");
	const graph = JSON.parse(foldfile);
	const faces_faces = ear.graph.makeFacesFaces(graph);
	const trees1 = ear.graph.minimumSpanningTrees(faces_faces, [0]);
	fs.writeFileSync(
		"./tests/tmp/disjoint-spanning-trees.fold",
		JSON.stringify(trees1),
		"utf8",
	);
	// all 4 face indices are covered, even if the faces are (edge-) disjoint.
	expect(trees1[0][0][0].index).toBe(0);
	expect(trees1[0][1][0].index).toBe(1);
	expect(trees1[0][1][0].parent).toBe(0);
	expect(trees1[1][0][0].index).toBe(2);
	expect(trees1[1][1][0].index).toBe(3);
	expect(trees1[1][1][0].parent).toBe(2);

	const trees2 = ear.graph.minimumSpanningTrees(faces_faces, [3]);
	// all 4 face indices are covered, even if the faces are (edge-) disjoint.
	expect(trees2[0][0][0].index).toBe(3);
	expect(trees2[0][1][0].index).toBe(2);
	expect(trees2[0][1][0].parent).toBe(3);
	expect(trees2[1][0][0].index).toBe(0);
	expect(trees2[1][1][0].index).toBe(1);
	expect(trees2[1][1][0].parent).toBe(0);
});
