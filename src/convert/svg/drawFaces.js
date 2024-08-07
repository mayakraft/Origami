/**
 * Rabbit Ear (c) Kraft
 */
import { isFoldedForm } from "../../fold/spec.js";
import { makeFacesWinding } from "../../graph/faces/winding.js";
import { linearize2DFaces } from "../../graph/orders.js";
import { addClass } from "../../svg/general/dom.js";
import SVG from "../../svg/index.js";
import { setKeysAndValues } from "../general/svg.js";

/**
 * @description each face is given a name depending on the winding order
 * front: counter-clockwise, back: clockwise.
 */
const facesSideNames = ["front", "back"];

/**
 * @description default style to be applied to individual face polygons
 */
const FACE_STYLE = {
	foldedForm: {
		ordered: {
			back: { fill: "white" },
			front: { fill: "#ddd" },
		},
		unordered: {
			back: { opacity: 0.1 },
			front: { opacity: 0.1 },
		},
	},
	creasePattern: {},
};

/**
 * @description default style to be applied to the group <g> element
 */
const GROUP_STYLE = {
	foldedForm: {
		ordered: {
			stroke: "black",
			"stroke-linejoin": "bevel",
		},
		unordered: {
			stroke: "none",
			fill: "black",
			"stroke-linejoin": "bevel",
		},
	},
	creasePattern: {
		fill: "none",
	},
};

/**
 * @description this method will check for layer order, face windings,
 * and apply a style to each face accordingly, adds them to the group,
 * and applies style attributes to the group itself too.
 * @param {FOLDExtended} graph a FOLD object
 * @param {Element[]} svg_faces a list of polygon elements
 * @param {SVGElement} group the container for the faces
 * @param {object} options
 */
// const finalize_faces3D = (graph, svg_faces, group, options = {}) => {
// 	const isFolded = isFoldedForm(graph);

// 	// capable of determining order from faceOrders (spec) or faces_layer
// 	const orderIsCertain = !!(graph.faceOrders || graph.faces_layer);
// 	const faces_winding = makeFacesWinding(graph);

// 	// set the style of each individual face, depending on the
// 	// face's visible side (front/back) and foldedForm vs. crease pattern
// 	faces_winding
// 		.map(w => (w ? facesSideNames[0] : facesSideNames[1]))
// 		.forEach((className, i) => {
// 			// counter-clockwise faces are "face up", their front facing the camera
// 			// clockwise faces means "flipped", their back is facing the camera.
// 			// set these class names, and apply the style as attributes on each face.
// 			addClass(svg_faces[i], className);

// 			// Apply a data attribute ("data-") to an element, enabling the user
// 			// to be able to get this data using the .dataset selector.
// 			// https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto/Use_data_attributes
// 			svg_faces[i].setAttribute("data-side", className);

// 			// cp / folded style, which is based on known or unknown face order
// 			const foldedFaceStyle = orderIsCertain
// 				? FACE_STYLE.foldedForm.ordered[className]
// 				: FACE_STYLE.foldedForm.unordered[className];
// 			const faceStyle = isFolded
// 				? foldedFaceStyle
// 				: FACE_STYLE.creasePattern[className];

// 			// set the face style (front/back in the context of CP or foldedForm)
// 			setKeysAndValues(svg_faces[i], faceStyle);

// 			// set any custom user style that was provided in the options object
// 			setKeysAndValues(svg_faces[i], options[className]);
// 		});

// 	// get a list of face indices, 0...N-1, or in the case of a layer order
// 	// existing, give us these indices in layer-sorted order.
// 	// using this order, append the faces to the parent group.
// 	linearize2DFaces(graph).forEach(f => group.appendChild(svg_faces[f]));

// 	console.log("here", linearize2DFaces(graph));

// 	// set style attributes of the group
// 	const groupStyleFolded = orderIsCertain
// 		? GROUP_STYLE.foldedForm.ordered
// 		: GROUP_STYLE.foldedForm.unordered;
// 	setKeysAndValues(group, isFolded ? groupStyleFolded : GROUP_STYLE.creasePattern);

// 	return group;
// };

/**
 * @description this method will check for layer order, face windings,
 * and apply a style to each face accordingly, adds them to the group,
 * and applies style attributes to the group itself too.
 * @param {FOLDExtended} graph a FOLD object
 * @param {Element[]} svg_faces a list of polygon elements
 * @param {SVGElement} group the container for the faces
 * @param {object} options
 */
const finalize_faces = (graph, svg_faces, group, options = {}) => {
	const isFolded = isFoldedForm(graph);

	// capable of determining order from faceOrders (spec) or faces_layer
	const orderIsCertain = !!(graph.faceOrders || graph.faces_layer);
	const faces_winding = makeFacesWinding(graph);

	// set the style of each individual face, depending on the
	// face's visible side (front/back) and foldedForm vs. crease pattern
	faces_winding
		.map((w) => (w ? facesSideNames[0] : facesSideNames[1]))
		.forEach((className, i) => {
			// counter-clockwise faces are "face up", their front facing the camera
			// clockwise faces means "flipped", their back is facing the camera.
			// set these class names, and apply the style as attributes on each face.
			addClass(svg_faces[i], className);

			// Apply a data attribute ("data-") to an element, enabling the user
			// to be able to get this data using the .dataset selector.
			// https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto/Use_data_attributes
			svg_faces[i].setAttribute("data-side", className);

			// cp / folded style, which is based on known or unknown face order
			const foldedFaceStyle = orderIsCertain
				? FACE_STYLE.foldedForm.ordered[className]
				: FACE_STYLE.foldedForm.unordered[className];
			const faceStyle = isFolded ? foldedFaceStyle : FACE_STYLE.creasePattern[className];

			// set the face style (front/back in the context of CP or foldedForm)
			setKeysAndValues(svg_faces[i], faceStyle);

			// set any custom user style that was provided in the options object
			setKeysAndValues(svg_faces[i], options[className]);
		});

	// get a list of face indices, 0...N-1, or in the case of a layer order
	// existing, give us these indices in layer-sorted order.
	// using this order, append the faces to the parent group.
	linearize2DFaces(graph).forEach((f) => group.appendChild(svg_faces[f]));

	// set style attributes of the group
	const groupStyleFolded = orderIsCertain
		? GROUP_STYLE.foldedForm.ordered
		: GROUP_STYLE.foldedForm.unordered;
	setKeysAndValues(group, isFolded ? groupStyleFolded : GROUP_STYLE.creasePattern);

	return group;
};

/**
 * @description build SVG faces using faces_vertices data. this is
 * slightly faster than the other method which uses faces_edges.
 * @param {FOLD} graph
 * @param {object} options
 * @returns {SVGElement} an SVG <g> group element containing all
 * of the <polygon> faces as children.
 */
export const facesVerticesPolygon = (graph, options) => {
	const svg_faces = graph.faces_vertices
		.map((fv) => fv.map((v) => [0, 1].map((i) => graph.vertices_coords[v][i])))
		.map((face) => SVG.polygon(face));
	svg_faces.forEach((face, i) => face.setAttributeNS(null, "index", `${i}`));
	return finalize_faces(graph, svg_faces, SVG.g(), options);
};

/**
 * @description build SVG faces using faces_edges data. this is
 * slightly slower than the other method which uses faces_vertices.
 * @param {FOLD} graph
 * @param {object} options
 * @returns {SVGElement} an SVG <g> group element containing all
 * of the <polygon> faces as children.
 */
export const facesEdgesPolygon = function (graph, options) {
	const svg_faces = graph.faces_edges
		.map((face_edges) =>
			face_edges
				.map((edge) => graph.edges_vertices[edge])
				.map((vi, i, arr) => {
					const next = arr[(i + 1) % arr.length];
					return vi[1] === next[0] || vi[1] === next[1] ? vi[0] : vi[1];
				})
				.map((v) => [0, 1].map((i) => graph.vertices_coords[v][i])),
		)
		.map((face) => SVG.polygon(face));
	svg_faces.forEach((face, i) => face.setAttributeNS(null, "index", `${i}`));
	return finalize_faces(graph, svg_faces, SVG.g(), options);
};

/**
 * @description Convert the faces of a FOLD graph into SVG polygon elements.
 * Return the result as a group element <g> with all faces (if they exist)
 * as childNodes in the group.
 * @param {FOLD} graph
 * @param {object} options
 * @returns {SVGElement} an SVG <g> group element containing all
 * of the <polygon> faces as children.
 */
export const drawFaces = (graph, options) => {
	if (graph && graph.vertices_coords && graph.faces_vertices) {
		return facesVerticesPolygon(graph, options);
	}
	if (graph && graph.vertices_coords && graph.edges_vertices && graph.faces_edges) {
		return facesEdgesPolygon(graph, options);
	}
	return SVG.g();
};
