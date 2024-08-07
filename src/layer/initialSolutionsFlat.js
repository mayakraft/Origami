/**
 * Rabbit Ear (c) Kraft
 */

/**
 * @description Given a FOLD graph, already folded, find the layer arrangement
 * between neighboring faces (using edges_faces), and assign a layer ordering
 * between the pair of faces to be 1 or 2, where:
 * - 1: face A is above face B
 * - 2: face A is below face B
 * faces_winding is necessary because a valley fold will place a neighboring
 * face on top of this face, unless this face is already flipped over,
 * then the neighbor will be below this face.
 * This method is able to work in 3D, in preparation, all coplanar faces are
 * clustered, and the plane's normal is established, and all faces_winding
 * winding orders are based off of this common plane normal.
 * @param {FOLD} graph a FOLD object
 * @param {boolean[]} faces_winding for every face, true if the face's
 * winding is counter-clockwise, false if clockwise.
 * @returns {{[key: string]: number}} an object describing all the
 * solved facePairs (keys) and their layer order 1 or 2 (value),
 * the object only includes those facePairs
 * which are solved, so, no 0-value entries will exist.
 */
export const solveFlatAdjacentEdges = (
	{ edges_faces, edges_assignment },
	faces_winding,
) => {
	// flip 1 and 2 to be the other, leaving 0 to be 0.
	const flipCondition = { 0: 0, 1: 2, 2: 1 };

	// neighbor faces determined by crease between them
	const assignmentOrder = { M: 1, m: 1, V: 2, v: 2 };

	// "solution" contains solved orders (1, 2) for face-pair keys.
	/** @type {{ [key: string]: number }} */
	const solution = {};
	edges_faces.forEach((faces, edge) => {
		// the crease assignment determines the order between pairs of faces.
		const assignment = edges_assignment[edge];
		const localOrder = assignmentOrder[assignment];

		// skip boundary edges, non-manifold edges, and irrelevant assignments
		if (faces.length !== 2 || localOrder === undefined) {
			return;
		}

		// face[0] is the origin face.
		// the direction of "m" or "v" will be inverted if face[0] is flipped.
		const upright = faces_winding[faces[0]];

		// now we know from a global perspective the order between the face pair.
		const globalOrder = upright ? localOrder : flipCondition[localOrder];

		// all face-pairs are stored "a b" where a < b. Our globalOrder is the
		// relationship from faces[0] to faces[1], so if faces[0] > [1] we need
		// to flip the order of faces, and flip the result.
		const inOrder = faces[0] < faces[1];
		const key = inOrder ? faces.join(" ") : faces.slice().reverse().join(" ");
		const value = inOrder ? globalOrder : flipCondition[globalOrder];

		solution[key] = value;
	});
	return solution;
};
