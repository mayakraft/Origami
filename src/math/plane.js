/**
 * Rabbit Ear (c) Kraft
 */
import { normalize3, dot3, scale3, subtract3, resize3 } from "./vector.js";

/**
 * @description Project a point onto a plane in 3D.
 * @param {[number, number] | [number, number, number]} point a point as an array of numbers
 * @param {[number, number, number]} [vector=[1, 0, 0]] a vector that defines a plane's normal
 * @param {[number, number, number]} [origin=[0, 0, 0]] a point that the plane passes through
 * @returns {[number, number, number]} the transformed point
 */
export const projectPointOnPlane = (point, vector = [1, 0, 0], origin = [0, 0, 0]) => {
	const point3 = resize3(point);
	const originToPoint = subtract3(point3, resize3(origin));

	// ensure the plane's normal is normalized for the upcoming dot product
	const normalized = normalize3(resize3(vector));

	// this will be the magnitude of the projection of originToPoint
	// onto the plane's normal line
	const magnitude = dot3(normalized, originToPoint);

	// this vector is the projection ofo the point onto the plane's normal line
	// subtract this vector from the point to move the point onto the plane
	const planeToPoint = scale3(normalized, magnitude);
	return subtract3(point3, planeToPoint);
};
