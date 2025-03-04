import { Canvas } from "@react-three/fiber";
import MeshGradient from "./components/MeshGradient.jsx";
import BlurOverlay from "./components/BlurOverlay.jsx";
import NoiseOverlay from "./components/NoiseOverlay.jsx";

function App() {
    return (
        <div style={{ width: "100dvw", height: "100dvh" }}>
            <Canvas camera={{ position: [0, 0, 2.5] }}>
                <color attach="background" args={["black"]} />
                <MeshGradient />
                <NoiseOverlay />
            </Canvas>
            <BlurOverlay />
        </div>
    );
}

export default App;
