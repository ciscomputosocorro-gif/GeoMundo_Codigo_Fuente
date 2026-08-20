import React, { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Layout } from "@/components/Layout";
import fondoCiudad from "@assets/ciudad_geomundo.png";
import { figuras } from "@/data/figuras";
import { Button } from "@/components/ui/button";
import { Figura3D } from "@/components/Figura3D";
import { useProgreso } from "@/lib/progreso";
import { playTone, speak, feedbackConNombre, feedbackIntento } from "@/lib/audio";

const MAX_QUESTIONS = 5;

export default function CuentaJuego() {
  const { preferencias, completarJuego, nombreNino } = useProgreso();
  const [, setLocation] = useLocation();
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [mensaje, setMensaje] = useState("");

  const questions = useMemo(() => {
    // Only use figures that have faces
    const figurasConCaras = figuras.filter(f => f.caracteristicas.caras !== undefined);
    
    return Array.from({ length: MAX_QUESTIONS }).map(() => {
      const correct = figurasConCaras[Math.floor(Math.random() * figurasConCaras.length)];
      const answer = correct.caracteristicas.caras!;
      
      let wrongAnswers = new Set<number>();
      while(wrongAnswers.size < 2) {
        const n = answer + Math.floor(Math.random() * 4) - 2;
        if (n !== answer && n > 0) wrongAnswers.add(n);
      }
      
      const options = [answer, ...Array.from(wrongAnswers)].sort(() => 0.5 - Math.random());
      return { correct, answer, options };
    });
  }, []);

  const currentQ = questions[questionIndex];

  const handleAnswer = (opcion: number) => {
    if (mensaje) return;

    if (opcion === currentQ.answer) {
      setScore(s => s + 1);
      const msg = feedbackConNombre(nombreNino);
      setMensaje(msg);
      playTone('exito', preferencias);
      speak(msg, preferencias);
      
      setTimeout(() => {
        setMensaje("");
        if (questionIndex < MAX_QUESTIONS - 1) {
          setQuestionIndex(i => i + 1);
        } else {
          completarJuego("cuenta", score + 1);
          setLocation("/jugar");
        }
      }, 2000);
    } else {
      const msg = feedbackIntento[Math.floor(Math.random() * feedbackIntento.length)];
      setMensaje(msg);
      playTone('intento', preferencias);
      speak(msg, preferencias);
      
      setTimeout(() => {
        setMensaje("");
      }, 2000);
    }
  };

  return (
    <Layout title="Cuenta las caras" backTo="/jugar" heroImage={fondoCiudad}>
      <div className="flex-1 flex flex-col gap-6 items-center w-full max-w-4xl mx-auto">
        <div className="w-full flex justify-between items-center bg-white/50 px-6 py-3 rounded-2xl">
          <span className="text-xl font-bold text-muted-foreground">Pregunta {questionIndex + 1} de {MAX_QUESTIONS}</span>
          <div className="flex gap-2">
            {Array.from({ length: MAX_QUESTIONS }).map((_, i) => (
              <div key={i} className={`w-4 h-4 rounded-full ${i < questionIndex ? 'bg-green-400' : (i === questionIndex ? 'bg-primary animate-pulse' : 'bg-gray-200')}`} />
            ))}
          </div>
        </div>

        <div className="w-full h-64 bg-white/80 rounded-[3rem] shadow-inner border-4 border-white relative overflow-hidden">
           {currentQ && <Figura3D figura={currentQ.correct} />}
        </div>

        <h2 className="text-3xl font-bold mt-4 text-center">¿Cuántas caras planas tiene esta figura?</h2>

        <div className="grid grid-cols-3 gap-4 w-full max-w-2xl mt-4">
          {currentQ?.options.map(opcion => (
            <Button
              key={opcion}
              onClick={() => handleAnswer(opcion)}
              className="h-24 text-4xl font-black rounded-[2rem] shadow-md hover:shadow-xl hover:-translate-y-1 transition-all bg-white text-foreground border-2 border-transparent hover:border-primary/30"
              variant="outline"
              data-testid={`opcion-${opcion}`}
            >
              {opcion}
            </Button>
          ))}
        </div>

        <AnimatePresence>
          {mensaje && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-8 py-4 rounded-full text-2xl font-bold shadow-xl z-10 ${
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
