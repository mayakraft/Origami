/**
 * Rabbit Ear (c) Kraft
 */
import { EPSILON } from "./constant.js";
import {
	magnitude2,
	magnitude3,
	dot2,
	dot3,
	scale2,
	scale3,
	distance2,
	distance3,
	add2,
	add3,
	subtract2,
	subtract3,
} from "./vector.js";

/**
 * @description Given a point has known distances to three triangle points,
 * and given the location of that triangle's points in space, find the
 * location of the point in space. This method works for 2D faces and points.
 * https://stackoverflow.com/questions/9747227/2d-trilateration
 * @param {[[number, number], [number, number], [number, number]]} pts
 * three 2D triangle points
 * @param {[number, number, number]} radii three distances to each of the triangle points
 * @returns {[number, number] | undefined} the 2D location of the point
 * inside the triangle, undefined if bad inputs.
 */
export const trilateration2 = (pts, radii) => {
	if (pts[0] === undefined || pts[1] === undefined || pts[2] === undefined) {
		return undefined;
	}
	const ex = scale2(subtract2(pts[1], pts[0]), 1 / distance2(pts[1], pts[0]));
	const i = dot2(ex, subtract2(pts[2], pts[0]));
	const exi = scale2(ex, i);
	const p2p0exi = subtract2(subtract2(pts[2], pts[0]), exi);
	const ey = scale2(p2p0exi, 1 / magnitude2(p2p0exi));
	const d = distance2(pts[1], pts[0]);
	const j = dot2(ey, subtract2(pts[2], pts[0]));
	const x = (radii[0] ** 2 - radii[1] ** 2 + d ** 2) / (2 * d);
	const y = (radii[0] ** 2 - radii[2] ** 2 + i ** 2 + j ** 2) / (2 * j) - (i * x) / j;
	return add2(add2(pts[0], scale2(ex, x)), scale2(ey, y));
};

/**
 * @description Given a point has known distances to three triangle points,
 * and given the location of that triangle's points in space, find the
 * location of the point in space. This method works for 3D faces and points.
 * https://stackoverflow.com/questions/9747227/2d-trilateration
 * @param {[[number, number, number], [number, number, number], [number, number, number]]} pts
 * three 3D triangle points
 * @param {[number, number, number]} radii three distances to each of the triangle points
 * @returns {[number, number, number] | undefined} the 3D location of the point
 * inside the triangle, undefined if bad inputs.
 */
export const trilateration3 = (pts, radii) => {
	if (pts[0] === undefined || pts[1] === undefined || pts[2] === undefined) {
		return undefined;
	}
	const ex = scale3(subtract3(pts[1], pts[0]), 1 / distance3(pts[1], pts[0]));
	const i = dot3(ex, subtract3(pts[2], pts[0]));
	const exi = scale3(ex, i);
	const p2p0exi = subtract3(subtract3(pts[2], pts[0]), exi);
	const ey = scale3(p2p0exi, 1 / magnitude3(p2p0exi));
	const d = distance3(pts[1], pts[0]);
	const j = dot3(ey, subtract3(pts[2], pts[0]));
	const x = (radii[0] ** 2 - radii[1] ** 2 + d ** 2) / (2 * d);
	const y = (radii[0] ** 2 - radii[2] ** 2 + i ** 2 + j ** 2) / (2 * j) - (i * x) / j;
	return add3(add3(pts[0], scale3(ex, x)), scale3(ey, y));
};

/**
 * @description Calculates the circumcircle with a boundary that
 * lies on three points provided by the user.
 * @param {[number, number]} a one 2D point as an array of numbers
 * @param {[number, number]} b one 2D point as an array of numbers
 * @param {[number, number]} c one 2D point as an array of numbers
 * @returns {Circle} a circle in "radius" (number) "origin" (number[]) form
 */
export const circumcircle = (a, b, c) => {
	const A = b[0] - a[0];
	const B = b[1] - a[1];
	const C = c[0] - a[0];
	const D = c[1] - a[1];
	const E = A * (a[0] + b[0]) + B * (a[1] + b[1]);
	const F = C * (a[0] + c[0]) + D * (a[1] + c[1]);
	const G = 2 * (A * (c[1] - b[1]) - B * (c[0] - b[0]));
	if (Math.abs(G) < EPSILON) {
		const minx = Math.min(a[0], b[0], c[0]);
		const miny = Math.min(a[1], b[1], c[1]);
		const dx = (Math.max(a[0], b[0], c[0]) - minx) * 0.5;
		const dy = (Math.max(a[1], b[1], c[1]) - miny) * 0.5;
		return {
			origin: [minx + dx, miny + dy],
			radius: Math.sqrt(dx * dx + dy * dy),
		};
	}
	/** @type {[number, number]} */
	const origin = [(D * E - B * F) / G, (A * F - C * E) / G];
	const dx = origin[0] - a[0];
	const dy = origin[1] - a[1];
	return {
		origin,
		radius: Math.sqrt(dx * dx + dy * dy),
	};
};
