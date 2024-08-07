/* SVG (c) Kraft */
import init from "./init.js";
import methods from "./methods.js";

/**
 * Rabbit Ear (c) Kraft
 */

const origamiDef = {
	origami: {
		nodeName: "g",
		init,
		args: () => [],
		methods,
	},
};

export { origamiDef as default };
