/* SVG (c) Kraft */
import { isBrowser } from "./detect.js";
import Messages from "./messages.js";

/**
 * Rabbit Ear (c) Kraft
 */

// store a pointer to the window object here.
const windowContainer = { window: undefined };

// if we are in the browser, by default use the browser's "window".
if (isBrowser) {
	windowContainer.window = window;
}

/**
 * @description create the window.document object, if it does not exist.
 */
const buildDocument = (newWindow) =>
	new newWindow.DOMParser().parseFromString(
		"<!DOCTYPE html><title>.</title>",
		"text/html",
	);

/**
 * @description This method allows the app to run in both a browser
 * environment, as well as some back-end environment like node.js.
 * In the case of a browser, no need to call this.
 * In the case of a back end environment, include some library such
 * as the popular @XMLDom package and pass it in as the argument here.
 */
const setWindow = (newWindow) => {
	// make sure window has a document. xmldom does not, and requires it be built.
	if (!newWindow.document) {
		newWindow.document = buildDocument(newWindow);
	}
	windowContainer.window = newWindow;
	return windowContainer.window;
};

/**
 * @description get the "window" object, which should have
 * DOMParser, XMLSerializer, and document.
 */
const RabbitEarWindow = () => {
	if (windowContainer.window === undefined) {
		throw new Error(Messages.window);
	}
	return windowContainer.window;
};

export { RabbitEarWindow as default, setWindow };
