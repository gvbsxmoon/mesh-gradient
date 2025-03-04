import { Canvas } from "@react-three/fiber";
import MeshGradient from "./components/MeshGradient.jsx";
import BlurOverlay from "./components/BlurOverlay.jsx";
import NoiseOverlay from "./components/NoiseOverlay.jsx";
import Hero from "./components/Hero.jsx";
import { Center } from "@react-three/drei";

function App() {
    return (
        <div
            style={{
                width: "100dvw",
                height: "100dvh",
            }}
        >
            <Canvas camera={{ position: [0, 0, 2.5] }}>
                <color attach="background" args={["black"]} />
                <MeshGradient />
                <NoiseOverlay />
            </Canvas>
            <BlurOverlay />
            <Hero />
        </div>
    );
}

export default App;
