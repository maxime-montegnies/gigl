
// attribute vec2 aPosition;
attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec3 aTangent;
attribute vec2 aTexCoord;
uniform mat4 uMVP;

uniform mat4 uV;
uniform mat4 uModelView;
varying vec2 vUv;
varying vec3 vNormal;

uniform float uTime;
varying float iTime;
varying float diffuseMul;
varying mat3 TBN;

varying vec3 vTangent;
varying vec3 vBinormal;
varying vec3 vEye;

void main(){
  vUv = aTexCoord;
  iTime = uTime;

  vec4 pos = vec4( aPosition, 1.0 );
  
  // Transform the position by the model matrix:
  // vec4 mp = uModelView * vec4(aPosition, 1);
  vec4 mp = uMVP * vec4(aPosition, 1);
  // Compute the direction of the eye relative to the position:
  vec3 eye = vec3(0.0,0.0,240.0);
  vEye       = normalize(mp.xyz - eye);
  // Transfomr the *directions* of the normal and position-relative-to-eye so
  // that the matcap stays aligned with the view:
  vEye = mat3(uV) * vEye;
  // n = mat3(view) * n;


  vNormal = (uModelView * vec4( aNormal, 0.0 )).rgb;

  vec3 T = normalize(vec3(uModelView * vec4(aTangent, 0.0)));
  vec3 N = normalize(vec3(uModelView * vec4(aNormal, 0.0)));
  T = normalize(T - dot(T, N) * N);
  vec3 B = cross(N, T);
  vNormal = N;
  vTangent = T;
  vBinormal = B;
  TBN = mat3(T, B, N);
  // TBN = transpose(mat3(T, B, N)); 

  gl_Position    = uMVP * pos;

  // vec3 lightDir = normalize(vec3(0.0,0.0,1.0) - gl_Position.xyz);  
  vec3 lightDir = normalize(vec3(0.2,0.2,1.0) );  
  diffuseMul = max(0.0, dot(vNormal,lightDir));
  
//   vec4 pos = vec4( aPosition, 0.0, 1.0 );
}
