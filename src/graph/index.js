/**
 * Rabbit Ear (c) Kraft
 */
import * as foldColors from "../fold/colors.js";
import * as foldFileFrames from "../fold/frames.js";
import * as foldSpecMethods from "../fold/spec.js";
import * as addVertices from "./add/vertex.js";
import * as addEdges from "./add/edge.js";
import * as edgesCircular from "./edges/circular.js";
import * as edgesDuplicate from "./edges/duplicate.js";
import * as edgesLines from "./edges/lines.js";
import * as facesPlanes from "./faces/planes.js";
import * as facesMatrix from "./faces/matrix.js";
import * as facesWinding from "./faces/winding.js";
import * as foldGraphPolyline from "./fold/foldGraphPolyline.js";
import * as flatFold from "./fold/flatFold.js";
import * as foldLine from "./fold/foldLine.js";
import * as foldFoldedForm from "./fold/foldFoldedForm.js";
import * as splitEdge from "./split/splitEdge.js";
import * as splitFace from "./split/splitFace.js";
import * as splitLine from "./split/splitLine.js";
import * as splitGraph from "./split/splitGraph.js";
import * as verticesClusters from "./vertices/clusters.js";
import * as verticesCollinear from "./vertices/collinear.js";
import * as verticesDuplicate from "./vertices/duplicate.js";
import * as verticesFolded from "./vertices/folded.js";
import * as verticesIsolated from "./vertices/isolated.js";
import * as verticesSort from "./vertices/sort.js";
import * as boundary from "./boundary.js";
import * as clean from "./clean.js";
import * as connectedComponents from "./connectedComponents.js";
import * as count from "./count.js";
import * as directedGraph from "./directedGraph.js";
import * as disjoint from "./disjoint.js";
import * as explodeMethods from "./explode.js";
// import * as flaps from "./flaps.js";
import * as intersect from "./intersect.js";
import * as join from "./join.js";
import * as maps from "./maps.js";
import * as nearestMethods from "./nearest.js";
import * as normalize from "./normalize.js";
import * as normals from "./normals.js";
import * as orders from "./orders.js";
import * as overlap from "./overlap.js";
import * as planarize from "./planarize.js";
import * as pleat from "./pleat.js";
import * as populate from "./populate.js";
import * as remove from "./remove.js";
import * as replace from "./replace.js";
import * as subgraphMethods from "./subgraph.js";
import * as sweep from "./sweep.js";
import * as transfer from "./transfer.js";
import * as transform from "./transform.js";
import * as trees from "./trees.js";
import * as triangulateMethods from "./triangulate.js";
import * as walk from "./walk.js";
import * as validate from "./validate.js";
import make from "./make/index.js";

// these are included via. a backdoor system, in src/index.js, all of these
// methods are bound to the the prototype, constructor graph(), which already
// contains references to the methods in these files:
// import * as foldBases from "../fold/bases.js";

export default {
	...foldColors,
	...foldFileFrames,
	...foldSpecMethods,
	...addVertices,
	...addEdges,
	...edgesCircular,
	...edgesDuplicate,
	...edgesLines,
	...facesPlanes,
	...facesMatrix,
	...facesWinding,
	...foldGraphPolyline,
	...flatFold,
	...foldLine,
	...foldFoldedForm,
	...verticesClusters,
	...verticesCollinear,
	...verticesDuplicate,
	...verticesFolded,
	...verticesIsolated,
	...verticesSort,
	...boundary,
	...clean,
	...connectedComponents,
	...count,
	...directedGraph,
	...disjoint,
	...explodeMethods,
	// ...flaps,
	...intersect,
	...join,
	...make,
	...maps,
	...nearestMethods,
	...normalize,
	...normals,
	...orders,
	...overlap,
	...planarize,
	...pleat,
	...populate,
	...remove,
	...replace,
	...splitEdge,
	...splitFace,
	...splitLine,
	...splitGraph,
	...subgraphMethods,
	...sweep,
	...transfer,
	...transform,
	...trees,
	...triangulateMethods,
	...walk,
	...validate,
};
