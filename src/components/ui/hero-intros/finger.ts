/* editorial-ui · Cristian Pérez · cristianperez.me */

import { pickLine } from "@/components/mini-stand/pick";
import { pop } from "@/components/mini-stand/power-kit";
import { impact } from "@/components/mini-stand/powers";
import type { IntroDef, IntroKit } from "./kit";

/*
  Star Finger: el h1 (la oferta) no llega escrito. El Stand apunta, el
  dedo se le estira hasta la primera letra (ズギュン) y la va tecleando,
  letra por letra, a toda velocidad: cada toque deja la letra estampada.
  En el punto final, un golpe seco (ドン) y el dedo vuelve de un tiron.

  Lo escrito es una copia encima del h1 (que queda en su sitio, con su
  texto, solo transparente): el h1 no se toca, asi que lectores de
  pantalla, buscadores y el cambio de idioma lo siguen viendo igual.
*/
const T = {
  open: 1600,
  stretch: 1820,
  type: 2000,
  relay: 6100,
} as const;

/** Paso entre letras, en ms. Sale un h1 de ~75 letras en ~2s. */
const STEP = 27;

function setup(kit: IntroKit) {
  const h1 = kit.tagline();
  if (!h1) return null;
  h1.classList.add("sf-ghost");
  const copy = document.createElement("span");
  copy.className = "sf-typed";
  copy.setAttribute("aria-hidden", "true");
  const chars: HTMLElement[] = [];
  for (const ch of Array.from(h1.textContent ?? "")) {
    const span = document.createElement("span");
    span.textContent = ch;
    copy.appendChild(span);
    if (ch.trim()) chars.push(span);
  }
  h1.appendChild(copy);
  const done = () => {
    copy.remove();
    h1.classList.remove("sf-ghost");
  };
  kit.onCleanup(done);
  return { chars, done };
}

export const finger: IntroDef = {
  start: T.open,
  condense: 7600,
  // Desde el primer momento: el h1 no puede asomarse escrito antes de que llegue el dedo.
  prepare(kit) {
    const h1 = kit.tagline();
    h1?.classList.add("sf-ghost");
    kit.onCleanup(() => h1?.classList.remove("sf-ghost"));
  },
  run(kit) {
    const typed = setup(kit);
    if (!typed) return kit.at(T.open + 800, kit.relay);
    const { chars, done } = typed;
    const fx = kit.fx("sf-fx");
    const arm = document.createElement("span");
    arm.className = "sf-finger";
    arm.innerHTML = `<i class="sf-nail"></i>`;
    fx.appendChild(arm);

    kit.frame("stand", { body: "point", face: "angry" });
    kit.lunge(0.05, 240);
    const start = kit.hand("point");
    if (start) kit.shout("スター・フィンガー!", kit.vw / 2, start.y - kit.tall() * 0.62, "power-pop-word is-purple is-big", 1100);

    /** Estira el dedo desde la mano hasta (x, y). */
    const reach = (x: number, y: number, ms: number) => {
      const from = kit.hand("point");
      if (!from) return;
      const len = Math.hypot(x - from.x, y - from.y);
      arm.style.left = `${from.x.toFixed(1)}px`;
      arm.style.top = `${from.y.toFixed(1)}px`;
      arm.style.transitionDuration = `${ms}ms`;
      arm.style.width = `${len.toFixed(1)}px`;
      arm.style.rotate = `${Math.atan2(y - from.y, x - from.x).toFixed(4)}rad`;
    };
    const point = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height * 0.72 };
    };

    kit.at(T.stretch, () => {
      const target = chars[0] ? point(chars[0]) : null;
      if (!target) return;
      reach(target.x, target.y, 0);
      arm.classList.add("is-on");
      pop("ズギュン!", Math.min(kit.vw - 70, Math.max(70, target.x)), target.y - 50, "power-pop-word is-purple", 800);
    });

    // Tecleo: el dedo va de letra en letra y cada toque la estampa.
    chars.forEach((span, i) => {
      kit.at(T.type + i * STEP, () => {
        const p = point(span);
        reach(p.x, p.y, STEP);
        span.classList.add("is-on");
        if (i % 9 === 4) pop(i % 18 === 4 ? "タタタ" : "タッ", Math.min(kit.vw - 50, Math.max(50, p.x)), p.y - 46, "power-pop-word is-purple", 520);
        if (i % 3 === 0) kit.frame("stand", { body: "point", face: i % 6 ? "angry" : "smug" });
      });
    });

    // El punto final: golpe seco y el dedo vuelve.
    const end = T.type + chars.length * STEP + 60;
    kit.at(end, () => {
      const last = chars[chars.length - 1];
      if (!last) return;
      const p = point(last);
      impact(p.x, p.y, true);
      kit.shout("ドン!", p.x, p.y - 70, "power-pop-word is-purple is-big", 900);
      kit.shake(kit.small ? 4 : 6, 260);
      kit.lunge(0.07, 260);
      last.classList.add("is-slam");
    });
    kit.at(end + 260, () => {
      arm.style.transitionDuration = "160ms";
      arm.style.width = "0px";
      kit.frame("stand", { body: "idle", face: "smug" });
    });
    kit.at(end + 460, () => {
      fx.remove();
      done();
    });
    kit.at(end + 600, () => kit.talk(pickLine(kit.lines.finger), 1200));
    kit.at(Math.max(T.relay, end + 2300), kit.relay);
  },
};
