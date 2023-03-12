/* svg (c) Kraft, MIT License */
import { str_arrow, str_tail, str_head, str_path, str_style, str_stroke, str_none, str_object } from '../../../environment/strings.js';
import NS from '../../../spec/namespace.js';
import SVGWindow from '../../../environment/window.js';
import ArrowMethods from './methods.js';
import { makeArrowOptions } from './options.js';

const arrowKeys = Object.keys(makeArrowOptions());
const matchingOptions = (...args) => {
	for (let a = 0; a < args.length; a += 1) {
		if (typeof args[a] !== str_object) { continue; }
		const keys = Object.keys(args[a]);
		for (let i = 0; i < keys.length; i += 1) {
			if (arrowKeys.includes(keys[i])) {
				return args[a];
			}
		}
	}
	return undefined;
};
const init = function (element, ...args) {
	element.classList.add(str_arrow);
	const paths = ["line", str_tail, str_head].map(key => {
		const path = SVGWindow().document.createElementNS(NS, str_path);
		path.className = `${str_arrow}-${key}`;
		element.appendChild(path);
		return path;
	});
	paths[0].setAttribute(str_style, "fill:none;");
	paths[1].setAttribute(str_stroke, str_none);
	paths[2].setAttribute(str_stroke, str_none);
	element.options = makeArrowOptions();
	ArrowMethods.setPoints(element, ...args);
	const options = matchingOptions(...args);
	if (options) {
		Object.keys(options)
			.filter(key => ArrowMethods[key])
			.forEach(key => ArrowMethods[key](element, options[key]));
	}
	return element;
};

export { init as default };