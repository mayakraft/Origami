/**
 * Rabbit Ear (c) Kraft
 */
import { parseColorToRgb } from "../../svg/colors/parseColor.js";

export const dark = {
	B: [0.5, 0.5, 0.5],
	b: [0.5, 0.5, 0.5],
	V: [0.2, 0.4, 0.6],
	v: [0.2, 0.4, 0.6],
	M: [0.75, 0.25, 0.15],
	m: [0.75, 0.25, 0.15],
	F: [0.3, 0.3, 0.3],
	f: [0.3, 0.3, 0.3],
	J: [0.3, 0.2, 0.0],
	j: [0.3, 0.2, 0.0],
	C: [0.5, 0.8, 0.1],
	c: [0.5, 0.8, 0.1],
	U: [0.6, 0.25, 0.9],
	u: [0.6, 0.25, 0.9],
};

export const light = {
	B: [0.0, 0.0, 0.0],
	b: [0.0, 0.0, 0.0],
	V: [0.2, 0.5, 0.8],
	v: [0.2, 0.5, 0.8],
	M: [0.75, 0.25, 0.15],
	m: [0.75, 0.25, 0.15],
	F: [0.75, 0.75, 0.75],
	f: [0.75, 0.75, 0.75],
	J: [1.0, 0.75, 0.25],
	j: [1.0, 0.75, 0.25],
	C: [0.5, 0.8, 0.1],
	c: [0.5, 0.8, 0.1],
	U: [0.6, 0.25, 0.9],
	u: [0.6, 0.25, 0.9],
};

/**
 * @description Convert a color into a WebGL RGB with three
 * float values,, red, green, and blue, between 0.0 and 1.0.
 * @param {number[]|string} color a color as an array of 0-255 values,
 * or a RGB/HSL/hex encoded string
 * @returns {[number, number, number]|undefined} list of three numbers
 * red, green, blue, each value between 0.0 and 1.0.
 */
export const parseColorToWebGLColor = (color) => {
	if (typeof color === "string") {
		const [r, g, b] = parseColorToRgb(color)
			.slice(0, 3)
			.map((n) => n / 255);
		return [r, g, b];
	}

	// assuming the three values are already in WebGL format (0...1) not (0...255)
	if (color && color.constructor === Array) {
		const [r, g, b] = color;
		return [r, g, b];
	}
	return undefined;
};
