import fs from "fs";
import { expect, test } from "vitest";
import ear from "../src/index.js";

test("reverseFold", () => {
	const graph = {
		vertices_coords: [
			[0, 0],
			[1, 0],
			[1, 1],
			[0, 1],
		],
		edges_vertices: [
			[0, 1],
			[1, 2],
			[2, 3],
			[3, 0],
			[0, 2],
		],
		edges_assignment: ["B", "B", "B", "B", "V"],
		edges_foldAngle: [0, 0, 0, 0, 180],
		faces_vertices: [
			[0, 1, 2],
			[2, 3, 0],
		],
	};
	const vertices_coordsFolded = [
		[0, 0],
		[1, -1],
		[2, 0],
		[1, -1],
	];

	// ear.graph.reverseFold(
	// 	graph,
	// 	{ vector: [-1, -1], origin: [1, 0] },
	// 	vertices_coordsFolded,
	// );
});
