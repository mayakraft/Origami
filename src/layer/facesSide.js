/**
 * Rabbit Ear (c) Kraft
 */
import { cross2, subtract2, resize3 } from "../math/vector.js";
import { multiplyMatrix4Vector3, multiplyMatrix4Line3 } from "../math/matrix4.js";
import { pointsToLine } from "../math/convert.js";
import { edgeToLine2 } from "../graph/edges/lines.js";
import { makeFacesCenter2DQuick, makeFacesCenter3DQuick } from "../graph/make/faces.js";
import { uniqueElements } from "../general/array.js";
import { invertFlatToArrayMap } from "../graph/maps.js";

/**
 * @description An edge is adjacent to one or two faces,
 * this is stored in its edges_faces entry. for each of these
 * faces, which side of the edge (using the edge's vector)
 * is each face on. each result is an array of length
 * matching the number of adjacent edges.
 * @param {FOLDExtended} graph the fold object with edges_faces and faces_center
 * @returns {number[][]} for every edge, for each of its 1 or 2 adjacent faces,
 * a +1 or -1 for each face indicating which side of the edge the face lies on.
 */
export const makeEdgesFacesSide = ({
	vertices_coords,
	edges_vertices,
	edges_faces,
	faces_center,
}) => {
	// convert edges into a line form with a vector and origin
	const edgesLine = edges_vertices
		.map((verts) => verts.map((v) => vertices_coords[v]))
		.map(([a, b]) => pointsToLine(a, b));

	// for each edge, for each of it's adjacent faces (either 1 or 2),
	// which side of the edge's vector does that face lie on?
	// compute the cross product of the edge's vector with the vector
	// from the edge origin to the face's center. return +1 or -1
	return edges_faces.map((faces, i) =>
		faces
			.map((face) =>
				cross2(subtract2(faces_center[face], edgesLine[i].origin), edgesLine[i].vector),
			)
			.map((cross) => Math.sign(cross)),
	);
};

/**
 * @description having already pre-computed a the tacos in the form of
 * edges and the edges' adjacent faces, give each face a +1 or -1 based
 * on which side of the edge it is on. "side" determined by the cross-
 * product against the edge's vector. This method works in 2D only.
 * @param {FOLDExtended} graph the fold graph with faces_center
 * @param {[number, number][]} edgePairs
 * @returns {[[number,number],[number,number]][]}
 */
export const makeEdgePairsFacesSide = (
	{ vertices_coords, edges_vertices, edges_faces, faces_center },
	edgePairs,
) => {
	// there are two edges involved in a taco, grab the first one.
	// we have to use the same origin/vector so that the face-sidedness is
	// consistent globally, not local to its edge.
	const edgePairsLine = edgePairs.map(([edge]) =>
		edgeToLine2({ vertices_coords, edges_vertices }, edge),
	);

	return (
		edgePairs
			// convert pairs of edges into pairs of face-pairs (two faces for each edge)
			.map((pair) => pair.map((edge) => edges_faces[edge]))
			// cross product of every edge-pair's line vector against
			// every face's vector (vector from edge origin to face center)
			.map((faces, i) =>
				faces.map((face_pair) =>
					face_pair
						.map((face) => faces_center[face])
						.map((center) =>
							cross2(subtract2(center, edgePairsLine[i].origin), edgePairsLine[i].vector),
						)
						.map(Math.sign),
				),
			)
			.map((arr) => [
				[arr[0][0], arr[0][1]],
				[arr[1][0], arr[1][1]],
			])
	);
};

/**
 * @description For every edge in a 2D graph, for each of its faces, get
 * which side of the edge this face lies along. "Sidedness" is simply local
 * to each edge, similar or collinear edges will not have a consistent side
 * between them.
 * @param {FOLDExtended} graph a FOLD object where, if faces_center exists then
 * only edges_faces is needed, otherwise vertices and face data is needed.
 * @param {{
 *   lines: VecLine[],
 *   edges_line: number[],
 *   faces_plane: number[],
 *   planes_transform: number[][],
 * }} edgesLine-facesPlane-data the joined-results from
 *   getEdgesLine() and getFacesPlane()
 * @returns {number[][]} for every edge, for each of its 1 or 2 adjacent faces,
 * a +1 or -1 for each face indicating which side of the edge the face lies on.
 */
export const makeEdgesFacesSide2D = (
	{ vertices_coords, edges_faces, faces_vertices, faces_center },
	{ lines, edges_line },
) => {
	if (!faces_center) {
		// eslint-disable-next-line no-param-reassign
		faces_center = makeFacesCenter2DQuick({ vertices_coords, faces_vertices });
	}

	// for every edge, for all of its (0, 1, 2) adjacent faces, compute the
	// cross product of the vector to the faces' center with the vector of
	// the shared line that this edge runs along.
	// the result is +1 or -1, the sign of the result of the cross product.
	return edges_faces.map((faces, e) =>
		faces
			.map((face) => {
				const { vector, origin } = lines[edges_line[e]];
				return cross2(subtract2(faces_center[face], origin), vector);
			})
			.map(Math.sign),
	);
};

/**
 * @description For every edge, for each of its 1 or 2 adjacent faces,
 * get which side of the edge this face lies on. All collinear edges
 * are established to have a similar direction for sidedness, and this
 * method works in 3D.
 * @param {FOLDExtended} graph a FOLD object where, if faces_center exists then
 * only edges_faces is needed, otherwise vertices and face data is needed.
 * @param {{
 *   lines: VecLine[],
 *   edges_line: number[],
 *   faces_plane: number[],
 *   planes_transform: number[][],
 * }} edgesLine-facesPlane-data the joined-results from
 *   getEdgesLine() and getFacesPlane()
 * @returns {number[][]} for every edge, for each of its 1 or 2 adjacent faces,
 * a +1 or -1 for each face indicating which side of the edge the face lies on.
 */
export const makeEdgesFacesSide3D = (
	{ vertices_coords, edges_faces, faces_vertices, faces_center },
	{ lines, edges_line, planes_transform, faces_plane },
) => {
	if (!faces_center) {
		// this method will always return 3D points, necessary for the
		// multiply matrix and vector method
		// eslint-disable-next-line no-param-reassign
		faces_center = makeFacesCenter3DQuick({ vertices_coords, faces_vertices }).map(
			(center, f) => multiplyMatrix4Vector3(planes_transform[faces_plane[f]], center),
		);
	}

	// for every line, a list of all planes that this line is a member of
	const lines_planes = invertFlatToArrayMap(edges_line)
		.map((edges) => edges.flatMap((e) => edges_faces[e].map((f) => faces_plane[f])))
		.map((planes) => uniqueElements(planes));

	// ensure lines's vectors and origins are in 3D.
	const lines3D = lines.map(({ vector, origin }) => ({
		vector: resize3(vector),
		origin: resize3(origin),
	}));

	// fill lines planes
	/** @type {VecLine[][]} */
	const lines2DInPlane = lines.map(() => []);
	lines_planes.forEach((planes, l) =>
		planes.forEach((p) => {
			const { vector, origin } = lines3D[l];
			lines2DInPlane[l][p] = multiplyMatrix4Line3(planes_transform[p], vector, origin);
		}),
	);

	return edges_faces.map((faces, e) =>
		faces
			.map((face) => {
				const { vector, origin } = lines2DInPlane[edges_line[e]][faces_plane[face]];
				return cross2(subtract2(faces_center[face], origin), vector);
			})
			.map(Math.sign),
	);
};
