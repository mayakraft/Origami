/**
 * Rabbit Ear (c) Kraft
 */
import { getDimensionQuick } from "../fold/spec.js";
import { resize2, resize3 } from "../math/vector.js";
import { clone } from "../general/clone.js";
import { makeFacesEdgesFromVertices } from "./make/facesEdges.js";

/**
 * @description Create a modified graph which contains vertices, edges,
 * and faces, but that for every face, all of its vertices and edges
 * have been duplicated so that faces do not share vertices or edges.
 * Edges are also duplicated so that they do not share vertices.
 * Edge assignments and foldAngles will remain and be correctly re-indexed.
 * Additionally, if you only provide a graph with only vertices_coords and
 * faces_vertices, then a simple face-vertex only graph will be calculated.
 * @param {FOLD} graph a FOLD object. not modified.
 * @returns {FOLD} a new FOLD graph with exploded faces,
 * if no faces exist, the input graph will be returned, because technically,
 * all faces are triangles.
 */
export const explodeFaces = ({
	vertices_coords,
	edges_vertices,
	edges_assignment,
	edges_foldAngle,
	faces_vertices,
	faces_edges,
}) => {
	if (!faces_vertices) {
		if (edges_vertices) {
			return clone({
				vertices_coords,
				edges_vertices,
				edges_assignment,
				edges_foldAngle,
			});
		}
		return vertices_coords ? clone({ vertices_coords }) : {};
	}

	let f = 0;
	const faces_verticesNew = faces_vertices.map((face) => face.map(() => f++));

	// if vertices exist, add vertices
	if (!vertices_coords) {
		return { faces_vertices: faces_verticesNew };
	}

	// typescript ensure vertices_coords is in the correct form
	const dimensions = getDimensionQuick({ vertices_coords });
	const vertices_coordsFlat = clone(
		faces_vertices.flatMap((face) => face.map((v) => vertices_coords[v])),
	);
	/** @type {[number, number][] | [number, number, number][]} */
	const vertices_coordsNew =
		dimensions === 3
			? vertices_coordsFlat.map(resize3)
			: vertices_coordsFlat.map(resize2);

	// if no edges exist, return the vertex-face graph.
	if (!edges_vertices) {
		return {
			vertices_coords: vertices_coordsNew,
			faces_vertices: faces_verticesNew,
		};
	}

	// get faces_edges from the old graph data
	if (!faces_edges) {
		// eslint-disable-next-line no-param-reassign
		faces_edges = makeFacesEdgesFromVertices({ edges_vertices, faces_vertices });
	}

	let e = 0;
	/** @type {[number, number][]} */
	const edges_verticesNew = faces_edges
		.flatMap((face) =>
			face.map((_, i, arr) => (i === arr.length - 1 ? [e, ++e - arr.length] : [e, ++e])),
		)
		.map(([a, b]) => [a, b]);

	const result = {
		vertices_coords: vertices_coordsNew,
		faces_vertices: faces_verticesNew,
		edges_vertices: edges_verticesNew,
	};

	const edgesMap = faces_edges.flatMap((edges) => edges);
	if (edges_assignment) {
		result.edges_assignment = edgesMap.map((i) => edges_assignment[i]);
	}
	if (edges_foldAngle) {
		result.edges_foldAngle = edgesMap.map((i) => edges_foldAngle[i]);
	}
	return result;
};

/**
 * @description Create a modified graph which contains new vertices and
 * edges data such that no two edges share vertices (creating copies of
 * existing vertices), and removing all face data.
 * @param {FOLD} graph a FOLD object.
 * @returns {FOLD} a new FOLD graph with shallow pointers to the input graph.
 */
export const explodeEdges = ({
	vertices_coords,
	edges_vertices,
	edges_assignment,
	edges_foldAngle,
}) => {
	// if no edges exist, return the vertices (if the exist) as they are
	// technically exploded (weird yes).
	if (!edges_vertices) {
		return vertices_coords ? { vertices_coords } : {};
	}
	let e = 0;
	// duplicate vertices are simply duplicate references, changing
	// one will still change the others. we need to deep copy the array
	const result = {
		/** @type {[number, number][]} */
		edges_vertices: edges_vertices.map(() => [e++, e++]),
	};
	if (edges_assignment) {
		result.edges_assignment = edges_assignment;
	}
	if (edges_foldAngle) {
		result.edges_foldAngle = edges_foldAngle;
	}
	if (vertices_coords) {
		result.vertices_coords = structuredClone(
			edges_vertices.flatMap((edge) => edge.map((v) => vertices_coords[v])),
		);
	}
	return result;
};
