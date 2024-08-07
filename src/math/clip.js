/**
 * Rabbit Ear (c) Kraft
 */
import { EPSILON } from "./constant.js";
import { include, includeL } from "./compare.js";
import { magnitude2, cross2, add2, subtract2, scale2 } from "./vector.js";
import { intersectPolygonLine } from "./intersect.js";
import { overlapConvexPolygonPoint } from "./overlap.js";

/**
 * @description Given a list of sorted numbers and a domain function which
 * returns true for positive numbers and can customize its behavior around
 * the epsilon space around include, walk two indices from either ends
 * of the array inwards until the domain function passes true when we pass
 * in the difference between this index's value and the neighbor index's value.
 * @param {number[]} numbers
 * @param {Function} [func=include]
 * @param {number} [scaled_epsilon=1e-6]
 * @returns {[number, number]} a pair of numbers
 */
const getMinMax = (numbers, func, scaled_epsilon) => {
	if (numbers.length < 2) {
		return undefined;
	}
	let a = 0;
	let b = numbers.length - 1;
	while (a < b) {
		if (func(numbers[a + 1] - numbers[a], scaled_epsilon)) {
			break;
		}
		a += 1;
	}
	while (b > a) {
		if (func(numbers[b] - numbers[b - 1], scaled_epsilon)) {
			break;
		}
		b -= 1;
	}
	if (a >= b) {
		return undefined;
	}
	return [numbers[a], numbers[b]];
};

/**
 * @description find the overlap between one line and one convex polygon and
 * clip the line into a segment (two endpoints) or return undefined if no overlap.
 * The input line can be a line, ray, or segment, as determined by "fnLine".
 * @param {[number, number][]} poly array of points (which are arrays of numbers)
 * @param {VecLine2} line a line in "vector" "origin" form
 * @param {function} [fnPoly=include] include or exclude polygon boundary in clip
 * @param {function} [fnLine=includeL] function to determine line/ray/segment,
 * and inclusive or exclusive.
 * @param {number} [epsilon=1e-6] optional epsilon
 */
export const clipLineConvexPolygon = (
	poly,
	{ vector, origin },
	fnPoly = include,
	fnLine = includeL,
	epsilon = EPSILON,
) => {
	// clip the polygon with an infinite line, the actual line domain
	// function will be used later to clip these paramterization results.
	const numbers = intersectPolygonLine(poly, { vector, origin }, includeL, epsilon).map(
		({ a }) => a,
	);
	if (numbers.length < 2) {
		return undefined;
	}
	const scaled_epsilon = (epsilon * 2) / magnitude2(vector);
	// ends is now an array, length 2, of the min and max parameter on the line
	// this also verifies the two intersections are not the same point
	const ends = getMinMax(numbers, fnPoly, scaled_epsilon);
	if (ends === undefined) {
		return undefined;
	}
	// ends_clip is the intersection between 2 domains, the result
	// and the valid inclusive/exclusive function
	// todo: this line hardcodes the parameterization that segments and rays are cropping
	// their lowest point at 0 and highest (if segment) at 1
	/** @param {number} t */
	const clip_fn = (t) => {
		if (fnLine(t)) {
			return t;
		}
		return t < 0.5 ? 0 : 1;
	};
	const ends_clip = ends.map(clip_fn);
	// if endpoints are the same, exit
	if (Math.abs(ends_clip[0] - ends_clip[1]) < (epsilon * 2) / magnitude2(vector)) {
		return undefined;
	}
	// test if the solution is collinear to an edge by getting the segment midpoint
	// then test inclusive or exclusive depending on user parameter
	// const mid = paramToPoint(vector, origin, (ends_clip[0] + ends_clip[1]) / 2);
	const mid = add2(origin, scale2(vector, (ends_clip[0] + ends_clip[1]) / 2));
	return overlapConvexPolygonPoint(poly, mid, fnPoly, epsilon).overlap
		? ends_clip.map((t) => add2(origin, scale2(vector, t)))
		: undefined;
};

/**
 * @description Clip two 2D polygons and return their intersection. This works
 * for non-convex poylgons, but both polygons must have counter-clockwise
 * winding; will not work even if both are similarly-clockwise.
 * Sutherland-Hodgman algorithm.
 * Implementation is from Rosetta Code, refactored to incorporate an epsilon
 * to specify inclusivity around the edges.
 * @attribution https://rosettacode.org/wiki/Sutherland-Hodgman_polygon_clipping#JavaScript
 * @param {number[][]} polygon1 an array of points, where each point
 * is an array of numbers.
 * @param {number[][]} polygon2 an array of points, where each point
 * is an array of numbers.
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {number[][]} a polygon as an array of points.
 */
export const clipPolygonPolygon = (polygon1, polygon2, epsilon = EPSILON) => {
	const inside = (p, cp1, cp2) =>
		(cp2[0] - cp1[0]) * (p[1] - cp1[1]) > (cp2[1] - cp1[1]) * (p[0] - cp1[0]) + epsilon;
	const intersection = (cp1, cp2, e, s) => {
		const dc = subtract2(cp1, cp2);
		const dp = subtract2(s, e);
		const n1 = cross2(cp1, cp2);
		const n2 = cross2(s, e);
		const n3 = 1.0 / cross2(dc, dp);
		return scale2(subtract2(scale2(dp, n1), scale2(dc, n2)), n3);
	};
	let outputList = polygon1;
	let cp1 = polygon2[polygon2.length - 1];
	for (let j = 0; j < polygon2.length; j += 1) {
		const cp2 = polygon2[j];
		const inputList = outputList;
		outputList = [];
		let s = inputList[inputList.length - 1];
		for (let i = 0; i < inputList.length; i += 1) {
			const e = inputList[i];
			if (inside(e, cp1, cp2)) {
				if (!inside(s, cp1, cp2)) {
					outputList.push(intersection(cp1, cp2, e, s));
				}
				outputList.push(e);
			} else if (inside(s, cp1, cp2)) {
				outputList.push(intersection(cp1, cp2, e, s));
			}
			s = e;
		}
		cp1 = cp2;
	}
	return outputList.length === 0 ? undefined : outputList;
};
