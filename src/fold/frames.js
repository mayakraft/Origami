/**
 * Rabbit Ear (c) Kraft
 */
import Messages from "../environment/messages.js";
import { clone } from "../general/clone.js";
import { filterKeysWithPrefix } from "./spec.js";

/**
 * @description Frames can be children of other frames via. the
 * frame_parent and frame_inherit properties potentially creating a
 * recursive inheritance. This method will "flatten" a frame by
 * gathering all of its inherited parent frames and collapsing the
 * stack into one single frame. The input graph itself will not be modified.
 * @param {FOLD} graph a FOLD object
 * @param {number} frameNumber which frame number to flatten (0 is the top level)
 * @returns {FOLD} one single, flattened FOLD frame (with no file_frames)
 */
export const flattenFrame = (graph, frameNumber = 0) => {
	if (!graph.file_frames || graph.file_frames.length < frameNumber) {
		return graph;
	}

	// prevent cycles. never visit a frame twice
	const visited = {};

	// this is entirely optional, for the final result,
	// we can copy over all the file_ metadata into the frame.
	const fileMetadata = {};
	filterKeysWithPrefix(graph, "file")
		.filter((key) => key !== "file_frames")
		.forEach((key) => {
			fileMetadata[key] = graph[key];
		});

	/**
	 * @description recurse from the desired frame up through its parent
	 * frames until we reach frame index 0, or a frame with no parent.
	 * @param {number} currentIndex
	 * @param {number[]} previousOrders
	 * @returns {number[]} a list of frame indices, from parent to child.
	 */
	const recurse = (currentIndex, previousOrders) => {
		// prevent cycles
		if (visited[currentIndex]) {
			throw new Error(Messages.graphCycle);
		}
		visited[currentIndex] = true;

		// add currentIndex to the start of the list of previous frame indices
		const thisOrders = [currentIndex].concat(previousOrders);

		// get a reference to the current frame
		/** @type {FOLDInternalFrame} */
		const frame =
			currentIndex > 0 ? { ...graph.file_frames[currentIndex - 1] } : { ...graph };

		// if the frame inherits and contains a parent, recurse
		// if not, we are done, return the list of orders.
		return frame.frame_inherit && frame.frame_parent != null
			? recurse(frame.frame_parent, thisOrders)
			: thisOrders;
	};

	// recurse, get a list of frame indices from parent to child,
	// convert the indices into shallow copies of the frames, and
	// sequentially reduce all frames into a single frame object.
	const flattened = recurse(frameNumber, [])
		.map((frameNum) => {
			// shallow copy reference to the frame. this allows us to be able to
			// delete any key/values we need to and not affect the input graph.
			const frame = frameNum > 0 ? { ...graph.file_frames[frameNum - 1] } : { ...graph };

			// remove any reference of these keys from the frame
			["file_frames", "frame_parent", "frame_inherit"].forEach(
				(key) => delete frame[key],
			);
			return frame;
		})
		.reduce((a, b) => ({ ...a, ...b }), fileMetadata);

	// this is optional, but this ensures that this method can be treated
	// "functionally" and using this method will not cause any side effects
	return clone(flattened);
};

/**
 * @description Get a flat array of all file_frames, where the top-level
 * is index 0, and the file_frames follow in sequence.
 * This does not perform any frame-collapsing if a frame inherits from
 * a parent, the frames are maintained in their original form.
 * The objects in the result are a shallow copy so they still hold
 * references to the original FOLD object provided in the input.
 * @param {FOLD} graph a FOLD object
 * @returns {FOLD[]} an array of FOLD objects, single frames in a flat array.
 */
export const getFileFramesAsArray = (graph) => {
	if (!graph) {
		return [];
	}
	if (!graph.file_frames || !graph.file_frames.length) {
		return [graph];
	}
	const frame0 = { ...graph };
	delete frame0.file_frames;
	return [frame0, ...graph.file_frames];
};

/**
 * @description Get the number of file frames in a FOLD object.
 * The top level is the first frame, then every entry inside of
 * "file_frames" increments the count by 1.
 * @param {FOLD} graph a FOLD object.
 * @returns {number} the number of frames in the FOLD object.
 */
export const countFrames = ({ file_frames }) =>
	!file_frames ? 1 : file_frames.length + 1;

/**
 * @description Get all frames inside a FOLD object which contain a
 * frame_classes class matching the provided className string
 * @param {FOLD} graph a FOLD object
 * @param {string} className the name of the class inside frame_classes
 * @returns {FOLD[]} an array of FOLD object frames.
 */
export const getFramesByClassName = (graph, className) =>
	Array.from(Array(countFrames(graph)))
		.map((_, i) => flattenFrame(graph, i))
		.filter((frame) => frame.frame_classes && frame.frame_classes.includes(className));
