import fs from "fs";
import { expect, test } from "vitest";
import ear from "../src/index.js";

/**
 * @description Create a face-map relationship between the a graph
 * and the planarized copy of the same graph.
 * IMPORTANT! all faces in the newGraph (planarized) have to be convex
 * otherwise the face center point might not lie inside the polygon.
 * @param {FOLD} oldGraph the input folded form
 * @param {FOLD} newGraph the planarized graph
 * @param {number[][]} nextmap
 * @returns {{ backmap: number[][], bruteForceBackmap: number[][] }}
 */
const makeBruteForceFaceMap = (oldGraph, newGraph, nextmap) => {
	const backmap = ear.graph.invertArrayMap(nextmap);
	const faces_centerPlanar = ear.graph.makeFacesCenterQuick(newGraph);
	const faces_polygonFolded = ear.graph.makeFacesPolygon(oldGraph);
	const bruteForceBackmap = faces_centerPlanar.map((center) =>
		faces_polygonFolded
			.map((poly, f2) =>
				ear.math.overlapConvexPolygonPoint(poly, center).overlap ? f2 : undefined,
			)
			.filter((a) => a !== undefined),
	);
	return {
		backmap,
		bruteForceBackmap,
	};
};

test("planarize face map, brute force, flapping-bird", () => {
	const FOLD = fs.readFileSync("./tests/files/fold/randlett-flapping-bird.fold", "utf-8");
	const fold = JSON.parse(FOLD);
	const folded = ear.graph.getFramesByClassName(fold, "foldedForm")[0];
	const {
		result,
		changes: {
			faces: { map },
		},
	} = ear.graph.planarizeVerbose(folded);

	const { backmap, bruteForceBackmap } = makeBruteForceFaceMap(folded, result, map);

	expect(backmap).toMatchObject(bruteForceBackmap);
});

test("planarize face map, brute force, kabuto", () => {
	const FOLD = fs.readFileSync("./tests/files/fold/kabuto.fold", "utf-8");
	const fold = JSON.parse(FOLD);
	const folded = ear.graph.getFramesByClassName(fold, "foldedForm")[0];
	const {
		result,
		changes: {
			faces: { map },
		},
	} = ear.graph.planarizeVerbose(folded);

	const { backmap, bruteForceBackmap } = makeBruteForceFaceMap(folded, result, map);

	expect(backmap).toMatchObject(bruteForceBackmap);
});

test("planarize face map, brute force, crane", () => {
	const FOLD = fs.readFileSync("./tests/files/fold/crane.fold", "utf-8");
	const fold = JSON.parse(FOLD);
	const folded = {
		...fold,
		vertices_coords: ear.graph.makeVerticesCoordsFlatFolded(fold),
	};
	const {
		result,
		changes: {
			faces: { map },
		},
	} = ear.graph.planarizeVerbose(folded);

	const { backmap, bruteForceBackmap } = makeBruteForceFaceMap(folded, result, map);

	expect(backmap).toMatchObject(bruteForceBackmap);
});

test("planarize face map, brute force, kraft-bird", () => {
	const FOLD = fs.readFileSync("./tests/files/fold/kraft-bird-base.fold", "utf-8");
	const fold = JSON.parse(FOLD);
	const folded = {
		...fold,
		vertices_coords: ear.graph.makeVerticesCoordsFlatFolded(fold),
	};
	const {
		result,
		changes: {
			faces: { map },
		},
	} = ear.graph.planarizeVerbose(folded);

	const { backmap, bruteForceBackmap } = makeBruteForceFaceMap(folded, result, map);

	expect(backmap).toMatchObject(bruteForceBackmap);
});
