/* svg (c) Kraft, MIT License */
import { str_number, str_object } from '../environment/strings.js';

const makeCoordinates = (...args) => args
	.filter(a => typeof a === str_number)
	.concat(args
		.filter(a => typeof a === str_object && a !== null)
		.map((el) => {
			if (typeof el.x === str_number) { return [el.x, el.y]; }
			if (typeof el[0] === str_number) { return [el[0], el[1]]; }
			return undefined;
		}).filter(a => a !== undefined)
		.reduce((a, b) => a.concat(b), []));

export { makeCoordinates as default };
