/* SVG (c) Kraft */
import NS from "../../../spec/namespace.js";
import RabbitEarWindow from "../../../environment/window.js";
import lib from "../../../environment/lib.js";
import { findElementTypeInParents } from "../../../general/dom.js";

/**
 * Rabbit Ear (c) Kraft
 */

// this is a patch on the system, foldToSvg will normally check the parent
// chain of the <g> element until an SVG is found, and if the options ask
// for it, set the viewBox to auto-size.
// unfortunately, node.parentElement does not get updated until after the next
// draw call, before foldToSvg checks... so this method got copied out here
// and is duplicated in a way that makes me really sad.
// I wish there was an elegant way to wait until the parent property populates.
const applyViewBox = (parent, element, graph, options = {}) => {
	const unitBounds = { min: [0, 0], max: [1, 1], span: [1, 1] };
	const box = lib.ear.graph.boundingBox(graph) || unitBounds;
	const svgElement = findElementTypeInParents(parent, "svg");
	if (svgElement && options && options.viewBox) {
		const viewBoxValue = [box.min, box.span].flatMap((p) => [p[0], p[1]]).join(" ");
		svgElement.setAttributeNS(null, "viewBox", viewBoxValue);
	}
};

const init = (parent, graph, options = {}) => {
	const g = RabbitEarWindow().document.createElementNS(NS, "g");
	// this call to renderSVG mimics the call inside of the foldToSvg method
	lib.ear.convert.renderSVG(graph, g, {
		viewBox: true,
		strokeWidth: true,
		...options,
	});
	// mimic the call to renderSVG
	applyViewBox(parent, g, graph, {
		viewBox: true,
		strokeWidth: true,
		...options,
	});
	return g;
};

export { init as default };
