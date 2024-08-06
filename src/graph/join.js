/**
 * Rabbit Ear (c) Kraft
 */
import { count } from "./count.js";
import { clone } from "../general/clone.js";
import { remapKey, invertFlatToArrayMap } from "./maps.js";
import { VEF, filterKeysWithPrefix, getDimensionQuick } from "../fold/spec.js";

/**
 * @description Join two graphs into one. The result will be written into
 * the first parameter, the "target". All source components will be
 * re-indexed and pushed to the end of the component arrays in the target.
 * No geometric operations will occur, no testing for duplicate vertices,
 * The source components inside of the result will be disjoint from
 * the original contents in the target.
 * @param {FOLD} target a fold graph, will be modified in place
 * to become the union of the two graphs.
 * @param {FOLD} source the graph to be merged into the target.
 * @return {object} an object which describes which indices came
 * from which graph. The object has keys "vertices", "edges", and "faces",
 * each with a value of type {number[][]}, with only two top level
 * arrays, 0 and 1, where 0 is the "target" graph and 1 is the "source",
 * and the contents of the inner array are the indices of the component
 * in the final union graph.
 */
export const join = (target, source) => {
	// if vertices are 2D and 3D (mismatch), we have to resize
	// all vertices up to 3D.
	const sourceDimension = getDimensionQuick(source);
	const targetDimension = getDimensionQuick(target);
	const sourceKeyArrays = {};
	VEF.forEach((key) => {
		const arrayName = filterKeysWithPrefix(source, key).shift();
		sourceKeyArrays[key] = arrayName !== undefined ? source[arrayName] : [];
	});
	const keyCount = {};
	VEF.forEach((key) => {
		keyCount[key] = count(target, key);
	});
	const indexMaps = { vertices: [], edges: [], faces: [] };
	VEF.forEach((key) =>
		sourceKeyArrays[key].forEach((_, i) => {
			indexMaps[key][i] = keyCount[key]++;
		}),
	);
	const sourceClone = clone(source);
	VEF.forEach((key) => remapKey(sourceClone, key, indexMaps[key]));
	Object.keys(sourceClone)
		.filter((key) => sourceClone[key].constructor === Array)
		.filter((key) => !(key in target))
		// eslint-disable-next-line no-param-reassign
		.forEach((key) => {
			target[key] = [];
		});
	Object.keys(sourceClone)
		.filter((key) => sourceClone[key].constructor === Array)
		.forEach((key) =>
			sourceClone[key]
				// eslint-disable-next-line no-param-reassign
				.forEach((v, i) => {
					target[key][i] = v;
				}),
		);
	const summary = {};
	const targetKeyArrays = {};
	VEF.forEach((key) => {
		const arrayName = filterKeysWithPrefix(target, key).shift();
		targetKeyArrays[key] = arrayName !== undefined ? target[arrayName] : [];
	});
	VEF.forEach((key) => {
		const map = targetKeyArrays[key].map(() => 0);
		indexMaps[key].forEach((v) => {
			map[v] = 1;
		});
		summary[key] = invertFlatToArrayMap(map);
	});
	const target2DVertices =
		sourceDimension !== targetDimension
			? (target.vertices_coords || [])
					.map((coords, i) => (coords.length === 2 ? i : undefined))
					.filter((a) => a !== undefined)
			: [];
	// eslint-disable-next-line no-param-reassign
	target2DVertices.forEach((v) => {
		target.vertices_coords[v][2] = 0;
	});
	return summary;
};

/**
 * @description Join two planar graphs, creating new vertices, edges, faces.
 */
// const joinPlanarGraphs = (...graphs) => {
// export const joinPlanarGraphs = (graph) => {

// };

/**
 *
 */
// const makeVerticesMapAndConsiderDuplicates = (target, source, epsilon = EPSILON) => {
// 	let index = target.vertices_coords.length;
// 	return source.vertices_coords
// 		.map(vertex => target.vertices_coords
// 			.map(v => distance(v, vertex) < epsilon)
// 			.map((onVertex, i) => (onVertex ? i : undefined))
// 			.filter(a => a !== undefined)
// 			.shift())
// 		.map(el => (el === undefined ? index++ : el));
// };
/**
 *
 */
// const getEdgesDuplicateFromSourceInTarget = (target, source) => {
// 	const source_duplicates = {};
// 	const target_map = {};
// 	for (let i = 0; i < target.edges_vertices.length; i += 1) {
// 		// we need to store both, but only need to test one
// 		target_map[`${target.edges_vertices[i][0]} ${target.edges_vertices[i][1]}`] = i;
// 		target_map[`${target.edges_vertices[i][1]} ${target.edges_vertices[i][0]}`] = i;
// 	}
// 	for (let i = 0; i < source.edges_vertices.length; i += 1) {
// 		const index = target_map[`${source.edges_vertices[i][0]} ${source.edges_vertices[i][1]}`];
// 		if (index !== undefined) {
// 			source_duplicates[i] = index;
// 		}
// 	}
// 	return source_duplicates;
// };

/**
 * @description updateSuffixes
 * @param {object} FOLD graph
 * @param {string[]} array of strings like "vertices_edges"
 * @param {string[]} array of any combination of "vertices", "edges", or "faces"
 * @param {object} object with keys VEF each with an array of index maps
 */
// const updateSuffixes = (source, suffixes, keys, maps) => keys
// 	.forEach(geom => suffixes[geom]
// 		.forEach(key => source[key]
// 			.forEach((arr, i) => arr
// 				.forEach((el, j) => { source[key][i][j] = maps[geom][el]; }))));

/**
 * @description join graphs
 */
// export const joinGraphs = (target, source, epsilon = EPSILON) => {
// 	// these all relate to the source, not target
// 	const prefixes = {};
// 	const suffixes = {};
// 	const maps = {};
// 	const dimensions = [target, source]
// 		.map(g => g.vertices_coords)
// 		.map(coords => (coords && coords.length ? coords[0].length : 0))
// 		.reduce((a, b) => Math.max(a, b));
// 	target.vertices_coords = target.vertices_coords
// 		.map(coord => resize(dimensions, coord));
// 	// gather info
// 	VEF.forEach(key => {
// 		prefixes[key] = filterKeysWithPrefix(source, key);
// 		suffixes[key] = filterKeysWithSuffix(source, key);
// 	});
// 	// if source keys don't exist in the target, create empty arrays
// 	VEF.forEach(geom => prefixes[geom].filter(key => !target[key]).forEach(key => {
// 		target[key] = [];
// 	}));
// 	// vertex map
// 	maps.vertices = makeVerticesMapAndConsiderDuplicates(target, source, epsilon);
// 	// correct indices in all vertex suffixes, like "faces_vertices", "edges_vertices"
// 	updateSuffixes(source, suffixes, ["vertices"], maps);
// 	// edge map
// 	const target_edges_count = count.edges(target);
// 	maps.edges = Array.from(Array(count.edges(source)))
// 		.map((_, i) => target_edges_count + i);
// 	const edge_dups = getEdgesDuplicateFromSourceInTarget(target, source);
// 	Object.keys(edge_dups).forEach(i => { maps.edges[i] = edge_dups[i]; });
// 	// faces map
// 	const target_faces_count = count.faces(target);
// 	maps.faces = Array.from(Array(count.faces(source)))
// 		.map((_, i) => target_faces_count + i);
// 	// todo find duplicate faces, correct map
// 	// correct indices in all edges and faces suffixes
// 	updateSuffixes(source, suffixes, ["edges", "faces"], maps);
// 	// copy all geometry arrays from source to target
// 	VEF.forEach(geom => prefixes[geom].forEach(key => source[key].forEach((el, i) => {
// 		const new_index = maps[geom][i];
// 		target[key][new_index] = el;
// 	})));
// 	return maps;
// };
