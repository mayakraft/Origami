/**
 * Rabbit Ear (c) Kraft
 */
import Messages from "../environment/messages.js";
import { countImpliedEdges } from "./count.js";
import { makeFacesWinding } from "./faces/winding.js";
import { makeVerticesToEdge, makeVerticesToFace } from "./make/lookup.js";

/**
 * @description Convert an array of indices into an array of array of
 * indices where each inner array forms a triangle fan: [0, 1, 2, 3, 4]
 * becomes [[0, 1, 2], [1, 2, 3], [1, 3, 4]].
 * @param {number[]} indices an array of indices
 * @returns {number[][]} an array of arrays where the inner arrays are
 * all of length 3.
 */
const makeTriangleFan = (indices) =>
	Array.from(Array(indices.length - 2)).map((_, i) => [
		indices[0],
		indices[i + 1],
		indices[i + 2],
	]);

/**
 * @description Triangulate a faces_vertices with the capability to handle
 * only convex faces. This will increase the number of faces.
 * @param {FOLD} graph a FOLD object.
 * @returns {number[][]} faces_vertices where all faces have only 3 vertices
 */
export const triangulateConvexFacesVertices = ({ faces_vertices }) =>
	faces_vertices.flatMap((vertices) =>
		vertices.length < 4 ? [vertices] : makeTriangleFan(vertices),
	);

/**
 * @description convert an array of any values into an array of arrays
 * where each of the inner arrays contains 3 elements.
 * This assumes the length % 3 is 0, if not, the couple remainders
 * will be chopped off.
 * @param {any[]} array an array containing any type
 * @returns {any[][]} array of arrays where each inner array is length 3.
 */
const groupByThree = (array) =>
	array.length === 3
		? [array]
		: Array.from(Array(Math.floor(array.length / 3))).map((_, i) =>
				[i * 3 + 0, i * 3 + 1, i * 3 + 2].map((j) => array[j]),
			);

/**
 * @description Triangulate a faces_vertices with the capability to handle
 * both convex and nonconvex. This will increase the number of faces.
 * You will need to link a reference to the package "Earcut" by Mapbox.
 * Earcut is a small and capable library with zero dependencies.
 * https://www.npmjs.com/package/earcut
 * @param {FOLD} graph a FOLD object.
 * @param {any} earcut the earcut npm package from Mapbox
 * @returns {number[][]} faces_vertices where all faces have only 3 vertices
 */
export const triangulateNonConvexFacesVertices = (
	{ vertices_coords, faces_vertices },
	earcut,
) => {
	if (!vertices_coords || !vertices_coords.length) {
		throw new Error(Messages.nonConvexTriangulation);
	}
	const dimensions = vertices_coords.filter(() => true).shift().length;

	// Small note on Earcut documentation: Earcut does not truly work in 3D,
	// it simply projects points down into 2D and ignores the Z component.
	// if we refactor this to include the plane which the face lies in, we can
	// filter only if the plane is orthogonal to the XY, therefore still
	// use earcut for some 3D faces, or even better, transform those planes
	// into the XY so that earcut works for everything.
	if (dimensions === 3 || !earcut) {
		return triangulateConvexFacesVertices({ faces_vertices });
	}

	// dimensions are 2 from here on
	// earcut does not maintain winding order, create a lookup for use later
	const faces_winding = makeFacesWinding({ vertices_coords, faces_vertices });

	return (
		faces_vertices
			.map((fv) => fv.flatMap((v) => vertices_coords[v]))
			.map((polygon) => earcut(polygon, null, dimensions))
			// earcut returns vertices [0...n] local to this one polygon
			// convert these indices back to the face's faces_vertices.
			.map((vertices, i) => vertices.map((j) => faces_vertices[i][j]))
			// finally, earcut does not maintain winding order, before we flatten
			// the list, reverse the triangles if they come from a face with an
			// upside-down winding.
			.flatMap((res, face) =>
				faces_winding[face]
					? groupByThree(res)
					: groupByThree(res).map((arr) => arr.reverse()),
			)
	);
};

/**
 * @description construct an entirely new set of edges_assignment, potentially
 * without any other edges_ information like edges_vertices. We can do this
 * by looking at the new faces created, because the new faces_vertices and
 * new faces_edges match winding, we can iterate over adjacent pairs of
 * face vertices in the new triangulated face and back-check if they exist
 * in the original faces_vertices list, if they don't use the matching
 * faces_edges edge and update the edges_assignment to be "J".
 * @param {FOLD} oldGraph a FOLD object, the old graph
 * @param {FOLD} newGraph a FOLD object, the new graph
 * @returns {string[]} edges_assignment
 */
const makeNewEdgesAssignment = (
	{ edges_vertices, faces_vertices },
	{ faces_vertices: faces_verticesNew, faces_edges: faces_edgesNew },
) => {
	const edges_assignment = edges_vertices
		? edges_vertices.map(() => "U")
		: Array.from(Array(countImpliedEdges({ faces_edges: faces_edgesNew }))).map(
				() => "U",
			);
	const lookup = makeVerticesToFace({ faces_vertices });
	faces_verticesNew.map((verts, i) =>
		verts
			.map((v, j, arr) => [v, arr[(j + 1) % arr.length]])
			.forEach(([v0, v1], j) => {
				const keys = [`${v0} ${v1}`, `${v1} ${v0}`];
				if (lookup[keys[0]] === undefined && lookup[keys[1]] === undefined) {
					const edge = faces_edgesNew[i][j];
					edges_assignment[edge] = "J";
				}
			}),
	);
	Array.from(Array(edges_assignment.length))
		.map((_, i) => i)
		.filter((i) => edges_assignment[i] === undefined)
		.forEach((i) => {
			edges_assignment[i] = "U";
		});
	return edges_assignment;
};

/**
 * @description A subroutine for both convex and non-convex triangulation
 * methods. This will run just after faces_vertices was modified to contain
 * only triangulated faces. This method rebuild faces_edges and
 * add new joined edges edges_vertices, assignment, and foldAngle.
 * @param {FOLD} graph a FOLD object
 * @param {FOLD} graph a FOLD object
 * @returns {FOLD} the same FOLD object as the parameter
 */
const rebuildTriangleEdges = (
	{ edges_vertices, edges_assignment, edges_foldAngle, faces_vertices },
	{ faces_vertices: faces_verticesNew },
) => {
	// if (!edges_vertices) { edges_vertices = []; }
	const edgeLookup = edges_vertices ? makeVerticesToEdge({ edges_vertices }) : {};
	let e = edges_vertices ? edges_vertices.length : 0;
	// as we traverse the new faces_edges, if we encounter a new edge, add
	// it here in the form of a new edges_vertices

	// these are additional edges_vertices, to be appended to the current list
	/** @type {[number, number][]} */
	const edges_verticesAppended = [];

	// this is an entirely new list of faces_edges, to replace entirely the old one
	const faces_edgesNew = faces_verticesNew.map((vertices) =>
		vertices.map((v, i, arr) => {
			/** @type {[number, number]} */
			const edge_vertices = [v, arr[(i + 1) % arr.length]];
			const vertexPair = edge_vertices.join(" ");
			if (vertexPair in edgeLookup) {
				return edgeLookup[vertexPair];
			}
			edges_verticesAppended.push(edge_vertices);
			edgeLookup[vertexPair] = e;
			edgeLookup[edge_vertices.slice().reverse().join(" ")] = e;
			return e++;
		}),
	);

	const edges_assignmentNew = edges_assignment
		? edges_assignment.concat(edges_verticesAppended.map(() => "J"))
		: makeNewEdgesAssignment(
				{ edges_vertices, faces_vertices },
				{ faces_vertices: faces_verticesNew, faces_edges: faces_edgesNew },
			);

	const result = {
		edges_vertices: edges_vertices
			? edges_vertices.concat(edges_verticesAppended)
			: edges_verticesAppended,
		faces_edges: faces_edgesNew,
		edges_assignment: edges_assignmentNew,
	};
	if (edges_foldAngle) {
		const edges_foldAngleAppended = edges_verticesAppended.map(() => 0);
		result.edges_foldAngle = edges_foldAngle.concat(edges_foldAngleAppended);
	}
	return result;
};

/**
 * @description Given a faces_vertices, generate a nextmap which
 * describes how the faces will change after triangulation,
 * specifically by triangulateConvexFacesVertices or
 * triangulateNonConvexFacesVertices.
 * @param {FOLD} graph a FOLD object
 * @returns {number[][]} a nextmap of faces, arrayMap type
 */
const makeTriangulatedFacesNextMap = ({ faces_vertices }) => {
	let count = 0;
	return faces_vertices
		.map((verts) => Math.max(3, verts.length))
		.map((length) => Array.from(Array(length - 2)).map(() => count++));
};

/**
 * @description Modify a fold graph so that all faces are triangles.
 * This will increase the number of faces and edges, and give all
 * new edges a "J" join assignment.
 * This method is capable of parsing models with convex faces only without
 * any additional help. If your model contains non-convex faces, this method
 * can still triangulate your model, however, you will need to link
 * a reference to the package "Earcut" by Mapbox. Earcut is a small and
 * capable library with zero dependencies: https://www.npmjs.com/package/earcut
 * @param {FOLD} graph a FOLD object, modified in place.
 * @param {any} earcut an optional reference to the Earcut library
 * by Mapbox, required to operate on a graph with non-convex faces.
 * @returns {{
 *   result: FOLD,
 *   changes: { faces?: { map: number[][] }, edges?: { new: number[] } },
 * }}
 * a summary of changes to the input parameter. the faceMap is an arrayMap
 * @todo preserve faceOrders, match preexisting faces against new ones,
 * this may create too much unnecessary data but at least it will work.
 */
export const triangulate = (
	{
		vertices_coords,
		edges_vertices,
		edges_assignment,
		edges_foldAngle,
		faces_vertices,
		faceOrders,
	},
	earcut,
) => {
	if (!faces_vertices) {
		const result = {
			vertices_coords,
			edges_vertices,
			edges_assignment,
			edges_foldAngle,
		};
		Object.keys(result)
			.filter((key) => !result[key])
			.forEach((key) => delete result[key]);
		return { result, changes: {} };
	}
	const nextMap = makeTriangulatedFacesNextMap({ faces_vertices });
	const faces_verticesNew = earcut
		? triangulateNonConvexFacesVertices({ vertices_coords, faces_vertices }, earcut)
		: triangulateConvexFacesVertices({ faces_vertices });
	// if the graph did not contain edges_vertices after this method, it will

	// this graph contains edges_vertices and faces_edges, and if they exist,
	// edges_assignment and edges_foldAngle
	const edgeGraph = rebuildTriangleEdges(
		{
			edges_vertices,
			edges_assignment,
			edges_foldAngle,
			faces_vertices,
		},
		{ faces_vertices: faces_verticesNew },
	);

	// add vertices_coords and faces_vertices to the new triangulated edge graph
	const result = {
		...edgeGraph,
		vertices_coords,
		faces_vertices: faces_verticesNew,
	};

	// create an edge map
	const startingEdgeCount = edges_vertices ? edges_vertices.length : 0;
	const newEdges = Array.from(
		Array(edgeGraph.edges_vertices.length - startingEdgeCount),
	).map((_, i) => startingEdgeCount + i);
	const changes = {
		faces: { map: nextMap },
		edges: { new: newEdges },
	};
	return { result, changes };
};
