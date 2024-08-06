/* SVG (c) Kraft */
import RabbitEarWindow from "../../../environment/window.js";
import { str_style } from "../../../environment/strings.js";
import NS from "../../../spec/namespace.js";
import { makeCDATASection } from "../../../general/cdata.js";
import { setViewBox, getViewBox } from "../../../general/viewBox.js";
import makeBackground from "./makeBackground.js";
import getSVGFrame from "./getSVGFrame.js";
import TransformMethods from "../shared/transforms.js";
import * as dom from "../shared/dom.js";
import { removeChildren } from "../shared/dom.js";

/**
 * Rabbit Ear (c) Kraft
 */

// check if the loader is running synchronously or asynchronously
// export const loadSVG = (target, data) => {
// 	const result = Load(data);
// 	if (result == null) { return; }
// 	return (typeof result.then === str_function)
// 		? result.then(svg => assignSVG(target, svg))
// 		: assignSVG(target, result);
// };

const setPadding = function (element, padding) {
	const viewBox = getViewBox(element);
	if (viewBox !== undefined) {
		setViewBox(
			element,
			...[-padding, -padding, padding * 2, padding * 2].map(
				(nudge, i) => viewBox[i] + nudge,
			),
		);
	}
	return element;
};
/**
 * @description Locate the first instance of an element matching a nodeName
 */
const findOneElement = function (element, nodeName) {
	const styles = element.getElementsByTagName(nodeName);
	return styles.length ? styles[0] : null;
};
/**
 * @description Locate an existing stylesheet and append text to it, or
 * create a new stylesheet with the text contents.
 */
const stylesheet = function (element, textContent) {
	let styleSection = findOneElement(element, str_style);
	if (styleSection == null) {
		styleSection = RabbitEarWindow().document.createElementNS(NS, str_style);
		styleSection.setTextContent = (text) => {
			styleSection.textContent = "";
			styleSection.appendChild(makeCDATASection(text));
			return styleSection;
		};
		element.insertBefore(styleSection, element.firstChild);
	}
	styleSection.textContent = "";
	styleSection.appendChild(makeCDATASection(textContent));
	return styleSection;
};

const clearSVG = (element) => {
	Array.from(element.attributes)
		.filter((attr) => attr.name !== "xmlns" && attr.name !== "version")
		.forEach((attr) => element.removeAttribute(attr.name));
	return removeChildren(element);
};

// these will end up as methods on the <svg> nodes
const methods = {
	clear: clearSVG,
	size: setViewBox,
	setViewBox,
	getViewBox,
	padding: setPadding,
	background: makeBackground,
	getWidth: (el) => getSVGFrame(el)[2],
	getHeight: (el) => getSVGFrame(el)[3],
	// this is named "stylesheet" because "style" property is already taken.
	stylesheet: function (el, text) {
		return stylesheet.call(this, el, text);
	},
	// load: loadSVG,
	// save: Save,
	...TransformMethods,
	...dom,
};

// svg.load = function (element, data, callback) {
//   return Load(data, (svg, error) => {
//     if (svg != null) { replaceSVG(element, svg); }
//     if (callback != null) { callback(element, error); }
//   });
// };

export { methods as default, findOneElement };
