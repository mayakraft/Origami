import { expect, test } from "vitest";
import ear from "../src/index.js";

// this graph looks like this: (except, square)
//
//  o--o--o--o--o--o--o--o--o-----o
//  |                             |
//  o-----------------------------o
//
const collinearSquare = {
	vertices_coords: [
		[0, 0],
		[0.1, 0],
		[0.2, 0],
		[0.3, 0],
		[0.4, 0],
		[0.5, 0],
		[0.6, 0],
		[0.7, 0],
		[0.8, 0],
		[1, 0],
		[1, 1],
		[0, 1],
	],
	vertices_vertices: [
		[11, 1],
		[0, 2],
		[1, 3],
		[2, 4],
		[3, 5],
		[4, 6],
		[5, 7],
		[6, 8],
		[7, 9],
		[8, 10],
		[9, 11],
		[10, 0],
	],
	vertices_faces: [[0], [0], [0], [0], [0], [0], [0], [0], [0], [0], [0], [0]],
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
		[9, 10],
		[10, 11],
		[11, 0],
	],
	edges_faces: [[0], [0], [0], [0], [0], [0], [0], [0], [0], [0], [0], [0]],
	edges_assignment: ["B", "B", "B", "B", "B", "B", "B", "B", "B", "B", "B", "B"],
	edges_foldAngle: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	faces_vertices: [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]],
	faces_edges: [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]],
};

test("isVertexCollinear", () => {
	const expected = [
		false,
		true,
		true,
		true,
		true,
		true,
		true,
		true,
		true,
		false,
		false,
		false,
	];
	const isCollinear = collinearSquare.vertices_coords.map((_, i) =>
		ear.graph.isVertexCollinear(collinearSquare, i),
	);
	expect(JSON.stringify(expected)).toBe(JSON.stringify(isCollinear));
});

// test("remove collinear vertices", () => {
// 	const graph = {
// 		vertices_coords: [
// 			[-1, 1], [-1, 0], [0, 0], [1, 1], [2, 2], [3, 2], [-1, 5], [-1, 4], [-1, 3], [-1, 2],
// 		],
// 		edges_vertices: [
// 			[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 0],
// 		],
// 		edges_assignment: ["M", "M", "M", "M", "M", "M", "M", "M", "M", "M"],
// 	};
// 	graph.vertices_edges = ear.graph.makeVerticesEdgesUnsorted(graph);
// 	// ear.graph.populate(graph);

// 	const collinearVertices = graph.vertices_coords
// 		.map((_, i) => (ear.graph.isVertexCollinear(graph, i) ? i : undefined))
// 		.filter(a => a !== undefined)
// 		.sort((a, b) => b - a);
// 	expect(collinearVertices.length).toBe(5);
// 	expect(JSON.stringify(collinearVertices)).toBe(JSON.stringify([9, 8, 7, 3, 0]));

// 	collinearVertices.forEach(v => ear.graph.removeCollinearVertex(graph, v));
// 	console.log(graph);
// 	// this should have removed the vertex [1, 1]
// 	// the next vertex should have shifted up by 1
// 	expect(graph.vertices_coords.length).toBe(5);
// 	expect(graph.vertices_coords[2][0]).toBe(2);
// 	expect(graph.vertices_coords[2][1]).toBe(2);
// });
