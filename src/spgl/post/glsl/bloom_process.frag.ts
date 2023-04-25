export default `
precision mediump float;

uniform sampler2D tInput;
uniform sampler2D tDepthColor;
varying vec2 vTexCoordVP2;

uniform vec4 uKernel[BLOOM_SAMPLES];
varying vec2 vTexCoordVP;
varying vec2 vTexCoordFull;
void main(void)
{

  vec3 color = vec3(0.0);
  float c = texture2D( tDepthColor,vTexCoordVP2).r;
  c = smoothstep(0.1,0.5,c);
  for(int i=0; i<BLOOM_SAMPLES; ++i)
  {
    vec3 kernel = uKernel[i].xyz;
    color += texture2D( tInput,vTexCoordVP + kernel.xy*c ).xyz * kernel.z;
  }
  gl_FragColor = vec4( color, 1.0 );
  
  // gl_FragColor += texture2D( tDepthColor,vTexCoordVP2)*0.3;
}
`