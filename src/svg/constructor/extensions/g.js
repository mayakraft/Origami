/* SVG (c) Kraft */
import "../../environment/window.js";
import TransformMethods from "./shared/transforms.js";
import methods from "./shared/urls.js";
import * as dom from "./shared/dom.js";

/**
 * Rabbit Ear (c) Kraft
 */

const gDef = {
	g: {
		// init,
		methods: {
			// load: loadGroup,
			...TransformMethods,
			...methods,
			...dom,
		},
	},
};

export { gDef as default };
