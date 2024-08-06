import fs from "fs";
import { expect, test } from "vitest";
import ear from "../src/index.js";

// const createRandomTriangleGraph = (NUM_TRIS = 10) => ({
// 	vertices_coords: Array.from(Array(3 * NUM_TRIS))
// 		.map(() => [Math.random(), Math.random(), Math.random()]),
// 	edges_vertices: Array.from(Array(NUM_TRIS))
// 		.flatMap((_, i) => [
// 			[i * 3 + 0, i * 3 + 1],
// 			[i * 3 + 1, i * 3 + 2],
// 			[i * 3 + 2, i * 3 + 0],
// 		]),
// 	edges_assignment: Array.from(Array(NUM_TRIS))
// 		.flatMap(() => ["B", "B", "B"]),
// 	faces_vertices: Array.from(Array(NUM_TRIS))
// 		.map((_, i) => [i * 3, i * 3 + 1, i * 3 + 2]),
// });

test("getFacesPlane, random planes", () => {
	// randomly place a bunch of triangles in a 3D -1...+1 bounding box
	// disjoint triangles in 3D
	const foldFile = fs.readFileSync(
		"./tests/files/fold/random-triangles-3d.fold",
		"utf-8",
	);
	const graph = JSON.parse(foldFile);

	const {
		// planes,
		// planes_faces,
		planes_transform,
		faces_plane,
		// faces_winding,
	} = ear.graph.getFacesPlane(graph);

	// one point for every face which lies in the plane
	const faces_center = ear.graph.makeFacesCenterQuick(graph);
	const faces_polygon = ear.graph.makeFacesPolygonQuick(graph);

	const faces_centerXY = faces_center.map((point, f) =>
		ear.math.multiplyMatrix4Vector3(planes_transform[faces_plane[f]], point),
	);
	const faces_polygonXY = faces_polygon.map((points, f) =>
		points.map((point) =>
			ear.math.multiplyMatrix4Vector3(planes_transform[faces_plane[f]], point),
		),
	);

	expect(faces_plane).toHaveLength(10);
	expect(faces_center).toHaveLength(10);
	expect(faces_polygon).toHaveLength(10);

	faces_centerXY.map(([, , z]) => z).forEach((n) => expect(n).toBeCloseTo(0.0));
	faces_polygonXY
		.flatMap((points) => points.map(([, , z]) => z))
		.forEach((n) => expect(n).toBeCloseTo(0.0));
});

test("getFacesPlane, upside-down planes", () => {
	// disjoint triangles in 3D
	const graph = ear.graph.populate({
		vertices_coords: [
			// counter
			[-1, -1, 5],
			[1, 0, 5],
			[-1, 1, 5],
			// counter
			[-1, -1, -6],
			[1, 0, -6],
			[-1, 1, -6],
			// clockwise
			[-1, -1, 7],
			[-1, 1, 7],
			[1, 0, 7],
			// clockwise
			[-1, -1, -8],
			[-1, 1, -8],
			[1, 0, -8],
		],
		faces_vertices: [
			[0, 1, 2],
			[3, 4, 5],
			[6, 7, 8],
			[9, 10, 11],
		],
	});

	const { planes, planes_faces, planes_transform, faces_plane, faces_winding } =
		ear.graph.getFacesPlane(graph);

	const faces_center = ear.graph.makeFacesCenterQuick(graph);

	const faces_polygon = ear.graph.makeFacesPolygonQuick(graph);

	const faces_centerXY = faces_center.map((point, f) =>
		ear.math.multiplyMatrix4Vector3(planes_transform[faces_plane[f]], point),
	);

	const faces_polygonXY = faces_polygon.map((points, f) =>
		points.map((point) =>
			ear.math.multiplyMatrix4Vector3(planes_transform[faces_plane[f]], point),
		),
	);

	expect(planes).toMatchObject([
		{ normal: [0, 0, 1], origin: [-0, -0, -8] },
		{ normal: [0, 0, 1], origin: [-0, -0, -6] },
		{ normal: [0, 0, 1], origin: [0, 0, 5] },
		{ normal: [0, 0, 1], origin: [0, 0, 7] },
	]);

	expect(planes_faces).toMatchObject([[3], [1], [0], [2]]);

	expect(planes_transform).toMatchObject([
		[1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 8, 1],
		[1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 6, 1],
		[1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, -5, 1],
		[1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, -7, 1],
	]);

	expect(faces_plane).toMatchObject([2, 1, 3, 0]);

	expect(faces_winding).toMatchObject([true, true, false, false]);

	faces_centerXY.map(([, , z]) => z).forEach((n) => expect(n).toBeCloseTo(0.0));
	faces_polygonXY
		.flatMap((points) => points.map(([, , z]) => z))
		.forEach((n) => expect(n).toBeCloseTo(0.0));
});

test("getFacesPlane, disjoint", () => {
	const foldFile = fs.readFileSync(
		"./tests/files/fold/disjoint-triangles-3d.fold",
		"utf-8",
	);
	const foldObject = JSON.parse(foldFile);
	const foldedFrame = ear.graph.getFramesByClassName(foldObject, "foldedForm")[0];
	const { planes, planes_faces, faces_plane, faces_winding } =
		ear.graph.getFacesPlane(foldedFrame);
	fs.writeFileSync(
		`./tests/tmp/coplanar-planes-disjoint.json`,
		JSON.stringify(
			{
				planes,
				planes_faces,
				faces_plane,
				faces_winding,
			},
			null,
			2,
		),
	);

	expect(planes.length).toBe(3);

	// plane 0
	expect(JSON.stringify(planes_faces[0])).toBe(JSON.stringify([0, 1, 4, 5, 8, 11]));
	expect(JSON.stringify(planes_faces[0].map((face) => faces_winding[face]))).toBe(
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
	expect(JSON.stringify(planes_faces[1].map((face) => faces_winding[face]))).toBe(
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
	expect(JSON.stringify(planes_faces[2].map((face) => faces_winding[face]))).toBe(
		JSON.stringify([true, true, true, true, true, true, false]),
	);
	expect(planes[2].origin[0]).toBeCloseTo(0);
	expect(planes[2].origin[1]).toBeCloseTo(0);
	expect(planes[2].origin[2]).toBeCloseTo(0);
	expect(planes[2].normal[0]).toBeCloseTo(0);
	expect(planes[2].normal[1]).toBeCloseTo(1);
	expect(planes[2].normal[2]).toBeCloseTo(0);
});

test("getFacesPlane, disjoint and separated", () => {
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
	const { planes, planes_faces, faces_plane, faces_winding } =
		ear.graph.getFacesPlane(foldedForm);
	fs.writeFileSync(
		`./tests/tmp/coplanar-planes-disjoint-separated.json`,
		JSON.stringify(
			{
				planes,
				planes_faces,
				faces_plane,
				faces_winding,
			},
			null,
			2,
		),
	);

	expect(planes.length).toBe(2);

	// plane 0
	expect(JSON.stringify(planes_faces[0])).toBe(JSON.stringify([0, 1, 4, 5, 8, 10, 12]));
	expect(JSON.stringify(planes_faces[0].map((face) => faces_winding[face]))).toBe(
		JSON.stringify([true, true, true, true, true, true, true]),
	);
	expect(planes[0].origin[0]).toBeCloseTo(0);
	expect(planes[0].origin[1]).toBeCloseTo(0);
	expect(planes[0].origin[2]).toBeCloseTo(0);
	expect(planes[0].normal[0]).toBeCloseTo(0);
	expect(planes[0].normal[1]).toBeCloseTo(0);
	expect(planes[0].normal[2]).toBeCloseTo(1);

	// plane 1
	expect(JSON.stringify(planes_faces[1])).toBe(JSON.stringify([2, 3, 6, 7, 9, 11, 13]));
	expect(JSON.stringify(planes_faces[1].map((face) => faces_winding[face]))).toBe(
		JSON.stringify([true, true, true, true, true, true, true]),
	);
	expect(planes[1].origin[0]).toBeCloseTo(0);
	expect(planes[1].origin[1]).toBeCloseTo(0);
	expect(planes[1].origin[2]).toBeCloseTo(0);
	expect(planes[1].normal[0]).toBeCloseTo(0);
	expect(planes[1].normal[1]).toBeCloseTo(1);
	expect(planes[1].normal[2]).toBeCloseTo(0);
});

test("getFacesPlane, maze", () => {
	const foldFile = fs.readFileSync("./tests/files/fold/maze-u.fold", "utf-8");
	const foldObject = JSON.parse(foldFile);
	const foldedFrame = ear.graph.getFramesByClassName(foldObject, "foldedForm")[0];
	const result = ear.graph.getFacesPlane(foldedFrame);
	fs.writeFileSync(
		`./tests/tmp/coplanar-planes-maze-u.json`,
		JSON.stringify(result, null, 2),
	);

	// ensure all faces are accounted for.
	const totalFaceCount = foldedFrame.faces_vertices.length;
	const faceFound = [];
	result.planes_faces.forEach((el) =>
		el.forEach((f) => {
			faceFound[f] = true;
		}),
	);
	expect(faceFound.filter((a) => a !== undefined).length).toBe(totalFaceCount);

	// ensure face normals directions match.
	const facesNormal = ear.graph.makeFacesNormal(foldedFrame);
	result.faces_plane.forEach((plane, f) => {
		const planeFacesDot = ear.math.dot(result.planes[plane].normal, facesNormal[f]);
		// if aligned is true, dot product should be 1. if false, should be -1.
		expect(planeFacesDot).toBeCloseTo(result.faces_winding[f] ? 1 : -1);
	});
});

test("coplanar and overlapping faces, Mooser's train, carriage only", () => {
	const FOLD = fs.readFileSync("./tests/files/fold/moosers-train-carriage.fold", "utf-8");
	const graph = JSON.parse(FOLD);
	const folded = {
		...graph,
		vertices_coords: ear.graph.makeVerticesCoordsFolded(graph),
	};

	const {
		planes,
		planes_faces,
		// faces_plane,
		// faces_winding,
	} = ear.graph.getFacesPlane(folded);

	const expectedPlanes = [
		{ normal: [0, 0, 1], origin: [0, 0, -4] },
		{ normal: [0, 0, 1], origin: [0, 0, -2] },
		{ normal: [0, 0, 1], origin: [0, 0, 0] },
		{ normal: [0, 0, 1], origin: [0, 0, 6] },
		{ normal: [-1, 0, 0], origin: [38, 0, 0] },
		{ normal: [-1, 0, 0], origin: [35, 0, 0] },
		{ normal: [-1, 0, 0], origin: [33, 0, 0] },
		{ normal: [-1, 0, 0], origin: [27, 0, 0] },
		{ normal: [-1, 0, 0], origin: [25, 0, 0] },
		{ normal: [-1, 0, 0], origin: [22, 0, 0] },
		{ normal: [0, -1, 0], origin: [0, 8, 0] },
		{ normal: [0, -1, 0], origin: [0, 7, 0] },
		{ normal: [0, -1, 0], origin: [0, 1, 0] },
		{ normal: [0, -1, 0], origin: [0, 0, 0] },
	];

	const expectedPlanesFaces = [
		// the bottom of all four wheels
		[5, 11, 120, 127],
		// the underside of the carriage
		[
			13, 9, 14, 68, 69, 70, 71, 79, 80, 81, 87, 2, 3, 7, 72, 73, 78, 88, 89, 8, 64, 65,
			66, 67, 92, 109, 110, 111, 116, 117, 138, 126, 58, 59, 60, 61, 83, 108, 133, 82,
		],
		// the hitch join plane
		[
			26, 19, 17, 16, 18, 144, 22, 0, 23, 91, 99, 101, 139, 24, 25, 141, 102, 123, 128,
			136, 20, 27, 21, 112, 114, 28,
		],
		// the top of the carriage
		[55],
		// the front of the carriage
		[1, 75, 90, 95, 96, 97, 98, 100, 103, 104, 113, 115, 124, 129, 130, 137, 142, 143],
		// side A of wheel set 1
		[4, 29, 93, 140],
		// side B of wheel set 1
		[6, 31, 118, 119],
		// side A of wheel set 2
		[10, 32, 134, 135],
		// side B of wheel set 2
		[12, 34, 121, 122],
		// the backside of the carriage
		[50, 15, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 56],
		// one side of the carriage
		[74, 62, 63, 76, 77, 85, 107, 86, 84],
		// back of one set of wheels
		[94, 125],
		// back of one set of wheels
		[30, 33],
		// one side of the carriage
		[105, 131, 132, 106, 51, 52, 53, 54, 57],
	];

	expect(planes).toHaveLength(14);

	[4, 40, 26, 1, 18, 4, 4, 4, 4, 18, 9, 2, 2, 9].forEach((len, i) =>
		expect(planes_faces[i]).toHaveLength(len),
	);

	planes.forEach((_, i) =>
		[0, 1, 2].forEach((d) => {
			expect(planes[i].normal[d]).toBeCloseTo(expectedPlanes[i].normal[d]);
			expect(planes[i].origin[d]).toBeCloseTo(expectedPlanes[i].origin[d]);
		}),
	);

	expect(planes_faces).toMatchObject(expectedPlanesFaces);
});

test("coplanar and overlapping faces, Mooser's train, engine only", () => {
	const FOLD = fs.readFileSync("./tests/files/fold/moosers-train-engine.fold", "utf-8");
	const graph = JSON.parse(FOLD);
	const folded = {
		...graph,
		vertices_coords: ear.graph.makeVerticesCoordsFolded(graph),
	};

	const {
		planes,
		planes_faces,
		// faces_plane,
		// faces_winding,
	} = ear.graph.getFacesPlane(folded);

	const expectedPlanes = [
		{ normal: [0, 0, 1], origin: [0, 0, 0] },
		{ normal: [0, -0.5, -0.8660254037844389], origin: [0, 1, 1.7320508075688767] },
		{ normal: [0, -0.5, -0.8660254037844389], origin: [0, 0, 0] },
		{ normal: [0, -0.5, -0.8660254037844389], origin: [0, -1, -1.7320508075688694] },
		{ normal: [0, -0.5, -0.8660254037844389], origin: [0, -4, -6.928203230275504] },
		{ normal: [0, -0.8660254037844387, 0.5], origin: [0, 0, 0] },
		{ normal: [0, -0.8660254037844387, 0.5], origin: [0, -2.598076211353321, 1.5] },
		{ normal: [0, -0.8660254037844387, 0.5], origin: [0, -4.330127018922196, 2.5] },
		{ normal: [0, -0.8660254037844387, 0.5], origin: [0, -6.062177826491074, 3.5] },
		{ normal: [0, -0.8660254037844387, 0.5], origin: [0, -7.79422863405995, 4.5] },
		{ normal: [0, -0.8660254037844387, 0.5], origin: [0, -9.526279441628816, 5.5] },
		{ normal: [0, -0.8660254037844387, 0.5], origin: [0, -10.392304845413257, 6] },
		{ normal: [0, -0.8660254037844387, 0.5], origin: [0, -11.25833024919769, 6.5] },
		{ normal: [0, -0.8660254037844387, 0.5], origin: [0, -13.85640646055101, 8] },
		{ normal: [1, 0, 0], origin: [44, 0, 0] },
		{ normal: [1, 0, 0], origin: [45, 0, 0] },
		{ normal: [1, 0, 0], origin: [51, 0, 0] },
		{ normal: [1, 0, 0], origin: [52, 0, 0] },
		{
			normal: [0.7071067811865611, 0.3535533905932669, 0.6123724356957827],
			origin: [21.171572875254608, 10.585786437626895, 18.335119948],
		},
		{
			normal: [0.7071067811865611, 0.3535533905932669, 0.6123724356957827],
			origin: [24, 12, 20.784609690826453],
		},
		{
			normal: [0.7071067811865346, -0.3535533905932799, -0.6123724356958058],
			origin: [24, -12, -20.784609690826525],
		},
		{
			normal: [0.7071067811865346, -0.3535533905932799, -0.6123724356958058],
			origin: [26.82842712474543, -13.414213562373194, -23.234099433609902],
		},
	];

	const expectedPlanesFaces = [
		// cowcatcher
		[153, 154, 155, 156, 133, 0, 1, 118, 132, 117, 157, 158],
		// bottom of wheels, 6 wheels
		[5, 89, 11, 180, 17, 181],
		// below boiler base plane and undercarriage
		[
			83, 84, 85, 86, 120, 146, 147, 148, 106, 119, 145, 196, 202, 20, 87, 88, 110, 179,
			39, 40, 92, 126, 217, 218, 124, 125, 185, 186, 187, 13, 15, 152, 9, 111, 112, 109,
			113, 14, 107, 108, 216, 105, 114, 104, 184, 3, 8, 159, 160, 93, 94, 115, 116, 2, 7,
			130, 131, 19, 151, 140, 37, 38, 215, 95,
		],
		// hitch join plane
		[32, 30, 34, 22, 33, 26, 31, 27, 28, 29, 24, 23, 25],
		// top of carriage
		[99],
		// smoke stack
		[
			161, 162, 169, 170, 171, 135, 213, 134, 199, 139, 137, 138, 209, 205, 206, 193, 194,
			195, 208, 212, 201, 203, 204, 163, 164, 165, 166, 136, 188, 189, 190, 200, 210, 174,
			175, 214, 177, 176, 167, 168,
		],
		// front wheel row, front side plane
		[219, 4, 48, 35],
		// front wheel row, back side plane
		[6, 50, 90, 91],
		// middle wheel row, front side plane
		[211, 10, 51, 149],
		// middle wheel row, back side plane
		[12, 53, 182, 183],
		// back wheel row, front side plane
		[54, 16, 198, 197],
		// front of carriage, joint plane with back of boiler
		[
			141, 142, 143, 192, 79, 80, 42, 43, 44, 46, 47, 73, 74, 75, 96, 97, 98, 207, 77, 78,
			127, 128,
		],
		// back wheel row, back side plane
		[172, 173, 18, 56],
		// back of carriage
		[64, 68, 61, 62, 63, 65, 66, 67, 71, 72, 21, 69, 70, 100, 58, 59, 60, 57],
		// right side of carriage
		[101, 81, 82, 102, 103],
		// right three wheels, back faces
		[55, 52, 49],
		// left three wheels, back faces
		[178, 150, 36],
		// left side of carriage
		[122, 129, 121, 123, 144],
		// boiler, top right
		[76],
		// boiler, bottom left
		[41],
		// boiler, bottom right
		[191],
		// boiler, top left
		[45],
	];

	// I counted 22 planes
	expect(planes).toHaveLength(22);

	[12, 6, 64, 13, 1, 40, 4, 4, 4, 4, 4, 22, 4, 18, 5, 3, 3, 5, 1, 1, 1, 1].forEach(
		(len, i) => expect(planes_faces[i]).toHaveLength(len),
	);

	planes.forEach((_, i) =>
		[0, 1, 2].forEach((d) => {
			expect(planes[i].normal[d]).toBeCloseTo(expectedPlanes[i].normal[d]);
			expect(planes[i].origin[d]).toBeCloseTo(expectedPlanes[i].origin[d]);
		}),
	);

	expect(planes_faces).toMatchObject(expectedPlanesFaces);
});
