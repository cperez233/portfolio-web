/* editorial-ui · Cristian Pérez · cristianperez.me */

import { rand } from "@/components/mini-stand/power-kit";

/*
  La explosion de Killer Queen (Bites the Dust), pintada en un canvas.

  Como en Diamond is Unbreakable: antes del estallido el objeto tocado se
  ilumina por dentro y le salen rayos de luz. Despues, una explosion de
  verdad, por capas:

  - el destello y el nucleo blanco, que se abre y se apaga enseguida;
  - la bola de fuego: bocanadas con volumen (luz por dentro, orilla mas
    oscura) que se enfrian mientras se abren: blanco, amarillo, naranja,
    rojo oscuro y al final humo. El fuego no desaparece, se vuelve humo;
  - la columna de humo, que sube despacio y se abre arriba como un hongo,
    iluminada desde abajo por el fuego mientras dura;
  - escombros y brasas que salen disparados y caen con la gravedad;
  - la onda de choque, un anillo de aire que se abre y se borra.

  Todo es una funcion del tiempo (draw(t), t en ms desde el estallido; con
  t negativo, los rayos de antes): cada particula sale de una formula y no
  de una simulacion paso a paso. Asi se puede pintar hacia atras, y en el
  rebobinado la explosion se traga a si misma.
*/

/** Lo que dura la explosion hasta que se va el humo. */
export const BOOM_MS = 3200;
/** Lo que se ve antes: los rayos de luz que salen del retrato. */
export const PRIME_MS = 320;

interface Puff {
  a: number;
  reach: number;
  tau: number;
  size: number;
  life: number;
  rise: number;
  delay: number;
  spin: number;
}

interface Bit {
  vx: number;
  vy: number;
  size: number;
  life: number;
  delay: number;
  spin: number;
  ember: boolean;
}

/** Temperatura (1 caliente, 0 frio) a color: blanco, amarillo, naranja, rojo, brasa y humo. */
const HEAT: [number, [number, number, number]][] = [
  [1, [255, 252, 238]],
  [0.86, [255, 230, 150]],
  [0.7, [255, 176, 64]],
  [0.52, [236, 104, 34]],
  [0.36, [170, 52, 26]],
  [0.2, [88, 40, 30]],
  [0, [52, 44, 44]],
];

function heat(k: number): [number, number, number] {
  const v = Math.max(0, Math.min(1, k));
  for (let i = 1; i < HEAT.length; i++) {
    const [hi, a] = HEAT[i - 1];
    const [lo, b] = HEAT[i];
    if (v >= lo) {
      const f = (v - lo) / (hi - lo);
      return [b[0] + (a[0] - b[0]) * f, b[1] + (a[1] - b[1]) * f, b[2] + (a[2] - b[2]) * f];
    }
  }
  return HEAT[HEAT.length - 1][1];
}

const rgba = ([r, g, b]: [number, number, number], a: number) => `rgba(${r | 0}, ${g | 0}, ${b | 0}, ${a.toFixed(3)})`;

/*
  Bocanadas con textura: cada una es una "coliflor" (un monton de lobulos
  redondos que se pisan) con luz de un lado y sombra del otro. Se pintan
  una vez, en varios niveles de temperatura, y despues solo se estampan
  escaladas y giradas: eso es lo que hace que el fuego se lea como fuego y
  no como bolas de color.
*/
const SPRITE = 128;
const LEVELS = 12;

function billow(color: (k: number) => [number, number, number], k: number, seed: number) {
  const c = document.createElement("canvas");
  c.width = c.height = SPRITE;
  const g = c.getContext("2d")!;
  const half = SPRITE / 2;
  // Un azar con semilla: la misma forma para todos los niveles de una variante.
  let s = seed * 9301 + 49297;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  for (let i = 0; i < 16; i++) {
    const a = rnd() * Math.PI * 2;
    const d = Math.sqrt(rnd()) * half * 0.42;
    const r = half * (0.26 + rnd() * 0.24);
    const x = half + Math.cos(a) * d;
    const y = half + Math.sin(a) * d;
    const grad = g.createRadialGradient(x - r * 0.25, y - r * 0.3, r * 0.1, x, y, r);
    grad.addColorStop(0, rgba(color(k + 0.1), 1));
    grad.addColorStop(0.7, rgba(color(k), 1));
    grad.addColorStop(1, rgba(color(k - 0.08), 0));
    g.fillStyle = grad;
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.fill();
  }
  // Volumen: sombra abajo a la derecha, solo sobre lo pintado.
  g.globalCompositeOperation = "source-atop";
  const shadow = g.createLinearGradient(SPRITE * 0.25, SPRITE * 0.2, SPRITE * 0.85, SPRITE * 0.95);
  shadow.addColorStop(0, "rgba(0, 0, 0, 0)");
  shadow.addColorStop(1, rgba(color(k - 0.3), 0.55));
  g.fillStyle = shadow;
  g.fillRect(0, 0, SPRITE, SPRITE);
  return c;
}

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
  const scale = small ? 0.8 : 1;

  // Tres formas por nivel de temperatura, para el fuego; tres para el humo.
  const fireSprites = Array.from({ length: LEVELS }, (_, i) => [1, 2, 3].map((v) => billow(heat, i / (LEVELS - 1), v)));
  const smokeTone = (k: number): [number, number, number] => {
    const v = 46 + Math.max(0, Math.min(1, k)) * 70;
    return [v + 6, v, v - 2];
  };
  const smokeSprites = [4, 5, 6].map((v) => billow(smokeTone, 0.45, v));

  // El fuego: muchas bocanadas que salen del centro y se enfrian.
  const fire: Puff[] = Array.from({ length: small ? 80 : 130 }, () => ({
    a: rand(0, Math.PI * 2),
    reach: rand(0.02, 0.25) * big * scale,
    tau: rand(140, 340),
    size: rand(70, 190) * scale,
    life: rand(1700, 2700),
    rise: rand(60, 200) * scale,
    delay: rand(0, 160),
    spin: rand(0, Math.PI * 2),
  }));
  // El humo: menos, mas grandes, salen despues y suben (la columna).
  const smoke: Puff[] = Array.from({ length: small ? 26 : 40 }, (_, i) => ({
    a: rand(0, Math.PI * 2),
    reach: rand(0.04, 0.22) * big * scale,
    tau: rand(400, 800),
    size: rand(120, 260) * scale,
    life: BOOM_MS,
    // Unos pocos forman el tallo y suben mucho mas: el hongo.
    rise: (i % 4 === 0 ? rand(0.3, 0.45) : rand(0.08, 0.2)) * h,
    delay: rand(140, 520),
    spin: rand(0, Math.PI * 2),
  }));
  // Escombros (trozos oscuros que giran) y brasas (puntos que brillan y caen).
  const bits: Bit[] = Array.from({ length: small ? 34 : 56 }, (_, i) => {
    const a = rand(0, Math.PI * 2);
    const v = rand(0.6, 1.5) * scale;
    return {
      vx: Math.cos(a) * v,
      vy: Math.sin(a) * v - rand(0.25, 0.6),
      size: i % 3 ? rand(1.6, 3.4) : rand(4, 9) * scale,
      life: rand(1200, 2200),
      delay: rand(0, 90),
      spin: rand(-0.02, 0.02),
      ember: i % 3 !== 0,
    };
  });
  const rays = Array.from({ length: 14 }, (_, i) => ({ a: (i / 14) * Math.PI * 2 + rand(-0.12, 0.12), w: rand(0.03, 0.08) }));

  const out = (s: Puff, t: number) => s.reach * (1 - Math.exp(-Math.max(0, t - s.delay) / s.tau));
  // Gravedad de escombros y brasas, en px/ms².
  const GRAVITY = 0.0011;

  /** Una bocanada con volumen: luz corrida hacia donde esta el fuego, orilla mas oscura y suave. */
  const blob = (px: number, py: number, r: number, inner: string, outer: string, edge: string, lx: number, ly: number) => {
    if (r <= 0.5) return;
    const grad = g.createRadialGradient(px + lx * r * 0.35, py + ly * r * 0.35, r * 0.05, px, py, r);
    grad.addColorStop(0, inner);
    grad.addColorStop(0.62, outer);
    grad.addColorStop(1, edge);
    g.fillStyle = grad;
    g.beginPath();
    g.arc(px, py, r, 0, Math.PI * 2);
    g.fill();
  };

  /** Estampa una bocanada ya pintada, de radio r y girada. */
  const stamp = (sprite: HTMLCanvasElement, px: number, py: number, r: number, spin: number) => {
    if (r <= 1) return;
    g.save();
    g.translate(px, py);
    g.rotate(spin);
    g.drawImage(sprite, -r, -r, r * 2, r * 2);
    g.restore();
  };

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

    // Lo que queda del fuego ilumina el humo desde abajo.
    const glowLeft = Math.max(0, 1 - t / 2200);
    const fade = t > BOOM_MS * 0.7 ? Math.max(0, (BOOM_MS - t) / (BOOM_MS * 0.3)) : 1;

    // El destello: la pantalla entera se aclara un instante.
    if (t < 160) {
      g.fillStyle = `rgba(255, 246, 225, ${(0.55 * (1 - t / 160)).toFixed(3)})`;
      g.fillRect(0, 0, w, h);
    }

    // El humo, detras: crece despacio, sube y se abre arriba.
    for (const [i, s] of smoke.entries()) {
      const local = t - s.delay;
      if (local <= 0) continue;
      const d = out(s, t);
      const up = s.rise * (1 - Math.exp(-local / 1300));
      const r = s.size * 0.62 * (0.3 + 0.9 * (1 - Math.exp(-local / 800))) * Math.min(1, local / 240);
      const px = x + Math.cos(s.a) * d * (1 + up / h);
      const py = y + Math.sin(s.a) * d * 0.55 - up;
      g.globalAlpha = 0.9 * fade * Math.min(1, local / 300);
      stamp(smokeSprites[i % 3], px, py, r, s.spin + local * 0.00008);
      // Mientras quema, el fuego lo ilumina desde abajo.
      if (glowLeft > 0.05) {
        g.globalAlpha = glowLeft * 0.55 * fade;
        stamp(fireSprites[3][i % 3], px, py + r * 0.25, r * 0.8, s.spin);
      }
    }
    g.globalAlpha = 1;

    // Escombros y brasas: salen disparados, frenan con el aire y caen.
    // Detras del fuego: dentro de la bola no se ven, fuera si.
    for (const b of bits) {
      const local = t - b.delay;
      if (local <= 0 || local > b.life) continue;
      const u = local / b.life;
      // Freno del aire en el empuje y gravedad que acaba ganando.
      const drag = 380 * (1 - Math.exp(-local / 380));
      const px = x + b.vx * drag;
      const py = y + b.vy * drag + 0.5 * GRAVITY * local * local * 0.6;
      if (b.ember) {
        const k = 0.9 - u * 0.7;
        g.fillStyle = rgba(heat(k), (1 - u) * fade);
        g.beginPath();
        g.arc(px, py, b.size * (1 - u * 0.5), 0, Math.PI * 2);
        g.fill();
      } else {
        g.save();
        g.translate(px, py);
        g.rotate(b.spin * local);
        g.fillStyle = rgba([34, 28, 30], Math.min(1, (1 - u) * 1.6) * fade);
        g.beginPath();
        g.moveTo(-b.size, -b.size * 0.4);
        g.lineTo(b.size * 0.7, -b.size * 0.8);
        g.lineTo(b.size, b.size * 0.5);
        g.lineTo(-b.size * 0.4, b.size * 0.8);
        g.closePath();
        g.fill();
        g.restore();
      }
    }

    // El fuego: lo mas frio (oscuro) detras, lo mas caliente delante.
    const flames: { px: number; py: number; r: number; k: number; a: number; v: number; spin: number }[] = [];
    for (const [i, s] of fire.entries()) {
      const local = t - s.delay;
      if (local <= 0 || local > s.life) continue;
      const u = local / s.life;
      const d = out(s, t);
      const r = s.size * 0.6 * (0.35 + 0.95 * (1 - Math.exp(-local / 260)));
      // Se enfria despacio al principio y rapido al final; antes en la orilla.
      const k = Math.max(0, 1 - 1.1 * Math.pow(u, 1.35) - (d / (s.reach + 1)) * 0.15);
      flames.push({
        px: x + Math.cos(s.a) * d,
        py: y + Math.sin(s.a) * d * 0.8 - s.rise * u * u,
        r,
        k,
        // Ya frio, se deshace en humo.
        a: (u < 0.75 ? 1 : Math.max(0, (1 - u) / 0.25)) * fade,
        v: i % 3,
        spin: s.spin + local * 0.0003,
      });
    }
    flames.sort((p, q) => p.k - q.k);
    for (const f of flames) {
      g.globalAlpha = f.a;
      stamp(fireSprites[Math.round(f.k * (LEVELS - 1))][f.v], f.px, f.py, f.r, f.spin);
    }
    g.globalAlpha = 1;

    // El nucleo: un sol blanco que se abre y se apaga.
    if (t < 520) {
      const p = t / 520;
      const r = big * scale * (0.05 + 0.17 * Math.sqrt(p)) * (1 - p * 0.6);
      const a = 1 - p * p;
      blob(x, y, r, `rgba(255, 255, 250, ${a})`, `rgba(255, 238, 180, ${a * 0.9})`, "rgba(255, 190, 90, 0)", 0, 0);
    }

    // La onda de choque: un anillo de aire claro que se abre y se borra.
    if (t < 650) {
      const k = t / 650;
      const r = big * 0.85 * (1 - Math.exp(-t / 210));
      const ring = g.createRadialGradient(x, y, Math.max(0, r - 34), x, y, r);
      ring.addColorStop(0, "rgba(255, 250, 235, 0)");
      ring.addColorStop(0.8, `rgba(255, 250, 235, ${(0.4 * (1 - k)).toFixed(3)})`);
      ring.addColorStop(1, "rgba(255, 250, 235, 0)");
      g.fillStyle = ring;
      g.beginPath();
      g.arc(x, y, r, 0, Math.PI * 2);
      g.fill();
    }
  }

  return { canvas, draw, remove: () => canvas.remove() };
}
