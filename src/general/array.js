/**
 * Rabbit Ear (c) Kraft
 */
import { EPSILON } from "../math/constant.js";
import { epsilonEqual } from "../math/compare.js";

/**
 * @description Given a list of any type, return a copy of the array
 * with all duplicates removed. This only works with arrays with primitives,
 * arrays with objects or arrays will not work.
 * @param {number[]} array an array of integers
 * @returns {number[]} set of unique integers
 * @example [1,2,3,2,1] will result in [1,2,3]
 */
export const uniqueElements = (array) => Array.from(new Set(array));

/**
 * @description Given an array of any type, return a copy of
 * the same array but filter out any items which only appear once.
 * The comparison uses conversion-to-string,
 * then matching to compare, so this works for primitives
 * (bool, number, string), not objects or arrays.
 * @param {any[]} array an array of any type.
 * @returns {any[]} the same input array but filtered to
 * remove elements which appear only once.
 * @example [1,2,3,2,1] will result in [1,2,2,1]
 */
export const nonUniqueElements = (array) => {
	const count = {};
	array.forEach((el) => {
		if (count[el] === undefined) {
			count[el] = 0;
		}
		count[el] += 1;
	});
	return array.filter((el) => count[el] > 1);
};

/**
 * @description Given a list of numbers (can contain duplicates),
 * this will return a sorted set of unique numbers (removing duplicates).
 * @param {number[]} array an array of numbers
 * @returns {number[]} set of sorted, unique numbers
 * @example [3, 2, 1.5, 2, 3] will result in [1.5, 2, 3]
 */
export const uniqueSortedNumbers = (array) => {
	const hash = {};
	array.forEach((n) => {
		hash[n] = true;
	});
	return Object.keys(hash).map(parseFloat);
};

/**
 * @description Given an array of numbers, sort the list and
 * filter out any two numbers which are close to each other within
 * an epsilon. The result list may be smaller than the input list.
 * @param {number[]} array an array of numbers.
 * @param {number} [epsilon=1e-6] an optional epsilon.
 * @returns {number[]} a sorted and filtered array of the input array.
 */
export const epsilonUniqueSortedNumbers = (array, epsilon = EPSILON) => {
	const numbers = array.slice().sort((a, b) => a - b);
	if (numbers.length < 2) {
		return numbers;
	}
	const keep = [true];
	for (let i = 1; i < numbers.length; i += 1) {
		keep[i] = !epsilonEqual(numbers[i], numbers[i - 1], epsilon);
	}
	return numbers.filter((_, i) => keep[i]);
};

/**
 * @description Return the intersection of two arrays. This assumes that
 * the array values are primitives (this does not work if values are objects),
 * and will stringify the values to compare, so 5 === "5" will match.
 * If inside each arrays contains duplicates, the number of duplicates in
 * the result will match the number shared between the two.
 * @param {any[]} array1 an array of any primitive type
 * @param {any[]} array2 an array of any primitive type
 * @returns {any[]} an array of values found inside both arrays.
 */
export const arrayIntersection = (array1, array2) => {
	// create a lookup table for all values in array2, where the number
	// of appearances is stored as the hash value.
	const hash = {};
	array2.forEach((value) => {
		hash[value] = 0;
	});
	array2.forEach((value) => {
		hash[value] += 1;
	});

	// for every item in array1, modify the lookup table each time we encounter
	// a value from both arrays by decrementing the appearance counter by one.
	// filter out any array1 values if the counter is 0,
	// or it does not appear in array2.
	return array1.filter((value) => {
		if (hash[value] > 0) {
			hash[value] -= 1;
			return true;
		}
		return false;
	});
};

/**
 * @description Given an array considered to be circular, where the end
 * connects back to the start, rotate the array so that the value currently
 * in the newStartIndex spot becomes the first (0) index.
 * @param {any[]} array an array containing any type
 * @param {number} newStartIndex the current index to become the new 0 index.
 * @returns {any[]} a copy of the original array, rotated.
 */
export const rotateCircularArray = (array, newStartIndex) =>
	newStartIndex <= 0
		? array
		: array.slice(newStartIndex).concat(array.slice(0, newStartIndex));

/**
 * @description A circular array (data wraps around) requires 2 indices
 * if you intend to split it into two arrays. The pair of indices can be
 * provided in any order, they will be sorted, smaller index first.
 * @param {any[]} array an array that is meant to be thought of as circular
 * @param {[number, number]} indices two numbers
 * these indices will divide the array into 2 parts
 * @returns {[any[], any[]]} the input array split into two arrays
 */
export const splitCircularArray = (array, indices) => {
	indices.sort((a, b) => a - b);
	return [
		array.slice(indices[1]).concat(array.slice(0, indices[0] + 1)),
		array.slice(indices[0], indices[1] + 1),
	];
};

/**
 * @description convert a list of items {any} into a list of pairs
 * where each item is uniquely matched with another item (non-ordered)
 * the number of pairs is (length * (length-1)) / 2
 * @param {any[]} array an array containing any values
 * @returns {[any, any][]} an array of arrays, type matching the
 * input array type, where each inner array is a list of two.
 */
export const chooseTwoPairs = (array) => {
	const pairs = Array((array.length * (array.length - 1)) / 2);
	let index = 0;
	for (let i = 0; i < array.length - 1; i += 1) {
		for (let j = i + 1; j < array.length; j += 1, index += 1) {
			pairs[index] = [array[i], array[j]];
		}
	}
	return pairs;
};

/**
 * @description Return a modified copy of set "a" that filters
 * out any number that exists in set "b". This method assumes that
 * both input arrays are sorted, so this method will run in O(n) time.
 * Numbers are compared within an epsilon range of each other.
 * If arrays are not sorted, sort them before using this method.
 * @param {number[]} a an array of numbers, in sorted order
 * @param {number[]} b an array of numbers, in sorted order
 * @returns {number[]} a copy of "a" with no values found in "b".
 */
export const setDifferenceSortedNumbers = (a, b) => {
	const result = [];
	let ai = 0;
	let bi = 0;
	if (!b.length) {
		return a.slice();
	}
	while (ai < a.length && bi < b.length) {
		if (a[ai] === b[bi]) {
			ai += 1;
		} else if (a[ai] > b[bi]) {
			bi += 1;
		} else if (b[bi] > a[ai]) {
			result.push(a[ai]);
			ai += 1;
		}
	}
	return result;
};

/**
 * @description Return a modified copy of set "a" that filters
 * out any number that exists in set "b". This method assumes that
 * both input arrays are sorted, so this method will run in O(n) time.
 * Numbers are compared within an epsilon range of each other.
 * If arrays are not sorted, sort them before using this method.
 * @param {number[]} a an array of numbers, in sorted order
 * @param {number[]} b an array of numbers, in sorted order
 * @returns {number[]} a copy of "a" with no values found in "b".
 */
export const setDifferenceSortedEpsilonNumbers = (a, b, epsilon = EPSILON) => {
	const result = [];
	let ai = 0;
	let bi = 0;
	if (!b.length) {
		return a.slice();
	}
	while (ai < a.length && bi < b.length) {
		if (epsilonEqual(a[ai], b[bi], epsilon)) {
			ai += 1;
		} else if (a[ai] > b[bi]) {
			bi += 1;
		} else if (b[bi] > a[ai]) {
			result.push(a[ai]);
			ai += 1;
		}
	}
	return result;
};

/**
 * @description Return the index of the smallest value in the array.
 * An optional map function parameter can be provided to map the
 * values into another state before searching for the minimum value.
 * @param {any[]} array an array of any comparable type
 * @param {Function} [map] an optional map function to run on all elements
 * @returns {number|undefined} an index from the input array,
 * or undefined if the array has no length.
 */
export const arrayMinimumIndex = (array, map) => {
	if (!array.length) {
		return undefined;
	}
	const arrayValues =
		typeof map === "function" ? array.map((value) => map(value)) : array;
	let index = 0;
	arrayValues.forEach((value, i, arr) => {
		if (value < arr[index]) {
			index = i;
		}
	});
	return index;
};

/**
 * @description Return the index of the largest value in the array.
 * An optional map function parameter can be provided to map the
 * values into another state before searching for the maximum value.
 * @param {any[]} array an array of any comparable type
 * @param {Function} [map] an optional map function to run on all elements
 * @returns {number|undefined} an index from the input array,
 * or undefined if the array has no length.
 */
export const arrayMaximumIndex = (array, map) => {
	if (!array.length) {
		return undefined;
	}
	const arrayValues =
		typeof map === "function" ? array.map((value) => map(value)) : array;
	let index = 0;
	arrayValues.forEach((value, i, arr) => {
		if (value > arr[index]) {
			index = i;
		}
	});
	return index;
};

/**
 * @description Given a list of arrays which contain holes, this method
 * will splice all arrays together into one, maintaining indices,
 * filling holes where indices exist. This is intended for the specific
 * case where all arrays originally came from a single array, such as
 * in the subgraph() method, this method will re-join these arrays.
 * In the case where some arrays double up on indices, the index will be
 * overwritten, by the last array parameter in the sequence.
 * @param {...any[]} arrays arrays containing any type.
 * @returns {any[]} one array
 */
export const mergeArraysWithHoles = (...arrays) => {
	const flattened = [];
	arrays.forEach((array) =>
		array.forEach((value, i) => {
			flattened[i] = value;
		}),
	);
	return flattened;
};

/**
 * @description Clusters are arrays of arrays of indices, where every index
 * in the inner arrays are clustered together. This method converts this array
 * into a vertices_vertices or faces_faces style array, where for every index
 * its list contains the set of all indices (not including itself) which are
 * a member of the same cluster.
 * @param {number[][]} clusters a cluster array
 * @returns {number[][]} a reflexive array (like vertices_vertices)
 */
export const clustersToReflexiveArrays = (clusters) => {
	const result = [];
	clusters.flat().forEach((i) => {
		result[i] = [];
	});
	clusters.flatMap(chooseTwoPairs).forEach(([a, b]) => {
		result[a].push(b);
		result[b].push(a);
	});
	return result;
};

/**
 * @description Convert an array of arrays of numbers into an array of array
 * of booleans where the booleans are at the index positions of the numbers,
 * making this array act as a quick hash lookup for whether or not an index
 * exists.
 * @param {number[][]} array_array an array of arrays of numbers
 * @returns {boolean[][]} for every top level array, an array that contains
 * true values at every index of a number in the array.
 */
export const arrayArrayToLookupArray = (array_array) =>
	array_array.map((array) => {
		const lookup = [];
		array.forEach((i) => {
			lookup[i] = true;
		});
		return lookup;
	});

/**
 * @description Convert an array of arrays of booleans into an array
 * of arrays of numbers, where those numbers are the indices in the array
 * at which those booleans appear.
 * @param {boolean[][]} lookupArray an array of arrays of booleans
 * @returns {number[][]} for every top level array, an array that contains
 * the indices with truthy values.
 */
export const lookupArrayToArrayArray = (lookupArray) =>
	lookupArray.map((array) =>
		array.map((overlap, i) => (overlap ? i : undefined)).filter((a) => a !== undefined),
	);
