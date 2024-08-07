/**
 * Rabbit Ear (c) Kraft
 */

// each "branches" is an "and" list (containing a list of "andItem")
// each "andItem" is also a list, a "subgroup"
// each "subgroup" is an "or" list (containing a list of "orItem")
// to compile a solution, when you encounter a:
// - "and" list: gather all list elements into the solution.
// - "or" list: only choose one list element to be in the solution.

/**
 *
 */
const makePermutations = (...counts) => {
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

/**
 * @param {LayerSolverSolution} solution
 */
const getBranchCount = ({ branches }) => {
	if (!branches) {
		return "leaf";
	}
	return branches.map((choices) => ({
		choices: choices.length,
		branches: choices.flatMap(getBranchCount),
	}));
};

/**
 * @param {LayerSolverSolution} solution
 */
export const getBranchStructure = ({ branches }) => {
	if (branches === undefined) {
		return [];
	}
	return branches.map((branch) => branch.map(getBranchStructure));
};

/**
 * @param {LayerSolverSolution} solution
 */
const getBranchLeafStructure = ({ branches }) => {
	if (branches === undefined) {
		return "leaf";
	}
	return branches.map((branch) => branch.map(getBranchLeafStructure));
};

/**
 * @param {LayerSolverSolution} solution
 * @param {number[]} [pattern]
 */
export const gather = ({ orders, branches }, pattern = []) => [
	orders,
	...(branches || []).flatMap((branch) => gather(branch[pattern.shift() || 0], pattern)),
];

/**
 * @param {LayerSolverSolution} solution
 * @param {number[]} [pattern]
 */
export const compile = ({ orders, branches }, pattern) =>
	gather({ orders, branches }, pattern).flat();

/**
 * @param {LayerSolverSolution} solution
 * @returns {{[key:string]: number}[][]}
 */
export const gatherAll = ({ orders, branches }) => {
	if (!branches) {
		return [[orders]];
	}

	// each recursion returns an array of solution-lists, and we don't have to
	// maintain separation, so for each branch, we can flatten all recursion
	// results into a single array of solution-lists.
	const branchResults = branches.map((andItem) => andItem.flatMap(gatherAll));

	// each branch contains a list of leaves. we have to "and" every branch
	// with every other branch, meaning we need to choose one leaf from every
	// branch when we pair it with another set of branches. the number of
	// permutations is the product of the lengths of all the branches.
	return makePermutations(...branchResults.map((arr) => arr.length))
		.map((indices) => indices.flatMap((index, i) => branchResults[i][index]))
		.map((solution) => [orders, ...solution]);
};

/**
 * @param {LayerSolverSolution} solution
 */
export const compileAll = ({ orders, branches }) =>
	gatherAll({ orders, branches }).map((arr) => arr.flat());

// const getBranchCountFirst = ({ branches }, counter) => {
// 	if (branches === undefined) { return counter.value++; }
// 	return branches.map(branch => branch.map(el => getBranchCountFirst(el, counter)));
// };

// const getBranchCountNotWorking = ({ branches }, counts = []) => {
// 	if (branches === undefined) { return counts; }
// 	branches.forEach(branch => {
// 		counts.push(branch.length);
// 		branch.forEach(el => getBranchCountNotWorking(el, counts))
// 	});
// 	return counts;
// };

// const getDecisionPoints = ({ branches }) => {
// 	if (branches === undefined) { return "leaf"; }
// 	return branches.map(choices => {
// 		const chooseOne = choices.map(getDecisionPoints);
// 		return { chooseOne };
// 	});
// };

// const getBranchCount = ({ branches }) => {
// 	if (branches === undefined) { return undefined; }
// 	// return branches.map(branch => (!branch.length ? undefined : ({
// 	// 	count: branch.length,
// 	// 	branches: branch
// 	// 		.map(getBranchCount)
// 	// 		.filter(a => a !== undefined)
// 	// })));
// 	const outerResult = branches.map(branch => {
// 	// return branches.map(branch => {
// 		const innerResult = branch.map(getBranchCount).filter(a => a !== undefined);
// 		return (innerResult === undefined || !innerResult.length
// 			? undefined
// 			: ({ count: branch.length, branches: innerResult }));
// 	}).filter(a => a !== undefined && a.length !== 0);
// 	return outerResult;
// 	// console.log("outerResult", outerResult);
// 	// return outerResult === undefined || outerResult.length === 0 ? undefined : outerResult;
// };

export const LayerPrototype = {
	/**
	 * @this {LayerSolverSolution}
	 */
	count: function () {
		return getBranchCount(this);
	},

	/**
	 * @this {LayerSolverSolution}
	 */
	structure: function () {
		return getBranchStructure(this);
	},

	/**
	 * @this {LayerSolverSolution}
	 */
	leaves: function () {
		return getBranchLeafStructure(this);
	},

	/**
	 * @this {LayerSolverSolution}
	 * @param {number[]} pattern
	 */
	gather: function (...pattern) {
		return gather(this, pattern);
	},

	/**
	 * @this {LayerSolverSolution}
	 */
	gatherAll: function () {
		return gatherAll(this);
	},

	/**
	 * @this {LayerSolverSolution}
	 * @param {number[]} pattern
	 */
	compile: function (...pattern) {
		return compile(this, pattern);
	},

	/**
	 * @this {LayerSolverSolution}
	 */
	compileAll: function () {
		return compileAll(this);
	},

	/**
	 * @this {LayerSolverSolution}
	 * @param {number[]} pattern
	 */
	faceOrders: function (...pattern) {
		return compile(this, pattern);
	},
};
