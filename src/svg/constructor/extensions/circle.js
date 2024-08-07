/* SVG (c) Kraft */
import makeCoordinates from "../../arguments/makeCoordinates.js";
import nodes_attributes from "../../spec/nodes_attributes.js";
import { svg_distance2 } from "../../general/algebra.js";
import TransformMethods from "./shared/transforms.js";
import methods from "./shared/urls.js";
import * as dom from "./shared/dom.js";

/**
 * Rabbit Ear (c) Kraft
 */

const setRadius = (el, r) => {
	el.setAttribute(nodes_attributes.circle[2], r);
	return el;
};

const setOrigin = (el, a, b) => {
	[...makeCoordinates(...[a, b].flat()).slice(0, 2)].forEach((value, i) =>
		el.setAttribute(nodes_attributes.circle[i], value),
	);
	return el;
};

const fromPoints = (a, b, c, d) => [a, b, svg_distance2([a, b], [c, d])];
/**
 * @name circle
 * @memberof svg
 * @description Draw an SVG Circle element.
 * @param {number} radius the radius of the circle
 * @param {...number|number[]} center the center of the circle
 * @returns {Element} an SVG node element
 * @linkcode SVG ./src/nodes/spec/circle.js 28
 */
const circleDef = {
	circle: {
		args: (a, b, c, d) => {
			const coords = makeCoordinates(...[a, b, c, d].flat());
			// console.log("SVG circle coords", coords);
			switch (coords.length) {
				case 0:
				case 1:
					return [, , ...coords];
				case 2:
				case 3:
					return coords;
				// case 4
				default:
					return fromPoints(...coords);
			}
			// return makeCoordinates(...flatten(a, b, c)).slice(0, 3);
		},
		methods: {
			radius: setRadius,
			setRadius,
			origin: setOrigin,
			setOrigin,
			center: setOrigin,
			setCenter: setOrigin,
			position: setOrigin,
			setPosition: setOrigin,
			...TransformMethods,
			...methods,
			...dom,
		},
	},
};

export { circleDef as default };
