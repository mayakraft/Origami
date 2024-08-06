/* SVG (c) Kraft */
import RabbitEarWindow from "../environment/window.js";
import NS from "../spec/namespace.js";
import nodes_children from "../spec/nodes_children.js";
import nodes_attributes from "../spec/nodes_attributes.js";
import { toCamel } from "../general/string.js";
import extensions from "./extensions/index.js";

/**
 * Rabbit Ear (c) Kraft
 */

const passthroughArgs = (...args) => args;
/**
 * @description This is the main constructor for the library which generates
 * SVGElements (DOM elements) using createElementNS in the svg namespace.
 * Additionally, this element will be bound with methods to operate on the
 * element itself, which do things like set an attribute value or
 * create a child of this object.
 * Using this constructor, this library has full support for all elements
 * in the SVG spec (I think so, double check me on this), additionally,
 * some custom elements, for example "arrow" which makes a few shapes under
 * a single <g> group. So this library is highly extendable, you can write
 * your own "arrow" objects, see more inside this directory's subdirectories.
 * @param {string} name the name of the element, although, slightly abstracted
 * from the actual element name, like "line" for <line> because it supports
 * custom elements, "arrow", which in turn will create a <g> or <path> etc..
 * @param {object} parent the parent to append this new node as a child to.
 */
const Constructor = (name, parent, ...initArgs) => {
	// the node name (like "line" for <line>) which is usually the
	// same as "name", but can sometimes differ in the case of custom elements
	const nodeName =
		extensions[name] && extensions[name].nodeName ? extensions[name].nodeName : name;
	const { init, args, methods } = extensions[name] || {};
	const attributes = nodes_attributes[nodeName] || [];
	const children = nodes_children[nodeName] || [];

	// create the element itself under the svg namespace.
	// or, if the extension specifies a custom initializer, run it instead
	const element = init
		? init(parent, ...initArgs)
		: RabbitEarWindow().document.createElementNS(NS, nodeName);

	// if the parent exists, and the element has no parent yet (could have been
	// added during the init), make this element a child.
	if (parent && !element.parentElement) {
		parent.appendChild(element);
	}

	// some element initializers can set some attributes set right after
	// initialization, if the extension specifies how to assign them,
	// if so, they will map to the indices in the nodes nodes_attributes.
	const processArgs = args || passthroughArgs;
	processArgs(...initArgs).forEach((v, i) => {
		element.setAttribute(nodes_attributes[nodeName][i], v);
	});

	// if the extension specifies methods these will be bound to the object
	if (methods) {
		Object.keys(methods).forEach((methodName) =>
			Object.defineProperty(element, methodName, {
				value: function () {
					return methods[methodName](element, ...arguments);
				},
			}),
		);
	}

	// camelCase functional style attribute setters, like .stroke() .strokeWidth()
	attributes.forEach((attribute) => {
		const attrNameCamel = toCamel(attribute);
		if (element[attrNameCamel]) {
			return;
		}
		Object.defineProperty(element, attrNameCamel, {
			value: function () {
				element.setAttribute(attribute, ...arguments);
				return element;
			},
		});
	});

	// allow this element to initialize another element, and this
	// child element will be automatically appended to this element
	children.forEach((childNode) => {
		if (element[childNode]) {
			return;
		}
		const value = function () {
			return Constructor(childNode, element, ...arguments);
		};
		Object.defineProperty(element, childNode, { value });
	});

	return element;
};

export { Constructor as default };
