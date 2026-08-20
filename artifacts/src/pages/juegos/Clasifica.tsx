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
import { Card } from "@/components/ui/card";

const MAX_QUESTIONS = 5;

export default function ClasificaJuego() {
  const { preferencias, completarJuego, nombreNino } = useProgreso();
  const [, setLocation] = useLocation();
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [mensaje, setMensaje] = useState("");

  const questions = useMemo(() => {
    return Array.from({ length: MAX_QUESTIONS }).map(() => {
      const correct = figuras[Math.floor(Math.random() * figuras.length)];
      const answer = correct.caracteristicas.ruedaOSeDesliza.toLowerCase().includes("rueda") ? "rueda" : "desliza";
      return { correct, answer };
    });
  }, []);

  const currentQ = questions[questionIndex];

  const handleAnswer = (opcion: string) => {
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
          completarJuego("clasifica", score + 1);
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
    <Layout title="Clasifica las figuras" backTo="/jugar" heroImage={fondoCiudad}>
      <div className="flex-1 flex flex-col gap-6 items-center w-full max-w-4xl mx-auto">
        <div className="w-full flex justify-between items-center bg-white/50 px-6 py-3 rounded-2xl mb-4">
          <span className="text-xl font-bold text-muted-foreground">Pregunta {questionIndex + 1} de {MAX_QUESTIONS}</span>
          <div className="flex gap-2">
            {Array.from({ length: MAX_QUESTIONS }).map((_, i) => (
              <div key={i} className={`w-4 h-4 rounded-full ${i < questionIndex ? 'bg-green-400' : (i === questionIndex ? 'bg-primary animate-pulse' : 'bg-gray-200')}`} />
            ))}
          </div>
        </div>

        <div className="w-full max-w-md h-64 bg-white/80 rounded-[3rem] shadow-inner border-4 border-white relative overflow-hidden mb-8">
           {currentQ && <Figura3D figura={currentQ.correct} />}
        </div>

        <div className="grid grid-cols-2 gap-8 w-full">
          <Card 
            className="cursor-pointer h-40 flex flex-col items-center justify-center rounded-[2rem] bg-blue-50 hover:bg-blue-100 border-4 border-blue-200 hover:border-blue-400 transition-all hover:-translate-y-1 shadow-md"
            onClick={() => handleAnswer('rueda')}
            data-testid="opcion-rueda"
          >
            <h3 className="text-4xl font-bold text-blue-700">Rueda</h3>
            <p className="text-lg text-blue-600/80 mt-2">Puede rodar por el suelo</p>
          </Card>
          <Card 
            className="cursor-pointer h-40 flex flex-col items-center justify-center rounded-[2rem] bg-orange-50 hover:bg-orange-100 border-4 border-orange-200 hover:border-orange-400 transition-all hover:-translate-y-1 shadow-md"
            onClick={() => handleAnswer('desliza')}
            data-testid="opcion-desliza"
          >
            <h3 className="text-4xl font-bold text-orange-700">Solo se desliza</h3>
            <p className="text-lg text-orange-600/80 mt-2">Tiene lados planos</p>
          </Card>
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
