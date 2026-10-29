/* editorial-ui · Cristian Pérez · cristianperez.me */

import { pickLine } from "@/components/mini-stand/pick";
import { pop, rand } from "@/components/mini-stand/power-kit";
import { impact, KILLER_QUEEN } from "@/components/mini-stand/powers";
import { playSfx } from "@/lib/sfx";
import { place, type IntroDef } from "./kit";
import { replayEntrance, rewindEntrance } from "./entrance";

/*
  Bites the Dust: Killer Queen sale de la mano del Stand, se posa sobre
  una letra del nombre y カチッ: el nombre explota, las letras salen
  volando y el retrato se tuerce. Entonces la cinta se rebobina de verdad:
  las letras vuelven por donde salieron y la entrada entera corre al reves
  (las mismas animaciones CSS, con velocidad negativa) hasta el primer
  cuadro, y se vuelve a reproducir. Lo que viste, lo ves otra vez.
  El Stand se burla del deja vu.
*/
const T = {
  open: 1600,
  fly: 1700,
  click: 2380,
  boom: 2700,
  rewind: 3350,
  replay: 4150,
  first: 5600,
  second: 6700,
  relay: 7900,
} as const;

/* Estallido de manga: nube de picos en crema y rosa, con tinta. */
function burst(size: number) {
  const spikes = 14;
  const outer: string[] = [];
  const inner: string[] = [];
  for (let i = 0; i < spikes * 2; i++) {
    const a = (i / (spikes * 2)) * Math.PI * 2;
    const r = i % 2 ? rand(0.5, 0.62) : rand(0.88, 1);
    outer.push(`${(50 + Math.cos(a) * 48 * r).toFixed(1)},${(50 + Math.sin(a) * 48 * r).toFixed(1)}`);
    inner.push(`${(50 + Math.cos(a) * 30 * r).toFixed(1)},${(50 + Math.sin(a) * 30 * r).toFixed(1)}`);
  }
  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}"><polygon points="${outer.join(" ")}" fill="#e891c4" stroke="#161418" stroke-width="2.4" stroke-linejoin="round"/><polygon points="${inner.join(" ")}" fill="#ece6d8" stroke="#161418" stroke-width="1.6" stroke-linejoin="round"/></svg>`;
}

export const dust: IntroDef = {
  start: T.open,
  condense: 9500,
  run(kit) {
    const first = pickLine(kit.lines.dust.map(([a]) => a));
    const second = kit.lines.dust.find(([a]) => a === first)?.[1] ?? "";
    const letters = kit.letters();
    // La letra del medio del nombre: la que mas se ve.
    const target = letters[Math.max(0, Math.floor(letters.length * 0.3))] ?? null;
    const fx = kit.fx("dust-fx");
    const blown: Animation[] = [];

    kit.frame("stand", { body: "point", face: "smug" });
    kit.lunge(0.05, 240);
    const hand = kit.hand("point");
    if (hand) pop("キラークイーン", hand.x, hand.y - kit.tall() * 0.55, "power-pop-word is-pink", 1200);

    // Killer Queen vuela de la mano a la letra, en arco, y se posa encima.
    const size = kit.small ? 64 : 96;
    let kq: HTMLElement | null = null;
    let spot = { x: kit.vw / 2, y: kit.vh * 0.4 };
    kit.at(T.fly, () => {
      const from = kit.hand("point");
      const box = target?.getBoundingClientRect();
      if (!from || !box) return;
      spot = { x: box.left + box.width / 2, y: box.top + box.height * 0.14 };
      kq = place(fx, "dust-kq", spot.x, spot.y - size * 0.45, KILLER_QUEEN);
      kq.style.width = kq.style.height = `${size}px`;
      const dx = from.x - spot.x;
      const dy = from.y - (spot.y - size * 0.45);
      kit.keep(
        kq.animate(
          [
            { translate: `${dx}px ${dy}px`, scale: "0.4", rotate: "0deg" },
            { translate: `${dx * 0.45}px ${dy * 0.45 - 120}px`, scale: "1.1", rotate: "200deg", offset: 0.55 },
            { translate: "0 0", scale: "1", rotate: "360deg" },
          ],
          { duration: 620, easing: "cubic-bezier(0.45, 0, 0.3, 1)", fill: "both" },
        ),
      );
    });

    // カチッ: aprieta el interruptor.
    kit.at(T.click, () => {
      kit.frame("stand", { body: "point", face: "laugh" });
      if (kq) kit.keep(kq.animate([{ scale: "1" }, { scale: "1.25 0.7" }, { scale: "1" }], { duration: 220, easing: "ease-out" }));
      kit.shout("カチッ", spot.x + 60, spot.y - 70, "power-pop-word is-pink is-big", 900);
      playSfx("crack");
    });

    // Explota: las letras salen volando desde la letra, el retrato se tuerce.
    kit.at(T.boom, () => {
      kq?.remove();
      const boom = place(fx, "dust-boom", spot.x, spot.y, burst(kit.small ? 300 : 520));
      kit.keep(
        boom.animate(
          [
            { scale: "0.1", opacity: 1 },
            { scale: "1", opacity: 1, offset: 0.35 },
            { scale: "1.15", opacity: 0 },
          ],
          { duration: 620, easing: "cubic-bezier(0.2, 0.9, 0.3, 1)", fill: "forwards" },
        ),
      );
      impact(spot.x, spot.y, true);
      kit.shout("ドカーン!", spot.x, spot.y - (kit.small ? 120 : 170), "power-pop-word is-pink is-big", 1200);
      kit.shake(kit.small ? 8 : 14, 520);
      playSfx("thud");
      const push = kit.small ? 150 : 320;
      for (const el of kit.letters()) {
        const r = el.getBoundingClientRect();
        const ux = r.left + r.width / 2 - spot.x;
        const uy = r.top + r.height / 2 - spot.y;
        const d = Math.max(40, Math.hypot(ux, uy));
        const force = push * Math.min(1.4, 260 / d + 0.45);
        blown.push(
          kit.keep(
            el.animate(
              [
                { translate: "0 0", rotate: "0deg" },
                { translate: `${((ux / d) * force).toFixed(0)}px ${((uy / d) * force - rand(30, 90)).toFixed(0)}px`, rotate: `${rand(-70, 70).toFixed(0)}deg` },
              ],
              { duration: 560, easing: "cubic-bezier(0.15, 0.85, 0.3, 1)", fill: "both" },
            ),
          ),
        );
      }
      const photo = kit.portrait()?.parentElement;
      if (photo) {
        blown.push(
          kit.keep(
            photo.animate([{ translate: "0 0", rotate: "0deg" }, { translate: `${rand(-30, 30).toFixed(0)}px -24px`, rotate: "-14deg" }], {
              duration: 520,
              easing: "cubic-bezier(0.15, 0.85, 0.3, 1)",
              fill: "both",
            }),
          ),
        );
      }
    });

    // BITES THE DUST: la cinta va para atras a tirones, hasta el primer cuadro.
    kit.at(T.rewind, () => {
      kit.frame("stand", { body: "high", face: "smug" });
      const tape = kit.fx("power-btd");
      tape.innerHTML = `<span class="power-btd-vortex"></span><span class="power-btd-clock"><i></i><i></i></span><span class="power-btd-rew">◀◀ REW</span><span class="power-btd-text">BITES THE DUST</span>`;
      for (const a of blown) {
        a.playbackRate = -1.7;
        a.play();
      }
      kit.later(200, () => rewindEntrance(kit.stage, 3));
      for (let i = 0; i < 3; i++) {
        kit.later(120 + i * 220, () => {
          tape.classList.remove("is-jolt");
          void tape.offsetWidth;
          tape.classList.add("is-jolt");
        });
      }
      kit.later(T.replay - T.rewind - 180, () => tape.classList.add("is-flash"));
      kit.later(T.replay - T.rewind + 40, () => tape.remove());
    });

    // Y otra vez, desde el principio: el mismo episodio.
    kit.at(T.replay, () => {
      blown.forEach((a) => a.cancel());
      kit.frame("stand", { face: "smug" });
      replayEntrance(kit.stage);
    });
    kit.at(T.first, () => kit.talk(first, 900));
    kit.at(T.second, () => {
      kit.frame("stand", { face: "wink" });
      kit.talk(second, 900);
    });
    kit.at(T.relay, kit.relay);
  },
};
