import fs from "fs";
import { expect, test } from "vitest";
import ear from "../src/index.js";

// ear.layer.faceOrdersToMatrix()
// ear.layer.facesLayerToEdgesAssignments()
// ear.layer.flipFacesLayer()
// ear.layer.makeEpsilon()
// ear.layer.constraintToFacePairs()
// ear.layer.constraintToFacePairsStrings()

test("no depth", () => {
	const layerSolution = {
		orders: { "1 2": 1 },
	};
	const result = ear.layer.gatherAll(layerSolution);

	// only one solution
	expect(result.length).toBe(1);

	// the one solution only has one object
	expect(result[0].length).toBe(1);
	expect(result).toMatchObject([[{ "1 2": 1 }]]);
});

test("one depth with one 'and' and two 'or' branches", () => {
	const layerSolution = {
		orders: { "1 2": 1 },
		branches: [
			[
				{
					orders: { "3 4": 1 },
				},
				{
					orders: { "3 4": 2 },
				},
			],
		],
	};
	const result = ear.layer.gatherAll(layerSolution);

	// two solutions
	expect(result.length).toBe(2);

	// each of the two solutions contains two objects
	expect(result[0].length).toBe(2);
	expect(result[1].length).toBe(2);

	expect(result).toMatchObject([
		[{ "1 2": 1 }, { "3 4": 1 }],
		[{ "1 2": 1 }, { "3 4": 2 }],
	]);
});

test("one depth with two 'and' and two 'or' branches", () => {
	const layerSolution = {
		orders: { "1 2": 1 },
		branches: [
			[
				{
					orders: { "3 4": 1 },
				},
				{
					orders: { "3 4": 2 },
				},
			],
			[
				{
					orders: { "5 6": 1 },
				},
				{
					orders: { "5 6": 2 },
				},
			],
		],
	};
	const result = ear.layer.gatherAll(layerSolution);

	expect(result.length).toBe(4);
	expect(result[0].length).toBe(3);
	expect(result[1].length).toBe(3);
	expect(result[2].length).toBe(3);
	expect(result[3].length).toBe(3);

	expect(result).toMatchObject([
		[{ "1 2": 1 }, { "3 4": 1 }, { "5 6": 1 }],
		[{ "1 2": 1 }, { "3 4": 1 }, { "5 6": 2 }],
		[{ "1 2": 1 }, { "3 4": 2 }, { "5 6": 1 }],
		[{ "1 2": 1 }, { "3 4": 2 }, { "5 6": 2 }],
	]);
});

test("single-entry structure that mimics the Kabuto result", () => {
	const layerSolution = {
		orders: { "1 2": 1 },
		branches: [
			[
				{
					orders: { "3 4": 1 },
					branches: [
						[
							{
								orders: { "5 6": 1 },
							},
							{
								orders: { "5 6": 2 },
							},
						],
					],
				},
				{
					orders: { "3 4": 2, "5 6": 1 },
				},
			],
			[
				{
					orders: { "7 8": 1 },
					branches: [
						[
							{
								orders: { "9 10": 1 },
							},
							{
								orders: { "9 10": 2 },
							},
						],
					],
				},
				{
					orders: { "7 8": 2, "9 10": 1 },
				},
			],
		],
	};
	const result = ear.layer.gatherAll(layerSolution);

	expect(result).toMatchObject([
		[{ "1 2": 1 }, { "3 4": 1 }, { "5 6": 1 }, { "7 8": 1 }, { "9 10": 1 }],
		[{ "1 2": 1 }, { "3 4": 1 }, { "5 6": 1 }, { "7 8": 1 }, { "9 10": 2 }],
		[{ "1 2": 1 }, { "3 4": 1 }, { "5 6": 1 }, { "7 8": 2, "9 10": 1 }],
		[{ "1 2": 1 }, { "3 4": 1 }, { "5 6": 2 }, { "7 8": 1 }, { "9 10": 1 }],
		[{ "1 2": 1 }, { "3 4": 1 }, { "5 6": 2 }, { "7 8": 1 }, { "9 10": 2 }],
		[{ "1 2": 1 }, { "3 4": 1 }, { "5 6": 2 }, { "7 8": 2, "9 10": 1 }],
		[{ "1 2": 1 }, { "3 4": 2, "5 6": 1 }, { "7 8": 1 }, { "9 10": 1 }],
		[{ "1 2": 1 }, { "3 4": 2, "5 6": 1 }, { "7 8": 1 }, { "9 10": 2 }],
		[{ "1 2": 1 }, { "3 4": 2, "5 6": 1 }, { "7 8": 2, "9 10": 1 }],
	]);
});
