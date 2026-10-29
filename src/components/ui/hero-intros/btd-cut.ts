/* editorial-ui · Cristian Pérez · cristianperez.me */

/*
  La activacion de Bites the Dust, antes del rebobinado, como la ultima
  vez que Kira la dispara en el anime (Diamond is Unbreakable, ep. 37):
  despues de la explosion el tiempo se lo traga todo y la pantalla entera
  hace un viaje hacia atras, en este orden:

  1. un destello blanco, y la oscuridad se cierra sobre la pagina;
  2. el espacio: una nebulosa verde, amarilla y violeta que gira, y las
     estrellas cayendo hacia el centro, cada vez mas rapido;
  3. haces de luz que convergen en una estrella blanca;
  4. un campo de burbujas rosas y violetas sobre una trama de puntos, que
     se multiplican hasta que una enorme llena la pantalla;
  5. un tunel de anillos violetas, con el centro cada vez mas blanco;
  6. nubes lavanda que se abren: el tiempo volvio y empieza la cinta.

  Encima, al principio, バイツァ・ダスト. Todo en un canvas, como funcion del
  tiempo; lo pesado (la nebulosa, las burbujas, la trama, las nubes) se
  pinta una vez y despues solo se estampa. Lo usan la entrada del hero
  (dust.ts) y el poder del mini Stand (powers.ts). Se quita solo al acabar.
*/

/** Lo que dura la activacion, hasta que arranca la cinta. */
export const CUT_MS = 2600;

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const clamp = (v: number) => Math.max(0, Math.min(1, v));
/** De 0 a 1 entre a y b. */
const seg = (u: number, a: number, b: number) => clamp((u - a) / (b - a));
/** Sube entre a y b, se queda, y baja entre c y d. */
const span = (u: number, a: number, b: number, c: number, d: number) => Math.min(seg(u, a, b), 1 - seg(u, c, d));

function sprite(size: number, paint: (g: CanvasRenderingContext2D, s: number) => void) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  paint(c.getContext("2d")!, size);
  return c;
}

/** La nebulosa: nubes de color que se pisan, vetas oscuras y polvo de estrellas. */
function nebula(size: number) {
  return sprite(size, (g, s) => {
    g.fillStyle = "#07050d";
    g.fillRect(0, 0, s, s);
    const colors = ["#3f8a2a", "#c9b23a", "#e3a32f", "#9a2f8f", "#2f3f9e", "#6b3fa0", "#55a83a"];
    g.globalCompositeOperation = "screen";
    for (let i = 0; i < 16; i++) {
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
    for (let i = 0; i < 1100; i++) {
      g.fillStyle = `rgba(255, ${Math.round(rand(220, 255))}, ${Math.round(rand(200, 255))}, ${rand(0.3, 1).toFixed(2)})`;
      g.fillRect(rand(0, s), rand(0, s), rand(0.6, 2), rand(0.6, 2));
    }
  });
}

/** Una burbuja: rosa, violeta o azul, con volumen, borde claro y brillo. */
function bubble(tone: [string, string, string]) {
  return sprite(128, (g, s) => {
    const h = s / 2;
    const grad = g.createRadialGradient(h * 0.75, h * 0.7, h * 0.05, h, h, h * 0.96);
    grad.addColorStop(0, tone[0]);
    grad.addColorStop(0.55, tone[1]);
    grad.addColorStop(1, tone[2]);
    g.fillStyle = grad;
    g.beginPath();
    g.arc(h, h, h * 0.96, 0, Math.PI * 2);
    g.fill();
    // Manchas por dentro, como en el anime.
    for (let i = 0; i < 5; i++) {
      g.fillStyle = "rgba(40, 10, 80, 0.28)";
      g.beginPath();
      g.arc(h + rand(-0.4, 0.4) * h, h + rand(-0.4, 0.4) * h, rand(0.1, 0.24) * h, 0, Math.PI * 2);
      g.fill();
    }
    g.strokeStyle = "rgba(255, 230, 255, 0.55)";
    g.lineWidth = s * 0.03;
    g.beginPath();
    g.arc(h, h, h * 0.9, 0, Math.PI * 2);
    g.stroke();
    g.fillStyle = "rgba(255, 255, 255, 0.75)";
    g.beginPath();
    g.ellipse(h * 0.62, h * 0.55, h * 0.18, h * 0.11, -0.6, 0, Math.PI * 2);
    g.fill();
  });
}

/** La trama de puntos violeta del fondo de las burbujas. */
function dots() {
  return sprite(22, (g, s) => {
    g.fillStyle = "#4a1f78";
    g.fillRect(0, 0, s, s);
    const grad = g.createRadialGradient(s * 0.42, s * 0.4, 1, s / 2, s / 2, s * 0.36);
    grad.addColorStop(0, "#c58be8");
    grad.addColorStop(1, "#22093f");
    g.fillStyle = grad;
    g.beginPath();
    g.arc(s / 2, s / 2, s * 0.36, 0, Math.PI * 2);
    g.fill();
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
      grad.addColorStop(0, "rgba(250, 246, 255, 0.95)");
      grad.addColorStop(0.7, "rgba(214, 200, 245, 0.7)");
      grad.addColorStop(1, "rgba(214, 200, 245, 0)");
      g.fillStyle = grad;
      g.beginPath();
      g.arc(x, y, r, 0, Math.PI * 2);
      g.fill();
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
  const bubbles = [
    bubble(["#fbd2f2", "#d06ad0", "#5a1f8a"]),
    bubble(["#e8c2ff", "#9a4fd8", "#3a1268"]),
    bubble(["#d6dcff", "#6a5ae0", "#24135e"]),
  ];
  const grid = g.createPattern(dots(), "repeat");
  const fog = cloud();
  const font = getComputedStyle(document.documentElement).getPropertyValue("--font-jp").trim() || "sans-serif";

  const stars = Array.from({ length: w < 640 ? 160 : 260 }, () => ({
    a: rand(0, Math.PI * 2),
    d: rand(0, 1),
    v: rand(0.8, 2.2),
    size: rand(0.8, 2.4),
    tint: Math.random() < 0.25 ? "#ffd27a" : Math.random() < 0.3 ? "#bfe7ff" : "#ffffff",
  }));
  const beams = Array.from({ length: 70 }, () => ({
    a: rand(0, Math.PI * 2),
    v: rand(0.6, 1.4),
    width: rand(1, 5),
    color: ["#ffffff", "#bfe7ff", "#f4b8ff", "#ffd27a", "#9f8cff"][Math.floor(rand(0, 5))],
    curve: rand(-0.35, 0.35),
  }));
  const balls = Array.from({ length: w < 640 ? 40 : 64 }, () => ({
    x: rand(-0.05, 1.05) * w,
    y: rand(-0.05, 1.05) * h,
    r: rand(14, 70),
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

  function draw(u: number) {
    g.globalCompositeOperation = "source-over";
    g.globalAlpha = 1;
    g.clearRect(0, 0, w, h);

    // 1-3. El espacio: se cierra sobre la pagina desde los bordes.
    const spaceAlpha = span(u, 0, 0.08, 0.55, 0.62);
    if (spaceAlpha > 0) {
      g.save();
      g.globalAlpha = spaceAlpha;
      // Se cierra como una iris oscura que crece desde los bordes hacia dentro.
      const close = seg(u, 0, 0.1);
      if (close < 1) {
        g.beginPath();
        g.rect(0, 0, w, h);
        g.arc(cx, cy, R * (1 - close) * 1.05, 0, Math.PI * 2, true);
        g.clip("evenodd");
      }
      g.translate(cx, cy);
      g.rotate(-u * 1.1);
      const zoom = 1 + u * 0.9;
      g.scale(zoom, zoom);
      g.drawImage(space, -N / 2, -N / 2);
      g.restore();

      // Las estrellas caen hacia el centro, cada vez mas rapido y mas largas.
      g.save();
      g.globalAlpha = spaceAlpha;
      g.lineCap = "round";
      const speed = 0.4 + seg(u, 0.15, 0.55) * 2.4;
      for (const s of stars) {
        const d = ((s.d - u * s.v * speed + 10) % 1) * R * 1.15;
        const len = 2 + seg(u, 0.2, 0.55) * 60 * (d / R);
        g.strokeStyle = s.tint;
        g.lineWidth = s.size;
        g.beginPath();
        g.moveTo(cx + Math.cos(s.a) * d, cy + Math.sin(s.a) * d);
        g.lineTo(cx + Math.cos(s.a) * (d + len), cy + Math.sin(s.a) * (d + len));
        g.stroke();
      }
      g.restore();

      // Los haces de luz convergen en una estrella blanca.
      const warp = span(u, 0.3, 0.42, 0.56, 0.62);
      if (warp > 0) {
        g.save();
        g.globalCompositeOperation = "lighter";
        g.globalAlpha = warp * 0.8;
        g.lineCap = "round";
        for (const b of beams) {
          const p = seg(u, 0.3, 0.6) * b.v;
          const d0 = R * (1.2 - p * 0.9);
          const d1 = Math.max(0, d0 - R * 0.5);
          const a0 = b.a;
          const a1 = b.a + b.curve;
          g.strokeStyle = b.color;
          g.lineWidth = b.width;
          g.beginPath();
          g.moveTo(cx + Math.cos(a0) * d0, cy + Math.sin(a0) * d0);
          g.quadraticCurveTo(cx + Math.cos((a0 + a1) / 2) * (d0 + d1) * 0.5, cy + Math.sin((a0 + a1) / 2) * (d0 + d1) * 0.5, cx + Math.cos(a1) * d1, cy + Math.sin(a1) * d1);
          g.stroke();
        }
        const glow = 40 + warp * R * 0.35;
        const grad = g.createRadialGradient(cx, cy, 0, cx, cy, glow);
        grad.addColorStop(0, "rgba(255, 255, 255, 1)");
        grad.addColorStop(0.25, "rgba(240, 220, 255, 0.8)");
        grad.addColorStop(1, "rgba(160, 120, 255, 0)");
        g.fillStyle = grad;
        g.fillRect(cx - glow, cy - glow, glow * 2, glow * 2);
        g.restore();
      }
    }

    // 4. Las burbujas, sobre la trama de puntos; una enorme llena la pantalla.
    const bubbleAlpha = span(u, 0.55, 0.6, 0.76, 0.8);
    if (bubbleAlpha > 0 && grid) {
      const p = seg(u, 0.55, 0.8);
      g.save();
      g.globalAlpha = bubbleAlpha;
      g.translate(cx, cy);
      g.scale(1 + p * 0.8, 1 + p * 0.8);
      g.translate(-cx, -cy);
      g.fillStyle = grid;
      g.fillRect(-w, -h, w * 3, h * 3);
      g.restore();
      g.save();
      g.globalAlpha = bubbleAlpha;
      for (const b of balls) {
        const q = seg(p, b.at * 0.6, b.at * 0.6 + 0.3);
        if (q <= 0) continue;
        const r = b.r * (0.3 + q * 1.4) * (1 + p);
        const x = cx + (b.x - cx) * (1 + p * 0.6);
        const y = cy + (b.y - cy) * (1 + p * 0.6);
        g.drawImage(bubbles[b.tone], x - r, y - r, r * 2, r * 2);
      }
      const big = seg(u, 0.68, 0.8);
      if (big > 0) {
        const r = 40 + big * big * R * 1.4;
        g.drawImage(bubbles[1], cx - r, cy - r, r * 2, r * 2);
      }
      g.restore();
    }

    // 5. El tunel: anillos que vienen hacia ti, el centro cada vez mas blanco.
    const tunnelAlpha = span(u, 0.76, 0.8, 0.92, 0.96);
    if (tunnelAlpha > 0) {
      const p = seg(u, 0.76, 0.96);
      g.save();
      g.globalAlpha = tunnelAlpha;
      const bg = g.createRadialGradient(cx, cy, 0, cx, cy, R);
      bg.addColorStop(0, "#f6ecff");
      bg.addColorStop(0.3, "#b77be0");
      bg.addColorStop(1, "#3a1668");
      g.fillStyle = bg;
      g.fillRect(0, 0, w, h);
      for (let i = 0; i < 16; i++) {
        const z = (i / 16 + p * 1.6) % 1;
        const r = R * 1.25 * z ** 2.2;
        g.strokeStyle = i % 3 === 0 ? "rgba(255, 255, 255, 0.8)" : i % 3 === 1 ? "rgba(236, 150, 230, 0.75)" : "rgba(120, 70, 190, 0.8)";
        g.lineWidth = 3 + z * 34;
        g.beginPath();
        g.arc(cx, cy, r, 0, Math.PI * 2);
        g.stroke();
      }
      const core = 30 + p * p * R * 1.3;
      const grad = g.createRadialGradient(cx, cy, 0, cx, cy, core);
      grad.addColorStop(0, "rgba(255, 255, 255, 1)");
      grad.addColorStop(0.6, "rgba(246, 236, 255, 0.85)");
      grad.addColorStop(1, "rgba(246, 236, 255, 0)");
      g.fillStyle = grad;
      g.fillRect(0, 0, w, h);
      g.restore();
    }

    // 6. Nubes lavanda que se abren y dejan ver la pagina otra vez.
    const fogAlpha = span(u, 0.9, 0.94, 0.94, 1);
    if (fogAlpha > 0) {
      const p = seg(u, 0.9, 1);
      g.save();
      g.globalAlpha = fogAlpha;
      g.fillStyle = "rgba(232, 224, 250, 0.9)";
      g.fillRect(0, 0, w, h);
      for (const f of puffs) {
        const r = f.r * (1 + p * 0.5);
        g.drawImage(fog, f.x + f.dx * p - r, f.y + f.dy * p - r, r * 2, r * 2);
      }
      g.restore();
    }

    // El destello del principio.
    const flash = 1 - seg(u, 0, 0.06);
    if (flash > 0) {
      g.fillStyle = `rgba(255, 246, 255, ${flash.toFixed(3)})`;
      g.fillRect(0, 0, w, h);
    }

    // バイツァ・ダスト, mientras se cae al espacio.
    const title = span(u, 0.06, 0.12, 0.4, 0.5);
    if (title > 0) {
      const size = Math.min(w * 0.11, 120);
      g.save();
      g.globalAlpha = title;
      g.translate(cx, cy);
      g.scale(1 + u * 0.25, 1 + u * 0.25);
      g.font = `900 ${size}px ${font}`;
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.lineJoin = "round";
      g.lineWidth = size * 0.14;
      g.strokeStyle = "#161418";
      g.strokeText("バイツァ・ダスト", 0, 0);
      g.fillStyle = "#e891c4";
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
