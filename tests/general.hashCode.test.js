import { expect, test } from "vitest";
import fs from "fs";
import { hashCode } from "./src/general/hashCode.js";

// test("hashCode console time", () => {
// 	const kb20 = fs.readFileSync("./tests/files/fold/crane-3d.fold", "utf-8");
// 	const kb100 = kb20 + kb20 + kb20 + kb20 + kb20;
// 	const kb500 = kb100 + kb100 + kb100 + kb100 + kb100;
// 	const mb1 = kb500 + kb500;
// 	const mb5 = mb1 + mb1 + mb1 + mb1 + mb1;
// 	const mb10 = mb5 + mb5;
// 	const mb100 = mb10 + mb10 + mb10 + mb10 + mb10 + mb10 + mb10 + mb10 + mb10 + mb10;
// 	console.time("hash");
// 	hashCode(kb500);
// 	console.timeEnd("hash");
// });

test("hashCode equivalent", () => {
	expect(hashCode("")).not.toEqual(hashCode(" "));
	expect(hashCode(" ")).not.toEqual(hashCode("   "));
	expect(hashCode(".")).not.toEqual(hashCode(","));
});

test("hashCode equivalent", () => {
	const kb20 = fs.readFileSync("./tests/files/fold/crane-3d.fold", "utf-8");
	const kb100 = kb20 + kb20 + kb20 + kb20 + kb20;
	const kb500 = kb100 + kb100 + kb100 + kb100 + kb100;
	const mb1 = kb500 + kb500;
	expect(hashCode(mb1)).toEqual(hashCode(mb1));
	expect(hashCode(kb500)).not.toEqual(hashCode(mb1));
});
