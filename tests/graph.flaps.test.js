import fs from "fs";
import { expect, test } from "vitest";
import ear from "../src/index.js";

test("flaps, waterbomb, through faces", () => {
	const graph = ear.graph.waterbomb();
	const vertices_coordsFolded = ear.graph.makeVerticesCoordsFlatFolded(graph);
	const line = { vector: [0, 1], origin: [0.25, 0] };
	const [sideA, sideB] = ear.graph.getFlaps(graph, line, vertices_coordsFolded);
	expect(sideA).toMatchObject([
		[0, 7],
		[5, 6],
	]);
	expect(sideB).toMatchObject([[1, 2, 3, 4, 0, 5, 6, 7]]);
});

test("flaps, waterbomb, collinear through middle", () => {
	const graph = ear.graph.waterbomb();
	const vertices_coordsFolded = ear.graph.makeVerticesCoordsFlatFolded(graph);
	const line = { vector: [0, 1], origin: [0.5, 0] };
	const [sideA, sideB] = ear.graph.getFlaps(graph, line, vertices_coordsFolded);
	expect(sideA).toMatchObject([
		[0, 7],
		[5, 6],
	]);
	expect(sideB).toMatchObject([
		[1, 2],
		[3, 4],
	]);
});

test("crane flaps, cut through middle of wing", () => {
	const FOLD = fs.readFileSync("./tests/files/fold/crane.fold", "utf-8");
	const fold = JSON.parse(FOLD);
	const graph = ear.graph.getFramesByClassName(fold, "creasePattern")[0];
	const folded = ear.graph.getFramesByClassName(fold, "foldedForm")[0];
	const line = ear.math.pointsToLine2(
		folded.vertices_coords[14],
		folded.vertices_coords[20],
	);
	const [sideA, sideB] = ear.graph.getFlaps(graph, line, folded.vertices_coords);
	expect(sideA).toMatchObject([
		[0, 4, 35, 36, 43, 46],
		[1, 6, 7],
		[2, 16, 17, 18, 19, 20, 21, 22, 23, 25, 27, 30, 32, 33, 37, 38],
		[3, 8, 9, 10, 11, 12, 13, 14, 15, 26, 28, 29, 31, 34, 39, 40],
		[5, 24, 41, 42, 44, 45],
	]);
	expect(sideB).toMatchObject([
		[
			47, 48, 49, 50, 0, 1, 2, 3, 4, 5, 6, 7, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34,
			35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46,
		],
		[51, 52, 53, 54, 55, 56, 57, 58, 16, 17, 18, 19, 20, 21, 22, 23],
		[8, 9, 10, 11, 12, 13, 14, 15],
	]);
});

test("crane flaps, collinear with joining edge of wing", () => {
	const FOLD = fs.readFileSync("./tests/files/fold/crane.fold", "utf-8");
	const fold = JSON.parse(FOLD);
	const graph = ear.graph.getFramesByClassName(fold, "creasePattern")[0];
	const folded = ear.graph.getFramesByClassName(fold, "foldedForm")[0];
	const line = ear.math.pointsToLine2(
		folded.vertices_coords[39],
		folded.vertices_coords[40],
	);
	const result = ear.graph.getFlaps(graph, line, folded.vertices_coords);
	// this is the crane wing. this method in particular tests the ability
	// to separate faces when the divide line runs collinear to the edge
	// which joins the flap to the body of the rest of the origami.
	expect(result[0][0]).toMatchObject([1, 6, 7, 47, 48, 49, 50]);
});

/*
test("getEdgesSide", () => {
	const FOLD = fs.readFileSync("./tests/files/fold/crane-step.fold", "utf-8");
	const graph = JSON.parse(FOLD);
	const result0 = ear.graph.getEdgesSide(graph, { vector: [1, 1], origin: [0, 0] });
	const result1 = ear.graph.getEdgesSide(graph, { vector: [1, -1], origin: [0, 1] });
	const positiveCount0 = result0.filter(a => a === 1).length;
	const negativeCount0 = result0.filter(a => a === -1).length;
	const intersectCount0 = result0.filter(a => a === 0).length;
	const collinearCount0 = result0.filter(a => a === 2).length;
	const positiveCount1 = result1.filter(a => a === 1).length;
	const negativeCount1 = result1.filter(a => a === -1).length;
	const intersectCount1 = result1.filter(a => a === 0).length;
	const collinearCount1 = result1.filter(a => a === 2).length;
	expect(positiveCount0).toBe(negativeCount0);
	expect(positiveCount1).toBe(negativeCount1);
	expect(intersectCount0).toBe(2);
	expect(collinearCount0).toBe(0);
	expect(intersectCount1).toBe(0);
	expect(collinearCount1).toBe(4);
});

test("getFacesSide", () => {
	const FOLD = fs.readFileSync("./tests/files/fold/crane-step.fold", "utf-8");
	const graph = JSON.parse(FOLD);
	const result0 = ear.graph.getFacesSide(graph, { vector: [1, 1], origin: [0, 0] });
	const result1 = ear.graph.getFacesSide(graph, { vector: [1, -1], origin: [0, 1] });
	const positiveCount0 = result0.filter(a => a === 1).length;
	const negativeCount0 = result0.filter(a => a === -1).length;
	const intersectCount0 = result0.filter(a => a === 0).length;
	const positiveCount1 = result1.filter(a => a === 1).length;
	const negativeCount1 = result1.filter(a => a === -1).length;
	const intersectCount1 = result1.filter(a => a === 0).length;
	expect(positiveCount0).toBe(negativeCount0);
	expect(positiveCount1).toBe(negativeCount1);
	expect(intersectCount0).toBe(4);
	expect(intersectCount1).toBe(0);
});

*/
