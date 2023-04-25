precision highp float;

uniform mat4 uMVP;
attribute vec3 aPosition;
attribute vec2 aTexCoord;
varying vec2 vUv;
void main() {
    vUv = aTexCoord;
    gl_Position = uMVP * vec4(aPosition, 1.0);
}