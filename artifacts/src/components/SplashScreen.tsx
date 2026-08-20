import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SplashScreen({ onDone }: { onDone: () => void }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 2600);
    return () => clearTimeout(t);
  }, []);

  const shapes = [
    { emoji: "🟡", size: 56, x: "8%",  y: "12%", delay: 0 },
    { emoji: "🔵", size: 44, x: "80%", y: "8%",  delay: 0.15 },
    { emoji: "🟠", size: 52, x: "70%", y: "72%", delay: 0.3 },
    { emoji: "🟢", size: 38, x: "15%", y: "78%", delay: 0.2 },
    { emoji: "🔷", size: 34, x: "88%", y: "42%", delay: 0.1 },
    { emoji: "🟨", size: 30, x: "4%",  y: "48%", delay: 0.25 },
  ];

  return (
    <AnimatePresence onExitComplete={onDone}>
      {visible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
          style={{
            background:
              "radial-gradient(ellipse at 30% 40%, #166534 0%, #15803d 35%, #052e16 100%)",
          }}
        >
          {/* Floating geometric shapes */}
          {shapes.map((s, i) => (
            <motion.div
              key={i}
              className="absolute select-none pointer-events-none"
              style={{ left: s.x, top: s.y, fontSize: s.size }}
              initial={{ opacity: 0, scale: 0, rotate: -30 }}
              animate={{ opacity: 0.55, scale: 1, rotate: 0 }}
              transition={{ delay: s.delay, duration: 0.7, type: "spring" }}
            >
              {s.emoji}
            </motion.div>
          ))}

          {/* Glowing circle behind logo */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 260,
              height: 260,
              background:
                "radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)",
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, type: "spring" }}
          />

          {/* Main logo / icon */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
            className="text-[96px] mb-4 drop-shadow-2xl"
          >
            🌍
          </motion.div>

          {/* App name */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="text-white font-black tracking-tight text-center leading-tight"
            style={{ fontSize: "clamp(2rem, 8vw, 3.2rem)", textShadow: "0 2px 16px rgba(0,0,0,0.4)" }}
          >
            GeoMundo
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.5 }}
            className="text-green-200 font-semibold mt-1 text-center"
            style={{ fontSize: "clamp(0.95rem, 3vw, 1.2rem)" }}
          >
            Interactivo
          </motion.p>

          {/* Animated dots loader */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex gap-2 mt-10"
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-3 h-3 rounded-full bg-green-300"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{
                  repeat: Infinity,
                  duration: 0.9,
                  delay: i * 0.2,
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
