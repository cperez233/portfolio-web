/* editorial-ui · Cristian Pérez · cristianperez.me */

import { pickLine } from "@/components/mini-stand/pick";
import { pop, rand } from "@/components/mini-stand/power-kit";
import { impact } from "@/components/mini-stand/powers";
import { playSfx } from "@/lib/sfx";
import { place, type IntroDef } from "./kit";
import { center, movePiece, pieces, type Piece } from "./parts";

/*
  Echoes ACT 3: 3 FREEZE. El Stand golpea el aire y todo lo que hay en
  el hero se vuelve pesadisimo: tiembla un instante y cae como una
  piedra. CRISTIAN se desploma sobre PEREZ, que se aplasta bajo el peso
  y abre un crater; el retrato cae encima; el copy, los botones y hasta
  el menu se estrellan contra el borde de abajo de la pantalla, uno tras
  otro. El golpe fuerte es un cuadro de impacto (negativo), el suelo se
  raja de lado a lado y se levanta polvo. Despues el Stand lo sube todo a
  pulso, sudando (ヨイショ), y PEREZ rebota a su altura.
*/
const T = {
  open: 1600,
  freeze: 1880,
  drop: 2180,
  slam: 2900,
  lift: 4250,
  done: 5700,
  relay: 7100,
} as const;

/* Grietas: desde (x, 0) hacia abajo y a los lados, en zigzag. */
function cracks(width: number, height: number, from: number[], rays: number) {
  const out: string[] = [];
  for (const x0 of from) {
    for (let i = 0; i < rays; i++) {
      let x = x0;
      let y = 2;
      const dir = (i / (rays - 1) - 0.5) * 2;
      let d = `M${x.toFixed(0)} ${y}`;
      const steps = 4 + Math.floor(rand(0, 3));
      for (let s = 0; s < steps; s++) {
        x += (dir * rand(18, 42) + rand(-10, 10)) * Math.min(1, width / 700);
        y += rand(3, 9) * (height / 40);
        d += ` L${Math.min(width, Math.max(0, x)).toFixed(0)} ${Math.min(height, y).toFixed(0)}`;
      }
      out.push(d);
    }
  }
  return out.join(" ");
}

export const echoes: IntroDef = {
  name: "Echoes ACT 3",
  start: T.open,
  condense: 8600,
  run(kit) {
    const { vw, vh, small } = kit;
    const fx = kit.fx("ec-fx");
    const top = kit.letters().filter((el) => el.closest(".hero-name-first"));
    const bottom = kit.letters().filter((el) => el.closest(".hero-name-last"));
    if (!top.length || !bottom.length) return kit.at(T.open + 900, kit.relay);
    const things = pieces(kit.stage);
    const dropped: Animation[] = [];
    const heavy = [...top, ...things.map((p) => p.el)];

    kit.frame("stand", { body: "point", face: "smug" });
    kit.lunge(0.05, 240);
    const hand = kit.hand("point");
    if (hand) pop("エコーズ ACT3", Math.min(vw - 100, Math.max(100, hand.x)), Math.max(110, hand.y - kit.tall() * 0.5), "power-pop-word is-green is-big", 1100);

    // 3 FREEZE: el golpe en el aire, y todo tiembla de lo que pesa.
    kit.at(T.freeze, () => {
      kit.frame("stand", { body: "jab", face: "angry" });
      kit.lunge(0.12, 260);
      const box = top[0].getBoundingClientRect();
      const last = top[top.length - 1].getBoundingClientRect();
      kit.shout("3 FREEZE!!", (box.left + last.right) / 2, box.top - 10, "power-pop-word is-green is-big", 1200);
      playSfx("thud");
      for (const el of heavy) {
        el.classList.add("ec-heavy");
        kit.keep(
          el.animate([{ translate: "0 0" }, { translate: "2px 0" }, { translate: "-2px 1px" }, { translate: "0 0" }], {
            duration: 80,
            iterations: 3,
            composite: "add",
          }),
        );
      }
      // Hasta el aire pesa: ondas verdes desde el puno.
      const fist = kit.hand("point");
      if (fist) {
        for (let i = 0; i < 3; i++) {
          const ring = place(fx, "ec-wave", fist.x, fist.y);
          kit.keep(ring.animate([{ scale: "0.2", opacity: 1 }, { scale: "5", opacity: 0 }], { duration: 520, delay: i * 90, easing: "ease-out", fill: "both" }));
        }
      }
    });
    kit.onCleanup(() => heavy.forEach((el) => el.classList.remove("ec-heavy")));

    const lower = () => bottom.map((el) => el.getBoundingClientRect());
    let lineTop = 0;
    let lineBottom = 0;
    let left = 0;
    let right = 0;

    /** Una pieza cae hasta `d` px mas abajo, con aplaste y rebote. */
    const fall = (piece: Piece, d: number, tilt: number, ms: number) =>
      dropped.push(
        kit.keep(
          movePiece(
            piece,
            [
              { y: 0, r: 0, s: 1 },
              { y: d, r: tilt * 0.4, s: [0.95, 1.07], offset: 0.6, easing: "cubic-bezier(0.2, 0.7, 0.3, 1)" },
              { y: d - Math.min(26, d * 0.06), r: tilt, s: [1.1, 0.86], offset: 0.76 },
              { y: d, r: tilt, s: 1 },
            ],
            { duration: ms, easing: "cubic-bezier(0.55, 0, 0.95, 0.4)", fill: "forwards" },
          ),
        ),
      );

    // Caen: CRISTIAN sobre PEREZ, el retrato encima, el resto al suelo.
    kit.at(T.drop, () => {
      const rows = lower();
      lineTop = Math.min(...rows.map((r) => r.top));
      lineBottom = Math.max(...rows.map((r) => r.bottom));
      left = Math.min(...rows.map((r) => r.left));
      right = Math.max(...rows.map((r) => r.right));
      const lineH = lineBottom - lineTop;
      for (const el of bottom) el.style.transformOrigin = "50% 100%";
      kit.onCleanup(() => bottom.forEach((el) => (el.style.transformOrigin = "")));

      const order = [...top].sort(() => Math.random() - 0.5);
      order.forEach((el, i) => {
        const r = el.getBoundingClientRect();
        const d = Math.max(0, lineTop - r.bottom) + lineH * rand(0.4, 0.5) + r.height * 0.06;
        kit.later(i * 70, () => fall({ el, nav: false }, d, rand(-12, 12), 400));
        kit.later(i * 70 + 250, () => {
          kit.shake(small ? 3 : 5, 140);
          if (i % 3 === 0) pop("ズン", r.left + r.width / 2 + rand(-20, 20), lineBottom + 20, "power-pop-word is-green", 700);
        });
      });
      // PEREZ se aplasta con el primer golpe.
      kit.later(250, () => {
        for (const el of bottom) kit.keep(el.animate([{ scale: "1" }, { scale: "1.08 0.64" }], { duration: 140, easing: "cubic-bezier(0.2, 0.9, 0.3, 1)", fill: "forwards" }));
        playSfx("thud");
      });

      // El resto: al borde de abajo de la pantalla, de arriba hacia abajo en orden.
      const floor = vh - (small ? 10 : 14);
      [...things]
        .sort((a, b) => center(a.el).y - center(b.el).y)
        .forEach((piece, i) => {
          const r = piece.el.getBoundingClientRect();
          const photo = piece.el.classList.contains("hero-paste");
          const d = photo ? Math.max(0, lineBottom - r.bottom - lineH * 0.18) : Math.max(0, floor - r.bottom - rand(0, 30));
          const delay = piece.nav ? 520 : 120 + i * 55;
          kit.later(delay, () => fall(piece, d, piece.nav ? rand(-8, 8) : rand(-16, 16), piece.nav ? 620 : 460 + d * 0.25));
          kit.later(delay + (piece.nav ? 620 : 460 + d * 0.25) * 0.6, () => {
            if (i % 2 === 0 || piece.nav) impact(r.left + r.width / 2, Math.min(vh - 20, r.bottom + d), false);
          });
        });
    });

    // El golpe fuerte: negativo, crater, grietas de lado a lado y polvo.
    kit.at(T.slam, () => {
      const flash = kit.fx("dust-flash");
      kit.later(150, () => flash.remove());
      for (const el of bottom) kit.keep(el.animate([{ scale: "1.08 0.64" }, { scale: "1.14 0.54" }], { duration: 120, easing: "ease-out", fill: "forwards" }));
      kit.shout("ズシィン!!", (left + right) / 2, lineBottom + (small ? 50 : 70), "power-pop-word is-green is-big", 1300);
      kit.shake(small ? 12 : 20, 600);
      playSfx("boom");
      kit.frame("stand", { body: "idle", face: "shock" });

      const width = Math.round(right - left + 120);
      const crater = place(fx, "ec-ground", left - 60, lineBottom - 4);
      crater.style.width = `${width}px`;
      const deep = small ? 44 : 80;
      crater.innerHTML = `<svg width="${width}" height="${deep}" viewBox="0 0 ${width} ${deep}"><path class="ec-floor" d="M0 3 Q${width / 2} 16 ${width} 3"/><path class="ec-crack" d="${cracks(width, deep, [width * 0.2, width * 0.5, width * 0.8], small ? 3 : 4)}"/></svg>`;
      const ground = place(fx, "ec-ground is-floor", 0, vh - 46);
      ground.style.width = `${vw}px`;
      ground.innerHTML = `<svg width="${vw}" height="46" viewBox="0 0 ${vw} 46"><path class="ec-crack" d="${cracks(vw, 46, [vw * 0.15, vw * 0.4, vw * 0.65, vw * 0.88], 3)}" transform="translate(0 46) scale(1 -1)"/></svg>`;

      // Polvo a los lados del crater.
      const smoke = place(fx, "dust-smoke ec-dust", 0, 0);
      for (let i = 0; i < (small ? 8 : 14); i++) {
        const side = i % 2 ? 1 : -1;
        const x = (left + right) / 2 + side * rand(0.1, 0.5) * (right - left);
        const puff = place(smoke, i % 3 ? "dust-puff" : "dust-puff is-dark", x, lineBottom);
        const s = rand(small ? 40 : 60, small ? 80 : 120);
        puff.style.width = puff.style.height = `${s.toFixed(0)}px`;
        kit.keep(
          puff.animate(
            [
              { translate: "-50% -50%", scale: "0.2" },
              { translate: `calc(-50% + ${(side * rand(40, 140)).toFixed(0)}px) calc(-50% - ${rand(10, 50).toFixed(0)}px)`, scale: "1" },
            ],
            { duration: 700, easing: "cubic-bezier(0.1, 0.8, 0.3, 1)", fill: "both" },
          ),
        );
      }
      kit.later(1100, () => smoke.classList.add("is-leaving"));
    });

    // ヨイショ: el Stand lo sube todo a pulso, sudando.
    kit.at(T.lift, () => {
      kit.frame("sweat", { body: "arms" });
      kit.talk(pickLine(kit.lines.echoes.strain), 1000);
      const at = kit.heart();
      if (at) pop("ヨイショ!", at.x, Math.max(110, at.y - kit.tall() * 0.62), "power-pop-word is-green is-big", 1000);
      kit.keep(kit.stage.animate([{ translate: "0 0" }, { translate: "0 3px" }, { translate: "0 0" }], { duration: 300, iterations: 3 }));
      // Cada pieza vuelve, la ultima en caer primero.
      [...dropped].reverse().forEach((a, i) => {
        kit.later(220 + i * 45, () => {
          a.playbackRate = -1.6;
          a.play();
        });
      });
      const freed = 220 + dropped.length * 45 + 260;
      kit.later(freed, () => {
        for (const el of bottom) {
          kit.keep(
            el.animate([{ scale: "1.14 0.54" }, { scale: "0.94 1.14", offset: 0.45 }, { scale: "1.02 0.98", offset: 0.75 }, { scale: "1" }], {
              duration: 520,
              easing: "ease-out",
              fill: "forwards",
            }),
          );
        }
        fx.querySelectorAll(".ec-ground").forEach((el) => el.classList.add("is-leaving"));
        heavy.forEach((el) => el.classList.remove("ec-heavy"));
      });
    });

    // Sin frase aqui: el chico remata al llegar (mini-stand.tsx).
    kit.at(T.done, () => kit.frame("stand", { body: "high", face: "happy" }));
    kit.at(T.relay, kit.relay);
  },
};
