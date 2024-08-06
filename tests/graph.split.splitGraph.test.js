import { expect, test } from "vitest";
import fs from "fs";
import ear from "../src/index.js";

test("splitGraphWithLineAndPoints, bird base", () => {
	const graph = ear.graph.bird();
	const folded = {
		...graph,
		vertices_coords: ear.graph.makeVerticesCoordsFlatFolded(graph),
	};

	const { vertices, edges, faces } = ear.graph.splitGraphWithLineAndPoints(folded, {
		vector: [-1, 1],
		origin: [0.25, 0],
	});

	// create an unfolded graph, reassign all "U" to be "F" so that
	// makeVerticesCoordsFlatFolded works
	// this is extremely not precise don't do this outside of basic testing
	folded.edges_assignment = folded.edges_assignment.map((a) =>
		a === "U" || a === "u" ? "F" : a,
	);
	const unfolded = {
		...folded,
		vertices_coords: ear.graph.makeVerticesCoordsFlatFolded(folded),
	};

	expect(vertices.intersect.filter((el) => el !== undefined)).toHaveLength(0);
	expect(edges.intersect.filter((el) => el !== undefined)).toHaveLength(20);
	expect(faces.intersect.filter((el) => el !== undefined)).toHaveLength(20);
	expect(ear.graph.countVertices(folded)).toBe(35);
	expect(ear.graph.countEdges(folded)).toBe(70);
	expect(ear.graph.countFaces(folded)).toBe(36);

	fs.writeFileSync(
		"./tests/tmp/splitGraphWithLineAndPoints-bird-base-cp.fold",
		JSON.stringify(unfolded),
	);
	fs.writeFileSync(
		"./tests/tmp/splitGraphWithLineAndPoints-bird-base-folded.fold",
		JSON.stringify(folded),
	);
});

test("splitGraphWithLineAndPoints, square fish base", () => {
	const graph = ear.graph.squareFish();
	const folded = {
		...graph,
		vertices_coords: ear.graph.makeVerticesCoordsFlatFolded(graph),
	};

	const { vertices, edges, faces } = ear.graph.splitGraphWithLineAndPoints(folded, {
		vector: [-1, 1],
		origin: [Math.SQRT1_2, 0],
	});

	// create an unfolded graph, reassign all "U" to be "F" so that
	// makeVerticesCoordsFlatFolded works
	// this is extremely not precise don't do this outside of basic testing
	folded.edges_assignment = folded.edges_assignment.map((a) =>
		a === "U" || a === "u" ? "F" : a,
	);
	const unfolded = {
		...folded,
		vertices_coords: ear.graph.makeVerticesCoordsFlatFolded(folded),
	};

	expect(vertices.intersect.filter((el) => el !== undefined)).toHaveLength(1);
	expect(edges.intersect.filter((el) => el !== undefined)).toHaveLength(11);
	expect(faces.intersect.filter((el) => el !== undefined)).toHaveLength(16);
	expect(ear.graph.countVertices(folded)).toBe(25);
	expect(ear.graph.countEdges(folded)).toBe(51);
	expect(ear.graph.countFaces(folded)).toBe(27);

	fs.writeFileSync(
		"./tests/tmp/splitGraphWithLineAndPoints-square-fish-base-cp.fold",
		JSON.stringify(unfolded),
	);
	fs.writeFileSync(
		"./tests/tmp/splitGraphWithLineAndPoints-square-fish-base-folded.fold",
		JSON.stringify(folded),
	);
});

test("splitGraphWithLineAndPoints, crane", () => {
	const foldfile = fs.readFileSync("./tests/files/fold/crane.fold", "utf-8");
	const fold = JSON.parse(foldfile);
	const graph = ear.graph.getFramesByClassName(fold, "creasePattern")[0];
	const folded = {
		...graph,
		vertices_coords: ear.graph.makeVerticesCoordsFlatFolded(graph),
	};

	const { vertices, edges, faces } = ear.graph.splitGraphWithLineAndPoints(folded, {
		vector: [0, 1],
		origin: [0.6, 0.6],
	});

	// create an unfolded graph, reassign all "U" to be "F" so that
	// makeVerticesCoordsFlatFolded works
	// this is extremely not precise don't do this outside of basic testing
	folded.edges_assignment = folded.edges_assignment.map((a) =>
		a === "U" || a === "u" ? "F" : a,
	);
	const unfolded = {
		...folded,
		vertices_coords: ear.graph.makeVerticesCoordsFlatFolded(folded),
	};

	expect(vertices.intersect.filter((el) => el !== undefined)).toHaveLength(0);
	expect(edges.intersect.filter((el) => el !== undefined)).toHaveLength(39);
	expect(faces.intersect.filter((el) => el !== undefined)).toHaveLength(59);
	expect(ear.graph.countVertices(folded)).toBe(95);
	expect(ear.graph.countEdges(folded)).toBe(190);
	expect(ear.graph.countFaces(folded)).toBe(96);

	fs.writeFileSync(
		"./tests/tmp/splitGraphWithLineAndPoints-crane-cp.fold",
		JSON.stringify(unfolded),
	);
	fs.writeFileSync(
		"./tests/tmp/splitGraphWithLineAndPoints-crane-folded.fold",
		JSON.stringify(folded),
	);
});

test("splitGraphWithSegment, windmill", () => {
	const graph = ear.graph.windmill();
	const folded = {
		...graph,
		vertices_coords: ear.graph.makeVerticesCoordsFlatFolded(graph),
	};

	const segment = [
		[0, 1],
		[1, -1],
	];
	ear.graph.splitGraphWithSegment(folded, segment);

	// create an unfolded graph, reassign all "U" to be "F" so that
	// makeVerticesCoordsFlatFolded works
	// this is extremely not precise don't do this outside of basic testing
	folded.edges_assignment = folded.edges_assignment.map((a) =>
		a === "U" || a === "u" ? "F" : a,
	);
	const unfolded = {
		...folded,
		vertices_coords: ear.graph.makeVerticesCoordsFlatFolded(folded),
	};

	fs.writeFileSync(
		"./tests/tmp/splitGraphWithSegment-windmill-cp.fold",
		JSON.stringify(unfolded),
	);
	fs.writeFileSync(
		"./tests/tmp/splitGraphWithSegment-windmill-folded.fold",
		JSON.stringify(folded),
	);
});

test("splitGraphWithSegment with leaf edges, windmill", () => {
	const graph = ear.graph.windmill();
	const folded = {
		...graph,
		vertices_coords: ear.graph.makeVerticesCoordsFlatFolded(graph),
	};

	const segment = [
		[0.6, -0.2],
		[0.4, 0.2],
	];
	ear.graph.splitGraphWithSegment(folded, segment);

	fs.writeFileSync(
		"./tests/tmp/splitGraphWithSegment-leafedges-windmill-folded.fold",
		JSON.stringify(folded),
	);
});
