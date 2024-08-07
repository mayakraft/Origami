import fs from "fs";
import { expect, test } from "vitest";
import ear from "../src/index.js";

test("foldGraphIntoSegments, crane", () => {
	const foldfile = fs.readFileSync("./tests/files/fold/crane.fold", "utf-8");
	const fold = JSON.parse(foldfile);
	const graph = ear.graph.getFramesByClassName(fold, "creasePattern")[0];

	const result = ear.graph.foldGraphIntoSegments(graph, {
		vector: [1, -1],
		origin: [0.45, 0.45],
	});

	// these faces were intersected
	expect(Object.keys(result).map(parseFloat)).toMatchObject([
		0, 2, 3, 4, 5, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 25, 26,
		27, 28, 29, 30, 35, 36,
	]);

	// expect(ear.graph.countVertices(folded)).toBe(88);
	// expect(ear.graph.countEdges(folded)).toBe(175);
	// expect(ear.graph.countFaces(folded)).toBe(88);

	// fs.writeFileSync(
	// 	"./tests/tmp/foldGraphIntoSegments-crane-cp.fold",
	// 	JSON.stringify(graph),
	// );
	// fs.writeFileSync(
	// 	"./tests/tmp/foldGraphIntoSegments-crane-folded.fold",
	// 	JSON.stringify(folded),
	// );
});
