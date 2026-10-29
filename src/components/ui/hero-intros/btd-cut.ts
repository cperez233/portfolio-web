/* editorial-ui · Cristian Pérez · cristianperez.me */

/*
  La activacion de Bites the Dust, antes del rebobinado, como la ultima
  vez que Kira la dispara en el anime (Diamond is Unbreakable, ep. 37):
  despues de la explosion el tiempo se lo traga todo y la pantalla entera
  hace un viaje hacia atras, en este orden:

  1. una luz que sale del centro y la oscuridad que se cierra desde los
     bordes, suave, como una vineta;
  2. el espacio: una nebulosa verde, amarilla y violeta que gira, y las
     estrellas cayendo hacia el centro, cada vez mas rapido, con
     バイツァ・ダスト encima;
  3. haces de luz que convergen en una estrella blanca;
  4. un campo de burbujas rosas y violetas sobre una trama de puntos, en
     tres planos (las lejanas desenfocadas, las cercanas grandes y
     borrosas), hasta que una enorme llena la pantalla;
  5. un tunel de anillos de luz, con el centro cada vez mas blanco;
  6. nubes lavanda que se abren: el tiempo volvio y empieza la cinta.

  Nada corta en seco: cada fase entra mientras la anterior se va, y en
  cada cambio un destello suave tapa la costura. Sin bordes duros: los
  puntos, las burbujas y los anillos se desvanecen en sus orillas.

  Todo en un canvas, como funcion del tiempo; lo pesado (la nebulosa, las
  burbujas, la trama, los anillos, las nubes) se pinta una vez y despues
  solo se estampa. Lo usan la entrada del hero (dust.ts) y el poder del
  mini Stand (powers.ts). Se quita solo al acabar.
*/

/** Lo que dura la activacion, hasta que arranca la cinta. */
export const CUT_MS = 3400;

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const clamp = (v: number) => Math.max(0, Math.min(1, v));
/** Suave al entrar y al salir. */
const smooth = (v: number) => v * v * (3 - 2 * v);
/** De 0 a 1 entre a y b, suave. */
const seg = (u: number, a: number, b: number) => smooth(clamp((u - a) / (b - a)));
/** Sube entre a y b, se queda, y baja entre c y d. */
const span = (u: number, a: number, b: number, c: number, d: number) => Math.min(seg(u, a, b), 1 - seg(u, c, d));
/** Un pico suave centrado en `at`, de ancho `w`. */
const peak = (u: number, at: number, w: number) => Math.max(0, 1 - Math.abs(u - at) / w) ** 2;

function sprite(size: number, paint: (g: CanvasRenderingContext2D, s: number) => void) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  paint(c.getContext("2d")!, size);
  return c;
}

/** Una copia desenfocada (para lo que esta fuera de foco). */
function blurred(src: HTMLCanvasElement, px: number) {
  return sprite(src.width, (g) => {
    g.filter = `blur(${px}px)`;
    g.drawImage(src, 0, 0);
  });
}

/** La nebulosa: nubes de color que se pisan, vetas oscuras y polvo de estrellas. */
function nebula(size: number) {
  return sprite(size, (g, s) => {
    g.fillStyle = "#07050d";
    g.fillRect(0, 0, s, s);
    const colors = ["#3f8a2a", "#c9b23a", "#e3a32f", "#9a2f8f", "#2f3f9e", "#6b3fa0", "#55a83a"];
    g.globalCompositeOperation = "screen";
    for (let i = 0; i < 18; i++) {
      const x = rand(0.1, 0.9) * s;
      const y = rand(0.1, 0.9) * s;
      const r = rand(0.12, 0.34) * s;
      const grad = g.createRadialGradient(x, y, 0, x, y, r);
      const c = colors[i % colors.length];
      grad.addColorStop(0, `${c}99`);
      grad.addColorStop(0.5, `${c}40`);
      grad.addColorStop(1, `${c}00`);
      g.fillStyle = grad;
      g.fillRect(0, 0, s, s);
    }
    // Vetas oscuras: le dan forma de nube y no de mancha.
    g.globalCompositeOperation = "source-over";
    for (let i = 0; i < 16; i++) {
      const x = rand(0, 1) * s;
      const y = rand(0, 1) * s;
      const r = rand(0.06, 0.16) * s;
      const grad = g.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, "rgba(5, 3, 10, 0.75)");
      grad.addColorStop(1, "rgba(5, 3, 10, 0)");
      g.fillStyle = grad;
      g.fillRect(0, 0, s, s);
    }
    // Polvo de estrellas, con un halo las mas grandes.
    for (let i = 0; i < 1100; i++) {
      const x = rand(0, s);
      const y = rand(0, s);
      const r = rand(0.4, 1.3);
      g.fillStyle = `rgba(255, ${Math.round(rand(220, 255))}, ${Math.round(rand(200, 255))}, ${rand(0.3, 1).toFixed(2)})`;
      g.beginPath();
      g.arc(x, y, r, 0, Math.PI * 2);
      g.fill();
      if (r > 1.1) {
        const halo = g.createRadialGradient(x, y, 0, x, y, r * 6);
        halo.addColorStop(0, "rgba(255, 250, 240, 0.35)");
        halo.addColorStop(1, "rgba(255, 250, 240, 0)");
        g.fillStyle = halo;
        g.fillRect(x - r * 6, y - r * 6, r * 12, r * 12);
      }
    }
  });
}

/** Una burbuja: rosa, violeta o azul, con volumen y orilla que se desvanece. */
function bubble(tone: [string, string, string]) {
  return sprite(160, (g, s) => {
    const h = s / 2;
    const r = h * 0.8;
    // Un halo alrededor: la burbuja brilla, no tiene borde de tinta.
    const halo = g.createRadialGradient(h, h, r * 0.85, h, h, h);
    halo.addColorStop(0, `${tone[1]}88`);
    halo.addColorStop(1, `${tone[1]}00`);
    g.fillStyle = halo;
    g.fillRect(0, 0, s, s);
    const grad = g.createRadialGradient(h - r * 0.3, h - r * 0.35, r * 0.05, h, h, r);
    grad.addColorStop(0, tone[0]);
    grad.addColorStop(0.55, tone[1]);
    grad.addColorStop(0.92, tone[2]);
    grad.addColorStop(1, `${tone[2]}00`);
    g.fillStyle = grad;
    g.beginPath();
    g.arc(h, h, r, 0, Math.PI * 2);
    g.fill();
    // Manchas por dentro, como en el anime, con borde suave.
    for (let i = 0; i < 5; i++) {
      const x = h + rand(-0.4, 0.4) * r;
      const y = h + rand(-0.4, 0.4) * r;
      const rr = rand(0.12, 0.28) * r;
      const spot = g.createRadialGradient(x, y, 0, x, y, rr);
      spot.addColorStop(0, "rgba(40, 10, 80, 0.32)");
      spot.addColorStop(1, "rgba(40, 10, 80, 0)");
      g.fillStyle = spot;
      g.fillRect(x - rr, y - rr, rr * 2, rr * 2);
    }
    // El brillo, difuso.
    const shine = g.createRadialGradient(h - r * 0.4, h - r * 0.45, 0, h - r * 0.4, h - r * 0.45, r * 0.32);
    shine.addColorStop(0, "rgba(255, 255, 255, 0.85)");
    shine.addColorStop(1, "rgba(255, 255, 255, 0)");
    g.fillStyle = shine;
    g.fillRect(0, 0, s, s);
  });
}

/** La trama de puntos violeta del fondo de las burbujas: puntos de orilla suave. */
function dots() {
  return sprite(24, (g, s) => {
    g.fillStyle = "#4a1f78";
    g.fillRect(0, 0, s, s);
    const grad = g.createRadialGradient(s * 0.44, s * 0.42, 0, s / 2, s / 2, s * 0.42);
    grad.addColorStop(0, "#b47ee0");
    grad.addColorStop(0.55, "#2c0f50");
    grad.addColorStop(1, "#4a1f78");
    g.fillStyle = grad;
    g.fillRect(0, 0, s, s);
  });
}

/** Un anillo de luz, de orillas suaves (el tunel). */
function ring() {
  return sprite(512, (g, s) => {
    const h = s / 2;
    const grad = g.createRadialGradient(h, h, h * 0.78, h, h, h);
    grad.addColorStop(0, "rgba(255, 255, 255, 0)");
    grad.addColorStop(0.45, "rgba(255, 255, 255, 1)");
    grad.addColorStop(1, "rgba(255, 255, 255, 0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, s, s);
  });
}

/** Tine un sprite blanco de un color (para los anillos). */
function tint(src: HTMLCanvasElement, color: string) {
  return sprite(src.width, (g, s) => {
    g.drawImage(src, 0, 0);
    g.globalCompositeOperation = "source-in";
    g.fillStyle = color;
    g.fillRect(0, 0, s, s);
  });
}

/** Una nube lavanda, para el final. */
function cloud() {
  return sprite(256, (g, s) => {
    for (let i = 0; i < 9; i++) {
      const x = s / 2 + rand(-0.25, 0.25) * s;
      const y = s / 2 + rand(-0.18, 0.18) * s;
      const r = rand(0.18, 0.3) * s;
      const grad = g.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, "rgba(250, 246, 255, 0.7)");
      grad.addColorStop(0.5, "rgba(226, 214, 250, 0.45)");
      grad.addColorStop(1, "rgba(214, 200, 245, 0)");
      g.fillStyle = grad;
      g.fillRect(x - r, y - r, r * 2, r * 2);
    }
  });
}

/** Pone la activacion en `parent` (una capa fija a pantalla completa) y se quita al acabar. */
export function btdCut(parent: HTMLElement) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const ratio = Math.min(1.5, window.devicePixelRatio || 1);
  const canvas = document.createElement("canvas");
  canvas.className = "btd-cut";
  canvas.setAttribute("aria-hidden", "true");
  canvas.width = Math.round(w * ratio);
  canvas.height = Math.round(h * ratio);
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  parent.appendChild(canvas);
  const g = canvas.getContext("2d")!;
  g.setTransform(ratio, 0, 0, ratio, 0, 0);

  const cx = w / 2;
  const cy = h / 2;
  const R = Math.hypot(w, h) / 2;
  const N = Math.ceil(R * 2);
  const space = nebula(N);
  const sharp = [
    bubble(["#fbd2f2", "#d06ad0", "#5a1f8a"]),
    bubble(["#e8c2ff", "#9a4fd8", "#3a1268"]),
    bubble(["#d6dcff", "#6a5ae0", "#24135e"]),
  ];
  // Tres planos de foco: lejos (muy borrosas), en foco, y pegadas a la camara (borrosas).
  const far = sharp.map((b) => blurred(b, 5));
  const near = sharp.map((b) => blurred(b, 3));
  const grid = g.createPattern(dots(), "repeat");
  const white = ring();
  const rings = [tint(white, "#ffffff"), tint(white, "#f0a6e6"), tint(white, "#9a6ae0")];
  const fog = cloud();
  const font = getComputedStyle(document.documentElement).getPropertyValue("--font-jp").trim() || "sans-serif";

  const stars = Array.from({ length: w < 640 ? 160 : 260 }, () => ({
    a: rand(0, Math.PI * 2),
    d: rand(0, 1),
    v: rand(0.8, 2.2),
    size: rand(0.6, 2),
    tint: Math.random() < 0.25 ? "255, 210, 122" : Math.random() < 0.3 ? "191, 231, 255" : "255, 255, 255",
  }));
  const beams = Array.from({ length: 70 }, () => ({
    a: rand(0, Math.PI * 2),
    v: rand(0.6, 1.4),
    width: rand(1, 4),
    color: ["255, 255, 255", "191, 231, 255", "244, 184, 255", "255, 210, 122", "159, 140, 255"][Math.floor(rand(0, 5))],
    curve: rand(-0.35, 0.35),
  }));
  const balls = Array.from({ length: w < 640 ? 46 : 72 }, (_, i) => ({
    x: rand(-0.05, 1.05) * w,
    y: rand(-0.05, 1.05) * h,
    // 0: lejos, 1: en foco, 2: cerca.
    depth: i % 6 === 0 ? 2 : i % 3 === 0 ? 0 : 1,
    r: rand(14, 60),
    at: rand(0, 0.7),
    tone: Math.floor(rand(0, 3)),
  }));
  const puffs = Array.from({ length: 10 }, () => ({
    x: rand(0, 1) * w,
    y: rand(0, 1) * h,
    r: rand(0.35, 0.6) * Math.max(w, h),
    dx: rand(-60, 60),
    dy: rand(-40, 40),
  }));

  /** Un destello suave de luz desde el centro: tapa la costura entre fases. */
  const bloom = (alpha: number, radius: number, color = "246, 236, 255") => {
    if (alpha <= 0.01) return;
    const grad = g.createRadialGradient(cx, cy, 0, cx, cy, radius);
    grad.addColorStop(0, `rgba(255, 255, 255, ${alpha.toFixed(3)})`);
    grad.addColorStop(0.35, `rgba(${color}, ${(alpha * 0.75).toFixed(3)})`);
    grad.addColorStop(1, `rgba(${color}, 0)`);
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);
  };

  function draw(u: number) {
    g.globalCompositeOperation = "source-over";
    g.globalAlpha = 1;
    g.clearRect(0, 0, w, h);

    // 1. La oscuridad se cierra desde los bordes, como una vineta suave.
    const dark = seg(u, 0, 0.12);
    if (u < 0.2) {
      const inner = R * (1.05 - dark * 1.05);
      const grad = g.createRadialGradient(cx, cy, Math.max(0, inner * 0.55), cx, cy, Math.max(1, inner * 1.25));
      grad.addColorStop(0, "rgba(7, 5, 13, 0)");
      grad.addColorStop(1, `rgba(7, 5, 13, ${(0.5 + dark * 0.5).toFixed(3)})`);
      g.fillStyle = grad;
      g.fillRect(0, 0, w, h);
    }

    // 2-3. El espacio, que aparece dentro de la oscuridad.
    const spaceAlpha = span(u, 0.06, 0.16, 0.5, 0.6);
    if (spaceAlpha > 0) {
      g.save();
      g.globalAlpha = spaceAlpha;
      g.translate(cx, cy);
      g.rotate(-u * 1.1);
      const zoom = 1 + u * 0.9;
      g.scale(zoom, zoom);
      g.drawImage(space, -N / 2, -N / 2);
      g.restore();

      // Las estrellas caen hacia el centro, cada vez mas rapido y mas largas.
      g.save();
      g.globalCompositeOperation = "lighter";
      g.lineCap = "round";
      const speed = 0.4 + seg(u, 0.15, 0.5) * 2.4;
      for (const s of stars) {
        const d = ((s.d - u * s.v * speed + 10) % 1) * R * 1.15;
        const len = 2 + seg(u, 0.18, 0.5) * 70 * (d / R);
        const grad = g.createLinearGradient(cx + Math.cos(s.a) * d, cy + Math.sin(s.a) * d, cx + Math.cos(s.a) * (d + len), cy + Math.sin(s.a) * (d + len));
        grad.addColorStop(0, `rgba(${s.tint}, ${(spaceAlpha * 0.95).toFixed(3)})`);
        grad.addColorStop(1, `rgba(${s.tint}, 0)`);
        g.strokeStyle = grad;
        g.lineWidth = s.size;
        g.beginPath();
        g.moveTo(cx + Math.cos(s.a) * d, cy + Math.sin(s.a) * d);
        g.lineTo(cx + Math.cos(s.a) * (d + len), cy + Math.sin(s.a) * (d + len));
        g.stroke();
      }
      g.restore();

      // Los haces de luz convergen en una estrella blanca.
      const warp = span(u, 0.26, 0.38, 0.52, 0.6);
      if (warp > 0) {
        g.save();
        g.globalCompositeOperation = "lighter";
        g.lineCap = "round";
        for (const b of beams) {
          const p = seg(u, 0.26, 0.58) * b.v;
          const d0 = R * (1.2 - p * 0.9);
          const d1 = Math.max(0, d0 - R * 0.5);
          const a1 = b.a + b.curve;
          const x0 = cx + Math.cos(b.a) * d0;
          const y0 = cy + Math.sin(b.a) * d0;
          const x1 = cx + Math.cos(a1) * d1;
          const y1 = cy + Math.sin(a1) * d1;
          // Cola que se desvanece: el haz no tiene corte.
          const grad = g.createLinearGradient(x0, y0, x1, y1);
          grad.addColorStop(0, `rgba(${b.color}, 0)`);
          grad.addColorStop(1, `rgba(${b.color}, ${(warp * 0.8).toFixed(3)})`);
          g.strokeStyle = grad;
          g.lineWidth = b.width;
          g.beginPath();
          g.moveTo(x0, y0);
          g.quadraticCurveTo(cx + Math.cos((b.a + a1) / 2) * (d0 + d1) * 0.5, cy + Math.sin((b.a + a1) / 2) * (d0 + d1) * 0.5, x1, y1);
          g.stroke();
        }
        g.restore();
        bloom(warp, 60 + warp * R * 0.4, "200, 170, 255");
      }
    }

    // 4. Las burbujas sobre la trama, en tres planos; una enorme llena la pantalla.
    const bubbleAlpha = span(u, 0.5, 0.6, 0.76, 0.82);
    if (bubbleAlpha > 0 && grid) {
      const p = seg(u, 0.5, 0.82);
      g.save();
      g.globalAlpha = bubbleAlpha;
      g.translate(cx, cy);
      g.scale(1 + p * 0.8, 1 + p * 0.8);
      g.translate(-cx, -cy);
      g.fillStyle = grid;
      g.fillRect(-w, -h, w * 3, h * 3);
      g.restore();
      // Profundidad: la trama se oscurece hacia los bordes.
      g.save();
      g.globalAlpha = bubbleAlpha;
      const vig = g.createRadialGradient(cx, cy, R * 0.2, cx, cy, R);
      vig.addColorStop(0, "rgba(30, 8, 60, 0)");
      vig.addColorStop(1, "rgba(30, 8, 60, 0.6)");
      g.fillStyle = vig;
      g.fillRect(0, 0, w, h);
      for (const depth of [0, 1, 2]) {
        const set = depth === 0 ? far : depth === 1 ? sharp : near;
        const scale = depth === 0 ? 0.55 : depth === 1 ? 1 : 1.9;
        const drift = depth === 0 ? 0.3 : depth === 1 ? 0.6 : 1.1;
        for (const b of balls) {
          if (b.depth !== depth) continue;
          const q = seg(p, b.at * 0.6, b.at * 0.6 + 0.3);
          if (q <= 0) continue;
          const r = b.r * scale * (0.3 + q * 1.4) * (1 + p);
          const x = cx + (b.x - cx) * (1 + p * drift);
          const y = cy + (b.y - cy) * (1 + p * drift);
          g.globalAlpha = bubbleAlpha * (depth === 0 ? 0.6 : depth === 2 ? 0.85 : 1);
          g.drawImage(set[b.tone], x - r * 1.25, y - r * 1.25, r * 2.5, r * 2.5);
        }
      }
      const big = seg(u, 0.66, 0.82);
      if (big > 0) {
        const r = 40 + big * big * R * 1.5;
        g.globalAlpha = bubbleAlpha;
        g.drawImage(near[1], cx - r * 1.25, cy - r * 1.25, r * 2.5, r * 2.5);
      }
      g.restore();
    }

    // 5. El tunel: anillos de luz que vienen hacia ti, el centro cada vez mas blanco.
    const tunnelAlpha = span(u, 0.74, 0.82, 0.9, 0.96);
    if (tunnelAlpha > 0) {
      const p = seg(u, 0.74, 0.96);
      g.save();
      g.globalAlpha = tunnelAlpha;
      const bg = g.createRadialGradient(cx, cy, 0, cx, cy, R);
      bg.addColorStop(0, "#f6ecff");
      bg.addColorStop(0.3, "#b77be0");
      bg.addColorStop(1, "#3a1668");
      g.fillStyle = bg;
      g.fillRect(0, 0, w, h);
      g.globalCompositeOperation = "lighter";
      for (let i = 0; i < 16; i++) {
        const z = (i / 16 + p * 1.4) % 1;
        const r = R * 1.3 * z ** 2.1;
        g.globalAlpha = tunnelAlpha * (0.35 + z * 0.5);
        g.drawImage(rings[i % 3], cx - r, cy - r, r * 2, r * 2);
      }
      g.restore();
      bloom(tunnelAlpha * (0.4 + p * 0.6), 40 + p * p * R * 1.4);
    }

    // 6. Nubes lavanda que se abren y dejan ver la pagina otra vez.
    const fogAlpha = span(u, 0.88, 0.93, 0.93, 1);
    if (fogAlpha > 0) {
      const p = seg(u, 0.88, 1);
      g.save();
      g.globalAlpha = fogAlpha;
      g.fillStyle = "rgba(232, 224, 250, 0.85)";
      g.fillRect(0, 0, w, h);
      for (const f of puffs) {
        const r = f.r * (1 + p * 0.6);
        g.drawImage(fog, f.x + f.dx * p - r, f.y + f.dy * p - r, r * 2, r * 2);
      }
      g.restore();
    }

    // Los destellos que cosen las fases: la luz del principio y cada cambio.
    bloom(1 - seg(u, 0, 0.08), R * 1.2);
    bloom(peak(u, 0.555, 0.06) * 0.9, R * 1.1);
    bloom(peak(u, 0.79, 0.05) * 0.8, R * 1.1);

    // バイツァ・ダスト, mientras se cae al espacio: entra y se va con un halo.
    const title = span(u, 0.1, 0.18, 0.36, 0.46);
    if (title > 0) {
      const size = Math.min(w * 0.11, 120);
      g.save();
      g.globalAlpha = title;
      g.translate(cx, cy);
      g.scale(0.92 + u * 0.3, 0.92 + u * 0.3);
      g.font = `900 ${size}px ${font}`;
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.lineJoin = "round";
      g.shadowColor = "rgba(232, 145, 196, 0.85)";
      g.shadowBlur = size * 0.4;
      g.lineWidth = size * 0.12;
      g.strokeStyle = "#1d1220";
      g.strokeText("バイツァ・ダスト", 0, 0);
      g.shadowBlur = 0;
      g.fillStyle = "#f1a9d2";
      g.fillText("バイツァ・ダスト", 0, 0);
      g.restore();
    }
  }

  const t0 = performance.now();
  let raf = 0;
  const frame = (now: number) => {
    const u = (now - t0) / CUT_MS;
    if (u >= 1 || !canvas.isConnected) {
      canvas.remove();
      return;
    }
    draw(u);
    raf = requestAnimationFrame(frame);
  };
  draw(0);
  raf = requestAnimationFrame(frame);
  return {
    remove: () => {
      cancelAnimationFrame(raf);
      canvas.remove();
    },
  };
}
