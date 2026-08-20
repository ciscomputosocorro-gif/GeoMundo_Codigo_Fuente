import React from "react";
import { Link } from "wouter";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Puzzle, Search, Hash, SplitSquareHorizontal, Glasses } from "lucide-react";
import fondoCiudad from "@assets/ciudad_geomundo.png";

const juegos = [
  { id: "1", href: "/jugar/cual-es", icon: Puzzle, title: "¿Cuál es la figura?", color: "bg-pink-100 text-pink-700" },
  { id: "2", href: "/jugar/encuentra", icon: Search, title: "Encuentra el objeto", color: "bg-teal-100 text-teal-700" },
  { id: "3", href: "/jugar/cuenta", icon: Hash, title: "Cuenta las caras", color: "bg-indigo-100 text-indigo-700" },
  { id: "4", href: "/jugar/clasifica", icon: SplitSquareHorizontal, title: "Clasifica", color: "bg-rose-100 text-rose-700" },
  { id: "5", href: "/vr-cabana", icon: Glasses, title: "Cabaña VR", color: "bg-amber-100 text-amber-700" },
  { id: "6", href: "/vr-ciudad", icon: Glasses, title: "Parque VR", color: "bg-cyan-100 text-cyan-700" },
];

export default function Jugar() {
  return (
    <Layout title="¡Hora de jugar!" heroImage={fondoCiudad} mensajePablito="¡Vamos a jugar! Elige un juego.">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 p-4 flex-1 content-center">
        {juegos.map((j) => (
          <Link key={j.id} href={j.href}>
            <Card className="cursor-pointer h-full hover:shadow-xl transition-all hover:-translate-y-1 border-0 shadow-md overflow-hidden rounded-[2rem]" data-testid={`juego-${j.id}`} data-speak={j.title}>
              <CardContent className={`p-6 h-full flex flex-col items-center justify-center text-center ${j.color}`}>
                <j.icon className="w-14 h-14 mb-3 opacity-80" />
                <h2 className="text-2xl font-bold">{j.title}</h2>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </Layout>
  );
}
