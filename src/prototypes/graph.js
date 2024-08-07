/**
 * Rabbit Ear (c) Kraft
 */
// import { count } from "../graph/count.js";
import { clone } from "../general/clone.js";
import { foldToSvg } from "../convert/foldToSvg.js";
import { foldToObj } from "../convert/foldToObj.js";
import { clean } from "../graph/clean.js";
import { planarize } from "../graph/planarize/planarize.js";
import { populate } from "../graph/populate.js";
// import { flatFold } from "../graph/fold/flatFold.js";
import * as splitEdge from "../graph/split/splitEdge.js";
import * as transform from "../graph/transform.js";
import * as explode from "../graph/explode.js";
import * as nearest from "../graph/nearest.js";
import * as validate from "../graph/validate/validate.js";
// import {
// 	getLine,
// } from "../general/get.js";
import { foldKeys, invertAssignments } from "../fold/spec.js";
import { subgraph } from "../graph/subgraph.js";
import {
	boundary,
	boundaries,
	planarBoundary,
	planarBoundaries,
	boundingBox,
} from "../graph/boundary.js";
import {
	makeVerticesCoordsFolded,
	makeVerticesCoordsFlatFolded,
	makeVerticesCoordsFoldedFromMatrix2,
} from "../graph/vertices/folded.js";

/**
 * @description a graph which includes faces, edges, and vertices, and
 * additional origami-specific information like fold angles of edges
 * and layer order of faces.
 * @param {FOLD} [graph] an optional FOLD object,
 * otherwise the graph will initialize empty
 */
const Graph = {};
Graph.prototype = Object.create(Object.prototype);
Graph.prototype.constructor = Graph;

/**
 * methods where "graph" is the first parameter, followed by ...arguments
 * func(graph, ...args)
 */
Object.entries({
	// count,
	clean,
	populate,
	subgraph,
	boundary,
	boundaries,
	planarBoundary,
	planarBoundaries,
	boundingBox,
	invertAssignments,
	svg: foldToSvg,
	obj: foldToObj,
	...splitEdge,
	...explode,
	...nearest,
	...transform,
	...validate,
}).forEach(([key, value]) => {
	Graph.prototype[key] = function () {
		return value.apply(null, [this, ...arguments]);
	};
});

/**
 * @returns {FOLD} a deep copy of this object
 */
Graph.prototype.clone = function () {
	return Object.assign(Object.create(Object.getPrototypeOf(this)), clone(this));
};

/**
 * @description convert a graph into a planar graph.
 * the core "planarize" method normally does not modify the input object,
 * in this case, the object itself is modified in place.
 */
Graph.prototype.planarize = function () {
	const result = planarize(this);
	this.clear();
	Object.assign(this, result);
	return this;
};

/**
 * @description this clears all components from the graph,
 * leaving metadata and other keys untouched.
 */
Graph.prototype.clear = function () {
	foldKeys.graph.forEach((key) => delete this[key]);
	foldKeys.orders.forEach((key) => delete this[key]);
	// the code above just avoided deleting all "file_" keys,
	// however, file_frames needs to be removed as it contains geometry.
	delete this.file_frames;
	return this;
};

/**
 * @description return a shallow copy of this graph with the vertices folded.
 * This method works for both 2D and 3D origami.
 * The angle of the fold is searched for in this order:
 * - faces_matrix2 if it exists
 * - edges_foldAngle if it exists
 * - edges_assignment if it exists
 * Repeated calls to this method will repeatedly fold the vertices
 * resulting in a behavior that is surely unintended.
 */
Graph.prototype.folded = function () {
	const vertices_coords = this.faces_matrix2
		? makeVerticesCoordsFoldedFromMatrix2(this, this.faces_matrix2)
		: makeVerticesCoordsFolded(this, ...arguments);
	Object.assign(this, {
		vertices_coords,
		frame_classes: ["foldedForm"],
	});
	return this;
};

/**
 * @description return a copy of this graph with the vertices folded.
 * This method will work for 2D only.
 * The angle of the fold is searched for in this order:
 * - faces_matrix2 if it exists
 * - edges_assignment or edges_foldAngle if it exists
 * If neither exists, this method will assume that ALL edges are flat-folded.
 */
Graph.prototype.flatFolded = function () {
	const vertices_coords = this.faces_matrix2
		? makeVerticesCoordsFoldedFromMatrix2(this, this.faces_matrix2)
		: makeVerticesCoordsFlatFolded(this, ...arguments);
	Object.assign(this, {
		vertices_coords,
		frame_classes: ["foldedForm"],
	});
	return this;
};

// Graph.prototype.flatFold = function () {
// 	flatFold(this, getLine(arguments));
// 	return this;
// };

export default Graph.prototype;
