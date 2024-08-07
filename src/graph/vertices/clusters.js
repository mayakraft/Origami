/**
 * Rabbit Ear (c) Kraft
 */
import { EPSILON } from "../../math/constant.js";
import { getDimensionQuick } from "../../fold/spec.js";

/**
 * @description Find all clusters of vertices which lie within an epsilon
 * of each other. Each cluster is an array of vertex indices. If no clusters
 * exist, the method returns N-number of arrays, each with a single vertex
 * entry. This is an implementation of a density-based spatial clustering
 * of applications with noise (DBSCAN).
 * @param {FOLD} graph a FOLD object
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {number[][]} a list of clusters_vertices, for every cluster,
 * an of vertex indices which are a part of this cluster.
 * @example
 * no clusters: [ [0], [1], [2], [3], [4], ... ]
 * clusters: [ [0, 5], [1], [3], [2, 4]]
 */
export const getVerticesClusters = ({ vertices_coords }, epsilon = EPSILON) => {
	if (!vertices_coords) {
		return [];
	}
	const dimensions = getDimensionQuick({ vertices_coords });
	const dimensionArray = Array.from(Array(dimensions));

	// the return value, the clusters
	const clusters = [];

	// increment every time we add a vertex to a cluster.
	// once this number equals the number of vertices, we are done.
	let visited = 0;

	// as we add points to clusters, they will be removed from here.
	// sort vertices (any dimension, let's use the X-axis). store their indices.
	// the last line is necessary to remove any holes.
	const vertices = vertices_coords
		.map((point, i) => ({ i, d: point[0] }))
		.sort((a, b) => a.d - b.d)
		.map((a) => a.i)
		.filter(() => true);

	// for each X and Y axis, there is an array of two values: [0, 0].
	// As we walk through the vertices, we maintain the min and max of a
	// subset of the most recently added points (more info in "updateRange").
	const ranges = dimensionArray.map(() => [0, 0]);

	/**
	 * @description Test if a vertex is inside the current cluster's bounding box
	 * @param {number} index an index in vertices_coords
	 */
	const isInsideCluster = (index) =>
		dimensionArray
			.map(
				(_, d) =>
					vertices_coords[index][d] > ranges[d][0] &&
					vertices_coords[index][d] < ranges[d][1],
			)
			.reduce((a, b) => a && b, true);

	// "rangeStart" is the index of the cluster which is still within epsilon
	// range of the most recently added point, every update to cluster will
	// refresh the bounding box as rect range of indices (rangeStart...length).
	let rangeStart = 0;

	// Each time we add a point to the current cluster, form a bounding
	// box NOT with all points in the cluster, but all points that are within
	// epsilon range along the X-axis of the most recently added point.
	const updateRange = (cluster) => {
		// find the start index of the values within epsilon of the newest point
		const newVertex = cluster[cluster.length - 1];
		while (
			vertices_coords[newVertex][0] - vertices_coords[cluster[rangeStart]][0] >
			epsilon
		) {
			rangeStart += 1;
		}

		// the subset of points within the epsilon of the newest point
		const points = cluster
			.slice(rangeStart, cluster.length)
			.map((v) => vertices_coords[v]);

		// set all dimensions of the range.
		// for the X-axis, we know that the values are sorted, so, we can
		// make a little shortcut and only grab the first and last entry.
		ranges[0] = [points[0][0] - epsilon, points[points.length - 1][0] + epsilon];
		// set the new ranges with the min and max padded with the epsilon
		for (let d = 1; d < dimensions; d += 1) {
			const scalars = points.map((p) => p[d]);
			ranges[d] = [Math.min(...scalars) - epsilon, Math.max(...scalars) + epsilon];
		}
	};

	// here is our main loop. we loop until all vertices have been visited.
	// inside here we setup the conditions of the new cluster, then
	// there is another loop inside here which walks through the vertices
	// (remember these are sorted along the X axis), and add vertices to the
	// cluster if the vertex is inside the cluster's "range" AABB, and when the
	// cluster is done, restart this loop and a new cluster.
	// Note, a cluster is called "done" only when the next point lies outside
	// of epsilon range along the X axis, not Y or Z, as it's possible for the
	// next point to be far away in one dimension, but that the point after it
	// is back within range again.
	while (visited < vertices_coords.length && vertices.length) {
		// start a new cluster, add the first vertex, first in array, min X axis.
		const cluster = [];
		const startVertex = vertices.shift();
		cluster.push(startVertex);
		visited += 1;

		// rangeStart is an index in the array "cluster". as we build the cluster,
		// this will increment to stay with epsilon range of the newest vertex.
		// each time we start a new cluster, reset this value back to 0.
		rangeStart = 0;

		// this will update the AABB ranges, and walk "rangeStart" forward.
		updateRange(cluster);

		// walk is an index in the array "vertices"
		let walk = 0;

		// this boolean check tests whether or not the vertex is still inside
		// the bounding box ONLY according to the X axis. it's possible a
		// vertex is too far away in the Y (and rejected from the cluster), but
		// the next few vertices to its right are still within the cluster.
		// however, if we move too far away in the X direction from the cluster,
		// we know this cluster is finished and we can start a new one.
		while (walk < vertices.length && vertices_coords[vertices[walk]][0] < ranges[0][1]) {
			// if the point is inside the bounding box of the cluster, add it.
			if (isInsideCluster(vertices[walk])) {
				const newVertex = vertices.splice(walk, 1).shift();
				cluster.push(newVertex);
				visited += 1;

				// update new bounding box, walk x-start pointer forward
				updateRange(cluster);

				// don't increment the walk. the vertices array got smaller instead
			} else {
				// skip over this vertex. even though our vertices are sorted
				// left to right, it's possible that this one is too far away in the
				// Y axis, but that the next few points will be inside the cluster,
				// so we need to keep looping and progressing through the vertices
				// until we reach a vertex which is too far away in all axes.
				walk += 1;
			}
		}

		// cluster is done, no more possible points can be added.
		// start a new cluster next round, unless all vertices are finished.
		clusters.push(cluster);
	}
	return clusters;
};
