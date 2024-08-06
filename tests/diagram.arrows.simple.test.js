import { expect, test } from "vitest";
import fs from "fs";
import xmldom from "@xmldom/xmldom";
import ear from "../src/index.js";

ear.window = xmldom;

test("arrowFromLine with options", () => {
	const polygon = ear.graph.square().vertices_coords;
	const line = { vector: [0.4, 0.8], origin: [0.5, 0.5] };
	ear.diagram.arrowFromLine(polygon, line);
});

test("segmentToArrow with options", () => {
	const polygon = ear.graph.square().vertices_coords;
	const segment = [
		[0.4, 0.8],
		[0.5, 0.5],
	];
	ear.diagram.arrowFromSegment(polygon, segment);
});

test("foldLineArrow", () => {
	const graph = ear.graph.square();
	const foldLine = { vector: [1, 1], origin: [0, 0] };
	const options = {};
	const arrow = ear.diagram.foldLineArrow(graph, foldLine, options);
	expect(arrow).toMatchObject({
		segment: [
			[1, 0],
			[0, 1],
		],
		head: { width: 0.0666, height: 0.1 },
		bend: -0.3,
	});
	expect(arrow.padding).toBeCloseTo(0.07071067811865477);
});
