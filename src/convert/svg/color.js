/**
 * Rabbit Ear (c) Kraft
 */
import window from "../../environment/window.js";
import { rgbToAssignment } from "../../fold/colors.js";
import { parseColorToHex, parseColorToRgb } from "../../svg/colors/parseColor.js";

/**
 * @description Convert a color to a FOLD edge assignment
 * @param {string} color a hex, rgb, hsl, or named color string
 * @param {{ [key:string]: string }} customAssignments a dictionary that
 * maps an uppercase hex color string to a FOLD edge assignment.
 * @returns {string} a FOLD edge assignment
 */
export const colorToAssignment = (color, customAssignments) => {
	const hex = parseColorToHex(color).toUpperCase();
	return customAssignments && customAssignments[hex]
		? customAssignments[hex]
		: rgbToAssignment(...parseColorToRgb(color));
};

/**
 * @description Convert an opacity to an edge fold angle.
 * @param {number} opacity a float value between 0.0 and 1.0
 * @param {string} assignment which assignment "M" or "V", needed to
 * give the right sign +/- to the fold angle
 * @returns {number} a FOLD edge angle
 */
export const opacityToFoldAngle = (opacity, assignment) => {
	switch (assignment) {
		case "M":
		case "m":
			return -180 * opacity;
		case "V":
		case "v":
			return 180 * opacity;
		// "F", "B", "U", "C", opacity value doesn't matter.
		default:
			return 0;
	}
};

/**
 * @param {Element} element
 * @param {{ [key: string]: string }} attributes
 * @returns {string|undefined}
 */
export const getEdgeStroke = (element, attributes) => {
	const computedStroke =
		window().getComputedStyle != null ? window().getComputedStyle(element).stroke : "";
	if (computedStroke !== "" && computedStroke !== "none") {
		return computedStroke;
	}
	if (attributes.stroke !== undefined) {
		return attributes.stroke;
	}
	return undefined;
};

/**
 * @param {Element} element
 * @param {{ [key: string]: string }} attributes
 * @returns {number|undefined}
 */
export const getEdgeOpacity = (element, attributes) => {
	const computedOpacity =
		window().getComputedStyle != null ? window().getComputedStyle(element).opacity : "";
	if (computedOpacity !== "") {
		const floatOpacity = parseFloat(computedOpacity);
		if (!Number.isNaN(floatOpacity)) {
			return floatOpacity;
		}
	}
	if (attributes.opacity !== undefined) {
		const floatOpacity = parseFloat(attributes.opacity);
		if (!Number.isNaN(floatOpacity)) {
			return floatOpacity;
		}
	}
	return undefined;
};
