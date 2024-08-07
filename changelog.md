# 0.9.41

- WebGL creasePattern rendering renders non-flat foldAngle edges with opacity and checkerboard pattern by default.
- Cycle rendering sometimes improperly ordered the "front" and "back" sides, this was discovered to be when the chosen rootFace was flipped (false winding). This is now fixed.
- `faceContainingPoint` and `facesContainingPoint` are renamed to `getFaceUnderPoint` and `getFacesUnderPoint` respectively, moved from src/graph/faces/facePoint.js to src/graph/overlap.js. This is to match with the name of the new function `getEdgesUnderPoint` (where "contains" would have been a bit of a stretch).
- new planarize method `planarizeAllFaces()` which builds all faces as usual, but does not remove any holds. Use this when you are creating a graph from scratch, where no faces existed prior.
- foldGraph creases a fold line/ray/segment into a graph, returns a copy of the new folded vertices, and a list of edges collinear to the fold line.
- new `makeFacesFacesFromEdges` method which uses `faces_edges` as input.
- new `getFlaps` method which finds all separatable flaps.

# 0.9.4

### "class" style objects

"class" style objects have been removed, this includes `ear.vector`, `ear.matrix`, `ear.circle`, `ear.line`, `ear.rect`, `ear.polygon`, these are subsituted for their simple native structures, for the math objects, this includes:

- vector: `number[]`
- matrix: `number[]`
- polygon: `number[][]`
- circle: `{ radius: number, origin: [number, number] }`
- line: `{ vector: number[], origin: number[] }`
- rect: deprecated (kind of replaced by the bounding box `Box` type)

(additional objects `origami` `cp` described below)

previously there was a very clunky relationship between 2D and 3D class objects. now, all method parameters are strongly typed to certain dimensions, for example, a 2D vector `[number, number]`, or a 3D line `{ vector: [number, number, number], origin: [number, number, number] }`. Javascript array primitives need no special type names (they use `[number, number, number]` for example), but all of the object-types have named typed: `VecLine2`, `VecLine3`, `VecLine` (for N-dimensional), `UniqueLine` (for normal-distance 2D-only parameterization), `Circle`, `Box`.

As far as constructors go, the process is massively simplified, to create vectors, matrices, polygons, you simply use a native Javascript array. `var myVec = [1, 2, 3]`. Some convenience methods exists in **src/math/convert.js** like `pointsToLine`, `pointsToLine2`, `pointsToLine3`, `vecLineToUniqueLine`, `uniqueLineToVecLine`.

class methods do not exist on types now, they exist in the global scope: `ear.math.add2(a, b)` or `ear.math.add3(a, b)` to add 2D or 3D vectors respectively, for example. or if you are using file imports:

```js
import { add2, add3 } from "./src/math/vector.js";
const res2 = add2(a, b);
const res3 = add(u, v);
```

Origami and CP

These objects have also been deprecated in favor of the single `ear.graph` class type. `ear.graph()` will create a FOLD graph, (as well as house methods, like `ear.graph.planarize(FOLD)`, and contain static constructors like `ear.graph.square()`). This is the only remaining "class style" object. `ear.graph()` is in flux but it's intended to contain all functionality that was on `origami` and `cp`.

Design note: classes/structs are not bad things, scoped/encapuslated methods are a nice thing, they foster cleaner organization. What's not good is not being able to access methods directly, without having to convert objects to new types etc... The structure of the library is changing so much still (it is still in alpha), we need the least-cluttered, least-opinionated structure possible. **The structure of the library is simpler**, and that is the priority right now. Sorry if object methods are in the global scope for now, but for now, for the developers of the library at least, it's the fastest way to maintain and build the project.

### Various other changes

Nearly every method in the library has been strongly typed, via JSDocs, (yay! 🎉) very proud of this. JSDocs allows all form of `.d.ts` and `.d.ts.map` files to be generated (available in the [releases](https://github.com/rabbit-ear/rabbit-ear/releases), not in the github repo itself), as well as the Typescript linter to work (in any supported code editor), while the source remains in Javascript and requires no compliation step, which for developers of the library, this instant feedback is huge.

The `src/` folder structure has been completely reassembled. You will notice heavy changes to `convert/`, `graph/` `math/`, `singleVertex/` and the creation of a new folder `general/` which houses all methods that act on native Javascript primtives like arrays, doing things like sorting and clustering, basically all non-graph related, more general things.

Be careful with methods inside of `graph/` many of them have shifted from modyfing the input graph directly, to returning a modified copy. You can consult the new type definitions for this info. We now use a new meta to return an object which contains both the modified graph and the change info like this, where the "changes" often contains keys "vertices" "edges" "faces" with change info to each.

```js
{
	result: FOLD,
	changes: { vertices: object, edges: object, faces: object },
}
```

Updated docs at [docs/](https://rabbitear.org/docs/)

SVG library has remained largely untouched, except for drawing of FOLD objects (`svg.origami(FOLD, options)`) which now uses foldToSvg (see `src/convert/foldToSvg`), even this functionally remained very similar tho.

WebGL is functionally the same, a bunch of methods have been renamed though, the concept of "program" has been renamed to "Model" so as not to conflict with a `WebGLProgram`, and the name fits better anyway.

# 0.9.33 alpha

`pleat()` when given parallel lines will now correct for the case when the lines' vectors point in the opposite directions.

many of the intersection methods have been refactored and have small or dramatic speedups.

new method: `getEdgesRectOverlap()`

new method: `findSymmetryLines()` and `findSymmetryLine()` using the lines in the graph to uncover a line of symmetry.

new method: `getEdgesLine()` and its subroutine `clusterParallelVectors()` which performs a similar function as `clusterScalars()`.

new overlap methods:

```javascript
ear.graph.getFacesLineOverlap()
ear.graph.getFacesRayOverlap()
ear.graph.getFacesSegmentOverlap()
```

new method `ear.graph.getFramesByClassName()`

new method `ear.graph.getEdgeBetweenVertices()`

ear.graph.makePlanarFaces now returns an object already in FOLD form, instead of the data being inverted into an array of objects

All axiom methods return an *array* of lines. Before, some would and others would not. The system is now consistent.

replace `getGraphKeysWithPrefix` with `filterKeysWithPrefix`, maintaining the functionality of `getGraphKeysWithPrefix` where it will add the `_` character to match against. same with Suffix methods.

new method: `subgraph` and `subgraphWithFaces`, where *subgraphWithEdges* and *subgraphWithVertices* could be written in similar form.

Methods renamed:

- `{graph/cp/origami}.copy` -> `{graph/cp/origami}.clone`
- `fragment` -> `planarize`
- `getBoundingBox` -> `boundingBox`
- `getBoundaryVertices` -> `boundaryVertices`
- `getBoundary` -> `boundary`
- `getPlanarBoundary` -> `planarBoundary`
- `makeFacesFacesOverlap` -> `getFacesFaces2DOverlap`
- `makeFacesCenter` -> `makeFacesCentroid2D`
- `makeFacesCenterQuick` -> `makeFacesConvexCenter`
- `getDuplicateEdges` -> `duplicateEdges`
- `getCircularEdges` -> `circularEdges`
- `getVerticesClusters` -> `verticesClusters`
- `getDuplicateVertices` -> `duplicateVertices`
- `getEdgeIsolatedVertices` -> `edgeIsolatedVertices`
- `getFaceIsolatedVertices` -> `faceIsolatedVertices`
- `getIsolatedVertices` -> `isolatedVertices`
- `getCoplanarFacesGroups` -> `coplanarFacesGroups`
- `getOverlappingFacesGroups` -> `overlappingFacesGroups`
- `makeTrianglePairs` -> `chooseTwoPairs`
- `clusterArrayValues` -> `clusterScalars`
- `getDisjointedVertices` -> `disjointVerticesSets`

`makeEdgesAssignment` has been renamed to `makeEdgesAssignmentSimple` and `makeEdgesAssignment` now also assigns "B" boundary edges by checking edges_faces for # of incident faces.

new WebGL implementation. see: [readme.md](https://github.com/robbykraft/Origami/tree/master/src/webgl) and [foldfile.com](https://foldfile.com)

Various methods will now throw Errors instead of console.error or console.warn. Not all console.warn have been removed however. The distinction is that if the function is still able to generate a solution, it will console.warn. If the function generated something which contains errors or misleading information, it throws an error.

New subcategory `ear.webgl` containing at least: `createProgram`, `initialize`, `foldedForm`, `creasePattern`, `rebuildViewport`, `makeProjectionMatrix`, `makeModelMatrix`, `drawProgram`, `deallocProgram`, with many more methods specific to drawing different styles with different shaders.

new Matrix4 type. new Quaternion type. new projection matrices.

new method `ear.graph.nearest`, which was already in the `graph()` object as a prototype method. now exists in the top level.

all matrix scale methods takes an array of values instead of one number, allowing non-uniform axis scaling.

`ear.graph.getBoundingBox` will return "undefined" if the graph does not contain any vertices_coords. previously this would throw an error.

new `nudgeVerticesWithFacesLayer`, `nudgeVerticesWithFaceOrders` for nudging vertices in an exploded graph based on layer order.

`src/layer/topological.js` contains a new topological sort method. currently not being exported.

new `.convert` with the first (of many, hopefully) file conversions: `.obj` to `.fold`, which includes computing edges_foldAngle and giving them a "M" "V" assignment.

new methods `getCoplanarFacesGroups`,  `getOverlappingFacesGroups` which will find all groups of faces which share the same plane in 3D space (`getCoplanarFacesGroups`), and then in the case of `getOverlappingFacesGroups` actually compute whether or not they overlap.

new method `selfRelationalUniqueIndexPairs`, given any array of self-referential data (vertices_vertices, faces_faces, etc), create a list of unique pairwise combinations of related indices.

rewrite of `getVerticesClusters`, implemented a line sweep and the runtime has been massively improved.

refactor fold/keys and fold/spec, simplify methods that get exposed in the final build.

# 0.9.32 alpha

new layer solver implementation at ear.layer.solver(), huge performance improvement. solver returns data bound to a prototype which includes methods to process and analyze the data. methods include

```javascript
count()
solution(...indices)
allSolutions()
facesLayer(...indices)
allFacesLayers()
faceOrders(...indices)
allFaceOrders()
```

ear.layer.assignmentSolver renamed to ear.layer.singleVertexAssignmentSolver.

ear.math.enclosingBoundingBoxes, new method. test if one bounding box is entirely inside another.

ear.graph.makeEdgesEdgesSimilar, answers which edges have the same endpoints (vertices) as other edges. endpoints can be in any order.

performance improvements for ear.graph.makeFacesFacesOverlap, ear.graph.makeEdgesFacesOverlap.

# 0.9.31 alpha

axiom function wrapper has changed. `validate()` is now exposed to the user, as is the `axiomInBoundary` methods. Normal-distance parameterization methods are now named as such.

new convex hull algorithm. two entrypoints: `convexHull` returns points, `convexHullIndices` returns indices of points from your points parameter array.

`onLeave` added to the other three methods `onMove` `onPress` `onRelease` for SVG elements.

# 0.9.3 alpha

no longer requiring @xmldom/xmldom as a dependency. This library now has zero dependencies! [1]

`clean()` takes no options now and performs one consistent task: removes all bad edges and vertices. if you like you can call each submethod now `removeDuplicateVertices`, `removeCircularEdges`, `removeDuplicateEdges`, `removeIsolatedVertices`.

axiom function parameters have now changed to the much simpler "point, line" to consistenly separate types. This replaces "point, origin, vector" inputs where "origin, vector" are two components which describe a line, and "point" is points... **to update: modify your axiom function parameters, whever it asks for a line, make a ear.line() objects from your previous origin/vector pairs.**

```javascript
ear.graph.getBoundaryVertices // unsorted
ear.graph.getBoundary.vertices // sorted
```

> [1] if you use Rabbit Ear in NodeJS and create a SVG elements (virtually), you will need to import @xmldom. Because this is such a unique rare case, this is left to the user. This will be explained in the documentation.
