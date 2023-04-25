precision highp float;
#extension GL_EXT_shader_texture_lod : enable

varying vec2 vUv;

uniform sampler2D tEquirect;
vec3 ToLinear(vec3 c) {
    c.x = pow(c.x, 2.2);
    c.y = pow(c.y, 2.2);
    c.z = pow(c.z, 2.2);

    return c;
}
vec3 TosRGB(vec3 c) {
    c.x = pow(c.x, 1.0 / 2.2);
    c.y = pow(c.y, 1.0 / 2.2);
    c.z = pow(c.z, 1.0 / 2.2);

    return c;
}
void main() {
    // vec3 color = texture2D(tEquirect, vUv).xyz;
    vec3 color = texture2DLodEXT(tEquirect, vUv, 7.0).xyz;
    color = ToLinear(color);
    gl_FragColor = vec4(color, 1.0);
}