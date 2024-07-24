/**
 * Rabbit Ear (c) Kraft
 */
import {
	axiom1,
	axiom2,
	axiom3,
	axiom4,
	axiom5,
	axiom6,
	axiom7,
	normalAxiom1,
	normalAxiom2,
	normalAxiom3,
	normalAxiom4,
	normalAxiom5,
	normalAxiom6,
	normalAxiom7,
} from "./axioms.js";
import {
	validateAxiom1,
	validateAxiom2,
	validateAxiom3,
	validateAxiom4,
	validateAxiom5,
	validateAxiom6,
	validateAxiom7,
} from "./validate.js";
import {
	uniqueLineToVecLine,
  vecLineToUniqueLine,
} from "../math/convert.js";

/**
 * @param {FOLD} graph a FOLD graph, folded or crease pattern
 * @param {[number, number]} point1
 * @param {[number, number]} point2
 * @returns {UniqueLine[]}
 */
export const validNormalAxiom1 = (graph, point1, point2) => {
	const isValid = validateAxiom1(graph, point1, point2);
	return normalAxiom1(point1, point2).filter((_, i) => isValid[i]);
};

/**
 * @param {FOLD} graph a FOLD graph, folded or crease pattern
 * @param {[number, number]} point1
 * @param {[number, number]} point2
 * @returns {VecLine2[]}
 */
export const validAxiom1 = (graph, point1, point2) => {
	const isValid = validateAxiom1(graph, point1, point2);
	return axiom1(point1, point2).filter((_, i) => isValid[i]);
};

/**
 * @param {FOLD} graph a FOLD graph, folded or crease pattern
 * @param {[number, number]} point1
 * @param {[number, number]} point2
 * @returns {UniqueLine[]}
 */
export const validNormalAxiom2 = (graph, point1, point2) => {
	const isValid = validateAxiom2(graph, point1, point2);
	return normalAxiom2(point1, point2).filter((_, i) => isValid[i]);
};

/**
 * @param {FOLD} graph a FOLD graph, folded or crease pattern
 * @param {[number, number]} point1
 * @param {[number, number]} point2
 * @returns {VecLine2[]}
 */
export const validAxiom2 = (graph, point1, point2) => {
	const isValid = validateAxiom2(graph, point1, point2);
	return axiom2(point1, point2).filter((_, i) => isValid[i]);
};

/**
 * @param {FOLD} graph a FOLD graph, folded or crease pattern
 * @param {UniqueLine} line1 one 2D line in {normal, distance} form
 * @param {UniqueLine} line2 one 2D line in {normal, distance} form
 * @returns {UniqueLine[]}
 */
export const validNormalAxiom3 = (graph, line1, line2) => {
	const solutionsUnique = normalAxiom3(line1, line2);
  const solutions = solutionsUnique.map(uniqueLineToVecLine);
	const isValid = validateAxiom3(
		graph,
		[solutions[0], solutions[1]],
		uniqueLineToVecLine(line1),
		uniqueLineToVecLine(line2),
	);
  return solutionsUnique.filter((_, i) => isValid[i]);
};

/**
 * @param {FOLD} graph a FOLD graph, folded or crease pattern
 * @param {VecLine2} line1 one 2D line in {vector, origin} form
 * @param {VecLine2} line2 one 2D line in {vector, origin} form
 * @returns {VecLine2[]}
 */
export const validAxiom3 = (graph, line1, line2) => {
	const solutions = axiom3(line1, line2);
	const isValid = validateAxiom3(graph, solutions, line1, line2);
	return solutions.filter((_, i) => isValid[i]);
};

/**
 * @param {FOLD} graph a FOLD graph, folded or crease pattern
 * @param {UniqueLine} line one 2D line in {normal, distance} form
 * @param {[number, number]} point one 2D point
 * @returns {UniqueLine[]}
 */
export const validNormalAxiom4 = (graph, line, point) => {
	const solutions = normalAxiom4(line, point);
	const isValid = validateAxiom4(
		graph,
		uniqueLineToVecLine(line),
		point,
	);
	return solutions.filter((_, i) => isValid[i]);
};

/**
 * @param {FOLD} graph a FOLD graph, folded or crease pattern
 * @param {VecLine2} line one 2D line in {vector, origin} form
 * @param {[number, number]} point one 2D point
 * @returns {VecLine2[]}
 */
export const validAxiom4 = (graph, line, point) => {
	const solutions = axiom4(line, point);
	const isValid = validateAxiom4(graph, line, point);
	return solutions.filter((_, i) => isValid[i]);
};

/**
 * @param {FOLD} graph a FOLD graph, folded or crease pattern
 * @param {UniqueLine} line one 2D line in {normal, distance} form
 * @param {[number, number]} point1 one 2D point, the point that the line(s) pass through
 * @param {[number, number]} point2 one 2D point, the point that is being brought onto the line
 * @returns {UniqueLine[]}
 */
export const validNormalAxiom5 = (graph, line, point1, point2) => {
	const solutions = normalAxiom5(line, point1, point2);
	const isValid = validateAxiom5(
		graph,
		solutions.map(uniqueLineToVecLine),
		uniqueLineToVecLine(line),
		point1,
		point2,
	);
	return solutions.filter((_, i) => isValid[i]);
};

/**
 * @param {FOLD} graph a FOLD graph, folded or crease pattern
 * @param {VecLine2} line one 2D line in {vector, origin} form
 * @param {[number, number]} point1 one 2D point, the point that the line(s) pass through
 * @param {[number, number]} point2 one 2D point, the point that is being brought onto the line
 * @returns {VecLine2[]}
 */
export const validAxiom5 = (graph, line, point1, point2) => {
	const solutions = axiom5(line, point1, point2);
	const isValid = validateAxiom5(graph, solutions, line, point1, point2);
	return solutions.filter((_, i) => isValid[i]);
};

/**
 * @param {FOLD} graph a FOLD graph, folded or crease pattern
 * @param {UniqueLine} line1 one 2D line in {normal, distance} form
 * @param {UniqueLine} line2 one 2D line in {normal, distance} form
 * @param {[number, number]} point1 the point to bring to the first line
 * @param {[number, number]} point2 the point to bring to the second line
 * @returns {UniqueLine[]}
 */
export const validNormalAxiom6 = (graph, line1, line2, point1, point2) => {
	const solutions = normalAxiom6(line1, line2, point1, point2);
	const isValid = validateAxiom6(
		graph,
		solutions.map(uniqueLineToVecLine),
		uniqueLineToVecLine(line1),
		uniqueLineToVecLine(line2),
		point1,
		point2,
	);
	return solutions.filter((_, i) => isValid[i]);
};

/**
 * @param {FOLD} graph a FOLD graph, folded or crease pattern
 * @param {VecLine2} line1 one 2D line in {vector, origin} form
 * @param {VecLine2} line2 one 2D line in {vector, origin} form
 * @param {[number, number]} point1 the point to bring to the first line
 * @param {[number, number]} point2 the point to bring to the second line
 * @returns {VecLine2[]}
 */
export const validAxiom6 = (graph, line1, line2, point1, point2) => {
	const solutions = axiom6(line1, line2, point1, point2);
	const isValid = validateAxiom6(graph, solutions, line1, line2, point1, point2);
	return solutions.filter((_, i) => isValid[i]);
};

/**
 * @param {FOLD} graph a FOLD graph, folded or crease pattern
 * @param {UniqueLine} line1 one 2D line in {normal, distance} form,
 * the line the point will be brought onto.
 * @param {UniqueLine} line2 one 2D line in {normal, distance} form,
 * the line which the perpendicular will be based off.
 * @param {[number, number]} point the point to bring onto the line
 * @returns {UniqueLine[]}
 */
export const validNormalAxiom7 = (graph, line1, line2, point) => {
	const solutions = normalAxiom7(line1, line2, point);
	const isValid = validateAxiom7(
		graph,
		solutions.map(uniqueLineToVecLine),
		uniqueLineToVecLine(line1),
		uniqueLineToVecLine(line2),
		point,
	);
	return solutions.filter((_, i) => isValid[i]);
};

/**
 * @param {FOLD} graph a FOLD graph, folded or crease pattern
 * @param {VecLine2} line1 one 2D line in {vector, origin} form,
 * the line the point will be brought onto.
 * @param {VecLine2} line2 one 2D line in {vector, origin} form,
 * the line which the perpendicular will be based off.
 * @param {[number, number]} point the point to bring onto the line
 * @returns {VecLine2[]}
 */
export const validAxiom7 = (graph, line1, line2, point) => {
	const solutions = axiom7(line1, line2, point);
	const isValid = validateAxiom7(graph, solutions, line1, line2, point);
	return solutions.filter((_, i) => isValid[i]);
};
