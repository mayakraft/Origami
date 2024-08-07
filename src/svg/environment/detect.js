/* SVG (c) Kraft */
/**
 * Rabbit Ear (c) Kraft
 */

const isBrowser = typeof window === "object" && typeof window.document === "object";

typeof process === "object" &&
	typeof process.versions === "object" &&
	(process.versions.node != null || process.versions.bun != null);

export { isBrowser };
