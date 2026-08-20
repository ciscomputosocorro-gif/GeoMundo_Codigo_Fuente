import React, { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { Layout } from "@/components/Layout";
import { figuras } from "@/data/figuras";
import { Figura3D } from "@/components/Figura3D";
import { ParticulasForma } from "@/components/ParticulasForma";
import { Button } from "@/components/ui/button";
import { Volume2, HelpCircle } from "lucide-react";
import { speak } from "@/lib/audio";
import { useProgreso } from "@/lib/progreso";
import fondoParque from "@assets/parque_explorar.png";

const EXPLICACIONES: Record<string, string> = {
  caras: "¡Las caras son las superficies que cubren la figura! Como las tapas de una caja.",
  aristas: "¡Las aristas son las líneas donde se juntan dos caras! Como los bordes de una caja.",
  vertices: "¡Los vértices son las esquinas o puntas donde se encuentran las aristas!",
};

export default function FiguraDetalle() {
  const [, params] = useRoute("/explorar/:id");
  const figuraId = params?.id;
  const figura = figuras.find(f => f.id === figuraId);
  
  const { preferencias, descubrirFigura } = useProgreso();

  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    if (figura) {
      descubrirFigura(figura.id);
      setAnimKey(k => k + 1);
      if (preferencias.narracion) {
        speak(`${figura.nombre}. ${figura.descripcionCorta}`, preferencias);
      }
    }
  }, [figura?.id]);

  if (!figura) {
    return <Layout title="Figura no encontrada">Vaya, no encontramos esta figura.</Layout>;
  }

  const handleSpeak = () => {
    speak(figura.nombre, preferencias);
  };

  return (
    <Layout backTo="/explorar" title={figura.nombre} hero heroImage={fondoParque} mensajePablito={`¡Hola! Soy ${figura.id === "esfera" || figura.id === "piramide" ? "la" : "el"} ${figura.nombre}. ${figura.descripcionCorta}`}>
      <div className="flex flex-col md:flex-row gap-4 md:gap-8 flex-1 h-full items-stretch pb-4 md:pb-8">
        
        {/* Left: 3D Viewer */}
        <div className="flex-1 bg-white/50 rounded-[3rem] shadow-inner overflow-hidden border-4 border-white relative min-h-[220px] md:min-h-[400px]">
          <Figura3D figura={figura} />
          <ParticulasForma key={animKey} figura={figura} />
        </div>

        {/* Right: Info */}
        <div className="flex-1 flex flex-col gap-3 md:gap-6 w-full md:max-w-sm">
          <div className="bg-white rounded-[2rem] p-4 md:p-8 shadow-md">
            <div className="flex items-start justify-between mb-2 md:mb-4">
              <h2 className="text-2xl md:text-4xl font-extrabold text-primary-foreground">{figura.nombre}</h2>
              <Button variant="ghost" size="icon" onClick={handleSpeak} className="h-9 w-9 md:h-12 md:w-12 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100" data-testid="btn-escuchar">
                <Volume2 className="h-5 w-5 md:h-6 md:w-6" />
              </Button>
            </div>
            <p className="text-base md:text-2xl text-foreground/80 mb-2 md:mb-6 leading-relaxed">
              {figura.descripcionCorta}
            </p>
          </div>

          <div className="bg-white rounded-[2rem] p-4 md:p-8 shadow-md flex-1">
            <h3 className="text-base md:text-xl font-bold text-muted-foreground mb-2 md:mb-4 uppercase tracking-wider">Características</h3>
            <p className="text-xs md:text-sm text-muted-foreground mb-2 md:mb-4 flex items-center gap-1">
              <HelpCircle className="w-3 h-3 md:w-4 md:h-4" /> Toca cada ítem para saber más
            </p>
            <ul className="space-y-2 md:space-y-3 text-base md:text-xl font-medium">
              {figura.caracteristicas.caras !== undefined && (
                <li
                  data-speak={EXPLICACIONES.caras}
                  className="flex items-center gap-3 cursor-pointer rounded-2xl px-3 py-2 hover:bg-green-50 active:bg-green-100 transition-colors select-none"
                >
                  <span className="w-3 h-3 rounded-full bg-green-400 shrink-0" />
                  Tiene {figura.caracteristicas.caras} caras
                  <HelpCircle className="w-5 h-5 text-green-400 ml-auto shrink-0" />
                </li>
              )}
              {figura.caracteristicas.aristas !== undefined && (
                <li
                  data-speak={EXPLICACIONES.aristas}
                  className="flex items-center gap-3 cursor-pointer rounded-2xl px-3 py-2 hover:bg-yellow-50 active:bg-yellow-100 transition-colors select-none"
                >
                  <span className="w-3 h-3 rounded-full bg-yellow-400 shrink-0" />
                  Tiene {figura.caracteristicas.aristas} aristas
                  <HelpCircle className="w-5 h-5 text-yellow-400 ml-auto shrink-0" />
                </li>
              )}
              {figura.caracteristicas.vertices !== undefined && (
                <li
                  data-speak={EXPLICACIONES.vertices}
                  className="flex items-center gap-3 cursor-pointer rounded-2xl px-3 py-2 hover:bg-red-50 active:bg-red-100 transition-colors select-none"
                >
                  <span className="w-3 h-3 rounded-full bg-red-400 shrink-0" />
                  Tiene {figura.caracteristicas.vertices} vértices (puntas)
                  <HelpCircle className="w-5 h-5 text-red-400 ml-auto shrink-0" />
                </li>
              )}
              <li className="flex items-center gap-3 px-3 py-2">
                <span className="w-3 h-3 rounded-full bg-blue-400 shrink-0" />
                {figura.caracteristicas.ruedaOSeDesliza}
              </li>
            </ul>

            <div className="mt-4 md:mt-8">
              <h3 className="text-base md:text-xl font-bold text-muted-foreground mb-2 md:mb-4 uppercase tracking-wider">Se parece a...</h3>
              <div className="flex flex-wrap gap-2">
                {figura.ejemplos.map(ej => (
                  <span key={ej} className="bg-secondary/50 text-secondary-foreground px-3 py-1 md:px-4 md:py-2 rounded-2xl text-sm md:text-lg font-medium">
                    {ej}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
}
