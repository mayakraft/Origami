/**
 * Rabbit Ear (c) Kraft
 */
import {
	assignmentFlatFoldAngle,
	edgesFoldAngleAreAllFlat,
	edgesAssignmentNames,
	isFoldedForm,
	edgesAssignmentValues,
	sortEdgesByAssignment,
} from "../../fold/spec.js";
import { assignmentColor } from "../../fold/colors.js";
import { makeEdgesCoords } from "../../graph/make/edges.js";
import { addClass } from "../../svg/general/dom.js";
import SVG from "../../svg/index.js";
import { clone } from "../../general/clone.js";
import { setKeysAndValues } from "../general/svg.js";

/**
 * @description default style to be applied to the group <g> element
 */
const GROUP_STYLE = {
	foldedForm: {},
	creasePattern: { stroke: "black" },
};

/**
 * @description default style to be applied to individual edges
 */
const EDGE_STYLE = {
	foldedForm: {},
	creasePattern: {}, // this will be filled below
};

Object.keys(assignmentColor).forEach((key) => {
	EDGE_STYLE.creasePattern[key] = { stroke: assignmentColor[key] };
});

/**
 * @description Apply a data attribute ("data-") to an element, enabling
 * the user to be able to get this data using the .dataset selector.
 * https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto/Use_data_attributes
 */
const setDataValue = (el, key, value) => el.setAttribute(`data-${key}`, value);

/**
 * @description convert a line segment (array of two points) into an
 * SVG path command.
 * @param {number[][]} s a segment as an array of two points
 * @returns {string} an SVG path definition for the line segment.
 */
const segmentToPath = (s) => `M${s[0][0]} ${s[0][1]}L${s[1][0]} ${s[1][1]}`;

/**
 * @description convert a line segment (array of two points) into an
 * SVG path command.
 * @param {FOLD} graph a FOLD object
 * @returns {string} an SVG path definition for all of the edges
 */
const edgesPathData = (graph) =>
	graph.vertices_coords && graph.edges_vertices
		? makeEdgesCoords(graph)
				.map((segment) => segmentToPath(segment))
				.join("")
		: "";

/**
 * @description Group edges by similar assignments and create a single
 * SVG path for every group, each path contains all edges of the same
 * assignment.
 * @param {FOLD} graph a FOLD object
 * @returns {object} keys are assignments, and values are a single
 * SVG path which renders all edges that are this assignment.
 */
const edgesPathsByAssignment = ({
	vertices_coords,
	edges_vertices,
	edges_assignment,
}) => {
	if (!vertices_coords || !edges_vertices) {
		return {};
	}
	if (!edges_assignment) {
		return { U: edgesPathData({ vertices_coords, edges_vertices }) };
	}

	// a dictionary with key: assignment, and value: array of edge indices
	const assignmentEdges = sortEdgesByAssignment({
		vertices_coords,
		edges_vertices,
		edges_assignment,
	});

	// if an assignment has no edges (empty array), delete the assignment
	Object.keys(assignmentEdges).forEach((key) => {
		if (!assignmentEdges[key].length) {
			delete assignmentEdges[key];
		}
	});

	// convert assignmentEdges which contains array of indices [1, 2, 3...]
	// into one SVG path that traces out all edges with that assignment
	const assignmentPaths = {};
	Object.keys(assignmentEdges).forEach((assignment) => {
		// create the path "d" attribute as a string.
		const pathString = edgesPathData({
			vertices_coords,
			edges_vertices: assignmentEdges[assignment].map((i) => edges_vertices[i]),
		});

		// create an SVG path
		assignmentPaths[assignment] = SVG.path(pathString);
	});

	return assignmentPaths;
};

/**
 * @description Create a copy of the object, but filter out any
 * keys/values in the object where the key is an edge assignment.
 */
const nonAssignmentObject = (object) => {
	const copy = clone(object);
	Object.keys(copy)
		.filter((key) => edgesAssignmentNames[key] !== undefined)
		.forEach((key) => delete copy[key]);
	return copy;
};

/**
 * @description Create a copy of the object, but filter out any
 * keys/values where the value is not a primitive type (boolean, number, string)
 */
const objectWithPrimitiveValues = (object) => {
	// these are the primitive types we are allowing
	const valid = { boolean: true, number: true, string: true };
	const copy = clone(object);
	Object.keys(copy)
		// filter the keys which are not primitive types, delete these from the obj
		.filter((key) => !valid[typeof copy[key]])
		.forEach((key) => delete copy[key]);
	return copy;
};

/**
 * @description Create a style object for group element and individual edges
 * (by assignment). Determine if the graph is folded or cp, and process
 * any style options that were provided by the user.
 * @param {FOLD} graph a FOLD object
 * @param {object} options optional custom edge styles
 * @returns {object} groupStyle and edgeStyle as objects.
 */
const getStyles = (graph, options) => {
	// the styles depend on whether the graph is foldedForm or creasePattern
	const foldedClass = isFoldedForm(graph) ? "foldedForm" : "creasePattern";
	const groupStyle = clone(GROUP_STYLE[foldedClass]);
	const edgeStyle = clone(EDGE_STYLE[foldedClass]);

	// override any edge styles if the user has supplied custom style.
	// user style can come in two forms:
	// - specific to a certain assignment: { M: { stroke: "red" }}
	// - global to all edges: { stroke: "black" }
	// global to all edges cannot simply be set on the group which contains
	// all of the paths, as we are still setting default styles on each path
	// and these path styles would override the group styles, so,
	// we have to set these on each path too.
	// So, this object contains all valid (string/number/boolean) values
	// not including any styles specific to an assignment.
	const override = objectWithPrimitiveValues(nonAssignmentObject(options));

	// update the group styles, and each assignment's path style dictionaries
	Object.assign(groupStyle, override);
	edgesAssignmentValues.forEach((key) => {
		edgeStyle[key] = { ...edgeStyle[key], ...override };
	});

	return {
		groupStyle,
		edgeStyle,
	};
};

/**
 * @description Convert the edges of a FOLD graph into SVG path elements,
 * where all edges of similar assignments are included in the same path.
 * Also, allow the user to supply an options object for custom styles.
 * @param {FOLD} graph a FOLD object
 * @param {object} options an options object for styling edges.
 * @returns {SVGElement} an SVG group containing SVG paths.
 */
export const edgesPaths = (graph, options = {}) => {
	const group = SVG.g();
	if (!graph) {
		return group;
	}

	const { groupStyle, edgeStyle } = getStyles(graph, options);

	// create the path objects, stored under assignment keys
	const paths = edgesPathsByAssignment(graph);

	// apply the styles to the path elements, based on their assignment
	Object.keys(paths).forEach((key) => {
		// add the class name, and any default styles according to the assignment
		addClass(paths[key], edgesAssignmentNames[key]);
		setKeysAndValues(paths[key], edgeStyle[key]);

		// add any custom user styles according to the assignment, allowing
		// the user to specify letters or words ("M" or "mountain") as the key
		setKeysAndValues(paths[key], options[key]);
		setKeysAndValues(paths[key], options[edgesAssignmentNames[key]]);
	});

	// apply the style to the top level group container
	setKeysAndValues(group, groupStyle);

	// add paths as children to the group
	Object.keys(paths).forEach((key) => group.appendChild(paths[key]));

	// set data values to contain the FOLD file data
	Object.keys(paths).forEach((assign) =>
		setDataValue(paths[assign], "assignment", assign),
	);
	Object.keys(paths).forEach((assign) =>
		setDataValue(paths[assign], "foldAngle", assignmentFlatFoldAngle[assign]),
	);

	return group;
};

/**
 * @param {number} foldAngle
 * @returns {string}
 */
const angleToOpacity = (foldAngle) => String(Math.abs(foldAngle) / 180);

/**
 * @description Convert the edges of a FOLD graph into SVG line elements.
 * Allow the user to supply an options object for custom styles.
 * @param {FOLD} graph a FOLD object
 * @param {object} options an options object for styling edges.
 * @returns {SVGElement} an SVG group containing SVG lines.
 */
export const edgesLines = (graph, options = {}) => {
	const group = SVG.g();
	if (!graph) {
		return group;
	}

	const { groupStyle, edgeStyle } = getStyles(graph, options);

	// a dictionary with assignment keys, and SVG groups as values
	const groupsByAssignment = {};

	// set line styles according to assignment
	// array in the form ["B", "M", "V", "F"...]
	Array.from(new Set(edgesAssignmentValues.map((s) => s.toUpperCase()))).forEach(
		(assign) => {
			const assignmentGroup = SVG.g();

			// add the class name, and any default styles according to the assignment
			addClass(assignmentGroup, edgesAssignmentNames[assign]);
			setKeysAndValues(assignmentGroup, edgeStyle[assign]);

			// add any custom user styles according to the assignment, allowing
			// the user to specify letters or words ("M" or "mountain") as the key
			setKeysAndValues(assignmentGroup, options[assign]);
			setKeysAndValues(assignmentGroup, options[edgesAssignmentNames[assign]]);

			groupsByAssignment[assign] = assignmentGroup;
		},
	);

	// for every edge, create an SVG line element
	const lines = makeEdgesCoords(graph).map((s) =>
		SVG.line(s[0][0], s[0][1], s[1][0], s[1][1]),
	);

	// set data value attributes for fold angle and assignment
	if (graph.edges_foldAngle) {
		graph.edges_foldAngle.forEach((angle, i) =>
			setDataValue(lines[i], "foldAngle", angle),
		);
	}
	if (graph.edges_assignment) {
		graph.edges_assignment.forEach((assign, i) =>
			setDataValue(lines[i], "assignment", assign),
		);
	}

	if (graph.edges_foldAngle) {
		lines.forEach((line, i) => {
			const angle = graph.edges_foldAngle[i];
			if (
				angle === undefined ||
				angle === null ||
				angle === 0 ||
				angle === 180 ||
				angle === -180
			) {
				return;
			}
			line.setAttributeNS(null, "opacity", angleToOpacity(angle));
		});
	}

	if (graph.edges_assignment) {
		// add lines to their corresponding assignment's line group.
		lines.forEach((line, i) => {
			const assignment = graph.edges_assignment[i] || "U";
			groupsByAssignment[assignment].appendChild(line);
		});
	} else {
		// add all lines to the "unassigned" group if no assignments exist
		lines.forEach((line) => groupsByAssignment.U.appendChild(line));
	}

	// add the assignmentGroup to the main group, if it contains children
	Object.keys(groupsByAssignment)
		.filter((key) => groupsByAssignment[key].childNodes.length)
		.forEach((key) => group.appendChild(groupsByAssignment[key]));

	// top level group style
	setKeysAndValues(group, groupStyle);
	return group;
};

/**
 * @description Convert the edges of a FOLD graph into SVG line or path elements
 * and return the result as a group element <g> containing the lines.
 *
 * If the fold angles are all flat, all edges of the same assignment can have
 * the same style, so, we draw them all as SVG path objects. Otherwise if there
 * exists edges with non flat fold angles, simply draw all of them as lines,
 * ensuring that some can have the style associated with fold angle (opacity).
 * @param {FOLD} graph
 * @param {object} options
 * @returns {SVGElement} an SVG <g> group element
 */
export const drawEdges = (graph, options) =>
	edgesFoldAngleAreAllFlat(graph)
		? edgesPaths(graph, options)
		: edgesLines(graph, options);
