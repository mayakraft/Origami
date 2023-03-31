/* svg (c) Kraft, MIT License */
import cssColors from './cssColors.js';
import * as convert from './convert.js';
import * as parseColor from './parseColor.js';

const colors = {
	cssColors,
	...convert,
	...parseColor,
};

export { colors as default };
