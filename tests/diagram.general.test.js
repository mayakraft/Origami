import { expect, test } from "vitest";
import fs from "fs";
import xmldom from "@xmldom/xmldom";
import ear from "../src/index.js";

ear.window = xmldom;

test("arrowFromSegmentInPolygon", () => {
	const polygon = [
		[0, 0],
		[5, 0],
		[5, 5],
		[0, 5],
	];
	const segment = [
		[0.5, 0.5],
		[1, 2],
	];
	const arrow = ear.diagram.arrowFromSegmentInPolygon(polygon, segment);

	expect(arrow).toMatchObject({
		segment: [
			[0.5, 0.5],
			[1, 2],
		],
		head: { width: 0.333, height: 0.5 },
		bend: 0.3,
	});
	expect(arrow.padding).toBeCloseTo(0.0790569415042095);
});
