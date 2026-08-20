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
import fondoCiudad from "@assets/parque_explorar.png";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

const store = createXRStore();

// ── Trivia mode ──────────────────────────────────────────────────────────────
interface Pregunta { texto: string; respuestaId: string; }
const PREGUNTAS: Pregunta[] = [
  { texto: "¿Qué figura tiene 6 caras iguales?", respuestaId: "cubo" },
  { texto: "¿Qué figura no tiene ninguna esquina?", respuestaId: "esfera" },
  { texto: "¿Qué figura rueda fácilmente como una pelota?", respuestaId: "esfera" },
  { texto: "¿Qué figura tiene la forma de una lata?", respuestaId: "cilindro" },
  { texto: "¿Qué figura tiene caras triangulares?", respuestaId: "piramide" },
  { texto: "¿Qué figura es de color amarillo?", respuestaId: "cubo" },
  { texto: "¿Qué figura es completamente redonda?", respuestaId: "esfera" },
  { texto: "¿Qué figura tiene 8 vértices?", respuestaId: "cubo" },
  { texto: "¿Qué figura es de color verde?", respuestaId: "esfera" },
  { texto: "¿Qué figura tiene dos círculos, uno arriba y uno abajo?", respuestaId: "cilindro" },
  { texto: "¿Qué figura tiene una sola punta arriba?", respuestaId: "piramide" },
  { texto: "¿Qué figura es de color azul?", respuestaId: "cilindro" },
  { texto: "¿Qué figura tiene 12 aristas?", respuestaId: "cubo" },
  { texto: "¿Qué figura tiene una punta en lo alto como las pirámides de Egipto?", respuestaId: "piramide" },
  { texto: "¿Qué figura se parece a un dado?", respuestaId: "cubo" },
  { texto: "¿Qué figura es de color naranja?", respuestaId: "piramide" },
  { texto: "¿Qué figura parece un techo puntiagudo?", respuestaId: "piramide" },
  { texto: "¿Qué figura parece una naranja?", respuestaId: "esfera" },
];

// ── Mission mode ─────────────────────────────────────────────────────────────
interface Mision { texto: string; respuestaId: string; }
const MISIONES: Mision[] = [
  // ── Cubo ──────────────────────────────────────────────────────────────────
  { texto: "¡Busca la figura de color AMARILLO!", respuestaId: "cubo" },
  { texto: "¡Encuentra la figura amarilla que parece un dado!", respuestaId: "cubo" },
  { texto: "¡La figura amarilla tiene 6 caras — ¡búscala!", respuestaId: "cubo" },
  { texto: "¡Busca la figura con todas sus caras cuadradas!", respuestaId: "cubo" },
  { texto: "¡Busca la figura con muchas esquinas!", respuestaId: "cubo" },
  { texto: "¡Busca la figura amarilla que parece una caja de regalo!", respuestaId: "cubo" },
  { texto: "¡Encuentra la figura amarilla con 8 vértices!", respuestaId: "cubo" },
  { texto: "¡La figura amarilla tiene 12 aristas — ¡búscala!", respuestaId: "cubo" },
  { texto: "¡Busca la figura amarilla que no rueda!", respuestaId: "cubo" },
  { texto: "¡Encuentra la figura del color del sol!", respuestaId: "cubo" },
  // ── Esfera ────────────────────────────────────────────────────────────────
  { texto: "¡Busca la figura de color VERDE!", respuestaId: "esfera" },
  { texto: "¡Encuentra la figura verde y completamente redonda!", respuestaId: "esfera" },
  { texto: "¡La figura verde rueda como una pelota — ¡búscala!", respuestaId: "esfera" },
  { texto: "¡Busca la figura verde sin ninguna esquina ni borde!", respuestaId: "esfera" },
  { texto: "¡Encuentra la figura verde que parece una naranja!", respuestaId: "esfera" },
  { texto: "¡Busca la figura del color de la hierba!", respuestaId: "esfera" },
  { texto: "¡La figura verde no tiene caras planas — ¡búscala!", respuestaId: "esfera" },
  { texto: "¡Encuentra la figura verde que parece una pelota de fútbol!", respuestaId: "esfera" },
  { texto: "¡Busca la figura verde que rueda en todas las direcciones!", respuestaId: "esfera" },
  { texto: "¡La figura del color de los árboles — ¡encuéntrala!", respuestaId: "esfera" },
  // ── Cilindro ──────────────────────────────────────────────────────────────
  { texto: "¡Busca la figura de color AZUL!", respuestaId: "cilindro" },
  { texto: "¡Encuentra la figura azul con forma de tubo!", respuestaId: "cilindro" },
  { texto: "¡La figura azul parece una lata de refresco — ¡búscala!", respuestaId: "cilindro" },
  { texto: "¡Busca la figura azul con un círculo arriba y otro abajo!", respuestaId: "cilindro" },
  { texto: "¡Encuentra la figura azul que parece un vaso!", respuestaId: "cilindro" },
  { texto: "¡Busca la figura del color del cielo!", respuestaId: "cilindro" },
  { texto: "¡La figura azul tiene 3 caras — ¡encuéntrala!", respuestaId: "cilindro" },
  { texto: "¡Busca la figura azul que puede rodar de lado!", respuestaId: "cilindro" },
  { texto: "¡Encuentra la figura azul que parece un rodillo!", respuestaId: "cilindro" },
  { texto: "¡La figura del color del mar — ¡búscala!", respuestaId: "cilindro" },
  // ── Pirámide ──────────────────────────────────────────────────────────────
  { texto: "¡Busca la figura de color NARANJA!", respuestaId: "piramide" },
  { texto: "¡Encuentra la figura naranja con una punta en lo alto!", respuestaId: "piramide" },
  { texto: "¡La figura naranja parece un techo puntiagudo — ¡búscala!", respuestaId: "piramide" },
  { texto: "¡Busca la figura naranja con caras en forma de triángulo!", respuestaId: "piramide" },
  { texto: "¡Encuentra la figura naranja de las pirámides de Egipto!", respuestaId: "piramide" },
  { texto: "¡Busca la figura del color de una naranja madura!", respuestaId: "piramide" },
  { texto: "¡La figura naranja tiene 5 vértices — ¡encuéntrala!", respuestaId: "piramide" },
  { texto: "¡Busca la figura naranja que termina en punta!", respuestaId: "piramide" },
  { texto: "¡Encuentra la figura naranja que se desliza por el suelo!", respuestaId: "piramide" },
  { texto: "¡La figura del color del atardecer — ¡búscala!", respuestaId: "piramide" },
];

// ── 3D Background ─────────────────────────────────────────────────────────────
function FondoCiudad() {
  const texture = useLoader(THREE.TextureLoader, fondoCiudad);
  useEffect(() => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    texture.colorSpace = THREE.SRGBColorSpace;
  }, [texture]);
  return (
    <mesh scale={[-1, 1, 1]}>
      <sphereGeometry args={[60, 64, 32]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} toneMapped={false} />
    </mesh>
  );
}

function Suelo() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <circleGeometry args={[30, 64]} />
      <meshStandardMaterial color="#8d8d8d" roughness={0.9} />
    </mesh>
  );
}

function Acera() {
  return (
    <group>
      {[-4, 0, 4].map((x) =>
        [-6, -12, -18].map((z) => (
          <mesh key={`${x}${z}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.01, z]}>
            <planeGeometry args={[0.3, 2.5]} />
            <meshStandardMaterial color="#b0b0b0" />
          </mesh>
        ))
      )}
    </group>
  );
}

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

function PersonajeFigura({ figura, position, onSelect, resaltado }: {
  figura: typeof figuras[number];
  position: [number, number, number];
  onSelect: (n: string) => void;
  resaltado: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const baseY = position[1];
  const seed = useRef(Math.random() * Math.PI * 2);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = baseY + Math.sin(state.clock.elapsedTime + seed.current) * 0.13;
    }
  });

  const renderBody = () => {
    switch (figura.id) {
      case "cubo": return <mesh castShadow><boxGeometry args={[1.7, 1.7, 1.7]} /><meshStandardMaterial color={figura.color} roughness={0.4} metalness={0.15} /></mesh>;
      case "esfera": return <mesh castShadow><sphereGeometry args={[1.05, 32, 32]} /><meshStandardMaterial color={figura.color} roughness={0.35} metalness={0.1} /></mesh>;
      case "cilindro": return <mesh castShadow><cylinderGeometry args={[0.85, 0.85, 1.9, 32]} /><meshStandardMaterial color={figura.color} roughness={0.4} metalness={0.15} /></mesh>;
      case "piramide": return <mesh castShadow rotation={[0, Math.PI / 4, 0]}><coneGeometry args={[1.2, 1.9, 4]} /><meshStandardMaterial color={figura.color} roughness={0.4} flatShading /></mesh>;
      default: return null;
    }
  };

  const fo = {
    cubo:     { y: 0.06, z: 0.92, s: 1.8 },
    esfera:   { y: 0.06, z: 1.12, s: 1.8 },
    cilindro: { y: 0.14, z: 0.97, s: 1.8 },
    piramide: { y: -0.07, z: 0.90, s: 1.75 },
  }[figura.id] ?? { y: 0.06, z: 0.92, s: 1.8 };

  return (
    <group>
      <group
        ref={groupRef}
        position={position}
        scale={hovered ? 1.15 : resaltado ? 1.08 : 1}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
        onPointerOut={() => setHovered(false)}
        onClick={(e) => { e.stopPropagation(); onSelect(figura.nombre); }}
      >
        {renderBody()}
        <Cara3D yOffset={fo.y} zOffset={fo.z} scale={fo.s} />
        <Billboard position={[0, 1.2, 0]}>
          <Text fontSize={0.3} color="#ffffff" outlineWidth={0.04} outlineColor="#1f2937" anchorX="center" anchorY="middle">
            {figura.nombre}
          </Text>
        </Billboard>
      </group>
    </group>
  );
}

// ── Movement ─────────────────────────────────────────────────────────────────
interface MoveControllerProps {
  speed?: number;
  touchDelta: React.MutableRefObject<{ dx: number; dy: number }>;
  mobileKeys: React.MutableRefObject<{ w: boolean; s: boolean; a: boolean; d: boolean }>;
}

function MovementController({ speed = 4, touchDelta, mobileKeys }: MoveControllerProps) {
  const { camera } = useThree();
  const keys = useRef({ w: false, s: false, a: false, d: false });
  const yaw = useRef(Math.PI);
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
    const dn = (e: KeyboardEvent) => map(e, true);
    const up = (e: KeyboardEvent) => map(e, false);
    window.addEventListener("keydown", dn);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", dn); window.removeEventListener("keyup", up); };
  }, []);

  useFrame((_, delta) => {
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
    if (keys.current.w || mobileKeys.current.w) dir.add(fwd);
    if (keys.current.s || mobileKeys.current.s) dir.sub(fwd);
    if (keys.current.d || mobileKeys.current.d) dir.add(right);
    if (keys.current.a || mobileKeys.current.a) dir.sub(right);
    if (dir.lengthSq() > 0) {
      dir.normalize().multiplyScalar(speed * delta);
      camera.position.add(dir);
      const flat = new THREE.Vector2(camera.position.x, camera.position.z);
      if (flat.length() > 22) { flat.setLength(22); camera.position.x = flat.x; camera.position.z = flat.y; }
    }
    camera.position.y = 1.6;
  });
  return null;
}

const POSICIONES: Array<[number, number, number]> = [
  [-17, 2.2,  3],   // cubo     — lejos a la izquierda, detrás
  [ 16, 2.2, -8],   // esfera   — lejos a la derecha, al frente
  [  2, 2.2, -22],  // cilindro — muy al frente, centro
  [ 15, 2.2,  14],  // pirámide — lejos a la derecha, detrás
];

function Escena({ onSelectFigura, objetivoId, touchDelta, mobileKeys }: {
  onSelectFigura: (n: string) => void;
  objetivoId: string | null;
  touchDelta: React.MutableRefObject<{ dx: number; dy: number }>;
  mobileKeys: React.MutableRefObject<{ w: boolean; s: boolean; a: boolean; d: boolean }>;
}) {
  return (
    <>
      <FondoCiudad />
      <ambientLight intensity={1.1} />
      <directionalLight position={[5, 10, 5]} intensity={1.3} castShadow />
      <pointLight position={[0, 3, 0]} intensity={0.6} distance={20} />
      <Suelo />
      <Acera />
      {figuras.map((fig, i) => (
        <PersonajeFigura
          key={fig.id}
          figura={fig}
          position={POSICIONES[i] || [0, 1.1, -5]}
          onSelect={onSelectFigura}
          resaltado={objetivoId === fig.id}
        />
      ))}
      <MovementController touchDelta={touchDelta} mobileKeys={mobileKeys} />
    </>
  );
}

// ── D-Pad ─────────────────────────────────────────────────────────────────────
function DPad({ mobileKeys }: { mobileKeys: React.MutableRefObject<{ w: boolean; s: boolean; a: boolean; d: boolean }> }) {
  const btn = (dir: "w" | "s" | "a" | "d", Icon: React.FC<any>) => (
    <button
      className="w-14 h-14 bg-black/40 hover:bg-black/60 active:bg-black/70 rounded-2xl flex items-center justify-center text-white touch-none select-none"
      onPointerDown={(e) => { e.preventDefault(); mobileKeys.current[dir] = true; }}
      onPointerUp={() => { mobileKeys.current[dir] = false; }}
      onPointerLeave={() => { mobileKeys.current[dir] = false; }}
      onPointerCancel={() => { mobileKeys.current[dir] = false; }}
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

// ── Page ─────────────────────────────────────────────────────────────────────
type Modo = "libre" | "trivia" | "mision";

export default function VRCiudad() {
  const { preferencias, nombreNino } = useProgreso();

  // Shared
  const [mensaje, setMensaje] = useState("¡Bienvenido al Parque!");
  const [resultado, setResultado] = useState<"correcto" | "incorrecto" | null>(null);
  const [modo, setModo] = useState<Modo>("libre");
  const [objetivoId, setObjetivoId] = useState<string | null>(null);

  // Trivia
  const [preguntaIdx, setPreguntaIdx] = useState(0);
  const [puntos, setPuntos] = useState(0);
  const [totalPreguntadas, setTotalPreguntadas] = useState(0);

  // Misión
  const [misionIdx, setMisionIdx] = useState(0);
  const [puntosMision, setPuntosMision] = useState(0);
  const [totalMision, setTotalMision] = useState(0);
  const misionOrden = useRef<Mision[]>([]);

  // Touch controls
  const touchDelta = useRef({ dx: 0, dy: 0 });
  const mobileKeys = useRef({ w: false, s: false, a: false, d: false });
  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const canvasWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = canvasWrapRef.current;
    if (!el) return;
    const onTS = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const rect = el.getBoundingClientRect();
      const t = e.touches[0];
      if (t.clientX - rect.left > rect.width - 160 && t.clientY - rect.top > rect.height - 160) return;
      lastPos.current = { x: t.clientX, y: t.clientY };
    };
    const onTM = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const rect = el.getBoundingClientRect();
      const t = e.touches[0];
      if (t.clientX - rect.left > rect.width - 160 && t.clientY - rect.top > rect.height - 160) return;
      const dx = t.clientX - lastPos.current.x;
      const dy = t.clientY - lastPos.current.y;
      if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
        touchDelta.current.dx += dx * 0.004;
        touchDelta.current.dy += dy * 0.004;
        lastPos.current = { x: t.clientX, y: t.clientY };
        e.preventDefault();
      }
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
    const t = setTimeout(() => speak("¡Bienvenido al Parque! Elige Trivia o Misión para jugar.", preferencias), 600);
    return () => clearTimeout(t);
  }, []);

  // ── Start trivia ────────────────────────────────────────────────────────────
  const iniciarTrivia = () => {
    const orden = [...PREGUNTAS].sort(() => Math.random() - 0.5);
    setPreguntaIdx(0); setPuntos(0); setTotalPreguntadas(0); setResultado(null);
    setObjetivoId(null);
    setModo("trivia");
    const txt = orden[0].texto;
    setMensaje(txt); speak(txt, preferencias);
  };

  // ── Start misión ────────────────────────────────────────────────────────────
  const iniciarMision = () => {
    const orden = [...MISIONES].sort(() => Math.random() - 0.5).slice(0, 6);
    misionOrden.current = orden;
    setPuntosMision(0); setTotalMision(0); setMisionIdx(0); setResultado(null);
    setModo("mision");
    setObjetivoId(orden[0].respuestaId);
    const txt = orden[0].texto;
    setMensaje(txt); speak(txt, preferencias);
  };

  const preguntaActual = PREGUNTAS[preguntaIdx % PREGUNTAS.length];

  // ── Handle figure click ────────────────────────────────────────────────────
  const handleSelect = (nombre: string) => {
    const figura = figuras.find((f) => f.nombre === nombre);
    if (!figura) return;

    // Libre — just describe
    if (modo === "libre") {
      speak(`${figura.nombre}. ${figura.descripcionCorta}`, preferencias);
      setMensaje(`${figura.nombre}: ${figura.descripcionCorta}`);
      return;
    }

    // Trivia
    if (modo === "trivia") {
      const esCorrecta = figura.id === preguntaActual.respuestaId;
      const np = puntos + (esCorrecta ? 1 : 0);
      const nt = totalPreguntadas + 1;
      setPuntos(np); setTotalPreguntadas(nt); setResultado(esCorrecta ? "correcto" : "incorrecto");
      const art = (id: string) => (id === "esfera" || id === "piramide" ? "la" : "el");
      const artM = (id: string) => (id === "esfera" || id === "piramide" ? "La" : "El");
      if (esCorrecta) {
        const txt = `¡Correcto! ${artM(figura.id)} ${figura.nombre} es la respuesta.`;
        setMensaje(txt); speak(txt, preferencias);
      } else {
        const correcta = figuras.find((f) => f.id === preguntaActual.respuestaId);
        const txt = `No es correcto. Era ${art(correcta?.id ?? "")} ${correcta?.nombre ?? ""}.`;
        setMensaje(txt); speak(txt, preferencias);
      }
      if (nt >= 8) {
        setTimeout(() => {
          setModo("libre"); setObjetivoId(null);
          const fin = `¡Terminaste la trivia! Acertaste ${np} de 8. ¡Muy bien!`;
          setMensaje(fin); speak(fin, preferencias); setResultado(null);
        }, 4500);
      } else {
        const si = (preguntaIdx + 1) % PREGUNTAS.length;
        setTimeout(() => { setPreguntaIdx(si); setResultado(null); const txt = PREGUNTAS[si].texto; setMensaje(txt); speak(txt, preferencias); }, 4500);
      }
      return;
    }

    // Misión
    if (modo === "mision") {
      const misionActual = misionOrden.current[misionIdx];
      const esCorrecta = figura.id === misionActual.respuestaId;
      const np = puntosMision + (esCorrecta ? 1 : 0);
      const nt = totalMision + 1;
      setPuntosMision(np); setTotalMision(nt); setResultado(esCorrecta ? "correcto" : "incorrecto");

      const artM2 = (id: string) => (id === "esfera" || id === "piramide" ? "la" : "el");
      if (esCorrecta) {
        const txt = nombreNino ? `¡Muy bien, ${nombreNino}! Encontraste ${artM2(figura.id)} ${figura.nombre}.` : `¡Muy bien! Encontraste ${artM2(figura.id)} ${figura.nombre}.`;
        setMensaje(txt); speak(txt, preferencias);
      } else {
        const correcta = figuras.find((f) => f.id === misionActual.respuestaId);
        const txt = `Esa es ${artM2(figura.id)} ${figura.nombre}. Sigue buscando ${artM2(correcta?.id ?? "")} ${correcta?.nombre ?? ""}.`;
        setMensaje(txt); speak(txt, preferencias);
      }

      const siguienteIdx = misionIdx + (esCorrecta ? 1 : 0);
      if (esCorrecta && siguienteIdx >= misionOrden.current.length) {
        setTimeout(() => {
          setModo("libre"); setObjetivoId(null);
          const fin = nombreNino ? `¡Misión completada, ${nombreNino}! Encontraste ${np} figuras. ¡Eres increíble!` : `¡Misión completada! Encontraste ${np} figuras. ¡Excelente!`;
          setMensaje(fin); speak(fin, preferencias); setResultado(null);
        }, 4500);
      } else if (esCorrecta) {
        setTimeout(() => {
          setMisionIdx(siguienteIdx);
          setResultado(null);
          const sig = misionOrden.current[siguienteIdx];
          setObjetivoId(sig.respuestaId);
          setMensaje(sig.texto); speak(sig.texto, preferencias);
        }, 4500);
      } else {
        // wrong — keep same objective, just clear result flash
        setTimeout(() => setResultado(null), 4500);
      }
    }
  };

  const bgColor = resultado === "correcto" ? "bg-green-100/95" : resultado === "incorrecto" ? "bg-red-100/95" : "bg-white/90";
  const misionActual = modo === "mision" ? misionOrden.current[misionIdx] : null;

  return (
    <Layout title="Parque VR" ocultarPablito backTo="/jugar">
      <div className="flex flex-col gap-3 w-full">

        {/* Info panel */}
        <div className={`backdrop-blur rounded-3xl p-3 shadow-md text-center transition-colors ${bgColor}`}>
          {modo === "trivia" && <p className="text-sm font-semibold text-foreground/60 mb-1">Trivia — Pregunta {totalPreguntadas + 1} de 8 · Puntos: {puntos}</p>}
          {modo === "mision" && <p className="text-sm font-semibold text-foreground/60 mb-1">Misión {misionIdx + 1} de {misionOrden.current.length} · Puntos: {puntosMision}</p>}
          <p className="text-lg md:text-xl font-semibold text-foreground/90">{mensaje}</p>
          {modo === "libre" && totalPreguntadas > 0 && <p className="text-base font-bold mt-1">Trivia: {puntos} / 8</p>}
          {modo === "libre" && totalMision > 0 && puntosMision > 0 && totalPreguntadas === 0 && (
            <p className="text-base font-bold mt-1">Misión: {puntosMision} figuras encontradas</p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap justify-center gap-3">
          <Button
            size="lg"
            className="h-14 px-7 text-lg rounded-2xl bg-cyan-500 hover:bg-cyan-600 text-white"
            onClick={iniciarTrivia}
            data-testid="btn-iniciar-juego"
          >
            {modo === "trivia" ? "Reiniciar trivia" : "Trivia"}
          </Button>
          <Button
            size="lg"
            className="h-14 px-7 text-lg rounded-2xl bg-pink-500 hover:bg-pink-600 text-white"
            onClick={iniciarMision}
            data-testid="btn-iniciar-mision"
          >
            {modo === "mision" ? "Nueva misión" : "Misión"}
          </Button>
          <Button size="lg" variant="outline" className="h-14 px-7 text-lg rounded-2xl bg-white/70" onClick={() => store.enterVR()}>Entrar en VR</Button>
          <Link href="/jugar"><Button variant="outline" size="lg" className="h-14 px-7 text-lg rounded-2xl bg-white/70">Salir</Button></Link>
        </div>

        {/* 3D canvas */}
        <div
          ref={canvasWrapRef}
          className="w-full h-[55vh] rounded-3xl overflow-hidden shadow-xl border-4 border-white/70 bg-cyan-900 relative cursor-grab active:cursor-grabbing"
          style={{ touchAction: "none" }}
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

          {/* Desktop hint */}
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

          {/* Mobile hint */}
          <div className="absolute bottom-24 left-4 pointer-events-none md:hidden">
            <div className="bg-black/55 text-white px-4 py-2 rounded-2xl text-sm font-bold">
              Arrastra para mirar · botones para mover
            </div>
          </div>

          <DPad mobileKeys={mobileKeys} />
        </div>
      </div>
    </Layout>
  );
}
