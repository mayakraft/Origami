import fs from "fs";
import { expect, test } from "vitest";
import ear from "../src/index.js";

test("makeFacesNormal crease pattern", () => {
	const foldfile = fs.readFileSync("./tests/files/fold/crane-cp.fold", "utf-8");
	const FOLD = JSON.parse(foldfile);
	const faceNormals = ear.graph.makeFacesNormal(FOLD);
	faceNormals
		.map((normal) => ear.math.dot(normal, [0, 0, 1]))
		.forEach((dot) => expect(dot).toBeCloseTo(1));
});

test("makeVerticesNormal crease pattern", () => {
	const foldfile = fs.readFileSync("./tests/files/fold/crane-cp.fold", "utf-8");
	const FOLD = JSON.parse(foldfile);
	const verticesNormal = ear.graph.makeVerticesNormal(FOLD);
	verticesNormal
		.map((normal) => ear.math.dot(normal, [0, 0, 1]))
		.forEach((dot) => expect(dot).toBeCloseTo(1));
});

test("makeFacesNormal flat folded form", () => {
	const foldfile = fs.readFileSync(
		"./tests/files/fold/preliminary-offset-cp.fold",
		"utf-8",
	);
	const graph = JSON.parse(foldfile);
	const vertices_coords = ear.graph.makeVerticesCoordsFlatFolded(graph);
	const folded = { ...graph, vertices_coords };
	const faceNormals = ear.graph.makeFacesNormal(folded);
	expect(ear.math.dot(faceNormals[0], [0, 0, 1])).toBeCloseTo(1);
	expect(ear.math.dot(faceNormals[1], [0, 0, -1])).toBeCloseTo(1);
	expect(ear.math.dot(faceNormals[2], [0, 0, -1])).toBeCloseTo(1);
	expect(ear.math.dot(faceNormals[3], [0, 0, 1])).toBeCloseTo(1);
	expect(ear.math.dot(faceNormals[4], [0, 0, 1])).toBeCloseTo(1);
	expect(ear.math.dot(faceNormals[5], [0, 0, -1])).toBeCloseTo(1);
});

test("makeFacesNormal 3d form", () => {
	const sphere = fs.readFileSync("./tests/files/obj/sphere-with-holes.obj", "utf-8");
	const FOLD = ear.convert.objToFold(sphere);
	const facesNormals = ear.graph.makeFacesNormal(FOLD);
	const m1 = facesNormals.filter((normal) => ear.math.dot(normal, [1, 0, 0]) > 0.999);
	const m2 = facesNormals.filter((normal) => ear.math.dot(normal, [-1, 0, 0]) > 0.999);
	const m3 = facesNormals.filter((normal) => ear.math.dot(normal, [0, 1, 0]) > 0.999);
	const m4 = facesNormals.filter((normal) => ear.math.dot(normal, [0, -1, 0]) > 0.999);
	const m5 = facesNormals.filter((normal) => ear.math.dot(normal, [0, 0, 1]) > 0.999);
	const m6 = facesNormals.filter((normal) => ear.math.dot(normal, [0, 0, -1]) > 0.999);
	expect(m1.length).toBe(0);
	expect(m2.length).toBe(0);
	expect(m3.length).toBe(0);
	expect(m4.length).toBe(0);
	expect(m5.length).toBe(0);
	expect(m6.length).toBe(0);
});

test("makeVerticesNormal 3d form", () => {
	const sphere = fs.readFileSync("./tests/files/obj/sphere-with-holes.obj", "utf-8");
	const FOLD = ear.convert.objToFold(sphere);
	const verticesNormal = ear.graph.makeVerticesNormal(FOLD);

	const m1 = verticesNormal.filter((normal) => ear.math.dot(normal, [0, 1, 0]) > 0.999);
	const m2 = verticesNormal.filter((normal) => ear.math.dot(normal, [0, -1, 0]) > 0.999);
	const m3 = verticesNormal.filter((normal) => ear.math.dot(normal, [0, 0, -1]) > 0.999);
	expect(m1.length).toBe(1);
	expect(m2.length).toBe(1);
	expect(m3.length).toBe(1);
});

test("normals 3D many planes", () => {
	const FOLD = fs.readFileSync("./tests/files/fold/square-fish-3d.fold", "utf-8");
	const graph = JSON.parse(FOLD);
	const vertices_coords = ear.graph.makeVerticesCoordsFolded(graph);
	const folded = { ...graph, vertices_coords };
	const faces_normal = ear.graph.makeFacesNormal(folded);
	const normals = [
		[0, 0, 1],
		[0, 0, -1],
		[0, 0, -1],
		[0, 0, 1],
		[0.9238795325112866, -0.38268343236509034, 0],
		[-0.9238795325112866, 0.38268343236509034, 0],
		[0.9238795325112863, 0.3826834323650909, 0],
		[-0.923879532511287, -0.38268343236508917, 0],
		[0, 0, -1],
		[0, 0, -1],
		[0, -1, 0],
		[0, 1, 0],
		[0, 1, 0],
		[0, 0, 1],
		[0, 0, 1],
		[0, -1, 0],
	];
	normals.forEach((normal, i) =>
		normal.forEach((n, j) => expect(faces_normal[i][j]).toBeCloseTo(n)),
	);
});
