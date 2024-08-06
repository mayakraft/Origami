/**
 * Rabbit Ear (c) Kraft
 */
import { table } from "./table.js";
import { constraintToFacePairs, tacoTypeNames, emptyCategoryObject } from "./general.js";
import { uniqueElements } from "../general/array.js";

/**
 * @description Given one particular taco/tortilla/transitivity constraint,
 * arrange its faces in all combinations of facePairs and check if any of
 * these orders are known (1 or 2), arrange this into a string (eg. 010021),
 * and use this string to reference the lookup table which will return one
 * of three states: valid, invalid, or the change implied by this state.
 * @param {string} type one of the four:
 * "taco_taco", "taco_tortilla", "tortilla_tortilla", "transitivity"
 * @param {number[]} constraint an array of the faces
 * involved in this particular condition.
 * @param {...{[key: string]: number}} orders an array of solutions to
 * facePair orders. each taking the form of facePair keys,
 * and orders (0,1,2) values.
 * @returns {(boolean | [string, number])} true if valid, false if invalid,
 * and in the case of an implied change, return an array where the
 * first item is a facePair ("3 5"), and the second is the order (like 1 or 2).
 */
const buildRuleAndLookup = (type, constraint, ...orders) => {
	// flip face order
	const flipFacePairOrder = { 0: 0, 1: 2, 2: 1 };
	// regroup the N faces into an array of pairs, giving us the
	// facePair ("3 5") and booleans stating if the order was flipped.
	/** @type {[number, number]} */
	const facePairsArray = constraintToFacePairs[type](constraint);
	// are the two faces in each pair out of order (not sorted),
	// meaning taht when we apply the order, we need to flip it first.
	const flipped = facePairsArray.map((pair) => pair[1] < pair[0]);
	const facePairs = facePairsArray.map((pair, i) =>
		flipped[i] ? `${pair[1]} ${pair[0]}` : `${pair[0]} ${pair[1]}`,
	);
	// consult all "orders" parameters for a solution (1 or 2, not 0) to
	// the facePair. for each facePair get the first solution found, and
	// in the case of no solution, that facePair will be 0 (unknown).
	// join this together into a string, (eg: "010021")

	// for each facePair, get the first available entry in orders, or 0 if none.
	const key = facePairs
		.map((facePair) => orders.find((o) => o[facePair]))
		.map((order, i) => (order === undefined ? 0 : order[facePairs[i]]))
		.map((value, i) => (flipped[i] ? flipFacePairOrder[value] : value))
		.join("");

	// now, consult the lookup table. if the result is a boolean, return it.
	if (table[type][key] === true || table[type][key] === false) {
		return table[type][key];
	}

	// now, we know the table value is an array (not a boolean).
	// the table is giving us an implied state. return the implication's
	// facePair and order as an array. make sure to flip the order if necessary.
	/** @type {[number, number]} */
	const [pairIndex, suggestedOrder] = table[type][key];
	const facePair = facePairs[pairIndex];
	/** @type {number} */
	const order = flipped[pairIndex] ? flipFacePairOrder[suggestedOrder] : suggestedOrder;
	return [facePair, order];
};

// const getFacesWithUnknownOrdersArray = (...orders) => {
// 	const unknownKeys = orders
// 		.map(facePairsOrder => Object.keys(facePairsOrder)
// 			.filter(key => facePairsOrder[key] !== 0))
// 		.flat();
// 	return uniqueElements(unknownKeys.map(key => key.split(" ")).flat());
// };
/**
 * @description Given a current set of modified facePairs keys, (modified
 * since the last time we ran this), get all condition indices that
 * include one or more of these facePairs. Additionally, filter out
 * the faces which only ever appear in solved facePairs.
 */
// const getConstraintIndicesFromFacePairs = (
// 	constraints,
// 	lookup,
// 	facePairsSubsetArray,
// 	...orders
// ) => {
// 	const facesWithUnknownOrders = {};
// 	getFacesWithUnknownOrdersArray(...orders)
// 		.forEach(f => { facesWithUnknownOrders[f] = true; });

// 	const constraintIndices = {};
// 	tacoTypeNames.forEach(type => {
// 		// given the array of modified facePairs since last round, get all
// 		// the indices in the constraints array in which these facePairs exist.
// 		const duplicates = facePairsSubsetArray
// 			.flatMap(facePair => lookup[type][facePair]);
// 		// filter these constraint indices so that (1) no duplicates and
// 		// (2) only faces which appear in an unknown order (0) are included,
// 		// which is done by consulting constraints[i] and checking all faces
// 		// mentioned in this array, testing if any of them are unknown
// 		constraintIndices[type] = uniqueElements(duplicates)
// 			.filter(i => constraints[type][i]
// 				.map(f => facesWithUnknownOrders[f])
// 				.reduce((a, b) => a || b, false));
// 	});
// 	return constraintIndices;
// };

/**
 * @description Given a current set of modified facePairs keys, (modified
 * since the last time we ran this), get all condition indices that
 * include one or more of these facePairs.
 * @param {{
 *   taco_taco: TacoTacoConstraint[],
 *   taco_tortilla: TacoTortillaConstraint[],
 *   tortilla_tortilla: TortillaTortillaConstraint[],
 *   transitivity: TransitivityConstraint[],
 * }} constraints an object containing all four cases, inside
 * of each is an (very large, typically) array of all constraints as a list of faces.
 * @param {{
 *   taco_taco: number[][],
 *   taco_tortilla: number[][],
 *   tortilla_tortilla: number[][],
 *   transitivity: number[][],
 * }} lookup a map which contains, for every
 * taco/tortilla/transitivity case (top level keys), inside each is an object
 * which relates each facePair (key) to an array of indices (value),
 * where each index is an index in the "constraints" array
 * in which **both** of these faces appear.
 * @param {string[]} facePairsSubsetArray an array of facePair string keys.
 * @returns {{
 *   taco_taco: number[],
 *   taco_tortilla: number[],
 *   tortilla_tortilla: number[],
 *   transitivity: number[],
 * }}
 */
const getConstraintIndicesFromFacePairs = (constraints, lookup, facePairsSubsetArray) => {
	/**
	 * @type {{
	 *   taco_taco: number[],
	 *   taco_tortilla: number[],
	 *   tortilla_tortilla: number[],
	 *   transitivity: number[],
	 * }}
	 */
	const constraintIndices = emptyCategoryObject();
	tacoTypeNames.forEach((type) => {
		// given the array of modified facePairs since last round, get all
		// the indices in the constraints array in which these facePairs exist.
		// this array will contain duplicates
		/** @type {number[]} */
		const constraintIndicesWithDups = facePairsSubsetArray.flatMap(
			(facePair) => lookup[type][facePair],
		);

		// filter these constraint indices to remove duplicates
		constraintIndices[type] = uniqueElements(constraintIndicesWithDups).filter(
			(i) => constraints[type][i],
		);
	});
	return constraintIndices;
};

/**
 * @description Consult the lookup table for the current layer-orders,
 * check for any implied layer order changes (and check for validity), propagate
 * these implied states, check these updated conditions for new implications, repeat.
 * @param {{
 *   taco_taco: TacoTacoConstraint[],
 *   taco_tortilla: TacoTortillaConstraint[],
 *   tortilla_tortilla: TortillaTortillaConstraint[],
 *   transitivity: TransitivityConstraint[],
 * }} constraints an object containing all four cases, inside
 * of each is an (very large, typically) array of all constraints as a list of faces.
 * @param {{
 *   taco_taco: number[][],
 *   taco_tortilla: number[][],
 *   tortilla_tortilla: number[][],
 *   transitivity: number[][],
 * }} constraintsLookup a map which contains, for every taco/tortilla/transitivity case
 * (top level keys), inside each is an object which relates each facePair (key) to
 * an array of indices (value), where each index is an index in the "constraints"
 * array in which **both** of these faces appear.
 * @param {string[]} initiallyModifiedFacePairs an array of facePair string keys.
 * These are the keys which had a layer change since the last time running this method.
 * @param {...{[key: string]: number}} orders any number of facePairsOrder solutions
 * which relate facePairs (key) like "3 5" to an order, either 0, 1, or 2.
 * @returns {{[key: string]: number}} an object that maps face-pair strings
 * to an order value, either 1 or 2
 */
export const propagate = (
	constraints,
	constraintsLookup,
	initiallyModifiedFacePairs,
	...orders
) => {
	// "modifiedFacePairs" is an array of facePair strings, as we make updates and
	// apply changes and repeat, this will hold all changed facePair keys.
	// the moment this array is empty, we have finished propagating all changes.
	let modifiedFacePairs = initiallyModifiedFacePairs;

	// this is the result which will be returned, it maps facePairs (keys)
	// to layer orders, either 1 or 2 (values) and contains only those facePairs
	// which were changed by this method, so it will never contain a 0 value condition.
	/** @type {{[key: string]: number}} */
	const newOrders = {};
	do {
		// using the facePairs which were modified in the last loop,
		// get all constraint indices which involve any of the individual faces
		// from any of these facePairs.
		const modifiedConstraintIndices = getConstraintIndicesFromFacePairs(
			constraints,
			constraintsLookup,
			modifiedFacePairs,
		);

		// todo: do you get better results by fast forwarding through all taco-taco
		// newOrders (or transitivity, or any one in particular), before then
		// moving onto the other sets, or is it faster to depth-first search through all?
		// the modifications that happened this round
		const roundModificationsFacePairs = {};
		for (let t = 0; t < tacoTypeNames.length; t += 1) {
			const type = tacoTypeNames[t];
			/** @type {number[]} */
			const indices = modifiedConstraintIndices[type];
			for (let i = 0; i < indices.length; i += 1) {
				const lookupResult = buildRuleAndLookup(
					type,
					constraints[type][indices[i]],
					...orders,
					newOrders,
				);
				if (lookupResult === true) {
					continue;
				}
				if (lookupResult === false) {
					throw new Error(
						`invalid ${type} ${indices[i]}:${constraints[type][indices[i]]}`,
					);
				}
				if (newOrders[lookupResult[0]]) {
					// rule already exists. make sure the results match
					if (newOrders[lookupResult[0]] !== lookupResult[1]) {
						throw new Error(
							`conflict ${type} ${indices[i]}:${constraints[type][indices[i]]}`,
						);
					}
				} else {
					const [key, value] = lookupResult;
					roundModificationsFacePairs[key] = true;
					newOrders[lookupResult[0]] = value;
				}
			}
		}
		modifiedFacePairs = Object.keys(roundModificationsFacePairs);
	} while (modifiedFacePairs.length);
	return newOrders;
};
