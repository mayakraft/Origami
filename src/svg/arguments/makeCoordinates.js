/* SVG (c) Kraft */
import { str_number, str_object } from "../environment/strings.js";

/**
 * Rabbit Ear (c) Kraft
 */
/**
 * this will extract coordinates from a set of inputs
 * and present them as a stride-2 flat array. length % 2 === 0
 * a 1D array of numbers, alternating x y
 *
 * use flatten() everytime you call this!
 * it's necessary the entries sit at the top level of ...args
 * findCoordinates(...flatten(...args));
 */
const makeCoordinates = (...args) =>
	args
		.filter((a) => typeof a === str_number)
		.concat(
			args
				.filter((a) => typeof a === str_object && a !== null)
				.map((el) => {
					if (typeof el.x === str_number) {
						return [el.x, el.y];
					}
					if (typeof el[0] === str_number) {
						return [el[0], el[1]];
					}
					return undefined;
				})
				.filter((a) => a !== undefined)
				.reduce((a, b) => a.concat(b), []),
		);

export { makeCoordinates as default };
