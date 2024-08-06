/**
 * Rabbit Ear (c) Kraft
 */
import {
	scale as Scale,
	scale2 as Scale2,
	scale3 as Scale3,
	scaleNonUniform,
	scaleNonUniform2,
	scaleNonUniform3,
	add,
	add2,
	add3,
	subtract2,
	subtract3,
	subtract,
	resize2,
	resize3,
} from "../math/vector.js";
import {
	makeMatrix3Rotate,
	makeMatrix3RotateX,
	makeMatrix3RotateY,
	makeMatrix3RotateZ,
	multiplyMatrix3Vector3,
} from "../math/matrix3.js";
import { boundingBox } from "../math/polygon.js";
import { getDimensionQuick } from "../fold/spec.js";

/**
 * @description Alter the vertices by moving the corner of the graph
 * to the origin and shrink or expand the vertices until they
 * aspect fit inside the unit square.
 * @param {FOLD} graph a FOLD object, modified in place
 * @returns {FOLD} the same input graph, modified
 */
export const unitize = (graph) => {
	if (!graph.vertices_coords) {
		return graph;
	}
	const box = boundingBox(graph.vertices_coords);
	const longest = Math.max(...box.span);
	const scaleAmount = longest === 0 ? 1 : 1 / longest;
	const origin = box.min;
	const vertices_coords = graph.vertices_coords
		.map((coord) => subtract(coord, origin))
		.map((coord) => Scale(coord, scaleAmount));
	return Object.assign(graph, { vertices_coords });
};

/**
 * @description Apply a translation to a graph.
 * @param {FOLD} graph a FOLD object, modified in place
 * @param {[number, number]|[number, number, number]} translation a 2D vector
 * @returns {FOLD} the same input graph, modified
 */
export const translate2 = (graph, translation) => {
	if (!graph.vertices_coords) {
		return graph;
	}
	const vertices_coords = graph.vertices_coords.map((coord) => add2(coord, translation));
	return Object.assign(graph, { vertices_coords });
};

/**
 * @description Apply a translation to a graph.
 * @param {FOLD} graph a FOLD object, modified in place
 * @param {[number, number]|[number, number, number]} translation a 3D vector
 * @returns {FOLD} the same input graph, modified
 */
export const translate3 = (graph, translation) => {
	if (!graph.vertices_coords) {
		return graph;
	}
	const tr3 = resize3(translation);
	const vertices_coords = graph.vertices_coords
		.map(resize3)
		.map((coord) => add3(coord, tr3));
	return Object.assign(graph, { vertices_coords });
};

/**
 * @description Apply a translation to a graph.
 * @param {FOLD} graph a FOLD object, modified in place
 * @param {[number, number]|[number, number, number]} translation a 3D vector
 * @returns {FOLD} the same input graph, modified
 */
export const translate = (graph, translation) => {
	if (!graph.vertices_coords) {
		return graph;
	}
	const vertices_coords = graph.vertices_coords.map((coord) => add(coord, translation));
	return Object.assign(graph, { vertices_coords });
};

/**
 * @description Apply a uniform affine scale to a graph.
 * @param {FOLD} graph a FOLD object, modified in place
 * @param {number} scaleAmount the scale amount to be applied to all dimensions
 * @param {[number, number]|[number, number, number]} origin the
 * homothetic center
 * @returns {FOLD} the same input graph, modified.
 */
export const scaleUniform2 = (graph, scaleAmount = 1, origin = [0, 0]) => {
	if (!graph.vertices_coords) {
		return graph;
	}
	const vertices_coords = graph.vertices_coords.map((coord) =>
		add2(Scale2(subtract2(coord, origin), scaleAmount), origin),
	);
	return Object.assign(graph, { vertices_coords });
};

/**
 * @description Apply a uniform affine scale to a graph.
 * @param {FOLD} graph a FOLD object, modified in place
 * @param {number} scaleAmount the scale amount to be applied to all dimensions
 * @param {[number, number]|[number, number, number]} origin the
 * homothetic center
 * @returns {FOLD} the same input graph, modified.
 */
export const scaleUniform3 = (graph, scaleAmount = 1, origin = [0, 0, 0]) => {
	if (!graph.vertices_coords) {
		return graph;
	}
	const origin3 = resize3(origin);
	const vertices_coords = graph.vertices_coords
		.map(resize3)
		.map((coord) => add3(Scale3(subtract3(coord, origin3), scaleAmount), origin3));
	return Object.assign(graph, { vertices_coords });
};

/**
 * @description Apply a uniform affine scale to a graph.
 * @param {FOLD} graph a FOLD object, modified in place
 * @param {number} scaleAmount the scale amount to be applied to all dimensions
 * @param {[number, number]|[number, number, number]} origin the
 * homothetic center
 * @returns {FOLD} the same input graph, modified.
 */
export const scaleUniform = (graph, scaleAmount = 1, origin = [0, 0, 0]) => {
	if (!graph.vertices_coords) {
		return graph;
	}
	const origin3 = resize3(origin);
	const vertices_coords = graph.vertices_coords.map((coord) =>
		add(Scale(subtract(coord, origin3), scaleAmount), origin3),
	);
	return Object.assign(graph, { vertices_coords });
};

/**
 * @description Apply a uniform affine scale to a graph.
 * @param {FOLD} graph a FOLD object, modified in place
 * @param {[number, number]|[number, number, number]} scaleAmounts
 * the scale amount to be applied to all dimensions
 * @param {[number, number]|[number, number, number]} origin
 * the homothetic center
 * @returns {FOLD} the same input graph, modified.
 */
export const scale2 = (graph, scaleAmounts = [1, 1], origin = [0, 0]) => {
	const vertices_coords = graph.vertices_coords.map((coord) =>
		add2(scaleNonUniform2(subtract2(coord, origin), scaleAmounts), origin),
	);
	return Object.assign(graph, { vertices_coords });
};

/**
 * @description Apply a uniform affine scale to a graph.
 * @param {FOLD} graph a FOLD object, modified in place
 * @param {[number, number]|[number, number, number]} scaleAmounts
 * the scale amount to be applied to all dimensions
 * @param {[number, number]|[number, number, number]} origin
 * the homothetic center
 * @returns {FOLD} the same input graph, modified.
 */
export const scale3 = (graph, scaleAmounts = [1, 1, 1], origin = [0, 0, 0]) => {
	/** @type {[number, number, number]} */
	const sc3 = [scaleAmounts[0] || 1, scaleAmounts[1] || 1, scaleAmounts[2] || 1];
	const origin3 = resize3(origin);
	const vertices_coords = graph.vertices_coords
		.map(resize3)
		.map((coord) => add3(scaleNonUniform3(subtract3(coord, origin3), sc3), origin3));
	return Object.assign(graph, { vertices_coords });
};

/**
 * @description Apply a uniform affine scale to a graph.
 * @param {FOLD} graph a FOLD object, modified in place
 * @param {[number, number]|[number, number, number]} scaleAmounts
 * the scale amount to be applied to all dimensions
 * @param {[number, number]|[number, number, number]} origin
 * the homothetic center
 * @returns {FOLD} the same input graph, modified.
 */
export const scale = (graph, scaleAmounts = [1, 1, 1], origin = [0, 0, 0]) => {
	const origin3 = resize3(origin);
	const vertices_coords = graph.vertices_coords.map((coord) =>
		add(scaleNonUniform(subtract(coord, origin3), scaleAmounts), origin3),
	);
	return Object.assign(graph, { vertices_coords });
};

/**
 * @param {FOLD} graph a FOLD object
 * @param {number[]} matrix
 * @returns {[number, number]|[number, number, number][]} vertices coords transformed and in 3D
 */
export const transform = ({ vertices_coords }, matrix) =>
	vertices_coords.map(resize3).map((v) => multiplyMatrix3Vector3(matrix, v));

/**
 * @description Apply a rotation to a graph in 3D. This will modify
 * 2D vertices to become 3D.
 * @param {FOLD} graph a FOLD object, modified in place
 * @param {number} angle the rotation amount in radians
 * @param {number[]} vector the axis of rotation
 * @param {number[]} origin the center of rotation
 * @returns {FOLD} the same input graph, modified
 */
export const rotate = (graph, angle, vector = [0, 0, 1], origin = [0, 0, 0]) => {
	const matrix = makeMatrix3Rotate(angle, resize3(vector), resize3(origin));
	const vertices_coords = transform(graph, matrix);
	return Object.assign(graph, { vertices_coords });
};

/**
 * @description Apply a rotation to a graph around the +X axis.
 * @param {FOLD} graph a FOLD object, modified in place
 * @param {number} angle the rotation amount in radians
 * @param {number[]} origin the center of rotation
 * @returns {FOLD} the same input graph, modified
 */
export const rotateX = (graph, angle, origin = [0, 0, 0]) => {
	const matrix = makeMatrix3RotateX(angle, resize3(origin));
	const vertices_coords = transform(graph, matrix);
	return Object.assign(graph, { vertices_coords });
};

/**
 * @description Apply a rotation to a graph around the +Y axis.
 * @param {FOLD} graph a FOLD object, modified in place
 * @param {number} angle the rotation amount in radians
 * @param {number[]} origin the center of rotation
 * @returns {FOLD} the same input graph, modified
 */
export const rotateY = (graph, angle, origin = [0, 0, 0]) => {
	const matrix = makeMatrix3RotateY(angle, resize3(origin));
	const vertices_coords = transform(graph, matrix);
	return Object.assign(graph, { vertices_coords });
};

/**
 * @description Apply a rotation to a graph around the +Z axis.
 * This is the only of the three axis rotation methods which can result
 * in 2D vertices (if the input vertices are in 2D).
 * rotateX and rotateY result vertices will remain 3D always.
 * @param {FOLD} graph a FOLD object, modified in place
 * @param {number} angle the rotation amount in radians
 * @param {number[]} origin the center of rotation
 * @returns {FOLD} the same input graph, modified
 */
export const rotateZ = (graph, angle, origin = [0, 0, 0]) => {
	// get the dimensions of the vertices of the incoming graph
	const resizeFn = getDimensionQuick(graph) === 2 ? resize2 : resize3;
	const matrix = makeMatrix3RotateZ(angle, resize3(origin));
	// return vertices_coords to the same dimension as the input graph
	const vertices_coords = transform(graph, matrix).map((coord) => resizeFn(coord));
	return Object.assign(graph, { vertices_coords });
};
