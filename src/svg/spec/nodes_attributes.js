/* SVG (c) Kraft */
import classes_attributes from "./classes_attributes.js";
import classes_nodes from "./classes_nodes.js";
import { str_viewBox, str_points, str_id, str_svg } from "../environment/strings.js";

/**
 * Rabbit Ear (c) Kraft
 */
/**
 * @description This is the base object containing mostly the unique
 * attributes associated with an individual SVG element type.
 * After initialization, this object will be modified to contain all
 * nodes in the spec, and each node with a list of all possible attributes.
 * @constant {object}
 * @note the order of these indices matter. the rest which will be added,
 * not important.
 */
const nodes_attributes = {
	svg: [str_viewBox],
	line: ["x1", "y1", "x2", "y2"],
	rect: ["x", "y", "width", "height"],
	circle: ["cx", "cy", "r"],
	ellipse: ["cx", "cy", "rx", "ry"],
	polygon: [str_points],
	polyline: [str_points],
	path: ["d"],
	text: ["x", "y"],
	mask: [str_id],
	symbol: [str_id],
	clipPath: [str_id, "clip-rule"],
	marker: [
		str_id,
		"markerHeight",
		"markerUnits",
		"markerWidth",
		"orient",
		"refX",
		"refY",
	],
	linearGradient: ["x1", "x2", "y1", "y2"],
	radialGradient: ["cx", "cy", "r", "fr", "fx", "fy"],
	stop: ["offset", "stop-color", "stop-opacity"],
	pattern: ["patternContentUnits", "patternTransform", "patternUnits"],
};

// Fill out the keys of nodes_attributes, make sure it includes one
// key for every SVG element type in the SVG spec.
// nodes
// 	.filter(nodeName => !nodes_attributes[nodeName])
// 	.forEach(nodeName => { nodes_attributes[nodeName] = []; });

// Fill out the values in nodes_attributes, these are values like
// "stroke" or "fill" which end up getting repeatedly applied to many
// elements. This way the library can be shipped in a smaller state and
// build upon initialization.
const additionalNodeAttributes = [
	{
		nodes: [str_svg, "defs", "g"].concat(classes_nodes.visible, classes_nodes.text),
		attr: classes_attributes.presentation,
	},
	{
		nodes: ["filter"],
		attr: classes_attributes.effects,
	},
	{
		// todo: should we include "svg" here?
		nodes: classes_nodes.childrenOfText.concat("text"),
		attr: classes_attributes.text,
	},
	{
		nodes: classes_nodes.filter,
		attr: classes_attributes.effects,
	},
	{
		nodes: classes_nodes.gradients,
		attr: classes_attributes.gradient,
	},
];

// for every node in the set, add all attributes associated with the node.
additionalNodeAttributes.forEach((el) =>
	el.nodes.forEach((nodeName) => {
		if (!nodes_attributes[nodeName]) {
			nodes_attributes[nodeName] = [];
		}
		nodes_attributes[nodeName].push(...el.attr);
	}),
);

export { nodes_attributes as default };
