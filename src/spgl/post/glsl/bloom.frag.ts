export default `
// c+= uBloomColor * texture2D(tBloom,texCoordFull).xyz;
//  c= texture2D(tBloom,texCoordFull).xyz;
//  c = mix(c, texture2D(tBloom,texCoordFull).xyz, uBloomColor.r*FETCH_DEPTH(tDepth,texCoordVP));

float d = texture2D(t2,texCoordVP).x;
d = smoothstep(0.1,0.5,d);
float e = uBloomColor.r;
//  c = mix(c, texture2D(tBloom,texCoordFull).xyz, uBloomColor.r*clamp(0.0,1.0,texCoordVP.y*3.0));
//  c = mix(c, texture2D(tBloom,texCoordFull).xyz, pow(d,3.5) + uBloomColor.r * 0.0);
 c = mix(c, texture2D(tBloom,texCoordFull).xyz, d + uBloomColor.r * 0.0);
//  c.r = d*d/2.0;
//  c.g = d*d/2.0;
//  c.rgb = vec3(d);
// c = texture2D(tBloom,texCoordFull).xyz;

//  c= texture2D(tBloom,texCoordFull).xyz;

//  c= texture2D(tDepth,texCoordFull).xyz;
//  c = texture2D(t2,texCoordVP).xyz;
//  c.r= FETCH_DEPTH(tDepth,texCoordVP);
//  c.g= FETCH_DEPTH(tDepth,texCoordVP);
//  c.b= FETCH_DEPTH(tDepth,texCoordVP);
// c= uBloomColor;
// vec3 g = uBloomColor * texture2D(tBloom,texCoordFull).xyz;
// c+=  uBloomColor;
`