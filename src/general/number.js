/**
 * Rabbit Ear (c) Kraft
 */

/**
 * @description Count the number of places deep past the decimal point.
 * @param {number} num any number
 * @returns {number} an integer, the number of decimal digits.
 */
const countPlaces = function (num) {
	const m = `${num}`.match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
	return Math.max(0, (m[1] ? m[1].length : 0) - (m[2] ? +m[2] : 0));
};

/**
 * @description clean floating point numbers, for example,
 * 15.0000000000000002 becomes 15. this method involves
 * encoding and parsing so it is relatively expensive.
 * @param {number} number the floating point number to clean
 * @param {number} [places=15] an integer, the number of decimal places
 * to keep, beyond this point can be considered to be noise.
 * @returns {number} the cleaned floating point number
 */
export const cleanNumber = function (number, places = 15) {
	const num = typeof number === "number" ? number : parseFloat(number);
	if (Number.isNaN(num)) {
		return number;
	}
	const crop = parseFloat(num.toFixed(places));
	if (countPlaces(crop) === Math.min(places, countPlaces(num))) {
		return num;
	}
	return crop;
};
