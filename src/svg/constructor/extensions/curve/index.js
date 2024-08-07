/* SVG (c) Kraft */
import curveArguments from "./arguments.js";
import curve_methods from "./methods.js";
import { str_path } from "../../../environment/strings.js";

/**
 * Rabbit Ear (c) Kraft
 */

const curveDef = {
	curve: {
		nodeName: str_path,
		attributes: ["d"],
		args: curveArguments, // one function
		methods: curve_methods, // object of functions
	},
};

export { curveDef as default };
