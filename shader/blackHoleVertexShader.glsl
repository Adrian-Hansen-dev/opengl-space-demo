attribute vec3 vertPosition;
attribute vec3 vertNormal;

varying vec3 fragNormal;
varying vec3 fragPosition;
varying vec2 vTextureCoord;
varying vec3 directionCamera;

uniform mat3 mDirCam;
uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;
uniform mat3 mNormal;


void main()
{
    fragNormal = mat3(mWorld) * vertNormal;
    fragPosition = (mWorld * vec4(vertPosition, 1.0)).xyz;

    //       v =        V^-1  *          z
    directionCamera = mDirCam * vec3(0.0, 0.0, 1.0);

    vec4 viewPosition = mView * mWorld * vec4(vertPosition, 1.0);
    gl_Position = mProj * viewPosition;

}
