/**
 * Rabbit Ear (c) Kraft
 */
import { makeVerticesVertices } from "./make/verticesVertices.js";
import { makeVerticesEdgesUnsorted, makeVerticesEdges } from "./make/verticesEdges.js";
import { makeVerticesFaces } from "./make/verticesFaces.js";
import { makeEdgesFacesUnsorted } from "./make/edgesFaces.js";
import { makeFacesFaces } from "./make/facesFaces.js";
import { makeFacesEdgesFromVertices } from "./make/facesEdges.js";
import { makeFacesVerticesFromEdges } from "./make/facesVertices.js";
import { makePlanarFaces } from "./make/faces.js";
import { edgeAssignmentToFoldAngle, edgeFoldAngleToAssignment } from "../fold/spec.js";

/**
 * @description Ensure that both edges_assignment and edges_foldAngle both
 * exist, if in the case only one exists, build the other.
 * If neither exist, fill them both with "unassigned" and fold angle 0.
 * @param {FOLD} graph a FOLD object, modified in place
 */
const buildAssignmentsIfNeeded = (graph) => {
	if (!graph.edges_vertices) {
		return;
	}

	if (!graph.edges_assignment) {
		graph.edges_assignment = [];
	}
	if (!graph.edges_foldAngle) {
		graph.edges_foldAngle = [];
	}

	// ensure that both arrays have the same length. This would be a strange
	// instance if they were not equal, but in the case that they are not, we
	// don't want to overwrite any data, even if it partially exists.
	if (graph.edges_assignment.length > graph.edges_foldAngle.length) {
		for (
			let i = graph.edges_foldAngle.length;
			i < graph.edges_assignment.length;
			i += 1
		) {
			graph.edges_foldAngle[i] = edgeAssignmentToFoldAngle(graph.edges_assignment[i]);
		}
	}
	if (graph.edges_foldAngle.length > graph.edges_assignment.length) {
		for (
			let i = graph.edges_assignment.length;
			i < graph.edges_foldAngle.length;
			i += 1
		) {
			graph.edges_assignment[i] = edgeFoldAngleToAssignment(graph.edges_foldAngle[i]);
		}
	}

	// the two arrays are now the same length. Now we need to make sure they
	// are the same length as edges_vertices. If not, fill any remaining
	// assignments with "unassigned" and fold angle 0.
	for (let i = graph.edges_assignment.length; i < graph.edges_vertices.length; i += 1) {
		graph.edges_assignment[i] = "U";
		graph.edges_foldAngle[i] = 0;
	}
};

/**
 * @description Rebuild both faces_vertices and faces_edges by walking
 * the planar faces in 2D, set them both onto the graph.
 * @param {FOLD} graph a FOLD object, modified in place
 */
const rebuildFaces = (graph) => {
	const { faces_vertices, faces_edges } = makePlanarFaces(graph);
	graph.faces_vertices = faces_vertices;
	graph.faces_edges = faces_edges;
};

/**
 * @description Ensure that faces_vertices and faces_edges exist, and
 * if possible ensure that both are filled with face data.
 * "reface" will only cause a rebuild of faces if currently
 * faces do not exist. If the user wants to force a rebuild of faces, they
 * should call that method directly.
 * @param {FOLD} graph a FOLD object, modified in place
 * @param {boolean} reface should be set to "true" to force the algorithm into
 * rebuilding the faces from scratch (walking edge to edge in the plane).
 * @returns {object} information about which face components were rebuilt.
 */
const buildFacesIfNeeded = (graph, reface) => {
	// in the main method, we need to react accordingly, whether or not certain
	// component arrays were rebuilt (causing others to require be rebuild)
	const didRebuild = {
		faces_vertices: false,
		faces_edges: false,
	};

	// check if a face exists, either array (and the array is not empty)
	const facesExist =
		(graph.faces_vertices && graph.faces_vertices.length) ||
		(graph.faces_edges && graph.faces_edges.length);

	// if the user requests to rebuild the faces, only if no faces exist, do it
	if (!facesExist && reface && graph.vertices_coords) {
		rebuildFaces(graph);
		didRebuild.faces_vertices = true;
		didRebuild.faces_edges = true;
		return didRebuild;
	}

	// if neither exist, check if the user has requested to rebuild the faces
	if (!graph.faces_vertices && !graph.faces_edges) {
		// the user has not requested we rebuild faces, and we can't assume
		// that the graph is a crease pattern, it could be a 2D flat folded model
		// with overlapping faces, so, we cannot assume. make empty face arrays.
		graph.faces_vertices = [];
		graph.faces_edges = [];
	} else if (graph.faces_vertices && !graph.faces_edges) {
		graph.faces_edges = makeFacesEdgesFromVertices(graph);
		didRebuild.faces_edges = true;
	} else if (graph.faces_edges && !graph.faces_vertices) {
		graph.faces_vertices = makeFacesVerticesFromEdges(graph);
		didRebuild.faces_vertices = true;
	}
	return didRebuild;
};

/**
 * @description Take a FOLD graph, containing any number of component fields,
 * and build and set as many missing component arrays as possible.
 * This method is not destructive, rather, it simply builds component arrays
 * if they do not already exist and if it's possible to be built without
 * making any assumptions. If your graph contains errors, this method will not
 * find them and will not correct them.
 * Regarding faces, this method is capable of walking and building faces
 * from scratch for FOLD objects which are creasePattern, not foldedForm,
 * but, the user needs to explicitly request this.
 * @param {FOLD} graph a FOLD object, modified in place
 * @param {object} options object, with the ability to request that the
 * faces be rebuilt by walking 2D planar faces, specify { "faces": true }.
 * @return {FOLD} graph the same input graph object
 */
export const populate = (graph, options = {}) => {
	if (typeof graph !== "object") {
		return graph;
	}
	if (!graph.edges_vertices) {
		return graph;
	}

	// later in the method we need to react accordingly, whether or not certain
	// component arrays were rebuilt (causing others to require be rebuild)
	const didRebuild = {
		vertices_vertices: false,
		faces_vertices: false,
		faces_edges: false,
	};

	// if vertices_vertices exists, rely on its winding order to determine
	// vertices_edges and vertices_faces.
	// otherwise, if vertices_vertices and/or vertices_edges are missing,
	// vertices_edges and vertices_vertices are mutually dependent, so,
	// we need to rebuild one even if it exists if the other does not.
	if (graph.vertices_vertices && !graph.vertices_edges) {
		graph.vertices_edges = makeVerticesEdges(graph);
	} else if (!graph.vertices_edges || !graph.vertices_vertices) {
		graph.vertices_edges = makeVerticesEdgesUnsorted(graph);
		graph.vertices_vertices = makeVerticesVertices(graph);
		graph.vertices_edges = makeVerticesEdges(graph);
		didRebuild.vertices_vertices = true;
	}

	// make sure "edges_foldAngle" and "edges_assignment" exist
	buildAssignmentsIfNeeded(graph);

	// make sure "faces_vertices" and "faces_edges" exist. this also has the
	// option of rebuilding planar faces in 2D, but only if the user has
	// explicitly requested it using the options, as we can't assume that even
	// a 2D graph has non-overlapping faces and will result in a valid re-facing.
	const reface = typeof options === "object" ? options.faces : false;
	Object.assign(didRebuild, buildFacesIfNeeded(graph, reface));

	// makeVerticesFaces dependencies are vertices_vertices and faces_vertices
	// rebuild if a depenency was rebuilt as well
	if (
		!graph.vertices_faces ||
		didRebuild.vertices_vertices ||
		didRebuild.faces_vertices
	) {
		graph.vertices_faces = makeVerticesFaces(graph);
	}

	// makeEdgesFacesUnsorted's dependencies are edges_vertices and faces_edges
	// rebuild if a depenency was rebuilt as well
	if (!graph.edges_faces || didRebuild.faces_edges) {
		graph.edges_faces = makeEdgesFacesUnsorted(graph);
	}

	// makeFacesFaces's dependency is faces_vertices
	// rebuild if a depenency was rebuilt as well
	if (!graph.faces_faces || didRebuild.faces_vertices) {
		graph.faces_faces = makeFacesFaces(graph);
	}
	return graph;
};
