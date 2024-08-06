import { expect, test } from "vitest";
import ear from "../src/index.js";

const arraysMatch = (a, b) => a.forEach((_, i) => expect(a[i]).toBe(b[i]));

test("uniqueElements", () => {
	// Test case 1: Array with duplicate elements
	const testArray1 = [1, 2, 3, 4, 4, 5, 5];
	const result1 = ear.general.uniqueElements(testArray1);
	expect(JSON.stringify(result1)).toBe(JSON.stringify([1, 2, 3, 4, 5]));

	// Test case 2: Array with all unique elements
	const testArray2 = [6, 7, 8, 9, 10];
	const result2 = ear.general.uniqueElements(testArray2);
	expect(JSON.stringify(result2)).toBe(JSON.stringify([6, 7, 8, 9, 10]));

	// Test case 3: Array with all duplicate elements
	const testArray3 = [11, 11, 11, 11, 11];
	const result3 = ear.general.uniqueElements(testArray3);
	expect(JSON.stringify(result3)).toBe(JSON.stringify([11]));

	// Test case 4: Array with mixed data types
	const testArray4 = ["a", "b", "c", "b", "d", "a", 1, 2, 3, 2];
	const result4 = ear.general.uniqueElements(testArray4);
	expect(JSON.stringify(result4)).toBe(JSON.stringify(["a", "b", "c", "d", 1, 2, 3]));

	// Test case 5: Array with objects
	const testArray5 = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 1 }];
	const result5 = ear.general.uniqueElements(testArray5);
	expect(JSON.stringify(result5)).toBe(
		JSON.stringify([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 1 }]),
	);
});

test("nonUniqueElements - Array with no unique elements", () => {
	const array = [1, 2, 2, 3, 3, 3, 4, 4, 4, 4];
	const result = ear.general.nonUniqueElements(array);
	expect(result).toEqual([2, 2, 3, 3, 3, 4, 4, 4, 4]);
});

test("nonUniqueElements - Array with all unique elements", () => {
	const array = [1, 2, 3, 4, 5];
	const result = ear.general.nonUniqueElements(array);
	expect(result).toEqual([]);
});

test("nonUniqueElements - Array with some unique elements", () => {
	const array = [1, 2, 2, 3, 4, 4, 5];
	const result = ear.general.nonUniqueElements(array);
	expect(result).toEqual([2, 2, 4, 4]);
});

test("nonUniqueElements - Array with strings", () => {
	const array = ["apple", "banana", "banana", "cherry", "date", "date", "date"];
	const result = ear.general.nonUniqueElements(array);
	expect(result).toEqual(["banana", "banana", "date", "date", "date"]);
});

test("nonUniqueElements - Empty array", () => {
	const array = [];
	const result = ear.general.nonUniqueElements(array);
	expect(result).toEqual([]);
});

test("nonUniqueElements - Array with one element", () => {
	const array = [1];
	const result = ear.general.nonUniqueElements(array);
	expect(result).toEqual([]);
});

test("uniqueSortedNumbers", () => {
	const array = Array.from(Array(10000)).map(() => Math.floor(Math.random() * 1000));
	const result = ear.general.uniqueSortedNumbers(array);
	expect(result.length).toBeLessThan(array.length);
});

test("uniqueSortedNumbers - Array with no duplicates", () => {
	const array = [1, 2, 3, 4, 5];
	const result = ear.general.uniqueSortedNumbers(array);
	expect(result).toEqual([1, 2, 3, 4, 5]);
});

test("uniqueSortedNumbers - Array with duplicates", () => {
	const array = [1, 2, 2, 3, 3, 3, 4, 4, 4, 4];
	const result = ear.general.uniqueSortedNumbers(array);
	expect(result).toEqual([1, 2, 3, 4]);
});

test("uniqueSortedNumbers - Array with negative numbers", () => {
	const array = [-5, -4, -3, -3, -2, -2, -1];
	const result = ear.general.uniqueSortedNumbers(array);
	expect(result).toEqual([-5, -4, -3, -2, -1]);
});

test("uniqueSortedNumbers - Array with floating point numbers", () => {
	const array = [1.5, 2.3, 2.3, 3.7, 3.7, 3.7];
	const result = ear.general.uniqueSortedNumbers(array);
	expect(result).toEqual([1.5, 2.3, 3.7]);
});

test("uniqueSortedNumbers - Empty array", () => {
	const array = [];
	const result = ear.general.uniqueSortedNumbers(array);
	expect(result).toEqual([]);
});

test("uniqueSortedNumbers - Array with one element", () => {
	const array = [1];
	const result = ear.general.uniqueSortedNumbers(array);
	expect(result).toEqual([1]);
});

test("epsilonUniqueSortedNumbers - Array with no elements within epsilon", () => {
	const array = [1, 2, 3, 4, 5];
	const epsilon = 0.5;
	const result = ear.general.epsilonUniqueSortedNumbers(array, epsilon);
	expect(result).toEqual([1, 2, 3, 4, 5]);
});

test("epsilonUniqueSortedNumbers - Array with elements within epsilon", () => {
	const array = [1, 1.2, 1.5, 2, 2.3, 3, 3.4, 3.5, 4, 4.7, 5];
	const epsilon = 0.5;
	const result = ear.general.epsilonUniqueSortedNumbers(array, epsilon);
	expect(result).toEqual([1, 2, 3, 4, 4.7]);
});

test("epsilonUniqueSortedNumbers - Array with negative numbers within epsilon", () => {
	const array = [-1, -0.7, -0.5, 0, 0.2, 0.5, 1];
	const epsilon = 0.3;
	const result = ear.general.epsilonUniqueSortedNumbers(array, epsilon);
	expect(result).toEqual([-1, -0.7, 0, 0.5, 1]);
});

test("epsilonUniqueSortedNumbers - Array with floating point numbers within epsilon", () => {
	const array = [1.5, 1.7, 1.8, 2, 2.2, 2.4];
	const epsilon = 0.2;
	const result = ear.general.epsilonUniqueSortedNumbers(array, epsilon);
	expect(result).toEqual([1.5, 2.2]);
});

test("epsilonUniqueSortedNumbers - Empty array", () => {
	const array = [];
	const epsilon = 0.1;
	const result = ear.general.epsilonUniqueSortedNumbers(array, epsilon);
	expect(result).toEqual([]);
});

test("epsilonUniqueSortedNumbers - Array with one element", () => {
	const array = [1];
	const epsilon = 0.1;
	const result = ear.general.epsilonUniqueSortedNumbers(array, epsilon);
	expect(result).toEqual([1]);
});

test("array intersection", () => {
	arraysMatch(
		[1, 7, 9, 15],
		ear.general.arrayIntersection(
			[1, 2, 4, 5, 7, 9, 11, 15, 18],
			[19, 15, 14, 12, 9, 7, 3, 1],
		),
	);
	arraysMatch(
		[1, 7, 9, 15, 18],
		ear.general.arrayIntersection(
			[1, 2, 4, 5, 7, 9, 11, 15, 18],
			[18, 15, 14, 12, 9, 7, 3, 1],
		),
	);
	arraysMatch(
		[7, 9, 15, 18],
		ear.general.arrayIntersection(
			[0, 1, 2, 4, 5, 7, 9, 11, 15, 18],
			[18, 15, 14, 12, 9, 7, 3],
		),
	);
	arraysMatch([6, 9], ear.general.arrayIntersection([1, 5, 6, 9, 13], [16, 9, 6, 4, 2]));
	arraysMatch([3, 5, 7, 9], ear.general.arrayIntersection([3, 5, 7, 9], [9, 7, 5, 3]));
	arraysMatch([3, 5, 7, 9], ear.general.arrayIntersection([3, 5, 7, 9], [9, 7, 5, 3, 2]));
	arraysMatch(
		[3, 5, 7, 9],
		ear.general.arrayIntersection([3, 5, 7, 9], [11, 9, 7, 5, 3]),
	);
	arraysMatch(
		[3, 5, 7, 9],
		ear.general.arrayIntersection([3, 5, 7, 9, 11], [9, 7, 5, 3]),
	);
	arraysMatch([3, 5, 7, 9], ear.general.arrayIntersection([2, 3, 5, 7, 9], [9, 7, 5, 3]));
	arraysMatch([1, 2], ear.general.arrayIntersection([1, 2, 3, 4], [0, 1, 2, 6, 7]));
	arraysMatch([1, 2, 7], ear.general.arrayIntersection([1, 2, 3, 4, 7], [0, 1, 2, 6, 7]));
});

test("rotateCircularArray", () => {
	expect(ear.general.rotateCircularArray([0, 1, 2, 3, 4, 5], 2)).toMatchObject([
		2, 3, 4, 5, 0, 1,
	]);

	expect(ear.general.rotateCircularArray([0, 1, 2, 3, 4, 5], -1)).toMatchObject([
		0, 1, 2, 3, 4, 5,
	]);

	expect(ear.general.rotateCircularArray([0, 1, 2, 3, 4, 5], 8)).toMatchObject([
		0, 1, 2, 3, 4, 5,
	]);

	expect(ear.general.rotateCircularArray([0, 1, , , 4, 5], 0)).toMatchObject([
		0,
		1,
		,
		,
		4,
		5,
	]);

	expect(ear.general.rotateCircularArray([0, 1, , , 4, 5], 2)).toMatchObject([
		,
		,
		4,
		5,
		0,
		1,
	]);

	expect(ear.general.rotateCircularArray([0, 1, , , 4, 5], 5)).toMatchObject([
		5,
		0,
		1,
		,
		,
		4,
	]);
});

test("chooseTwoPairs - Array with even number of items", () => {
	const array = ["A", "B", "C", "D"];
	const result = ear.general.chooseTwoPairs(array);
	expect(result).toEqual([
		["A", "B"],
		["A", "C"],
		["A", "D"],
		["B", "C"],
		["B", "D"],
		["C", "D"],
	]);
});

test("chooseTwoPairs - Array with odd number of items", () => {
	const array = ["X", "Y", "Z"];
	const result = ear.general.chooseTwoPairs(array);
	expect(result).toEqual([
		["X", "Y"],
		["X", "Z"],
		["Y", "Z"],
	]);
});

test("chooseTwoPairs - Array with one item", () => {
	const array = ["Hello"];
	const result = ear.general.chooseTwoPairs(array);
	expect(result).toEqual([]);
});

test("chooseTwoPairs - Array with no items", () => {
	const array = [];
	const result = ear.general.chooseTwoPairs(array);
	expect(result).toEqual([]);
});

test("setDifferenceSortedNumbers - Arrays with common elements", () => {
	const a = [1, 2, 3, 4, 5];
	const b = [3, 4, 5, 6, 7];
	const result = ear.general.setDifferenceSortedNumbers(a, b);
	expect(result).toEqual([1, 2]);
});

test("setDifferenceSortedNumbers - Arrays with no common elements", () => {
	const a = [1, 2, 3, 4, 5];
	const b = [6, 7, 8, 9, 10];
	const result = ear.general.setDifferenceSortedNumbers(a, b);
	expect(result).toEqual([1, 2, 3, 4, 5]);
});

test("setDifferenceSortedNumbers - Arrays with common elements within epsilon", () => {
	const a = [1.1, 2.2, 3.3, 4.4, 5.5];
	const b = [3.31, 4.41, 5.51, 6.61, 7.71];
	const result = ear.general.setDifferenceSortedNumbers(a, b);
	expect(result).toEqual([1.1, 2.2, 3.3, 4.4, 5.5]);
});

test("setDifferenceSortedNumbers - Empty array a", () => {
	const a = [];
	const b = [1, 2, 3, 4, 5];
	const result = ear.general.setDifferenceSortedNumbers(a, b);
	expect(result).toEqual([]);
});

test("setDifferenceSortedNumbers - Empty array b", () => {
	const a = [1, 2, 3, 4, 5];
	const b = [];
	const result = ear.general.setDifferenceSortedNumbers(a, b);
	expect(result).toEqual([1, 2, 3, 4, 5]);
});

test("setDifferenceSortedNumbers - Array with one element", () => {
	const a = [1];
	const b = [];
	const result = ear.general.setDifferenceSortedNumbers(a, b);
	expect(result).toEqual([1]);
});

test("setDifferenceSortedNumbers - Arrays with negative numbers", () => {
	const a = [-5, -4, -3, -2, -1];
	const b = [-3, -2, -1, 0, 1];
	const result = ear.general.setDifferenceSortedNumbers(a, b);
	expect(result).toEqual([-5, -4]);
});

test("setDifferenceSortedEpsilonNumbers - Arrays with common elements", () => {
	const a = [1, 2, 3, 4, 5];
	const b = [3, 4, 5, 6, 7];
	const result = ear.general.setDifferenceSortedEpsilonNumbers(a, b);
	expect(result).toEqual([1, 2]);
});

test("setDifferenceSortedEpsilonNumbers - Arrays with no common elements", () => {
	const a = [1, 2, 3, 4, 5];
	const b = [6, 7, 8, 9, 10];
	const result = ear.general.setDifferenceSortedEpsilonNumbers(a, b);
	expect(result).toEqual([1, 2, 3, 4, 5]);
});

test("setDifferenceSortedEpsilonNumbers - Arrays with common elements within epsilon", () => {
	const a = [1.1, 2.2, 3.3, 4.4, 5.5];
	const b = [3.31, 4.41, 5.51, 6.61, 7.71];
	const result = ear.general.setDifferenceSortedEpsilonNumbers(a, b, 0.1);
	expect(result).toEqual([1.1, 2.2]);
});

test("setDifferenceSortedEpsilonNumbers - Empty array a", () => {
	const a = [];
	const b = [1, 2, 3, 4, 5];
	const result = ear.general.setDifferenceSortedEpsilonNumbers(a, b);
	expect(result).toEqual([]);
});

test("setDifferenceSortedEpsilonNumbers - Empty array b", () => {
	const a = [1, 2, 3, 4, 5];
	const b = [];
	const result = ear.general.setDifferenceSortedEpsilonNumbers(a, b);
	expect(result).toEqual([1, 2, 3, 4, 5]);
});

test("setDifferenceSortedEpsilonNumbers - Array with one element", () => {
	const a = [1];
	const b = [];
	const result = ear.general.setDifferenceSortedEpsilonNumbers(a, b);
	expect(result).toEqual([1]);
});

test("setDifferenceSortedEpsilonNumbers - Arrays with negative numbers", () => {
	const a = [-5, -4, -3, -2, -1];
	const b = [-3, -2, -1, 0, 1];
	const result = ear.general.setDifferenceSortedEpsilonNumbers(a, b);
	expect(result).toEqual([-5, -4]);
});

test("setDifferenceSortedEpsilonNumbers - Arrays with common elements within epsilon", () => {
	const a = [1.1, 2.2, 3.3, 4.4, 5.5];
	const b = [3.31, 4.41, 5.51, 6.61, 7.71];
	const epsilon = 0.5;
	const result = ear.general.setDifferenceSortedEpsilonNumbers(a, b, epsilon);
	expect(result).toEqual([1.1, 2.2]);
});

test("setDifferenceSortedEpsilonNumbers - Arrays with common elements near each other within epsilon", () => {
	const a = [1, 2, 3, 4, 5];
	const b = [2.1, 3.1, 4.1, 5.1, 6.1];
	const epsilon = 0.2;
	const result = ear.general.setDifferenceSortedEpsilonNumbers(a, b, epsilon);
	expect(result).toEqual([1]);
});

test("setDifferenceSortedEpsilonNumbers - Arrays with common elements near each other but outside epsilon", () => {
	const a = [1, 2, 3, 4, 5];
	const b = [2.1, 3.1, 4.1, 5.1, 6.1];
	const epsilon = 0.05;
	const result = ear.general.setDifferenceSortedEpsilonNumbers(a, b, epsilon);
	expect(result).toEqual([1, 2, 3, 4, 5]);
});

test("arrayMinimumIndex", () => {
	const array1 = [99, 0, 1, , , , 5, 6, 7];
	expect(ear.general.arrayMinimumIndex(array1)).toBe(1);

	const array2 = [99, , , , , , 5, 6, 7];
	expect(ear.general.arrayMinimumIndex(array2)).toBe(6);

	const array3 = [97, 98, 99, , , , , , 5, 6, 7];
	expect(ear.general.arrayMinimumIndex(array3, (n) => -n)).toBe(2);

	const array4 = [0, 1, 2, , , , , , 99, 98, 97];
	expect(ear.general.arrayMinimumIndex(array4, (n) => -n)).toBe(8);
});

test("arrayMaximumIndex", () => {});

test("mergeArraysWithHoles", () => {
	expect(
		ear.general.mergeArraysWithHoles([0, 1, , , 4, 5], [, , 2, 3, , , 6, 7]),
	).toMatchObject([0, 1, 2, 3, 4, 5, 6, 7]);

	expect(ear.general.mergeArraysWithHoles([0, 1, , , 4, 5], [, , 2, 3])).toMatchObject([
		0, 1, 2, 3, 4, 5,
	]);

	expect(
		ear.general.mergeArraysWithHoles([0, 1, , 4, 5], [, 2, 3, , 6, 7]),
	).toMatchObject([0, 2, 3, 4, 6, 7]);

	expect(
		ear.general.mergeArraysWithHoles([, "b", , , , "f", "g", , "i"], [, , 3, , 5, , , 8]),
	).toMatchObject([, "b", 3, , 5, "f", "g", 8, "i"]);
});

test("clustersToReflexiveArrays", () => {
	const result = ear.general.clustersToReflexiveArrays([
		[0, 2],
		[1, 3, 4],
	]);
	expect(result).toMatchObject([[2], [3, 4], [0], [1, 4], [1, 3]]);
});

test("clustersToReflexiveArrays", () => {
	const example = [[6, 0, 2, 4], [5, 14, 1, 7, 13, 3], [10, 9], [11, 12], [8]];
	const result = ear.general.clustersToReflexiveArrays(example);
	expect(result).toMatchObject([
		[6, 2, 4],
		[5, 14, 7, 13, 3],
		[6, 0, 4],
		[5, 14, 1, 7, 13],
		[6, 0, 2],
		[14, 1, 7, 13, 3],
		[0, 2, 4],
		[5, 14, 1, 13, 3],
		[],
		[10],
		[9],
		[12],
		[11],
		[5, 14, 1, 7, 3],
		[5, 1, 7, 13, 3],
	]);
});
