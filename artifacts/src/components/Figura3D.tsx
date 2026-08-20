import { useState } from "react";
import { motion } from "framer-motion";
import { useProgreso } from "@/lib/progreso";
import { playTone } from "@/lib/audio";
import { Figura } from "@/data/figuras";

interface Figura3DProps {
  figura: Figura;
}

export function Figura3D({ figura }: Figura3DProps) {
  const { preferencias } = useProgreso();
  const [clicked, setClicked] = useState(false);
  const bajoEstimulos = preferencias.estimulos === "bajo";

  const handleClick = () => {
    setClicked(true);
    playTone("exito", preferencias);
    setTimeout(() => setClicked(false), 350);
  };

  return (
    <div
      className="w-full h-full flex items-center justify-center relative cursor-pointer select-none"
      data-testid={`canvas-${figura.id}`}
      onClick={handleClick}
    >
      <div
        aria-hidden
        className="absolute rounded-full"
        style={{
          width: "70%",
          height: "70%",
          background: `radial-gradient(circle, ${figura.color}55 0%, ${figura.color}00 70%)`,
          filter: "blur(10px)",
        }}
      />
      <motion.img
        src={figura.imagen}
        alt={figura.nombre}
        draggable={false}
        className="relative max-h-[85%] max-w-[85%] object-contain drop-shadow-xl"
        animate={
          clicked
            ? { scale: [1, 1.18, 1], rotate: [0, -4, 4, 0] }
            : bajoEstimulos
            ? { y: 0 }
            : { y: [0, -10, 0] }
        }
        transition={
          clicked
            ? { duration: 0.35, ease: "easeOut" }
            : { duration: 3, repeat: Infinity, ease: "easeInOut" }
        }
        whileHover={bajoEstimulos ? undefined : { scale: 1.05 }}
      />
    </div>
  );
}
