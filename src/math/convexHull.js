/**
 * Rabbit Ear (c) Kraft
 */
import { EPSILON } from "./constant.js";
import { epsilonCompare } from "./compare.js";
import { threePointTurnDirection } from "./radial.js";
import { normalize2, distance2, dot2, subtract2 } from "./vector.js";
import { clusterScalars } from "../general/cluster.js";

/**
 * @description mirror an array and join it at the end, except
 * do not duplicate the final element, it should only appear once.
 * @param {any[]} arr
 */
const mirrorArray = (arr) => arr.concat(arr.slice(0, -1).reverse());

/**
 * @description Sort and cluster a list of elements and return the first
 * cluster only. Because we are only getting the first, no other clusters
 * are constructed during the operation of this method. The sorting uses
 * a comparison function which returns -1,0,+1 for comparisons, and the first
 * cluster is the first group which among each other return 0, but compared
 * to every other item returns -1. The input array can be unsorted.
 * @param {any[]} elements an array of any objects
 * @param {function} comparison a function which accepts two paramters, type
 * matching the any[] parameter, which returns -1, 0, or +1.
 * @returns {number[]} an array of indices, indices of the "elements" array
 */
const minimumCluster = (elements, comparison) => {
	// find the set of all vectors that share the smallest X value within an epsilon
	let smallSet = [0];
	for (let i = 1; i < elements.length; i += 1) {
		switch (comparison(elements[smallSet[0]], elements[i])) {
			case 0:
				smallSet.push(i);
				break;
			case 1:
				smallSet = [i];
				break;
			default:
				break;
		}
	}
	return smallSet;
};

/**
 * @description Get the index of the point in an array
 * considered the absolute minimum. First check the X values,
 * and in the case of multiple minimums, check the Y values.
 * If there are more than two points that share both X and Y,
 * return the first one found.
 * @param {number[][]} points array of points
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {number|undefined} the index of the point in the array with
 * the smallest component values, or undefined if points is empty.
 */
const smallestVector2 = (points, epsilon = EPSILON) => {
	if (!points || !points.length) {
		return undefined;
	}
	// find the set of all points that share the smallest X value
	// const smallSet = smallestVectorSearch(points, 0, epsilonCompare, epsilon);
	// compare each point's x axis only
	const comparison = (a, b) => epsilonCompare(a[0], b[0], epsilon);
	const smallSet = minimumCluster(points, comparison);
	// from this set, find the point with the smallest Y value
	let sm = 0;
	for (let i = 1; i < smallSet.length; i += 1) {
		if (points[smallSet[i]][1] < points[smallSet[sm]][1]) {
			sm = i;
		}
	}
	return smallSet[sm];
};

/**
 * @description Locate the point with the lowest value in both axes,
 * making this the bottom-left-most point of the set, use this point
 * as the origin. Radially sort all other points around the lowest-
 * value point, while making clusters of similarly-angled points
 * (within an epsilon). Within these clusters of similarly-angled
 * points, the points are sorted by distance so the nearest point
 * appears first in the cluster array.
 * @param {[number, number][]} points an array of 2D points
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {number[][]} this returns indices in clusters.
 * @todo there is a wrap-around point where the cycle will not cluster
 * values which otherwise should be clustered.
 */
export const convexHullRadialSortPoints = (points, epsilon = EPSILON) => {
	const first = smallestVector2(points, epsilon);
	if (first === undefined) {
		return [];
	}
	const angles = points
		.map((p) => subtract2(p, points[first]))
		.map((v) => normalize2(v))
		.map((vec) => dot2([0, 1], vec));
	// .map((p, i) => Math.atan2(unitVecs[i][1], unitVecs[i][0]));
	const rawOrder = angles
		.map((a, i) => ({ a, i }))
		.sort((a, b) => a.a - b.a)
		.map((el) => el.i)
		.filter((i) => i !== first);

	// todo: can we use a cluster method that takes as input a pre-sorted list?
	return [[first]].concat(
		clusterScalars(
			rawOrder.map((i) => angles[i]),
			epsilon,
		)
			.map((arr) => arr.map((i) => rawOrder[i]))
			.map((cluster) =>
				cluster.length === 1
					? cluster
					: cluster
							.map((i) => ({ i, len: distance2(points[i], points[first]) }))
							.sort((a, b) => a.len - b.len)
							.map((el) => el.i),
			),
	);
};

/**
 * @description Convex hull from a set of 2D points, choose whether
 * to include or exclude points which lie collinear inside one of
 * the boundary lines. modified Graham scan algorithm.
 * @param {[number, number][]} points array of points, each point an array of numbers
 * @param {boolean} [includeCollinear=false] true will include
 * points collinear along the boundary
 * @param {number} [epsilon=1e-6] undefined behavior when larger than 0.01
 * @returns {number[]} not the points, but the indices
 * of points in your "points" array
 */
export const convexHull = (points = [], includeCollinear = false, epsilon = EPSILON) => {
	if (points.length < 2) {
		return [];
	}
	// if includeCollinear is true, we need to walk collinear points,
	// problem is we don't know if we should be going towards or away from
	// the origin point, so to work around that, make a mirror of all collinear
	// vertices so that it walks both directions, ie: 1,6,5,13,5,6,1.
	// half of them will be ignored due to being rejected from the
	// threePointTurnDirection call, and the correct half will be saved.
	const order = convexHullRadialSortPoints(points, epsilon)
		.map((arr) => (arr.length === 1 ? arr : mirrorArray(arr)))
		.flat();
	order.push(order[0]);
	const stack = [order[0]];
	let i = 1;
	// threePointTurnDirection returns -1,0,1, with 0 as the collinear case.
	// setup our operation for each case, depending on includeCollinear
	const funcs = {
		"-1": () => stack.pop(),
		1: (next) => {
			stack.push(next);
			i += 1;
		},
		undefined: () => {
			i += 1;
		},
	};
	funcs[0] = includeCollinear ? funcs["1"] : funcs["-1"];
	while (i < order.length) {
		if (stack.length < 2) {
			stack.push(order[i]);
			i += 1;
			continue;
		}
		const prev = stack[stack.length - 2];
		const curr = stack[stack.length - 1];
		const next = order[i];
		const pts = [prev, curr, next].map((j) => points[j]);
		const turn = threePointTurnDirection(pts[0], pts[1], pts[2], epsilon);
		funcs[turn](next);
	}
	stack.pop();
	return stack;
};

/**
 * @description Convex hull from a set of 2D points, choose whether
 * to include or exclude points which lie collinear inside one of
 * the boundary lines. modified Graham scan algorithm.
 * @param {number[][]} points array of points, each point an array of numbers
 * @param {boolean} [includeCollinear=false] true will include
 * points collinear along the boundary
 * @param {number} [epsilon=1e-6] undefined behavior when larger than 0.01
 * @returns {number[][]} the convex hull as a list of points,
 * where each point is an array of numbers
 */
// export const convexHullAsPoints = (points = [], includeCollinear = false, epsilon = EPSILON) => (
// 	convexHull(points, includeCollinear, epsilon)
// 		.map(i => points[i]));
