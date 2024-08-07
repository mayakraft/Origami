import fs from "fs";
import { expect, test } from "vitest";
import ear from "../src/index.js";

test("makeSolverConstraintsFlat, four panel square", () => {
	const foldfile = fs.readFileSync("./tests/files/fold/panels-4x2.fold", "utf-8");
	const fold = JSON.parse(foldfile);
	const folded = ear.graph.getFramesByClassName(fold, "foldedForm")[0];
	ear.graph.populate(folded);

	const {
		constraints: { taco_taco, taco_tortilla, tortilla_tortilla, transitivity },
	} = ear.layer.makeSolverConstraintsFlat(folded);

	// only two taco-tacos, one on the top and one bottom
	expect(taco_taco).toMatchObject([
		[0, 2, 1, 3],
		[4, 6, 5, 7],
	]);

	expect(taco_tortilla).toMatchObject([
		[1, 3, 2],
		[5, 7, 6],
	]);

	// tortilla-tortilla between 4 sets of pairs, 0-4, 1-5, 2-6, 3-7
	expect(tortilla_tortilla).toMatchObject([
		[0, 4, 1, 5],
		[0, 4, 2, 6],
		[0, 4, 3, 7],
		[1, 5, 2, 6],
		[1, 5, 3, 7],
		[2, 6, 3, 7],
	]);

	expect(transitivity).toMatchObject([]);
});

test("makeSolverConstraintsFlat, strip weave", () => {
	const foldfile = fs.readFileSync("./tests/files/fold/strip-weave.fold", "utf-8");
	const fold = JSON.parse(foldfile);
	const folded = ear.graph.getFramesByClassName(fold, "foldedForm")[0];
	ear.graph.populate(folded);

	const {
		constraints: { taco_taco, taco_tortilla, tortilla_tortilla, transitivity },
		faces_winding,
	} = ear.layer.makeSolverConstraintsFlat(folded);

	// interestingly, this model, which obviously has various different layer
	// solutions, results in no information for the solver.
	expect(taco_taco).toMatchObject([]);
	expect(taco_tortilla).toMatchObject([]);
	expect(tortilla_tortilla).toMatchObject([]);
	expect(transitivity).toMatchObject([[0, 1, 4]]);

	expect(faces_winding).toMatchObject([true, false, true, false, false, true, false]);
});

test("makeSolverConstraintsFlat, zig-zag panels", () => {
	const foldfile = fs.readFileSync("./tests/files/fold/panels-zig-zag.fold", "utf-8");
	const fold = JSON.parse(foldfile);
	const folded = ear.graph.getFramesByClassName(fold, "foldedForm")[0];
	ear.graph.populate(folded);

	const {
		constraints: { taco_taco, taco_tortilla, tortilla_tortilla, transitivity },
	} = ear.layer.makeSolverConstraintsFlat(folded);

	expect(taco_taco).toMatchObject([
		[0, 2, 4, 3],
		[3, 1, 4, 2],
	]);

	expect(taco_tortilla).toMatchObject([
		[0, 1, 4],
		[3, 0, 4],
		[2, 1, 3],
		[1, 0, 2],
	]);

	expect(tortilla_tortilla).toMatchObject([]);

	expect(transitivity).toMatchObject([[0, 1, 3]]);
});

// test("makeSolverConstraintsFlat, flat grid", () => {
// 	const foldfile = fs.readFileSync("./tests/files/fold/layers-flat-grid.fold", "utf-8");
// 	const fold = JSON.parse(foldfile);
// 	const folded = {
// 		...fold,
// 		vertices_coords: ear.graph.makeVerticesCoordsFlatFolded(fold),
// 	}
// 	ear.graph.populate(folded);

// 	const result = ear.layer.makeSolverConstraintsFlat(folded);

// 	expect(result.constraints.taco_taco).toHaveLength(0);
// 	expect(result.constraints.taco_tortilla).toHaveLength(0);
// 	expect(result.constraints.tortilla_tortilla).toHaveLength(30);
// 	expect(result.constraints.transitivity).toHaveLength(0);
// 	expect(result).toMatchObject({
// 		facePairs: [
// 			"2 3", "4 23", "5 51", "6 50", "7 49", "8 48", "24 25", "26 32", "27 54", "28 55", "29 56", "30 31", "33 34", "35 36", "37 38", "39 40", "41 42", "43 44", "52 63", "53 62", "59 66",
// 		],
// 		orders: {
// 			"2 3": 1, "24 25": 1, "30 31": 1, "33 34": 1, "37 38": 1, "41 42": 1,
// 		}
// 	});
// });

test("makeSolverConstraintsFlat, triangle strip", () => {
	const fileStrip1 = fs.readFileSync("./tests/files/fold/triangle-strip.fold", "utf-8");
	const fileStrip2 = fs.readFileSync("./tests/files/fold/triangle-strip-2.fold", "utf-8");
	const foldStrip1 = JSON.parse(fileStrip1);
	const foldStrip2 = JSON.parse(fileStrip2);
	const folded1 = ear.graph.getFramesByClassName(foldStrip1, "foldedForm")[0];
	const folded2 = ear.graph.getFramesByClassName(foldStrip2, "foldedForm")[0];
	ear.graph.populate(folded1);
	ear.graph.populate(folded2);

	const res1 = ear.layer.makeSolverConstraintsFlat(folded1);
	expect(res1.constraints.taco_taco.length).toBe(0);
	expect(res1.constraints.taco_tortilla.length).toBe(0);
	expect(res1.constraints.tortilla_tortilla.length).toBe(0);
	expect(res1.constraints.transitivity.length).toBe(0);

	const {
		constraints: { taco_taco, taco_tortilla, tortilla_tortilla, transitivity },
	} = ear.layer.makeSolverConstraintsFlat(folded2);

	expect(taco_taco).toMatchObject([
		[15, 4, 16, 5],
		[17, 6, 27, 7],
		[25, 8, 26, 9],
		[23, 10, 24, 11],
		[21, 12, 22, 13],
	]);

	expect(taco_tortilla.length).toBe(0);

	expect(tortilla_tortilla).toMatchObject([
		[13, 19, 21, 20],
		[11, 21, 23, 22],
		[11, 21, 10, 13],
		[9, 23, 25, 24],
		[9, 23, 8, 11],
		[7, 25, 27, 26],
		[7, 25, 6, 9],
		[5, 27, 16, 17],
		[5, 27, 4, 7],
		[3, 16, 14, 15],
		[3, 16, 2, 5],
		[1, 14, 0, 3],
		[14, 15, 2, 5],
		[16, 17, 4, 7],
		[26, 27, 9, 6],
		[24, 25, 11, 8],
		[22, 23, 13, 10],
	]);

	expect(transitivity).toMatchObject([
		[2, 3, 14],
		[18, 19, 20],
	]);
});

test("makeSolverConstraintsFlat, bird base", () => {
	const cp = ear.graph.bird();
	const folded = {
		...cp,
		vertices_coords: ear.graph.makeVerticesCoordsFlatFolded(cp),
	};
	ear.graph.populate(folded);

	expect(ear.graph.getEdgesEdgesCollinearOverlap(folded).flat().length).toBe(194);
	expect(ear.graph.getEdgesFacesOverlap(folded).flat().length).toBe(16);

	const {
		constraints: { taco_taco, taco_tortilla, tortilla_tortilla, transitivity },
	} = ear.layer.makeSolverConstraintsFlat(folded);

	expect(taco_taco).toMatchObject([
		// long 22.5 edges, one side, 8 faces
		// faces: 0-1, 5-6, 4-7, 8-11
		[0, 4, 1, 7],
		[0, 5, 1, 6],
		[0, 8, 1, 11],
		[4, 5, 7, 6],
		[4, 8, 7, 11],
		[5, 8, 6, 11],

		// long 22.5 edges, the other side, 8 faces
		// faces: 2-3, 13-14, 9-10, 12-15
		[9, 12, 10, 15],
		[9, 13, 10, 14],
		[9, 2, 10, 3],
		[12, 13, 15, 14],
		[12, 2, 15, 3],
		[13, 2, 14, 3],

		// inside reverse fold (under armpit), one side: 0-4, 5-8
		[0, 5, 4, 8],
		// top 45 triangle hypotenuse, one side: 6-16, 7-19
		[7, 6, 19, 16],
		// inside reverse fold (under armpit), the other side: 3-13, 9-12
		[9, 3, 12, 13],
		// top 45 triangle hypotenuse, the other side: 14-18, 15-17
		[15, 14, 17, 18],
	]);

	expect(taco_tortilla).toMatchObject([
		[0, 1, 4],
		[0, 11, 4],
		[5, 1, 8],
		[5, 11, 8],
		[9, 2, 12],
		[9, 10, 12],
		[3, 2, 13],
		[3, 10, 13],
		[6, 1, 7],
		[6, 19, 7],
		[6, 11, 7],
		[6, 16, 7],
		[14, 2, 15],
		[14, 18, 15],
		[14, 10, 15],
		[14, 17, 15],
		[0, 6, 4],
		[0, 7, 4],
		[5, 6, 8],
		[5, 7, 8],
		[9, 14, 12],
		[9, 15, 12],
		[3, 14, 13],
		[3, 15, 13],
	]);

	expect(tortilla_tortilla).toMatchObject([
		[1, 2, 11, 10],
		[18, 19, 17, 16],
		[1, 19, 11, 16],
		[2, 18, 10, 17],
		[1, 19, 6, 6],
		[1, 19, 7, 7],
		[2, 18, 14, 14],
		[2, 18, 15, 15],
		[11, 16, 6, 6],
		[11, 16, 7, 7],
		[10, 17, 14, 14],
		[10, 17, 15, 15],
	]);

	expect(transitivity).toMatchObject([
		[0, 5, 7],
		[0, 5, 11],
		[0, 6, 7],
		[0, 6, 8],
		[0, 6, 11],
		[0, 7, 8],
		[0, 7, 11],
		[1, 4, 5],
		[1, 4, 6],
		[1, 4, 8],
		[1, 4, 11],
		[1, 5, 7],
		[1, 5, 11],
		[1, 6, 8],
		[1, 6, 11],
		[1, 7, 8],
		[1, 7, 11],
		[2, 9, 13],
		[2, 9, 14],
		[2, 9, 15],
		[2, 10, 12],
		[2, 10, 13],
		[2, 10, 14],
		[2, 10, 15],
		[2, 12, 13],
		[2, 12, 14],
		[2, 13, 15],
		[3, 9, 14],
		[3, 9, 15],
		[3, 10, 12],
		[3, 10, 14],
		[3, 10, 15],
		[3, 12, 14],
		[3, 14, 15],
		[4, 5, 11],
		[4, 6, 8],
		[4, 6, 11],
		[5, 7, 11],
		[6, 7, 8],
		[9, 13, 15],
		[9, 14, 15],
		[10, 12, 13],
		[10, 12, 14],
		[10, 13, 15],
	]);
});

test("makeSolverConstraintsFlat, kabuto", () => {
	const foldfile = fs.readFileSync("./tests/files/fold/kabuto.fold", "utf-8");
	const fold = JSON.parse(foldfile);
	const folded = ear.graph.getFramesByClassName(fold, "foldedForm")[0];
	ear.graph.populate(folded);

	// remove existing solution from FOLD file
	delete folded.faceOrders;

	const { constraints, facePairs, orders } = ear.layer.makeSolverConstraintsFlat(folded);

	const expectedJSON = fs.readFileSync(
		"./tests/files/json/kabuto-constraints.json",
		"utf-8",
	);
	const expected = JSON.parse(expectedJSON);

	expect(constraints).toMatchObject(expected);
	expect(ear.graph.getEdgesEdgesCollinearOverlap(folded).flat().length).toBe(104);
	expect(ear.graph.getEdgesFacesOverlap(folded).flat().length).toBe(138);
	expect(constraints.taco_taco.length).toMatchObject(21);
	expect(constraints.taco_tortilla.length).toMatchObject(88);
	expect(constraints.tortilla_tortilla.length).toMatchObject(0);
	expect(constraints.transitivity.length).toMatchObject(258);
	expect(Object.keys(facePairs).length).toBe(117);
	expect(Object.keys(orders).length).toBe(20);
});

test("makeSolverConstraintsFlat, crane", () => {
	const foldfile = fs.readFileSync("./tests/files/fold/crane.fold", "utf-8");
	const fold = JSON.parse(foldfile);
	// const cp = ear.graph.getFramesByClassName(fold, "creasePattern")[0];
	// console.log(JSON.stringify(cp));
	const folded = ear.graph.getFramesByClassName(fold, "foldedForm")[0];
	ear.graph.populate(folded);

	// remove existing solution from FOLD file
	delete folded.faceOrders;

	const epsilon = 1e-4;

	const {
		constraints: { taco_taco, taco_tortilla, tortilla_tortilla, transitivity },
		facePairs,
		orders,
	} = ear.layer.makeSolverConstraintsFlat(folded, epsilon);

	expect(ear.graph.getEdgesEdgesCollinearOverlap(folded, epsilon).flat().length).toBe(
		554,
	);
	expect(ear.graph.getFacesEdgesOverlap(folded, epsilon).flat().length).toBe(1167);
	expect(taco_taco.length).toMatchObject(196);
	expect(taco_tortilla.length).toMatchObject(1049);
	expect(tortilla_tortilla.length).toMatchObject(0);
	expect(transitivity.length).toMatchObject(5328);
	expect(Object.keys(facePairs).length).toBe(838);
	expect(Object.keys(orders).length).toBe(102);
});

test("makeSolverConstraintsFlat, flapping bird", () => {
	const foldfile = fs.readFileSync(
		"./tests/files/fold/randlett-flapping-bird.fold",
		"utf-8",
	);
	const fold = JSON.parse(foldfile);
	const folded = ear.graph.getFramesByClassName(fold, "foldedForm")[0];
	ear.graph.populate(folded);

	// remove existing solution from FOLD file
	delete folded.faceOrders;

	expect(ear.graph.getEdgesEdgesCollinearOverlap(folded).flat().length).toBe(114);
	expect(ear.graph.getEdgesFacesOverlap(folded).flat().length).toBe(110);

	const {
		constraints: { taco_taco, taco_tortilla, tortilla_tortilla, transitivity },
		facePairs,
		orders,
	} = ear.layer.makeSolverConstraintsFlat(folded);

	expect(taco_taco.length).toMatchObject(27);
	expect(taco_tortilla.length).toMatchObject(82);
	expect(tortilla_tortilla.length).toMatchObject(15);
	expect(transitivity.length).toMatchObject(168);
	expect(Object.keys(facePairs).length).toBe(125);
	expect(Object.keys(orders).length).toBe(30);
});

test("layer bird", () => {
	const foldfile = fs.readFileSync("./tests/files/fold/kraft-bird-base.fold", "utf-8");
	const fold = JSON.parse(foldfile);
	const folded = {
		...fold,
		vertices_coords: ear.graph.makeVerticesCoordsFlatFolded(fold, [6]),
	};
	ear.graph.populate(folded);

	expect(ear.graph.getEdgesEdgesCollinearOverlap(folded).flat().length).toBe(3404);
	expect(ear.graph.getEdgesFacesOverlap(folded).flat().length).toBe(7544);

	const {
		constraints: { taco_taco, taco_tortilla, tortilla_tortilla, transitivity },
		facePairs,
		orders,
	} = ear.layer.makeSolverConstraintsFlat(folded, 1e-6);

	expect(taco_taco.length).toBe(764);
	expect(taco_tortilla.length).toBe(4860);
	expect(tortilla_tortilla.length).toBe(2613);
	expect(transitivity.length).toBe(54856);

	expect(Object.keys(facePairs).length).toBe(5848);
	expect(Object.keys(orders).length).toBe(338);
});
