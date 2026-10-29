/* editorial-ui · Cristian Pérez · cristianperez.me */

import { rand } from "@/components/mini-stand/power-kit";

/*
  La explosion de Killer Queen (Bites the Dust), pintada en un canvas.

  Como en Diamond is Unbreakable: antes del estallido el objeto tocado se
  ilumina por dentro y le salen rayos de luz; despues, un nucleo blanco,
  la bola de fuego (blanco, amarillo, naranja y el rosa de Killer Queen),
  chispas, la onda de choque y el humo morado que se queda flotando. Con
  trazo de manga: nubes de borde duro, contorno de tinta y dos tonos, no
  un resplandor difuso.

  Todo es una funcion del tiempo (draw(t), t en ms desde el estallido; con
  t negativo, los rayos de antes): cada particula sale de una formula y no
  de una simulacion paso a paso. Asi se puede pintar hacia atras, y en el
  rebobinado la explosion se traga a si misma.
*/

/** Lo que dura la explosion hasta quedar solo el humo. */
export const BOOM_MS = 1700;
/** Lo que se ve antes: los rayos de luz que salen del retrato. */
export const PRIME_MS = 320;

interface Spark {
  a: number;
  reach: number;
  tau: number;
  size: number;
  life: number;
  rise: number;
  delay: number;
}

/** Del centro a la orilla del fuego: blanco, amarillo, naranja, el rosa de Killer Queen y morado. */
const FIRE = ["#ffffff", "#fff4c2", "#ffd35a", "#ff9a3d", "#f0508a", "#a33a78", "#5a4560"];

export function createBoom(parent: HTMLElement, x: number, y: number, small: boolean) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const ratio = Math.min(2, window.devicePixelRatio || 1);
  const canvas = document.createElement("canvas");
  canvas.className = "dust-canvas";
  canvas.width = Math.round(w * ratio);
  canvas.height = Math.round(h * ratio);
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  parent.appendChild(canvas);
  const g = canvas.getContext("2d")!;
  g.setTransform(ratio, 0, 0, ratio, 0, 0);

  const big = Math.max(w, h);

  const fire: Spark[] = Array.from({ length: small ? 90 : 150 }, () => ({
    a: rand(0, Math.PI * 2),
    reach: rand(0.04, small ? 0.42 : 0.34) * big,
    tau: rand(110, 260),
    size: rand(small ? 40 : 60, small ? 110 : 170),
    life: rand(700, 1250),
    rise: rand(20, 90),
    delay: rand(0, 90),
  }));
  const smoke: Spark[] = Array.from({ length: small ? 26 : 40 }, () => ({
    a: rand(0, Math.PI * 2),
    reach: rand(0.06, small ? 0.36 : 0.3) * big,
    tau: rand(260, 520),
    size: rand(small ? 90 : 140, small ? 170 : 280),
    life: 0,
    rise: rand(30, 110),
    delay: rand(120, 300),
  }));
  const sparks: Spark[] = Array.from({ length: small ? 28 : 44 }, () => ({
    a: rand(0, Math.PI * 2),
    reach: rand(0.35, 0.75) * big,
    tau: rand(90, 160),
    size: rand(1.5, 3.5),
    life: rand(380, 650),
    rise: 0,
    delay: rand(0, 60),
  }));
  const rays = Array.from({ length: 14 }, (_, i) => ({ a: (i / 14) * Math.PI * 2 + rand(-0.12, 0.12), w: rand(0.03, 0.08) }));

  const out = (s: Spark, t: number) => s.reach * (1 - Math.exp(-Math.max(0, t - s.delay) / s.tau));

  function draw(t: number) {
    g.clearRect(0, 0, w, h);

    // Antes: el retrato se ilumina por dentro y le salen rayos.
    if (t < 0) {
      const p = 1 + t / PRIME_MS;
      if (p <= 0) return;
      g.save();
      g.globalCompositeOperation = "lighter";
      for (const ray of rays) {
        const len = big * (0.08 + 0.5 * p * p);
        g.beginPath();
        g.moveTo(x, y);
        g.arc(x, y, len, ray.a - ray.w * p, ray.a + ray.w * p);
        g.closePath();
        const grad = g.createRadialGradient(x, y, 0, x, y, len);
        grad.addColorStop(0, `rgba(255, 248, 230, ${0.9 * p})`);
        grad.addColorStop(1, "rgba(255, 210, 120, 0)");
        g.fillStyle = grad;
        g.fill();
      }
      const glow = g.createRadialGradient(x, y, 0, x, y, 60 + 120 * p);
      glow.addColorStop(0, `rgba(255, 250, 235, ${p})`);
      glow.addColorStop(1, "rgba(255, 200, 120, 0)");
      g.fillStyle = glow;
      g.fillRect(x - 200, y - 200, 400, 400);
      g.restore();
      return;
    }

    /*
      Nubes de manga: cada bocanada es un circulo de borde duro. Primero
      se pintan todos un poco mas grandes en tinta y encima los rellenos:
      el contorno queda solo alrededor de la nube entera. Luego, un brillo
      corrido hacia arriba a la izquierda (el sombreado en dos tonos).
    */
    type Puff = { px: number; py: number; r: number; fill: string; light: string; u: number };
    const cloud = (puffs: Puff[]) => {
      g.fillStyle = "#161418";
      g.beginPath();
      for (const p of puffs) {
        g.moveTo(p.px + p.r + 4, p.py);
        g.arc(p.px, p.py, p.r + 4, 0, Math.PI * 2);
      }
      g.fill();
      for (const p of puffs) {
        g.fillStyle = p.fill;
        g.beginPath();
        g.arc(p.px, p.py, p.r, 0, Math.PI * 2);
        g.fill();
      }
      for (const p of puffs) {
        g.fillStyle = p.light;
        g.beginPath();
        g.arc(p.px - p.r * 0.22, p.py - p.r * 0.24, p.r * 0.62, 0, Math.PI * 2);
        g.fill();
      }
    };
    // El humo, detras: crece despacio y se queda.
    const haze: Puff[] = [];
    for (const [i, s] of smoke.entries()) {
      const local = t - s.delay;
      if (local <= 0) continue;
      const d = out(s, t);
      const r = s.size * 0.5 * (0.35 + 0.75 * (1 - Math.exp(-local / 500))) * Math.min(1, local / 160);
      haze.push({
        px: x + Math.cos(s.a) * d,
        py: y + Math.sin(s.a) * d * 0.75 - s.rise * Math.min(1, local / 1400),
        r,
        fill: i % 3 ? "#5a4560" : "#3d2e44",
        light: "#7b6383",
        u: 1,
      });
    }
    cloud(haze);
    // El fuego encima: lo mas viejo (mas oscuro) detras, lo nuevo y blanco delante.
    const puffs: Puff[] = [];
    for (const s of fire) {
      const local = t - s.delay;
      if (local <= 0 || local > s.life) continue;
      const u = local / s.life;
      const d = out(s, t);
      // Al final de su vida se encoge hasta nada: no desaparece de golpe.
      const r = s.size * 0.42 * (0.4 + 0.8 * (1 - Math.exp(-local / 180))) * (u < 0.7 ? 1 : (1 - u) / 0.3);
      const k = Math.min(FIRE.length - 2, Math.floor(u * (FIRE.length - 1)));
      puffs.push({
        px: x + Math.cos(s.a) * d,
        py: y + Math.sin(s.a) * d * 0.8 - s.rise * u * u,
        r,
        fill: FIRE[k + 1],
        light: FIRE[k],
        u,
      });
    }
    // El nucleo: un sol blanco que se abre y se apaga.
    if (t < 380) {
      const r = big * (0.06 + 0.2 * Math.sqrt(t / 380)) * (1 - t / 760);
      puffs.push({ px: x, py: y, r, fill: "#fff8e6", light: "#ffffff", u: -1 });
    }
    cloud(puffs.sort((a, b) => b.u - a.u));

    g.save();
    // Chispas: rayas finas que salen disparadas.
    g.globalAlpha = 1;
    g.lineCap = "round";
    for (const s of sparks) {
      const local = t - s.delay;
      if (local <= 0 || local > s.life) continue;
      const u = local / s.life;
      const d = out(s, t);
      const tail = Math.max(0, d - 40 - 60 * (1 - u));
      g.strokeStyle = u < 0.5 ? "#fff3c4" : "#ffb547";
      g.globalAlpha = 1 - u;
      g.lineWidth = s.size;
      g.beginPath();
      g.moveTo(x + Math.cos(s.a) * tail, y + Math.sin(s.a) * tail);
      g.lineTo(x + Math.cos(s.a) * d, y + Math.sin(s.a) * d);
      g.stroke();
    }
    g.restore();

    // La onda de choque: un anillo de tinta que se abre y se borra.
    if (t < 700) {
      const k = t / 700;
      const r = big * 0.9 * (1 - Math.exp(-t / 200));
      g.globalAlpha = 1 - k;
      g.lineWidth = 10 * (1 - k) + 2;
      g.strokeStyle = "#161418";
      g.beginPath();
      g.arc(x, y, r, 0, Math.PI * 2);
      g.stroke();
      g.lineWidth = 4 * (1 - k) + 1;
      g.strokeStyle = "#fbf3df";
      g.beginPath();
      g.arc(x, y, r - 6, 0, Math.PI * 2);
      g.stroke();
      g.globalAlpha = 1;
    }
  }

  return { canvas, draw, remove: () => canvas.remove() };
}
