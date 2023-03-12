/* svg (c) Kraft, MIT License */
import makeCoordinates from './makeCoordinates.js';

const viewBoxValuesToString = function (x, y, width, height, padding = 0) {
	const scale = 1.0;
	const d = (width / scale) - width;
	const X = (x - d) - padding;
	const Y = (y - d) - padding;
	const W = (width + d * 2) + padding * 2;
	const H = (height + d * 2) + padding * 2;
	return [X, Y, W, H].join(" ");
};
const makeViewBox = (...args) => {
	const numbers = makeCoordinates(...args.flat());
	if (numbers.length === 2) { numbers.unshift(0, 0); }
	return numbers.length === 4 ? viewBoxValuesToString(...numbers) : undefined;
};

export { makeViewBox as default };
