uniform float size;
uniform float opacity;

varying vec2 vUv;

float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
  vec2 uv = vUv * size;
  float grain = random(uv) * 0.1;

  float fineGrain = random(uv * 2.0) * 0.05;

  float finalNoise = (grain + fineGrain) * opacity;

  gl_FragColor = vec4(1.0, 1.0, 1.0, finalNoise);
}