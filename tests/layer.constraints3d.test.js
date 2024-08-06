import fs from "fs";
import { expect, test } from "vitest";
import ear from "../src/index.js";

test("makeSolverConstraints, 2D and 3D comparison, crane", () => {
	const foldfile = fs.readFileSync("./tests/files/fold/crane.fold", "utf-8");
	const fold = JSON.parse(foldfile);
	const folded = ear.graph.getFramesByClassName(fold, "foldedForm")[0];
	ear.graph.populate(folded);

	const flat = ear.layer.makeSolverConstraintsFlat(folded);
	const three = ear.layer.makeSolverConstraints3D(folded);
	expect(flat.constraints).toMatchObject(three.constraints);
	expect(flat.facePairs).toMatchObject(three.facePairs);
	expect(flat.faces_winding).toMatchObject(three.faces_winding);
	expect(flat.orders).toMatchObject(three.orders);
});

test("makeSolverConstraints, 2D and 3D comparison, kabuto", () => {
	const foldfile = fs.readFileSync("./tests/files/fold/kabuto.fold", "utf-8");
	const fold = JSON.parse(foldfile);
	const folded = ear.graph.getFramesByClassName(fold, "foldedForm")[0];
	ear.graph.populate(folded);

	const flat = ear.layer.makeSolverConstraintsFlat(folded);
	const three = ear.layer.makeSolverConstraints3D(folded);
	expect(flat.constraints).toMatchObject(three.constraints);
	expect(flat.facePairs).toMatchObject(three.facePairs);
	expect(flat.faces_winding).toMatchObject(three.faces_winding);
	expect(flat.orders).toMatchObject(three.orders);
});

test("makeSolverConstraints, 2D and 3D comparison, kraft bird", () => {
	const foldfile = fs.readFileSync("./tests/files/fold/kraft-bird-base.fold", "utf-8");
	const fold = JSON.parse(foldfile);
	const folded = {
		...fold,
		vertices_coords: ear.graph.makeVerticesCoordsFlatFolded(fold),
	};
	ear.graph.populate(folded);

	const flat = ear.layer.makeSolverConstraintsFlat(folded);
	const three = ear.layer.makeSolverConstraints3D(folded);
	expect(flat.constraints).toMatchObject(three.constraints);
	expect(flat.facePairs).toMatchObject(three.facePairs);
	expect(flat.faces_winding).toMatchObject(three.faces_winding);
	expect(flat.orders).toMatchObject(three.orders);
});

test("makeSolverConstraints3D cube octagon", () => {
	const foldfile = fs.readFileSync("./tests/files/fold/cube-octagon.fold", "utf-8");
	const fold = JSON.parse(foldfile);
	const folded = ear.graph.getFramesByClassName(fold, "foldedForm")[0];
	ear.graph.populate(folded);

	const expectedJSON = fs.readFileSync(
		"./tests/files/json/cube-octagon-constraints.json",
		"utf-8",
	);
	const expected = JSON.parse(expectedJSON);

	const solverConstraints = ear.layer.makeSolverConstraints3D(folded);
	expect(solverConstraints).toMatchObject(expected);
});

// this tests all of the cases which were built on top of the 2D solver,
// things which examine the overlapping geometry in 3D and generate
// either additional solutions (orders) or conditions (tacos/tortillas/transitivity)
test("makeSolverConstraints3D layer 3D test cases", () => {
	const foldfile = fs.readFileSync(
		"./tests/files/fold/layers-3d-edge-edge.fold",
		"utf-8",
	);
	const fold = JSON.parse(foldfile);
	const frames = ear.graph.getFileFramesAsArray(fold);
	const foldedForms = frames.map((frame) => ({
		...frame,
		vertices_coords: ear.graph.makeVerticesCoordsFolded(frame),
	}));
	foldedForms.forEach((folded) => ear.graph.populate(folded));

	const results = foldedForms.map((folded) => {
		try {
			return ear.layer.makeSolverConstraints3D(folded);
		} catch (error) {
			return "error";
		}
	});

	expect(results[0].constraints).toMatchObject({
		taco_taco: [],
		taco_tortilla: [],
		tortilla_tortilla: [],
		transitivity: [],
	});
	expect(results[0].facePairs).toMatchObject(["0 4"]);
	expect(results[0].orders).toMatchObject({ "0 4": 2 });
	// face 0 is below face 4,
	expect(results[0].faces_winding[0]).toBe(true);
	expect(results[0].faces_winding[4]).toBe(false);

	expect(results[1].constraints).toMatchObject({
		taco_taco: [],
		taco_tortilla: [],
		tortilla_tortilla: [[1, 2, 4, 3]],
		transitivity: [],
	});
	expect(results[1].facePairs).toMatchObject(["1 4", "2 3"]);
	expect(results[1].orders).toMatchObject({ "1 4": 2, "2 3": 2 });

	expect(results[2].constraints).toMatchObject({
		taco_taco: [],
		taco_tortilla: [],
		tortilla_tortilla: [[1, 2, 4, 3]],
		transitivity: [],
	});
	expect(results[2].facePairs).toMatchObject(["1 4", "2 3"]);
	expect(results[2].orders).toMatchObject({ "1 4": 2, "2 3": 2 });

	expect(results[3].constraints).toMatchObject({
		taco_taco: [],
		taco_tortilla: [],
		tortilla_tortilla: [
			[1, 2, 4, 3],
			[0, 1, 5, 4],
		],
		transitivity: [],
	});
	expect(results[3].facePairs).toMatchObject(["0 5", "1 4", "2 3"]);
	expect(results[3].orders).toMatchObject({ "2 3": 2 });

	// only 3 pairs of faces overlap each other: 1-9, 2-8, 3-7
	// - 2 tortilla_tortilla between the overlapping 3 sets.
	expect(results[5].constraints).toMatchObject({
		taco_taco: [],
		taco_tortilla: [],
		tortilla_tortilla: [
			[1, 2, 9, 8],
			[2, 3, 8, 7],
		],
		transitivity: [],
	});
	expect(results[5].facePairs).toMatchObject(["1 9", "2 8", "3 7"]);
	// 1-9 via the 3d overlapping edges algorithm
	// 3-7 via the 3d overlapping edges algorithm
	expect(results[5].orders).toMatchObject({ "1 9": 1, "3 7": 1 });

	// 3 pairs of faces overlap each other: 1-10, 2-9, 3-8
	// then another group of 4 faces all overlap each other: 4, 5, 6, 7
	// - 1 taco_taco in the group of overlapping 4 faces
	// - 2 taco_tortilla faces 4 and 7 have a "F" edge
	// - 3 tortilla_tortilla where 1-2-10-9 and 3-4-8-7 are "F" tortillas
	//   and 2-3-9-8 is a 3D-bent-tortilla at 90 degrees
	expect(results[6].constraints).toMatchObject({
		taco_taco: [[4, 6, 5, 7]],
		taco_tortilla: [
			[5, 4, 6],
			[5, 7, 6],
		],
		tortilla_tortilla: [
			[1, 2, 10, 9],
			[3, 4, 8, 7],
			[2, 3, 9, 8],
		],
		transitivity: [],
	});
	expect(results[6].facePairs).toMatchObject([
		"1 10",
		"2 9",
		"3 8",
		"4 7",
		"4 5",
		"4 6",
		"5 7",
		"5 6",
		"6 7",
	]);
	// 1-10 is known via the 3d overlapping edges algorithm
	// 4-5, 5-6, 6-7 are simply flat adjacent faces
	expect(results[6].orders).toMatchObject({
		"1 10": 1,
		"4 5": 2,
		"5 6": 2,
		"6 7": 1,
	});
});

test("makeSolverConstraints3D coplanar angles 3D", () => {
	const foldfile = fs.readFileSync(
		"./tests/files/fold/layers-3d-edge-face.fold",
		"utf-8",
	);
	const fold = JSON.parse(foldfile);
	const frame2 = ear.graph.flattenFrame(fold, 1);
	const folded1 = {
		...fold,
		vertices_coords: ear.graph.makeVerticesCoordsFolded(fold),
	};
	ear.graph.populate(folded1);

	const folded2 = {
		...frame2,
		vertices_coords: ear.graph.makeVerticesCoordsFolded(frame2),
	};
	ear.graph.populate(folded1);
	ear.graph.populate(folded2);

	// frame 2 has a longer side length that crosses one of the faces,
	// but everything should remain consistent
	expect(ear.layer.makeSolverConstraints3D(folded1)).toMatchObject(
		ear.layer.makeSolverConstraints3D(folded2),
	);

	const {
		constraints: { taco_taco, taco_tortilla, tortilla_tortilla, transitivity },
		facePairs,
		faces_winding,
		orders,
	} = ear.layer.makeSolverConstraints3D(folded1);

	// faces 1, 3, 4, 5 are all coplanar.
	// face 0 is base plane
	// face 1 is angled plane
	expect(facePairs).toMatchObject(["1 3", "1 4", "1 5", "3 4", "3 5", "4 5"]);
	expect(faces_winding).toMatchObject([true, true, true, false, true, false]);
	expect(orders).toMatchObject({ "3 4": 1, "4 5": 2, "1 5": 1 });
	expect(taco_taco).toMatchObject([[3, 1, 4, 5]]);
	expect(taco_tortilla).toMatchObject([
		[4, 1, 5],
		[4, 3, 5],
	]);
	expect(tortilla_tortilla).toMatchObject([]);
	expect(transitivity).toMatchObject([]);

	// const result = ear.layer.getOverlappingParallelEdgePairs()
});

test("makeSolverConstraints3D panels 6x2", () => {
	const foldfile = fs.readFileSync("./tests/files/fold/panels-6x2-90deg.fold", "utf-8");
	const fold = JSON.parse(foldfile);
	const folded = ear.graph.getFramesByClassName(fold, "foldedForm")[0];
	ear.graph.populate(folded);

	const {
		constraints: { taco_taco, taco_tortilla, tortilla_tortilla, transitivity },
		facePairs,
		faces_winding,
		orders,
	} = ear.layer.makeSolverConstraints3D(folded);

	[
		// every permutation of pairs of these:
		// 0, 1, 2, 3, 4, 5
		"0 1",
		"0 2",
		"0 3",
		"0 4",
		"0 5",
		"1 2",
		"1 3",
		"1 4",
		"1 5",
		"2 3",
		"2 4",
		"2 5",
		"3 4",
		"3 5",
		"4 5",
		// every permutation of pairs of these:
		// 6, 7, 8, 9, 10, 11
		"6 7",
		"6 8",
		"6 9",
		"6 10",
		"6 11",
		"7 8",
		"7 9",
		"7 10",
		"7 11",
		"8 9",
		"8 10",
		"8 11",
		"9 10",
		"9 11",
		"10 11",
	].forEach((key) => expect(facePairs).toContain(key));
	expect(faces_winding).toMatchObject([
		true,
		false,
		true,
		false,
		true,
		false,
		true,
		false,
		true,
		false,
		true,
		false,
	]);
	expect(orders).toMatchObject({
		"0 1": 2,
		"1 2": 2,
		"2 3": 2,
		"3 4": 1,
		"4 5": 1,
		"6 7": 2,
		"7 8": 2,
		"8 9": 2,
		"9 10": 1,
		"10 11": 1,
	});

	expect(taco_taco).toMatchObject([
		[0, 2, 1, 3],
		[0, 4, 1, 5],
		[1, 3, 2, 4],
		[2, 4, 3, 5],
		[6, 8, 7, 9],
		[6, 10, 7, 11],
		[7, 9, 8, 10],
		[8, 10, 9, 11],
	]);

	expect(taco_tortilla).toMatchObject([]);

	expect(tortilla_tortilla).toMatchObject([
		[0, 6, 1, 7],
		[0, 6, 2, 8],
		[0, 6, 3, 9],
		[0, 6, 4, 10],
		[0, 6, 5, 11],
		[1, 7, 2, 8],
		[1, 7, 3, 9],
		[1, 7, 4, 10],
		[1, 7, 5, 11],
		[2, 8, 3, 9],
		[2, 8, 4, 10],
		[2, 8, 5, 11],
		[3, 9, 4, 10],
		[3, 9, 5, 11],
		[4, 10, 5, 11],
	]);

	expect(transitivity).toMatchObject([
		[0, 2, 4],
		[0, 2, 5],
		[0, 3, 4],
		[0, 3, 5],
		[1, 2, 5],
		[1, 3, 5],
		[6, 8, 10],
		[6, 8, 11],
		[6, 9, 10],
		[6, 9, 11],
		[7, 8, 11],
		[7, 9, 11],
	]);
});

test("makeSolverConstraints3D maze-u", () => {
	const foldfile = fs.readFileSync("./tests/files/fold/maze-u.fold", "utf-8");
	const fold = JSON.parse(foldfile);
	const folded = ear.graph.getFramesByClassName(fold, "foldedForm")[0];
	ear.graph.populate(folded);
	const expectedJSON = fs.readFileSync(
		"./tests/files/json/maze-u-constraints.json",
		"utf-8",
	);
	const expected = JSON.parse(expectedJSON);
	const solverConstraints = ear.layer.makeSolverConstraints3D(folded);
	expect(solverConstraints).toMatchObject(expected);
});
