/**
 * Rabbit Ear (c) Kraft
 */
import { EPSILON } from "../math/constant.js";
import { vecLineToUniqueLine, uniqueLineToVecLine } from "../math/convert.js";
import { includeL } from "../math/compare.js";
import {
	normalize2,
	distance2,
	dot2,
	cross2,
	add2,
	subtract2,
	scale2,
	midpoint2,
	rotate90,
} from "../math/vector.js";
import { bisectLines2 } from "../math/line.js";
import { intersectLineLine, intersectCircleLine } from "../math/intersect.js";
import { polynomialSolver } from "../math/polynomial.js";

/*           _                       _              _
						(_)                     (_)            (_)
	 ___  _ __ _  __ _  __ _ _ __ ___  _    __ ___  ___  ___  _ __ ___  ___
	/ _ \| '__| |/ _` |/ _` | '_ ` _ \| |  / _` \ \/ / |/ _ \| '_ ` _ \/ __|
 | (_) | |  | | (_| | (_| | | | | | | | | (_| |>  <| | (_) | | | | | \__ \
	\___/|_|  |_|\__, |\__,_|_| |_| |_|_|  \__,_/_/\_\_|\___/|_| |_| |_|___/
								__/ |
							 |___/
*/

/**
 * @description origami axiom 1: form a line that passes between the given points
 * @param {[number, number]} point1 a 2D point
 * @param {[number, number]} point2 a 2D point
 * @returns {[UniqueLine]} an array of one solution line in {normal, distance} form
 */
export const normalAxiom1 = (point1, point2) => {
	const normal = normalize2(rotate90(subtract2(point2, point1)));
	return [
		{
			normal,
			distance: dot2(add2(point1, point2), normal) / 2.0,
		},
	];
};

/**
 * @description origami axiom 1: form a line that passes between the given points
 * @param {[number, number]} point1 one 2D point
 * @param {[number, number]} point2 one 2D point
 * @returns {[VecLine2]} an array of one solution line in {vector, origin} form
 */
export const axiom1 = (point1, point2) => [
	{
		vector: normalize2(subtract2(point2, point1)),
		origin: point1,
	},
];

/**
 * @description origami axiom 2: form a perpendicular bisector between the given points
 * @param {[number, number]} point1 one 2D point
 * @param {[number, number]} point2 one 2D point
 * @returns {[UniqueLine]} an array of one solution line in {normal, distance} form
 */
export const normalAxiom2 = (point1, point2) => {
	const normal = normalize2(subtract2(point2, point1));
	return [
		{
			normal,
			distance: dot2(add2(point1, point2), normal) / 2.0,
		},
	];
};

/**
 * @description origami axiom 2: form a perpendicular bisector between the given points
 * @param {[number, number]} point1 one 2D point
 * @param {[number, number]} point2 one 2D point
 * @returns {[VecLine2]} an array of one solution line in {vector, origin} form
 */
export const axiom2 = (point1, point2) => [
	{
		vector: normalize2(rotate90(subtract2(point2, point1))),
		origin: midpoint2(point1, point2),
	},
];

/**
 * @description origami axiom 3: form two lines that make the two angular bisectors between
 * two input lines, and in the case of parallel inputs only one solution will be given
 * @param {UniqueLine} line1 one 2D line in {normal, distance} form
 * @param {UniqueLine} line2 one 2D line in {normal, distance} form
 * @returns {[UniqueLine?, UniqueLine?]} an array of solutions in {normal, distance} form
 */
export const normalAxiom3 = (line1, line2) => {
	const determ = cross2(line1.normal, line2.normal);

	// lines are parallel, only one solution exists
	if (Math.abs(determ) < EPSILON) {
		return [
			{
				normal: line1.normal,
				distance:
					(line1.distance + line2.distance * dot2(line1.normal, line2.normal)) / 2,
			},
		];
	}
	const x = line1.distance * line2.normal[1] - line2.distance * line1.normal[1];
	const y = line2.distance * line1.normal[0] - line1.distance * line2.normal[0];
	/** @type {[number, number]} */
	const intersect = [x / determ, y / determ];

	const [resultA, resultB] = [add2, subtract2]
		.map((f) => normalize2(f(line1.normal, line2.normal)))
		.map((normal) => ({ normal, distance: dot2(intersect, normal) }));
	return [resultA, resultB];
};

/**
 * @description origami axiom 3: form two lines that make the two angular bisectors between
 * two input lines, and in the case of parallel inputs only one solution will be given
 * @param {VecLine2} line1 one 2D line in {vector, origin} form
 * @param {VecLine2} line2 one 2D line in {vector, origin} form
 * @returns {[VecLine2?, VecLine2?]} an array of lines in {vector, origin} form
 */
export const axiom3 = (line1, line2) => bisectLines2(line1, line2);

/**
 * @description origami axiom 4: form a line perpendicular to a given line that
 * passes through a point.
 * @param {UniqueLine} line one 2D line in {normal, distance} form
 * @param {[number, number]} point one 2D point
 * @returns {[UniqueLine]} an array of one solution in {normal, distance} form
 */
export const normalAxiom4 = (line, point) => {
	const normal = rotate90(line.normal);
	const distance = dot2(point, normal);
	return [{ normal, distance }];
};

/**
 * @description origami axiom 4: form a line perpendicular to a given line that
 * passes through a point.
 * @param {VecLine2} line one 2D line in {vector, origin} form
 * @param {[number, number]} point one 2D point
 * @returns {[VecLine2]} the line in {vector, origin} form
 */
export const axiom4 = ({ vector }, point) => [
	{
		vector: rotate90(normalize2(vector)),
		origin: point,
	},
];

/**
 * @description origami axiom 5: form up to two lines that pass through a point that also
 * brings another point onto a given line
 * @param {UniqueLine} line one 2D line in {normal, distance} form
 * @param {[number, number]} point1 one 2D point, the point that the line(s) pass through
 * @param {[number, number]} point2 one 2D point, the point that is being brought onto the line
 * @returns {[UniqueLine?, UniqueLine?]} an array of solutions in {normal, distance} form
 */
export const normalAxiom5 = (line, point1, point2) => {
	const p1base = dot2(point1, line.normal);
	const a = line.distance - p1base;
	const c = distance2(point1, point2);
	if (a > c) {
		return [];
	}
	const b = Math.sqrt(c * c - a * a);
	const a_vec = scale2(line.normal, a);
	const base_center = add2(point1, a_vec);
	const base_vector = scale2(rotate90(line.normal), b);
	// if b is near 0 we have one solution, otherwise two
	const mirrors =
		b < EPSILON
			? [base_center]
			: [add2(base_center, base_vector), subtract2(base_center, base_vector)];
	const [resultA, resultB] = mirrors
		.map((pt) => normalize2(subtract2(point2, pt)))
		.map((normal) => ({ normal, distance: dot2(point1, normal) }));
	return [resultA, resultB];
};

/**
 * @description origami axiom 5: form up to two lines that pass through a point that also
 * brings another point onto a given line
 * @param {VecLine2} line one 2D line in {vector, origin} form
 * @param {[number, number]} point1 one 2D point, the point that the line(s) pass through
 * @param {[number, number]} point2 one 2D point, the point that is being brought onto the line
 * @returns {VecLine2[]} an array of lines in {vector, origin} form
 */
export const axiom5 = (line, point1, point2) =>
	(
		intersectCircleLine({ radius: distance2(point1, point2), origin: point1 }, line) || []
	).map((sect) => ({
		vector: normalize2(rotate90(subtract2(sect, point2))),
		origin: midpoint2(point2, sect),
	}));

/**
 * @description origami axiom 6: form up to three lines that are made by bringing
 * a point to a line and a second point to a second line.
 * @attribution a refactoring from C++ of Robert Lang's cubic solver from
 * Reference Finder: https://langorigami.com/article/referencefinder/
 * @param {UniqueLine} line1 one 2D line in {normal, distance} form
 * @param {UniqueLine} line2 one 2D line in {normal, distance} form
 * @param {[number, number]} point1 the point to bring to the first line
 * @param {[number, number]} point2 the point to bring to the second line
 * @returns {UniqueLine[]}
 * an array of solutions in {normal, distance} form
 */
export const normalAxiom6 = (line1, line2, point1, point2) => {
	// at least pointA must not be on lineA
	// for some reason this epsilon is much higher than 1e-6
	if (Math.abs(1 - dot2(line1.normal, point1) / line1.distance) < 0.02) {
		return [];
	}

	// line vec is the first line's vector, along the line, not the normal
	const line_vec = rotate90(line1.normal);
	const vec1 = subtract2(
		add2(point1, scale2(line1.normal, line1.distance)),
		scale2(point2, 2),
	);
	const vec2 = subtract2(scale2(line1.normal, line1.distance), point1);
	const c1 = dot2(point2, line2.normal) - line2.distance;
	const c2 = 2 * dot2(vec2, line_vec);
	const c3 = dot2(vec2, vec2);
	const c4 = dot2(add2(vec1, vec2), line_vec);
	const c5 = dot2(vec1, vec2);
	const c6 = dot2(line_vec, line2.normal);
	const c7 = dot2(vec2, line2.normal);
	const d = c6;
	const c = c1 + c4 * c6 + c7;
	const b = c1 * c2 + c5 * c6 + c4 * c7;
	const a = c1 * c3 + c5 * c7;

	// construct the solution from the root, the solution being the parameter
	// point reflected across the fold line, lying on the parameter line
	let coefficients = [];
	if (Math.abs(d) > EPSILON) {
		coefficients = [a, b, c, d];
	} else if (Math.abs(c) > EPSILON) {
		coefficients = [a, b, c];
	} else if (Math.abs(b) > EPSILON) {
		coefficients = [a, b];
	}
	return polynomialSolver(coefficients)
		.map((n) => add2(scale2(line1.normal, line1.distance), scale2(line_vec, n)))
		.map((p) => ({ p, normal: normalize2(subtract2(p, point1)) }))
		.map((el) => ({
			normal: el.normal,
			distance: dot2(el.normal, midpoint2(el.p, point1)),
		}));
};

/**
 * @description origami axiom 6: form up to three lines that are made by bringing
 * a point to a line and a second point to a second line.
 * @param {VecLine2} line1 one 2D line in {vector, origin} form
 * @param {VecLine2} line2 one 2D line in {vector, origin} form
 * @param {[number, number]} point1 the point to bring to the first line
 * @param {[number, number]} point2 the point to bring to the second line
 * @returns {VecLine2[]} an array of lines in {vector, origin} form
 */
export const axiom6 = (line1, line2, point1, point2) =>
	normalAxiom6(
		vecLineToUniqueLine(line1),
		vecLineToUniqueLine(line2),
		point1,
		point2,
	).map(uniqueLineToVecLine);

/**
 * @description origami axiom 7: form a line by bringing a point onto a given line
 * while being perpendicular to another given line.
 * @param {UniqueLine} line1 one 2D line in {normal, distance} form,
 * the line the point will be brought onto.
 * @param {UniqueLine} line2 one 2D line in {normal, distance} form,
 * the line which the perpendicular will be based off.
 * @param {[number, number]} point the point to bring onto the line
 * @returns {[UniqueLine?]} an array of one solution in {normal, distance} form
 */
export const normalAxiom7 = (line1, line2, point) => {
	const normal = rotate90(line1.normal);
	const norm_norm = dot2(normal, line2.normal);
	// if norm_norm is close to 0, the two input lines are parallel, no solution
	if (Math.abs(norm_norm) < EPSILON) {
		return undefined;
	}
	const a = dot2(point, normal);
	const b = dot2(point, line2.normal);
	const distance = (line2.distance + 2.0 * a * norm_norm - b) / (2.0 * norm_norm);
	return [{ normal, distance }];
};

/**
 * @description origami axiom 7: form a line by bringing a point onto a given line
 * while being perpendicular to another given line.
 * @param {VecLine2} line1 one 2D line in {vector, origin} form,
 * the line the point will be brought onto.
 * @param {VecLine2} line2 one 2D line in {vector, origin} form,
 * the line which the perpendicular will be based off.
 * @param {[number, number]} point the point to bring onto the line
 * @returns {[VecLine2?]} the line in {vector, origin} form
 * or undefined if the given lines are parallel
 */
export const axiom7 = (line1, line2, point) => {
	const intersect = intersectLineLine(
		line1,
		{ vector: line2.vector, origin: point },
		includeL,
		includeL,
	).point;
	return intersect === undefined
		? []
		: [
				{
					// todo: switch this out, but test it as you do
					vector: normalize2(rotate90(subtract2(intersect, point))),
					// vector: normalize2(rotate90(line2.vector)),
					origin: midpoint2(point, intersect),
				},
			];
};

/**
 * @description Perform one of the seven origami axioms
 * @param {number} number the axiom number, 1-7
 * @param {...any} args the axiom input parameters
 * @returns {VecLine2[]} an array of solution lines in {vector, origin} form
 */
// export const axiom = (number, ...args) => [
// 	null, axiom1, axiom2, axiom3, axiom4, axiom5, axiom6, axiom7,
// ][number](...args);

/**
 * @description Perform one of the seven origami axioms
 * @param {number} number the axiom number, 1-7
 * @param {...any} args the lines or points, as required by this axiom
 * @returns {UniqueLine[]} an array of solution lines in {normal, distance} form
 */
// export const normalAxiom = (number, ...args) => [
// 	null,
// 	normalAxiom1,
// 	normalAxiom2,
// 	normalAxiom3,
// 	normalAxiom4,
// 	normalAxiom5,
// 	normalAxiom6,
// 	normalAxiom7,
// ][number](...args);

// * @param {line?} line1 a line parameter, if required by the axiom
// * @param {line?} line2 a line parameter, if required by the axiom
// * @param {number[]?} point1 a point parameter, if required by the axiom
// * @param {number[]?} point2 a point parameter, if required by the axiom
