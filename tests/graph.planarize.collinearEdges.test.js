import fs from "fs";
import { expect, test } from "vitest";
import ear from "../src/index.js";

test("planarize, overlapping assignments", () => {
	const FOLD = fs.readFileSync(
		"./tests/files/fold/overlapping-assignments.fold",
		"utf-8",
	);
	const cp = JSON.parse(FOLD);
	const {
		result,
		changes: {
			vertices,
			edges,
			// edges_line,
			// lines,
		},
	} = ear.graph.planarizeCollinearEdges(cp);

	// # of vertices does not change
	expect(cp.vertices_coords).toHaveLength(20);
	expect(result.vertices_coords).toHaveLength(20);

	// # of edges increases
	expect(cp.edges_vertices).toHaveLength(18);
	expect(result.edges_vertices).toHaveLength(23);

	expect(vertices.map).toMatchObject([
		6, 13, 12, 5, 8, 15, 14, 4, 9, 17, 16, 3, 10, 19, 18, 1, 0, 2, 11, 7,
	]);
	expect(edges.map).toMatchObject([
		[12],
		[13],
		[11],
		[5],
		[15],
		[18],
		[14],
		[4, 5, 6, 7],
		[17],
		[21],
		[16],
		[3, 4, 5, 6, 7, 8],
		[20],
		[22],
		[19],
		[1, 2, 3, 4, 5, 6, 7, 8, 9],
		[0, 1],
		[7, 8, 9, 10],
	]);

	fs.writeFileSync(
		"./tests/tmp/planarizeCollinearEdges-overlapping-assignments.fold",
		JSON.stringify(result),
	);
});

test("planarize, crane", () => {
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
	} = ear.graph.planarizeCollinearEdges(cp);

	// this graph is already planar. neither # of vertices nor edges change
	expect(cp.vertices_coords).toHaveLength(56);
	expect(result.vertices_coords).toHaveLength(56);
	expect(cp.edges_vertices).toHaveLength(114);
	expect(result.edges_vertices).toHaveLength(114);

	expect(vertices.map).toMatchObject([
		0, 4, 54, 13, 50, 51, 3, 9, 49, 43, 22, 23, 14, 15, 7, 44, 24, 25, 16, 17, 1, 39, 5,
		40, 34, 27, 20, 21, 45, 46, 31, 11, 47, 48, 18, 19, 26, 37, 38, 35, 36, 2, 30, 10, 8,
		33, 6, 55, 52, 53, 28, 29, 41, 42, 32, 12,
	]);
	expect(edges.map).toMatchObject([
		[72],
		[61],
		[36],
		[17],
		[96],
		[13],
		[65],
		[66],
		[74],
		[67],
		[37],
		[0],
		[64],
		[14],
		[3],
		[6],
		[109],
		[34],
		[63],
		[57],
		[28],
		[62],
		[97],
		[16],
		[46],
		[38],
		[56],
		[48],
		[76],
		[85],
		[92],
		[101],
		[69],
		[39],
		[47],
		[15],
		[19],
		[44],
		[33],
		[112],
		[103],
		[102],
		[104],
		[105],
		[94],
		[93],
		[52],
		[51],
		[79],
		[80],
		[86],
		[87],
		[58],
		[30],
		[29],
		[59],
		[32],
		[31],
		[60],
		[55],
		[42],
		[40],
		[1],
		[2],
		[23],
		[22],
		[53],
		[9],
		[10],
		[5],
		[4],
		[43],
		[7],
		[8],
		[54],
		[41],
		[26],
		[27],
		[113],
		[45],
		[106],
		[75],
		[73],
		[20],
		[68],
		[98],
		[18],
		[111],
		[110],
		[70],
		[107],
		[89],
		[21],
		[95],
		[35],
		[88],
		[82],
		[11],
		[12],
		[25],
		[24],
		[99],
		[100],
		[50],
		[49],
		[78],
		[77],
		[83],
		[84],
		[90],
		[91],
		[81],
		[71],
		[108],
	]);

	fs.writeFileSync(
		"./tests/tmp/planarizeCollinearEdges-crane.fold",
		JSON.stringify(result),
	);
});

test("planarize, non-planar square fish", () => {
	const FOLD = fs.readFileSync("./tests/files/fold/non-planar-square-fish.fold", "utf-8");
	const cp = JSON.parse(FOLD);
	const {
		result,
		changes: { vertices, edges },
	} = ear.graph.planarizeCollinearEdges(cp);

	// # of vertices decreases
	expect(cp.vertices_coords).toHaveLength(50);
	expect(result.vertices_coords).toHaveLength(38);

	// # of edges decreases
	expect(cp.edges_vertices).toHaveLength(26);
	expect(result.edges_vertices).toHaveLength(25);

	expect(vertices.map).toMatchObject([
		0,
		1,
		35,
		2,
		3,
		7,
		8,
		9,
		10,
		11,
		36,
		37,
		25,
		26,
		27,
		28,
		20,
		24,
		16,
		17,
		18,
		19,
		29,
		31,
		32,
		34,
		14,
		15,
		12,
		13,
		29,
		30,
		32,
		33,
		7,
		6,
		24,
		23,
		20,
		21,
		undefined,
		undefined,
		21,
		22,
		23,
		22,
		3,
		5,
		5,
		4,
	]);
	expect(edges.map).toMatchObject([
		[0],
		[22],
		[23],
		[1],
		[2, 3, 4, 5],
		[6],
		[7],
		[24],
		[16],
		[17],
		[12, 13, 14, 15],
		[10],
		[11],
		[18, 19],
		[20, 21],
		[9],
		[8],
		[18],
		[20],
		[5],
		[15],
		[12],
		[13],
		[14],
		[2, 3],
		[3],
	]);

	fs.writeFileSync(
		"./tests/tmp/planarizeCollinearEdges-non-planar-square-fish.fold",
		JSON.stringify(result),
	);
});

test("planarize, non-planar bird base", () => {
	const FOLD = fs.readFileSync("./tests/files/fold/non-planar-bird-base.fold", "utf-8");
	const cp = JSON.parse(FOLD);
	const {
		result,
		changes: { vertices, edges },
	} = ear.graph.planarizeCollinearEdges(cp);

	// # of vertices decreases
	expect(cp.vertices_coords).toHaveLength(56);
	expect(result.vertices_coords).toHaveLength(48);

	// # of edges increases
	expect(cp.edges_vertices).toHaveLength(30);
	expect(result.edges_vertices).toHaveLength(32);

	expect(vertices.map).toMatchObject([
		0, 1, 47, 2, 3, 4, 35, 36, 21, 22, 23, 24, 5, 7, 8, 10, 32, 34, 29, 31, 18, 20, 15,
		17, 44, 46, 41, 43, 5, 6, 8, 9, 15, 16, 41, 42, 32, 33, 29, 30, 44, 45, 18, 19, 25,
		28, 37, 40, 13, 14, 11, 12, 26, 27, 38, 39,
	]);
	expect(edges.map).toMatchObject([
		[0],
		[30],
		[31],
		[1],
		[2],
		[22],
		[13],
		[14],
		[3, 4],
		[5, 6],
		[20, 21],
		[18, 19],
		[11, 12],
		[9, 10],
		[28, 29],
		[26, 27],
		[3],
		[5],
		[9],
		[26],
		[20],
		[18],
		[28],
		[11],
		[15, 16, 17],
		[23, 24, 25],
		[8],
		[7],
		[16],
		[24],
	]);

	fs.writeFileSync(
		"./tests/tmp/planarizeCollinearEdges-non-planar-bird-base.fold",
		JSON.stringify(result),
	);
});

test("planarize, separated", () => {
	const FOLD = fs.readFileSync(
		"./tests/files/fold/separated-parallel-edges.fold",
		"utf-8",
	);
	const cp = JSON.parse(FOLD);
	const {
		result,
		changes: { vertices, edges },
	} = ear.graph.planarizeCollinearEdges(cp);

	// neither the number of vertices nor edges changes
	expect(cp.vertices_coords).toHaveLength(10);
	expect(result.vertices_coords).toHaveLength(10);
	expect(cp.edges_vertices).toHaveLength(11);
	expect(result.edges_vertices).toHaveLength(11);

	expect(vertices.map).toMatchObject([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
	expect(edges.map).toMatchObject([
		[0],
		[1],
		[2],
		[3],
		[4],
		[5],
		[6],
		[7],
		[8],
		[9],
		[10],
	]);

	fs.writeFileSync(
		"./tests/tmp/planarizeCollinearEdges-separated.fold",
		JSON.stringify(result),
	);
});

test("planarize, non-planar-polygons", () => {
	const FOLD = fs.readFileSync("./tests/files/fold/non-planar-polygons.fold", "utf-8");
	const cp = JSON.parse(FOLD);
	const {
		result,
		changes: {
			vertices,
			edges,
			// edges_line,
			// lines,
		},
	} = ear.graph.planarizeCollinearEdges(cp);

	// neither the number of vertices nor edges changes
	expect(cp.vertices_coords).toHaveLength(15);
	expect(result.vertices_coords).toHaveLength(15);
	expect(cp.edges_vertices).toHaveLength(10);
	expect(result.edges_vertices).toHaveLength(10);

	expect(vertices.map).toMatchObject([11, 12, 13, 14, 10, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
	expect(edges.map).toMatchObject([[6], [7], [8], [9], [5], [0], [1], [2], [3], [4]]);

	fs.writeFileSync(
		"./tests/tmp/planarizeCollinearEdges-non-planar-polygons.fold",
		JSON.stringify(result),
	);
});

test("planarize, foldedForm, kabuto", () => {
	const FOLD = fs.readFileSync("./tests/files/fold/kabuto.fold", "utf-8");
	const fold = JSON.parse(FOLD);
	const folded = ear.graph.getFramesByClassName(fold, "foldedForm")[0];
	const { result, changes } = ear.graph.planarizeCollinearEdges(folded);
	fs.writeFileSync(
		"./tests/tmp/planarizeCollinearEdges-kabuto.fold",
		JSON.stringify(result),
	);
	fs.writeFileSync(
		"./tests/tmp/planarizeCollinearEdges-kabuto.json",
		JSON.stringify(changes),
	);
});

test("planarize, foldedForm, kraft bird", () => {
	const FOLD = fs.readFileSync("./tests/files/fold/kraft-bird-base.fold", "utf-8");
	const fold = JSON.parse(FOLD);
	const folded = {
		...fold,
		vertices_coords: ear.graph.makeVerticesCoordsFlatFolded(fold),
	};
	const { result, changes } = ear.graph.planarizeCollinearEdges(folded);

	fs.writeFileSync(
		"./tests/tmp/planarizeCollinearEdges-kraft-bird.fold",
		JSON.stringify(result),
	);
	fs.writeFileSync(
		"./tests/tmp/planarizeCollinearEdges-kraft-bird.json",
		JSON.stringify(changes),
	);
});

test("planarize, foldedForm, windmill", () => {
	const FOLD = fs.readFileSync("./tests/files/fold/windmill.fold", "utf-8");
	const fold = JSON.parse(FOLD);
	const folded = ear.graph.getFramesByClassName(fold, "foldedForm")[0];
	const { result, changes } = ear.graph.planarizeCollinearEdges(folded);

	expect(folded.vertices_coords).toHaveLength(12);
	expect(result.vertices_coords).toHaveLength(9);
	expect(folded.edges_vertices).toHaveLength(20);
	expect(result.edges_vertices).toHaveLength(16);

	expect(result.vertices_coords).toMatchObject([
		[1, 1], // square corner 1
		[3, 3], // square corner 2
		[1, 3], // square corner 3
		[3, 1], // square corner 4
		[0, 2], // tip 1
		[2, 0], // tip 2
		[2, 4], // tip 3
		[2, 2], // center (appears twice)
		[4, 2], // tip 4
	]);

	// console.log(JSON.stringify(changes.edges.map));

	expect(result.edges_vertices).toMatchObject([
		[0, 7],
		[7, 1],
		[2, 0],
		[0, 3],
		[4, 0],
		[3, 5],
		[6, 2],
		[4, 7],
		[7, 8],
		[6, 7],
		[7, 5],
		[2, 7],
		[7, 3],
		[3, 1],
		[1, 2],
		[1, 8],
	]);

	expect(changes.vertices.map).toMatchObject([4, 7, 5, 6, 7, 0, 1, 8, 2, 3, 7, 7]);

	expect(changes.edges.map).toMatchObject([
		[7],
		[10],
		[9],
		[7],
		[4],
		[15],
		[2],
		[3],
		[11],
		[12],
		[0],
		[6],
		[5],
		[13],
		[14],
		[10],
		[8],
		[8],
		[9],
		[1],
	]);

	fs.writeFileSync(
		"./tests/tmp/planarizeCollinearEdges-windmill.fold",
		JSON.stringify(result),
	);
	fs.writeFileSync(
		"./tests/tmp/planarizeCollinearEdges-windmill.json",
		JSON.stringify(changes),
	);
});
