/**
 * Rabbit Ear (c) Kraft
 */
import { EPSILON } from "../math/constant.js";
import { cross2, subtract2 } from "../math/vector.js";
import { clone } from "../general/clone.js";
import { invertArrayToFlatMap, invertFlatToArrayMap } from "./maps.js";
import { subgraphWithFaces } from "./subgraph.js";
import { connectedComponents } from "./connectedComponents.js";
import { makeFacesEdgesFromVertices } from "./make/facesEdges.js";
import { makeFacesFacesFromEdges } from "./make/facesFaces.js";
import { makeFacesCenter2DQuick } from "./make/faces.js";
import { simpleFoldLine } from "./fold/simpleFold.js";

/**
 * @description Get a list of separatable flaps in a folded origami model
 * by specifying a dividing line. The return value is two sets, one for
 * either side of the line, each set contains a list of connected sets of
 * faces, inside each inner array are all faces in a separatable flap.
 * @param {FOLD} graph a FOLD object with vertices in crease pattern form
 * @param {VecLine2} line
 * @param {[number, number][]} [vertices_coordsFolded] flat vertices only.
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {[ number[][], number[][] ]} left and right sides, each side
 * contains a list of lists of faces, groups of connected sets of faces (flaps).
 */
export const getFlaps = (
	{ vertices_coords, edges_vertices, faces_vertices },
	line,
	vertices_coordsFolded = undefined,
	epsilon = EPSILON,
) => {
	const graph = clone({ vertices_coords, edges_vertices, faces_vertices });
	const {
		vertices,
		edges: { collinear },
		faces: { map },
	} = simpleFoldLine(graph, line, { assignment: "F", vertices_coordsFolded }, epsilon);
	const backmap = invertArrayToFlatMap(map);

	const folded = { ...graph, vertices_coords: vertices.folded };

	// we need to separate faces_faces where two faces in a pair both lie
	// on the same side of the fold line, and are joined along an edge collinear
	// to the fold line. faces_faces will join them, but, we want to consider
	// these two to be separated, at least along this edge.
	// this can be done by simply removing this edge from this copy of the graph
	// before building the faces_faces array.
	collinear.forEach((edge) => delete graph.edges_vertices[edge]);

	// this copy of faces_edges will create undefineds, but filter them out
	// do not use this faces_edges outside of this context.
	const faces_edges = makeFacesEdgesFromVertices(graph).map((edges) =>
		edges.filter((a) => a !== undefined),
	);

	// this copy of faces_faces does not include pairs of faces which are joined
	// by an edge that lies collinear along the fold line.
	const faces_faces = makeFacesFacesFromEdges({ faces_edges });

	const faces_center = makeFacesCenter2DQuick(folded);
	const faces_side = faces_center
		.map((point) => subtract2(point, line.origin))
		.map((vector) => cross2(vector, line.vector))
		.map(Math.sign)
		.map((s) => (s + 1) / 2); // convert to 0, 1
	const sidesFaces = invertFlatToArrayMap(faces_side);
	// two subgraphs, each containing only the faces from either side of the line
	const sidesGraphs = sidesFaces.map((faces) =>
		subgraphWithFaces({ faces_faces }, faces),
	);

	// convert each side into connected components (this first comes in as an
	// inverted result, faces_set, convert it to sets_faces)
	const sidesConnectedFaces = sidesGraphs
		.map(({ faces_faces }) => connectedComponents(faces_faces))
		.map(invertFlatToArrayMap);

	const [sideA, sideB] = sidesConnectedFaces.map((connectedFaces) =>
		connectedFaces.map((faces) => faces.map((face) => backmap[face])),
	);
	return [sideA, sideB];
};
