/* SVG (c) Kraft */
import RabbitEarWindow from "../environment/window.js";

/**
 * Rabbit Ear (c) Kraft
 */

/**
 * @description Create a CDATASection containing text from the method
 * parameter. The CDATA is useful to wrap text which may contain
 * invalid characters or characters in need of escaping.
 * @param {string} text the text content to be placed inside the CData
 * @returns {CDATASection} a CDATA containing the given text.
 */
const makeCDATASection = (text) =>
	new (RabbitEarWindow().DOMParser)()
		.parseFromString("<root></root>", "text/xml")
		.createCDATASection(text);

export { makeCDATASection };
