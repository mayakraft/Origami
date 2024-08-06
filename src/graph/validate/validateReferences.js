/**
 * Rabbit Ear (c) Kraft
 */
import {
	filterKeysWithPrefix,
	filterKeysWithSuffix,
	getAllPrefixes,
	getAllSuffixes,
} from "../../fold/spec.js";

/**
 *
 */
const intersectionOfStrings = (array1, array2) => {
	const counts = {};
	array1.forEach((key) => {
		counts[key] = 1;
	});
	array2.forEach((key) => {
		counts[key] = counts[key] === 1 ? 2 : 1;
	});
	return Object.keys(counts).filter((key) => counts[key] === 2);
};

/**
 * @description Provide a list of arrays. This method will ensure that
 * all arrays contain the same indices. This works with arrays with holes.
 * O(n)
 * @param {any[][]} arrays any number of arrays
 * @returns {number[][]} array of error messages. empty if all tests pass.
 */
const arraysHaveSameIndices = (arrays = []) => {
	// base case test passes.
	if (arrays.length < 2) {
		return [];
	}
	// store arrays[0]'s indices into a hash lookup.
	const indices = {};
	arrays[0].forEach((_, i) => {
		indices[i] = true;
	});
	// arrays 1...N-1. test each array against array 0.
	return Array.from(Array(arrays.length - 1))
		.map((_, i) => arrays[i + 1])
		.flatMap((arr, p) =>
			arr
				// if error, return [a, b, i], where a and b are the indices
				// of the arrays inside "arrays" param, and i is the out of place index.
				// (p is off by one due to i + 1 mapping 0...N-2 to 1...N-1).
				.map((_, i) => (indices[i] ? undefined : [0, p + 1, i]))
				.filter((a) => a !== undefined),
		);
};

/**
 * @description test 1: for every similar prefix array (vertices_), ensure
 * that each of them are the same length (all of their indices match).
 * test 2: in the case of a suffix referencing another array's prefix,
 * check that the indices from the suffix exist in the prefix
 *
 * Inspect every array whose key contains a "_" symbol.
 * Ensure that every matching prefix (all "edges_" arrays) all match
 * in length and contain the same indices.
 * Ensure that every suffix array (all "_edges" arrays) with a matching
 * prefix array (all "edges_" arrays) contain only indices which match
 * with some value in the prefix array.
 * @param {FOLD} graph a FOLD object
 * @returns {string[]} a list of errors if they exist
 */
export const validateReferences = (graph) => {
	const allPrefixes = getAllPrefixes(graph).filter(
		(key) => key !== "file" && key !== "frame",
	);
	const allSuffixes = getAllSuffixes(graph);
	const prefixKeys = allPrefixes.map((prefix) => filterKeysWithPrefix(graph, prefix));

	const prefixTestErrors = prefixKeys
		.map((keys) =>
			keys
				.map((key) => graph[key])
				// only allow array values
				.filter((arr) => arr.constructor === Array),
		)
		.map(arraysHaveSameIndices)
		.flatMap((prefixErrors, p) =>
			prefixErrors.map((err) => [prefixKeys[p][err[0]], prefixKeys[p][err[1]], err[2]]),
		)
		.map(([a, b, i]) => `array indices differ ${a}, ${b} at index ${i}`);

	let referenceErrors = [];
	try {
		referenceErrors = intersectionOfStrings(allPrefixes, allSuffixes).flatMap((match) => {
			const prefixArrayKeys = prefixKeys[allPrefixes.indexOf(match)];
			const prefixArray = graph[prefixArrayKeys[0]];
			return filterKeysWithSuffix(graph, match).flatMap((key) =>
				graph[key].flatMap((arr, i) =>
					arr
						// "index" can be null, ie: vertices_faces can be [[2, null, 5]]
						.map((index, j) =>
							index === null || index === undefined || prefixArray[index] !== undefined
								? undefined
								: `${key}[${i}][${j}] references ${match} ${index}, missing in ${prefixArrayKeys[0]}`,
						)
						.filter((a) => a !== undefined),
				),
			);
		});
	} catch (error) {
		referenceErrors.push("reference validation failed due to bad index access");
	}
	return prefixTestErrors.concat(referenceErrors);
};
