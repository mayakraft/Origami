/* SVG (c) Kraft */
import NS from "../../spec/namespace.js";
import RabbitEarWindow from "../../environment/window.js";
import makeCoordinates from "../../arguments/makeCoordinates.js";
import { str_string } from "../../environment/strings.js";
import TransformMethods from "./shared/transforms.js";
import methods from "./shared/urls.js";
import { appendTo, setAttributes } from "./shared/dom.js";

/**
 * Rabbit Ear (c) Kraft
 */
/**
 * @description SVG text element
 * @memberof SVG
 * @linkcode SVG ./src/nodes/spec/text.js 11
 */
const textDef = {
	text: {
		// assuming people will at most supply coordinate (x,y,z) and text
		args: (a, b, c) => makeCoordinates(...[a, b, c].flat()).slice(0, 2),
		init: (parent, a, b, c, d) => {
			const element = RabbitEarWindow().document.createElementNS(NS, "text");
			const text = [a, b, c, d].filter((el) => typeof el === str_string).shift();
			element.appendChild(RabbitEarWindow().document.createTextNode(text || ""));
			return element;
		},
		methods: {
			...TransformMethods,
			...methods,
			appendTo,
			setAttributes,
		},
	},
};

export { textDef as default };
