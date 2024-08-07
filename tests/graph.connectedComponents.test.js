import fs from "fs";
import { expect, test } from "vitest";
import ear from "../src/index.js";

test("connectedComponents", () => {
	const foldFile = fs.readFileSync("./tests/files/fold/maze-u.fold", "utf-8");
	const foldObject = JSON.parse(foldFile);
	const graph = ear.graph.getFramesByClassName(foldObject, "foldedForm")[0];
	const faceOrders = ear.layer.layer3D(graph).faceOrders();
	const faces_set = ear.graph.connectedComponents(
		ear.graph.makeVerticesVerticesUnsorted({
			edges_vertices: faceOrders.map((ord) => [ord[0], ord[1]]),
		}),
	);
	fs.writeFileSync(`./tests/tmp/connectedFaces.json`, JSON.stringify(faces_set, null, 2));
});

test("connectedComponents on disjoint graphs", () => {
	const foldFile = fs.readFileSync(
		"./tests/files/fold/disjoint-triangles-3d.fold",
		"utf-8",
	);
	const foldObject = JSON.parse(foldFile);
	const graph = ear.graph.getFramesByClassName(foldObject, "foldedForm")[0];
	const vertices_vertices = ear.graph.makeVerticesVertices(graph);
	const vertices_group = ear.graph.connectedComponents(vertices_vertices);
	const expected = [
		0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4,
	];
	vertices_group.forEach((n, i) => expect(n).toBe(expected[i]));
});
