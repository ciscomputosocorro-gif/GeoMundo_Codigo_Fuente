import React from "react";
import { Layout } from "@/components/Layout";
import fondoCiudad from "@assets/ciudad_geomundo.png";
import { useProgreso } from "@/lib/progreso";
import { figuras } from "@/data/figuras";
import { Progress } from "@/components/ui/progress";
import { Trophy } from "lucide-react";

export default function Progreso() {
  const { figurasDescubiertas, insignias } = useProgreso();
  const porcentajeDescubierto = (figurasDescubiertas.length / figuras.length) * 100;

  return (
    <Layout title="Tus Logros" heroImage={fondoCiudad} mensajePablito="¡Mira todo lo que has aprendido!">
      <div className="flex flex-col gap-8 w-full max-w-3xl mx-auto p-4">
        
        <div className="bg-white p-8 rounded-[2rem] shadow-md">
          <h2 className="text-2xl font-bold mb-6">Figuras Descubiertas</h2>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <Progress value={porcentajeDescubierto} className="h-6 rounded-full" />
            </div>
            <span className="text-2xl font-bold text-foreground/80">{figurasDescubiertas.length} / {figuras.length}</span>
          </div>
          
          <div className="flex flex-wrap gap-4 mt-6">
            {figuras.map(f => {
              const descubierto = figurasDescubiertas.includes(f.id);
              return (
                <div key={f.id} className={`px-4 py-2 rounded-xl text-lg font-medium border-2 ${descubierto ? 'bg-primary/20 border-primary text-primary-foreground' : 'bg-gray-100 border-gray-200 text-gray-400'}`}>
                  {f.nombre}
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] shadow-md">
          <h2 className="text-2xl font-bold mb-6">Tus Insignias</h2>
          {insignias.length === 0 ? (
            <p className="text-xl text-muted-foreground">Sigue jugando y explorando para ganar insignias.</p>
          ) : (
            <div className="flex flex-wrap gap-4">
              {insignias.map(insignia => (
                <div key={insignia} className="bg-yellow-100 text-yellow-800 border-2 border-yellow-300 px-6 py-4 rounded-2xl flex items-center gap-3">
                  <Trophy className="w-8 h-8 text-yellow-600" />
                  <span className="text-xl font-bold">{insignia}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </Layout>
  );
}
