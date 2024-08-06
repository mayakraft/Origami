import { expect, test } from "vitest";
import xmldom from "@xmldom/xmldom";
import ear from "../src/index.js";

ear.svg.window = xmldom;

test("all methods that return the graph itself", () => {
	const graph = ear.graph.fish();
	const result = graph
		.populate()
		.invertAssignments()
		// .transform([2, 0, 0, 0, 2, 0, 0, 0, 2, 1, 2, 3])
		.scaleUniform(2)
		.scale([1, 2, 3])
		.translate([1, 2])
		.rotate(Math.PI / 2, [0, 0, 1], [0.5, 0.5])
		.rotateZ(Math.PI / 2, [0.5, 0.5])
		.unitize();
	expect(result instanceof ear.graph).toBe(true);
});

test("all methods that return something else", () => {
	const graph = ear.graph.fish();

	graph.clean();
	graph.subgraph({ vertices: [0, 1, 2, 3] });
	graph.boundary();
	graph.boundaries();
	graph.planarBoundary();
	graph.planarBoundaries();
	graph.boundingBox();
	graph.nearestVertex([0.5, 0.5]);
	graph.nearestEdge([0.5, 0.5]);
	graph.nearestFace([0.5, 0.5]);
	graph.splitEdge(0, [0, 0.1]);
	graph.svg();
	graph.obj();
	graph.explodeFaces();
	graph.explodeEdges();
	graph.validate();

	expect(true).toBe(true);
});

test("copy", () => {
	const graph = ear.graph({
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
		faces_vertices: [
			[0, 1, 2],
			[2, 3, 0],
		],
		faces_edges: [
			[0, 1, 4],
			[2, 3, 4],
		],
	});
	const copy = graph.clone();
	graph.vertices_coords = [];
	expect(copy.vertices_coords.length).toBe(4);
	expect(graph.vertices_coords.length).toBe(0);
});

// "load" has been removed for now.
// test("load", () => {
//   const graph = ear.graph();
//   // this shouldn't do anything, but also won't throw an error
//   graph.load();
//   // now, load.
//   graph.load({
//     vertices_coords: [[0,0], [1,0], [1,1], [0,1]],
//     edges_vertices: [[0, 1], [1, 2], [2, 3], [3, 0], [0, 2]],
//     faces_vertices: [[0, 1, 2], [2, 3, 0]],
//     faces_edges: [[0, 1, 4], [2, 3, 4]],
//   });
//   expect(graph.vertices_coords.length).toBe(4);
//   expect(graph.vertices_coords[2][0]).toBe(1);
//   expect(graph.vertices_coords[2][1]).toBe(1);
// });

// test("load, rewrite, and append", () => {
//   const graph = ear.graph();
//   graph.load({
//     edges_assignment: ["V", "M", "U", "F"],
//   });
//   expect(graph.edges_assignment[3]).toBe("F");
//   graph.load({
//     edges_assignment: ["U", "U", "U", "U"],
//   });
//   expect(graph.edges_assignment[3]).toBe("U");
//   graph.load({
//     vertices_coords: [[0.5, 0.5], [0.25, 0.25]],
//   });
//   // edges_assignment has been overwritten
//   expect(graph.edges_assignment).toBe(undefined);
//   expect(graph.vertices_coords[0][0]).toBe(0.5);
//   // now load a graph but don't overwrite
//   graph.load({
//     edges_assignment: ["U", "U", "U", "U"],
//   }, { append: true });
//   expect(graph.edges_assignment[3]).toBe("U");
//   expect(graph.vertices_coords[0][0]).toBe(0.5);
// });

// test("clear", () => {
// 	const graph = ear.graph({
// 		vertices_coords: [[0, 0], [1, 0], [1, 1], [0, 1]],
// 		edges_vertices: [[0, 1], [1, 2], [2, 3], [3, 0], [0, 2]],
// 		faces_vertices: [[0, 1, 2], [2, 3, 0]],
// 		faces_edges: [[0, 1, 4], [2, 3, 4]],
// 	});
// 	graph.clear();
// 	expect(graph.vertices_coords).toBe(undefined);
// 	expect(graph.edges_vertices).toBe(undefined);
// 	expect(graph.faces_vertices).toBe(undefined);
// 	expect(graph.faces_edges).toBe(undefined);
// });

test("populate", () => {
	const graph = ear.graph({
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
		edges_assignment: [
			"B",
			"B",
			"B",
			"B",
			"B",
			"B",
			"B",
			"B",
			"B",
			"B",
			"V",
			"V",
			"V",
			"V",
		],
	});

	const extra_keys = [
		"vertices_edges",
		"vertices_faces",
		"vertices_vertices",
		"edges_vertices",
		"edges_faces",
		"faces_vertices",
		"faces_edges",
		"faces_faces",
	];
	// calling graph() initializer now automatically runs populate();
	// extra_keys.forEach(key => expect(graph.vertices_vertices).toBe(undefined));
	graph.populate();
	extra_keys.forEach((key) => expect(graph[key]).not.toBe(undefined));
});

test("affine transforms", () => {
	const graph = ear.graph({
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
		edges_assignment: [
			"B",
			"B",
			"B",
			"B",
			"B",
			"B",
			"B",
			"B",
			"B",
			"B",
			"V",
			"V",
			"V",
			"V",
		],
	});
	graph.translate([4, 8]);
	expect(graph.vertices_coords[5][0]).toBe(8);
	expect(graph.vertices_coords[5][1]).toBe(9);
	graph.scaleUniform(0.5);
	expect(graph.vertices_coords[5][0]).toBe(4);
	expect(graph.vertices_coords[5][1]).toBe(4.5);
});
