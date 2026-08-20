import React, { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import fondoCabana from "@assets/cabana_geomundo.jpg";
import { useProgreso } from "@/lib/progreso";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { getSpanishVoices, speak } from "@/lib/audio";
import { Volume2, CheckCircle2, RotateCcw } from "lucide-react";

const FRASE_PRUEBA = "¡Hola! Soy tu guía en GeoMundo. ¿Estás listo para explorar las figuras?";

function etiquetaVoz(v: SpeechSynthesisVoice): string {
  let name = v.name
    .replace("Microsoft ", "")
    .replace("Google ", "Google · ")
    .replace(" Online (Natural)", "")
    .replace(" Desktop", "");
  const lang: Record<string, string> = {
    "es-ES": " (España)",
    "es-MX": " (México)",
    "es-US": " (EE.UU.)",
    "es-AR": " (Argentina)",
    "es-CO": " (Colombia)",
  };
  return name + (lang[v.lang] ?? ` (${v.lang})`);
}

export default function Configuracion() {
  const { preferencias, actualizarPreferencias, reiniciarProgreso } = useProgreso();
  const [confirmando, setConfirmando] = useState(false);
  const [voces, setVoces] = useState<SpeechSynthesisVoice[]>([]);
  const [probando, setProbando] = useState<string | null>(null);

  useEffect(() => {
    getSpanishVoices().then(setVoces);
  }, []);

  const vozActual = preferencias.vozNombre || voces[0]?.name || "";

  const probarVoz = (v: SpeechSynthesisVoice) => {
    setProbando(v.name);
    // Temporarily override voz for preview
    const prefs = { ...preferencias, narracion: true, vozNombre: v.name };
    speak(FRASE_PRUEBA, prefs);
    setTimeout(() => setProbando(null), 3000);
  };

  const seleccionarVoz = (v: SpeechSynthesisVoice) => {
    actualizarPreferencias({ vozNombre: v.name });
  };

  return (
    <Layout title="Configuración" heroImage={fondoCabana} mensajePablito="Aquí puedes ajustar la voz, el sonido y los colores.">
      <div className="flex-1 flex flex-col items-center p-4 gap-6">

        {/* General settings */}
        <div className="bg-white p-8 rounded-[2rem] shadow-md w-full max-w-2xl flex flex-col gap-8">

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-2xl font-bold">Sonidos</Label>
              <p className="text-lg text-muted-foreground">Efectos de sonido al interactuar</p>
            </div>
            <Switch
              checked={preferencias.sonido}
              onCheckedChange={(c) => actualizarPreferencias({ sonido: c })}
              className="scale-150 mr-4"
              data-testid="switch-sonido"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-2xl font-bold">Narración por voz</Label>
              <p className="text-lg text-muted-foreground">Lectura automática de textos</p>
            </div>
            <Switch
              checked={preferencias.narracion}
              onCheckedChange={(c) => actualizarPreferencias({ narracion: c })}
              className="scale-150 mr-4"
              data-testid="switch-narracion"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-2xl font-bold">Modo bajo estímulos</Label>
              <p className="text-lg text-muted-foreground">Fondo liso y sin movimiento automático</p>
            </div>
            <Switch
              checked={preferencias.estimulos === 'bajo'}
              onCheckedChange={(c) => actualizarPreferencias({ estimulos: c ? 'bajo' : 'medio' })}
              className="scale-150 mr-4"
              data-testid="switch-estimulos"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-2xl font-bold">Modo oscuro suave</Label>
              <p className="text-lg text-muted-foreground">Colores más relajantes para la vista</p>
            </div>
            <Switch
              checked={preferencias.tema === 'oscuroSuave'}
              onCheckedChange={(c) => actualizarPreferencias({ tema: c ? 'oscuroSuave' : 'claro' })}
              className="scale-150 mr-4"
              data-testid="switch-tema"
            />
          </div>
        </div>

        {/* Voice picker */}
        {voces.length > 0 && (
          <div className="bg-white p-8 rounded-[2rem] shadow-md w-full max-w-2xl flex flex-col gap-5">
            <div>
              <Label className="text-2xl font-bold">Voz del narrador</Label>
              <p className="text-lg text-muted-foreground mt-1">
                Pulsa <span className="font-semibold">Escuchar</span> para probar cada voz, luego selecciona la que más te guste.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {voces.map((v) => {
                const seleccionada = v.name === vozActual;
                const esProbando = probando === v.name;
                return (
                  <div
                    key={v.name}
                    onClick={() => seleccionarVoz(v)}
                    className={`flex items-center justify-between gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all
                      ${seleccionada
                        ? "border-blue-400 bg-blue-50"
                        : "border-transparent bg-gray-50 hover:bg-gray-100"}`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {seleccionada
                        ? <CheckCircle2 className="w-6 h-6 text-blue-500 shrink-0" />
                        : <span className="w-6 h-6 rounded-full border-2 border-gray-300 shrink-0" />
                      }
                      <span className="text-lg font-semibold truncate">{etiquetaVoz(v)}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className={`rounded-xl shrink-0 gap-1 ${esProbando ? "bg-blue-100 border-blue-400" : ""}`}
                      onClick={(e) => { e.stopPropagation(); probarVoz(v); }}
                    >
                      <Volume2 className="w-4 h-4" />
                      {esProbando ? "Hablando…" : "Escuchar"}
                    </Button>
                  </div>
                );
              })}
            </div>

            <p className="text-sm text-muted-foreground text-center">
              Las voces disponibles dependen de tu dispositivo y navegador.
              Las voces marcadas con "Google ·" suenan más naturales.
            </p>
          </div>
        )}

        {voces.length === 0 && (
          <div className="bg-white/80 p-6 rounded-2xl text-center text-muted-foreground text-lg w-full max-w-2xl">
            Cargando voces disponibles…
          </div>
        )}

        {/* Reset progress */}
        <div className="bg-white p-8 rounded-[2rem] shadow-md w-full max-w-2xl flex flex-col gap-4">
          <div>
            <Label className="text-2xl font-bold">Reiniciar progreso</Label>
            <p className="text-lg text-muted-foreground mt-1">
              Borra todo el avance y vuelve al inicio. Las figuras y juegos se bloquearán de nuevo.
            </p>
          </div>
          {!confirmando ? (
            <Button
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50 rounded-2xl text-lg py-6 gap-2"
              onClick={() => setConfirmando(true)}
            >
              <RotateCcw className="w-5 h-5" />
              Reiniciar progreso
            </Button>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-center text-lg font-semibold text-red-600">
                ¿Estás seguro? Se borrará todo el avance.
              </p>
              <div className="flex gap-3">
                <Button
                  className="flex-1 rounded-2xl text-lg py-6 bg-red-500 hover:bg-red-600 text-white"
                  onClick={() => { reiniciarProgreso(); setConfirmando(false); }}
                >
                  Sí, reiniciar
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 rounded-2xl text-lg py-6"
                  onClick={() => setConfirmando(false)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </div>

      </div>
    </Layout>
  );
}
