/**
 * Rabbit Ear (c) Kraft
 */
import {
	convexHull,
} from "../math/convexHull.js";
import {
	magnitude2,
	dot2,
	subtract2,
	resize2,
} from "../math/vector.js";
import {
	perpendicularBalancedSegment,
} from "./general.js";
import {
	boundingBox,
} from "../math/polygon.js";
import {
	clipLineConvexPolygon,
} from "../math/clip.js";

/**
 * @description Given a segment representing an arrow endpoints,
 * create an arrow definition which goes from the start to the end point.
 * This arrow will bend slightly, a nice arrow has an upward bend in the path,
 * so depending on the direction of the arrow, the correct bend is calculated.
 * An options object allows you to specify the minimum dimension of the
 * containing polygon, so that a nice-sized arrowhead may be calculated.
 * @param {[number, number][]} points an array of two points, each an array of numbers
 * @param {{ vmax?: number, padding?: number }} options where
 * - vmax is the maximum dimension of the canvas size/containing polygon
 * - padding is a percentage of the length of the arrow path to inset the heads
 * @returns {Arrow} an arrow definition including a head but no tail.
 */
export const arrowFromSegment = (points, options = {}) => {
	if (points === undefined) { return undefined; }
	const vector = subtract2(points[1], points[0]);
	const length = magnitude2(vector);

	// we need a good padding value, arrowheads should not be exactly
	// on top of their targets, but spaced a little behind it.
	const padding = options.padding ? options.padding : length * 0.05;

	// a good arrow whose path bends should always bend up then back down
	// like a ball thrown up and returning to Earth.
	// "bend" will be positive or negative based on the left/right direction
	const direction = dot2(vector, [1, 0]);

	// prefer to base the size of the head off of the size of the canvas,
	// so, please use the options.vmax if possible.
	// Otherwise, base the size of the head off of the length of the arrow,
	// which has the side effect of a shrinking head as the length shrinks.
	const vmax = options && options.vmax ? options.vmax : length;
	return {
		segment: [points[0], points[1]],
		head: {
			width: vmax * 0.0666,
			height: vmax * 0.1,
		},
		bend: direction > 0 ? 0.3 : -0.3,
		padding,
	};
};

/**
 * @description Given a segment representing an arrow endpoints
 * and a polygon representing the enclosing space for the arrow,
 * create an arrow definition which goes from the start to the end point.
 * This arrow will bend slightly, a nice arrow has an upward bend in the path,
 * so depending on the direction of the arrow, the correct bend is calculated.
 * The polygon parameter is simply used as a reference scale so that a
 * nice-sized arrowhead may be calculated.
 * @param {[number, number][]} polygon an array of points, each an array of numbers
 * @param {[number, number][]} segment an array of two points, each an array of numbers
 * @param {{ vmax?: number, padding?: number }} options
 * @returns {Arrow} an arrow definition including a head but no tail.
 */
export const arrowFromSegmentInPolygon = (polygon, segment, options = {}) => {
	const vmax = options.vmax
		? options.vmax
		: Math.max(...(boundingBox(polygon)?.span || [1, 1]).slice(0, 2));
	return arrowFromSegment(segment, { ...options, vmax });
};

/**
 * @description Given a line representing the path of an arrow
 * and a polygon representing the enclosing space for the arrow,
 * clip the line inside the polygon and create an arrow definition which
 * travels from one point to the other point (in the direction of the line).
 * todo: that last claim needs testing.
 * This arrow will bend slightly, a nice arrow has an upward bend in the path,
 * so depending on the direction of the arrow, the correct bend is calculated.
 * The polygon parameter is also used as a reference scale so that a
 * nice-sized arrowhead may be calculated.
 * @param {[number, number][]} polygon
 * @param {VecLine2} line
 * @param {{ vmax?: number, padding?: number }} options
 * @returns {Arrow} an arrow definition including a head but no tail.
 */
export const arrowFromLine = (polygon, line, options) => {
	const segment = clipLineConvexPolygon(polygon, line)
	return segment === undefined
		? undefined
		: arrowFromSegmentInPolygon(polygon, segment, options)
};

/**
 * @description Given an origami model and a fold line, without knowing
 * any of the parameters that determined the fold line, find an arrow
 * that best fits the origami as a diagram step.
 * This is sufficient in many cases, but a more precise arrow can be
 * generated to more specifically match the paramters which created
 * the line, for example, axiom 2 can point from one point to the other.
 * @param {[number, number][]} polygon a convex polygon in 2D
 * @param {VecLine2} foldLine a line specifying the crease.
 * @param {{ vmax?: number, padding?: number }} options
 * @returns {Arrow} an arrow definition including a head but no tail.
 */
export const foldLineArrowInPolygon = (polygon, foldLine, options) => {
	const segment = perpendicularBalancedSegment(polygon, foldLine);
	if (segment === undefined) { return undefined; }
	return arrowFromSegmentInPolygon(polygon, segment, options);
};

/**
 * @description Given an origami model and a fold line, without knowing
 * any of the parameters that determined the fold line, find an arrow
 * that best fits the origami as a diagram step.
 * This is sufficient in many cases, but a more precise arrow can be
 * generated to more specifically match the paramters which created
 * the line, for example, axiom 2 can point from one point to the other.
 * @param {FOLD} graph a FOLD object
 * @param {VecLine2} foldLine a line specifying the crease.
 * @param {{ vmax?: number, padding?: number }} options
 * @returns {Arrow} an arrow definition including a head but no tail.
 */
export const foldLineArrow = ({ vertices_coords }, foldLine, options) => {
	const vertices_coords2 = vertices_coords.map(resize2);
	const hull = convexHull(vertices_coords2).map(v => vertices_coords2[v]);
	return foldLineArrowInPolygon(hull, foldLine, options);
};
