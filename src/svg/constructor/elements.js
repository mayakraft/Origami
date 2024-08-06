/* SVG (c) Kraft */
import RabbitEarWindow from "../environment/window.js";
import { str_svg } from "../environment/strings.js";
import { nodeNames } from "../spec/nodes.js";
import Constructor from "./index.js";

/**
 * Rabbit Ear (c) Kraft
 */

/**
 * @type {{[key: string]: Function }}
 */
const constructorList = {};

nodeNames.forEach((nodeName) => {
	constructorList[nodeName] = (...args) => Constructor(nodeName, null, ...args);
});

/**
 * @type {{
 *   svg: (...args) => SVGElement,
 *   defs: (...args) => SVGElement,
 *   desc: (...args) => SVGElement,
 *   filter: (...args) => SVGElement,
 *   metadata: (...args) => SVGElement,
 *   style: (...args) => SVGElement,
 *   script: (...args) => SVGElement,
 *   title: (...args) => SVGElement,
 *   view: (...args) => SVGElement,
 *   cdata: (...args) => SVGElement,
 *   g: (...args) => SVGElement,
 *   circle: (...args) => SVGElement,
 *   ellipse: (...args) => SVGElement,
 *   line: (...args) => SVGElement,
 *   path: (...args) => SVGElement,
 *   polygon: (...args) => SVGElement,
 *   polyline: (...args) => SVGElement,
 *   rect: (...args) => SVGElement,
 *   arc: (...args) => SVGElement,
 *   arrow: (...args) => SVGElement,
 *   curve: (...args) => SVGElement,
 *   parabola: (...args) => SVGElement,
 *   roundRect: (...args) => SVGElement,
 *   wedge: (...args) => SVGElement,
 *   origami: (...args) => SVGElement,
 *   text: (...args) => SVGElement,
 *   marker: (...args) => SVGElement,
 *   symbol: (...args) => SVGElement,
 *   clipPath: (...args) => SVGElement,
 *   mask: (...args) => SVGElement,
 *   linearGradient: (...args) => SVGElement,
 *   radialGradient: (...args) => SVGElement,
 *   pattern: (...args) => SVGElement,
 *   textPath: (...args) => SVGElement,
 *   tspan: (...args) => SVGElement,
 *   stop: (...args) => SVGElement,
 *   feBlend: (...args) => SVGElement,
 *   feColorMatrix: (...args) => SVGElement,
 *   feComponentTransfer: (...args) => SVGElement,
 *   feComposite: (...args) => SVGElement,
 *   feConvolveMatrix: (...args) => SVGElement,
 *   feDiffuseLighting: (...args) => SVGElement,
 *   feDisplacementMap: (...args) => SVGElement,
 *   feDistantLight: (...args) => SVGElement,
 *   feDropShadow: (...args) => SVGElement,
 *   feFlood: (...args) => SVGElement,
 *   feFuncA: (...args) => SVGElement,
 *   feFuncB: (...args) => SVGElement,
 *   feFuncG: (...args) => SVGElement,
 *   feFuncR: (...args) => SVGElement,
 *   feGaussianBlur: (...args) => SVGElement,
 *   feImage: (...args) => SVGElement,
 *   feMerge: (...args) => SVGElement,
 *   feMergeNode: (...args) => SVGElement,
 *   feMorphology: (...args) => SVGElement,
 *   feOffset: (...args) => SVGElement,
 *   fePointLight: (...args) => SVGElement,
 *   feSpecularLighting: (...args) => SVGElement,
 *   feSpotLight: (...args) => SVGElement,
 *   feTile: (...args) => SVGElement,
 *   feTurbulence: (...args) => SVGElement,
 * }}
 */
const constructors = Object.assign(constructorList);

/**
 * @description Create an SVG element
 * @param {...any} args a series of options objects
 * @returns {SVGElement} an svg element
 */
const svg = (...args) => {
	const svgElement = Constructor(str_svg, null, ...args);
	const initialize = () =>
		args
			.filter((arg) => typeof arg === "function")
			.forEach((func) => func.call(svgElement, svgElement));
	// call initialize as soon as possible. check if page has loaded
	if (RabbitEarWindow().document.readyState === "loading") {
		RabbitEarWindow().document.addEventListener("DOMContentLoaded", initialize);
	} else {
		initialize();
	}
	return svgElement;
};

export { constructors, svg };
