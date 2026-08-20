import React from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Layout } from "@/components/Layout";
import { figuras } from "@/data/figuras";
import { Card, CardContent } from "@/components/ui/card";
import { useProgreso } from "@/lib/progreso";
import { Sparkles } from "lucide-react";
import fondoParque from "@assets/parque_explorar.png";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const item = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1 }
};

export default function Explorar() {
  const { figurasDescubiertas } = useProgreso();

  return (
    <Layout title="Toca una figura para explorarla" heroImage={fondoParque} mensajePablito="¡Toca una figura para conocerla!">
      <motion.div 
        className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 p-2 md:p-4 flex-1 content-center"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {figuras.map((fig) => {
          const descubierto = figurasDescubiertas.includes(fig.id);
          
          return (
            <motion.div key={fig.id} variants={item}>
              <Link href={`/explorar/${fig.id}`}>
                <Card 
                  className="cursor-pointer aspect-square hover:shadow-xl transition-all hover:scale-105 border-4 shadow-md rounded-[2.5rem] flex items-center justify-center relative overflow-hidden"
                  style={{ backgroundColor: fig.color, borderColor: descubierto ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.05)' }}
                  data-testid={`figura-card-${fig.id}`}
                  data-speak={fig.nombre}
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-20 h-20 md:w-32 md:h-32 mx-auto mb-1 md:mb-3 flex items-center justify-center">
                      <img
                        src={fig.imagen}
                        alt={fig.nombre}
                        draggable={false}
                        className="max-w-full max-h-full object-contain drop-shadow-lg"
                      />
                    </div>
                    <h2 className="text-base md:text-2xl font-bold text-foreground/80">{fig.nombre}</h2>
                    {descubierto && (
                      <div className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-sm text-yellow-500">
                        <Sparkles className="w-5 h-5" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>
    </Layout>
  );
}
