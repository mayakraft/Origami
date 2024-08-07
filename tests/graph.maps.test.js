import { expect, test } from "vitest";
import ear from "../src/index.js";

const objMatch = (a, b) => expect(JSON.stringify(a)).toBe(JSON.stringify(b));

const arrMatch = (a, b) => {
	a.forEach((_, i) => expect(a[i] === b[i]).toBe(true));
	expect(a.length).toBe(b.length);
};

test("merge simple next map", () => {
	const map1 = [0, 1, 2, 2, 3, 1, 4, 5];
	const map2 = [0, 1, 1, 2, 0, 3];
	const res = ear.graph.mergeFlatNextmaps(map1, map2);
	objMatch(res, [0, 1, 1, 1, 2, 1, 0, 3]);
});

test("merge nextmap", () => {
	const map1 = [
		[0, 1, 2],
		[3, 4, 5, 6],
		[7, 8],
		[9, 10],
	];
	const map2 = [0, 1, 2, 3, [4, 5, 6, 7], 8, 9, 10, 11, 12, 13];
	const res = ear.graph.mergeNextmaps(map1, map2);
	objMatch(res, [
		[0, 1, 2],
		[3, 4, 5, 6, 7, 8, 9],
		[10, 11],
		[12, 13],
	]);
});

test("merge simple backmap", () => {
	const map1 = [0, 0, 0, 1, 1, 1, 1, 2, 2, 3, 3];
	const map2 = [0, 1, 2, 3, 4, 4, 4, 4, 5, 6, 7, 8, 9, 10];
	const res = ear.graph.mergeFlatBackmaps(map1, map2);
	objMatch(res, [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 2, 2, 3, 3]);
});

test("merge backmap", () => {
	const map1 = [0, [1, 5], [2, 3], 4, 6, 7];
	const map2 = [[0, 4], 1, [2, 5], 3];
	const res = ear.graph.mergeBackmaps(map1, map2);
	objMatch(res, [[0, 6], [1, 5], [2, 3, 7], [4]]);
});

test("merge backmap no nested", () => {
	const map1 = [0, 1, 2, 3, 4, 5];
	const map2 = [0, 1, 2, 3, 4, 5];
	const res = ear.graph.mergeBackmaps(map1, map2);
	expect(res).toMatchObject([[0], [1], [2], [3], [4], [5]]);
});

test("merge nextmap no nested", () => {
	const map1 = [0, 1, 2, 3, 4, 5];
	const map2 = [0, 1, 2, 3, 4, 5];
	const res = ear.graph.mergeNextmaps(map1, map2);
	expect(res).toMatchObject([[0], [1], [2], [3], [4], [5]]);
});

test("merge with undefineds", () => {
	// [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
	const map1 = [0, 1, 2, null, 3, 4, null, null, 5, 6];
	const map2 = [0, null, 1, 2, 3, 4, null];
	// const expected = [0, null, 1, null, 2, 3, null, null, 4, null];
	const expected = [0, null, 1, undefined, 2, 3, undefined, undefined, 4, null];
	const res = ear.graph.mergeFlatNextmaps(map1, map2);
	arrMatch(res, expected);
});

test("inverse map", () => {
	// [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
	const map1 = [0, 1, 2, null, 3, 4, null, null, 5, 6];
	const map2 = [0, null, 1, 2, 3, 4, null];
	const res = ear.graph.invertFlatMap(ear.graph.mergeFlatNextmaps(map1, map2));
	const expected = [0, 2, 4, 5, 8];
	arrMatch(res, expected);
});
