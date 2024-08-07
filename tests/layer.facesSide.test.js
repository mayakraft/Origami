import { expect, test } from "vitest";
import fs from "fs";
import ear from "../src/index.js";

test("overlappingParallelEdgePairs panel 4x2", () => {
	const foldfile = fs.readFileSync("./tests/files/fold/panels-4x2.fold", "utf-8");
	const fold = JSON.parse(foldfile);
	const folded = ear.graph.getFramesByClassName(fold, "foldedForm")[0];
	ear.graph.populate(folded);
	const edgePairs = ear.graph
		.connectedComponentsPairs(ear.graph.getEdgesEdgesCollinearOverlap(folded))
		.filter((pair) => pair.every((edge) => folded.edges_faces[edge].length === 2));

	// 8, 9, 10, 11 all overlap each other
	// 6 and 14, and 7 and 15 overlap each other
	expect(edgePairs).toMatchObject([
		[6, 14],
		[7, 15],
		[8, 9],
		[8, 10],
		[8, 11],
		[9, 10],
		[9, 11],
		[10, 11],
	]);
});

test("overlappingParallelEdgePairs strip weave", () => {
	const foldfile = fs.readFileSync("./tests/files/fold/strip-weave.fold", "utf-8");
	const fold = JSON.parse(foldfile);
	const folded = ear.graph.getFramesByClassName(fold, "foldedForm")[0];
	ear.graph.populate(folded);

	const edgePairs = ear.graph
		.connectedComponentsPairs(ear.graph.getEdgesEdgesCollinearOverlap(folded))
		.filter((pair) => pair.every((edge) => folded.edges_faces[edge].length === 2));

	expect(edgePairs.length).toBe(0);
});

test("overlappingParallelEdgePairs triangle strip", () => {
	const foldfile = fs.readFileSync("./tests/files/fold/triangle-strip.fold", "utf-8");
	const fold = JSON.parse(foldfile);
	const folded = ear.graph.getFramesByClassName(fold, "foldedForm")[0];
	ear.graph.populate(folded);

	const edgePairs = ear.graph
		.connectedComponentsPairs(ear.graph.getEdgesEdgesCollinearOverlap(folded))
		.filter((pair) => pair.every((edge) => folded.edges_faces[edge].length === 2));

	expect(edgePairs.length).toBe(0);
});

test("overlappingParallelEdgePairs triangle strip-2", () => {
	const foldfile = fs.readFileSync("./tests/files/fold/triangle-strip-2.fold", "utf-8");
	const fold = JSON.parse(foldfile);
	const folded = ear.graph.getFramesByClassName(fold, "foldedForm")[0];
	ear.graph.populate(folded);
	const edgePairs = ear.graph
		.connectedComponentsPairs(ear.graph.getEdgesEdgesCollinearOverlap(folded))
		.filter((pair) => pair.every((edge) => folded.edges_faces[edge].length === 2));

	expect(edgePairs).toMatchObject([
		[10, 29],
		[11, 45],
		[12, 41],
		[12, 46],
		[13, 38],
		[13, 42],
		[14, 35],
		[14, 37],
		[15, 31],
		[15, 36],
		[16, 20],
		[16, 32],
		[17, 21],
		[19, 33],
		[20, 32],
		[30, 39],
		[31, 36],
		[34, 43],
		[35, 37],
		[38, 42],
		[40, 47],
		[41, 46],
	]);
});

test("edgesFacesSide 2D and 3D", () => {
	const { vertices_coords, edges_vertices } = ear.graph.square();

	const graph1 = ear.graph.populate({
		vertices_coords,
		edges_vertices: [...edges_vertices, [0, 2]],
		faces_vertices: [
			[0, 1, 2],
			[2, 3, 0],
		],
	});
	const graph2 = ear.graph.populate({
		vertices_coords,
		edges_vertices: [
			[1, 0],
			[2, 1],
			[3, 2],
			[0, 3],
			[2, 0],
		],
		faces_vertices: [
			[0, 1, 2],
			[2, 3, 0],
		],
	});
	graph1.faces_center = ear.graph.makeFacesCenterQuick(graph1);
	graph2.faces_center = ear.graph.makeFacesCenterQuick(graph2);

	expect(ear.layer.makeEdgesFacesSide(graph1)).toMatchObject([
		[-1],
		[-1],
		[-1],
		[-1],
		[1, -1],
	]);

	expect(ear.layer.makeEdgesFacesSide(graph2)).toMatchObject([
		[1],
		[1],
		[1],
		[1],
		[-1, 1],
	]);

	expect(
		ear.layer.makeEdgesFacesSide3D(graph1, {
			...ear.graph.getEdgesLine(graph1),
			...ear.graph.getFacesPlane(graph1),
		}),
	).toMatchObject([[-1], [-1], [-1], [-1], [1, -1]]);

	expect(
		ear.layer.makeEdgesFacesSide3D(graph2, {
			...ear.graph.getEdgesLine(graph2),
			...ear.graph.getFacesPlane(graph2),
		}),
	).toMatchObject([[1], [1], [1], [1], [-1, 1]]);
});

test("edgesFacesSide strip weave", () => {
	const foldfile = fs.readFileSync("./tests/files/fold/strip-weave.fold", "utf-8");
	const fold = JSON.parse(foldfile);
	const folded = ear.graph.getFramesByClassName(fold, "foldedForm")[0];
	ear.graph.populate(folded);
	folded.faces_center = ear.graph.makeFacesCenterQuick(folded);
	// all non boundary are taco-taco (same side)
	expect(ear.layer.makeEdgesFacesSide(folded)).toMatchObject([
		[1],
		[-1],
		[1],
		[-1],
		[-1],
		[1],
		[-1],
		[1],
		[-1, -1],
		[1, 1],
		[1],
		[-1],
		[1],
		[-1],
		[1],
		[-1],
		[1, 1],
		[-1, -1],
		[1],
		[1, 1],
		[-1, -1],
		[-1],
		[-1],
	]);
});

test("facesSide panels zig zag", () => {
	const foldfile = fs.readFileSync("./tests/files/fold/panels-zig-zag.fold", "utf-8");
	const fold = JSON.parse(foldfile);
	const folded = ear.graph.getFramesByClassName(fold, "foldedForm")[0];
	ear.graph.populate(folded);
	folded.faces_center = ear.graph.makeFacesCenterQuick(folded);

	// only valley/mountains are 11, 12, 13, 14, all are tacos (same sign)
	const edgesFacesSide = ear.layer.makeEdgesFacesSide(folded);
	expect(edgesFacesSide).toMatchObject([
		[1],
		[1],
		[-1],
		[1],
		[-1],
		[1],
		[1],
		[-1],
		[1],
		[-1],
		[1],
		[1, 1],
		[-1, -1],
		[1, 1],
		[-1, -1],
		[1],
	]);

	const edgePairs = ear.graph
		.connectedComponentsPairs(ear.graph.getEdgesEdgesCollinearOverlap(folded))
		.filter((pair) => pair.every((edge) => folded.edges_faces[edge].length === 2));
	expect(edgePairs).toMatchObject([
		[11, 13],
		[12, 14],
	]);

	// const tacos_faces = edgePairs.map(pair => pair.map(edge => folded.edges_faces[edge]));
	const tacosFacesSide = ear.layer.makeEdgePairsFacesSide(folded, edgePairs);
	expect(tacosFacesSide).toMatchObject([
		[
			[1, 1],
			[1, 1],
		],
		[
			[-1, -1],
			[-1, -1],
		],
	]);
});

test("facesSide panel 4x2", () => {
	const foldfile = fs.readFileSync("./tests/files/fold/panels-4x2.fold", "utf-8");
	const fold = JSON.parse(foldfile);
	const folded = ear.graph.getFramesByClassName(fold, "foldedForm")[0];
	ear.graph.populate(folded);
	folded.faces_center = ear.graph.makeFacesCenterQuick(folded);

	const edgesFacesSide2D = ear.layer.makeEdgesFacesSide(folded);
	const edgesFacesSide3D = ear.layer.makeEdgesFacesSide3D(folded, {
		...ear.graph.getEdgesLine(folded),
		...ear.graph.getFacesPlane(folded),
	});

	expect(folded.edges_assignment).toMatchObject([
		"B",
		"B",
		"B",
		"B",
		"B",
		"B",
		"V",
		"V",
		"F",
		"F",
		"F",
		"F",
		"V",
		"V",
		"M",
		"M",
		"B",
		"B",
		"B",
		"B",
		"B",
		"B",
	]);
	expect(edgesFacesSide2D).toMatchObject([
		// 6 boundary
		[-1],
		[1],
		[-1],
		[1],
		[-1],
		[-1],
		// 2 valley
		[-1, -1],
		[-1, -1],
		// 4 flat
		[1, -1],
		[-1, 1],
		[1, -1],
		[-1, 1],
		// 2 valley 2 mountain
		[1, 1],
		[1, 1],
		[-1, -1],
		[-1, -1],
		// 5 boundary
		[1],
		[1],
		[1],
		[-1],
		[1],
		[-1],
	]);

	expect(edgesFacesSide3D).toMatchObject([
		// 6 boundary
		[-1],
		[-1],
		[-1],
		[-1],
		[-1],
		[-1],
		// 2 valley
		[-1, -1],
		[-1, -1],
		// 4 flat
		[1, -1],
		[1, -1],
		[1, -1],
		[1, -1],
		// 2 valley 2 mountain
		[-1, -1],
		[-1, -1],
		[-1, -1],
		[-1, -1],
		// 5 boundary
		[1],
		[1],
		[1],
		[1],
		[1],
		[1],
	]);

	const edgePairs = ear.graph
		.connectedComponentsPairs(ear.graph.getEdgesEdgesCollinearOverlap(folded))
		.filter((pair) => pair.every((edge) => folded.edges_faces[edge].length === 2));

	const tacos_faces = edgePairs.map((pair) =>
		pair.map((edge) => folded.edges_faces[edge]),
	);
	const tacosFacesSide = ear.layer.makeEdgePairsFacesSide(folded, edgePairs, tacos_faces);
	expect(tacosFacesSide).toMatchObject([
		[
			[-1, -1],
			[-1, -1],
		],
		[
			[-1, -1],
			[-1, -1],
		],
		[
			[1, -1],
			[1, -1],
		],
		[
			[1, -1],
			[1, -1],
		],
		[
			[1, -1],
			[1, -1],
		],
		[
			[-1, 1],
			[-1, 1],
		],
		[
			[-1, 1],
			[-1, 1],
		],
		[
			[1, -1],
			[1, -1],
		],
	]);
});

test("makeEdgesFacesSide3D, layer 3D cases", () => {
	const foldfile = fs.readFileSync(
		"./tests/files/fold/layers-3d-edge-edge.fold",
		"utf-8",
	);
	const fold = JSON.parse(foldfile);
	const frames = ear.graph.getFileFramesAsArray(fold);
	const foldedForms = frames.map((frame) => ({
		...frame,
		vertices_coords: ear.graph.makeVerticesCoordsFolded(frame),
	}));
	foldedForms.forEach((folded) => ear.graph.populate(folded));

	const folded = foldedForms[1];

	// const ignore = ear.layer.constraints3DFaceClusters(folded);
	const edges_facesSides = ear.layer.makeEdgesFacesSide3D(folded, {
		...ear.graph.getEdgesLine(folded),
		...ear.graph.getFacesPlane(folded),
	});

	expect(edges_facesSides).toMatchObject([
		[-1],
		[-1],
		[-1],
		[-1],
		[-1],
		[-1],
		[-1],
		[-1],
		[1],
		[1],
		[1],
		[1],
		[-1],
		[1, -1],
		[1, -1],
		[1, 1],
		[-1, 1],
		[-1, -1],
		[-1],
	]);
});
