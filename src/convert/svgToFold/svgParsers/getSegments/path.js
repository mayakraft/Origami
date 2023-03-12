/**
 * Rabbit Ear (c) Kraft
 */
import { epsilonEqualVectors } from "../../../../math/general/function.js";
// get the SVG library from its binding to the root of the library
import root from "../../../../root.js";

const straightPathLines = {
	L: true, V: true, H: true, Z: true,
};

const PathToSegments = (path) => root.svg.core
	.parsePathCommandsEndpoints(path.getAttribute("d") || "")
	.filter(command => straightPathLines[command.command.toUpperCase()])
	.map(el => [el.start, el.end])
	.filter(seg => !epsilonEqualVectors(...seg))
	.map(seg => seg.flat());

export default PathToSegments;