/* Math (c) Kraft, MIT License */
/**
 * Math (c) Kraft
 */
/**
 * @description this epsilon is used throughout the library
 * @constant {number}
 * @default
 * @linkcode Math ./src/general/constants.js 6
 */
const EPSILON = 1e-6;
/**
 * @description radians to degrees
 * @constant {number}
 * @default
 * @linkcode Math ./src/general/constants.js 11
 */
const R2D = 180 / Math.PI;
/**
 * @description degrees to radians
 * @constant {number}
 * @default
 * @linkcode Math ./src/general/constants.js 16
 */
const D2R = Math.PI / 180;
/**
 * @description pi x 2
 * @constant {number}
 * @default
 * @linkcode Math ./src/general/constants.js 21
 */
const TWO_PI = Math.PI * 2;

export { D2R, EPSILON, R2D, TWO_PI };