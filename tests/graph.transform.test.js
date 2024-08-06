import { expect, test } from "vitest";
import ear from "../src/index.js";

test("transform, uniform scale", () => {
	const graph1 = ear.graph.fish();
	const graph2 = ear.graph.scaleUniform(structuredClone(graph1), 2);
	graph2.vertices_coords.forEach((v, i) => {
		expect(v[0]).toBeCloseTo(graph1.vertices_coords[i][0] * 2);
		expect(v[1]).toBeCloseTo(graph1.vertices_coords[i][1] * 2);
	});
});

test("transform, non-uniform scale", () => {
	const graph1 = ear.graph.fish();
	const graph2 = ear.graph.scale(structuredClone(graph1), [2, 1]);
	graph2.vertices_coords.forEach((v, i) => {
		expect(v[0]).toBeCloseTo(graph1.vertices_coords[i][0] * 2);
		expect(v[1]).toBeCloseTo(graph1.vertices_coords[i][1] * 1);
	});
});

test("transform, translate", () => {
	const graph1 = ear.graph.fish();
	const graph2 = ear.graph.translate(structuredClone(graph1), [1, 2]);
	graph2.vertices_coords.forEach((v, i) => {
		expect(v[0]).toBeCloseTo(graph1.vertices_coords[i][0] + 1);
		expect(v[1]).toBeCloseTo(graph1.vertices_coords[i][1] + 2);
		expect(v[2]).toBe(undefined);
	});
});

test("transform, translate, 3D with 2D vertices", () => {
	const graph1 = ear.graph.fish();
	const graph2 = ear.graph.translate(structuredClone(graph1), [1, 2, 3]);
	graph2.vertices_coords.forEach((v, i) => {
		expect(v[0]).toBeCloseTo(graph1.vertices_coords[i][0] + 1);
		expect(v[1]).toBeCloseTo(graph1.vertices_coords[i][1] + 2);
		expect(v[2]).toBe(undefined);
	});
});

test("transform, translate3, 3D with 2D vertices", () => {
	const graph1 = ear.graph.fish();
	const graph2 = ear.graph.translate3(structuredClone(graph1), [1, 2, 3]);
	graph2.vertices_coords.forEach((v, i) => {
		expect(v[0]).toBeCloseTo(graph1.vertices_coords[i][0] + 1);
		expect(v[1]).toBeCloseTo(graph1.vertices_coords[i][1] + 2);
		expect(v[2]).toBeCloseTo(3);
	});
});

test("transform, rotate z", () => {
	const graph1 = ear.graph.fish();
	const graph2 = ear.graph.rotateZ(structuredClone(graph1), Math.PI, [4, 4]);
	const bounds = ear.graph.boundingBox(graph2);
	expect(bounds.min[0]).toBeCloseTo(7);
	expect(bounds.min[1]).toBeCloseTo(7);
	expect(bounds.max[0]).toBeCloseTo(8);
	expect(bounds.max[1]).toBeCloseTo(8);
});

test("transform, rotate 3D", () => {
	const graph1 = ear.graph.fish();
	const graph2 = ear.graph.rotate(structuredClone(graph1), Math.PI, [0, 0, 1], [4, 4]);
	const bounds = ear.graph.boundingBox(graph2);
	expect(bounds.min[0]).toBeCloseTo(7);
	expect(bounds.min[1]).toBeCloseTo(7);
	expect(bounds.max[0]).toBeCloseTo(8);
	expect(bounds.max[1]).toBeCloseTo(8);
});

test("transform, unitize 2D", () => {
	const graph1 = {
		vertices_coords: [
			[5, 3],
			[7, 4],
		],
	};
	const graph2 = ear.graph.unitize(structuredClone(graph1));
	const bounds = ear.graph.boundingBox(graph2);
	expect(bounds.min[0]).toBeCloseTo(0);
	expect(bounds.min[1]).toBeCloseTo(0);
	expect(bounds.max[0]).toBeCloseTo(1);
	expect(bounds.max[1]).toBeCloseTo(0.5);
});

test("transform, unitize 3D", () => {
	const graph1 = {
		vertices_coords: [
			[5, 3, 0],
			[7, 4, 3],
		],
	};
	const graph2 = ear.graph.unitize(structuredClone(graph1));
	const bounds = ear.graph.boundingBox(graph2);
	expect(bounds.min[0]).toBeCloseTo(0);
	expect(bounds.min[1]).toBeCloseTo(0);
	expect(bounds.min[2]).toBeCloseTo(0);
	expect(bounds.max[0]).toBeCloseTo(2 / 3);
	expect(bounds.max[1]).toBeCloseTo(1 / 3);
	expect(bounds.max[2]).toBeCloseTo(1);
});

// these call the transform matrix method which is now deprecated

// test("transform, matrix translate", () => {
// 	const graph1 = ear.graph.fish();
// 	const graph2 = ear.graph.transform(
// 		structuredClone(graph1),
// 		[1, 0, 0, 0, 1, 0, 0, 0, 1, 10, 10, 0],
// 	);
// 	graph2.vertices_coords.forEach((v, i) => {
// 		expect(v[0]).toBeCloseTo(graph1.vertices_coords[i][0] + 10);
// 		expect(v[1]).toBeCloseTo(graph1.vertices_coords[i][1] + 10);
// 	});
// });

// test("transform, matrix scale and translate", () => {
// 	const graph1 = ear.graph.fish();
// 	const graph2 = ear.graph.transform(
// 		structuredClone(graph1),
// 		[2, 0, 0, 0, 2, 0, 0, 0, 1, 10, 10, 0],
// 	);
// 	graph2.vertices_coords.forEach((v, i) => {
// 		expect(v[0]).toBeCloseTo(graph1.vertices_coords[i][0] * 2 + 10);
// 		expect(v[1]).toBeCloseTo(graph1.vertices_coords[i][1] * 2 + 10);
// 	});
// });
