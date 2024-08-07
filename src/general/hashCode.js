/**
 * Rabbit Ear (c) Kraft
 */

/**
 * @description a javascript re-implementation of Java's .hashCode()
 * https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
 * @statistics 2020 Macbook Pro M1:
 * 1.7ms: 100kb string
 * 4.7ms: 500kb string
 * 7.8ms: 1mb string
 * 34ms: 5mb string
 * 68ms: 10mb string
 * 656ms: 100mb string
 * @param {string} string a string
 * @returns {number} a unique number
 */
export const hashCode = (string) => {
	let hash = 0;
	for (let i = 0; i < string.length; i += 1) {
		hash = (hash << 5) - hash + string.charCodeAt(i);
		hash |= 0; // Convert to 32bit integer
	}
	return hash;
};
