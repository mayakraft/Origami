/**
 * Rabbit Ear (c) Kraft
 */

/**
 * maintain one "window" object for both browser and nodejs.
 * if a browser window object exists, it will set to this,
 * including inside a node/react website for example in
 * backend-specific nodejs you will need to assign this
 * window object yourself to a XML DOM library, (url below),
 * by running: ear.window = xmldom (the default export)
 *
 * - @xmldom/xmldom: https://www.npmjs.com/package/@xmldom/xmldom
 *
 * note: xmldom supports DOMParser, XMLSerializer, and document,
 * but not cancelAnimationFrame, requestAnimationFrame, fetch,
 * which are used by this library. These parts of the library
 * will not work in Node.
 */
import { isBrowser } from "./detect.js";
import Messages from "./messages.js";

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
export const setWindow = (newWindow) => {
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

export default RabbitEarWindow;
