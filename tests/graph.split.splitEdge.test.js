import { expect, test } from "vitest";
import fs from "fs";
import ear from "../src/index.js";

// this feature is now deprecated
// test("split edge similar endpoint", () => {
// 	// kite graph has 6 boundary edges, indices 0-5
// 	// then 3 edges, "V", "V", "F", edges 6, 7, 8.
// 	const graph = ear.graph.kite();

// 	// split an edge but provide the edge's endpoint
// 	// this should not split the edge but just return the existing vertex
// 	const res = ear.graph.splitEdge(graph, 6, [1, 0.41421356237309515]);

// 	// the point we provided is the same as vertex 2
// 	// and edge 6 is an edge which includes vertex 2.
// 	expect(res.vertex).toBe(2);
// });

test("split multiple edges, edge maps, approach 1: reverse order", () => {
	const graph = {
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
	};
	const line = { vector: [0, 1], origin: [0.5, 0.75] };

	// this will intersect edges: [0, 2, 4]
	const { edges } = ear.graph.intersectLineVerticesEdges(graph, line);

	// very important!
	// this sorts the edges in reverse order, this ensure that when we modify
	// the graph, the edge indices that are untouched are smaller than
	// the current edge, this way we always iterate next to an untouched index.
	const splitEdgeMaps = edges
		.map((intersection, edge) => ({ intersection, edge }))
		.filter((a) => a.intersection !== undefined)
		.reverse()
		.map(({ intersection: { point }, edge }) => {
			const {
				edges: { map },
			} = ear.graph.splitEdge(graph, edge, point);
			return map;
		});

	const merge = ear.graph.mergeNextmaps(...splitEdgeMaps);

	expect(edges[0]).not.toBe(undefined);
	expect(edges[1]).toBe(undefined);
	expect(edges[2]).not.toBe(undefined);
	expect(edges[3]).toBe(undefined);
	expect(edges[4]).not.toBe(undefined);

	expect(merge).toMatchObject([[6, 7], [0], [4, 5], [1], [2, 3]]);

	// the corner vertices remained 0-3
	// the new vertices, in reverse order (of edge indices)
	// the diagonal first, then the top boundary, then the bottom boundary.
	expect(graph.vertices_coords).toMatchObject([
		[0, 0],
		[1, 0],
		[1, 1],
		[0, 1],
		[0.5, 0.5],
		[0.5, 1],
		[0.5, 0],
	]);

	// these are the only two edges remaining untouched from the original graph
	// they bubbled up to the first two indices
	expect(graph.edges_vertices[0]).toMatchObject([1, 2]);
	expect(graph.edges_vertices[1]).toMatchObject([3, 0]);
});

test("split multiple edges, edge maps, approach 2: update inside loop", () => {
	const graph = {
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
	};
	const line = { vector: [0, 1], origin: [0.5, 0.75] };

	// this will intersect edges: [0, 2, 4]
	const { edges } = ear.graph.intersectLineVerticesEdges(graph, line);

	// this approach does not bother with any edge sorting, it can work
	// in any order. however, each time we run "splitEdge", because the graph
	// has changed since the last loop, we have to update the intended edge index
	// using the current state of the edgeMap, get the current index of the edge.
	let edgeMap = graph.edges_vertices.map((_, i) => i);
	edges
		.map((intersection, edge) => ({ intersection, edge }))
		.filter((a) => a.intersection !== undefined)
		.forEach(({ intersection: { point }, edge }) => {
			const newEdge = edgeMap[edge];
			const {
				edges: { map },
			} = ear.graph.splitEdge(graph, newEdge, point);
			edgeMap = ear.graph.mergeNextmaps(edgeMap, map);
		});

	expect(edges[0]).not.toBe(undefined);
	expect(edges[1]).toBe(undefined);
	expect(edges[2]).not.toBe(undefined);
	expect(edges[3]).toBe(undefined);
	expect(edges[4]).not.toBe(undefined);

	expect(edgeMap).toMatchObject([[2, 3], [0], [4, 5], [1], [6, 7]]);

	// the corner vertices remained 0-3
	// the new vertices, in correct order (of edge indices)
	// the bottom boundary first, then the top boundary, then the diagonal
	expect(graph.vertices_coords).toMatchObject([
		[0, 0],
		[1, 0],
		[1, 1],
		[0, 1],
		[0.5, 0],
		[0.5, 1],
		[0.5, 0.5],
	]);

	// these are the only two edges remaining untouched from the original graph
	// they bubbled up to the first two indices
	expect(graph.edges_vertices[0]).toMatchObject([1, 2]);
	expect(graph.edges_vertices[1]).toMatchObject([3, 0]);
});

test("splitEdge, interior edge", () => {
	const FOLD = fs.readFileSync("./tests/files/fold/surrounded-square.fold", "utf-8");
	const graph = JSON.parse(FOLD);
	const result = ear.graph.splitEdge(graph, 4, [0.5, 0.2928932188134526]);

	expect(ear.graph.validate(graph).length).toBe(0);

	expect(result).toMatchObject({
		vertex: 8,
		edges: {
			add: [11, 12],
			remove: 4,
			map: [0, 1, 2, 3, [11, 12], 4, 5, 6, 7, 8, 9, 10],
		},
	});

	expect(graph).toMatchObject({
		vertices_vertices: [
			[1, 4, 3],
			[2, 5, 0],
			[3, 6, 1],
			[0, 7, 2],
			[8, 7, 0],
			[6, 8, 1],
			[7, 5, 2],
			[4, 6, 3],
			[4, 5],
		],
		vertices_edges: [
			[0, 7, 3],
			[1, 8, 0],
			[2, 9, 1],
			[3, 10, 2],
			[11, 6, 7],
			[4, 12, 8],
			[5, 4, 9],
			[6, 5, 10],
			[11, 12],
		],
		vertices_faces: [
			[1, 4, null],
			[2, 1, null],
			[3, 2, null],
			[4, 3, null],
			[0, 4, 1],
			[0, 1, 2],
			[0, 2, 3],
			[0, 3, 4],
			[1, 0],
		],
		edges_vertices: [
			[0, 1],
			[1, 2],
			[2, 3],
			[3, 0],
			[5, 6],
			[6, 7],
			[7, 4],
			[0, 4],
			[1, 5],
			[2, 6],
			[3, 7],
			[4, 8],
			[8, 5],
		],
		edges_assignment: ["B", "B", "B", "B", "F", "F", "F", "J", "J", "J", "J", "F", "F"],
		edges_foldAngle: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		edges_faces: [
			[1],
			[2],
			[3],
			[4],
			[0, 2],
			[0, 3],
			[0, 4],
			[4, 1],
			[1, 2],
			[2, 3],
			[3, 4],
			[0, 1],
			[0, 1],
		],
		faces_vertices: [
			[4, 8, 5, 6, 7],
			[0, 1, 5, 8, 4],
			[1, 2, 6, 5],
			[2, 3, 7, 6],
			[3, 0, 4, 7],
		],
		faces_edges: [
			[11, 12, 4, 5, 6],
			[0, 8, 12, 11, 7],
			[1, 9, 4, 8],
			[2, 10, 5, 9],
			[3, 7, 6, 10],
		],
		faces_faces: [
			[1, 1, 2, 3, 4],
			[null, 2, 0, 0, 4],
			[null, 3, 0, 1],
			[null, 4, 0, 2],
			[null, 1, 0, 3],
		],
	});
});

test("splitEdge, exterior edge", () => {
	const FOLD = fs.readFileSync("./tests/files/fold/surrounded-square.fold", "utf-8");
	const graph = JSON.parse(FOLD);
	const result = ear.graph.splitEdge(graph, 0, [0.5, 0]);

	expect(result).toMatchObject({
		vertex: 8,
		edges: {
			add: [11, 12],
			remove: 0,
			map: [[11, 12], 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
		},
	});

	expect(ear.graph.validate(graph).length).toBe(0);

	expect(graph).toMatchObject({
		vertices_vertices: [
			[8, 4, 3],
			[2, 5, 8],
			[3, 6, 1],
			[0, 7, 2],
			[5, 7, 0],
			[6, 4, 1],
			[7, 5, 2],
			[4, 6, 3],
			[0, 1],
		],
		vertices_edges: [
			[11, 7, 2],
			[0, 8, 12],
			[1, 9, 0],
			[2, 10, 1],
			[3, 6, 7],
			[4, 3, 8],
			[5, 4, 9],
			[6, 5, 10],
			[11, 12],
		],
		vertices_faces: [
			[1, 4, null],
			[2, 1, null],
			[3, 2, null],
			[4, 3, null],
			[0, 4, 1],
			[0, 1, 2],
			[0, 2, 3],
			[0, 3, 4],
			[undefined, 1],
		],
		edges_vertices: [
			[1, 2],
			[2, 3],
			[3, 0],
			[4, 5],
			[5, 6],
			[6, 7],
			[7, 4],
			[0, 4],
			[1, 5],
			[2, 6],
			[3, 7],
			[0, 8],
			[8, 1],
		],
		edges_assignment: ["B", "B", "B", "F", "F", "F", "F", "J", "J", "J", "J", "B", "B"],
		edges_foldAngle: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		edges_faces: [
			[2],
			[3],
			[4],
			[0, 1],
			[0, 2],
			[0, 3],
			[0, 4],
			[4, 1],
			[1, 2],
			[2, 3],
			[3, 4],
			[1],
			[1],
		],
		faces_vertices: [
			[4, 5, 6, 7],
			[0, 8, 1, 5, 4],
			[1, 2, 6, 5],
			[2, 3, 7, 6],
			[3, 0, 4, 7],
		],
		faces_edges: [
			[3, 4, 5, 6],
			[11, 12, 8, 3, 7],
			[0, 9, 4, 8],
			[1, 10, 5, 9],
			[2, 7, 6, 10],
		],
		faces_faces: [
			[1, 2, 3, 4],
			[null, null, 2, 0, 4],
			[null, 3, 0, 1],
			[null, 4, 0, 2],
			[null, 1, 0, 3],
		],
	});
});

test("splitEdge ensure winding order around vertices_faces", () => {
	// in this exaple, faces_faces[0] had to duplicate the last index
	// but splice it into the first index to maintain winding order
	// with faces_vertices
	const FOLD = fs.readFileSync("./tests/files/fold/surrounded-square.fold", "utf-8");

	const graph = JSON.parse(FOLD);

	ear.graph.splitEdge(graph, 7, [0.2928932188134526, 0.5]);

	expect(ear.graph.validate(graph).length).toBe(0);

	expect(graph).toMatchObject({
		faces_vertices: [
			[8, 4, 5, 6, 7],
			[0, 1, 5, 4],
			[1, 2, 6, 5],
			[2, 3, 7, 6],
			[3, 0, 4, 8, 7],
		],
		faces_edges: [
			[12, 4, 5, 6, 11],
			[0, 8, 4, 7],
			[1, 9, 5, 8],
			[2, 10, 6, 9],
			[3, 7, 12, 11, 10],
		],
		faces_faces: [
			[4, 1, 2, 3, 4],
			[null, 2, 0, 4],
			[null, 3, 0, 1],
			[null, 4, 0, 2],
			[null, 1, 0, 0, 3],
		],
	});
});

test("splitEdge along every edge, validate", () => {
	const FOLD = fs.readFileSync("./tests/files/fold/surrounded-square.fold", "utf-8");

	const graph = JSON.parse(FOLD);
	const graphs = graph.edges_vertices.map(() => structuredClone(graph));
	graphs.forEach((g, i) => ear.graph.splitEdge(g, i));
	expect(graphs.flatMap((g) => ear.graph.validate(g)).length).toBe(0);
});

test("splitEdge twice, consecutively", () => {
	const FOLD = fs.readFileSync("./tests/files/fold/surrounded-square.fold", "utf-8");

	const graph = JSON.parse(FOLD);

	ear.graph.splitEdge(graph, 7);

	expect(graph).toMatchObject({
		vertices_vertices: [
			[1, 4, 3],
			[2, 5, 0],
			[3, 6, 1],
			[0, 7, 2],
			[5, 8, 0],
			[6, 4, 1],
			[7, 5, 2],
			[8, 6, 3],
			[7, 4],
		],
		vertices_edges: [
			[0, 7, 3],
			[1, 8, 0],
			[2, 9, 1],
			[3, 10, 2],
			[4, 12, 7],
			[5, 4, 8],
			[6, 5, 9],
			[11, 6, 10],
			[11, 12],
		],
		vertices_faces: [
			[1, 4, null],
			[2, 1, null],
			[3, 2, null],
			[4, 3, null],
			[0, 4, 1],
			[0, 1, 2],
			[0, 2, 3],
			[0, 3, 4],
			[4, 0],
		],
		edges_vertices: [
			[0, 1],
			[1, 2],
			[2, 3],
			[3, 0],
			[4, 5],
			[5, 6],
			[6, 7],
			[0, 4],
			[1, 5],
			[2, 6],
			[3, 7],
			[7, 8],
			[8, 4],
		],
		edges_assignment: ["B", "B", "B", "B", "F", "F", "F", "J", "J", "J", "J", "F", "F"],
		edges_foldAngle: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		edges_faces: [
			[1],
			[2],
			[3],
			[4],
			[0, 1],
			[0, 2],
			[0, 3],
			[4, 1],
			[1, 2],
			[2, 3],
			[3, 4],
			[0, 4],
			[0, 4],
		],
		faces_vertices: [
			[8, 4, 5, 6, 7],
			[0, 1, 5, 4],
			[1, 2, 6, 5],
			[2, 3, 7, 6],
			[3, 0, 4, 8, 7],
		],
		faces_edges: [
			[12, 4, 5, 6, 11],
			[0, 8, 4, 7],
			[1, 9, 5, 8],
			[2, 10, 6, 9],
			[3, 7, 12, 11, 10],
		],
		faces_faces: [
			[4, 1, 2, 3, 4],
			[null, 2, 0, 4],
			[null, 3, 0, 1],
			[null, 4, 0, 2],
			[null, 1, 0, 0, 3],
		],
	});

	ear.graph.splitEdge(graph, 11);

	expect(graph).toMatchObject({
		vertices_vertices: [
			[1, 4, 3],
			[2, 5, 0],
			[3, 6, 1],
			[0, 7, 2],
			[5, 8, 0],
			[6, 4, 1],
			[7, 5, 2],
			[9, 6, 3],
			[9, 4],
			[7, 8],
		],
		vertices_edges: [
			[0, 7, 3],
			[1, 8, 0],
			[2, 9, 1],
			[3, 10, 2],
			[4, 11, 7],
			[5, 4, 8],
			[6, 5, 9],
			[12, 6, 10],
			[13, 11],
			[12, 13],
		],
		vertices_faces: [
			[1, 4, null],
			[2, 1, null],
			[3, 2, null],
			[4, 3, null],
			[0, 4, 1],
			[0, 1, 2],
			[0, 2, 3],
			[0, 3, 4],
			[4, 0],
			[4, 0],
		],
		edges_vertices: [
			[0, 1],
			[1, 2],
			[2, 3],
			[3, 0],
			[4, 5],
			[5, 6],
			[6, 7],
			[0, 4],
			[1, 5],
			[2, 6],
			[3, 7],
			[8, 4],
			[7, 9],
			[9, 8],
		],
		edges_assignment: [
			"B",
			"B",
			"B",
			"B",
			"F",
			"F",
			"F",
			"J",
			"J",
			"J",
			"J",
			"F",
			"F",
			"F",
		],
		edges_foldAngle: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		edges_faces: [
			[1],
			[2],
			[3],
			[4],
			[0, 1],
			[0, 2],
			[0, 3],
			[4, 1],
			[1, 2],
			[2, 3],
			[3, 4],
			[0, 4],
			[0, 4],
			[0, 4],
		],
		faces_vertices: [
			[9, 8, 4, 5, 6, 7],
			[0, 1, 5, 4],
			[1, 2, 6, 5],
			[2, 3, 7, 6],
			[3, 0, 4, 8, 9, 7],
		],
		faces_edges: [
			[13, 11, 4, 5, 6, 12],
			[0, 8, 4, 7],
			[1, 9, 5, 8],
			[2, 10, 6, 9],
			[3, 7, 11, 13, 12, 10],
		],
		faces_faces: [
			[4, 4, 1, 2, 3, 4],
			[null, 2, 0, 4],
			[null, 3, 0, 1],
			[null, 4, 0, 2],
			[null, 1, 0, 0, 0, 3],
		],
	});

	expect(ear.graph.validate(graph).length).toBe(0);
});

test("splitEdge this will be used in splitFace tests", () => {
	const FOLD = fs.readFileSync("./tests/files/fold/surrounded-square.fold", "utf-8");

	const graph = JSON.parse(FOLD);

	// split edges 4 and 6
	ear.graph.splitEdge(graph, 4);
	ear.graph.splitEdge(graph, 5); // used to be 6

	expect(graph).toMatchObject({
		vertices_vertices: [
			[1, 4, 3],
			[2, 5, 0],
			[3, 6, 1],
			[0, 7, 2],
			[8, 7, 0],
			[6, 8, 1],
			[9, 5, 2],
			[4, 9, 3],
			[4, 5],
			[6, 7],
		],
		vertices_edges: [
			[0, 6, 3],
			[1, 7, 0],
			[2, 8, 1],
			[3, 9, 2],
			[10, 5, 6],
			[4, 11, 7],
			[12, 4, 8],
			[5, 13, 9],
			[10, 11],
			[12, 13],
		],
		vertices_faces: [
			[1, 4, null],
			[2, 1, null],
			[3, 2, null],
			[4, 3, null],
			[0, 4, 1],
			[0, 1, 2],
			[0, 2, 3],
			[0, 3, 4],
			[1, 0],
			[3, 0],
		],
		edges_vertices: [
			[0, 1],
			[1, 2],
			[2, 3],
			[3, 0],
			[5, 6],
			[7, 4],
			[0, 4],
			[1, 5],
			[2, 6],
			[3, 7],
			[4, 8],
			[8, 5],
			[6, 9],
			[9, 7],
		],
		edges_assignment: [
			"B",
			"B",
			"B",
			"B",
			"F",
			"F",
			"J",
			"J",
			"J",
			"J",
			"F",
			"F",
			"F",
			"F",
		],
		edges_foldAngle: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		edges_faces: [
			[1],
			[2],
			[3],
			[4],
			[0, 2],
			[0, 4],
			[4, 1],
			[1, 2],
			[2, 3],
			[3, 4],
			[0, 1],
			[0, 1],
			[0, 3],
			[0, 3],
		],
		faces_vertices: [
			[4, 8, 5, 6, 9, 7],
			[0, 1, 5, 8, 4],
			[1, 2, 6, 5],
			[2, 3, 7, 9, 6],
			[3, 0, 4, 7],
		],
		faces_edges: [
			[10, 11, 4, 12, 13, 5],
			[0, 7, 11, 10, 6],
			[1, 8, 4, 7],
			[2, 9, 13, 12, 8],
			[3, 6, 5, 9],
		],
		faces_faces: [
			[1, 1, 2, 3, 3, 4],
			[null, 2, 0, 0, 4],
			[null, 3, 0, 1],
			[null, 4, 0, 0, 2],
			[null, 1, 0, 3],
		],
	});

	expect(ear.graph.validate(graph).length).toBe(0);
});
