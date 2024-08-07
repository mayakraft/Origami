import { expect, test } from "vitest";
import fs from "fs";
import ear from "../src/index.js";

const FOLD_ANGLE = 90;

// test("foldGraph, flip over origami", () => {
// 	const FOLD = fs.readFileSync("./tests/files/fold/crane.fold", "utf-8");
// 	const fold = JSON.parse(FOLD);
// 	const graph = ear.graph.getFramesByClassName(fold, "creasePattern")[0];
// 	const { vertices_coords } = ear.graph.getFramesByClassName(fold, "foldedForm")[0];

// 	// a line that runs the entire length of the folded form. diagonally
// 	// along one of the collinear edges along one of the flaps,
// 	// through the other flap
// 	const line = { vector: [0, 1], origin: [2, 0] };
// 	const result = ear.graph.simpleFoldLine(
// 		graph,
// 		line,
// 		"V",
// 		undefined,
// 		vertices_coords,
// 	);

// 	// const result = {
// 	// 	...graph,
// 	// 	// vertices_coords: ear.graph.makeVerticesCoordsFlatFolded(),
// 	// };

// 	fs.writeFileSync(
// 		"./tests/tmp/foldLine-flip-over-before.fold",
// 		JSON.stringify(graph),
// 		"utf8",
// 	);
// 	fs.writeFileSync(
// 		"./tests/tmp/foldLine-flip-over-after.fold",
// 		JSON.stringify(folded),
// 		"utf8",
// 	);
// });

test("foldGraph, segment, along a collinear edge", () => {
	const graph = ear.graph.squareFish();
	const vertices_coordsFolded = ear.graph.makeVerticesCoordsFlatFolded(graph);

	const flatEdgeCount = graph.edges_assignment.filter(
		(a) => a === "F" || a === "f",
	).length;

	// a line that runs the entire length of the folded form. diagonally
	// along one of the collinear edges along one of the flaps,
	// through the other flap
	const line = {
		vector: [-0.24264068711928527, 0.5857864376269053],
		origin: [0.7071067811865475, -0.2928932188134526],
	};
	const points = [
		[0.7071067811865475, -0.2928932188134526],
		[0.4644660940672622, 0.2928932188134527],
	];
	const result = ear.graph.foldGraph(graph, line, ear.math.includeS, {
		points,
		assignment: "V",
		vertices_coordsFolded,
	});

	const newFlatEdgeCount = graph.edges_assignment.filter(
		(a) => a === "F" || a === "f",
	).length;

	// one flat edge has been crossed collinearly and has been converted,
	// also, one flat edge was crossed and has been split into two,
	// thus the total number of flat assignments remains the same.
	expect(newFlatEdgeCount).toBe(flatEdgeCount);

	const folded = {
		...graph,
		vertices_coords: ear.graph.makeVerticesCoordsFlatFolded(graph),
	};

	fs.writeFileSync(
		"./tests/tmp/foldGraph-collinear-flat-segment-cp.fold",
		JSON.stringify(graph),
		"utf8",
	);
	fs.writeFileSync(
		"./tests/tmp/foldGraph-collinear-flat-segment-folded.fold",
		JSON.stringify(folded),
		"utf8",
	);
});

test("foldGraph, sparse graph", () => {
	const FOLD = fs.readFileSync("tests/files/fold/crane-cp.fold", "utf-8");
	const graph = JSON.parse(FOLD);
	const vertices_coordsFolded = ear.graph.makeVerticesCoordsFlatFolded(graph);
	const result = ear.graph.foldGraph(
		graph,
		{ vector: [0, 1], origin: [0.75, 0.5] },
		ear.math.includeL,
		{ assignment: "V", vertices_coordsFolded },
	);
	// console.log("result", result);
	fs.writeFileSync(
		"./tests/tmp/foldGraph-crane-line.fold",
		JSON.stringify(graph),
		"utf8",
	);
});

test("foldGraph, sparse graph, segment", () => {
	const FOLD = fs.readFileSync("tests/files/fold/crane-cp.fold", "utf-8");
	const graph = JSON.parse(FOLD);
	const vertices_coordsFolded = ear.graph.makeVerticesCoordsFlatFolded(graph);
	const result = ear.graph.foldGraph(
		graph,
		{ vector: [0, 1], origin: [0.75, 0.45] },
		ear.math.includeS,
		{
			points: [
				[0.75, 0.45],
				[0.75, 1.45],
			],
			assignment: "V",
			vertices_coordsFolded,
		},
	);
	// console.log("result", result);
	fs.writeFileSync(
		"./tests/tmp/foldGraph-crane-segment.fold",
		JSON.stringify(graph),
		"utf8",
	);
});

test("foldGraph, populated graph", () => {
	const FOLD = fs.readFileSync("tests/files/fold/crane-cp.fold", "utf-8");
	const graph = ear.graph.populate(JSON.parse(FOLD));
	// graph.faceOrders = ear.layer(graph).faceOrders();
	const vertices_coordsFolded = ear.graph.makeVerticesCoordsFlatFolded(graph);
	const result = ear.graph.foldGraph(
		graph,
		{ vector: [0, 1], origin: [0.75, 0.5] },
		ear.math.includeL,
		{ assignment: "V", vertices_coordsFolded },
	);
	// console.log("result", result);
	fs.writeFileSync(
		"./tests/tmp/foldGraph-populated-crane-line.fold",
		JSON.stringify(graph),
		"utf8",
	);
});

test("foldGraph, populated graph, segment", () => {
	const FOLD = fs.readFileSync("tests/files/fold/crane-cp.fold", "utf-8");
	const graph = ear.graph.populate(JSON.parse(FOLD));
	const vertices_coordsFolded = ear.graph.makeVerticesCoordsFlatFolded(graph);

	const result = ear.graph.foldGraph(
		graph,
		{ vector: [0, 1], origin: [0.75, 0.45] },
		ear.math.includeS,
		{
			points: [
				[0.75, 0.45],
				[0.75, 1.45],
			],
			assignment: "V",
			vertices_coordsFolded,
		},
	);
	// console.log("result", result);
	fs.writeFileSync(
		"./tests/tmp/foldGraph-populated-crane-segment.fold",
		JSON.stringify(graph),
		"utf8",
	);
});

test("foldGraph, crane", () => {
	const foldfile = fs.readFileSync("./tests/files/fold/crane.fold", "utf-8");
	const fold = JSON.parse(foldfile);
	const graph = ear.graph.getFramesByClassName(fold, "creasePattern")[0];
	graph.faceOrders = ear
		.layer({
			...graph,
			vertices_coords: ear.graph.makeVerticesCoordsFlatFolded(graph),
		})
		.faceOrders();

	const result = ear.graph.foldGraph(graph, { vector: [1, -1], origin: [0.45, 0.45] });

	const folded = {
		...graph,
		vertices_coords: ear.graph.makeVerticesCoordsFlatFolded(graph),
	};

	expect(result.edges.new).toMatchObject([
		146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162,
		163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174,
	]);

	expect(result.faces.map).toMatchObject([
		[30, 31],
		[0],
		[32, 33],
		[34, 35],
		[36, 37],
		[38, 39],
		[1],
		[2],
		[40, 41],
		[42, 43],
		[44, 45],
		[46, 47],
		[48, 49],
		[50, 51],
		[52, 53],
		[54, 55],
		[56, 57],
		[58, 59],
		[60, 61],
		[62, 63],
		[64, 65],
		[66, 67],
		[68, 69],
		[70, 71],
		[3],
		[72, 73],
		[74, 75],
		[76, 77],
		[78, 79],
		[80, 81],
		[82, 83],
		[4],
		[5],
		[6],
		[7],
		[84, 85],
		[86, 87],
		[8],
		[9],
		[10],
		[11],
		[12],
		[13],
		[14],
		[15],
		[16],
		[17],
		[18],
		[19],
		[20],
		[21],
		[22],
		[23],
		[24],
		[25],
		[26],
		[27],
		[28],
		[29],
	]);

	expect(ear.graph.countVertices(folded)).toBe(88);
	expect(ear.graph.countEdges(folded)).toBe(175);
	expect(ear.graph.countFaces(folded)).toBe(88);

	fs.writeFileSync("./tests/tmp/foldGraph-crane-cp.fold", JSON.stringify(graph));
	fs.writeFileSync("./tests/tmp/foldGraph-crane-folded.fold", JSON.stringify(folded));
});

test("foldGraph through vertex, crane", () => {
	const foldfile = fs.readFileSync("./tests/files/fold/crane.fold", "utf-8");
	const fold = JSON.parse(foldfile);
	const graph = ear.graph.getFramesByClassName(fold, "creasePattern")[0];
	graph.faceOrders = ear
		.layer({
			...graph,
			vertices_coords: ear.graph.makeVerticesCoordsFlatFolded(graph),
		})
		.faceOrders();

	ear.graph.foldGraph(
		graph,
		{ vector: [0, 1], origin: [0.6464466094063558, 0.6464466094063558] },
		ear.math.includeL,
		{ assignment: "V" },
	);

	const folded = {
		...graph,
		vertices_coords: ear.graph.makeVerticesCoordsFlatFolded(graph),
	};

	fs.writeFileSync(
		"./tests/tmp/foldGraph-through-vertex-crane-cp.fold",
		JSON.stringify(graph),
	);
	fs.writeFileSync(
		"./tests/tmp/foldGraph-through-vertex-crane-folded.fold",
		JSON.stringify(folded),
	);
});

test("foldGraph 3D folded through vertex, crane", () => {
	const foldfile = fs.readFileSync("./tests/files/fold/crane.fold", "utf-8");
	const fold = JSON.parse(foldfile);
	const graph = ear.graph.getFramesByClassName(fold, "creasePattern")[0];
	graph.faceOrders = ear
		.layer({
			...graph,
			vertices_coords: ear.graph.makeVerticesCoordsFlatFolded(graph),
		})
		.faceOrders();

	ear.graph.foldGraph(
		graph,
		{ vector: [0, 1], origin: [0.6464466094063558, 0.6464466094063558] },
		ear.math.includeL,
		{ assignment: "V", foldAngle: FOLD_ANGLE },
	);

	const folded = {
		...graph,
		vertices_coords: ear.graph.makeVerticesCoordsFolded(graph), // not flat
	};

	const { faces_plane } = ear.graph.getFacesPlane(folded);
	const badFaceOrders = graph.faceOrders.filter(
		([a, b]) => faces_plane[a] !== faces_plane[b],
	);
	expect(badFaceOrders).toHaveLength(0);

	fs.writeFileSync(
		"./tests/tmp/foldGraph-3D-through-vertex-crane-cp.fold",
		JSON.stringify(graph),
	);
	fs.writeFileSync(
		"./tests/tmp/foldGraph-3D-through-vertex-crane-folded.fold",
		JSON.stringify(folded),
	);
});

test("foldGraph 3D folded edge collinear, crane", () => {
	const foldfile = fs.readFileSync("./tests/files/fold/crane.fold", "utf-8");
	const fold = JSON.parse(foldfile);
	const crane = ear.graph.getFramesByClassName(fold, "creasePattern")[0];
	crane.faceOrders = ear
		.layer({
			...crane,
			vertices_coords: ear.graph.makeVerticesCoordsFlatFolded(crane),
		})
		.faceOrders(1);

	[
		{ vector: [-1, 1], origin: [0.6464466094063558, 0.6464466094063558] },
		{
			vector: [
				0.7419209286103429 - 0.6464466094063558,
				0.9510254852310431 - 0.6464466094063558,
			],
			origin: [0.6464466094063558, 0.6464466094063558],
		},
		{ vector: [-1, 1], origin: [0.7099378782951967, 0.7099378782951967] },
		{ vector: [0, 1], origin: [0.6755766511796801, 0.6755766511796801] },
	].forEach((line, i) => {
		const graph = structuredClone(crane);
		ear.graph.foldGraph(graph, line, ear.math.includeL, {
			assignment: "V",
			foldAngle: FOLD_ANGLE,
		});
		const folded = {
			...graph,
			vertices_coords: ear.graph.makeVerticesCoordsFolded(graph), // not flat
			frame_classes: ["foldedForm"],
		};

		const { faces_plane } = ear.graph.getFacesPlane(folded);
		const badFaceOrders = graph.faceOrders.filter(
			([a, b]) => faces_plane[a] !== faces_plane[b],
		);
		expect(badFaceOrders).toHaveLength(0);

		fs.writeFileSync(
			`./tests/tmp/foldGraph-3D-edge-collinear-crane-cp-${i}.fold`,
			JSON.stringify(graph),
		);
		fs.writeFileSync(
			`./tests/tmp/foldGraph-3D-edge-collinear-crane-folded-${i}.fold`,
			JSON.stringify(folded),
		);
	});
});
