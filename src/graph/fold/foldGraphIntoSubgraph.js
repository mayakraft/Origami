/**
 * Rabbit Ear (c) Kraft
 */
import { EPSILON } from "../../math/constant.js";
import { includeL } from "../../math/compare.js";
import { pointsToLine2 } from "../../math/convert.js";
import { add2, scale2 } from "../../math/vector.js";
import { assignmentFlatFoldAngle, invertAssignment } from "../../fold/spec.js";
import { makeEdgesFacesUnsorted } from "../make/edgesFaces.js";
import { splitLineIntoEdges } from "../split/splitLine.js";
import { makeFacesWinding } from "../faces/winding.js";
import { transferPointInFaceBetweenGraphs } from "../transfer.js";

const transferPointOnEdgeBetweenGraphs = (to, edge, parameter) => {
	const edgeSegment = to.edges_vertices[edge].map((v) => to.vertices_coords[v]);
	const edgeLine = pointsToLine2(edgeSegment[0], edgeSegment[1]);
	return add2(edgeLine.origin, scale2(edgeLine.vector, parameter));
};

/**
 * @description Transfer a point from the "from" graph space into the
 * "to" graph space. The point object comes from the "splitLineIntoEdges"
 * method, which returns information about the point's construction which
 * we can use to re-parameterize into the other graph's space.
 * @param {FOLD} from a FOLD object
 * @param {FOLD} to a FOLD object
 * @param {object} point a point, the result of calling splitLineIntoEdges
 * @returns {number[]} a point
 */
export const transferPoint = (from, to, { vertex, edge, face, point, b }) => {
	if (vertex !== undefined) {
		return to.vertices_coords[vertex];
	}
	if (edge !== undefined) {
		return transferPointOnEdgeBetweenGraphs(to, edge, b);
	}
	if (face !== undefined) {
		return transferPointInFaceBetweenGraphs(from, to, face, point);
	}
	throw new Error("transferPoint() failed");
};

/**
 * @description This creates an edge-and-vertex-only graph (no faces) from a
 * creasePattern and foldedForm graph, given a fold line, perform a fold
 * operation through the folded form, generating a separate (ish) graph
 * that contains the fold line as a series of edges and vertices through the
 * crease pattern. The vertices are generated from the foldedForm but mapped
 * back into creasePattern space. Edge assignments and fold angles will reflect
 * mountain/valley accordingly, or you can choose to make all flat/unassigned.
 * The result's component arrays will contain holes where existing components
 * from the crease pattern are indexed, all new components will begin indexing
 * after these, so that there are no overlapping component indices.
 * The reason for this is that the result graph may create edges which use
 * existing vertices from the creasePattern graph (instead of creating
 * duplicate vertices in the same location), so, these edges_vertices will
 * contain indices which map to the vertices_ from the crease pattern graph.
 * In this regard, the result graph is still dependent upon the source graph.
 * The intention is that the user can easily merge the two graphs into one
 * (via merge methods, mergeArraysWithHoles).
 * If you do merge, make sure to list in order (cp, newGraph) because the
 * newGraph will have indices that exist in the cp that need to be overwritten
 * (for example, in edges_assignment, some assignments need to be overwritten).
 * @param {FOLD} cp a FOLD object in creasePattern
 * @param {FOLD} folded a FOLD object in foldedForm
 * @param {VecLine2} line a fold line
 * @param {function} [lineDomain=() => true] the function which characterizes
 * "line" parameter into a line, ray, or segment.
 * @param {[number, number][]} [interiorPoints=[]] in the case of a ray or segment,
 * place in here the endpoint(s), and they will be included in the result.
 * @param {string} [assignment="V"] what is the assignment of the new crease
 * @param {number} foldAngle the fold angle of the new crease
 * @param {number} [epsilon=1e-6] an optional epsilon
 */
export const foldGraphIntoSubgraph = (
	cp,
	folded,
	line,
	lineDomain = includeL,
	interiorPoints = [],
	assignment = "V",
	foldAngle = undefined,
	epsilon = EPSILON,
) => {
	// if user only specifies assignment, fill in the (flat) fold angle for them
	if (foldAngle === undefined) {
		foldAngle = assignmentFlatFoldAngle[assignment] || 0;
	}

	// Only M and V will exchange. all others, this will be the same assignment
	const oppositeAssignment = invertAssignment(assignment);
	const oppositeFoldAngle = foldAngle === 0 ? 0 : -foldAngle;
	const faces_winding = makeFacesWinding(folded);

	const { vertices, edges_vertices, edges_collinear, edges_face } = splitLineIntoEdges(
		folded,
		line,
		lineDomain,
		interiorPoints,
		epsilon,
	);

	// splitSegmentWithGraph created new points in the foldedForm coordinate
	// space. we need to transfer these to their respective position in the
	// crease pattern space. 2 different methods depending on how the point was made
	const vertices_coords = vertices.map((pointInfo) =>
		transferPoint(folded, cp, pointInfo),
	);

	// get the first face in these instances
	const edges_assignment = edges_face.map((face) =>
		faces_winding[face] ? assignment : oppositeAssignment,
	);
	const edges_foldAngle = edges_face.map((face) =>
		faces_winding[face] ? foldAngle : oppositeFoldAngle,
	);

	// this is the crease pattern's edges_faces (not edges_face from above)
	const edges_faces = cp.edges_faces ? cp.edges_faces : makeEdgesFacesUnsorted(cp);

	// collinear edges should be dealt in this way:
	// if the edge is alredy a M or V, we can ignore it
	// if the edge is a F or U, we need to fold it, and we need to know which
	// direction, this is done by checking one of its two neighboring faces
	// (edges_faces), they should be the same winding, so just grab one.
	const reassignable = { F: true, f: true, U: true, u: true };

	edges_collinear
		.map((collinear, e) => (collinear ? e : undefined))
		.filter((a) => a !== undefined)
		.forEach((edge) => {
			if (!reassignable[edges_assignment[edge]]) {
				return;
			}
			const face = edges_faces[edge].filter((a) => a !== undefined).shift();
			const winding = faces_winding[face];
			edges_assignment[edge] = winding ? assignment : oppositeAssignment;
			edges_foldAngle[edge] = winding ? foldAngle : oppositeFoldAngle;
		});

	return {
		vertices_coords,
		edges_vertices,
		edges_assignment,
		edges_foldAngle,
	};
};
