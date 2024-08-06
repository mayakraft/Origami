import fs from "fs";
import { expect, test } from "vitest";
import ear from "../src/index.js";

// call ear.layer.getSolvable3DEdgePairs. prepare all necessary data to do so
const getSolvable3DEdgePairs = (graph) => {
	const { faces_plane, facesFacesOverlap } = ear.layer.constraints3DFaceClusters(graph);

	const edges_vertices2 = graph.edges_vertices.slice();
	graph.edges_faces
		.map((_, e) => e)
		.filter((e) => graph.edges_faces[e].length !== 2)
		.forEach((e) => delete edges_vertices2[e]);

	const edgesEdgesOverlap = ear.graph.getEdgesEdgesCollinearOverlap({
		vertices_coords: graph.vertices_coords,
		edges_vertices: edges_vertices2,
	});
	const edgePairs = ear.graph.connectedComponentsPairs(edgesEdgesOverlap);
	const facesFacesLookup = ear.general.arrayArrayToLookupArray(facesFacesOverlap);

	const {
		tJunctions,
		yJunctions,
		bentFlatTortillas,
		bentTortillas,
		bentTortillasFlatTaco,
	} = ear.layer.getSolvable3DEdgePairs({
		edges_faces: graph.edges_faces,
		faces_plane,
		edgePairs,
		facesFacesLookup,
	});

	return {
		tJunctions: tJunctions.map((i) => edgePairs[i]),
		yJunctions: yJunctions.map((i) => edgePairs[i]),
		bentFlatTortillas: bentFlatTortillas.map((i) => edgePairs[i]),
		bentTortillas: bentTortillas.map((i) => edgePairs[i]),
		bentTortillasFlatTaco: bentTortillasFlatTaco.map((i) => edgePairs[i]),
	};
};

// call ear.layer.constraints3DEdges. prepare all necessary data to do so
const constraints3DEdges = (graph) => {
	try {
		const faceClusters = ear.layer.constraints3DFaceClusters(graph);
		return {
			...faceClusters,
			...ear.layer.constraints3DEdges(graph, {
				...faceClusters,
				edgesEdgesOverlap: ear.graph.getEdgesEdgesCollinearOverlap(graph),
			}),
		};
	} catch (error) {
		return "error";
	}
};

test("getSolvable3DEdgePairs, layer 3D special cases", () => {
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
	const results = foldedForms.map(getSolvable3DEdgePairs);

	expect(results[0]).toMatchObject({
		tJunctions: [],
		yJunctions: [],
		bentFlatTortillas: [[11, 14]],
		bentTortillas: [],
		bentTortillasFlatTaco: [],
	});

	expect(results[1]).toMatchObject({
		tJunctions: [[13, 17]],
		yJunctions: [],
		bentFlatTortillas: [],
		bentTortillas: [],
		bentTortillasFlatTaco: [],
	});

	expect(results[2]).toMatchObject({
		tJunctions: [],
		yJunctions: [[13, 17]],
		bentFlatTortillas: [],
		bentTortillas: [],
		bentTortillasFlatTaco: [],
	});

	expect(results[3]).toMatchObject({
		tJunctions: [],
		yJunctions: [],
		bentFlatTortillas: [],
		bentTortillas: [[13, 17]],
		bentTortillasFlatTaco: [],
	});

	expect(results[4]).toMatchObject({
		tJunctions: [],
		yJunctions: [],
		bentFlatTortillas: [],
		bentTortillas: [],
		bentTortillasFlatTaco: [[13, 17]],
	});

	expect(results[5]).toMatchObject({
		tJunctions: [[23, 32]],
		yJunctions: [],
		bentFlatTortillas: [[26, 29]],
		bentTortillas: [],
		bentTortillasFlatTaco: [],
	});

	expect(results[6]).toMatchObject({
		tJunctions: [],
		yJunctions: [[25, 35]],
		bentFlatTortillas: [],
		bentTortillas: [[27, 33]],
		bentTortillasFlatTaco: [],
	});

	expect(results[7]).toMatchObject({
		tJunctions: [],
		yJunctions: [],
		bentFlatTortillas: [
			[15, 20],
			[16, 19],
		],
		bentTortillas: [],
		bentTortillasFlatTaco: [],
	});

	expect(results[8]).toMatchObject({
		tJunctions: [],
		yJunctions: [],
		bentFlatTortillas: [],
		bentTortillas: [],
		bentTortillasFlatTaco: [],
	});

	expect(results[9]).toMatchObject({
		tJunctions: [[13, 17]],
		yJunctions: [],
		bentFlatTortillas: [],
		bentTortillas: [],
		bentTortillasFlatTaco: [],
	});

	expect(results[10]).toMatchObject({
		tJunctions: [],
		yJunctions: [[13, 17]],
		bentFlatTortillas: [],
		bentTortillas: [],
		bentTortillasFlatTaco: [],
	});
});

test("constraints3DEdges, layer 3D special cases", () => {
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

	const results = foldedForms.map(constraints3DEdges);

	// one flat tortilla-tortilla on top of a bent tortilla-tortilla
	// this solves faces 0-4
	expect(results[0]).toMatchObject({
		faces_winding: [true, true, true, true, false],
		facesFacesOverlap: [[4], [], [], [], [0]],
		facePairs: ["0 4"],
		orders: { "0 4": 2 }, // 1 or 2?
		tortilla_tortilla: [],
		taco_tortilla: [],
	});

	// a T-junction where the top T faces are coplanar
	// this solves faces 1-4
	expect(results[1]).toMatchObject({
		faces_winding: [true, true, true, false, false, true],
		facesFacesOverlap: [[], [4], [3], [2], [1], []],
		facePairs: ["1 4", "2 3"],
		orders: { "1 4": 2 },
		tortilla_tortilla: [],
		taco_tortilla: [],
	});

	// an Y-junction where the top two faces are not coplanar
	// this solves faces 1-4
	expect(results[2]).toMatchObject({
		faces_winding: [true, true, true, false, false, true],
		facesFacesOverlap: [[], [4], [3], [2], [1], []],
		facePairs: ["1 4", "2 3"],
		orders: { "1 4": 2 },
		tortilla_tortilla: [],
		taco_tortilla: [],
	});

	// a bent-tortilla-tortilla (next to a flat tortilla-tortilla)
	// no orders are solved, but bentTortillaTortillas condition is generated.
	expect(results[3]).toMatchObject({
		faces_winding: [true, true, true, false, false, false],
		facesFacesOverlap: [[5], [4], [3], [2], [1], [0]],
		facePairs: ["0 5", "1 4", "2 3"],
		orders: {},
		tortilla_tortilla: [[0, 1, 5, 4]],
		taco_tortilla: [],
	});

	expect(results[4]).toMatchObject({
		faces_winding: [true, false, false, true, true, true],
		facesFacesOverlap: [[4, 1], [0, 4], [3], [2], [0, 1], []],
		facePairs: ["0 4", "0 1", "1 4", "2 3"],
		orders: {},
		tortilla_tortilla: [],
		taco_tortilla: [[0, 4, 1]],
	});

	// contains two: an bent-tortilla-tortilla and a T-junction.
	expect(results[5]).toMatchObject({
		faces_winding: [true, true, true, true, true, true, true, false, false, false, true],
		facesFacesOverlap: [[], [9], [8], [7], [], [], [], [3], [2], [1], []],
		facePairs: ["1 9", "2 8", "3 7"],
		orders: { "1 9": 1, "3 7": 1 },
		tortilla_tortilla: [],
		taco_tortilla: [],
	});

	// contains two: a bent-flat-tortilla and an Y-junction
	expect(results[6]).toMatchObject({
		faces_winding: [
			true,
			true,
			true,
			true,
			true,
			false,
			true,
			false,
			false,
			false,
			false,
			true,
		],
		facesFacesOverlap: [
			[],
			[10],
			[9],
			[8],
			[7, 5, 6],
			[4, 7, 6],
			[4, 5, 7],
			[4, 5, 6],
			[3],
			[2],
			[1],
			[],
		],
		facePairs: ["1 10", "2 9", "3 8", "4 7", "4 5", "4 6", "5 7", "5 6", "6 7"],
		orders: { "1 10": 1 },
		tortilla_tortilla: [[2, 3, 9, 8]],
		taco_tortilla: [],
	});

	expect(results[7]).toMatchObject("error");

	// expect(results[8]).toMatchObject("error");
	expect(results[8]).toMatchObject({
		faces_winding: [true, true, true, true, true],
		facesFacesOverlap: [[], [], [], [], []],
		facePairs: [],
		orders: {},
		tortilla_tortilla: [],
		taco_tortilla: [],
	});

	// expect(results[9]).toMatchObject("error");
	expect(results[9]).toMatchObject({
		faces_winding: [true, true, true, false, false, true],
		facesFacesOverlap: [[], [4], [3], [2], [1], []],
		facePairs: ["1 4", "2 3"],
		orders: { "1 4": 1 },
		tortilla_tortilla: [],
		taco_tortilla: [],
	});

	// expect(results[10]).toMatchObject("error");
	expect(results[10]).toMatchObject({
		faces_winding: [true, true, true, false, false, true],
		facesFacesOverlap: [[], [4], [3], [2], [1], []],
		facePairs: ["1 4", "2 3"],
		orders: { "1 4": 1 },
		tortilla_tortilla: [],
		taco_tortilla: [],
	});
});

test("constraints3DEdges, maze-u", () => {
	const foldfile = fs.readFileSync("./tests/files/fold/maze-u.fold", "utf-8");
	const fold = JSON.parse(foldfile);
	const folded = ear.graph.getFramesByClassName(fold, "foldedForm")[0];
	ear.graph.populate(folded);

	const {
		// planes_transform,
		// faces_plane,
		// faces_cluster,
		// faces_winding,
		// faces_polygon,
		// faces_center,
		clusters_faces,
		clusters_graph,
		clusters_transform,
		// facesFacesOverlap,
		facePairs,
		orders,
		tortilla_tortilla,
		taco_tortilla,
	} = constraints3DEdges(folded);

	const {
		tJunctions,
		yJunctions,
		bentFlatTortillas,
		bentTortillas,
		bentTortillasFlatTaco,
	} = getSolvable3DEdgePairs(folded);

	expect(facePairs).toHaveLength(467);
	// expect(pairs_data).toHaveLength(152);
	expect(clusters_faces).toHaveLength(4);
	expect(clusters_graph).toHaveLength(4);
	expect(clusters_transform).toHaveLength(4);
	expect(yJunctions).toHaveLength(0);
	expect(tJunctions).toHaveLength(82);
	expect(bentFlatTortillas).toHaveLength(0);
	expect(bentTortillas).toHaveLength(70);
	expect(bentTortillasFlatTaco).toHaveLength(16);

	expect(yJunctions).toMatchObject([]);

	expect(tJunctions).toMatchObject([
		[39, 68],
		[39, 69],
		[39, 70],
		[39, 71],
		[58, 62],
		[58, 72],
		[59, 62],
		[59, 72],
		[60, 62],
		[60, 72],
		[61, 62],
		[61, 72],
		[67, 68],
		[67, 69],
		[67, 70],
		[67, 71],
		[91, 108],
		[91, 109],
		[91, 110],
		[91, 111],
		[91, 124],
		[92, 108],
		[92, 109],
		[92, 110],
		[92, 111],
		[92, 124],
		[93, 108],
		[93, 109],
		[93, 110],
		[93, 111],
		[93, 124],
		[94, 108],
		[94, 109],
		[94, 110],
		[94, 111],
		[94, 124],
		[108, 123],
		[109, 123],
		[110, 123],
		[111, 123],
		[123, 124],
		[134, 163],
		[134, 164],
		[134, 165],
		[134, 166],
		[153, 157],
		[153, 167],
		[154, 157],
		[154, 167],
		[155, 157],
		[155, 167],
		[156, 157],
		[156, 167],
		[162, 163],
		[162, 164],
		[162, 165],
		[162, 166],
		[186, 203],
		[186, 204],
		[186, 205],
		[186, 206],
		[186, 219],
		[187, 203],
		[187, 204],
		[187, 205],
		[187, 206],
		[187, 219],
		[188, 203],
		[188, 204],
		[188, 205],
		[188, 206],
		[188, 219],
		[189, 203],
		[189, 204],
		[189, 205],
		[189, 206],
		[189, 219],
		[203, 218],
		[204, 218],
		[205, 218],
		[206, 218],
		[218, 219],
	]);

	expect(bentTortillas).toMatchObject([
		[39, 67],
		[58, 59],
		[58, 60],
		[58, 61],
		[59, 60],
		[59, 61],
		[60, 61],
		[62, 72],
		[63, 73],
		[68, 69],
		[68, 70],
		[68, 71],
		[69, 70],
		[69, 71],
		[70, 71],
		[91, 92],
		[91, 93],
		[91, 94],
		[91, 123],
		[92, 93],
		[92, 94],
		[92, 123],
		[93, 94],
		[93, 123],
		[94, 123],
		[108, 109],
		[108, 110],
		[108, 111],
		[108, 124],
		[109, 110],
		[109, 111],
		[109, 124],
		[110, 111],
		[110, 124],
		[111, 124],
		[134, 162],
		[153, 154],
		[153, 155],
		[153, 156],
		[154, 155],
		[154, 156],
		[155, 156],
		[157, 167],
		[158, 168],
		[163, 164],
		[163, 165],
		[163, 166],
		[164, 165],
		[164, 166],
		[165, 166],
		[186, 187],
		[186, 188],
		[186, 189],
		[186, 218],
		[187, 188],
		[187, 189],
		[187, 218],
		[188, 189],
		[188, 218],
		[189, 218],
		[203, 204],
		[203, 205],
		[203, 206],
		[203, 219],
		[204, 205],
		[204, 206],
		[204, 219],
		[205, 206],
		[205, 219],
		[206, 219],
	]);

	expect(orders).toMatchObject({
		"10 23": 1,
		"10 28": 1,
		"10 29": 1,
		"10 33": 1,
		"15 31": 1,
		"7 31": 1,
		"12 15": 2,
		"7 12": 1,
		"13 15": 2,
		"7 13": 1,
		"14 15": 2,
		"7 14": 1,
		"21 23": 1,
		"21 28": 1,
		"21 29": 1,
		"21 33": 1,
		"47 60": 2,
		"47 61": 2,
		"47 50": 2,
		"7 47": 1,
		"45 47": 1,
		"46 60": 2,
		"46 61": 2,
		"46 50": 2,
		"7 46": 1,
		"45 46": 1,
		"49 60": 2,
		"49 61": 2,
		"49 50": 2,
		"7 49": 1,
		"45 49": 1,
		"31 60": 2,
		"31 61": 2,
		"31 50": 2,
		"31 45": 2,
		"44 60": 2,
		"44 61": 2,
		"44 50": 2,
		"7 44": 1,
		"44 45": 2,
		"64 77": 2,
		"64 85": 2,
		"64 84": 2,
		"64 87": 2,
		"33 68": 2,
		"68 69": 1,
		"10 69": 1,
		"68 70": 1,
		"10 70": 1,
		"68 71": 1,
		"10 71": 1,
		"77 78": 1,
		"78 85": 2,
		"78 84": 2,
		"78 87": 2,
		"98 107": 2,
		"98 108": 2,
		"98 100": 2,
		"87 98": 1,
		"96 98": 1,
		"97 107": 2,
		"97 108": 2,
		"97 100": 2,
		"87 97": 1,
		"96 97": 1,
		"99 107": 2,
		"99 108": 2,
		"99 100": 2,
		"87 99": 1,
		"96 99": 1,
		"64 107": 2,
		"64 108": 2,
		"64 100": 2,
		"64 96": 2,
		"95 107": 2,
		"95 108": 2,
		"95 100": 2,
		"87 95": 1,
		"95 96": 2,
	});

	expect(tortilla_tortilla).toMatchObject([
		[6, 10, 18, 21],
		[4, 12, 5, 31],
		[4, 13, 11, 31],
		[4, 14, 16, 31],
		[5, 13, 11, 12],
		[5, 14, 16, 12],
		[11, 14, 16, 13],
		[15, 18, 7, 6],
		[21, 32, 10, 9],
		[22, 28, 26, 23],
		[22, 29, 30, 23],
		[22, 33, 35, 23],
		[26, 29, 30, 28],
		[26, 33, 35, 28],
		[29, 35, 33, 30],
		[40, 46, 39, 47],
		[40, 49, 48, 47],
		[40, 31, 4, 47],
		[40, 44, 43, 47],
		[39, 49, 48, 46],
		[39, 31, 4, 46],
		[39, 44, 43, 46],
		[48, 31, 4, 49],
		[48, 44, 43, 49],
		[4, 44, 43, 31],
		[57, 60, 58, 61],
		[57, 60, 62, 50],
		[57, 60, 6, 7],
		[57, 60, 41, 45],
		[58, 61, 62, 50],
		[58, 61, 6, 7],
		[58, 61, 41, 45],
		[50, 62, 7, 6],
		[50, 62, 45, 41],
		[6, 7, 41, 45],
		[6, 78, 72, 64],
		[33, 63, 69, 35],
		[33, 67, 70, 35],
		[33, 73, 71, 35],
		[63, 70, 67, 69],
		[63, 71, 73, 69],
		[67, 71, 73, 70],
		[68, 72, 10, 6],
		[78, 66, 64, 88],
		[77, 79, 85, 82],
		[77, 79, 84, 86],
		[77, 79, 87, 90],
		[82, 85, 86, 84],
		[82, 85, 90, 87],
		[84, 86, 87, 90],
		[59, 97, 58, 98],
		[59, 99, 62, 98],
		[59, 64, 6, 98],
		[59, 95, 94, 98],
		[58, 99, 62, 97],
		[58, 64, 6, 97],
		[58, 95, 94, 97],
		[62, 64, 6, 99],
		[62, 95, 94, 99],
		[6, 95, 94, 64],
		[105, 107, 106, 108],
		[105, 107, 109, 100],
		[105, 107, 90, 87],
		[105, 107, 92, 96],
		[106, 108, 109, 100],
		[106, 108, 90, 87],
		[106, 108, 92, 96],
		[100, 109, 87, 90],
		[100, 109, 96, 92],
		[87, 90, 96, 92],
	]);

	expect(taco_tortilla).toMatchObject([
		[12, 32, 31],
		[12, 9, 31],
		[7, 32, 8],
		[7, 9, 8],
		[15, 32, 34],
		[29, 21, 33],
		[15, 9, 34],
		[29, 10, 33],
		[33, 88, 69],
		[33, 66, 69],
		[10, 88, 65],
		[10, 66, 65],
		[68, 88, 89],
		[84, 78, 87],
		[68, 66, 89],
		[84, 64, 87],
	]);
});

test("constraints3DEdges, Mooser's train, carriage only", () => {
	const FOLD = fs.readFileSync("./tests/files/fold/moosers-train-carriage.fold", "utf-8");
	const graph = JSON.parse(FOLD);
	const folded = {
		...graph,
		vertices_coords: ear.graph.makeVerticesCoordsFolded(graph),
	};
	ear.graph.populate(folded);

	// face cluster stuff is test in other files: graph.faces.planes
	const {
		// planes_transform,
		// faces_plane,
		// faces_cluster,
		// faces_winding,
		// faces_polygon,
		// faces_center,
		// clusters_faces,
		// clusters_graph,
		// clusters_transform,
		// facesFacesOverlap,
		facePairs,
		orders,
		tortilla_tortilla,
		taco_tortilla,
	} = constraints3DEdges(folded);

	const {
		tJunctions,
		yJunctions,
		bentFlatTortillas,
		bentTortillas,
		bentTortillasFlatTaco,
	} = getSolvable3DEdgePairs(folded);

	expect(facePairs).toHaveLength(440);
	expect(yJunctions).toHaveLength(0);
	expect(tJunctions).toHaveLength(40);
	expect(bentFlatTortillas).toHaveLength(0);
	expect(bentTortillas).toHaveLength(80);
	expect(bentTortillasFlatTaco).toHaveLength(68);
	expect(tortilla_tortilla).toHaveLength(80);
	expect(taco_tortilla).toHaveLength(68);
	expect(Object.keys(orders)).toHaveLength(40);

	expect(tJunctions).toMatchObject([
		[32, 35],
		[32, 36],
		[33, 35],
		[33, 36],
		[34, 35],
		[34, 36],
		[35, 37],
		[35, 38],
		[36, 37],
		[36, 38],
		[38, 40],
		[38, 41],
		[39, 40],
		[39, 41],
		[40, 42],
		[40, 43],
		[40, 44],
		[41, 42],
		[41, 43],
		[41, 44],
		[244, 247],
		[244, 248],
		[245, 247],
		[245, 248],
		[246, 247],
		[246, 248],
		[247, 249],
		[247, 250],
		[248, 249],
		[248, 250],
		[250, 252],
		[250, 253],
		[251, 252],
		[251, 253],
		[252, 254],
		[252, 255],
		[252, 256],
		[253, 254],
		[253, 255],
		[253, 256],
	]);

	expect(bentTortillas).toMatchObject([
		[32, 33],
		[32, 34],
		[32, 37],
		[32, 38],
		[33, 34],
		[33, 37],
		[33, 38],
		[34, 37],
		[34, 38],
		[35, 36],
		[37, 38],
		[38, 39],
		[38, 42],
		[38, 43],
		[38, 44],
		[39, 42],
		[39, 43],
		[39, 44],
		[40, 41],
		[42, 43],
		[42, 44],
		[43, 44],
		[49, 196],
		[51, 169],
		[52, 134],
		[54, 101],
		[55, 56],
		[57, 58],
		[57, 162],
		[58, 162],
		[60, 61],
		[60, 138],
		[61, 138],
		[62, 63],
		[79, 80],
		[79, 81],
		[80, 81],
		[81, 82],
		[81, 83],
		[82, 83],
		[102, 243],
		[135, 241],
		[140, 222],
		[140, 223],
		[164, 219],
		[164, 220],
		[170, 240],
		[197, 238],
		[202, 203],
		[202, 204],
		[203, 204],
		[204, 205],
		[204, 206],
		[205, 206],
		[217, 218],
		[219, 220],
		[222, 223],
		[224, 225],
		[244, 245],
		[244, 246],
		[244, 249],
		[244, 250],
		[245, 246],
		[245, 249],
		[245, 250],
		[246, 249],
		[246, 250],
		[247, 248],
		[249, 250],
		[250, 251],
		[250, 254],
		[250, 255],
		[250, 256],
		[251, 254],
		[251, 255],
		[251, 256],
		[252, 253],
		[254, 255],
		[254, 256],
		[255, 256],
	]);

	expect(bentTortillasFlatTaco).toMatchObject([
		[55, 59],
		[56, 59],
		[57, 118],
		[57, 161],
		[57, 183],
		[57, 207],
		[58, 118],
		[58, 161],
		[58, 183],
		[58, 207],
		[59, 62],
		[59, 63],
		[60, 84],
		[60, 115],
		[60, 120],
		[60, 137],
		[61, 84],
		[61, 115],
		[61, 120],
		[61, 137],
		[78, 140],
		[78, 222],
		[78, 223],
		[79, 189],
		[80, 189],
		[81, 121],
		[81, 189],
		[82, 121],
		[83, 121],
		[84, 138],
		[112, 140],
		[112, 222],
		[112, 223],
		[115, 138],
		[117, 204],
		[117, 205],
		[117, 206],
		[118, 162],
		[120, 138],
		[137, 138],
		[140, 141],
		[140, 188],
		[141, 222],
		[141, 223],
		[161, 162],
		[162, 183],
		[162, 207],
		[164, 165],
		[164, 180],
		[164, 186],
		[164, 201],
		[165, 219],
		[165, 220],
		[180, 219],
		[180, 220],
		[185, 202],
		[185, 203],
		[185, 204],
		[186, 219],
		[186, 220],
		[188, 222],
		[188, 223],
		[201, 219],
		[201, 220],
		[217, 221],
		[218, 221],
		[221, 224],
		[221, 225],
	]);

	expect(orders).toMatchObject({
		"16 19": 2,
		"16 20": 2,
		"17 19": 2,
		"17 20": 2,
		"18 19": 2,
		"18 20": 2,
		"19 21": 1,
		"19 22": 1,
		"20 21": 1,
		"20 22": 1,
		"22 24": 2,
		"22 25": 2,
		"23 24": 2,
		"23 25": 2,
		"24 26": 1,
		"24 27": 1,
		"24 28": 1,
		"25 26": 1,
		"25 27": 1,
		"25 28": 1,
		"0 123": 2,
		"0 128": 2,
		"91 123": 2,
		"91 128": 2,
		"102 123": 2,
		"102 128": 2,
		"123 136": 1,
		"123 139": 1,
		"128 136": 1,
		"128 139": 1,
		"112 139": 1,
		"101 139": 1,
		"112 114": 1,
		"101 114": 1,
		"99 112": 2,
		"112 141": 1,
		"112 144": 1,
		"99 101": 2,
		"101 141": 1,
		"101 144": 1,
	});
});

test("constraints3DEdges, mooser's train", () => {
	const foldfile = fs.readFileSync("./tests/files/fold/moosers-train.fold", "utf-8");
	const fold = JSON.parse(foldfile);
	const folded = ear.graph.getFramesByClassName(fold, "foldedForm")[0];
	ear.graph.populate(folded);

	const {
		// planes_transform,
		// faces_plane,
		// faces_cluster,
		// faces_winding,
		// faces_polygon,
		// faces_center,
		clusters_faces,
		clusters_graph,
		clusters_transform,
		// facesFacesOverlap,
		facePairs,
		orders,
		tortilla_tortilla,
		taco_tortilla,
	} = constraints3DEdges(folded);

	const {
		tJunctions,
		yJunctions,
		bentFlatTortillas,
		bentTortillas,
		bentTortillasFlatTaco,
	} = getSolvable3DEdgePairs(folded);

	expect(facePairs).toHaveLength(1721);
	expect(clusters_faces).toHaveLength(87);
	expect(clusters_graph).toHaveLength(87);
	expect(clusters_transform).toHaveLength(87);

	expect(yJunctions).toHaveLength(52);
	expect(tJunctions).toHaveLength(100);
	expect(bentFlatTortillas).toHaveLength(0);
	expect(bentTortillas).toHaveLength(234);
	expect(bentTortillasFlatTaco).toHaveLength(208);
	expect(tortilla_tortilla).toHaveLength(234);
	expect(taco_tortilla).toHaveLength(208);
	expect(Object.keys(orders)).toHaveLength(112);
});

test("constraints3DEdges and getSolvable3DEdgePairs, cube octagon", () => {
	const foldfile = fs.readFileSync("./tests/files/fold/cube-octagon.fold", "utf-8");
	const fold = JSON.parse(foldfile);
	const folded = ear.graph.getFramesByClassName(fold, "foldedForm")[0];
	ear.graph.populate(folded);

	const {
		// planes_transform,
		// faces_plane,
		// faces_cluster,
		// faces_winding,
		// faces_polygon,
		// faces_center,
		clusters_faces,
		clusters_graph,
		clusters_transform,
		// facesFacesOverlap,
		facePairs,
		orders,
		tortilla_tortilla,
		taco_tortilla,
	} = constraints3DEdges(folded);

	const {
		tJunctions,
		yJunctions,
		bentFlatTortillas,
		bentTortillas,
		bentTortillasFlatTaco,
	} = getSolvable3DEdgePairs(folded);

	expect(facePairs).toHaveLength(84);
	expect(clusters_faces).toHaveLength(6);
	expect(clusters_graph).toHaveLength(6);
	expect(clusters_transform).toHaveLength(6);

	expect(tJunctions).toMatchObject([]);
	expect(yJunctions).toMatchObject([]);
	expect(bentFlatTortillas).toMatchObject([
		[18, 35],
		[19, 35],
		[21, 40],
		[22, 40],
		[23, 40],
		[24, 40],
		[26, 58],
		[27, 58],
		[32, 39],
		[34, 50],
		[35, 68],
		[35, 69],
		[37, 57],
		[52, 55],
		[53, 63],
		[53, 64],
		[53, 71],
		[53, 72],
		[58, 66],
		[58, 67],
	]);
	expect(bentTortillas).toMatchObject([
		[18, 19],
		[18, 68],
		[18, 69],
		[19, 68],
		[19, 69],
		[21, 22],
		[21, 23],
		[21, 24],
		[22, 23],
		[22, 24],
		[23, 24],
		[26, 27],
		[26, 66],
		[26, 67],
		[27, 66],
		[27, 67],
		[63, 64],
		[63, 71],
		[63, 72],
		[64, 71],
		[64, 72],
		[66, 67],
		[68, 69],
		[71, 72],
	]);
	expect(bentTortillasFlatTaco).toMatchObject([]);
	expect(tortilla_tortilla).toMatchObject([
		[11, 37, 40, 13],
		[11, 37, 10, 12],
		[11, 37, 41, 39],
		[13, 40, 12, 10],
		[13, 40, 39, 41],
		[30, 33, 0, 2],
		[30, 33, 1, 17],
		[30, 33, 31, 4],
		[0, 2, 1, 17],
		[0, 2, 31, 4],
		[1, 17, 31, 4],
		[42, 44, 9, 43],
		[42, 45, 46, 43],
		[42, 8, 7, 43],
		[9, 45, 46, 44],
		[9, 8, 7, 44],
		[18, 24, 23, 20],
		[18, 21, 22, 20],
		[18, 25, 19, 20],
		[23, 21, 22, 24],
		[23, 25, 19, 24],
		[45, 7, 8, 46],
		[10, 12, 41, 39],
		[21, 19, 25, 22],
	]);
	expect(taco_tortilla).toMatchObject([]);
	expect(Object.keys(orders)).toHaveLength(20);
});

test("constraints3DEdges and getSolvable3DEdgePairs, coplanar angles", () => {
	const foldfile = fs.readFileSync(
		"./tests/files/fold/layers-3d-edge-face.fold",
		"utf-8",
	);
	const fold = JSON.parse(foldfile);
	const folded = {
		...fold,
		vertices_coords: ear.graph.makeVerticesCoordsFolded(fold),
	};
	ear.graph.populate(folded);

	const {
		// planes_transform,
		// faces_plane,
		// faces_cluster,
		// faces_winding,
		// faces_polygon,
		// faces_center,
		// clusters_faces,
		// clusters_graph,
		// clusters_transform,
		facesFacesOverlap,
		facePairs,
		orders,
		tortilla_tortilla,
		taco_tortilla,
	} = constraints3DEdges(folded);

	const {
		tJunctions,
		yJunctions,
		bentFlatTortillas,
		bentTortillas,
		bentTortillasFlatTaco,
	} = getSolvable3DEdgePairs(folded);

	expect(facePairs).toMatchObject(["1 3", "1 4", "1 5", "3 4", "3 5", "4 5"]);
	expect(facesFacesOverlap).toMatchObject([
		[],
		[3, 4, 5],
		[],
		[1, 4, 5],
		[1, 3, 5],
		[1, 3, 4],
	]);

	expect(yJunctions).toHaveLength(0);
	expect(tJunctions).toHaveLength(0);
	expect(bentFlatTortillas).toHaveLength(0);
	expect(bentTortillas).toHaveLength(0);
	expect(bentTortillasFlatTaco).toHaveLength(0);
	expect(tortilla_tortilla).toHaveLength(0);
	expect(taco_tortilla).toHaveLength(0);
	expect(Object.keys(orders)).toHaveLength(0);
});

test("constraints3DEdges and getSolvable3DEdgePairs, square tube", () => {
	const foldfile = fs.readFileSync(
		"./tests/files/fold/square-tube-with-overlap.fold",
		"utf-8",
	);
	const fold = JSON.parse(foldfile);
	const folded = {
		...fold,
		vertices_coords: ear.graph.makeVerticesCoordsFolded(fold),
	};
	ear.graph.populate(folded);

	expect(getSolvable3DEdgePairs(folded)).toMatchObject({
		tJunctions: [],
		yJunctions: [],
		bentFlatTortillas: [],
		// four bent-tortillas
		bentTortillas: [
			[12, 13],
			[14, 15],
			[21, 22],
			[23, 24],
		],
		bentTortillasFlatTaco: [],
	});

	// console.log(JSON.stringify(constraints3DEdges(folded)));

	const {
		// planes_transform,
		// faces_plane,
		// faces_cluster,
		// faces_winding,
		// faces_polygon,
		// faces_center,
		// clusters_faces,
		// clusters_graph,
		// clusters_transform,
		facesFacesOverlap,
		facePairs,
		orders,
		tortilla_tortilla,
		taco_tortilla,
	} = constraints3DEdges(folded);
});
