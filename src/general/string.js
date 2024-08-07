/**
 * Rabbit Ear (c) Kraft
 */

/**
 * @description Convert a string into camel case from kebab or snake case.
 * @param {string} s a string in kebab or snake case
 * @returns {string} a string in camel case
 */
export const toCamel = (s) =>
	s.replace(/([-_][a-z])/gi, ($1) => $1.toUpperCase().replace("-", "").replace("_", ""));

/**
 * @description Convert a string into kebab case from camel case.
 * Snake case does not work in this method.
 * @param {string} s a string in camel case
 * @returns {string} a string in kebab case
 */
export const toKebab = (s) =>
	s
		.replace(/([a-z0-9])([A-Z])/g, "$1-$2")
		.replace(/([A-Z])([A-Z])(?=[a-z])/g, "$1-$2")
		.toLowerCase();

/**
 * @description Capitalize the first letter of a string.
 * @param {string} s a string
 * @returns {string} a copy of the string, capitalized.
 */
export const capitalized = (s) => s.charAt(0).toUpperCase() + s.slice(1);
