import { expect, test } from "vitest";
import fs from "fs";
import ear from "../src/index.js";

test("make faces_faces, square", () => {
	const result = ear.graph.makeFacesFaces({
		faces_vertices: [
			[0, 1, 3],
			[2, 3, 1],
		],
	});
	expect(result.length).toBe(2);
	expect(result[0]).toEqual(expect.arrayContaining([1]));
	expect(result[1]).toEqual(expect.arrayContaining([0]));
});

test("make faces_faces, invalid faces", () => {
	const res1 = ear.graph.makeFacesFaces({
		faces_vertices: [[undefined], [undefined]],
	});
	expect(res1[0]).toEqual(expect.arrayContaining([1]));
	expect(res1[1]).toEqual(expect.arrayContaining([0]));

	// lol. look, it will match anything including strings
	expect(ear.graph.makeFacesFaces({ faces_vertices: [["hi"], ["hi"]] })).toMatchObject([
		[1],
		[0],
	]);
	expect(ear.graph.makeFacesFaces({ faces_vertices: [["hi"], ["bye"]] })).toMatchObject([
		[undefined],
		[undefined],
	]);
});

test("make faces_faces, degenerate", () => {
	// technically these edges are invalid
	// should be one empty face_face array
	expect(ear.graph.makeFacesFaces({ faces_vertices: [[0, 0]] })).toMatchObject([
		[undefined, undefined],
	]);
});

test("make faces_faces 4", () =>
	new Promise((done) => {
		try {
			ear.graph.makeFacesFaces({
				faces_vertices: [[0], [1], undefined, [2]],
			});
		} catch (error) {
			expect(error).not.toBe(undefined);
			done();
		}
	}));

test("make faces_faces 5", () =>
	new Promise((done) => {
		try {
			ear.graph.makeFacesFaces();
		} catch (error) {
			expect(error).not.toBe(undefined);
			done();
		}
	}));

test("make faces_faces 6", () =>
	new Promise((done) => {
		try {
			ear.graph.makeFacesFaces({});
		} catch (error) {
			expect(error).not.toBe(undefined);
			done();
		}
	}));

test("make faces_faces 7", () => {
	const result = ear.graph.makeFacesFaces({ faces_vertices: [] });
	expect(result.length).toBe(0);
});

test("kabuto", () => {
	const FOLD = fs.readFileSync("./tests/files/fold/kabuto.fold", "utf-8");
	const kabuto = JSON.parse(FOLD);
	const faces_faces = ear.graph.makeFacesFaces(kabuto);

	expect(faces_faces).toMatchObject([
		[8, 3, 9],
		[2, 10, 11],
		[1, undefined, undefined],
		[0, undefined, 4, undefined],
		[3, undefined, 5, undefined],
		[4, undefined, undefined],
		[16, undefined, 8],
		[17, 9, undefined],
		[0, 10, 6],
		[0, 7, 11],
		[12, 8, 1],
		[13, 1, 9],
		[10, undefined, 14],
		[11, 15, undefined],
		[16, 12, undefined],
		[17, undefined, 13],
		[6, 14, undefined],
		[7, undefined, 15],
	]);
});

test("face that repeats an edge", () => {
	const graph = {
		vertices_coords: [
			[0, 0],
			[1, 0],
			[1, 1],
			[0, 1],
			[0.5, 0.5],
		],
		edges_vertices: [
			[0, 1],
			[1, 2],
			[2, 4],
			[4, 2],
			[2, 3],
			[3, 0],
		],
		edges_assignment: ["B", "B", "B", "B", "B", "B"],
		faces_vertices: [[0, 1, 2, 4, 2, 3]],
		faces_edges: [[0, 1, 2, 3, 4, 5]],
	};
	ear.graph.populate(graph);

	// 6 entries of undefined
	expect(graph.faces_faces).toMatchObject([
		[undefined, undefined, undefined, undefined, undefined, undefined],
	]);
});
