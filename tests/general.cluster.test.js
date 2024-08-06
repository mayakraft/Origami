import { expect, test } from "vitest";
import ear from "../src/index.js";

test("clusterSortedGeneric", () => {});

test("clusterScalars", () => {
	expect(
		ear.general.clusterScalars([1, 2, 3, 6, 9, 13, 14, 15, 19, 21, 25, 26, 27], 1.5),
	).toMatchObject([[0, 1, 2], [3], [4], [5, 6, 7], [8], [9], [10, 11, 12]]);

	expect(
		ear.general.clusterScalars([, , 3, 8, 9, 13, 14, , 19, 21, 25, 26, 27], 1.5),
	).toMatchObject([[2], [3, 4], [5, 6], [8], [9], [10, 11, 12]]);
});

test("clusterRanges", () => {
	expect(
		ear.general.clusterRanges([
			[0, 1],
			[1, 2],
			[2, 3],
			[3, 4],
		]),
	).toMatchObject([[0], [1], [2], [3]]);
	expect(
		ear.general.clusterRanges([
			[0, 2],
			[1, 3],
			[5, 7],
			[2, 6],
		]),
	).toMatchObject([[0, 1, 3, 2]]);
	expect(
		ear.general.clusterRanges([
			[0, 2],
			[1, 3],
			[5, 7],
		]),
	).toMatchObject([[0, 1], [2]]);
	expect(
		ear.general.clusterRanges([
			[0, 2],
			[1, 3],
			[5, 7],
		]),
	).toMatchObject([[0, 1], [2]]);
	expect(
		ear.general.clusterRanges([
			[4, 6],
			[1, 3],
			[0, 1],
		]),
	).toMatchObject([[2], [1], [0]]);
	expect(
		ear.general.clusterRanges([
			[4, 6],
			[1, 3],
			[0, 2],
		]),
	).toMatchObject([[2, 1], [0]]);
	expect(
		ear.general.clusterRanges([
			[0, 6],
			[2, 3],
			[1, 2],
		]),
	).toMatchObject([[0, 2, 1]]);
});

test("clusterRanges, some ranges inverted", () => {
	expect(
		ear.general.clusterRanges([
			[1, 0],
			[1, 2],
			[3, 2],
			[3, 4],
		]),
	).toMatchObject([[0], [1], [2], [3]]);
	expect(
		ear.general.clusterRanges([
			[2, 0],
			[1, 3],
			[7, 5],
			[2, 6],
		]),
	).toMatchObject([[0, 1, 3, 2]]);
	expect(
		ear.general.clusterRanges([
			[2, 0],
			[1, 3],
			[7, 5],
		]),
	).toMatchObject([[0, 1], [2]]);
	expect(
		ear.general.clusterRanges([
			[2, 0],
			[1, 3],
			[7, 5],
		]),
	).toMatchObject([[0, 1], [2]]);
	expect(
		ear.general.clusterRanges([
			[6, 4],
			[1, 3],
			[1, 0],
		]),
	).toMatchObject([[2], [1], [0]]);
	expect(
		ear.general.clusterRanges([
			[6, 4],
			[1, 3],
			[2, 0],
		]),
	).toMatchObject([[2, 1], [0]]);
	// this would have failed if we didn't sort the ranges so that [0] is smaller
	expect(
		ear.general.clusterRanges([
			[6, 0],
			[3, 2],
			[2, 1],
		]),
	).toMatchObject([[0, 2, 1]]);
});

test("clusterParallelVectors", () => {});
