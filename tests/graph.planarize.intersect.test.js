import fs from "fs";
import { expect, test } from "vitest";
import ear from "../src/index.js";

test("intersectAllEdges, a bunch of random lines", () => {
	const FOLD25 = fs.readFileSync("./tests/files/fold/non-planar-25-lines.fold", "utf-8");
	const FOLD50 = fs.readFileSync("./tests/files/fold/non-planar-50-lines.fold", "utf-8");
	const FOLD75 = fs.readFileSync("./tests/files/fold/non-planar-75-lines.fold", "utf-8");
	const FOLD100 = fs.readFileSync(
		"./tests/files/fold/non-planar-100-lines.fold",
		"utf-8",
	);
	const FOLD50c = fs.readFileSync(
		"./tests/files/fold/non-planar-50-chaotic.fold",
		"utf-8",
	);
	const FOLD100c = fs.readFileSync(
		"./tests/files/fold/non-planar-100-chaotic.fold",
		"utf-8",
	);
	const FOLD500c = fs.readFileSync(
		"./tests/files/fold/non-planar-500-chaotic.fold",
		"utf-8",
	);
	expect(ear.graph.intersectAllEdges(JSON.parse(FOLD25))).toHaveLength(150);
	expect(ear.graph.intersectAllEdges(JSON.parse(FOLD50))).toHaveLength(635);
	expect(ear.graph.intersectAllEdges(JSON.parse(FOLD75))).toHaveLength(1947);
	expect(ear.graph.intersectAllEdges(JSON.parse(FOLD100))).toHaveLength(2957);
	expect(ear.graph.intersectAllEdges(JSON.parse(FOLD50c))).toHaveLength(296);
	expect(ear.graph.intersectAllEdges(JSON.parse(FOLD100c))).toHaveLength(1032);
	expect(ear.graph.intersectAllEdges(JSON.parse(FOLD500c))).toHaveLength(29033);
});
