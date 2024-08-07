/**
 * Rabbit Ear (c) Kraft
 */
import { setWindow } from "./environment/window.js";
import axiom from "./axioms/index.js";
import convert from "./convert/index.js";
import diagram from "./diagrams/index.js";
import general from "./general/index.js";
import graph from "./graph/index.js";
import layer from "./layer/index.js";
import math from "./math/index.js";
import singleVertex from "./singleVertex/index.js";
import svg from "./svg/index.js";
import text from "./text/index.js";
import webgl from "./webgl/index.js";
// the SVG library is uniquely independent, to bind it to Rabbit Ear,
// something which is not required for it to be functional, we have
// to expose this method which we immediately call below.
import svgLink from "./svg/environment/lib.js";
// for typescript types, allows the user to import types
// by typing this command: `import { type FOLD } from "rabbit-ear/types.js"`
import * as placeholder from "./types.js";

/**
 * @description Rabbit Ear, the main entrypoint into the library methods
 */
const ear = {
	axiom,
	convert,
	diagram,
	general,
	graph,
	layer,
	math,
	singleVertex,
	svg,
	text,
	webgl,
	...placeholder,
};

// bind the SVG library to Rabbit Ear, opening up the ability to
// draw FOLD objects.
svgLink.ear = ear;

// give backend Javascript the ability to use window (draw SVG elements).
// this gives the user the ability to set the window to a 3rd party library.
const earExport = ear;
Object.defineProperty(earExport, "window", {
	enumerable: false,
	set: (value) => {
		svg.window = setWindow(value);
	},
});

export default ear;
