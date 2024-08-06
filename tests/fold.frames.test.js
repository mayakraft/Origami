import fs from "fs";
import { expect, test } from "vitest";
import ear from "../src/index.js";

test("countFrames", () => {
	const graph1 = JSON.parse(
		fs.readFileSync("./tests/files/fold/blintz-frames.fold", "utf-8"),
	);
	expect(ear.graph.countFrames(graph1)).toBe(33);
	const graph2 = JSON.parse(
		fs.readFileSync("./tests/files/fold/nested-frames.fold", "utf-8"),
	);
	expect(ear.graph.countFrames(graph2)).toBe(6);
	const graph3 = JSON.parse(
		fs.readFileSync("./tests/files/fold/moosers-train.fold", "utf-8"),
	);
	expect(ear.graph.countFrames(graph3)).toBe(2);
});

test("flattenFrame", () => {
	const foldfile = fs.readFileSync("./tests/files/fold/nested-frames.fold", "utf-8");
	const FOLD = JSON.parse(foldfile);
	const flat = ear.graph.flattenFrame(FOLD, 3);
	expect(flat.frame_classes.length).toBe(1);
	expect(flat.frame_classes[0]).toBe("foldedForm");
});

test("flattenFrame, frame 0", () => {
	const foldfile = fs.readFileSync("./tests/files/fold/nested-frames.fold", "utf-8");
	const FOLD = JSON.parse(foldfile);
	const flat = ear.graph.flattenFrame(FOLD, 0);
	expect(flat.frame_classes.length).toBe(1);
	expect(flat.frame_classes[0]).toBe("creasePattern");
});

test("getFileFramesAsArray", () => {
	const graph1 = JSON.parse(
		fs.readFileSync("./tests/files/fold/blintz-frames.fold", "utf-8"),
	);
	expect(ear.graph.getFileFramesAsArray(graph1).length).toBe(33);

	const graph2 = JSON.parse(
		fs.readFileSync("./tests/files/fold/nested-frames.fold", "utf-8"),
	);
	expect(ear.graph.getFileFramesAsArray(graph2).length).toBe(6);
});

test("getFramesByClassName", () => {
	const graph1 = JSON.parse(
		fs.readFileSync("./tests/files/fold/blintz-frames.fold", "utf-8"),
	);
	expect(ear.graph.getFramesByClassName(graph1, "creasePattern").length).toBe(1);
	expect(ear.graph.getFramesByClassName(graph1, "foldedForm").length).toBe(32);
});
