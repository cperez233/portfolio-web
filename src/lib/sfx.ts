/* editorial-ui · Cristian Pérez · cristianperez.me */

/**
 * Sonidos del sitio: apagados por defecto y sintetizados con Web Audio (ni
 * un archivo de audio que descargar). Se encienden desde la conversacion
 * con el Stand ("Activar sonido") y la eleccion se recuerda.
 *
 * Los navegadores no dejan sonar nada hasta que quien visita toca la pagina
 * una vez: el contexto de audio se crea, queda en pausa y se reanuda en el
 * primer toque. Por eso en una primera carga la entrada del Stand suele
 * ser muda; el ZA WARUDO del retrato, los poderes y todo lo que viene de un
 * toque suenan siempre que el sonido este encendido.
 *
 * Todo suena bajito (master 0.35) y ningun sonido dura mas de ~1.2s.
 */

export type Sfx = "crack" | "heal" | "thud" | "warudo" | "resume";

const KEY = "jojo-sound";

let enabled: boolean | null = null;
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let unlockHooked = false;

function read(): boolean {
  if (enabled === null) {
    try {
      enabled = window.localStorage.getItem(KEY) === "1";
    } catch {
      enabled = false;
    }
  }
  return enabled;
}

export function soundEnabled(): boolean {
  return typeof window !== "undefined" && read();
}

function context(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AudioCtor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtor) return null;
    ctx = new AudioCtor();
    master = ctx.createGain();
    master.gain.value = 0.35;
    master.connect(ctx.destination);
  }
  return ctx;
}

function resume() {
  const audio = context();
  if (audio && audio.state === "suspended") void audio.resume().catch(() => {});
}

/** Reanuda el audio en el primer toque (la politica de autoplay lo exige). */
function hookUnlock() {
  if (unlockHooked) return;
  unlockHooked = true;
  const unlock = () => {
    resume();
    window.removeEventListener("pointerdown", unlock, true);
    window.removeEventListener("keydown", unlock, true);
  };
  window.addEventListener("pointerdown", unlock, true);
  window.addEventListener("keydown", unlock, true);
}

export function setSound(on: boolean) {
  enabled = on;
  try {
    window.localStorage.setItem(KEY, on ? "1" : "0");
  } catch {
    // Sin storage la eleccion vale solo para esta visita.
  }
  // Se llama desde un toque: aqui si se puede crear y reanudar el audio.
  if (on) resume();
}

/** Ruido blanco corto, ya recortado en el tiempo. */
function noise(audio: AudioContext, seconds: number) {
  const buffer = audio.createBuffer(1, Math.max(1, Math.floor(audio.sampleRate * seconds)), audio.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const source = audio.createBufferSource();
  source.buffer = buffer;
  return source;
}

function envelope(audio: AudioContext, at: number, peak: number, decay: number) {
  const gain = audio.createGain();
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(peak, at + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + decay);
  gain.connect(master!);
  return gain;
}

/** Chasquido de vidrio: ruido agudo y corto. */
function tick(audio: AudioContext, at: number, peak: number, freq: number) {
  const source = noise(audio, 0.18);
  const filter = audio.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = freq;
  source.connect(filter);
  filter.connect(envelope(audio, at, peak, 0.14));
  source.start(at);
  source.stop(at + 0.18);
}

/** Tono con caida de frecuencia (golpes graves, barrido). */
function tone(audio: AudioContext, at: number, from: number, to: number, seconds: number, peak: number, type: OscillatorType = "sine") {
  const osc = audio.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(from, at);
  osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), at + seconds);
  osc.connect(envelope(audio, at, peak, seconds));
  osc.start(at);
  osc.stop(at + seconds + 0.02);
}

export function playSfx(kind: Sfx) {
  if (!soundEnabled()) return;
  hookUnlock();
  const audio = context();
  if (!audio) return;
  if (audio.state === "suspended") resume();
  // Sin gesto previo sigue en pausa: mejor mudo que un chasquido tardio.
  if (audio.state !== "running") return;
  const now = audio.currentTime;
  if (kind === "crack") {
    tone(audio, now, 120, 45, 0.28, 0.9);
    tick(audio, now, 0.7, 2600);
    tick(audio, now + 0.05, 0.45, 3400);
    tick(audio, now + 0.11, 0.35, 4200);
    tick(audio, now + 0.19, 0.25, 3000);
  } else if (kind === "heal") {
    [880, 1318.5, 1760].forEach((freq, i) => tone(audio, now + i * 0.07, freq, freq * 0.995, 0.55, 0.28, "triangle"));
  } else if (kind === "thud") {
    tone(audio, now, 110, 38, 0.3, 1);
  } else if (kind === "warudo") {
    tone(audio, now, 520, 46, 0.7, 0.55, "sawtooth");
    tone(audio, now + 0.02, 90, 36, 0.45, 0.9);
  } else {
    tick(audio, now, 0.55, 5200);
    tick(audio, now + 0.16, 0.4, 4400);
  }
}
