/**
 * Rabbit Ear (c) Kraft
 */
import { EPSILON } from "../../math/constant.js";
import { includeL } from "../../math/compare.js";
import { scale2, add2, resize2 } from "../../math/vector.js";
import { invertAssignment } from "../../fold/spec.js";
import { makeFacesEdgesFromVertices } from "../make/facesEdges.js";
import { makeVerticesCoordsFlatFolded } from "../vertices/folded.js";
import { makeFacesWinding } from "../faces/winding.js";
import { getFaceUnderPoint } from "../overlap.js";
import { intersectLine } from "../intersect.js";
import { edgesToLines2 } from "../edges/lines.js";

/**
 * @description Given a flat-foldable crease pattern, perform a fold through
 * its folded form and return a list of new crease edges as edges in the
 * crease pattern space.
 * This method does not modify the input graph, it returns the fold line
 * as a list of segments, mapped to the face inside which they lie.
 * @param {FOLD} graph a FOLD object in crease pattern form
 * @param {VecLine2} line a fold line
 * @param {string} assignment the segment's assignment through the first face
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {{
 *   intersections: (FaceEdgeEvent|FaceVertexEvent)[],
 *   assignment: string,
 *   points: [number, number][],
 * }[]} For each intersected face, a new segment object:
 * - intersections: information about the intersection events
 * - assignment: the assignment of the new segment
 * - points: the new segment's two endpoints
 */
export const foldGraphIntoSegments = (
	{
		vertices_coords,
		edges_vertices,
		edges_foldAngle,
		edges_assignment,
		faces_vertices,
		faces_edges,
		faces_faces,
	},
	{ vector, origin },
	assignment = "V",
	epsilon = EPSILON,
) => {
	if (!faces_edges) {
		faces_edges = makeFacesEdgesFromVertices({ edges_vertices, faces_vertices });
	}

	// the face under the point's crease will get the assignment in the method
	// input parameter, and all other creases will be valley/mountain accordingly
	const startFace = getFaceUnderPoint(
		{ vertices_coords, faces_vertices },
		origin,
		vector,
	);

	// Only M and V will exchange. all others, this will be the same assignment
	const oppositeAssignment = invertAssignment(assignment);

	// this assumes the model is flat folded.
	// another approach would be to check for any non-flat edges, fold a 3D
	// graph, then find all faces that are in the same plane as startFace.
	const vertices_coordsFolded = makeVerticesCoordsFlatFolded(
		{
			vertices_coords,
			edges_vertices,
			edges_foldAngle,
			edges_assignment,
			faces_vertices,
			faces_faces,
		},
		[startFace],
	);

	// edge line data for the crease pattern state, needed to remap the edge
	// intersections, which were calculated in the folded state, into points
	// in the crease pattern state.
	const edges_line = edgesToLines2({ vertices_coords, edges_vertices });

	// note that this copy of faces_winding will be forced to be the case that
	// our startFace is "true" instead of T/F based on face winding direction.
	const faces_winding = makeFacesWinding({
		vertices_coords: vertices_coordsFolded,
		faces_vertices,
	});
	if (!faces_winding[startFace]) {
		faces_winding.forEach((w, i) => {
			faces_winding[i] = !w;
		});
	}

	const { faces } = intersectLine(
		{
			vertices_coords: vertices_coordsFolded,
			edges_vertices,
			faces_vertices,
			faces_edges,
		},
		{ vector, origin },
		includeL,
		epsilon,
	);

	// only keep simple, convex faces
	faces.forEach((arr, f) => {
		if (arr.length !== 2) {
			delete faces[f];
		}
	});

	/**
	 * @param {({
	 *   edge: number,
	 *   a: number,
	 *   b: number,
	 *   point: [number, number],
	 *   vertex?: never
	 *   } | { a: number, vertex: number, b?: never, edge?: never })} el
	 * @returns {[number, number]} a point in 2D
	 */
	const remapPoint = ({ vertex, edge, b }) =>
		vertex !== undefined
			? resize2(vertices_coords[vertex])
			: add2(scale2(edges_line[edge].vector, b), edges_line[edge].origin);

	// the return object will be, for every intersected face,
	// an object which describes a new segment, including:
	// - edges: which two edges were intersected
	// - assignment: the assignment of the new segment
	// - points: the new segment's two endpoints
	// Note: the points will be remapped back into crease pattern space,
	// as all intersection data was calculated using the folded form's vertices.
	return faces.map((intersections, f) => ({
		intersections,
		assignment: faces_winding[f] ? assignment : oppositeAssignment,
		points: intersections.map(remapPoint),
	}));
};
