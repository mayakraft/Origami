/**
 * Rabbit Ear (c) Robby Kraft
 */
import math from "../math";
import GraphProto from "./graph";
import { clip_line } from "../graph/clip";
import add_vertices from "../graph/add/add_vertices";
import { fn_cat } from "../arguments/functions";
import {
  VERTICES,
  EDGES,
  FACES,
} from "../graph/fold_keys";
import {
  get_graph_keys_with_prefix,
} from "../graph/fold_spec";
import flat_fold from "../graph/flat_fold/index";
import {
	make_vertices_coords_folded
} from "../graph/make";
import clone from "../graph/clone";

/**
 * Origami - a model of an origami paper
 * prototype is Graph, built on the FOLD format.
 */
const OrigamiProto = {};
OrigamiProto.prototype = Object.create(GraphProto);
OrigamiProto.prototype.constructor = OrigamiProto;

OrigamiProto.prototype.flatFold = function () {
	const line = math.core.get_line(arguments);
	const graph = flat_fold(this, line.vector, line.origin);
  [VERTICES, EDGES, FACES]
    .map(key => get_graph_keys_with_prefix(this, key))
    .reduce(fn_cat, [])
    .forEach(key => delete this[key]);
	Object.assign(this, graph);
	return this;
};

OrigamiProto.prototype.copy = function () {
  return Object.assign(Object.create(OrigamiProto.prototype), clone(this));
};

OrigamiProto.prototype.folded = function () {
	const vertices_coords = make_vertices_coords_folded(this);
	return Object.assign(
		Object.create(OrigamiProto.prototype),
		Object.assign(clone(this), { vertices_coords }));
};

export default OrigamiProto.prototype;
