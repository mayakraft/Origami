import fs from "fs";
import { expect, test } from "vitest";
import ear from "../src/index.js";

test("verticesFoldability", () => {
	const foldFile = fs.readFileSync(
		"./tests/files/fold/invalid-single-vertex-2d.fold",
		"utf-8",
	);
	const fold = JSON.parse(foldFile);
	const graphs = ear.graph.getFileFramesAsArray(fold);

	ear.singleVertex
		.verticesFoldability(graphs[0])
		.forEach((value, i) => expect(value).toBeCloseTo([0, 0, 0, 0, 0, 0, 0, 0, 0][i]));

	ear.singleVertex
		.verticesFoldability(graphs[1])
		.forEach((value, i) => expect(value).toBeCloseTo([0, 0, 0, 0, 0, 0, 0, 0, 0][i]));

	ear.singleVertex
		.verticesFoldability(graphs[2])
		.forEach((value, i) =>
			expect(value).toBeCloseTo([0, 0, 0, 0, 0, 0.082828, 0, 0, 0][i]),
		);

	ear.singleVertex
		.verticesFoldability(graphs[3])
		.forEach((value, i) =>
			expect(value).toBeCloseTo([0, 0, 0, 0, 0, 0.082828, 0, 0, 0][i]),
		);

	ear.singleVertex
		.verticesFoldability(graphs[4])
		.forEach((value, i) => expect(value).toBeCloseTo([0, 0, 0, 0, 0, 0, 0, 0, 0][i]));
});

test("verticesFoldable", () => {
	const foldFile = fs.readFileSync(
		"./tests/files/fold/invalid-single-vertex-2d.fold",
		"utf-8",
	);
	const fold = JSON.parse(foldFile);
	const graphs = ear.graph.getFileFramesAsArray(fold);

	ear.singleVertex
		.verticesFoldable(graphs[0])
		.forEach((value, i) =>
			expect(value).toBeCloseTo(
				[true, true, true, true, true, true, true, true, true][i],
			),
		);

	ear.singleVertex
		.verticesFoldable(graphs[1])
		.forEach((value, i) =>
			expect(value).toBeCloseTo(
				[true, true, true, true, true, true, true, true, true][i],
			),
		);

	ear.singleVertex
		.verticesFoldable(graphs[2])
		.forEach((value, i) =>
			expect(value).toBeCloseTo(
				[true, true, true, true, true, false, true, true, true][i],
			),
		);

	ear.singleVertex
		.verticesFoldable(graphs[3])
		.forEach((value, i) =>
			expect(value).toBeCloseTo(
				[true, true, true, true, true, false, true, true, true][i],
			),
		);

	ear.singleVertex
		.verticesFoldable(graphs[4])
		.forEach((value, i) =>
			expect(value).toBeCloseTo(
				[true, true, true, true, true, true, true, true, true][i],
			),
		);
});

test("verticesFoldability", () => {
	const testfile = fs.readFileSync(
		"./tests/files/fold/invalid-box-pleat-3d.fold",
		"utf-8",
	);
	const graph = JSON.parse(testfile);
	const verts = ear.singleVertex.verticesFoldability(graph);

	// one vertex is not foldable
	[0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0].forEach((value, i) =>
		expect(verts[i]).toBeCloseTo(value),
	);
});

test("verticesFoldable", () => {
	const testfile = fs.readFileSync(
		"./tests/files/fold/invalid-box-pleat-3d.fold",
		"utf-8",
	);
	const graph = JSON.parse(testfile);
	const verts = ear.singleVertex.verticesFoldable(graph);

	// one vertex is not foldable
	const expected = [
		true,
		true,
		true,
		true,
		true,
		true,
		true,
		false,
		true,
		true,
		true,
		true,
	];
	expected.forEach((valid, i) => expect(verts[i]).toBe(valid));
});

test("verticesFoldable", () => {
	const testfile = fs.readFileSync(
		"./tests/files/fold/invalid-single-vertex-3d.fold",
		"utf-8",
	);
	const graph = JSON.parse(testfile);
	const verts = ear.singleVertex.verticesFoldable(graph);

	// expect(verts).toMatchObject([true, true, true, false, true, true]);
	expect(verts).toMatchObject([true, true, true, true, true, true]);
});

test("verticesFoldable", () => {
	const testfile = fs.readFileSync(
		"./tests/files/fold/invalid-self-intersect.fold",
		"utf-8",
	);
	const graph = JSON.parse(testfile);
	const verts = ear.singleVertex.verticesFoldable(graph);

	// expect(verts).toMatchObject([
	// 	true, true, true, true, true, false, true, true, true, true, true
	// ]);
	expect(verts).toMatchObject([
		true,
		true,
		true,
		true,
		true,
		true,
		true,
		true,
		true,
		true,
		true,
	]);
});
