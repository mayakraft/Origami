import { expect, test } from "vitest";
import ear from "../src/index.js";

test("overlapBoundingBoxes, point overlap", () => {
	const box1 = { min: [0, 0], max: [1, 1] };
	const box2 = { min: [0.9, 0.9], max: [2, 2] };
	expect(ear.math.overlapBoundingBoxes(box1, box2)).toBe(true);
});

test("overlapBoundingBoxes, edge overlap", () => {
	const box1 = { min: [0, 0], max: [1, 1] };
	const box2 = { min: [1, 0], max: [2, 1] };
	expect(ear.math.overlapBoundingBoxes(box1, box2)).toBe(true);
});

test("overlapBoundingBoxes, point overlap, epsilon away", () => {
	const box1 = { min: [0, 0], max: [1, 1] };
	const box2 = { min: [1 + 1e-2, 1 + 1e-2], max: [2, 2] };
	expect(ear.math.overlapBoundingBoxes(box1, box2)).toBe(false);
});

test("overlapBoundingBoxes, edge overlap", () => {
	const box1 = { min: [0, 0], max: [1, 1] };
	const box2 = { min: [1 + 1e-2, 0], max: [2, 1] };
	expect(ear.math.overlapBoundingBoxes(box1, box2)).toBe(false);
});

// test("overlap on member types", () => {
// 	const polygon = ear.math.polygon([0, 1.15], [-1, -0.577], [1, -0.577]);
// 	const circle = ear.math.circle(1);
// 	const line = ear.math.line([1, 2], [0.5, 0]);
// 	const ray = ear.math.ray([-1, 2], [0.5, -0.1]);
// 	const segment = ear.math.segment([-2, 0.5], [2, 0.5]);
// 	const vector = ear.math.vector(0.75, 0.5);

// 	const polygon2 = ear.math.polygon([0, -1.15], [1, 0.577], [-1, 0.577]);
// 	const circle2 = ear.math.circle(1, [0.5, 0]);
// 	const line2 = ear.math.line([-1, 2], [0.5, 0]);
// 	const ray2 = ear.math.ray([1, 2], [-0.5, 0]);
// 	const segment2 = ear.math.segment([0.5, -2], [0.5, 2]);
// 	const vector2 = ear.math.vector(0, 1);
// 	const vector3 = ear.math.vector(0, 1, 0);

// 	[
// 		polygon.overlap(polygon2),
// 		// polygon.overlap(circle),
// 		// polygon.overlap(line),
// 		// polygon.overlap(ray),
// 		// polygon.overlap(segment),
// 		polygon.overlap(vector2),
// 		// circle.overlap(polygon),
// 		// circle.overlap(circle2),
// 		// circle.overlap(line),
// 		// circle.overlap(ray),
// 		// circle.overlap(segment),
// 		circle.overlap(vector),
// 		// line.overlap(polygon),
// 		// line.overlap(circle),
// 		line.overlap(line2),
// 		line.overlap(ray),
// 		line.overlap(segment),
// 		line.overlap(vector),
// 		// ray.overlap(polygon),
// 		// ray.overlap(circle),
// 		ray.overlap(line),
// 		ray.overlap(ray2),
// 		ray.overlap(segment),
// 		ray2.overlap(vector2),
// 		// segment.overlap(polygon),
// 		// segment.overlap(circle),
// 		segment.overlap(line),
// 		segment.overlap(ray),
// 		segment.overlap(segment2),
// 		segment.overlap(vector),
// 		vector2.overlap(polygon),
// 		vector.overlap(circle),
// 		vector.overlap(line),
// 		vector2.overlap(ray2),
// 		vector.overlap(segment),
// 		vector2.overlap(vector3),
// 	].forEach(overlap => expect(overlap).toBe(true));
// });

test("point on line, point at line origin", () => {
	expect(
		ear.math.overlapLinePoint(
			{ vector: [5, 5], origin: [0, 0] },
			[0, 0],
			ear.math.includeS,
		),
	).toBe(true);
	expect(
		ear.math.overlapLinePoint(
			{ vector: [5, 5], origin: [0, 0] },
			[5, 5],
			ear.math.includeS,
		),
	).toBe(true);
	expect(
		ear.math.overlapLinePoint(
			{ vector: [5, 5], origin: [0, 0] },
			[Math.SQRT1_2, Math.SQRT1_2],
			ear.math.includeS,
		),
	).toBe(true);
	expect(
		ear.math.overlapLinePoint(
			{ vector: [5, 5], origin: [0, 0] },
			[0, 0],
			ear.math.excludeS,
		),
	).toBe(false);
	expect(
		ear.math.overlapLinePoint(
			{ vector: [5, 5], origin: [0, 0] },
			[5, 5],
			ear.math.excludeS,
		),
	).toBe(false);
	expect(
		ear.math.overlapLinePoint(
			{ vector: [5, 5], origin: [0, 0] },
			[Math.SQRT1_2, Math.SQRT1_2],
			ear.math.excludeS,
		),
	).toBe(true);
});

test("point on line", () => {
	expect(ear.math.overlapLinePoint({ vector: [5, 5], origin: [0, 0] }, [2, 2])).toBe(
		true,
	);
	expect(ear.math.overlapLinePoint({ vector: [1, 1], origin: [0, 0] }, [2, 2])).toBe(
		true,
	);
	expect(ear.math.overlapLinePoint({ vector: [2, 2], origin: [0, 0] }, [2.1, 2.1])).toBe(
		true,
	);
	expect(
		ear.math.overlapLinePoint(
			{ vector: [2, 2], origin: [0, 0] },
			[2.000000001, 2.000000001],
		),
	).toBe(true);
	expect(ear.math.overlapLinePoint({ vector: [2, 2], origin: [0, 0] }, [-1, -1])).toBe(
		true,
	);

	expect(
		ear.math.overlapLinePoint(
			{ vector: [5, 5], origin: [0, 0] },
			[2, 2],
			ear.math.includeR,
		),
	).toBe(true);
	expect(
		ear.math.overlapLinePoint(
			{ vector: [1, 1], origin: [0, 0] },
			[2, 2],
			ear.math.includeR,
		),
	).toBe(true);
	expect(
		ear.math.overlapLinePoint(
			{ vector: [2, 2], origin: [0, 0] },
			[2.1, 2.1],
			ear.math.includeR,
		),
	).toBe(true);
	expect(
		ear.math.overlapLinePoint(
			{ vector: [2, 2], origin: [0, 0] },
			[2.000000001, 2.000000001],
			ear.math.includeR,
		),
	).toBe(true);
	expect(
		ear.math.overlapLinePoint(
			{ vector: [-1, -1], origin: [0, 0] },
			[2, 2],
			ear.math.includeR,
		),
	).toBe(false);
	expect(
		ear.math.overlapLinePoint(
			{ vector: [1, 1], origin: [0, 0] },
			[-0.1, -0.1],
			ear.math.includeR,
		),
	).toBe(false);
	expect(
		ear.math.overlapLinePoint(
			{ vector: [1, 1], origin: [0, 0] },
			[-0.000000001, -0.000000001],
			ear.math.includeR,
		),
	).toBe(true);
	expect(
		ear.math.overlapLinePoint(
			{ vector: [1, 1], origin: [0, 0] },
			[-0.000000001, -0.000000001],
			ear.math.excludeR,
		),
	).toBe(false);

	expect(
		ear.math.overlapLinePoint(
			{ vector: [5, 5], origin: [0, 0] },
			[2, 2],
			ear.math.includeS,
		),
	).toBe(true);
	expect(
		ear.math.overlapLinePoint(
			{ vector: [1, 1], origin: [0, 0] },
			[2, 2],
			ear.math.includeS,
		),
	).toBe(false);
	expect(
		ear.math.overlapLinePoint(
			{ vector: [2, 2], origin: [0, 0] },
			[2.1, 2.1],
			ear.math.includeS,
		),
	).toBe(false);
	expect(
		ear.math.overlapLinePoint(
			{ vector: [2, 2], origin: [0, 0] },
			[2.000000001, 2.000000001],
			ear.math.includeS,
		),
	).toBe(true);
	expect(
		ear.math.overlapLinePoint(
			{ vector: [-1, -1], origin: [0, 0] },
			[2, 2],
			ear.math.includeS,
		),
	).toBe(false);
	expect(
		ear.math.overlapLinePoint(
			{ vector: [2, 2], origin: [0, 0] },
			[2.000000001, 2.000000001],
			ear.math.excludeS,
		),
	).toBe(false);
});

test("overlap.point_on_segment_inclusive", () => {
	expect(
		ear.math.overlapLinePoint(
			{ vector: [3, 0], origin: [3, 3] },
			[4, 3],
			ear.math.includeS,
		),
	).toBe(true);
	expect(
		ear.math.overlapLinePoint(
			{ vector: [3, 0], origin: [3, 3] },
			[3, 3],
			ear.math.includeS,
		),
	).toBe(true);
	expect(
		ear.math.overlapLinePoint(
			{ vector: [3, 0], origin: [3, 3] },
			[2.9, 3],
			ear.math.includeS,
		),
	).toBe(false);
	expect(
		ear.math.overlapLinePoint(
			{ vector: [3, 0], origin: [3, 3] },
			[2.9999999999, 3],
			ear.math.includeS,
		),
	).toBe(true);
	expect(
		ear.math.overlapLinePoint(
			{ vector: [3, 0], origin: [3, 3] },
			[6.1, 3],
			ear.math.includeS,
		),
	).toBe(false);
	expect(
		ear.math.overlapLinePoint(
			{ vector: [3, 0], origin: [3, 3] },
			[6.0000000001, 3],
			ear.math.includeS,
		),
	).toBe(true);

	expect(
		ear.math.overlapLinePoint(
			{ vector: [2, 2], origin: [2, 2] },
			[3.5, 3.5],
			ear.math.includeS,
		),
	).toBe(true);
	expect(
		ear.math.overlapLinePoint(
			{ vector: [2, 2], origin: [2, 2] },
			[2.9, 3.1],
			ear.math.includeS,
		),
	).toBe(false);
	expect(
		ear.math.overlapLinePoint(
			{ vector: [2, 2], origin: [2, 2] },
			[2.99999999, 3.000000001],
			ear.math.includeS,
		),
	).toBe(true);
	// degenerate edge returns false
	expect(
		ear.math.overlapLinePoint(
			{ vector: [0, 0], origin: [2, 2] },
			[2, 2],
			ear.math.includeS,
		),
	).toBe(false);
	expect(
		ear.math.overlapLinePoint(
			{ vector: [0, 0], origin: [2, 2] },
			[2.1, 2.1],
			ear.math.includeS,
		),
	).toBe(false);
	expect(
		ear.math.overlapLinePoint(
			{ vector: [0, 0], origin: [2, 2] },
			[2.000000001, 2.00000001],
			ear.math.includeS,
		),
	).toBe(false);
});

test("point on line epsilon", () => {});

const overlapMethod = (...args) => ear.math.overlapConvexPolygonPoint(...args).overlap;

test("point in poly", () => {
	const poly = [
		[1, 0],
		[0, 1],
		[-1, 0],
		[0, -1],
	];
	expect(overlapMethod(poly, [0.0, 0.0])).toBe(true);
	expect(overlapMethod(poly, [0.999, 0.0])).toBe(true);
	expect(overlapMethod(poly, [0.9999999999, 0.0])).toBe(false);
	// edge collinear
	expect(overlapMethod(poly, [0.5, 0.5])).toBe(false);
	expect(overlapMethod(poly, [0.49, 0.49])).toBe(true);
	expect(overlapMethod(poly, [0.51, 0.51])).toBe(false);
	expect(overlapMethod(poly, [0.500000001, 0.500000001])).toBe(false);
	expect(overlapMethod(poly, [0.5, -0.5])).toBe(false);
	// expect(overlapMethod(poly, [-0.5, 0.5])).toBe(false);
	// expect(overlapMethod(poly, [-0.5, -0.5])).toBe(false);
	// polygon points
	expect(overlapMethod(poly, [1.0, 0.0])).toBe(false);
	expect(overlapMethod(poly, [0.0, 1.0])).toBe(false);
	// expect(overlapMethod(poly, [-1.0, 0.0])).toBe(false);
	expect(overlapMethod(poly, [0.0, -1.0])).toBe(false);
});

test("convex point in poly inclusive", () => {
	const poly = [
		[1, 0],
		[0, 1],
		[-1, 0],
		[0, -1],
	];
	expect(overlapMethod(poly, [0.0, 0.0], ear.math.include)).toBe(true);
	expect(overlapMethod(poly, [0.999, 0.0], ear.math.include)).toBe(true);
	expect(overlapMethod(poly, [0.9999999999, 0.0], ear.math.include)).toBe(true);
	expect(overlapMethod(poly, [1.1, 0.0], ear.math.include)).toBe(false);
	expect(overlapMethod(poly, [1.000000001, 0.0], ear.math.include)).toBe(true);
	// edge collinear
	expect(overlapMethod(poly, [0.5, 0.5], ear.math.include)).toBe(true);
	expect(overlapMethod(poly, [0.49, 0.49], ear.math.include)).toBe(true);
	expect(overlapMethod(poly, [0.499999999, 0.499999999], ear.math.include)).toBe(true);
	expect(overlapMethod(poly, [0.51, 0.51], ear.math.include)).toBe(false);
	expect(overlapMethod(poly, [0.500000001, 0.500000001], ear.math.include)).toBe(true);
	expect(overlapMethod(poly, [0.5, -0.5], ear.math.include)).toBe(true);
	expect(overlapMethod(poly, [-0.5, 0.5], ear.math.include)).toBe(true);
	expect(overlapMethod(poly, [-0.5, -0.5], ear.math.include)).toBe(true);
	// polygon points
	expect(overlapMethod(poly, [1.0, 0.0], ear.math.include)).toBe(true);
	expect(overlapMethod(poly, [0.0, 1.0], ear.math.include)).toBe(true);
	expect(overlapMethod(poly, [-1.0, 0.0], ear.math.include)).toBe(true);
	expect(overlapMethod(poly, [0.0, -1.0], ear.math.include)).toBe(true);
});

test("convex point in poly exclusive", () => {
	const poly = [
		[1, 0],
		[0, 1],
		[-1, 0],
		[0, -1],
	];
	expect(overlapMethod(poly, [0.0, 0.0], ear.math.exclude)).toBe(true);
	expect(overlapMethod(poly, [0.999, 0.0], ear.math.exclude)).toBe(true);
	expect(overlapMethod(poly, [0.9999999999, 0.0], ear.math.exclude)).toBe(false);
	// edge collinear
	expect(overlapMethod(poly, [0.5, 0.5], ear.math.exclude)).toBe(false);
	expect(overlapMethod(poly, [0.49, 0.49], ear.math.exclude)).toBe(true);
	expect(overlapMethod(poly, [0.499999999, 0.499999999], ear.math.exclude)).toBe(false);
	expect(overlapMethod(poly, [0.51, 0.51], ear.math.exclude)).toBe(false);
	expect(overlapMethod(poly, [0.5, -0.5], ear.math.exclude)).toBe(false);
	expect(overlapMethod(poly, [-0.5, 0.5], ear.math.exclude)).toBe(false);
	expect(overlapMethod(poly, [-0.5, -0.5], ear.math.exclude)).toBe(false);
	// polygon points
	expect(overlapMethod(poly, [1.0, 0.0], ear.math.exclude)).toBe(false);
	expect(overlapMethod(poly, [0.0, 1.0], ear.math.exclude)).toBe(false);
	expect(overlapMethod(poly, [-1.0, 0.0], ear.math.exclude)).toBe(false);
	expect(overlapMethod(poly, [0.0, -1.0], ear.math.exclude)).toBe(false);
});
