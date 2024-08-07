import fs from "fs";
import { expect, test } from "vitest";
import ear from "../src/index.js";

test("keys", () => {
	const graph = ear.graph();
	expect(graph.file_spec).toBe(1.2);
	expect(graph.file_creator).toBe("Rabbit Ear");
});

test("edgeAssignmentToFoldAngle", () => {
	expect(ear.graph.edgeAssignmentToFoldAngle("")).toBe(0);
	// every letter besides "m", "v"
	"abcdefghijklnopqrstuwxyzABCDEFGHIJKLNOPQRSTUWXYZ.!@#$%^&*(){}[]-=_+"
		.split("")
		.forEach((ch) => expect(ear.graph.edgeAssignmentToFoldAngle(ch)).toBe(0));
	expect(ear.graph.edgeAssignmentToFoldAngle("v")).toBe(180);
	expect(ear.graph.edgeAssignmentToFoldAngle("V")).toBe(180);
	expect(ear.graph.edgeAssignmentToFoldAngle("m")).toBe(-180);
	expect(ear.graph.edgeAssignmentToFoldAngle("M")).toBe(-180);
});

const key_test = {
	test: 0,
	testtest: 0,
	test_: 0,
	_test: 0,
	aaatestaaa: 0,
	aaatest: 0,
	testaaa: 0,
	test_test_test: 0,
	test_aaa: 0,
	aaa_test: 0,
	_test_test_test_: 0,
};

// test("filterKeysWithSuffix", () => {
// 	const result = ear.graph.filterKeysWithSuffix(key_test, "test");
// 	expect(result.length).toBe(6);
// });

// test("filterKeysWithPrefix", () => {
// 	const result = ear.graph.filterKeysWithPrefix(key_test, "test");
// 	expect(result.length).toBe(6);
// });

test("filterKeysWithPrefix", () => {
	const result = ear.graph.filterKeysWithPrefix(key_test, "test");
	expect(result.length).toBe(3);
});

test("filterKeysWithSuffix", () => {
	const result = ear.graph.filterKeysWithSuffix(key_test, "test");
	expect(result.length).toBe(3);
});

test("transposeGraphArrays", () => {
	const craneString = fs.readFileSync("./tests/files/fold/crane-cp.fold", "utf-8");
	const crane = JSON.parse(craneString);
	const result = ear.graph.transposeGraphArrays(crane, "edges");
	expect(result.length).toBe(crane.edges_vertices.length);
	expect(result[0].edges_vertices.length).toBe(2);
	expect(result[0].edges_assignment.length).toBe(1); // string, "M" or "V" or something
	// no key
	expect(ear.graph.transposeGraphArrays(crane, "nokey").length).toBe(0);
});

test("transposeGraphArrayAtIndex", () => {
	const craneString = fs.readFileSync("./tests/files/fold/crane-cp.fold", "utf-8");
	const crane = JSON.parse(craneString);
	const result = ear.graph.transposeGraphArrayAtIndex(crane, "edges", 10);
	expect(result.edges_vertices.length).toBe(2);
	expect(result.edges_assignment.length).toBe(1); // string, "M" or "V" or something
	// no key
	expect(ear.graph.transposeGraphArrayAtIndex(crane, "nokey", 0)).toBe(undefined);
});

test("edge angle assinments", () => {
	const assignments = ["B", "b", "M", "m", "V", "v", "F", "f", "U", "u"];
	const angles = [0, 0, -180, -180, 180, 180, 0, 0, 0, 0];
	const calculated = assignments.map((a) => ear.graph.edgeAssignmentToFoldAngle(a));
	expect(ear.math.epsilonEqualVectors(calculated, angles)).toBe(true);
});

test("prefix key search test", () => {
	const graph = {
		vertices: null,
		vertices_: null,
		vertices_coords: null,
		vertices_vertices: null,
		vertices_vertices_vertices: null,
		vertices_vertices_vertices_coords: null,
		_vertices: null,
		_vertices_: null,
		_vertices_coords: null,
		_vertices_vertices: null,
		Vertices: null,
		Vertices_: null,
		_Vertices: null,
		_Vertices_: null,
	};

	const expected = [
		"vertices_",
		"vertices_coords",
		"vertices_vertices",
		"vertices_vertices_vertices",
		"vertices_vertices_vertices_coords",
	];
	const calculated = ear.graph.filterKeysWithPrefix(graph, "vertices");

	expect(expected).toEqual(expect.arrayContaining(calculated));
});

test("suffix key search test", () => {
	const graph = {
		vertices: null,
		vertices_: null,
		vertices_coords: null,
		vertices_vertices: null,
		vertices_vertices_vertices: null,
		vertices_vertices_vertices_coords: null,
		_vertices: null,
		_vertices_: null,
		_vertices_coords: null,
		_vertices_vertices: null,
		Vertices: null,
		Vertices_: null,
		_Vertices: null,
		_Vertices_: null,
	};

	const expected = [
		"vertices_vertices",
		"vertices_vertices_vertices",
		"_vertices",
		"_vertices_vertices",
	];

	const calculated = ear.graph.filterKeysWithSuffix(graph, "vertices");

	expect(expected).toEqual(expect.arrayContaining(calculated));
});

test("prefix key with extensions search test", () => {
	const graph = {
		"vertices_re:": null,
		"vertices_re:coords": null,
		"vertices_re:vertices": null,
		"vertices_re:vertices_vertices": null,
		"vertices_vertices_re:vertices": null,
		"vertices_vertices_vertices_re:coords": null,
		"_vertices_re:": null,
		"_vertices_re:coords": null,
		"_vertices_re:vertices": null,
		"Vertices_re:": null,
		"_Vertices_re:": null,
		"re:vertices": null,
		"re:vertices_": null,
		"re:vertices_coords": null,
		"re:vertices_vertices": null,
		"re:vertices_vertices_vertices": null,
		"re:vertices_vertices_vertices_coords": null,
		"re:_vertices": null,
		"re:_vertices_": null,
		"re:_vertices_coords": null,
		"re:_vertices_vertices": null,
		"_re:vertices": null,
		"_re:vertices_": null,
		"_re:vertices_coords": null,
		"_re:vertices_vertices": null,
		"re:Vertices": null,
		"re:Vertices_": null,
		"re:_Vertices": null,
		"re:_Vertices_": null,
		"_re:Vertices": null,
		"_re:Vertices_": null,
	};

	const expected = [
		"vertices_re:",
		"vertices_re:coords",
		"vertices_re:vertices",
		"vertices_re:vertices_vertices",
		"vertices_vertices_re:vertices",
		"vertices_vertices_vertices_re:coords",
	];

	const calculated = ear.graph.filterKeysWithPrefix(graph, "vertices");

	expect(expected).toEqual(expect.arrayContaining(calculated));
});

test("transpose geometry arrays", () => {
	const graph = {
		file_spec: 1.1,
		file_creator: "",
		file_author: "",
		file_classes: ["singleModel"],
		frame_title: "",
		frame_attributes: ["2D"],
		frame_classes: ["creasePattern"],
		vertices_coords: [
			[0, 0],
			[0.5, 0],
			[1, 0],
			[1, 1],
			[0.5, 1],
			[0, 1],
		],
		vertices_vertices: [
			[1, 5],
			[2, 4, 0],
			[3, 1],
			[4, 2],
			[5, 1, 3],
			[0, 4],
		],
		vertices_faces: [[0], [0, 1], [1], [1], [1, 0], [0]],
		edges_vertices: [
			[0, 1],
			[1, 2],
			[2, 3],
			[3, 4],
			[4, 5],
			[5, 0],
			[1, 4],
		],
		edges_faces: [[0], [1], [1], [1], [0], [0], [0, 1]],
		edges_assignment: ["B", "B", "B", "B", "B", "B", "V"],
		edges_foldAngle: [0, 0, 0, 0, 0, 0, 180],
		edges_length: [0.5, 0.5, 1, 0.5, 0.5, 1, 1],
		faces_vertices: [
			[1, 4, 5, 0],
			[4, 1, 2, 3],
		],
		faces_edges: [
			[6, 4, 5, 0],
			[6, 1, 2, 3],
		],
	};
	const transposedVertices = ear.graph.transposeGraphArrays(graph, "vertices");

	const expectedVertex1 = {
		vertices_coords: [0.5, 0],
		vertices_faces: [0, 1],
		vertices_vertices: [2, 4, 0],
	};

	expect(transposedVertices.length).toEqual(6);
	expect(Object.keys(expectedVertex1)).toEqual(
		expect.arrayContaining(Object.keys(transposedVertices[0])),
	);
	expect(expectedVertex1.vertices_coords).toEqual(
		expect.arrayContaining(transposedVertices[1].vertices_coords),
	);
	expect(expectedVertex1.vertices_faces).toEqual(
		expect.arrayContaining(transposedVertices[1].vertices_faces),
	);
	expect(expectedVertex1.vertices_vertices).toEqual(
		expect.arrayContaining(transposedVertices[1].vertices_vertices),
	);
});

test("get keys with ending", () => {
	// ear.graph.get_keys_with_ending();
	expect(true).toBe(true);
});

test("invertAssignments assignments", () => {
	expect(
		ear.graph
			.invertAssignments({ edges_assignment: Array.from("MBVUFJC") })
			.edges_assignment.join(""),
	).toBe("VBMUFJC");
	expect(
		ear.graph.invertAssignments({ edges_foldAngle: [0, -180, 180] }).edges_foldAngle[0],
	).toBe(-0);
	expect(
		ear.graph.invertAssignments({ edges_foldAngle: [0, -180, 180] }).edges_foldAngle[1],
	).toBe(180);
	expect(
		ear.graph.invertAssignments({ edges_foldAngle: [0, -180, 180] }).edges_foldAngle[2],
	).toBe(-180);
});

test("getFileMetadata", () => {
	const graph = JSON.parse(
		fs.readFileSync("./tests/files/fold/crane-cp-bmvfcj.fold", "utf-8"),
	);
	const metadata = ear.graph.getFileMetadata(graph);
	expect(Object.keys(metadata).length).toBe(5);
	expect(metadata.file_author).toBe("Kraft");
	expect(metadata.file_creator).toBe("Rabbit Ear");
	expect(metadata.file_spec).toBe(1.2);
	expect(metadata.file_title).toBe("crane");
	expect(metadata.file_classes[0]).toBe("singleModel");
});
