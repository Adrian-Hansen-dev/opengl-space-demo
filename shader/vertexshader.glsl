attribute vec3 vertPosition;
attribute vec3 vertNormal;
attribute vec2 aTextureCoord;

varying vec3 fragNormal;
varying vec3 fragPosition;
varying vec2 vTextureCoord;

uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;
uniform mat3 mNormal;

//location for point light
uniform vec3 lightWorldPosition;

void main()
{
    fragNormal = normalize(mNormal * vertNormal);

    vec4 viewPosition = mView * mWorld * vec4(vertPosition, 1.0);
    vec3 surfaceWorldPosition = (mWorld* vec4(vertPosition, 1.0)).xyz;

    fragPosition = lightWorldPosition-surfaceWorldPosition;

    gl_Position = mProj * viewPosition;

    vTextureCoord = aTextureCoord;

}
