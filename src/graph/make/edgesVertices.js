/**
 * Rabbit Ear (c) Kraft
 */

/**
 * @description Create edges_vertices from faces_vertices
 * @param {FOLD} graph a FOLD object
 * @returns {[number, number][]} an edges_vertices array
 */
export const makeEdgesVerticesFromFaces = ({ faces_vertices }) => {
	const hash = {};
	const edges_vertices = [];
	faces_vertices.map((vertices) =>
		vertices
			.map((v, i, arr) => [v, arr[(i + 1) % arr.length]])
			.forEach(([a, b]) => {
				if (hash[`${a} ${b}`] || hash[`${b} ${a}`]) {
					return;
				}
				hash[`${a} ${b}`] = true;
				edges_vertices.push([a, b]);
			}),
	);
	return edges_vertices;
};
