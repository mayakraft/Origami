/**
 * Rabbit Ear (c) Kraft
 */
import { magnitude3, distance3, scale3 } from "../math/vector.js";

/**
 * @description CSS named colors for a standard stroke color, intended
 * for light-background renders.
 */
export const assignmentColor = {
	B: "black",
	M: "crimson",
	V: "royalblue",
	F: "lightgray",
	J: "gold",
	C: "limegreen",
	U: "orchid",
};
Object.keys(assignmentColor).forEach((key) => {
	assignmentColor[key.toLowerCase()] = assignmentColor[key];
});

/**
 * How desaturated can a color be but still be considered
 * a color instead of a grayscale value? please be: 0 < n < Inf.
 * 1 means nothing is changed. >1 is permissive
 * and between 0 and 1 is not permissive.
 */
const DESATURATION_RATIO = 4;

/**
 * @description used interally by the method "rgbToAssignment".
 * note: colors used by rgbToAssignment are for values between 0 and 255
 * "normalized" here means each scalar value is normalized 0 to 1. The color
 * as a vector in 3D is not normalized, ie: yellow is [1, 1, 0].
 */
const colorMatchNormalized = {
	M: [1, 0, 0], // red
	V: [0, 0, 1], // blue
	J: [1, 1, 0], // yellow // should these be normalized? [0.707, 0.707, 0]
	U: [1, 0, 1], // magenta
	C: [0, 1, 0], // green
	// and "boundary" and "flat" are black and gray
};

/**
 * @description Map a color to an edge_assignment value, of course, this uses
 * one of many color schemes, hopefully this is one of the more widely-accepted
 * schemes, however. The benefit of using this method is that it will,
 * for example, match a red color to "mountain", accepting any red color,
 * so long as this red color is not too close to yellow or gray, it counts.
 * "Mountain" and "valley" are red and blue respectively,
 * "unassigned" is purple (being blue + red), and then, following the standard
 * put forth by Origami Simulator, yellow is "join" and green is "cut".
 * This leaves "boundary" and "flat", which both take a grayscale value, and
 * should be detected geometrically (boundary edges), but this method
 * will still differentiate, "boundary" is black and "flat" is gray.
 * @param {number} red the red channel from 0 to 255
 * @param {number} green the green channel from 0 to 255
 * @param {number} blue the blue channel from 0 to 255
 * @returns {string} FOLD assignment character
 */
export const rgbToAssignment = (red = 0, green = 0, blue = 0) => {
	const color = scale3([red, green, blue], 1 / 255);

	// the distance to black (0, 0, 0)
	const blackDistance = magnitude3(color);

	// if the distance to black is too small, it's difficult
	// to infer any color information. the color implies "boundary".
	if (blackDistance < 0.05) {
		return "B";
	}

	// the nearest grayscale value
	const grayscale = color.reduce((a, b) => a + b, 0) / 3;

	// the distance from the color to the nearest grayscale value
	const grayDistance = distance3(color, [grayscale, grayscale, grayscale]);

	// the nearest color from "colorMatchNormalized" to this color
	const nearestColor = Object.keys(colorMatchNormalized)
		.map((key) => ({ key, dist: distance3(color, colorMatchNormalized[key]) }))
		.sort((a, b) => a.dist - b.dist)
		.shift();

	// the color is allowed to be heavily desaturated, closer to the gray
	// version of itself, and still count as the color instead of the gray.
	if (nearestColor.dist < grayDistance * DESATURATION_RATIO) {
		return nearestColor.key;
	}

	// is it black or gray? more permissivly select gray over black.
	// boundary might also be decided later by planar walk.
	return blackDistance < 0.1 ? "B" : "F";
};
