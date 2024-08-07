/* SVG (c) Kraft */
import classes_nodes from "./classes_nodes.js";

/**
 * Rabbit Ear (c) Kraft
 */

// const customPrimitives = [];

const headerStuff = [
	classes_nodes.header,
	classes_nodes.invisible,
	classes_nodes.patterns,
].flat();

const drawingShapes = [
	classes_nodes.group,
	classes_nodes.visible,
	classes_nodes.text,
	// customPrimitives,
].flat();

const nodes_children = {
	// svg
	svg: [["svg", "defs"], headerStuff, drawingShapes].flat(),

	// defs
	defs: headerStuff,

	// header
	// desc: [],
	filter: classes_nodes.filter,
	// metadata: [],
	// style: [],
	// script: [],
	// title: [],
	// view: [],

	// cdata
	// cdata: [],

	// group
	g: drawingShapes,

	// visible drawing primitives
	// circle: [],
	// ellipse: [],
	// line: [],
	// path: [],
	// polygon: [],
	// polyline: [],
	// rect: [],

	// text
	text: classes_nodes.childrenOfText,

	// invisible. can contain drawing primitives
	marker: drawingShapes,
	symbol: drawingShapes,
	clipPath: drawingShapes,
	mask: drawingShapes,

	// patterns and gradients
	linearGradient: classes_nodes.gradients,
	radialGradient: classes_nodes.gradients,
	// pattern: [],

	// can be a child of text
	// textPath: [],
	// tspan: [],

	// can be a child of gradients
	// stop: [],

	// can be a child of filter
	// feBlend: [],
	// feColorMatrix: [],
	// feComponentTransfer: [],
	// feComposite: [],
	// feConvolveMatrix: [],
	// feDiffuseLighting: [],
	// feDisplacementMap: [],
	// feDistantLight: [],
	// feDropShadow: [],
	// feFlood: [],
	// feFuncA: [],
	// feFuncB: [],
	// feFuncG: [],
	// feFuncR: [],
	// feGaussianBlur: [],
	// feImage: [],
	// feMerge: [],
	// feMergeNode: [],
	// feMorphology: [],
	// feOffset: [],
	// fePointLight: [],
	// feSpecularLighting: [],
	// feSpotLight: [],
	// feTile: [],
	// feTurbulence: [],
};

export { nodes_children as default };
