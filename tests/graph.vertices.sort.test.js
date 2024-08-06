import { expect, test } from "vitest";
import ear from "../src/index.js";

const arraysMatch = (a, b) => a.forEach((_, i) => expect(a[i]).toBe(b[i]));

test("sortVerticesCounterClockwise", () => {
	arraysMatch(
		[0, 1, 2],
		ear.graph.sortVerticesCounterClockwise(
			{
				vertices_coords: [
					[1, 0],
					[1, 0.1],
					[1, -0.1],
					[0, 0],
				],
			},
			[0, 2, 1],
			3,
		),
	);
	arraysMatch(
		[0, 1, 2],
		ear.graph.sortVerticesCounterClockwise(
			{
				vertices_coords: [
					[1, 0],
					[1, 0.1],
					[1, -0.1],
					[0, 0],
				],
			},
			[0, 1, 2],
			3,
		),
	);
	arraysMatch(
		[0, 2, 1],
		ear.graph.sortVerticesCounterClockwise(
			{
				vertices_coords: [
					[1, 0],
					[1, -0.1],
					[1, 0.1],
					[0, 0],
				],
			},
			[0, 1, 2],
			3,
		),
	);
});

test("sortVerticesAlongVector", () => {
	arraysMatch(
		[2, 1, 0],
		ear.graph.sortVerticesAlongVector(
			{
				vertices_coords: [
					[3, 100],
					[2, -90],
					[1, 0.01],
				],
			},
			[0, 1, 2],
			[1, 0],
		),
	);
	arraysMatch(
		[1, 2, 0],
		ear.graph.sortVerticesAlongVector(
			{
				vertices_coords: [
					[3, 100],
					[-2, 1000000],
					[2, -90],
				],
			},
			[0, 1, 2],
			[1, 0],
		),
	);
	arraysMatch(
		[0, 2, 1],
		ear.graph.sortVerticesAlongVector(
			{
				vertices_coords: [
					[3, 100],
					[-2, 1000000],
					[2, -90],
				],
			},
			[0, 1, 2],
			[-1, 0],
		),
	);
	arraysMatch(
		[2, 0, 1],
		ear.graph.sortVerticesAlongVector(
			{
				vertices_coords: [
					[3, 100],
					[-2, 1000000],
					[2, -90],
				],
			},
			[0, 1, 2],
			[0, 1],
		),
	);
});
