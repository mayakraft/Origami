/**
 * Rabbit Ear (c) Kraft
 */
import { assignmentIsBoundary } from "../fold/spec.js";

/**
 * @param {string[]} edges_assignment
 * @returns {number[]} indices of the edges with undefined assignments
 */
const getUnassignedIndices = (edges_assignment) =>
	edges_assignment
		.map((_, i) => i)
		.filter((i) => edges_assignment[i] === "U" || edges_assignment[i] === "u");

// sectors and assignments are fenceposted.
// sectors[i] is bounded by assignment[i] assignment[i + 1]

/**
 * @description given a set of assignments (M/V/F/B/U characters),
 * which contains some U (unassigned), find all permutations
 * of mountain valley to replace all U which satisfy Maekawa's theorem.
 * This function solves only one single vertex, the assignments
 * are sorted radially around the vertex.
 * Additionally, if the set contains a boundary ("B" or "C"), then it returns
 * all possible permutations. If it doesn't incude a boundary, it runs
 * Maekawa's theorem and if M-V=+/-2 is not satisfied it returns an empty array.
 * @param {string[]} vertices_edgesAssignments array of FOLD spec
 * assignment characters of the edges radially around a single vertex.
 * @returns {string[][]} array of arrays of strings, all permutations where "U"
 * assignments have been replaced with "V" or "M".
 */
export const maekawaSolver = (vertices_edgesAssignments) => {
	const unassigneds = getUnassignedIndices(vertices_edgesAssignments);
	const permuts = Array.from(Array(2 ** unassigneds.length))
		.map((_, i) => i.toString(2))
		.map((l) => Array(unassigneds.length - l.length + 1).join("0") + l)
		.map((str) => Array.from(str).map((l) => (l === "0" ? "V" : "M")));
	const all = permuts.map((perm) => {
		const array = vertices_edgesAssignments.slice();
		unassigneds.forEach((index, i) => {
			array[index] = perm[i];
		});
		return array;
	});
	const boundaryCount = vertices_edgesAssignments.filter(
		(a) => assignmentIsBoundary[a],
	).length;
	if (boundaryCount > 0) {
		return all;
	}
	const count_m = all.map((a) => a.filter((l) => l === "M" || l === "m").length);
	const count_v = all.map((a) => a.filter((l) => l === "V" || l === "v").length);
	return all.filter((_, i) => Math.abs(count_m[i] - count_v[i]) === 2);
};
