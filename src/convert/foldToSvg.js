/**
 * Rabbit Ear (c) Kraft
 */
import window from "../environment/window.js";
import SVG from "../svg/index.js";
import { findElementTypeInParents, addClass } from "../svg/general/dom.js";
import { isFoldedForm } from "../fold/spec.js";
import { boundingBox } from "../graph/boundary.js";
import { boundingBoxToViewBox, getStrokeWidth } from "./general/svg.js";
import { drawVertices } from "./svg/drawVertices.js";
import { drawEdges } from "./svg/drawEdges.js";
import { drawFaces } from "./svg/drawFaces.js";
import { drawBoundaries } from "./svg/drawBoundaries.js";

// draw a graph component
const draw = {
	vertices: drawVertices,
	edges: drawEdges,
	faces: drawFaces,
	boundaries: drawBoundaries,
};

/**
 * some default values for rendering
 */
const DEFAULT_CIRCLE_RADIUS = 1 / 50;
const unitBounds = { min: [0, 0], max: [1, 1], span: [1, 1] };
const groupNames = ["boundaries", "faces", "edges", "vertices"];

/**
 * @description The options object will be modified in place,
 * if the user customizes something, it will be left alone,
 * otherwise, some default styles will be applied here.
 * Elsewhere as well, default styles are applied inside each
 * component draw method.
 */
const setDefaultOptions = (graph, options) => {
	// do not render the vertices unless the user explicitly wants them
	if (options.vertices === undefined) {
		options.vertices = false;
	}

	// in the case of a creasePattern, do not render the faces
	if (!isFoldedForm(graph)) {
		if (options.faces === undefined) {
			options.faces = false;
		}
	}
};

/**
 * @description a subroutine of render(). there are style properties which
 * are impossible to set universally, because they are dependent upon the input
 * FOLD object (imagine, FOLD within 1x1 square, and FOLD within 600x600).
 * this includes:
 * - "viewBox": calculate the viewBox to fit the 2D bounds of the graph.
 * - "padding": padding incorporated into the viewBox, as a scale of the vmax.
 * - "stroke-width": as a scale of the vmax.
 * - "radius": the radius of the vertices (circles), as a scale of the vmax.
 */
const applyTopLevelOptions = (element, groups, graph, options) => {
	const hasVertices = groups[3] && groups[3].childNodes.length;

	// we can skip this method if all of these are true:
	// - there are no vertices
	// - "strokeWidth" and "viewBox" are both false or undefined
	if (
		!hasVertices &&
		(options.strokeWidth === undefined || options.strokeWidth === false) &&
		(options.viewBox === undefined || options.viewBox === false)
	) {
		return;
	}

	// get the bounding box of all vertices, and the maximum of each dimension.
	// these are needed for both strokeWidth and viewBox.
	const box = boundingBox(graph) || unitBounds;
	const vmax = Math.max(...box.span);

	// because the function argument "element" is able to be any SVGElement type
	// including a <g> group element, and some attributes must be set on the
	// SVG element itself, we have to find the SVG element in the chain of parents
	const svgElement = findElementTypeInParents(element, "svg");

	// set the SVG element viewBox
	if (svgElement && options.viewBox) {
		const viewBoxValue = boundingBoxToViewBox(box);
		svgElement.setAttributeNS(null, "viewBox", viewBoxValue);
	}

	// the "padding" option is incredibly useful despite "padding" as a CSS style
	// property to be problematic (possibly conflicts with global style).
	// padding the viewBox itself is much more reliable.
	// parse the viewbox, modify the numbers, join back into a string.
	if (svgElement && options.padding) {
		const viewBoxString = svgElement.getAttribute("viewBox");
		if (viewBoxString != null) {
			// options.padding will be applied as a scale of vmax
			const pad = options.padding * vmax;
			const viewBox = viewBoxString.split(" ").map((n) => parseFloat(n));
			const newViewBox = [-pad, -pad, pad * 2, pad * 2]
				.map((nudge, i) => viewBox[i] + nudge)
				.join(" ");
			svgElement.setAttributeNS(null, "viewBox", newViewBox);
		}
	}

	// set the stroke-width attribute, which does not require to be set
	// on an SVG element, whatever element was provided works (such as <g>).
	if (options.strokeWidth || options["stroke-width"]) {
		const strokeWidth = options.strokeWidth
			? options.strokeWidth
			: options["stroke-width"];

		// options.strokeWidth will be applied as a scale of vmax
		const strokeWidthValue =
			typeof strokeWidth === "number" ? vmax * strokeWidth : getStrokeWidth(graph);
		element.setAttributeNS(null, "stroke-width", strokeWidthValue);
	}

	// if vertices exist, set their radius, even if no options are supplied.
	if (hasVertices) {
		const userRadius =
			options.vertices && options.vertices.radius != null
				? options.vertices.radius
				: options.radius;
		const radius = typeof userRadius === "string" ? parseFloat(userRadius) : userRadius;
		const r =
			typeof radius === "number" && !Number.isNaN(radius)
				? vmax * radius
				: vmax * DEFAULT_CIRCLE_RADIUS;

		// iterate and set all circles "r" attribute
		for (let i = 0; i < groups[3].childNodes.length; i += 1) {
			groups[3].childNodes[i].setAttributeNS(null, "r", r);
		}
	}
};

/**
 * @description renders a FOLD object into SVG elements, all elements
 * are sorted into 4 groups (boundaries, faces, edges, vertices) and
 * each group is given a descriptive class name.
 * If the options objects specifies an element to be not drawn, this will
 * still return an empty <g> group element in its place.
 * @param {FOLD} graph a FOLD object
 * @param {object} options (optional)
 * @returns {SVGElement[]} An array of four <g> elements: boundaries, faces,
 * edges, vertices, each of the graph components drawn into an SVG group.
 */
const drawGroups = (graph, options = {}) =>
	groupNames
		.map((key) => (options[key] === false ? SVG.g() : draw[key](graph, options[key])))
		.map((group, i) => {
			addClass(group, groupNames[i]);
			return group;
		});

/**
 * @description renders a FOLD object into an SVG, ensuring visibility by
 * setting the viewBox and the stroke-width attributes on the SVG.
 * @param {SVGElement} element an already initialized SVG DOM element.
 * @param {FOLD} graph a FOLD object
 * @param {object} options an optional options object to style the rendering
 * @returns {SVGElement} the first SVG parameter object.
 */
export const renderSVG = (graph, element, options = {}) => {
	// this will modify the options object and set some default
	// rendering settings, as long as the user has not already specified
	setDefaultOptions(graph, options);

	// groups will be an array of four <g> elements, even if some are empty
	const groups = drawGroups(graph, options);

	// for those which contain children, append them to the top-level element
	groups
		.filter((group) => group.childNodes.length > 0)
		.forEach((group) => element.appendChild(group));

	// apply top level options to the SVG (or group) itself
	applyTopLevelOptions(element, groups, graph, options);

	// classes in the FOLD object, if they exist, can be carried over
	// and added to the svg elements too.
	addClass(element, ...[graph.file_classes || [], graph.frame_classes || []].flat());

	return element;
};

/**
 * @description renders a FOLD object as an SVG. This is able to render
 * in a couple styles (creasePattern, foldedForm), and will do some work
 * to ensure a nice rendering by finding a decent stroke-width and viewBox.
 *
 * deprecated param {boolean} tell the draw method to resize the viewbox/stroke
 * @param {FOLD|string} file a FOLD object or a FOLD file as a string
 * @param {{
 *   string?: boolean,
 *   vertices?: boolean,
 *   edges?: { mountain: object, valley: object },
 *   faces?: { front: object, back: object },
 *   boundaries?: object,
 *   viewBox?: boolean,
 *   strokeWidth?: number,
 *   radius?: number,
 * }} [options={}] optional options object to style components
 * - "string" {boolean} if true, the return value will be a string
 *   otherwise it will be a Javascript DOM element object type.
 * @returns {SVGElement|string} SVG element, containing the rendering of the origami.
 * @example
 * // as string
 * const fold = fs.readFileSync("./crane.fold", "utf-8");
 * const svg = foldToSvg(fold, { string: true });
 * fs.writeFileSync("./crane.svg", svg);
 * @example
 * // as DOM Element
 * const birdBase = ear.graph.bird();
 * const svg = foldToSvg(birdBase);
 * document.body.appendChild(svg);
 * @example
 * // with options
 * const birdBase = ear.graph.bird();
 * const svg = foldToSvg(birdBase, {
 *   string: true,
 *   vertices: false,
 *   edges: { mountain: "lightgray", valley: "blue" },
 *   faces: false,
 *   boundaries: false,
 * });
 * fs.writeFileSync("./bird-base.svg", svg);
 */
export const foldToSvg = (file, options = {}) => {
	// render the file into a DOM element type.
	const element = renderSVG(
		typeof file === "string" ? JSON.parse(file) : file,
		SVG.svg(),
		{
			viewBox: true,
			strokeWidth: true,
			...options,
		},
	);

	// if the user requests it, convert the DOM element into a string
	return options && options.string
		? new (window().XMLSerializer)().serializeToString(element)
		: element;
};
