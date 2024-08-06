import { expect, test } from "vitest";
import ear from "../src/index.js";

test("edges_edges square", () => {
	const graph = {
		edges_vertices: [
			[0, 1],
			[1, 2],
			[2, 3],
			[3, 0],
		],
	};
	graph.vertices_edges = ear.graph.makeVerticesEdgesUnsorted(graph);
	const result = ear.graph.makeEdgesEdges(graph);
	expect(result[0]).toEqual(expect.arrayContaining([3, 1]));
	expect(result[1]).toEqual(expect.arrayContaining([0, 2]));
	expect(result[2]).toEqual(expect.arrayContaining([1, 3]));
	expect(result[3]).toEqual(expect.arrayContaining([2, 0]));
});

test("edges_edges line", () => {
	const graph = {
		edges_vertices: [
			[0, 1],
			[1, 2],
			[2, 3],
			[3, 4],
			[4, 5],
			[5, 6],
			[6, 7],
		],
	};
	graph.vertices_edges = ear.graph.makeVerticesEdgesUnsorted(graph);
	const result = ear.graph.makeEdgesEdges(graph);
	expect(result[0]).toEqual(expect.arrayContaining([1]));
	expect(result[1]).toEqual(expect.arrayContaining([0, 2]));
	expect(result[2]).toEqual(expect.arrayContaining([1, 3]));
	expect(result[3]).toEqual(expect.arrayContaining([2, 4]));
	expect(result[4]).toEqual(expect.arrayContaining([3, 5]));
	expect(result[5]).toEqual(expect.arrayContaining([4, 6]));
	expect(result[6]).toEqual(expect.arrayContaining([5]));
});

test("edges_edges, no edge adjacency", () => {
	const graph = {
		edges_vertices: [
			[0, 1],
			[2, 3],
			[4, 5],
			[6, 7],
		],
	};
	graph.vertices_edges = ear.graph.makeVerticesEdgesUnsorted(graph);
	const result = ear.graph.makeEdgesEdges(graph);
	expect(result[0].length).toBe(0);
	expect(result[1].length).toBe(0);
	expect(result[2].length).toBe(0);
	expect(result[3].length).toBe(0);
});

test("edges_edges, bad edge construction", () => {
	const graph = {
		edges_vertices: [
			[0, 1, 2],
			[2, 3, 4],
			[4, 5, 6],
		],
	};
	graph.vertices_edges = ear.graph.makeVerticesEdgesUnsorted(graph);
	const result = ear.graph.makeEdgesEdges(graph);
	expect(result[0].length).toBe(0);
	expect(result[1]).toEqual(expect.arrayContaining([0]));
	expect(result[2]).toEqual(expect.arrayContaining([1]));
});

// test("make edges_edges 1", () => {
//   const result = ear.graph.makeEdgesEdges({
//     edges_vertices: [[0, 1], [1,2], [2,3], [3,0]],
//   });
//   expect(result[0]).toEqual(expect.arrayContaining([0, 3]));
//   expect(result[1]).toEqual(expect.arrayContaining([0, 1]));
//   expect(result[2]).toEqual(expect.arrayContaining([1, 2]));
//   expect(result[3]).toEqual(expect.arrayContaining([2, 3]));
// });

// test("make edges_edges, invalid faces", () => {
//   const res1 = ear.graph.makeEdgesEdges({
//     edges_vertices: [[undefined], [undefined]]
//   });
//   expect(res1[0]).toEqual(expect.arrayContaining([1]));
//   expect(res1[1]).toEqual(expect.arrayContaining([0]));
//   // lol. look, it will match anything including strings
//   const res2 = ear.graph.makeEdgesEdges({ edges_vertices: [["hi"], ["hi"]] });
//   expect(res2[0]).toEqual(expect.arrayContaining([1]));
//   expect(res2[1]).toEqual(expect.arrayContaining([0]));
//   const res3 = ear.graph.makeEdgesEdges({ edges_vertices: [["hi"], ["bye"]] });
//   expect(res3[0].length).toBe(0);
//   expect(res3[1].length).toBe(0);
// });

// test("make edges_edges 3", () => {
//   // technically these edges are invalid
//   const result = ear.graph.makeEdgesEdges({
//     edges_vertices: [[0, 1, 2, 3, 4], [5, 6]],
//   });
//   [[0], [0], [0], [0], [0], [1], [1]].forEach((arr, i) => {
//     expect(result[i]).toEqual(expect.arrayContaining(arr));
//   })
// });

// test("make edges_edges 4", () => new Promise(done => {
//   try {
//     const result = ear.graph.makeEdgesEdges({
//       edges_vertices: [[0], [1], undefined, [2]],
//     });
//   } catch (error) {
//     expect(error).not.toBe(undefined);
//     done();
//   }
// }));

test("make edges_edges 5", () =>
	new Promise((done) => {
		try {
			const result = ear.graph.makeEdgesEdges();
		} catch (error) {
			expect(error).not.toBe(undefined);
			done();
		}
	}));

test("make edges_edges 6", () =>
	new Promise((done) => {
		try {
			const result = ear.graph.makeEdgesEdges({});
		} catch (error) {
			expect(error).not.toBe(undefined);
			done();
		}
	}));

test("make edges_edges 7", () => {
	const result = ear.graph.makeEdgesEdges({ edges_vertices: [] });
	expect(result.length).toBe(0);
});
