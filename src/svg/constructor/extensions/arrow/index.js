/* SVG (c) Kraft */
import ArrowMethods from "./methods.js";
import init from "./init.js";

/**
 * Rabbit Ear (c) Kraft
 */

const arrowDef = {
	arrow: {
		nodeName: "g",
		attributes: [],
		args: () => [], // one function
		methods: ArrowMethods, // object of functions
		init,
	},
};

export { arrowDef as default };
