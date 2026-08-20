import cuboImg from "@assets/cubo_char.png";
import esferaImg from "@assets/esfera_char.png";
import cilindroImg from "@assets/cilindro_char.png";
import piramideImg from "@assets/piramide_char.png";

export type Figura = {
  id: string;
  nombre: string;
  descripcionCorta: string;
  caracteristicas: {
    caras?: number;
    aristas?: number;
    vertices?: number;
    ruedaOSeDesliza: string;
  };
  ejemplos: string[];
  color: string;
  imagen: string;
};

export const figuras: Figura[] = [
  {
    id: "cubo",
    nombre: "Cubo",
    descripcionCorta: "Una figura con lados cuadrados, todos iguales.",
    caracteristicas: { caras: 6, aristas: 12, vertices: 8, ruedaOSeDesliza: "Se desliza" },
    ejemplos: ["Un dado", "Una caja de regalo", "Un cubo Rubik"],
    color: "#ffd166",
    imagen: cuboImg,
  },
  {
    id: "esfera",
    nombre: "Esfera",
    descripcionCorta: "Totalmente redonda, sin esquinas ni bordes.",
    caracteristicas: { ruedaOSeDesliza: "Rueda" },
    ejemplos: ["Una pelota", "Una naranja", "El planeta Tierra"],
    color: "#a8d88a",
    imagen: esferaImg,
  },
  {
    id: "cilindro",
    nombre: "Cilindro",
    descripcionCorta: "Como un tubo, con dos círculos planos arriba y abajo.",
    caracteristicas: { caras: 3, ruedaOSeDesliza: "Rueda y se desliza" },
    ejemplos: ["Una lata", "Un vaso", "Un rodillo"],
    color: "#9ecbe8",
    imagen: cilindroImg,
  },
  {
    id: "piramide",
    nombre: "Pirámide",
    descripcionCorta: "Tiene base plana y lados que suben hasta unirse arriba.",
    caracteristicas: { vertices: 5, ruedaOSeDesliza: "Se desliza" },
    ejemplos: ["Las pirámides de Egipto", "Un techo puntiagudo"],
    color: "#f0a868",
    imagen: piramideImg,
  },
];
