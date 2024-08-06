/**
 * Rabbit Ear (c) Kraft
 */
import { invertFlatMap } from "../graph/maps.js";
import { topologicalSort } from "../graph/directedGraph.js";
import { solverOrdersToFaceOrders } from "./general.js";

const makePermutations = (counts) => {
	const totalLength = counts.reduce((a, b) => a * b, 1);
	const maxPlace = counts.slice();
	for (let i = maxPlace.length - 2; i >= 0; i -= 1) {
		maxPlace[i] *= maxPlace[i + 1];
	}
	maxPlace.push(1);
	maxPlace.shift();
	return Array.from(Array(totalLength)).map((_, i) =>
		counts.map((c, j) => Math.floor(i / maxPlace[j]) % c),
	);
};

export const LayerPrototype = {
	/**
	 * @description For every branch, get the total number of states.
	 * @returns {number[]} the total number of states in each branch.
	 */
	count: function () {
		return this.branches.map((arr) => arr.length);
	},

	/**
	 * @description Generate a FOLD-spec faceOrders array, which
	 * is an array of relationships between pairs of faces, [A, B],
	 * in relation to face B using face B's normal, which side is face A?
	 * @param {number[]} indices optionally specify which state from
	 * each branch, otherwise this will return index 0 from each branch.
	 * @returns {number[][]} a faceOrders ordering
	 */
	faceOrders: function (...indices) {
		return solverOrdersToFaceOrders(this.compile(...indices), this.faces_winding);
	},

	/**
	 * @description Get one complete layer solution by merging the
	 * root solution with one state from each branch.
	 * @param {...number} indices optionally specify which state from
	 * each branch, otherwise this will return index 0 from each branch.
	 * @returns {number[]} a faces_layer ordering, where, for each face (index),
	 * the value is that face's layer in the +Z order stack.
	 */
	facesLayer: function (...indices) {
		return invertFlatMap(this.linearize(...indices).reverse());
	},

	/**
	 * @description The solution is not yet compiled, there are branches,
	 * one of which needs to be selected and merged to create a final solution.
	 * This is the first step before generating a solution in any usable format.
	 * @param {...number} indices optionally specify which state from
	 * each branch, otherwise this will return index 0 from each branch.
	 * @returns {object} an object with space-separated face pair keys, with
	 * a value of +1 or -1, indicating the stacking order between the pair.
	 */
	compile: function (...indices) {
		// the "indices" is an array of numbers, the length matching "branches"
		// if "indices" is provided, use these, otherwise fill it with 0.
		const option = Array(this.branches.length)
			.fill(0)
			.map((n, i) => (indices[i] != null ? indices[i] : n));
		// for each branch, get one state
		const branchesSolution = this.branches
			? this.branches.map((options, i) => options[option[i]])
			: [];
		// merge the root with all branches (one state from each branch)
		return Object.assign({}, this.root, ...branchesSolution);
	},

	/**
	 * @description create an array of face pairs where, for every pair,
	 * the first face is above the second.
	 * @param {...number} indices optionally specify which state from
	 * each branch, otherwise this will return index 0 from each branch.
	 * @returns {[number, number][]} directed edges of pairs of faces
	 */
	directedPairs: function (...indices) {
		const orders = this.compile(...indices);
		return Object.keys(orders)
			.map((pair) => (orders[pair] === 1 ? pair.split(" ") : pair.split(" ").reverse()))
			.map((pair) => pair.map((n) => parseInt(n, 10)))
			.map(([a, b]) => [a, b]);
	},

	/**
	 * @description Create a topological sorting of all faces involved
	 * in the solution. The first face in the array is "above" all others.
	 * @param {...number} indices optionally specify which state from
	 * each branch, otherwise this will return index 0 from each branch.
	 */
	linearize: function (...indices) {
		return topologicalSort(this.directedPairs(...indices));
	},

	/**
	 *
	 */
	allSolutions: function () {
		return makePermutations(this.count()).map((count) => this.compile(...count));
	},

	allFacesLayers: function () {
		return makePermutations(this.count()).map((count) => this.facesLayer(...count));
	},
};
