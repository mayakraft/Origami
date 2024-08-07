/**
 * Rabbit Ear (c) Kraft
 */
import { uniqueElements, splitCircularArray } from "../../general/array.js";
import { makeEdgesFacesUnsorted } from "../make/edgesFaces.js";
import { makeVerticesToEdge, makeVerticesToFace } from "../make/lookup.js";
import { addEdge, addIsolatedEdge } from "../add/edge.js";
import { remove } from "../remove.js";
import { makeVerticesFacesForVertex } from "./general.js";

/**
 * @description Return true if all of the contents of an array are unique
 * (the conversion into a set results in an array of the same length).
 * @param {any[]} array an array of any type
 * @returns {boolean}
 */
const arrayValuesAreUnique = (array) =>
	Array.from(new Set(array)).length === array.length;

/**
 * @description Splice in the leaf vertex and duplicate the vertex
 * at the splice index to be on either side of the leaf vertex, like:
 * _ _ _ 5 8 5 _ _, where 5 got spliced into the spot where 8 was.
 * @param {any[]} array an array of any type
 * @param {number} spliceIndex the index to splice into the array
 * @param {any} newElement matching type as array, the new element to splice in
 * @returns {any[]} a copy of the input array, with new elements.
 * @example
 * splitArrayWithLeaf(array, 3, 99)
 * // [0, 1, 2, 3, 99, 3, 4, 5, 6]
 */
const splitArrayWithLeaf = (array, spliceIndex, newElement) => {
	const arrayCopy = [...array];
	const duplicateElement = array[spliceIndex];
	arrayCopy.splice(spliceIndex, 0, duplicateElement, newElement);
	return arrayCopy;
};

/**
 * @description ensure that the two vertices are not next to each other
 * in the current face's faces_vertices vertices list.
 * @param {FOLD} graph a FOLD object
 * @param {number} face
 * @param {number[]} vertices
 * @returns {boolean}
 */
const edgeExistsInFace = ({ faces_vertices }, face, vertices) =>
	faces_vertices[face]
		.map((v, i, arr) => [v, arr[(i + 1) % arr.length]])
		.map(
			([v0, v1]) =>
				(v0 === vertices[0] && v1 === vertices[1]) ||
				(v0 === vertices[1] && v1 === vertices[0]),
		)
		.reduce((a, b) => a || b, false);

/**
 * @description A new cycle (face) of vertices has been created,
 * using this cycle, we want to update the adjacent vertices list for a
 * particular vertex, specifically we want to find the index of
 * @param {number[]} cycle
 * @param {number[]} adjacent
 * @param {number} vertex
 * @returns {number}
 */
const getAdjacencySpliceIndex = (cycle, adjacent, vertex) => {
	// the index of this vertex inside cycle
	const indexInCycle = cycle.indexOf(vertex);
	if (indexInCycle === -1) {
		return -1;
	}

	// the previous and next vertex in the cycle from this vertex
	const prevVertex = cycle[(indexInCycle + cycle.length - 1) % cycle.length];
	const nextVertex = cycle[(indexInCycle + 1) % cycle.length];

	// both the cycle and the adjacent vertices windings are counter-clockwise,
	// this means that when walking around the cycle the "prev" and "next"
	// vertices, when observed in the adjacency list, will be visited in reverse,
	// "prev" will appear right after "next". (feels a bit backwards).
	// so, in the adjacency, we want to splice inbetween "next", ___, "prev",
	// and for Javascript splice() this means we use the "prev" index.
	const prevIndex = adjacent.indexOf(prevVertex);
	if (prevIndex === -1) {
		return -1;
	}

	// quickly verify that "nextVertex" is the vertex previous to "prev"
	// in the adjacency array, verifying that the adjacency was built correctly
	const nextTest = adjacent[(prevIndex + adjacent.length - 1) % adjacent.length];
	return nextTest !== nextVertex ? -1 : prevIndex;
};

/**
 * @description Update vertices_vertices for two vertices, following
 * a new edge having just been made to connect the pair of vertices.
 * These vertices are both members of the same face, whose faces_vertices
 * was just updated.
 * ```
 *     (4)     ___---O.  (3)                (3)     ___---O.  (2)
 *         O---         \.                      O---         \.
 *        /   .            O  (2)              /   .  (6) O    O  (1)
 *       /       .        /                   /       .   |   /
 *  (0) O____      .   /                 (4) O____      . | /
 *           ----____O  (1)                       ----____O  (5)(0)
 * ```
 * @param {FOLD} graph a FOLD object
 * @param {number} face the index of the face containing these two vertices
 * @param {number[]} vertices the two vertices newly connected by an edge
 * @returns {undefined}
 */
const updateVerticesVertices = (
	{ vertices_vertices, faces_vertices },
	face, // todo: is this okay, for leaf, this contents is actually the updated contents
	vertices,
) => {
	if (!vertices_vertices) {
		return;
	}

	const verticesSpliceIndex = vertices.map((v) =>
		getAdjacencySpliceIndex(faces_vertices[face], vertices_vertices[v], v),
	);

	verticesSpliceIndex.forEach((index, i) => {
		const otherVertex = vertices[(i + 1) % vertices.length];
		if (index !== -1) {
			vertices_vertices[vertices[i]].splice(index, 0, otherVertex);
		} else {
			vertices_vertices[vertices[i]].push(otherVertex);
		}
	});
};

/**
 * @description We are building a new edge between these two vertices.
 * Update vertices_edges, having just updated vertices_vertices.
 * @param {FOLD} graph a FOLD object
 * @param {number[]} vertices two vertex indices
 * @param {number} edge an edge index
 * @returns {undefined}
 */
const updateVerticesEdges = ({ vertices_edges, vertices_vertices }, vertices, edge) => {
	if (!vertices_edges) {
		return;
	}

	// vertices_vertices does not exist, create an unsorted solution.
	if (!vertices_vertices) {
		vertices.forEach((v) => vertices_edges[v].push(edge));
		return;
	}

	// for each of the two vertices, check its vertices_vertices for the
	// index of the opposite vertex. this is the edge. return its position
	// in the vertices_vertices to be used to insert into vertices_edges.
	const spliceIndices = vertices.map((v, i, arr) =>
		vertices_vertices[v].indexOf(arr[(i + 1) % arr.length]),
	);

	if (spliceIndices.some((i) => i === -1)) {
		throw new Error(`splitFace() vertices_edges ${vertices.join(", ")}`);
	}

	// vvIndex is an index inside vertices_edges (or vertices_vertices)
	// splice the new edge so that it gets inserted before the
	// edge at the current index
	spliceIndices.forEach((index, i) => {
		vertices_edges[vertices[i]].splice(index, 0, edge);
	});
};

/**
 * @description Update vertices_faces
 * @param {FOLD} graph a FOLD object
 * @param {number} face
 * @param {number[]} faces
 * @returns {undefined}
 */
const updateVerticesFaces = (
	{ vertices_vertices, vertices_edges, vertices_faces, edges_vertices, faces_vertices },
	face,
	faces,
) => {
	if (!vertices_faces || !faces_vertices) {
		return;
	}

	// all faces which are in need of an update includes more than just our
	// new vertices. other vertices which are associated with the face-to-be-
	// removed need to know which of the new faces replaces the old face index
	const allVertices = uniqueElements(faces.flatMap((f) => faces_vertices[f]));

	// get all faces involved, but filter out the old face.
	// due to vertices_faces, we have to filter out any null values
	const allFaces = uniqueElements([
		...faces,
		...allVertices.flatMap((v) => vertices_faces[v]),
	])
		.filter((f) => f !== face)
		.filter((a) => a !== undefined && a !== null);

	const verticesToFace = makeVerticesToFace({ faces_vertices }, allFaces);

	allVertices
		.map((vertex) =>
			makeVerticesFacesForVertex(
				{ vertices_vertices, vertices_edges, edges_vertices },
				vertex,
				verticesToFace,
			),
		)
		.forEach((v_f, i) => {
			vertices_faces[allVertices[i]] = v_f || [];
		});
};

/**
 * @description called near the end of the split_convex_face method.
 * update the "edges_faces" array for every edge involved.
 * figure out where the old_face's index is in each edges_faces array,
 * figure out which of the new faces (or both) need to be added and
 * substitute the old index with the new face's index/indices.
 * @param {FOLD} graph a FOLD object
 * @param {number} face the index of the face being replaced
 * @param {number[]} faces a list of faces which will replace the old face
 * @param {number} edge the new edge index
 * @returns {undefined}
 */
const updateEdgesFaces = (
	{ edges_vertices, faces_vertices, edges_faces, faces_edges },
	face,
	faces,
	edge,
) => {
	if (!edges_faces) {
		return;
	}

	// it's probably rare for a graph to have edges_faces but no faces_edges.
	// This is an easy solution, just build the entire array from scratch.
	if (!faces_edges) {
		edges_faces.forEach((_, i) => delete edges_faces[i]);
		Object.assign(
			edges_faces,
			makeEdgesFacesUnsorted({ edges_vertices, faces_vertices, faces_edges }),
		);
		return;
	}

	const facesHash = {};
	[...faces, face].forEach((f) => {
		facesHash[f] = true;
	});

	const edges = Array.from(new Set(faces.flatMap((f) => faces_edges[f])));

	const edgesOtherFaces = [];
	edges.forEach((e) => {
		edgesOtherFaces[e] = edges_faces[e].filter((f) => !facesHash[f]);
	});

	const edgesTheseFaces = [];
	edges.forEach((e) => {
		edgesTheseFaces[e] = [];
	});
	faces.forEach((f) => faces_edges[f].forEach((e) => edgesTheseFaces[e].push(f)));

	edges.forEach((e) => {
		edges_faces[e] = Array.from(new Set([...edgesTheseFaces[e], ...edgesOtherFaces[e]]));
	});

	edges_faces[edge] = [...faces];
};

/**
 * @description A subroutine of splitFaceWithEdge only (where one face becomes
 * two faces). This method will create two new faces's faces_vertices and
 * append them to the graph. Momentarily, these will coexist with the face they
 * are meant to replace, but the old face will be deleted at the end of the
 * main method.
 * @param {FOLD} graph a FOLD object
 * @param {number} face the index of the face to be split into two faces
 * @param {[number, number]} vertices two vertices, members of this face's
 * vertices, which will become a new edge and split the face into two faces.
 */
const updateFacesVerticesSplit = ({ faces_vertices }, face, vertices) => {
	const [i0, i1] = vertices.map((vertex) => faces_vertices[face].indexOf(vertex));
	return splitCircularArray(faces_vertices[face], [i0, i1]).map((face_vertices) =>
		faces_vertices.push(face_vertices),
	);
};

/**
 * @description A subroutine of splitFaceWithLeafEdge only (where a leaf edge
 * is added but the number of faces remains the same). This method will
 * create a new set of faces_vertices which cycles around the face, visits
 * the leaf vertex, then returns to the vertex from which it just came (making
 * this vertex appear twice in the face).
 * @param {FOLD} graph a FOLD object
 * @param {number} face the index of the face to get the new edge.
 * @param {number} vertexFace the vertex which is currently in the face.
 * @param {number} vertexLeaf the vertex which is not currently in the face.
 * @returns {undefined}
 */
const updateFacesVerticesLeaf = ({ faces_vertices }, face, vertexFace, vertexLeaf) => {
	if (!faces_vertices) {
		return;
	}
	// this method will splice in the leaf vertex and duplicate the vertex
	// at the splice index to be on either side of the leaf vertex, like:
	// _ _ _ 5 8 5 _ _, where 5 got spliced into the spot where 8 was.
	faces_vertices[face] = splitArrayWithLeaf(
		faces_vertices[face],
		faces_vertices[face].indexOf(vertexFace),
		vertexLeaf,
	);
};

/**
 * @description In the case where we are building two new faces in place of
 * an old face, construct new faces_edges for the new faces by consulting
 * the newly created faces_vertices for each face. Do this by gathering all
 * edges involved (from the old face's faces_edges, and the new edge), create
 * a vertex-pair to edge lookup, then convert faces_vertices to faces_edges.
 * @param {FOLD} graph a FOLD object
 * @param {number} face the index of the face being replaced
 * @param {number[]} faces a list of faces which will replace the old face
 * @param {number} edge the new edge index
 * @returns {undefined}
 */
const updateFacesEdges = (
	{ edges_vertices, faces_vertices, faces_edges },
	face,
	faces,
	edge,
) => {
	if (!faces_edges) {
		return;
	}

	// all edges involved in this rewrite, duplicates are okay here.
	const allEdges = [...faces_edges[face], edge];

	// create a reverse lookup, pairs of vertices to an edge.
	// const verticesToEdge = makeVerticesToEdgeLookup({ edges_vertices }, allEdges);
	const verticesToEdge = makeVerticesToEdge({ edges_vertices }, allEdges);

	// simply rebuild the faces_edges in question using the vertices-edge lookup
	const newFacesEdges = faces.map((f) =>
		faces_vertices[f]
			.map((fv, i, arr) => [fv, arr[(i + 1) % arr.length]])
			.map((pair) => pair.join(" "))
			.map((key) => verticesToEdge[key]),
	);

	if (newFacesEdges.flat().some((e) => e === undefined)) {
		throw new Error(`splitFace() faces_edges ${face}`);
	}

	faces.forEach((f, i) => {
		faces_edges[f] = newFacesEdges[i];
	});
};

/**
 * @description one face was removed and one or two faces put in its place.
 * regarding the faces_faces array, updates need to be made to the two
 * new faces, as well as all the previously neighboring faces of
 * the removed face.
 * @param {FOLD} graph a FOLD object
 * @param {number} oldFace
 * @param {number[]} faces a list of faces which will replace the old face
 * @returns {undefined}
 */
const updateFacesFaces = (
	{ edges_vertices, edges_faces, faces_vertices, faces_edges, faces_faces },
	oldFace,
	faces,
) => {
	if (!faces_faces) {
		return;
	}

	// these are all of the faces which need their faces_faces updated
	// due to faces_faces we have to filter out any undefined or null
	const allFaces = uniqueElements([...faces_faces[oldFace], ...faces]).filter(
		(a) => a !== undefined && a !== null,
	);

	// if both edges_faces and faces_edges exists, this is the easiest way:
	// for every edge, get the face across it, this preserves winding order.
	if (edges_faces && faces_edges) {
		allFaces.forEach((face) => {
			faces_faces[face] = faces_edges[face].map((edge) =>
				edges_faces[edge].find((f) => f !== face),
			);
		});
		return;
	}
	// if (edges_faces && faces_vertices && edges_vertices) {
	// 	// this is not great, we can't pass in a subset of edges here.
	// 	const verticesToEdge = makeVerticesToEdge({ edges_vertices });
	// 	allFaces.forEach(face => {
	// 		const face_edges = faces_vertices[face]
	// 			.map((v, i, arr) => [v, arr[(i + 1) % arr.length]])
	// 			.map(pair => pair.join(" "))
	// 			.map(key => verticesToEdge[key]);
	// 		faces_faces[face] = face_edges
	// 			.map(edge => edges_faces[edge].find(f => f !== face));
	// 	});
	// 	return;
	// }

	if (edges_vertices && faces_vertices) {
		const verticesToFace = makeVerticesToFace({ faces_vertices }, allFaces);
		allFaces.forEach((face) => {
			faces_faces[face] = faces_vertices[face]
				// build the vertex pair in reverse to get the face opposite
				.map((v, i, arr) => [arr[(i + 1) % arr.length], v])
				.map((pair) => pair.join(" "))
				.map((key) => verticesToFace[key]);
		});
	}
};

/**
 * @description Every faceOrder in which our oldFace appears, replace
 * it with two new faceOrders where the oldFace is replaced with
 * one of each of the two newFaces.
 * @param {FOLD} graph a FOLD graph
 * @param {number} oldFace
 * @param {number[]} newFaces
 */
const updateFaceOrders = ({ faceOrders }, oldFace, newFaces) => {
	if (!faceOrders) {
		return;
	}
	// a single new face
	const newFace = newFaces[0];
	// all the other new faces besides the first face
	const faces = newFaces.slice(1);
	/** @type {[number, number, number][]} */
	const newFaceOrders = [];
	faceOrders.forEach(([f0, f1, order], i) => {
		if (f0 === oldFace) {
			faceOrders[i] = [newFace, f1, order];
			/** @type {[number, number, number][]} */
			const newOrders = faces.map((f) => [f, f1, order]);
			newFaceOrders.push(...newOrders);
		}
		if (f1 === oldFace) {
			faceOrders[i] = [f0, newFace, order];
			/** @type {[number, number, number][]} */
			const newOrders = faces.map((f) => [f0, f, order]);
			newFaceOrders.push(...newOrders);
		}
	});
	faceOrders.push(...newFaceOrders);
};

/**
 * @throws
 * @description Cut a face through one of the face's existing vertices to a
 * new vertex which is intended to be newly created, but not yet associated
 * with any face. This will create a new edge between the two vertices, which
 * the faces_edges will traverse twice, and this face's faces_vertices will
 * visit the faceVertex twice, going to and returning from the new leaf vertex.
 * @param {FOLD} graph a FOLD object
 * @param {number} face
 * @param {number} vertexFace
 * @param {number} vertexLeaf
 * @param {string} [assignment="U"]
 * @param {number} [foldAngle=0]
 * @returns {{ edge: number, faces: {} }} a summary of changes to the graph,
 * faces will not be changed so this object will be empty.
 */
export const splitFaceWithLeafEdge = (
	graph,
	face,
	vertexFace,
	vertexLeaf,
	assignment = "U",
	foldAngle = 0,
) => {
	// validate inputs
	/** @type {[number, number]} */
	const vertices = [vertexFace, vertexLeaf];

	// construct edge
	const edge = addEdge(graph, vertices, [face, face], assignment, foldAngle);

	// rebuild face

	// this is a unique situation. from this point on we are associating
	// this leaf vertex with this face. make vertices_faces include this face.
	if (graph.vertices_faces) {
		graph.vertices_faces[vertexLeaf] = Array.from(
			new Set([...graph.vertices_faces[vertexLeaf], face]),
		);
	}

	// skip vertices_faces and edges_faces, these were previously set.
	// also, skip faces_faces, adjacent face data does not change.
	updateFacesVerticesLeaf(graph, face, vertexFace, vertexLeaf);
	updateFacesEdges(graph, face, [face], edge);
	updateVerticesVertices(graph, face, vertices);
	updateVerticesEdges(graph, vertices, edge);

	return {
		edge,
		faces: {},
	};
};

/**
 * @description Cut a face through one of the face's existing vertices to a
 * new point which is intended to become a new vertex and to be associated with
 * this face. This will create a new edge between the two vertices, which
 * the faces_edges will traverse twice, and this face's faces_vertices will
 * visit the faceVertex twice, going to and returning from the new leaf vertex.
 * @param {FOLD} graph a FOLD object
 * @param {number} face
 * @param {number} vertex
 * @param {[number, number]} point
 * @param {string} [assignment="U"]
 * @param {number} [foldAngle=0]
 * @returns {{ edge: number, faces: {} }} a summary of changes to the graph,
 * faces will not be changed so this object will be empty.
 */
// export const splitFaceLeafEdgePoint = (
// 	graph,
// 	face,
// 	vertex,
// 	point,
// 	assignment = "U",
// 	foldAngle = 0,
// ) => splitFaceWithLeafEdge(
// 	graph,
// 	face,
// 	vertex,
// 	addVertex(graph, point),
// 	assignment,
// 	foldAngle,
// );

/**
 * @throws Throws an error if the input graph data is poorly formed.
 * @description Split a face into two faces by specifying two vertices,
 * place a new edge between the two vertices, and rebuild all component arrays.
 * @param {FOLD} graph a FOLD object, modified in place, must contain
 * vertices_coords, edges_vertices, and faces_vertices to work.
 * @param {number} face index of face to split
 * @param {[number, number]} vertices the vertices which will create a new edge
 * @param {string} [assignment="U"] the assignment of the new edge
 * @param {number} [foldAngle=0] the fold angle of the new edge
 * @returns {{
 *   edge?: number,
 *   faces?: { map?: (number|number[])[], new?: number[], remove?: number },
 * }} a summary of changes to the FOLD object
 */
export const splitFaceWithEdge = (
	graph,
	face,
	vertices,
	assignment = "U",
	foldAngle = 0,
) => {
	if (!graph.vertices_coords || !graph.edges_vertices || !graph.faces_vertices) {
		return {};
	}
	if (vertices.length !== 2) {
		return {};
	}

	// this method will work fine with non-convex polygons, but if a face
	// contains a leaf edge, where the sequence of face_vertices visits the same
	// vertex more than once, this method might fail. don't proceed.
	if (!arrayValuesAreUnique(graph.faces_vertices[face])) {
		return {};
	}

	// ensure that the two vertices are not next to each other in
	// the current face's faces_vertices vertices list.
	if (edgeExistsInFace(graph, face, vertices)) {
		return {};
	}

	// edges_faces will be [x, x] where x is the index of
	// the old face, twice, and will be replaced later in this function.
	const edge = addEdge(graph, vertices, [face, face], assignment, foldAngle);

	const faces = [0, 1].map((i) => graph.faces_vertices.length + i);

	updateFacesVerticesSplit(graph, face, vertices);
	updateFacesEdges(graph, face, faces, edge);
	updateVerticesVertices(graph, face, vertices);
	updateVerticesEdges(graph, vertices, edge);
	updateVerticesFaces(graph, face, faces);
	updateEdgesFaces(graph, face, faces, edge);
	updateFacesFaces(graph, face, faces);
	updateFaceOrders(graph, face, faces);

	// remove old data
	const faceMap = remove(graph, "faces", [face]);

	// the graph is now complete, however our return object needs updating.
	// shift our new face indices since these relate to the graph before remove().
	faces.forEach((_, i) => {
		faces[i] = faceMap[faces[i]];
	});

	// we had to run "remove" with the new faces added, but the face map
	// should represent the graph before any changes - to after changes.
	// the correct place for the new faces is in a value position, not index.
	// remove these two faces
	/** @type {(number|number[])[]} */
	const facesMap = faceMap.slice();
	facesMap.splice(-2);

	// set the location of the old face in the map to be the new faces
	facesMap[face] = faces;

	return {
		edge,
		faces: {
			map: facesMap,
			new: faces,
			remove: face,
		},
	};
};

/**
 * @throws Throws an error if the input graph data is poorly formed.
 * @description Split a face in a graph with a new edge between two vertices,
 * where one or two of these vertices is already a part of the face's
 * faces_vertices. This method will have a different result depending on the
 * number of vertices of the new edge which are a part of the face:
 * - 0: this method will create an edge, unassociated with any faces,
 *      no faces will be modified and the method will return early.
 * - 1: this method will create a face with an edge that doubles back on itself.
 * - 2: this method will create two new faces, split by an edge, as long as
 *      these two new edge vertices are not already an edge on the face's boundary
 * This method will create no new vertices, one new edge, and will replace
 * the face with either one or two new face(s).
 * New edges will be added to the end of the arrays, so all old edge
 * indices will still relate. Face indices will be more heavily modified.
 * Probably the most controversial part of this method is that this method
 * will update faceOrders to replace the old face with two new orders each
 * with one of the new faces WITHOUT doing any geometric testing to ensure
 * that both of the two new faces overlap the face they declare to overlap.
 * It's incumbent upon the user to test the faceOrders after all splitting
 * has been complete to ensure that the orders are correct (see foldGraph()).
 * @param {FOLD} graph a FOLD object, modified in place, must contain
 * vertices_coords, edges_vertices, and faces_vertices to work.
 * @param {number} face index of face to split
 * @param {[number, number]} vertices the vertices which will create a new edge
 * @param {string} [assignment="U"] the assignment of the new edge
 * @param {number} [foldAngle=0] the fold angle of the new edge
 * @returns {{
 *   edge?: number,
 *   faces?: { map?: (number|number[])[], new?: number[], remove?: number },
 * }} a summary of changes to the FOLD object
 */
export const splitFace = (graph, face, vertices, assignment = "U", foldAngle = 0) => {
	if (!graph.vertices_coords || !graph.edges_vertices || !graph.faces_vertices) {
		return {};
	}
	if (vertices.length !== 2) {
		return {};
	}

	// run the correct method depending on how many vertices are a part of the face
	const verticesIndexOf = vertices.map((vertex) => ({
		vertex,
		index: graph.faces_vertices[face].indexOf(vertex),
	}));

	const matchCount = verticesIndexOf.filter(({ index }) => index !== -1).length;

	switch (matchCount) {
		case 2:
			// this edge will split the existing face into two faces
			return splitFaceWithEdge(graph, face, vertices, assignment, foldAngle);
		case 1:
			// this edge will connect to only one face vertex, the other point
			// will lie somewhere inside the face, the face will become non-convex.
			return splitFaceWithLeafEdge(
				graph,
				face,
				verticesIndexOf.filter(({ index }) => index !== -1).shift().vertex,
				verticesIndexOf.filter(({ index }) => index === -1).shift().vertex,
				assignment,
				foldAngle,
			);
		default:
			// add the edge to the graph without any face associations
			return {
				edge: addIsolatedEdge(graph, vertices, assignment, foldAngle),
				faces: {},
			};
	}
};
