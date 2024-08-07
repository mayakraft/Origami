/**
 * Rabbit Ear (c) Kraft
 */
import { resize3 } from "../math/vector.js";

/**
 * @description if they exist, get any title, author, or description
 * metadata, convert it into a python-style comment (with a #) and
 * join all of them together as one string.
 * @param {FOLD} graph a FOLD object
 * @returns {string} a string of comments containing metadata
 */
const getTitleAuthorDescription = (graph) =>
	[
		"file_title",
		"file_author",
		"file_description",
		"frame_title",
		"frame_author",
		"frame_description",
	]
		.filter((key) => graph[key])
		.map((key) => `# ${key.split("_")[1]}: ${graph[key]}`)
		.join("\n");

// todo:
// should we add
// param {number} frame_num the frame number inside the FOLD object to be
//   converted, if frames exist, if not this is ignored.

/**
 * @description Convert a FOLD object into an OBJ file. For FOLD objects
 * with many frames, this will only work on one frame at a time.
 * @param {FOLD|string} file a FOLD object or a string encoding of a FOLD file
 * @returns {string} an OBJ representation of the FOLD object
 * @example
 * // from FOLD file
 * const foldfile = fs.readFileSync("./crane.fold", "utf-8");
 * const objFile = foldToObj(foldFile);
 * fs.writeFileSync("./crane.obj", objFile);
 * @example
 * // from FOLD object
 * const birdBase = ear.graph.bird();
 * const objFile = foldToObj(birdBase);
 * fs.writeFileSync("./bird-base.obj", objFile);
 * @example
 * // with triangulated faces
 * const { result } = ear.graph.triangulate(fold);
 * const objFile = foldToObj(result);
 */
export const foldToObj = (file) => {
	/** @type {FOLD} */
	const graph = typeof file === "string" ? JSON.parse(file) : file;

	// the comment section that will sit at the beginning of the file
	const metadata = getTitleAuthorDescription(graph);

	// a list of vertices in the form of "v _ _ _" where _ are floats
	const vertices = (graph.vertices_coords || [])
		.map(resize3)
		.map((coords) => coords.join(" "))
		.map((str) => `v ${str}`)
		.join("\n");

	// a list of faces in the form of "f _ _ _" where _ are integers
	// obj vertex indices begin from 1 not 0
	const faces = (graph.faces_vertices || [])
		.map((verts) => verts.map((v) => v + 1).join(" "))
		.map((str) => `f ${str}`)
		.join("\n");

	// join everything together, adding a final newline at the file's end
	const fileString = [metadata, vertices, faces].filter((s) => s !== "").join("\n");
	return `${fileString}\n`;
};
