/**
 * Rabbit Ear (c) Kraft
 */

/**
 * @description Given an array of assignments, mountain and valley,
 * identify which assignment occurs less than the other, and return
 * the index of the first occurence of that assignment.
 * In a valid flat-foldable degree-4 single vertex, 3 assignments will be
 * one kind, with 1 as the other. This identifies the location of the other.
 * @param {string[]} assignments an array of FOLD assignments, in uppercase.
 * @returns {number} the index of the odd-one-out assignment.
 */
const oddAssignmentIndex = (assignments) =>
	assignments.filter((a) => a === "M").length >
	assignments.filter((a) => a === "V").length
		? assignments.indexOf("V")
		: assignments.indexOf("M");

/**
 * @description Fold a degree-4 single vertex in 3D.
 * @usage this only works for degree-4 vertices
 * @param {number[]} sectors an array of sector angles in sorted order
 * around the central vertex.
 * @param {string[]} assignments an array of FOLD spec characters, "M" or "V".
 * @param {number} foldAngle the fold amount in radians, between 0 and PI.
 * This value will be internally clamped between -PI and +PI.
 * @todo is it possible to validate self-intersection (and fully validate
 * the folding), if you simply check the assignments around the smallest angle?
 * @returns {number[]|undefined} four fold angles as numbers in an array,
 * or "undefined" if the operation could not be completed.
 */
export const foldDegree4 = (sectors, assignments, foldAngle = 0) => {
	const odd = oddAssignmentIndex(assignments.map((a) => a.toUpperCase()));
	if (odd === -1) {
		return undefined;
	}
	const a = sectors[(odd + 1) % sectors.length];
	const b = sectors[(odd + 2) % sectors.length];

	// const pab = (odd + 2) % sectors.length;
	// const pbc = (odd + 3) % sectors.length;
	// const pbc = Math.PI * foldAngle; // when input was between 0 and 1.
	const pbc = Math.max(-Math.PI, Math.min(Math.PI, foldAngle));

	const cosE =
		-Math.cos(a) * Math.cos(b) + Math.sin(a) * Math.sin(b) * Math.cos(Math.PI - pbc);
	const res =
		Math.cos(Math.PI - pbc) -
		(Math.sin(Math.PI - pbc) ** 2 * Math.sin(a) * Math.sin(b)) / (1 - cosE);

	const pab = -Math.acos(res) + Math.PI;
	return odd % 2 === 0
		? [pab, pbc, pab, pbc].map((n, i) => (odd === i ? -n : n))
		: [pbc, pab, pbc, pab].map((n, i) => (odd === i ? -n : n));
};
