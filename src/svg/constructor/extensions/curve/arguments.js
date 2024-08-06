/* SVG (c) Kraft */
import makeCoordinates from "../../../arguments/makeCoordinates.js";
import makeCurvePath from "./makeCurvePath.js";

/**
 * Rabbit Ear (c) Kraft
 */

const curveArguments = (...args) => [makeCurvePath(makeCoordinates(...args.flat()))];

export { curveArguments as default };
