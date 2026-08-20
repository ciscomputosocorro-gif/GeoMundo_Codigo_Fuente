import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useProgreso } from "@/lib/progreso";
import fondoCabana from "@assets/cabana_geomundo.jpg";
import pablito from "@assets/pablito.png";

type Paso = "intro" | "nombre";

export default function Home() {
  const { nombreNino, guardarNombre } = useProgreso();
  const [, setLocation] = useLocation();
  const [paso, setPaso] = useState<Paso>("intro");
  const [inputNombre, setInputNombre] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const yaConoceNombre = (nombreNino ?? "").trim().length > 0;

  const handleComenzar = () => {
    if (yaConoceNombre) {
      setLocation("/menu");
    } else {
      setPaso("nombre");
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  };

  const handleGuardar = () => {
    const nombre = inputNombre.trim();
    if (!nombre) return;
    guardarNombre(nombre);
    setLocation("/menu");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleGuardar();
  };

  return (
    <div
      className="min-h-[100dvh] w-full flex flex-col items-center justify-center p-6 relative overflow-hidden"
      style={{
        backgroundImage: `url(${fondoCabana})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <AnimatePresence mode="wait">

        {/* ── PASO: intro ── */}
        {paso === "intro" && (
          <motion.div
            key="intro"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="text-center max-w-3xl relative z-10"
          >
            <div className="inline-block px-8 py-6 rounded-[2.5rem] bg-white/75 backdrop-blur-sm shadow-xl mb-6">
              <h1 className="text-5xl md:text-7xl font-extrabold text-primary-foreground mb-3 drop-shadow-sm">
                GeoMundo Interactivo
              </h1>
              <p className="text-2xl text-foreground/80 font-medium">
                ¡Descubre la magia de las formas en 3D!
              </p>
            </div>

            <div className="flex items-end justify-center gap-4 mb-6">
              <motion.img
                src={pablito}
                alt="Pablito"
                className="h-48 md:h-64 object-contain drop-shadow-2xl"
                draggable={false}
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              />
              <div className="bg-white/90 rounded-3xl rounded-bl-md px-6 py-4 shadow-lg max-w-sm mb-6">
                <p className="text-xl md:text-2xl font-semibold text-foreground/90">
                  {yaConoceNombre
                    ? <>¡Bienvenido de vuelta, <span className="text-primary">{nombreNino}</span>! ¿Listo para aprender más?</>
                    : <>¡Hola! Soy <span className="text-primary">Pablito</span> y vamos a descubrir las figuras juntos.</>
                  }
                </p>
              </div>
            </div>

            <Button
              size="lg"
              onClick={handleComenzar}
              className="h-24 px-12 text-3xl rounded-3xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 bg-primary text-primary-foreground"
              data-testid="btn-comenzar"
            >
              {yaConoceNombre ? "¡Seguir jugando!" : "Comenzar"}
            </Button>
          </motion.div>
        )}

        {/* ── PASO: nombre ── */}
        {paso === "nombre" && (
          <motion.div
            key="nombre"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="text-center max-w-2xl relative z-10 w-full"
          >
            <div className="flex items-end justify-center gap-4 mb-6">
              <motion.img
                src={pablito}
                alt="Pablito"
                className="h-48 md:h-56 object-contain drop-shadow-2xl"
                draggable={false}
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              />
              <div className="bg-white/90 rounded-3xl rounded-bl-md px-6 py-4 shadow-lg max-w-xs mb-6">
                <p className="text-xl md:text-2xl font-semibold text-foreground/90">
                  ¿Cómo te llamas? ¡Escribe tu nombre para que pueda saludarte!
                </p>
              </div>
            </div>

            <div className="bg-white/85 backdrop-blur-sm rounded-[2.5rem] shadow-xl px-8 py-8 flex flex-col items-center gap-6">
              <input
                ref={inputRef}
                type="text"
                value={inputNombre}
                onChange={e => setInputNombre(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Tu nombre aquí..."
                maxLength={24}
                className="w-full text-center text-3xl font-bold rounded-2xl border-4 border-primary/40 focus:border-primary outline-none px-6 py-4 bg-white shadow-inner placeholder:text-foreground/30"
                data-testid="input-nombre"
              />
              <Button
                size="lg"
                onClick={handleGuardar}
                disabled={!inputNombre.trim()}
                className="h-20 px-12 text-2xl rounded-3xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 bg-primary text-primary-foreground disabled:opacity-40"
                data-testid="btn-guardar-nombre"
              >
                ¡Vamos!
              </Button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
