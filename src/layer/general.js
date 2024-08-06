/**
 * Rabbit Ear (c) Kraft
 */

/**
 * @constant
 * @type {string[]}
 */
export const tacoTypeNames = [
	"taco_taco",
	"taco_tortilla",
	"tortilla_tortilla",
	"transitivity",
];

export const emptyCategoryObject = () => ({
	taco_taco: undefined,
	taco_tortilla: undefined,
	tortilla_tortilla: undefined,
	transitivity: undefined,
});

/**
 * @description Convert an array of faces which are involved in one
 * taco/tortilla/transitivity condition into an array of arrays where
 * each face is paired with the others in the precise combination that
 * the solver is expecting for this particular condition.
 * @type {{
 *   taco_taco: (f: TacoTacoConstraint) => [number, number][],
 *   taco_tortilla: (f: TacoTortillaConstraint) => [number, number][],
 *   tortilla_tortilla: (f: TortillaTortillaConstraint) => [number, number][],
 *   transitivity: (f: TransitivityConstraint) => [number, number][],
 * }}
 */
export const constraintToFacePairs = {
	// taco_taco (A,C) (B,D) (B,C) (A,D) (A,B) (C,D)
	taco_taco: (f) => [
		[f[0], f[2]],
		[f[1], f[3]],
		[f[1], f[2]],
		[f[0], f[3]],
		[f[0], f[1]],
		[f[2], f[3]],
	],
	// taco_tortilla (A,C) (A,B) (B,C)
	taco_tortilla: (f) => [
		[f[0], f[2]],
		[f[0], f[1]],
		[f[1], f[2]],
	],
	// tortilla_tortilla (A,C) (B,D)
	tortilla_tortilla: (f) => [
		[f[0], f[2]],
		[f[1], f[3]],
	],
	// transitivity (A,B) (B,C) (C,A)
	transitivity: (f) => [
		[f[0], f[1]],
		[f[1], f[2]],
		[f[2], f[0]],
	],
};

/**
 * @description Given an array of a pair of integers, sort the smallest
 * to be first, and format them into a space-separated string.
 * @param {[number, number]} pair a pair of face indices
 * @returns {string} a space-separated string encoding of the face pair
 */
const sortedPairString = (pair) =>
	pair[0] < pair[1] ? `${pair[0]} ${pair[1]}` : `${pair[1]} ${pair[0]}`;

/**
 * @description Convert an array of faces which are involved in one
 * taco/tortilla/transitivity condition into an array of arrays where
 * each face is paired with the others in the precise combination that
 * the solver is expecting for this particular condition.
 * @type {{
 *   taco_taco: (f: TacoTacoConstraint) => string[],
 *   taco_tortilla: (f: TacoTortillaConstraint) => string[],
 *   tortilla_tortilla: (f: TortillaTortillaConstraint) => string[],
 *   transitivity: (f: TransitivityConstraint) => string[],
 * }}
 */
export const constraintToFacePairsStrings = {
	// taco_taco (A,C) (B,D) (B,C) (A,D) (A,B) (C,D)
	taco_taco: (f) => [
		sortedPairString([f[0], f[2]]),
		sortedPairString([f[1], f[3]]),
		sortedPairString([f[1], f[2]]),
		sortedPairString([f[0], f[3]]),
		sortedPairString([f[0], f[1]]),
		sortedPairString([f[2], f[3]]),
	],
	// taco_tortilla (A,C) (A,B) (B,C)
	taco_tortilla: (f) => [
		sortedPairString([f[0], f[2]]),
		sortedPairString([f[0], f[1]]),
		sortedPairString([f[1], f[2]]),
	],
	// tortilla_tortilla (A,C) (B,D)
	tortilla_tortilla: (f) => [
		sortedPairString([f[0], f[2]]),
		sortedPairString([f[1], f[3]]),
	],
	// transitivity (A,B) (B,C) (C,A)
	transitivity: (f) => [
		sortedPairString([f[0], f[1]]),
		sortedPairString([f[1], f[2]]),
		sortedPairString([f[2], f[0]]),
	],
};

const signedLayerSolverValue = { 0: 0, 1: 1, 2: -1 };

/**
 * @description Convert encodings of layer solutions between pairs of faces.
 * Convert from the solver's 1, 2 encoding, where for faces "A B", a value of
 * - 1: face A is above face B
 * - 2: face A is below face B
 * into the +1/-1 "faceOrders" encoding, as described in the FOLD spec, where:
 * - +1: face A lies above face B, on the same side pointed by B's normal.
 * - −1: face A lies below face B, on the opposite side pointed by B's normal.
 * hence the additional faces_winding data required for conversion.
 * @param {object} facePairOrders an object with face-pair keys and 1, 2 values
 * @param {boolean[]} faces_winding for every face, is the face aligned
 * with the stacking-axis which was used in the layer solver.
 * @returns {[number, number, number][]} faceOrders array
 */
export const solverOrdersToFaceOrders = (facePairOrders, faces_winding) => {
	// convert the space-separated face pair keys into arrays of two integers
	const keys = Object.keys(facePairOrders);
	const faceOrdersPairs = keys.map((string) =>
		string.split(" ").map((n) => parseInt(n, 10)),
	);

	// convert the value (1 or 2) into the faceOrder value (-1 or +1).
	const solutions = faceOrdersPairs.map((faces, i) => {
		// according to the FOLD spec, for order [f, g, s]:
		// +1 indicates that face f lies above face g
		// −1 indicates that face f lies below face g
		// where "above" means on the side pointed to by g's normal vector,
		// and "below" means on the side opposite g's normal vector.
		const value = signedLayerSolverValue[facePairOrders[keys[i]]];
		const side = !faces_winding[faces[1]] ? -value : value;
		// const side = (((value === 1) ^ (faces_aligned[faces[1]])) * -2) + 1;
		return side;
	});

	/** @type {[number, number, number][]} */
	return faceOrdersPairs.map(([a, b], i) => [a, b, solutions[i]]);
};

/**
 * @description Convert encodings of layer solutions between pairs of faces.
 * Convert from the +1/-1 "faceOrders" official FOLD spec encoding, where:
 * - +1: face A lies above face B, on the same side pointed by B's normal.
 * - −1: face A lies below face B, on the opposite side pointed by B's normal.
 * into the solver's 1, 2 encoding, where for faces "A B", a value of
 * - 1: face A is above face B
 * - 2: face A is below face B
 * @param {[number, number, number][]} faceOrders
 * @param {boolean[]} faces_winding for every face, is the face aligned
 * with the stacking-axis which was used in the layer solver.
 * @returns {{[key: string]: number}} an object of layer solution rules
 */
export const faceOrdersToSolverOrders = (faceOrders, faces_winding) => {
	/** @type {{[key: string]: number}} */
	const solverOrders = {};

	// convert the value (1 or 2) into the faceOrder value (-1 or +1).
	faceOrders.forEach(([f, g, order]) => {
		if (order !== 1 && order !== -1) {
			return;
		}
		// according to the FOLD spec, for order [f, g, s]:
		// +1 indicates that face f lies above face g
		// −1 indicates that face f lies below face g
		// where "above" means on the side pointed to by g's normal vector,
		// and "below" means on the side opposite g's normal vector.
		const solution = faces_winding[g]
			? // convert a 1 into a 1, and a -1 into a 2
				(1 - order) / 2 + 1
			: // convert a 1 into a 2, and a -1 into a 1
				(order + 1) / 2 + 1;
		const key = f < g ? `${f} ${g}` : `${g} ${f}`;
		solverOrders[key] =
			f < g
				? solution
				: // faces are in reversed order. swap 1 and 2
					3 - solution;
	});

	return solverOrders;
};

/**
 * @description Merge two or more objects into a single object, carefully
 * checking if keys already exist, and if so, do the values match. If two
 * similar keys have different values between objects, the method will
 * throw an error.
 * @throws an error is thrown if two objects contain the same key with
 * different values.
 * @param {{ [key: string]: number }[]} orders an array of face-pair orders
 * where
 * @returns {{ [key: string]: number }} a single object merge of all input params
 */
export const mergeWithoutOverwrite = (orders) => {
	/** @type {{ [key: string]: number }} */
	const result = {};
	// iterate through the objects
	orders.forEach((order) =>
		Object.keys(order).forEach((key) => {
			if (result[key] !== undefined && result[key] !== order[key]) {
				throw new Error(
					`two competing results: ${result[key]}, ${order[key]}, for "${key}"`,
				);
			}
			result[key] = order[key];
		}),
	);
	return result;
};
