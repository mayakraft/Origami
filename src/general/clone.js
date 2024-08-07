/**
 * Rabbit Ear (c) Kraft
 */

/**
 * @description This is a polyfill for "structuredClone"
 * similar to running JSON.parse(JSON.stringify()).
 * This method will deep copy an object, with a few caveats:
 *  - it doesn't detect recursive cycles
 *  - weird behavior around Proxys
 * @author https://jsperf.com/deep-copy-vs-json-stringify-json-parse/5
 * @param {object} o
 * @returns {object} a deep copy of the input
 */
const clonePolyfill = function (o) {
	let newO;
	let i;
	if (typeof o !== "object") {
		return o;
	}
	if (!o) {
		return o;
	}
	if (Object.prototype.toString.apply(o) === "[object Array]") {
		newO = [];
		for (i = 0; i < o.length; i += 1) {
			newO[i] = clonePolyfill(o[i]);
		}
		return newO;
	}
	newO = {};
	for (i in o) {
		if (o.hasOwnProperty(i)) {
			// this is where a self-similar reference causes an infinite loop
			newO[i] = clonePolyfill(o[i]);
		}
	}
	return newO;
};

/**
 * @description Export "structuredClone" if it exists,
 * otherwise export the polyfill method.
 * @param {object} object
 * @returns {object} a deep copy of the input object
 */
export const clone =
	typeof structuredClone === "function" ? structuredClone : clonePolyfill;
