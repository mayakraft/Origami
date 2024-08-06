import { expect, test } from "vitest";
import ear from "../src/index.js";

test("simple polygon", () => {
	const graph = {
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
		],
		vertices_vertices: [
			[1, 3],
			[2, 0],
			[3, 1],
			[2, 0],
		],
		vertices_sectors: [
			[1.5707963267948966, 4.71238898038469],
			[1.5707963267948966, 4.71238898038469],
			[1.5707963267948966, 4.71238898038469],
			[4.71238898038469, 1.5707963267948966],
		],
	};

	const result = ear.graph.walkPlanarFaces(graph);

	// {
	// 	vertices: [0, 1, 2, 3],
	// 	edges: ["0 1", "1 2", "2 3", "3 0"],
	// 	angles: [
	// 		1.5707963267948966,
	// 		1.5707963267948966,
	// 		1.5707963267948966,
	// 		1.5707963267948966
	// 	]
	// }
	expect(result.length).toBe(2);
	expect(JSON.stringify(result[0].vertices)).toBe(JSON.stringify([0, 1, 2, 3]));
	expect(JSON.stringify(result[0].edges)).toBe(
		JSON.stringify(["0 1", "1 2", "2 3", "3 0"]),
	);
});

test("populate building faces (by walking)", () => {
	const vertices_coords = [
		[1, 0],
		[1, 1],
		[0, 1],
		[-1, 1],
		[-1, 0],
		[-1, -1],
		[0, -1],
		[1, -1],
	];

	// graph 1, manually build faces
	const graph1 = {
		vertices_coords,
		edges_vertices: vertices_coords.map((_, i, arr) => [i, (i + 1) % arr.length]),
		edges_assignment: Array(vertices_coords.length).fill("B"),
		faces_vertices: [vertices_coords.map((_, i) => i)],
		faces_edges: [vertices_coords.map((_, i) => i)],
	};

	// graph 2, build faces using populate() which uses walkPlanarFaces
	const graph2 = ear.graph.populate(
		{
			vertices_coords,
			edges_vertices: vertices_coords.map((_, i, arr) => [i, (i + 1) % arr.length]),
			edges_assignment: Array(vertices_coords.length).fill("B"),
		},
		{ faces: true },
	);

	expect(JSON.stringify(graph1.faces_vertices)).toBe(
		JSON.stringify(graph2.faces_vertices),
	);
	expect(JSON.stringify(graph1.faces_edges)).toBe(JSON.stringify(graph2.faces_edges));
});

test("walkSingleFace", () => {
	const vertices_vertices = [
		[1, 4, 3],
		[2, 4, 0],
		[3, 4, 1],
		[0, 4, 2],
		[0, 1, 2, 3],
	];
	ear.graph
		.walkSingleFace({ vertices_vertices }, 0, 1)
		.vertices.forEach((v, i) => expect(v).toBe([0, 1, 4][i]));
	ear.graph
		.walkSingleFace({ vertices_vertices }, 1, 2)
		.vertices.forEach((v, i) => expect(v).toBe([1, 2, 4][i]));
	ear.graph
		.walkSingleFace({ vertices_vertices }, 2, 3)
		.vertices.forEach((v, i) => expect(v).toBe([2, 3, 4][i]));
	ear.graph
		.walkSingleFace({ vertices_vertices }, 3, 0)
		.vertices.forEach((v, i) => expect(v).toBe([3, 0, 4][i]));
	ear.graph
		.walkSingleFace({ vertices_vertices }, 0, 3)
		.vertices.forEach((v, i) => expect(v).toBe([0, 3, 2, 1][i]));
});

test("walkSingleFace incomplete vertices_vertices", () =>
	new Promise((done) => {
		const vertices_vertices = [
			[1, 4, 3],
			[2, 4, 0],
			[3, 4, 1],
			[0, 4, 2],
		];
		try {
			ear.graph.walkSingleFace({ vertices_vertices }, 0, 1);
		} catch (error) {
			expect(error).not.toBe(undefined);
			done();
		}
	}));

test("walkSingleFace with weird circular paths", () => {
	const vertices_vertices = [
		[1, 2, 3],
		[2, 3, 0],
		[3, 0, 1],
		[0, 1, 2],
	];
	const result = ear.graph.walkSingleFace({ vertices_vertices }, 0, 1);
	const expected = [0, 1, 3, 0, 2, 3, 1, 2];
	result.vertices.forEach((v, i) => expect(v).toBe(expected[i]));
});
