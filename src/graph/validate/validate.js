/**
 * Rabbit Ear (c) Kraft
 */
import { validateTypes } from "./validateTypes.js";
import { validateReferences } from "./validateReferences.js";
import { validateReflexive } from "./validateReflexive.js";
import { validateWinding } from "./validateWinding.js";
import { validateAssignments } from "./validateAssignments.js";
import { validateOrders } from "./validateOrders.js";

/**
 * @notes
 * should non-planar faces be an invalid case?
 */

/**
 * @description Validate a graph, ensuring that all references across
 * different arrays point to valid data, there are no mismatching
 * array references.
 * @param {FOLD} graph a FOLD object
 * @returns {string[]} array of error messages. an empty array means no errors.
 */
export const validate = (graph) =>
	validateTypes(graph)
		.concat(validateReferences(graph))
		.concat(validateReflexive(graph))
		.concat(validateWinding(graph))
		.concat(validateAssignments(graph))
		.concat(validateOrders(graph));

// const extraVerticesTest = (graph, epsilon) => {
// 	const errors = [];
// 	const isolated_vertices = isolatedVertices(graph);
// 	const duplicate_vertices = duplicateVertices(graph, epsilon);
// 	if (isolated_vertices.length !== 0) {
// 		errors.push(`contains isolated vertices: ${isolated_vertices.join(", ")}`);
// 	}
// 	if (duplicate_vertices.length !== 0) {
// 		errors.push(`contains duplicate vertices`);
// 	}
// 	return errors;
// };
