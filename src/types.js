/**
 * @typedef FOLDFrame
 * @type {{
 *   frame_author?: string,
 *   frame_title?: string,
 *   frame_description?: string,
 *   frame_classes?: string[],
 *   frame_attributes?: string[],
 *   frame_unit?: string,
 *   vertices_coords?: [number, number][]|[number, number, number][],
 *   vertices_vertices?: number[][],
 *   vertices_edges?: number[][],
 *   vertices_faces?: (number | null | undefined)[][],
 *   edges_vertices?: [number, number][],
 *   edges_faces?: (number | null | undefined)[][],
 *   edges_assignment?: string[],
 *   edges_foldAngle?: number[],
 *   edges_length?: number[],
 *   faces_vertices?: number[][],
 *   faces_edges?: number[][],
 *   faces_faces?: (number | null | undefined)[][],
 *   faceOrders?: [number, number, number][],
 *   edgeOrders?: [number, number, number][],
 * }}
 * @property {string} [frame_author] metadata
 * @property {string} [frame_title] metadata
 * @property {string} [frame_description] metadata
 * @property {string[]} [frame_classes] metadata
 * @property {string[]} [frame_attributes] metadata
 * @property {string} [frame_unit] metadata
 * @property {([number, number] | [number, number, number])[]} [vertices_coords]
 * xy or xyz coordinates of the vertices
 * @property {number[][]} [vertices_vertices] for each vertex all adjacent vertices
 * @property {number[][]} [vertices_edges] for each vertex all adjacent edges
 * @property {(number | null | undefined)[][]} [vertices_faces] for each vertex all adjacent faces
 * @property {[number, number][]} [edges_vertices] each edge connects two vertex indices
 * @property {(number | null | undefined)[][]} [edges_faces] for each edge all adjacent faces
 * @property {string[]} [edges_assignment] single-character fold assignment of each edge
 * @property {number[]} [edges_foldAngle] in degrees, the fold angle of each edge
 * @property {number[]} [edges_length] length of each edge
 * @property {number[][]} [faces_vertices] for each face, all adjacent vertices
 * @property {number[][]} [faces_edges] for each face, all adjacent edges
 * @property {(number | null | undefined)[][]} [faces_faces] for each face, all adjacent faces
 * @property {[number, number, number][]} [faceOrders] a series of layer
 * ordering rules between pairs of faces
 * @property {[number, number, number][]} [edgeOrders] a series of layer
 * ordering rules between pairs of edges
 */

/**
 * @typedef FOLDChildFrame
 * @type {FOLDFrame & {
 *   frame_parent?: number,
 *   frame_inherit?: boolean,
 * }}
 * @property {number} [frame_parent] metadata
 * @property {boolean} [frame_inherit] metadata
 */

/**
 * @typedef FOLDFileMetadata
 * @type {{
 *   file_spec?: number,
 *   file_creator?: string,
 *   file_author?: string,
 *   file_title?: string,
 *   file_description?: string,
 *   file_classes?: string[],
 *   file_frames?: FOLDChildFrame[],
 * }}
 * @property {number} [file_spec] metadata
 * @property {string} [file_creator] metadata
 * @property {string} [file_author] metadata
 * @property {string} [file_title] metadata
 * @property {string} [file_description] metadata
 * @property {string[]} [file_classes] metadata
 * @property {FOLDChildFrame[]} [file_frames] array of embedded FOLD frames,
 * good for representing a linear sequence like diagram steps for example.
 */

/**
 * @typedef FOLDOutOfSpec
 * @type {{
 *   faces_center?: ([number, number] | [number, number, number])[],
 *   faces_normal?: ([number, number] | [number, number, number])[],
 *   edges_vector?: ([number, number] | [number, number, number])[],
 *   faces_polygon?: ([number, number] | [number, number, number])[][],
 *   faces_matrix?: number[][],
 *   faces_layer?: number[],
 *   vertices_sectors?: number[][],
 * }}
 * @property {([number, number] | [number, number, number])[]} [faces_center]
 * @property {([number, number] | [number, number, number])[]} [faces_normal]
 * @property {([number, number] | [number, number, number])[]} [edges_vector]
 * @property {([number, number] | [number, number, number])[][]} [faces_polygon]
 * @property {number[][]} [faces_matrix]
 * @property {number[]} [faces_layer]
 * @property {number[][]} [vertices_sectors]
 */

/**
 * @typedef FOLD
 * @type {FOLDFileMetadata & FOLDFrame}
 * @description A Javascript object encoding of a FOLD file
 * which adheres to the FOLD file format specification.
 * @example
 * {
 *   vertices_coords: [[0, 0], [1, 0], [1, 1], [0, 1]],
 *   vertices_faces: [[0, 1, null], [0, null], [1, 0, null], [1, null]],
 *   edges_vertices: [[0, 1], [1, 2], [2, 3], [3, 0], [0, 2]],
 *   edges_assignment: ["B", "B", "B", "B", "V"],
 *   edges_foldAngle: [0, 0, 0, 0, 180],
 *   faces_vertices: [[0, 1, 2], [0, 2, 3]],
 * }
 */

/**
 * @typedef FOLDExtended
 * @type {FOLD & FOLDOutOfSpec}
 * @description An extension of the FOLD format spec that includes a few
 * additional fields that this library makes repeated use of.
 */

// /**
//  * @typedef Coord
//  * @type {[number, number]|[number, number, number]}
//  * @description a 2D or 3D point or vector
//  */

/**
 * @typedef VecLine2
 * @type {{ vector: [number, number], origin: [number, number] }}
 * @description a 2D line defined by a 2D vector and a 2D point along the line.
 * @property {[number, number]} vector
 * a vector describing the direction of the line
 * @property {[number, number]} origin
 * a point which the line passes through
 */

/**
 * @typedef VecLine3
 * @type {{ vector: [number, number, number], origin: [number, number, number] }}
 * @description a 3D line defined by a 3D vector and a 3D point along the line.
 * @property {[number, number, number]} vector
 * a vector describing the direction of the line
 * @property {[number, number, number]} origin
 * a point which the line passes through
 */

/**
 * @typedef VecLine
 * @type {{
 *   vector: [number, number]|[number, number, number],
 *   origin: [number, number]|[number, number, number],
 * }}
 * @description a line defined by a vector and a point along the line,
 * capable of representing a line in any dimension.
 * @property {[number, number]|[number, number, number]} vector
 * a vector describing the direction of the line
 * @property {[number, number]|[number, number, number]} origin
 * a point which the line passes through
 */

/**
 * @typedef UniqueLine
 * @type {{ normal: [number, number], distance: number }}
 * @description a 2D line defined by a unit normal vector and a value that
 * describes the shortest distance from the origin to a point on the line.
 * @property {[number, number]} normal - a unit vector that is normal to the line
 * @property {number} distance - the shortest distance
 * from the line to the origin
 */

/**
 * @typedef Box
 * @type {{ min: number[], max: number[], span?: number[] }}
 * @description an axis-aligned bounding box, capable of representing
 * a bounding box with any number of dimensions.
 * @property {number[]} min - the point representing the absolute minimum
 * for all axes.
 * @property {number[]} max - the point representing the absolute maximum
 * for all axes.
 */

/**
 * @typedef Circle
 * @type {{ radius: number, origin: [number, number] }}
 * @description a circle primitive in 2D
 * @property {number} radius - the radius of the circle
 * @property {[number, number]} origin - the center of the circle as an array of numbers
 */

/**
 * @typedef SweepEvent
 * @type {{ vertices: number[], t: number, start: number[], end: number[] }}
 * @property {number} t - the scalar along the sweep axis which this event occurs
 * @property {number[]} vertices - a list of indices currently overlapping this region
 * @property {number[]} start - a list of indices beginning to overlap at this event
 * @property {number[]} end - a list of indices no longer overlapping after this event
 */

/**
 * Intersection related events
 */

/**
 * @typedef LineLineEvent
 * @type {{ a: number, b: number, point: [number, number] }}
 * @description used in line-line intersection and graph edge-line intersection
 *
 * @typedef FaceVertexEvent
 * @type {{ a: number, vertex: number }}
 * @description used in face-graph intersection, the vertex-related data
 *
 * @typedef FaceEdgeEvent
 * @type {{ a: number, b: number, point: [number, number], edge: number }}
 * @description used in face-graph intersection, the edge-related data
 *
 * @typedef FacePointEvent
 * @type {{ point: [number, number], overlap: boolean, t: number[] }}
 * @description used in face-graph intersection, the data that describes
 * any points that lie inside of faces
 */

/**
 * FoldGraph, base method for folding method
 */

/**
 * @typedef FoldGraphEvent
 * @type {{
 *   vertices?: {
 *     folded: [number, number][]|[number, number, number][],
 *   },
 *   edges?: {
 *     new: number[],
 *     map: (number|number[])[],
 *     collinear: number[],
 *     reassigned: number[],
 *   },
 *   faces?: {
 *     new: number[],
 *     map: number[][],
 *   },
 * }}
 * @description an object which summarizes the changes to the graph.
 */

/**
 * @typedef WebGLVertexArray
 * @type {{
 *   location: number,
 *   buffer: WebGLBuffer,
 *   type: number,
 *   length: number,
 *   data: Float32Array,
 * }}
 *
 * @typedef WebGLElementArray
 * @type {{
 *   mode: number,
 *   buffer: WebGLBuffer,
 *   data: Uint16Array | Uint32Array,
 * }}
 *
 * @typedef WebGLUniform
 * @type {{
 *   func: string,
 *   value: any
 * }}
 *
 * @typedef WebGLModel
 * @type {{
 *   program: WebGLProgram,
 *   vertexArrays: WebGLVertexArray[],
 *   elementArrays: WebGLElementArray[],
 *   flags: number[],
 *   makeUniforms: (options: object) => ({ [key: string]: WebGLUniform }),
 * }}
 * @property {WebGLProgram} program
 * @property {WebGLVertexArray[]} vertexArrays
 * @property {WebGLElementArray[]} elementArrays
 * @property {number[]} flags these flags will be enabled at the beginning of
 * the model's rendering process via gl.enable, and then gl.disable at the end.
 * @property {Function} makeUniforms
 */

/**
 * @typedef Arrow
 * @type {{
 *   segment: [[number, number], [number, number]],
 *   head?: { width: number, height: number },
 *   tail?: { width: number, height: number },
 *   bend?: number,
 *   padding?: number,
 * }}
 * @description An arrow intended for being rendered in SVG for
 * the use in diagrams in 2D.
 * @property {[[number, number], [number, number]]} segment the two 2D points "from" and "to"
 * @property {{ width: number, height: number }} [head] the size of the arrow head
 * @property {{ width: number, height: number }} [tail] the size of the arrow tail
 * @property {number} [bend] the magnitude of the bend of the path
 * @property {number} [padding] the little space to inset the endpoints
 */

/**
 * @typedef TacoTacoConstraint
 * @type {[number, number, number, number]}
 * @description four face indices involved
 * in the taco-taco relationship, encoding this relationship:
 * 0 and 2 are connected (A and C) and 1 and 3 are connected (B and D)
 * (A,C) (B,D) (B,C) (A,D) (A,B) (C,D)
 *
 * @typedef TacoTortillaConstraint
 * @type {[number, number, number]}
 * @description three face indices involved
 * in the taco-tortilla relationship, encoding this relationship:
 * 0 and 2 are a connected taco, 1 is the tortilla face
 * (A,C) (A,B) (B,C)
 *
 * @typedef TortillaTortillaConstraint
 * @type {[number, number, number, number]}
 * @description four face indices involved
 * in the tortilla-tortilla relationship, encoding this relationship:
 * 0 and 1 are a connected tortilla, 2 and 3 are a connected tortilla.
 * where 0 is above/below 2, and 1 is above/below 3
 * (A,C) (B,D)
 *
 * @typedef TransitivityConstraint
 * @type {[number, number, number]}
 * @description three face indices encoding a transitivity constraint,
 * where the three faces involved are in sorted order.
 * (A,B) (B,C) (C,A)
 */

/**
 * @typedef LayerBranch
 * @type {LayerFork[]}
 * @description To compile a solution, you must include
 * a selection from every Branch inside this LayerBranches array.
 *
 * @typedef LayerOrders
 * @type {{[key: string]: number}}
 * @description an object with (many) face-pair keys, and value numbers 1 or 2.
 *
 * @typedef LayerFork
 * @type {{ orders: LayerOrders, branches?: LayerBranch[] }}
 * @description To compile a solution, you must choose only one item
 * from this list. Each item is a copy of one another, but with
 * different values.
 *
 * @typedef LayerSolverSolution
 * @type {LayerFork}
 * @example In this example there are three "branches", one top-level,
 * and two more inside of this one each at a similar depth.
 * The top-level branch contains two all-branches (each happen to be
 * identical in structure), and each of these all-branches contain
 * two choice-branches.
 * {
 *   "orders: LayerOrders,
 *   "branches: [
 *     [
 *       {
 *         "orders": LayerOrders,
 *         "branches": [
 *           [
 *             { "orders": LayerOrders },
 *             { "orders": LayerOrders },
 *           ],
 *         ],
 *       },
 *       {
 *         "orders": LayerOrders
 *       },
 *     ],
 *     [
 *       {
 *         "orders": LayerOrders,
 *         "branches": [
 *           [
 *             { "orders": LayerOrders },
 *             { "orders": LayerOrders },
 *           ],
 *         ],
 *       },
 *       {
 *         "orders": LayerOrders
 *       },
 *     ],
 *   ],
 * }
 *
 */

/**
 * @typedef FaceOrdersBranch
 * @type {FaceOrdersFork[]}
 * @description To compile a solution, you must include
 * a selection from every Branch inside this FaceOrdersBranchs array.
 *
 * @typedef FaceOrders
 * @type {[number, number, number][]}
 * @description an array of faceOrders. faces a and b: [a, b, solution]
 *
 * @typedef FaceOrdersFork
 * @type {{ orders: FaceOrders, branches?: FaceOrdersBranch[] }}
 * @description To compile a solution, you must choose only one item
 * from this list. Each item is a copy of one another, but with
 * different values.
 *
 * @typedef FaceOrdersSolverSolution
 * @type {FaceOrdersFork}
 * @example In this example there are three "branches", one top-level,
 * and two more inside of this one each at a similar depth.
 * The top-level branch contains two all-branches (each happen to be
 * identical in structure), and each of these all-branches contain
 * two choice-branches.
 */

/**
 * @description ignore
 */
// eslint-disable-next-line
export const __types__ = () => {};
