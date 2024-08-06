/**
 * Rabbit Ear (c) Kraft
 */

/**
 * @description Discover a single face by walking counter-clockwise
 * from vertex to vertex until returning from which we began. A second vertex
 * as an input is required to tell the algorithm which direction to begin
 * the walk from the starting vertex. An optional hash table of walked edges
 * exists as an input in case you are trying to build more than one face,
 * initialize an empty object and pass it in every time you call this method.
 * If you use a global "walkedEdges" and this method is trying to build a
 * face that was already previously built, the method will return undefined.
 * @param {FOLDExtended} graph a FOLD object with the additional vertices_sectors data
 * @param {number} vertex0 starting vertex
 * @param {number} vertex1 second vertex, this sets the direction of the walk
 * @param {object} [walkedEdges={}] memo object, to prevent walking down
 * duplicate paths, or finding duplicate faces, this dictionary will
 * store and check against vertex pairs "i j".
 * @returns {{ vertices: number[], edges: string[], angles?: number[] } | undefined}
 * the walked face, an object arrays of numbers
 * under "vertices", "edges", and "angles", or if you are using a global
 * "walkedEdges" hash, if the faces was previously built, returns undefined.
 */
export const walkSingleFace = (
	{ vertices_vertices, vertices_sectors },
	vertex0,
	vertex1,
	walkedEdges = {},
) => {
	// each time we visit an edge (vertex pair as string, "4 9") add it here.
	// this gives us a quick lookup to see if we've visited this edge before.
	const thisWalkedEdges = {};

	// walking the graph, we look at 3 vertices at a time. in sequence:
	// prevVertex, currVertex, nextVertex
	let prevVertex = vertex0;
	let currVertex = vertex1;

	const face = {
		vertices: [vertex0],
		edges: [`${vertex0} ${vertex1}`],
		angles: [],
	};
	while (true) {
		// even though vertices_vertices are sorted counter-clockwise,
		// to make a counter-clockwise wound face, when we visit a vertex's
		// vertices_vertices array we have to select the [n-1] vertex, not [n+1],
		// it's a little counter-intuitive.

		// within the list of the current vertex's adjacent vertices,
		// find the location in the array of the previous vertex. Once found,
		// the vertex at the [-1] index location from it, this vertex is the
		// next neighbor vertex.
		const v_v = vertices_vertices[currVertex];

		// both of these are indices inside the current vertex's vertices_vertices
		const fromIndex = v_v.indexOf(prevVertex);
		const nextIndex = (fromIndex + v_v.length - 1) % v_v.length;

		// the vertex which we will travel to next, and we can use this to
		// build the edge key "v0 v1" for the next edge we are walking across.
		const nextVertex = v_v[nextIndex];
		const nextEdgeVertices = `${currVertex} ${nextVertex}`;

		// check if this edge was already walked 2 ways:

		// 1. if the user supplied a non-empty "walkedEdges" parameter, make sure
		// we have not encountered one of these edges. If so, the face we are
		// trying to build was already previously built, exit and return undefined.
		if (walkedEdges[nextEdgeVertices]) {
			return undefined;
		}

		// 2. if we are seeing an edge that we have previously seen during
		// the construction of this face, then we are done, return this face.
		if (thisWalkedEdges[nextEdgeVertices]) {
			// store this face's edges into our global hash
			Object.assign(walkedEdges, thisWalkedEdges);
			face.vertices.pop();
			face.edges.pop();
			if (!face.angles.length) {
				delete face.angles;
			}
			return face;
		}
		thisWalkedEdges[nextEdgeVertices] = true;

		// we are not yet done, add the current data, increment the
		// previous and current vertices, and loop again.
		face.vertices.push(currVertex);
		face.edges.push(nextEdgeVertices);
		if (vertices_sectors) {
			face.angles.push(vertices_sectors[currVertex][nextIndex]);
		}
		prevVertex = currVertex;
		currVertex = nextVertex;
	}
};

/**
 * @description Given a planar graph, discover all faces by counter-clockwise
 * walking by starting at every edge.
 * @param {FOLDExtended} graph a FOLD object with the additional vertices_sectors data
 * @returns {{ vertices: number[], edges: string[], angles?: number[] }[]}
 * an array of face objects, where each face
 * has number arrays, "vertices", "edges", and "angles".
 * vertices and edges are indices, angles are radians.
 */
export const walkPlanarFaces = ({ vertices_vertices, vertices_sectors }) => {
	// walked edges is maintained globally, no walking down the same edge twice
	const walkedEdges = {};
	const graph = { vertices_vertices, vertices_sectors };
	return vertices_vertices.flatMap((adj_verts, v) =>
		adj_verts
			.map((adj_vert) => walkSingleFace(graph, v, adj_vert, walkedEdges))
			.filter((a) => a !== undefined),
	);
};

/**
 * @description This should be used in conjuction with walkPlanarFaces() and
 * walkSingleFace(). There will be one face in the which winds around the
 * outside of the boundary and encloses the space outside around. This method will
 * find that face and remove it from the set.
 * Important usage note, the graph provided to walkPlanarFaces should have
 * vertices_sectors computed, otherwise angles will not exist and the
 * boundary face will not be found.
 * @algorithm 180 - sector angle = the turn angle. counter clockwise
 * turns are +, clockwise will be -, this removes the one face that
 * outlines the piece with opposite winding enclosing Infinity.
 * @param {{ vertices: number[], edges: string[], angles?: number[] }[]}
 * walkedFaces the result from calling "walkPlanarFaces()"
 * @returns {{ vertices: number[], edges: string[], angles?: number[] }[]}
 * a copy of the same input array with one fewer element
 */
export const filterWalkedBoundaryFace = (walkedFaces) =>
	walkedFaces.filter(
		(face) => face.angles.map((a) => Math.PI - a).reduce((a, b) => a + b, 0) > 0,
	);
