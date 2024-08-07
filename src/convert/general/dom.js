/**
 * Rabbit Ear (c) Kraft
 */
import window from "../../environment/window.js";

/**
 * @description to call getComputedStyle for an SVG, the SVG has to be a
 * member of the DOM, if it is not, use this function to create an
 * invisible parent element on the window to satisfy this requirement.
 * @param {Element} child
 * @returns {Element} the parent of the child
 */
export const invisibleParent = (child) => {
	if (!window().document.body) {
		return undefined;
	}

	// create an invisible element, add the svg, then call getComputedStyle
	const parent = window().document.createElement("div");

	// visibility:hidden causes the DOM window layout to resize
	parent.setAttribute("display", "none");
	// parent.setAttribute("visibility", "hidden");

	window().document.body.appendChild(parent);

	parent.appendChild(child);
	return parent;
};
