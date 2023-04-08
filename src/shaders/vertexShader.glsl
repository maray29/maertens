precision mediump float;

// default mandatory variables
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
uniform mat4 planeTextureMatrix;
uniform float time;

// custom variables
varying vec3 vVertexPosition;
varying vec2 vTextureCoord;
varying float distanceZ;

uniform float uScrollEffect;

void main() {
    vec3 vertexPosition = aVertexPosition;

    vertexPosition.z += cos(time + -uScrollEffect * 0.02 + vertexPosition.y * 2.5) * (uScrollEffect * 0.001);
    vertexPosition.y += sin(-uScrollEffect / 300.0);

    gl_Position = uPMatrix * uMVMatrix * vec4(vertexPosition, 1.0);

    // varyings to pass to fragmentShader
    distanceZ = vertexPosition.z;
    vVertexPosition = vertexPosition;
    vTextureCoord = (planeTextureMatrix * vec4(aTextureCoord, 0.0, 1.0)).xy;
}