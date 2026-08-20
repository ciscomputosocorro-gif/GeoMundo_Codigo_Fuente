import React from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ChevronLeft, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProgreso } from "@/lib/progreso";
import fondoCabana from "@assets/cabana_geomundo.jpg";
import { Pablito } from "@/components/Pablito";

interface LayoutProps {
  children: React.ReactNode;
  showBack?: boolean;
  backTo?: string;
  title?: string;
  hero?: boolean;
  heroImage?: string;
  mensajePablito?: string;
  ocultarPablito?: boolean;
}

export function Layout({ children, showBack = true, backTo = "/menu", title, hero = false, heroImage, mensajePablito, ocultarPablito = false }: LayoutProps) {
  const { preferencias, actualizarPreferencias } = useProgreso();
  const bajoEstimulos = preferencias.estimulos === 'bajo';
  const useHero = hero || !!heroImage;
  const backgroundClass = !useHero && (bajoEstimulos ? 'calm-bg' : 'sky-meadow-gradient');
  const silenciado = !preferencias.narracion;

  const heroStyle: React.CSSProperties | undefined = useHero
    ? {
        backgroundImage: `url(${heroImage || fondoCabana})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : undefined;

  const toggleSilencio = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    actualizarPreferencias({ narracion: !preferencias.narracion });
  };

  return (
    <div
      className={`min-h-[100dvh] w-full flex flex-col relative overflow-hidden ${backgroundClass || ''}`}
      style={heroStyle}
    >
      <header className="p-4 flex items-center h-20 shrink-0 relative z-10">
        {showBack && (
          <Link href={backTo}>
            <Button variant="ghost" size="lg" className="text-foreground text-lg gap-2 h-14 rounded-2xl bg-white/50 hover:bg-white/80 shadow-sm" data-testid="btn-volver">
              <ChevronLeft className="w-8 h-8" />
              Volver
            </Button>
          </Link>
        )}
        {title && (
          <h1
            className="text-lg md:text-4xl font-extrabold text-center flex-1 px-2 md:px-4 text-white"
            style={{ textShadow: "0 2px 8px rgba(0,0,0,0.55), 0 0 4px rgba(0,0,0,0.4)" }}
            data-speak={title}
          >
            {title}
          </h1>
        )}
        <Button
          variant="ghost"
          size="lg"
          onClick={toggleSilencio}
          className="h-14 w-14 rounded-2xl bg-white/50 hover:bg-white/80 shadow-sm shrink-0"
          title={silenciado ? "Activar voz" : "Silenciar voz"}
          data-testid="btn-silenciar"
        >
          {silenciado ? <VolumeX className="w-7 h-7 text-red-500" /> : <Volume2 className="w-7 h-7 text-foreground" />}
        </Button>
      </header>
      <main className="flex-1 w-full max-w-5xl mx-auto p-4 flex flex-col relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4 }}
          className="flex-1 flex flex-col"
        >
          {children}
        </motion.div>
      </main>
      {!ocultarPablito && <Pablito mensaje={mensajePablito} />}
    </div>
  );
}
