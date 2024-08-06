/**
 * Rabbit Ear (c) Kraft
 */
import { EPSILON } from "../../math/constant.js";
import {
	dot,
	dot3,
	scale3,
	resize2,
	resize3,
	flip3,
	parallelNormalized,
} from "../../math/vector.js";
import { makePolygonNonCollinear3 } from "../../math/polygon.js";
import { multiplyMatrix4Vector3 } from "../../math/matrix4.js";
import {
	matrix4FromQuaternion,
	quaternionFromTwoVectors,
} from "../../math/quaternion.js";
import { overlapConvexPolygons } from "../../math/overlap.js";
import { clusterScalars } from "../../general/cluster.js";
import { connectedComponents } from "../connectedComponents.js";
import { invertArrayToFlatMap, invertFlatToArrayMap } from "../maps.js";
import { makeFacesFaces } from "../make/facesFaces.js";
import { makeFacesNormal } from "../normals.js";
import { selfRelationalArraySubset } from "../subgraph.js";

/**
 * @description Cluster the faces of a graph into groups of face indices where
 * all faces in the same group lie in the same plane in 3D.
 * Faces in the same plane are not required to overlap, only be coplanar.
 * @param {FOLD} graph a FOLD object
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {{
 *   planes: { normal: number[], origin: number[] }[],
 *   planes_faces: number[][],
 *   planes_transform: number[][],
 *   faces_plane: number[],
 *   faces_winding: boolean[],
 * }} an object with:
 * - planes: a list of planes
 * - planes_faces: for every plane, a list of faces within this plane
 * - planes_transform: for every plane, a matrix which transforms the
 *   plane into the 2D XY plane
 * - faces_plane: for every face, which plane is it in
 * - faces_winding: for every face within its plane, is the face's normal
 * aligned with the plane's normal (true) or flipped 180 degrees (false).
 */
export const getFacesPlane = ({ vertices_coords, faces_vertices }, epsilon = EPSILON) => {
	// face normals will be always 3D. These vectors are normalized.
	const faces_normal = makeFacesNormal({ vertices_coords, faces_vertices });

	// for every face, get the indices of all faces with matching normals
	const facesNormalMatch = faces_vertices.map(() => []);

	// todo: this is n^2.
	// We need to create a linear sorting of 3D vectors. Possibly we can project
	// all vectors onto one axis, sort and compare the non-degenerate vectors,
	// then gather all degenerate cases and run these at n^2.
	// also, the parallel test is non-directional, the sorted array should be
	// treated as a wrapping array, compare the start with the end.
	for (let a = 0; a < faces_vertices.length - 1; a += 1) {
		for (let b = a + 1; b < faces_vertices.length; b += 1) {
			if (parallelNormalized(faces_normal[a], faces_normal[b], epsilon)) {
				facesNormalMatch[a].push(b);
				facesNormalMatch[b].push(a);
			}
		}
	}

	// create disjoint sets of faces which all share the same normal
	const facesNormalMatchCluster = connectedComponents(facesNormalMatch);
	const normalClustersFaces = invertFlatToArrayMap(facesNormalMatchCluster);

	// for each cluster, choose one normal, this normal is now associated with the cluster.
	const normalClustersNormal = normalClustersFaces.map((faces) => faces_normal[faces[0]]);

	// coplanar faces are clustered together even if their normals are flipped.
	// for each face, is this face's normal aligned (true) with the cluster's
	// normal, or is it 180deg flipped (false).
	// "faces_winding" can be a flat array as faces are only in one plane.
	/** @type {boolean[]} */
	const faces_winding = [];
	normalClustersFaces.forEach((faces, i) =>
		faces.forEach((f) => {
			faces_winding[f] = dot3(faces_normal[f], normalClustersNormal[i]) > 0;
		}),
	);

	// using each cluster's shared normal, find the plane (dot prod)
	// for each face. make facesOneVertex always 3D.
	const facesOneVertex = faces_vertices.map((fv) => vertices_coords[fv[0]]).map(resize3);
	const normalClustersFacesDot = normalClustersFaces.map((faces, i) =>
		faces.map((f) => dot3(normalClustersNormal[i], facesOneVertex[f])),
	);

	// for every cluster of a shared normal, further divide into clusters where
	// each inner cluster contains faces which share the same plane
	const clustersClusters = normalClustersFacesDot.map((dots, i) =>
		clusterScalars(dots).map((cluster) =>
			cluster.map((index) => normalClustersFaces[i][index]),
		),
	);

	// flatten the data one level.
	// there is no need to return these as nested clusters.
	// before flattening, create a matching array of normals.
	const planes_faces = clustersClusters.flat();

	// use "resize3" to create a clone of every vector. no overlapping pointers
	const planes_normal = clustersClusters
		.flatMap((cluster, i) => cluster.map(() => normalClustersNormal[i]))
		.map(resize3);

	// the plane's origin will be the point in the plane
	// nearest to the world origin.
	const planes_origin = planes_faces
		.map((faces) => faces[0])
		.map((face) => facesOneVertex[face])
		.map((point, i) => dot3(planes_normal[i], point))
		.map((mag, i) => scale3(planes_normal[i], mag));

	// make each plane with the origin and normal
	const planes = planes_faces.map((_, i) => ({
		normal: planes_normal[i],
		origin: planes_origin[i],
	}));

	const faces_plane = invertArrayToFlatMap(planes_faces);

	// all polygon sets will be planar to each other, however the polygon-polygon
	// intersection algorithm is 2D only, so we just need to create a transform
	// for each cluster which rotates this cluster's plane into the XY plane.
	/** @type {[number, number, number]} */
	const targetVector = [0, 0, 1];

	// if dot is -1, this plane is already in the XY plane, but the plane's
	// normal and target are exactly 180deg flipped, meaning that the result of
	// the quaternion constructor will be undefined, in which case we manually
	// build a rotation matrix that rotates 180 degrees around the X axis.
	// 180 degree rotate around the X axis, or general rotation matrix
	const planes_transform = planes.map(({ normal }) =>
		Math.abs(dot(normal, targetVector) + 1) < epsilon
			? [1, 0, 0, 0, 0, -1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1]
			: matrix4FromQuaternion(quaternionFromTwoVectors(normal, targetVector)),
	);

	// computing the translation vector as a single matrix * vector operation,
	// then overwriting it into the column vector of the rotation matrix
	// (which currently has a 0, 0, 0, translation), is the same as building an
	// entire translation matrix then computing the matrix product with: Mr * Mt.
	// this approach just cuts down on the number of operations.
	planes.forEach(({ origin }, p) => {
		const translation = multiplyMatrix4Vector3(planes_transform[p], flip3(origin));
		planes_transform[p][12] = translation[0];
		planes_transform[p][13] = translation[1];
		planes_transform[p][14] = translation[2];
	});

	return {
		planes,
		planes_faces,
		planes_transform,
		faces_plane,
		faces_winding,
	};
};

/**
 * @description Cluster the faces of a graph into groups of face indices
 * where all faces in the same group both lie in the same plane and
 * overlap or are edge-connected to at least one face in the group.
 * @param {FOLD} graph a FOLD object
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {{
 *   planes: { normal: number[], origin: number[] }[],
 *   planes_faces: number[][],
 *   planes_transform: number[][],
 *   planes_clusters: number[][],
 *   faces_winding: boolean[],
 *   faces_plane: number[],
 *   faces_cluster: number[],
 *   clusters_plane: number[],
 *   clusters_faces: number[][],
 * }} an object with:
 * - planes: a list of planes
 * - planes_faces: for every plane, a list of faces within this plane
 * - faces_plane: for every face, which plane is it in
 * - faces_winding: for every face within its plane, is the face's normal
 *   aligned with the plane's normal (true) or flipped 180 degrees (false).
 * - planes_transform: for every plane, a matrix which transforms the
 *   plane into the 2D XY plane
 * - planes_clusters: for every plane, a list of clusters which represent
 *   a cluster of coplanar and overlapping faces.
 * - clusters_plane: for every cluster, which plane does it inhabit
 * - clusters_faces: for every cluster, a list of faces which are a member
 * - faces_cluster: for every face, which clusters is it a member of.
 */
export const getCoplanarAdjacentOverlappingFaces = (
	{ vertices_coords, faces_vertices, faces_faces },
	epsilon = EPSILON,
) => {
	if (!faces_faces) {
		faces_faces = makeFacesFaces({ faces_vertices });
	}

	// get our initial groups of faces which share a common plane in 3D.
	// upcoming, we will further subgroup each plane's groups of faces into
	// those which are connected and/or overlap geometrically.
	const { planes, planes_faces, planes_transform, faces_plane, faces_winding } =
		getFacesPlane({ vertices_coords, faces_vertices }, epsilon);

	// make sure we are using 3D points for this next part
	const vertices_coords3D = vertices_coords.map(resize3);

	// if the face's winding is flipped from its plane's normal,
	// reverse the winding order, much easier than transforming a 180 rotation.
	const faces_polygon = faces_vertices
		.map((verts, f) => (faces_winding[f] ? verts : verts.slice().reverse()))
		.map((verts) => verts.map((v) => vertices_coords3D[v]))
		.map((polygon) => makePolygonNonCollinear3(polygon, epsilon))
		.map((polygon, f) =>
			polygon
				.map((point) => multiplyMatrix4Vector3(planes_transform[faces_plane[f]], point))
				.map(resize2),
		);

	// for each plane group, create a faces_faces which only includes
	// those faces inside each group, these faces_faces arrays have holes.
	const planes_facesFaces = planes_faces.map((faces) =>
		selfRelationalArraySubset(faces_faces, faces),
	);

	// for each plane, group its faces into an array of subgroups, each subgroup
	// contains only faces which are connected to each other through the graph.
	// this contains: for every plane, for every face, which group is it a member of?
	//
	// uh oh. is this causing issues.
	// - I can't remember why I wrote that.
	//
	const planes_faces_connectedGroup = planes_facesFaces.map(connectedComponents);

	// this contains: for each plane, for each group, a list of its connected faces.
	const planes_connectedGroups_faces = planes_faces_connectedGroup.map((faces) =>
		invertFlatToArrayMap(faces),
	);

	// now we have, for every plane, groups of faces where inside each group
	// we know that these faces are connected because they are connected via
	// the graph. now we need to handle the cases of being geometrically
	// overlapping, within each plane set, we will shrink the number of face
	// groups, if groups are found to be overlapping they will be merged.

	// now that we know a bunch about connected faces within groups we can
	// cut down on the number of calls to the polygon-polygon overlap method.
	// first, for each plane's groups of faces, gather together all other faces
	// in the same plane that aren't a part of this connected set of faces.

	// this contains: for every plane, for every face, a list of other coplanar
	// faces from another group which are a candidate for testing overlap.
	const planes_faces_possibleOverlapFaces = planes_faces_connectedGroup.map(
		(faces_group) => {
			const faces = faces_group.map((_, i) => i);
			return faces_group.map((groupIndex) =>
				faces.filter((face) => faces_group[face] !== groupIndex),
			);
		},
	);

	// inside each plane, for every overlappingGroup, store a list of other
	// group indices from the same plane which overlap this group. Shared
	// group indices mean these groups can be merged.
	const planes_overlappingGroups = planes_connectedGroups_faces.map(
		(connectedGroups_faces) => connectedGroups_faces.map(() => []),
	);

	planes_faces_possibleOverlapFaces.forEach((faces_possibleOverlapFaces, p) => {
		// within this plane group, store pairs of group indices ("a b" and "b a")
		// where both groups have been shown to contain faces inside them which
		// overlap each other, meaning, these groups are able to be merged.
		// This is used to prevent duplicate work.
		const overlappingGroupsKeys = {};

		// For every face, iterate through all of its possible overlapping faces,
		// and confirm whether or not these faces overlap. We don't care whether or
		// not the faces overlap, we care if the groups do, so we store the overlap
		// information between groups in two places:
		// - planes_overlappingGroups this will be used later to merge groups
		// - overlappingGroupsKeys lookup table to prevent doing duplicate work.
		faces_possibleOverlapFaces.forEach((otherFaces, face) =>
			otherFaces.forEach((otherFace) => {
				// convert faces into their respective groups they inhabit
				const groups = [face, otherFace].map((f) => planes_faces_connectedGroup[p][f]);

				// if we have already discovered these groups overlap, skip
				const groupsKey1 = groups.join(" ");
				if (overlappingGroupsKeys[groupsKey1]) {
					return;
				}

				// run the overlap method
				const overlap = overlapConvexPolygons(
					faces_polygon[face],
					faces_polygon[otherFace],
					epsilon,
				);
				if (overlap) {
					// store the result of the overlap in the hash and the usable array.
					// this reverses the groups array in place, but it's fine.
					const groupsKey2 = groups.reverse().join(" ");
					overlappingGroupsKeys[groupsKey1] = true;
					overlappingGroupsKeys[groupsKey2] = true;
					planes_overlappingGroups[p][groups[0]].push(groups[1]);
					planes_overlappingGroups[p][groups[1]].push(groups[0]);
				}
			}),
		);
	});

	// prevent duplicate entries for every group's group. but, this is not
	// needed because overlappingGroupsKeys hash already prevents duplicates
	// planes_overlappingGroups
	// 	.forEach((array1, i) => array1
	// 		.forEach((array2, j) => {
	// 			planes_overlappingGroups[i][j] = Array.from(new Set(array2));
	// 		}));

	// for every plane, for every new cluster, an list of the group indices
	// from "connectedGroups" that are included in this new cluster.
	const planes_clusters_groupIndices = planes_overlappingGroups.map((set_set) =>
		invertFlatToArrayMap(connectedComponents(set_set)),
	);

	// relate a new cluster to the original plane it inhabits
	const clusters_plane = planes_clusters_groupIndices.flatMap((arrays, i) =>
		arrays.map(() => i),
	);

	const planes_clusters = invertFlatToArrayMap(clusters_plane);

	const clusters_faces = planes_clusters_groupIndices.flatMap(
		(clusters_groupIndices, p) =>
			clusters_groupIndices.map((groupIndices) =>
				groupIndices.flatMap((g) => planes_connectedGroups_faces[p][g]),
			),
	);

	const faces_cluster = invertArrayToFlatMap(clusters_faces);

	return {
		planes,
		planes_faces,
		planes_transform,
		planes_clusters,
		faces_winding,
		faces_plane,
		faces_cluster,
		clusters_plane,
		clusters_faces,
	};
};
