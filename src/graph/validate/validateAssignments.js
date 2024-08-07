/**
 * Rabbit Ear (c) Kraft
 */
import { assignmentFlatFoldAngle } from "../../fold/spec.js";

/**
 * @param {FOLD} graph a FOLD object
 * @returns {string[]}
 */
const assignmentsAndFoldAngleMatch = ({ edges_assignment, edges_foldAngle }) => {
	const angleSign = edges_foldAngle.map(Math.sign);
	const assignmentSign = edges_assignment
		.map((assign) => assignmentFlatFoldAngle[assign])
		.map(Math.sign);
	return assignmentSign
		.map((s, i) =>
			s === angleSign[i]
				? undefined
				: `assignment does not match fold angle at ${i}: ${edges_assignment[i]}, ${edges_foldAngle[i]}`,
		)
		.filter((a) => a !== undefined);
};

/**
 * @description If a graph has both edges_assignment and edges_foldAngle,
 * ensure that they both match each other, V is +, M is -, all else is 0.
 * @description test reflexive component relationships.
 * @param {FOLD} graph a FOLD object
 * @returns {string[]} a list of errors if they exist
 */
export const validateAssignments = (graph) => {
	const assignmentErrors = [];
	if (graph.edges_assignment && graph.edges_foldAngle) {
		assignmentErrors.push(...assignmentsAndFoldAngleMatch(graph));
	}

	return assignmentErrors;
};
