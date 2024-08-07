/* SVG (c) Kraft */
import * as algebra from "./algebra.js";
import * as dom from "./dom.js";
import * as cdata from "./cdata.js";
import * as path from "./path.js";
import * as transforms from "./transforms.js";
import * as viewBox from "./viewBox.js";

/**
 * Rabbit Ear (c) Kraft
 */

const general = {
	...algebra,
	...dom,
	...cdata,
	...path,
	...transforms,
	...viewBox,
};

export { general as default };
