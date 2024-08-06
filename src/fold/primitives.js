/**
 * Rabbit Ear (c) Kraft
 */
import { makePolygonCircumradius } from "../math/polygon.js";
import { populate } from "../graph/populate.js";

/**
 * @description Create a square or rectangle vertices_coords,
 * counter-clockwise order.
 * @param {number} w the width of the rectangle
 * @param {number} h the height of the rectangle
 * @returns {[number, number][]} a list of 2D points
 */
const makeRectCoords = (w, h) => [
	[0, 0],
	[w, 0],
	[w, h],
	[0, h],
];

/**
 * @description Given an already initialized vertices_coords array,
 * create a fully-populated graph that sets these vertices to be
 * the closed boundary of a polygon.
 * @param {[number, number][]} vertices_coords
 * @returns {FOLD} graph a FOLD object with the vertices_coords
 * as counter-clockwise consecutive points in the boundary forming one face.
 */
const makeGraphWithBoundaryCoords = (vertices_coords) => ({
	vertices_coords,
	edges_vertices: vertices_coords.map((_, i, arr) => [i, (i + 1) % arr.length]),
	edges_assignment: Array(vertices_coords.length).fill("B"),
	faces_vertices: [vertices_coords.map((_, i) => i)],
	faces_edges: [vertices_coords.map((_, i) => i)],
});

/**
 * @description Create a new FOLD object which contains one square face,
 * including vertices and boundary edges.
 * @param {number} [scale=1] the length of the sides.
 * @returns {FOLD} a FOLD object
 */
export const square = (scale = 1) =>
	populate(makeGraphWithBoundaryCoords(makeRectCoords(scale, scale)));

/**
 * @description Create a new FOLD object which contains one rectangular face,
 * including vertices and boundary edges.
 * @param {number} [width=1] the width of the rectangle
 * @param {number} [height=1] the height of the rectangle
 * @returns {FOLD} a FOLD object
 */
export const rectangle = (width = 1, height = 1) =>
	populate(makeGraphWithBoundaryCoords(makeRectCoords(width, height)));

/**
 * @description Create a new FOLD object with a regular-polygon shaped boundary.
 * @param {number} [sides=3] the number of sides to the polygon
 * @param {number} [circumradius=1] the circumradius of the polygon (the
 * distance from the center to any vertex)
 * @returns {FOLD} a FOLD object
 */
export const polygon = (sides = 3, circumradius = 1) =>
	populate(makeGraphWithBoundaryCoords(makePolygonCircumradius(sides, circumradius)));

/**
 * @description Create a new FOLD object that approximates a circle
 * @param {number} [radius=1] the radius of the circle
 * @param {number} [sides=128] the number of edges along the circle
 * @returns {FOLD} a FOLD object
 */
export const circle = (radius = 1, sides = 128) => polygon(sides, radius);
