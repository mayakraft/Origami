/**
 * Rabbit Ear (c) Kraft
 */
import { EPSILON } from "../math/constant.js";
import { normalize, parallelNormalized } from "../math/vector.js";
import { doRangesOverlap, rangeUnion } from "../math/range.js";

/**
 * @description Given a list of pre-sorted elements, create clusters
 * where similarity is determined by a custom comparison function.
 * Comparisons only need to happen to neighbors due to the array
 * already being sorted.
 * The type of elements in the list doesn't matter, so long as the
 * comparison function can compare them.
 * @param {any[]} elements a list of elements of any type
 * @param {Function} comparison a function which takes two "any" types
 * (from elements) and returns true if they are similar, false otherwise.
 * @returns {number[][]} a list of lists of indices referencing the input list,
 * where each inner list is a cluster of similar element indices.
 */
export const clusterSortedGeneric = (elements, comparison) => {
	if (!elements.length) {
		return [];
	}

	// get a list of indices, we will iterate over this list.
	// this allows this method to work with arrays with holes
	const indices = elements.map((_, i) => i);

	// set the first element's index, at the same time, remove it from the list
	const groups = [[indices.shift()]];

	// iterate through the list of indices (starting from the second element)
	// and compare each element to one element from the most recent cluster
	indices.forEach((index) => {
		// a pointer to the the current group list
		const group = groups[groups.length - 1];

		// the index from "elements" of the most recently added element
		const prevElement = group[group.length - 1];

		// compare the two elements, if true, add to the current group,
		// if false, create a new group and add it to the groups container.
		if (comparison(elements[prevElement], elements[index])) {
			group.push(index);
		} else {
			groups.push([index]);
		}
	});

	return groups;
};

/**
 * @description Given a list of unsorted elements, create clusters
 * where similarity is determined by a custom comparison function.
 * Because the elements are not sorted, comparisons need to happen to
 * all members of a group before an element is added, hence it's much
 * preferred to use clusterSortedGeneric if possible.
 * The type of elements in the list doesn't matter, so long as the
 * comparison function can compare them.
 * @param {any[]} indices a list of elements of any type
 * @param {Function} comparison a function which takes two "any" types
 * (from elements) and returns true if they are similar, false otherwise.
 * @returns {number[][]} a list of lists of indices referencing the input list,
 * where each inner list is a cluster of similar element indices.
 */
export const clusterUnsortedIndices = (indices, comparison) => {
	if (!indices.length) {
		return [];
	}

	const indicesCopy = indices.slice();

	// set the first element's index, at the same time, remove it from the list
	const groups = [[indicesCopy.shift()]];

	// iterate through the list of indices (starting from the second element)
	// and compare each element to one element from the most recent cluster
	indicesCopy.forEach((index) => {
		// compare the two elements, if true, add to the current group,
		// if false, create a new group and add it to the groups container.
		const matchFound = groups
			.map((group, g) => (comparison(group[0], index) ? g : undefined))
			.filter((a) => a !== undefined)
			.shift();

		if (matchFound !== undefined) {
			groups[matchFound].push(index);
		} else {
			groups.push([index]);
		}
	});

	return groups;
};

/**
 * @description Given an unsorted array of floats, make a sorted copy of the
 * array then walk through the array and group similar values into clusters.
 * Cluster epsilon is relative to the nearest neighbor, not the start
 * of the group or some other metric, so for example, the values
 * [1, 2, 3, 4, 5] will all be in one cluster if the epsilon is 1.5.
 * @param {number[]} numbers an array of numbers
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {number[][]} array of array of indices to the input array.
 */
export const clusterScalars = (numbers, epsilon = EPSILON) => {
	// sort the numbers list but save it as a list of indices
	const indices = numbers
		.map((v, i) => ({ v, i }))
		.sort((a, b) => a.v - b.v)
		.map((el) => el.i)
		.filter(() => true);

	// prepare data for the method clusterSortedGeneric,
	// the values will be the sorted numbers,
	// the comparison function will be a simple: is "a" epsilon similar to "b"?
	const sortedNumbers = indices.map((i) => numbers[i]);
	/** @param {number} a @param {number} b */
	const compFn = (a, b) => Math.abs(a - b) < epsilon;

	// call the cluster method which results in a list of indices that refer
	// to the sorted list "sortedNumbers", which of course does not match our
	// input array "numbers", so, remap these indices so that our
	// final result of indices relates to the input array "numbers".
	return clusterSortedGeneric(sortedNumbers, compFn).map((arr) =>
		arr.map((i) => indices[i]),
	);
};

/**
 * @description Given a list of unsorted ranges, each range being a pair
 * of numbers, this method will create clusters where every range in
 * the cluster is overlapped by at least one other range.
 * Range pairs do not necessarily need to be in increasing order.
 * @param {[number, number][]} ranges a list of ranges,
 * each range a pair of numbers
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {number[][]} an array of clusters, where each cluster is
 * a list of indices which point to the "ranges" input array.
 */
export const clusterRanges = (ranges, epsilon = EPSILON) => {
	// sort the ranges by the minimum element, save it as a list of indices
	const indices = ranges
		.map(([a, b], i) => ({ v: Math.min(a, b), i }))
		.sort((a, b) => a.v - b.v)
		.map((el) => el.i)
		.filter(() => true);

	// prepare data for the method clusterSortedGeneric,
	// the values will be the sorted ranges,
	// the comparison function will be a bit more complex with a side effect,
	// maintain the current range outside of the function,
	// if there is an overlap, update the range to be a union with the new range,
	// if there is no overlap, reset it to be the new range.
	const sortedRanges = indices.map((i) => ranges[i]);

	let currentRange = [...sortedRanges[0]];

	/**
	 * @param {[number, number]} _ an unused range, the cumulative result
	 * @param {[number, number]} b a new range to compare
	 * @returns {boolean} true if "b" overlaps with the "currentRange"
	 */
	const comparison = (_, b) => {
		const overlap = doRangesOverlap(currentRange, b, epsilon);
		currentRange = overlap ? rangeUnion(currentRange, b) : [...b];
		return overlap;
	};

	// call the cluster method which results in a list of indices that refer
	// to the sorted list "sortedRanges", which of course does not match our
	// input array "ranges", so, remap these indices so that our
	// final result of indices relates to the input array "ranges".
	return clusterSortedGeneric(sortedRanges, comparison).map((arr) =>
		arr.map((i) => indices[i]),
	);
};

/**
 * @description Given an array of vectors, group the vectors into clusters
 * that all contain vectors which are parallel to one another.
 * This works for any N-dimensional vectors (including 3D or 2D).
 * @note, this is an n^2 algorithm. Currently it's used by the method
 * getEdgesLine to find all unique lines in a graph, which initially clusters
 * lines by distance-to-origin, then INSIDE each cluster this method is called,
 * in effect, reducing the total time spent in this method to below n^2.
 * If you use this method, try to optimize similarly if you can.
 * @param {number[][]} vectors an array of vectors
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {number[][]} array of array of indices to the input array.
 */
export const clusterParallelVectors = (vectors, epsilon = EPSILON) => {
	// for the parallel test, we will test against normalized vectors.
	// much faster if we normalize the entire list at the beginning.
	const normalized = vectors.map(normalize);

	// start the list of groups with the first group containing the first index
	const groups = [[0]];

	// create an nested loop where for ever vector compare against every group
	loop1: for (let i = 1; i < normalized.length; i += 1) {
		// iterate over all groups, only testing against the first vector
		// found inside that group, compare the two vectors
		for (let g = 0; g < groups.length; g += 1) {
			// if vectors are parallel, add to the group and break out of the inner
			// loop by continuing with the first loop. (does not create a new group)
			if (parallelNormalized(normalized[i], normalized[groups[g][0]], epsilon)) {
				groups[g].push(i);
				continue loop1;
			}
		}

		// if no match is found, make a new group with this vector inside
		groups.push([i]);
	}
	return groups;
};
