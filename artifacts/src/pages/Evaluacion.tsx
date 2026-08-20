import React, { useState } from "react";
import { Link } from "wouter";
import { Layout } from "@/components/Layout";
import fondoParque from "@assets/parque_explorar.png";
import { figuras } from "@/data/figuras";
import { Button } from "@/components/ui/button";
import { Figura3D } from "@/components/Figura3D";
import { useProgreso } from "@/lib/progreso";
import { playTone, speak } from "@/lib/audio";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Star } from "lucide-react";

const TODAS_LAS_PREGUNTAS = [
  { q: "¿Qué figura es redonda como una pelota?", ans: "esfera" },
  { q: "¿Qué figura tiene 6 caras cuadradas iguales?", ans: "cubo" },
  { q: "¿Qué figura parece el techo de una casa?", ans: "piramide" },
  { q: "¿Qué figura parece una lata de refresco?", ans: "cilindro" },
  { q: "¿Qué figura es de color amarillo?", ans: "cubo" },
  { q: "¿Qué figura es de color verde?", ans: "esfera" },
  { q: "¿Qué figura es de color azul?", ans: "cilindro" },
  { q: "¿Qué figura es de color naranja?", ans: "piramide" },
  { q: "¿Qué figura puede rodar en todas las direcciones?", ans: "esfera" },
  { q: "¿Qué figura tiene una punta en la parte de arriba?", ans: "piramide" },
];

function mezclar<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function Evaluacion() {
  const { preferencias, otorgarInsignia } = useProgreso();
  const [questions] = useState(() => mezclar(TODAS_LAS_PREGUNTAS));
  const [index, setIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [stars, setStars] = useState(0);
  const [mensaje, setMensaje] = useState("");
  const [rating, setRating] = useState<"happy" | "sad" | null>(null);

  const currentQ = questions[index];

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ffb3ba', '#bae1ff', '#baffc9', '#ffffba']
    });
  };

  const handleAnswer = (id: string) => {
    if (mensaje) return;

    if (id === currentQ.ans) {
      setStars(s => s + 1);
      const msg = "¡Excelente!";
      setMensaje(msg);
      playTone('exito', preferencias);
      
      setTimeout(() => {
        setMensaje("");
        if (index < questions.length - 1) {
          setIndex(i => i + 1);
        } else {
          setFinished(true);
          triggerConfetti();
          otorgarInsignia("Graduado");
          speak("¡Excelente trabajo! Has completado la evaluación.", preferencias);
        }
      }, 1500);
    } else {
      const msg = "Inténtalo de nuevo.";
      setMensaje(msg);
      playTone('intento', preferencias);
      
      setTimeout(() => {
        setMensaje("");
      }, 1500);
    }
  };

  if (finished) {
    return (
      <Layout title="¡Evaluación Completada!" backTo="/menu" heroImage={fondoParque} mensajePablito="¡Lo lograste! Estoy muy orgulloso de ti.">
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-6">

          {/* Stars result card */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white p-5 md:p-10 rounded-[3rem] shadow-xl w-full max-w-2xl"
          >
            <h2 className="text-2xl md:text-5xl font-black text-primary-foreground mb-4 md:mb-6">¡Excelente trabajo!</h2>
            <div className="flex justify-center flex-wrap gap-2 md:gap-4 mb-4 md:mb-6">
              {Array.from({ length: stars }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: i * 0.2 }}
                  className="text-yellow-400"
                >
                  <Star className="w-8 h-8 md:w-14 md:h-14 fill-current" />
                </motion.div>
              ))}
            </div>
            <p className="text-base md:text-2xl text-foreground/80 font-medium">
              Conseguiste {stars} estrellas de {questions.length}. ¡Eres genial!
            </p>
          </motion.div>

          {/* Rating card */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white p-5 md:p-8 rounded-[3rem] shadow-xl w-full max-w-2xl"
          >
            <p className="text-lg md:text-2xl font-bold text-primary-foreground mb-4 md:mb-6">
              ¿Te gustó la nueva forma de aprender?
            </p>

            {rating === null ? (
              <div className="flex justify-center gap-6 md:gap-10">
                {/* Happy face */}
                <motion.button
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => {
                    setRating("happy");
                    speak("¡Qué bueno! Me alegra mucho.", preferencias);
                    fetch("/api/rating", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ rating: "happy", stars, total: questions.length }),
                    }).catch(() => {});
                  }}
                  className="flex flex-col items-center gap-2 cursor-pointer"
                >
                  <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-green-400 flex items-center justify-center shadow-lg text-3xl md:text-5xl">
                    😊
                  </div>
                  <span className="text-base md:text-lg font-semibold text-green-600">¡Sí!</span>
                </motion.button>

                {/* Sad face */}
                <motion.button
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => {
                    setRating("sad");
                    speak("Gracias por contarme. Lo haremos mejor.", preferencias);
                    fetch("/api/rating", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ rating: "sad", stars, total: questions.length }),
                    }).catch(() => {});
                  }}
                  className="flex flex-col items-center gap-2 cursor-pointer"
                >
                  <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-red-400 flex items-center justify-center shadow-lg text-3xl md:text-5xl">
                    😢
                  </div>
                  <span className="text-base md:text-lg font-semibold text-red-500">No mucho</span>
                </motion.button>
              </div>
            ) : (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center gap-4"
              >
                <div className={`w-20 h-20 rounded-full flex items-center justify-center text-5xl shadow-md ${rating === "happy" ? "bg-green-400" : "bg-red-400"}`}>
                  {rating === "happy" ? "😊" : "😢"}
                </div>
                <p className="text-xl font-semibold text-foreground/70">
                  {rating === "happy" ? "¡Qué bueno! Me alegra mucho. 🎉" : "Gracias por contarme. ¡Lo haremos mejor!"}
                </p>
              </motion.div>
            )}
          </motion.div>

          {/* Back button — always visible */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
            <Link href="/menu">
              <Button size="lg" className="h-14 px-6 text-lg md:h-20 md:px-10 md:text-2xl rounded-2xl">
                Volver al menú
              </Button>
            </Link>
          </motion.div>

        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Evaluación" backTo="/menu" heroImage={fondoParque} mensajePablito="¡Vamos! Lee la pregunta y elige la figura.">
      <div className="flex-1 flex flex-col gap-8 items-center w-full max-w-5xl mx-auto">
        <div className="bg-white p-4 md:p-8 rounded-[2rem] shadow-md text-center w-full">
          <p className="text-sm font-semibold text-foreground/50 mb-2">
            Pregunta {index + 1} de {questions.length}
          </p>
          <div className="flex gap-1 justify-center mb-3">
            {questions.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all ${
                  i < index ? "bg-green-400 w-5" : i === index ? "bg-primary w-5" : "bg-gray-200 w-3"
                }`}
              />
            ))}
          </div>
          <h2 className="text-xl md:text-3xl font-bold text-primary-foreground">{currentQ.q}</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 w-full">
          {figuras.map(figura => (
            <div 
              key={figura.id}
              onClick={() => handleAnswer(figura.id)}
              className="h-32 md:h-48 bg-white/80 rounded-[2rem] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer relative overflow-hidden border-2 border-transparent hover:border-primary"
            >
              <Figura3D figura={figura} />
              <div className="absolute inset-0 z-10" />
            </div>
          ))}
        </div>

        <AnimatePresence>
          {mensaje && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-8 py-4 rounded-full text-3xl font-bold shadow-2xl z-50 ${
                mensaje.includes('¡') ? 'bg-green-500 text-white' : 'bg-yellow-400 text-yellow-900'
              }`}
            >
              {mensaje}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
