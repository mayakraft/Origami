import { expect, test } from "vitest";
import fs from "fs";
import ear from "../src/index.js";

test("edges-faces all data, triangle cut by edge", () => {
	const graph = ear.graph.populate({
		vertices_coords: [
			[0, 0],
			[0.5, 0.5],
			[0, 1],
			[-1, 0.5],
		],
		edges_vertices: [
			[0, 1],
			[1, 2],
			[2, 0],
			[1, 3],
		],
		edges_assignment: Array.from("BBBB"),
		faces_vertices: [[0, 1, 2]],
	});
	const { verticesVertices, verticesEdges, edgesEdges, facesVertices } =
		ear.graph.getOverlappingComponents(graph);
	expect(ear.general.lookupArrayToArrayArray(verticesVertices)).toMatchObject([
		[0],
		[1],
		[2],
		[3],
	]);
	expect(ear.general.lookupArrayToArrayArray(verticesEdges)).toMatchObject([
		[],
		[],
		[],
		[],
	]);
	expect(ear.general.lookupArrayToArrayArray(edgesEdges)).toMatchObject([
		[],
		[],
		[3],
		[2],
	]);
	expect(ear.general.lookupArrayToArrayArray(facesVertices)).toMatchObject([[]]);
});

test("edges-faces all data, square cut by edge through vertex", () => {
	// square cut by edge between two of its vertices
	const { verticesVertices, verticesEdges, edgesEdges, facesVertices } =
		ear.graph.getOverlappingComponents(
			ear.graph.populate({
				vertices_coords: [
					[0, 0],
					[1, 0],
					[1, 1],
					[0, 1],
				],
				edges_vertices: [
					[0, 1],
					[1, 2],
					[2, 3],
					[3, 0],
					[0, 2],
				],
				edges_assignment: Array.from("BBBBB"),
				faces_vertices: [[0, 1, 2, 3]],
			}),
		);
	expect(ear.general.lookupArrayToArrayArray(verticesVertices)).toMatchObject([
		[0],
		[1],
		[2],
		[3],
	]);
	expect(ear.general.lookupArrayToArrayArray(verticesEdges)).toMatchObject([
		[],
		[],
		[],
		[],
	]);
	expect(ear.general.lookupArrayToArrayArray(edgesEdges)).toMatchObject([
		[],
		[],
		[],
		[],
		[],
	]);
	expect(ear.general.lookupArrayToArrayArray(facesVertices)).toMatchObject([[]]);
});

test("edges-faces all data, square cut by edge through vertex", () => {
	// square cut by edge between one of its vertices, through another vertex
	const { verticesVertices, verticesEdges, edgesEdges, facesVertices } =
		ear.graph.getOverlappingComponents(
			ear.graph.populate({
				vertices_coords: [
					[0, 0],
					[1, 0],
					[1, 1],
					[0, 1],
					[2, 2],
				],
				edges_vertices: [
					[0, 1],
					[1, 2],
					[2, 3],
					[3, 0],
					[0, 4],
				],
				edges_assignment: Array.from("BBBBB"),
				faces_vertices: [[0, 1, 2, 3]],
			}),
		);
	expect(ear.general.lookupArrayToArrayArray(verticesVertices)).toMatchObject([
		[0],
		[1],
		[2],
		[3],
		[4],
	]);
	expect(ear.general.lookupArrayToArrayArray(verticesEdges)).toMatchObject([
		[],
		[],
		[4],
		[],
		[],
	]);
	expect(ear.general.lookupArrayToArrayArray(edgesEdges)).toMatchObject([
		[],
		[],
		[],
		[],
		[],
	]);
	expect(ear.general.lookupArrayToArrayArray(facesVertices)).toMatchObject([[]]);
});

test("edges-faces all data, square cut by edge through two vertices", () => {
	// square cut by edge between one of its vertices, through another vertex
	const { verticesVertices, verticesEdges, edgesEdges, facesVertices } =
		ear.graph.getOverlappingComponents(
			ear.graph.populate({
				vertices_coords: [
					[0, 0],
					[1, 0],
					[1, 1],
					[0, 1],
					[-1, -1],
					[2, 2],
				],
				edges_vertices: [
					[0, 1],
					[1, 2],
					[2, 3],
					[3, 0],
					[4, 5],
				],
				edges_assignment: Array.from("BBBBB"),
				faces_vertices: [[0, 1, 2, 3]],
			}),
		);
	expect(ear.general.lookupArrayToArrayArray(verticesVertices)).toMatchObject([
		[0],
		[1],
		[2],
		[3],
		[4],
		[5],
	]);
	expect(ear.general.lookupArrayToArrayArray(verticesEdges)).toMatchObject([
		[4],
		[],
		[4],
		[],
		[],
		[],
	]);
	expect(ear.general.lookupArrayToArrayArray(edgesEdges)).toMatchObject([
		[],
		[],
		[],
		[],
		[],
	]);
	expect(ear.general.lookupArrayToArrayArray(facesVertices)).toMatchObject([[]]);
});

test("overlapping components, two identical edges", () => {
	const graph = ear.graph.populate({
		vertices_coords: [
			[0, 0],
			[1, 0],
			[1, 0],
			[0, 0],
		],
		edges_vertices: [
			[0, 1],
			[2, 3],
		],
		faces_vertices: [],
	});
	const { verticesVertices, verticesEdges, edgesEdges, facesVertices } =
		ear.graph.getOverlappingComponents(graph);
	expect(ear.general.lookupArrayToArrayArray(verticesVertices)).toMatchObject([
		[0, 3],
		[1, 2],
		[1, 2],
		[0, 3],
	]);
	expect(ear.general.lookupArrayToArrayArray(verticesEdges)).toMatchObject([
		[],
		[],
		[],
		[],
	]);
	expect(ear.general.lookupArrayToArrayArray(edgesEdges)).toMatchObject([[], []]);
	expect(ear.general.lookupArrayToArrayArray(facesVertices)).toMatchObject([]);
});

test("overlapping components, two crossing edges", () => {
	const graph = ear.graph.populate({
		vertices_coords: [
			[0, 0],
			[1, 0],
			[0.5, 1],
			[0.5, -1],
		],
		edges_vertices: [
			[0, 1],
			[2, 3],
		],
		faces_vertices: [],
	});
	const { verticesVertices, verticesEdges, edgesEdges, facesVertices } =
		ear.graph.getOverlappingComponents(graph);
	expect(ear.general.lookupArrayToArrayArray(verticesVertices)).toMatchObject([
		[0],
		[1],
		[2],
		[3],
	]);
	expect(ear.general.lookupArrayToArrayArray(verticesEdges)).toMatchObject([
		[],
		[],
		[],
		[],
	]);
	expect(ear.general.lookupArrayToArrayArray(edgesEdges)).toMatchObject([[1], [0]]);
	expect(ear.general.lookupArrayToArrayArray(facesVertices)).toMatchObject([]);
});

test("overlapping components, two collinear overlapping edges", () => {
	const graph = ear.graph.populate({
		vertices_coords: [
			[0, 0],
			[2, 0],
			[1, 0],
			[3, 0],
		],
		edges_vertices: [
			[0, 1],
			[2, 3],
		],
		faces_vertices: [],
	});
	const { verticesVertices, verticesEdges, edgesEdges, facesVertices } =
		ear.graph.getOverlappingComponents(graph);
	expect(ear.general.lookupArrayToArrayArray(verticesVertices)).toMatchObject([
		[0],
		[1],
		[2],
		[3],
	]);
	expect(ear.general.lookupArrayToArrayArray(verticesEdges)).toMatchObject([
		[],
		[1],
		[0],
		[],
	]);
	expect(ear.general.lookupArrayToArrayArray(edgesEdges)).toMatchObject([[], []]);
	expect(ear.general.lookupArrayToArrayArray(facesVertices)).toMatchObject([]);
});

test("overlapping components, two adjacent faces one point overlap", () => {
	const graph = ear.graph.populate({
		vertices_coords: [
			[0, 0],
			[0.5, 0.5],
			[0, 1],
			[0, 1],
		],
		edges_vertices: [
			[0, 3],
			[3, 1],
			[1, 2],
			[2, 0],
			[0, 1],
		],
		edges_assignment: Array.from("BBBBV"),
		faces_vertices: [
			[0, 2, 1],
			[0, 1, 3],
		],
	});
	const components = ear.graph.getOverlappingComponents(graph);

	// console.log(components);
	// vertex 2 and 3 are mutually overlapping
	expect(components).toMatchObject({
		verticesVertices: [[true], [, true], [, , true, true], [, , true, true]],
		verticesEdges: [[], [], [], []],
		edgesEdges: [[], [], [], [], []],
		facesVertices: [[], []],
	});
});

test("overlapping components, two adjacent faces no overlap points, two crossing edges", () => {
	const graph = ear.graph.populate({
		vertices_coords: [
			[0, 0],
			[0.5, 0.5],
			[0, 1],
			[-0.1, 0.9],
		],
		edges_vertices: [
			[0, 3],
			[3, 1],
			[1, 2],
			[2, 0],
			[0, 1],
		],
		edges_assignment: Array.from("BBBBV"),
		faces_vertices: [
			[0, 2, 1],
			[0, 1, 3],
		],
	});
	const components = ear.graph.getOverlappingComponents(graph);

	// edge 1 and 3 are mutually overlapping
	expect(components).toMatchObject({
		verticesVertices: [[true], [, true], [, , true], [, , , true]],
		verticesEdges: [[], [], [], []],
		edgesEdges: [[], [, , , true], [], [, true], []],
		facesVertices: [[], []],
	});
});

test("overlapping components, two separate faces, identical", () => {
	const graph = ear.graph.populate({
		vertices_coords: [
			[0, 0],
			[0.5, 0.5],
			[0, 1],
			[0, 0],
			[0.5, 0.5],
			[0, 1],
		],
		edges_vertices: [
			[0, 1],
			[1, 2],
			[2, 0],
			[3, 4],
			[4, 5],
			[5, 3],
		],
		edges_assignment: Array.from("BBBBBB"),
		faces_vertices: [
			[0, 1, 2],
			[3, 4, 5],
		],
	});
	const components = ear.graph.getOverlappingComponents(graph);

	expect(components).toMatchObject({
		verticesVertices: [
			[true, , , true],
			[, true, , , true],
			[, , true, , , true],
			[true, , , true],
			[, true, , , true],
			[, , true, , , true],
		],
		verticesEdges: [[], [], [], [], [], []],
		edgesEdges: [[], [], [], [], [], []],
		facesVertices: [[], []],
	});
});

// test("overlapping components, two separate faces, one point in common", () => {
// 	// one upside down triangle (point at origin)
// 	// copy of other triangle, scaled shorter in the Y axis (point at origin)
// 	// the second triangle's top line cuts through the other triangle's sides
// 	const graph = ear.graph.populate({
// 		vertices_coords: [[0, 0], [1, 1], [-1, 1], [0, 0], [1, 0.5], [-1, 0.5]],
// 		edges_vertices: [[0, 1], [1, 2], [2, 0], [3, 4], [4, 5], [5, 3]],
// 		edges_assignment: Array.from("BBBBBB"),
// 		faces_vertices: [[0, 1, 2], [3, 4, 5]],
// 	});
// 	const components = ear.graph.getOverlappingComponents(graph);

// 	// vertices 0 and 3 are mutually overlapping
// 	// edge 4 overlaps with both edges 0 and 2
// 	expect(components).toMatchObject({
// 		verticesVertices: [[,,, true], [], [], [true], [], []],
// 		verticesEdges: [[], [], [], [], [], []],
// 		edgesEdges: [[,,,, true], [], [,,,, true], [], [true,, true], []],
// 		facesVertices: [[], []],
// 	});
// });

// test("overlapping components, points inside faces", () => {
// 	// one upside down triangle (point at origin)
// 	// one right side up triangle
// 	const graph = ear.graph.populate({
// 		vertices_coords: [[0, 0], [1, 1], [-1, 1], [-1, -1], [1, -1], [0, 0.5]],
// 		edges_vertices: [[0, 1], [1, 2], [2, 0], [3, 4], [4, 5], [5, 3]],
// 		edges_assignment: Array.from("BBBBBB"),
// 		faces_vertices: [[0, 1, 2], [3, 4, 5]],
// 	});
// 	const components = ear.graph.getOverlappingComponents(graph);

// 	// vertices 0 and 3 are mutually overlapping
// 	// edge 4 overlaps with both edges 0 and 2
// 	expect(components).toMatchObject({
// 		verticesVertices: [[], [], [], [], [], []],
// 		verticesEdges: [[], [], [], [], [], []],
// 		edgesEdges: [[,,,, true], [], [,,,,, true], [], [true], [,, true]],
// 		facesVertices: [[,,,,, true], [true]],
// 	});
// });

// test("overlapping components kite base", () => {
// 	const cp = ear.graph.kite();
// 	const folded = {
// 		...cp,
// 		vertices_coords: ear.graph.makeVerticesCoordsFlatFolded(cp),
// 	};
// 	ear.graph.populate(folded);

// 	const components = ear.graph.getOverlappingComponents(folded);

// 	// vertex 1 and 5 mutually overlap
// 	// vertex 1 and 5 both overlap edge 8
// 	// edge 1 overlaps face 1
// 	// edge 4 overlaps face 2
// 	expect(components).toMatchObject({
// 		verticesVertices: [
// 			[], [,,,,, true], [], [], [], [, true],
// 		],
// 		verticesEdges: [
// 			[], [,,,,,,,, true], [], [], [], [,,,,,,,, true],
// 		],
// 		edgesEdges: [
// 			[], [], [], [], [], [], [], [], [],
// 		],
// 		facesVertices: [
// 			[], [], [], [],
// 		],
// 	});
// });

// test("overlapping components bird base", () => {
// 	const cp = ear.graph.bird();
// 	const folded = {
// 		...cp,
// 		vertices_coords: ear.graph.makeVerticesCoordsFlatFolded(cp),
// 	};
// 	ear.graph.populate(folded);

// 	const {
// 		verticesVertices,
// 		verticesEdges,
// 		edgesEdges,
// 		facesVertices,
// 	} = ear.graph.getOverlappingComponents(folded);

// 	// hopefully this is all okay, I did not manually check these.
// 	// tentatively it looks okay.
// 	// vertex 8 is isolated.
// 	// edges 24 and 25 are the two which get vertex-overlaps inside them
// 	expect(ear.general.lookupArrayToArrayArray(verticesVertices)).toMatchObject([
// 		[2, 4, 6],
// 		[3, 5, 7, 13, 14],
// 		[0, 4, 6],
// 		[1, 5, 7, 13, 14],
// 		[0, 2, 6],
// 		[1, 3, 7, 13, 14],
// 		[0, 2, 4],
// 		[1, 3, 5, 13, 14],
// 		[],
// 		[10],
// 		[9],
// 		[12],
// 		[11],
// 		[1, 3, 5, 7, 14],
// 		[1, 3, 5, 7, 13],
// 	]);
// 	expect(ear.general.lookupArrayToArrayArray(verticesEdges)).toMatchObject([
// 		[], [24, 25], [], [24, 25], [], [24, 25], [],
// 		[24, 25], [], [], [], [], [], [24, 25], [24, 25],
// 	]);
// 	expect(ear.general.lookupArrayToArrayArray(edgesEdges)).toMatchObject([
// 		[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [],
// 		[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [],
// 	]);
// 	expect(ear.general.lookupArrayToArrayArray(facesVertices)).toMatchObject([
// 		[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [],
// 	]);
// });

// test("overlapping components crane", () => {
// 	const json = fs.readFileSync("./tests/files/fold/crane.fold", "utf-8");
// 	const fold = JSON.parse(json);
// 	const folded = ear.graph.getFramesByClassName(fold, "foldedForm")[0];
// 	ear.graph.populate(folded);

// 	const {
// 		verticesVertices,
// 		verticesEdges,
// 		edgesEdges,
// 		facesVertices,
// 	} = ear.graph.getOverlappingComponents(folded);

// 	// 5, 6, 7, 8 mutually overlap
// 	// 47, 49, 51, 53, 55 mutually overlap (crane head)
// 	// 48, 50, 52, 54 mutually overlap (crane head)
// 	expect(ear.general.lookupArrayToArrayArray(verticesVertices)).toMatchObject([
// 		[],[],[],[],[],[6,7,8],[5,7,8],[5,6,8],[5,6,7],[12,39,45],[13],[],[9,39,45],[10],[],[18,40,42],[19],[],[15,40,42],[16],[],[22,25,27,29,31,32,34,36,38],[21,25,27,29,31,32,34,36,38],[26,28,30],[33,35,37],[21,22,27,29,31,32,34,36,38],[23,28,30],[21,22,25,29,31,32,34,36,38],[23,26,30],[21,22,25,27,31,32,34,36,38],[23,26,28],[21,22,25,27,29,32,34,36,38],[21,22,25,27,29,31,34,36,38],[24,35,37],[21,22,25,27,29,31,32,36,38],[24,33,37],[21,22,25,27,29,31,32,34,38],[24,33,35],[21,22,25,27,29,31,32,34,36],[9,12,45],[15,18,42],[],[15,18,40],[46],[],[9,12,39],[43],[49,51,53,55],[50,52,54],[47,51,53,55],[48,52,54],[47,49,53,55],[48,50,54],[47,49,51,55],[48,50,52],[47,49,51,53]
// 	]);
// 	// vertex 4 overlaps edges 16, 78
// 	expect(ear.general.lookupArrayToArrayArray(verticesEdges)).toMatchObject([
// 		[],[],[],[],[16,78],[16,29,50,67,68,69,70,78],[16,29,50,67,68,69,70,78],[16,29,50,67,68,69,70,78],[16,29,50,67,68,69,70,78],[3,42],[42,44,48,77],[],[3,42],[42,44,48,77],[],[80,86],[28,30,64,80],[],[80,86],[28,30,64,80],[],[22,55,67,69],[22,55,67,69],[],[],[22,55,67,69],[],[22,55,67,69],[],[22,55,67,69],[],[22,55,67,69],[22,55,67,69],[],[22,55,67,69],[],[22,55,67,69],[],[22,55,67,69],[3,42],[80,86],[8,59,66],[80,86],[16,29,50,59,78],[0,59,74],[3,42],[16,29,50,59,78],[],[],[],[],[],[],[],[],[]
// 	]);
// 	// edges 14, 39, 41, 47, 51 overlap both 7, 21
// 	expect(ear.general.lookupArrayToArrayArray(edgesEdges)).toMatchObject([
// 		[7,14,21,39,41,47,51,59,74],[14,39,41,47,51,72],[72],[72],[14,39,41,47,51],[72],[14,39,41,47,51,72],[0,14,39,41,47,51],[9,18,59,66,88,97,102,104,108],[8,88,97,102,104,108],[62],[],[62,88,97,102,104,108],[62],[0,1,4,6,7,21,52,59,73,74,82],[],[59],[],[8,88,97,102,104,108],[],[53,72,76],[0,14,39,41,47,51],[67,69],[],[],[],[],[],[62],[59],[62],[],[],[],[],[],[],[],[],[0,1,4,6,7,21,52,59,73,74,82],[],[0,1,4,6,7,21,52,59,73,74,82],[72],[53,72,76],[72],[53,72,76],[],[0,1,4,6,7,21,52,59,73,74,82],[72],[53,72,76],[59],[0,1,4,6,7,21,52,59,73,74,82],[14,39,41,47,51],[20,43,45,49],[72],[67,69],[90,100,106,110],[62],[88,97,102,104,108],[0,8,14,16,29,39,41,47,50,51,78,88,97,102,104,108],[],[],[10,12,13,28,30,57,64,80,84,86,90,100,106,110],[88,97,102,104,108],[62],[90,100,106,110],[8,88,97,102,104,108],[22,55],[],[22,55],[],[],[1,2,3,5,6,20,42,43,44,45,48,49,54,77],[14,39,41,47,51],[0,14,39,41,47,51],[],[20,43,45,49],[72],[59],[],[62],[88,97,102,104,108],[14,39,41,47,51],[],[62,88,97,102,104,108],[88,97,102,104,108],[62],[90,100,106,110],[8,9,12,18,58,59,63,66,81,84,85],[],[56,62,65,87,98,101,103,107],[],[],[],[],[],[],[8,9,12,18,58,59,63,66,81,84,85],[90,100,106,110],[],[56,62,65,87,98,101,103,107],[90,100,106,110],[8,9,12,18,58,59,63,66,81,84,85],[90,100,106,110],[8,9,12,18,58,59,63,66,81,84,85],[],[56,62,65,87,98,101,103,107],[90,100,106,110],[8,9,12,18,58,59,63,66,81,84,85],[],[56,62,65,87,98,101,103,107],[],[],[]
// 	]);
// 	// amazingly this does seem to be correct.
// 	// faces 29-58 apparently have no vertex overlaps.
// 	// faces 51-58 are the crane head. no overlaps.
// 	// face 26, 28 overlap vertex 44, and faces 25, 27 overlap vertex 41
// 	expect(ear.general.lookupArrayToArrayArray(facesVertices)).toMatchObject([
// 		[4,5,6,7,8,41,43,44,46],[5,6,7,8,10,13,16,19,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38],[41],[44],[5,6,7,8,41,43,44,46],[5,6,7,8,41,43,44,46],[16,19,23,26,28,30],[10,13,24,33,35,37],[9,10,11,12,13,39,44,45],[9,10,11,12,13,39,44,45],[9,10,11,12,13,39,44,45],[9,10,11,12,13,39,44,45],[9,10,11,12,13,39,44,45],[9,10,11,12,13,39,44,45],[9,10,11,12,13,39,44,45],[9,10,11,12,13,39,44,45],[15,16,17,18,19,40,41,42],[15,16,17,18,19,40,41,42],[15,16,17,18,19,40,41,42],[15,16,17,18,19,40,41,42],[15,16,17,18,19,40,41,42],[15,16,17,18,19,40,41,42],[15,16,17,18,19,40,41,42],[15,16,17,18,19,40,41,42],[5,6,7,8],[41],[44],[41],[44],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]
// 	]);
// });
