/* editorial-ui · Cristian Pérez · cristianperez.me */

import { POSES } from "@/components/mini-stand/sprite";
import { pickLine } from "@/components/mini-stand/pick";
import { pop } from "@/components/mini-stand/power-kit";
import { fill, type IntroDef } from "./kit";
import { replayEntrance } from "./entrance";

/*
  To Be Continued: el final de un episodio. El Stand se lanza a una pose
  enorme, la imagen se congela en sepia con un leve zoom y entra la
  flecha "To Be Continued". Corte a negro: la tarjeta de titulo del
  episodio siguiente, 第N話 (N es tu numero de visita), con el nombre y lo
  que es: ingeniero de sistemas y creador de contenido. La tarjeta se
  abre en diagonal y la pagina arranca desde el principio, como el
  episodio nuevo.
*/
const T = {
  open: 1550,
  freeze: 2050,
  arrow: 2250,
  card: 3650,
  play: 5150,
  talk: 6500,
  relay: 7800,
} as const;

/** Tu numero de visita (lo cuenta el mini Stand). */
function visitNumber() {
  try {
    return Math.max(1, Number(window.localStorage.getItem("jojo-visits") ?? 1) || 1);
  } catch {
    return 1;
  }
}

export const tbc: IntroDef = {
  start: T.open,
  condense: 9400,
  run(kit) {
    const pose = POSES[Math.floor(Math.random() * POSES.length)];
    const root = document.documentElement;
    kit.frame("stand", { body: pose, face: "smug" });
    kit.lunge(0.1, 360);
    const at = kit.heart();
    if (at) pop("ドドドド", Math.min(kit.vw - 90, at.x + kit.tall() * 0.3), Math.max(96, at.y - kit.tall() * 0.55), "power-pop-word is-purple is-big", 1300);

    // Cuadro congelado: todo quieto, sepia, un leve zoom y la flecha.
    let frozen: HTMLElement | null = null;
    kit.at(T.freeze, () => {
      root.classList.add("tbc-frozen");
      frozen = kit.fx("tbc-freeze");
      frozen.innerHTML = `<span class="tbc-grain"></span>`;
      kit.keep(kit.stage.animate([{ scale: "1" }, { scale: "1.035" }], { duration: 260, easing: "cubic-bezier(0.2, 0.9, 0.3, 1)", fill: "forwards" }));
    });
    kit.onCleanup(() => root.classList.remove("tbc-frozen"));
    kit.at(T.arrow, () => {
      const arrow = document.createElement("div");
      arrow.className = "tbc-intro-arrow";
      arrow.innerHTML = `<span class="tbc-arrow"><span class="tbc-arrow-text">${kit.jojo.toBeContinued}</span></span>`;
      frozen?.appendChild(arrow);
    });

    // La tarjeta del episodio siguiente.
    const n = visitNumber();
    let card: HTMLElement | null = null;
    kit.at(T.card, () => {
      card = kit.fx("tbc-card");
      const name = document.querySelector(".hero-name-first")?.textContent ?? "";
      const last = document.querySelector(".hero-name-last")?.textContent ?? "";
      card.innerHTML =
        `<div class="tbc-card-inner">` +
        `<span class="tbc-card-no">第${n}話</span>` +
        `<span class="tbc-card-title"><b>${name}</b> <b>${last}</b></span>` +
        `<span class="tbc-card-sub">${kit.lines.tbc.subtitle}</span>` +
        `<span class="tbc-card-ep">${fill(kit.lines.tbc.episode, n)}</span>` +
        `</div>`;
      // Debajo de la tarjeta la pagina ya se descongela y vuelve al primer cuadro.
      kit.later(260, () => {
        root.classList.remove("tbc-frozen");
        frozen?.remove();
        kit.stage.getAnimations().forEach((a) => a.cancel());
        kit.frame("stand", { body: "idle", face: "open" });
      });
    });

    // Empieza el episodio: la tarjeta se abre y la entrada corre otra vez.
    kit.at(T.play, () => {
      card?.classList.add("is-open");
      kit.later(700, () => card?.remove());
      replayEntrance(kit.stage);
      kit.frame("stand", { face: "smug" });
    });
    kit.at(T.talk, () => {
      kit.frame("stand", { face: "wink" });
      kit.talk(fill(pickLine(kit.lines.tbc.after), n), 1000);
    });
    kit.at(T.relay, kit.relay);
  },
};
