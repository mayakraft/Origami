/* SVG (c) Kraft */
import makeCoordinates from "./makeCoordinates.js";

/**
 * Rabbit Ear (c) Kraft
 */

/**
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @param {number} [padding=0]
 * @returns {string}
 */
const viewBoxValuesToString = function (x, y, width, height, padding = 0) {
	const scale = 1.0;
	const d = width / scale - width;
	const X = x - d - padding;
	const Y = y - d - padding;
	const W = width + d * 2 + padding * 2;
	const H = height + d * 2 + padding * 2;
	return [X, Y, W, H].join(" ");
};

/**
 * @returns {string | undefined}
 */
const makeViewBox = (...args) => {
	const nums = makeCoordinates(...args.flat());
	if (nums.length === 2) {
		nums.unshift(0, 0);
	}
	return nums.length === 4
		? viewBoxValuesToString(nums[0], nums[1], nums[2], nums[3])
		: undefined;
};

export { makeViewBox as default };
