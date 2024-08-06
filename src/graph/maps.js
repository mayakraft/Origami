/**
 * Rabbit Ear (c) Kraft
 */
import { filterKeysWithSuffix, filterKeysWithPrefix } from "../fold/spec.js";

/**
 * @description Invert an array of integer values where
 * values become indices and the top level indices become values.
 * If indices and values are not bijective, values will be overwritten.
 * @param {number[]} map an array of integers
 * @returns {number[]} the inverted array
 */
export const invertFlatMap = (map) => {
	const inv = [];
	map.forEach((n, i) => {
		inv[n] = i;
	});
	return inv;
};

/**
 * @description Invert an array of arrays of integer values where
 * values become indices and the top level indices become values.
 * If indices and values are not bijective, values will be overwritten.
 * @param {number[][]} map an array of arrays of integers
 * @returns {number[]} the inverted flat array
 */
export const invertArrayToFlatMap = (map) => {
	const inv = [];
	map.forEach((arr, i) =>
		arr.forEach((n) => {
			inv[n] = i;
		}),
	);
	return inv;
};

/**
 * @description Invert an array of integer values where values become indices
 * and the indices are stored inside array values.
 * This ensures that for non-bijective maps, no data is lost.
 * @param {number[]} map an array of integers
 * @returns {number[][]} the inverted array of arrays of integers
 */
export const invertFlatToArrayMap = (map) => {
	const inv = [];
	map.forEach((n, i) => {
		if (inv[n] === undefined) {
			inv[n] = [];
		}
		inv[n].push(i);
	});
	return inv;
};

/**
 * @description Invert an array of arrays of integer values where
 * values become indices and indices are stored inside array values.
 * This ensures that for non-bijective maps, no data is lost.
 * @param {number[][]} map an array of arrays of integers
 * @returns {number[][]} the inverted array of arrays of integers
 */
export const invertArrayMap = (map) => {
	const inv = [];
	map.forEach((arr, i) =>
		arr.forEach((m) => {
			if (inv[m] === undefined) {
				inv[m] = [];
			}
			inv[m].push(i);
		}),
	);
	return inv;
};

/**
 * @description Provide two or more simple nextmaps in the order
 * they were made and this will merge them into one nextmap which
 * reflects all changes to the graph.
 * @param {...number[]} maps a sequence of simple nextmaps
 * @returns {number[]} one nextmap reflecting the sum of changes
 */
export const mergeFlatNextmaps = (...maps) => {
	if (maps.length === 0) {
		return [];
	}
	const solution = maps[0].map((_, i) => i);
	maps.forEach((map) =>
		solution.forEach((s, i) => {
			solution[i] = map[s];
		}),
	);
	return solution;
};

/**
 * @description Provide two or more nextmaps in the order
 * they were made and this will merge them into one nextmap which
 * reflects all changes to the graph.
 * @param {...(number|number[])[]} maps a sequence of nextmaps
 * @returns {number[][]} one nextmap reflecting the sum of changes
 */
export const mergeNextmaps = (...maps) => {
	if (maps.length === 0) {
		return [];
	}
	/** @type {any[]} */
	const solution = maps[0].map((_, i) => [i]);
	maps.forEach((map) => {
		solution.forEach((s, i) =>
			s.forEach((indx, j) => {
				solution[i][j] = map[indx];
			}),
		);
		solution.forEach((arr, i) => {
			solution[i] = arr.flat().filter((a) => a !== undefined);
		});
	});
	return solution;
};

/**
 * @description Provide two or more simple backmaps in the order
 * they were made and this will merge them into one backmap which
 * reflects all changes to the graph.
 * @param {...number[]} maps a sequence of simplebackmaps
 * @returns {number[]} one backmap reflecting the sum of changes
 */
export const mergeFlatBackmaps = (...maps) => {
	if (maps.length === 0) {
		return [];
	}
	let solution = maps[0].map((_, i) => i);
	maps.forEach((map) => {
		const next = map.map((n) => solution[n]);
		solution = next;
	});
	return solution;
};

/**
 * @description Provide two or more  backmaps in the order
 * they were made and this will merge them into one backmap which
 * reflects all changes to the graph.
 * @param {...(number|number[])[]} maps a sequence of backmaps
 * @returns {number[][]} one backmap reflecting the sum of changes
 */
export const mergeBackmaps = (...maps) => {
	// const cat = (a, b) => a.concat(b)
	if (maps.length === 0) {
		return [];
	}
	// let solution = maps[0].reduce((a, b) => a.concat(b), []).map((_, i) => [i]);
	let solution = maps[0].flat().map((_, i) => [i]);
	maps.forEach((map) => {
		const next = [];
		map.forEach((el, j) => {
			if (typeof el === "number") {
				next[j] = solution[el];
			} else {
				next[j] = el.map((n) => solution[n]).reduce((a, b) => a.concat(b), []);
			}
		});
		solution = next;
	});
	return solution;
};

/**
 * @description Move indices of a particular component in a graph to a
 * new set of indices. This will update all references to this component too.
 * This is accomplished by providing an index map parameter which describes,
 * for every current index (index), what should the new index be (value).
 * @param {FOLD} graph a FOLD object, will be modified in place.
 * @param {string} key a component like "vertices", "edges", "faces"
 * @param {number[]} indexMap an array which maps a current index (index)
 * to a destination index (value).
 */
export const remapKey = (graph, key, indexMap) => {
	// Perform a simple invertFlatMap, indices/values swap, but in the case of
	// non-bijective maps, the first encounter will be kept, skipping duplicates.
	const invertedMap = [];
	indexMap.forEach((n, i) => {
		invertedMap[n] = invertedMap[n] === undefined ? i : invertedMap[n];
	});
	// if a key was not included in indexMap for whatever reason, it will be
	// registered as "undefined". we can't just assume these are errors and
	// remove them, because _faces fields are allowed to contain undefineds.

	// update every component that points to vertices_coords
	// these arrays do not change their size, only their contents
	filterKeysWithSuffix(graph, key).forEach((sKey) =>
		graph[sKey].forEach((_, ii) =>
			graph[sKey][ii].forEach((v, jj) => {
				graph[sKey][ii][jj] = indexMap[v];
			}),
		),
	);

	// set the top-level arrays
	filterKeysWithPrefix(graph, key).forEach((prefix) => {
		graph[prefix] = invertedMap.map((old) => graph[prefix][old]);
	});

	if (key === "faces" && graph.faceOrders) {
		graph.faceOrders = graph.faceOrders.map(([a, b, order]) => [
			indexMap[a],
			indexMap[b],
			order,
		]);
	}
	if (key === "edges" && graph.edgeOrders) {
		graph.edgeOrders = graph.edgeOrders.map(([a, b, order]) => [
			indexMap[a],
			indexMap[b],
			order,
		]);
	}
};
