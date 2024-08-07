/* SVG (c) Kraft */
import { str_string, str_id } from "../../../environment/strings.js";
import { toCamel } from "../../../general/string.js";

/**
 * Rabbit Ear (c) Kraft
 */

// for the clip-path and mask values. looks for the ID as a "url(#id-name)" string
const findIdURL = function (arg) {
	if (arg == null) {
		return "";
	}
	if (typeof arg === str_string) {
		return arg.slice(0, 3) === "url" ? arg : `url(#${arg})`;
	}
	if (arg.getAttribute != null) {
		const idString = arg.getAttribute(str_id);
		return `url(#${idString})`;
	}
	return "";
};

const methods = {};

// these do not represent the nodes that these methods are applied to
// every node gets these attribute-setting method (pointing to a mask)
["clip-path", "mask", "symbol", "marker-end", "marker-mid", "marker-start"].forEach(
	(attr) => {
		methods[toCamel(attr)] = (element, parent) => {
			element.setAttribute(attr, findIdURL(parent));
			return element;
		};
	},
);

export { methods as default };
