export default {
	planarize: "graph could not planarize",
	manifold: "valid manifold required",
	graphCycle: "cycle not allowed",
	planarBoundary: "planar boundary detection error, bad graph",
	circularEdge: "circular edges not allowed",
	replaceModifyParam: "replace() index < value. indices parameter modified",
	replaceUndefined: "replace() generated undefined",
	flatFoldAngles:
		"foldAngles cannot be determined from flat-folded faces without an assignment",
	noWebGL: "WebGl not Supported",
	convexFace: "only convex faces are supported",
	window:
		"window not set; if using node/deno include package @xmldom/xmldom and set ear.window = xmldom",
	nonConvexTriangulation: "non-convex triangulation requires vertices_coords",
	backendStylesheet:
		"svgToFold found <style> in <svg>. rendering will be incomplete unless run in a major browser.",
	noLayerSolution: "layer solver, no solution, or conflict with existing faceOrders",
	noLayerSolutionFaceOrders: "layer solver conflict with existing faceOrders",
};
