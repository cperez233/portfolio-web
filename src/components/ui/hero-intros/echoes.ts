/* editorial-ui · Cristian Pérez · cristianperez.me */

import { pickLine } from "@/components/mini-stand/pick";
import { pop, rand } from "@/components/mini-stand/power-kit";
import { place, type IntroDef } from "./kit";

/*
  Echoes ACT 3: 3 FREEZE. El Stand apunta al nombre y CRISTIAN se vuelve
  pesadisimo: cada letra tiembla un instante y cae como una piedra encima
  de PEREZ, que se aplasta bajo el peso (ズン). El suelo se agrieta debajo.
  Entonces el Stand se pone a levantarlo a pulso, sudando (ヨイショ): las
  letras suben una a una y PEREZ rebota a su altura.
*/
const T = {
  open: 1600,
  freeze: 1900,
  drop: 2150,
  lift: 3650,
  done: 5000,
  relay: 6700,
} as const;

/* Grietas de suelo bajo la linea de abajo: tinta en zigzag. */
function floorCracks(width: number) {
  const lines: string[] = [];
  const n = Math.max(5, Math.round(width / 70));
  for (let i = 0; i < n; i++) {
    let x = (i + rand(0.2, 0.8)) * (width / n);
    let y = 2;
    let d = `M${x.toFixed(0)} ${y}`;
    const steps = 3;
    for (let s = 0; s < steps; s++) {
      x += rand(-14, 14);
      y += rand(6, 12);
      d += ` L${x.toFixed(0)} ${y.toFixed(0)}`;
    }
    lines.push(d);
  }
  return `<svg width="${width}" height="44" viewBox="0 0 ${width} 44"><path d="M0 2 H${width}" class="ec-floor"/><path d="${lines.join(" ")}" class="ec-crack"/></svg>`;
}

export const echoes: IntroDef = {
  start: T.open,
  condense: 8200,
  run(kit) {
    const fx = kit.fx("ec-fx");
    const top = kit.letters().filter((el) => el.closest(".hero-name-first"));
    const bottom = kit.letters().filter((el) => el.closest(".hero-name-last"));
    if (!top.length || !bottom.length) return kit.at(T.open + 900, kit.relay);
    const dropped: { el: HTMLElement; d: number; r: number }[] = [];

    kit.frame("stand", { body: "point", face: "smug" });
    kit.lunge(0.05, 240);
    const hand = kit.hand("point");
    if (hand) pop("エコーズ ACT3", hand.x, hand.y - kit.tall() * 0.5, "power-pop-word is-green", 1100);

    kit.at(T.freeze, () => {
      const box = top[0].getBoundingClientRect();
      const last = top[top.length - 1].getBoundingClientRect();
      kit.shout("3 FREEZE!!", (box.left + last.right) / 2, box.top - 10, "power-pop-word is-green is-big", 1200);
      // Pesan: tiemblan antes de caer.
      for (const el of top) {
        el.classList.add("ec-heavy");
        kit.keep(
          el.animate(
            [{ translate: "0 0" }, { translate: "1.5px 0" }, { translate: "-1.5px 1px" }, { translate: "0 0" }],
            { duration: 90, iterations: 3, easing: "linear" },
          ),
        );
      }
    });

    // Caen en desorden, una tras otra, y aplastan la linea de abajo.
    kit.at(T.drop, () => {
      const order = [...top].sort(() => Math.random() - 0.5);
      const lower = bottom.map((el) => el.getBoundingClientRect());
      const lineTop = Math.min(...lower.map((r) => r.top));
      const lineBottom = Math.max(...lower.map((r) => r.bottom));
      const lineH = lineBottom - lineTop;
      const left = Math.min(...lower.map((r) => r.left));
      const right = Math.max(...lower.map((r) => r.right));
      for (const el of bottom) el.style.transformOrigin = "50% 100%";
      kit.onCleanup(() => bottom.forEach((el) => (el.style.transformOrigin = "")));

      order.forEach((el, i) => {
        const r = el.getBoundingClientRect();
        // Hasta medio cuerpo dentro de PEREZ, ya aplastado.
        const d = Math.max(0, lineTop - r.bottom) + lineH * rand(0.36, 0.44) + r.height * 0.06;
        const tilt = rand(-9, 9);
        dropped.push({ el, d, r: tilt });
        kit.later(i * 85, () => {
          kit.keep(
            el.animate(
              [
                { translate: "0 0", rotate: "0deg", scale: "1" },
                { translate: `0 ${d.toFixed(0)}px`, rotate: `${(tilt * 0.4).toFixed(1)}deg`, scale: "0.96 1.06", offset: 0.62, easing: "cubic-bezier(0.2, 0.7, 0.3, 1)" },
                { translate: `0 ${(d * 0.92).toFixed(0)}px`, rotate: `${tilt.toFixed(1)}deg`, scale: "1.08 0.9", offset: 0.78 },
                { translate: `0 ${d.toFixed(0)}px`, rotate: `${tilt.toFixed(1)}deg`, scale: "1" },
              ],
              { duration: 380, easing: "cubic-bezier(0.55, 0, 0.95, 0.4)", fill: "forwards" },
            ),
          );
        });
        kit.later(i * 85 + 240, () => {
          kit.shake(kit.small ? 3 : 5, 160);
          if (i % 3 === 0) pop("ズン", r.left + r.width / 2 + rand(-20, 20), lineBottom + 18, "power-pop-word is-green", 700);
        });
      });

      // PEREZ se aplasta con el primer golpe y un poco mas con el ultimo.
      kit.later(240, () => {
        for (const el of bottom) {
          kit.keep(el.animate([{ scale: "1" }, { scale: "1.08 0.66" }], { duration: 140, easing: "cubic-bezier(0.2, 0.9, 0.3, 1)", fill: "forwards" }));
        }
        const floor = place(fx, "ec-ground", left, lineBottom - 2, floorCracks(Math.round(right - left)));
        floor.style.width = `${Math.round(right - left)}px`;
      });
      const lastHit = (order.length - 1) * 85 + 240;
      kit.later(lastHit, () => {
        for (const el of bottom) kit.keep(el.animate([{ scale: "1.08 0.66" }, { scale: "1.12 0.58" }], { duration: 120, easing: "ease-out", fill: "forwards" }));
        kit.shout("ズシィン!!", (left + right) / 2, lineBottom + 40, "power-pop-word is-green is-big", 1100);
        kit.shake(kit.small ? 8 : 12, 420);
        kit.frame("stand", { body: "idle", face: "shock" });
      });
    });

    // ヨイショ: el Stand lo levanta a pulso, sudando.
    kit.at(T.lift, () => {
      kit.frame("sweat", { body: "arms" });
      kit.talk(pickLine(kit.lines.echoes.strain), 900);
      const hand = kit.heart();
      if (hand) pop("ヨイショ!", hand.x, hand.y - kit.tall() * 0.62, "power-pop-word is-green is-big", 1000);
      kit.keep(kit.stage.animate([{ translate: "0 0" }, { translate: "0 3px" }, { translate: "0 0" }], { duration: 300, iterations: 2 }));
      dropped.forEach(({ el, d, r }, i) => {
        kit.later(260 + i * 70, () => {
          kit.keep(
            el.animate(
              [
                { translate: `0 ${d.toFixed(0)}px`, rotate: `${r.toFixed(1)}deg`, scale: "1" },
                { translate: `0 ${(-d * 0.08).toFixed(0)}px`, rotate: "0deg", scale: "0.96 1.05", offset: 0.75 },
                { translate: "0 0", rotate: "0deg", scale: "1" },
              ],
              { duration: 520, easing: "cubic-bezier(0.3, 0.6, 0.3, 1)", fill: "forwards" },
            ),
          );
        });
      });
      const freed = 260 + dropped.length * 70 + 200;
      kit.later(freed, () => {
        for (const el of bottom) {
          kit.keep(
            el.animate([{ scale: "1.12 0.58" }, { scale: "0.94 1.14", offset: 0.45 }, { scale: "1.02 0.98", offset: 0.75 }, { scale: "1" }], {
              duration: 520,
              easing: "ease-out",
              fill: "forwards",
            }),
          );
        }
        fx.querySelector(".ec-ground")?.classList.add("is-leaving");
        top.forEach((el) => el.classList.remove("ec-heavy"));
      });
    });
    kit.onCleanup(() => top.forEach((el) => el.classList.remove("ec-heavy")));

    kit.at(T.done, () => {
      kit.frame("stand", { body: "high", face: "happy" });
      kit.talk(pickLine(kit.lines.echoes.done), 1100);
    });
    kit.at(T.relay, kit.relay);
  },
};
