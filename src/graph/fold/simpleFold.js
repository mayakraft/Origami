/**
 * Rabbit Ear (c) Kraft
 */
import { EPSILON } from "../../math/constant.js";
import { includeL, includeR, includeS } from "../../math/compare.js";
import { pointsToLine2 } from "../../math/convert.js";
import { foldGraph } from "./foldGraph.js";

/**
 * @description Crease a fold line through a folded origami model.
 * This method takes in and returns a crease pattern but performs the fold
 * on the folded form; this approach maintains better precision especially
 * in the case of repeated calls to fold an origami model.
 * @param {FOLD} graph a FOLD object
 * @param {VecLine2} line the fold line
 * @param {{
 *   assignment?: string,
 *   foldAngle?: number,
 *   vertices_coordsFolded?: [number, number][]|[number, number, number][],
 * }} options including the new edge assignment and fold angle, and the
 * folded vertices_coords
 * @param {number} [epsilon=1e-6]
 * @returns {FoldGraphEvent} an object summarizing the changes to the graph
 */
export const foldLine = (
	graph,
	line,
	{ assignment = "F", foldAngle, vertices_coordsFolded } = {},
	epsilon = EPSILON,
) =>
	foldGraph(
		graph,
		line,
		includeL,
		{ points: [], assignment, foldAngle, vertices_coordsFolded },
		epsilon,
	);

/**
 * @description Crease a fold ray through a folded origami model.
 * This method takes in and returns a crease pattern but performs the fold
 * on the folded form; this approach maintains better precision especially
 * in the case of repeated calls to fold an origami model.
 * @param {FOLD} graph a FOLD object
 * @param {VecLine2} ray the fold line as a ray
 * @param {{
 *   assignment?: string,
 *   foldAngle?: number,
 *   vertices_coordsFolded?: [number, number][]|[number, number, number][],
 * }} options including the new edge assignment and fold angle, and the
 * folded vertices_coords
 * @param {number} [epsilon=1e-6]
 * @returns {FoldGraphEvent} an object summarizing the changes to the graph
 */
export const foldRay = (
	graph,
	ray,
	{ assignment = "F", foldAngle, vertices_coordsFolded } = {},
	epsilon = EPSILON,
) =>
	foldGraph(
		graph,
		ray,
		includeR,
		{ points: [ray.origin], assignment, foldAngle, vertices_coordsFolded },
		epsilon,
	);

/**
 * @description Crease a fold segment through a folded origami model.
 * This method takes in and returns a crease pattern but performs the fold
 * on the folded form; this approach maintains better precision especially
 * in the case of repeated calls to fold an origami model.
 * @param {FOLD} graph a FOLD object
 * @param {[[number, number], [number, number]]} segment the fold segment
 * @param {{
 *   assignment?: string,
 *   foldAngle?: number,
 *   vertices_coordsFolded?: [number, number][]|[number, number, number][],
 * }} options including the new edge assignment and fold angle, and the
 * folded vertices_coords
 * @param {number} [epsilon=1e-6]
 * @returns {FoldGraphEvent} an object summarizing the changes to the graph
 */
export const foldSegment = (
	graph,
	segment,
	{ assignment = "F", foldAngle, vertices_coordsFolded } = {},
	epsilon = EPSILON,
) =>
	foldGraph(
		graph,
		pointsToLine2(segment[0], segment[1]),
		includeS,
		{ points: segment, assignment, foldAngle, vertices_coordsFolded },
		epsilon,
	);
