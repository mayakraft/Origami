// /**
//  * Rabbit Ear (c) Kraft
//  */
// import {
// 	axiom1,
// 	axiom2,
// 	axiom3,
// 	axiom4,
// 	axiom5,
// 	axiom6,
// 	axiom7,
// 	normalAxiom1,
// 	normalAxiom2,
// 	normalAxiom3,
// 	normalAxiom4,
// 	normalAxiom5,
// 	normalAxiom6,
// 	normalAxiom7,
// } from "./axioms.js";
// import {
// 	validateAxiom1,
// 	validateAxiom2,
// 	validateAxiom3,
// 	validateAxiom4,
// 	validateAxiom5,
// 	validateAxiom6,
// 	validateAxiom7,
// } from "./validate.js";
// import {
// 	uniqueLineToVecLine,
// } from "../math/convert.js";

// /**
//  * @param {[number, number][]} polygon
//  * @param {[number, number]} point1
//  * @param {[number, number]} point2
//  * @returns {UniqueLine[]}
//  */
// export const normalAxiom1InPolygon = (polygon, point1, point2) => {
// 	const isValid = validateAxiom1(polygon, point1, point2);
// 	return normalAxiom1(point1, point2).filter((_, i) => isValid[i]);
// };

// /**
//  * @param {[number, number][]} polygon
//  * @param {[number, number]} point1
//  * @param {[number, number]} point2
//  * @returns {VecLine2[]}
//  */
// export const axiom1InPolygon = (polygon, point1, point2) => {
// 	const isValid = validateAxiom1(polygon, point1, point2);
// 	return axiom1(point1, point2).filter((_, i) => isValid[i]);
// };

// /**
//  * @param {[number, number][]} polygon
//  * @param {[number, number]} point1
//  * @param {[number, number]} point2
//  * @returns {UniqueLine[]}
//  */
// export const normalAxiom2InPolygon = (polygon, point1, point2) => {
// 	const isValid = validateAxiom2(polygon, point1, point2);
// 	return normalAxiom2(point1, point2).filter((_, i) => isValid[i]);
// };

// /**
//  * @param {[number, number][]} polygon
//  * @param {[number, number]} point1
//  * @param {[number, number]} point2
//  * @returns {VecLine2[]}
//  */
// export const axiom2InPolygon = (polygon, point1, point2) => {
// 	const isValid = validateAxiom2(polygon, point1, point2);
// 	return axiom2(point1, point2).filter((_, i) => isValid[i]);
// };

// /**
//  * @param {[number, number][]} polygon
//  * @param {UniqueLine} line1 one 2D line in {normal, distance} form
//  * @param {UniqueLine} line2 one 2D line in {normal, distance} form
//  * @returns {UniqueLine[]}
//  */
// export const normalAxiom3InPolygon = (polygon, line1, line2) => {
// 	const solutions = normalAxiom3(line1, line2);
// 	const isValid = validateAxiom3(
// 		polygon,
// 		solutions.map(uniqueLineToVecLine),
// 		uniqueLineToVecLine(line1),
// 		uniqueLineToVecLine(line2),
// 	);
// 	return solutions.filter((_, i) => isValid[i]);
// };

// /**
//  * @param {[number, number][]} polygon
//  * @param {VecLine2} line1 one 2D line in {vector, origin} form
//  * @param {VecLine2} line2 one 2D line in {vector, origin} form
//  * @returns {VecLine2[]}
//  */
// export const axiom3InPolygon = (polygon, line1, line2) => {
// 	const solutions = axiom3(line1, line2);
// 	const isValid = validateAxiom3(polygon, solutions, line1, line2);
// 	return solutions.filter((_, i) => isValid[i]);
// };

// /**
//  * @param {[number, number][]} polygon
//  * @param {UniqueLine} line one 2D line in {normal, distance} form
//  * @param {[number, number]} point one 2D point
//  * @returns {UniqueLine[]}
//  */
// export const normalAxiom4InPolygon = (polygon, line, point) => {
// 	const solutions = normalAxiom4(line, point);
// 	const isValid = validateAxiom4(
// 		polygon,
// 		solutions.map(uniqueLineToVecLine),
// 		uniqueLineToVecLine(line),
// 		point,
// 	);
// 	return solutions.filter((_, i) => isValid[i]);
// };

// /**
//  * @param {[number, number][]} polygon
//  * @param {VecLine2} line one 2D line in {vector, origin} form
//  * @param {[number, number]} point one 2D point
//  * @returns {VecLine2[]}
//  */
// export const axiom4InPolygon = (polygon, line, point) => {
// 	const solutions = axiom4(line, point);
// 	const isValid = validateAxiom4(polygon, solutions, line, point);
// 	return solutions.filter((_, i) => isValid[i]);
// };

// /**
//  * @param {[number, number][]} polygon
//  * @param {UniqueLine} line one 2D line in {normal, distance} form
//  * @param {[number, number]} point1 one 2D point, the point that the line(s) pass through
//  * @param {[number, number]} point2 one 2D point, the point that is being brought onto the line
//  * @returns {UniqueLine[]}
//  */
// export const normalAxiom5InPolygon = (polygon, line, point1, point2) => {
// 	const solutions = normalAxiom5(line, point1, point2);
// 	const isValid = validateAxiom5(
// 		polygon,
// 		solutions.map(uniqueLineToVecLine),
// 		uniqueLineToVecLine(line),
// 		point1,
// 		point2,
// 	);
// 	return solutions.filter((_, i) => isValid[i]);
// };

// /**
//  * @param {[number, number][]} polygon
//  * @param {VecLine2} line one 2D line in {vector, origin} form
//  * @param {[number, number]} point1 one 2D point, the point that the line(s) pass through
//  * @param {[number, number]} point2 one 2D point, the point that is being brought onto the line
//  * @returns {VecLine2[]}
//  */
// export const axiom5InPolygon = (polygon, line, point1, point2) => {
// 	const solutions = axiom5(line, point1, point2);
// 	const isValid = validateAxiom5(polygon, solutions, line, point1, point2);
// 	return solutions.filter((_, i) => isValid[i]);
// };

// /**
//  * @param {[number, number][]} polygon
//  * @param {UniqueLine} line1 one 2D line in {normal, distance} form
//  * @param {UniqueLine} line2 one 2D line in {normal, distance} form
//  * @param {[number, number]} point1 the point to bring to the first line
//  * @param {[number, number]} point2 the point to bring to the second line
//  * @returns {UniqueLine[]}
//  */
// export const normalAxiom6InPolygon = (polygon, line1, line2, point1, point2) => {
// 	const solutions = normalAxiom6(line1, line2, point1, point2);
// 	const isValid = validateAxiom6(
// 		polygon,
// 		solutions.map(uniqueLineToVecLine),
// 		uniqueLineToVecLine(line1),
// 		uniqueLineToVecLine(line2),
// 		point1,
// 		point2,
// 	);
// 	return solutions.filter((_, i) => isValid[i]);
// };

// /**
//  * @param {[number, number][]} polygon
//  * @param {VecLine2} line1 one 2D line in {vector, origin} form
//  * @param {VecLine2} line2 one 2D line in {vector, origin} form
//  * @param {[number, number]} point1 the point to bring to the first line
//  * @param {[number, number]} point2 the point to bring to the second line
//  * @returns {VecLine2[]}
//  */
// export const axiom6InPolygon = (polygon, line1, line2, point1, point2) => {
// 	const solutions = axiom6(line1, line2, point1, point2);
// 	const isValid = validateAxiom6(polygon, solutions, line1, line2, point1, point2);
// 	return solutions.filter((_, i) => isValid[i]);
// };

// /**
//  * @param {[number, number][]} polygon
//  * @param {UniqueLine} line1 one 2D line in {normal, distance} form,
//  * the line the point will be brought onto.
//  * @param {UniqueLine} line2 one 2D line in {normal, distance} form,
//  * the line which the perpendicular will be based off.
//  * @param {[number, number]} point the point to bring onto the line
//  * @returns {UniqueLine[]}
//  */
// export const normalAxiom7InPolygon = (polygon, line1, line2, point) => {
// 	const solutions = normalAxiom7(line1, line2, point);
// 	const isValid = validateAxiom7(
// 		polygon,
// 		solutions.map(uniqueLineToVecLine),
// 		uniqueLineToVecLine(line1),
// 		uniqueLineToVecLine(line2),
// 		point,
// 	);
// 	return solutions.filter((_, i) => isValid[i]);
// };

// /**
//  * @param {[number, number][]} polygon
//  * @param {VecLine2} line1 one 2D line in {vector, origin} form,
//  * the line the point will be brought onto.
//  * @param {VecLine2} line2 one 2D line in {vector, origin} form,
//  * the line which the perpendicular will be based off.
//  * @param {[number, number]} point the point to bring onto the line
//  * @returns {VecLine2[]}
//  */
// export const axiom7InPolygon = (polygon, line1, line2, point) => {
// 	const solutions = axiom7(line1, line2, point);
// 	const isValid = validateAxiom7(polygon, solutions, line1, line2, point);
// 	return solutions.filter((_, i) => isValid[i]);
// };
