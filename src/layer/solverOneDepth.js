/**
 * Rabbit Ear (c) Kraft
 */
import Messages from "../environment/messages.js";
import { propagate } from "./propagate.js";
import { getBranches } from "./getBranches.js";

/**
 * @description Given an array of unsolved facePair keys, attempt to solve
 * the entire set by guessing both states (1, 2) for one key, propagate any
 * implications, repeat another guess (1, 2) on another key, propagate, repeat...
 * This method is recursive but will only branch a maximum of two times each
 * recursion (one for each guess 1, 2). For each recursion, all solutions are
 * gathered into a single object, and that round's solved facePairs are added
 * to the "...orders" parameter. When all unsolvedKeys are solved, the result
 * is an array of solutions, each solving represeting the set of solutions from
 * each depth. Combine these solutions using Object.assign({}, ...orders)
 * @param {{
 *   taco_taco: TacoTacoConstraint[],
 *   taco_tortilla: TacoTortillaConstraint[],
 *   tortilla_tortilla: TortillaTortillaConstraint[],
 *   transitivity: TransitivityConstraint[],
 * }} constraints an object containing all constraints for the solver.
 * @param {{
 *   taco_taco: number[][],
 *   taco_tortilla: number[][],
 *   tortilla_tortilla: number[][],
 *   transitivity: number[][],
 * }} lookup a map which relates each facePair (key) to an array of
 * indices (value), where each index is an index in the "constraints" array
 * in which **both** of these faces appear.
 * @param {string[]} unsolvedKeys array of facePair keys to be solved
 * @param {...{[key: string]: number}} orders any number of facePairsOrder
 * solutions which relate facePairs (key) like "3 5" to an order,
 * either 0, 1, or 2.
 * @returns {{[key: string]: number}[][]} an array of arrays of solution
 * objects, where each top level array entry is a "branch" and inside each
 * branch is an array of solution objects when taken together compose
 * a complete solution.
 */
const solveBranch = (constraints, lookup, unsolvedKeys, ...orders) => {
	if (!unsolvedKeys.length) {
		return [];
	}
	// the purpose of this branch is to solve the unsolved keys, where currently,
	// there is nothing to solve, so we make the first step by choosing one key
	// guessing the value (either 1 or 2), and propagating that guess'
	// state until we find it is to be either successful, impossible, or
	// currently successful but not yet complete.
	const guessKey = unsolvedKeys[0];

	/**
	 * @param {number} guessValue
	 * @returns {{[key: string]: number} | undefined} a new set of face-pair
	 * solutions discovered via. propagate, or undefined if the guess was bad.
	 */
	const tryPropagate = (guessValue) => {
		// our new guess key/value object
		const guess = { [guessKey]: guessValue };

		// propagate a guess with the one new guess key/value, if successful,
		// the one guess is left out of the result, so, append it to the result.
		// if propagate throws, it's not a problem, simply throw away this guess.
		try {
			const result = propagate(constraints, lookup, [guessKey], ...orders, guess);
			return Object.assign(result, guess);
		} catch (error) {
			return undefined;
		}
	};

	// now that we have our guessKey, choose all possible values that the key
	// can be (either 1 or 2) and run propagate with a new solution subset object.
	const guessResults = [1, 2].map(tryPropagate).filter((a) => a !== undefined);

	// check if all variables are solved or more work is required.
	// store the result as either completed or unfinished
	const resultCount = guessResults.map((result) => Object.keys(result).length);
	const completed = guessResults.filter((_, i) => resultCount[i] === unsolvedKeys.length);
	const unfinished = guessResults.filter(
		(_, i) => resultCount[i] !== unsolvedKeys.length,
	);

	// For every unfinished solution, where each solution contains a different
	// result to one or more of the face-pairs from each other, consider each
	// of these to now be a new branch in the total set of possible solutions
	// to explore. Each branch may or may not end up being successful, and if
	// unsuccessful, the recursed branch will become undefined, which will get
	// filtered out later in the return statement. Recurse with the subset of
	// unfinishedKeys, and append the new branch's set of orders to the end.
	const recursed = unfinished.map((order) =>
		solveBranch(
			constraints,
			lookup,
			unsolvedKeys.filter((key) => !(key in order)),
			...orders,
			order,
		),
	);

	// each branch is an individual entry in this array, where each branch itself
	// is a list of order objects, where each object covers a subset of the total
	// solution.
	return completed.map((order) => [...orders, order]).concat(...recursed);
};

/**
 * @description Recursively calculate all layer order solutions between faces
 * in a flat-folded FOLD graph.
 * @param {{
 *   constraints: {
 *     taco_taco: TacoTacoConstraint[],
 *     taco_tortilla: TacoTortillaConstraint[],
 *     tortilla_tortilla: TortillaTortillaConstraint[],
 *     transitivity: TransitivityConstraint[],
 *   },
 *   lookup: {
 *     taco_taco: number[][],
 *     taco_tortilla: number[][],
 *     tortilla_tortilla: number[][],
 *     transitivity: number[][],
 *   },
 *   facePairs: string[],
 *   orders: { [key: string]: number },
 * }} solverParams the parameters for the solver which include:
 * - constraints for each taco/tortilla type, an array of each
 *   condition, each condition being an array of all faces involved.
 * - lookup for each taco/tortilla type, a reverse lookup table
 *   where each face-pair contains an array of all constraints its involved in
 * - facePairs an array of space-separated face pair strings
 * - orders a prelimiary solution to some of the facePairs
 *   with solutions in 1,2 value encoding. Useful for any pre-calculations,
 *   for example, pre-calculating edge-adjacent face pairs with known assignments.
 * @returns {{
 *   root: {[key:string]: number},
 *   branches: {[key: string]: number}[][],
 * }} a set of solutions where keys are space-separated face pair strings,
 * and values are 1 or 2 describing the relationship of the two faces.
 * Results are stored in "root" and "branches", to compile a complete solution,
 * append the "root" to one selection from each array in "branches".
 */
export const solver = ({ constraints, lookup, facePairs, orders }) => {
	// "orders" is any pre-solved orders between faces, in the default case,
	// this contains orders which were solved bewteen edge-adjacent pairs of
	// faces. Whatever this input set is, we use it as the seed for the
	// first run through propagate which will stop the moment that it finds
	// a branch. The result is a set of orders which are true for all cases.
	/** @type {{ [key: string]: number }} */
	let initialResult;
	try {
		initialResult = propagate(constraints, lookup, Object.keys(orders), orders);
	} catch (error) {
		throw new Error(Messages.noLayerSolution, { cause: error });
	}

	// get all keys unsolved after the first round of propagate
	const remainingKeys = facePairs
		.filter((key) => !(key in orders))
		.filter((key) => !(key in initialResult));

	// group the remaining keys into groups that are isolated from one another.
	// recursively solve each branch, each branch could have more than one solution.
	/** @type {{[key: string]: number}[][][]} */
	let branchResults;
	try {
		branchResults = getBranches(remainingKeys, constraints, lookup).map((unsolvedKeys) =>
			solveBranch(constraints, lookup, unsolvedKeys, orders, initialResult),
		);
	} catch (error) {
		throw new Error(Messages.noLayerSolution, { cause: error });
	}

	// solver is finished.
	// the set of face-pair solutions which are true for all branches
	const root = { ...orders, ...initialResult };

	// due to the recursive nature of getBranches, each branch contains every
	// solution object which compiles into a result, including the first two
	// (orders, initialResult) which are returned as "root". remove these two
	// from the result, intending that to "compile" a result you will need
	// to join the root data with the branches data.
	branchResults.forEach((branch) => branch.forEach((solution) => solution.splice(0, 2)));

	// each branch result is spread across multiple objects
	// containing a solution for a subset of the entire set of faces, one for
	// each recursion depth. for each branch solution, merge its objects into one.
	/** @type {{[key: string]: number}[][]} */
	const branches = branchResults.map((branch) =>
		branch.map((solution) => Object.assign({}, ...solution)),
	);

	return { root, branches };
};
