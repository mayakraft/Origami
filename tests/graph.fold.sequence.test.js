import fs from "fs";
import { expect, test } from "vitest";
import ear from "../src/index.js";

const randomAxiom1 = (graph, points) => {
	return ear.axiom.validAxiom1(graph, points[0], points[1]).shift();
};

const randomAxiom2 = (graph, points) => {
	return ear.axiom.validAxiom2(graph, points[0], points[1]).shift();
};

const randomAxiom3 = (graph, lines) => {
	const solutions = ear.axiom.validAxiom3(graph, lines[0], lines[1])
		.filter(a => a !== undefined);
	const index = Math.floor(Math.random() * solutions.length);
	return solutions[index]
};

const randomAxiom4 = (graph, lines, points) => {
	return ear.axiom.validAxiom4(graph, lines[0], points[0]).shift();
};

const makeRandomFold = (graph, vertices_coordsFolded) => {
	if (!vertices_coordsFolded) {
		vertices_coordsFolded = ear.graph.makeVerticesCoordsFlatFolded(graph);
	}
	const folded = {
		...graph,
		vertices_coords: vertices_coordsFolded,
	};

	// point info
	const clusters_vertices = ear.graph.getVerticesClusters(folded)
		.sort((a, b) => b.length - a.length);
	const points = clusters_vertices
		.map(arr => folded.vertices_coords[arr[0]]);

	// line info
	const { lines, edges_line } = ear.graph.getEdgesLine(folded);
	const lines_edges = ear.graph.invertFlatToArrayMap(edges_line);
	const linesSorted = lines
		.map((_, i) => i)
		.sort((a, b) => lines_edges[b].length - lines_edges[a].length)
		.map(l => lines[l]);

	const solution1 = randomAxiom1(folded, points);
	const solution2 = randomAxiom2(folded, points);
	const solution3 = randomAxiom3(folded, linesSorted);
	const solution4 = randomAxiom4(folded, linesSorted, points);

	const definedSolutions = [
		solution1,
		solution2,
		solution3,
		solution4,
	].filter(a => a !== undefined);

	// todo: can create a convex hull, single face, intersect with the
	// single face, if the face is split into two we have a valid overlap.
	// i think.
	const facesSplitCount = definedSolutions
		.map(line => ear.graph.splitGraphWithLine(structuredClone(folded), line)
			.faces
			.map
			.filter(arr => arr.length > 1).length > 0);

	const validSolutions = definedSolutions
		.filter((_, i) => facesSplitCount[i]);

	const randomIndex = Math.floor(Math.random() * validSolutions.length);
	const randomSolution = validSolutions[randomIndex];

	if (!randomSolution) { return undefined; }

	// random F, M, or V
	const assignment = Array.from("MVF")[Math.floor(Math.random() * 3)];

	return ear.graph.foldLine(graph, randomSolution, {
		assignment,
		// foldAngle,
		vertices_coordsFolded,
	});
};

test("random sequence", () => {
	const LOOPS = 6;

	const graph = ear.graph.square();
	let vertices_coordsFolded = ear.graph.makeVerticesCoordsFlatFolded(graph);
	const file_frames = [];

	const FOLD = {
		...structuredClone(graph),
		file_frames,
	};

	const startTime = performance.now();

	for (let i = 0; i < LOOPS; i += 1) {
		const loopStart = performance.now();
		const result = makeRandomFold(graph, vertices_coordsFolded);
		if (!result) { continue; }

		// delete graph.faceOrders;
		vertices_coordsFolded = ear.graph.makeVerticesCoordsFlatFolded(graph);

		// make cp and folded form, solve face orders for folded form.
		const creasePattern = structuredClone({
			...graph,
			frame_classes: ["creasePattern"],
		});
		const foldedForm = structuredClone({
			...graph,
			vertices_coords: vertices_coordsFolded,
			frame_classes: ["foldedForm"],
		});

		// run the layer solver
		graph.faceOrders = ear.layer(foldedForm).faceOrders();

		// add to FOLD
		file_frames.push(creasePattern);
		file_frames.push(foldedForm);

		const loopEnd = performance.now();
		// console.log(`loop ${i}: ${loopEnd - loopStart} , total: ${loopEnd - startTime}`);
		if (loopEnd - loopStart > 5_000) { break; }
		if (loopEnd - startTime > 10_000) { break; }
	}

	fs.writeFileSync(
		"./tests/tmp/sequence-random-fold.fold",
		JSON.stringify(FOLD),
		"utf8",
	);
});
