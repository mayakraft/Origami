/**
 * Rabbit Ear (c) Kraft
 */
import { EPSILON } from "../math/constant.js";
import { clipPolygonPolygon } from "../math/clip.js";

/**
 * @description Given a folded graph, find all trios of faces which overlap
 * each other, meaning there exists at least one point that lies at the
 * intersection of all three faces.
 * @param {FOLDExtended} graph a FOLD object
 * @param {number[][]} facesFacesOverlap an overlap-relationship between every face
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {TransitivityConstraint[]} list of arrays containing three face indices.
 */
export const makeTransitivity = (
	{ faces_polygon },
	facesFacesOverlap,
	epsilon = EPSILON,
) => {
	// convert facesFacesOverlap into index-based sparse arrays for fast access.
	const overlap_matrix = facesFacesOverlap.map(() => ({}));
	facesFacesOverlap.forEach((faces, i) =>
		faces.forEach((j) => {
			overlap_matrix[i][j] = true;
			overlap_matrix[j][i] = true;
		}),
	);

	// for every pair of faces that overlap, compute their intersection,
	// if it exists, save the new polygon in this sparse matrix.
	const facesFacesIntersection = [];
	facesFacesOverlap.forEach((faces, i) =>
		faces.forEach((j) => {
			const polygon = clipPolygonPolygon(faces_polygon[i], faces_polygon[j], epsilon);
			if (polygon) {
				if (!facesFacesIntersection[i]) {
					facesFacesIntersection[i] = [];
				}
				if (!facesFacesIntersection[j]) {
					facesFacesIntersection[j] = [];
				}
				facesFacesIntersection[i][j] = polygon;
				facesFacesIntersection[j][i] = polygon;
			}
		}),
	);

	/** @type {[number, number, number][]} an array of three face indices */
	const trios = [];
	for (let i = 0; i < facesFacesIntersection.length - 1; i += 1) {
		if (!facesFacesIntersection[i]) {
			continue;
		}
		for (let j = i + 1; j < facesFacesIntersection.length; j += 1) {
			if (!facesFacesIntersection[i][j]) {
				continue;
			}
			for (let k = j + 1; k < facesFacesIntersection.length; k += 1) {
				if (i === k || j === k) {
					continue;
				}
				if (!overlap_matrix[i][k] || !overlap_matrix[j][k]) {
					continue;
				}
				const polygon = clipPolygonPolygon(
					facesFacesIntersection[i][j],
					faces_polygon[k],
					epsilon,
				);
				if (polygon) {
					const [t, u, v] = [i, j, k].sort((a, b) => a - b);
					trios.push([t, u, v]);
				}
			}
		}
	}
	return trios;
};

/**
 * @description When we calculate taco-taco and taco-tortilla constraints,
 * we are already establishing a relationship between three faces, therefore,
 * we can remove these cases from our list of transitivity constraints.
 * This method returns a lookup table of all permutations of three faces found
 * in the taco-taco and taco-tortillas, the intention is that you use this list
 * to filter out any matches from the already computed transitivity list.
 * @param {{
 *   taco_taco: TacoTacoConstraint[],
 *   taco_tortilla: TacoTortillaConstraint[],
 * }} the two sets of constrains.
 * @returns {{[key: string]: boolean}} object where keys are space-separated
 * trios of faces "a b c" where a < b and b < c.
 */
export const getTransitivityTriosFromTacos = ({ taco_taco, taco_tortilla }) => {
	// using the list of all taco-taco conditions, store all permutations of
	// the three faces (sorted low to high) into a dictionary for quick lookup.
	// store them as space-separated strings.
	const tacoTacoTrios = taco_taco
		.map((arr) => arr.slice().sort((a, b) => a - b))
		.flatMap(([t0, t1, t2, t3]) => [
			[t0, t1, t2],
			[t0, t1, t3],
			[t0, t2, t3],
			[t1, t2, t3],
		]);

	const tacoTortillaTrios = taco_tortilla.map((arr) => arr.slice().sort((a, b) => a - b));

	// will contain taco-taco and taco-tortilla events encoded as all
	// permutations of 3 faces involved in each event.
	/** @type {{[key: string]: boolean}} */
	const tacos_trios = {};

	tacoTacoTrios
		.concat(tacoTortillaTrios)
		.map((faces) => faces.join(" "))
		.forEach((key) => {
			tacos_trios[key] = true;
		});

	return tacos_trios;
};
