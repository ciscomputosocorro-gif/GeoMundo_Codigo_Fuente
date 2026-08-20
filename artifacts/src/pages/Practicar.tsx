import React, { useState } from "react";
import { Layout } from "@/components/Layout";
import fondoCabana from "@assets/cabana_geomundo.jpg";
import realPelota from "@assets/real_pelota.jpg";
import realCaja from "@assets/real_caja.jpg";
import realVaso from "@assets/real_vaso.jpg";
import realPiramide from "@assets/real_piramide.jpg";
import { figuras } from "@/data/figuras";
import { Figura3D } from "@/components/Figura3D";
import { useProgreso } from "@/lib/progreso";
import { playTone, speak, feedbackPositivo } from "@/lib/audio";
import { AnimatePresence, motion } from "framer-motion";

interface Ejercicio {
  figuraId: string;
  instruccion: string;
  hint: string;
  realImageUrl: string;
  realImageCaption: string;
}

const ejercicios: Ejercicio[] = [
  {
    figuraId: "cubo",
    instruccion: "Toca la figura que parece una caja de regalo.",
    hint: "Busca la figura con 6 lados cuadrados.",
    realImageUrl: realCaja,
    realImageCaption: "¡Se parece a una caja de regalo!",
  },
  {
    figuraId: "esfera",
    instruccion: "Toca la figura redonda como una pelota.",
    hint: "No tiene esquinas ni bordes rectos.",
    realImageUrl: realPelota,
    realImageCaption: "¡Igual que una pelota!",
  },
  {
    figuraId: "cilindro",
    instruccion: "Toca la figura que parece un vaso o una lata.",
    hint: "Tiene dos círculos planos arriba y abajo.",
    realImageUrl: realVaso,
    realImageCaption: "¡Como un vaso de agua!",
  },
  {
    figuraId: "piramide",
    instruccion: "Toca la figura que tiene punta arriba como las pirámides de Egipto.",
    hint: "Tiene base plana y los lados suben hasta unirse arriba.",
    realImageUrl: realPiramide,
    realImageCaption: "¡Como las pirámides de Egipto!",
  },
];

export default function Practicar() {
  const { preferencias, completarEjercicio } = useProgreso();
  const [ejercicioIndex, setEjercicioIndex] = useState(0);
  const [mensaje, setMensaje] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [realImage, setRealImage] = useState<{ url: string; caption: string } | null>(null);

  const current = ejercicios[ejercicioIndex];

  const handleFiguraClick = (id: string) => {
    if (mensaje) return;

    if (id === current.figuraId) {
      const msg = feedbackPositivo[Math.floor(Math.random() * feedbackPositivo.length)];
      setMensaje(msg);
      setRealImage({ url: current.realImageUrl, caption: current.realImageCaption });
      playTone("exito", preferencias);
      speak(msg, preferencias);
      setShowHint(false);
      completarEjercicio(current.figuraId);

      setTimeout(() => {
        setMensaje("");
        setRealImage(null);
        setEjercicioIndex(i => (i < ejercicios.length - 1 ? i + 1 : 0));
      }, 3500);
    } else {
      const msg = "Inténtalo de nuevo, tú puedes.";
      setMensaje(msg);
      playTone("intento", preferencias);
      speak(msg, preferencias);
      setShowHint(true);

      setTimeout(() => {
        setMensaje("");
      }, 2500);
    }
  };

  return (
    <Layout
      title="Práctica Guiada"
      heroImage={fondoCabana}
      mensajePablito="¡Hola! Vamos a practicar. Toca la figura correcta."
    >
      <div className="flex-1 flex flex-col items-center w-full max-w-5xl mx-auto gap-8">

        <div className="bg-white p-4 md:p-8 rounded-[2rem] shadow-md text-center w-full max-w-3xl">
          <h2 className="text-xl md:text-3xl font-bold text-primary-foreground mb-2">{current.instruccion}</h2>
          {showHint && (
            <p className="text-base md:text-xl text-orange-600 mt-3 bg-orange-50 py-2 px-4 rounded-xl inline-block">
              Pista: {current.hint}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 w-full">
          {figuras.slice(0, 6).map(figura => (
            <div
              key={figura.id}
              onClick={() => handleFiguraClick(figura.id)}
              className="h-32 md:h-48 bg-white/80 rounded-[2rem] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer relative overflow-hidden border-2 border-transparent hover:border-primary"
            >
              <Figura3D figura={figura} />
              <div className="absolute inset-0 z-10" />
            </div>
          ))}
        </div>

      </div>

      {/* Success overlay with real image */}
      <AnimatePresence>
        {realImage && (
          <motion.div
            key="real-image-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          >
            <motion.div
              initial={{ scale: 0.6, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.6, y: 40 }}
              transition={{ type: "spring", stiffness: 280, damping: 22 }}
              className="bg-white rounded-[2rem] shadow-2xl flex flex-col items-center gap-4 p-6 mx-6 max-w-xs w-full"
            >
              <p className="text-2xl font-bold text-green-600 text-center">{mensaje}</p>
              <img
                src={realImage.url}
                alt={realImage.caption}
                className="w-52 h-52 object-cover rounded-2xl shadow-md"
              />
              <p className="text-xl font-semibold text-gray-700 text-center">{realImage.caption}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error toast (no image shown) */}
      <AnimatePresence>
        {mensaje && !realImage && (
          <motion.div
            key="error-toast"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-8 py-4 rounded-full text-3xl font-bold shadow-2xl z-50 bg-yellow-400 text-yellow-900"
          >
            {mensaje}
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
