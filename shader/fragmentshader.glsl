precision mediump float;
varying vec4 fragColor;
varying vec3 fragNormal;
varying vec3 fragPosition;
varying vec2 vTextureCoord;

uniform float isEarth;
uniform float shift;
uniform float alpha;

//Materialeigenschafen
uniform vec3 matEmission;
uniform vec3 matAmbient;
uniform vec3 matDiffuse;
uniform vec3 matSpecular;
uniform float matShininess;

//Texturen
uniform sampler2D planetTexture;
uniform sampler2D textureEarthNight;
uniform sampler2D textureEarthClouds;

//Lichteigenschaften
uniform vec3 lightAmbient;
uniform vec3 lightDiffuse;
uniform vec3 lightSpecular;
void main()
{
    vec4 planetTextureColor = texture2D(planetTexture, vTextureCoord);
    vec4 earthNightColor = texture2D(textureEarthNight, vTextureCoord);
    float cloud = texture2D(textureEarthClouds, vTextureCoord - vec2(shift, 0.0)).r;

    vec3 n = normalize(fragNormal);

    vec3 emissive = matEmission;
    vec3 ambient = lightAmbient * matAmbient;

    vec3 l = vec3(0.0);

    l = normalize(vec3(fragPosition));

    vec3 h = normalize(l + vec3(0.0, 0.0, 1.0));

    vec3 diffuse = vec3(0.0);
    float diffuseLight = max(dot(n, l), 0.0);
    if (diffuseLight > 0.0) {
        diffuse = diffuseLight * matDiffuse * lightDiffuse;
    }

    vec3 specular = vec3(0.0);
    float specLight = pow(max(dot(h, n), 0.0), matShininess);
    if (specLight > 0.0) {
        specular = specLight * matSpecular * lightSpecular;
    }

    if(isEarth==1.0){
        float ambientLight = 0.0;
        vec3 cloudColor = vec3(1.0, 1.0, 1.0) * (ambientLight + 0.7*diffuseLight);
        vec3 earthColor = mix(earthNightColor, planetTextureColor, ambientLight + 0.7*diffuseLight + specLight).rgb;
        vec3 mixColor = mix(earthColor, cloudColor, cloud);
        gl_FragColor = vec4(mixColor, 1.0);
    }
    else{
        gl_FragColor = planetTextureColor*vec4(emissive + ambient + diffuse + specular, alpha);
    }

}