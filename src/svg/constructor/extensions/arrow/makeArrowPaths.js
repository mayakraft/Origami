/* SVG (c) Kraft */
import { str_tail, str_head } from "../../../environment/strings.js";
import {
	svg_sub2,
	svg_add2,
	svg_scale2,
	svg_magnitude2,
} from "../../../general/algebra.js";

/**
 * Rabbit Ear (c) Kraft
 */

const ends = [str_tail, str_head];
const stringifyPoint = (p) => p.join(",");
const pointsToPath = (points) => "M" + points.map((pt) => pt.join(",")).join("L") + "Z";

/**
 * @description
 * @param {{
 *   points: [number, number, number, number],
 *   padding: number,
 *   bend: number,
 *   pinch: number,
 * }} options
 */
const makeArrowPaths = (options) => {
	// throughout, tail is 0, head is 1
	/** @type {[[number, number], [number, number]]} */
	let pts = [
		[options.points[0] || 0, options.points[1] || 0],
		[options.points[2] || 0, options.points[3] || 0],
	];
	let vector = svg_sub2(pts[1], pts[0]);
	let midpoint = svg_add2(pts[0], svg_scale2(vector, 0.5));
	// make sure arrow isn't too small
	const len = svg_magnitude2(vector);
	const minLength = ends
		.map((s) =>
			options[s].visible ? (1 + options[s].padding) * options[s].height * 2.5 : 0,
		)
		.reduce((a, b) => a + b, 0);
	if (len < minLength) {
		// check len === exactly 0. don't compare to epsilon here
		/** @type {[number, number]} */
		const minVec = len === 0 ? [minLength, 0] : svg_scale2(vector, minLength / len);
		// pts = [svg_sub2, svg_add2].map(f => f(midpoint, svg_scale2(minVec, 0.5)));
		pts = [
			svg_sub2(midpoint, svg_scale2(minVec, 0.5)),
			svg_add2(midpoint, svg_scale2(minVec, 0.5)),
		];
		vector = svg_sub2(pts[1], pts[0]);
	}
	/** @type {[number, number]} */
	let perpendicular = [vector[1], -vector[0]];
	let bezPoint = svg_add2(midpoint, svg_scale2(perpendicular, options.bend));
	const bezs = pts.map((pt) => svg_sub2(bezPoint, pt));
	const bezsLen = bezs.map((v) => svg_magnitude2(v));
	const bezsNorm = bezs.map((bez, i) =>
		bezsLen[i] === 0 ? bez : svg_scale2(bez, 1 / bezsLen[i]),
	);
	const vectors = bezsNorm.map((norm) => svg_scale2(norm, -1));
	/** @type {[[number, number], [number, number]]} */
	const normals = [
		[vectors[0][1], -vectors[0][0]],
		[vectors[1][1], -vectors[1][0]],
	];
	// get padding from either head/tail options or root of options
	const pad = ends.map((s, i) =>
		options[s].padding ? options[s].padding : options.padding ? options.padding : 0.0,
	);
	const scales = ends
		.map((s, i) => options[s].height * (options[s].visible ? 1 : 0))
		.map((n, i) => n + pad[i]);
	// .map((s, i) => options[s].height * ((options[s].visible ? 1 : 0) + pad[i]));
	const arcs = pts.map((pt, i) => svg_add2(pt, svg_scale2(bezsNorm[i], scales[i])));
	// readjust bezier curve now that the arrow heads push inwards
	vector = svg_sub2(arcs[1], arcs[0]);
	perpendicular = [vector[1], -vector[0]];
	midpoint = svg_add2(arcs[0], svg_scale2(vector, 0.5));
	bezPoint = svg_add2(midpoint, svg_scale2(perpendicular, options.bend));
	// done adjust
	const controls = arcs.map((arc, i) =>
		svg_add2(arc, svg_scale2(svg_sub2(bezPoint, arc), options.pinch)),
	);
	const polyPoints = ends.map((s, i) => [
		svg_add2(arcs[i], svg_scale2(vectors[i], options[s].height)),
		svg_add2(arcs[i], svg_scale2(normals[i], options[s].width / 2)),
		svg_add2(arcs[i], svg_scale2(normals[i], -options[s].width / 2)),
	]);
	return {
		line: `M${stringifyPoint(arcs[0])}C${stringifyPoint(controls[0])},${stringifyPoint(controls[1])},${stringifyPoint(arcs[1])}`,
		tail: pointsToPath(polyPoints[0]),
		head: pointsToPath(polyPoints[1]),
	};
};

export { makeArrowPaths as default };
