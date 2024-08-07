/**
 * Rabbit Ear (c) Kraft
 */
import { file_spec, file_creator } from "../fold/rabbitear.js";
import { makeVerticesVerticesFromFaces } from "../graph/make/verticesVertices.js";
import { makeEdgesFacesUnsorted } from "../graph/make/edgesFaces.js";
import { makeEdgesFoldAngleFromFaces } from "../graph/make/edgesFoldAngle.js";
import { makeEdgesAssignment } from "../graph/make/edgesAssignment.js";
import { makeFacesEdgesFromVertices } from "../graph/make/facesEdges.js";

/**
 * @returns {FOLD} graph a FOLD object
 */
const newFoldFile = () => ({
	file_spec: file_spec,
	file_creator: file_creator,
	file_classes: ["singleModel"],
	frame_classes: [],
	frame_attributes: [],
	vertices_coords: [],
	faces_vertices: [],
});

/**
 * @param {FOLD} graph a FOLD object
 */
const updateMetadata = (graph) => {
	if (!graph.edges_foldAngle || !graph.edges_foldAngle.length) {
		return;
	}
	let is2D = true;
	for (let i = 0; i < graph.edges_foldAngle.length; i += 1) {
		if (
			graph.edges_foldAngle[i] !== 0 &&
			graph.edges_foldAngle[i] !== -180 &&
			graph.edges_foldAngle[i] !== 180
		) {
			is2D = false;
			break;
		}
	}
	graph.frame_classes.push(is2D ? "creasePattern" : "foldedForm");
	graph.frame_attributes.push(is2D ? "2D" : "3D");
};

/**
 * @param {any[]} list an array of any type.
 */
const pairify = (list) => list.map((val, i, arr) => [val, arr[(i + 1) % arr.length]]);

/**
 * @param {FOLD} graph a FOLD object
 */
const makeEdgesVertices = ({ faces_vertices }) => {
	const edgeExists = {};
	const edges_vertices = [];
	faces_vertices.flatMap(pairify).forEach((edge) => {
		const keys = [edge.join(" "), `${edge[1]} ${edge[0]}`];
		if (keys[0] in edgeExists || keys[1] in edgeExists) {
			return;
		}
		edges_vertices.push(edge);
		edgeExists[keys[0]] = true;
	});
	return edges_vertices;
};

/**
 * @param {string[]} face
 * @returns {number[]} face as a list of vertex indices
 */
const parseFace = (face) => face.slice(1).map((str) => parseInt(str, 10) - 1);

/**
 * @param {string[]} vertex
 * @returns {[number, number, number]}
 */
const parseVertex = (vertex) => {
	const [a, b, c] = vertex.slice(1).map((str) => parseFloat(str));
	return [a || 0, b || 0, c || 0];
};

/**
 * @description Convert an OBJ mesh file into a FOLD object. The conversion
 * will create edge definitions and give them assignments and fold angles
 * depending on the dihedral angles, or boundary edges
 * if only one face is adjacent.
 * @param {string} file a string containing the contents of an OBJ file,
 * expected to contain at least vertices and faces. All groups or object
 * separations are currently ignored, the contents are treated as one object.
 * @returns {FOLD} a FOLD representation of the OBJ file
 * @example
 * const objFile = fs.readFileSync("./stanford-bunny.obj", "utf-8");
 * const fold = objToFold(objFile);
 * fs.writeFileSync("./bunny.fold", JSON.stringify(fold, null, 2));
 */
export const objToFold = (file) => {
	const lines = file.split("\n").map((line) => line.trim().split(/\s+/));
	const graph = newFoldFile();
	const linesCharKey = lines.map((line) => line[0].toLowerCase());

	graph.vertices_coords = lines
		.filter((_, i) => linesCharKey[i] === "v")
		.map(parseVertex);
	graph.faces_vertices = lines.filter((_, i) => linesCharKey[i] === "f").map(parseFace);
	graph.edges_vertices = makeEdgesVertices(graph);
	graph.faces_edges = makeFacesEdgesFromVertices(graph);
	graph.edges_faces = makeEdgesFacesUnsorted(graph);
	graph.edges_foldAngle = makeEdgesFoldAngleFromFaces(graph);
	graph.edges_assignment = makeEdgesAssignment(graph);
	graph.vertices_vertices = makeVerticesVerticesFromFaces(graph);

	// edges_faces was built unsorted. the sorted method is slower to construct,
	// and unnecessary for our purposes. the user can build this (and the
	// other incomplete fields) if they want them.
	delete graph.edges_faces;
	updateMetadata(graph);
	return graph;
};
