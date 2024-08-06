/**
 * Rabbit Ear (c) Kraft
 */
import Messages from "../../environment/messages.js";
import { EPSILON } from "../../math/constant.js";
import { overlapLinePoint } from "../../math/overlap.js";
import { intersectLineLine } from "../../math/intersect.js";
import {} from "../../math/vector.js";
import { sortVerticesCounterClockwise } from "../vertices/sort.js";
import { makeVerticesToEdge } from "../make/lookup.js";
import { includeL, excludeS } from "../../math/compare.js";
import {
	magnitude2,
	normalize2,
	dot2,
	cross2,
	scale2,
	distance,
	subtract,
	subtract2,
	resize2,
} from "../../math/vector.js";
import {
	invertMatrix2,
	multiplyMatrix2Line2,
	multiplyMatrices2,
	makeMatrix2Reflect,
} from "../../math/matrix2.js";
import { edgeAssignmentToFoldAngle } from "../../fold/spec.js";
import { mergeNextmaps, mergeBackmaps, invertFlatMap } from "../maps.js";
import { makeFacesMatrix2 } from "../faces/matrix.js";
import { makeVerticesCoordsFoldedFromMatrix2 } from "../vertices/folded.js";
import { makeVerticesEdgesUnsorted } from "../make/verticesEdges.js";
import { getFaceUnderPoint } from "../overlap.js";
import { makeFacesWindingFromMatrix2 } from "../faces/winding.js";
import { populate } from "../populate.js";
import { splitEdge } from "../split/splitEdge.js";
import { remove } from "../remove.js";

/**
 * This file contains the first ever implementation of a folding algorithm,
 * it uses faces_matrix, which is not used anywhere else in the library.
 * The only reason it's kept around is because it behaves really quite
 * wonderfully for a touch-and-drag to fold, pulling the origami far
 * enough that it flips over (reflected across the crease line)
 * None of the other folding methods have this feature- reflect the entire
 * origami across the fold line. If this gets incorporated into the new
 * fold method, then this method can be deprecated and removed.
 */

/**
 * @description intersect a convex face with a line and return the location
 * of the intersections as components of the graph. this is an EXCLUSIVE
 * intersection. line collinear to the edge counts as no intersection.
 * there are 5 cases:
 * - no intersection (undefined)
 * - intersect one vertex (undefined)
 * - intersect two vertices (valid, or undefined if neighbors)
 * - intersect one vertex and one edge (valid)
 * - intersect two edges (valid)
 * @param {FOLD} graph a FOLD object
 * @param {number} face the index of the face
 * @param {VecLine2} line the vector component describing the line
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {object|undefined} "vertices" and "edges" keys, indices of the
 * components which intersect the line. or undefined if no intersection
 */
const intersectConvexFaceLine = (
	{ vertices_coords, edges_vertices, faces_vertices, faces_edges },
	face,
	{ vector, origin },
	epsilon = EPSILON,
) => {
	const vertices_coords2 = vertices_coords.map(resize2);
	// give us back the indices in the faces_vertices[face] array
	// we can count on these being sorted (important later)
	const face_vertices_indices = faces_vertices[face]
		.map((v) => vertices_coords2[v])
		.map((coord) => overlapLinePoint({ vector, origin }, coord, () => true, epsilon))
		.map((overlap, i) => (overlap ? i : undefined))
		.filter((i) => i !== undefined);
	// o-----o---o  we have to test against cases like this, where more than two
	// |         |  vertices lie along one line.
	// o---------o
	const vertices = face_vertices_indices.map((i) => faces_vertices[face][i]);
	// concat a duplication of the array where the second array's vertices'
	// indices' are all increased by the faces_vertices[face].length.
	// ask every neighbor pair if they are 1 away from each other, if so, the line
	// lies along an outside edge of the convex poly, return "no intersection".
	// the concat is needed to detect neighbors across the end-beginning loop.
	const vertices_are_neighbors = face_vertices_indices
		.concat(face_vertices_indices.map((i) => i + faces_vertices[face].length))
		.map((n, i, arr) => arr[i + 1] - n === 1)
		.reduce((a, b) => a || b, false);
	// if vertices are neighbors
	// because convex polygon, if collinear vertices lie along an edge,
	// it must be an outside edge. this case returns no intersection.
	if (vertices_are_neighbors) {
		return undefined;
	}
	if (vertices.length > 1) {
		return { vertices, edges: [] };
	}
	// run the line-segment intersection on every side of the face polygon
	const edges = faces_edges[face]
		.map((edge) => edges_vertices[edge].map((v) => vertices_coords2[v]))
		.map(
			(seg) =>
				intersectLineLine(
					{ vector, origin },
					{ vector: subtract2(seg[1], seg[0]), origin: seg[0] },
					includeL,
					excludeS,
					epsilon,
				).point,
		)
		.map((coords, face_edge_index) => ({
			coords,
			edge: faces_edges[face][face_edge_index],
		}))
		// remove edges with no intersection
		.filter((el) => el.coords !== undefined)
		// remove edges which share a vertex with a previously found vertex.
		// these edges are because the intersection is near a vertex but also
		// intersects the edge very close to the end.
		.filter(
			(el) =>
				!vertices
					.map((v) => edges_vertices[el.edge].includes(v))
					.reduce((a, b) => a || b, false),
		);
	// only return the case with 2 intersections. for example, only 1 vertex
	// intersection implies outside the polygon, collinear with one vertex.
	return edges.length + vertices.length === 2 ? { vertices, edges } : undefined;
};

/**
 * @description A circular array (data wraps around) requires 2 indices
 * if you intend to split it into two arrays. The pair of indices can be
 * provided in any order, they will be sorted, smaller index first.
 * @param {any[]} array an array that is meant to be thought of as circular
 * @param {number[]} indices two numbers, indices that divide the array into 2 parts
 * @returns {any[][]} the same array split into two arrays
 */
const splitCircularArray = (array, indices) => {
	indices.sort((a, b) => a - b);
	return [
		array.slice(indices[1]).concat(array.slice(0, indices[0] + 1)),
		array.slice(indices[0], indices[1] + 1),
	];
};

/**
 * this must be done AFTER edges_vertices has been updated with the new edge.
 *
 * @param {FOLD} graph a FOLD object
 * @param {number} face the face that will be replaced by these 2 new
 * @param {number[]} vertices (in the face) that split the face into 2 sides
 */
const make_faces = ({ edges_vertices, faces_vertices, faces_edges }, face, vertices) => {
	// the indices of the two vertices inside the face_vertices array.
	// this is where we will split the face into two.
	const indices = vertices.map((el) => faces_vertices[face].indexOf(el));
	const faces = splitCircularArray(faces_vertices[face], indices).map((fv) => ({
		faces_vertices: fv,
		faces_edges: [],
	}));
	if (faces_edges) {
		// table to build faces_edges
		const vertices_to_edge = makeVerticesToEdge({ edges_vertices });
		faces
			.map((this_face) =>
				this_face.faces_vertices
					.map((fv, i, arr) => `${fv} ${arr[(i + 1) % arr.length]}`)
					.map((key) => vertices_to_edge[key]),
			)
			.forEach((face_edges, i) => {
				faces[i].faces_edges = face_edges;
			});
	}
	return faces;
};

/**
 * @param {FOLD} graph a FOLD object
 * @param {number} face
 * @param {number[]} vertices
 */
const build_faces = (graph, face, vertices) => {
	// new face indices at the end of the list
	const faces = [0, 1].map((i) => graph.faces_vertices.length + i);
	// construct new face data for faces_vertices, faces_edges
	// add them to the graph
	make_faces(graph, face, vertices).forEach((newface, i) =>
		Object.keys(newface).forEach((key) => {
			graph[key][faces[i]] = newface[key];
		}),
	);
	return faces;
};

/**
 * @description given two vertices and incident faces, create all new
 * "edges_" entries to describe a new edge that sits between the params.
 * @param {object} FOLD graph
 * @param {number[]} vertices two incident vertices that make up this edge
 * @param {number} face
 * @returns {object} all FOLD spec "edges_" entries for this new edge.
 */
// const make_edge = ({ vertices_coords }, vertices, faces) => {
const make_edge = ({ vertices_coords }, vertices, face) => {
	// coords reversed for "vector", so index [0] comes last in subtract
	const new_edge_coords = vertices
		.slice() // todo: i just added this without testing
		.map((v) => vertices_coords[v])
		.reverse();

	return {
		edges_vertices: [...vertices],
		edges_foldAngle: 0,
		edges_assignment: "U",
		edges_length: distance(new_edge_coords[0], new_edge_coords[1]),
		edges_vector: subtract(new_edge_coords[0], new_edge_coords[1]),
		edges_faces: [face, face],
	};
};
/**
 *
 */
const rebuild_edge = (graph, face, vertices) => {
	// now that 2 vertices are in place, add a new edge between them.
	const edge = graph.edges_vertices.length;
	// construct data for our new edge (vertices, assignent, foldAngle...)
	// and the entry for edges_faces will be [x, x] where x is the index of
	// the old face, twice, and will be replaced later in this function.
	const new_edge = make_edge(graph, vertices, face);
	// ignoring any keys that aren't a part of our graph, add the new edge
	Object.keys(new_edge)
		.filter((key) => graph[key] !== undefined)
		.forEach((key) => {
			graph[key][edge] = new_edge[key];
		});
	return edge;
};

/**
 * @description this is a highly specific method, it takes in the output
 * from intersectConvexFaceLine and applies it to a graph by splitting
 * the edges (in the case of edge, not vertex intersection),
 * @param {FOLD} graph a FOLD object. modified in place.
 * @param {object} the result from calling "intersectConvexFaceLine".
 * each value must be an array. these will be modified in place.
 * @returns {object} with "vertices" and "edges" keys where
 * - vertices is an array of indices (the new vertices)
 * - edges is an object with keys "map", the changes to edge array, and
 * "remove", the indices of edges that have been removed.
 * look inside of "map" at the indices from "removed" for the indices
 * of the new edges which replaced them.
 */
const split_at_intersections = (graph, { vertices, edges }) => {
	// intersection will contain 2 items, either in "vertices" or "edges",
	// however we will split edges and store their new vertex in "vertices"
	// so in the end, "vertices" will contain 2 items.
	let map;
	// split the edge (modifying the graph), and store the changes so that during
	// the next loop the second edge to split will be updated to the new index
	const split_results = edges.map((el) => {
		const res = splitEdge(graph, map ? map[el.edge] : el.edge, el.coords);
		map = map ? mergeNextmaps(map, res.edges.map) : res.edges.map;
		return res;
	});
	vertices.push(...split_results.map((res) => res.vertex));
	// if two edges were split, the second one contains a "remove" key that was
	// based on the mid-operation graph, update this value to match the graph
	// before any changes occurred.
	let bkmap;
	// todo: if we extend this to include non-convex polygons, this is the
	// only part of the code we need to test. cumulative backmap merge.
	// this was written without any testing, as convex polygons never have
	// more than 2 intersections
	split_results.forEach((res) => {
		res.edges.remove = bkmap ? bkmap[res.edges.remove] : res.edges.remove;
		const inverted = invertFlatMap(res.edges.map);
		bkmap = bkmap ? mergeBackmaps(bkmap, inverted) : inverted;
	});
	return {
		vertices,
		edges: {
			map,
			remove: split_results.map((res) => res.edges.remove),
		},
	};
};

/**
 * @description a newly-added edge needs to update its two endpoints'
 * vertices_vertices. each vertices_vertices gains one additional
 * vertex, then the whole array is re-sorted counter-clockwise
 * @param {object} FOLD object
 * @param {number} edge index of the newly-added edge
 */
const update_vertices_vertices = (
	{ vertices_coords, vertices_vertices, edges_vertices },
	edge,
) => {
	const v0 = edges_vertices[edge][0];
	const v1 = edges_vertices[edge][1];
	vertices_vertices[v0] = sortVerticesCounterClockwise(
		{ vertices_coords },
		vertices_vertices[v0].concat(v1),
		v0,
	);
	vertices_vertices[v1] = sortVerticesCounterClockwise(
		{ vertices_coords },
		vertices_vertices[v1].concat(v0),
		v1,
	);
};

/**
 * @param {FOLD} graph a FOLD object. modified in place.
 * @param {number} edge
 * vertices_vertices was just run before this method. use it.
 * vertices_edges should be up to date, except for the addition
 * of this one new edge at both ends of
 */
const update_vertices_edges = (
	{ edges_vertices, vertices_edges, vertices_vertices },
	edge,
) => {
	// the expensive way, rebuild all arrays
	// graph.vertices_edges = makeVerticesEdges(graph);
	if (!vertices_edges || !vertices_vertices) {
		return;
	}
	const vertices = edges_vertices[edge];
	// for each of the two vertices, check its vertices_vertices for the
	// index of the opposite vertex. this is the edge. return its position
	// in the vertices_vertices to be used to insert into vertices_edges.
	vertices
		.map((v) => vertices_vertices[v])
		.map((vert_vert, i) => vert_vert.indexOf(vertices[(i + 1) % vertices.length]))
		.forEach((radial_index, i) =>
			vertices_edges[vertices[i]].splice(radial_index, 0, edge),
		);
};
/**
 * @description search inside vertices_faces for an occurence
 * of the removed face, determine which of our two new faces
 * needs to be put in its place by checking faces_vertices
 * by way of this map we build at the beginning.
 */
const update_vertices_faces = (graph, old_face, new_faces) => {
	// for each of the vertices (only the vertices involved in this split),
	// use the new faces_vertices data (built in the previous method) to get
	// a list of the new faces to be added to this vertex's vertices_faces.
	const vertices_replacement_faces = {};
	new_faces.forEach((f) =>
		graph.faces_vertices[f].forEach((v) => {
			if (!vertices_replacement_faces[v]) {
				vertices_replacement_faces[v] = [];
			}
			vertices_replacement_faces[v].push(f);
		}),
	);
	// these vertices need updating
	graph.faces_vertices[old_face].forEach((v) => {
		const index = graph.vertices_faces[v].indexOf(old_face);
		const replacements = vertices_replacement_faces[v];
		if (index === -1 || !replacements) {
			throw new Error(Messages.convexFace);
		}
		graph.vertices_faces[v].splice(index, 1, ...replacements);
	});
};
/**
 * @description called near the end of the split_convex_face method.
 * update the "edges_faces" array for every edge involved.
 * figure out where the old_face's index is in each edges_faces array,
 * figure out which of the new faces (or both) need to be added and
 * substitute the old index with the new face's index/indices.
 */
const update_edges_faces = (graph, old_face, new_edge, new_faces) => {
	// for each of the edges (only the edges involved in this split),
	// use the new faces_edges data (built in the previous method) to get
	// a list of the new faces to be added to this edge's edges_faces.
	// most will be length of 1, except the edge which split the face will be 2.
	const edges_replacement_faces = {};
	new_faces.forEach((f) =>
		graph.faces_edges[f].forEach((e) => {
			if (!edges_replacement_faces[e]) {
				edges_replacement_faces[e] = [];
			}
			edges_replacement_faces[e].push(f);
		}),
	);
	// these edges need updating
	const edges = [...graph.faces_edges[old_face], new_edge];
	edges.forEach((e) => {
		// these are the faces which should be inserted into this edge's
		// edges_faces array, we just need to find the old index to replace.
		const replacements = edges_replacement_faces[e];
		// basically rewriting .indexOf(), but supporting multiple results.
		// these will be the indices containing a reference to the old face.
		const indices = [];
		for (let i = 0; i < graph.edges_faces[e].length; i += 1) {
			if (graph.edges_faces[e][i] === old_face) {
				indices.push(i);
			}
		}
		if (indices.length === 0 || !replacements) {
			throw new Error(Messages.convexFace);
		}
		// "indices" will most often be length 1, except for the one edge which
		// was added which splits the face in half. the previous methods which
		// did this gave that edge two references both to the same face, knowing
		// that here we will replace both references to the pair of the new
		// faces which the edge now divides.
		// remove the old indices.
		indices.reverse().forEach((index) => graph.edges_faces[e].splice(index, 1));
		// in both cases when "indices" is length 1 or 2, get just one index
		// at which to insert the new reference(s).
		const index = indices[indices.length - 1];
		graph.edges_faces[e].splice(index, 0, ...replacements);
	});
};
/**
 * @description one face was removed and two faces put in its place.
 * regarding the faces_faces array, updates need to be made to the two
 * new faces, as well as all the previously neighboring faces of
 * the removed face.
 * @param {FOLD} graph
 * @param {number} old_face
 * @param {number[]} new_faces
 */
const update_faces_faces = ({ faces_vertices, faces_faces }, old_face, new_faces) => {
	// this is presuming that new_faces have their updated faces_vertices by now
	const incident_faces = faces_faces[old_face];
	const new_faces_vertices = new_faces.map((f) => faces_vertices[f]);
	// for each of the incident faces (to the old face), set one of two
	// indices, one of the two new faces. this is the new incident face.
	const incident_face_face = incident_faces.map((f) => {
		if (f === undefined || f === null) {
			return undefined;
		}
		const incident_face_vertices = faces_vertices[f];
		const score = [0, 0];
		for (let n = 0; n < new_faces_vertices.length; n += 1) {
			let count = 0;
			for (let j = 0; j < incident_face_vertices.length; j += 1) {
				if (new_faces_vertices[n].indexOf(incident_face_vertices[j]) !== -1) {
					count += 1;
				}
			}
			score[n] = count;
		}
		if (score[0] >= 2) {
			return new_faces[0];
		}
		if (score[1] >= 2) {
			return new_faces[1];
		}
		return undefined;
	});
	// prepare the new faces' face_faces empty arrays, filled with one
	// face, the opposite of the pair of the new faces.
	new_faces.forEach((f, i, arr) => {
		faces_faces[f] = [arr[(i + 1) % new_faces.length]];
	});
	// 2 things, fill the new face's arrays and update each of the
	// incident faces to point to the correct of the two new faces.
	incident_faces.forEach((f, i) => {
		if (f === undefined || f === null) {
			return;
		}
		for (let j = 0; j < faces_faces[f].length; j += 1) {
			if (faces_faces[f][j] === old_face) {
				faces_faces[f][j] = incident_face_face[i];
				faces_faces[incident_face_face[i]].push(f);
			}
		}
	});
};

/**
 * @description divide a **convex** face into two polygons with a straight line cut.
 * if the line ends exactly along existing vertices, they will be
 * used, otherwise, new vertices will be added (splitting edges).
 * @param {FOLD} graph a FOLD object, modified in place
 * @param {number} face index of face to split
 * @param {VecLine2} line with a "vector" and an "origin" component
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {object|undefined} a summary of changes to the FOLD object,
 *  or undefined if no change (no intersection).
 */
export const splitFaceWithLine = (graph, face, line, epsilon) => {
	// survey face for any intersections which cross directly over a vertex
	const intersect = intersectConvexFaceLine(graph, face, line, epsilon);
	// if no intersection exists, return undefined.
	if (intersect === undefined) {
		return undefined;
	}
	// this result will be appended to (vertices, edges) and returned by this method.
	const result = split_at_intersections(graph, intersect);
	// this modifies the graph by only adding an edge between existing vertices
	result.edges.new = rebuild_edge(graph, face, result.vertices);
	// update all changes to vertices and edges (anything other than faces).
	update_vertices_vertices(graph, result.edges.new);
	update_vertices_edges(graph, result.edges.new);
	// done: vertices_coords, vertices_edges, vertices_vertices, edges_vertices
	// at this point the graph is once again technically valid, except
	// the face data is a little weird as one face is ignoring the newly-added
	// edge that cuts through it.
	const faces = build_faces(graph, face, result.vertices);
	// update all arrays having to do with face data
	update_vertices_faces(graph, face, faces);
	update_edges_faces(graph, face, result.edges.new, faces);
	update_faces_faces(graph, face, faces);
	// remove old data
	const faces_map = remove(graph, "faces", [face]);
	// the graph is now complete, however our return object needs updating.
	// shift our new face indices since these relate to the graph before remove().
	faces.forEach((_, i) => {
		faces[i] = faces_map[faces[i]];
	});
	// we had to run "remove" with the new faces added. to return the change info,
	// we need to adjust the map to exclude these faces.
	faces_map.splice(-2);
	// replace the "undefined" in the map with the two new edge indices.

	/** @type {(number|number[])[]} */
	const facesMap = faces_map.slice();
	// set the location of the old face in the map to be the new faces
	facesMap[face] = faces;

	result.faces = {
		map: facesMap,
		new: faces,
		remove: face,
	};
	return result;
};

/**
 * @description this determines which side of a line (using cross product)
 * a face lies in a folded form, except, the face is the face in
 * the crease pattern and the line (vector origin) is transformed
 * by the face matrix. because of this, we use face_winding to know
 * if this face was flipped over, reversing the result.
 * @note by flipping the < and > in the return, this one change
 * will modify the entire method to toggle which side of the line
 * are the faces which will be folded over.
 */
const make_face_side = (vector, origin, face_center, face_winding) => {
	const center_vector = subtract2(face_center, origin);
	const determinant = cross2(vector, center_vector);
	return face_winding ? determinant > 0 : determinant < 0;
};

/**
 * for quickly determining which side of a crease a face lies
 * this uses point average, not centroid, faces must be convex
 * and again it's not precise, but this doesn't matter because
 * the faces which intersect the line (and could potentially cause
 * discrepencies) don't use this method, it's only being used
 * for faces which lie completely on one side or the other.
 */
const make_face_center = (graph, face) =>
	!graph.faces_vertices[face]
		? [0, 0]
		: graph.faces_vertices[face]
				.map((v) => graph.vertices_coords[v])
				.reduce((a, b) => [a[0] + b[0], a[1] + b[1]], [0, 0])
				.map((el) => el / graph.faces_vertices[face].length);

const unfolded_assignment = {
	F: true,
	f: true,
	U: true,
	u: true,
};
const opposite_lookup = {
	M: "V",
	m: "V",
	V: "M",
	v: "M",
};

/**
 * @description for a mountain or valley, return the opposite.
 * in the case of any other crease (boundary, flat, ...) return the input.
 */
const get_opposite_assignment = (assign) => opposite_lookup[assign] || assign;

/**
 * @description shallow copy these entries for one face in the graph.
 * this is intended to capture the values, in the case of the face
 * being removed from the graph (not deep deleted, just unreferenced).
 */
const face_snapshot = (graph, face) => ({
	center: graph.faces_center[face],
	matrix: graph.faces_matrix2[face],
	winding: graph.faces_winding[face],
	crease: graph.faces_crease[face],
	side: graph.faces_side[face],
	layer: graph.faces_layer[face],
});

/**
 * @description this builds a new faces_layer array. it first separates the
 * folding faces from the non-folding using faces_folding, an array of [t,f].
 * it flips the folding faces over, appends them to the non-folding ordering,
 * and (re-indexes/normalizes) all the z-index values to be the minimum
 * whole number set starting with 0.
 * @param {number[]} faces_layer each index is a face, each value is the z-layer order.
 * @param {boolean[]} faces_folding each index is a face, T/F will the face be folded over?
 * @returns {number[]} each index is a face, each value is the z-layer order.
 */
const foldFacesLayer = (faces_layer, faces_folding) => {
	const new_faces_layer = [];
	// filter face indices into two arrays, those folding and not folding
	const arr = faces_layer.map((_, i) => i);
	const folding = arr.filter((i) => faces_folding[i]);
	const not_folding = arr.filter((i) => !faces_folding[i]);
	// sort all the non-folding indices by their current layer, bottom to top,
	// give each face index a new layering index.
	// compress whatever current layer numbers down into [0...n]
	not_folding
		.sort((a, b) => faces_layer[a] - faces_layer[b])
		.forEach((face, i) => {
			new_faces_layer[face] = i;
		});
	// sort the folding faces in reverse order (flip them), compress their
	// layers down into [0...n] and and set each face to this layer index
	folding
		.sort((a, b) => faces_layer[b] - faces_layer[a]) // reverse order here
		.forEach((face, i) => {
			new_faces_layer[face] = not_folding.length + i;
		});
	return new_faces_layer;
};

/**
 *
 */
export const getVerticesCollinearToLine = (
	{ vertices_coords },
	{ vector, origin },
	epsilon = EPSILON,
) => {
	const normalizedLineVec = normalize2(vector);
	const pointIsCollinear = (point) => {
		const originToPoint = subtract2(point, origin);
		const mag = magnitude2(originToPoint);
		// point and origin are the same
		if (Math.abs(mag) < epsilon) {
			return true;
		}
		// normalize both vectors, compare dot product
		const originToPointUnit = scale2(originToPoint, 1 / mag);
		const dotprod = Math.abs(dot2(originToPointUnit, normalizedLineVec));
		return Math.abs(1.0 - dotprod) < epsilon;
	};
	return vertices_coords
		.map(pointIsCollinear)
		.map((a, i) => ({ a, i }))
		.filter((el) => el.a)
		.map((el) => el.i);
};

/**
 * @description Find all edges in a graph which lie parallel
 * and on top of a line (infinite line). Can be 2D or 3D.
 * O(n) where n=edges
 * @param {FOLD} graph a FOLD object
 * @param {VecLine} line a line with a vector and origin component
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {number[]} array of edge indices which are collinear to the line
 */
export const getEdgesCollinearToLine = (
	{ vertices_coords, edges_vertices, vertices_edges },
	{ vector, origin },
	epsilon = EPSILON,
) => {
	if (!vertices_edges) {
		vertices_edges = makeVerticesEdgesUnsorted({ edges_vertices });
	}
	const verticesCollinear = getVerticesCollinearToLine(
		{ vertices_coords },
		{ vector, origin },
		epsilon,
	);
	const edgesCollinearCount = edges_vertices.map(() => 0);
	verticesCollinear.forEach((vertex) =>
		vertices_edges[vertex].forEach((edge) => {
			edgesCollinearCount[edge] += 1;
		}),
	);
	return edgesCollinearCount
		.map((count, i) => ({ count, i }))
		.filter((el) => el.count === 2)
		.map((el) => el.i);
};

/**
 * @description make a crease that passes through the entire origami and modify the
 * faces order to simulate one side of the faces flipped over and set on top.
 * @param {FOLDExtended & {
 *   faces_matrix2: number[][],
 *   faces_winding: boolean[],
 *   faces_crease: VecLine2[],
 *   faces_side: boolean[],
 * }} graph a FOLD graph in crease pattern form, will be modified in place
 * @param {VecLine2} line a fold line in 2D
 * @param {string} assignment (M/V/F) a FOLD spec encoding of the direction of the fold
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {object} a summary of changes to faces/edges.
 * @algorithm Because we want to return the new modified origami in crease pattern form,
 * as we iterate through the faces, splitting faces which cross the crease
 * line, we have to be modifying the crease pattern, as opposed to modifying
 * a folded form then unfolding the vertices, which would be less precise.
 * So, we will create copies of the crease line, one per face, transformed
 * into place by its face's matrix, which superimposes many copies of the
 * crease line onto the crease pattern, each in place
 */
export const flatFold = (
	graph,
	{ vector, origin },
	assignment = "V",
	epsilon = EPSILON,
) => {
	const opposite_assignment = get_opposite_assignment(assignment);
	// make sure the input graph contains the necessary data.
	// this takes care of all standard FOLD-spec arrays.
	// todo: this could be optimized by trusting that the existing arrays
	// are accurate, checking if they exist and skipping them if so.
	populate(graph);
	// additionally, we need to ensure faces layer exists.
	// todo: if it doesn't exist, should we use the solver?
	if (!graph.faces_layer) {
		graph.faces_layer = Array(graph.faces_vertices.length).fill(0);
	}
	// these will be properties on the graph. as we iterate through faces,
	// splitting (removing 1 face, adding 2) inside "splitFaceWithLine", the remove
	// method will automatically shift indices for arrays starting with "faces_".
	// we will remove these arrays at the end of this method.
	graph.faces_center = graph.faces_vertices.map((_, i) => make_face_center(graph, i));
	// faces_matrix is built from the crease pattern, but reflects
	// the faces in their folded state.
	if (!graph.faces_matrix2) {
		graph.faces_matrix2 = makeFacesMatrix2(graph, [
			getFaceUnderPoint(graph, origin, vector),
		]);
	}
	graph.faces_winding = makeFacesWindingFromMatrix2(graph.faces_matrix2);
	graph.faces_crease = graph.faces_matrix2
		.map(invertMatrix2)
		.map((matrix) => multiplyMatrix2Line2(matrix, { vector, origin }));
	graph.faces_side = graph.faces_vertices.map((_, i) =>
		make_face_side(
			graph.faces_crease[i].vector,
			graph.faces_crease[i].origin,
			graph.faces_center[i],
			graph.faces_winding[i],
		),
	);
	// before we start splitting faces, we have to handle the case where
	// a flat crease already exists along the fold crease, already splitting
	// two faces (assignment "F" or "U" only), the splitFaceWithLine method
	// will not catch these. we need to find these edges before we modify
	// the graph, find the face they are attached to and whether the face
	// is flipped, and set the edge to the proper "V" or "M" (and foldAngle).
	const vertices_coords_folded = makeVerticesCoordsFoldedFromMatrix2(
		graph,
		graph.faces_matrix2,
	);
	// get all (folded) edges which lie parallel and overlap the crease line
	const collinear_edges = getEdgesCollinearToLine(
		{
			vertices_coords: vertices_coords_folded,
			edges_vertices: graph.edges_vertices,
		},
		{ vector, origin },
		epsilon,
	).filter((e) => unfolded_assignment[graph.edges_assignment[e]]);
	// get the first valid adjacent face for each edge, get that face's winding,
	// which determines the crease assignment, and assign it to the edge
	collinear_edges
		.map((e) => graph.edges_faces[e].find((f) => f != null))
		.map((f) => graph.faces_winding[f])
		.map((winding) => (winding ? assignment : opposite_assignment))
		.forEach((assign, e) => {
			graph.edges_assignment[collinear_edges[e]] = assign;
			graph.edges_foldAngle[collinear_edges[e]] = edgeAssignmentToFoldAngle(assign);
		});
	// before we start splitting, capture the state of face 0. we will use
	// it when rebuilding the graph's matrices after all splitting is finished.
	const face0 = face_snapshot(graph, 0);
	// now, iterate through faces (reverse order), rebuilding the custom
	// arrays for the newly added faces when a face is split.
	const split_changes = graph.faces_vertices
		.map((_, i) => i)
		.reverse()
		.map((i) => {
			// this is the face about to be removed. if the face is successfully
			// split the face will be removed but we still need to reference
			// values from it to complete the 2 new faces which replace it.
			const face = face_snapshot(graph, i);
			// split the polygon (if possible), get back a summary of changes.
			const change = splitFaceWithLine(graph, i, face.crease, epsilon);
			// console.log("split convex polygon change", change);
			if (change === undefined) {
				return undefined;
			}
			// const face_winding = folded.faces_winding[i];
			// console.log("face change", face, change);
			// update the assignment of the newly added edge separating the 2 new faces
			graph.edges_assignment[change.edges.new] = face.winding
				? assignment
				: opposite_assignment;
			graph.edges_foldAngle[change.edges.new] = edgeAssignmentToFoldAngle(
				graph.edges_assignment[change.edges.new],
			);
			// these are the two faces that replaced the removed face after the split
			const new_faces = change.faces.map[change.faces.remove];
			new_faces.forEach((f) => {
				// no need right now to build faces_winding, faces_matrix, ...
				graph.faces_center[f] = make_face_center(graph, f);
				graph.faces_side[f] = make_face_side(
					face.crease.vector,
					face.crease.origin,
					graph.faces_center[f],
					face.winding,
				);
				graph.faces_layer[f] = face.layer;
			});
			return change;
		})
		.filter((a) => a !== undefined);
	// all faces have been split. get a summary of changes to the graph.
	// "faces_map" is actually needed. the others are just included in the return
	const faces_map = mergeNextmaps(...split_changes.map((el) => el.faces.map));
	const edges_map = mergeNextmaps(
		...split_changes.map((el) => el.edges.map).filter((a) => a !== undefined),
	);
	const faces_remove = split_changes.map((el) => el.faces.remove).reverse();
	// const vert_dict = {};
	// split_changes.forEach(el => el.vertices.forEach(v => { vert_dict[v] = true; }));
	// const new_vertices = Object.keys(vert_dict).map(s => parseInt(s));
	// build a new face layer ordering
	graph.faces_layer = foldFacesLayer(graph.faces_layer, graph.faces_side);
	// build new face matrices for the folded state. use face 0 as reference
	// we need its original matrix, and if face 0 was split we need to know
	// which of its two new faces doesn't move as the new faces matrix
	// calculation requires we provide the one face that doesn't move.
	const face0_was_split = faces_map && faces_map[0] && faces_map[0].length === 2;
	const face0_newIndex = face0_was_split
		? faces_map[0].filter((f) => graph.faces_side[f]).shift()
		: 0;
	// only if face 0 lies on the not-flipped side (sidedness is false),
	// and it wasn't creased-through, can we use its original matrix.
	// if face 0 lies on the flip side (sidedness is true), or it was split,
	// face 0 needs to be multiplied by its crease's reflection matrix, but
	// only for valley or mountain folds, "flat" folds need to copy the matrix
	let face0_preMatrix = face0.matrix;
	// only if the assignment is valley or mountain, do this. otherwise skip
	if (assignment !== opposite_assignment) {
		face0_preMatrix =
			!face0_was_split && !graph.faces_side[0]
				? face0.matrix
				: multiplyMatrices2(
						face0.matrix,
						makeMatrix2Reflect(face0.crease.vector, face0.crease.origin),
					);
	}
	// build our new faces_matrices using face 0 as the starting point,
	// setting face 0 as the identity matrix, then multiply every
	// face's matrix by face 0's actual starting matrix
	graph.faces_matrix2 = makeFacesMatrix2(graph, [face0_newIndex]).map((matrix) =>
		multiplyMatrices2(face0_preMatrix, matrix),
	);
	// these are no longer needed. some of them haven't even been fully rebuilt.
	delete graph.faces_center;
	delete graph.faces_winding;
	delete graph.faces_crease;
	delete graph.faces_side;
	// summary of changes to the graph
	return {
		faces: { map: faces_map, remove: faces_remove },
		edges: { map: edges_map },
		// vertices: { new: new_vertices },
	};
};
