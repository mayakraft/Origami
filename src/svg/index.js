/* SVG (c) Kraft */
import { setWindow } from "./environment/window.js";
import NS from "./spec/namespace.js";
import nodes_attributes from "./spec/nodes_attributes.js";
import nodes_children from "./spec/nodes_children.js";
import colors from "./colors/index.js";
import general from "./general/index.js";
import extensions from "./constructor/extensions/index.js";
import { constructors, svg } from "./constructor/elements.js";

/**
 * Rabbit Ear (c) Kraft
 */

const library = {
	NS,
	nodes_attributes,
	nodes_children,
	extensions,
	...colors,
	...general,
	...constructors,
	window: undefined, // set below
};

// the top level container object is also an <svg> constructor
const SVG = Object.assign(svg, library);

// the window object, from which the document is used to createElement.
// if using a browser, no need to interact with this,
// if using node.js, set this to the library @xmldom/xmldom.
Object.defineProperty(SVG, "window", {
	enumerable: false,
	set: setWindow,
});

export { SVG as default };
