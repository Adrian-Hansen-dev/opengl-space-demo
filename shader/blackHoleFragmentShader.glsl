precision highp float;

varying vec3 fragPosition;
varying vec3 fragNormal;

varying vec3 directionCamera;

uniform samplerCube evmTexture;


void main() {
    vec3 worldNormal = normalize(fragNormal);
    vec3 eyeToSurfaceDir = normalize(fragPosition - directionCamera);
    vec3 direction = reflect(eyeToSurfaceDir, worldNormal);

    gl_FragColor = textureCube(evmTexture, direction);
}