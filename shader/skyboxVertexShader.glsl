precision mediump float;
uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;
attribute vec3 vPosition;
varying vec3 fTexCoord;
void main() {
    fTexCoord = vPosition;
    vec3 viewPos = (mView * mWorld * vec4(vPosition, 0.0)).xyz;
    gl_Position = mProj * vec4(viewPos, 1.0);
}
