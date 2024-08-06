import { expect, test } from "vitest";
import xmldom from "@xmldom/xmldom";
import ear from "../src/index.js";

ear.svg.window = xmldom;

test("svg and group", () => {
	const svg = ear.svg();
	svg.appendChild(ear.svg.g());
	expect(svg.childNodes.length).toBe(1);
});

test("all primitives", () => {
	const group = ear.svg.g();
	group.appendChild(ear.svg.line(0, 1, 2, 3));
	group.appendChild(ear.svg.rect(0, 1, 2, 3));
	group.appendChild(ear.svg.circle(0, 1, 2));
	group.appendChild(ear.svg.ellipse(0, 1, 2));
	group.appendChild(
		ear.svg.polygon([
			[0, 1],
			[2, 3],
			[4, 5],
		]),
	);
	group.appendChild(
		ear.svg.polyline([
			[0, 1],
			[2, 3],
			[4, 5],
		]),
	);
	group.appendChild(ear.svg.text("abc", 0, 1));
	const nodeNames = ["line", "rect", "circle", "ellipse", "polygon", "polyline", "text"];
	Array.from(group.childNodes).forEach((el, i) => {
		expect(el.nodeName).toBe(nodeNames[i]);
	});
	expect(group.childNodes.length).toBe(7);
});

test("init from SVG", () => {
	const svg = ear.svg();
	svg.line(0, 1, 2, 3);
	svg.rect(0, 1, 2, 3);
	svg.circle(0, 1, 2);
	svg.ellipse(0, 1, 2);
	svg.polygon([
		[0, 1],
		[2, 3],
		[4, 5],
	]);
	svg.polyline([
		[0, 1],
		[2, 3],
		[4, 5],
	]);
	svg.text("abc", 0, 1);
	const nodeNames = ["line", "rect", "circle", "ellipse", "polygon", "polyline", "text"];
	Array.from(svg.childNodes).forEach((el, i) => {
		expect(el.nodeName).toBe(nodeNames[i]);
	});
	expect(svg.childNodes.length).toBe(7);
});

test("method chaining", () => {
	const svg = ear.svg();
	expect(svg.line().setPoints(1, 2, 3, 4).getAttribute("x1")).toBe("1");
	expect(svg.rect().setSize(3, 4).setOrigin(1, 2).getAttribute("width")).toBe("3");
	expect(svg.circle().setCenter(3, 4).getAttribute("cx")).toBe("3");
	expect(svg.ellipse().setRadius(1, 2).getAttribute("rx")).toBe("1");
	expect(svg.polygon().setPoints(1, 2, 3, 4).getAttribute("points")).toBe("1,2 3,4");
	expect(svg.polyline().setPoints(1, 2, 3, 4).getAttribute("points")).toBe("1,2 3,4");
	// expect(svg.text().setPoints(1, 2, 3, 4).getAttribute("x")).toBe("1")
});

test("primitives, argument order", () => {
	const line0 = ear.svg.line();
	const line1 = ear.svg.line(1);
	const line2 = ear.svg.line(1, 2);
	const line3 = ear.svg.line(1, 2, 3);
	const line4 = ear.svg.line(1, 2, 3, 4);
	expect(line0.getAttribute("x1") === null || line0.getAttribute("x1") === "").toBe(true);
	expect(line1.getAttribute("x1") === null || line1.getAttribute("x1") === "").toBe(
		false,
	);
	expect(line1.getAttribute("y1") === null || line1.getAttribute("y1") === "").toBe(true);
	expect(line2.getAttribute("y1") === null || line2.getAttribute("y1") === "").toBe(
		false,
	);
	expect(line2.getAttribute("x2") === null || line2.getAttribute("x2") === "").toBe(true);
	expect(line3.getAttribute("x2") === null || line3.getAttribute("x2") === "").toBe(
		false,
	);
	expect(line3.getAttribute("y2") === null || line3.getAttribute("y2") === "").toBe(true);
	expect(line4.getAttribute("y2") === null || line4.getAttribute("y2") === "").toBe(
		false,
	);

	const rect0 = ear.svg.rect();
	const rect1 = ear.svg.rect(1);
	const rect2 = ear.svg.rect(1, 2);
	const rect3 = ear.svg.rect(1, 2, 3);
	const rect4 = ear.svg.rect(1, 2, 3, 4);
	expect(rect0.getAttribute("x") === null || rect0.getAttribute("x") === "").toBe(true);
	expect(rect0.getAttribute("width") === null || rect0.getAttribute("width") === "").toBe(
		true,
	);
	expect(rect1.getAttribute("x") === null || rect1.getAttribute("x") === "").toBe(true);
	expect(rect1.getAttribute("y") === null || rect1.getAttribute("y") === "").toBe(true);
	expect(rect1.getAttribute("width") === null || rect1.getAttribute("width") === "").toBe(
		false,
	);
	expect(
		rect1.getAttribute("height") === null || rect1.getAttribute("height") === "",
	).toBe(true);
	expect(rect2.getAttribute("x") === null || rect2.getAttribute("x") === "").toBe(true);
	expect(rect2.getAttribute("y") === null || rect2.getAttribute("y") === "").toBe(true);
	expect(rect2.getAttribute("width") === null || rect2.getAttribute("width") === "").toBe(
		false,
	);
	expect(
		rect2.getAttribute("height") === null || rect2.getAttribute("height") === "",
	).toBe(false);
	expect(rect3.getAttribute("x") === null || rect3.getAttribute("x") === "").toBe(true);
	expect(rect3.getAttribute("y") === null || rect3.getAttribute("y") === "").toBe(true);
	expect(rect3.getAttribute("width") === null || rect3.getAttribute("width") === "").toBe(
		false,
	);
	expect(
		rect3.getAttribute("height") === null || rect3.getAttribute("height") === "",
	).toBe(false);
	expect(rect4.getAttribute("x") === null || rect4.getAttribute("x") === "").toBe(false);
	expect(rect4.getAttribute("y") === null || rect4.getAttribute("y") === "").toBe(false);
	expect(rect4.getAttribute("width") === null || rect4.getAttribute("width") === "").toBe(
		false,
	);
	expect(
		rect4.getAttribute("height") === null || rect4.getAttribute("height") === "",
	).toBe(false);

	const circle0 = ear.svg.circle();
	const circle1 = ear.svg.circle(1);
	const circle2 = ear.svg.circle(1, 2);
	const circle3 = ear.svg.circle(1, 2, 3);
	expect(circle0.getAttribute("cx") === null || circle0.getAttribute("cx") === "").toBe(
		true,
	);
	expect(circle0.getAttribute("cy") === null || circle0.getAttribute("cy") === "").toBe(
		true,
	);
	expect(circle0.getAttribute("r") === null || circle0.getAttribute("r") === "").toBe(
		true,
	);
	expect(circle1.getAttribute("cx") === null || circle1.getAttribute("cx") === "").toBe(
		true,
	);
	expect(circle1.getAttribute("cy") === null || circle1.getAttribute("cy") === "").toBe(
		true,
	);
	expect(circle1.getAttribute("r") === null || circle1.getAttribute("r") === "").toBe(
		false,
	);
	expect(circle2.getAttribute("cx") === null || circle2.getAttribute("cx") === "").toBe(
		false,
	);
	expect(circle2.getAttribute("cy") === null || circle2.getAttribute("cy") === "").toBe(
		false,
	);
	expect(circle2.getAttribute("r") === null || circle2.getAttribute("r") === "").toBe(
		true,
	);
	expect(circle3.getAttribute("cx") === null || circle3.getAttribute("cx") === "").toBe(
		false,
	);
	expect(circle3.getAttribute("cy") === null || circle3.getAttribute("cy") === "").toBe(
		false,
	);
	expect(circle3.getAttribute("r") === null || circle3.getAttribute("r") === "").toBe(
		false,
	);

	const ellipse1 = ear.svg.ellipse(1);
	const ellipse2 = ear.svg.ellipse(1, 2);
	const ellipse3 = ear.svg.ellipse(1, 2, 3);
	const ellipse4 = ear.svg.ellipse(1, 2, 3, 4);
	const text1s = ear.svg.text("abc", 0, 1);
});

// test("custom primitives", () => {
//   const group = ear.svg.g();
//   group.appendChild(ear.svg.bezier(0, 1, 2, 3, 4, 5, 6, 7));
//   group.appendChild(ear.svg.arc(0, 1, 2, 3, 4));
//   group.appendChild(ear.svg.wedge(0, 1, 2, 3, 4));
//   group.appendChild(ear.svg.arcEllipse(0, 1, 2, 3, 4, 5));
//   group.appendChild(ear.svg.wedgeEllipse(0, 1, 2, 3, 4, 5));
//   group.appendChild(ear.svg.arrow([0, 1], [2, 3]));
//   const nodeNames = ["path", "path", "path", "path", "path", "g"];
//   Array.from(group.childNodes).forEach((el, i) => {
//     expect(el.nodeName).toBe(nodeNames[i]);
//   });
//   expect(group.childNodes.length).toBe(6);
// });
