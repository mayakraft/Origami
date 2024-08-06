import { expect, test } from "vitest";
import ear from "../src/index.js";

test("bases, all are valid", () => {
	expect(ear.graph.validate(ear.graph.blintz())).toHaveLength(0);
	expect(ear.graph.validate(ear.graph.waterbomb())).toHaveLength(0);
	expect(ear.graph.validate(ear.graph.kite())).toHaveLength(0);
	expect(ear.graph.validate(ear.graph.fish())).toHaveLength(0);
	expect(ear.graph.validate(ear.graph.bird())).toHaveLength(0);
	expect(ear.graph.validate(ear.graph.frog())).toHaveLength(0);
	expect(ear.graph.validate(ear.graph.windmill())).toHaveLength(0);
	expect(ear.graph.validate(ear.graph.squareFish())).toHaveLength(0);
});

test("square", () => {
	const res1 = ear.graph.square();
	const res2 = ear.graph.square(3);
	expect(res1.vertices_coords[0][0]).toBe(0);
	expect(res1.vertices_coords[0][1]).toBe(0);
	expect(res1.vertices_coords[2][0]).toBe(1);
	expect(res1.vertices_coords[2][1]).toBe(1);
	expect(res2.vertices_coords[0][0]).toBe(0);
	expect(res2.vertices_coords[0][1]).toBe(0);
	expect(res2.vertices_coords[2][0]).toBe(3);
	expect(res2.vertices_coords[2][1]).toBe(3);
});

test("rectangle", () => {
	const res1 = ear.graph.rectangle();
	const res2 = ear.graph.rectangle(2);
	const res3 = ear.graph.rectangle(2, 1);
	expect(res1.vertices_coords[0][0]).toBe(0);
	expect(res1.vertices_coords[0][1]).toBe(0);
	expect(res2.vertices_coords[1][0]).toBe(2);
	expect(res2.vertices_coords[1][1]).toBe(0);
	expect(res3.vertices_coords[2][0]).toBe(2);
	expect(res3.vertices_coords[2][1]).toBe(1);
});

test("polygon", () => {
	expect(ear.graph.polygon().vertices_coords.length).toBe(3);
	expect(ear.graph.polygon(1).vertices_coords.length).toBe(1);
	expect(ear.graph.polygon(2).vertices_coords.length).toBe(2);
	const res1 = ear.graph.polygon(12);
	const res2 = ear.graph.polygon(1024);
	const res3 = ear.graph.polygon(12, 100);
	expect(res1.vertices_coords[0][0]).toBeCloseTo(1);
	expect(res1.vertices_coords[0][1]).toBeCloseTo(0);
	expect(res1.vertices_coords[3][0]).toBeCloseTo(0);
	expect(res1.vertices_coords[3][1]).toBeCloseTo(1);
	expect(res2.vertices_coords[0][0]).toBeCloseTo(1);
	expect(res2.vertices_coords[0][1]).toBeCloseTo(0);
	expect(res2.vertices_coords[256][0]).toBeCloseTo(0);
	expect(res2.vertices_coords[256][1]).toBeCloseTo(1);
	expect(res3.vertices_coords[0][0]).toBeCloseTo(100);
	expect(res3.vertices_coords[0][1]).toBeCloseTo(0);
});

test("kite", () => {
	const kite = ear.graph.kite();
	Array.from(Array(6)).forEach((_, i) => expect(kite.edges_assignment[i]).toBe("B"));
	expect(kite.edges_assignment.includes("M")).toBe(false);
	expect(kite.edges_assignment.includes("V")).toBe(true);
	expect(kite.edges_assignment.includes("F")).toBe(true);
});

test("fish", () => {
	const fish = ear.graph.fish();
	expect(fish.vertices_coords.length).toBe(11);
	Array.from(Array(8)).forEach((_, i) => expect(fish.edges_assignment[i]).toBe("B"));
	expect(fish.edges_assignment.includes("M")).toBe(true);
	expect(fish.edges_assignment.includes("V")).toBe(true);
	expect(fish.edges_assignment.includes("F")).toBe(true);
});

test("bird", () => {
	const bird = ear.graph.bird();
	Array.from(Array(8)).forEach((_, i) => expect(bird.edges_assignment[i]).toBe("B"));
	expect(bird.edges_assignment.includes("M")).toBe(true);
	expect(bird.edges_assignment.includes("V")).toBe(true);
	expect(bird.edges_assignment.includes("F")).toBe(true);
});

test("frog", () => {
	const frog = ear.graph.frog();
	expect(frog.edges_assignment.includes("B")).toBe(true);
	expect(frog.edges_assignment.includes("M")).toBe(true);
	expect(frog.edges_assignment.includes("V")).toBe(true);
	expect(frog.edges_assignment.includes("F")).toBe(true);
});

test("windmill", () => {
	const windmill = ear.graph.windmill();
	expect(windmill.edges_assignment.includes("B")).toBe(true);
	expect(windmill.edges_assignment.includes("M")).toBe(true);
	expect(windmill.edges_assignment.includes("V")).toBe(true);
	expect(windmill.edges_assignment.includes("F")).toBe(true);
});
