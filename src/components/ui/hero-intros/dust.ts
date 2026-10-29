/* editorial-ui · Cristian Pérez · cristianperez.me */

import { pickLine } from "@/components/mini-stand/pick";
import { pop, rand } from "@/components/mini-stand/power-kit";
import { playSfx } from "@/lib/sfx";
import { ease, place, type IntroDef } from "./kit";
import { replayEntrance, rewindEntrance } from "./entrance";
import { center, movePiece, pieces, type Piece } from "./parts";
import { BOOM_MS, PRIME_MS, createBoom } from "./boom";

/*
  Bites the Dust. Killer Queen, como Kira: el Stand estira la mano y toca
  el retrato (キラークイーンは すでに触っている, ya lo toco), vuelve a su
  sitio y aprieta el gatillo con el pulgar: カチッ. El retrato se ilumina
  por dentro y explota como en Diamond is Unbreakable (boom.ts): nucleo
  blanco, bola de fuego, chispas, onda de choque y humo. La explosion se
  lleva la pagina: el nombre, el retrato, el copy, los botones y el menu
  salen volando.

  Entonces バイツァ・ダスト y el rebobinado, hecho para que se vea que cada
  cosa vuelve a SU sitio: donde estaba cada pieza queda su hueco marcado
  (una silueta punteada), y las piezas regresan una tras otra por el
  mismo camino por el que salieron, dejando un rastro, hasta encajar en su
  hueco con un destello. La explosion se traga a si misma. Despues la
  entrada entera corre al reves hasta el primer cuadro y se vuelve a
  reproducir: lo que viste, lo ves otra vez. Deja vu.
*/
const T = {
  open: 1600,
  reach: 1820,
  touch: 2120,
  back: 2420,
  click: 2780,
  boom: 3100,
  btd: 3950,
  rewind: 4150,
  rewindMs: 2000,
  replay: 6900,
  first: 7850,
  second: 8650,
  relay: 9450,
} as const;

/** Lo que tarda cada pieza en volver a su hueco. */
const BACK_MS = 620;

export const dust: IntroDef = {
  start: T.open,
  condense: 10400,
  run(kit) {
    const first = pickLine(kit.lines.dust.map(([a]) => a));
    const second = kit.lines.dust.find(([a]) => a === first)?.[1] ?? "";
    const { vw, vh, small } = kit;
    const fx = kit.fx("dust-fx");
    const photo = kit.portrait();
    const spotOf = () => {
      const r = photo?.getBoundingClientRect();
      return r?.width ? { x: r.left + r.width / 2, y: r.top + r.height * 0.45 } : { x: vw / 2, y: vh * 0.35 };
    };
    let spot = spotOf();
    const body = kit.stage.querySelector<HTMLElement>(".hero-stand-body");

    // El nombre del Stand, al sacarlo.
    kit.frame("stand", { body: "idle", face: "smug" });
    kit.lunge(0.05, 240);
    const head = kit.heart();
    if (head) kit.shout("キラークイーン!", head.x, head.y - kit.tall() * 0.6, "power-pop-word is-pink is-big", 1200);

    // Estira la mano hasta el retrato y lo toca.
    kit.at(T.reach, () => {
      kit.frame("stand", { body: "point", face: "smug" });
      const hand = kit.hand("point");
      const r = photo?.getBoundingClientRect();
      if (!body || !hand || !r) return;
      // Hasta el borde de la foto que le queda mas cerca.
      const tx = hand.x > r.right ? r.right - 10 : hand.x < r.left ? r.left + 10 : hand.x;
      const ty = Math.min(r.bottom - 20, Math.max(r.top + 20, hand.y));
      const dx = tx - hand.x;
      const dy = ty - hand.y;
      kit.keep(
        body.animate(
          [
            { translate: "0 0" },
            { translate: `${dx.toFixed(0)}px ${dy.toFixed(0)}px`, offset: 0.25, easing: "cubic-bezier(0.2, 0.9, 0.3, 1)" },
            { translate: `${dx.toFixed(0)}px ${dy.toFixed(0)}px`, offset: 0.62 },
            { translate: "0 0" },
          ],
          { duration: T.back - T.reach + 380, easing: "cubic-bezier(0.5, 0, 0.3, 1)" },
        ),
      );
    });
    kit.at(T.touch, () => {
      spot = spotOf();
      if (photo) kit.keep(photo.animate([{ scale: "1" }, { scale: "0.95 1.04" }, { scale: "1" }], { duration: 240, easing: "ease-out" }));
      pop("✦", spot.x + rand(-20, 20), spot.y + rand(-20, 10), "power-sparkle", 700);
      kit.shout("すでに触っている…", vw / 2, spot.y - (small ? 150 : 210), "power-pop-word is-pink", 1200);
    });

    // カチッ: el pulgar sobre el gatillo.
    kit.at(T.click, () => {
      kit.frame("stand", { body: "high", face: "laugh" });
      kit.lunge(0.04, 200);
      const hand = kit.hand("high");
      if (hand) kit.shout("カチッ", hand.x, hand.y - 30, "power-pop-word is-pink is-big", 800);
      playSfx("crack");
    });

    // La explosion: se pinta en un canvas como funcion del tiempo (boom.ts).
    let boom: ReturnType<typeof createBoom> | null = null;
    let shown = -PRIME_MS;
    kit.at(T.boom - PRIME_MS, () => {
      spot = spotOf();
      boom = createBoom(fx, spot.x, spot.y, small);
      const b = boom;
      kit.tween(PRIME_MS + BOOM_MS, (t) => {
        shown = t * (PRIME_MS + BOOM_MS) - PRIME_MS;
        b.draw(shown);
      });
    });

    // Lo que la explosion mueve, con su hueco (donde estaba) para volver.
    type Flung = { piece: Piece; anim: Animation; slot: DOMRect };
    const flung: Flung[] = [];
    kit.at(T.boom, () => {
      playSfx("boom");
      // Cuadro de impacto: un par de cuadros en negativo.
      const flash = kit.fx("dust-flash");
      kit.later(170, () => flash.remove());

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
        const anim = kit.keep(
          movePiece(
            piece,
            [
              { x: 0, y: 0, r: 0 },
              { x: x * 0.82, y: y * 0.82, r: r * 0.8, offset: 0.3 },
              { x, y: y + 40, r, opacity: 0.9 },
            ],
            { duration: 1100, easing: "cubic-bezier(0.1, 0.85, 0.3, 1)", fill: "both" },
          ),
        );
        flung.push({ piece, anim, slot: c.r });
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

    // El rebobinado: cada pieza vuelve a su hueco, una tras otra.
    kit.at(T.rewind, () => {
      playSfx("rewind");
      const tape = kit.fx("btd-tape");
      tape.innerHTML =
        `<span class="btd-lines"></span><span class="btd-track"></span>` +
        `<span class="btd-osd"><b>◀◀ REW</b><i>00:00:07</i></span>` +
        `<span class="btd-title">BITES THE DUST</span>`;
      const counter = tape.querySelector<HTMLElement>(".btd-osd i")!;
      kit.tween(T.rewindMs, (t) => {
        counter.textContent = `00:00:${String(Math.max(0, Math.round(7 * (1 - t)))).padStart(2, "0")}`;
      });

      // La explosion se traga a si misma, al ritmo del rebobinado.
      const b = boom;
      const from = shown;
      if (b) kit.tween(T.rewindMs * 0.85, (t) => b.draw(from - (from + PRIME_MS) * t), ease.inOut);

      // Los huecos: donde estaba cada cosa.
      const slots = flung.map(({ slot, piece }) => {
        const el = place(fx, piece.el.classList.contains("hero-slam") ? "btd-slot is-letter" : "btd-slot", slot.left, slot.top);
        el.style.width = `${slot.width}px`;
        el.style.height = `${slot.height}px`;
        return el;
      });

      // De la mas lejana a la mas cercana, todas dentro del rebobinado.
      const order = flung.map((f, i) => i).sort(() => Math.random() - 0.5);
      const spread = Math.max(0, T.rewindMs - BACK_MS - 260) / Math.max(1, order.length - 1);
      order.forEach((i, k) => {
        const { anim, piece } = flung[i];
        kit.later(160 + k * spread, () => {
          const total = Number(anim.effect?.getComputedTiming().duration) || 1100;
          anim.pause();
          anim.currentTime = total;
          anim.playbackRate = -total / BACK_MS;
          anim.play();
          // El rastro: siluetas que quedan por donde pasa.
          let trail = 0;
          const drop = window.setInterval(() => {
            const r = piece.el.getBoundingClientRect();
            const ghost = place(fx, "btd-trail", r.left, r.top);
            ghost.style.width = `${r.width}px`;
            ghost.style.height = `${r.height}px`;
            kit.later(380, () => ghost.remove());
            if (++trail > 9) window.clearInterval(drop);
          }, 55);
          kit.onCleanup(() => window.clearInterval(drop));
          anim.onfinish = () => {
            window.clearInterval(drop);
            slots[i].classList.add("is-filled");
            kit.later(320, () => slots[i].remove());
          };
        });
      });

      // Y la entrada entera, hasta el primer cuadro.
      kit.later(T.rewindMs + 80, () => {
        flung.forEach(({ anim }) => anim.cancel());
        slots.forEach((el) => el.remove());
        boom?.remove();
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
