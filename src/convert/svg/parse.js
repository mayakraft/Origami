/**
 * Rabbit Ear (c) Kraft
 */
import { epsilonEqualVectors } from "../../math/compare.js";
import { parsePathCommandsWithEndpoints } from "../../svg/general/path.js";

const straightPathLines = {
	L: true,
	V: true,
	H: true,
	Z: true,
};

/**
 * @description Get the values of a list of attributes on an element
 * SVG is allowed to leave out coordinates with an implied value of 0
 * @param {Element} element an SVG element
 * @param {string[]} attributes a list of names of element attributes
 * @returns {number[]} a list of numbers, one for every attribute
 */
const getAttributesFloatValue = (element, attributes) =>
	attributes
		.map((attr) => element.getAttribute(attr))
		.map((str) => (str == null ? 0 : str))
		.map(parseFloat);

/**
 * @description convert an SVG path into segments
 * @param {Element} line an SVG line element
 * @returns {[number, number, number, number][]} a list of segments
 * in the form of 4 numbers (x1, y1, x2, y2)
 */
export const lineToSegments = (line) => {
	const [a, b, c, d] = getAttributesFloatValue(line, ["x1", "y1", "x2", "y2"]);
	return [[a, b, c, d]];
};

/**
 * @description convert an SVG path into segments
 * @param {Element} path an SVG path element
 * @returns {[number, number, number, number][]} a list of segments
 * in the form of 4 numbers (x1, y1, x2, y2)
 */
export const pathToSegments = (path) =>
	parsePathCommandsWithEndpoints(path.getAttribute("d") || "")
		.filter((command) => straightPathLines[command.command.toUpperCase()])
		.map((el) => [el.start, el.end])
		.filter(([a, b]) => !epsilonEqualVectors(a, b))
		.map(([a, b]) => [a[0], a[1], b[0], b[1]]);

const pointsStringToArray = (str) => {
	const list = str.split(/[\s,]+/).map(parseFloat);
	return Array.from(Array(Math.floor(list.length / 2))).map((_, i) => [
		list[i * 2 + 0],
		list[i * 2 + 1],
	]);
};

// export const pointStringToArray = function (str) {
// 	return str.split(/[\s,]+/)
// 		.filter(s => s !== "")
// 		.map(p => p.split(",")
// 			.map(n => parseFloat(n)));
// };

/**
 * @description convert an SVG polygon into segments
 * @param {Element} polygon an SVG polygon element
 * @returns {[number, number, number, number][]} a list of segments
 * in the form of 4 numbers (x1, y1, x2, y2)
 */
export const polygonToSegments = (polygon) =>
	pointsStringToArray(polygon.getAttribute("points") || "").map((_, i, arr) => [
		arr[i][0],
		arr[i][1],
		arr[(i + 1) % arr.length][0],
		arr[(i + 1) % arr.length][1],
	]);

/**
 * @description convert an SVG polyline into segments
 * @param {Element} polyline an SVG polygon element
 * @returns {[number, number, number, number][]} a list of segments
 * in the form of 4 numbers (x1, y1, x2, y2)
 */
export const polylineToSegments = function (polyline) {
	const circularPath = polygonToSegments(polyline);
	circularPath.pop();
	return circularPath;
};

/**
 * @description convert an SVG rect into segments
 * @param {Element} rect an SVG polygon element
 * @returns {[number, number, number, number][]} a list of segments
 * in the form of 4 numbers (x1, y1, x2, y2)
 */
export const rectToSegments = function (rect) {
	const [x, y, w, h] = getAttributesFloatValue(rect, ["x", "y", "width", "height"]);
	return [
		[x, y, x + w, y],
		[x + w, y, x + w, y + h],
		[x + w, y + h, x, y + h],
		[x, y + h, x, y],
	];
};
