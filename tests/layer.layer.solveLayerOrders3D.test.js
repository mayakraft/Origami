import { expect, test } from "vitest";
import fs from "fs";
import ear from "../src/index.js";

test("makeSolverConstraints3D panels 6x2", () => {
	const foldfile = fs.readFileSync("./tests/files/fold/panels-6x2-90deg.fold", "utf-8");
	const fold = JSON.parse(foldfile);
	const folded = ear.graph.getFramesByClassName(fold, "foldedForm")[0];
	ear.graph.populate(folded);

	const { orders, branches } = ear.layer.solveLayerOrders3D(folded);

	expect(orders).toMatchObject({
		"0 1": 2,
		"1 2": 2,
		"2 3": 2,
		"3 4": 1,
		"4 5": 1,
		"6 7": 2,
		"7 8": 2,
		"8 9": 2,
		"9 10": 1,
		"10 11": 1,
		"0 3": 2,
		"1 3": 2,
		"3 5": 1,
		"6 9": 2,
		"7 9": 2,
		"9 11": 1,
		"0 2": 2,
		"6 8": 2,
	});

	expect(branches).toMatchObject([
		[
			{
				orders: {
					"1 4": 1,
					"6 10": 1,
					"2 4": 1,
					"0 5": 1,
					"7 10": 1,
					"2 5": 1,
					"8 10": 1,
					"1 5": 1,
					"6 11": 1,
					"8 11": 1,
					"7 11": 1,
					"0 4": 1,
				},
			},
			{
				orders: { "6 10": 2, "0 5": 2, "6 11": 2, "0 4": 2 },
				// interesting that "0 5": 2, and "6 11": 2, aren't inside the "orders" section.
				// is this okay?
				branches: [
					[
						{
							orders: {
								"1 4": 1,
								"2 5": 1,
								"8 10": 1,
								"7 10": 1,
								"8 11": 1,
								"1 5": 1,
								"7 11": 1,
								"2 4": 1,
							},
						},
						{
							orders: {
								"1 4": 2,
								"2 5": 2,
								"8 10": 2,
								"7 10": 2,
								"8 11": 2,
								"1 5": 2,
								"7 11": 2,
								"2 4": 2,
							},
						},
					],
				],
			},
		],
	]);
});
