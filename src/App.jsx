import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import styled from 'styled-components'
import { useControls } from 'leva'
import { useRef, useState, useEffect } from 'react'


const noiseFrag = `
  uniform float size;
  uniform float opacity;

  varying vec2 vUv;

  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }

  void main() {
    vec2 uv = vUv * size;
    float grain = random(uv) * 0.1; 
    
    float fineGrain = random(uv * 2.0) * 0.05;
    
    float finalNoise = (grain + fineGrain) * opacity;
    
    gl_FragColor = vec4(1.0, 1.0, 1.0, finalNoise);
  }
`


const vert = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const frag = `
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
  // Noise function
  //
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187,
                        0.366025403784439,
                        -0.577350269189626,
                        0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
      + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m;
    m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }
  //
  // End Noise Function
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
`

const colorPresets = {
  neon: {
    colorA: '#ff00ff',
    colorB: '#00ffff',
    colorC: '#ffff00'
  },
  ocean: {
    colorA: '#006699',
    colorB: '#66cccc',
    colorC: '#00ff99'
  },
  sunset: {
    colorA: '#ff6b6b',
    colorB: '#ffd93d',
    colorC: '#ff6b6b'
  },
  forest: {
    colorA: '#2d5a27',
    colorB: '#8dd962',
    colorC: '#5a9367'
  },
  candy: {
    colorA: '#ff77ff',
    colorB: '#77ffff',
    colorC: '#ff77aa'
  },
  lava: {
    colorA: '#ff3300',
    colorB: '#ff9900',
    colorC: '#ff3300'
  },
  cyberpunk: {
    colorA: '#ff00ff',
    colorB: '#00ffff',
    colorC: '#ffff00'
  },
  pastel: {
    colorA: '#ffb3ba',
    colorB: '#bae1ff',
    colorC: '#baffc9'
  }
}

function NoiseOverlay() {
  const [noiseMaterial, setNoiseMaterial] = useState()

  const {
    showGrain,
    size,
    opacity
  } = useControls('Grain Texture', {
    showGrain: true,
    size: {
      value: 1000,
      min: 100,
      max: 5000,
      step: 100
    },
    opacity: {
      value: 0.3,
      min: 0,
      max: 0.8,
      step: 0.01
    }
  })

  useEffect(() => {
    const material = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: noiseFrag,
      uniforms: {
        size: { value: size },
        opacity: { value: opacity }
      },
      transparent: true,
      blending: THREE.AdditiveBlending
    })
    setNoiseMaterial(material)
  }, [])

  useFrame(() => {
    if (noiseMaterial) {
      noiseMaterial.uniforms.size.value = size
      noiseMaterial.uniforms.opacity.value = opacity
    }
  })

  return (
    <>
      {showGrain && <mesh rotation={[0, 0, 0]} position={[0, 0, 0.001]}>
        <planeGeometry args={[10, 10]} />
        {noiseMaterial && <primitive object={noiseMaterial} attach="material" />}
      </mesh>}
    </>
  )
}

function MeshGradient() {
  const segments = 40
  const timeRef = useRef(0)
  const [shaderMaterial, setShaderMaterial] = useState()

  const {
    preset,
    speed,
    numLines,
    waveFrequency,
    waveAmplitude,
    chaos,
  } = useControls('Mesh Gradient', {
    preset: {
      options: Object.keys(colorPresets),
      value: 'ocean'
    },
    speed: {
      value: 0.03,
      min: 0.01,
      max: 0.1,
    },
    numLines: {
      value: 10,
      min: 5,
      max: 30,
      step: 5
    },
    waveFrequency: {
      value: 3,
      min: 1,
      max: 10
    },
    waveAmplitude: {
      value: 0.05,
      min: 0.01,
      max: 0.2
    },
    chaos: {
      value: 0.2,
      min: 0,
      max: 1,
      step: 0.01
    },
  })

  const colors = colorPresets[preset]

  useEffect(() => {
    const material = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      uniforms: {
        uTime: { value: 0 },
        numLines: { value: numLines },
        waveFrequency: { value: waveFrequency },
        waveAmplitude: { value: waveAmplitude },
        chaos: { value: chaos },
        colorA: { value: new THREE.Color(colors.colorA) },
        colorB: { value: new THREE.Color(colors.colorB) },
        colorC: { value: new THREE.Color(colors.colorC) }
      },
      side: THREE.DoubleSide
    })
    setShaderMaterial(material)
  }, [preset])

  useEffect(() => {
    if (shaderMaterial) {
      shaderMaterial.uniforms.colorA.value.set(colors.colorA)
      shaderMaterial.uniforms.colorB.value.set(colors.colorB)
      shaderMaterial.uniforms.colorC.value.set(colors.colorC)
    }
  }, [colors, shaderMaterial])

  useFrame((_, delta) => {
    if (shaderMaterial) {
      timeRef.current += delta + speed
      shaderMaterial.uniforms.uTime.value = timeRef.current
      shaderMaterial.uniforms.numLines.value = numLines
      shaderMaterial.uniforms.waveFrequency.value = waveFrequency
      shaderMaterial.uniforms.waveAmplitude.value = waveAmplitude
      shaderMaterial.uniforms.chaos.value = chaos
    }
  })

  return (
    <mesh rotation={[0, 0, 0]}>
      <planeGeometry args={[10, 10, segments, segments]} />
      {shaderMaterial && <primitive object={shaderMaterial} attach="material" />}
    </mesh>
  )
}

const BlurOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backdrop-filter: blur(${props => props.strenght}px);
  pointer-events: none;
`

function App() {
  const { showBlur, strenght } = useControls('Blur Effect', {
    showBlur: false,
    strenght: {
      value: 2,
      min: 0,
      max: 64,
      step: 1
    }
  })

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas
        camera={{ position: [0, 0, 2.5] }}
      >
        <color attach="background" args={['black']} />
        <MeshGradient />
        <NoiseOverlay />
      </Canvas>
      {showBlur && <BlurOverlay strenght={strenght} />}
    </div>
  )
}

export default App
