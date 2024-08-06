import { expect, test } from "vitest";
import fs from "fs";
import ear from "../src/index.js";

test("layer table", () => {
	const layerTableJSON = fs.readFileSync("./tests/files/json/layer-table.json", "utf-8");
	const table = JSON.parse(layerTableJSON);
	expect(ear.layer.table).toMatchObject(table);
});

test("immutability test", () => {
	// taco_taco at 000011 is a const array entry,
	// attempt to overwrite one of its values.
	try {
		ear.layer.table.taco_taco["000011"][0] = 99;
	} catch (error) {
		expect(error).not.toBe(undefined);
	}

	// the object should have been recursively frozen,
	// it should not be possible to change a value even inside an array.
	expect(ear.layer.table.taco_taco["000011"][0]).not.toBe(99);
	expect(ear.layer.table.taco_taco["000011"][0]).toBe(2);
});

test("layer table structure", () => {
	const keys = ["taco_taco", "taco_tortilla", "tortilla_tortilla", "transitivity"];
	Object.keys(ear.layer.table).forEach((key, i) => expect(key).toBe(keys[i]));
	keys.forEach((key) => expect(typeof ear.layer.table[key]).toBe("object"));
	const keysLength = [729, 27, 9, 27];
	keys.forEach((key, i) =>
		expect(Object.keys(ear.layer.table[key]).length).toBe(keysLength[i]),
	);
});

test("layer table elements", () => {
	expect(ear.layer.table.taco_taco["000000"]).toBe(true);
	expect(ear.layer.table.taco_taco["000122"]).toBe(false);
	expect(JSON.stringify(ear.layer.table.taco_taco["000011"])).toBe(
		JSON.stringify([2, 2]),
	);

	expect(ear.layer.table.taco_tortilla["000"]).toBe(true);
	expect(ear.layer.table.taco_tortilla["011"]).toBe(false);
	expect(JSON.stringify(ear.layer.table.taco_tortilla["110"])).toBe(
		JSON.stringify([2, 2]),
	);

	expect(ear.layer.table.tortilla_tortilla["00"]).toBe(true);
	expect(ear.layer.table.tortilla_tortilla["12"]).toBe(false);
	expect(JSON.stringify(ear.layer.table.tortilla_tortilla["10"])).toBe(
		JSON.stringify([1, 1]),
	);

	expect(ear.layer.table.transitivity["000"]).toBe(true);
	expect(ear.layer.table.transitivity["111"]).toBe(false);
	expect(JSON.stringify(ear.layer.table.transitivity["110"])).toBe(
		JSON.stringify([2, 2]),
	);
});
