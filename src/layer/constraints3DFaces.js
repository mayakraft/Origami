/**
 * Rabbit Ear (c) Kraft
 */
import { EPSILON } from "../math/constant.js";
import { average2, resize3 } from "../math/vector.js";
import { multiplyMatrix4Vector3 } from "../math/matrix4.js";
import { mergeArraysWithHoles } from "../general/array.js";
import { makeFacesPolygon } from "../graph/make/faces.js";
import { connectedComponentsPairs } from "../graph/connectedComponents.js";
import { getCoplanarAdjacentOverlappingFaces } from "../graph/faces/planes.js";
import { subgraphWithFaces } from "../graph/subgraph.js";
import { getFacesFacesOverlap } from "../graph/overlap.js";

/**
 * @description The first subroutine to initialize solver constraints for a
 * 3D model. This method locates all coplanar-overlapping clusters of faces
 * "clusters", clone one subgraph per cluster which contain only components
 * from this cluster's faces, rotate these graphs's vertices to place them
 * into the XY plane, and compute the overlap state between every pair of faces.
 * @param {FOLD} graph a FOLD object
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {{
 *   planes_transform: number[][],
 *   faces_plane: number[],
 *   faces_cluster: number[],
 *   faces_winding: boolean[],
 *   faces_polygon: [number, number][][],
 *   faces_center: [number, number][],
 *   clusters_faces: number[][],
 *   clusters_graph: FOLD[],
 *   clusters_transform: number[][],
 *   facesFacesOverlap: number[][],
 *   facePairs: string[],
 * }}
 */
export const constraints3DFaceClusters = (
	{
		vertices_coords,
		edges_vertices,
		edges_faces,
		edges_assignment,
		edges_foldAngle,
		faces_vertices,
		faces_edges,
		faces_faces,
	},
	epsilon = EPSILON,
) => {
	// cluster faces into coplanar-adjacent-overlapping sets. this creates:
	// - "planes": every unique plane that at least one face inhabits
	// - "clusters": a coplanar set of faces, multiple of these clusters can be
	//   from the same plane, but individual clusters do not overlap each other.
	const {
		// planes,
		// planes_faces,
		planes_transform,
		// planes_clusters,
		faces_winding,
		faces_plane,
		faces_cluster,
		clusters_plane,
		clusters_faces,
	} = getCoplanarAdjacentOverlappingFaces(
		{
			vertices_coords,
			faces_vertices,
			faces_faces,
		},
		epsilon,
	);

	// for each cluster, get the transform which, when applied, brings
	// all points into the XY plane.
	const clusters_transform = clusters_plane.map((p) => planes_transform[p]);

	// for every cluster, make a shallow copy of the input graph, containing
	// only the faces included in that cluster, and by extension, all edges and
	// vertices which are used by this subset of faces.
	/** @type {FOLDExtended[]} */
	const clusters_graph = clusters_faces.map((faces) =>
		subgraphWithFaces(
			{
				vertices_coords,
				edges_vertices,
				edges_faces,
				edges_assignment,
				edges_foldAngle,
				faces_vertices,
				faces_edges,
				faces_faces,
			},
			faces,
		),
	);

	// ensure all vertices_coords are 3D (make a copy array here) for use in
	// multiplyMatrix4Vector3, which requires points to be in 3D.
	const vertices_coords3D = vertices_coords.map(resize3);

	// transform all vertices_coords by the inverse transform
	// to bring them all into the XY plane. convert back into a 2D point.
	clusters_graph.forEach(({ vertices_coords: coords }, c) => {
		clusters_graph[c].vertices_coords = coords
			.map((_, v) => multiplyMatrix4Vector3(clusters_transform[c], vertices_coords3D[v]))
			.map(([x, y]) => [x, y]);
	});

	// now, any arrays referencing edges (_edges) are out of sync with
	// the edge arrays themselves (edges_). Therefore this method really
	// isn't intended to be used outside of this higly specific context.

	// faces_polygon is a flat array of polygons in 2D, where every face
	// is re-oriented into 2D via each set's transformation.
	// collinear vertices (if exist) are removed from every polygon.
	/** @type {[number, number][][]} */
	const faces_polygon = mergeArraysWithHoles(
		...clusters_graph.map((copy) => makeFacesPolygon(copy, epsilon)),
	);

	// simple faces center by averaging all the face's vertices.
	// we don't have to be precise here, these are used to tell which
	// side of a face's edge the face is (assuming all faces are convex).
	const faces_center = faces_polygon.map((coords) => average2(...coords));

	// populate individual graph copies with faces_center data.
	clusters_graph.forEach(({ faces_vertices: fv }, c) => {
		clusters_graph[c].faces_center = fv.map((_, f) => faces_center[f]);
	});

	// ensure that all faces are counter-clockwise, flip winding if necessary.
	faces_winding
		.map((upright, i) => (upright ? undefined : i))
		.filter((a) => a !== undefined)
		.forEach((f) => faces_polygon[f].reverse());

	// for every face, a list of face indices which overlap this face.
	// compute face-face-overlap for every cluster's graph one at a time,
	// this is important because vertices have been translated into 2D now,
	// and it's possible that faces from other clusters overlap each other
	// in this transformed state; we don't want that. After we compute face-face
	// overlap information separately, we can merge all of the results into
	// a flat array since none of the resulting arrays will overlap.
	/** @type {number[][]} */
	const facesFacesOverlap = mergeArraysWithHoles(
		...clusters_graph.map((graph) => getFacesFacesOverlap(graph, epsilon)),
	);

	// these are all the variables we need to solve- all overlapping faces in
	// pairwise combinations, as a space-separated string, smallest index first
	const facePairs = connectedComponentsPairs(facesFacesOverlap).map((pair) =>
		pair.join(" "),
	);

	return {
		planes_transform,
		faces_plane,
		faces_cluster,
		faces_winding,
		faces_polygon,
		faces_center,
		clusters_faces,
		clusters_graph,
		clusters_transform,
		facesFacesOverlap,
		facePairs,
	};
};
