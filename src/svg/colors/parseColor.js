/* SVG (c) Kraft */
import cssColors from "./cssColors.js";
import { hexToRgb, hslToRgb, rgbToHex } from "./convert.js";

/**
 * Rabbit Ear (c) Kraft
 */

/**
 *
 */
const getParenNumbers = (str) => {
	const match = str.match(/\(([^\)]+)\)/g);
	if (match == null || !match.length) {
		return [];
	}
	return match[0]
		.substring(1, match[0].length - 1)
		.split(/[\s,]+/)
		.map(parseFloat);
};

/**
 * @description input a color as a string and get back the RGB
 * values as three numbers in an array. This supports CSS/SVG
 * color strings like named colors, hex colors, rgb(), hsl().
 * @param {string} string a CSS/SVG color string in any form
 * @returns {number[] | undefined} red green blue values between 0 and 255,
 * with possible 4th value between 0 and 1.
 */
const parseColorToRgb = (string) => {
	if (cssColors[string]) {
		return hexToRgb(cssColors[string]);
	}
	if (string[0] === "#") {
		return hexToRgb(string);
	}
	if (string.substring(0, 4) === "rgba" || string.substring(0, 3) === "rgb") {
		const values = getParenNumbers(string);
		[0, 1, 2]
			.filter((i) => values[i] === undefined)
			.forEach((i) => {
				values[i] = 0;
			});
		return values;
	}
	if (string.substring(0, 4) === "hsla" || string.substring(0, 3) === "hsl") {
		const values = getParenNumbers(string);
		[0, 1, 2]
			.filter((i) => values[i] === undefined)
			.forEach((i) => {
				values[i] = 0;
			});
		return hslToRgb(values[0], values[1], values[2], values[3]);
	}
	return undefined;
};

/**
 * @description input a color as a string and return the
 * same color as a hex value string. This supports CSS/SVG
 * color strings like named colors, hex colors, rgb(), hsl().
 * @param {string} string a CSS/SVG color string in any form
 * @returns {string} a hex-color form of the input color string.
 */
const parseColorToHex = (string) => {
	if (cssColors[string]) {
		return cssColors[string].toUpperCase();
	}
	// convert back and forth, this converts 3 or 4 digit hex to 6 or 8.
	if (string[0] === "#") {
		const [r, g, b, a] = hexToRgb(string);
		return rgbToHex(r, g, b, a);
	}
	if (string.substring(0, 4) === "rgba" || string.substring(0, 3) === "rgb") {
		const [r, g, b, a] = getParenNumbers(string);
		return rgbToHex(r, g, b, a);
	}
	if (string.substring(0, 4) === "hsla" || string.substring(0, 3) === "hsl") {
		const values = getParenNumbers(string);
		[0, 1, 2]
			.filter((i) => values[i] === undefined)
			.forEach((i) => {
				values[i] = 0;
			});
		const [h, s, l, a] = values;
		const [r, g, b] = hslToRgb(h, s, l, a);
		return rgbToHex(r, g, b, a);
	}
	return undefined;
};

export { parseColorToHex, parseColorToRgb };
