/* SVG (c) Kraft */
/**
 * Rabbit Ear (c) Kraft
 */

/**
 * @param {number} n
 */
const roundF = (n) => Math.round(n * 100) / 100;

/**
 * @description Convert hue-saturation-lightness values into
 * three RGB values, each between 0 and 1 (not 0-255).
 * @param {number} hue value between 0 and 360
 * @param {number} saturation value between 0 and 100
 * @param {number} lightness value between 0 and 100
 * @param {number | undefined} alpha the alpha component from 0 to 1
 * @returns {number[]} three values between 0 and 255, or four
 * if an alpha value is provided, where the fourth is between 0 and 1.
 * @linkcode Origami ./src/convert/svgParsers/colors/hexToRGB.js 10
 */
const hslToRgb = (hue, saturation, lightness, alpha) => {
	const s = saturation / 100;
	const l = lightness / 100;
	/** @param {number} n */
	const k = (n) => (n + hue / 30) % 12;
	const a = s * Math.min(l, 1 - l);
	/** @param {number} n */
	const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
	return alpha === undefined
		? [f(0) * 255, f(8) * 255, f(4) * 255]
		: [f(0) * 255, f(8) * 255, f(4) * 255, alpha];
};

/**
 *
 */
const mapHexNumbers = (numbers, map) => {
	// ensure a minimum number of characters (fill 0 if needed)
	const chars = Array.from(Array(map.length)).map((_, i) => numbers[i] || "0");
	// handle abbreviated hex codes: #fb4 or #fb48 (with alpha)
	return numbers.length <= 4 ? map.map((i) => chars[i]).join("") : chars.join("");
};

/**
 * @description Convert a hex string into an array of
 * three numbers, the rgb values (between 0 and 1).
 * This ignores any alpha values.
 * @param {string} string a hex color code as a string
 * @returns {number[]} three values between 0 and 255
 * @linkcode Origami ./src/convert/svgParsers/colors/hexToRGB.js 10
 */
const hexToRgb = (string) => {
	const numbers = string.replace(/#(?=\S)/g, "");
	const hasAlpha = numbers.length === 4 || numbers.length === 8;
	const hexString = hasAlpha
		? mapHexNumbers(numbers, [0, 0, 1, 1, 2, 2, 3, 3])
		: mapHexNumbers(numbers, [0, 0, 1, 1, 2, 2]);
	const c = parseInt(hexString, 16);
	return hasAlpha
		? [(c >> 24) & 255, (c >> 16) & 255, (c >> 8) & 255, roundF((c & 255) / 256)]
		: [(c >> 16) & 255, (c >> 8) & 255, c & 255];
};

/**
 * @param {number} red the red component from 0 to 255
 * @param {number} green the green component from 0 to 255
 * @param {number} blue the blue component from 0 to 255
 * @param {number | undefined} alpha the alpha component from 0 to 1
 * @returns {string} hex string, with our without alpha.
 */
const rgbToHex = (red, green, blue, alpha) => {
	/** @param {number} n */
	const to16 = (n) =>
		`00${Math.max(0, Math.min(Math.round(n), 255)).toString(16)}`.slice(-2);
	const hex = `#${[red, green, blue].map(to16).join("")}`;
	return alpha === undefined ? hex : `${hex}${to16(alpha * 255)}`;
};

export { hexToRgb, hslToRgb, rgbToHex };
