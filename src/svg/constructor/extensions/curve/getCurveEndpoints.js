/* SVG (c) Kraft */
/**
 * Rabbit Ear (c) Kraft
 */
const getNumbersFromPathCommand = (str) =>
	str
		.slice(1)
		.split(/[, ]+/)
		.map((s) => parseFloat(s));

// this gets the parameter numbers, in an array
const getCurveTos = (d) =>
	d.match(/[Cc][(0-9), .-]+/).map((curve) => getNumbersFromPathCommand(curve));

const getMoveTos = (d) =>
	d.match(/[Mm][(0-9), .-]+/).map((curve) => getNumbersFromPathCommand(curve));

const getCurveEndpoints = (d) => {
	// get only the first Move and Curve commands
	const move = getMoveTos(d).shift();
	const curve = getCurveTos(d).shift();
	const start = move ? [move[move.length - 2], move[move.length - 1]] : [0, 0];
	const end = curve ? [curve[curve.length - 2], curve[curve.length - 1]] : [0, 0];
	return [...start, ...end];
};

export { getCurveEndpoints as default };
