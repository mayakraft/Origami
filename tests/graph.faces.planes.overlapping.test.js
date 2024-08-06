import fs from "fs";
import { expect, test } from "vitest";
import ear from "../src/index.js";

test("getCoplanarAdjacentOverlappingFaces", () => {
	const foldFile = fs.readFileSync(
		"./tests/files/fold/disjoint-triangles-3d.fold",
		"utf-8",
	);
	const foldObject = JSON.parse(foldFile);
	const foldedFrame = ear.graph.getFramesByClassName(foldObject, "foldedForm")[0];
	const result = ear.graph.getCoplanarAdjacentOverlappingFaces(foldedFrame);
	fs.writeFileSync(
		`./tests/tmp/coplanar-overlapping-faces-disjoint-triangles.json`,
		JSON.stringify(result, null, 2),
	);

	// ensure all faces are accounted for.
	const totalFaceCount = foldedFrame.faces_vertices.length;
	const faceFound = [];
	result.clusters_faces.forEach((set) =>
		set.forEach((f) => {
			faceFound[f] = true;
		}),
	);
	expect(faceFound.filter((a) => a !== undefined).length).toBe(totalFaceCount);
});

test("getCoplanarAdjacentOverlappingFaces", () => {
	const foldFile = fs.readFileSync("./tests/files/fold/maze-u.fold", "utf-8");
	const foldObject = JSON.parse(foldFile);
	const foldedFrame = ear.graph.getFramesByClassName(foldObject, "foldedForm")[0];
	const { clusters_faces, clusters_plane, planes_transform, faces_cluster } =
		ear.graph.getCoplanarAdjacentOverlappingFaces(foldedFrame);

	expect(faces_cluster).toMatchObject([
		0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 3, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 3, 0, 3, 0, 0, 0, 0, 3,
		3, 0, 1, 1, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 1, 1, 0, 0, 2, 3, 3, 0, 3, 3, 3, 3, 0, 0, 0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 2, 2, 0,
		2, 3, 3, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 2, 2, 0,
	]);
	expect(clusters_plane).toMatchObject([0, 1, 2, 3]);
	expect(planes_transform).toHaveLength(4);

	// ensure all faces are accounted for.
	const totalFaceCount = foldedFrame.faces_vertices.length;
	const faceFound = [];
	clusters_faces.forEach((set) =>
		set.forEach((f) => {
			faceFound[f] = true;
		}),
	);
	expect(faceFound.filter((a) => a !== undefined).length).toBe(totalFaceCount);
});

test("coplanar and overlapping disjoint faces", () => {
	const foldFile = fs.readFileSync(
		"./tests/files/fold/disjoint-triangles-3d.fold",
		"utf-8",
	);
	const foldObject = JSON.parse(foldFile);
	const foldedFrame = ear.graph.getFramesByClassName(foldObject, "foldedForm")[0];
	const result = ear.graph.getCoplanarAdjacentOverlappingFaces(foldedFrame);
	fs.writeFileSync(
		`./tests/tmp/coplanar-overlapping-planes-disjoint.json`,
		JSON.stringify(result, null, 2),
	);

	const {
		planes,
		// planes_transform,
		faces_winding,
		planes_faces,
		// faces_plane,
		// planes_clusters,
		// clusters_plane,
		// clusters_faces,
		// faces_cluster,
	} = result;

	expect(planes.length).toBe(3);

	// plane 0
	expect(JSON.stringify(planes_faces[0])).toBe(JSON.stringify([0, 1, 4, 5, 8, 11]));
	expect(JSON.stringify(planes_faces[0].map((f) => faces_winding[f]))).toBe(
		JSON.stringify([true, true, true, true, true, false]),
	);
	expect(planes[0].origin[0]).toBeCloseTo(0);
	expect(planes[0].origin[1]).toBeCloseTo(0);
	expect(planes[0].origin[2]).toBeCloseTo(0);
	expect(planes[0].normal[0]).toBeCloseTo(0);
	expect(planes[0].normal[1]).toBeCloseTo(0);
	expect(planes[0].normal[2]).toBeCloseTo(1);

	// plane 1
	expect(JSON.stringify(planes_faces[1])).toBe(JSON.stringify([13]));
	expect(JSON.stringify(planes_faces[1].map((f) => faces_winding[f]))).toBe(
		JSON.stringify([true]),
	);
	expect(planes[1].origin[0]).toBeCloseTo(0);
	expect(planes[1].origin[1]).toBeCloseTo(0);
	expect(planes[1].origin[2]).toBeCloseTo(0.5);
	expect(planes[1].normal[0]).toBeCloseTo(0);
	expect(planes[1].normal[1]).toBeCloseTo(0);
	expect(planes[1].normal[2]).toBeCloseTo(1);

	// plane 2
	expect(JSON.stringify(planes_faces[2])).toBe(JSON.stringify([2, 3, 6, 7, 9, 10, 12]));
	expect(JSON.stringify(planes_faces[2].map((f) => faces_winding[f]))).toBe(
		JSON.stringify([true, true, true, true, true, true, false]),
	);
	expect(planes[2].origin[0]).toBeCloseTo(0);
	expect(planes[2].origin[1]).toBeCloseTo(0);
	expect(planes[2].origin[2]).toBeCloseTo(0);
	expect(planes[2].normal[0]).toBeCloseTo(0);
	expect(planes[2].normal[1]).toBeCloseTo(1);
	expect(planes[2].normal[2]).toBeCloseTo(0);
});

test("coplanar and overlapping faces, command strip", () => {
	const foldFile = fs.readFileSync("./tests/files/fold/command-strip.fold", "utf-8");
	const foldObject = JSON.parse(foldFile);

	const foldedFrame = ear.graph.getFramesByClassName(foldObject, "foldedForm")[0];
	const result = ear.graph.getCoplanarAdjacentOverlappingFaces(foldedFrame);
	fs.writeFileSync(
		`./tests/tmp/coplanar-overlapping-command-strip.json`,
		JSON.stringify(result, null, 2),
	);

	const {
		planes,
		planes_transform,
		faces_winding,
		planes_faces,
		faces_plane,
		planes_clusters,
		clusters_plane,
		clusters_faces,
		faces_cluster,
	} = result;

	expect(planes.length).toBe(8);
	expect(planes_transform.length).toBe(8);
	expect(faces_winding.length).toBe(foldedFrame.faces_vertices.length);

	// 4 planes contain 2 faces, 4 planes contain 3 faces
	expect(planes_faces.filter((arr) => arr.length === 2).length).toBe(4);
	expect(planes_faces.filter((arr) => arr.length === 3).length).toBe(4);

	expect(JSON.stringify(faces_plane)).toBe(
		JSON.stringify([0, 6, 1, 5, 0, 4, 1, 5, 2, 4, 3, 5, 2, 6, 3, 7, 2, 6, 1, 7]),
	);

	// all clusters have one face only, so here, clusters should match faces
	// 4 planes contain 2 clusters, 4 planes contain 3 clusters
	expect(planes_clusters.filter((arr) => arr.length === 2).length).toBe(4);
	expect(planes_clusters.filter((arr) => arr.length === 3).length).toBe(4);

	expect(JSON.stringify(clusters_plane)).toBe(
		JSON.stringify([0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7]),
	);

	// every cluster should only contain one face
	clusters_faces.forEach((faces) => expect(faces.length).toBe(1));

	// faces and clusters should be 1:1. 20 unique clusters
	expect(Array.from(new Set(faces_cluster)).length).toBe(20);
});

test("coplanar and overlapping faces, command strip with back", () => {
	const foldFile = fs.readFileSync(
		"./tests/files/fold/command-strip-with-back.fold",
		"utf-8",
	);
	const foldObject = JSON.parse(foldFile);

	const foldedFrame = ear.graph.getFramesByClassName(foldObject, "foldedForm")[0];
	const result = ear.graph.getCoplanarAdjacentOverlappingFaces(foldedFrame);
	fs.writeFileSync(
		`./tests/tmp/coplanar-overlapping-command-strip-with-back.json`,
		JSON.stringify(result, null, 2),
	);

	const {
		planes,
		planes_transform,
		faces_winding,
		planes_faces,
		faces_plane,
		planes_clusters,
		clusters_plane,
		// clusters_faces,
		// faces_cluster,
	} = result;

	expect(planes.length).toBe(9);
	expect(planes_transform.length).toBe(9);
	expect(faces_winding.length).toBe(54);

	// 4 planes contain 2 faces, 4 planes contain 3 faces
	// 54 (total) - (2*4) - (3*4)
	expect(planes_faces.filter((arr) => arr.length === 2).length).toBe(4);
	expect(planes_faces.filter((arr) => arr.length === 3).length).toBe(4);
	expect(planes_faces.filter((arr) => arr.length === 34).length).toBe(1);

	expect(JSON.stringify(faces_plane)).toBe(
		JSON.stringify([
			0, 6, 1, 5, 0, 4, 1, 5, 2, 4, 3, 5, 2, 6, 3, 7, 2, 6, 1, 7, 8, 8, 8, 8, 8, 8, 8, 8,
			8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8,
		]),
	);
	// all clusters have one face only, so here, clusters should match faces
	// 4 planes contain 2 clusters, 4 planes contain 3 clusters
	expect(planes_clusters.filter((arr) => arr.length === 2).length).toBe(4);
	expect(planes_clusters.filter((arr) => arr.length === 3).length).toBe(4);
	expect(planes_clusters.filter((arr) => arr.length === 1).length).toBe(1);

	expect(JSON.stringify(clusters_plane)).toBe(
		JSON.stringify([0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7, 8]),
	);

	// // every cluster should only contain one face
	// clusters_faces.forEach(faces => expect(faces.length).toBe(1));

	// // faces and clusters should be 1:1. 20 unique clusters
	// expect(Array.from(new Set(faces_cluster)).length).toBe(20);
});

test("coplanar and overlapping faces, square tube with overlap", () => {
	const foldFile = fs.readFileSync(
		"./tests/files/fold/square-tube-with-overlap.fold",
		"utf-8",
	);
	const foldObject = JSON.parse(foldFile);

	const foldedFrame = ear.graph.getFramesByClassName(foldObject, "foldedForm")[0];
	const result = ear.graph.getCoplanarAdjacentOverlappingFaces(foldedFrame);
	fs.writeFileSync(
		`./tests/tmp/coplanar-overlapping-square-tube-with-overlap.json`,
		JSON.stringify(result, null, 2),
	);

	const {
		planes,
		planes_transform,
		faces_winding,
		planes_faces,
		faces_plane,
		planes_clusters,
		clusters_plane,
		clusters_faces,
		faces_cluster,
	} = result;

	expect(planes.length).toBe(4);
	expect(planes_transform.length).toBe(4);
	expect(faces_winding.length).toBe(foldedFrame.faces_vertices.length);

	expect(JSON.stringify(planes_faces)).toBe(
		JSON.stringify([
			[0, 4, 5, 6],
			[2, 8],
			[1, 9],
			[3, 7],
		]),
	);
	expect(JSON.stringify(faces_plane)).toBe(
		JSON.stringify([0, 2, 1, 3, 0, 0, 0, 3, 1, 2]),
	);
	expect(JSON.stringify(planes_clusters)).toBe(JSON.stringify([[0], [1], [2], [3]]));
	expect(JSON.stringify(clusters_plane)).toBe(JSON.stringify([0, 1, 2, 3]));
	expect(JSON.stringify(clusters_faces)).toBe(
		JSON.stringify([
			[0, 5, 4, 6],
			[2, 8],
			[1, 9],
			[3, 7],
		]),
	);
	expect(JSON.stringify(faces_cluster)).toBe(
		JSON.stringify([0, 2, 1, 3, 0, 0, 0, 3, 1, 2]),
	);
});

test("coplanar and overlapping faces, strip with angle", () => {
	const foldFile = fs.readFileSync("./tests/files/fold/strip-with-angle.fold", "utf-8");
	const foldObject = JSON.parse(foldFile);

	const foldedFrame = ear.graph.getFramesByClassName(foldObject, "foldedForm")[0];
	const result = ear.graph.getCoplanarAdjacentOverlappingFaces(foldedFrame);
	fs.writeFileSync(
		`./tests/tmp/coplanar-overlapping-strip-with-angle.json`,
		JSON.stringify(result, null, 2),
	);

	const {
		planes,
		planes_transform,
		faces_winding,
		planes_faces,
		faces_plane,
		planes_clusters,
		clusters_plane,
		clusters_faces,
		faces_cluster,
	} = result;

	expect(planes.length).toBe(4);
	expect(planes_transform.length).toBe(4);
	expect(faces_winding.length).toBe(foldedFrame.faces_vertices.length);

	expect(JSON.stringify(planes_faces)).toBe(JSON.stringify([[0, 5], [2, 3], [1], [4]]));
	expect(JSON.stringify(faces_plane)).toBe(JSON.stringify([0, 2, 1, 1, 3, 0]));
	expect(JSON.stringify(planes_clusters)).toBe(JSON.stringify([[0], [1], [2], [3]]));
	expect(JSON.stringify(clusters_plane)).toBe(JSON.stringify([0, 1, 2, 3]));
	expect(JSON.stringify(clusters_faces)).toBe(JSON.stringify([[0, 5], [2, 3], [1], [4]]));
	expect(JSON.stringify(faces_cluster)).toBe(JSON.stringify([0, 2, 1, 1, 3, 0]));
});

test("coplanar and overlapping faces, Mooser's train, carriage only", () => {
	const FOLD = fs.readFileSync("./tests/files/fold/moosers-train-carriage.fold", "utf-8");
	const graph = JSON.parse(FOLD);
	const folded = {
		...graph,
		vertices_coords: ear.graph.makeVerticesCoordsFolded(graph),
	};

	// planes data is tested in another file testing getFacesPlane()
	const {
		// planes,
		// planes_transform,
		// faces_winding,
		// planes_faces,
		// faces_plane,
		planes_clusters,
		// clusters_plane,
		clusters_faces,
		// faces_cluster,
	} = ear.graph.getCoplanarAdjacentOverlappingFaces(folded);

	const expectedPlanesClusters = [
		// the bottom of all four wheels
		[0, 1, 2, 3],
		// the underside of the carriage
		[4, 5],
		// the hitch join plane
		[6, 7],
		// the top of the carriage
		[8],
		// the front of the carriage
		[9],
		// side A of wheel set 1
		[10, 11],
		// side B of wheel set 1
		[12, 13],
		// side A of wheel set 2
		[14, 15],
		// side B of wheel set 2
		[16, 17],
		// the backside of the carriage
		[18],
		// one side of the carriage
		[19],
		// back of one set of wheels
		[20, 21],
		// back of one set of wheels
		[22, 23],
		// one side of the carriage
		[24],
	];

	expect(planes_clusters).toMatchObject(expectedPlanesClusters);

	expect(clusters_faces).toMatchObject([
		// the bottom of all four wheels
		[5],
		[11],
		[120],
		[127],
		// the underside of the carriage
		[2, 3, 7, 8, 9, 13, 14, 68, 69, 70, 71, 72, 73, 78, 79, 80, 81, 87, 88, 89],
		[
			58, 59, 60, 61, 64, 65, 66, 67, 82, 83, 92, 108, 109, 110, 111, 116, 117, 126, 133,
			138,
		],
		// the hitch join plane
		[0, 91, 99, 101, 102, 112, 114, 123, 128, 136, 139, 141, 144],
		[16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28],
		// the top of the carriage
		[55],
		// the front of the carriage
		[1, 75, 90, 95, 96, 97, 98, 100, 103, 104, 113, 115, 124, 129, 130, 137, 142, 143],
		// side A of wheel set 1
		[4, 29],
		[93, 140],
		// side B of wheel set 1
		[6, 31],
		[118, 119],
		// side A of wheel set 2
		[10, 32],
		[134, 135],
		// side B of wheel set 2
		[12, 34],
		[121, 122],
		// the backside of the carriage
		[15, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 56],
		// one side of the carriage
		[62, 63, 74, 76, 77, 84, 85, 86, 107],
		// back of one set of wheels
		[94],
		[125],
		// back of one set of wheels
		[30],
		[33],
		// one side of the carriage
		[51, 52, 53, 54, 57, 105, 106, 131, 132],
	]);
});

test("coplanar and overlapping faces, Mooser's train", () => {
	const foldFile = fs.readFileSync("./tests/files/fold/moosers-train.fold", "utf-8");
	const foldObject = JSON.parse(foldFile);
	const foldedFrame = ear.graph.getFramesByClassName(foldObject, "foldedForm")[0];
	const result = ear.graph.getCoplanarAdjacentOverlappingFaces(foldedFrame);
	fs.writeFileSync(
		`./tests/tmp/coplanar-overlapping-faces-mooser.json`,
		JSON.stringify(result, null, 2),
	);

	const {
		planes,
		planes_faces,
		planes_transform,
		planes_clusters,
		// faces_winding,
		faces_plane,
		faces_cluster,
		clusters_plane,
		// clusters_faces,
	} = result;

	expect(planes.length).toBe(34);
	expect(planes_faces.length).toBe(34);
	expect(planes_transform.length).toBe(34);
	expect(planes_clusters.length).toBe(34);

	expect(planes_faces).toMatchObject([
		[251, 395, 406],
		[
			16, 32, 54, 70, 86, 109, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 229,
			230, 231, 232, 238, 239, 245, 246, 288, 289, 301, 302, 308, 309, 361, 362, 368, 369,
			476, 477, 478, 479,
		],
		[
			0, 1, 2, 8, 9, 12, 13, 17, 18, 19, 20, 26, 27, 30, 33, 35, 38, 40, 42, 44, 46, 48,
			50, 51, 55, 56, 57, 63, 64, 67, 68, 72, 73, 74, 75, 81, 82, 85, 88, 89, 93, 94, 97,
			99, 100, 103, 105, 106, 129, 130, 132, 133, 134, 135, 138, 139, 147, 149, 150, 151,
			152, 154, 155, 156, 168, 169, 170, 171, 197, 198, 200, 201, 202, 205, 208, 210, 211,
			212, 213, 215, 216, 217, 220, 224, 259, 260, 261, 262, 272, 273, 274, 275, 294, 297,
			306, 311, 318, 321, 328, 331, 335, 336, 339, 340, 343, 344, 347, 348, 416, 417, 418,
			419, 420, 421, 422, 423, 424, 425, 426, 427, 428, 429, 430, 431, 432, 433, 434, 435,
			436, 437, 438, 439, 440, 441, 442, 443, 444, 445, 446, 447, 448, 449, 450, 451,
		],
		[5, 6, 23, 24, 36, 41, 47, 60, 61, 78, 79, 91, 96, 102],
		[
			14, 69, 324, 325, 327, 329, 330, 332, 384, 385, 387, 389, 390, 391, 412, 413, 414,
			415,
		],
		[11, 66, 464, 466],
		[4, 59, 474, 475],
		[3, 58, 472, 473],
		[7, 62, 460, 462],
		[
			10, 65, 314, 315, 316, 319, 320, 323, 374, 375, 376, 379, 380, 382, 405, 408, 409,
			411,
		],
		[
			15, 71, 300, 303, 305, 307, 310, 312, 360, 363, 365, 367, 370, 371, 401, 402, 403,
			404,
		],
		[29, 84, 456, 458],
		[22, 77, 470, 471],
		[21, 76, 468, 469],
		[25, 80, 452, 454],
		[
			28, 83, 290, 291, 292, 295, 296, 299, 350, 351, 352, 355, 356, 358, 394, 397, 398,
			400,
		],
		[
			31, 87, 221, 222, 223, 226, 227, 228, 234, 235, 236, 240, 241, 242, 255, 256, 257,
			258,
		],
		[34, 90, 286, 287],
		[
			195, 196, 199, 203, 204, 206, 247, 248, 249, 250, 252, 253, 254, 263, 264, 265, 266,
			267, 268, 269, 270, 271,
		],
		[37, 92, 282, 284],
		[39, 95, 280, 281],
		[43, 98, 276, 278],
		[45, 101, 193, 194],
		[49, 104, 189, 191],
		[
			110, 111, 112, 140, 141, 142, 143, 144, 145, 146, 148, 153, 157, 158, 159, 160, 161,
			162, 163, 164, 165, 166, 167, 172, 173, 176, 177, 178, 179, 180, 182, 183, 184, 185,
			187, 188, 480, 481, 482, 483,
		],
		[52, 53, 107, 108, 113, 114, 115, 128, 136, 131, 137, 116],
		[186],
		[174],
		[181],
		[175],
		[
			214, 218, 225, 243, 244, 298, 313, 322, 333, 337, 341, 345, 349, 357, 359, 372, 373,
			381, 383, 392, 393, 399, 410,
		],
		[192, 279, 285, 455, 459, 463, 467],
		[190, 277, 283, 453, 457, 461, 465],
		[
			207, 209, 219, 233, 237, 293, 304, 317, 326, 334, 338, 342, 346, 353, 354, 364, 366,
			377, 378, 386, 388, 396, 407,
		],
	]);

	expect(planes_clusters).toMatchObject([
		[0, 1, 2],
		[3, 4, 5],
		[6, 7, 8, 9, 10, 11],
		[12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25],
		[26],
		[27, 28],
		[29, 30],
		[31, 32],
		[33, 34],
		[35],
		[36],
		[37, 38],
		[39, 40],
		[41, 42],
		[43, 44],
		[45],
		[46],
		[47, 48],
		[49],
		[50, 51],
		[52, 53],
		[54, 55],
		[56, 57],
		[58, 59],
		[60],
		[61, 62],
		[63],
		[64],
		[65],
		[66],
		[67, 68, 69],
		[70, 71, 72, 73, 74, 75, 76],
		[77, 78, 79, 80, 81, 82, 83],
		[84, 85, 86],
	]);

	expect(faces_plane).toMatchObject([
		2, 2, 2, 7, 6, 3, 3, 8, 2, 2, 9, 5, 2, 2, 4, 10, 1, 2, 2, 2, 2, 13, 12, 3, 3, 14, 2,
		2, 15, 11, 2, 16, 1, 2, 17, 2, 3, 19, 2, 20, 2, 3, 2, 21, 2, 22, 2, 3, 2, 23, 2, 2,
		25, 25, 1, 2, 2, 2, 7, 6, 3, 3, 8, 2, 2, 9, 5, 2, 2, 4, 1, 10, 2, 2, 2, 2, 13, 12, 3,
		3, 14, 2, 2, 15, 11, 2, 1, 16, 2, 2, 17, 3, 19, 2, 2, 20, 3, 2, 21, 2, 2, 22, 3, 2,
		23, 2, 2, 25, 25, 1, 24, 24, 24, 25, 25, 25, 25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 25,
		2, 2, 25, 2, 2, 2, 2, 25, 25, 2, 2, 24, 24, 24, 24, 24, 24, 24, 2, 24, 2, 2, 2, 2, 24,
		2, 2, 2, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 2, 2, 2, 2, 24, 24, 27, 29, 24,
		24, 24, 24, 24, 28, 24, 24, 24, 24, 26, 24, 24, 23, 32, 23, 31, 22, 22, 18, 18, 2, 2,
		18, 2, 2, 2, 18, 18, 2, 18, 33, 2, 33, 2, 2, 2, 2, 30, 2, 2, 2, 30, 33, 2, 16, 16, 16,
		2, 30, 16, 16, 16, 1, 1, 1, 1, 33, 16, 16, 16, 33, 1, 1, 16, 16, 16, 30, 30, 1, 1, 18,
		18, 18, 18, 0, 18, 18, 18, 16, 16, 16, 16, 2, 2, 2, 2, 18, 18, 18, 18, 18, 18, 18, 18,
		18, 2, 2, 2, 2, 21, 32, 21, 31, 20, 20, 19, 32, 19, 31, 17, 17, 1, 1, 15, 15, 15, 33,
		2, 15, 15, 2, 30, 15, 10, 1, 1, 10, 33, 10, 2, 10, 1, 1, 10, 2, 10, 30, 9, 9, 9, 33,
		2, 9, 9, 2, 30, 9, 4, 4, 33, 4, 2, 4, 4, 2, 4, 30, 33, 2, 2, 30, 33, 2, 2, 30, 33, 2,
		2, 30, 33, 2, 2, 30, 15, 15, 15, 33, 33, 15, 15, 30, 15, 30, 10, 1, 1, 10, 33, 10, 33,
		10, 1, 1, 10, 10, 30, 30, 9, 9, 9, 33, 33, 9, 9, 30, 9, 30, 4, 4, 33, 4, 33, 4, 4, 4,
		30, 30, 15, 0, 33, 15, 15, 30, 15, 10, 10, 10, 10, 9, 0, 33, 9, 9, 30, 9, 4, 4, 4, 4,
		2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
		2, 2, 2, 2, 2, 2, 2, 14, 32, 14, 31, 11, 32, 11, 31, 8, 32, 8, 31, 5, 32, 5, 31, 13,
		13, 12, 12, 7, 7, 6, 6, 1, 1, 1, 1, 24, 24, 24, 24,
	]);

	expect(faces_cluster).toMatchObject([
		6, 6, 6, 31, 29, 12, 13, 33, 6, 6, 35, 27, 6, 6, 26, 36, 3, 7, 7, 7, 7, 41, 39, 14,
		15, 43, 7, 7, 45, 37, 7, 46, 4, 8, 47, 8, 16, 50, 8, 52, 8, 17, 8, 54, 8, 56, 8, 18,
		8, 58, 8, 8, 61, 61, 5, 9, 9, 9, 32, 30, 19, 20, 34, 9, 9, 35, 28, 9, 9, 26, 3, 36,
		10, 10, 10, 10, 42, 40, 21, 22, 44, 10, 10, 45, 38, 10, 4, 46, 11, 11, 48, 23, 51, 11,
		11, 53, 24, 11, 55, 11, 11, 57, 25, 11, 59, 11, 11, 62, 62, 5, 60, 60, 60, 61, 62, 61,
		62, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 61, 8, 8, 61, 8, 8, 11, 11, 62, 62, 11, 11, 60,
		60, 60, 60, 60, 60, 60, 8, 60, 8, 8, 8, 11, 60, 11, 11, 11, 60, 60, 60, 60, 60, 60,
		60, 60, 60, 60, 60, 8, 11, 8, 11, 60, 60, 64, 66, 60, 60, 60, 60, 60, 65, 60, 60, 60,
		60, 63, 60, 60, 58, 77, 59, 70, 56, 57, 49, 49, 8, 8, 49, 8, 11, 11, 49, 49, 11, 49,
		84, 8, 84, 8, 8, 8, 11, 67, 11, 11, 11, 67, 84, 8, 46, 46, 46, 11, 67, 46, 46, 46, 4,
		4, 4, 4, 84, 46, 46, 46, 84, 4, 4, 46, 46, 46, 67, 67, 4, 4, 49, 49, 49, 49, 0, 49,
		49, 49, 46, 46, 46, 46, 8, 8, 11, 11, 49, 49, 49, 49, 49, 49, 49, 49, 49, 8, 8, 11,
		11, 54, 78, 55, 71, 52, 53, 50, 79, 51, 72, 47, 48, 4, 4, 45, 45, 45, 85, 7, 45, 45,
		10, 68, 45, 36, 3, 3, 36, 85, 36, 7, 36, 3, 3, 36, 10, 36, 68, 35, 35, 35, 86, 6, 35,
		35, 9, 69, 35, 26, 26, 86, 26, 6, 26, 26, 9, 26, 69, 85, 7, 10, 68, 85, 7, 10, 68, 86,
		6, 9, 69, 86, 6, 9, 69, 45, 45, 45, 85, 85, 45, 45, 68, 45, 68, 36, 3, 3, 36, 85, 36,
		85, 36, 3, 3, 36, 36, 68, 68, 35, 35, 35, 86, 86, 35, 35, 69, 35, 69, 26, 26, 86, 26,
		86, 26, 26, 26, 69, 69, 45, 1, 85, 45, 45, 68, 45, 36, 36, 36, 36, 35, 2, 86, 35, 35,
		69, 35, 26, 26, 26, 26, 7, 7, 10, 10, 7, 7, 10, 10, 6, 6, 9, 9, 6, 6, 9, 9, 7, 7, 7,
		10, 10, 10, 7, 7, 10, 10, 6, 6, 6, 9, 9, 9, 6, 6, 9, 9, 43, 80, 44, 73, 37, 81, 38,
		74, 33, 82, 34, 75, 27, 83, 28, 76, 41, 42, 39, 40, 31, 32, 29, 30, 3, 3, 4, 3, 60,
		60, 60, 60,
	]);

	expect(clusters_plane).toMatchObject([
		0, 0, 0, 1, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 5, 5,
		6, 6, 7, 7, 8, 8, 9, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 16, 17, 17, 18, 19, 19,
		20, 20, 21, 21, 22, 22, 23, 23, 24, 25, 25, 26, 27, 28, 29, 30, 30, 30, 31, 31, 31,
		31, 31, 31, 31, 32, 32, 32, 32, 32, 32, 32, 33, 33, 33,
	]);
});

test("coplanar and overlapping disjoint faces and separated", () => {
	// fold this from the crease pattern, a lot fewer faces are now overlapping
	const foldFile = fs.readFileSync(
		"./tests/files/fold/disjoint-triangles-3d.fold",
		"utf-8",
	);
	const foldObject = JSON.parse(foldFile);
	const creasePattern = ear.graph.getFramesByClassName(foldObject, "creasePattern")[0];
	const foldedForm = {
		...creasePattern,
		vertices_coords: ear.graph.makeVerticesCoordsFolded(creasePattern),
	};
	const planes = ear.graph.getCoplanarAdjacentOverlappingFaces(foldedForm);
	fs.writeFileSync(
		`./tests/tmp/coplanar-overlapping-planes-disjoint-separated.json`,
		JSON.stringify(planes, null, 2),
	);
});
