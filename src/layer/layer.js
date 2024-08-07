/**
 * Rabbit Ear (c) Kraft
 */
import { solveFaceOrders, solveFaceOrders3D } from "./solve.js";
import { LayerPrototype } from "./prototype.js";

/**
 * @description Find all possible layer orderings of the faces
 * in a flat-foldable origami model. The result contains all possible
 * solutions, use the prototype methods available on this return object
 * to choose one solution, among other available options.
 * @param {FOLD} graph a FOLD object with folded vertices in 2D
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {typeof LayerPrototype} a layer solution object
 */
export const layer = (graph, epsilon) =>
	Object.assign(Object.create(LayerPrototype), solveFaceOrders(graph, epsilon));

/**
 * @description Find all possible layer orderings of the faces
 * in a valid 3D-foldable origami model. The result contains all possible
 * solutions, use the prototype methods available on this return object
 * to choose one solution, among other available options.
 * @param {FOLD} graph a FOLD object with folded vertices in 3D or 2D
 * @param {number} [epsilon=1e-6] an optional epsilon
 * @returns {typeof LayerPrototype} a layer solution object
 */
export const layer3D = (graph, epsilon) =>
	Object.assign(Object.create(LayerPrototype), solveFaceOrders3D(graph, epsilon));
