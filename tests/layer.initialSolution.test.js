import { expect, test } from "vitest";
import fs from "fs";
import ear from "../src/index.js";

test("solveFlatAdjacentEdges, different axes", () => {
	// shortcut methods
	const solveFlatAdjacentEdges = (graph) =>
		ear.layer.solveFlatAdjacentEdges(graph, ear.graph.makeFacesWinding(graph));
	const solverOrdersToFaceOrders = (graph) =>
		ear.layer.solverOrdersToFaceOrders(
			ear.layer.solveFlatAdjacentEdges(graph, ear.graph.makeFacesWinding(graph)),
			ear.graph.makeFacesWinding(graph),
		);

	// two squares joined at an edge, folded to lie exactly on top of each other
	// A: 0, 1, 2, 3 (counter)
	// B: 5, 4, 1, 0 (clock)
	const base = {
		edges_vertices: [
			[0, 1],
			[1, 2],
			[2, 3],
			[3, 0],
			[1, 4],
			[4, 5],
			[5, 0],
		],
		edges_assignment: ["V", "B", "B", "B", "B", "B", "B"],
		faces_vertices: [
			[0, 1, 2, 3],
			[5, 4, 1, 0],
		],
	};
	const graphXYUp = ear.graph.populate({
		...base,
		vertices_coords: [
			[0, 0],
			[1, 0],
			[1, 1],
			[0, 1],
			[1, 1],
			[0, 1],
		],
	});
	const graphXYDown = ear.graph.populate({
		...base,
		vertices_coords: [
			[0, 0],
			[0, 1],
			[1, 1],
			[1, 0],
			[1, 1],
			[1, 0],
		],
	});

	// XY up
	// face 0 is upright, plane normal will be [0, 0, 1]
	expect(ear.graph.makeFacesWinding(graphXYUp)).toMatchObject([true, false]);
	// in plane [0, 0, 1], face 0 is below face 1
	expect(solveFlatAdjacentEdges(graphXYUp)).toMatchObject({ "0 1": 2 });
	// face 0 is above face 1's normal
	expect(solverOrdersToFaceOrders(graphXYUp)).toMatchObject([[0, 1, 1]]);

	// face 0 is flipped, plane normal will be [0, 0, -1]
	expect(ear.graph.makeFacesWinding(graphXYDown)).toMatchObject([false, true]);
	// in plane [0, 0, -1], face 0 is above face 1
	expect(solveFlatAdjacentEdges(graphXYDown)).toMatchObject({ "0 1": 1 });
	// face 0 is above face 1's normal
	expect(solverOrdersToFaceOrders(graphXYDown)).toMatchObject([[0, 1, 1]]);
});

test("solveFlatAdjacentEdges, four panel square", () => {
	const foldfile = fs.readFileSync("./tests/files/fold/panels-4x2.fold", "utf-8");
	const fold = JSON.parse(foldfile);
	const folded = ear.graph.getFramesByClassName(fold, "foldedForm")[0];
	ear.graph.populate(folded);

	const faces_winding = ear.graph.makeFacesWinding(folded);
	const adjacentOrders = ear.layer.solveFlatAdjacentEdges(folded, faces_winding);

	// only two taco-tacos, one on the top and one bottom
	expect(faces_winding).toMatchObject([
		true,
		false,
		true,
		false,
		true,
		false,
		true,
		false,
	]);
	// 0 is below 1 (V)
	// 1 is above 2 (V)
	// 2 is above 3 (M)
	// same with every face N+4
	expect(adjacentOrders).toMatchObject({
		"0 1": 2,
		"1 2": 1,
		"2 3": 1,
		"4 5": 2,
		"5 6": 1,
		"6 7": 1,
	});
});

test("solveFlatAdjacentEdges, strip weave", () => {
	const foldfile = fs.readFileSync("./tests/files/fold/strip-weave.fold", "utf-8");
	const fold = JSON.parse(foldfile);
	const folded = ear.graph.getFramesByClassName(fold, "foldedForm")[0];
	ear.graph.populate(folded);

	const faces_winding = ear.graph.makeFacesWinding(folded);
	const adjacentOrders = ear.layer.solveFlatAdjacentEdges(folded, faces_winding);

	expect(faces_winding).toMatchObject([true, false, true, false, false, true, false]);
	expect(adjacentOrders).toMatchObject({
		"0 1": 2,
		"0 4": 2,
		"1 2": 1,
		"2 3": 2,
		"4 5": 1,
		"5 6": 2,
	});
});

test("solveFlatAdjacentEdges, zig-zag panels", () => {
	const foldfile = fs.readFileSync("./tests/files/fold/panels-zig-zag.fold", "utf-8");
	const fold = JSON.parse(foldfile);
	const folded = ear.graph.getFramesByClassName(fold, "foldedForm")[0];
	ear.graph.populate(folded);

	const faces_winding = ear.graph.makeFacesWinding(folded);
	const adjacentOrders = ear.layer.solveFlatAdjacentEdges(folded, faces_winding);

	expect(faces_winding).toMatchObject([true, true, false, true, false]);
	expect(adjacentOrders).toMatchObject({
		"0 4": 2,
		"1 2": 1,
		"2 3": 1,
		"3 4": 1,
	});
});

test("solveFlatAdjacentEdges, triangle strip", () => {
	const fileStrip1 = fs.readFileSync("./tests/files/fold/triangle-strip.fold", "utf-8");
	const fileStrip2 = fs.readFileSync("./tests/files/fold/triangle-strip-2.fold", "utf-8");
	const foldStrip1 = JSON.parse(fileStrip1);
	const foldStrip2 = JSON.parse(fileStrip2);
	const folded1 = ear.graph.getFramesByClassName(foldStrip1, "foldedForm")[0];
	const folded2 = ear.graph.getFramesByClassName(foldStrip2, "foldedForm")[0];
	ear.graph.populate(folded1);
	ear.graph.populate(folded2);

	const faces_winding1 = ear.graph.makeFacesWinding(folded1);
	const adjacentOrders1 = ear.layer.solveFlatAdjacentEdges(folded1, faces_winding1);
	const faces_winding2 = ear.graph.makeFacesWinding(folded2);
	const adjacentOrders2 = ear.layer.solveFlatAdjacentEdges(folded2, faces_winding2);

	expect(faces_winding1).toMatchObject([
		true,
		false,
		false,
		true,
		true,
		false,
		false,
		true,
		true,
		false,
		false,
		true,
		true,
		false,
	]);
	expect(adjacentOrders1).toMatchObject({
		"0 1": 2,
		"10 11": 2,
		"12 13": 2,
		"2 3": 2,
		"4 5": 2,
		"6 7": 2,
		"8 9": 2,
	});
	expect(faces_winding2).toMatchObject([
		true,
		false,
		false,
		true,
		true,
		false,
		false,
		true,
		true,
		false,
		false,
		true,
		true,
		false,
		false,
		false,
		true,
		true,
		true,
		false,
		true,
		true,
		false,
		false,
		true,
		true,
		false,
		false,
	]);
	expect(adjacentOrders2).toMatchObject({
		"0 1": 2,
		"10 11": 2,
		"12 13": 2,
		"15 16": 1,
		"17 27": 1,
		"18 19": 2,
		"19 20": 2,
		"2 3": 2,
		"21 22": 2,
		"23 24": 2,
		"25 26": 2,
		"4 5": 2,
		"6 7": 2,
		"8 9": 2,
	});
});

test("solveFlatAdjacentEdges, bird base", () => {
	const cp = ear.graph.bird();
	const folded = {
		...cp,
		vertices_coords: ear.graph.makeVerticesCoordsFlatFolded(cp),
	};
	ear.graph.populate(folded);

	const faces_winding = ear.graph.makeFacesWinding(folded);
	const adjacentOrders = ear.layer.solveFlatAdjacentEdges(folded, faces_winding);

	expect(faces_winding).toMatchObject([
		true,
		false,
		false,
		true,
		false,
		true,
		false,
		true,
		false,
		false,
		true,
		true,
		true,
		false,
		true,
		false,
		true,
		true,
		false,
		false,
	]);
	expect(adjacentOrders).toMatchObject({
		"0 1": 2,
		"0 4": 1,
		"12 15": 2,
		"13 14": 1,
		"14 15": 1,
		"14 18": 2,
		"15 17": 1,
		"2 3": 1,
		"3 13": 1,
		"4 7": 1,
		"5 6": 2,
		"5 8": 1,
		"6 16": 1,
		"6 7": 2,
		"7 19": 2,
		"8 11": 1,
		"9 10": 1,
		"9 12": 2,
	});
});

test("solveFlatAdjacentEdges, kabuto", () => {
	const foldfile = fs.readFileSync("./tests/files/fold/kabuto.fold", "utf-8");
	const fold = JSON.parse(foldfile);
	const folded = ear.graph.getFramesByClassName(fold, "foldedForm")[0];
	ear.graph.populate(folded);

	const faces_winding = ear.graph.makeFacesWinding(folded);
	const adjacentOrders = ear.layer.solveFlatAdjacentEdges(folded, faces_winding);

	expect(faces_winding).toMatchObject([
		true,
		false,
		true,
		false,
		true,
		false,
		true,
		true,
		false,
		false,
		true,
		true,
		false,
		false,
		true,
		true,
		false,
		false,
	]);
	expect(adjacentOrders).toMatchObject({
		"0 3": 2,
		"0 8": 2,
		"0 9": 2,
		"1 10": 2,
		"1 11": 2,
		"1 2": 1,
		"10 12": 2,
		"11 13": 2,
		"12 14": 2,
		"13 15": 2,
		"14 16": 1,
		"15 17": 1,
		"3 4": 1,
		"4 5": 1,
		"6 16": 2,
		"6 8": 1,
		"7 17": 2,
		"7 9": 1,
		"8 10": 2,
		"9 11": 2,
	});
});

test("solveFlatAdjacentEdges, crane", () => {
	const foldfile = fs.readFileSync("./tests/files/fold/crane.fold", "utf-8");
	const fold = JSON.parse(foldfile);
	const folded = ear.graph.getFramesByClassName(fold, "foldedForm")[0];
	ear.graph.populate(folded);

	const faces_winding = ear.graph.makeFacesWinding(folded);
	const adjacentOrders = ear.layer.solveFlatAdjacentEdges(folded, faces_winding);

	expect(faces_winding[0]).toBe(true);
	expect(Object.keys(adjacentOrders)).toHaveLength(102);
});

test("solveFlatAdjacentEdges, flapping bird", () => {
	const foldfile = fs.readFileSync(
		"./tests/files/fold/randlett-flapping-bird.fold",
		"utf-8",
	);
	const fold = JSON.parse(foldfile);
	const folded = ear.graph.getFramesByClassName(fold, "foldedForm")[0];
	ear.graph.populate(folded);

	const faces_winding = ear.graph.makeFacesWinding(folded);
	const adjacentOrders = ear.layer.solveFlatAdjacentEdges(folded, faces_winding);

	expect(faces_winding[0]).toBe(true);
	expect(Object.keys(adjacentOrders)).toHaveLength(30);
});

test("solveFlatAdjacentEdges, bird", () => {
	const foldfile = fs.readFileSync("./tests/files/fold/kraft-bird-base.fold", "utf-8");
	const fold = JSON.parse(foldfile);
	const folded = {
		...fold,
		vertices_coords: ear.graph.makeVerticesCoordsFlatFolded(fold, [6]),
	};
	ear.graph.populate(folded);

	const faces_winding = ear.graph.makeFacesWinding(folded);
	const adjacentOrders = ear.layer.solveFlatAdjacentEdges(folded, faces_winding);

	expect(faces_winding[6]).toBe(true);
	expect(Object.keys(adjacentOrders)).toHaveLength(338);
});

test("solveFlatAdjacentEdges, 3D cube-octagon", () => {
	const foldfile = fs.readFileSync("./tests/files/fold/cube-octagon.fold", "utf-8");
	const fold = JSON.parse(foldfile);
	// the second folded frame is the one without the flat assignments
	const folded = ear.graph.getFramesByClassName(fold, "foldedForm")[1];
	ear.graph.populate(folded);

	const {
		planes,
		planes_faces,
		// planes_transform,
		// planes_clusters,
		faces_winding,
		faces_plane,
		// faces_cluster,
		// clusters_plane,
		// clusters_faces,
	} = ear.graph.getCoplanarAdjacentOverlappingFaces(folded);

	const {
		// planes_transform,
		// faces_plane,
		faces_cluster,
		faces_winding: faces_winding2,
		// faces_polygon,
		// faces_center,
		// clusters_faces,
		clusters_graph,
		// clusters_transform,
		// facesFacesOverlap,
		// facePairs,
	} = ear.layer.constraints3DFaceClusters(folded);

	expect(planes).toMatchObject([
		{ normal: [0, 1, 0], origin: [0, 2, 0] },
		{ normal: [0, 1, 0], origin: [0, 3, 0] },
		{ normal: [0, 0, -1], origin: [0, 0, -0] },
		{ normal: [0, 0, -1], origin: [0, 0, -1] },
		{ normal: [1, 0, 0], origin: [2, 0, 0] },
		{ normal: [1, 0, 0], origin: [3, 0, 0] },
	]);

	// ensure faces_winding is correct within its plane.
	// noTransformWinding is performed on the input folded form which appears
	// to have a flat plane in the XY, which when done proper is given the
	// normal (0, 0, -1), so, when done proper, all windings will be flipped
	// at least from the faces in planes_faces[3] (other planes will be corrupt
	// as we are simply projecting 3D down into 2D creating degenerate faces)
	expect(faces_winding).toMatchObject(faces_winding2);
	const noTransformWinding = ear.graph.makeFacesWinding(folded);
	planes_faces[3].forEach((f) =>
		expect(faces_winding[f]).not.toEqual(noTransformWinding[f]),
	);

	// it just so happens that in this example all planes match clusters
	// making planes and clusters synonymous
	expect(faces_plane).toMatchObject(faces_cluster);

	// the vertices coords of the folded form
	expect(folded.vertices_coords).toMatchObject([
		[2, 2, 0],
		[2, 2, -1],
		[2, 1, -1],
		[3, 1, -1],
		[3, 2, -1],
		[3, 2, 0],
		[2, 3, 0],
		[2, 3, -1],
		[1, 3, -1],
		[1, 2, -1],
		[2, 2, -1],
		[3, 3, 0],
		[4, 3, -1],
		[3, 3, 0],
		[2, 2, 0],
		[1, 2, -1],
		[2, 2, -1],
		[1.5, 1.5, -1],
		[3, 3, -1],
		[3.5, 3.5, -1],
		[3, 3, -1],
		[2, 3, -1],
		[2, 4, -1],
		[3, 2, -1],
		[3, 1, -1],
		[3, 2, -1],
		[2, 3, 0],
		[2, 3, -1],
		[3, 2, 0],
		[1.5, 3.5, -1],
		[2, 4, -1],
		[4, 2, -1],
		[3.5, 1.5, -1],
		[3, 3, -1],
		[4, 3, -1],
		[3, 4, -1],
	]);

	// the vertices coords from the big flat plane (3), this plane has been flipped,
	// the normal is [0, 0, -1] so we should see the vertices appearing flipped.
	expect(clusters_graph[3].vertices_coords).toMatchObject([
		,
		[2, -2],
		[2, -1],
		[3, -1],
		[3, -2],
		,
		,
		[2, -3],
		[1, -3],
		[1, -2],
		[2, -2],
		,
		[4, -3],
		,
		,
		[1, -2],
		[2, -2],
		[1.5, -1.5],
		[3, -3],
		[3.5, -3.5],
		[3, -3],
		[2, -3],
		[2, -4],
		[3, -2],
		[3, -1],
		[3, -2],
		,
		[2, -3],
		,
		[1.5, -3.5],
		[2, -4],
		[4, -2],
		[3.5, -1.5],
		[3, -3],
		[4, -3],
		[3, -4],
	]);

	// four tortillas in the big flat plane (#3): 3, 11, 17, 28
	// have 1 instace each of overlaping one of the others
	// plane #3 normal is [0, 0, -1], so looking at the folded form from above,
	// all layer results should be sorted in flipped order.
	expect(faces_plane[3]).toBe(3);
	expect(faces_plane[11]).toBe(3);
	expect(faces_plane[17]).toBe(3);
	expect(faces_plane[28]).toBe(3);

	// let's focus on the relationship between faces 2 and 3 for a moment

	// cluster 3, faces 2 and 3 as polygons
	const foldedPolygon2 = folded.faces_vertices[2].map((v) => folded.vertices_coords[v]);
	const foldedPolygon3 = folded.faces_vertices[3].map((v) => folded.vertices_coords[v]);
	const clusterGraphPolygon2 = clusters_graph[3].faces_vertices[2].map(
		(v) => clusters_graph[3].vertices_coords[v],
	);
	const clusterGraphPolygon3 = clusters_graph[3].faces_vertices[3].map(
		(v) => clusters_graph[3].vertices_coords[v],
	);

	// folded face 2 appears to wind clockwise
	expect(foldedPolygon2).toMatchObject([
		[2, 2, -1],
		[2, 1, -1],
		[1, 2, -1],
	]);
	// folded face 3 appears to wind counter-clockwise
	expect(foldedPolygon3).toMatchObject([
		[2, 1, -1],
		[3, 1, -1],
		[3.5, 1.5, -1],
		[3, 2, -1],
		[1, 2, -1],
	]);

	// folded face 2 appears to wind counter-clockwise
	expect(clusterGraphPolygon2).toMatchObject([
		[2, -2],
		[2, -1],
		[1, -2],
	]);
	// folded face 3 appears to wind clockwise
	expect(clusterGraphPolygon3).toMatchObject([
		[2, -1],
		[3, -1],
		[3.5, -1.5],
		[3, -2],
		[1, -2],
	]);

	// the cluster graph's winding direction is the one reflected
	// in the faces_winding array.
	// face 3 is flipped because, despite it appearing to wind counter-clockwise,
	// the faces_winding is taken with respect to the plane's normal, [0, 0, -1],
	// creating a winding which will appear flipped from the apparent view.
	expect(faces_winding[2]).toBe(true);
	expect(faces_winding[3]).toBe(false);

	// solveFlatAdjacentEdges does not bother with vertices_coords, these two graphs
	// will have the same result
	expect(ear.layer.solveFlatAdjacentEdges(folded, faces_winding)).toMatchObject(
		ear.layer.solveFlatAdjacentEdges(clusters_graph[3], faces_winding),
	);

	// face 2 is upright, face 3 is flipped
	// if faces 3 is flipped, a valley fold from face 3 to 2 places 2 BELOW face 3
	// note: this is just a subset of the total result.
	expect(ear.layer.solveFlatAdjacentEdges(folded, faces_winding)).toMatchObject({
		"2 3": 2, // 2 is below 3, even though from above, 2 appears to be above 3
		"10 11": 2, // 10 is below 11
		"16 17": 2, // 16 is below 17
		"28 36": 1, // 28 is above 36
	});

	// here's the rest
	expect(ear.layer.solveFlatAdjacentEdges(folded, faces_winding)).toMatchObject({
		"14 15": 2,
		"18 19": 1,
		"25 26": 1,
		"0 1": 1,
		"11 27": 1,
		"12 13": 2,
		"20 28": 2,
		"21 29": 1,
		"9 30": 1,
		"11 24": 1,
		"25 27": 1,
		"0 2": 1,
		"1 13": 1,
		"3 26": 1,
		"34 35": 2,
		"7 36": 2,
		"11 12": 1,
		"13 27": 2,
		"22 24": 2,
		"18 33": 2,
		"22 26": 2,
		"24 25": 1,
		"30 32": 2,
		"17 31": 1,
		"6 35": 2,
		"3 4": 1,
		"3 35": 1,
		"4 6": 2,
		"18 22": 1,
		"19 23": 1,
		"22 23": 2,
		"26 34": 1,
		"5 7": 1,
		"23 34": 1,
		"24 33": 2,
		"8 9": 1,
		"14 16": 2,
		"19 20": 2,
		"23 28": 2,
		"5 6": 2,
		"8 10": 1,
		"32 33": 1,
		"17 18": 1,
		"15 21": 2,
		"17 32": 1,
		"30 31": 1,
		"20 21": 1,
		"28 29": 1,
	});
});
