/**
 * Rabbit Ear (c) Kraft
 */
import { EPSILON } from "../../math/constant.js";
import { includeS, epsilonEqual } from "../../math/compare.js";
import { intersectLineLine } from "../../math/intersect.js";
import { edgesToLines2 } from "../edges/lines.js";
import { makeVerticesEdgesUnsorted } from "../make/verticesEdges.js";

/**
 * @param {FOLD} graph a FOLD object
 * @todo line sweep
 */
export const intersectAllEdges = (
	{ vertices_coords, vertices_edges, edges_vertices },
	epsilon = EPSILON,
) => {
	if (!vertices_edges) {
		vertices_edges = makeVerticesEdgesUnsorted({ edges_vertices });
	}
	const edgesEdgesLookup = edges_vertices.map(() => ({}));
	edges_vertices.forEach((vertices, e) =>
		vertices
			.flatMap((v) => vertices_edges[v])
			.forEach((edge) => {
				edgesEdgesLookup[e][edge] = true;
				edgesEdgesLookup[edge][e] = true;
			}),
	);
	const lines = edgesToLines2({ vertices_coords, edges_vertices });
	const results = [];
	// todo: line sweep
	for (let i = 0; i < edges_vertices.length - 1; i += 1) {
		for (let j = i + 1; j < edges_vertices.length; j += 1) {
			if (edgesEdgesLookup[i][j]) {
				continue;
			}
			const { a, b, point } = intersectLineLine(
				lines[i],
				lines[j],
				includeS,
				includeS,
				epsilon,
			);
			if (point) {
				if (
					(epsilonEqual(a, 0) || epsilonEqual(a, 1)) &&
					(epsilonEqual(b, 0) || epsilonEqual(b, 1))
				) {
					continue;
				}
				results.push({ i, j, a, b, point });
			}
		}
	}
	return results;
};
