import { expect, test } from "vitest";
import xmldom from "@xmldom/xmldom";
import ear from "../src/index.js";

ear.svg.window = xmldom;

const primitives = ["line", "circle", "ellipse", "rect", "polygon", "polyline", "text"];

const groupLevel = ["g"];

const defsLevel = ["style", "clipPath", "mask", "script"];

const rootLevel = [
	"defs",
	"style",
	// "clipPath", // conflict, clipPath is a constructor AND an assigner
	// "mask",
];

const customPrimitives = [
	"bezier",
	"wedge",
	"arc",
	"parabola",
	"regularPolygon",
	"arrow",
];

test("svg and group", () => {
	const svg = ear.svg();
	primitives.forEach((p) => expect(typeof svg[p]).toBe("function"));
	groupLevel.forEach((g) => expect(typeof svg[g]).toBe("function"));
	rootLevel.forEach((r) => expect(typeof svg[r]).toBe("function"));

	const group = ear.svg.g();
	primitives.forEach((p) => expect(typeof group[p]).toBe("function"));
	groupLevel.forEach((g) => expect(typeof group[g]).toBe("function"));
	rootLevel.forEach((r) => expect(typeof group[r]).not.toBe("function"));

	const defs = ear.svg.defs();
	// primitives.forEach(p => expect(typeof defs[p]).toBe("function"));
	// groupLevel.forEach(g => expect(typeof defs[g]).toBe("function"));
	// defsLevel.forEach(r => expect(typeof defs[r]).toBe("function"));
});
