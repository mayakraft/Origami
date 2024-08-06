/* SVG (c) Kraft */
import { svg_polar_to_cart } from "../../../general/algebra.js";

/**
 * Rabbit Ear (c) Kraft
 */

const arcPath = (x, y, radius, startAngle, endAngle, includeCenter = false) => {
	if (endAngle == null) {
		return "";
	}
	const start = svg_polar_to_cart(startAngle, radius);
	const end = svg_polar_to_cart(endAngle, radius);
	const arcVec = [end[0] - start[0], end[1] - start[1]];
	const py = start[0] * end[1] - start[1] * end[0];
	const px = start[0] * end[0] + start[1] * end[1];
	const arcdir = Math.atan2(py, px) > 0 ? 0 : 1;
	let d = includeCenter
		? `M ${x},${y} l ${start[0]},${start[1]} `
		: `M ${x + start[0]},${y + start[1]} `;
	d += ["a ", radius, radius, 0, arcdir, 1, arcVec[0], arcVec[1]].join(" ");
	if (includeCenter) {
		d += " Z";
	}
	return d;
};

export { arcPath as default };
