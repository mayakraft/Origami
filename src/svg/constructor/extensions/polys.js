/* SVG (c) Kraft */
import { str_points, str_string } from "../../environment/strings.js";
import { svgSemiFlattenArrays } from "../../arguments/semiFlattenArrays.js";
import makeCoordinates from "../../arguments/makeCoordinates.js";
import TransformMethods from "./shared/transforms.js";
import methods from "./shared/urls.js";
import * as dom from "./shared/dom.js";

/**
 * Rabbit Ear (c) Kraft
 */

const getPoints = (el) => {
	const attr = el.getAttribute(str_points);
	return attr == null ? "" : attr;
};

const polyString = function () {
	return Array.from(Array(Math.floor(arguments.length / 2)))
		.map((_, i) => `${arguments[i * 2 + 0]},${arguments[i * 2 + 1]}`)
		.join(" ");
};

const stringifyArgs = (...args) => [
	polyString(...makeCoordinates(...svgSemiFlattenArrays(...args))),
];

const setPoints = (element, ...args) => {
	element.setAttribute(str_points, stringifyArgs(...args)[0]);
	return element;
};

const addPoint = (element, ...args) => {
	element.setAttribute(
		str_points,
		[getPoints(element), stringifyArgs(...args)[0]].filter((a) => a !== "").join(" "),
	);
	return element;
};

// this should be improved
// right now the special case is if there is only 1 argument and it's a string
// it should be able to take strings or numbers at any point,
// converting the strings to coordinates
const Args = function (...args) {
	return args.length === 1 && typeof args[0] === str_string
		? [args[0]]
		: stringifyArgs(...args);
};

const polyDefs = {
	polyline: {
		args: Args,
		methods: {
			setPoints,
			addPoint,
			...TransformMethods,
			...methods,
			...dom,
		},
	},
	polygon: {
		args: Args,
		methods: {
			setPoints,
			addPoint,
			...TransformMethods,
			...methods,
			...dom,
		},
	},
};

export { polyDefs as default };
