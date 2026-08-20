import React, { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Layout } from "@/components/Layout";
import fondoCiudad from "@assets/ciudad_geomundo.png";
import { figuras, Figura } from "@/data/figuras";
import { Button } from "@/components/ui/button";
import { Figura3D } from "@/components/Figura3D";
import { useProgreso } from "@/lib/progreso";
import { playTone, speak, feedbackConNombre, feedbackIntento } from "@/lib/audio";

const MAX_QUESTIONS = 5;

export default function EncuentraJuego() {
  const { preferencias, completarJuego, nombreNino } = useProgreso();
  const [, setLocation] = useLocation();
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [mensaje, setMensaje] = useState("");

  const questions = useMemo(() => {
    return Array.from({ length: MAX_QUESTIONS }).map(() => {
      const correct = figuras[Math.floor(Math.random() * figuras.length)];
      const ejemplo = correct.ejemplos[Math.floor(Math.random() * correct.ejemplos.length)];
      const wrongOptions = figuras.filter(f => f.id !== correct.id).sort(() => 0.5 - Math.random()).slice(0, 2);
      const options = [correct, ...wrongOptions].sort(() => 0.5 - Math.random());
      return { correct, ejemplo, options };
    });
  }, []);

  const currentQ = questions[questionIndex];

  const handleAnswer = (opcion: Figura) => {
    if (mensaje) return; // Prevent multiple clicks

    if (opcion.id === currentQ.correct.id) {
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
          completarJuego("encuentra", score + 1);
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
    <Layout title="Encuentra el objeto" backTo="/jugar" heroImage={fondoCiudad}>
      <div className="flex-1 flex flex-col gap-6 items-center w-full max-w-5xl mx-auto">
        <div className="w-full flex justify-between items-center bg-white/50 px-6 py-3 rounded-2xl">
          <span className="text-xl font-bold text-muted-foreground">Pregunta {questionIndex + 1} de {MAX_QUESTIONS}</span>
          <div className="flex gap-2">
            {Array.from({ length: MAX_QUESTIONS }).map((_, i) => (
              <div key={i} className={`w-4 h-4 rounded-full ${i < questionIndex ? 'bg-green-400' : (i === questionIndex ? 'bg-primary animate-pulse' : 'bg-gray-200')}`} />
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-md text-center w-full max-w-2xl mb-4">
          <h2 className="text-2xl text-muted-foreground mb-2">¿Qué figura se parece a...</h2>
          <p className="text-4xl font-extrabold text-primary-foreground">{currentQ?.ejemplo}?</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {currentQ?.options.map(opcion => (
            <div 
              key={opcion.id}
              onClick={() => handleAnswer(opcion)}
              className="h-64 bg-white/80 rounded-[3rem] shadow-md hover:shadow-xl hover:-translate-y-2 transition-all cursor-pointer border-4 border-transparent hover:border-primary relative overflow-hidden"
              data-testid={`opcion-${opcion.id}`}
            >
              <Figura3D figura={opcion} />
            </div>
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
