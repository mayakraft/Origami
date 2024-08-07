/**
 * Rabbit Ear (c) Kraft
 */

/**
 * @description Given a self-relational array of arrays, for example,
 * vertices_vertices, edges_edges, faces_faces, where the values in the
 * inner arrays relate to the indices of the outer array, create
 * collection groups where each item is included in a group if it
 * points to another member in that group.
 * The result will be in the form of an array matching in length the
 * number of components, for each component, the value is its group number.
 * @param {number[][]} array_array an array of arrays of numbers
 * @returns {number[]} component array, the value is the group number
 */
export const connectedComponents = (array_array) => {
	const components = [];
	/** @param {number} index @param {number} currentGroup */
	const recurse = (index, currentGroup) => {
		// only set unset component entries.
		// the return value is only meaningful during the first call to recurse()
		// for each row, meaning, if this row has already been set at time of the
		// first call, then no components have this group index, so, use this group
		// index for the next component and next recursion.
		if (components[index] !== undefined) {
			return 0;
		}

		// set this component to be a member of the current group, and recurse
		// through all of its adjacent components, setting every adjacent
		// component to be a member of this group. in this case do nothing with
		// the return value of recurse().
		components[index] = currentGroup;
		array_array[index].forEach((i) => recurse(i, currentGroup));

		// this group number has been applied to one or more components,
		// return and tell the main loop to use the next group index for the
		// next set of components and their recursion.
		return 1;
	};

	// iterate through every row, increment the group index only if one or more
	// components were set to this group, so we don't skip any numbers.
	for (let row = 0, group = 0; row < array_array.length; row += 1) {
		// allow arrays with holes
		if (!(row in array_array)) {
			continue;
		}
		group += recurse(row, group);
	}
	return components;
};

/**
 * @description Given a self-relational array of arrays, for example,
 * vertices_vertices, edges_edges, faces_faces, where the values in the
 * inner arrays relate to the indices of the outer array, create a list of
 * all pairwise combinations of connected indices. All pairs are sorted
 * so that for [i, j], i <= j. This allows for circular references (i === j).
 * @param {number[][]} array_array an array of arrays of integers
 * @returns {[number, number][]} array of two-dimensional array pairs of indices.
 */
export const connectedComponentsPairs = (array_array) => {
	const pairs = [];

	// if a component's index is self-adjacent, this functions as a hash
	// lookup to ensure that the reference appears only once.
	const circular = [];
	array_array.forEach((arr, i) =>
		arr.forEach((j) => {
			// assuming that i exists in j's adjacent, and visa versa, we will visit
			// every permutation twice. only include the one where i < j.
			if (i < j) {
				pairs.push([i, j]);
			}

			// if an index is self-referential, ensure that it is only added once
			if (i === j && !circular[i]) {
				circular[i] = true;
				pairs.push([i, j]);
			}
		}),
	);
	return pairs;
};
