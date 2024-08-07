import { expect, test } from "vitest";
import xmldom from "@xmldom/xmldom";
import ear from "../src/index.js";

ear.svg.window = xmldom;

test("circle arguments", () => {
	expect(ear.svg.circle(1).getAttribute("r")).toBe("1");
	expect(ear.svg.circle(5).getAttribute("r")).toBe("5");
	expect(ear.svg.circle(2, 3).getAttribute("cx")).toBe("2");
	expect(ear.svg.circle(2, 3).getAttribute("cy")).toBe("3");
	expect(
		ear.svg.circle(2, 3).getAttribute("r") === null ||
			ear.svg.circle(2, 3).getAttribute("r") === "",
	).toBe(true);

	expect(ear.svg.circle(1, 2, 3).getAttribute("cx")).toBe("1");
	expect(ear.svg.circle(1, 2, 3).getAttribute("cy")).toBe("2");
	expect(ear.svg.circle(1, 2, 3).getAttribute("r")).toBe("3");

	expect(parseFloat(ear.svg.circle(1, 2, 3, 4).getAttribute("r"))).toBeCloseTo(
		2 * Math.sqrt(2),
	);
	expect(ear.svg.circle(1, 2, 3, 4).getAttribute("cx")).toBe("1");
	expect(ear.svg.circle(1, 2, 3, 4).getAttribute("cy")).toBe("2");
});

test("circle setters", () => {
	expect(ear.svg.circle().radius(5).getAttribute("r")).toBe("5");
	expect(ear.svg.circle().setRadius(5).getAttribute("r")).toBe("5");
	expect(ear.svg.circle().origin(2, 3).getAttribute("cx")).toBe("2");
	expect(ear.svg.circle().origin(2, 3).getAttribute("cy")).toBe("3");
	expect(ear.svg.circle().setOrigin(2, 3).getAttribute("cx")).toBe("2");
	expect(ear.svg.circle().setOrigin(2, 3).getAttribute("cy")).toBe("3");
	expect(ear.svg.circle().center(2, 3).getAttribute("cx")).toBe("2");
	expect(ear.svg.circle().center(2, 3).getAttribute("cy")).toBe("3");
	expect(ear.svg.circle().setCenter(2, 3).getAttribute("cx")).toBe("2");
	expect(ear.svg.circle().setCenter(2, 3).getAttribute("cy")).toBe("3");
	expect(ear.svg.circle().position(2, 3).getAttribute("cx")).toBe("2");
	expect(ear.svg.circle().position(2, 3).getAttribute("cy")).toBe("3");
	expect(ear.svg.circle().setPosition(2, 3).getAttribute("cx")).toBe("2");
	expect(ear.svg.circle().setPosition(2, 3).getAttribute("cy")).toBe("3");

	const attrs = ["cx", "cy"];
	let c = ear.svg.circle();
	c.setCenter(1, 2, 3, 4);
	attrs.forEach((attr, i) => expect(c.getAttribute(attr)).toBe(String([1, 2][i])));
	expect(c.attributes.length).toBe(2);

	c.setRadius(10);
	attrs.forEach((attr, i) => expect(c.getAttribute(attr)).toBe(String([1, 2][i])));
	expect(c.getAttribute("r")).toBe("10");
	expect(c.attributes.length).toBe(3);
});
