import { expect, test } from "vitest";
import fs from "fs";
import ear from "../src/index.js";

// export const makeEmptyGraph = () => populate({
// 	vertices_coords: [],
// 	edges_vertices: [],
// 	edges_assignment: [],
// 	edges_foldAngle: [],
// 	faces_vertices: [],
// });

test("populate with isolated vertex", () => {
	const graph = ear.graph({
		vertices_coords: [
			[0, 0],
			[1, 0],
			[2, 0],
			[3, 0],
		],
		edges_vertices: [
			[0, 1],
			[1, 2],
		],
		edges_foldAngle: [0, 0],
		edges_assignment: ["U", "U"],
	});
	graph.populate();
	expect(graph.vertices_coords.length).toBe(4);
	expect(graph.vertices_edges.length).toBe(3);
	expect(graph.vertices_vertices.length).toBe(3);
	// expect(graph.vertices_sectors.length).toBe(3);

	expect(graph.edges_vertices.length).toBe(2);
	// expect(graph.edges_vector.length).toBe(2);
	expect(graph.edges_assignment.length).toBe(2);
	expect(graph.edges_foldAngle.length).toBe(2);

	expect(graph.faces_vertices.length).toBe(0);
	expect(graph.faces_edges.length).toBe(0);
	expect(graph.faces_faces.length).toBe(0);
	// expect(graph.faces_sectors.length).toBe(0);
	// expect(graph.faces_matrix.length).toBe(0);
});

test("populate with assignment and fold angle", () => {
	const graph1 = ear.graph({
		vertices_coords: [
			[0, 0],
			[1, 0],
		],
		edges_vertices: [[0, 1]],
		edges_assignment: ["M", "V", "U", "F", "B", "X"],
	});
	graph1.populate();
	expect(graph1.edges_foldAngle.length).toBe(6);
	expect(graph1.edges_foldAngle[0]).toBe(-180);
	expect(graph1.edges_foldAngle[1]).toBe(180);
	expect(graph1.edges_foldAngle[5]).toBe(0);

	const graph2 = ear.graph({
		vertices_coords: [
			[0, 0],
			[1, 0],
		],
		edges_vertices: [[0, 1]],
		edges_foldAngle: [-180, 180, 0, 0, 0, 0],
	});
	graph2.populate();
	expect(graph2.edges_assignment.length).toBe(6);
	expect(graph2.edges_assignment[0]).toBe("M");
	expect(graph2.edges_assignment[1]).toBe("V");
	expect(graph2.edges_assignment[5]).toBe("U");
});

test("component edges with no vertex data", () => {
	const graph = ear.graph({
		edges_faces: [
			[0, 1],
			[3, 0],
		],
		edges_foldAngle: [0, 0],
	});

	try {
		graph.populate();
	} catch (error) {
		expect(error).not.toBe(undefined);
	}
});

test("one-fold populate, no faces rebuilt", () => {
	const graph = ear.graph({
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
			[1, 3],
		],
	});
	graph.populate();
	expect(graph.vertices_coords.length).toBe(4);
	expect(graph.vertices_vertices.length).toBe(4);
	expect(graph.vertices_faces.length).toBe(4);
	expect(graph.vertices_edges.length).toBe(4);
	expect(graph.edges_vertices.length).toBe(5);
	expect(graph.edges_edges).toBe(undefined);
	expect(graph.edges_faces.length).toBe(5);
	expect(graph.edges_length).toBe(undefined);
	expect(graph.edges_assignment.length).toBe(5);
	expect(graph.edges_foldAngle.length).toBe(5);
	expect(graph.faces_faces.length).toBe(0);
	expect(graph.faces_vertices.length).toBe(0);
	expect(graph.faces_edges.length).toBe(0);
});

test("one-fold populate, rebuild faces", () => {
	const graph = ear.graph({
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
			[1, 3],
		],
	});
	graph.populate({ faces: true });
	expect(graph.vertices_coords.length).toBe(4);
	expect(graph.vertices_vertices.length).toBe(4);
	expect(graph.vertices_faces.length).toBe(4);
	expect(graph.vertices_edges.length).toBe(4);
	expect(graph.edges_vertices.length).toBe(5);
	expect(graph.edges_edges).toBe(undefined);
	expect(graph.edges_faces.length).toBe(5);
	expect(graph.edges_length).toBe(undefined);
	expect(graph.edges_assignment.length).toBe(5);
	expect(graph.edges_foldAngle.length).toBe(5);
	expect(graph.faces_faces.length).toBe(2);
	expect(graph.faces_vertices.length).toBe(2);
	expect(graph.faces_edges.length).toBe(2);
});

test("one-fold populate, with assignments", () => {
	const graph = ear.graph({
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
			[1, 3],
		],
		edges_assignment: ["B", "B", "B", "B", "V"],
	});
	graph.populate({ faces: true });
	expect(graph.vertices_coords.length).toBe(4);
	expect(graph.vertices_vertices.length).toBe(4);
	expect(graph.vertices_faces.length).toBe(4);
	expect(graph.vertices_edges.length).toBe(4);
	expect(graph.edges_vertices.length).toBe(5);
	expect(graph.edges_edges).toBe(undefined);
	expect(graph.edges_faces.length).toBe(5);
	expect(graph.edges_length).toBe(undefined);
	expect(graph.edges_assignment.length).toBe(5);
	expect(graph.edges_foldAngle.length).toBe(5);
	expect(graph.faces_faces.length).toBe(2);
	expect(graph.faces_vertices.length).toBe(2);
	expect(graph.faces_edges.length).toBe(2);
});

test("populate kite base", () => {
	const kite = {
		file_spec: 1.1,
		vertices_coords: [
			[0, 0],
			[0.414, 0],
			[1, 0],
			[1, 0.586],
			[1, 1],
			[0, 1],
		],
		edges_vertices: [
			[0, 1],
			[1, 2],
			[2, 3],
			[3, 4],
			[4, 5],
			[5, 0],
			[5, 1],
			[3, 5],
			[5, 2],
		],
		faces_vertices: [
			[0, 1, 5],
			[1, 2, 5],
			[2, 3, 5],
			[3, 4, 5],
		],
	};

	const graph = ear.graph(kite);
	graph.populate();
	expect(graph.vertices_coords.length).toBe(6);
	expect(graph.vertices_vertices.length).toBe(6);
	expect(graph.vertices_edges.length).toBe(6);
	expect(graph.vertices_faces.length).toBe(6);
	expect(graph.edges_vertices.length).toBe(9);
	expect(graph.edges_faces.length).toBe(9);
	expect(graph.edges_length).toBe(undefined);
	expect(graph.edges_edges).toBe(undefined);
	expect(graph.faces_vertices.length).toBe(4);
	expect(graph.faces_edges.length).toBe(4);
	expect(graph.faces_faces.length).toBe(4);
});

test("FOLD core populate, no assignments", () => {
	const blintz = {
		vertices_coords: [
			[0, 0],
			[0.5, 0],
			[1, 0],
			[1, 0.5],
			[1, 1],
			[0.5, 1],
			[0, 1],
			[0, 0.5],
		],
		edges_vertices: [
			[0, 1],
			[1, 2],
			[2, 3],
			[3, 4],
			[4, 5],
			[5, 6],
			[6, 7],
			[7, 0],
			[1, 3],
			[3, 5],
			[5, 7],
			[7, 1],
		],
	};
	ear.graph.populate(blintz);

	expect(blintz.edges_faces !== undefined).toBe(true);
	expect(blintz.edges_vertices !== undefined).toBe(true);
	expect(blintz.faces_edges !== undefined).toBe(true);
	expect(blintz.faces_faces !== undefined).toBe(true);
	expect(blintz.faces_vertices !== undefined).toBe(true);
	expect(blintz.vertices_coords !== undefined).toBe(true);
	expect(blintz.vertices_edges !== undefined).toBe(true);
	expect(blintz.vertices_faces !== undefined).toBe(true);
	expect(blintz.vertices_vertices !== undefined).toBe(true);
	expect(blintz.edges_assignment !== undefined).toBe(true);
	expect(blintz.edges_foldAngle !== undefined).toBe(true);
	expect(blintz.edges_length === undefined).toBe(true);
});

test("FOLD core populate", () => {
	const blintz = {
		vertices_coords: [
			[0, 0],
			[0.5, 0],
			[1, 0],
			[1, 0.5],
			[1, 1],
			[0.5, 1],
			[0, 1],
			[0, 0.5],
		],
		edges_vertices: [
			[0, 1],
			[1, 2],
			[2, 3],
			[3, 4],
			[4, 5],
			[5, 6],
			[6, 7],
			[7, 0],
			[1, 3],
			[3, 5],
			[5, 7],
			[7, 1],
		],
		edges_assignment: ["B", "B", "B", "B", "B", "B", "B", "B", "V", "V", "V", "V"],
	};
	ear.graph.populate(blintz);

	expect(blintz.edges_faces !== undefined).toBe(true);
	expect(blintz.edges_vertices !== undefined).toBe(true);
	expect(blintz.faces_edges !== undefined).toBe(true);
	expect(blintz.faces_faces !== undefined).toBe(true);
	expect(blintz.faces_vertices !== undefined).toBe(true);
	expect(blintz.vertices_coords !== undefined).toBe(true);
	expect(blintz.vertices_edges !== undefined).toBe(true);
	expect(blintz.vertices_faces !== undefined).toBe(true);
	expect(blintz.vertices_vertices !== undefined).toBe(true);
	expect(blintz.edges_assignment !== undefined).toBe(true);
	expect(blintz.edges_foldAngle !== undefined).toBe(true);

	expect(blintz.edges_length === undefined).toBe(true);
});

test("populate a complete graph", () => {
	const FOLD = fs.readFileSync("./tests/files/fold/surrounded-square.fold", "utf-8");
	const graph = JSON.parse(FOLD);
	const clone = structuredClone(graph);

	// clone turned all "undefined" into "null". change these back
	Object.keys(clone)
		.filter((arr) => clone[arr][0] != null && clone[arr][0].constructor === Array)
		.forEach((key) =>
			clone[key].forEach((arr, i) =>
				arr.forEach((value, j) => {
					if (value === null) {
						clone[key][i][j] = undefined;
					}
				}),
			),
		);

	// delete all fields, leaving behind:
	// vertices_coords, vertices_vertices, edges_vertices, faces_vertices
	delete graph.faces_faces;
	delete graph.faces_edges;
	delete graph.edges_faces;
	delete graph.faces_faces;
	delete graph.vertices_faces;
	delete graph.vertices_edges;

	// rebuild using populate, expecting the same result as before
	ear.graph.populate(graph);

	// currently this library does not follow the
	// spec's recommendation for edges_faces ordering.
	delete graph.edges_faces;
	delete clone.edges_faces;
	expect(graph).toMatchObject(clone);
});
