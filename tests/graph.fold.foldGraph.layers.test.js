import { expect, test } from "vitest";
import fs from "fs";
import ear from "../src/index.js";

const FOLD_ANGLE = 90;

test("foldGraph, faceOrders, square folding 00", () => {
	const graph = ear.graph.square();

	let vertices_coordsFolded;

	// 1.
	// fold the square in half horizontally
	//    0
	// ________  valley crease
	//
	//    1
	const result1 = ear.graph.foldLine(
		graph,
		{ vector: [1, 0], origin: [0.5, 0.5] },
		{ assignment: "V" },
	);
	expect(result1.faces.map).toMatchObject([[0, 1]]);
	// valley crease puts both faces faces towards each other
	expect(graph.faceOrders).toMatchObject([[0, 1, 1]]);

	// the stationary face is top face
	vertices_coordsFolded = ear.graph.makeVerticesCoordsFlatFolded(graph, [0]);

	// 2.
	// into the 2:1 rectangle, fold a 45deg line \, from the top left
	// corner to the center of the bottom line.
	// 0 \   1
	// ____\____ new creases are flat
	//     /
	// 3 /   2

	const result2 = ear.graph.foldLine(
		graph,
		{ vector: [-1, 1], origin: [0.5, 0.5] },
		{ assignment: "F", vertices_coordsFolded },
	);
	expect(result2.faces.map).toMatchObject([[0, 1], [2, 3]]);
	// the single [0, 1, -1] turns into four: [0, 2], [0, 3], [1, 2], [1, 3]
	// but 0-2 and 1-3 do not overlap each other.
	// all of which remain at a -1. additionally:
	// [0, 1, 1] valley crease makes them face into each other.
	// [2, 3, -1] mountain crease makes them face away from each other.
	expect(graph.faceOrders).toMatchObject([
		[1, 2, 1],
		[0, 3, 1],
	]);

	// no changes, in this case
	// run the layer solver
	vertices_coordsFolded = ear.graph.makeVerticesCoordsFlatFolded(graph, [0]);
	graph.faceOrders = ear
		.layer({ ...graph, vertices_coords: vertices_coordsFolded })
		.faceOrders();
	// console.log(JSON.stringify(graph.faceOrders));

	// 3.
	// vertical line through the center
	// 0 \ 2|  3
	// ____\|____ new creases are flat
	//     /|
	// 1 / 4|  5

	const result3 = ear.graph.foldLine(
		graph,
		{ vector: [0, 1], origin: [0.5, 0.5] },
		{ assignment: "F", vertices_coordsFolded },
	);
	expect(result3.faces.map).toMatchObject([[0], [2, 3], [4, 5], [1]]);
	expect(graph.faceOrders).toMatchObject([
		[2, 4, 1],
		[0, 1, 1],
		[3, 5, 1],
	]);

	// no changes, in this case
	// run the layer solver
	vertices_coordsFolded = ear.graph.makeVerticesCoordsFlatFolded(graph, [0]);
	graph.faceOrders = ear
		.layer({ ...graph, vertices_coords: vertices_coordsFolded })
		.faceOrders();
	// console.log(JSON.stringify(result3.faces.map));
	// console.log(JSON.stringify(graph.faceOrders));


	// 4.
	// vertical line through the left half side
	// \7 |6 |  0
	// 3 \|  |
	// ___|2\|____ new creases are flat
	//    |5/|
	// 4 /|  |
	// /9 |8 |  1

	const result4 = ear.graph.foldLine(
		graph,
		{ vector: [0, 1], origin: [0.25, 0.5] },
		{ assignment: "F", vertices_coordsFolded },
	);
	expect(result4.faces.map).toMatchObject([[2, 3], [4, 5], [6, 7], [0], [8, 9], [1]]);
	expect(graph.faceOrders).toMatchObject([
		[6, 8, 1],
		[0, 1, 1],
		[3, 4, 1],
		[2, 5, 1],
		[7, 9, 1],
	]);

	// no changes, in this case
	// run the layer solver
	vertices_coordsFolded = ear.graph.makeVerticesCoordsFlatFolded(graph, [0]);
	graph.faceOrders = ear
		.layer({ ...graph, vertices_coords: vertices_coordsFolded })
		.faceOrders();

	// console.log(JSON.stringify(graph.faceOrders));

	// 5.
	// diagonal line
	// \4 |\11|
	//  \ |  \|  6
	//   \|10 |\
	// 1  |\  |  \
	// ___|0 \|_7__\____ valley on top, mountain on bottom
	//    |3 /| 8  /
	// 2  |/  |  /
	//   /|12 |/
	//  / |  /|  9
	// /5 |/13|
	const result5 = ear.graph.foldLine(
		graph,
		{ vector: [-1, 1], origin: [0.75, 0.5] },
		{ assignment: "V", vertices_coordsFolded },
	);
	expect(result5.faces.map).toMatchObject([
		[6, 7], [8, 9], [0], [1], [2], [3], [10, 11], [4], [12, 13], [5],
	]);
	// A: [6, 8, 1], 6 into 10,11 and 8 into 12, 13, so this expands into
	// - 10-12 (y), 10-13 (n), 11-12 (y), 11-13 (n)
	// B: [0, 1, 1], 0 into 6, 7 and 1 into 8, 9, so this expands into
	// - 6-8 (n), 6-9 (y), 7-8 (y), 7-9 (n)
	// C: [3, 4, 1], into 1-2
	// D: [2, 5, 1], into 0-3
	// E: [7, 9, 1], into 4-5

	expect(graph.faceOrders).toMatchObject([
		[10, 12, 1], // A
		[1, 2, 1], // C
		[0, 3, 1], // D
		[4, 5, 1], // E
		[7, 8, 1], // B
		[6, 9, 1], // B
		[11, 13, 1], // A
		[6, 7, 1], // new valley fold, neighbors
		[8, 9, -1], // new mountain fold, neighbors
		[10, 11, 1], // new valley fold, neighbors
		[12, 13, -1], // new mountain fold, neighbors
	]);

	// no changes, in this case
	// run the layer solver
	vertices_coordsFolded = ear.graph.makeVerticesCoordsFlatFolded(graph, [0]);
	graph.faceOrders = ear
		.layer({ ...graph, vertices_coords: vertices_coordsFolded })
		.faceOrders();
	expect(graph.faceOrders).toMatchObject([
		[10, 12, 1],
		[1, 2, 1],
		[0, 3, 1],
		[4, 5, 1],
		[7, 8, 1],
		[6, 9, 1],
		[11, 13, 1],
		[6, 7, 1],
		[8, 9, -1],
		[10, 11, 1],
		[12, 13, -1],
		[11, 12, -1], // found. yes. 11 is behind 12
		[6, 8, -1], // found. yes. 6 is behind 8
		[7, 9, -1], // found. yes 7 is behind 9
		[6, 10, 1], // found. yes 6 and 10 face each other
		[9, 12, -1], // found. yes 9 and 12 face away
		[9, 10, 1], // found. yes. 9 is in front of 10
		[6, 12, -1], // found. yes 6 is behind 12
		[10, 13, -1], // found. yes 10 is behind 13
		[0, 6, 1], // found. yes 0 and 6 face each other
		[3, 9, -1], // found. yes 3 and 9 face away
		[0, 9, -1], // found. yes 0 is behind 9
		[3, 6, 1], // found. yes 3 is in front of 6
	]);
});

test("foldGraph, faceOrders, square folding 01", () => {
	const graph = ear.graph.square();

	let vertices_coordsFolded;

	// 1.
	// fold the square in half horizontally
	//    0
	// ________  mountain crease
	//
	//    1
	const result1 = ear.graph.foldLine(
		graph,
		{ vector: [1, 0], origin: [0.5, 0.5] },
		{ assignment: "M" },
	);
	expect(result1.faces.map).toMatchObject([[0, 1]]);
	// mountain crease puts both faces faces away from each other
	// face 1 is under face 0.
	expect(graph.faceOrders).toMatchObject([[0, 1, -1]]);

	// the stationary face is top face
	vertices_coordsFolded = ear.graph.makeVerticesCoordsFlatFolded(graph, [0]);

	// 2.
	// into the 2:1 rectangle, fold a 45deg line \, from the top left
	// corner to the center of the bottom line.
	// 0\  1
	// __\____ all mountain except the top \ is valley
	//   /
	// 3/  2
	// 0 is the stationary face, the larger flap swings downwards
	const result2 = ear.graph.foldLine(
		graph,
		{ vector: [-1, 1], origin: [0.5, 0.5] },
		{ assignment: "V", vertices_coordsFolded },
	);
	expect(result2.faces.map).toMatchObject([[0, 1], [2, 3]]);
	// the single [0, 1, -1] turns into four: [0, 2], [0, 3], [1, 2], [1, 3]
	// but 0-2 and 1-3 do not overlap each other.
	// all of which remain at a -1. additionally:
	// [0, 1, 1] valley crease makes them face into each other.
	// [2, 3, -1] mountain crease makes them face away from each other.
	expect(graph.faceOrders).toMatchObject([
		[1, 2, -1], // tested 1 is behind 2's normal
		[0, 3, -1], // tested 0 is behind 3's normal
		[0, 1, 1], // neighbors 0 and 1 face each other
		[2, 3, -1], // neighbors 2 and 3 face away from each other
		// [0, 2, -1], // the algorithm does not know about this one
		// [1, 3, -1], // the algorithm does not know about this one
	]);

	// run the layer solver
	vertices_coordsFolded = ear.graph.makeVerticesCoordsFlatFolded(graph, [0]);
	graph.faceOrders = ear
		.layer({ ...graph, vertices_coords: vertices_coordsFolded })
		.faceOrders();

	expect(graph.faceOrders).toMatchObject([
		[1, 2, -1],
		[0, 3, -1],
		[0, 1, 1],
		[2, 3, -1],
		[0, 2, -1], // found by the layer solver
		[1, 3, -1], // found by the layer sover
	]);

	// 3.
	// fold the other missing 45 degree line. the majority of the piece
	// remains stationary, the triangle flap is folded
	// 0\2 /3
	// __\/__ all mountain except the top two \ / are valley
	//   /\
	// 1/4 \5
	const result3 = ear.graph.foldLine(
		graph,
		{ vector: [-1, -1], origin: [0.5, 0.5] },
		{ assignment: "M", vertices_coordsFolded },
	);
	expect(result3.faces.map).toMatchObject([[0], [2, 3], [4, 5], [1]]);

	// A: [0, 2, -1] becomes [0, 4], [0, 5]
	// B: [1, 2, -1] becomes [2, 4], [2, 5], [3, 4], [3, 5]
	// C: [0, 3, -1] becomes [0, 1]
	// D: [1, 3, -1] becomes [2, 1], [3, 1]
	// E: [0, 1, 1] becomes [0, 2], [0, 3]
	// F: [2, 3, -1] becomes [4, 1], [5, 1]

	// facing each other: 0-2, 2-3
	// facing away: 0-1, 1-4, 4-5, 3-5
	expect(graph.faceOrders).toMatchObject([
		[2, 4, -1], // B -- tested 2 is behind 4
		[0, 1, -1], // C -- M neighbors
		[0, 2, 1], // E -- V neighbors
		[4, 1, -1], // F -- M neighbors
		[0, 4, -1], // A -- tested 0 is behind 4
		[2, 1, -1], // D -- tested 2 is behind 1
		[3, 5, -1], // B -- M neighbors
		[2, 3, 1], // new V neighbors
		[4, 5, -1], // new M neighbors
		// [3, 4, -1], // not found by the fold algorithm
		// [2, 5, -1], // not found by the fold algorithm
	]);

	// run the layer solver
	vertices_coordsFolded = ear.graph.makeVerticesCoordsFlatFolded(graph, [0]);
	graph.faceOrders = ear
		.layer({ ...graph, vertices_coords: vertices_coordsFolded })
		.faceOrders();

	expect(graph.faceOrders).toMatchObject([
		[2, 4, -1],
		[0, 1, -1],
		[0, 2, 1],
		[1, 4, -1],
		[0, 4, -1],
		[1, 2, 1],
		[3, 5, -1],
		[2, 3, 1],
		[4, 5, -1],
		[3, 4, -1], // found by the layer solver algorithm
		[2, 5, -1], // found by the layer solver algorithm
		// and for completeness, these are formed somewhere in the foldGraph
		// algorithm, but are correctly identified as not overlapping and removed.
		// [3, 1, 1], // D -- !! 1 and 3 do not overlap
		// [0, 3, 1], // E -- !! 0 and 3 do not overlap
		// [0, 5, -1], // A -- !! 0 and 5 do not overlap
		// [5, 1, 1], // F -- !! 1 and 5 do not overlap
	]);
});

test("foldGraph, faceOrders, square folding 02 with layer solver", () => {
	const graph = ear.graph.square();
	let vertices_coordsFolded;

	// 1.
	// fold the square in half diagonally, flat crease
	//  0    /
	//     /    flat
	//   /
	// /    1
	const result1 = ear.graph.foldLine(
		graph,
		{ vector: [1, 1], origin: [0, 0] },
		{ assignment: "F" },
	);
	expect(result1.faces.map).toMatchObject([[0, 1]]);
	expect(graph.faceOrders).toMatchObject(undefined);
	vertices_coordsFolded = ear.graph.makeVerticesCoordsFlatFolded(graph, [0]);

	// 2.
	// add horizontal valley
	//  1     / 2
	// _____/_____  horizontal valley
	// 0  /    3
	//  /
	const result2 = ear.graph.foldLine(
		graph,
		{ vector: [1, 0], origin: [0.5, 0.5] },
		{ assignment: "V", vertices_coordsFolded },
	);
	expect(result2.faces.map).toMatchObject([[0, 1], [2, 3]]);
	// 0 turns into 0 and 1
	// 1 turns into 2 and 2
	// small triangle faces: [0, 1], [2, 3]
	// then [1, 3] should also overlap.
	// all faces face each other (1)
	expect(graph.faceOrders).toMatchObject([
		[0, 1, 1],
		[2, 3, 1],
		// [1, 3, 1], // the algorithm will not know about this one
	]);

	// run the layer solver
	vertices_coordsFolded = ear.graph.makeVerticesCoordsFlatFolded(graph, [0]);
	graph.faceOrders = ear
		.layer({ ...graph, vertices_coords: vertices_coordsFolded })
		.faceOrders();

	expect(graph.faceOrders).toMatchObject([
		[0, 1, 1],
		[2, 3, 1],
		[1, 3, 1], // the layer solver algorithm just added this
	]);

	// 3.
	// fold a 45 degree line, this reassigns one of the flats
	// 3\4 /1
	// __\/__ all valley except the top \ is mountain, top / is flat
	//   /
	// 0/  2
	const result3 = ear.graph.foldLine(
		graph,
		{ vector: [-1, -1], origin: [0.5, 0.5] },
		{ assignment: "V", vertices_coordsFolded },
	);
	expect(result3.faces.map).toMatchObject([[0], [3, 4], [1], [2]]);

	// face 1 becomes 3 and 4
	// [0, 1, 1] turns into [0, 3], [0, 4] BUT 0-4 do not overlap
	// [2, 3, 1] turns into [1, 2].
	// [1, 3, 1] turns into [3, 2], [4, 2] BUT 3-2 do not overlap
	// new crease makes new relationships between
	// 0-2, 3-4 (neighbors) and 2-3, 0-4 (not neighbors)

	// facing each other: 0-2, 2-3
	// facing away: 0-1, 1-4, 4-5, 3-5
	expect(graph.faceOrders).toMatchObject([
		[0, 3, 1], // horizontal crease.
		[1, 2, 1], // horizontal crease.
		[4, 2, 1], // horizontal crease.
		[3, 4, -1], // new crease. M
		[2, 0, 1], // new crease. V
		// [2, 3, -1], // the fold algorithm will not know about this one
		// [0, 4, -1], // the fold algorithm will not know about this one
	]);

	// run the layer solver
	vertices_coordsFolded = ear.graph.makeVerticesCoordsFlatFolded(graph, [0]);
	graph.faceOrders = ear
		.layer({ ...graph, vertices_coords: vertices_coordsFolded })
		.faceOrders();

	expect(graph.faceOrders).toMatchObject([
		[0, 3, 1], // horizontal crease.
		[1, 2, 1], // horizontal crease.
		[2, 4, 1], // horizontal crease.
		[3, 4, -1], // new crease. M
		[0, 2, 1], // new crease. V
		[2, 3, -1], // discovered by the layer solver
		[0, 4, -1], // discovered by the layer solver
	]);
});

test("foldGraph, faceOrders, square folding, valley, valley", () => {
	const graph = ear.graph.square();
	let vertices_coordsFolded;

	ear.graph.foldGraph(
		graph,
		{ vector: [3, 1], origin: [0.5, 0.5] },
		ear.math.includeL,
		{ assignment: "V" },
	);
	graph.faceOrders = [[0, 1, 1]];
	expect(graph.faceOrders).toMatchObject([[0, 1, 1]]);
	ear.graph.foldGraph(
		graph,
		{ vector: [-1, 5], origin: [0.5, 0.5] },
		ear.math.includeL,
		{ assignment: "V" },
	);

	// splitFace (first): 0 becomes 2, 3
	// [0, 1, 1] becomes two rules: [2, 1, 1], [3, 1, 1].
	// remap: 0->X 1->0 2->1 3->2
	// rules become: [1, 0, 1] and [2, 0, 1]
	// splitFace (second): 0 becomes 3, 4
	// [1, 0, 1] becomes [1, 3, 1] and [1, 4, 1]
	// [2, 0, 1] becomes [2, 3, 1] and [2, 4, 1], the order should be:
	// [1, 3, 1], [2, 3, 1], [1, 4, 1], [2, 4, 1]
	// faces get remapped, 0->X, 1->0, 2->1, 3->2, 4->3
	// [0, 2, 1], [1, 2, 1], [0, 3, 1], [1, 3, 1]
	// finally, we deal with the faces which no longer overlap
	// 0, 2 no longer overlap, 1, 3 no longer overlap
	// split line separated by a "valley"
	// windings: 0 true, 1 true, 2 false, 3 false
	// 0-2 face 2 is second one, false on valley results in -1
	// 1-3 face 3 is second one, false on valley, results in -1. becomes:
	// [0, 2, -1], [1, 2, 1], [0, 3, 1], [1, 3, -1]
	// two new orders:
	// - 0-1 (true winding) valley 1.
	// - 2-3 (false winding) valley -1.
	expect(graph.faceOrders).toMatchObject([
		[1, 2, 1],
		[0, 3, 1],
		[0, 1, 1],
		[2, 3, -1],
		// [0, 2, -1], // not yet found by this fold algorithm
		// [1, 3, -1], // not yet found by this fold algorithm
	]);

	// run the layer solver
	vertices_coordsFolded = ear.graph.makeVerticesCoordsFlatFolded(graph, [0]);
	graph.faceOrders = ear
		.layer({ ...graph, vertices_coords: vertices_coordsFolded })
		.faceOrders();

	expect(graph.faceOrders).toMatchObject([
		[1, 2, 1],
		[0, 3, 1],
		[0, 1, 1],
		[2, 3, -1],
		[0, 2, -1], // found by the layer solver
		[1, 3, -1], // found by the layer solver
	]);

	ear.graph.foldGraph(
		graph,
		{ vector: [4, -1], origin: [0.25, 0.25] },
		ear.math.includeL,
		{ assignment: "V" },
	);
	expect(graph.faceOrders).toMatchObject([
		[0, 4, -1],
		[2, 6, -1],
		[1, 6, 1],
		[1, 2, 1],
		[3, 4, 1],
		[0, 3, 1],
		[2, 5, 1],
		[5, 6, -1],
		[1, 5, -1],
		[0, 7, 1],
		[4, 7, -1],
		[3, 7, -1],
		[0, 1, -1],
		[2, 3, 1],
		[4, 5, -1],
		[6, 7, 1],
	]);

	// run the layer solver
	vertices_coordsFolded = ear.graph.makeVerticesCoordsFlatFolded(graph, [0]);
	graph.faceOrders = ear
		.layer({ ...graph, vertices_coords: vertices_coordsFolded })
		.faceOrders();

	expect(graph.faceOrders).toMatchObject([
		[0, 4, -1], [2, 6, -1], [1, 6, 1], [1, 2, 1], [3, 4, 1], [0, 3, 1],
		[2, 5, 1], [5, 6, -1], [1, 5, -1], [0, 7, 1], [4, 7, -1], [3, 7, -1],
		[0, 1, -1], [2, 3, 1], [4, 5, -1], [6, 7, 1], [1, 4, -1], [3, 6, 1],
		[0, 6, 1], [0, 2, 1], [2, 4, -1], [4, 6, 1], [1, 3, 1], [3, 5, -1],
		[0, 5, -1], [1, 7, 1], [2, 7, 1], [5, 7, 1],
	]);
});

test("foldGraph, faceOrders, square folding, valley, mountain", () => {
	const graph = ear.graph.square();
	ear.graph.foldGraph(
		graph,
		{ vector: [3, 1], origin: [0.5, 0.5] },
		ear.math.includeL,
		{ assignment: "V" },
	);
	graph.faceOrders = [[0, 1, 1]];
	expect(graph.faceOrders).toMatchObject([[0, 1, 1]]);
	ear.graph.foldGraph(
		graph,
		{ vector: [-1, 5], origin: [0.5, 0.5] },
		ear.math.includeL,
		{ assignment: "M" },
	);

	// splitFace (first): 0 becomes 2, 3
	// [0, 1, 1] becomes two rules: [2, 1, 1], [3, 1, 1].
	// remap: 0->X 1->0 2->1 3->2
	// rules become: [1, 0, 1] and [2, 0, 1]
	// splitFace (second): 0 becomes 3, 4
	// [1, 0, 1] becomes [1, 3, 1] and [1, 4, 1]
	// [2, 0, 1] becomes [2, 3, 1] and [2, 4, 1], the order should be:
	// [1, 3, 1], [2, 3, 1], [1, 4, 1], [2, 4, 1]
	// faces get remapped, 0->X, 1->0, 2->1, 3->2, 4->3
	// [0, 2, 1], [1, 2, 1], [0, 3, 1], [1, 3, 1]
	// finally, we deal with the faces which no longer overlap
	// 0, 2 no longer overlap, 1, 3 no longer overlap
	// split line separated by a "mountain"
	// windings: 0 true, 1 true, 2 false, 3 false
	// 0-2 face 2 is second one, false on mountain results in 1
	// 1-3 face 3 is second one, false on mountain, results in 1. becomes:
	// [0, 2, 1], [1, 2, 1], [0, 3, 1], [1, 3, 1]
	// two new orders:
	// - 0-1 (true winding) mountain -1.
	// - 2-3 (false winding) mountain 1.

	expect(graph.faceOrders).toMatchObject([
		[1, 2, 1], [0, 3, 1], [0, 1, -1], [2, 3, 1],
	]);

	// run the layer solver
	const vertices_coordsFolded = ear.graph.makeVerticesCoordsFlatFolded(graph, [0]);
	graph.faceOrders = ear
		.layer({ ...graph, vertices_coords: vertices_coordsFolded })
		.faceOrders();

	expect(graph.faceOrders).toMatchObject([
		[1, 2, 1], [0, 3, 1], [0, 1, -1], [2, 3, 1], [0, 2, 1], [1, 3, 1],
	]);
});

test("foldGraph, faceOrders, square folding", () => {
	const graph = ear.graph.square();

	const sequence = {
		...structuredClone(graph),
		file_frames: [],
	};

	// fold step
	ear.graph.foldGraph(
		graph,
		{ vector: [3, 1], origin: [0.5, 0.5] },
		ear.math.includeL,
		{ assignment: "V" },
	);
	sequence.file_frames.push(structuredClone(graph));
	sequence.file_frames.push({
		...structuredClone(graph),
		vertices_coords: ear.graph.makeVerticesCoordsFlatFolded(graph),
		frame_classes: ["foldedForm"],
	});

	expect(graph.faceOrders).toMatchObject([[0, 1, 1]]);

	// fold step
	ear.graph.foldGraph(
		graph,
		{ vector: [-1, 5], origin: [0.5, 0.5] },
		ear.math.includeL,
		{ assignment: "V" },
	);
	sequence.file_frames.push(structuredClone(graph));
	sequence.file_frames.push({
		...structuredClone(graph),
		vertices_coords: ear.graph.makeVerticesCoordsFlatFolded(graph),
		frame_classes: ["foldedForm"],
	});

	// splitFace (first): 0 becomes 2, 3
	// [0, 1, 1] becomes two rules: [2, 1, 1], [3, 1, 1].
	// remap: 0->X 1->0 2->1 3->2
	// rules become: [1, 0, 1] and [2, 0, 1]
	// splitFace (second): 0 becomes 3, 4
	// [1, 0, 1] becomes [1, 3, 1] and [1, 4, 1]
	// [2, 0, 1] becomes [2, 3, 1] and [2, 4, 1], the order should be:
	// [1, 3, 1], [2, 3, 1], [1, 4, 1], [2, 4, 1]
	// faces get remapped, 0->X, 1->0, 2->1, 3->2, 4->3
	// [0, 2, 1], [1, 2, 1], [0, 3, 1], [1, 3, 1]
	// expect(graph.faceOrders).toMatchObject([
	// 	[0, 2, 1], [1, 2, 1], [0, 3, 1], [1, 3, 1], [0, 1, 1], [2, 3, -1],
	// ]);

	// fold step
	ear.graph.foldGraph(
		graph,
		{ vector: [4, -1], origin: [0.25, 0.25] },
		ear.math.includeL,
		{ assignment: "V" },
	);
	sequence.file_frames.push(structuredClone(graph));
	sequence.file_frames.push({
		...structuredClone(graph),
		vertices_coords: ear.graph.makeVerticesCoordsFlatFolded(graph),
		frame_classes: ["foldedForm"],
	});

	// fold step
	ear.graph.foldGraph(
		graph,
		{ vector: [1, 4], origin: [0.25, 0.25] },
		ear.math.includeL,
		{ assignment: "V" },
	);
	sequence.file_frames.push(structuredClone(graph));
	sequence.file_frames.push({
		...structuredClone(graph),
		vertices_coords: ear.graph.makeVerticesCoordsFlatFolded(graph),
		frame_classes: ["foldedForm"],
	});

	// fold step
	ear.graph.foldGraph(
		graph,
		{ vector: [1, 0], origin: [0.125, 0.125] },
		ear.math.includeL,
		{ assignment: "V" },
	);
	sequence.file_frames.push(structuredClone(graph));
	sequence.file_frames.push({
		...structuredClone(graph),
		vertices_coords: ear.graph.makeVerticesCoordsFlatFolded(graph),
		frame_classes: ["foldedForm"],
	});

	// fold step
	ear.graph.foldGraph(
		graph,
		{ vector: [0, 1], origin: [0.125, 0.125] },
		ear.math.includeL,
		{ assignment: "V" },
	);
	sequence.file_frames.push(structuredClone(graph));
	sequence.file_frames.push({
		...structuredClone(graph),
		vertices_coords: ear.graph.makeVerticesCoordsFlatFolded(graph),
		frame_classes: ["foldedForm"],
	});

	// fold step
	ear.graph.foldGraph(
		graph,
		{ vector: [1, 1], origin: [0.05, 0.05] },
		ear.math.includeL,
		{ assignment: "V" },
	);
	sequence.file_frames.push(structuredClone(graph));
	sequence.file_frames.push({
		...structuredClone(graph),
		vertices_coords: ear.graph.makeVerticesCoordsFlatFolded(graph),
		frame_classes: ["foldedForm"],
	});

	// fold step
	ear.graph.foldGraph(
		graph,
		{ vector: [-1, 1], origin: [0.05, 0.05] },
		ear.math.includeL,
		{ assignment: "V" },
	);
	sequence.file_frames.push(structuredClone(graph));
	sequence.file_frames.push({
		...structuredClone(graph),
		vertices_coords: ear.graph.makeVerticesCoordsFlatFolded(graph),
		frame_classes: ["foldedForm"],
	});

	fs.writeFileSync(
		"./tests/tmp/foldGraph-fold-sequence.fold",
		JSON.stringify(sequence),
		"utf8",
	);
});

test("foldGraph, faceOrders, panels", () => {
	const FOLD = fs.readFileSync("tests/files/fold/panels-simple.fold", "utf-8");
	const graph = JSON.parse(FOLD);

	// no faceOrders exist at this point
	ear.graph.foldLine(
		graph,
		{ vector: [1, 0.1], origin: [0.5, 0.5] },
		{ assignment: "V" },
	);
	ear.graph.foldLine(
		graph.file_frames[0],
		{ vector: [1, -0.1], origin: [0.5, 0.5] },
		{ assignment: "V" },
	);
	ear.graph.foldLine(
		graph.file_frames[1],
		{ vector: [1, 0.1], origin: [0.5, 0.5] },
		{ assignment: "V" },
	);
	ear.graph.foldLine(
		graph.file_frames[2],
		{ vector: [1, -0.1], origin: [0.5, 0.5] },
		{ assignment: "V" },
	);
	ear.graph.foldLine(
		graph.file_frames[3],
		{ vector: [1, 0.1], origin: [0.5, 0.5] },
		{ assignment: "V" },
	);

	expect(graph.faceOrders)
		.toMatchObject([[0, 1, 1], [2, 3, -1]]);
	expect(graph.file_frames[0].faceOrders)
		.toMatchObject([[0, 1, 1], [2, 3, -1], [4, 5, 1]]);
	expect(graph.file_frames[1].faceOrders)
		.toMatchObject([[0, 1, 1], [2, 3, -1], [4, 5, 1], [6, 7, -1]]);
	expect(graph.file_frames[2].faceOrders)
		.toMatchObject([[0, 1, 1], [2, 3, -1], [4, 5, 1], [6, 7, -1], [8, 9, 1]]);
	expect(graph.file_frames[3].faceOrders)
		.toMatchObject([[0, 1, 1], [2, 3, -1], [4, 5, 1], [6, 7, -1], [8, 9, 1], [10, 11, -1]]);

	fs.writeFileSync(
		`./tests/tmp/foldGraph-panels.fold`,
		JSON.stringify(graph),
		"utf8",
	);
});

test("foldGraph, faceOrders, panels", () => {
	const FOLD = fs.readFileSync("tests/files/fold/panels-simple.fold", "utf-8");
	const graph = JSON.parse(FOLD);
	graph.faceOrders = [[0, 1, 1]];
	graph.file_frames[0].faceOrders = [[0, 1, 1], [1, 2, -1]];
	graph.file_frames[1].faceOrders = [[0, 1, 1], [1, 2, -1], [2, 3, 1]];
	graph.file_frames[2].faceOrders = [[0, 1, 1], [1, 2, -1], [2, 3, 1], [3, 4, -1]];
	graph.file_frames[3].faceOrders = [[0, 1, 1], [1, 2, -1], [2, 3, 1], [3, 4, -1], [4, 5, 1]];

	ear.graph.foldLine(
		graph,
		{ vector: [1, 0.1], origin: [0.5, 0.5] },
		{ assignment: "V" },
	);
	ear.graph.foldLine(
		graph.file_frames[0],
		{ vector: [1, -0.1], origin: [0.5, 0.5] },
		{ assignment: "V" },
	);
	ear.graph.foldLine(
		graph.file_frames[1],
		{ vector: [1, 0.1], origin: [0.5, 0.5] },
		{ assignment: "V" },
	);
	ear.graph.foldLine(
		graph.file_frames[2],
		{ vector: [1, -0.1], origin: [0.5, 0.5] },
		{ assignment: "V" },
	);
	ear.graph.foldLine(
		graph.file_frames[3],
		{ vector: [1, 0.1], origin: [0.5, 0.5] },
		{ assignment: "V" },
	);

	// console.log(JSON.stringify(graph.faceOrders));

	// in splitFace (first): face 0 turns into face 2 and 3.
	// [0, 1, 1] becomes two rules: [2, 1, 1], [3, 1, 1].
	// faces get remapped, 0->X, 1->0, 2->1, 3->2.
	// rules become: [1, 0, 1] and [2, 0, 1]
	// then, splitFace (second): face 0 turns into face 3 and 4
	// [1, 0, 1] becomes [1, 3, 1] and [1, 4, 1]
	// [2, 0, 1] becomes [2, 3, 1] and [2, 4, 1], the order should be:
	// [1, 3, 1], [2, 3, 1], [1, 4, 1], [2, 4, 1]
	// faces get remapped, 0->X, 1->0, 2->1, 3->2, 4->3
	// [0, 2, 1], [1, 2, 1], [0, 3, 1], [1, 3, 1]
	// newly non overlapping faces need to be dealt with:
	// 0-3 no longer overlap. 1-2 no longer overlap
	// - "valley" for 0-3 (3 is false winding) results in -1.
	// - "valley" for 1-2 (2 is false winding) results in -1.
	// finally,
	// then [0, 1, 1], [2, 3, -1] get calculated and added at the end
	expect(graph.faceOrders).toMatchObject([
		[0, 2, 1], [1, 3, 1], [0, 1, 1], [2, 3, -1], // [1, 2, -1], [0, 3, -1],
	]);

	// run the layer solver
	const vertices_coordsFolded = ear.graph.makeVerticesCoordsFlatFolded(graph, [0]);
	graph.faceOrders = ear
		.layer({ ...graph, vertices_coords: vertices_coordsFolded })
		.faceOrders();

	expect(graph.faceOrders).toMatchObject([
		[0, 2, 1], [1, 3, 1], [0, 1, 1], [2, 3, -1], [1, 2, -1], [0, 3, -1],
	]);

	fs.writeFileSync(
		`./tests/tmp/foldGraph-panels.fold`,
		JSON.stringify(graph),
		"utf8",
	);
});

test("foldGraph, 3D simple", () => {
	const graph = {
		vertices_coords: [
			[0, 0], [1, 0], [2, 0], [3, 0], [0, 3], [0, 2], [0, 1], [1, 3],
			[1, 2], [1, 1], [2, 1], [3, 1], [2, 2], [2, 3], [3, 2], [3, 3],
		],
		edges_vertices: [
			[0, 1], [1, 2], [2, 3], [4, 5], [5, 6], [6, 0], [7, 8], [8, 9], [9, 1],
			[6, 9], [9, 10], [10, 11], [2, 10], [10, 12], [12, 13], [14, 12], [12, 8],
			[8, 5], [3, 11], [11, 14], [14, 15], [15, 13], [13, 7], [7, 4],
		],
		edges_assignment: [
			"B", "B", "B", "B", "B", "B", "F", "F", "F", "F", "F", "F",
			"V", "V", "V", "M", "V", "V", "B", "B", "B", "B", "B", "B",
		],
		faces_vertices: [
			[0, 1, 9, 6], [1, 2, 10, 9], [2, 3, 11, 10], [4, 5, 8, 7], [5, 6, 9, 8],
			[7, 8, 12, 13], [8, 9, 10, 12], [10, 11, 14, 12], [12, 14, 15, 13],
		],
	};

	ear.graph.populate(graph);
	const folded = {
		...graph,
		vertices_coords: ear.graph.makeVerticesCoordsFlatFolded(graph),
	}
	graph.faceOrders = ear.layer(folded).faceOrders();

	// all of this checks out.
	// adjacent faces, valley: 1-2, 3-4, 5-6, 6-7, 5-8
	// adjacent faces, mountain: 7-8
	// solved layers: 5-7 (away), 6-8 (away)
	expect(graph.faceOrders).toMatchObject([
		[1, 2, 1], [6, 7, 1], [5, 8, 1], [7, 8, -1],
		[5, 6, 1], [3, 4, 1], [5, 7, -1], [6, 8, -1],
	]);

	fs.writeFileSync(
		`./tests/tmp/foldGraph-3D-simple-before.fold`,
		JSON.stringify(graph),
		"utf8",
	);

	ear.graph.foldLine(
		graph,
		{ vector: [-1, 1], origin: [1.75, 1.75] },
		{ assignment: "V", fold_angle: FOLD_ANGLE },
	);

	const newFolded = {
		...graph,
		vertices_coords: ear.graph.makeVerticesCoordsFolded(graph),
	};

	const { faces_plane } = ear.graph.getFacesPlane(newFolded);
	const badFaceOrders = graph.faceOrders
		.filter(([a, b]) => faces_plane[a] !== faces_plane[b]);
	expect(badFaceOrders).toHaveLength(0);

	fs.writeFileSync(
		`./tests/tmp/foldGraph-3D-simple.fold`,
		JSON.stringify(graph),
		"utf8",
	);

	fs.writeFileSync(
		`./tests/tmp/foldGraph-3D-simple-folded.fold`,
		JSON.stringify(newFolded),
		"utf8",
	);
});

test("foldGraph, 3D Kabuto", () => {
	const FOLD = fs.readFileSync("tests/files/fold/kabuto.fold", "utf-8");
	const fold = JSON.parse(FOLD);
	const graph = ear.graph.getFramesByClassName(fold, "creasePattern")[0];
	const folded = ear.graph.getFramesByClassName(fold, "foldedForm")[0];
	ear.graph.populate(graph);
	graph.faceOrders = ear.layer(folded).faceOrders();
	ear.graph.foldLine(
		graph,
		{ vector: [1, 0], origin: [0, 0.25] },
		{ assignment: "V", fold_angle: FOLD_ANGLE },
	);
	// ear.graph.foldLine(graph, { vector: [1, 0], origin: [0, 0.25] }, "F", 0);
	const newFoldedGraph = {
		...graph,
		vertices_coords: ear.graph.makeVerticesCoordsFolded(graph),
	};

	const { faces_plane } = ear.graph.getFacesPlane(newFoldedGraph);
	const badFaceOrders = graph.faceOrders
		.filter(([a, b]) => faces_plane[a] !== faces_plane[b]);
	expect(badFaceOrders).toHaveLength(0);

	fs.writeFileSync(
		`./tests/tmp/foldGraph-3D-kabuto.fold`,
		JSON.stringify(graph),
		"utf8",
	);

	fs.writeFileSync(
		`./tests/tmp/foldGraph-3D-kabuto-folded.fold`,
		JSON.stringify(newFoldedGraph),
		"utf8",
	);
});
