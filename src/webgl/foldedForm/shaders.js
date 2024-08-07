export const model_300_vert = `#version 300 es
uniform mat4 u_modelView;
uniform mat4 u_matrix;
uniform vec3 u_frontColor;
uniform vec3 u_backColor;
in vec3 v_position;
in vec3 v_normal;
out vec3 front_color;
out vec3 back_color;
void main () {
	gl_Position = u_matrix * vec4(v_position, 1);
	vec3 light = abs(normalize((vec4(v_normal, 1) * u_modelView).xyz));
	float brightness = 0.5 + light.x * 0.15 + light.z * 0.35;
	front_color = u_frontColor * brightness;
	back_color = u_backColor * brightness;
}
`;

export const thick_edges_300_vert = `#version 300 es
uniform mat4 u_matrix;
uniform mat4 u_projection;
uniform mat4 u_modelView;
uniform float u_strokeWidth;
in vec3 v_position;
in vec3 v_color;
in vec3 edge_vector;
in vec2 vertex_vector;
out vec3 blend_color;
void main () {
	vec3 edge_norm = normalize(edge_vector);
	// axis most dissimilar to edge_vector
	vec3 absNorm = abs(edge_norm);
	vec3 xory = absNorm.x < absNorm.y ? vec3(1,0,0) : vec3(0,1,0);
	vec3 axis = absNorm.x > absNorm.z && absNorm.y > absNorm.z ? vec3(0,0,1) : xory;
	// two perpendiculars. with edge_vector these make basis vectors
	vec3 one = cross(axis, edge_norm);
	vec3 two = cross(one, edge_norm);
	vec3 displaceNormal = normalize(
		one * vertex_vector.x + two * vertex_vector.y
	);
	vec3 displace = displaceNormal * (u_strokeWidth * 0.5);
	gl_Position = u_matrix * vec4(v_position + displace, 1);
	blend_color = v_color;
}
`;

export const outlined_model_300_frag = `#version 300 es
#ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
#else
  precision mediump float;
#endif
uniform float u_opacity;
in vec3 front_color;
in vec3 back_color;
in vec3 outline_color;
in vec3 barycentric;
out vec4 outColor;
float edgeFactor(vec3 barycenter) {
	vec3 d = fwidth(barycenter);
	vec3 a3 = smoothstep(vec3(0.0), d*3.5, barycenter);
	return min(min(a3.x, a3.y), a3.z);
}
void main () {
	gl_FragDepth = gl_FragCoord.z;
	vec3 color = gl_FrontFacing ? front_color : back_color;
	// vec4 color4 = gl_FrontFacing
	// 	? vec4(front_color, u_opacity)
	// 	: vec4(back_color, u_opacity);
	// vec4 outline4 = vec4(outline_color, 1);
	// outColor = vec4(mix(vec3(0.0), color, edgeFactor(barycentric)), u_opacity);
	outColor = vec4(mix(outline_color, color, edgeFactor(barycentric)), u_opacity);
	// outColor = mix(outline4, color4, edgeFactor(barycentric));
}
`;

export const outlined_model_100_frag = `#version 100
precision mediump float;
uniform float u_opacity;
varying vec3 barycentric;
varying vec3 front_color;
varying vec3 back_color;
varying vec3 outline_color;
void main () {
	vec3 color = gl_FrontFacing ? front_color : back_color;
	// vec3 boundary = vec3(0.0, 0.0, 0.0);
	vec3 boundary = outline_color;
	// gl_FragDepth = 0.5;
	gl_FragColor = any(lessThan(barycentric, vec3(0.02)))
		? vec4(boundary, u_opacity)
		: vec4(color, u_opacity);
}
`;

export const model_100_vert = `#version 100
attribute vec3 v_position;
attribute vec3 v_normal;
uniform mat4 u_projection;
uniform mat4 u_modelView;
uniform mat4 u_matrix;
uniform vec3 u_frontColor;
uniform vec3 u_backColor;
varying vec3 normal_color;
varying vec3 front_color;
varying vec3 back_color;
void main () {
	gl_Position = u_matrix * vec4(v_position, 1);
	vec3 light = abs(normalize((vec4(v_normal, 1) * u_modelView).xyz));
	float brightness = 0.5 + light.x * 0.15 + light.z * 0.35;
	front_color = u_frontColor * brightness;
	back_color = u_backColor * brightness;
}
`;

export const thick_edges_100_vert = `#version 100
attribute vec3 v_position;
attribute vec3 v_color;
attribute vec3 edge_vector;
attribute vec2 vertex_vector;
uniform mat4 u_matrix;
uniform mat4 u_projection;
uniform mat4 u_modelView;
uniform float u_strokeWidth;
varying vec3 blend_color;
void main () {
	vec3 edge_norm = normalize(edge_vector);
	// axis most dissimilar to edge_vector
	vec3 absNorm = abs(edge_norm);
	vec3 xory = absNorm.x < absNorm.y ? vec3(1,0,0) : vec3(0,1,0);
	vec3 axis = absNorm.x > absNorm.z && absNorm.y > absNorm.z ? vec3(0,0,1) : xory;
	// two perpendiculars. with edge_vector these make basis vectors
	vec3 one = cross(axis, edge_norm);
	vec3 two = cross(one, edge_norm);
	vec3 displaceNormal = normalize(
		one * vertex_vector.x + two * vertex_vector.y
	);
	vec3 displace = displaceNormal * (u_strokeWidth * 0.5);
	gl_Position = u_matrix * vec4(v_position + displace, 1);
	blend_color = v_color;
}
`;

export const model_100_frag = `#version 100
precision mediump float;
uniform float u_opacity;
varying vec3 front_color;
varying vec3 back_color;
void main () {
	vec3 color = gl_FrontFacing ? front_color : back_color;
	gl_FragColor = vec4(color, u_opacity);
}
`;

export const simple_300_frag = `#version 300 es
#ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
#else
  precision mediump float;
#endif
in vec3 blend_color;
out vec4 outColor;
 
void main() {
	outColor = vec4(blend_color.rgb, 1);
}
`;

export const outlined_model_100_vert = `#version 100
attribute vec3 v_position;
attribute vec3 v_normal;
attribute vec3 v_barycentric;
uniform mat4 u_projection;
uniform mat4 u_modelView;
uniform mat4 u_matrix;
uniform vec3 u_frontColor;
uniform vec3 u_backColor;
uniform vec3 u_outlineColor;
varying vec3 normal_color;
varying vec3 barycentric;
varying vec3 front_color;
varying vec3 back_color;
varying vec3 outline_color;
void main () {
	gl_Position = u_matrix * vec4(v_position, 1);
	barycentric = v_barycentric;
	vec3 light = abs(normalize((vec4(v_normal, 1) * u_modelView).xyz));
	float brightness = 0.5 + light.x * 0.15 + light.z * 0.35;
	front_color = u_frontColor * brightness;
	back_color = u_backColor * brightness;
	outline_color = u_outlineColor;
}
`;

export const outlined_model_300_vert = `#version 300 es
uniform mat4 u_modelView;
uniform mat4 u_matrix;
uniform vec3 u_frontColor;
uniform vec3 u_backColor;
uniform vec3 u_outlineColor;
in vec3 v_position;
in vec3 v_normal;
in vec3 v_barycentric;
in float v_rawEdge;
out vec3 front_color;
out vec3 back_color;
out vec3 outline_color;
out vec3 barycentric;
// flat out int rawEdge;
flat out int provokedVertex;
void main () {
	gl_Position = u_matrix * vec4(v_position, 1);
	provokedVertex = gl_VertexID;
	barycentric = v_barycentric;
	// rawEdge = int(v_rawEdge);
	vec3 light = abs(normalize((vec4(v_normal, 1) * u_modelView).xyz));
	float brightness = 0.5 + light.x * 0.15 + light.z * 0.35;
	front_color = u_frontColor * brightness;
	back_color = u_backColor * brightness;
	outline_color = u_outlineColor;
}
`;

export const model_300_frag = `#version 300 es
#ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
#else
  precision mediump float;
#endif
uniform float u_opacity;
in vec3 front_color;
in vec3 back_color;
out vec4 outColor;
void main () {
	gl_FragDepth = gl_FragCoord.z;
	vec3 color = gl_FrontFacing ? front_color : back_color;
	outColor = vec4(color, u_opacity);
}
`;

export const simple_100_frag = `#version 100
precision mediump float;
varying vec3 blend_color;
void main () {
	gl_FragColor = vec4(blend_color.rgb, 1);
}
`;
