uniform float uTime;
uniform float numLines;
uniform float waveFrequency;
uniform float waveAmplitude;
uniform float chaos;
uniform vec3 colorA;
uniform vec3 colorB;
uniform vec3 colorC;

varying vec2 vUv;

// 
// Perlin Noise
//
vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}
vec2 mod289(vec2 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}
vec3 permute(vec3 x) {
  return mod289(((x * 34.0) + 1.0) * x);
}

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
//
// End Perlin Noise
//

void main() {
  float noise = snoise(vec2(vUv.y * 2.0 + uTime * 0.1, vUv.x * 2.0)) * chaos;
  float sinWave = sin(vUv.y * waveFrequency + uTime) * waveAmplitude;
  float offset = sinWave + noise;

  float xPos = vUv.x + offset;

  vec3 finalColor;
  float pos = mod(xPos * numLines, 5.0) / 5.0;

  if(pos < 0.2) {
    finalColor = colorA;
  } else if(pos < 0.4) {
    finalColor = mix(colorA, colorB, (pos - 0.2) * 5.0);
  } else if(pos < 0.6) {
    finalColor = mix(colorB, colorC, (pos - 0.4) * 5.0);
  } else if(pos < 0.8) {
    finalColor = mix(colorC, colorB, (pos - 0.6) * 5.0);
  } else {
    finalColor = mix(colorB, colorA, (pos - 0.8) * 5.0);
  }

  gl_FragColor = vec4(finalColor, 1.0);
}