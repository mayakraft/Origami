/**
 * Rabbit Ear (c) Kraft
 */
import { EPSILON } from "./constant.js";
import { clampLine, clampSegment } from "./line.js";
import { arrayMinimumIndex } from "../general/array.js";
import {
	magSquared,
	distance,
	distance2,
	add,
	add2,
	subtract,
	subtract2,
	normalize2,
	dot,
	scale,
	scale2,
	resize,
} from "./vector.js";

/**
 * @description find the one point in an array of 2D points closest to a 2D point.
 * @param {[number, number][]} points an array of 2D points to test against
 * @param {[number, number]} point the 2D point to test nearness to
 * @returns {[number, number]} one point from the array of points
 */
export const nearestPoint2 = (points, point) => {
	// todo speed up with partitioning
	const index = arrayMinimumIndex(points, (el) => distance2(el, point));
	return index === undefined ? undefined : points[index];
};

/**
 * @description find the one point in an array of points closest to a point.
 * @param {number[][]} points an array of points to test against
 * @param {number[]} point the point to test nearness to
 * @returns {number[]} one point from the array of points
 */
export const nearestPoint = (points, point) => {
	// todo speed up with partitioning
	// const index = arrayMinimumIndex(points, point, distance);
	const index = arrayMinimumIndex(points, (el) => distance(el, point));
	return index === undefined ? undefined : points[index];
};

/**
 * @description find the nearest point on a line, ray, or segment.
 * @param {VecLine} line a line with a vector and origin
 * @param {[number, number]|[number, number, number]} point the point to test nearness to
 * @param {function} clampFunc a clamp function to bound a calculation between 0 and 1
 * for segments, greater than 0 for rays, or unbounded for lines.
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {[number, number]|[number, number, number]} a point
 */
export const nearestPointOnLine = (
	{ vector, origin },
	point,
	clampFunc = clampLine,
	epsilon = EPSILON,
) => {
	const originN = resize(vector.length, origin);
	const pointN = resize(vector.length, point);
	const magSq = magSquared(vector);
	const vectorToPoint = subtract(pointN, originN);
	const dotProd = dot(vector, vectorToPoint);
	const dist = dotProd / magSq;
	// clamp depending on line, ray, segment
	const d = clampFunc(dist, epsilon);
	const [a, b, c] = add(originN, scale(vector, d));
	return vector.length === 2 ? [a, b] : [a, b, c];
};

/**
 * @description given a polygon and a point, in 2D,
 * find a point on the boundary of the polygon
 * that is closest to the provided point.
 * @param {[number, number][]} polygon an array of points (which are arrays of numbers)
 * @param {[number, number]} point the point to test nearness to
 * @returns {object} a point
 * edge index matches vertices such that edge(N) = [vert(N), vert(N + 1)]
 */
export const nearestPointOnPolygon = (polygon, point) =>
	polygon
		.map((p, i, arr) => subtract2(arr[(i + 1) % arr.length], p))
		.map((vector, i) => ({ vector, origin: polygon[i] }))
		.map((line) => nearestPointOnLine(line, point, clampSegment))
		.map((p, edge) => ({ point: p, edge, distance: distance2(p, point) }))
		.sort((a, b) => a.distance - b.distance)
		.shift();

/**
 * @description find the nearest point on the boundary of a circle to another point
 * that is closest to the provided point.
 * @param {Circle} circle object with "radius" (number) and "origin" (number[])
 * @param {[number, number]} point the point to test nearness to
 * @returns {[number, number]} a point
 */
export const nearestPointOnCircle = ({ radius, origin }, point) =>
	add2(origin, scale2(normalize2(subtract2(point, origin)), radius));

// todo
// const nearestPointOnEllipse = () => false;
