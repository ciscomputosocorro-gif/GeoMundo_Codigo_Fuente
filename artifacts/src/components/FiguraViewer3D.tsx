import { Component, Suspense, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { AnimatePresence, motion } from "framer-motion";
import { Figura } from "@/data/figuras";

// ─── Error boundary ───────────────────────────────────────────────────────────
class CanvasErrorBoundary extends Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { fallback: React.ReactNode; children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

// ─── Cubo: cara con personaje, otras 5 caras en color sólido ─────────────────
function CuboMesh({ figura, onSelect }: { figura: Figura; onSelect: () => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const { gl } = useThree();
  const texture = useTexture(figura.imagen);

  texture.colorSpace = THREE.SRGBColorSpace;

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    // Rotate on Y and a tiny X wobble so all 6 faces are visible
    meshRef.current.rotation.y += delta * 0.65;
    meshRef.current.rotation.x = Math.sin(Date.now() * 0.0004) * 0.3;
    const t = hovered ? 1.08 : 1;
    meshRef.current.scale.lerp(new THREE.Vector3(t, t, t), delta * 8);
  });

  return (
    <mesh
      ref={meshRef}
      onPointerOver={() => { setHovered(true);  gl.domElement.style.cursor = "pointer"; }}
      onPointerOut ={() => { setHovered(false); gl.domElement.style.cursor = "default"; }}
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
    >
      <boxGeometry args={[2.3, 2.3, 2.3]} />
      {/* BoxGeometry face order: +x, -x, +y, -y, +z (front), -z (back) */}
      <meshStandardMaterial attach="material-0" color={figura.color} roughness={0.35} />
      <meshStandardMaterial attach="material-1" color={figura.color} roughness={0.35} />
      <meshStandardMaterial attach="material-2" color={figura.color} roughness={0.35} />
      <meshStandardMaterial attach="material-3" color={figura.color} roughness={0.35} />
      <meshBasicMaterial   attach="material-4" map={texture} transparent />
      <meshStandardMaterial attach="material-5" color={figura.color} roughness={0.35} />
    </mesh>
  );
}

// ─── Other shapes: texture wraps around the geometry ─────────────────────────
function TexturedMesh({ figura, onSelect }: { figura: Figura; onSelect: () => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const { gl } = useThree();
  const texture = useTexture(figura.imagen);

  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y += delta * 0.65;
    const t = hovered ? 1.08 : 1;
    meshRef.current.scale.lerp(new THREE.Vector3(t, t, t), delta * 8);
  });

  const mat = <meshBasicMaterial map={texture} transparent side={THREE.FrontSide} />;

  const common = {
    ref: meshRef,
    onPointerOver: () => { setHovered(true);  gl.domElement.style.cursor = "pointer"; },
    onPointerOut:  () => { setHovered(false); gl.domElement.style.cursor = "default"; },
    onClick: (e: THREE.Event) => { (e as any).stopPropagation(); onSelect(); },
  };

  if (figura.id === "esfera")   return <mesh {...common}><sphereGeometry   args={[1.5, 48, 48]} />{mat}</mesh>;
  if (figura.id === "cilindro") return <mesh {...common}><cylinderGeometry args={[1.0, 1.0, 2.4, 48]} />{mat}</mesh>;
  if (figura.id === "piramide") return <mesh {...common}><coneGeometry     args={[1.5, 2.6, 4]} />{mat}</mesh>;
  return null;
}

// ─── PNG fallback (WebGL unavailable) ────────────────────────────────────────
function FiguraPNG({ figura }: { figura: Figura }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4">
      <img
        src={figura.imagen}
        alt={figura.nombre}
        draggable={false}
        className="max-h-[75%] object-contain drop-shadow-xl"
        style={{ filter: `drop-shadow(0 0 24px ${figura.color}88)` }}
      />
    </div>
  );
}

// ─── Scene wrapper ────────────────────────────────────────────────────────────
function Escena({ figura, onSelect }: { figura: Figura; onSelect: () => void }) {
  return (
    <>
      <ambientLight intensity={1.2} />
      <directionalLight position={[4, 6, 4]} intensity={0.8} />
      <Suspense fallback={null}>
        {figura.id === "cubo"
          ? <CuboMesh figura={figura} onSelect={onSelect} />
          : <TexturedMesh figura={figura} onSelect={onSelect} />
        }
      </Suspense>
      <OrbitControls
        enableZoom enablePan={false} enableDamping dampingFactor={0.08}
        minDistance={3} maxDistance={9}
        minPolarAngle={Math.PI / 6} maxPolarAngle={(5 * Math.PI) / 6}
      />
    </>
  );
}

// ─── Public component ─────────────────────────────────────────────────────────
export function FiguraViewer3D({ figura }: { figura: Figura }) {
  const [mostrarNombre, setMostrarNombre] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSelect = () => {
    setMostrarNombre(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setMostrarNombre(false), 3000);
  };

  return (
    <CanvasErrorBoundary fallback={<FiguraPNG figura={figura} />}>
      <div className="w-full h-full relative">
        <Canvas
          camera={{ position: [0, 0.3, 5.5], fov: 46 }}
          style={{ width: "100%", height: "100%" }}
          gl={{ antialias: true, failIfMajorPerformanceCaveat: false, powerPreference: "low-power" }}
          onCreated={({ gl }) => { gl.shadowMap.enabled = false; }}
        >
          <Escena figura={figura} onSelect={handleSelect} />
        </Canvas>

        <AnimatePresence>
          {mostrarNombre && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="absolute bottom-10 left-0 right-0 flex justify-center pointer-events-none"
            >
              <span
                className="font-extrabold text-2xl px-6 py-2 rounded-full shadow-lg text-white"
                style={{ backgroundColor: figura.color + "dd" }}
              >
                {figura.nombre}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </CanvasErrorBoundary>
  );
}
