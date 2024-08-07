/**
 * Rabbit Ear (c) Kraft
 */
import RabbitEarWindow from "../environment/window.js";
import { planarizeAllFaces } from "../graph/planarize/planarize.js";
import { findEpsilonInObject, invertVertical } from "./general/options.js";
import { makeEdgesFoldAngle } from "../graph/make/edgesFoldAngle.js";

// there is probably a better way of coding this using XPath
// although that requires an additional dependency

/**
 * @param {string} input a DOM string
 * @param {string} [mimeType="text/xml"]
 * @returns {Document}
 */
const xmlStringToDocument = (input, mimeType = "text/xml") =>
	new (RabbitEarWindow().DOMParser)().parseFromString(input, mimeType);

/**
 * @description given a parsed xml object, get the branch which
 * contains a node which has some node containing the value specified.
 * @param {any} oripa
 * @param {string} value a value to match
 * @returns {Element} a child branch which contains this value
 */
const getContainingValue = (oripa, value) =>
	oripa == null
		? null
		: Array.from(oripa.childNodes)
				.filter((el) => el.attributes && el.attributes.length)
				.filter(
					(el) =>
						Array.from(el.attributes)
							.filter((attr) => attr.nodeValue === value)
							.shift() !== undefined,
				)
				.shift();

/**
 * @description For each ORIPA line, extract the coordinates
 * and the assignment type. Return each line as a simple
 * Javascript object. XML Entries will be missing if
 * their value is 0, this is taken care of. All values will be
 * parsed into floats.
 * @param {any} oriLineProxy
 * @returns {number[][]} array of array of numbers, each inner
 * array describes one line.
 */
const parseOriLineProxy = (oriLineProxy) =>
	Array.from(oriLineProxy.childNodes)
		.filter((line) => line.nodeName === "void")
		.filter((line) => line.childNodes)
		.map((line) => getContainingValue(line, "oripa.OriLineProxy"))
		.filter((lineData) => lineData)
		.map((lineData) =>
			["type", "x0", "x1", "y0", "y1"]
				.map((key) => getContainingValue(lineData, key))
				.map((el) => (el ? Array.from(el.childNodes) : []))
				.map((children) =>
					children
						.filter((child) => child.nodeName === "double" || child.nodeName === "int")
						.shift(),
				)
				.map((node) =>
					node && node.childNodes[0] && "data" in node.childNodes[0]
						? node.childNodes[0].data
						: "0",
				)
				.map(parseFloat),
		);

/**
 * @description For each ORIPA line, extract the coordinates
 * and the assignment type. Return each line as a simple
 * Javascript object. XML Entries will be missing if
 * their value is 0, this is taken care of. All values will be
 * parsed into floats.
 * @param {any} parsed
 * @returns {object} object
 */
const parseFileMetadata = (parsed) => {
	// this generates a list of strings looking like this
	// [
	// 	"lines", "title", "one single crease", "editorName", "Kraft",
	// 	"originalAuthorName", "traditional", "reference", "no references",
	// 	"memo", "this is a square with one diagonal crease",
	// ]
	const strings = Array.from(parsed.getElementsByTagName("string")).map((el) =>
		Array.from(el.childNodes)
			.map((ch) => ch.nodeValue)
			.filter((str) => str !== "")
			.shift(),
	);

	const titleIndex = strings.indexOf("title");
	const editorNameIndex = strings.indexOf("editorName");
	const originalAuthorNameIndex = strings.indexOf("originalAuthorName");
	const referenceIndex = strings.indexOf("reference");
	const memoIndex = strings.indexOf("memo");

	const metadata = {
		file_spec: 1.2,
		file_creator: "Rabbit Ear",
		file_classes: ["singleModel"],
		frame_classes: ["creasePattern"],
	};

	const file_authors = [];
	const file_descriptions = [];

	if (titleIndex !== -1 && strings[titleIndex + 1]) {
		metadata.file_title = strings[titleIndex + 1];
	}
	if (editorNameIndex !== -1 && strings[editorNameIndex + 1]) {
		file_authors.push(strings[editorNameIndex + 1]);
	}
	if (originalAuthorNameIndex !== -1 && strings[originalAuthorNameIndex + 1]) {
		file_authors.push(strings[originalAuthorNameIndex + 1]);
	}
	if (referenceIndex !== -1 && strings[referenceIndex + 1]) {
		file_descriptions.push(strings[referenceIndex + 1]);
	}
	if (memoIndex !== -1 && strings[memoIndex + 1]) {
		file_descriptions.push(strings[memoIndex + 1]);
	}

	if (file_authors.length) {
		metadata.file_author = file_authors.join(", ");
	}
	if (file_descriptions.length) {
		metadata.file_description = file_descriptions.join(", ");
	}

	return metadata;
};

/**
 * @description ORIPA line assignments are numbered.
 */
const opxAssignment = ["F", "B", "M", "V", "U"];

/**
 * @param {number[][]} lines
 * @returns {FOLD}
 */
const makeLineGraph = (lines) => {
	/** @type {[number, number][]} */
	const vertices_coords = lines.flatMap((line) => [
		[line[1], line[3]],
		[line[2], line[4]],
	]);
	/** @type {[number, number][]} */
	const edges_vertices = lines.map((_, i) => [i * 2, i * 2 + 1]);
	const edges_assignment = lines.map((line) => opxAssignment[line[0]]);
	const edges_foldAngle = makeEdgesFoldAngle({ edges_assignment });
	return {
		vertices_coords,
		edges_vertices,
		edges_assignment,
		edges_foldAngle,
	};
};

/**
 * @param {string} file an ORIPA file as a string
 */
export const opxEdgeGraph = (file) => {
	const parsed = xmlStringToDocument(file, "text/xml");
	const arrayOriLineProxy = Array.from(
		parsed.getElementsByClassName("oripa.OriLineProxy"),
	)
		.filter((el) => el.nodeName === "array" || el.tagName === "array")
		.shift();
	const lines = parseOriLineProxy(arrayOriLineProxy);
	return makeLineGraph(lines);
};

/**
 * @description Convert an ORIPA file into a FOLD object
 * @param {string} file an ORIPA file as a string
 * @param {number | {
 *   epsilon?: number,
 *   invertVertical?: boolean,
 * }} options an epsilon as a number, or an options object with options
 * @returns {FOLD|undefined} a FOLD representation of the ORIPA file
 * @example
 * const opxFile = fs.readFileSync("./crane.opx", "utf-8");
 * const fold = opxToFold(opxFile);
 * fs.writeFileSync("./crane.fold", JSON.stringify(fold, null, 2));
 * @example
 * // with options
 * const opxFile = fs.readFileSync("./crane.opx", "utf-8");
 * const fold = opxToFold(opxFile, { invertVertical: true, epsilon: 0.1 });
 * fs.writeFileSync("./crane.fold", JSON.stringify(fold, null, 2));
 */
export const opxToFold = (file, options) => {
	const parsed = xmlStringToDocument(file, "text/xml");

	// this will match with one container element and many line elements
	// inside of this container. get the container element only (nodeName "array")
	// this will get us the <array class="oripa.OriLineProxy" length="28">
	const arrayOriLineProxy = Array.from(
		parsed.getElementsByClassName("oripa.OriLineProxy"),
	)
		.filter((el) => el.nodeName === "array" || el.tagName === "array")
		.shift();

	const firstDataSet = Array.from(parsed.getElementsByClassName("oripa.DataSet"))
		.filter((el) => el.nodeName === "object" || el.tagName === "object")
		.shift();

	if (firstDataSet === undefined || arrayOriLineProxy === undefined) {
		return undefined;
	}

	const lines = parseOriLineProxy(arrayOriLineProxy);
	const file_metadata = parseFileMetadata(parsed);
	const graph = makeLineGraph(lines);

	if (
		options &&
		typeof options === "object" &&
		options.invertVertical &&
		graph.vertices_coords
	) {
		invertVertical(graph.vertices_coords);
	}
	// analysis on vertices_coords to find an appropriate epsilon
	const epsilon = findEpsilonInObject(graph, options);
	const planarGraph = planarizeAllFaces(graph, epsilon);

	return {
		...file_metadata,
		...planarGraph,
	};
};
