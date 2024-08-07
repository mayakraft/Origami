/**
 * Rabbit Ear (c) Kraft
 */

/**
 * @description faces_faces is an array of edge-adjacent face indices for each face.
 * @param {FOLD} graph a FOLD object, with faces_vertices
 * @returns {(number | null | undefined)[][]} each index relates to a face,
 * each entry is an array of numbers, each number is an index
 * of an edge-adjacent face to this face.
 */
export const makeFacesFaces = ({ faces_vertices }) => {
	// create a map that relates these space-separated vertex pair strings
	// to an array of faces which contain this edge (vertex-pair).
	/** @type {{ [key: string]: number[] }} */
	const vertexPairToFaces = {};

	// for every face's faces_vertices, pair a vertex with the next vertex,
	// join the pairs of vertices into a space-separated string
	const facesVerticesKeys = faces_vertices.map((face) =>
		face.map((v, i, arr) => [v, arr[(i + 1) % arr.length]]).map((pair) => pair.join(" ")),
	);

	facesVerticesKeys.flat().forEach((key) => {
		vertexPairToFaces[key] = [];
	});

	facesVerticesKeys.forEach((keys, f) =>
		keys.forEach((key) => vertexPairToFaces[key].push(f)),
	);

	// in the case of faces with leaf edges whose vertices double back
	// on themselves, the face would choose itself as an adjacent face.
	// filter to prevent this from happening, replace these instances with
	// "undefined".
	return faces_vertices.map((face, f1) =>
		face
			.map((v, i, arr) => [arr[(i + 1) % arr.length], v])
			.map((pair) => pair.join(" "))
			.map((key) => vertexPairToFaces[key])
			.map((faces) => (faces === undefined ? [undefined] : faces))
			.flatMap((faces) => faces.filter((f2) => f1 !== f2).shift()),
	);
};

/**
 * @description faces_faces is an array of edge-adjacent face indices for each face.
 * @param {FOLD} graph a FOLD object, with faces_edges
 * @returns {(number | null | undefined)[][]} each index relates to a face,
 * each entry is an array of numbers, each number is an index
 * of an edge-adjacent face to this face.
 */
export const makeFacesFacesFromEdges = ({ faces_edges }) => {
	/** @type {{[key: number]: number[] }} */
	const edgesMap = {};
	// fill edgesMap with keys for all edges, values empty array
	// this assumes that faces do not visit the same edge twice
	faces_edges.forEach((edges) =>
		edges.forEach((edge) => {
			edgesMap[edge] = [];
		}),
	);
	faces_edges.forEach((edges, f) => edges.forEach((edge) => edgesMap[edge].push(f)));
	return faces_edges.map((edges, f) =>
		edges.map((edge) => edgesMap[edge].filter((face) => face !== f).shift()),
	);
};

// export const makeFacesFacesManifold = ({ faces_vertices }) => {
// 	// create a map that relates these space-separated vertex pair strings
// 	// to an array of faces which contain this edge (vertex-pair).
// 	const vertexPairToFace = {};

// 	// for every face's faces_vertices, pair a vertex with the next vertex,
// 	// join the pairs of vertices into a space-separated string (where v0 < v1)
// 	faces_vertices
// 		.map((face, f) => face
// 			.map((v, i, arr) => [v, arr[(i + 1) % arr.length]])
// 			.map(pair => pair.join(" "))
// 			.forEach(key => { vertexPairToFace[key] = f; }));

// 	// in the case of faces with leaf edges whose vertices double back
// 	// on themselves, the face would choose itself as an adjacent face.
// 	// filter to prevent this from happening, replace these instances with
// 	// "undefined".
// 	return faces_vertices
// 		.map((face, f1) => face
// 			.map((v, i, arr) => [arr[(i + 1) % arr.length], v])
// 			.map(pair => pair.join(" "))
// 			.map(key => vertexPairToFace[key])
// 			.map(f2 => (f1 === f2 ? undefined : f2)));
// };

// export const makeFacesFacesFirst = ({ faces_vertices }) => {
// 	// for every face's faces_vertices, pair a vertex with the next vertex,
// 	// join the pairs of vertices into a space-separated string (where v0 < v1)
// 	const facesVerticesEdgeVertexPairs = faces_vertices
// 		.map(face => face
// 			.map((v, i, arr) => [v, arr[(i + 1) % arr.length]])
// 			.map(([v0, v1]) => (v1 < v0 ? [v1, v0] : [v0, v1]))
// 			.map(pair => pair.join(" ")));

// 	// create a map that relates these space-separated vertex pair strings
// 	// to an array of faces which contain this edge (vertex-pair).
// 	const edgePairToFaces = {};
// 	facesVerticesEdgeVertexPairs
// 		.flat()
// 		.forEach(key => { edgePairToFaces[key] = []; });
// 	facesVerticesEdgeVertexPairs
// 		.forEach((edgeKeys, f) => edgeKeys
// 			.forEach(key => { edgePairToFaces[key].push(f); }));

// 	// for each face's edge (vertex-pair), get the array of faces that
// 	// are adjacent to this edge. This generates a list of faces that contains
// 	// duplicates and contains this face itself. these will be filtered out.
// 	const newFacesEdgesFaces = facesVerticesEdgeVertexPairs
// 		.map((edgeKeys) => edgeKeys
// 			.map(key => edgePairToFaces[key]));

// 	// each face's entry contains an array of array of faces, flatten this list
// 	// and remove any mention of this face itself, and remove any duplicates.
// 	// using a Set appears to maintain the insertion order, which is what we want.
// 	return newFacesEdgesFaces
// 		.map((edgesFaces, face) => edgesFaces.flat().filter(f => f !== face))
// 		.map(faces => Array.from(new Set(faces)));
// };
