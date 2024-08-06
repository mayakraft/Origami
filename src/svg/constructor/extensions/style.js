/* SVG (c) Kraft */
import NS from "../../spec/namespace.js";
import RabbitEarWindow from "../../environment/window.js";
import { makeCDATASection } from "../../general/cdata.js";

/**
 * Rabbit Ear (c) Kraft
 */

const styleDef = {
	style: {
		init: (parent, text) => {
			const el = RabbitEarWindow().document.createElementNS(NS, "style");
			el.setAttribute("type", "text/css");
			el.textContent = "";
			el.appendChild(makeCDATASection(text));
			return el;
		},
		methods: {
			setTextContent: (el, text) => {
				el.textContent = "";
				el.appendChild(makeCDATASection(text));
				return el;
			},
		},
	},
};

export { styleDef as default };
