import { expect, test } from "vitest";
import fs from "fs";
import ear from "../src/index.js";

test("verticesFlatFoldabilityMaekawa", () => {
	const foldFile = fs.readFileSync(
		"./tests/files/fold/invalid-single-vertex-2d.fold",
		"utf-8",
	);
	const fold = JSON.parse(foldFile);
	const graphs = ear.graph.getFileFramesAsArray(fold);

	expect(ear.singleVertex.verticesFlatFoldabilityMaekawa(graphs[0])).toMatchObject([
		0, 0, 0, 0, 0, 0, 0, 0, 0,
	]);

	expect(ear.singleVertex.verticesFlatFoldabilityMaekawa(graphs[1])).toMatchObject([
		0, 0, 0, 0, 0, -2, 0, 0, 0,
	]);

	expect(ear.singleVertex.verticesFlatFoldabilityMaekawa(graphs[2])).toMatchObject([
		0, 0, 0, 0, 0, 0, 0, 0, 0,
	]);

	expect(ear.singleVertex.verticesFlatFoldabilityMaekawa(graphs[3])).toMatchObject([
		0, 0, 0, 0, 0, -2, 0, 0, 0,
	]);

	expect(ear.singleVertex.verticesFlatFoldabilityMaekawa(graphs[4])).toMatchObject([
		0, 0, 0, 0, 0, 0, 0, 0, 0,
	]);
});

test("verticesFlatFoldabilityKawasaki", () => {
	const foldFile = fs.readFileSync(
		"./tests/files/fold/invalid-single-vertex-2d.fold",
		"utf-8",
	);
	const fold = JSON.parse(foldFile);
	const graphs = ear.graph.getFileFramesAsArray(fold);

	expect(ear.singleVertex.verticesFlatFoldabilityKawasaki(graphs[0])[5]).toBeCloseTo(0);

	expect(ear.singleVertex.verticesFlatFoldabilityKawasaki(graphs[1])[5]).toBeCloseTo(0);

	expect(ear.singleVertex.verticesFlatFoldabilityKawasaki(graphs[2])[5]).toBeCloseTo(
		-0.04060135259522912,
	);

	expect(ear.singleVertex.verticesFlatFoldabilityKawasaki(graphs[3])[5]).toBeCloseTo(
		-0.04060135259522912,
	);

	expect(ear.singleVertex.verticesFlatFoldabilityKawasaki(graphs[4])[5]).toBeCloseTo(0);
});

test("verticesFlatFoldableMaekawa", () => {
	const foldFile = fs.readFileSync(
		"./tests/files/fold/invalid-single-vertex-2d.fold",
		"utf-8",
	);
	const fold = JSON.parse(foldFile);
	const graphs = ear.graph.getFileFramesAsArray(fold);

	expect(ear.singleVertex.verticesFlatFoldableMaekawa(graphs[0])).toMatchObject([
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

	expect(ear.singleVertex.verticesFlatFoldableMaekawa(graphs[1])).toMatchObject([
		true,
		true,
		true,
		true,
		true,
		false,
		true,
		true,
		true,
	]);

	expect(ear.singleVertex.verticesFlatFoldableMaekawa(graphs[2])).toMatchObject([
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

	expect(ear.singleVertex.verticesFlatFoldableMaekawa(graphs[3])).toMatchObject([
		true,
		true,
		true,
		true,
		true,
		false,
		true,
		true,
		true,
	]);

	expect(ear.singleVertex.verticesFlatFoldableMaekawa(graphs[4])).toMatchObject([
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

test("verticesFlatFoldableKawasaki", () => {
	const foldFile = fs.readFileSync(
		"./tests/files/fold/invalid-single-vertex-2d.fold",
		"utf-8",
	);
	const fold = JSON.parse(foldFile);
	const graphs = ear.graph.getFileFramesAsArray(fold);

	expect(ear.singleVertex.verticesFlatFoldableKawasaki(graphs[0])).toMatchObject([
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

	expect(ear.singleVertex.verticesFlatFoldableKawasaki(graphs[1])).toMatchObject([
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

	expect(ear.singleVertex.verticesFlatFoldableKawasaki(graphs[2])).toMatchObject([
		true,
		true,
		true,
		true,
		true,
		false,
		true,
		true,
		true,
	]);

	expect(ear.singleVertex.verticesFlatFoldableKawasaki(graphs[3])).toMatchObject([
		true,
		true,
		true,
		true,
		true,
		false,
		true,
		true,
		true,
	]);

	expect(ear.singleVertex.verticesFlatFoldableKawasaki(graphs[4])).toMatchObject([
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

test("verticesFlatFoldability", () => {
	const foldFile = fs.readFileSync(
		"./tests/files/fold/invalid-single-vertex-2d.fold",
		"utf-8",
	);
	const fold = JSON.parse(foldFile);
	const graphs = ear.graph.getFileFramesAsArray(fold);

	expect(ear.singleVertex.verticesFlatFoldability(graphs[0])).toMatchObject([
		0, 0, 0, 0, 0, 0, 0, 0, 0,
	]);

	expect(ear.singleVertex.verticesFlatFoldability(graphs[1])).toMatchObject([
		0, 0, 0, 0, 0, 1, 0, 0, 0,
	]);

	expect(ear.singleVertex.verticesFlatFoldability(graphs[2])).toMatchObject([
		0, 0, 0, 0, 0, 2, 0, 0, 0,
	]);

	expect(ear.singleVertex.verticesFlatFoldability(graphs[3])).toMatchObject([
		0, 0, 0, 0, 0, 3, 0, 0, 0,
	]);

	expect(ear.singleVertex.verticesFlatFoldability(graphs[4])).toMatchObject([
		0, 0, 0, 0, 0, 0, 0, 0, 0,
	]);
});

test("verticesFlatFoldable", () => {
	const foldFile = fs.readFileSync(
		"./tests/files/fold/invalid-single-vertex-2d.fold",
		"utf-8",
	);
	const fold = JSON.parse(foldFile);
	const graphs = ear.graph.getFileFramesAsArray(fold);

	expect(ear.singleVertex.verticesFlatFoldable(graphs[0])).toMatchObject([
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

	expect(ear.singleVertex.verticesFlatFoldable(graphs[1])).toMatchObject([
		true,
		true,
		true,
		true,
		true,
		false,
		true,
		true,
		true,
	]);

	expect(ear.singleVertex.verticesFlatFoldable(graphs[2])).toMatchObject([
		true,
		true,
		true,
		true,
		true,
		false,
		true,
		true,
		true,
	]);

	expect(ear.singleVertex.verticesFlatFoldable(graphs[3])).toMatchObject([
		true,
		true,
		true,
		true,
		true,
		false,
		true,
		true,
		true,
	]);

	expect(ear.singleVertex.verticesFlatFoldable(graphs[4])).toMatchObject([
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
