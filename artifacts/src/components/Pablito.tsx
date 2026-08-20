import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import pablitoImg from "@assets/pablito.png";
import { useProgreso } from "@/lib/progreso";
import { speak } from "@/lib/audio";

interface PablitoProps {
  mensaje?: string;
  hablarAlAparecer?: boolean;
}

export function Pablito({ mensaje, hablarAlAparecer = true }: PablitoProps) {
  const { preferencias } = useProgreso();
  const [bubble, setBubble] = useState<string | null>(mensaje || null);
  const lastSpokenRef = useRef<string>("");
  const lastTimeRef = useRef<number>(0);
  const bubbleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setBubble(mensaje || null);
    if (mensaje && hablarAlAparecer) {
      speak(mensaje, preferencias);
      if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
      bubbleTimerRef.current = setTimeout(() => setBubble(null), 6000);
    }
  }, [mensaje, hablarAlAparecer]);

  useEffect(() => {
    const handleOver = (e: Event) => {
      const target = (e.target as HTMLElement)?.closest?.("[data-speak]") as HTMLElement | null;
      if (!target) return;
      const text = target.getAttribute("data-speak");
      if (!text) return;

      const now = Date.now();
      if (text === lastSpokenRef.current && now - lastTimeRef.current < 1500) return;
      lastSpokenRef.current = text;
      lastTimeRef.current = now;

      setBubble(text);
      speak(text, preferencias);

      if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
      bubbleTimerRef.current = setTimeout(() => {
        setBubble(null);
      }, 5000);
    };

    document.addEventListener("mouseover", handleOver, true);
    document.addEventListener("focusin", handleOver, true);
    document.addEventListener("touchstart", handleOver, true);
    return () => {
      document.removeEventListener("mouseover", handleOver, true);
      document.removeEventListener("focusin", handleOver, true);
      document.removeEventListener("touchstart", handleOver, true);
    };
  }, [preferencias, mensaje]);

  const handlePablitoClick = () => {
    if (bubble) {
      setBubble(null);
      if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    } else if (mensaje) {
      setBubble(mensaje);
      speak(mensaje, preferencias);
      if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
      bubbleTimerRef.current = setTimeout(() => setBubble(null), 6000);
    }
  };

  return (
    <div className="fixed bottom-3 left-3 z-50 flex items-end gap-2 pointer-events-none">
      <div className="relative">
        <motion.button
          type="button"
          onClick={handlePablitoClick}
          className="pointer-events-auto cursor-pointer focus:outline-none"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Pablito, tu guía"
          data-testid="pablito-guia"
        >
          <img
            src={pablitoImg}
            alt="Pablito"
            draggable={false}
            className="h-28 md:h-36 object-contain drop-shadow-2xl select-none"
          />
        </motion.button>
      </div>
      <AnimatePresence>
        {bubble && (
          <motion.div
            key={bubble}
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.25 }}
            className="pointer-events-none mb-4 max-w-[15rem] bg-white/95 rounded-2xl rounded-bl-md px-4 py-3 shadow-xl border border-white"
          >
            <p className="text-base md:text-lg font-semibold text-foreground/90 leading-snug">
              {bubble}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
