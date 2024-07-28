/**
 * Rabbit Ear (c) Kraft
 */
import {
	makeEdgesFacesUnsorted,
} from "../graph/make/edgesFaces.js";
import {
	makeEdgesAssignmentSimple,
} from "../graph/make/edgesAssignment.js";
import {
	makeEdgesFoldAngle,
} from "../graph/make/edgesFoldAngle.js";
import {
	makeFacesEdgesFromVertices,
} from "../graph/make/facesEdges.js";
import {
	makeFacesFaces,
} from "../graph/make/facesFaces.js";
import {
	makeEpsilon,
} from "../graph/epsilon.js";
import {
	makeSolverConstraintsFlat,
} from "./constraintsFlat.js";
import {
	makeSolverConstraints3D,
} from "./constraints3D.js";
import {
	solver,
} from "./solver.js";
import {
	solver as solverOneDepth,
} from "./solverOneDepth.js";
import {
	solverOrdersToFaceOrders,
} from "./general.js";

/**
 * @param {LayerFork} solutionBranch
 * @param {boolean[]} faces_winding
 * @returns {FaceOrdersSolverSolution}
 */
const layerSolutionToFaceOrdersTree = ({ orders, branches }, faces_winding) => (
	branches === undefined
		? ({ orders: solverOrdersToFaceOrders(orders, faces_winding) })
		: ({
			orders: solverOrdersToFaceOrders(orders, faces_winding),
			branches: branches
				.map(inner => inner
					.map(b => layerSolutionToFaceOrdersTree(b, faces_winding))),
		}));

/**
 * @description Find all possible layer orderings of the faces
 * in a flat-foldable origami model. The result contains all possible
 * solutions, use the prototype methods available on this return object
 * to choose one solution, among other available options.
 * @param {FOLDExtended} graph a FOLD object with folded vertices in 2D
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {{
 *   orders: {[key:string]: number},
 *   branches?: LayerBranch[],
 *   faces_winding: boolean[],
 * }} an object that describes all layer orderings, where the "root" orders
 * are true for all solutions, and each object in "branches" can be appended
 * to the root object to create a complete solution.
 */
export const solveLayerOrders = ({
	vertices_coords, edges_vertices, edges_faces, edges_assignment,
	edges_foldAngle, faces_vertices, faces_edges, faces_faces, faceOrders,
	edges_vector,
}, epsilon) => {
	// todo: need some sort of decision to be able to handle graphs which
	// have variations of populated/absent edges_assignment and foldAngle

	// necessary conditions for the layer solver to work
	if (!vertices_coords || !edges_vertices || !faces_vertices) {
		return { orders: {}, faces_winding: [] };
	}
	if (!faces_edges) {
		// eslint-disable-next-line no-param-reassign
		faces_edges = makeFacesEdgesFromVertices({ edges_vertices, faces_vertices });
	}
	if (!edges_faces) {
		// eslint-disable-next-line no-param-reassign
		edges_faces = makeEdgesFacesUnsorted({ edges_vertices, faces_vertices, faces_edges });
	}

	// these are needed for the 3D solver.
	if (!faces_faces) {
		// eslint-disable-next-line no-param-reassign
		faces_faces = makeFacesFaces({ faces_vertices });
	}
	// edges_foldAngle needs to be present so we can ignore foldAngles
	// which are not flat when doing taco/tortilla things. if we need to
	// build it here, all of them are flat, but we need the array to exist
	if (!edges_foldAngle && edges_assignment) {
		// eslint-disable-next-line no-param-reassign
		edges_foldAngle = makeEdgesFoldAngle({ edges_assignment });
	}
	if (!edges_assignment) {
		// eslint-disable-next-line no-param-reassign
		edges_assignment = makeEdgesAssignmentSimple({ edges_foldAngle });
	}

	// find an appropriate epsilon, but only if it is not specified
	if (epsilon === undefined) {
		// eslint-disable-next-line no-param-reassign
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
		faceOrders,
		edges_vector,
	}, epsilon);

	// include faces_winding along with the solver result
	return {
		...solver({ constraints, lookup, facePairs, orders }),
		faces_winding,
	};
};

/**
 * @description Keeping this around for legacy reasons.
 * This is the layer solver that builds one top-level branch
 * and no more.
 * @param {FOLDExtended} graph a FOLD object
 * @param {number} [epsilon=1e-6] an optional epsilon
 */
export const solveLayerOrdersSingleBranches = ({
	vertices_coords, edges_vertices, edges_faces, edges_assignment,
	faces_vertices, faces_edges, faceOrders, edges_vector,
}, epsilon) => {
	// necessary conditions for the layer solver to work
	if (!vertices_coords || !edges_vertices || !faces_vertices) {
		return { orders: {}, faces_winding: [] };
	}
	if (!faces_edges) {
		// eslint-disable-next-line no-param-reassign
		faces_edges = makeFacesEdgesFromVertices({ edges_vertices, faces_vertices });
	}
	if (!edges_faces) {
		// eslint-disable-next-line no-param-reassign
		edges_faces = makeEdgesFacesUnsorted({ edges_vertices, faces_vertices, faces_edges });
	}

	// find an appropriate epsilon, but only if it is not specified
	if (epsilon === undefined) {
		// eslint-disable-next-line no-param-reassign
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
		faceOrders,
		edges_vector,
	}, epsilon);

	// include faces_winding along with the solver result
	return {
		...solverOneDepth({ constraints, lookup, facePairs, orders }),
		faces_winding,
	};
};

/**
 * @description Find all possible layer orderings of the faces
 * in a 3D folded origami. The result contains all possible
 * solutions, use the prototype methods available on this return object
 * to choose one solution, among other available options.
 * This layer solver extends the taco/tortilla method into 3D by
 * sorting faces into groups of coplanar-overlapping faces
 * and adding a few new types of constraints which join faces between groups.
 * This algorithm still requires faces be convex, and faces must be planar.
 * @param {FOLD} graph a FOLD object
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {{
 *   orders: {[key:string]: number},
 *   branches?: LayerBranch[],
 *   faces_winding: boolean[],
 * }} an object that describes all layer orderings, where the "root" orders
 * are true for all solutions, and each object in "branches" can be appended
 * to the root object to create a complete solution.
 */
export const solveLayerOrders3D = ({
	vertices_coords, edges_vertices, edges_faces, edges_assignment,
	edges_foldAngle, faces_vertices, faces_edges, faces_faces, faceOrders,
}, epsilon) => {
	// todo: need some sort of decision to be able to handle graphs which
	// have variations of populated/absent edges_assignment and foldAngle

	// necessary conditions for the layer solver to work
	if (!vertices_coords || !edges_vertices || !faces_vertices) {
		return { orders: {}, faces_winding: [] };
	}
	if (!faces_edges) {
		// eslint-disable-next-line no-param-reassign
		faces_edges = makeFacesEdgesFromVertices({ edges_vertices, faces_vertices });
	}
	if (!edges_faces) {
		// eslint-disable-next-line no-param-reassign
		edges_faces = makeEdgesFacesUnsorted({ edges_vertices, faces_vertices, faces_edges });
	}

	// these are needed for the 3D solver.
	if (!faces_faces) {
		// eslint-disable-next-line no-param-reassign
		faces_faces = makeFacesFaces({ faces_vertices });
	}
	// edges_foldAngle needs to be present so we can ignore foldAngles
	// which are not flat when doing taco/tortilla things. if we need to
	// build it here, all of them are flat, but we need the array to exist
	if (!edges_foldAngle && edges_assignment) {
		// eslint-disable-next-line no-param-reassign
		edges_foldAngle = makeEdgesFoldAngle({ edges_assignment });
	}
	if (!edges_assignment) {
		// eslint-disable-next-line no-param-reassign
		edges_assignment = makeEdgesAssignmentSimple({ edges_foldAngle });
	}

	// find an appropriate epsilon, but only if it is not specified
	if (epsilon === undefined) {
		// eslint-disable-next-line no-param-reassign
		epsilon = makeEpsilon({ vertices_coords, edges_vertices });
	}

	// convert the graph into conditions for the solver
	const {
		constraints,
		lookup,
		facePairs,
		faces_winding,
		orders,
	} = makeSolverConstraints3D({
		vertices_coords,
		edges_vertices,
		edges_faces,
		edges_assignment,
		edges_foldAngle,
		faces_vertices,
		faces_edges,
		faces_faces,
		faceOrders,
	}, epsilon);

	// include faces_winding along with the solver result
	return {
		...solver({ constraints, lookup, facePairs, orders }),
		faces_winding,
	};
};

/**
 * @param {FOLD} graph a FOLD object
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {FaceOrdersSolverSolution}
 */
export const solveFaceOrders = (graph, epsilon) => {
	const {
		faces_winding,
		...result
	} = solveLayerOrders(graph, epsilon);

	return layerSolutionToFaceOrdersTree(result, faces_winding);
};

/**
 * @param {FOLD} graph a FOLD object
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {FaceOrdersSolverSolution}
 */
export const solveFaceOrders3D = (graph, epsilon) => {
	const {
		faces_winding,
		...result
	} = solveLayerOrders3D(graph, epsilon);

	return layerSolutionToFaceOrdersTree(result, faces_winding);
};
