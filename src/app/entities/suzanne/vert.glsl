precision highp float;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 modelMatrix;
uniform vec3 cameraPosition;

// uniform mat4 uMVP;

attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec2 aTexCoord;

varying vec3 wNormalInterp;
varying vec3 viewDir;
varying vec3 vertPos;
varying vec3 viewVector;
varying vec2 vUv;

void main() {
	vUv = aTexCoord;
	gl_Position = projectionMatrix * modelMatrix * vec4(aPosition, 1.0);
	// gl_Position = projectionMatrix * modelViewMatrix * vec4(aPosition, 1.0);

	vec4 vertPos4 = modelViewMatrix * vec4(aPosition, 1.0);

	vertPos = vec3(vertPos4) / vertPos4.w;
	
	// viewVector = (modelMatrix * vec4(aPosition, 1.0)).xyz - cameraPosition;
	viewVector = (modelMatrix * vec4(aPosition, 1.0)).xyz - cameraPosition;
	// viewVector = aPosition - cameraPosition;
	// viewVector =  cameraPosition;
	// vec3 wPosition;
	wNormalInterp = normalize(vec4(aNormal, 0.0) * modelMatrix).rgb;
	// wPosition = (vec4(aPosition, 1.0) * modelMatrix).rgb;
	// viewDir = normalize(cameraPosition - wPosition);

	mat4 LM = modelMatrix;
	LM[2][3] = 0.0;
	LM[3][0] = 0.0;
	LM[3][1] = 0.0;
	LM[3][2] = 0.0;
	vec4 GN = LM * vec4(aNormal.xyz, 1.0);
	// wNormalInterp = normalize(GN.xyz);
	viewDir = normalize(GN.xyz - cameraPosition);
	// viewVector =  viewDir;
//   viewDir = normalize(wPosition);
//   viewDir = normalize(cameraPosition);
  // wNormalInterp = normalize(vec3(modelViewMatrix * vec4(aNormal, 0.0)));

}