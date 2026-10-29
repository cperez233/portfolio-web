/* editorial-ui · Cristian Pérez · cristianperez.me */

import { pickLine } from "@/components/mini-stand/pick";
import { pop } from "@/components/mini-stand/power-kit";
import { impact } from "@/components/mini-stand/powers";
import { POSES } from "@/components/mini-stand/sprite";
import { playSfx } from "@/lib/sfx";
import { ease, type IntroDef } from "./kit";
import { copyPieces } from "./parts";

/*
  Sticky Fingers: el Stand de Bucciarati pone cierres donde golpea y abre
  lo que sea por la mitad. Aqui golpea la pantalla a la altura del nombre:
  aparece un cierre de lado a lado (ジッ), el tirador lo recorre de
  derecha a izquierda (ジィィィッ) y la pagina se abre como una chaqueta.
  Adentro esta lo que no se ve: el mismo nombre en alambre, con sus
  cajas, sus medidas y sus guias, y el codigo que lo arma. Por fuera,
  diseno; por dentro, ingenieria. Despues la cierra a punetazos (アリアリ)
  y se despide: アリーヴェデルチ.

  La capa vive dentro del hero (kit.behind): el retrato y el Stand quedan
  por delante del cierre y no se tapan.
*/
const T = {
  open: 1600,
  punch: 1900,
  unzip: 2350,
  unzipMs: 720,
  widen: 3070,
  widenMs: 520,
  talk: 3700,
  rush: 6850,
  rushHits: 6,
  rushStep: 90,
  close: 6900,
  closeMs: 620,
  bye: 7650,
  last: 8450,
  relay: 9350,
} as const;

/** Un diente cada TOOTH px; el tirador abre del todo a RAMP px de el. */
const TOOTH = 11;
const RAMP = 190;

const esc = (text: string) => text.replace(/[&<>"]/g, (ch) => `&#${ch.charCodeAt(0)};`);

/** Resaltado minimo: comentarios, etiquetas, atributos y cadenas. */
function highlight(line: string) {
  if (/^\s*\/\//.test(line)) return `<i class="sz-c">${esc(line)}</i>`;
  return line.replace(/("[^"]*")|(<\/?)([A-Za-z]+)|( )([a-z]+)(=)|([^"<\s]+|\s+|.)/g, (_, str, open, tag, sp, attr, eq, rest) => {
    if (str) return `<i class="sz-s">${esc(str)}</i>`;
    if (tag) return `${esc(open)}<i class="sz-t">${tag}</i>`;
    if (attr) return `${sp}<i class="sz-a">${attr}</i>${eq}`;
    return esc(rest);
  });
}

export const zipper: IntroDef = {
  start: T.open,
  condense: 10400,
  run(kit) {
    const letters = kit.letters();
    if (!letters.length) return kit.at(T.open + 900, kit.relay);
    const lines = kit.lines.zipper;
    const rects = letters.map((el) => el.getBoundingClientRect());
    const top = Math.min(...rects.map((r) => r.top));
    const bottom = Math.max(...rects.map((r) => r.bottom));
    const left = Math.min(...rects.map((r) => r.left));
    const right = Math.max(...rects.map((r) => r.right));
    const y0 = (top + bottom) / 2;
    const full = Math.min(kit.vh * 0.42, (bottom - top) / 2 + (kit.small ? 30 : 18));
    const { vw } = kit;

    // Lo de adentro: el nombre en alambre, sus guias y el codigo.
    const layer = kit.behind("sz");
    const inside = document.createElement("div");
    inside.className = "sz-inside";
    layer.appendChild(inside);
    const rows = new Map<number, DOMRect[]>();
    letters.forEach((el, i) => {
      const r = rects[i];
      const key = Math.round(r.top / 20);
      rows.set(key, [...(rows.get(key) ?? []), r]);
      const glyph = document.createElement("span");
      glyph.className = el.closest(".hero-name-last") ? "sz-glyph is-last" : "sz-glyph";
      glyph.textContent = el.textContent;
      const css = getComputedStyle(el);
      Object.assign(glyph.style, {
        left: `${r.left}px`,
        top: `${r.top}px`,
        width: `${r.width}px`,
        height: `${r.height}px`,
        fontSize: css.fontSize,
        lineHeight: `${r.height}px`,
        letterSpacing: css.letterSpacing,
      });
      glyph.style.setProperty("--d", `${i * 35}ms`);
      inside.appendChild(glyph);
    });
    // Guias de cada renglon: linea base, altura y la caja con su medida.
    [...rows.values()].forEach((row, i) => {
      const l = Math.min(...row.map((r) => r.left));
      const rr = Math.max(...row.map((r) => r.right));
      const t = Math.min(...row.map((r) => r.top));
      const b = Math.max(...row.map((r) => r.bottom));
      for (const [cls, y] of [
        ["sz-guide", t],
        ["sz-guide is-base", b],
      ] as const) {
        const g = document.createElement("span");
        g.className = cls;
        g.style.top = `${y}px`;
        inside.appendChild(g);
      }
      const tag = document.createElement("span");
      tag.className = "sz-tag";
      tag.innerHTML = `<b>&lt;SlamText&gt;</b> ${Math.round(rr - l)}×${Math.round(b - t)}`;
      tag.style.left = `${Math.max(8, l)}px`;
      tag.style.top = `${i === 0 ? t - 22 : b + 6}px`;
      inside.appendChild(tag);
    });
    const ruler = document.createElement("span");
    ruler.className = "sz-ruler";
    ruler.innerHTML = `<i>${Math.round(right - left)}px</i>`;
    Object.assign(ruler.style, { left: `${left}px`, width: `${right - left}px`, top: `${y0}px` });
    inside.appendChild(ruler);

    const code = document.createElement("pre");
    code.className = "sz-code";
    const roomLeft = left - 40;
    const codeW = roomLeft >= 260 ? Math.min(380, roomLeft) : Math.min(380, vw - 32);
    // La letra que hace caber el renglon mas largo (Fira Code: 0.6em por letra).
    const longest = Math.max(...lines.code.map((text) => text.length));
    const fontPx = Math.min(kit.small ? 11 : 13, (codeW - (kit.small ? 24 : 32)) / (longest * 0.6));
    const lineH = Math.round(fontPx * 1.45);
    const codeH = lines.code.length * lineH + 24;
    // Al lado del nombre si cabe (escritorio); si no, debajo, y la abertura baja hasta el.
    const beside = roomLeft >= 260;
    const down = beside ? 1 : Math.max(1, (bottom + 10 + codeH + 16 - y0) / full);
    Object.assign(code.style, {
      width: `${codeW}px`,
      left: `${roomLeft >= 260 ? 20 : (vw - codeW) / 2}px`,
      top: `${beside ? y0 - codeH / 2 : bottom + 10}px`,
      lineHeight: `${lineH}px`,
      fontSize: `${fontPx.toFixed(2)}px`,
    });
    inside.appendChild(code);
    const codeLines = lines.code.map(() => {
      const row = document.createElement("span");
      row.className = "sz-line";
      code.appendChild(row);
      return row;
    });

    // El cierre: la cinta, los dientes y el tirador.
    const svgNs = "http://www.w3.org/2000/svg";
    const art = document.createElementNS(svgNs, "svg");
    art.setAttribute("class", "sz-art");
    art.setAttribute("width", String(vw));
    art.setAttribute("height", String(kit.vh));
    art.innerHTML =
      `<path class="sz-shade"/><path class="sz-tape"/><path class="sz-teeth"/>` +
      `<g class="sz-slider"><g class="sz-pull"><rect x="-7" y="6" width="14" height="34" rx="6"/><rect class="sz-hole" x="-3" y="26" width="6" height="9" rx="3"/></g>` +
      `<path d="M-22 -13 H14 Q24 -13 24 -3 V3 Q24 13 14 13 H-22 L-30 0 Z"/><circle cx="4" cy="0" r="4" class="sz-hole"/></g>`;
    layer.appendChild(art);
    const shade = art.querySelector<SVGPathElement>(".sz-shade")!;
    const tape = art.querySelector<SVGPathElement>(".sz-tape")!;
    const teeth = art.querySelector<SVGPathElement>(".sz-teeth")!;
    const slider = art.querySelector<SVGGElement>(".sz-slider")!;
    const pull = art.querySelector<SVGGElement>(".sz-pull")!;

    /*
      El estado del cierre: s es el tirador (abre lo que queda a su
      derecha), h el alto de la abertura, y reach hasta donde llegan los
      dientes desde el golpe (al aparecer).
    */
    const state = { s: vw + 60, h: 0, down: 1, reach: 0, from: vw / 2, swing: 0 };
    const gap = (x: number) => {
      const u = Math.min(1, Math.max(0, (x - state.s) / RAMP));
      return state.h * (1 - (1 - u) ** 2.2);
    };
    const draw = () => {
      const pts: [number, number][] = [];
      for (let x = -10; x <= vw + 10; x += 8) pts.push([x, gap(x)]);
      const upper = pts.map(([x, g]) => `${x.toFixed(1)}px ${(y0 - g).toFixed(1)}px`);
      const lower = pts.map(([x, g]) => `${x.toFixed(1)}px ${(y0 + g * state.down).toFixed(1)}px`).reverse();
      inside.style.clipPath = state.h > 0.5 ? `polygon(${upper.join(",")},${lower.join(",")})` : "polygon(0 0, 0 0, 0 0)";
      const edge = (sign: number) => pts.map(([x, g], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${(y0 + sign * (g * (sign > 0 ? state.down : 1) + 7)).toFixed(1)}`).join("");
      const inner = (sign: number) => pts.map(([x, g], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${(y0 + sign * (g * (sign > 0 ? state.down : 1) - 4)).toFixed(1)}`).join("");
      const lo = state.from - state.reach;
      const hi = state.from + state.reach;
      const visible = (d: string) => (state.reach >= vw * 1.2 ? d : "");
      tape.setAttribute("d", state.reach > 0 ? clipEdge(edge(-1), lo, hi) + clipEdge(edge(1), lo, hi) : "");
      shade.setAttribute("d", visible(inner(-1) + inner(1)));
      let d = "";
      for (let x = 0; x <= vw + TOOTH; x += TOOTH) {
        if (x < lo || x > hi) continue;
        const gt = gap(x);
        const gb = gap(x + TOOTH / 2) * state.down;
        d += `M${(x - 3.5).toFixed(1)} ${(y0 - gt - 6).toFixed(1)}h7v9h-7z`;
        d += `M${(x + TOOTH / 2 - 3.5).toFixed(1)} ${(y0 + gb - 3).toFixed(1)}h7v9h-7z`;
      }
      teeth.setAttribute("d", d);
      slider.setAttribute("transform", `translate(${state.s.toFixed(1)} ${y0.toFixed(1)})`);
      pull.setAttribute("transform", `rotate(${state.swing.toFixed(1)})`);
    };
    // La cinta solo entre lo y hi mientras aparece (se recorta por x).
    const clipEdge = (d: string, lo: number, hi: number) =>
      state.reach >= vw * 1.2
        ? d
        : d
            .split(/(?=[ML])/)
            .filter((cmd) => {
              const x = Number(cmd.slice(1).split(" ")[0]);
              return x >= lo && x <= hi;
            })
            .map((cmd, i) => (i ? "L" : "M") + cmd.slice(1))
            .join("");
    draw();
    const hidden: HTMLElement[] = [];
    kit.onCleanup(() => hidden.forEach((el) => el.classList.remove("sz-under")));

    kit.frame("stand", { body: "point", face: "angry" });
    kit.lunge(0.05, 240);
    const hand0 = kit.hand("point");
    if (hand0) kit.shout("スティッキィ・フィンガーズ!", vw / 2, hand0.y - kit.tall() * 0.6, "power-pop-word is-blue is-big", 1200);

    // ドン: el golpe deja el cierre, que corre de lado a lado desde el puno.
    kit.at(T.punch, () => {
      kit.frame("stand", { body: "jab", face: "angry" });
      kit.lunge(0.12, 260);
      const fist = kit.hand("point") ?? { x: vw / 2, y: y0 };
      state.from = Math.min(vw - 20, Math.max(20, fist.x));
      impact(state.from, y0, true);
      kit.shake(kit.small ? 5 : 8, 300);
      pop("ジッ!", Math.min(vw - 60, state.from + 40), y0 - 54, "power-pop-word is-blue is-big", 800);
      playSfx("thud");
      kit.tween(360, (t) => {
        state.reach = t * vw * 1.3;
        draw();
      }, ease.out);
    });

    // ジィィィッ: el tirador corre de derecha a izquierda y la pagina se abre detras.
    kit.at(T.unzip, () => {
      kit.frame("stand", { body: "high", face: "smug" });
      slider.classList.add("is-on");
      playSfx("zip");
      const word = pop("ジィィィッ!", vw - 120, y0 - 70, "power-pop-word is-blue is-big", T.unzipMs + 400);
      kit.tween(
        T.unzipMs,
        (t) => {
          state.s = vw + 40 - t * (vw + RAMP + 100);
          state.h = 30 + 8 * t;
          state.swing = Math.sin(t * 22) * 14;
          word.style.left = `${Math.max(90, state.s + 40)}px`;
          draw();
        },
        ease.inOut,
      );
    });

    // La abertura se agranda hasta mostrar el nombre entero por dentro.
    kit.at(T.widen, () => {
      layer.classList.add("is-open");
      // Lo del copy que queda dentro de la abertura se va con ella.
      const edgeY = y0 + full * down;
      for (const el of copyPieces(kit.stage)) {
        if (el.getBoundingClientRect().top < edgeY) {
          el.classList.add("sz-under");
          hidden.push(el);
        }
      }
      kit.shake(kit.small ? 3 : 5, 200);
      const h0 = state.h;
      kit.tween(
        T.widenMs,
        (t) => {
          state.h = h0 + (full - h0) * t;
          state.down = 1 + (down - 1) * t;
          state.swing *= 0.9;
          draw();
        },
        ease.back,
      );
      // El codigo, renglon por renglon.
      lines.code.forEach((text, i) => {
        kit.later(160 + i * 150, () => {
          codeLines[i].innerHTML = highlight(text) + "\n";
          codeLines[i].classList.add("is-on");
        });
      });
    });

    kit.at(T.talk, () => {
      kit.frame("stand", { body: "idle", face: "happy" });
      kit.talk(pickLine(lines.talk), 1700);
    });

    // アリアリアリ: lo cierra a punetazos, el tirador de vuelta.
    kit.at(T.rush, () => {
      kit.hush();
      for (let i = 0; i < T.rushHits; i++) {
        kit.later(i * T.rushStep, () => {
          kit.frame("stand", { body: i % 2 ? "jabL" : "jab", face: "angry" });
          const x = vw * (0.15 + (0.7 * i) / T.rushHits);
          impact(x, y0 + (i % 2 ? -1 : 1) * state.h * 0.5, false);
          if (i % 2 === 0) pop("アリ", x, Math.max(110, y0 - state.h - 26), "power-pop-word is-blue is-big", 520);
        });
      }
    });
    kit.at(T.close, () => {
      playSfx("zip");
      const h0 = state.h;
      const d0 = state.down;
      kit.later(T.closeMs * 0.5, () => hidden.forEach((el) => el.classList.remove("sz-under")));
      kit.tween(
        T.closeMs,
        (t) => {
          state.s = -RAMP - 60 + t * (vw + RAMP + 120);
          state.h = h0 * (1 - Math.min(1, t * 1.6) * 0.75);
          state.down = 1 + (d0 - 1) * (1 - Math.min(1, t * 1.6));
          state.swing = Math.sin(t * 20) * -12;
          draw();
        },
        ease.inOut,
      );
    });

    // アリーヴェデルチ: el cierre se va y el Stand posa.
    kit.at(T.bye, () => {
      state.h = 0;
      draw();
      layer.classList.add("is-leaving");
      const pose = POSES[Math.floor(Math.random() * POSES.length)];
      kit.frame("stand", { body: pose, face: "smug" });
      kit.lunge(0.08, 300);
      const at = kit.heart();
      kit.shout("アリーヴェデルチ!", vw / 2, (at?.y ?? y0) - kit.tall() * 0.55, "power-pop-word is-blue is-big", 1300);
      kit.shake(kit.small ? 4 : 6, 260);
    });
    kit.at(T.last, () => {
      kit.frame("stand", { face: "wink" });
      kit.talk(pickLine(lines.done), 1000);
    });
    kit.at(T.relay, kit.relay);
  },
};
