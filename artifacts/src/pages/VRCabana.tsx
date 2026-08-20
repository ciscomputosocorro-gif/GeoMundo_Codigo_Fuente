import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { Text, Billboard } from "@react-three/drei";
import { XR, createXRStore, XROrigin } from "@react-three/xr";
import * as THREE from "three";
import { Link } from "wouter";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { figuras } from "@/data/figuras";
import { useProgreso } from "@/lib/progreso";
import { speak } from "@/lib/audio";
import fondoCabana from "@assets/cabana_geomundo.jpg";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

const store = createXRStore();

function Cara3D({ yOffset = 0.05, zOffset = 0.5, scale = 1 }: { yOffset?: number; zOffset?: number; scale?: number }) {
  return (
    <Billboard position={[0, yOffset, zOffset]}>
      <group scale={scale}>
        <mesh position={[-0.15, 0.05, 0]}><sphereGeometry args={[0.09, 16, 16]} /><meshStandardMaterial color="white" /></mesh>
        <mesh position={[-0.15, 0.05, 0.07]}><sphereGeometry args={[0.045, 16, 16]} /><meshStandardMaterial color="#1f2937" /></mesh>
        <mesh position={[0.15, 0.05, 0]}><sphereGeometry args={[0.09, 16, 16]} /><meshStandardMaterial color="white" /></mesh>
        <mesh position={[0.15, 0.05, 0.07]}><sphereGeometry args={[0.045, 16, 16]} /><meshStandardMaterial color="#1f2937" /></mesh>
        <mesh position={[0, -0.13, 0.05]} rotation={[0, 0, Math.PI]}><torusGeometry args={[0.1, 0.022, 12, 24, Math.PI]} /><meshStandardMaterial color="#1f2937" /></mesh>
      </group>
    </Billboard>
  );
}

function PersonajeFigura({ figura, position, onSelect, resaltado }: { figura: typeof figuras[number]; position: [number, number, number]; onSelect: (n: string) => void; resaltado: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const baseY = position[1];
  const seed = useRef(Math.random() * Math.PI * 2);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = baseY + Math.sin(state.clock.elapsedTime + seed.current) * 0.12;
    }
  });

  const renderBody = () => {
    switch (figura.id) {
      case "cubo": return <mesh castShadow><boxGeometry args={[1.6, 1.6, 1.6]} /><meshStandardMaterial color={figura.color} roughness={0.5} /></mesh>;
      case "esfera": return <mesh castShadow><sphereGeometry args={[1.0, 32, 32]} /><meshStandardMaterial color={figura.color} roughness={0.4} /></mesh>;
      case "cilindro": return <mesh castShadow><cylinderGeometry args={[0.8, 0.8, 1.8, 32]} /><meshStandardMaterial color={figura.color} roughness={0.45} /></mesh>;
      case "piramide": return <mesh castShadow rotation={[0, Math.PI / 4, 0]}><coneGeometry args={[1.1, 1.8, 4]} /><meshStandardMaterial color={figura.color} roughness={0.5} flatShading /></mesh>;
      default: return null;
    }
  };
  const fo = { cubo: { y: 0.06, z: 0.85, s: 1.7 }, esfera: { y: 0.06, z: 1.05, s: 1.7 }, cilindro: { y: 0.12, z: 0.88, s: 1.7 }, piramide: { y: -0.08, z: 0.82, s: 1.6 } }[figura.id] ?? { y: 0.06, z: 0.85, s: 1.7 };
  return (
    <group ref={groupRef} position={position} scale={hovered ? 1.12 : 1}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={() => setHovered(false)}
      onClick={(e) => { e.stopPropagation(); onSelect(figura.nombre); }}
    >
      {renderBody()}
      <Cara3D yOffset={fo.y} zOffset={fo.z} scale={fo.s} />
      <Billboard position={[0, 1.0, 0]}>
        <Text fontSize={0.28} color="#ffffff" outlineWidth={0.03} outlineColor="#1f2937" anchorX="center" anchorY="middle">{figura.nombre}</Text>
      </Billboard>
    </group>
  );
}

function FondoCabana() {
  const texture = useLoader(THREE.TextureLoader, fondoCabana);
  useEffect(() => { texture.mapping = THREE.EquirectangularReflectionMapping; texture.colorSpace = THREE.SRGBColorSpace; }, [texture]);
  return <mesh scale={[-1, 1, 1]}><sphereGeometry args={[60, 64, 32]} /><meshBasicMaterial map={texture} side={THREE.BackSide} toneMapped={false} /></mesh>;
}

function Suelo() {
  return <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow><circleGeometry args={[30, 64]} /><meshStandardMaterial color="#86c47a" transparent opacity={0.7} /></mesh>;
}

function Arbol({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.6, 0]} castShadow><cylinderGeometry args={[0.15, 0.2, 1.2, 8]} /><meshStandardMaterial color="#7a4a2b" /></mesh>
      <mesh position={[0, 1.7, 0]} castShadow><sphereGeometry args={[0.7, 16, 16]} /><meshStandardMaterial color="#3d8a3d" /></mesh>
    </group>
  );
}

interface MoveControllerProps {
  speed?: number;
  touchDelta: React.MutableRefObject<{ dx: number; dy: number }>;
  mobileKeys: React.MutableRefObject<{ w: boolean; s: boolean; a: boolean; d: boolean }>;
}

function MovementController({ speed = 4, touchDelta, mobileKeys }: MoveControllerProps) {
  const { camera } = useThree();
  const keys = useRef({ w: false, s: false, a: false, d: false });
  const yaw = useRef(Math.PI); // start facing into scene
  const pitch = useRef(0);

  useEffect(() => {
    camera.position.set(0, 1.6, 8);
    camera.rotation.order = "YXZ";
    camera.rotation.y = yaw.current;
  }, [camera]);

  useEffect(() => {
    const map = (e: KeyboardEvent, v: boolean) => {
      const k = e.key.toLowerCase();
      if (k === "w" || k === "arrowup") keys.current.w = v;
      if (k === "s" || k === "arrowdown") keys.current.s = v;
      if (k === "a" || k === "arrowleft") keys.current.a = v;
      if (k === "d" || k === "arrowright") keys.current.d = v;
    };
    window.addEventListener("keydown", (e) => map(e, true));
    window.addEventListener("keyup", (e) => map(e, false));
    return () => { window.removeEventListener("keydown", (e) => map(e, true)); window.removeEventListener("keyup", (e) => map(e, false)); };
  }, []);

  useFrame((_, delta) => {
    // Apply look delta from touch/mouse drag
    if (touchDelta.current.dx !== 0 || touchDelta.current.dy !== 0) {
      yaw.current -= touchDelta.current.dx;
      pitch.current = Math.max(-0.4, Math.min(0.4, pitch.current - touchDelta.current.dy));
      camera.rotation.order = "YXZ";
      camera.rotation.y = yaw.current;
      camera.rotation.x = pitch.current;
      touchDelta.current = { dx: 0, dy: 0 };
    }

    const fwd = new THREE.Vector3();
    camera.getWorldDirection(fwd); fwd.y = 0;
    if (fwd.lengthSq() === 0) return;
    fwd.normalize();
    const right = new THREE.Vector3().crossVectors(fwd, new THREE.Vector3(0, 1, 0)).normalize();
    const dir = new THREE.Vector3();
    const w = keys.current.w || mobileKeys.current.w;
    const s = keys.current.s || mobileKeys.current.s;
    const a = keys.current.a || mobileKeys.current.a;
    const d = keys.current.d || mobileKeys.current.d;
    if (w) dir.add(fwd);
    if (s) dir.sub(fwd);
    if (d) dir.add(right);
    if (a) dir.sub(right);
    if (dir.lengthSq() > 0) {
      dir.normalize().multiplyScalar(speed * delta);
      camera.position.add(dir);
      const flat = new THREE.Vector2(camera.position.x, camera.position.z);
      if (flat.length() > 25) { flat.setLength(25); camera.position.x = flat.x; camera.position.z = flat.y; }
    }
    camera.position.y = 1.6;
  });

  return null;
}

const POSICIONES: Array<[number, number, number]> = [
  [-18, 1.0,  4],   // cubo    — lejos a la izquierda, ligeramente detrás
  [ 17, 1.0, -7],   // esfera  — lejos a la derecha, al frente
  [  3, 1.0, -22],  // cilindro — muy al frente, centro
  [-10, 1.0,  19],  // pirámide — detrás y a la izquierda
];
const ARBOLES: Array<[number, number, number]> = [
  // zona central / frente
  [-3, 0, -6], [4, 0, -8], [-9, 0, -10], [9, 0, -12],
  [-2, 0, -16], [6, 0, -18], [-6, 0, -20], [1, 0, -26],
  // zona derecha
  [12, 0, -2], [14, 0, -10], [20, 0, -4], [18, 0,  5],
  // zona izquierda
  [-12, 0, -4], [-15, 0, -2], [-20, 0,  2], [-16, 0, 10],
  // zona trasera
  [-5, 0, 10], [5, 0, 12], [-14, 0, 16], [8, 0, 18],
  [0, 0, 22], [-20, 0, 14], [14, 0, 15],
];

function Escena({ onSelectFigura, objetivoId, touchDelta, mobileKeys }: { onSelectFigura: (n: string) => void; objetivoId: string | null; touchDelta: React.MutableRefObject<{ dx: number; dy: number }>; mobileKeys: React.MutableRefObject<{ w: boolean; s: boolean; a: boolean; d: boolean }> }) {
  return (
    <>
      <FondoCabana />
      <ambientLight intensity={0.9} />
      <directionalLight position={[5, 10, 5]} intensity={1.1} castShadow />
      <Suelo />
      {ARBOLES.map((p, i) => <Arbol key={i} position={p} />)}
      {figuras.map((fig, i) => (
        <PersonajeFigura key={fig.id} figura={fig} position={POSICIONES[i] || [0, 1, -3]} onSelect={onSelectFigura} resaltado={objetivoId === fig.id} />
      ))}
      <MovementController touchDelta={touchDelta} mobileKeys={mobileKeys} />
    </>
  );
}

function DPad({ mobileKeys }: { mobileKeys: React.MutableRefObject<{ w: boolean; s: boolean; a: boolean; d: boolean }> }) {
  const btn = (dir: "w" | "s" | "a" | "d", Icon: React.FC<any>) => (
    <button
      className="w-14 h-14 bg-black/40 hover:bg-black/60 active:bg-black/70 rounded-2xl flex items-center justify-center text-white touch-none select-none"
      onPointerDown={(e) => { e.preventDefault(); mobileKeys.current[dir] = true; }}
      onPointerUp={() => mobileKeys.current[dir] = false}
      onPointerLeave={() => mobileKeys.current[dir] = false}
      onPointerCancel={() => mobileKeys.current[dir] = false}
    >
      <Icon className="w-7 h-7" />
    </button>
  );
  return (
    <div className="absolute bottom-4 right-4 flex flex-col items-center gap-1 select-none" style={{ touchAction: "none" }}>
      {btn("w", ChevronUp)}
      <div className="flex gap-1">
        {btn("a", ChevronLeft)}
        {btn("s", ChevronDown)}
        {btn("d", ChevronRight)}
      </div>
    </div>
  );
}

export default function VRCabana() {
  const { preferencias, nombreNino } = useProgreso();
  const [mensaje, setMensaje] = useState("¡Bienvenido a la Cabaña!");
  const [misionActiva, setMisionActiva] = useState(false);
  const [objetivoId, setObjetivoId] = useState<string | null>(null);
  const [puntos, setPuntos] = useState(0);

  // Touch/mouse look controls
  const touchDelta = useRef({ dx: 0, dy: 0 });
  const mobileKeys = useRef({ w: false, s: false, a: false, d: false });
  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const canvasWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = canvasWrapRef.current;
    if (!el) return;
    const onTM = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      // Ignore touches in D-pad zone (bottom-right 160x160)
      const rect = el.getBoundingClientRect();
      const touch = e.touches[0];
      if (touch.clientX - rect.left > rect.width - 160 && touch.clientY - rect.top > rect.height - 160) return;
      const dx = touch.clientX - lastPos.current.x;
      const dy = touch.clientY - lastPos.current.y;
      if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
        touchDelta.current.dx += dx * 0.004;
        touchDelta.current.dy += dy * 0.004;
        lastPos.current = { x: touch.clientX, y: touch.clientY };
        e.preventDefault();
      }
    };
    const onTS = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const rect = el.getBoundingClientRect();
      const touch = e.touches[0];
      if (touch.clientX - rect.left > rect.width - 160 && touch.clientY - rect.top > rect.height - 160) return;
      lastPos.current = { x: touch.clientX, y: touch.clientY };
    };
    el.addEventListener("touchstart", onTS, { passive: true });
    el.addEventListener("touchmove", onTM, { passive: false });
    return () => { el.removeEventListener("touchstart", onTS); el.removeEventListener("touchmove", onTM); };
  }, []);

  const onMouseDown = (e: React.MouseEvent) => { isDragging.current = true; lastPos.current = { x: e.clientX, y: e.clientY }; };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    touchDelta.current.dx += (e.clientX - lastPos.current.x) * 0.004;
    touchDelta.current.dy += (e.clientY - lastPos.current.y) * 0.004;
    lastPos.current = { x: e.clientX, y: e.clientY };
  };
  const onMouseUp = () => { isDragging.current = false; };

  useEffect(() => {
    const t = setTimeout(() => speak("¡Bienvenido a la Cabaña! Arrastra para mirar alrededor y usa los botones para moverte.", preferencias), 600);
    return () => clearTimeout(t);
  }, []);

  const elegirNuevoObjetivo = (excluirId?: string | null) => {
    const opciones = figuras.filter((f) => f.id !== excluirId);
    const nueva = opciones[Math.floor(Math.random() * opciones.length)];
    setObjetivoId(nueva.id);
    const texto = `¡Encuentra el ${nueva.nombre}!`;
    setMensaje(texto); speak(texto, preferencias);
  };

  const iniciarMision = () => { setPuntos(0); setMisionActiva(true); elegirNuevoObjetivo(null); };
  const terminarMision = () => {
    setMisionActiva(false); setObjetivoId(null);
    const txt = nombreNino ? `¡Felicitaciones, ${nombreNino}! ¡Lo lograste!` : "¡Buen trabajo!";
    setMensaje(txt); speak(txt, preferencias);
  };

  const art = (id: string) => (id === "esfera" || id === "piramide" ? "la" : "el");

  const handleSelect = (nombre: string) => {
    const figura = figuras.find((f) => f.nombre === nombre);
    if (!figura) return;
    if (misionActiva && objetivoId) {
      if (figura.id === objetivoId) {
        const np = puntos + 1; setPuntos(np);
        const feliz = nombreNino ? `¡Excelente, ${nombreNino}! Encontraste ${art(figura.id)} ${figura.nombre}.` : `¡Excelente! Encontraste ${art(figura.id)} ${figura.nombre}.`;
        setMensaje(feliz); speak(feliz, preferencias);
        if (np >= 4) setTimeout(() => terminarMision(), 4500);
        else setTimeout(() => elegirNuevoObjetivo(figura.id), 4500);
      } else {
        const objFig = figuras.find((f) => f.id === objetivoId);
        const obj = objFig?.nombre ?? "";
        const av = `Esa es ${art(figura.id)} ${figura.nombre}. Sigue buscando ${art(objetivoId)} ${obj}.`;
        setMensaje(av); speak(av, preferencias);
      }
      return;
    }
    const txt = `${figura.nombre}. ${figura.descripcionCorta}`;
    setMensaje(txt); speak(txt, preferencias);
  };

  return (
    <Layout title="Cabaña VR" ocultarPablito backTo="/jugar">
      <div className="flex flex-col gap-3 w-full">
        <div className="bg-white/90 backdrop-blur rounded-3xl p-3 shadow-md text-center">
          <p className="text-lg md:text-xl font-semibold text-foreground/90">{mensaje}</p>
          {misionActiva && (
            <div className="mt-2 flex items-center justify-center gap-3">
              <span className="bg-yellow-200 text-yellow-900 px-4 py-1.5 rounded-full font-bold text-lg">Puntos: {puntos} / 4</span>
              <Button size="sm" variant="outline" className="rounded-full" onClick={terminarMision}>Terminar misión</Button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <Button size="lg" className="h-14 px-8 text-xl rounded-2xl bg-pink-500 hover:bg-pink-600 text-white" onClick={iniciarMision} data-testid="btn-iniciar-mision">{misionActiva ? "Nueva misión" : "Iniciar misión"}</Button>
          <Button size="lg" variant="outline" className="h-14 px-8 text-xl rounded-2xl bg-white/70" onClick={() => store.enterVR()} data-testid="btn-entrar-vr">Entrar en VR</Button>
          <Link href="/jugar"><Button variant="outline" size="lg" className="h-14 px-8 text-xl rounded-2xl bg-white/70">Salir</Button></Link>
        </div>

        <div
          ref={canvasWrapRef}
          className="w-full rounded-3xl overflow-hidden shadow-xl border-4 border-white/70 bg-amber-100 relative cursor-grab active:cursor-grabbing"
          style={{ height: "58vh", touchAction: "none" }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
        >
          <Canvas shadows camera={{ position: [0, 1.6, 8], fov: 65 }}>
            <XR store={store}>
              <XROrigin position={[0, 0, 0]} />
              <Escena onSelectFigura={handleSelect} objetivoId={objetivoId} touchDelta={touchDelta} mobileKeys={mobileKeys} />
            </XR>
          </Canvas>

          {/* WASD hint — desktop */}
          <div className="absolute bottom-4 left-4 pointer-events-none hidden md:flex">
            <div className="bg-black/55 text-white px-4 py-2 rounded-2xl flex gap-3 items-center text-sm font-bold">
              <span className="flex flex-col items-center gap-0.5">
                <kbd className="bg-white/20 px-2 py-0.5 rounded">W</kbd>
                <div className="flex gap-0.5">
                  <kbd className="bg-white/20 px-2 py-0.5 rounded">A</kbd>
                  <kbd className="bg-white/20 px-2 py-0.5 rounded">S</kbd>
                  <kbd className="bg-white/20 px-2 py-0.5 rounded">D</kbd>
                </div>
              </span>
              <span className="opacity-80">mover · arrastrar para mirar</span>
            </div>
          </div>

          {/* Touch hint — mobile */}
          <div className="absolute bottom-24 left-4 pointer-events-none md:hidden">
            <div className="bg-black/55 text-white px-4 py-2 rounded-2xl text-sm font-bold">
              Arrastra para mirar · botones para mover
            </div>
          </div>

          {/* D-pad — always visible */}
          <DPad mobileKeys={mobileKeys} />
        </div>
      </div>
    </Layout>
  );
}
