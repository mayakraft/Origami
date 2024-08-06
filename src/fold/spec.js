/**
 * Rabbit Ear (c) Kraft
 */
import { EPSILON } from "../math/constant.js";
import { epsilonEqual } from "../math/compare.js";
import { doEdgesOverlap } from "../graph/edges/overlap.js";

/**
 * FOLD spec: https://github.com/edemaine/FOLD/
 */

/**
 * @description All FOLD format keys as described in the spec.
 */
export const foldKeys = {
	file: [
		"file_spec",
		"file_creator",
		"file_author",
		"file_title",
		"file_description",
		"file_classes",
		"file_frames",
	],
	frame: [
		"frame_author",
		"frame_title",
		"frame_description",
		"frame_attributes",
		"frame_classes",
		"frame_unit",
		"frame_parent", // inside file_frames only
		"frame_inherit", // inside file_frames only
	],
	graph: [
		"vertices_coords",
		"vertices_vertices",
		"vertices_edges",
		"vertices_faces",
		"edges_vertices",
		"edges_faces",
		"edges_assignment",
		"edges_foldAngle",
		"edges_length",
		"faces_vertices",
		"faces_edges",
		"faces_faces",
	],
	orders: ["edgeOrders", "faceOrders"],
};

/**
 * @description All "file_classes" values according to the FOLD spec
 */
export const foldFileClasses = ["singleModel", "multiModel", "animation", "diagrams"];

/**
 * @description All "frame_classes" values according to the FOLD spec
 */
export const foldFrameClasses = ["creasePattern", "foldedForm", "graph", "linkage"];

/**
 * @description All "frame_attributes" values according to the FOLD spec
 */
export const foldFrameAttributes = [
	"2D",
	"3D",
	"abstract",
	"manifold",
	"nonManifold",
	"orientable",
	"nonOrientable",
	"selfTouching",
	"nonSelfTouching",
	"selfIntersecting",
	"nonSelfIntersecting",
];

/**
 * @description Names of graph components
 * @constant {string[]}
 */
export const VEF = ["vertices", "edges", "faces"];

/**
 * @description All possible valid edge assignment characters
 * @constant {string[]}
 */
export const edgesAssignmentValues = Array.from("BbMmVvFfJjCcUu");

/**
 * @description Get the English word for every FOLD spec
 * assignment character (like "M", or "b").
 * @constant {object}
 */
export const edgesAssignmentNames = {
	B: "boundary",
	M: "mountain",
	V: "valley",
	F: "flat",
	J: "join",
	C: "cut",
	U: "unassigned",
};
Object.keys(edgesAssignmentNames).forEach((key) => {
	edgesAssignmentNames[key.toLowerCase()] = edgesAssignmentNames[key];
});

/**
 * @description Get the foldAngle in degrees for every FOLD assignment spec
 * character (like "M", or "b"), assuming the creases are flat folded.
 * @constant {object}
 */
export const assignmentFlatFoldAngle = {
	B: 0,
	b: 0,
	M: -180,
	m: -180,
	V: 180,
	v: 180,
	F: 0,
	f: 0,
	J: 0,
	j: 0,
	C: 0,
	c: 0,
	U: 0,
	u: 0,
};

/**
 * @description For every assignment type, can this edge be a folded edge?
 * @constant {object}
 */
export const assignmentCanBeFolded = {
	B: false,
	b: false,
	M: true,
	m: true,
	V: true,
	v: true,
	F: false,
	f: false,
	J: false,
	j: false,
	C: false,
	c: false,
	U: true,
	u: true,
};

/**
 * @description For every assignment type, can this edge be considered
 * a part of the boundary? Boundary edges are treated differently
 * when solving single-vertex flat foldability, for example.
 * @constant {object}
 */
export const assignmentIsBoundary = {
	B: true,
	b: true,
	M: false,
	m: false,
	V: false,
	v: false,
	F: false,
	f: false,
	J: false,
	j: false,
	C: true,
	c: true,
	U: false,
	u: false,
};

/**
 * @description Convert an assignment character to a foldAngle in degrees.
 * This assumes that all assignments are flat folded.
 * @param {string} assignment a FOLD edge assignment character
 * @returns {number} fold angle in degrees. M/V are assumed to be flat-folded.
 */
export const edgeAssignmentToFoldAngle = (assignment) =>
	assignmentFlatFoldAngle[assignment] || 0;

/**
 * @description Convert a foldAngle to an edge assignment character.
 * This method only considered the fold angle, no boundary detection
 * is performed. This method will only return "M", "V", or "U".
 * @todo should "U" be "F" instead?
 * @param {number} angle fold angle in degrees
 * @returns {string} a FOLD edge assignment character
 */
export const edgeFoldAngleToAssignment = (angle) => {
	if (angle > EPSILON) {
		return "V";
	}
	if (angle < -EPSILON) {
		return "M";
	}
	return "U";
};

/**
 * @description Test if a fold angle is a flat fold, +/- 180.
 * and the epsilon around either number.
 * @param {number} angle fold angle in degrees
 * @returns {boolean} true if the fold angle is flat folded
 */
export const edgeFoldAngleIsFlatFolded = (angle) =>
	epsilonEqual(-180, angle) || epsilonEqual(180, angle);

/**
 * @description Test if a fold angle is flat, which includes unfolded
 * (0 angle), as well as +/- 180, and the epsilon around each of these.
 * @param {number} angle fold angle in degrees
 * @returns {boolean} true if the fold angle is flat
 */
export const edgeFoldAngleIsFlat = (angle) =>
	epsilonEqual(0, angle) || edgeFoldAngleIsFlatFolded(angle);

/**
 * @description Using edges_foldAngle, determine if a FOLD object
 * edges are all flat-folded, meaning all edges are either:
 * -180, 0, 180, or any of those three within an epsilon.
 * If a graph contains no edges_foldAngle the edges are assumed to be flat.
 * @param {FOLD} graph a FOLD object
 * @returns {boolean} are the edges of the graph flat folded?
 */
export const edgesFoldAngleAreAllFlat = ({ edges_foldAngle }) => {
	if (!edges_foldAngle) {
		return true;
	}
	for (let i = 0; i < edges_foldAngle.length; i += 1) {
		if (!edgeFoldAngleIsFlat(edges_foldAngle[i])) {
			return false;
		}
	}
	return true;
};

/**
 * @description subroutine for filterKeysWithPrefix and filterKeysWithSuffix
 * @param {object} obj
 * @param {function} matchFunction
 * @returns {string[]} array of matching keys
 */
const filterKeys = (obj, matchFunction) =>
	Object.keys(obj).filter((key) => matchFunction(key));

/**
 * @description Get all keys in an object which begin with a string and are
 * immediately followed by "_". For example, provide "vertices" and this will
 * match "vertices_coords", "vertices_faces", but not "faces_vertices"
 * @param {FOLD} obj an object, FOLD object or otherwise.
 * @param {string} prefix a prefix to match against the keys
 * @returns {string[]} array of matching keys
 */
export const filterKeysWithPrefix = (obj, prefix) =>
	filterKeys(
		obj,
		/** @param {string} s */
		(s) => s.substring(0, prefix.length + 1) === `${prefix}_`,
	);

/**
 * @description Get all keys in an object which end with a string and are
 * immediately preceded by "_". For example, provide "vertices" and this will
 * match "edges_vertices", "faces_vertices", but not "vertices_edges"
 * @param {FOLD} obj an object, FOLD object or otherwise.
 * @param {string} suffix a suffix to match against the keys
 * @returns {string[]} array of matching keys
 */
export const filterKeysWithSuffix = (obj, suffix) =>
	filterKeys(
		obj,
		/** @param {string} s */
		(s) => s.substring(s.length - suffix.length - 1, s.length) === `_${suffix}`,
	);

/**
 * @description Find all keys in an object that contain a _ character,
 * and return every prefix substring that comes before the _.
 * @param {FOLD} obj an object, FOLD object or otherwise.
 * @returns {string[]} array of prefixes
 */
export const getAllPrefixes = (obj) => {
	const hash = {};
	Object.keys(obj)
		.filter((s) => s.includes("_"))
		.map((k) => k.substring(0, k.indexOf("_")))
		.forEach((k) => {
			hash[k] = true;
		});
	return Object.keys(hash);
};

/**
 * @description Find all keys in an object that contain a _ character,
 * and return every suffix substring that comes after the _.
 * @param {FOLD} obj an object, FOLD object or otherwise.
 * @returns {string[]} array of suffixes
 */
export const getAllSuffixes = (obj) => {
	const hash = {};
	Object.keys(obj)
		.filter((s) => s.includes("_"))
		.map((k) => k.substring(k.lastIndexOf("_") + 1, k.length))
		.forEach((k) => {
			hash[k] = true;
		});
	return Object.keys(hash);
};

/**
 * @description This takes in a geometry_key (vectors, edges, faces), and flattens
 * across all related arrays, creating one object with the keys for every index.
 * @param {FOLD} graph a FOLD object
 * @param {string} geometry_key a geometry item like "vertices"
 * @returns {object[]} an array of objects with FOLD keys but the
 * values are from this single element
 */
export const transposeGraphArrays = (graph, geometry_key) => {
	const matching_keys = filterKeysWithPrefix(graph, geometry_key);
	if (matching_keys.length === 0) {
		return [];
	}
	const len = Math.max(...matching_keys.map((arr) => graph[arr].length));
	const geometry = Array.from(Array(len)).map(() => ({}));
	matching_keys.forEach((key) =>
		geometry.forEach((_, i) => {
			geometry[i][key] = graph[key][i];
		}),
	);
	return geometry;
};

/**
 * @description This takes in a geometry_key (vectors, edges, faces), and flattens
 * across all related arrays, creating one object with the keys.
 * @param {FOLD} graph a FOLD object
 * @param {string} geometry_key a geometry item like "vertices"
 * @param {number} index the index of an element
 * @returns {object} an object with FOLD keys but the values are from this single element
 */
export const transposeGraphArrayAtIndex = (graph, geometry_key, index) => {
	const matching_keys = filterKeysWithPrefix(graph, geometry_key);
	if (matching_keys.length === 0) {
		return undefined;
	}
	const geometry = {};
	matching_keys.forEach((key) => {
		geometry[key] = graph[key][index];
	});
	return geometry;
};

// used in isFoldObject
const allFOLDKeys = Object.freeze(
	[]
		.concat(foldKeys.file)
		.concat(foldKeys.frame)
		.concat(foldKeys.graph)
		.concat(foldKeys.orders),
);

/**
 * @description Using heuristics by checking the names of the keys
 * of an object, determine if an object is a FOLD object.
 * @param {FOLD} object a Javascript object, find out if it is a FOLD object
 * @returns {number} value between 0 and 1 where
 * 0 means no chance, 1 means 100% chance.
 */
export const isFoldObject = (object = {}) =>
	Object.keys(object).length === 0
		? 0
		: allFOLDKeys.filter((key) => object[key]).length / Object.keys(object).length;

/**
 * @description Check the coordinates of each vertex and if any of them
 * contain a third dimension AND that number is not 0, then the graph
 * is in 3D, otherwise the graph is considered 2D.
 * This method is O(n).
 * @param {FOLD} graph a FOLD object
 * @returns {number} the dimension of the vertices, either 2 or 3.
 */
export const getDimension = ({ vertices_coords }, epsilon = EPSILON) => {
	for (let i = 0; i < vertices_coords.length; i += 1) {
		if (
			vertices_coords[i] &&
			vertices_coords[i].length === 3 &&
			!epsilonEqual(0, vertices_coords[i][2], epsilon)
		) {
			return 3;
		}
	}
	return 2;
};

/**
 * @description Infer the dimensions of (the vertices of) a graph
 * by querying the first point in vertices_coords. This also works
 * when the vertices_coords array has holes (ie: index 0 is not set).
 * @param {FOLD} graph a FOLD object
 * @returns {number | undefined} the dimension of the vertices, or
 * undefined if no vertices exist. number should be 2 or 3 in most cases.
 */
export const getDimensionQuick = ({ vertices_coords }) => {
	if (!vertices_coords || !vertices_coords.length) {
		return undefined;
	}
	// return length of first vertex, if it exists
	if (vertices_coords[0] !== undefined) {
		return vertices_coords[0].length;
	}
	// in case of an array with holes, get the first vertex.
	const vertex = vertices_coords.filter(() => true).shift();
	if (!vertex) {
		return undefined;
	}
	return vertex.length;
};

/**
 * @description Infer if a FOLD object is in its folded state
 * (as opposed to crease pattern state).
 * A graph will be considered "folded" if the "foldedForm" key can be found
 * in the metadata, or if the vertices_coords are in 3D and a Z number is not 0,
 * or, if vertices are in 2D and any edges are overlapping.
 * @param {FOLD} graph a FOLD object
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {boolean} true if the graph is in a folded state
 */
export const isFoldedForm = (
	{
		vertices_coords,
		edges_vertices,
		faces_vertices,
		faces_edges,
		frame_classes,
		file_classes,
	},
	epsilon = EPSILON,
) => {
	// FOLD spec only describes "foldedForm" to be in the frame_classes,
	// accounting for mistakes, check both class arrays.
	if (
		(frame_classes && frame_classes.includes("foldedForm")) ||
		(file_classes && file_classes.includes("foldedForm"))
	) {
		return true;
	}
	if (
		(frame_classes && frame_classes.includes("creasePattern")) ||
		(file_classes && file_classes.includes("creasePattern"))
	) {
		return false;
	}
	// unfortunately, anything beyond this point cannot be calculated precisely,
	// or it cannot be calculated precisely without a significant overhead

	// if vertices don't exist, the graph is abstract. return false.
	if (!vertices_coords) {
		return false;
	}

	const dimensions = getDimensionQuick({ vertices_coords });

	// if there are no faces, the idea of "folded" kinda doesn't exist, does it?
	if (!faces_vertices && !faces_edges) {
		// our best guess is yes, it's folded if the vertices are in 3D.
		return dimensions === 3;
	}

	// if the coordinates have only 2 dimensions, we only know that it's flat.
	// we have to check if it's a crease pattern or a flat-folded model,
	// do this by checking if any two edges overlap.
	if (edges_vertices && dimensions === 2) {
		return doEdgesOverlap({ vertices_coords, edges_vertices });
	}

	// iterate over every vertex, check each vertex's Z component, if the
	// Z value is not 0, consider the graph to be folded.
	for (let i = 0; i < vertices_coords.length; i += 1) {
		if (!vertices_coords[i]) {
			continue;
		}
		if (typeof vertices_coords[i][2] !== "number") {
			continue;
		}
		if (!epsilonEqual(vertices_coords[i][2], 0, epsilon)) {
			return true;
		}
	}

	// no evidence that the graph is folded.
	// our best guess is yes, it's folded if the vertices are in 3D.
	return dimensions === 3;
};

/**
 * @description For every edge, give us a boolean:
 * - "true" if the edge is folded, valley or mountain, or unassigned.
 * - "false" if the edge is not folded, any other assignment.
 * "unassigned" is considered folded so that an unsolved crease pattern
 * can be fed into here and we still compute the folded state.
 * @param {FOLD} graph a FOLD object
 * @returns {boolean[]} for every edge, is it folded? or does it have
 * the potential to be folded? where "unassigned" is yes.
 */
export const makeEdgesIsFolded = ({
	edges_vertices,
	edges_foldAngle,
	edges_assignment,
}) => {
	if (edges_assignment === undefined) {
		return edges_foldAngle === undefined
			? edges_vertices.map(() => true)
			: edges_foldAngle.map((angle) => angle < -EPSILON || angle > EPSILON);
	}
	return edges_assignment.map((a) => assignmentCanBeFolded[a]);
};
const flipAssignmentLookup = { M: "V", m: "v", V: "M", v: "m" };

/**
 * @description for a mountain or valley, return the opposite.
 * in the case of any other crease (boundary, flat, ...) return itself.
 * @param {string} assign a FOLD edge assignment
 * @returns {string} a FOLD edge assignment
 */
export const invertAssignment = (assign) => flipAssignmentLookup[assign] || assign;

/**
 * @description Given a fold graph, make all mountains into valleys
 * and visa versa. This includes reversing the fold_angles.
 * @param {FOLD} graph a FOLD object containing edges_assignment
 * @returns {FOLD} the same FOLD object, modified in place.
 */
export const invertAssignments = (graph) => {
	if (graph.edges_assignment) {
		graph.edges_assignment = graph.edges_assignment.map((a) =>
			flipAssignmentLookup[a] ? flipAssignmentLookup[a] : a,
		);
	}
	if (graph.edges_foldAngle) {
		graph.edges_foldAngle = graph.edges_foldAngle.map((n) => -n);
	}
	return graph;
};

/**
 * @description This method sorts edges by their assignment.
 * Given a graph with edges_vertices, return a dictionary with
 * all assignments as keys, and the values are an array of edge indices
 * from this graph matching those assignments under the key.
 * @param {FOLD} graph a FOLD object
 * @returns {{
 *   B?: number[],
 *   V?: number[],
 *   M?: number[],
 *   F?: number[],
 *   J?: number[],
 *   C?: number[],
 *   U?: number[],
 * }} keys: assignment characters, values: array of edge indices
 */
export const sortEdgesByAssignment = ({ edges_vertices, edges_assignment = [] }) => {
	// get an array of all uppercase assignments as strings (B, M, V, F...)
	const allAssignments = Array.from(
		new Set(edgesAssignmentValues.map((s) => s.toUpperCase())),
	);

	// for every edge, return that edge's assignment (uppercase), ensuring
	// that this array matches in length to edges_vertices, and if any
	// edge assignment is unknown, it is given a "U" (unassigned).
	const edges_upperAssignment = edges_vertices
		.map((_, i) => edges_assignment[i] || "U")
		.map((a) => a.toUpperCase());

	// dictionary with assignments as keys and arrays of edge indices as values
	const assignmentIndices = {};
	allAssignments.forEach((a) => {
		assignmentIndices[a] = [];
	});
	edges_upperAssignment.forEach((a, i) => assignmentIndices[a].push(i));
	return assignmentIndices;
};

/**
 * @description Get a FOLD object's metadata, which includes all relevant
 * data inside any of the "file_" keys. Note: this does not include
 * any "frames_" frame metadata.
 * @param {FOLD} FOLD a FOLD object
 * @returns {{
 *   file_spec?: number,
 *   file_creator?: string,
 *   file_author?: string,
 *   file_title?: string,
 *   file_description?: string,
 *   file_classes?: string[],
 * }} an object containing the metadata keys and values
 */
export const getFileMetadata = (FOLD = {}) => {
	// return all "file_" metadata keys (do not include file_frames)
	const metadata = {};
	foldKeys.file
		.filter((key) => key !== "file_frames")
		.filter((key) => FOLD[key] !== undefined)
		.forEach((key) => {
			metadata[key] = FOLD[key];
		});
	return metadata;
};
