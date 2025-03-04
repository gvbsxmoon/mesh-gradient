import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import { useState, useEffect } from "react";

import grainFragment from "../shaders/grainFrag.glsl";
import basicVertex from "../shaders/vert.glsl";

export default function () {
    const [noiseMaterial, setNoiseMaterial] = useState();

    const { showGrain, size, opacity } = useControls("Grain Texture", {
        showGrain: true,
        size: {
            value: 1000,
            min: 100,
            max: 5000,
            step: 100,
        },
        opacity: {
            value: 0.3,
            min: 0,
            max: 0.8,
            step: 0.01,
        },
    });

    useEffect(() => {
        const material = new THREE.ShaderMaterial({
            vertexShader: basicVertex,
            fragmentShader: grainFragment,
            uniforms: {
                size: { value: size },
                opacity: { value: opacity },
            },
            transparent: true,
            blending: THREE.AdditiveBlending,
        });
        setNoiseMaterial(material);
    }, []);

    useFrame(() => {
        if (noiseMaterial) {
            noiseMaterial.uniforms.size.value = size;
            noiseMaterial.uniforms.opacity.value = opacity;
        }
    });

    return (
        <>
            {showGrain && (
                <mesh rotation={[0, 0, 0]} position={[0, 0, 0.001]}>
                    <planeGeometry args={[10, 10]} />
                    {noiseMaterial && <primitive object={noiseMaterial} attach="material" />}
                </mesh>
            )}
        </>
    );
}
