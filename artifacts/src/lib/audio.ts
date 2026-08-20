export interface Preferencias {
  sonido: boolean;
  narracion: boolean;
  estimulos: 'bajo' | 'medio';
  tema: 'claro' | 'oscuroSuave';
  vozNombre: string; // name of the selected SpeechSynthesisVoice
}

export const feedbackPositivo = [
  "¡Muy bien!",
  "¡Excelente trabajo!",
  "¡Sigue explorando!",
  "¡Descubriste una nueva figura!",
  "¡Cada vez lo haces mejor!"
];

export const feedbackIntento = [
  "Casi lo logras, inténtalo de nuevo.",
  "Inténtalo de nuevo, tú puedes."
];

export const feedbackConNombre = (nombre: string): string => {
  const conNombre = nombre ? [
    `¡Muy bien, ${nombre}!`,
    `¡Excelente, ${nombre}! ¡Eso es correcto!`,
    `¡Correcto, ${nombre}! ¡Eres muy inteligente!`,
    `¡Así se hace, ${nombre}!`,
    `¡Fantástico, ${nombre}! ¡Sigue así!`,
    `¡Lo lograste, ${nombre}! ¡Genial!`,
  ] : feedbackPositivo;
  return conNombre[Math.floor(Math.random() * conNombre.length)];
};

// ── Voice loading ────────────────────────────────────────────────────────────

let cachedVoices: SpeechSynthesisVoice[] = [];

const loadVoices = (): Promise<SpeechSynthesisVoice[]> =>
  new Promise((resolve) => {
    const list = window.speechSynthesis.getVoices();
    if (list.length > 0) { cachedVoices = list; resolve(list); return; }
    window.speechSynthesis.addEventListener(
      "voiceschanged",
      () => { cachedVoices = window.speechSynthesis.getVoices(); resolve(cachedVoices); },
      { once: true }
    );
  });

/** Returns all Spanish voices available in this browser, sorted best-first. */
export const getSpanishVoices = async (): Promise<SpeechSynthesisVoice[]> => {
  const all = await loadVoices();
  const spanish = all.filter(v => v.lang.startsWith("es"));

  // Score: Google > others; female heuristic (name contains vowel patterns or known names)
  const femaleHints = ["paulina", "monica", "helena", "sabina", "maria", "lucia",
    "elena", "isabella", "valentina", "camila", "female", "mujer", "woman"];
  const score = (v: SpeechSynthesisVoice) => {
    let s = 0;
    if (v.name.toLowerCase().includes("google")) s += 10;
    if (v.localService) s += 2; // local voices are faster
    if (femaleHints.some(h => v.name.toLowerCase().includes(h))) s += 5;
    if (v.lang === "es-US" || v.lang === "es-MX") s += 1; // Latin American often warmer
    return s;
  };

  return spanish.sort((a, b) => score(b) - score(a));
};

/** Picks the best voice given a saved name preference. */
const pickVoice = (voices: SpeechSynthesisVoice[], vozNombre: string): SpeechSynthesisVoice | null => {
  if (vozNombre) {
    const saved = voices.find(v => v.name === vozNombre);
    if (saved) return saved;
  }
  return voices[0] ?? null;
};

// ── AudioContext tones ────────────────────────────────────────────────────────

let audioCtx: AudioContext | null = null;
const getAudioContext = () => {
  if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  return audioCtx;
};

export const playTone = (type: 'exito' | 'intento', preferencias: Preferencias) => {
  if (!preferencias.sonido) return;
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') ctx.resume();

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain); gain.connect(ctx.destination);
  osc.type = 'sine';
  const now = ctx.currentTime;

  if (type === 'exito') {
    osc.frequency.setValueAtTime(523.25, now);
    osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.1);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc.start(now); osc.stop(now + 0.3);
  } else {
    osc.frequency.setValueAtTime(392.00, now);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.1, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    osc.start(now); osc.stop(now + 0.2);
  }
};

// ── speak ────────────────────────────────────────────────────────────────────

export const speak = (text: string, preferencias: Preferencias) => {
  if (!preferencias.narracion) return;
  if (!window.speechSynthesis) return;

  window.speechSynthesis.cancel();

  const say = (voice: SpeechSynthesisVoice | null) => {
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = voice?.lang ?? "es-ES";
    utt.rate = 0.84;   // slower = clearer for kids
    utt.pitch = 1.25;  // warmer, friendlier
    utt.volume = 1.0;
    if (voice) utt.voice = voice;
    window.speechSynthesis.speak(utt);
  };

  // If voices already cached, speak immediately
  if (cachedVoices.length > 0) {
    const spanish = cachedVoices.filter(v => v.lang.startsWith("es"));
    say(pickVoice(spanish, preferencias.vozNombre));
  } else {
    // Wait for voices to load then speak
    loadVoices().then(voices => {
      const spanish = voices.filter(v => v.lang.startsWith("es"));
      say(pickVoice(spanish, preferencias.vozNombre));
    });
  }
};
