// Shader created with GPT
// Deformes planes with one wave
// Needs further understanding and refinement

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

    float waveAmplitude = 4.0;
    float waveSpeed = 0.01;
    float waveFrequency = .1;

        // Calculate the wave effect based on the Y position of the vertices within the plane
    float waveEffect = sin(time - uScrollEffect * waveSpeed + vertexPosition.y * waveFrequency);

    vertexPosition.z += -waveEffect * (uScrollEffect * 0.001 * waveAmplitude);
    vertexPosition.y += sin(-uScrollEffect / 1000.0);

    gl_Position = uPMatrix * uMVMatrix * vec4(vertexPosition, 1.0);

        // varyings to pass to fragmentShader
    distanceZ = vertexPosition.z * 0.02;
    vVertexPosition = vertexPosition;
    vTextureCoord = (planeTextureMatrix * vec4(aTextureCoord, 0.0, 1.0)).xy;
}