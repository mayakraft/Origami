/**
 * Rabbit Ear (c) Kraft
 */
import window from "../../environment/window.js";
import { getRootParent } from "../../svg/general/dom.js";

/**
 * @description Convert a style element, CSSStyleSheet, into a nested
 * object with selectors as keys, then attributes as 2nd layer keys.
 * @param {CSSStyleSheet} sheet the "sheet" property on a style element
 * @returns {object} dictionary representation of a style element
 */
export const parseCSSStyleSheet = (sheet) => {
	if (!sheet.cssRules) {
		return {};
	}
	const stylesheets = {};
	// convert the array of type {CSSRule[]} to an object
	// with the key:value being the key and the contents of that rule.
	for (let i = 0; i < sheet.cssRules.length; i += 1) {
		const cssRules = sheet.cssRules[i];
		if (cssRules.constructor.name !== "CSSStyleRule") {
			continue;
		}
		/** @type {any} CSSStyleRule */
		const cssStyleRule = cssRules;
		// if (cssRules.type !== 1) { continue; }
		const selectorList = cssStyleRule.selectorText
			.split(/,/gm)
			.filter(Boolean)
			.map((str) => str.trim());
		const style = {};
		Object.values(cssStyleRule.style).forEach((key) => {
			style[key] = cssStyleRule.style[key];
		});
		selectorList.forEach((selector) => {
			stylesheets[selector] = style;
		});
	}
	return stylesheets;
};

/**
 * @description This is a very strange function, and it's all because
 * of a very strange quirk that CSSStyleSheet property does not exist
 * on a node *which is not bound to the window.document*
 * (ie: converted from XML string), but it does exist if it is.
 * So, we detect if this is the case, quickly append it to the body,
 * process the style sheets, then remove it from the DOM.
 * @param {SVGStyleElement} style the SVG style DOM element
 * @returns {object[]} style sheets as objects, with CSS selectors as
 * keys, for example: { ".redline": { "stroke-width": "0.5" } }.
 */
export const parseStyleElement = (style) => {
	/** @type {CSSStyleSheet|undefined} */
	const styleSheet = "sheet" in style ? style.sheet : undefined;
	if (styleSheet) {
		return parseCSSStyleSheet(styleSheet);
	}
	const rootParent = getRootParent(style);
	const isHTMLBound = rootParent.constructor === window().HTMLDocument;
	if (!isHTMLBound) {
		// remove style from parent. append to document.body
		const prevParent = style.parentNode;
		if (prevParent != null) {
			prevParent.removeChild(style);
		}
		const body =
			window().document.body != null
				? window().document.body
				: window().document.createElement("body");
		body.appendChild(style);
		// parse style sheet.
		const parsedStyle = parseCSSStyleSheet(styleSheet);
		// remove style from document.body. append to previous parent
		body.removeChild(style);
		if (prevParent != null) {
			prevParent.appendChild(style);
		}
		return parsedStyle;
	}
	return [];
};

/**
 * @description Given one or many parsed stylesheets, hunt for a match based
 * on nodeName selector, id selector, or class selector, and return the value
 * for one attribute if it exists. So for example, you need "stroke" and this
 * will search for a "stroke" property defined on line, .className, or #id.
 */
export const getStylesheetStyle = (key, nodeName, attributes, sheets = []) => {
	const classes = attributes.class
		? attributes.class
				.split(/\s/)
				.filter(Boolean)
				.map((i) => i.trim())
				.map((str) => `.${str}`)
		: [];
	const id = attributes.id ? `#${attributes.id}` : null;
	// look for a matching id in the style sheets
	if (id) {
		for (let s = 0; s < sheets.length; s += 1) {
			if (sheets[s][id] && sheets[s][id][key]) {
				return sheets[s][id][key];
			}
		}
	}
	// look for a matching class in the style sheets
	for (let s = 0; s < sheets.length; s += 1) {
		for (let c = 0; c < classes.length; c += 1) {
			if (sheets[s][classes[c]] && sheets[s][classes[c]][key]) {
				return sheets[s][classes[c]][key];
			}
		}
		if (sheets[s][nodeName] && sheets[s][nodeName][key]) {
			return sheets[s][nodeName][key];
		}
	}
	return undefined;
};
