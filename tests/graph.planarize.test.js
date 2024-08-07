import fs from "fs";
import xmldom from "@xmldom/xmldom";
import { expect, test } from "vitest";
import ear from "../src/index.js";

ear.window = xmldom;

test("planarizeEdges, empty graph", () => {
	const graph = {
		vertices_coords: [],
		edges_vertices: [],
		edges_assignment: [],
		edges_foldAngle: [],
	};
	const result = ear.graph.planarizeEdges(graph);
	expect(JSON.stringify(graph)).toBe(JSON.stringify(result));
});

test("planarize, empty graph", () => {
	const graph = {
		vertices_coords: [],
		edges_vertices: [],
		edges_assignment: [],
		edges_foldAngle: [],
	};
	const result = ear.graph.planarize(graph);
	const expected = {
		vertices_coords: [],
		edges_vertices: [],
		edges_assignment: [],
		edges_foldAngle: [],
		faces_vertices: [],
		faces_edges: [],
	};
	expect(JSON.stringify(expected)).toBe(JSON.stringify(result));
});

test("planarize random lines", () => {
	const EDGES = 200;
	const graph = {
		vertices_coords: Array.from(Array(EDGES * 2)).map(() => [
			Math.random(),
			Math.random(),
		]),
		edges_vertices: Array.from(Array(EDGES)).map((_, i) => [i * 2, i * 2 + 1]),
	};
	ear.graph.planarize(JSON.parse(JSON.stringify(graph)));
});

test("planarize, random lines with collinear end points", () => {
	const graph = ear.graph.square();
	for (let i = 0; i < 4; i += 1) {
		graph.vertices_coords.push([Math.random(), 0], [Math.random(), 1]);
		graph.edges_vertices.push([
			graph.vertices_coords.length - 2,
			graph.vertices_coords.length - 1,
		]);
		graph.edges_assignment.push("V");
		graph.edges_foldAngle.push(90);
	}
	for (let i = 0; i < 4; i += 1) {
		graph.vertices_coords.push([0, Math.random()], [1, Math.random()]);
		graph.edges_vertices.push([
			graph.vertices_coords.length - 2,
			graph.vertices_coords.length - 1,
		]);
		graph.edges_assignment.push("M");
		graph.edges_foldAngle.push(-90);
	}
	const planar = ear.graph.planarize(graph);
	fs.writeFileSync(
		"./tests/tmp/planar-square.fold",
		JSON.stringify(planar, null, 2),
		"utf8",
	);
});

test("planarize, bird base with duplicate vertices", () => {
	const FOLD = fs.readFileSync("./tests/files/fold/bird-disjoint-edges.fold", "utf-8");
	const graph = JSON.parse(FOLD);
	const result = ear.graph.planarize(graph);
	fs.writeFileSync(
		"./tests/tmp/bird-base-planarized.fold",
		JSON.stringify(result, null, 2),
		"utf8",
	);
	expect(true).toBe(true);
});

test("planarize, svg import", () => {
	const svg = fs.readFileSync("./tests/files/svg/maze-8x8.svg", "utf-8");
	const graph = ear.convert.svgEdgeGraph(svg);
	const result = ear.graph.planarize(graph);
	fs.writeFileSync(
		"./tests/tmp/svg-to-fold-maze.fold",
		JSON.stringify(result, null, 2),
		"utf8",
	);
	fs.writeFileSync(
		"./tests/tmp/svg-to-fold-to-svg-maze-8x8.svg",
		ear.convert.foldToSvg(result, { string: true }),
		"utf8",
	);
	expect(true).toBe(true);
});

test("planarize, overlapping edge assignments", () => {
	const svg = `<svg>
		<line x1="0" y1="9" x2="0" y2="7.5" stroke="black" />
		<rect x="0" y="0" width="8" height="8" stroke="purple" />
		<rect x="0" y="1" width="6" height="6" stroke="red" />
		<rect x="0" y="2" width="4" height="4" stroke="green" />
		<rect x="0" y="3" width="2" height="2" stroke="blue" />
		<line x1="0" y1="-1" x2="0" y2="2.5" stroke="black" />
	</svg>`;
	const graph = ear.convert.svgEdgeGraph(svg);
	const result = ear.graph.planarize(graph);
	fs.writeFileSync(
		"./tests/tmp/planarize-overlapping-edges.fold",
		JSON.stringify(result, null, 2),
		"utf8",
	);
});

test("planarize 2 lines, x formation", () => {
	const graph = {
		vertices_coords: [
			[1, 1],
			[9, 2],
			[2, 9],
			[11, 10],
		],
		edges_vertices: [
			[0, 3],
			[1, 2],
		],
		edges_assignment: ["M", "V"],
	};
	const planar = ear.graph.planarize(graph);
	expect(planar.vertices_coords.length).toBe(5);
});

test("planarize two loops 'x-' x with a horizontal dash from its center", () => {
	const graph = {
		vertices_coords: [
			[0, 0],
			[1, 0],
			[0, 1],
			[1, 1],
			[0.5, 0.5],
			[2, 0.5],
		],
		edges_vertices: [
			[0, 3],
			[1, 2],
			[4, 5],
		],
		edges_assignment: ["M", "V", "F"],
	};
	const planar = ear.graph.planarize(graph);
	expect(JSON.stringify(planar.edges_assignment)).toBe(
		JSON.stringify(["M", "M", "F", "V", "V"]),
	);
	expect(planar.vertices_coords.length).toBe(6);
});

test("planarize dup verts", () => {
	const graph = {
		vertices_coords: [
			[0, 0],
			[1, 0],
			[0, 0],
			[0, 1],
			[0, 0],
			[-1, 0],
			[0, 0],
			[0, -1],
		],
		edges_vertices: [
			[0, 1],
			[2, 3],
			[4, 5],
			[6, 7],
		],
		edges_assignment: ["M", "V", "F", "B"],
	};
	const planar = ear.graph.planarize(graph);
	expect(planar.vertices_coords.length).toBe(5);
});

test("planarize, one edges crossing boundary, more assignments than fold angles", () => {
	const graph = ear.graph.square();
	graph.vertices_coords.push([-0.1, 0.3], [1.1, 0.9]);
	graph.edges_vertices.push([4, 5]);
	graph.edges_assignment.push("V");

	const planar = ear.graph.planarize(graph);

	expect(planar.vertices_coords.length).toBe(8);
	expect(planar.edges_vertices.length).toBe(9);
	expect(planar.edges_assignment.filter((a) => a === "B" || a === "b").length).toBe(6);
	expect(planar.edges_assignment.filter((a) => a === "V" || a === "v").length).toBe(3);
	expect(planar.edges_foldAngle.filter((a) => a === 0).length).toBe(6);
	expect(planar.edges_foldAngle.filter((a) => a === 180).length).toBe(0);
	expect(planar.edges_foldAngle.filter((a) => a === undefined).length).toBe(3);
});

test("planarize, graphs with bad arrays", () => {
	const {
		vertices_coords,
		edges_vertices,
		edges_assignment,
		edges_foldAngle,
		faces_vertices,
	} = ear.graph.square();
	const graph1 = {
		vertices_coords,
		edges_vertices,
		edges_assignment,
		edges_foldAngle,
		faces_vertices,
	};
	const graph2 = ear.graph.square();
	graph1.vertices_coords.push([-0.1, 0.3], [1.1, 0.9]);
	graph1.edges_vertices.push([4, 5]);
	graph1.edges_assignment.push("V");
	graph2.vertices_coords.push([-0.1, 0.3], [1.1, 0.9]);
	graph2.edges_vertices.push([4, 5]);
	graph2.edges_assignment.push("V");

	expect(ear.graph.planarize(graph1)).toMatchObject(ear.graph.planarize(graph2));
});

test("planarize, two crossing edges, more assignments than fold angles", () => {
	const graph = ear.graph.square();
	graph.vertices_coords.push([-0.1, 0.3], [1.1, 0.9]);
	graph.vertices_coords.push([0.2, -0.1], [0.8, 1.1]);
	graph.edges_vertices.push([4, 5]);
	graph.edges_vertices.push([6, 7]);
	graph.edges_assignment.push("V");
	graph.edges_assignment.push("M");

	const planar = ear.graph.planarize(graph);

	expect(planar.vertices_coords.length).toBe(13);
	expect(planar.edges_vertices.length).toBe(16);
	expect(planar.edges_assignment.filter((a) => a === "B" || a === "b").length).toBe(8);
	expect(planar.edges_assignment.filter((a) => a === "V" || a === "v").length).toBe(4);
	expect(planar.edges_assignment.filter((a) => a === "M" || a === "m").length).toBe(4);
	expect(planar.edges_foldAngle.filter((a) => a === 0).length).toBe(8);
	expect(planar.edges_foldAngle.filter((a) => a === 180).length).toBe(0);
	expect(planar.edges_foldAngle.filter((a) => a === -180).length).toBe(0);
	expect(planar.edges_foldAngle.filter((a) => a === undefined).length).toBe(8);
});

test("planarize 2 lines, collinear", () => {
	const graph = {
		vertices_coords: [
			[1, 1],
			[3, 3],
			[5, 5],
			[7, 7],
		],
		edges_vertices: [
			[0, 3],
			[1, 2],
		],
		edges_assignment: ["M", "V"],
	};
	const planar = ear.graph.planarize(graph);
	expect(planar.vertices_coords.length).toBe(2);
	expect(planar.edges_vertices.length).toBe(1);
	expect(planar.vertices_coords[0][0]).toBeCloseTo(1);
	expect(planar.vertices_coords[0][1]).toBeCloseTo(1);
	expect(planar.vertices_coords[1][0]).toBeCloseTo(7);
	expect(planar.vertices_coords[1][1]).toBeCloseTo(7);
});

test("planarize, planarizeAllFaces, edge rectangle", () => {
	const graph = {
		vertices_coords: [
			[0, 0],
			[1, 0],
			[1, 0],
			[1, 1],
			[1, 1],
			[0, 1],
			[0, 1],
			[0, 0],
		],
		edges_vertices: [
			[0, 1],
			[2, 3],
			[4, 5],
			[6, 7],
		],
		edges_assignment: ["F", "F", "F", "F"],
	};

	const planarNoFaces = ear.graph.planarize(graph);
	const planarWithFaces = ear.graph.planarizeAllFaces(graph);

	expect(planarNoFaces).toMatchObject({
		vertices_coords: [
			[0, 0],
			[1, 0],
			[0, 1],
			[1, 1],
		],
		edges_vertices: [
			[0, 1],
			[2, 0],
			[1, 3],
			[3, 2],
		],
		edges_assignment: ["F", "F", "F", "F"],
		faces_vertices: [],
		faces_edges: [],
	});
	expect(planarWithFaces).toMatchObject({
		vertices_coords: [
			[0, 0],
			[1, 0],
			[0, 1],
			[1, 1],
		],
		edges_vertices: [
			[0, 1],
			[2, 0],
			[1, 3],
			[3, 2],
		],
		edges_assignment: ["F", "F", "F", "F"],
		faces_vertices: [[0, 1, 3, 2]],
		faces_edges: [[0, 2, 3, 1]],
	});
});
