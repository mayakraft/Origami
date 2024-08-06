/**
 * Rabbit Ear (c) Kraft
 */
import Messages from "../../environment/messages.js";
import { normalize, dot, subtract } from "../../math/vector.js";
import { makeFacesNormal } from "../normals.js";
import { makeFacesEdgesFromVertices } from "./facesEdges.js";
import { makeEdgesFacesUnsorted } from "./edgesFaces.js";
import { makeFacesCenterQuick } from "./faces.js";

const assignment_angles = { M: -180, m: -180, V: 180, v: 180 };

/**
 * @description Convert edges assignment into fold angle in degrees for every edge.
 * @param {FOLD} graph a FOLD object, with edges_assignment
 * @returns {number[]} array of fold angles in degrees
 */
export const makeEdgesFoldAngle = ({ edges_assignment }) =>
	edges_assignment.map((a) => assignment_angles[a] || 0);

// angle between two 3D vectors
// α = arccos[(xa * xb + ya * yb + za * zb) / (√(xa2 + ya2 + za2) * √(xb2 + yb2 + zb2))]
// angle between two 2D vectors
// α = arccos[(xa * xb + ya * yb) / (√(xa2 + ya2) * √(xb2 + yb2))]

/**
 * @description Inspecting adjacent faces, and referencing their normals, infer
 * the foldAngle for every edge. This will result in a negative number for
 * mountain creases, and positive for valley. This works well for 3D models,
 * but will fail for flat-folded models, in which case, edges_assignment
 * will be consulted to differentiate between 180 degree M or V folds.
 * @param {FOLDExtended} graph a FOLD object
 * @returns {number[]} for every edge, an angle in degrees.
 */
export const makeEdgesFoldAngleFromFaces = ({
	vertices_coords,
	edges_vertices,
	edges_faces,
	edges_assignment,
	faces_vertices,
	faces_edges,
	faces_normal,
	faces_center,
}) => {
	if (!edges_faces) {
		if (!faces_edges) {
			faces_edges = makeFacesEdgesFromVertices({ edges_vertices, faces_vertices });
		}
		edges_faces = makeEdgesFacesUnsorted({ edges_vertices, faces_edges });
	}
	if (!faces_normal) {
		faces_normal = makeFacesNormal({ vertices_coords, faces_vertices });
	}
	if (!faces_center) {
		faces_center = makeFacesCenterQuick({ vertices_coords, faces_vertices });
	}
	// get the angle between two adjacent face normals, where parallel normals have 0 angle.
	// additionally, create a vector from one face's center to the other and check the sign of
	// the dot product with one of the normals, this clarifies if the fold is mountain or valley.
	return edges_faces.map((faces, e) => {
		if (faces.length > 2) {
			throw new Error(Messages.manifold);
		}
		if (faces.length < 2) {
			return 0;
		}
		const a = faces_normal[faces[0]];
		const b = faces_normal[faces[1]];
		const a2b = normalize(subtract(faces_center[faces[1]], faces_center[faces[0]]));
		// for mountain creases (faces facing away from each other), set the sign to negative.
		let sign = Math.sign(dot(a, a2b));
		// if the sign is zero, the faces are coplanar, it's impossible to tell if
		// this was because of a mountain or a valley fold.
		if (sign === 0) {
			if (edges_assignment && edges_assignment[e]) {
				if (edges_assignment[e] === "F" || edges_assignment[e] === "F") {
					sign = 0;
				}
				if (edges_assignment[e] === "M" || edges_assignment[e] === "m") {
					sign = -1;
				}
				if (edges_assignment[e] === "V" || edges_assignment[e] === "v") {
					sign = 1;
				}
			} else {
				throw new Error(Messages.flatFoldAngles);
			}
		}
		return Math.acos(dot(a, b)) * (180 / Math.PI) * sign;
	});
};
