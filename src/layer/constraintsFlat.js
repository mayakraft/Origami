/**
 * Rabbit Ear (c) Kraft
 */
import Messages from "../environment/messages.js";
import {
	EPSILON,
} from "../math/constant.js";
import {
	connectedComponentsPairs,
} from "../graph/connectedComponents.js";
import {
	getFacesFacesOverlap,
} from "../graph/overlap.js";
import {
	makeFacesWinding,
} from "../graph/faces/winding.js";
import {
	makeFacesPolygon,
} from "../graph/make/faces.js";
import {
	solveFlatAdjacentEdges,
} from "./initialSolutionsFlat.js";
import {
	tacoTypeNames,
	emptyCategoryObject,
	constraintToFacePairsStrings,
	faceOrdersToSolverOrders,
	mergeWithoutOverwrite,
} from "./general.js";
import {
	makeTacosAndTortillas,
} from "./tacosTortillas.js";
import {
	makeTransitivity,
	getTransitivityTriosFromTacos,
} from "./transitivity.js";

/**
 * @param {{
 *   taco_taco: TacoTacoConstraint[],
 *   taco_tortilla: TacoTortillaConstraint[],
 *   tortilla_tortilla: TortillaTortillaConstraint[],
 *   transitivity: TransitivityConstraint[],
 * }} constraints
 * @returns {{
 *   taco_taco: number[][],
 *   taco_tortilla: number[][],
 *   tortilla_tortilla: number[][],
 *   transitivity: number[][],
 * }} for a particular model, a set of layer constraints sorted into
 * taco/tortilla/transitivity types, needed to be solved.
 */
export const makeConstraintsLookup = (constraints) => {
	const lookup = emptyCategoryObject();
	// fill the top layer with "taco / tortilla" category names
	tacoTypeNames.forEach(key => { lookup[key] = {}; });

	// fill every entry with an empty array
	tacoTypeNames
		.forEach(type => constraints[type]
			.forEach(constraint => constraintToFacePairsStrings[type](constraint)
				.forEach(key => { lookup[type][key] = []; })));

	// populate arrays
	tacoTypeNames
		.forEach(type => constraints[type]
			.forEach((constraint, i) => constraintToFacePairsStrings[type](constraint)
				.forEach(key => lookup[type][key].push(i))));

	return lookup;
};

/**
 * @description Convert a folded graph into the input parameters for the solver
 * including taco-taco, taco-tortilla, tortilla-tortilla, and transitivity
 * constraints.
 * @param {FOLDExtended} graph a FOLD object
 * @param {number} [epsilon=1e-6] optional epsilon. it will be calculated
 * if you leave this empty.
 * @returns {{
 *   constraints: {
 *     taco_taco: TacoTacoConstraint[],
 *     taco_tortilla: TacoTortillaConstraint[],
 *     tortilla_tortilla: TortillaTortillaConstraint[],
 *     transitivity: TransitivityConstraint[],
 *   },
 *   lookup: {
 *     taco_taco: number[][],
 *     taco_tortilla: number[][],
 *     tortilla_tortilla: number[][],
 *     transitivity: number[][],
 *   },
 *   facePairs: string[],
 *   faces_winding: boolean[],
 *   orders: { [key: string]: number },
 * }} all data required for the solver, including:
 * - constraints
 * - lookup: which tells us location of faces inside of constraints
 * - facePairs: all conditions that need to be solved, a list of
 * space-separated pairs of face indices, "a b" where a < b.
 * - faces_winding: for every face, which direction is the winding
 */
export const makeSolverConstraintsFlat = ({
	vertices_coords, edges_vertices, edges_faces, edges_assignment,
	faces_vertices, faces_edges, faceOrders, faces_center,
}, epsilon = EPSILON) => {
	// create a polygon (array of points) for every face. ensure that
	// every polygon has the same winding (reverse if necessary).
	const faces_winding = makeFacesWinding({ vertices_coords, faces_vertices });
	const faces_polygon = makeFacesPolygon({ vertices_coords, faces_vertices }, epsilon);
	faces_winding
		.map((upright, i) => (upright ? undefined : i))
		.filter(a => a !== undefined)
		.forEach(f => faces_polygon[f].reverse());

	// for every face (index) get an array of other faces (value) which
	// overlap this face. This array can contain holes.
	const faces_facesOverlap = getFacesFacesOverlap({
		vertices_coords, faces_vertices,
	}, epsilon);

	// create all of the tacos/tortillas constraints that
	// will be used by the solver.
	const {
		taco_taco, taco_tortilla, tortilla_tortilla,
	} = makeTacosAndTortillas({
		vertices_coords,
		edges_vertices,
		edges_faces,
		faces_vertices,
		faces_edges,
		faces_center,
	}, epsilon);

	// ...and the transitivity constraints
	const tacosTrios = getTransitivityTriosFromTacos({ taco_taco, taco_tortilla });
	const transitivity = makeTransitivity({ faces_polygon }, faces_facesOverlap, epsilon)
		.filter(trio => tacosTrios[trio.join(" ")] === undefined);

	// these are all the variables we need to solve- all overlapping faces in
	// pairwise combinations, as a space-separated string, smallest index first
	const facePairs = connectedComponentsPairs(faces_facesOverlap)
		.map(pair => pair.join(" "));

	// this is building a massive lookup table, it takes quite a bit of time.
	// any way we can speed this up?
	const lookup = makeConstraintsLookup({
		taco_taco,
		taco_tortilla,
		tortilla_tortilla,
		transitivity,
	});

	// if the FOLD object contains a subset of pre-solved faceOrders,
	// convert them into solver form and use them as the initial condition.
	const preExistingOrders = faceOrders
		? faceOrdersToSolverOrders(faceOrders, faces_winding)
		: {};

	// before we run the solver, solve all of the conditions that we can.
	// at this point, this means adjacent faces with an M or V edge between them.
	const flatAdjacentOrders = solveFlatAdjacentEdges({
		edges_faces,
		edges_assignment,
	}, faces_winding);

	let orders;
	try {
		orders = mergeWithoutOverwrite([preExistingOrders, flatAdjacentOrders]);
	} catch (error) {
		throw new Error(Messages.noLayerSolution, { cause: error });
	}

	return {
		constraints: {
			taco_taco,
			taco_tortilla,
			tortilla_tortilla,
			transitivity,
		},
		lookup,
		facePairs,
		faces_winding,
		orders,
	};
};
