// #version 300 es
// #version 330

precision highp float;
#extension GL_OES_standard_derivatives : enable
#extension GL_EXT_shader_texture_lod : enable

varying vec3 wNormalInterp;
varying vec3 viewDir;
varying vec3 vertPos;
varying vec2 vUv;
varying vec3 viewVector;

uniform sampler2D normalMap;
uniform sampler2D tEquirect;
uniform sampler2D metallicRoughnessTexture;
uniform sampler2D occlusionTexture;
uniform sampler2D uAlbedo;
uniform float metallicFactor;
uniform float roughnessFactor;
uniform vec4 baseColorFactor;// = vec4(1.0, 1.0, 1.0, 1.0);

#define RECIPROCAL_PI2 0.15915494
#define saturate(a) clamp( a, 0.0, 1.0 )

// Per-Pixel Tangent Space Normal Mapping
// http://hacksoflife.blogspot.ch/2009/11/per-pixel-tangent-space-normal-mapping.html
vec3 perturbNormal( vec3 eye_pos, vec3 surf_norm, vec2 uv_coords, vec3 normal_perturbation ) {
	vec3 q0 = dFdx( eye_pos.xyz );
	vec3 q1 = dFdy( eye_pos.xyz );
	vec2 st0 = dFdx( uv_coords.st );
	vec2 st1 = dFdy( uv_coords.st );

	vec3 S = normalize( q0 * st1.t - q1 * st0.t );
	vec3 T = normalize( -q0 * st1.s + q1 * st0.s );
	vec3 N = normalize( surf_norm );

	mat3 tsn = mat3( S, T, N );
	return normalize( tsn * normal_perturbation );
}

///Get pi
#define PI 3.14159265359

///Lambertian diffuse, explanation here: https://seblagarde.wordpress.com/2012/01/08/pi-or-not-to-pi-in-game-lighting-equation/
///By another of my deities, sebastian lagarde.
vec3 Diffuse(vec3 pAlbedo)
{
	return pAlbedo / PI;
}

///METALNESS / METALLIC
///A metallic object in real life does not have a refraction or diffuse color. 
///Look at a mirror, it takes all its color from the environment. It's all reflection.
///It can modify the reflected color like it does on a bronze or golden surface. 

///The diffuse part only requires the above Diffuse function which is later
///-multiplied by the eternal normal dot light to calculate the incidence of the light on the surface.

///The Specular part is the fancy part of PBR. We need three functions.

///The normal distribution function. Which is how the specular highlight distributes on the surface when viewed.
float NormalDistribution_GGX(float a, float NdH)
{
	//Isotropic ggx
	float a2 = a * a;
	float NdH2 = NdH * NdH;

	float denominator = NdH2 * (a2 - 1.0) + 1.0;
	denominator *= denominator;
	denominator *= PI;
	return a2 / denominator;
}

///The geometry function which simulates the tiny cavities' shadowing depending on the light's direction.
///Imagine a tiny cavity being shadowed because the light does not hit it on the opening.
float Geometric_Smith_Schlick_GGX(float a, float NdV, float NdL)
{
	//smith schlick-GGX
	float k = a * 0.5;
	float GV = NdV / (NdV * (1.0 - k) + k);
	float GL = NdL / (NdL * (1.0 - k) + k);

	return GV * GL;
}

///Fresnel. Everything is shiny and everything has fresnel. So we need this.
///http://filmicworlds.com/blog/everything-is-shiny/
///http://filmicworlds.com/blog/everything-has-fresnel/
float Fresnel_Schlick(float u)
{
	float m = clamp(1.0 - u, 0.0, 1.0);
	float m2 = m * m;
	return m2 * m2 * m;
}

///This one is used for calculating the specular contribution, we'll come back to this one later.
vec3 Fresnel_Schlick(vec3 specularColor, vec3 h, vec3 v)
{
	return (specularColor + (1.0 - specularColor) * pow((1.0 - clamp(dot(v, h), 0.0, 1.0)), 5.0));
}

///Calculate the specular.
///Send it a million parameters to calculate them all. 
///I know some are unused but i used to have other functions set up here. Don't worry about it.
vec3 Specular(vec3 specularColor, vec3 h, vec3 v, vec3 l, float a, float NdL, float NdV, float NdH, float VdH, float LdV)
{
    ///Get the three results.
	vec3 TotalSpecular = NormalDistribution_GGX(a, NdH) *
		Fresnel_Schlick(specularColor, v, h) *
		Geometric_Smith_Schlick_GGX(a, NdV, NdL);

    ///Divide them by 4 * Normal dot View and Normal dot Light.
	return TotalSpecular / (4.0 * NdV * NdL + 0.001);
}

///This is used for the specular contribution on the environment, we'll also use this later.
vec3 Specular_F_Roughness(vec3 specularColor, float a, vec3 h, vec3 v)
{
    // return vec3(dot(v, h));
    vec3 c = vec3(1.0 - a);
    // vec3 c = vec3(0.5);
    return specularColor + 0.25*(max(c, specularColor) - specularColor) * pow((1.0 - clamp(dot(v, h), 0.0, 1.0)), 5.0);
}



///Compute the result of one light.
vec3 ComputeLight(vec3 albedoColor, vec3 specularColor, vec3 normal, float roughness, vec3 lightPosition, vec3 lightColor, vec3 lightDir, vec3 viewDir, float met)
{
    ///Calculate everything.
	float NdL = clamp(dot(normal, lightDir), 0.0, 1.0);
	float NdV = clamp(dot(normal, viewDir), 0.0, 1.0);
	vec3 h = normalize(lightDir + viewDir);
	float NdH = clamp(dot(normal, h), 0.0, 1.0);
	float VdH = clamp(dot(viewDir, h), 0.0, 1.0);
	float LdV = clamp(dot(lightDir, viewDir), 0.0, 1.0);
	float a = max(0.001, roughness * roughness);

    ///Get the diffuse result and the specular result.
	vec3 ColorDiffuse = Diffuse(albedoColor);
	vec3 ColorSpecular = Specular(specularColor, h, viewDir, lightDir, a, NdL, NdV, NdH, VdH, LdV);

    ///Diffuse and Specular are mutually exclusive, if light goes into diffuse it is because it was not reflected and
    ///If light goes into specular it's because it was not refracted and was reflected.

    ///Now we get the fresnel of our half and view. This gives us our Specular contribution depending on the angle of viewing.
	vec3 F = Fresnel_Schlick(specularColor, h, viewDir);
	vec3 kS = F;
	vec3 kD = vec3(1.0, 1.0, 1.0) - kS; ///To get our diffuse contribution we substract the specular contribution from a white color.

    kD *= 1.0 - met;

    ///Now we just multiply the NdL by the lightcolor and by the colorDiffuse and ColorSpecular
	return lightColor * NdL * (kD * ColorDiffuse + ColorSpecular);
}



vec3 ToLinear(vec3 c)
{    
    c.x = pow(c.x, 2.2);
    c.y = pow(c.y, 2.2);
    c.z = pow(c.z, 2.2);
    
    return c;
}

vec3 TosRGB(vec3 c)
{    
    c.x = pow(c.x, 1.0/2.2);
    c.y = pow(c.y, 1.0/2.2);
    c.z = pow(c.z, 1.0/2.2);
    
    return c;
}
vec3 adjust_brightnesscontrast( vec3 col , float B , float C )
{
    // adjust brightness
    col = clamp(col + vec3(B),vec3(0),vec3(1));

    // adjust contrast
    float CF = (1.01568627 * (C + 1.0)) / (1.01568627 - C);
    col = clamp(CF * (col-vec3(0.5)) + vec3(0.5), vec3(0),vec3(1));

    return col;
}

/**/
void main() {
  /*
  */
  float bNormal = 1.0;
	vec3 mapN = texture2D( normalMap, vUv*1.0 ).xyz * 2.0 - 1.0;
	// mapN = mix(mapN, vec3(0,0,1), 0.8);
	vec3 normal = normalize(wNormalInterp);
    #if HAS_normal
	normal = mix(normal, perturbNormal(vertPos, normal, vUv, mapN), bNormal);
    #endif

	// vec3 reflectVec = normalize(reflect(viewDir, normal));
    // vec3 reflectVec = reflect(viewDir, normal);
    vec3 reflectVec = reflect(viewVector, normal);

	vec2 uv;
	vec3 mapMix = texture2D( metallicRoughnessTexture, vUv ).xyz;
	uv.y = 1.0-saturate( reflectVec.y * 0.5 + 0.5 );
	uv.x = atan( -reflectVec.z, -reflectVec.x ) * RECIPROCAL_PI2 + 0.5;
    ///Set the light Dir
    // vec3 lightDir = vec3(0.0, 0.0, -5.0);
    vec3 lightDir = vec3(-15.0, -15.0, -15.0);
    // vec3 lightDir = vec3(10.0, 10.0, 0.0);
    ///Every direction is always normalized, always.
    lightDir = normalize(lightDir);
    ///The light color.
    float lightIntensity = 0.0;
    vec3 lightColor = vec3(lightIntensity);
    ///The roughness. It is currently changing according to a sin. you can change it here.
    float roughness = mapMix.g * roughnessFactor;
    ///The metallic value. Change this to see how it works.
    float metalness = mapMix.b * metallicFactor;
    float occlusion = texture2D( occlusionTexture, vUv ).r;
    ///Albedo.
    #if HAS_albedo
    vec3 col = texture2D( uAlbedo, vUv ).xyz;
    ///We need to transform the color from sRGB (display values) to linear (Math correct pro values).
    ///https://developer.nvidia.com/gpugems/gpugems3/part-iv-image-effects/chapter-24-importance-being-linear
    col = ToLinear(col);
    col *= baseColorFactor.rgb;
    #else
    vec3 col = baseColorFactor.rgb;
    #endif
    ///Get the specular color by lerping from a blackish color to the albedo color using the metallic as alpha.
    ///If something is 100% metallic, then its specular color will be the full albedo. 
    ///If it is 0% metallic, there will barely be any specular color.
    vec3 specColor = mix(vec3(0.06), col, metalness);
    ///Compute the actual DIRECT light contribution.
    ///Direct lighting is the contribution of real lights directly hitting a surface. 
    ///Indirect lighting is light that comes from other surfaces and the light that bounces off of them.
    ///We send the lightdir negated and the view dir negated because they have to follow the same direction as the normal.
    ///So the dot products work.
    vec3 pbr = ComputeLight(col, specColor, normal, roughness, -lightDir * 1000.0, lightColor, -lightDir, -viewDir, metalness);
    // gl_FragColor =  vec4(pbr, 1.0);
    // gl_FragColor =  vec4(col, 1.0);
    // gl_FragColor =  vec4(normal, 1.0);
    ///Now for the INDIRECT light contribution. This is the light that bounces off of other objects.
    ///This is IBL or Image based Lighting. Which means we use a texture or cubemap's data as light contribution
    ///from the environment. 
    
    ///Now we calculate the fresnel for the environment.
    // vec3 envFresnel = Specular_F_Roughness(specColor.xyz, roughness * roughness, vertexPos, -viewDir).xyz;
    // vec3 envFresnel = Specular_F_Roughness(vec3(1.0,0.0,0.0), roughness * roughness, vertexPos, -viewDir).xyz;
    vec3 envFresnel = Specular_F_Roughness(specColor.xyz, roughness * roughness, normal, -viewDir).xyz;
    // vec3 envFresnel = Specular_F_Roughness(specColor.xyz, roughness * roughness, normal, -viewDir).xyz;
    
    ///We calculate again the specular and diffuse contributions because there are two parts 
    ///There's two parts the environment and the irradiance. 
    ///One affects the diffuse and the other one affects the specular.
    vec3 Kd = 1.0 - envFresnel;
    Kd *= 1.0 - metalness;
    
    
    ///Get the reflection vector using the view dir on the normal.
    vec3 reflection = reflect(viewDir, normal);
    
    ///We are gonna sample the cubemap with a sample level depending of the roughness of the surface.
    ///The mip maps help us simulate the environment reflections becoming diffused depending of thr surface's roughness.
    ///We have 9.0f mipmaps so we multiply roughness which goes from 0.0f to 1.0f by 9.
    ///This means that when roughness is 0.0f, we'll get the "clearest" reflection.
    ///And when it is 1.0f, we'll get a diffuse reflection.
    ///This variable is used so the background does not react to roughness.
    float sampleLevel = roughness*9.0;
    // sampleLevel = 4.0+roughness*5.0;
    // sampleLevel = 5.0;
    
    ///Sample using the reflection vector and sampleLevel
    // vec4 env = textureLod(iChannel3, reflection, sampleLevel);
    vec3 env = texture2DLodEXT(tEquirect, uv, sampleLevel).rgb;
    ///Make it linear.
    env.xyz = ToLinear(env.xyz);
    ///Now we will sample the same cubemap, but with the largest mip. 
    ///We use the normal this time, because we want to get a value for irradiance.
    ///This is just light that "bleeds" into other things which are nearby.
    ///This is not a reflection. Think about it like this. You're standing next to a red wall.
    ///The wall is hit by the sunlight and your body looks red from standing near to it.
    ///It is not a reflection, it does not change if you move or look at your skin from a different angle.
    ///It's just the wall irradiating red light and coloring your skin.
    // vec4 irr = texture2DLodEXT(tEquirect, normal.xy, 2.0);
    vec4 irr = texture2DLodEXT(tEquirect, uv, 9.0);
    // irr.xyz = ToLinear(irr.xyz);
    //
    //
    //
    //
    ///If we did hit something. Do the final calculation.
        vec3 directLight = pbr;
        
        ///Multiply the surface color by the irradiance and by the diffuse contribution.
        vec3 ambientLight = col * irr.xyz * Kd; 
        
        ///Multiply the environment by the fresnel.
        ///The environment should be more reflective on grazing angles.
        vec3 specularIndirectLight = env.xyz * envFresnel; 
        vec3 finalColor = directLight * occlusion + ambientLight + specularIndirectLight*1.0;
        // finalColor*=2.5;
        gl_FragColor = vec4(finalColor, 1.0);
        gl_FragColor.rgb *= vec3(occlusion);
        // gl_FragColor.rgb = adjust_brightnesscontrast(gl_FragColor.rgb, 0.3,0.3);
        gl_FragColor.rgb = TosRGB(gl_FragColor.rgb);
        gl_FragColor.rgb = adjust_brightnesscontrast(gl_FragColor.rgb, -0.1,0.0);
        // gl_FragColor = vec4(normal, 1.0);
        // gl_FragColor = vec4(mapN, 1.0);
        // gl_FragColor = vec4(ambientLight, 1.0);
        // gl_FragColor = vec4(irr.xyz, 1.0);
        // gl_FragColor = vec4(reflection, 1.0);
        // gl_FragColor = vec4(col, 1.0);
        // gl_FragColor = vec4(Kd, 1.0);
        // gl_FragColor = vec4(envFresnel, 1.0);
        // gl_FragColor = vec4(viewDir, 1.0);
        // gl_FragColor = vec4(normal, 1.0);
        // gl_FragColor = vec4(wNormalInterp, 1.0);
        // gl_FragColor = vec4(vertexPos, 1.0);
        // gl_FragColor = vec4(specColor, 1.0);
        // gl_FragColor = vec4(irr.xyz, 1.0);
        // gl_FragColor = vec4(envFresnel, 1.0);
        // gl_FragColor = vec4(specularIndirectLight, 1.0);
        // gl_FragColor = vec4(env.xyz, 1.0);
        // gl_FragColor = vec4(envFresnel, 1.0);
        // gl_FragColor = vec4(col * irr.xyz * Kd*2.0, 1.0);
        // gl_FragColor = vec4(vec3(roughness), 1.0);
        // gl_FragColor = vec4(vec3(occlusion), 1.0);
        // gl_FragColor = vec4(texture2D( occlusionTexture, vUv ).xyz, 1.0);
        // gl_FragColor = vec4(vec3(roughness), 1.0);
        // gl_FragColor = vec4(vec3(metalness), 1.0);
        // gl_FragColor = vec4(vec3(Kd), 1.0);
        // gl_FragColor = vec4(vec3(uv, 0.0), 1.0);
        // gl_FragColor = vec4(col, 1.0);
        // gl_FragColor = vec4(pbr, 1.0);
        // gl_FragColor = vec4(reflectVec, 1.0);

        // vec3 viewDirectionW = normalize(cameraPosition - vPositionW);
        // float fresnelTerm = dot(viewDir, wNormalInterp);
		// fresnelTerm = clamp(1.0 - fresnelTerm, 0., 1.);
        // gl_FragColor = vec4(vec3(fresnelTerm), 1.0);
        // gl_FragColor = vec4(viewDir, 1.0);
        // gl_FragColor = vec4(vec3((1.0 + min(dot(viewDir, normalize(wNormalInterp)), 0.0))), 1.0);
        // // gl_FragColor = vec4(wNormalInterp, 1.0);
        
        // 
    
}