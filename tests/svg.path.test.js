import { expect, test } from "vitest";
import xmldom from "@xmldom/xmldom";
import ear from "../src/index.js";

ear.svg.window = xmldom;

test("path", () => {
	const p = ear.svg.path();
	p.Move(20, 20);
	expect(p.getAttribute("d")).toBe("M20 20");
	p.line(50, 50);
	expect(p.getAttribute("d")).toBe("M20 20l50 50");
	p.vertical(30);
	expect(p.getAttribute("d")).toBe("M20 20l50 50v30");
	p.Curve(50, 0, 0, 50, 10, 10);
	expect(p.getAttribute("d")).toBe("M20 20l50 50v30C50 0 0 50 10 10");
	p.clear();
	// specification around getAttribute when it doesn't exist is "" or null
	expect(p.getAttribute("d") === "" || p.getAttribute("d") === null).toBe(true);
});

const path_commands = [
	"m", // move
	"l", // line
	"v", // vertical
	"h", // horizontal
	"a", // ellipse
	"c", // curve
	"s", // smoothCurve
	"q", // quadCurve
	"t", // smoothQuadCurve
	"z", // close
];

test("path init from args", () => {
	const pathString = "M20 40V60l10 10";
	expect(ear.svg.path(pathString).getAttribute("d")).toBe(pathString);
	//  expect(ear.svg.path({command:"M", values: [20, 40]}).getAttribute("d")).toBe("M20 40");
});

test("path commands", () => {
	const pathString = "M20 40V60l10 10";
	const path = ear.svg.path(pathString);
	path.Line(50, 50);
	expect(path.getAttribute("d")).toBe(`${pathString}L50 50`);

	const commands = path.getCommands();
	const expected = [
		{ command: "M", values: [20, 40] },
		{ command: "V", values: [60] },
		{ command: "l", values: [10, 10] },
		{ command: "L", values: [50, 50] },
	];
	expected.forEach((el, i) => {
		expect(commands[i].command).toBe(expected[i].command);
		expect(JSON.stringify(commands[i].values)).toBe(JSON.stringify(expected[i].values));
	});

	// path.add("H20V60");
	// expect(path.getAttribute("d")).toBe(pathString + "L50 50" + "H20V60");

	// path.set("H20V60");
	// expect(path.getAttribute("d")).toBe("H20V60");
});

test("path commands", () => {
	const path = ear.svg.path("M50 50h200");
	expect(path.getD()).toBe("M50 50h200");
	const path2 = ear.svg.path();
	expect(path2.getD()).toBe("");
});

test("path commands", () => {
	const path = ear.svg.path("M50 50");
	path.addCommand("L", 100, 100);
	expect(path.getAttribute("d")).toBe("M50 50L100 100");
	path.appendCommand("V", 66);
	expect(path.getAttribute("d")).toBe("M50 50L100 100V66");
	path.clear();
	expect(path.getAttribute("d") === null || path.getAttribute("d") === "").toBe(true);
});

// test("bezier", () => {
//   let bez = ear.svg.bezier(0, 0, 25, 75, 75, 25, 100, 100);
//   const d = Array.from(bez.attributes).filter(a => a.nodeName === "d").shift();
//   expect(d.nodeValue).toBe("M 0,0 C 25,75 75,25 100,100");
//   bez.setBezier(0, 0, 100, 0, 100, 100, 0, 100);
//   const d2 = Array.from(bez.attributes).filter(a => a.nodeName === "d").shift();
//   expect(d2.nodeValue).toBe("M 0,0 C 100,0 100,100 0,100");
//   expect(true).toBe(true);
// });
