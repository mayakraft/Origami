/* SVG (c) Kraft */
import arcPath from "../shared/makeArcPath.js";
import { str_path } from "../../../environment/strings.js";
import TransformMethods from "../shared/transforms.js";

/**
 * Rabbit Ear (c) Kraft
 */

const wedgeArguments = (a, b, c, d, e) => [arcPath(a, b, c, d, e, true)];

const wedgeDef = {
	wedge: {
		nodeName: str_path,
		args: wedgeArguments,
		attributes: ["d"],
		methods: {
			setArc: (el, ...args) => el.setAttribute("d", wedgeArguments(...args)),
			...TransformMethods,
		},
	},
};

export { wedgeDef as default };
