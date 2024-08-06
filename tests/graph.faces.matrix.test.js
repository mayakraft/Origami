import fs from "fs";
import { expect, test } from "vitest";
import ear from "../src/index.js";

test("makeFacesMatrix 3d sphere", () => {
	const sphere = fs.readFileSync("./tests/files/obj/sphere-with-holes.obj", "utf-8");
	const graph = ear.convert.objToFold(sphere);
	const res1 = ear.graph.makeFacesMatrix(graph);
	res1[0].forEach((n, i) => expect(n).toBeCloseTo(ear.math.identity3x4[i]));
	res1[1].forEach((n, i) => expect(n).not.toBeCloseTo(ear.math.identity3x4[i]));
	const res2 = ear.graph.makeFacesMatrix(graph, [1]);
	res2[0].forEach((n, i) => expect(n).not.toBeCloseTo(ear.math.identity3x4[i]));
	res2[1].forEach((n, i) => expect(n).toBeCloseTo(ear.math.identity3x4[i]));
});

test("makeFacesMatrix2 and makeFacesMatrix similarity", () => {
	const foldfile = fs.readFileSync("./tests/files/fold/crane-step.fold", "utf-8");
	const cp = JSON.parse(foldfile);
	const res1 = ear.graph.makeFacesMatrix(cp);
	const res2 = ear.graph.makeFacesMatrix2(cp);
	res1.forEach((mat, f) => {
		expect(mat[0]).toBeCloseTo(res2[f][0]);
		expect(mat[1]).toBeCloseTo(res2[f][1]);
		expect(mat[3]).toBeCloseTo(res2[f][2]);
		expect(mat[4]).toBeCloseTo(res2[f][3]);
		expect(mat[9]).toBeCloseTo(res2[f][4]);
		expect(mat[10]).toBeCloseTo(res2[f][5]);
	});
});

test("makeFacesMatrix no folded creases", () => {
	const foldfile = fs.readFileSync("./tests/files/fold/fan-flat-cp.fold", "utf-8");
	const cp = JSON.parse(foldfile);
	ear.graph
		.makeFacesMatrix(cp)
		.forEach((mat) =>
			mat.forEach((n, i) => expect(n).toBeCloseTo(ear.math.identity3x4[i])),
		);
});
