/**
 * Rabbit Ear (c) Kraft
 */
import { uniqueSortedNumbers } from "../general/array.js";
import Messages from "../environment/messages.js";
import { count } from "./count.js";
import { remapKey } from "./maps.js";

/**
 * @param {FOLD} graph
 * @param {string} key
 * @param {number[]} replaceIndices
 * @param {number[]} replaces
 * @returns {number[]}
 */
const makeIndexMap = (graph, key, replaceIndices, replaces) => {
	const arrayLength = count(graph, key);
	const indexMap = [];
	for (let i = 0, j = 0, walk = 0; i < arrayLength; i += 1, j += 1) {
		while (i === replaces[walk]) {
			// this prevents arrays with holes
			indexMap[i] = indexMap[replaceIndices[replaces[walk]]];
			if (indexMap[i] === undefined) {
				throw new Error(Messages.replaceUndefined);
			}
			i += 1;
			walk += 1;
		}
		if (i < arrayLength) {
			indexMap[i] = j;
		}
	}
	return indexMap;
};

/**
 * @description Replaces vertices, edges, or faces (or anything really)
 * replace elements from inside arrays, shift up remaining components,
 * and updates all relevant references across other arrays due to shifting.
 * @param {FOLD} graph a FOLD object
 * @param {string} key like "vertices", the prefix of the arrays
 * @param {number[]} replaceIndices an array of vertex indices, like [1,9,25]
 * @returns {number[]} a map of changes to the graph
 * @example replace(foldObject, "vertices", [2,6,11,15]);
 * @example
 * replaceIndices: [4:3, 7:5, 8:3, 12:3, 14:9] where
 * - keys are indices to remove.
 * - values are the new indices that these old ones will become.
 * note: all values are less than their indices.
 *
 * for example: removing index 5 from a 10-long vertices list will shift all
 * indices > 5 up by one, and then will look through all other arrays like
 * edges_vertices, faces_vertices and update any reference to indices 6-9
 * to match their new positions 5-8.
 *
 * this can handle removing multiple indices at once; and is faster than
 * otherwise calling this multiple times with only one or a few removals.
 */
export const replace = (graph, key, replaceIndices) => {
	// make sure replace indices are well-formed. values cannot be larger than keys.
	// if this is the case, flip the index/value, assuming the two geometry items
	// are interchangeable and it doesn't matter which one we remove, but warn
	// the user that this took place.
	Object.entries(replaceIndices)
		.map(([index, value]) => [parseInt(index, 10), value])
		.filter(([index, value]) => index < value)
		.forEach(([index, value]) => {
			// eslint-disable-next-line no-param-reassign
			delete replaceIndices[index];
			// eslint-disable-next-line no-param-reassign
			replaceIndices[value] = index;
		});
	const removes = Object.keys(replaceIndices).map((n) => parseInt(n, 10));
	const replaces = uniqueSortedNumbers(removes);
	const indexMap = makeIndexMap(graph, key, replaceIndices, replaces);
	remapKey(graph, key, indexMap);
	return indexMap;
};
