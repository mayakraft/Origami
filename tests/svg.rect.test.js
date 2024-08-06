import { expect, test } from "vitest";
import xmldom from "@xmldom/xmldom";
import ear from "../src/index.js";

ear.svg.window = xmldom;

test("rect", () => {
	const rect = ear.svg.rect(1, 2, 3, 4);
	expect(rect.getAttribute("x")).toBe("1");
	expect(rect.getAttribute("y")).toBe("2");
	expect(rect.getAttribute("width")).toBe("3");
	expect(rect.getAttribute("height")).toBe("4");

	const rect2 = ear.svg.rect(3, 4);
	expect(rect2.getAttribute("y") === null || rect2.getAttribute("y") === "").toBe(true);
	expect(rect2.getAttribute("y") === null || rect2.getAttribute("y") === "").toBe(true);
	expect(rect2.getAttribute("width")).toBe("3");
	expect(rect2.getAttribute("height")).toBe("4");
});

test("rect, args, negative width height", () => {
	const rect = ear.svg.rect(300, 200, -300, -200);
	expect(rect.getAttribute("x")).toBe("0");
	expect(rect.getAttribute("y")).toBe("0");
	expect(rect.getAttribute("width")).toBe("300");
	expect(rect.getAttribute("height")).toBe("200");
	const rect2 = ear.svg.rect(300, 200, -320, -220);
	expect(rect2.getAttribute("x")).toBe("-20");
	expect(rect2.getAttribute("y")).toBe("-20");
	expect(rect2.getAttribute("width")).toBe("320");
	expect(rect2.getAttribute("height")).toBe("220");
	const rect3 = ear.svg.rect(300, 200, 320, -220);
	expect(rect3.getAttribute("x")).toBe("300");
	expect(rect3.getAttribute("y")).toBe("-20");
	expect(rect3.getAttribute("width")).toBe("320");
	expect(rect3.getAttribute("height")).toBe("220");
	const rect4 = ear.svg.rect(300, 200, -320, 220);
	expect(rect4.getAttribute("x")).toBe("-20");
	expect(rect4.getAttribute("y")).toBe("200");
	expect(rect4.getAttribute("width")).toBe("320");
	expect(rect4.getAttribute("height")).toBe("220");
	const rect5 = ear.svg.rect(-320, -220);
	expect(rect5.getAttribute("x")).toBe("-320");
	expect(rect5.getAttribute("y")).toBe("-220");
	expect(rect5.getAttribute("width")).toBe("320");
	expect(rect5.getAttribute("height")).toBe("220");
	const rect6 = ear.svg.rect(-320, 220);
	expect(rect6.getAttribute("x")).toBe("-320");
	expect(rect6.getAttribute("y") === null || rect6.getAttribute("y") === "").toBe(true);
	expect(rect6.getAttribute("width")).toBe("320");
	expect(rect6.getAttribute("height")).toBe("220");
});
