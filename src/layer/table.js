/**
 * Rabbit Ear (c) Kraft
 */

/**
 * @description each state encodes a valid layer combination. each number
 * describes a relationship between pairs of faces, for pairs "A B":
 * - 1: face A is above face B
 * - 2: face A is below face B
 * each taco/tortilla set has its own encoding of face pairs.
 */
// A-C and B-D are connected
// "(A,C) (B,D) (B,C) (A,D) (A,B) (C,D)"
const taco_taco_valid_states = [
	"111112",
	"111121",
	"111222",
	"112111",
	"121112",
	"121222",
	"122111",
	"122212",
	"211121",
	"211222",
	"212111",
	"212221",
	"221222",
	"222111",
	"222212",
	"222221",
];
// A-C is the taco, B is the tortilla
// (A,C) (A,B) (B,C)
const taco_tortilla_valid_states = ["112", "121", "212", "221"];

// A-B and C-D are connected, A is above/below C, B is above/below D
// (A,C) (B,D)
// in the case of tortilla-crossing face, the crossing face
// appears twice, the same index appears in place of both C and D
const tortilla_tortilla_valid_states = ["11", "22"];

// const tortilla_face_valid_states = [];
// (A,B) (B,C) (C,A)
const transitivity_valid_states = ["112", "121", "122", "211", "212", "221"];

/**
 * @description Find a solution for a state. Solutions will be either:
 * - false: indicating the state is invalid
 * - true: indicating the state is valid (if not yet complete)
 * - [a, b]: a modification suggestion to change index [a] to value b.
 * When this method is called for a key, all states in the "states" array
 * with one fewer zero (unknown) than our current key have at this point
 * already been solved. So, modify our key by replacing a zero with a guess,
 * check the state and see if we can find a modification suggestion, ultimately
 * building a chain of suggestions that lead keys to solutions (where possible).
 * @param {{[key: string]: (boolean | [number, number])}[]} states an array of
 * objects encoding a layer state to a result.
 * @param {number} t a number between 0 and N, indicating the number of zeros
 * in this key, and indicating the index in "states" we should be writing to.
 * @param {string} key a layer order as a string, like "001221"
 */
const setState = (states, t, key) => {
	// convert the key into an array of integers (0, 1, 2)
	const characters = Array.from(key).map((char) => parseInt(char, 10));

	// filter out the keys which do not below in this set.
	// the reason we aren't doing this ahead of time is because it requires
	// parsing each character, which we are already doing here.
	// only keys with the number of "0"s matching the number "t" are allowed.
	if (characters.filter((x) => x === 0).length !== t) {
		return;
	}

	// initialize the result to false (no solution possible).
	// eslint-disable-next-line no-param-reassign
	states[t][key] = false;

	// solution will either be true, false, or an array of two integers
	// where the two integers describe a modification to be made.
	// if we encounter a valid suggestion (modify one character takes us
	// to a valid state), store it here.
	const modifications = [];

	// iterate through every character (only the zero characters),
	// replace it with a 1 and a 2 and see if either lead us to a valid solution.
	for (let i = 0; i < characters.length; i += 1) {
		const roundModifications = [];

		// look at the unknown layers only (where the character is zero)
		if (characters[i] !== 0) {
			continue;
		}

		// in place of the unknowns, try each of the possible states (1, 2)
		for (let x = 1; x <= 2; x += 1) {
			// temporarily modify the character in place to our guess
			characters[i] = x;

			// if this state exists in the previous set, save the modification
			// instruction which would lead our key to this next key.
			if (states[t - 1][characters.join("")] !== false) {
				roundModifications.push([i, x]);
			}
		}

		// undo our guess, set it back to 0, in preparation for the next iteration
		characters[i] = 0;

		// if we found a modifications instruction (even if we aren't using them),
		// we can say the solution is no longer false. now we just need to know if
		// the solution will be a modification instruction or simply "true".
		if (roundModifications.length) {
			// eslint-disable-next-line no-param-reassign
			states[t][key] = true;
		}

		// if roundModifications is length 2, this means both possible states
		// led us to a solution, therefore we can't infer anything.
		// only add a modification instruction if this round found only 1.
		if (roundModifications.length === 1) {
			modifications.push(roundModifications[0]);
		}
	}

	// if found, the result will be the (first) modification instruction.
	// it doesn't matter which one, we just need one.
	if (modifications.length) {
		// eslint-disable-next-line no-param-reassign
		states[t][key] = [modifications[0][0], modifications[0][1]];
	}
};

/**
 * @description make a lookup table for every possible state of a taco/
 * tortilla combination, given the particular taco/tortilla valid states.
 * the value of each state is one of 3 values (2 numbers, 1 array):
 * - false: layer order is not valid
 * - true: layer order is currently valid. and is either solved (key contains
 *   no zeros / unknowns), or it is not yet invalid and can still be solved.
 * - (Array): two numbers, [index, value], modify the current layer by
 *   changing the number at index to the value.
 * @param {string[]} valid_states, one of the 3 set of valid states above
 * @returns {{[key: string]: Readonly<(boolean | [number, number])>}} an object that
 * maps a state key to a result.
 */
// const flip = { 0:0, 1:2, 2:1 };
const makeLookupEntry = (valid_states) => {
	// the choose count can be inferred by the length of the valid states
	// (assuming they are all the same length)
	const chooseCount = valid_states[0].length;

	// this array will contain all states (keys) and their solutions (values).
	// the states are sorted into arrays of objects, where keys are sorted by
	// how many 0s they contain (index [0]: no zeros, index [1]: 1 zero...)
	/** @type {{[key: string]: (boolean | [number, number])}[]} */
	const states = Array.from(Array(chooseCount + 1)).map(() => ({}));

	// this array initializer will create all permutations of 1s and 2s (no zeros)
	// all strings having the length of chooseCount. (ie. for 6: 111112, 212221)
	// because all these keys contain no zeros, they are all inside the [0] index.
	// initialize all keys to "false" for now.
	Array.from(Array(2 ** chooseCount))
		.map((_, i) => i.toString(2))
		.map((str) =>
			Array.from(str)
				.map((n) => parseInt(n, 10) + 1)
				.join(""),
		)
		.map((str) => `11111${str}`.slice(-chooseCount))
		.forEach((key) => {
			states[0][key] = false;
		});

	// set all valid cases to be "true" (indicating the solution is possible)
	valid_states.forEach((s) => {
		states[0][s] = true;
	});

	// now we fill in the rest of the states. In a similar manner as before,
	// create all permuations, length of chooseCount, but this time include
	// 0, 1, or 2 for every character. "t" relates to the number of unknowns
	// (number of zeros) this will be the index in "states" we store this key.
	// level [0] is already complete, start incrementing from level [1].
	// this is generating, for every level, the same set of strings, which is
	// too much, however they will get filtered out inside setState.
	Array.from(Array(chooseCount))
		.map((_, i) => i + 1)
		.map((t) =>
			Array.from(Array(3 ** chooseCount))
				.map((_, i) => i.toString(3))
				.map((str) => `000000${str}`.slice(-chooseCount))
				.forEach((key) => setState(states, t, key)),
		);

	// gather all solutions together into one object.
	/** @type {{[key: string]: Readonly<(boolean | [number, number])>}} */
	const lookup = states.reduce((a, b) => ({ ...a, ...b }));

	// recursively freeze result, this is intended to be an immutable reference
	Object.keys(lookup)
		.filter((key) => typeof lookup[key] === "object")
		.forEach((key) => {
			lookup[key] = Object.freeze(lookup[key]);
		});
	return Object.freeze(lookup);
};

/**
 * @name table
 * @memberof layer
 * @constant
 * @type {{
 *   taco_taco: {[key:string]: Readonly<(boolean | [number, number])>},
 *   taco_tortilla: {[key:string]: Readonly<(boolean | [number, number])>},
 *   tortilla_tortilla: {[key:string]: Readonly<(boolean | [number, number])>},
 *   transitivity: {[key:string]: Readonly<(boolean | [number, number])>},
 * }}
 * @description This lookup table encodes all possible taco-taco,
 * taco-tortilla, tortilla-tortilla, and transitivity constraints between
 * groups of faces in a folded graph. Given an encoded state, as a key
 * of this object, the value represents either:
 * - {boolean} true: the layer order is so far valid
 * - {boolean} false: the layer order is invalid
 * - {[number, number]}: the layer order is valid, and, here is another
 * relationship which can be inferred from the current state.
 * This is an implementation of an algorithm designed by [Jason Ku](//jasonku.mit.edu).
 */
export const table = {
	taco_taco: makeLookupEntry(taco_taco_valid_states),
	taco_tortilla: makeLookupEntry(taco_tortilla_valid_states),
	tortilla_tortilla: makeLookupEntry(tortilla_tortilla_valid_states),
	transitivity: makeLookupEntry(transitivity_valid_states),
};
