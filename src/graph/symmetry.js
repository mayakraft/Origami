/**
 * Rabbit Ear (c) Kraft
 */
import { EPSILON } from "../math/constant.js";
import { vecLineToUniqueLine } from "../math/convert.js";
import { flip2, resize2 } from "../math/vector.js";
import { multiplyMatrix2Line2, makeMatrix2Reflect } from "../math/matrix2.js";
import { clusterScalars, clusterParallelVectors } from "../general/cluster.js";
import { getEdgesLine } from "./edges/lines.js";

/**
 * @description Convert a normal-distance line so that the distance
 * is always positive, and the normal is now possible to point anywhere.
 * @param {UniqueLine} line a line in normal-distance parameterization
 * @returns {UniqueLine} a line in normal-distance parameterization
 */
const fixLineDirection = ({ normal, distance }) =>
	distance < 0 ? { normal: flip2(normal), distance: -distance } : { normal, distance };

/**
 * @description Discover the lines of symmetry in a 2D FOLD graph.
 * All possible lines will be returned and sorted to put the best candidate
 * for a symmtry line first, with an error value, where 0 is perfect symmetry.
 * This searches by checking the edges in the graph to find a line,
 * if an edge doesn't exist along the line of symmetry, this will fail.
 * @todo we need a way to detect a symmetry line where no edge lies collinear.
 * One approach might be to run Axiom 3 between all pairs of boundary lines
 * (not boundary edges, lines which have an edge that is boundary to cut down),
 * This would solve the issue in all cases that I can imagine.
 * @param {FOLD} graph a FOLD object with 2D vertices
 * @returns {{ line: VecLine2, error: number }[]} array of symmetry lines
 */
export const findSymmetryLines = (graph, epsilon = EPSILON) => {
	// get a list of lines that cover all edges of the graph
	/** @type {VecLine2[]} */
	const lines = getEdgesLine(graph, epsilon).lines.map(({ vector, origin }) => ({
		vector: resize2(vector),
		origin: resize2(origin),
	}));

	// convert the lines into normal-distance parameterization,
	// where the distance value is always positive. this will be used when
	// we create reflections and need to compare and cluster similar lines
	const uniqueLines = lines.map(vecLineToUniqueLine).map(fixLineDirection);

	// using reflection matrices, for every line, perform a reflection across
	// this line for every other line in the list. every line will get reflected
	// N-1 times. this is quite an expensive operation.
	const linesMatrices = lines.map(({ vector, origin }) =>
		makeMatrix2Reflect(vector, origin),
	);
	const reflectionsLines = linesMatrices.map((matrix) =>
		lines.map((line) => multiplyMatrix2Line2(matrix, line)),
	);

	// convert the reflected lines into normal-distance parameterization, and
	// for every reflection group, superimpose (concat) our original list of
	// lines that cover the non-transformed set of edges.
	const reflectionsUniqueLines = reflectionsLines
		.map((group) =>
			group.map((line) =>
				line.vector[0] < 0 ? { vector: flip2(line.vector), origin: line.origin } : line,
			),
		)
		.map((group) => group.map(vecLineToUniqueLine).map(fixLineDirection))
		.map((group) => group.concat(uniqueLines));

	// for every reflection set, we now also have in the set the original lines.
	// being as resourceful as possible, compare all lines with each other and
	// group similar lines together, resulting in clusters of 1 (no match) or 2. (i think)
	// First, cluster lines by similar distance from origin.
	const groupsClusters = reflectionsUniqueLines.map((group) =>
		clusterScalars(group.map((el) => el.distance)),
	);

	// Second, within each cluster, cluster again by similar (parallel) vectors.
	// this creates a cluster where the indices are the indices of elements
	// according to the first cluster variable's arrays, not the original data.
	const groupsClusterClustersUnindexed = groupsClusters.map((clusters, g) =>
		clusters
			.map((cluster) => cluster.map((i) => reflectionsUniqueLines[g][i].normal))
			.map((cluster) => clusterParallelVectors(cluster, epsilon)),
	);

	// fix the mismatch between indices. for every cluster cluster, pass in
	// the index from the cluster cluster into the first cluster variable
	// to get out the index which now relates to the original input set.
	// this now contains, for every reflection line, all clusters of lines and
	// their reflection lines, so, the reflection with the smaller number of
	// clusters should be the best candidate.
	const groupsClusterClusters = groupsClusterClustersUnindexed.map((group, g) =>
		group.flatMap((clusters, c) =>
			clusters.map((cluster) => cluster.map((index) => groupsClusters[g][c][index])),
		),
	);

	// create some kind of error heuristic, for each reflection group.
	// todo: this could be better thought out.
	// currently it is, for every reflection line, the number of clusters
	// containing only one index (meaning there was no match) divided by
	// the total number of lines that were included (reflectionsUniqueLines),
	// so that a 0 means all edges are reflections, and 1 means all edges
	// have no matching reflection line.
	// const groupsError = groupsClusterClusters
	// 	.map(group => (group.length - lines.length) / lines.length);

	const groupsError = groupsClusterClusters
		.map((group) => group.filter((clusters) => clusters.length < 2))
		.map((noMatchList, i) => noMatchList.length / reflectionsUniqueLines[i].length);

	// return the data in sorted order, with the best matches for a
	// reflection line in the beginning of the list.
	return groupsError
		.map((error, i) => ({ error, i }))
		.map((el) => ({ line: lines[el.i], error: el.error }))
		.sort((a, b) => a.error - b.error);
};

/**
 * @description This method calls findSymmetryLines() and returns the
 * first value only. Use this if you are confident.
 * This searches by checking the edges in the graph to find a line,
 * if an edge doesn't exist along the line of symmetry, this will fail.
 * @param {FOLD} graph a FOLD object with 2D vertices
 * @returns {VecLine2} symmetry lines
 */
export const findSymmetryLine = (graph, epsilon = EPSILON) =>
	(findSymmetryLines(graph, epsilon)[0] || {}).line;

// const bucketVertices = ({ vertices_coords }) => {
// 	const size = boundingBox({ vertices_coords }).span;
// 	const bucketID = point => point
// 		.map((p, i) => Math.floor((p / size[i]) * 100));
// 	const buckets = [];
// 	vertices_coords
// 		.map(coord => bucketID(coord))
// 		.forEach((id, i) => {
// 			// get a pointer to the inner-most array inside "buckets"
// 			let bucket = buckets;
// 			id.forEach(index => {
// 				if (!bucket[index]) { bucket[index] = []; }
// 				bucket = bucket[index];
// 			});
// 			bucket.push(i);
// 		});
// 	return buckets;
// };
//
// export const findSymmetryLines = (graph, epsilon = EPSILON) => {
// 	const { lines, edges_line } = getEdgesLine(graph, epsilon);
// 	const linesMatrices = lines
// 		.map(({ vector, origin }) => makeMatrix2Reflect(vector, origin));
// 	const linesCoordsSide = lines
// 		.map(line => graph.vertices_coords
// 			.map(coord => cross2(subtract2(coord, line.origin), line.vector) < 0));
// 	// for each line, a copy of the vertices_coords only on one side of the line
// 	const linesReflections = lines
// 		.map((_, i) => graph.vertices_coords
// 			.map((coord, j) => (linesCoordsSide[i][j]
// 				? coord
// 				: multiplyMatrix2Vector2(linesMatrices[i], coord))));
// 	const linesReflBuckets = linesReflections
// 		.map((coords, i) => coords
// 			.filter(point => !overlapLinePoint(lines[i], point)))
// 		.map(vertices_coords => bucketVertices({ vertices_coords }));
// 	const lengths = linesReflBuckets
// 		.map(group => group.flatMap(buckets => buckets.map(bucket => bucket.length)))
// 		.map(group => group.map(len => len % 2));
// 	// values between 0 and 1. lower is better.
// 	// 0 means every vertex aligns with another after reflection
// 	const groupRating = lengths
// 		.map(group => (group.length === 0 ? Infinity : group.reduce((a, b) => a + b, 0)))
// 		.map((sum, i) => sum / linesReflections[i].length)
// 		.map(n => (Number.isNaN(n) ? 1 : n));
// 	const validLines = groupRating
// 		.map((rating, i) => ({ rating, i }))
// 		.filter(el => el.rating < 0.8)
// 		.sort((a, b) => a.rating - b.rating)
// 		.map(el => el.i);
// 	// console.log("linesReflBuckets", linesReflBuckets);
// 	// console.log("lengths", lengths);
// 	// console.log("groupRating", groupRating);
// 	// console.log("validLines", validLines);
// 	return validLines.map(i => lines[i]);
// };
