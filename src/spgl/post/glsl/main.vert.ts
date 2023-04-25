export default `
precision highp float;

attribute vec2 aTexCoord0;

varying vec2 vTexCoordVP;
varying vec2 vTexCoordFull;

uniform vec2 uViewportScale;
uniform vec2 uViewportScale2;
varying vec2 vTexCoordVP2;

void main(void)
{
  vTexCoordVP2   = aTexCoord0 * uViewportScale2;
  vTexCoordVP   = aTexCoord0 * uViewportScale;
  vTexCoordFull = aTexCoord0;

  gl_Position.xy = 2.0 * aTexCoord0-vec2(1.0,1.0);
  gl_Position.zw = vec2(0.0,1.0);
}
`