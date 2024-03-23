/**
 * Rabbit Ear (c) Kraft
 */
import {
	makeFacesEdgesFromVertices,
} from "../graph/make/facesEdges.js";
import {
	makeEdgesFacesUnsorted,
} from "../graph/make/edgesFaces.js";
import {
	makeEpsilon,
} from "../graph/epsilon.js";
import {
	makeSolverConstraintsFlat,
} from "./constraints.js";
// import {
// 	makeSolverConstraints3D,
// } from "./constraints3d.js";
import {
	solver,
} from "./solver.js";
import {
	solver as solverOneDepth,
} from "./solverOneDepth.js";
import {
	solverSolutionToFaceOrders,
} from "./general.js";

/**
 * @description Find all possible layer orderings of the faces
 * in a flat-foldable origami model. The result contains all possible
 * solutions, use the prototype methods available on this return object
 * to choose one solution, among other available options.
 *
 * for the 3D version:
 * @description This layer solver extends the taco/tortilla method by Jason Ku
 * into 3D by largely sorting faces into groups of coplanar-overlapping faces
 * and adding a few new types of constraints which join faces between groups.
 * This algorithm still requires faces be convex, and faces must be planar.
 *
 * @param {FOLD} graph a FOLD object with folded vertices in 2D
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {{
 *   root: {[key:string]: number},
 *   branches: {[key:string]: number}[][],
 *   faces_winding: number[],
 * }} an object that describes all layer orderings, where the "root" orders
 * are true for all solutions, and each object in "branches" can be appended
 * to the root object to create a complete solution.
 */
export const solveLayerOrders = ({
	vertices_coords, edges_vertices, edges_faces, edges_assignment,
	edges_foldAngle, faces_vertices, faces_edges, faces_faces, edges_vector,
}, epsilon) => {
	// necessary conditions for the layer solver to work
	if (!vertices_coords || !edges_vertices || !faces_vertices) {
		return { root: {}, branches: [], faces_winding: [] };
	}
	if (!faces_edges) {
		faces_edges = makeFacesEdgesFromVertices({ edges_vertices, faces_vertices });
	}
	if (!edges_faces) {
		edges_faces = makeEdgesFacesUnsorted({ edges_vertices, faces_edges });
	}

	// find an appropriate epsilon, but only if it is not specified
	if (epsilon === undefined) {
		epsilon = makeEpsilon({ vertices_coords, edges_vertices });
	}

	// convert the graph into conditions for the solver
	const {
		constraints,
		lookup,
		facePairs,
		faces_winding,
		orders,
	// } = makeSolverConstraints3D({
	} = makeSolverConstraintsFlat({
		vertices_coords,
		edges_vertices,
		edges_faces,
		edges_assignment,
		edges_foldAngle,
		faces_vertices,
		faces_edges,
		faces_faces,
		edges_vector,
	}, epsilon);

	// include faces_winding along with the solver result
	return {
		...solver({ constraints, lookup, facePairs, orders }),
		faces_winding,
	};
};

/**
 *
 */
export const solveFaceOrders = (graph, epsilon) => {
	const {
		faces_winding,
		...result
	} = solveLayerOrders(graph, epsilon);

	const recurse = ({ orders, branches }) => (branches === undefined
		? ({ orders: solverSolutionToFaceOrders(orders, faces_winding) })
		: ({
			orders: solverSolutionToFaceOrders(orders, faces_winding),
			branches: branches.map(inner => inner.map(recurse)),
		}));

	return recurse(result);
};

/**
 * @description Keeping this around for legacy reasons.
 * This is the layer solver that builds one top-level branch
 * and no more.
 */
export const solveLayerOrdersSingleBranches = ({
	vertices_coords, edges_vertices, edges_faces, edges_assignment,
	faces_vertices, faces_edges, edges_vector,
}, epsilon) => {
	// necessary conditions for the layer solver to work
	if (!vertices_coords || !edges_vertices || !faces_vertices) {
		return { root: {}, branches: [], faces_winding: [] };
	}
	if (!faces_edges) {
		faces_edges = makeFacesEdgesFromVertices({ edges_vertices, faces_vertices });
	}
	if (!edges_faces) {
		edges_faces = makeEdgesFacesUnsorted({ edges_vertices, faces_edges });
	}

	// find an appropriate epsilon, but only if it is not specified
	if (epsilon === undefined) {
		epsilon = makeEpsilon({ vertices_coords, edges_vertices });
	}

	// convert the graph into conditions for the solver
	const {
		constraints,
		lookup,
		facePairs,
		faces_winding,
		orders,
	} = makeSolverConstraintsFlat({
		vertices_coords,
		edges_vertices,
		edges_faces,
		edges_assignment,
		faces_vertices,
		faces_edges,
		edges_vector,
	}, epsilon);

	// include faces_winding along with the solver result
	return {
		...solverOneDepth({ constraints, lookup, facePairs, orders }),
		faces_winding,
	};
};
