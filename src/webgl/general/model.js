/**
 * Rabbit Ear (c) Kraft
 */

/**
 * @param {WebGLRenderingContext|WebGL2RenderingContext} gl a WebGL context
 * @param {number} version 1 or 2, which WebGL version.
 * @param {WebGLModel} model the result of calling CreasePattern() FoldedForm()...
 * @param {{ [key: string]: WebGLUniform }} uniforms the result of calling makeUniforms()
 */
export const drawModel = (gl, version, model, uniforms = {}) => {
	gl.useProgram(model.program);
	model.flags.forEach((flag) => gl.enable(flag));

	// set uniforms
	/** @type {number} */
	const uniformCount = gl.getProgramParameter(model.program, gl.ACTIVE_UNIFORMS);
	for (let i = 0; i < uniformCount; i += 1) {
		const uniformName = gl.getActiveUniform(model.program, i).name;
		if (!uniforms[uniformName]) {
			continue;
		}
		const { func, value } = uniforms[uniformName];
		const index = gl.getUniformLocation(model.program, uniformName);
		switch (func) {
			case "uniformMatrix2fv":
			case "uniformMatrix3fv":
			case "uniformMatrix4fv":
				gl[func](index, false, value);
				break;
			// all other WebGLRenderingContext.uniform[1234][fi][v]()
			default:
				gl[func](index, value);
				break;
		}
	}

	// set vertex arrays
	model.vertexArrays.forEach((el) => {
		gl.bindBuffer(gl.ARRAY_BUFFER, el.buffer);
		gl.bufferData(gl.ARRAY_BUFFER, el.data, gl.STATIC_DRAW);
		gl.vertexAttribPointer(el.location, el.length, el.type, false, 0, 0);
		gl.enableVertexAttribArray(el.location);
	});

	// gl.linkProgram(model.program);
	// draw elements
	// WebGL 2 supports UNSIGNED_INT (Uint32Array)
	// WebGL 1 cannot and must use UNSIGNED_SHORT (Uint16Array)
	model.elementArrays.forEach((el) => {
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, el.buffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, el.data, gl.STATIC_DRAW);
		gl.drawElements(
			el.mode, // GL.TRIANGLES for example
			el.data.length,
			version === 2 ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT,
			0, // offset
		);
	});
	model.flags.forEach((flag) => gl.disable(flag));
};

/**
 * @param {WebGLRenderingContext|WebGL2RenderingContext} gl a WebGL context
 * @param {WebGLModel} model the result of calling CreasePattern() FoldedForm()...
 */
export const deallocModel = (gl, model) => {
	model.vertexArrays.forEach((vert) => gl.disableVertexAttribArray(vert.location));
	model.vertexArrays.forEach((vert) => gl.deleteBuffer(vert.buffer));
	model.elementArrays.forEach((elements) => gl.deleteBuffer(elements.buffer));
	gl.deleteProgram(model.program);
	// gl.deleteTexture(someTexture);
	// gl.deleteRenderbuffer(someRenderbuffer);
	// gl.deleteFramebuffer(someFramebuffer);
};
