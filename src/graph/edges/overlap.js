/**
 * Rabbit Ear (c) Kraft
 */
import { EPSILON } from "../../math/constant.js";
import { epsilonEqual, excludeS } from "../../math/compare.js";
import { pointsToLine2 } from "../../math/convert.js";
import { resize2 } from "../../math/vector.js";
import { doRangesOverlap } from "../../math/range.js";
import { intersectLineLine } from "../../math/intersect.js";
import { sweepEdges } from "../sweep.js";

/**
 * @param {FOLD} graph a FOLD object
 */
const edgesSpanY2D = ({ vertices_coords, edges_vertices }, pad = 0) =>
	edges_vertices
		.map((verts) => verts.map((v) => vertices_coords[v]))
		.map(([a, b]) => [Math.min(a[1], b[1]) - pad, Math.max(a[1], b[1]) + pad])
		.map((range) =>
			epsilonEqual(range[0], range[1], Math.abs(pad * 2.5)) ? undefined : range,
		);

/**
 * @description
 * @param {FOLD} graph a FOLD object
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {boolean}
 */
export const doEdgesOverlap = (
	{ vertices_coords, edges_vertices },
	epsilon = EPSILON,
) => {
	const edgesYSpan = edgesSpanY2D({ vertices_coords, edges_vertices }, -epsilon);
	const vertices_coords2 = vertices_coords.map(resize2);
	const edges_line = edges_vertices
		.map((ev) => [vertices_coords2[ev[0]], vertices_coords2[ev[1]]])
		.map(([a, b]) => pointsToLine2(a, b));

	// currently overlapped edges
	const stack = [];
	const sweep = sweepEdges({ vertices_coords, edges_vertices });
	try {
		sweep.forEach(({ start, end }) => {
			start.forEach((e) => {
				stack[e] = true;
			});
			Object.keys(stack)
				.map((n) => parseInt(n, 10))
				.forEach((e0) =>
					start.forEach((e1) => {
						if (e0 === e1) {
							return;
						}
						if (
							edgesYSpan[e0] &&
							edgesYSpan[e1] &&
							!doRangesOverlap(edgesYSpan[e0], edgesYSpan[e1])
						) {
							return;
						}
						if (
							intersectLineLine(
								edges_line[e0],
								edges_line[e1],
								excludeS,
								excludeS,
								epsilon,
							).point
						) {
							throw new Error();
						}
					}),
				);
			end.forEach((e) => {
				delete stack[e];
			});
		});
	} catch (error) {
		return true;
	}
	return false;
};
