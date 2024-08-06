/**
 * Rabbit Ear (c) Kraft
 */
import { EPSILON } from "../../math/constant.js";
import { epsilonEqualVectors } from "../../math/compare.js";
import { pointsToLine, pointsToLine2, pointsToLine3 } from "../../math/convert.js";
import {
	magnitude,
	subtract,
	subtract2,
	resize2,
	resize3,
	dot,
} from "../../math/vector.js";
import { clampLine, collinearLines3 } from "../../math/line.js";
import { projectPointOnPlane } from "../../math/plane.js";
import { nearestPointOnLine } from "../../math/nearest.js";
import {
	uniqueElements,
	arrayMinimumIndex,
	arrayMaximumIndex,
} from "../../general/array.js";
import {
	clusterScalars,
	clusterSortedGeneric,
	clusterParallelVectors,
} from "../../general/cluster.js";
import { radialSortVectors3 } from "../../general/sort.js";
import { getDimensionQuick } from "../../fold/spec.js";
import { connectedComponents } from "../connectedComponents.js";
import { invertArrayToFlatMap, invertFlatToArrayMap } from "../maps.js";

/**
 * @description convert an edge to a vector-origin line.
 * @param {FOLD} graph a FOLD object
 * @param {number} edge the index of the edge
 * @returns {VecLine2} a line form of the edge
 */
export const edgeToLine2 = ({ vertices_coords, edges_vertices }, edge) => {
	const [a, b] = edges_vertices[edge].map((v) => vertices_coords[v]);
	return { vector: subtract2(b, a), origin: resize2(a) };
};

/**
 * @description convert an edge to a vector-origin line.
 * @param {FOLD} graph a FOLD object
 * @param {number} edge the index of the edge
 * @returns {VecLine} a line form of the edge
 */
// export const edgeToLine = ({ vertices_coords, edges_vertices }, edge) => (
// 	pointsToLine(
// 		vertices_coords[edges_vertices[edge][0]],
// 		vertices_coords[edges_vertices[edge][1]],
// 	));

/**
 * @description convert the edges of a graph into vector-origin line form.
 * @param {FOLD} graph a FOLD object
 * @returns {VecLine[]} a line for every edge
 */
export const edgesToLines = ({ vertices_coords, edges_vertices }) =>
	edges_vertices
		.map((ev) => [vertices_coords[ev[0]], vertices_coords[ev[1]]])
		.map(([a, b]) => pointsToLine(a, b));

/**
 * @description convert an edge to a vector-origin line.
 * @param {FOLD} graph a FOLD object
 * @returns {VecLine2[]} a line form of the edge
 */
export const edgesToLines2 = ({ vertices_coords, edges_vertices }) => {
	const vertices_coords2 = vertices_coords.map(resize2);
	return edges_vertices
		.map((ev) => [vertices_coords2[ev[0]], vertices_coords2[ev[1]]])
		.map(([a, b]) => pointsToLine2(a, b));
};

/**
 * @description convert an edge to a vector-origin line.
 * @param {FOLD} graph a FOLD object
 * @returns {VecLine3[]} a line form of the edge
 */
export const edgesToLines3 = ({ vertices_coords, edges_vertices }) => {
	const vertices_coords3 = vertices_coords.map(resize3);
	return edges_vertices
		.map((ev) => [vertices_coords3[ev[0]], vertices_coords3[ev[1]]])
		.map(([a, b]) => pointsToLine3(a, b));
};

/**
 * @description Most origami models have many edges which lie along
 * the same infinite line. This method finds all lines which cover all edges,
 * returning a list of lines, and a mapping of each edge to each line.
 * @param {FOLD} graph a FOLD object, can be 2D or 3D.
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {{ lines: VecLine[], edges_line: number[] }}
 */
export const getEdgesLine = ({ vertices_coords, edges_vertices }, epsilon = EPSILON) => {
	if (!vertices_coords || !edges_vertices || !edges_vertices.length) {
		return { edges_line: [], lines: [] };
	}

	// a vector-origin line representation of every edge. we will apply
	// clustering operations to this list to group edges with similar lines.
	const edgesLine = edgesToLines3({ vertices_coords, edges_vertices });
	// const edgesLine = edgesToLines({ vertices_coords, edges_vertices });

	// this is the distance from the origin to the nearest point along the line
	// no epsilon is needed in nearestPointOnLine, because there is no clamp.
	const edgesOriginDistances = edgesLine
		.map((line) => nearestPointOnLine(line, [0, 0, 0], clampLine))
		.map((point) => magnitude(point));

	// begin clustering, we will cluster into 3 parts:
	// 1. cluster lines with similar distance-to-origin scalars.
	// 2. sub-cluster those which have parallel-vectors.
	// 3. sub-cluster those which are actually collinear, because
	//    a similar distance/vector can still be rotationally anywhere
	//    around the origin in 3D, or on opposite sides of the origin in 2D.
	// cluster edge indices based on a shared distance-to-origin
	const distanceClusters = clusterScalars(edgesOriginDistances, epsilon);

	// further subcluster the previous clusters based on whether the
	// line's vectors are parallel (these inner clusters share the same line)
	// we use a fixed epsilon here, the comparison is testing parallel-ness
	// with dot(v, u) with normalized vectors. so anything similar within
	// 1e-3 should suffice. We can't feed in the user epsilon, because an
	// epsilon of something like 5 would be meaningless here.
	const parallelDistanceClusters = distanceClusters
		.map((cluster) => cluster.map((i) => edgesLine[i].vector))
		.map((cluster) => clusterParallelVectors(cluster, 1e-3))
		.map((clusters, i) =>
			clusters.map((cluster) => cluster.map((index) => distanceClusters[i][index])),
		);

	// one final time, cluster each subcluster once more. because we only
	// measured the distance to the origin, and the vector, we could be on equal
	// but opposite sides of the origin (unless it passes through the origin).
	const collinearParallelDistanceClusters = parallelDistanceClusters.map((clusters) =>
		clusters.map((cluster) => {
			// values in "cluster" are edge indices.
			// if the cluster passes through the origin, all edges are collinear.
			if (Math.abs(edgesOriginDistances[cluster[0]]) < epsilon) {
				return [cluster];
			}

			// establish a shared vector for all lines in the cluster
			const clusterVector = edgesLine[cluster[0]].vector;

			// edges run orthogonal to the plane and will be
			// collapsed into one coplanar point
			const clusterPoints = cluster
				.map((e) => vertices_coords[edges_vertices[e][0]])
				.map((point) => projectPointOnPlane(point, clusterVector));

			// these points are all the same distance away from the origin,
			// radially sort them around the origin, using the line's vector
			// as the plane's normal.
			const sortedIndices = radialSortVectors3(clusterPoints, clusterVector);

			// values in "sortedIndices" now relate to indices of "cluster"
			// this comparison function will be used if two or more points satisfy
			// both #1 and #2 conditions, and need to be radially sorted in their plane.
			/** @param {number} i @param {number} j @returns {boolean} */
			const compareFn = (i, j) =>
				epsilonEqualVectors(clusterPoints[i], clusterPoints[j], epsilon);

			// indices are multi-layered related to indices of other arrays.
			// when all is done, this maps back to the original edge indices.
			/** @param {number[]} cl */
			const remap = (cl) => cl.map((i) => sortedIndices[i]).map((i) => cluster[i]);

			// now that the list is sorted, cluster any neighboring points
			// that are within an epsilon distance away from each other.
			const clusterResult = clusterSortedGeneric(sortedIndices, compareFn);

			// values in "clusterResult" now relate to indices of "sortedIndices"
			// one special case, since these are radially sorted, if the
			// first and last cluster are equivalent, merge them together
			if (clusterResult.length === 1) {
				return clusterResult.map(remap);
			}

			// get the first from cluster[0] and the last from cluster[n - 1]
			const firstFirst = clusterResult[0][0];
			const last = clusterResult[clusterResult.length - 1];
			const lastLast = last[last.length - 1];

			// map these back to relate to indices of "cluster".
			const endIndices = [firstFirst, lastLast].map((i) => sortedIndices[i]);

			// if two points from either end clusters are similar,
			// merge the 0 and n-1 clusters into the 0 index.
			if (compareFn(endIndices[0], endIndices[1])) {
				const lastCluster = clusterResult.pop();
				clusterResult[0] = lastCluster.concat(clusterResult[0]);
			}
			return clusterResult.map(remap);
		}),
	);

	// now we have all edges clustered according to which line they lie along.
	// here are the clusters, all edges inside of each cluster.
	const lines_edges = collinearParallelDistanceClusters.flatMap((clusterOfClusters) =>
		clusterOfClusters.flatMap((clusters) => clusters),
	);
	const edges_line = invertArrayToFlatMap(lines_edges);

	// get the most precise form of a line possible.
	// the fastest way to do this is, for every segment, build a vector
	// from the furthest two points possible.
	// so, step 1, for each line/cluster, get a list of all vertices involved.
	const lines_vertices = lines_edges
		.map((edges) => edges.flatMap((e) => edges_vertices[e]))
		.map(uniqueElements);

	// for each line/cluster, find the two vertices furthest on either end.
	// use one vector from the line, it doesn't matter which one.
	const lines_firstVector = lines_edges.map((edges) => edgesLine[edges[0]].vector);

	// project each vertex onto the line, get the dot product
	// find the minimum and maximum vertices along the line's vector.
	const lines_vertProjects = lines_vertices.map((vertices, i) =>
		vertices.map((v) => dot(vertices_coords[v], lines_firstVector[i])),
	);
	const lines_vertProjectsMin = lines_vertProjects.map(
		(projections, i) => lines_vertices[i][arrayMinimumIndex(projections)],
	);
	const lines_vertProjectsMax = lines_vertProjects.map(
		(projections, i) => lines_vertices[i][arrayMaximumIndex(projections)],
	);

	// for each line/cluster, create a vector from the furthest two vertices
	const lines_vector = lines_vertices.map((_, i) =>
		subtract(
			vertices_coords[lines_vertProjectsMax[i]],
			vertices_coords[lines_vertProjectsMin[i]],
		),
	);

	// the "line" result will have both vector and origin matching
	// in dimensions with the input graph's vertices_coords
	const lines_vectorN =
		getDimensionQuick({ vertices_coords }) === 2
			? lines_vector.map(resize2)
			: lines_vector.map(resize3);

	// for each line's origin, we want to use an existing vertex.
	const lines_origin = lines_vertProjectsMin.map((v) => vertices_coords[v]);
	const lines = lines_vectorN.map((vector, i) => ({ vector, origin: lines_origin[i] }));
	return {
		lines,
		edges_line,
	};
};

/**
 * @description edge endpoints are exclusive
 * @param {FOLD} graph a FOLD object
 * @param {number} [epsilon=1e-6] an optional epsilon
 */
// export const getOverlappingCollinearEdges = ({
// 	vertices_coords, edges_vertices,
// }, epsilon = EPSILON) => {
// 	const {
// 		lines,
// 		edges_line,
// 	} = getEdgesLine({ vertices_coords, edges_vertices }, epsilon);

// 	// we're going to project each edge onto the shared line, we can't use
// 	// each edge's vector, we have to use the edge's line's common vector.
// 	const edges_range = makeEdgesCoords({ vertices_coords, edges_vertices })
// 		.map((points, e) => points
// 			.map(point => dot(lines[edges_line[e]].vector, point)));

// 	// the invertFlatToArrayMap creates lines_edges, each a list of edge indices.
// 	// each time we call clusterRanges, the result is a list of indices 0...n,
// 	// where the indices relate to the input array "edges", all we have to do is
// 	// remap these indices back to their actual edge index inside "edges".
// 	return invertFlatToArrayMap(edges_line)
// 		.flatMap(edges => clusterRanges(edges.map(e => edges_range[e]), epsilon)
// 			.map(indices => indices.map(i => edges[i])));
// };

/**
 * @description This extends getEdgesLine and also returns information about
 * clusters of overlapping edges within each line group. Each cluster is
 * defined as a group of edges where every edge overlaps at least one other
 * edge from the group. This does not define a list of, for every edge,
 * a list of edges which overlap this edge.
 * @param {FOLD} graph a FOLD object
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {{
 *   lines: VecLine[],
 *   edges_line: number[],
 *   clusters_edges: number[][],
 *   edges_cluster: number[],
 * }}
 */
// export const getCollinearOverlappingEdgeClusters = ({
// 	vertices_coords, edges_vertices,
// }, epsilon = EPSILON) => {
// 	const {
// 		lines,
// 		edges_line,
// 	} = getEdgesLine({ vertices_coords, edges_vertices }, epsilon);

// 	// we're going to project each edge onto the shared line, we can't use
// 	// each edge's vector, we have to use the edge's line's common vector.
// 	const edges_range = makeEdgesCoords({ vertices_coords, edges_vertices })
// 		.map((points, e) => points
// 			.map(point => dot(lines[edges_line[e]].vector, point)));

// 	// the invertFlatToArrayMap creates lines_edges, each a list of edge indices.
// 	// each time we call clusterRanges, the result is a list of indices 0...n,
// 	// where the indices relate to the input array "edges", all we have to do is
// 	// remap these indices back to their actual edge index inside "edges".
// 	const clusters_edges = invertFlatToArrayMap(edges_line)
// 		.flatMap(edges => clusterRanges(edges.map(e => edges_range[e]), epsilon)
// 			.map(indices => indices.map(i => edges[i])));
// 	const edges_cluster = invertArrayToFlatMap(clusters_edges);
// 	return {
// 		lines,
// 		edges_line,
// 		clusters_edges,
// 		edges_cluster,
// 	};
// };

/**
 * @description Most origami models have many edges which lie along
 * the same infinite line. This method finds all lines which cover all edges,
 * returning a list of lines, and a mapping of each edge to each line.
 * @param {FOLD} graph a FOLD object, can be 2D or 3D.
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {{ lines: VecLine[], edges_line: number[] }}
 */
export const getEdgesLineBruteForce = (
	{ vertices_coords, edges_vertices },
	epsilon = EPSILON,
) => {
	if (!vertices_coords || !edges_vertices || !edges_vertices.length) {
		return { edges_line: [], lines: [] };
	}

	// a vector-origin line representation of every edge. we will apply
	// clustering operations to this list to group edges with similar lines.
	// const edgesLine = edgesToLines3({ vertices_coords, edges_vertices });
	const edgesLine = edgesToLines3({ vertices_coords, edges_vertices });

	const lines_lines = edgesLine.map(() => []);

	edgesLine.forEach((line0, e0) =>
		edgesLine.forEach((line1, e1) => {
			if (e1 <= e0) {
				return;
			}
			if (collinearLines3(line0, line1, epsilon)) {
				lines_lines[e0].push(e1);
				lines_lines[e1].push(e0);
			}
		}),
	);

	const edges_line = connectedComponents(lines_lines);
	const lines_edges = invertFlatToArrayMap(edges_line);

	// get the most precise form of a line possible.
	// the fastest way to do this is, for every segment, build a vector
	// from the furthest two points possible.
	// so, step 1, for each line/cluster, get a list of all vertices involved.
	const lines_vertices = lines_edges
		.map((edges) => edges.flatMap((e) => edges_vertices[e]))
		.map(uniqueElements);

	// for each line/cluster, find the two vertices furthest on either end.
	// use one vector from the line, it doesn't matter which one.
	const lines_firstVector = lines_edges.map((edges) => edgesLine[edges[0]].vector);

	// project each vertex onto the line, get the dot product
	// find the minimum and maximum vertices along the line's vector.
	const lines_vertProjects = lines_vertices.map((vertices, i) =>
		vertices.map((v) => dot(vertices_coords[v], lines_firstVector[i])),
	);
	const lines_vertProjectsMin = lines_vertProjects.map(
		(projections, i) => lines_vertices[i][arrayMinimumIndex(projections)],
	);
	const lines_vertProjectsMax = lines_vertProjects.map(
		(projections, i) => lines_vertices[i][arrayMaximumIndex(projections)],
	);

	// for each line/cluster, create a vector from the furthest two vertices
	const lines_vector = lines_vertices.map((_, i) =>
		subtract(
			vertices_coords[lines_vertProjectsMax[i]],
			vertices_coords[lines_vertProjectsMin[i]],
		),
	);

	// the "line" result will have both vector and origin matching
	// in dimensions with the input graph's vertices_coords
	const lines_vectorN =
		getDimensionQuick({ vertices_coords }) === 2
			? lines_vector.map(resize2)
			: lines_vector.map(resize3);

	// for each line's origin, we want to use an existing vertex.
	const lines_origin = lines_vertProjectsMin.map((v) => vertices_coords[v]);
	const lines = lines_vectorN.map((vector, i) => ({ vector, origin: lines_origin[i] }));
	return {
		lines,
		edges_line,
	};
};
