import { expect, test } from "vitest";
import ear from "../src/index.js";

// todo: all these tests require axiom validation methods to be able
// to take non convex polygons as input, and correctly be able to
// tell if a point is inside the polygon.

const nonPlanarShape = () => ({
	vertices_coords: [[1, 0], [3, 2], [0, 4], [-3, 3], [-1, 2], [-2, -2], [4, -1]],
	edges_vertices: [[0, 1], [2, 0], [3, 4], [4, 5], [6, 5], [1, 6], [2, 3]],
	edges_assignment: ["B", "B", "B", "B", "B", "B", "B"],
	faces_vertices: [[0, 2, 3, 4, 5, 6, 1]]
});

test("validate axiom 1, nonconvex, no line of sight", () => {
	const graph = nonPlanarShape();
	const params = [[-1, 3], [3, 0]];
	expect(ear.axiom.validateAxiom1(graph, ...params)).toMatchObject([false]);
});

// test("validate axiom 2, nonconvex, no line of sight", () => {
// 	const graph = nonPlanarShape();
// 	expect(ear.axiom.validateAxiom2(graph, [-1, 3], [3, 0])).toMatchObject([true]);
// });

// test("validate axiom 4, nonconvex, no line of sight", () => {
// 	const graph = nonPlanarShape();
// 	const line = ear.math.pointsToLine2([-1, 3], [3, 0]);
// 	const point = [0, -1];
// 	expect(ear.axiom.validateAxiom4(graph, line, point)).toMatchObject([true]);
// });
