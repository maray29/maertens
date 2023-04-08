precision mediump float;

varying vec3 vVertexPosition;
varying vec2 vTextureCoord;

varying float distanceZ;

// uniform sampler2D image;
uniform sampler2D planeTexture;

void main(void) {

    // Final color. 
    vec3 color = vec3(0.2, 0.3, 0.7);
    color.r = texture2D(planeTexture, vTextureCoord).r;
    color.g = texture2D(planeTexture, vTextureCoord).g;
    color.b = texture2D(planeTexture, vTextureCoord).b;
    if (distanceZ > 0.0) {
        color += 0.145 * distanceZ * 30.0;
    }

    gl_FragColor = vec4(color, 1.0);
}
