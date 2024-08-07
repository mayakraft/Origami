/**
 * Rabbit Ear (c) Kraft
 */
import window from "../environment/window.js";
import Messages from "../environment/messages.js";
import { isBackend } from "../environment/detect.js";
import { file_spec, file_creator } from "../fold/rabbitear.js";
import { resize2 } from "../math/vector.js";
import { multiplyMatrix2Vector2 } from "../math/matrix2.js";
import { cleanNumber } from "../general/number.js";
import { planarBoundary } from "../graph/boundary.js";
import { parseColorToHex } from "../svg/colors/parseColor.js";
import {
	getRootParent,
	xmlStringToElement,
	flattenDomTree,
	flattenDomTreeWithStyle,
} from "../svg/general/dom.js";
import { transformStringToMatrix } from "../svg/general/transforms.js";
import { findEpsilonInObject, invertVertical } from "./general/options.js";
import { planarizeAllFaces } from "../graph/planarize/planarize.js";
import { invisibleParent } from "./general/dom.js";
import {
	colorToAssignment,
	opacityToFoldAngle,
	getEdgeStroke,
	getEdgeOpacity,
} from "./svg/color.js";
import {
	lineToSegments,
	rectToSegments,
	polygonToSegments,
	polylineToSegments,
	pathToSegments,
} from "./svg/parse.js";

/**
 * @description Given an svg drawing element, convert
 * it into an array of line segments {number[][]} where
 * each segment is an array of 4 values: x1, y1, x2, y2.
 * @param {Element[]} elements a flat array of svg drawing elements
 * @returns {object[]} an array of line segement objects, each with
 * "segment" and "attributes" properties.
 */
const parsers = {
	line: lineToSegments,
	rect: rectToSegments,
	polygon: polygonToSegments,
	polyline: polylineToSegments,
	path: pathToSegments,
	// circle: circleToSegments,
	// ellipse: ellipseToSegments,
};

/**
 * @description Transform a 2D segment (4 numbers) with a CSS transform.
 * @param {[number, number, number, number]} segment a 2D segment as 4 numbers
 * @param {string} transform a CSS or SVG transform string
 * @return {[number, number][]} segment
 */
const transformSegment = (segment, transform) => {
	/** @type {[number, number][]} */
	const seg = [
		[segment[0], segment[1]],
		[segment[2], segment[3]],
	];
	if (!transform) {
		return seg;
	}
	const matrix = transformStringToMatrix(transform);
	return matrix ? seg.map((p) => multiplyMatrix2Vector2(matrix, p)) : seg;
};

/**
 * @description Get a flat array of all elements in the tree, with all
 * styles also flattened (nested transformed computed, for example)
 * convert all elements <path> <rect> etc into arrays of line segments.
 * @param {Element} svgElement
 * @returns {{
 *   element: Element,
 *   segment: [number, number][],
 *   attributes: { [key: string]: string },
 * }[]} an array of objects with a segment coordinates and attributes
 */
const flatSegments = (svgElement) =>
	flattenDomTreeWithStyle(svgElement)
		.filter((el) => parsers[el.element.nodeName])
		.flatMap((el) =>
			parsers[el.element.nodeName](el.element)
				.map((segment) => transformSegment(segment, el.attributes.transform))
				.map((segment) => ({ ...el, segment })),
		);

/**
 * @description does an Element contain a <style> as a child somewhere?
 * @param {Element} svgElement
 * @returns {boolean}
 */
const containsStylesheet = (svgElement) =>
	flattenDomTree(svgElement)
		.map((el) => el.nodeName === "style")
		.reduce((a, b) => a || b, false);

/**
 * @description Given an SVG element (as a string or Element object),
 * Extract all straight lines from the SVG, including those inside of
 * complex path objects. Return the straight lines as a flat array with
 * additional attribute information.
 * @param {Element | string} svg an SVG image as a DOM element
 * or a string.
 * @returns {{
 *   element: Element,
 *   attributes?: { [key: string]: string },
 *   segment: [number, number][],
 *   data: { assignment: string, foldAngle: string },
 *   stroke: string,
 *   opacity: number,
 * }[]} array of objects, one for each straight line segment
 * with these values:
 * - .element a pointer to the element that this segment comes from.
 * - .attributes the attributes of the element as a Javascript object.
 *    this includes those which were inherited from its parents
 * - .segment a pair of vertices, the endpoints of the segment.
 * - .data two "data-" attributes representing assignment and foldAngle.
 * - .stroke the stroke attribute taken from getComputedStyle if possible.
 * - .opacity the opacity attribute taken from getComputedStyle if possible.
 */
export const svgSegments = (svg) => {
	const svgElement =
		typeof svg === "string" ? xmlStringToElement(svg, "image/svg+xml") : svg;

	if (containsStylesheet(svgElement) && isBackend) {
		console.warn(Messages.backendStylesheet);
	}
	// ensure the svg is a child of the DOM so we can call getComputedStyle.
	// If the element is already a child of the HTML document, do nothing.
	const parent =
		getRootParent(svgElement) === window().document
			? undefined
			: invisibleParent(svgElement);

	const segments = flatSegments(svgElement);
	const segmentsWithAttrs = segments
		.map((el) => ({
			data: {
				assignment: el.attributes["data-assignment"],
				foldAngle: el.attributes["data-foldAngle"],
			},
			stroke: getEdgeStroke(el.element, el.attributes),
			opacity: getEdgeOpacity(el.element, el.attributes),
		}))
		.map((addition, i) => ({
			...segments[i],
			...addition,
		}));

	// we no longer need computed style, remove invisible svg from DOM.
	if (parent && parent.parentNode) {
		parent.parentNode.removeChild(parent);
	}

	return segmentsWithAttrs;
};

/**
 *
 */
const getUserAssignmentOptions = (options) => {
	if (!options || !options.assignments) {
		return undefined;
	}
	const assignments = {};
	Object.keys(options.assignments).forEach((key) => {
		const hex = parseColorToHex(key).toUpperCase();
		assignments[hex] = options.assignments[key];
	});
	return assignments;
};

/**
 *
 */
const getEdgeAssignment = (
	dataAssignment,
	stroke = "#f0f",
	customAssignments = undefined,
) => {
	if (dataAssignment) {
		return dataAssignment;
	}
	return colorToAssignment(stroke, customAssignments);
};

/**
 *
 */
const getEdgeFoldAngle = (dataFoldAngle, opacity = 1, assignment = undefined) => {
	if (dataFoldAngle) {
		return parseFloat(dataFoldAngle);
	}
	return opacityToFoldAngle(opacity, assignment);
};

/**
 *
 */
const makeAssignmentFoldAngle = (segments, options) => {
	// if the user provides a dictionary of custom stroke-assignment
	// matches, this takes precidence over the "data-" attribute
	// todo: this can be improved
	const customAssignments = getUserAssignmentOptions(options);
	// if user specified customAssignments, ignore the data- attributes
	// otherwise the user's assignments would be ignored.
	if (customAssignments) {
		segments.forEach((seg) => {
			delete seg.data.assignment;
			delete seg.data.foldAngle;
		});
	}
	// convert SVG data into FOLD arrays
	const edges_assignment = segments.map((segment) =>
		getEdgeAssignment(segment.data.assignment, segment.stroke, customAssignments),
	);
	const edges_foldAngle = segments.map((segment, i) =>
		getEdgeFoldAngle(segment.data.foldAngle, segment.opacity, edges_assignment[i]),
	);
	return {
		edges_assignment,
		edges_foldAngle,
	};
};

/**
 * @param {number} n
 * @returns {number}
 */
const passthrough = (n) => n;

/**
 * @description This method will handle all of the SVG parsing
 * and result in a very simple graph representation basically
 * only containing line segments and their assignment/foldAngle.
 * The graph will not be planar (edges will overlap), no faces
 * will exist, and duplicate vertices will exist and need to
 * be merged
 * @param {Element | string} svg an SVG image as a DOM element
 * or a string.
 * @returns {FOLD} a FOLD representation of the SVG image, not
 * yet a planar graph, no faces, and possible edge overlaps.
 */
export const svgEdgeGraph = (svg, options) => {
	const segments = svgSegments(svg); // , options);
	const { edges_assignment, edges_foldAngle } = makeAssignmentFoldAngle(
		segments,
		options,
	);
	// by default the parser will change numbers like 15.000000000001 into 15.
	// to turn this off, options.fast = true
	const fixNumber = options && options.fast ? passthrough : cleanNumber;
	/** @type {[number, number][]} */
	const vertices_coords = segments
		.flatMap((el) => el.segment)
		.map(([a, b]) => [fixNumber(a, 12), fixNumber(b, 12)]);
	/** @type {[number, number][]} */
	const edges_vertices = segments.map((_, i) => [i * 2, i * 2 + 1]);
	return {
		vertices_coords,
		edges_vertices,
		edges_assignment,
		edges_foldAngle,
	};
};

/**
 * @description Convert an SVG to a FOLD object. This only works
 * with SVGs of crease patterns, this will not work
 * with an SVG of a folded form.
 * @param {string | SVGElement} file the SVG element as a
 * document element node, or as a string
 * @param {number | object} options an options object or an epsilon number
 * @returns {FOLD} a FOLD representation of the SVG
 * @example
 * const svgFile = fs.readFileSync("./crane.svg", "utf-8");
 * const fold = svgToFold(svgFile);
 * fs.writeFileSync("./crane.fold", JSON.stringify(fold, null, 2));
 * @example
 * // with options
 * const svgFile = fs.readFileSync("./crane.svg", "utf-8");
 * const fold = svgToFold(svgFile, { boundary: false, epsilon: 0.1, invertVertical: true });
 * fs.writeFileSync("./crane.fold", JSON.stringify(fold, null, 2));
 */
export const svgToFold = (file, options) => {
	const graph = svgEdgeGraph(file, options);
	const epsilon = findEpsilonInObject(graph, options);
	// if the user chooses, we can flip the y axis numbers.
	if (options && options.invertVertical && graph.vertices_coords) {
		invertVertical(graph.vertices_coords);
	}
	const planarGraph = planarizeAllFaces(graph, epsilon);
	// by default the parser will change numbers like 15.000000000001 into 15.
	// to turn this off, options.fast = true
	const fixNumber = options && options.fast ? passthrough : cleanNumber;
	planarGraph.vertices_coords = planarGraph.vertices_coords
		.map((coord) => coord.map((n) => fixNumber(n, 12)))
		.map(resize2);
	// optionally, discover the boundary by walking.
	if (typeof options !== "object" || options.boundary !== false) {
		// clear all previous boundary assignments and set them to flat.
		// this is because both flat and boundary were imported as black
		// colors (grayscale), so the assignment should go to the next in line.
		planarGraph.edges_assignment
			.map((_, i) => i)
			.filter(
				(i) =>
					planarGraph.edges_assignment[i] === "B" ||
					planarGraph.edges_assignment[i] === "b",
			)
			.forEach((i) => {
				planarGraph.edges_assignment[i] = "F";
			});
		const { edges } = planarBoundary(planarGraph);
		edges.forEach((e) => {
			planarGraph.edges_assignment[e] = "B";
		});
	}
	return {
		file_spec,
		file_creator,
		frame_classes: ["creasePattern"],
		...planarGraph,
	};
};
