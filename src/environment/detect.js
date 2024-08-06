/**
 * Rabbit Ear (c) Kraft
 */
const isBrowser = typeof window === "object" && typeof window.document === "object";

const isNodeOrBun =
	typeof process === "object" &&
	typeof process.versions === "object" &&
	(process.versions.node != null || process.versions.bun != null);

const isDeno =
	typeof window === "object" && "Deno" in window && typeof window.Deno === "object";

const isBackend = isNodeOrBun || isDeno;

const isWebWorker =
	typeof self === "object" &&
	self.constructor &&
	self.constructor.name === "DedicatedWorkerGlobalScope";

export { isBrowser, isBackend, isWebWorker };
