/**
 * Rabbit Ear (c) Kraft
 */
import { makeFacesEdgesFromVertices } from "./facesEdges.js";
import { makeEdgesFacesUnsorted } from "./edgesFaces.js";

/**
 * @description Convert edges fold angle into assignment for every edge. This simple
 * method will only result in "M" "V" and "F", depending on crease angle.
 * "makeEdgesAssignment()" will also assign "B"
 * @param {FOLD} graph a FOLD object, with edges_foldAngle
 * @returns {string[]} array of fold assignments
 */
export const makeEdgesAssignmentSimple = ({ edges_foldAngle }) =>
	edges_foldAngle.map((a) => {
		if (a === 0) {
			return "F";
		}
		return a < 0 ? "M" : "V";
	});

/**
 * @description Convert edges fold angle into assignment for every edge. This method
 * will assign "M" "V" "F" and "B" for edges with only one incident face.
 * @param {FOLD} graph a FOLD object, with edges_foldAngle
 * @returns {string[]} array of fold assignments
 */
export const makeEdgesAssignment = ({
	edges_vertices,
	edges_foldAngle,
	edges_faces,
	faces_vertices,
	faces_edges,
}) => {
	if (edges_vertices && !edges_faces) {
		if (!faces_edges && faces_vertices) {
			faces_edges = makeFacesEdgesFromVertices({ edges_vertices, faces_vertices });
		}
		if (faces_edges) {
			edges_faces = makeEdgesFacesUnsorted({ edges_vertices, faces_edges });
		}
	}
	if (edges_foldAngle) {
		// if edges_faces exists, assign boundaries. otherwise skip it.
		return edges_faces
			? edges_foldAngle.map((a, i) => {
					if (edges_faces[i].length < 2) {
						return "B";
					}
					if (a === 0) {
						return "F";
					}
					return a < 0 ? "M" : "V";
				})
			: makeEdgesAssignmentSimple({ edges_foldAngle });
	}
	// no data to use, everything gets "unassigned"
	return edges_vertices.map(() => "U");
};
