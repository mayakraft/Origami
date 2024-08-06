/**
 * Rabbit Ear (c) Kraft
 */
import { EPSILON } from "./constant.js";
import { exclude, includeL } from "./compare.js";
import { dot2, magSquared, cross2, subtract2, rotate90 } from "./vector.js";

/**
 * @description check if a point lies collinear along a line,
 * and specify if the line is a line/ray/segment and test whether
 * the point lies within endpoint(s).
 * @param {VecLine2} line a line in "vector" "origin" form
 * @param {[number, number]|[number, number, number]} point one 2D point
 * @parma {function} [lineDomain=includeL] the domain of the line
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {boolean} is the point collinear to the line,
 * and in the case of ray/segment,
 * does the point lie within the bounds of the ray/segment?
 */
export const overlapLinePoint = (
	{ vector, origin },
	point,
	lineDomain = includeL,
	epsilon = EPSILON,
) => {
	const p2p = subtract2(point, origin);
	const lineMagSq = magSquared(vector);
	const lineMag = Math.sqrt(lineMagSq);
	// the line is degenerate
	if (lineMag < epsilon) {
		return false;
	}
	/** @type {[number, number]} */
	const vecScaled = [vector[0] / lineMag, vector[1] / lineMag];
	const cross = cross2(p2p, vecScaled);
	const proj = dot2(p2p, vector) / lineMagSq;
	return Math.abs(cross) < epsilon && lineDomain(proj, epsilon / lineMag);
};

/**
 * @description Test if a point is inside a convex polygon.
 * @param {([number, number]|[number, number, number])[]} polygon
 * a polygon in array of array form
 * @param {[number, number]|[number, number, number]} point a point in array form
 * @param {function} polyDomain determines if the polygon boundary
 * is inclusive or exclusive
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {{ overlap: boolean, t: number[] }} an object with
 * - "overlap" {boolean}: true or false if the point is inside the polygon
 * - "t" {number[]}: the array of cross-product parameters of the point against
 *   every polygon's edge's vector. Can be used to trilaterate the point back
 *   into position.
 */
export const overlapConvexPolygonPoint = (
	polygon,
	point,
	polyDomain = exclude,
	epsilon = EPSILON,
) => {
	const t = polygon
		.map((p, i, arr) => [p, arr[(i + 1) % arr.length]])
		.map(([a, b]) => [subtract2(b, a), subtract2(point, a)])
		.map(([a, b]) => cross2(a, b));
	const sign = Math.sign(t.reduce((a, b) => a + b, 0));
	const overlap = t
		.map((n) => n * sign)
		.map((side) => polyDomain(side, epsilon))
		.map((s, _, arr) => s === arr[0])
		.reduce((prev, curr) => prev && curr, true);
	return { overlap, t };
};

/**
 * @description Find out if two convex polygons are overlapping by searching
 * for a dividing axis, which should be one side from one of the polygons.
 * This method is hard-coded to be exclusive, if two otherwise non-overlapping
 * polygons share an overlapping edge, the method will still count the
 * two polygons as not overlapping.
 * @param {[number, number][]} poly1 a polygon as an array of points
 * @param {[number, number][]} poly2 a polygon as an array of points
 * @param {number} [epsilon=1e-6] an optional epsilon
 */
export const overlapConvexPolygons = (poly1, poly2, epsilon = EPSILON) => {
	for (let p = 0; p < 2; p += 1) {
		// for non-overlapping convex polygons, it's possible that only only
		// one edge on one polygon holds the property of being a dividing axis.
		// we must run the algorithm on both polygons
		const polyA = p === 0 ? poly1 : poly2;
		const polyB = p === 0 ? poly2 : poly1;
		for (let i = 0; i < polyA.length; i += 1) {
			// each edge of polygonA will become a line
			const origin = polyA[i];
			const vector = rotate90(subtract2(polyA[(i + 1) % polyA.length], polyA[i]));
			// project each point from the other polygon on to the line's perpendicular
			// also, subtracting the origin (from the first poly) such that the
			// numberline is centered around zero. if the test passes, this polygon's
			// projections will be entirely above or below 0.
			const projected = polyB
				.map((point) => subtract2(point, origin))
				.map((v) => dot2(vector, v));
			// is the first polygon on the positive or negative side?
			const other_test_point = polyA[(i + 2) % polyA.length];
			const side_a = dot2(vector, subtract2(other_test_point, origin));
			const side = side_a > 0; // use 0. not epsilon
			// is the second polygon on whichever side of 0 that the first isn't?
			const one_sided = projected
				.map((dotProd) => (side ? dotProd < epsilon : dotProd > -epsilon))
				.reduce((a, b) => a && b, true);
			// if true, we found a dividing axis
			if (one_sided) {
				return false;
			}
		}
	}
	return true;
};

/**
 * @description Test if two axis-aligned bounding boxes overlap each other.
 * By default, the boundaries are treated as inclusive.
 * @param {Box} box1 an axis-aligned bounding box
 * @param {Box} box2 an axis-aligned bounding box
 * @param {number} [epsilon=1e-6] an optional epsilon,
 * positive value (default) is inclusive, negative is exclusive.
 * @returns {boolean} true if the bounding boxes overlap each other
 */
export const overlapBoundingBoxes = (box1, box2, epsilon = EPSILON) => {
	const dimensions = Math.min(box1.min.length, box2.min.length);
	for (let d = 0; d < dimensions; d += 1) {
		// if one minimum is above the other's maximum, or visa versa
		if (box1.min[d] > box2.max[d] + epsilon || box1.max[d] < box2.min[d] - epsilon) {
			return false;
		}
	}
	return true;
};
