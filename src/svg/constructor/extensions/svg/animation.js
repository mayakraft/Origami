/* SVG (c) Kraft */
import RabbitEarWindow from "../../../environment/window.js";
import { makeUUID } from "../../../general/string.js";

/**
 * Rabbit Ear (c) Kraft
 */

const Animation = function (element) {
	let start;
	let frame = 0;
	let requestId;
	const handlers = {};

	const stop = () => {
		if (RabbitEarWindow().cancelAnimationFrame) {
			RabbitEarWindow().cancelAnimationFrame(requestId);
		}
		Object.keys(handlers).forEach((uuid) => delete handlers[uuid]);
	};

	const play = (handler) => {
		stop();
		if (!handler || !RabbitEarWindow().requestAnimationFrame) {
			return;
		}
		start = performance.now();
		frame = 0;
		const uuid = makeUUID();
		handlers[uuid] = (now) => {
			const time = (now - start) * 1e-3;
			handler({ time, frame });
			frame += 1;
			if (handlers[uuid]) {
				requestId = RabbitEarWindow().requestAnimationFrame(handlers[uuid]);
			}
		};
		requestId = RabbitEarWindow().requestAnimationFrame(handlers[uuid]);
	};

	Object.defineProperty(element, "play", { set: play, enumerable: true });
	Object.defineProperty(element, "stop", { value: stop, enumerable: true });
};

export { Animation as default };
