import fs from "fs";
import { expect, test } from "vitest";
import ear from "../src/index.js";

test("planarizeOverlaps, crossing lines", () => {
	const cp = {
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
	const {
		result,
		changes: { vertices, edges },
	} = ear.graph.planarizeOverlaps(cp);

	expect(cp.vertices_coords).toHaveLength(4);
	expect(result.vertices_coords).toHaveLength(5);
	expect(cp.edges_vertices).toHaveLength(2);
	expect(result.edges_vertices).toHaveLength(4);
	expect(vertices.map).toMatchObject([0, 1, 2, 3]);
	expect(edges.map).toMatchObject([
		[0, 1],
		[2, 3],
	]);
});

test("planarizeOverlaps, endpoints touching", () => {
	const cp = {
		vertices_coords: [
			[0, 0],
			[1, 1],
			[1, 1],
			[1, 0],
		],
		edges_vertices: [
			[0, 1],
			[2, 3],
		],
	};
	const {
		result,
		changes: { vertices, edges },
	} = ear.graph.planarizeOverlaps(cp);

	expect(cp.vertices_coords).toHaveLength(4);
	expect(result.vertices_coords).toHaveLength(3);
	expect(cp.edges_vertices).toHaveLength(2);
	expect(result.edges_vertices).toHaveLength(2);
	expect(vertices.map).toMatchObject([0, 1, 1, 2]);
	expect(edges.map).toMatchObject([[0], [1]]);
});

test("planarizeOverlaps, overlapping assignments", () => {
	const FOLD = fs.readFileSync(
		"./tests/files/fold/overlapping-assignments.fold",
		"utf-8",
	);
	const cp = JSON.parse(FOLD);
	const {
		result,
		changes: { vertices, edges },
	} = ear.graph.planarizeOverlaps(cp);

	// # of vertices does not change
	expect(cp.vertices_coords).toHaveLength(20);
	expect(result.vertices_coords).toHaveLength(20);

	// # of edges increases
	expect(cp.edges_vertices).toHaveLength(18);
	expect(result.edges_vertices).toHaveLength(34);

	expect(vertices.map).toMatchObject([
		0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
	]);
	expect(edges.map).toMatchObject([
		[0],
		[1],
		[2],
		[3],
		[4],
		[5],
		[6],
		[7, 8, 9],
		[10],
		[11],
		[12],
		[13, 14, 15, 16, 17],
		[18],
		[19],
		[20],
		[21, 22, 23, 24, 25, 26, 27],
		[28, 29],
		[30, 31, 32, 33],
	]);

	fs.writeFileSync(
		"./tests/tmp/planarizeOverlaps-overlapping-assignments.fold",
		JSON.stringify(result),
	);
});

test("planarizeOverlaps, crane", () => {
	const FOLD = fs.readFileSync("./tests/files/fold/crane.fold", "utf-8");
	const cp = JSON.parse(FOLD);
	const {
		result,
		changes: {
			vertices,
			edges,
			// edges_line,
			// lines,
		},
	} = ear.graph.planarizeOverlaps(cp);

	// this result is already planar. neither # of vertices nor edges change
	expect(cp.vertices_coords).toHaveLength(56);
	expect(result.vertices_coords).toHaveLength(56);
	expect(cp.edges_vertices).toHaveLength(114);
	expect(result.edges_vertices).toHaveLength(114);
	expect(vertices.map).toHaveLength(56);
	edges.map.forEach((val) => expect(val).toHaveLength(1));

	fs.writeFileSync("./tests/tmp/planarizeOverlaps-crane.fold", JSON.stringify(result));
});

test("planarizeOverlaps, non-planar-polygons pentagon", () => {
	const FOLD = fs.readFileSync("./tests/files/fold/non-planar-polygons.fold", "utf-8");
	const cp = JSON.parse(FOLD);
	const {
		result,
		changes: { vertices, edges },
	} = ear.graph.planarizeOverlaps(cp);

	expect(cp.vertices_coords).toHaveLength(15);
	expect(result.vertices_coords).toHaveLength(6);
	expect(cp.edges_vertices).toHaveLength(10);
	expect(result.edges_vertices).toHaveLength(10);

	expect(vertices.map).toMatchObject([0, 1, 2, 3, 4, 1, 5, 5, 3, 4, 5, 5, 2, 0, 5]);
	expect(edges.map).toMatchObject([[0], [1], [2], [3], [4], [5], [6], [7], [8], [9]]);

	fs.writeFileSync(
		"./tests/tmp/planarizeOverlaps-non-planar-polygons.fold",
		JSON.stringify(result),
	);
});

test("planarizeOverlaps, non-planar-polygons hexagon", () => {
	const FOLD = fs.readFileSync("./tests/files/fold/non-planar-polygons.fold", "utf-8");
	const cp = JSON.parse(FOLD).file_frames[0];
	const {
		result,
		changes: { vertices, edges },
	} = ear.graph.planarizeOverlaps(cp);

	expect(cp.vertices_coords).toHaveLength(24);
	expect(result.vertices_coords).toHaveLength(7);
	expect(cp.edges_vertices).toHaveLength(9);
	expect(result.edges_vertices).toHaveLength(12);

	expect(vertices.map).toMatchObject([
		0, 1, 2, 3, 4, 5, 1, 6, 3, 6, 5, 6, 2, 6, 4, 6, 6, 0, 3, 0, 1, 4, 5, 2,
	]);
	expect(ear.graph.invertFlatToArrayMap(vertices.map)).toMatchObject([
		[0, 17, 19],
		[1, 6, 20],
		[2, 12, 23],
		[3, 8, 18],
		[4, 14, 21],
		[5, 10, 22],
		[7, 9, 11, 13, 15, 16],
	]);
	expect(edges.map).toMatchObject([
		[0],
		[1],
		[2],
		[3],
		[4],
		[5],
		[6, 7],
		[8, 9],
		[10, 11],
	]);

	fs.writeFileSync(
		"./tests/tmp/planarizeCollinearEdges-non-planar-polygons.fold",
		JSON.stringify(result),
	);
});

test("planarize, foldedForm, windmill", () => {
	const FOLD = fs.readFileSync("./tests/files/fold/windmill.fold", "utf-8");
	const fold = JSON.parse(FOLD);
	const folded = ear.graph.getFramesByClassName(fold, "foldedForm")[0];
	const { result, changes } = ear.graph.planarizeOverlaps(folded);

	expect(folded.vertices_coords).toHaveLength(12);
	expect(result.vertices_coords).toHaveLength(13);
	expect(folded.edges_vertices).toHaveLength(20);
	expect(result.edges_vertices).toHaveLength(32);

	expect(result.vertices_coords).toMatchObject([
		[0, 2], // bottom point
		[2, 2], // center
		[2, 0], // left point
		[2, 4], // top point
		[1, 1], // square corner 1
		[3, 3], // square corner 2
		[4, 2], // right point
		[1, 3], // square corner 3
		[3, 1], // square corner 4
		[1, 2], // square edge 1
		[2, 1], // square edge 2
		[2, 3], // square edge 3
		[3, 2], // square edge 4
	]);

	expect(result.edges_vertices).toMatchObject([
		[0, 9],
		[9, 1],
		[1, 10],
		[10, 2],
		[3, 11],
		[11, 1],
		[1, 9],
		[9, 0],
		[0, 4],
		[5, 6],
		[7, 9],
		[9, 4],
		[4, 10],
		[10, 8],
		[7, 1],
		[8, 1],
		[4, 1],
		[3, 7],
		[8, 2],
		[8, 12],
		[12, 5],
		[5, 11],
		[11, 7],
		[2, 10],
		[10, 1],
		[1, 12],
		[12, 6],
		[6, 12],
		[12, 1],
		[1, 11],
		[11, 3],
		[5, 1],
	]);

	expect(changes.vertices.map).toMatchObject([0, 1, 2, 3, 1, 4, 5, 6, 7, 8, 1, 1]);

	expect(changes.edges.map).toMatchObject([
		[0, 1],
		[2, 3],
		[4, 5],
		[6, 7],
		[8],
		[9],
		[10, 11],
		[12, 13],
		[14],
		[15],
		[16],
		[17],
		[18],
		[19, 20],
		[21, 22],
		[23, 24],
		[25, 26],
		[27, 28],
		[29, 30],
		[31],
	]);

	fs.writeFileSync("./tests/tmp/planarizeOverlaps-windmill.fold", JSON.stringify(result));
	fs.writeFileSync(
		"./tests/tmp/planarizeOverlaps-windmill.json",
		JSON.stringify(changes),
	);
});
