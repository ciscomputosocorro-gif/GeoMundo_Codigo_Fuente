// @refresh reset
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Preferencias } from './audio';

interface JuegoResultado {
  mejorPuntaje: number;
  intentos: number;
}

interface ProgresoState {
  figurasDescubiertas: string[];
  juegosCompletados: Record<string, JuegoResultado>;
  ejerciciosCompletados: string[];
  insignias: string[];
  preferencias: Preferencias;
  nombreNino: string;
}

interface ProgresoContextType extends ProgresoState {
  descubrirFigura: (id: string) => void;
  completarJuego: (id: string, puntaje: number) => void;
  completarEjercicio: (id: string) => void;
  otorgarInsignia: (nombre: string) => void;
  actualizarPreferencias: (prefs: Partial<Preferencias>) => void;
  guardarNombre: (nombre: string) => void;
  reiniciarProgreso: () => void;
}

const defaultPreferencias: Preferencias = {
  sonido: true,
  narracion: true,
  estimulos: 'medio',
  tema: 'claro',
  vozNombre: '',
};

const defaultState: ProgresoState = {
  figurasDescubiertas: [],
  juegosCompletados: {},
  ejerciciosCompletados: [],
  insignias: [],
  preferencias: defaultPreferencias,
  nombreNino: "",
};

const ProgresoContext = createContext<ProgresoContextType | null>(null);

const STORAGE_KEY = 'geomundo_progreso_v2';

export const ProgresoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ProgresoState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...defaultState,
          ...parsed,
          ejerciciosCompletados: parsed.ejerciciosCompletados ?? [],
          preferencias: { ...defaultPreferencias, ...(parsed.preferencias || {}) }
        };
      }
    } catch (e) {
      console.error("Error loading progress", e);
    }
    return defaultState;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    
    // Apply theme
    if (state.preferencias.tema === 'oscuroSuave') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state]);

  const checkInsignias = (newState: ProgresoState) => {
    const insigniasNuevas = new Set(newState.insignias);
    
    if (newState.figurasDescubiertas.length >= 6 && !insigniasNuevas.has("Explorador")) {
      insigniasNuevas.add("Explorador");
    }
    
    if (Object.keys(newState.juegosCompletados).length >= 4 && !insigniasNuevas.has("Maestro Geómetra")) {
      insigniasNuevas.add("Maestro Geómetra");
    }

    if (insigniasNuevas.size > newState.insignias.length) {
      setState(s => ({ ...s, insignias: Array.from(insigniasNuevas) }));
    }
  };

  const descubrirFigura = (id: string) => {
    setState(s => {
      if (s.figurasDescubiertas.includes(id)) return s;
      const next = { ...s, figurasDescubiertas: [...s.figurasDescubiertas, id] };
      setTimeout(() => checkInsignias(next), 0);
      return next;
    });
  };

  const completarEjercicio = (id: string) => {
    setState(s => {
      if (s.ejerciciosCompletados.includes(id)) return s;
      return { ...s, ejerciciosCompletados: [...s.ejerciciosCompletados, id] };
    });
  };

  const completarJuego = (id: string, puntaje: number) => {
    setState(s => {
      const prev = s.juegosCompletados[id] || { mejorPuntaje: 0, intentos: 0 };
      const next = {
        ...s,
        juegosCompletados: {
          ...s.juegosCompletados,
          [id]: {
            mejorPuntaje: Math.max(prev.mejorPuntaje, puntaje),
            intentos: prev.intentos + 1
          }
        }
      };
      setTimeout(() => checkInsignias(next), 0);
      return next;
    });
  };

  const otorgarInsignia = (nombre: string) => {
    setState(s => {
      if (s.insignias.includes(nombre)) return s;
      return { ...s, insignias: [...s.insignias, nombre] };
    });
  };

  const actualizarPreferencias = (prefs: Partial<Preferencias>) => {
    setState(s => ({
      ...s,
      preferencias: { ...s.preferencias, ...prefs }
    }));
  };

  const guardarNombre = (nombre: string) => {
    setState(s => ({ ...s, nombreNino: nombre.trim() }));
  };

  const reiniciarProgreso = () => {
    setState({ ...defaultState, preferencias: state.preferencias });
  };

  return (
    <ProgresoContext.Provider value={{
      ...state,
      descubrirFigura,
      completarJuego,
      completarEjercicio,
      otorgarInsignia,
      actualizarPreferencias,
      guardarNombre,
      reiniciarProgreso,
    }}>
      {children}
    </ProgresoContext.Provider>
  );
};

export const useProgreso = () => {
  const ctx = useContext(ProgresoContext);
  if (!ctx) throw new Error("useProgreso must be used within ProgresoProvider");
  return ctx;
};
