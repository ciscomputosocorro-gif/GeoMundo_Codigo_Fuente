import React from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Layout } from "@/components/Layout";
import { Compass, Gamepad2, PenTool, Star, Settings, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useProgreso } from "@/lib/progreso";
import { figuras } from "@/data/figuras";

const TOTAL_FIGURAS = figuras.length;
const TOTAL_EJERCICIOS = 4;

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function Menu() {
  const { nombreNino, figurasDescubiertas, juegosCompletados, ejerciciosCompletados } = useProgreso();

  const exploroTodo   = (figurasDescubiertas ?? []).length >= TOTAL_FIGURAS;
  const jugoAlgo      = Object.keys(juegosCompletados ?? {}).length >= 1;
  const practicoTodo  = (ejerciciosCompletados ?? []).length >= TOTAL_EJERCICIOS;

  const titulo = nombreNino ? `¿Qué quieres hacer hoy, ${nombreNino}?` : "¿Qué quieres hacer hoy?";
  const saludo = nombreNino ? `¡Hola, ${nombreNino}! Elige qué quieres hacer hoy.` : "¡Elige qué quieres hacer hoy!";

  interface MenuItem {
    href: string;
    icon: React.ElementType;
    title: string;
    color: string;
    desc: string;
    bloqueado: boolean;
    pista: string;
  }

  const menuItems: MenuItem[] = [
    {
      href: "/explorar",
      icon: Compass,
      title: "Explorar",
      color: "bg-blue-100 text-blue-700",
      desc: "Conoce las figuras",
      bloqueado: false,
      pista: "",
    },
    {
      href: "/jugar",
      icon: Gamepad2,
      title: "Jugar",
      color: "bg-green-100 text-green-700",
      desc: "Juegos y realidad virtual",
      bloqueado: !exploroTodo,
      pista: `Explora las ${TOTAL_FIGURAS} figuras primero (${figurasDescubiertas.length}/${TOTAL_FIGURAS})`,
    },
    {
      href: "/practicar",
      icon: PenTool,
      title: "Practicar",
      color: "bg-yellow-100 text-yellow-700",
      desc: "Ejercicios guiados",
      bloqueado: !jugoAlgo,
      pista: "Juega al menos un juego primero",
    },
    {
      href: "/evaluacion",
      icon: Star,
      title: "Evaluación",
      color: "bg-purple-100 text-purple-700",
      desc: "¡Demuestra lo que sabes!",
      bloqueado: !practicoTodo,
      pista: `Completa todos los ejercicios primero (${ejerciciosCompletados.length}/${TOTAL_EJERCICIOS})`,
    },
    {
      href: "/configuracion",
      icon: Settings,
      title: "Configuración",
      color: "bg-gray-100 text-gray-700",
      desc: "Ajusta tu experiencia",
      bloqueado: false,
      pista: "",
    },
  ];

  return (
    <Layout showBack backTo="/" title={titulo} hero mensajePablito={saludo}>
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 p-2 md:p-4 flex-1 content-center"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {menuItems.map((m) => (
          <motion.div key={m.title} variants={item}>
            {m.bloqueado ? (
              /* Locked card — not clickable */
              <div className="relative group cursor-not-allowed">
                <Card className="h-full border-0 shadow-md overflow-hidden rounded-[2rem] opacity-50 grayscale select-none">
                  <CardContent className={`p-4 md:p-8 h-full flex flex-col items-center justify-center text-center ${m.color}`}>
                    {React.createElement(m.icon, { className: "w-12 h-12 md:w-20 md:h-20 mb-3 md:mb-6 opacity-80" })}
                    <h2 className="text-xl md:text-3xl font-bold mb-1 md:mb-2">{m.title}</h2>
                    <p className="text-sm md:text-xl opacity-90">{m.desc}</p>
                  </CardContent>
                </Card>

                {/* Lock overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center rounded-[2rem] bg-black/30">
                  <motion.div
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                  >
                    <Lock className="w-10 h-10 md:w-14 md:h-14 text-white drop-shadow-lg" />
                  </motion.div>
                </div>

                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 hidden group-hover:flex group-focus:flex z-20 pointer-events-none">
                  <div className="bg-gray-900 text-white text-sm md:text-base rounded-2xl px-4 py-2 shadow-xl text-center max-w-[200px] leading-snug">
                    🔒 {m.pista}
                  </div>
                </div>
              </div>
            ) : (
              /* Unlocked card */
              <Link href={m.href}>
                <Card
                  className="cursor-pointer h-full hover:shadow-2xl transition-all hover:-translate-y-1 border-0 shadow-lg overflow-hidden rounded-[2rem]"
                  data-testid={`menu-${m.title.toLowerCase()}`}
                  data-speak={`${m.title}. ${m.desc}`}
                >
                  <CardContent className={`p-4 md:p-8 h-full flex flex-col items-center justify-center text-center ${m.color}`}>
                    {React.createElement(m.icon, { className: "w-12 h-12 md:w-20 md:h-20 mb-3 md:mb-6 opacity-80" })}
                    <h2 className="text-xl md:text-3xl font-bold mb-1 md:mb-2">{m.title}</h2>
                    <p className="text-sm md:text-xl opacity-90">{m.desc}</p>
                  </CardContent>
                </Card>
              </Link>
            )}
          </motion.div>
        ))}
      </motion.div>
    </Layout>
  );
}
