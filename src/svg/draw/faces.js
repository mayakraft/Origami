/**
 * Rabbit Ear (c) Kraft
 */
import * as S from "../../general/strings.js";
import { isFoldedForm } from "../../graph/query.js";
import { invertMap } from "../../graph/maps.js";
import { makeFacesWinding } from "../../graph/facesWinding.js";
// get the SVG library from its binding to the root of the library
import { addClassToClassList } from "../classes.js";
import root from "../../root.js";

const FACE_STYLE_FOLDED_ORDERED = {
	back: { fill: S._white },
	front: { fill: "#ddd" },
};
const FACE_STYLE_FOLDED_UNORDERED = {
	back: { opacity: 0.1 },
	front: { opacity: 0.1 },
};
const FACE_STYLE_FLAT = {
	// back: { fill: "white", stroke: "none" },
	// front: { fill: "#ddd", stroke: "none" }
};
const GROUP_STYLE_FOLDED_ORDERED = {
	stroke: S._black,
	"stroke-linejoin": "bevel",
};
const GROUP_STYLE_FOLDED_UNORDERED = {
	stroke: S._none,
	fill: S._black,
	"stroke-linejoin": "bevel",
};
const GROUP_STYLE_FLAT = {
	fill: S._none,
};
/**
 * this ended up being a nice function. i got some things for free.
 */
const faces_sorted_by_layer = function (faces_layer, graph) {
	const faceCount = graph.faces_vertices.length || graph.faces_edges.length;
	const missingFaces = Array.from(Array(faceCount))
		.map((_, i) => i)
		.filter(i => faces_layer[i] == null);
	return missingFaces.concat(invertMap(faces_layer));
};

const applyFacesStyle = (el, attributes = {}) => Object.keys(attributes)
	.forEach(key => el.setAttributeNS(null, key, attributes[key]));

/**
 * @description this method will check for layer order, face windings,
 * and apply a style to each face accordingly, adds them to the group,
 * and applies style attributes to the group itself too.
 */
const finalize_faces = (graph, svg_faces, group, attributes) => {
	const isFolded = isFoldedForm(graph);
	// currently, layer order is determined by "faces_layer" key, and
	// ensuring that the length matches the number of faces in the graph.
	const orderIsCertain = graph[S._faces_layer] != null;
	const classNames = [[S._front], [S._back]];
	const faces_winding = makeFacesWinding(graph);
	// counter-clockwise faces are "face up", their front facing the camera
	// clockwise faces means "flipped", their back is facing the camera.
	// set these class names, and apply the style as attributes on each face.
	faces_winding.map(w => (w ? classNames[0] : classNames[1]))
		.forEach((className, i) => {
			addClassToClassList(svg_faces[i], className);
			// svg_faces[i].classList.add(className);
			// svg_faces[i].setAttributeNS(null, S._class, className);
			applyFacesStyle(svg_faces[i], (isFolded
				? (orderIsCertain
					? FACE_STYLE_FOLDED_ORDERED[className]
					: FACE_STYLE_FOLDED_UNORDERED[className])
				: FACE_STYLE_FLAT[className]));
			applyFacesStyle(svg_faces[i], attributes[className]);
		});
	// if the layer-order exists, sort the faces in order of faces_layer
	const facesInOrder = (orderIsCertain
		? faces_sorted_by_layer(graph[S._faces_layer], graph).map(i => svg_faces[i])
		: svg_faces);
	facesInOrder.forEach(face => group.appendChild(face));
	// these custom getters allows you to grab all "front" or "back" faces only.
	Object.defineProperty(group, S._front, {
		get: () => svg_faces.filter((_, i) => faces_winding[i]),
	});
	Object.defineProperty(group, S._back, {
		get: () => svg_faces.filter((_, i) => !faces_winding[i]),
	});
	// set style attributes to the group itself which contains the faces.
	applyFacesStyle(group, (isFolded
		? (orderIsCertain
			? GROUP_STYLE_FOLDED_ORDERED
			: GROUP_STYLE_FOLDED_UNORDERED)
		: GROUP_STYLE_FLAT));
	return group;
};
/**
 * @description build SVG faces using faces_vertices data. this is
 * slightly faster than the other method which uses faces_edges.
 * @returns {SVGElement[]} an SVG <g> group element containing all
 * of the <polygon> faces as children.
 */
export const facesVerticesPolygon = (graph, attributes = {}) => {
	const g = root.svg.g();
	if (!graph || !graph.vertices_coords || !graph.faces_vertices) { return g; }
	const svg_faces = graph.faces_vertices
		.map(fv => fv.map(v => [0, 1].map(i => graph.vertices_coords[v][i])))
		.map(face => root.svg.polygon(face));
	svg_faces.forEach((face, i) => face.setAttributeNS(null, S._index, i)); // `${i}`));
	g.setAttributeNS(null, "fill", S._white);
	return finalize_faces(graph, svg_faces, g, attributes);
};
/**
 * @description build SVG faces using faces_edges data. this is
 * slightly slower than the other method which uses faces_vertices.
 * @returns {SVGElement[]} an SVG <g> group element containing all
 * of the <polygon> faces as children.
 */
export const facesEdgesPolygon = function (graph, attributes = {}) {
	const g = root.svg.g();
	if (!graph
		|| S._faces_edges in graph === false
		|| S._edges_vertices in graph === false
		|| S._vertices_coords in graph === false) {
		return g;
	}
	const svg_faces = graph[S._faces_edges]
		.map(face_edges => face_edges
			.map(edge => graph[S._edges_vertices][edge])
			.map((vi, i, arr) => {
				const next = arr[(i + 1) % arr.length];
				return (vi[1] === next[0] || vi[1] === next[1] ? vi[0] : vi[1]);
			// }).map(v => graph[S._vertices_coords][v]))
			}).map(v => [0, 1].map(i => graph[S._vertices_coords][v][i])))
		.map(face => root.svg.polygon(face));
	svg_faces.forEach((face, i) => face.setAttributeNS(null, S._index, i)); // `${i}`));
	g.setAttributeNS(null, "fill", "white");
	return finalize_faces(graph, svg_faces, g, attributes);
};
