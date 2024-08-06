import { expect, test } from "vitest";
import fs from "fs";
import ear from "../src/index.js";

test("getVerticesClusters no clusters", () => {
	const graph = JSON.parse(fs.readFileSync("./tests/files/fold/fan-cp.fold", "utf-8"));
	const clusters = ear.graph.getVerticesClusters(graph);
	clusters.forEach((cluster) => expect(cluster.length).toBe(1));
});

test("getVerticesClusters bird base. clusters", () => {
	const graph = JSON.parse(
		fs.readFileSync("./tests/files/fold/bird-disjoint-edges.fold", "utf-8"),
	);
	const clusters = ear.graph.getVerticesClusters(graph);
	// console.log(clusters.map(c => c.length));
	// clusters vary in length, anywhere between 3 to 10
	clusters.forEach((cluster) => expect(cluster.length).not.toBe(1));
	clusters.forEach((cluster) => expect(cluster.length > 2).toBe(true));
});

test("getVerticesClusters bird base", () => {
	const cp = ear.graph.bird();
	const graph = {
		...cp,
		vertices_coords: ear.graph.makeVerticesCoordsFlatFolded(cp),
	};
	const clusters_vertices = ear.graph.getVerticesClusters(graph);
	expect(clusters_vertices).toMatchObject([
		[6, 0, 2, 4], // bottom in folded form
		[5, 14, 1, 7, 13, 3], // 6 points coming together in the inside center axis.
		[10, 9], // side point in folded form
		[11, 12], // side point in folded form
		[8], // center point in cp
	]);
});

test("vertices clusters graphs with holes", () => {
	// both of these have 14 vertices
	expect(
		ear.graph.getVerticesClusters({
			vertices_coords: [
				[0, 0, 0],
				[1, 0, 0],
				,
				[0, 0, 0],
				[0, 1, 0],
				[0, 0, 0],
				[0, 1, 0],
				[0, 0, 0],
				[0, 1, 0],
				[1, 1, 0],
				,
				[1, 0, 0],
				[1, 1, 0],
				[1, 0, 0],
				[1, 1, 0],
				[1, 0, 0],
			],
		}),
	).toMatchObject([
		[0, 3, 5, 7],
		[4, 6, 8],
		[1, 11, 13, 15],
		[9, 12, 14],
	]);

	expect(
		ear.graph.getVerticesClusters({
			vertices_coords: [
				,
				[1, 0, 0],
				[1, 0, 1],
				,
				,
				,
				,
				,
				,
				[1, 1, 0],
				[1, 1, 1],
				[1, 0, 0],
				[1, 1, 0],
				[1, 0, 0],
				[1, 1, 0],
				[1, 0, 0],
				[1, 0, 1],
				[1, 1, 1],
				[1, 0, 1],
				[1, 1, 1],
				[1, 0, 1],
			],
		}),
	).toMatchObject([
		[1, 11, 13, 15],
		[2, 16, 18, 20],
		[9, 12, 14],
		[10, 17, 19],
	]);
});
