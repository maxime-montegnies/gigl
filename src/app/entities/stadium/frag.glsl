precision mediump float;
uniform sampler2D uTex;
uniform sampler2D uTexN;
uniform sampler2D uTexMC;
// uniform sampler2D uTexDisp;
// uniform sampler2D uTexDispMask;
varying vec3 vNormal;
varying float iTime;
varying vec2 vUv;
varying float diffuseMul;
varying mat3 TBN;
varying vec3 vTangent;
varying vec3 vBinormal;
varying vec3 vEye;
#define saturate(x) clamp( x, 0.0, 1.0 )
#define sdot( a, b ) saturate( dot(a,b) )

vec2 matcap( vec3 e, vec3 n ) {
  vec3 reflected = reflect(e, normalize(n));
  // vec3 reflected = normalize(reflect(normalize(e), normalize(n)));
  // vec3 reflected = reflect(vec3(0.0,0.0,1.0), normalize(n));
  float m = 2.8284271247461903 * sqrt( reflected.z+1.0 );
  return vec2(reflected.x, -reflected.y) / m + 0.5;
}



void main() {
  // vec4 disp = texture2D( uTexDisp, vUv*3.0 + vec2(iTime*0.1, 0.0) );
//   vec4 disp = texture2D( uTexDisp, vUv*3.0 + vec2(iTime*0.2, iTime*0.0)  );
//   vec4 dispMask = texture2D( uTexDispMask, vUv );
  vec4 color0 = texture2D( uTex, vUv);
  vec4 colorNormals = texture2D( uTexN, vUv)*2.0-1.0;
  
  vec4 color = vec4(vNormal,1.0);
  color = vec4(vec3(diffuseMul),1.0);

  vec3 lightDir = normalize(vec3(0.2,0.4,1.0) );  
  vec3 light_reflect = reflect(-lightDir,colorNormals.rgb);

  vec3 finalNormal = TBN * (colorNormals.rgb );
  
  color = vec4(light_reflect,1.0);
  color = vec4(finalNormal,1.0);
  float diffuseMul1 = max(0.0, dot(finalNormal,lightDir));
  color = vec4(vec3(diffuseMul1),1.0);

  // vec3 e = ComputeLight(lightDir, finalNormal, true, vec3(1.0,0.0,.0));
  // vec4 color = vec4(0.0,1.0,1.0,1.0);
  // gl_FragColor = color*color0*colorNormals;
  // color = vec4(e,1.0);

  
  
  

  
  float diffuseCoef = sdot( lightDir, finalNormal ) + .04;
  color = vec4(diffuseCoef,diffuseCoef,diffuseCoef,1.0);
  color.rgb *= color0.rgb;

  // finalNormal = normalize(finalNormal);
  vec2 calculatedNormal = matcap(vEye, finalNormal);
  // vec2 calculatedNormal = matcap(vec3(1.0-vEye.r,vEye.g,vEye.b), finalNormal);
  // calculatedNormal = vec2(calculatedNormal.x, 1.0-calculatedNormal.y);
  // calculatedNormal-=0.5;
  // calculatedNormal*=0.5;
  // calculatedNormal+=0.5;
  vec4 colorMatCap = texture2D( uTexMC, calculatedNormal);

  // color.rgb = colorMatCap.rgb;
  color.rgb = mix(vec3(0.2,0.2,0.2)*vec3(pow(colorMatCap.r, 20.0)), colorMatCap.rgb, color0.r)*(0.5+0.5*diffuseCoef);
  color.rgb = mix(colorMatCap.rgb*color0.rgb, color0.rgb, 0.5);
  // color.rgb = colorMatCap.rgb;
  // color.rgb = finalNormal;
  // color.rg = calculatedNormal;
  // color.b = 0.0;
  // color.rgb = finalNormal;
  // color.rgb = clamp(color.rgb+.2, 0.0,1.0);
  // color.rgb = mix(vec3(0.1)+colorMatCap.r, vec3(0.8)+colorMatCap.rgb, color0.r)*(0.3+0.7*diffuseCoef);
  // color.rgb = finalNormal.rgb;
  // color.rgb = vec3(diffuseCoef);
  // color.rgb = colorMatCap.rgb;
  // colorMatCap.rgb*(1.0-color0.rgb);
  gl_FragColor = color;
  // gl_FragColor = colorMatCap;
  // gl_FragColor.rgb = vEye;
  // gl_FragColor.rg = calculatedNormal;
  // gl_FragColor.b = 1.0;
  // gl_FragColor.rgb = ComputeLight(lightDir, finalNormal, true, vec3(1.0,0.0,.0));
  // gl_FragColor.rgb = vEye;

  // gl_FragColor.rgb = vec3(1.0-vEye.r,vEye.g,vEye.b);
  // gl_FragColor.rgb = vEye;
  // gl_FragColor.rg = calculatedNormal;
  // gl_FragColor.b = 1.0;
  gl_FragColor.a = 1.0;
}
