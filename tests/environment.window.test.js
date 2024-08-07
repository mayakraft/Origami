import { expect, test } from "vitest";
import xmldom from "@xmldom/xmldom";
import ear from "../src/index.js";
import window from "../src/environment/window.js";

ear.window = xmldom;

test("window, document methods", () => {
	expect(window).toBeDefined();
	expect(typeof window).toBe("function");

	expect(window().DOMImplementation).toBeDefined();
	expect(window().XMLSerializer).toBeDefined();
	expect(window().DOMParser).toBeDefined();
	expect(window().document).toBeDefined();
});

test("document methods", () => {
	const documentProtoMethods = [
		"insertBefore",
		"removeChild",
		"replaceChild",
		"importNode",
		"getElementById",
		"getElementsByClassName",
		"createElement",
		"createDocumentFragment",
		"createTextNode",
		"createComment",
		"createCDATASection",
		"createProcessingInstruction",
		"createAttribute",
		"createEntityReference",
		"createElementNS",
		"createAttributeNS",
		"constructor",
		"getElementsByTagName",
		"getElementsByTagNameNS",
	];

	const documentMethods = [
		// "documentURI",
		"ownerDocument",
		"implementation",
		"childNodes",
		"doctype",
		"firstChild",
		"lastChild",
		"_inc",
		"documentElement",
	];

	documentProtoMethods.forEach((name) => {
		expect(typeof window().document[name]).toBe("function");
		expect(window().document[name]).toBeDefined();
	});

	documentMethods.forEach((name) => {
		expect(window().document[name]).toBeDefined();
	});

	// as of today, these methods are not available.
	// if this test fails, it will be a great day!
	expect(window().document.evaluate).not.toBeDefined();
	expect(window().document.querySelector).not.toBeDefined();
});

/**
 * this works even when Rabbit Ear is built without SVG library,
 * and it uses svgMini instead.
 */
test("window, svg mini library", () => {
	// const svg = ear.svg();
	const p = ear.svg.path("M1 2L3 4L-5 6z");
	p.setAttribute("stroke", "red");
	expect(p.getAttribute("d")).toBe("M1 2L3 4L-5 6z");
	expect(p.getAttribute("stroke")).toBe("red");
});
/**
 * this ONLY WORKS when the SVG library is included.
 */
test("window, svg library", () => {
	const svg = ear.svg();
	const p = svg.path().Move(1, 2).Line(3, 4).Line(-5, 6).close().stroke("red");
	expect(p.getAttribute("d")).toBe("M1 2L3 4L-5 6z");
	expect(p.getAttribute("stroke")).toBe("red");
});
