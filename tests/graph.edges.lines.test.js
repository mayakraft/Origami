import fs from "fs";
import xmldom from "@xmldom/xmldom";
import { expect, test } from "vitest";
import ear from "../src/index.js";

ear.window = xmldom;

test("edgesToLines and edgesToLines3", () => {
	const FOLD = fs.readFileSync("./tests/files/fold/moosers-train.fold", "utf-8");
	const folded = JSON.parse(FOLD);

	const edgesLine = ear.graph.edgesToLines(folded);
	const edgesLine3 = ear.graph.edgesToLines3(folded);

	edgesLine.forEach((_, i) =>
		[0, 1, 2].forEach((n) => {
			expect(edgesLine[i].vector[n]).toBeCloseTo(edgesLine3[i].vector[n]);
			expect(edgesLine[i].origin[n]).toBeCloseTo(edgesLine3[i].origin[n]);
		}),
	);
});

test("edgesLine with empty arrays", () => {
	expect(
		ear.graph.getEdgesLine({
			vertices_coords: [, , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , ,],
			edges_vertices: [
				,
				,
				,
				,
				,
				,
				,
				,
				,
				,
				,
				,
				,
				,
				,
				,
				,
				,
				,
				,
				,
				,
				,
				,
				,
				,
				,
				,
				,
				,
				,
				,
				,
				,
				,
				,
				,
				,
				,
				,
				,
				,
				,
				,
				,
				,
				,
				,
				,
				,
				,
				,
				,
				,
				,
				,
			],
		}),
	).toMatchObject({ lines: [], edges_line: [] });
});

test("fish base", () => {
	const graph = ear.graph.fish();
	const { lines, edges_line } = ear.graph.getEdgesLine(graph);
	const n029 = 1 - Math.SQRT1_2;
	const n070 = Math.SQRT1_2;
	const expected = [
		{ vector: [1, 0], origin: [0, 0] }, // bottom
		{ vector: [0, -1], origin: [0, 1] }, // left
		{ vector: [-n070, -n029], origin: [n070, n029] },
		{ vector: [-n029, -n070], origin: [n029, n070] },
		{ vector: [-1, -1], origin: [1, 1] }, // diagonal
		{ vector: [n029, 0], origin: [n070, n029] },
		{ vector: [0, n029], origin: [n029, n070] },
		{ vector: [n029, n070], origin: [n070, n029] },
		{ vector: [n070, n029], origin: [n029, n070] },
		{ vector: [1, -1], origin: [0, 1] }, // diagonal
		{ vector: [0, -n029], origin: [n070, n029] },
		{ vector: [-n029, 0], origin: [n029, n070] },
		{ vector: [0, 1], origin: [1, 0] }, // right
		{ vector: [-1, 0], origin: [1, 1] }, // top
	];
	lines.forEach((line, i) =>
		expect(ear.math.epsilonEqualVectors(line.vector, expected[i].vector)).toBe(true),
	);
	lines.forEach((line, i) =>
		expect(ear.math.epsilonEqualVectors(line.origin, expected[i].origin)).toBe(true),
	);
});

test("maze folding", () => {
	const svg = fs.readFileSync("./tests/files/svg/maze-8x8.svg", "utf-8");
	const graph = ear.convert.svgEdgeGraph(svg);
	fs.writeFileSync("./tests/tmp/planarizeEdgeGraph.fold", JSON.stringify(graph), "utf8");
	const { lines, edges_line } = ear.graph.getEdgesLine(graph);
	const edgesValid = graph.edges_vertices
		.map((ev) => ev.map((v) => graph.vertices_coords[v]))
		.map((coords, i) =>
			coords.map((coord) => ear.math.overlapLinePoint(lines[edges_line[i]], coord)),
		)
		.map((pair) => pair[0] && pair[1])
		.map((valid, i) => (!valid ? i : undefined))
		.filter((a) => a !== undefined);
	expect(edgesValid.length).toBe(0);
});

test("parallel same distance 3d", () => {
	const graph = {
		vertices_coords: [
			[1, 2, 3],
			[7, 2, 6], // random values
			[-1, 5, 5],
			[1, 5, 5],
			[8, 3, 5],
			[1, 3, 2], // random values
			[-1, -5, 5],
			[1, -5, 5],
			[9, 2, 7],
			[2, 8, 4], // random values
			[-1, -5, -5],
			[1, -5, -5],
			[8, 5, 9],
			[4, 5, 1], // random values
			[-1, 5, -5],
			[1, 5, -5],
		],
		edges_vertices: [
			[0, 1],
			[2, 3],
			[4, 5],
			[6, 7],
			[8, 9],
			[10, 11],
			[12, 13],
			[14, 15],
		],
	};
	const result = ear.graph.getEdgesLine(graph);
	const lines_edges = ear.graph.invertFlatToArrayMap(result.edges_line);
	lines_edges.forEach((el) => expect(el.length).toBe(1));
	expect(result.lines.length).toBe(8);
});

test("parallel same distance 3d", () => {
	const graph = {
		vertices_coords: [
			[-1, 5, 5],
			[1, 5, 5],
			[-1, -5, 5],
			[1, -5, 5],
			[-1, -5, -5],
			[1, -5, -5],
			[-1, 5, -5],
			[1, 5, -5],
		],
		edges_vertices: [
			[0, 1],
			[2, 3],
			[4, 5],
			[6, 7],
		],
	};
	const result = ear.graph.getEdgesLine(graph);
	const lines_edges = ear.graph.invertFlatToArrayMap(result.edges_line);
	lines_edges.forEach((el) => expect(el.length).toBe(1));
	expect(result.lines.length).toBe(4);
});

test("getEdgesLine, parallel lines at same distance in 3D, circle XY", () => {
	const graph = {
		vertices_coords: Array.from(Array(16))
			.map((_, i) => (i / 16) * (Math.PI * 2))
			.flatMap((a) => [
				[Math.cos(a), Math.sin(a), -1],
				[Math.cos(a), Math.sin(a), 1],
			]),
		edges_vertices: Array.from(Array(16)).map((_, i) => [i * 2, i * 2 + 1]),
	};
	const result = ear.graph.getEdgesLine(graph);
	const lines_edges = ear.graph.invertFlatToArrayMap(result.edges_line);
	lines_edges.forEach((el) => expect(el.length).toBe(1));
	expect(result.lines.length).toBe(16);
});

test("getEdgesLine, parallel lines at same distance in 3D, circle XZ", () => {
	const graph = {
		vertices_coords: Array.from(Array(16))
			.map((_, i) => (i / 16) * (Math.PI * 2))
			.flatMap((a) => [
				[Math.cos(a), -1, Math.sin(a)],
				[Math.cos(a), 1, Math.sin(a)],
			]),
		edges_vertices: Array.from(Array(16)).map((_, i) => [i * 2, i * 2 + 1]),
	};
	const result = ear.graph.getEdgesLine(graph);
	const lines_edges = ear.graph.invertFlatToArrayMap(result.edges_line);
	lines_edges.forEach((el) => expect(el.length).toBe(1));
	expect(result.lines.length).toBe(16);
});

test("getEdgesLine, parallel lines at same distance in 3D, circle YZ", () => {
	const graph = {
		vertices_coords: Array.from(Array(16))
			.map((_, i) => (i / 16) * (Math.PI * 2))
			.flatMap((a) => [
				[-1, Math.cos(a), Math.sin(a)],
				[1, Math.cos(a), Math.sin(a)],
			]),
		edges_vertices: Array.from(Array(16)).map((_, i) => [i * 2, i * 2 + 1]),
	};
	const result = ear.graph.getEdgesLine(graph);
	const lines_edges = ear.graph.invertFlatToArrayMap(result.edges_line);
	lines_edges.forEach((el) => expect(el.length).toBe(1));
	expect(result.lines.length).toBe(16);
});

test("getEdgesLine, Mooser's train, one fourth of carriage only", () => {
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

	const { lines, edges_line } = ear.graph.getEdgesLine(folded);

	const bruteForce = ear.graph.getEdgesLineBruteForce(folded);

	const lines_edges = ear.graph.invertFlatToArrayMap(edges_line);

	// console.log(JSON.stringify(lines.map(({ vector, origin }) => ({
	// 	vector: vector.map(n => ear.general.cleanNumber(n, 12)),
	// 	origin: origin.map(n => ear.general.cleanNumber(n, 12)),
	// }))));

	// console.log(JSON.stringify(lines.map(({ vector, origin }) => ({
	// 	vector: vector.map(n => ear.general.cleanNumber(n, 12)),
	// 	origin: origin.map(n => ear.general.cleanNumber(n, 12)),
	// }))));
	// console.log(JSON.stringify(edges_line));
	// console.log(JSON.stringify(lines_edges));

	const expectedLines = [
		{ vector: [-8, 0, 0], origin: [20, 0, 0] },
		{ vector: [-2, 0, 0], origin: [17, 1, 0] },
		{ vector: [2, 0, 0], origin: [10, 0, 2] },
		{ vector: [-2, 0, 0], origin: [17, 0, -2] },
		{ vector: [-2, 0, 0], origin: [17, 1, -2] },
		{ vector: [2, 0, 0], origin: [10, 2, 2] },
		{ vector: [8, 0, 0], origin: [12, 4, 0] },
		{ vector: [-4, 0, 0], origin: [16, 0, 4] },
		{ vector: [2, 0, 0], origin: [10, 4, 2] },
		{ vector: [8, 0, 0], origin: [12, 0, 8] },
		{ vector: [-4, -4, 0], origin: [16, 4, 0] },
		{ vector: [4, 0, 4], origin: [12, 0, 0] },
		{ vector: [8, 0, 0], origin: [12, 4, 8] },
		{ vector: [0, 4, 0], origin: [10, 0, 2] },
		{ vector: [1, -1, 0], origin: [15, 1, 0] },
		{ vector: [-1, -1, 0], origin: [17, 1, 0] },
		{ vector: [0, -4, 0], origin: [12, 4, 0] },
		{ vector: [0, 0, -8], origin: [12, 0, 8] },
		{ vector: [0, -2, -2], origin: [12, 2, 2] },
		{ vector: [0, 4, 0], origin: [12, 0, 2] },
		{ vector: [0, -2, 2], origin: [12, 2, 2] },
		{ vector: [0, 0, -8], origin: [12, 4, 8] },
		{ vector: [-4, 0, 4], origin: [16, 0, 4] },
		{ vector: [1, -1, 0], origin: [16, 4, 0] },
		{ vector: [0, -4, 0], origin: [12, 4, 8] },
		{ vector: [0, 0, 2], origin: [15, 0, -2] },
		{ vector: [0, 3, 0], origin: [15, 0, 0] },
		{ vector: [0, 0, 2], origin: [15, 1, -2] },
		{ vector: [0, 1, 0], origin: [15, 0, -2] },
		{ vector: [0, -2, -2], origin: [15, 3, 0] },
		{ vector: [0, 4, 0], origin: [16, 0, 0] },
		{ vector: [0, 0, 4], origin: [16, 0, 0] },
		{ vector: [0, 0, -2], origin: [17, 0, 0] },
		{ vector: [0, 3, 0], origin: [17, 0, 0] },
		{ vector: [0, 0, 2], origin: [17, 1, -2] },
		{ vector: [0, 1, 0], origin: [17, 0, -2] },
		{ vector: [0, -2, -2], origin: [17, 3, 0] },
		{ vector: [0, 0, -8], origin: [20, 0, 8] },
		{ vector: [0, 4, 0], origin: [20, 0, 0] },
		{ vector: [0, -4, 0], origin: [20, 4, 8] },
	];

	expect(expectedLines.length).toBe(bruteForce.lines.length);

	lines.forEach((_, i) =>
		[0, 1, 2].forEach((d) => {
			expect(lines[i].vector[d]).toBeCloseTo(expectedLines[i].vector[d]);
			expect(lines[i].origin[d]).toBeCloseTo(expectedLines[i].origin[d]);
		}),
	);

	expect(lines_edges).toMatchObject([
		// outside edge
		[0, 1, 5, 6, 41, 42, 43, 66],
		[27],
		// front-outside edge of hitch joint
		[8, 45, 63, 73],
		// one of three faces for the wheel
		[3],
		// bottom of wheel
		[16],
		[56, 69],
		[36, 38],
		[61],
		// back of hitch
		[34, 82],
		[76],
		// 45 degree connection to the wheel part
		[25, 53, 71],
		[70],
		[85],
		// back of hitch joint
		[9, 10, 11, 12, 13, 14, 15],
		[40],
		[59],
		[29, 32, 33],
		// back-bottom of carriage, below the hitch joint
		[7, 30, 31, 44, 62, 65, 74, 75],
		// small 45 deg to hitch joint
		[51, 52],
		// front of hitch joint, alongside carriage
		[17, 18, 19, 20, 21, 22, 23],
		// small 45 deg to hitch joint
		[39, 60],
		// back edge of the back face of the carriage
		[35, 83, 84],
		// big side carriage panel, 45 degree
		[24],
		[49],
		[64],
		// one of three faces for the wheel
		[4],
		[28, 55],
		[58],
		[57],
		[54],
		[37, 46, 47, 77],
		[48],
		// one of three faces for the wheel
		[2],
		[26, 72],
		[68],
		[67],
		[50],
		[79],
		[80, 81],
		[78],
	]);
});

test("getEdgesLine, Mooser's train, carriage only", () => {
	const FOLD = fs.readFileSync("./tests/files/fold/moosers-train-carriage.fold", "utf-8");
	const graph = JSON.parse(FOLD);
	const folded = {
		...graph,
		vertices_coords: ear.graph.makeVerticesCoordsFolded(graph),
	};

	const { lines, edges_line } = ear.graph.getEdgesLine(folded);

	const lines_edges = ear.graph.invertFlatToArrayMap(edges_line);

	const expectedLines = [
		{ vector: [-20, 0, 0], origin: [40, 0, 0] },
		{ vector: [16, 0, 0], origin: [22, 0, -2] },
		{ vector: [20, 0, 0], origin: [20, 2, 0] },
		{ vector: [-16, 0, 0], origin: [38, 0, 2] },
		{ vector: [-10, 0, 0], origin: [35, 1, -2] },
		{ vector: [20, 0, 0], origin: [20, 4, 0] },
		{ vector: [-10, 0, 0], origin: [35, 0, -4] },
		{ vector: [-10, 0, 0], origin: [35, 1, -4] },
		{ vector: [16, 0, 0], origin: [22, 4, -2] },
		{ vector: [20, 0, 0], origin: [20, 6, 0] },
		{ vector: [16, 0, 0], origin: [22, 0, 6] },
		{ vector: [-10, 0, 0], origin: [35, 7, -2] },
		{ vector: [-20, 0, 0], origin: [40, 8, 0] },
		{ vector: [-10, 0, 0], origin: [35, 7, -4] },
		{ vector: [-16, 0, 0], origin: [38, 8, -2] },
		{ vector: [-16, 0, 0], origin: [38, 8, 2] },
		{ vector: [-10, 0, 0], origin: [35, 8, -4] },
		{ vector: [16, 0, 0], origin: [22, 8, 6] },
		{ vector: [1, 1, 0], origin: [25, 7, -2] },
		{ vector: [5, 5, 0], origin: [22, 0, -2] },
		{ vector: [4, 0, 4], origin: [22, 0, -2] },
		{ vector: [-8, -8, 0], origin: [34, 8, -2] },
		{ vector: [1, -1, 0], origin: [25, 1, -2] },
		{ vector: [4, 0, 4], origin: [22, 8, -2] },
		{ vector: [-4, 0, 4], origin: [26, 0, 2] },
		{ vector: [0, 8, 0], origin: [20, 0, 0] },
		{ vector: [5, -5, 0], origin: [22, 8, -2] },
		{ vector: [-5, -5, 0], origin: [38, 8, -2] },
		{ vector: [4, 0, -4], origin: [22, 8, 6] },
		{ vector: [0, 0, 8], origin: [22, 0, -2] },
		{ vector: [0, 8, 0], origin: [22, 0, 0] },
		{ vector: [0, -2, 2], origin: [22, 2, 0] },
		{ vector: [0, -2, -2], origin: [22, 2, 0] },
		{ vector: [0, -8, 0], origin: [22, 8, -2] },
		{ vector: [0, 0, -2], origin: [22, 4, 0] },
		{ vector: [0, 2, 2], origin: [22, 6, 0] },
		{ vector: [0, 2, -2], origin: [22, 6, 0] },
		{ vector: [-4, 0, -4], origin: [38, 0, 6] },
		{ vector: [0, -8, 0], origin: [22, 8, 6] },
		{ vector: [0, 0, -8], origin: [22, 8, 6] },
		{ vector: [-4, 0, -4], origin: [38, 8, 6] },
		{ vector: [1, 1, 0], origin: [34, 0, -2] },
		{ vector: [-8, 8, 0], origin: [34, 0, -2] },
		{ vector: [0, 0, 2], origin: [25, 0, -4] },
		{ vector: [0, 0, 2], origin: [25, 1, -4] },
		{ vector: [0, 8, 0], origin: [25, 0, -2] },
		{ vector: [0, 2, -2], origin: [25, 5, -2] },
		{ vector: [0, -2, -2], origin: [25, 3, -2] },
		{ vector: [0, 8, 0], origin: [25, 0, -4] },
		{ vector: [-4, 0, 4], origin: [38, 0, -2] },
		{ vector: [0, 0, -2], origin: [25, 7, -2] },
		{ vector: [0, 0, 4], origin: [26, 0, -2] },
		{ vector: [0, -8, 0], origin: [26, 8, -2] },
		{ vector: [0, 0, 2], origin: [25, 8, -4] },
		{ vector: [-4, 0, 4], origin: [38, 8, -2] },
		{ vector: [-5, 5, 0], origin: [38, 0, -2] },
		{ vector: [0, 0, -2], origin: [27, 0, -2] },
		{ vector: [0, 0, 2], origin: [27, 1, -4] },
		{ vector: [0, 8, 0], origin: [27, 0, -2] },
		{ vector: [0, 2, -2], origin: [27, 5, -2] },
		{ vector: [0, 0, -4], origin: [26, 8, 2] },
		{ vector: [0, -2, -2], origin: [27, 3, -2] },
		{ vector: [0, 8, 0], origin: [27, 0, -4] },
		{ vector: [0, 0, -2], origin: [27, 7, -2] },
		{ vector: [0, 0, -2], origin: [27, 8, -2] },
		{ vector: [1, -1, 0], origin: [34, 8, -2] },
		{ vector: [0, 0, 2], origin: [33, 0, -4] },
		{ vector: [0, 0, 2], origin: [33, 1, -4] },
		{ vector: [0, 8, 0], origin: [33, 0, -2] },
		{ vector: [0, 2, -2], origin: [33, 5, -2] },
		{ vector: [0, -2, -2], origin: [33, 3, -2] },
		{ vector: [0, 8, 0], origin: [33, 0, -4] },
		{ vector: [0, 0, -2], origin: [33, 7, -2] },
		{ vector: [0, 0, 2], origin: [33, 8, -4] },
		{ vector: [0, 0, 4], origin: [34, 0, -2] },
		{ vector: [0, 8, 0], origin: [34, 0, -2] },
		{ vector: [0, 0, -4], origin: [34, 8, 2] },
		{ vector: [0, 0, -2], origin: [35, 0, -2] },
		{ vector: [0, 0, 2], origin: [35, 1, -4] },
		{ vector: [0, -8, 0], origin: [35, 8, -2] },
		{ vector: [0, 2, -2], origin: [35, 5, -2] },
		{ vector: [0, -2, -2], origin: [35, 3, -2] },
		{ vector: [0, 8, 0], origin: [35, 0, -4] },
		{ vector: [0, 0, -2], origin: [35, 7, -2] },
		{ vector: [0, 0, -2], origin: [35, 8, -2] },
		{ vector: [0, 0, -8], origin: [38, 0, 6] },
		{ vector: [0, -8, 0], origin: [38, 8, 0] },
		{ vector: [0, 2, -2], origin: [38, 0, 2] },
		{ vector: [0, -2, -2], origin: [38, 2, 0] },
		{ vector: [0, -8, 0], origin: [38, 8, -2] },
		{ vector: [0, 0, 2], origin: [38, 4, -2] },
		{ vector: [0, -2, -2], origin: [38, 8, 2] },
		{ vector: [0, 2, -2], origin: [38, 6, 0] },
		{ vector: [0, -8, 0], origin: [38, 8, 6] },
		{ vector: [0, 0, 8], origin: [38, 8, -2] },
		{ vector: [0, -8, 0], origin: [40, 8, 0] },
	];

	const expectedLinesEdges = [
		[0, 16, 77, 85, 111, 116, 136, 142],
		[2, 3, 7, 8, 9, 13, 14, 79, 80, 81, 82, 83, 121, 189],
		[103, 104, 126, 127],
		[113, 114],
		[50, 53],
		[64, 72, 226, 234],
		[5, 11],
		[30, 31],
		[66, 68, 70, 228, 230, 232],
		[173, 174, 194, 195],
		[139],
		[239, 242],
		[160, 166, 179, 184, 200, 208, 259, 275],
		[257, 258],
		[117, 185, 202, 203, 204, 205, 206, 261, 262, 266, 267, 268, 272, 273],
		[181, 182],
		[264, 270],
		[163],
		[215],
		[47, 99, 133, 236],
		[132],
		[109, 291],
		[75],
		[129],
		[45],
		[17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29],
		[93, 131, 154, 198],
		[46, 150, 290, 294],
		[172],
		[15, 60, 61, 84, 115, 120, 137, 138],
		[32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44],
		[73, 110],
		[95, 98],
		[55, 56, 59, 62, 63],
		[65, 227],
		[148, 158],
		[149, 157],
		[199],
		[119],
		[57, 58, 118, 161, 162, 183, 207, 274],
		[48],
		[159],
		[145, 146],
		[12],
		[106],
		[54, 101, 102, 243],
		[155],
		[100],
		[105, 108],
		[128],
		[107],
		[88],
		[67, 86, 87, 90, 91, 143, 144, 229],
		[271],
		[289],
		[96, 130, 152, 171],
		[10],
		[123],
		[52, 134, 135, 241],
		[237],
		[89],
		[94],
		[122, 125],
		[124],
		[269],
		[74],
		[6],
		[176],
		[51, 169, 170, 240],
		[97],
		[151],
		[175, 178],
		[177],
		[265],
		[211],
		[69, 167, 168, 209, 210, 213, 214, 231],
		[212],
		[4],
		[191],
		[49, 196, 197, 238],
		[295],
		[153],
		[190, 193],
		[192],
		[263],
		[1, 78, 112, 140, 141, 188, 222, 223],
		[244, 245, 246, 247, 248, 249, 250, 251, 252, 253, 254, 255, 256],
		[147, 216],
		[156, 235],
		[217, 218, 221, 224, 225],
		[71, 233],
		[76, 292],
		[92, 293],
		[187],
		[164, 165, 180, 186, 201, 219, 220, 260],
		[276, 277, 278, 279, 280, 281, 282, 283, 284, 285, 286, 287, 288],
	];

	// console.log(JSON.stringify(lines.map(({ vector, origin }) => ({
	// 	vector: vector.map(n => ear.general.cleanNumber(n, 12)),
	// 	origin: origin.map(n => ear.general.cleanNumber(n, 12)),
	// }))));
	// console.log(JSON.stringify(edges_line));
	// console.log(JSON.stringify(lines_edges));

	lines.forEach((_, i) =>
		[0, 1, 2].forEach((d) => {
			expect(lines[i].vector[d]).toBeCloseTo(expectedLines[i].vector[d]);
			expect(lines[i].origin[d]).toBeCloseTo(expectedLines[i].origin[d]);
		}),
	);

	expect(lines_edges).toMatchObject(expectedLinesEdges);
});

test("Mooser's train 3d edges_line", () => {
	const FOLD = fs.readFileSync("./tests/files/fold/moosers-train.fold", "utf-8");
	const graph = JSON.parse(FOLD);
	const { lines, edges_line } = ear.graph.getEdgesLine(graph);

	expect(lines.length).toBe(301);
	expect(edges_line).toMatchObject([
		19, 19, 19, 76, 59, 13, 91, 19, 19, 13, 42, 19, 19, 36, 115, 99, 19, 19, 19, 163, 144,
		13, 174, 19, 19, 13, 131, 19, 19, 36, 198, 184, 210, 19, 19, 13, 237, 247, 19, 19, 19,
		13, 256, 264, 19, 19, 19, 13, 273, 19, 19, 279, 24, 36, 22, 22, 22, 75, 58, 15, 90,
		22, 22, 15, 41, 22, 22, 37, 114, 98, 22, 22, 22, 162, 143, 15, 173, 22, 22, 15, 130,
		22, 22, 37, 197, 183, 209, 22, 22, 15, 236, 246, 22, 22, 22, 15, 255, 263, 22, 22, 22,
		15, 272, 22, 22, 279, 23, 37, 274, 274, 151, 151, 151, 151, 16, 16, 16, 16, 16, 16,
		16, 16, 16, 16, 16, 16, 16, 152, 6, 153, 7, 279, 279, 279, 279, 279, 279, 281, 280,
		152, 281, 153, 280, 279, 279, 279, 279, 6, 281, 7, 280, 265, 265, 19, 22, 265, 265,
		186, 187, 299, 300, 297, 298, 289, 290, 277, 278, 238, 239, 267, 267, 258, 258, 270,
		271, 261, 262, 191, 192, 175, 176, 216, 216, 19, 22, 19, 22, 198, 197, 47, 198, 46,
		197, 219, 220, 66, 198, 65, 197, 248, 248, 19, 22, 214, 224, 215, 225, 248, 248, 216,
		216, 219, 220, 19, 198, 22, 197, 216, 216, 154, 155, 221, 222, 214, 215, 176, 175,
		250, 250, 241, 241, 253, 254, 244, 245, 187, 186, 155, 154, 230, 230, 204, 204, 234,
		235, 207, 208, 176, 175, 149, 150, 199, 199, 199, 199, 199, 199, 196, 198, 196, 197,
		194, 195, 200, 201, 184, 183, 115, 114, 99, 98, 36, 24, 37, 23, 19, 22, 19, 22, 19,
		22, 19, 22, 184, 47, 183, 46, 115, 47, 114, 46, 99, 47, 98, 46, 24, 36, 47, 23, 37,
		46, 184, 183, 115, 114, 99, 98, 24, 23, 164, 164, 132, 132, 77, 77, 40, 40, 19, 184,
		22, 183, 19, 115, 22, 114, 19, 99, 22, 98, 19, 24, 22, 23, 164, 164, 132, 132, 77, 77,
		40, 40, 121, 122, 101, 102, 62, 63, 26, 27, 168, 168, 125, 125, 85, 85, 31, 31, 157,
		157, 138, 138, 70, 70, 50, 50, 171, 172, 128, 129, 88, 89, 38, 39, 160, 161, 141, 142,
		73, 74, 55, 56, 135, 136, 92, 93, 67, 68, 2, 3, 108, 109, 109, 108, 53, 54, 54, 53,
		185, 185, 116, 116, 100, 100, 25, 25, 185, 185, 185, 185, 116, 116, 116, 116, 100,
		100, 100, 100, 25, 25, 25, 25, 182, 184, 182, 183, 113, 115, 113, 114, 97, 99, 97, 98,
		8, 24, 8, 23, 20, 21, 180, 181, 111, 112, 95, 96, 4, 5, 188, 189, 117, 118, 103, 104,
		28, 29, 151, 0, 151, 0, 279, 279, 279, 279, 265, 265, 274, 274, 279, 279, 274, 274, 0,
		274, 0, 274, 279, 279, 238, 239, 191, 192, 290, 289, 298, 297, 186, 187, 227, 228, 9,
		10, 11, 12, 267, 267, 258, 258, 266, 266, 257, 257, 268, 186, 269, 187, 259, 187, 260,
		186, 248, 248, 0, 0, 216, 216, 193, 0, 193, 0, 216, 216, 19, 22, 211, 211, 198, 197,
		0, 211, 0, 211, 216, 219, 216, 220, 216, 216, 177, 178, 176, 175, 222, 221, 154, 155,
		145, 146, 9, 10, 11, 12, 250, 250, 241, 241, 249, 249, 240, 240, 251, 175, 252, 176,
		242, 176, 243, 175, 9, 10, 11, 12, 230, 230, 204, 204, 229, 229, 203, 203, 231, 155,
		232, 154, 205, 154, 206, 155, 196, 196, 198, 197, 199, 199, 199, 199, 199, 199, 200,
		201, 194, 195, 179, 0, 179, 0, 110, 0, 110, 0, 94, 0, 94, 0, 14, 1, 0, 14, 1, 0, 164,
		164, 132, 132, 77, 77, 40, 40, 19, 22, 19, 22, 19, 22, 19, 22, 184, 183, 115, 114, 99,
		98, 36, 24, 37, 23, 164, 165, 164, 166, 132, 133, 132, 134, 77, 78, 77, 79, 40, 48,
		40, 49, 147, 148, 80, 81, 82, 83, 17, 18, 121, 122, 101, 102, 62, 63, 26, 27, 105,
		106, 119, 120, 43, 44, 60, 61, 9, 10, 9, 10, 9, 10, 9, 10, 11, 12, 11, 12, 11, 12, 11,
		12, 168, 168, 125, 125, 85, 85, 31, 31, 157, 157, 138, 138, 70, 70, 50, 50, 167, 167,
		124, 124, 84, 84, 30, 30, 156, 156, 137, 137, 69, 69, 45, 45, 169, 121, 170, 122, 126,
		101, 127, 102, 86, 62, 87, 63, 32, 26, 33, 27, 158, 122, 159, 121, 139, 102, 140, 101,
		71, 63, 72, 62, 51, 27, 52, 26, 182, 182, 113, 113, 97, 97, 8, 8, 184, 183, 115, 114,
		99, 98, 24, 23, 185, 185, 116, 116, 100, 100, 25, 25, 185, 185, 185, 185, 116, 116,
		116, 116, 100, 100, 100, 100, 25, 25, 25, 25, 20, 21, 188, 189, 117, 118, 103, 104,
		28, 29, 180, 181, 111, 112, 95, 96, 4, 5, 19, 22, 34, 35, 57, 36, 37, 36, 37, 233,
		202, 199, 20, 21, 36, 37, 19, 22, 19, 22, 36, 37, 66, 65, 66, 65, 190, 123, 107, 64,
		185, 116, 100, 25, 20, 21, 0, 0, 0, 0, 14, 14, 36, 37, 196, 20, 21, 14, 14, 0, 0, 0,
		0, 36, 37, 182, 113, 97, 8, 20, 21, 293, 292, 225, 226, 212, 226, 224, 213, 278, 293,
		292, 277, 288, 275, 296, 294, 296, 295, 288, 276, 284, 282, 283, 285, 278, 278, 287,
		274, 287, 277, 277, 286, 274, 286, 281, 281, 280, 280, 291, 291, 291, 293, 293, 286,
		286, 292, 292, 287, 287, 212, 218, 223, 213, 217, 223, 225, 215, 223, 224, 214, 223,
		223,
	]);
});

// test("getCollinearOverlappingEdges", () => {
// 	expect(ear.graph.getCollinearOverlappingEdges({
// 		vertices_coords: [
// 			[-2, -2], [-1, -2],
// 			[0, 0], [1, 1],
// 			[1, 1], [2, 2],
// 		],
// 		edges_vertices: [[0, 1], [2, 3], [4, 5]],
// 	}).clusters_edges).toMatchObject([[1], [2], [0]]);

// 	// diagonal
// 	expect(ear.graph.getCollinearOverlappingEdges({
// 		vertices_coords: [
// 			[0, 0], [1, 1],
// 			[1, 1], [2, 2],
// 		],
// 		edges_vertices: [[0, 1], [2, 3]],
// 	}).clusters_edges).toMatchObject([[0], [1]]);

// 	expect(ear.graph.getCollinearOverlappingEdges({
// 		vertices_coords: [
// 			[0, 0], [1, 1],
// 			[0.99, 0.99], [2, 2],
// 		],
// 		edges_vertices: [[0, 1], [2, 3]],
// 	}).clusters_edges).toMatchObject([[0, 1]]);

// 	expect(ear.graph.getCollinearOverlappingEdges({
// 		vertices_coords: [
// 			[0, 0], [100, 100],
// 			[99, 99], [200, 200],
// 		],
// 		edges_vertices: [[0, 1], [2, 3]],
// 	}).clusters_edges).toMatchObject([[0, 1]]);

// 	expect(ear.graph.getCollinearOverlappingEdges({
// 		vertices_coords: [
// 			[-100, -100], [-50, -50],
// 			[-50.001, -50.001], [0, 0],
// 		],
// 		edges_vertices: [[0, 1], [2, 3]],
// 	}).clusters_edges).toMatchObject([[0, 1]]);
// 	// horizontal, does not pass through origin
// 	expect(ear.graph.getCollinearOverlappingEdges({
// 		vertices_coords: [
// 			[100, 100], [200, 100],
// 			[199, 100], [300, 100],
// 		],
// 		edges_vertices: [[0, 1], [2, 3]],
// 	}).clusters_edges).toMatchObject([[0, 1]]);

// });

// test("getCollinearOverlappingEdges", () => {
// 	expect(ear.graph.getCollinearOverlappingEdges({
// 		vertices_coords: [
// 			[0, 0], [1, 1],
// 			[1, 1], [2, 2],
// 			[2, 2], [3, 3],
// 			[3, 3], [4, 4],
// 		],
// 		edges_vertices: [[0, 1], [2, 3], [4, 5], [6, 7]],
// 	}).clusters_edges).toMatchObject([[0], [1], [2], [3]]);

// 	expect(ear.graph.getCollinearOverlappingEdges({
// 		vertices_coords: [
// 			[0, 0], [1.001, 1.001],
// 			[1, 1], [2, 2],
// 			[2, 2], [3, 3],
// 			[2.99, 2.99], [4, 4],
// 		],
// 		edges_vertices: [[0, 1], [2, 3], [4, 5], [6, 7]],
// 	}).clusters_edges).toMatchObject([[0, 1], [2, 3]]);

// 	expect(ear.graph.getCollinearOverlappingEdges({
// 		vertices_coords: [
// 			[0, 0], [1.001, 1.001],
// 			[1, 1], [2, 2],
// 			[2, 2], [3, 3],
// 			[2.99, 2.99], [4, 4],
// 			[-1, -1], [0.01, 0.01],
// 		],
// 		edges_vertices: [[0, 1], [2, 3], [4, 5], [6, 7], [8, 9]],
// 	}).clusters_edges).toMatchObject([[4, 0, 1], [2, 3]]);

// 	expect(ear.graph.getCollinearOverlappingEdges({
// 		vertices_coords: [
// 			[0, 0], [1, 1],
// 			[1, 1], [2, 2],
// 			[2, 2], [3, 3],
// 			[-1, -1], [10, 10],
// 		],
// 		edges_vertices: [[0, 1], [2, 3], [4, 5], [6, 7]],
// 	}).clusters_edges).toMatchObject([[3, 0, 1, 2]]);
// });

// test("getCollinearOverlappingEdges", () => {
// 	expect(ear.graph.getCollinearOverlappingEdges({
// 		vertices_coords: [
// 			[0, 0], [1, 1],
// 			[1, 1], [2, 2],
// 			[2, 2], [3, 3],
// 			[3, 3], [4, 4],
// 		],
// 		edges_vertices: [[0, 1], [2, 3], [4, 5], [6, 7]],
// 	})).toMatchObject({
// 		edges_cluster: [0, 1, 2, 3]
// 	});

// 	expect(ear.graph.getCollinearOverlappingEdges({
// 		vertices_coords: [
// 			[0, 0], [1.001, 1.001],
// 			[1, 1], [2, 2],
// 			[2, 2], [3, 3],
// 			[2.99, 2.99], [4, 4],
// 		],
// 		edges_vertices: [[0, 1], [2, 3], [4, 5], [6, 7]],
// 	})).toMatchObject({
// 		edges_cluster: [0, 0, 1, 1]
// 	});

// 	expect(ear.graph.getCollinearOverlappingEdges({
// 		vertices_coords: [
// 			[0, 0], [1.001, 1.001],
// 			[1, 1], [2, 2],
// 			[2, 2], [3, 3],
// 			[2.99, 2.99], [4, 4],
// 			[-1, -1], [0.01, 0.01],
// 		],
// 		edges_vertices: [[0, 1], [2, 3], [4, 5], [6, 7], [8, 9]],
// 	})).toMatchObject({
// 		edges_cluster: [0, 0, 1, 1, 0]
// 	});

// 	expect(ear.graph.getCollinearOverlappingEdges({
// 		vertices_coords: [
// 			[0, 0], [1, 1],
// 			[1, 1], [2, 2],
// 			[2, 2], [3, 3],
// 			[-1, -1], [10, 10],
// 		],
// 		edges_vertices: [[0, 1], [2, 3], [4, 5], [6, 7]],
// 	})).toMatchObject({
// 		edges_cluster: [0, 0, 0, 0]
// 	});
// });
