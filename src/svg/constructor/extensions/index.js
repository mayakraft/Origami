/* SVG (c) Kraft */
import svgDef from "./svg/index.js";
import gDef from "./g.js";
import circleDef from "./circle.js";
import ellipseDef from "./ellipse.js";
import lineDef from "./line.js";
import pathDef from "./path.js";
import rectDef from "./rect.js";
import styleDef from "./style.js";
import textDef from "./text.js";
import maskTypes from "./maskTypes.js";
import polyDefs from "./polys.js";
import arcDef from "./arc/index.js";
import arrowDef from "./arrow/index.js";
import curveDef from "./curve/index.js";
import wedgeDef from "./wedge/index.js";
import origamiDef from "./origami/index.js";

/**
 * Rabbit Ear (c) Kraft
 */
/**
 * in each of these instances, arguments maps the arguments to attributes
 * as the attributes are listed in the "attributes" folder.
 *
 * arguments: function. this should convert the array of arguments into
 * an array of (processed) arguments. 1:1. arguments into arguments.
 * make sure it is returning an array.
 *
 */
const extensions = {
	...svgDef,
	...gDef,
	...circleDef,
	...ellipseDef,
	...lineDef,
	...pathDef,
	...rectDef,
	...styleDef,
	...textDef,
	// multiple
	...maskTypes,
	...polyDefs,
	// extensions
	...arcDef,
	...arrowDef,
	...curveDef,
	...wedgeDef,
	...origamiDef,
};

export { extensions as default };
