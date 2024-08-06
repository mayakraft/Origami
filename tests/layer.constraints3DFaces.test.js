import { expect, test } from "vitest";
import fs from "fs";
import ear from "../src/index.js";

test("makeSolverConstraints3D, subgraph components", () => {
	const foldfile = fs.readFileSync(
		"./tests/files/fold/layers-3d-edge-face.fold",
		"utf-8",
	);
	const fold = JSON.parse(foldfile);
	const frames = ear.graph.getFileFramesAsArray(fold);
	const foldedForms = frames.map((frame) => ({
		...frame,
		vertices_coords: ear.graph.makeVerticesCoordsFolded(frame),
	}));
	foldedForms.forEach((folded) => ear.graph.populate(folded));

	const results = foldedForms.map((folded) =>
		ear.layer.constraints3DFaceClusters(folded),
	);

	expect(results[3].clusters_graph).toMatchObject([
		{
			// vertices 0, 1, 5, 9 and 3, 4, 6, 7
			// vertices_coords: [[0, 0], [2, 0],, [1, 0], [0, 0], [0, 1], [0, 1], [1, 1],, [2, 1]],
			// edges 0, 4, 8, 9 and 3, 5, 11, 12
			edges_vertices: [
				[0, 1],
				,
				,
				[3, 4],
				[5, 0],
				[6, 7],
				,
				,
				[9, 5],
				[9, 1],
				,
				[7, 3],
				[4, 6],
			],
			edges_faces: [[0], , , [3], [0], [3], , , [0], [0], , [3], [3]],
			edges_assignment: ["B", , , "B", "B", "B", , , "B", "V", , "M", "B"],
			edges_foldAngle: [0, , , 0, 0, 0, , , 0, 120, , -60, 0],
			// faces 0, 3
			faces_vertices: [[0, 1, 9, 5], , , [3, 4, 6, 7]],
			faces_edges: [[0, 9, 8, 4], , , [3, 12, 5, 11]],
			faces_faces: [[], , , []],
			// faces_center: [[1, 0.5],,, [0.5, 0.5]],
		},
		{
			// vertices_coords: [, [-1, 0], [0, 0],,,,,, [0, 1], [-1, 1]],
			// edges 1, 7, 9, 10
			edges_vertices: [, [1, 2], , , , , , [8, 9], , [9, 1], [8, 2]],
			edges_faces: [, [1], , , , , , [1], , [1], [1]],
			edges_assignment: [, "B", , , , , , "B", , "V", "V"],
			edges_foldAngle: [, 0, , , , , , 0, , 120, 120],
			// faces 1
			faces_vertices: [, [1, 2, 8, 9]],
			faces_edges: [, [1, 10, 7, 9]],
			faces_faces: [, []],
			// faces_center: [, [-0.5, 0.5]],
		},
		{
			// vertices_coords: [,,  [-1.5, 0], [-0.5, 0],,,, [-0.5, 1] [-1.5, 1]],
			// edges 2, 6, 10, 11
			edges_vertices: [, , [2, 3], , , , [7, 8], , , , [8, 2], [7, 3]],
			edges_faces: [, , [2], , , , [2], , , , [2], [2]],
			edges_assignment: [, , "B", , , , "B", , , , "V", "M"],
			edges_foldAngle: [, , 0, , , , 0, , , , 120, -60],
			// faces 2
			faces_vertices: [, , [2, 3, 7, 8]],
			faces_edges: [, , [2, 11, 6, 10]],
			faces_faces: [, , []],
			// faces_center: [,, [-1, 0.5]],
		},
	]);
});

test("makeSolverConstraints3D, Mooser's train, one fourth of carriage only", () => {
	const FOLD = fs.readFileSync(
		"./tests/files/fold/moosers-train-carriage-fourth.fold",
		"utf-8",
	);
	const graph = JSON.parse(FOLD);
	const folded = {
		...graph,
		vertices_coords: ear.graph.makeVerticesCoordsFolded(graph),
	};
	ear.graph.populate(folded);

	// face cluster stuff is test in other files: graph.faces.planes
	const {
		// planes_transform,
		// faces_plane,
		// faces_cluster,
		// faces_winding,
		// faces_polygon,
		// faces_center,
		clusters_faces,
		// clusters_graph,
		// clusters_transform,
		// facesFacesOverlap,
		facePairs,
	} = ear.layer.constraints3DFaceClusters(folded);

	expect(facePairs).toMatchObject([
		// bottom carriage, in front of wheel
		"0 1",
		"0 37",
		"0 38",
		"0 39",
		"1 37",
		"1 38",
		"1 39",
		// front of wheel
		"2 15",
		// back of wheel
		"4 17",
		// bottom carriage, all over
		"5 36",
		"5 39",
		"5 6",
		"5 33",
		"5 34",
		"5 35",
		"5 37",
		"5 38",
		"6 33",
		"6 34",
		"6 37",
		"6 38",
		"6 35",
		"6 36",
		"6 39",
		// back of carriage, mostly below hitch plane
		"7 18",
		"7 25",
		"7 23",
		"7 24",
		"7 31",
		"7 19",
		"7 21",
		// hitch joint plane
		"8 10",
		"8 11",
		"8 12",
		"8 13",
		"8 14",
		"8 9",
		"9 10",
		"9 11",
		"9 12",
		"9 13",
		"9 14",
		"10 11",
		"10 12",
		"10 13",
		"10 14",
		"11 12",
		"11 13",
		"11 14",
		"12 13",
		"12 14",
		"13 14",
		// back of carriage
		"18 25",
		"18 23",
		"18 24",
		"18 31",
		"18 19",
		"18 21",
		"19 25",
		"19 23",
		"19 24",
		"19 31",
		"19 21",
		"20 22",
		"20 21",
		"20 24",
		"20 31",
		"21 25",
		"21 23",
		"21 24",
		"21 31",
		"21 22",
		"22 24",
		"22 31",
		"23 25",
		"23 24",
		"23 31",
		"24 25",
		"24 31",
		"25 31",
		// large side of carriage
		"26 29",
		"26 32",
		"26 27",
		"26 28",
		"27 29",
		"27 32",
		"27 28",
		"28 29",
		"28 32",
		"29 32",
		// bottom of carriage
		"33 34",
		"33 37",
		"33 38",
		"33 35",
		"33 36",
		"33 39",
		"34 37",
		"34 38",
		"34 35",
		"34 36",
		"34 39",
		"35 37",
		"35 38",
		"35 36",
		"35 39",
		"36 39",
		"36 37",
		"36 38",
		"37 38",
		"37 39",
		"38 39",
	]);

	expect(clusters_faces).toMatchObject([
		// bottom of wheel
		[3],
		// bottom of carriage
		[0, 1, 5, 6, 33, 34, 35, 36, 37, 38, 39],
		// hitch joint plane
		[8, 9, 10, 11, 12, 13, 14],
		// top of carriage
		[30],
		// front side of wheel
		[2, 15],
		// back side of wheel
		[4, 17],
		// back of carriage
		[7, 18, 19, 20, 21, 22, 23, 24, 25, 31],
		// back of wheel
		[16],
		// big side of carriage
		[26, 27, 28, 29, 32],
	]);
});
