/* SVG (c) Kraft */
import makeCoordinates from "../../../arguments/makeCoordinates.js";
import makeCurvePath from "./makeCurvePath.js";
import getCurveEndpoints from "./getCurveEndpoints.js";
import TransformMethods from "../shared/transforms.js";

/**
 * Rabbit Ear (c) Kraft
 */

const setPoints = (element, ...args) => {
	const coords = makeCoordinates(...args.flat()).slice(0, 4);
	element.setAttribute("d", makeCurvePath(coords, element._bend, element._pinch));
	return element;
};

const bend = (element, amount) => {
	element._bend = amount;
	return setPoints(element, ...getCurveEndpoints(element.getAttribute("d")));
};

const pinch = (element, amount) => {
	element._pinch = amount;
	return setPoints(element, ...getCurveEndpoints(element.getAttribute("d")));
};

const curve_methods = {
	setPoints,
	bend,
	pinch,
	...TransformMethods,
};

export { curve_methods as default };
