import { expect, test } from "vitest";
import fs from "fs";
import xmldom from "@xmldom/xmldom";
import ear from "../src/index.js";

ear.window = xmldom;

const nonPlanarShape = () => ({
	vertices_coords: [[1, 0], [3, 2], [0, 4], [-3, 3], [-1, 2], [-2, -2], [4, -1]],
	edges_vertices: [[0, 1], [2, 0], [3, 4], [4, 5], [6, 5], [1, 6], [2, 3]],
	edges_assignment: ["B", "B", "B", "B", "B", "B", "B"],
	faces_vertices: [[0, 2, 3, 4, 5, 6, 1]]
});

/**
 * @param {FOLD} graph
 * @param {(VecLine2|[[number, number], [number, number]])[]} params
 * @param {VecLine2[]} resultLines
 * @param {object} arrows
 * @param {string} name
 */
const renderAxiomStepSVG = (graph, params, resultLines, arrows, name = "") => {
	// clip the lines in the boundary of the graph
	// const polygon = ear.graph.boundaryPolygon(graph);
	const polygon = ear.math.convexHull(graph.vertices_coords)
		.map(i => graph.vertices_coords[i]);
	const vmax = Math.max(...ear.math.boundingBox(polygon).span)

	// create the svg from the graph
	const svg = ear.convert.foldToSvg(graph, {
		strokeWidth: 0.02,
		padding: 0.1,
	});
	const lineLayer = svg.g()
		.stroke("blue")
		.strokeLinecap("round")
		.strokeDasharray(vmax / 20);
	const paramLayer = svg.g()
		.stroke("#8b3")
		.fill("#8b3");
	const arrowLayer = svg.g()
		.stroke("black");

	// draw the result lines from computing the axioms, these are the fold lines
	resultLines
		.map(line => ear.math.clipLineConvexPolygon(polygon, line))
		.filter(a => a !== undefined)
		.forEach(seg => lineLayer.line(...seg));

	// draw the input parameters to the axiom. this includes points and lines
	params
		.filter(param => param.constructor === Array)
		.forEach(param => paramLayer.circle(vmax / 66).center(param[0], param[1]));
	params
		.filter(param => param.vector)
		.map(param => ear.math.clipLineConvexPolygon(polygon, param))
		.filter(a => a !== undefined)
		.forEach(segment => paramLayer.line(segment[0], segment[1]));

	// draw an arrow by passing the object into the constructor layer.arrow()
	arrows.forEach(arrow => arrowLayer.arrow(arrow));

	// serialize to string and write file
	const serialzer = new xmldom.XMLSerializer();
	const string = serialzer.serializeToString(svg);
	fs.writeFileSync(`./tests/tmp/${name}.svg`, string);
};

test("axiom1Arrows, square A", () => {
	const graph = ear.graph.square();
	// const polygon = ear.graph.boundaryPolygon(graph);
	const params = [[0, 0], [1, 1]];
	const axiomResults = ear.axiom.validAxiom1(graph, ...params);
	const arrowResults = ear.diagram.axiom1Arrows(graph, ...params);
	renderAxiomStepSVG(graph, params, axiomResults, arrowResults, "svg-axiom-square-1-A");
	expect(arrowResults).toHaveLength(1);
	arrowResults.forEach(arrow => expect(arrow).toMatchObject({
		head: { width: 0.0666, height: 0.1 },
		bend: -0.3,
	}));
});

test("axiom1Arrows, square B", () => {
	const graph = ear.graph.square();
	// const polygon = ear.graph.boundaryPolygon(graph);
	const params = [[0.45, 0.45], [0.55, 0.55]];
	const axiomResults = ear.axiom.validAxiom1(graph, ...params);
	const arrowResults = ear.diagram.axiom1Arrows(graph, ...params);
	renderAxiomStepSVG(graph, params, axiomResults, arrowResults, "svg-axiom-square-1-B");
	expect(arrowResults).toHaveLength(1);
	arrowResults.forEach(arrow => expect(arrow).toMatchObject({
		head: { width: 0.0666, height: 0.1 },
		bend: -0.3,
	}));
});

test("axiom2Arrows, square A", () => {
	const graph = ear.graph.square();
	// const polygon = ear.graph.boundaryPolygon(graph);
	const params = [[0, 0], [1, 1]];
	const axiomResults = ear.axiom.validAxiom2(graph, ...params);
	const arrowResults = ear.diagram.axiom2Arrows(graph, ...params);
	renderAxiomStepSVG(graph, params, axiomResults, arrowResults, "svg-axiom-square-2-A");
	expect(arrowResults).toHaveLength(1);
	arrowResults.forEach(arrow => expect(arrow).toMatchObject({
		head: { width: 0.0666, height: 0.1 },
		bend: 0.3,
	}));
});

test("axiom2Arrows, square B", () => {
	const graph = ear.graph.square();
	// const polygon = ear.graph.boundaryPolygon(graph);
	const params = [[0.45, 0.45], [0.55, 0.55]];
	const axiomResults = ear.axiom.validAxiom2(graph, ...params);
	const arrowResults = ear.diagram.axiom2Arrows(graph, ...params);
	renderAxiomStepSVG(graph, params, axiomResults, arrowResults, "svg-axiom-square-2-B");
	expect(arrowResults).toHaveLength(1);
	arrowResults.forEach(arrow => expect(arrow).toMatchObject({
		head: { width: 0.0666, height: 0.1 },
		bend: 0.3,
	}));
});

// test("axiom3Arrows, square A", () => {
// 	// input lines intersect at the corner, only one axiom solution
// 	const graph = ear.graph.square();
// 	const polygon = ear.graph.boundaryPolygon(graph);
// 	const params = [{ vector: [1, 0], origin: [0, 0] }, { vector: [1, 1], origin: [0, 0] }];
// 	const axiomResults = ear.axiom.validAxiom3(graph, ...params);
// 	const arrowResults = ear.diagram.axiom3Arrows(graph, ...params);
// 	renderAxiomStepSVG(graph, params, axiomResults, arrowResults, "svg-axiom-square-3-A");
// 	expect(arrowResults).toHaveLength(2);
// 	arrowResults.forEach(arrow => expect(arrow).toMatchObject({
// 		head: { width: 0.0666, height: 0.1 },
// 		bend: -0.3,
// 	}));
// });

test("axiom3Arrows, square B", () => {
	// input lines intersect in the middle, two axiom solutions
	const graph = ear.graph.square();
	// const polygon = ear.graph.boundaryPolygon(graph);
	const params = [{ vector: [1, 0], origin: [0, 0.5] }, { vector: [1, 1], origin: [0, 0] }];
	const axiomResults = ear.axiom.validAxiom3(graph, ...params);
	const arrowResults = ear.diagram.axiom3Arrows(graph, ...params);
	renderAxiomStepSVG(graph, params, axiomResults, arrowResults, "svg-axiom-square-3-B");
	expect(arrowResults).toHaveLength(2);
	arrowResults.forEach(arrow => expect(arrow).toMatchObject({
		head: { width: 0.0666, height: 0.1 },
		bend: -0.3,
	}));
});

test("axiom3Arrows, square C", () => {
	// input lines are parallel
	const graph = ear.graph.square();
	// const polygon = ear.graph.boundaryPolygon(graph);
	const params = [{ vector: [1, 1], origin: [0, 0] }, { vector: [1, 1], origin: [0, 0.5] }];
	const axiomResults = ear.axiom.validAxiom3(graph, ...params);
	const arrowResults = ear.diagram.axiom3Arrows(graph, ...params);
	renderAxiomStepSVG(graph, params, axiomResults, arrowResults, "svg-axiom-square-3-C");
	expect(arrowResults).toHaveLength(1);
	arrowResults.forEach(arrow => expect(arrow).toMatchObject({
		head: { width: 0.0666, height: 0.1 },
		bend: -0.3,
	}));
});

test("axiom4Arrows, square", () => {
	const graph = ear.graph.square();
	// const polygon = ear.graph.boundaryPolygon(graph);
	const params = [{ vector: [1, 1], origin: [0, 0] }, [0.5, 1]];
	const axiomResults = ear.axiom.validAxiom4(graph, ...params);
	const arrowResults = ear.diagram.axiom4Arrows(graph, ...params);
	renderAxiomStepSVG(graph, params, axiomResults, arrowResults, "svg-axiom-square-4");
	expect(arrowResults).toHaveLength(1);
	arrowResults.forEach(arrow => expect(arrow).toMatchObject({
		head: { width: 0.0666, height: 0.1 },
		bend: -0.3,
	}));
});

test("axiom5Arrows, square A", () => {
	const graph = ear.graph.square();
	// const polygon = ear.graph.boundaryPolygon(graph);
	const params = [{ vector: [0, 1], origin: [0.5, 0.5] }, [0, 0], [1, 0]];
	const axiomResults = ear.axiom.validAxiom5(graph, ...params);
	const arrowResults = ear.diagram.axiom5Arrows(graph, ...params);
	renderAxiomStepSVG(graph, params, axiomResults, arrowResults, "svg-axiom-square-5-A");
	// expect(arrowResults).toHaveLength(1);
	arrowResults.forEach(arrow => expect(arrow).toMatchObject({
		head: { width: 0.0666, height: 0.1 },
		bend: -0.3,
	}));
});

test("axiom5Arrows, square B", () => {
	const graph = ear.graph.square();
	// const polygon = ear.graph.boundaryPolygon(graph);
	const params = [{ vector: [0, 1], origin: [0.5, 0.5] }, [0, 0.5], [0.6, 0.25]];
	const axiomResults = ear.axiom.validAxiom5(graph, ...params);
	const arrowResults = ear.diagram.axiom5Arrows(graph, ...params);
	renderAxiomStepSVG(graph, params, axiomResults, arrowResults, "svg-axiom-square-5-B");
	expect(arrowResults).toHaveLength(2);
	arrowResults.forEach(arrow => expect(arrow).toMatchObject({
		head: { width: 0.0666, height: 0.1 },
		bend: -0.3,
	}));
});

test("axiom5Arrows, square C", () => {
	const graph = ear.graph.square();
	// const polygon = ear.graph.boundaryPolygon(graph);
	const params = [{ vector: [0, 1], origin: [0.5, 0.5] }, [0, 0.5], [0.75, 0.25]];
	const axiomResults = ear.axiom.validAxiom5(graph, ...params);
	const arrowResults = ear.diagram.axiom5Arrows(graph, ...params);
	renderAxiomStepSVG(graph, params, axiomResults, arrowResults, "svg-axiom-square-5-C");
	// expect(arrowResults).toHaveLength(0);
	arrowResults.forEach(arrow => expect(arrow).toMatchObject({
		head: { width: 0.0666, height: 0.1 },
		bend: -0.3,
	}));
});

test("axiom6Arrows, square", () => {
	const graph = ear.graph.square();
	// const polygon = ear.graph.boundaryPolygon(graph);
	const params = [
		{ vector: [0, 1], origin: [1, 0] },
		{ vector: [1, 0], origin: [0, 1] },
		[0.75, 0],
		[0, 0.75],
	];
	const axiomResults = ear.axiom.validAxiom6(graph, ...params);
	const arrowResults = ear.diagram.axiom6Arrows(graph, ...params);
	renderAxiomStepSVG(graph, params, axiomResults, arrowResults, "svg-axiom-square-6");
	expect(arrowResults).toHaveLength(6);
	arrowResults.forEach(arrow => expect(arrow).toMatchObject({
		head: { width: 0.0666, height: 0.1 },
		bend: 0.3,
	}));
});

test("axiom7Arrows, square A", () => {
	const graph = ear.graph.square();
	// const polygon = ear.graph.boundaryPolygon(graph);
	const params = [
		{ vector: [1, 0], origin: [0.5, 0.25] },
		{ vector: [1, 1], origin: [0, 0] },
		[0.5, 0.0],
	];
	const axiomResults = ear.axiom.validAxiom7(graph, ...params);
	const arrowResults = ear.diagram.axiom7Arrows(graph, ...params);
	renderAxiomStepSVG(graph, params, axiomResults, arrowResults, "svg-axiom-square-7-A");
	expect(arrowResults).toHaveLength(2);
	expect(arrowResults).toMatchObject([{
		head: { width: 0.0666, height: 0.1 },
		bend: 0.3,
	}, {
		head: { width: 0.0666, height: 0.1 },
		bend: -0.3,
	}]);
});

test("axiom7Arrows, square B", () => {
	const graph = ear.graph.square();
	// const polygon = ear.graph.boundaryPolygon(graph);
	const params = [
		{ vector: [1, 0], origin: [0.5, 0.5] },
		{ vector: [1, 1], origin: [0, 0] },
		[0.75, 0.0],
	];
	const axiomResults = ear.axiom.validAxiom7(graph, ...params);
	const arrowResults = ear.diagram.axiom7Arrows(graph, ...params);
	renderAxiomStepSVG(graph, params, axiomResults, arrowResults, "svg-axiom-square-7-B");
	// expect(arrowResults).toHaveLength(0);
});

test("axiom1Arrows, non-convex", () => {
	const graph = nonPlanarShape();
	// const polygon = ear.math.convexHull(graph.vertices_coords)
	// 	.map(i => graph.vertices_coords[i]);
	const params = [[0, 2], [3, 1]];
	const axiomResults = ear.axiom.validAxiom1(graph, ...params);
	const arrowResults = ear.diagram.axiom1Arrows(graph, ...params);
	renderAxiomStepSVG(graph, params, axiomResults, arrowResults, "svg-axiom-non-convex-1");
});

test("axiom2Arrows, non-convex", () => {
	const graph = nonPlanarShape();
	// const polygon = ear.math.convexHull(graph.vertices_coords)
	// 	.map(i => graph.vertices_coords[i]);
	const params = [[0, 2], [3, 1]];
	const axiomResults = ear.axiom.validAxiom2(graph, ...params);
	const arrowResults = ear.diagram.axiom2Arrows(graph, ...params);
	renderAxiomStepSVG(graph, params, axiomResults, arrowResults, "svg-axiom-non-convex-2");
});

// test("axiom3Arrows, non-convex", () => {
// 	const graph = nonPlanarShape();
// 	const polygon = ear.math.convexHull(graph.vertices_coords)
// 		.map(i => graph.vertices_coords[i]);
// 	const params = [{ vector: [1, 0], origin: [0, 0] }, { vector: [1, 1], origin: [0, 0] }];
// 	const axiomResults = ear.axiom.validAxiom3(graph, ...params);
// 	const arrowResults = ear.diagram.axiom3Arrows(graph, ...params);
// 	renderAxiomStepSVG(graph, params, axiomResults, arrowResults, "svg-axiom-non-convex-3");
// });

test("axiom4Arrows, non-convex", () => {
	const graph = nonPlanarShape();
	// const polygon = ear.math.convexHull(graph.vertices_coords)
	// 	.map(i => graph.vertices_coords[i]);
	const params = [{ vector: [1, 1], origin: [0, 0] }, [0.5, 1]];
	const axiomResults = ear.axiom.validAxiom4(graph, ...params);
	const arrowResults = ear.diagram.axiom4Arrows(graph, ...params);
	renderAxiomStepSVG(graph, params, axiomResults, arrowResults, "svg-axiom-non-convex-4");
});

test("axiom5Arrows, non-convex", () => {
	const graph = nonPlanarShape();
	// const polygon = ear.math.convexHull(graph.vertices_coords)
	// 	.map(i => graph.vertices_coords[i]);
	const params = [{ vector: [0, 1], origin: [0.5, 0.5] }, [0, 0], [1, 0]];
	const axiomResults = ear.axiom.validAxiom5(graph, ...params);
	const arrowResults = ear.diagram.axiom5Arrows(graph, ...params);
	renderAxiomStepSVG(graph, params, axiomResults, arrowResults, "svg-axiom-non-convex-5");
});

test("axiom6Arrows, non-convex", () => {
	const graph = nonPlanarShape();
	// const polygon = ear.math.convexHull(graph.vertices_coords)
	// 	.map(i => graph.vertices_coords[i]);
	const params = [
		{ vector: [0, 1], origin: [1, 0] },
		{ vector: [1, 0], origin: [0, 1] },
		[0.75, 0],
		[0, 0.75],
	];
	const axiomResults = ear.axiom.validAxiom6(graph, ...params);
	const arrowResults = ear.diagram.axiom6Arrows(graph, ...params);
	renderAxiomStepSVG(graph, params, axiomResults, arrowResults, "svg-axiom-non-convex-6");
});

test("axiom7Arrows, non-convex", () => {
	const graph = nonPlanarShape();
	// const polygon = ear.math.convexHull(graph.vertices_coords)
	// 	.map(i => graph.vertices_coords[i]);
	const params = [
		{ vector: [1, 0], origin: [0.5, 0.5] },
		{ vector: [1, 1], origin: [0, 0] },
		[0.75, 0.25],
	];
	const axiomResults = ear.axiom.validAxiom7(graph, ...params);
	const arrowResults = ear.diagram.axiom7Arrows(graph, ...params);
	renderAxiomStepSVG(graph, params, axiomResults, arrowResults, "svg-axiom-non-convex-7");
});
