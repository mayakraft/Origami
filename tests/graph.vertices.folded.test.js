import fs from "fs";
import { expect, test } from "vitest";
import ear from "../src/index.js";

const arraysTest = (a, b) => a.forEach((_, i) => expect(a[i]).toBeCloseTo(b[i]));

test("fold a 3D model", () => {
	const file = "bird-base-3d.fold";
	// const file = "panels.fold";
	const FOLD = JSON.parse(fs.readFileSync(`./tests/files/fold/${file}`));
	const cp = ear.graph.getFramesByClassName(FOLD, "creasePattern")[0];
	const vertices_coords = ear.graph.makeVerticesCoordsFolded(cp);
	const folded = {
		...cp,
		vertices_coords,
	};
	// console.log("folded", folded);

	expect(true).toBe(true);
});

test("fold in 3d", () => {
	const file = "bird-base-3d.fold";
	// const file = "panels.fold";

	const FOLD = JSON.parse(fs.readFileSync(`./tests/files/fold/${file}`));
	const cp = ear.graph.getFramesByClassName(FOLD, "creasePattern")[0];

	// make edge-adjacent faces for every face
	// cp.faces_faces = ear.graph.makeFacesFaces(cp);
	// pick a starting face, breadth-first walk to every face
	// each of these results will relate a face to:
	// 1. each parent face in the walk
	// 2. which edge it crossed to move from the parent to this face
	// const walk = ear.graph.make_face_walk_tree(cp);
	// console.log(walk);

	// everything commented out above is done inside these next few methods

	// give each face a global transform matrix based on it and its connected face's matrices
	const faces_matrix = ear.graph.makeFacesMatrix(cp);
	// console.log("faces_matrix", faces_matrix);

	// most vertices are a part of a few different faces, it doesn't matter
	// which face, just assign each vertex to one of its face's matrices, and
	// apply that transform.
	const vertices_faces = ear.graph.makeVerticesFaces(cp);
	const new_vertices_coords = cp.vertices_coords.map((coords, i) =>
		ear.math.multiplyMatrix3Vector3(
			faces_matrix[vertices_faces[i][0]],
			ear.math.resize(3, coords),
		),
	);

	// modify the original graph, replace the vertices_coords with the new set.
	cp.vertices_coords = new_vertices_coords;

	// fs.writeFileSync(`./tests/files/folded-${file}`, JSON.stringify(cp));
	expect(true).toBe(true);
});

test("fold a disjoint graph", () => {
	const file = "disjoint-triangles-3d.fold";
	const FOLD = JSON.parse(fs.readFileSync(`./tests/files/fold/${file}`));
	const cp = ear.graph.getFramesByClassName(FOLD, "creasePattern")[0];
	const vertices_coords = ear.graph.makeVerticesCoordsFolded(cp);
	const expected = [
		[0, 0, 0],
		[1, 0, 1],
		[1, 1, 0],
		[1, 0, 0],
		[0.5, 0, 0],
		[0.5, 0.5, 0],
		[0.5, 0, 0.5],
		[-0.5, 0, 0],
		[-1.5, 1, 0],
		[-1.5, 0, 1],
		[-1.5, 0, 0],
		[-1, 0, 0],
		[-1, 0, 0.5],
		[-1, 0.5, 0],
		[1.5, 0, 0],
		[2.5, 0, 1],
		[2.5, 1, 0],
		[2.5, 0, 0],
		[3, 0, 0],
		[4, 0, 1],
		[4, 1, 0],
		[4, 0, 0],
		[4.5, 0, 0],
		[5, 0, 0.5],
		[5, 0.5, 0],
		[5, 0, 0],
	];
	vertices_coords.forEach((coords, i) =>
		coords.forEach((n, j) => expect(n).toBeCloseTo(expected[i][j])),
	);
});

test("two graphs joined at a single vertex, folded", () => {
	const foldfile = fs.readFileSync("./tests/files/fold/kissing-squares.fold", "utf-8");
	const graph = JSON.parse(foldfile);
	const vertices_coords = ear.graph.makeVerticesCoords3DFolded(graph);
	const expected = [
		[0, 0, 0],
		[1, 0, 0],
		[0, 2, 0],
		[0, 1, 0],
		[-1, 2, 0],
		[0, 0, 0],
		[0, 2, 0],
	];
	expected.forEach((coords, i) =>
		coords.forEach((_, j) => expect(vertices_coords[i][j]).toBeCloseTo(expected[i][j])),
	);
});

test("two graphs joined at a single vertex, flat-folded", () => {
	const foldfile = fs.readFileSync("./tests/files/fold/kissing-squares.fold", "utf-8");
	const graph = JSON.parse(foldfile);
	const vertices_coords = ear.graph.makeVerticesCoordsFlatFolded(graph);
	const expected = [
		[0, 0],
		[1, 0],
		[0, 2],
		[0, 1],
		[-1, 2],
		[0, 0],
		[0, 2],
	];
	expected.forEach((coords, i) =>
		coords.forEach((_, j) => expect(vertices_coords[i][j]).toBeCloseTo(expected[i][j])),
	);
});

const fourPanel = {
	vertices_coords: [
		[0, 0],
		[1, 0],
		[2, 0],
		[3, 0],
		[4, 0],
		[4, 1],
		[3, 1],
		[2, 1],
		[1, 1],
		[0, 1],
	],
	edges_vertices: [
		[0, 1],
		[1, 2],
		[2, 3],
		[3, 4],
		[4, 5],
		[5, 6],
		[6, 7],
		[7, 8],
		[8, 9],
		[9, 0],
		[1, 8],
		[2, 7],
		[3, 6],
	],
	edges_foldAngle: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 90, 90, 90],
	faces_vertices: [
		[0, 1, 8, 9],
		[1, 2, 7, 8],
		[2, 3, 6, 7],
		[3, 4, 5, 6],
	],
};

test("folded vertices_coords", () => {
	const result = ear.graph.makeVerticesCoordsFolded(fourPanel);
	[
		[0, 0, 0],
		[1, 0, 0],
		[1, 0, 1],
		[0, 0, 1],
		[0, 0, 0],
		[0, 1, 0],
		[0, 1, 1],
		[1, 1, 1],
		[1, 1, 0],
		[0, 1, 0],
	].forEach((point, i) => arraysTest(point, result[i]));
});

test("folded vertices_coords. starting face 1", () => {
	const result = ear.graph.makeVerticesCoordsFolded(fourPanel, [1]);
	[
		[1, 0, 1],
		[1, 0, 0],
		[2, 0, 0],
		[2, 0, 1],
		[1, 0, 1],
		[1, 1, 1],
		[2, 1, 1],
		[2, 1, 0],
		[1, 1, 0],
		[1, 1, 1],
	].forEach((point, i) => arraysTest(point, result[i]));
});

test("folded vertices_coords. starting face 3", () => {
	const result = ear.graph.makeVerticesCoordsFolded(fourPanel, [3]);
	[
		[4, 0, 0],
		[4, 0, 1],
		[3, 0, 1],
		[3, 0, 0],
		[4, 0, 0],
		[4, 1, 0],
		[3, 1, 0],
		[3, 1, 1],
		[4, 1, 1],
		[4, 1, 0],
	].forEach((point, i) => arraysTest(point, result[i]));
});
