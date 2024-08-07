import fs from "fs";
import { expect, test } from "vitest";
import ear from "../src/index.js";

const solveOverlapFacesWith3DEdge = (graph, epsilon) => {
	const { faces_plane, faces_winding, clusters_graph } =
		ear.layer.constraints3DFaceClusters(graph, epsilon);
	return ear.layer.solveOverlapFacesWith3DEdge(
		graph,
		ear.layer.getOverlapFacesWith3DEdge(graph, { clusters_graph, faces_plane }, epsilon),
		faces_winding,
	);
};

test("getOverlapFacesWith3DEdge, layers edge-face", () => {
	const foldfile = fs.readFileSync(
		"./tests/files/fold/layers-3d-edge-face.fold",
		"utf-8",
	);
	const fold = JSON.parse(foldfile);
	const frames = ear.graph.getFileFramesAsArray(fold);
	const foldedForms = frames.map((frame) => ({
		...frame,
		vertices_coords: ear.graph.makeVerticesCoordsFolded(frame),
	}));
	foldedForms.forEach((folded) => ear.graph.populate(folded));

	const graphsEdgeFace3DOverlaps = foldedForms.map((folded) =>
		ear.layer.getOverlapFacesWith3DEdge(
			folded,
			ear.layer.constraints3DFaceClusters(folded),
		),
	);

	const orders = foldedForms.map((folded) => solveOverlapFacesWith3DEdge(folded));

	expect(graphsEdgeFace3DOverlaps).toMatchObject([
		[{ edge: 6, tortilla: 1, coplanar: 3, angled: 2 }],
		[{ edge: 6, tortilla: 1, coplanar: 3, angled: 2 }],
		[],
		[{ edge: 11, tortilla: 0, coplanar: 3, angled: 2 }],
		[{ edge: 11, tortilla: 0, coplanar: 3, angled: 2 }],
		[{ edge: 11, tortilla: 0, coplanar: 3, angled: 2 }],
	]);

	expect(orders).toMatchObject([
		{ "1 3": 2 },
		{ "1 3": 2 },
		{},
		// in each of these next cases, face 0 is below face 3, locally,
		// and because the plane normal is [0, 0, 1], globally as well.
		{ "0 3": 2 },
		{ "0 3": 2 },
		{ "0 3": 2 },
	]);
});

test("getOverlapFacesWith3DEdge, layers edge-edge", () => {
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

	const graphsEdgeFace3DOverlaps = foldedForms.map((folded) =>
		ear.layer.getOverlapFacesWith3DEdge(
			folded,
			ear.layer.constraints3DFaceClusters(folded),
		),
	);

	// all frames overlap edges at edges, none will have a result
	expect(graphsEdgeFace3DOverlaps).toMatchObject([
		[],
		[],
		[],
		[],
		[],
		[],
		[],
		[],
		[],
		[],
		[],
	]);
});

test("getOverlapFacesWith3DEdge, cube-octagon", () => {
	const foldfile = fs.readFileSync("./tests/files/fold/cube-octagon.fold", "utf-8");
	const fold = JSON.parse(foldfile);
	// the second folded frame is the one without the flat assignments
	const folded = ear.graph.getFramesByClassName(fold, "foldedForm")[1];
	ear.graph.populate(folded);

	const {
		planes,
		// planes_faces,
		// planes_transform,
		// planes_clusters,
		faces_winding,
		faces_plane,
		// faces_cluster,
		// clusters_plane,
		// clusters_faces,
	} = ear.graph.getCoplanarAdjacentOverlappingFaces(folded);

	const edgeFace3DOverlaps = ear.layer.getOverlapFacesWith3DEdge(
		folded,
		ear.layer.constraints3DFaceClusters(folded),
	);
	const orders = solveOverlapFacesWith3DEdge(folded);

	expect(edgeFace3DOverlaps).toHaveLength(20);
	expect(Object.keys(orders)).toHaveLength(20);

	// inside tortillas: 18, 23, 24, 26
	// these all have only one 3D tortilla constraint, with
	// 18: (19-23), 23: (34-26) ...
	// then four tortillas: 3, 11, 17, 28 all have four instances
	// three of which are bundled up in the corner, 3 non flat edges,
	// and the last is the big face from the neighboring counter-clockwise group
	// everything here checks out.
	expect(edgeFace3DOverlaps).toMatchObject([
		{ edge: 32, tortilla: 26, coplanar: 25, angled: 24 },
		{ edge: 42, tortilla: 18, coplanar: 19, angled: 23 },
		{ edge: 24, tortilla: 3, coplanar: 35, angled: 34 },
		{ edge: 25, tortilla: 3, coplanar: 36, angled: 7 },
		{ edge: 51, tortilla: 3, coplanar: 28, angled: 23 },
		{ edge: 52, tortilla: 3, coplanar: 6, angled: 5 },
		{ edge: 20, tortilla: 11, coplanar: 27, angled: 25 },
		{ edge: 21, tortilla: 11, coplanar: 2, angled: 0 },
		{ edge: 22, tortilla: 11, coplanar: 13, angled: 1 },
		{ edge: 23, tortilla: 11, coplanar: 3, angled: 26 },
		{ edge: 18, tortilla: 17, coplanar: 30, angled: 9 },
		{ edge: 19, tortilla: 17, coplanar: 11, angled: 24 },
		{ edge: 53, tortilla: 17, coplanar: 10, angled: 8 },
		{ edge: 54, tortilla: 17, coplanar: 32, angled: 33 },
		{ edge: 49, tortilla: 28, coplanar: 16, angled: 14 },
		{ edge: 50, tortilla: 28, coplanar: 20, angled: 19 },
		{ edge: 55, tortilla: 28, coplanar: 17, angled: 18 },
		{ edge: 56, tortilla: 28, coplanar: 21, angled: 15 },
		{ edge: 30, tortilla: 24, coplanar: 33, angled: 18 },
		{ edge: 44, tortilla: 23, coplanar: 34, angled: 26 },
	]);

	expect(planes).toMatchObject([
		{ normal: [0, 1, 0], origin: [0, 2, 0] },
		{ normal: [0, 1, 0], origin: [0, 3, 0] },
		{ normal: [0, 0, -1], origin: [0, 0, -0] },
		{ normal: [0, 0, -1], origin: [0, 0, -1] },
		{ normal: [1, 0, 0], origin: [2, 0, 0] },
		{ normal: [1, 0, 0], origin: [3, 0, 0] },
	]);

	expect(faces_plane[3]).toBe(3);
	expect(faces_plane[11]).toBe(3);
	expect(faces_plane[17]).toBe(3);
	expect(faces_plane[28]).toBe(3);

	// to ensure that the orders (1, 2) are correct.
	expect(faces_winding[3]).toBe(false);
	expect(faces_winding[11]).toBe(false);
	expect(faces_winding[17]).toBe(false);
	expect(faces_winding[28]).toBe(false);

	expect(orders).toMatchObject({
		// the four inner most layer orders
		"25 26": 1,
		"18 19": 1,
		"24 33": 2,
		"23 34": 1,

		// the four tortillas (3, 11, 17, 28) paired with themselves
		// apparently, 3 appears to be below 28 and both have "true" winding
		// however, the plane's normal is [0, 0, -1], all data is flipped, so,
		// in reality, 3 is above 28, and both have "false" winding
		"3 28": 1, // 3 is above 28, even though from above, 3 appears to be below 28
		"17 28": 2, // 17 is below 28
		"11 17": 2, // 11 is below 17
		"3 11": 2, // 3 is below 11

		// tortilla 3
		"3 35": 1,
		"3 36": 1,
		"3 6": 1,

		// tortilla 11
		"11 27": 1,
		"2 11": 2,
		"11 13": 1,

		// tortilla 17
		"17 30": 1,
		"10 17": 2,
		"17 32": 1,

		// tortilla 28
		"16 28": 2,
		"20 28": 2,
		"21 28": 2,
	});
});

test("getOverlapFacesWith3DEdge, maze-u", () => {
	const foldfile = fs.readFileSync("./tests/files/fold/maze-u.fold", "utf-8");
	const fold = JSON.parse(foldfile);
	const folded = ear.graph.getFramesByClassName(fold, "foldedForm")[0];
	ear.graph.populate(folded);

	const edgeFace3DOverlaps = ear.layer.getOverlapFacesWith3DEdge(
		folded,
		ear.layer.constraints3DFaceClusters(folded),
	);

	const orders = solveOverlapFacesWith3DEdge(folded);

	expect(edgeFace3DOverlaps).toHaveLength(64);
	expect(Object.keys(orders)).toHaveLength(60);
	expect(edgeFace3DOverlaps).toMatchObject([
		{ edge: 39, tortilla: 17, coplanar: 6, angled: 10 }, // dup A
		{ edge: 58, tortilla: 17, coplanar: 4, angled: 31 },
		{ edge: 59, tortilla: 17, coplanar: 5, angled: 12 },
		{ edge: 60, tortilla: 17, coplanar: 11, angled: 13 },
		{ edge: 61, tortilla: 17, coplanar: 16, angled: 14 },
		{ edge: 62, tortilla: 17, coplanar: 18, angled: 15 },
		{ edge: 67, tortilla: 17, coplanar: 18, angled: 21 },
		{ edge: 68, tortilla: 17, coplanar: 22, angled: 23 },
		{ edge: 69, tortilla: 17, coplanar: 26, angled: 28 },
		{ edge: 70, tortilla: 17, coplanar: 30, angled: 29 },
		{ edge: 71, tortilla: 17, coplanar: 35, angled: 33 },
		{ edge: 72, tortilla: 17, coplanar: 6, angled: 7 }, // dup A
		{ edge: 91, tortilla: 42, coplanar: 40, angled: 47 },
		{ edge: 92, tortilla: 42, coplanar: 39, angled: 46 },
		{ edge: 93, tortilla: 42, coplanar: 48, angled: 49 },
		{ edge: 94, tortilla: 42, coplanar: 4, angled: 31 },
		{ edge: 108, tortilla: 42, coplanar: 57, angled: 60 },
		{ edge: 109, tortilla: 42, coplanar: 58, angled: 61 },
		{ edge: 110, tortilla: 42, coplanar: 62, angled: 50 },
		{ edge: 111, tortilla: 42, coplanar: 6, angled: 7 },
		{ edge: 123, tortilla: 42, coplanar: 43, angled: 44 },
		{ edge: 124, tortilla: 42, coplanar: 41, angled: 45 },
		{ edge: 91, tortilla: 51, coplanar: 40, angled: 47 },
		{ edge: 92, tortilla: 51, coplanar: 39, angled: 46 },
		{ edge: 93, tortilla: 51, coplanar: 48, angled: 49 },
		{ edge: 94, tortilla: 51, coplanar: 4, angled: 31 },
		{ edge: 108, tortilla: 51, coplanar: 57, angled: 60 },
		{ edge: 109, tortilla: 51, coplanar: 58, angled: 61 },
		{ edge: 110, tortilla: 51, coplanar: 62, angled: 50 },
		{ edge: 111, tortilla: 51, coplanar: 6, angled: 7 },
		{ edge: 123, tortilla: 51, coplanar: 43, angled: 44 },
		{ edge: 124, tortilla: 51, coplanar: 41, angled: 45 },
		{ edge: 134, tortilla: 74, coplanar: 6, angled: 64 }, // dup B
		{ edge: 153, tortilla: 74, coplanar: 35, angled: 33 },
		{ edge: 154, tortilla: 74, coplanar: 63, angled: 69 },
		{ edge: 155, tortilla: 74, coplanar: 67, angled: 70 },
		{ edge: 156, tortilla: 74, coplanar: 73, angled: 71 },
		{ edge: 157, tortilla: 74, coplanar: 72, angled: 68 },
		{ edge: 162, tortilla: 74, coplanar: 72, angled: 78 },
		{ edge: 163, tortilla: 74, coplanar: 79, angled: 77 },
		{ edge: 164, tortilla: 74, coplanar: 82, angled: 85 },
		{ edge: 165, tortilla: 74, coplanar: 86, angled: 84 },
		{ edge: 166, tortilla: 74, coplanar: 90, angled: 87 },
		{ edge: 167, tortilla: 74, coplanar: 6, angled: 10 }, // dup B
		{ edge: 186, tortilla: 93, coplanar: 59, angled: 98 },
		{ edge: 187, tortilla: 93, coplanar: 58, angled: 97 },
		{ edge: 188, tortilla: 93, coplanar: 62, angled: 99 },
		{ edge: 189, tortilla: 93, coplanar: 6, angled: 64 },
		{ edge: 203, tortilla: 93, coplanar: 105, angled: 107 },
		{ edge: 204, tortilla: 93, coplanar: 106, angled: 108 },
		{ edge: 205, tortilla: 93, coplanar: 109, angled: 100 },
		{ edge: 206, tortilla: 93, coplanar: 90, angled: 87 },
		{ edge: 218, tortilla: 93, coplanar: 94, angled: 95 },
		{ edge: 219, tortilla: 93, coplanar: 92, angled: 96 },
		{ edge: 186, tortilla: 101, coplanar: 59, angled: 98 },
		{ edge: 187, tortilla: 101, coplanar: 58, angled: 97 },
		{ edge: 188, tortilla: 101, coplanar: 62, angled: 99 },
		{ edge: 189, tortilla: 101, coplanar: 6, angled: 64 },
		{ edge: 203, tortilla: 101, coplanar: 105, angled: 107 },
		{ edge: 204, tortilla: 101, coplanar: 106, angled: 108 },
		{ edge: 205, tortilla: 101, coplanar: 109, angled: 100 },
		{ edge: 206, tortilla: 101, coplanar: 90, angled: 87 },
		{ edge: 218, tortilla: 101, coplanar: 94, angled: 95 },
		{ edge: 219, tortilla: 101, coplanar: 92, angled: 96 },
	]);
	expect(orders).toMatchObject({
		"6 17": 1,
		"4 17": 1,
		"5 17": 1,
		"11 17": 1,
		"16 17": 1,
		"17 18": 2,
		"17 22": 2,
		"17 26": 2,
		"17 30": 2,
		"17 35": 2,
		"40 42": 1,
		"39 42": 1,
		"42 48": 2,
		"4 42": 1,
		"42 57": 2,
		"42 58": 2,
		"42 62": 2,
		"6 42": 1,
		"42 43": 2,
		"41 42": 1,
		"40 51": 1,
		"39 51": 1,
		"48 51": 1,
		"4 51": 1,
		"51 57": 2,
		"51 58": 2,
		"51 62": 2,
		"6 51": 1,
		"43 51": 1,
		"41 51": 1,
		"6 74": 1,
		"35 74": 1,
		"63 74": 1,
		"67 74": 1,
		"73 74": 1,
		"72 74": 1,
		"74 79": 2,
		"74 82": 2,
		"74 86": 2,
		"74 90": 2,
		"59 93": 1,
		"58 93": 1,
		"62 93": 1,
		"6 93": 1,
		"93 105": 2,
		"93 106": 2,
		"93 109": 2,
		"90 93": 1,
		"93 94": 2,
		"92 93": 1,
		"59 101": 1,
		"58 101": 1,
		"62 101": 1,
		"6 101": 1,
		"101 105": 2,
		"101 106": 2,
		"101 109": 2,
		"90 101": 1,
		"94 101": 1,
		"92 101": 1,
	});
});

test("getOverlapFacesWith3DEdge, Mooser's train", () => {
	const FOLD = fs.readFileSync("./tests/files/fold/moosers-train.fold", "utf-8");
	const folded = JSON.parse(FOLD);
	ear.graph.populate(folded);

	const epsilon = 1e-3;

	const facesEdges3D = ear.layer.getOverlapFacesWith3DEdge(
		folded,
		ear.layer.constraints3DFaceClusters(folded, epsilon),
		epsilon,
	);
	const orders = solveOverlapFacesWith3DEdge(folded, epsilon);

	expect(facesEdges3D).toHaveLength(677);
	expect(Object.keys(orders)).toHaveLength(665);
});
