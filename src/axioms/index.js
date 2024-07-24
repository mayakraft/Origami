/**
 * Rabbit Ear (c) Kraft
 */

import * as Axioms from "./axioms.js";
import * as ValidAxioms from "./valid.js";
import * as ValidateAxioms from "./validate.js";

export default {
	...Axioms,
	...ValidAxioms,
	...ValidateAxioms,
};
