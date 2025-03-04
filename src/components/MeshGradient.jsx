import * as THREE from "three";
import gsap from "gsap";

import { useFrame } from "@react-three/fiber";
import { useControls } from "leva";
import { useRef, useState, useEffect } from "react";

import colors from "../assets/colors";
import meshFragment from "../shaders/meshFrag.glsl";
import basicVertex from "../shaders/vert.glsl";

export default function () {
    const segments = 40;
    const timeRef = useRef(0);
    const mousePos = useRef(new THREE.Vector2(0, 0));
    const targetPos = useRef(new THREE.Vector2(0, 0));
    const [shaderMaterial, setShaderMaterial] = useState();

    const { mouseInteraction, preset, speed, numLines, waveFrequency, waveAmplitude, chaos } =
        useControls("Mesh Gradient", {
            mouseInteraction: {
                value: false,
            },
            preset: {
                options: Object.keys(colors),
                value: "ocean",
            },
            speed: {
                value: 0.008,
                min: 0.005,
                max: 0.1,
                step: 0.001,
            },
            numLines: {
                value: 10,
                min: 5,
                max: 30,
                step: 5,
            },
            waveFrequency: {
                value: 3,
                min: 1,
                max: 10,
            },
            waveAmplitude: {
                value: 0.05,
                min: 0.01,
                max: 0.2,
            },
            chaos: {
                value: 0.2,
                min: 0,
                max: 1,
                step: 0.01,
            },
        });

    const c = colors[preset];

    useEffect(() => {
        const handleMouseMove = (event) => {
            if (!mouseInteraction) return;

            const x = (event.clientX / window.innerWidth) * 2 - 1;
            const y = -(event.clientY / window.innerHeight) * 2 + 1;

            gsap.to(targetPos.current, {
                x: x,
                y: y,
                duration: 1,
                ease: "power2.out",
            });
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [mouseInteraction]);

    useEffect(() => {
        const material = new THREE.ShaderMaterial({
            vertexShader: basicVertex,
            fragmentShader: meshFragment,
            uniforms: {
                uTime: { value: 0 },
                numLines: { value: numLines },
                waveFrequency: { value: waveFrequency },
                waveAmplitude: { value: waveAmplitude },
                chaos: { value: chaos },
                colorA: { value: new THREE.Color(c.colorA) },
                colorB: { value: new THREE.Color(c.colorB) },
                colorC: { value: new THREE.Color(c.colorC) },
                mousePos: { value: mousePos.current },
                mouseInteraction: { value: mouseInteraction },
            },
            side: THREE.DoubleSide,
        });
        setShaderMaterial(material);
    }, [preset]);

    useEffect(() => {
        if (shaderMaterial) {
            shaderMaterial.uniforms.colorA.value.set(c.colorA);
            shaderMaterial.uniforms.colorB.value.set(c.colorB);
            shaderMaterial.uniforms.colorC.value.set(c.colorC);
        }
    }, [c, shaderMaterial]);

    useFrame((_, delta) => {
        if (shaderMaterial) {
            timeRef.current += delta + speed;

            mousePos.current.lerp(targetPos.current, 0.1);

            shaderMaterial.uniforms.uTime.value = timeRef.current;
            shaderMaterial.uniforms.numLines.value = numLines;
            shaderMaterial.uniforms.waveFrequency.value = waveFrequency;
            shaderMaterial.uniforms.waveAmplitude.value = waveAmplitude;
            shaderMaterial.uniforms.chaos.value = chaos;
            shaderMaterial.uniforms.mousePos.value = mousePos.current;
            shaderMaterial.uniforms.mouseInteraction.value = mouseInteraction;
        }
    });

    return (
        <mesh rotation={[0, 0, 0]}>
            <planeGeometry args={[10, 10, segments, segments]} />
            {shaderMaterial && <primitive object={shaderMaterial} attach="material" />}
        </mesh>
    );
}
