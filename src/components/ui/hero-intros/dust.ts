/* editorial-ui · Cristian Pérez · cristianperez.me */

import { pickLine } from "@/components/mini-stand/pick";
import { pop, rand } from "@/components/mini-stand/power-kit";
import { KILLER_QUEEN } from "@/components/mini-stand/powers";
import { playSfx } from "@/lib/sfx";
import { place, type IntroDef } from "./kit";
import { replayEntrance, rewindEntrance } from "./entrance";
import { center, movePiece, pieces, type Piece } from "./parts";

/*
  Bites the Dust, la bomba que hace explotar el tiempo. Killer Queen sale
  de la mano del Stand, vuela hasta el retrato y lo toca: キラークイーンは
  すでに触っている (ya lo toco). カチッ. La explosion se lleva la pagina
  entera: un cuadro de impacto en negativo, la nube de picos, humo,
  escombros, y el nombre, el retrato, el copy, los botones y hasta el menu
  salen volando. Se queda un instante en ruinas, humeando.

  Entonces バイツァ・ダスト: la cinta se rebobina como un VHS (lineas de
  tracking, el contador para atras, el reloj grande girando al reves) y
  todo vuelve por donde salio, a tirones; la explosion se traga a si
  misma. La entrada entera corre al reves hasta el primer cuadro y se
  vuelve a reproducir: lo que viste, lo ves otra vez. Deja vu.
*/
const T = {
  open: 1600,
  fly: 1760,
  touch: 2420,
  click: 2950,
  boom: 3200,
  btd: 3980,
  rewind: 4180,
  rewindMs: 1400,
  replay: 6150,
  first: 7250,
  second: 8150,
  relay: 9100,
} as const;

/* Estallido de manga: nube de picos en crema y rosa, con tinta. */
function burst(size: number) {
  const spikes = 16;
  const outer: string[] = [];
  const inner: string[] = [];
  for (let i = 0; i < spikes * 2; i++) {
    const a = (i / (spikes * 2)) * Math.PI * 2;
    const r = i % 2 ? rand(0.48, 0.6) : rand(0.86, 1);
    outer.push(`${(50 + Math.cos(a) * 48 * r).toFixed(1)},${(50 + Math.sin(a) * 48 * r).toFixed(1)}`);
    inner.push(`${(50 + Math.cos(a) * 30 * r).toFixed(1)},${(50 + Math.sin(a) * 30 * r).toFixed(1)}`);
  }
  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}"><polygon points="${outer.join(" ")}" fill="#e891c4" stroke="#161418" stroke-width="1.6" stroke-linejoin="round"/><polygon points="${inner.join(" ")}" fill="#fbf3df" stroke="#161418" stroke-width="1.2" stroke-linejoin="round"/></svg>`;
}

export const dust: IntroDef = {
  start: T.open,
  condense: 10300,
  run(kit) {
    const first = pickLine(kit.lines.dust.map(([a]) => a));
    const second = kit.lines.dust.find(([a]) => a === first)?.[1] ?? "";
    const { vw, vh, small } = kit;
    const fx = kit.fx("dust-fx");
    // Todo lo que la explosion mueve, para rebobinarlo despues.
    const blast: Animation[] = [];
    /** Lo que la explosion pinta (estallido, humo, escombros): se va al rebobinar. */
    const debris: HTMLElement[] = [];
    const photo = kit.portrait();
    const spotOf = () => {
      const r = photo?.getBoundingClientRect();
      return r?.width ? { x: r.left + r.width / 2, y: r.top + r.height * 0.4 } : { x: vw / 2, y: vh * 0.35 };
    };
    let spot = spotOf();

    kit.frame("stand", { body: "point", face: "smug" });
    kit.lunge(0.05, 240);
    const hand = kit.hand("point");
    if (hand) pop("キラークイーン", Math.min(vw - 100, Math.max(100, hand.x)), Math.max(110, hand.y - kit.tall() * 0.55), "power-pop-word is-pink is-big", 1200);

    // Killer Queen vuela de la mano al retrato, en arco, y se posa encima.
    const size = small ? 78 : 120;
    let kq: HTMLElement | null = null;
    let fly: Animation | null = null;
    kit.at(T.fly, () => {
      const from = kit.hand("point");
      spot = spotOf();
      if (!from) return;
      const rest = { x: spot.x, y: spot.y - size * 0.62 };
      kq = place(fx, "dust-kq", rest.x, rest.y, KILLER_QUEEN);
      kq.style.width = kq.style.height = `${size}px`;
      const dx = from.x - rest.x;
      const dy = from.y - rest.y;
      fly = kit.keep(
        kq.animate(
          [
            { translate: `${dx}px ${dy}px`, scale: "0.3", rotate: "0deg" },
            { translate: `${dx * 0.45}px ${dy * 0.45 - 140}px`, scale: "1.15", rotate: "220deg", offset: 0.55 },
            { translate: "0 0", scale: "1", rotate: "360deg" },
          ],
          { duration: 640, easing: "cubic-bezier(0.45, 0, 0.3, 1)", fill: "both" },
        ),
      );
    });

    // Ya lo toco.
    kit.at(T.touch, () => {
      kit.frame("stand", { body: "point", face: "laugh" });
      if (kq) kit.keep(kq.animate([{ scale: "1" }, { scale: "1.15 0.82" }, { scale: "1" }], { duration: 260, easing: "ease-out" }));
      kit.shout("すでに触っている…", vw / 2, spot.y - (small ? 150 : 210), "power-pop-word is-pink", 1100);
    });

    // カチッ.
    kit.at(T.click, () => {
      kit.frame("stand", { body: "high", face: "smug" });
      if (kq) kit.keep(kq.animate([{ scale: "1" }, { scale: "1.3 0.65" }, { scale: "1" }], { duration: 200, easing: "ease-out" }));
      kit.shout("カチッ", spot.x + (small ? 70 : 110), spot.y - (small ? 70 : 100), "power-pop-word is-pink is-big", 800);
      playSfx("crack");
    });

    // La explosion se lleva la pagina.
    const flung: Piece[] = [];
    kit.at(T.boom, () => {
      spot = spotOf();
      kq?.classList.add("is-gone");
      playSfx("boom");
      // Cuadro de impacto: blanco y luego negativo.
      const flash = kit.fx("dust-flash");
      kit.later(150, () => flash.remove());

      const big = Math.max(vw, vh) * (small ? 1.1 : 0.85);
      const boom = place(fx, "dust-boom", spot.x, spot.y, burst(big));
      debris.push(boom);
      blast.push(
        kit.keep(
          boom.animate(
            [
              { scale: "0.05", rotate: "0deg", opacity: 1 },
              { scale: "0.85", rotate: "8deg", opacity: 1, offset: 0.3 },
              { scale: "1.05", rotate: "12deg", opacity: 0.9, offset: 0.65 },
              { scale: "1.2", rotate: "14deg", opacity: 0 },
            ],
            { duration: 900, easing: "cubic-bezier(0.15, 0.9, 0.3, 1)", fill: "forwards" },
          ),
        ),
      );
      // Anillos de choque.
      for (let i = 0; i < 2; i++) {
        const ring = place(fx, "dust-ring", spot.x, spot.y);
        debris.push(ring);
        blast.push(
          kit.keep(
            ring.animate([{ scale: "0.1", opacity: 1 }, { scale: String(small ? 6 : 9 + i * 3), opacity: 0 }], {
              duration: 700 + i * 200,
              delay: i * 90,
              easing: "cubic-bezier(0.1, 0.8, 0.3, 1)",
              fill: "both",
            }),
          ),
        );
      }
      // Humo: bocanadas que se abren y se quedan, una sola nube entintada.
      const smoke = place(fx, "dust-smoke", 0, 0);
      debris.push(smoke);
      const puffs = small ? 16 : 26;
      for (let i = 0; i < puffs; i++) {
        const a = (i / puffs) * Math.PI * 2 + rand(-0.25, 0.25);
        const d = rand(0.06, 0.3) * Math.min(vw, vh * 1.4);
        const puff = place(smoke, i % 4 ? "dust-puff" : "dust-puff is-dark", spot.x, spot.y);
        const s = rand(small ? 70 : 110, small ? 130 : 220);
        puff.style.width = puff.style.height = `${s.toFixed(0)}px`;
        blast.push(
          kit.keep(
            puff.animate(
              [
                { translate: "0 0", scale: "0.2", opacity: 0 },
                { opacity: 1, offset: 0.15 },
                { translate: `${(Math.cos(a) * d).toFixed(0)}px ${(Math.sin(a) * d * 0.75).toFixed(0)}px`, scale: "1", opacity: 1, offset: 0.55 },
                { translate: `${(Math.cos(a) * d * 1.15).toFixed(0)}px ${(Math.sin(a) * d * 0.85 - 30).toFixed(0)}px`, scale: "1.25", opacity: 1 },
              ],
              { duration: 1500, delay: rand(0, 80), easing: "cubic-bezier(0.1, 0.8, 0.3, 1)", fill: "both" },
            ),
          ),
        );
      }
      // Escombros: astillas de tinta y rosa.
      for (let i = 0; i < (small ? 14 : 24); i++) {
        const a = rand(0, Math.PI * 2);
        const d = rand(0.3, 0.75) * Math.max(vw, vh);
        const bit = place(fx, i % 3 ? "dust-bit" : "dust-bit is-pink", spot.x, spot.y);
        debris.push(bit);
        blast.push(
          kit.keep(
            bit.animate(
              [
                { translate: "0 0", rotate: "0deg", opacity: 1 },
                { translate: `${(Math.cos(a) * d).toFixed(0)}px ${(Math.sin(a) * d).toFixed(0)}px`, rotate: `${rand(-720, 720).toFixed(0)}deg`, opacity: 0 },
              ],
              { duration: rand(600, 1000), easing: "cubic-bezier(0.1, 0.8, 0.4, 1)", fill: "both" },
            ),
          ),
        );
      }

      kit.shout("ドグォォン!!", vw / 2, spot.y - (small ? 130 : 200), "power-pop-word is-pink is-big", 1300);
      kit.shake(small ? 12 : 22, 700);
      kit.frame("stand", { body: "wide", face: "laugh" });

      // Todo sale volando desde el retrato: letras, foto, copy, botones, menu.
      const push = small ? 260 : 560;
      const throwIt = (piece: Piece, weight: number) => {
        const c = center(piece.el);
        const ux = c.x - spot.x;
        const uy = c.y - spot.y;
        const d = Math.max(30, Math.hypot(ux, uy));
        const force = push * weight * Math.min(1.5, 320 / d + 0.55);
        const x = (ux / d) * force + rand(-30, 30);
        const y = (uy / d) * force - rand(20, 80);
        const r = rand(-80, 80);
        flung.push(piece);
        blast.push(
          kit.keep(
            movePiece(
              piece,
              [
                { x: 0, y: 0, r: 0 },
                { x: x * 0.82, y: y * 0.82, r: r * 0.8, offset: 0.3 },
                { x, y: y + 40, r, opacity: 0.9 },
              ],
              { duration: 1100, easing: "cubic-bezier(0.1, 0.85, 0.3, 1)", fill: "both" },
            ),
          ),
        );
      };
      for (const el of kit.letters()) throwIt({ el, nav: false }, 1);
      for (const piece of pieces(kit.stage)) throwIt(piece, piece.nav ? 0.4 : 0.8);
    });

    // バイツァ・ダスト.
    kit.at(T.btd, () => {
      kit.frame("stand", { body: "point", face: "smug" });
      kit.lunge(0.06, 260);
      const at = kit.heart();
      kit.shout("バイツァ・ダスト!", vw / 2, Math.max(150, (at?.y ?? vh * 0.3) - kit.tall() * 0.5), "power-pop-word is-pink is-big", 1300);
    });

    // La cinta se rebobina: todo vuelve por donde salio, a tirones.
    kit.at(T.rewind, () => {
      playSfx("rewind");
      const tape = kit.fx("btd-tape");
      tape.innerHTML =
        `<span class="btd-lines"></span><span class="btd-track"></span>` +
        `<span class="btd-osd"><b>◀◀ REW</b><i>00:00:07</i></span>` +
        `<span class="btd-clock"><i></i><i></i></span>` +
        `<span class="btd-title">BITES THE DUST</span>`;
      const counter = tape.querySelector<HTMLElement>(".btd-osd i")!;
      kit.tween(T.rewindMs + 500, (t) => {
        const left = Math.max(0, Math.round(7 * (1 - t)));
        counter.textContent = `00:00:${String(left).padStart(2, "0")}`;
      });
      // KQ vuelve a la mano.
      if (kq && fly) {
        kq.classList.remove("is-gone");
        fly.playbackRate = -1;
        fly.play();
      }
      // Tres tirones: corre para atras, se traba un instante, sigue.
      const rate = -(1100 / T.rewindMs) * 1.25;
      const run = (on: boolean) =>
        blast.forEach((a) => {
          if (on) {
            a.playbackRate = rate;
            a.play();
          } else a.pause();
        });
      run(true);
      [0.28, 0.56, 0.8].forEach((at, i) => {
        kit.later(T.rewindMs * at, () => {
          run(false);
          tape.classList.remove("is-jolt");
          void tape.offsetWidth;
          tape.classList.add("is-jolt");
          kit.shake(small ? 4 : 7, 140);
          kit.later(110 + i * 10, () => run(true));
        });
      });
      // Y la entrada entera, hasta el primer cuadro.
      kit.later(T.rewindMs - 100, () => {
        blast.forEach((a) => a.cancel());
        debris.forEach((el) => el.remove());
        kq?.remove();
        rewindEntrance(kit.stage, 3.2);
      });
      kit.later(T.replay - T.rewind - 220, () => tape.classList.add("is-flash"));
      kit.later(T.replay - T.rewind + 60, () => tape.remove());
    });

    // Y otra vez, desde el principio: el mismo episodio.
    kit.at(T.replay, () => {
      kit.frame("stand", { body: "idle", face: "smug" });
      replayEntrance(kit.stage);
    });
    kit.at(T.first, () => {
      kit.frame("stand", { face: "open" });
      kit.talk(first, 900);
    });
    kit.at(T.second, () => {
      kit.frame("stand", { face: "wink" });
      kit.talk(second, 900);
    });
    kit.at(T.relay, kit.relay);
  },
};
