/**
 * Rabbit Ear (c) Kraft
 */

/**
 * @param {[number, number, number][]} orders, such as faceOrders or edgeOrders
 * @param {string} name a descriptive string of which orders these are,
 * "faceOrders" or "edgeOrders".
 * @returns {string[]}
 */
const ordersTest = (orders, name = "orders") => {
	// orders between two faces that are actually the same face
	const sameFaceOrders = orders
		.map(([a, b], i) => (a === b ? [a, b, i] : undefined))
		.filter(a => a !== undefined)
		.map(([a, b, i]) => `${name} between the same face ${a}, ${b} at index ${i}`);
	const pairHash = {};
	const duplicateOrders = orders
		.filter(([a, b]) => {
			const key = a < b ? `${a} ${b}` : `${b} ${a}`;
			const isDuplicate = pairHash[key] === true;
			pairHash[key] = true;
			return isDuplicate;
		})
		.map(([a, b]) => `${name} duplicate orders found between faces ${a}-${b}`);
	return sameFaceOrders.concat(duplicateOrders);
};

/**
 * @param {FOLD} graph a FOLD object
 * @returns {string[]} a list of errors if they exist
 */
export const validateOrders = (graph) => {
	const ordersErrors = [];
	if (graph.faceOrders) {
		ordersErrors.push(...ordersTest(graph.faceOrders, "faceOrders"));
	}
	if (graph.edgeOrders) {
		ordersErrors.push(...ordersTest(graph.edgeOrders, "edgeOrders"));
	}
	return ordersErrors;
};
