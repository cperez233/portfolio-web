/* editorial-ui · Cristian Pérez · cristianperez.me */

import { POSES } from "@/components/mini-stand/sprite";
import { pickLine } from "@/components/mini-stand/pick";
import { pop } from "@/components/mini-stand/power-kit";
import { soundEnabled } from "@/lib/sfx";
import { ease, fill, type IntroDef, type IntroKit } from "./kit";

/*
  To Be Continued: el final de un episodio de JoJo. El Stand se lanza a
  su pose mas dramatica (ドドドド) y en el momento justo el cuadro se
  congela: todo quieto, en sepia, con grano y un temblor de pelicula
  vieja, mientras la imagen se sigue acercando despacio. Entra la flecha.
  Sobre el cuadro congelado corren los creditos del ending, y el chiste
  es que casi todo lo hizo Cris (ingenieria, diseno, video, contenido...),
  hasta el anuncio del proximo episodio: tu proxima visita. Para cerrar,
  el color vuelve con un barrido que sigue a la flecha cuando se va, y la
  pagina sigue andando desde donde se quedo, sin cortes.

  Roundabout: no viene con el sitio (no hay licencia para la grabacion).
  Si NEXT_PUBLIC_ROUNDABOUT_URL apunta a un audio, suena desde el
  arranque y NEXT_PUBLIC_ROUNDABOUT_CUE (segundos dentro del audio) cae
  justo en el congelado; solo si el sonido del sitio esta encendido y el
  navegador ya deja sonar (ver lib/sfx.ts).
*/
const T = {
  open: 1550,
  freeze: 2350,
  arrow: 2560,
  credits: 3150,
  roll: 4300,
  thaw: 7650,
  talk: 8350,
  relay: 9300,
} as const;

/** Tu numero de visita (lo cuenta el mini Stand). */
function visitNumber() {
  try {
    return Math.max(1, Number(window.localStorage.getItem("jojo-visits") ?? 1) || 1);
  } catch {
    return 1;
  }
}

const esc = (text: string) => text.replace(/[&<>"]/g, (ch) => `&#${ch.charCodeAt(0)};`);

/** Roundabout, si alguien puso el audio (ver arriba). */
function roundabout(kit: IntroKit) {
  const src = process.env.NEXT_PUBLIC_ROUNDABOUT_URL;
  if (!src || !soundEnabled()) return;
  const cue = Number(process.env.NEXT_PUBLIC_ROUNDABOUT_CUE ?? 0) || 0;
  const audio = new Audio(src);
  audio.volume = 0;
  audio.currentTime = Math.max(0, cue - (T.freeze - T.open) / 1000);
  void audio.play().catch(() => {});
  kit.tween(600, (t) => (audio.volume = 0.5 * t));
  kit.onCleanup(() => {
    const from = audio.volume;
    let step = 0;
    const fade = window.setInterval(() => {
      step += 1;
      audio.volume = Math.max(0, from * (1 - step / 12));
      if (step >= 12) {
        window.clearInterval(fade);
        audio.pause();
      }
    }, 60);
  });
}

export const tbc: IntroDef = {
  start: T.open,
  condense: 10200,
  run(kit) {
    const pose = POSES[Math.floor(Math.random() * POSES.length)];
    const root = document.documentElement;
    const lines = kit.lines.tbc;
    const n = visitNumber();
    roundabout(kit);

    kit.frame("stand", { body: pose, face: "smug" });
    kit.lunge(0.1, 360);
    const at = kit.heart();
    if (at) pop("ドドドド", Math.min(kit.vw - 90, at.x + kit.tall() * 0.3), Math.max(110, at.y - kit.tall() * 0.55), "power-pop-word is-purple is-big", 1300);
    kit.later(420, () => kit.frame("stand", { body: pose, face: "angry" }));

    // El cuadro se congela: sepia, grano, temblor y un acercamiento lento.
    let frozen: HTMLElement | null = null;
    kit.at(T.freeze, () => {
      root.classList.add("tbc-frozen");
      frozen = kit.fx("tbc-freeze");
      frozen.innerHTML = `<span class="tbc-tint"></span><span class="tbc-grain"></span><span class="tbc-scratch"></span><span class="tbc-vignette"></span>`;
      const origin = kit.heart();
      if (origin) {
        const box = kit.stage.getBoundingClientRect();
        kit.stage.style.transformOrigin = `${(origin.x - box.left).toFixed(0)}px ${(origin.y - box.top).toFixed(0)}px`;
      }
      kit.keep(
        kit.stage.animate(
          [
            { scale: "1", rotate: "0deg" },
            { scale: "1.035", rotate: "-0.4deg", offset: 0.04 },
            { scale: "1.09", rotate: "-0.8deg" },
          ],
          { duration: T.thaw - T.freeze + 900, easing: "cubic-bezier(0.2, 0.6, 0.4, 1)", fill: "forwards" },
        ),
      );
      kit.onCleanup(() => (kit.stage.style.transformOrigin = ""));
    });
    kit.onCleanup(() => root.classList.remove("tbc-frozen"));

    // La flecha.
    let arrow: HTMLElement | null = null;
    kit.at(T.arrow, () => {
      arrow = document.createElement("div");
      arrow.className = "tbc-intro-arrow";
      arrow.innerHTML = `<span class="tbc-arrow"><span class="tbc-arrow-text">${kit.jojo.toBeContinued}</span></span>`;
      frozen?.appendChild(arrow);
    });

    // Los creditos del ending sobre el cuadro congelado.
    let roll: HTMLElement | null = null;
    kit.at(T.credits, () => {
      if (!frozen) return;
      const credits = document.createElement("div");
      credits.className = "tbc-credits";
      credits.innerHTML =
        `<div class="tbc-roll">` +
        `<p class="tbc-show">${esc(lines.show)}</p>` +
        `<p class="tbc-song">♪ Roundabout <span>— Yes</span></p>` +
        lines.credits.map(([role, who]) => `<p class="tbc-row"><span>${esc(role)}</span><b>${esc(who)}</b></p>`).join("") +
        `<p class="tbc-next"><span>${esc(lines.nextLabel)}</span><b>第${n + 1}話</b><i>${esc(fill(lines.next, n + 1))}</i></p>` +
        `</div>`;
      frozen.appendChild(credits);
      roll = credits.querySelector<HTMLElement>(".tbc-roll");
    });
    // Suben despacio y se detienen en el proximo episodio.
    kit.at(T.roll, () => {
      if (!roll) return;
      const box = roll.parentElement!.getBoundingClientRect();
      const next = roll.querySelector<HTMLElement>(".tbc-next")!;
      const stop = next.offsetTop + next.offsetHeight / 2 - box.height / 2;
      const r = roll;
      kit.tween(T.thaw - T.roll - 650, (t) => (r.style.translate = `0 ${(-stop * t).toFixed(1)}px`), ease.inOut);
    });

    // El color vuelve detras de la flecha, que se va; la pagina sigue.
    kit.at(T.thaw, () => {
      arrow?.classList.add("is-leaving");
      frozen?.classList.add("is-thawing");
      kit.later(900, () => {
        root.classList.remove("tbc-frozen");
        frozen?.remove();
      });
      kit.frame("stand", { body: "idle", face: "open" });
      kit.keep(
        kit.stage.animate([{ scale: "1.09", rotate: "-0.8deg" }, { scale: "1", rotate: "0deg" }], {
          duration: 900,
          easing: "cubic-bezier(0.6, 0, 0.3, 1)",
          fill: "forwards",
        }),
      );
    });
    kit.at(T.talk, () => {
      kit.frame("stand", { body: "idle", face: "wink" });
      kit.talk(fill(pickLine(lines.after), n + 1), 1000);
    });
    kit.at(T.relay, kit.relay);
  },
};
