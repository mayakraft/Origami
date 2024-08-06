/* SVG (c) Kraft */
import TransformMethods from "../shared/transforms.js";
import methods$1 from "../shared/urls.js";
import * as dom from "../shared/dom.js";

/**
 * Rabbit Ear (c) Kraft
 */

// const clearSVG = (element) => {
// 	Array.from(element.attributes)
// 		.filter(attr => attr.name !== "xmlns" && attr.name !== "version")
// 		.forEach(attr => element.removeAttribute(attr.name));
// 	return DOM.removeChildren(element);
// };

// const vertices = (...args) => {
// 	lib.ear.convert.foldToSvg.vertices(...args);
// 	const g = window().document.createElementNS(NS, "g");
// 	lib.ear.convert.foldToSvg.drawInto(g, ...args);
// 	return g;
// };

/**
 * @description Given an Element, search its children for the first
 * one which contains a "class" that matches the parameter string
 * @param {any} group
 * @param {string} className
 * @returns {Element|null}
 */
const getChildWithClass = (group, className) => {
	const childNodes = group ? group.childNodes : undefined;
	if (!childNodes) {
		return null;
	}
	return Array.from(childNodes)
		.filter((el) => el.getAttribute("class") === className)
		.shift();
};

const vertices = (...args) => getChildWithClass(args[0], "vertices");
const edges = (...args) => getChildWithClass(args[0], "edges");
const faces = (...args) => getChildWithClass(args[0], "faces");
const boundaries = (...args) => getChildWithClass(args[0], "boundaries");

// these will end up as methods on the <svg> nodes
const methods = {
	vertices,
	edges,
	faces,
	boundaries,
	...TransformMethods,
	...methods$1,
	...dom,
};

export { methods as default };
