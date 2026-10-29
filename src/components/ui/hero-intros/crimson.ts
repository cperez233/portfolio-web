/* editorial-ui · Cristian Pérez · cristianperez.me */

import { POSES } from "@/components/mini-stand/sprite";
import { pickLine } from "@/components/mini-stand/pick";
import { pop } from "@/components/mini-stand/power-kit";
import { fill, type IntroDef } from "./kit";

/*
  King Crimson: borra el tiempo. El Stand arranca una presentacion formal
  larguisima ("diapositiva 1 de 47"), con su linea de tiempo de editor
  abajo avanzando a paso de tortuga. A la mitad de la frase: キング・
  クリムゾン. Dos cuadros en carmesi, el clip aburrido desaparece de la
  linea de tiempo (borrado con cierre de hueco, como en un editor de
  video) y el Stand ya esta en otro sitio, posando, como si eso nunca
  hubiera pasado. Remata con el resumen de lo que se salto: ingeniero de
  sistemas y creador de contenido.
*/
const T = {
  open: 1600,
  yawn: 2950,
  call: 3250,
  erase: 3450,
  back: 3950,
  first: 4250,
  second: 5650,
  leave: 6900,
  relay: 7450,
} as const;

export const crimson: IntroDef = {
  start: T.open,
  condense: 9000,
  run(kit) {
    const lines = kit.lines.crimson;
    const first = pickLine(lines.cut.map(([a]) => a));
    const second = lines.cut.find(([a]) => a === first)?.[1] ?? "";
    const pose = POSES[Math.floor(Math.random() * POSES.length)];

    // La presentacion: el globo largo, el rotulo de diapositiva y la linea de tiempo.
    kit.frame("stand", { body: "idle", face: "happy" });
    kit.talk(pickLine(lines.boring), 9000);

    const deck = kit.fx("kc-deck");
    deck.innerHTML =
      `<span class="kc-slide">${fill(lines.slide, 1)}</span>` +
      `<div class="kc-timeline">` +
      `<span class="kc-tc"><b>00:00:01</b><i>REC</i></span>` +
      `<span class="kc-track">` +
      `<span class="kc-clip">${lines.clips[0]}</span>` +
      `<span class="kc-clip is-long">${lines.clips[1]}</span>` +
      `<span class="kc-clip is-end">${lines.clips[2]}</span>` +
      `<span class="kc-head"></span>` +
      `</span></div>`;
    const slide = deck.querySelector<HTMLElement>(".kc-slide")!;
    const tc = deck.querySelector<HTMLElement>(".kc-tc b")!;
    const head = deck.querySelector<HTMLElement>(".kc-head")!;
    const long = deck.querySelector<HTMLElement>(".kc-clip.is-long")!;

    // El cabezal avanza lentisimo por el primer clip: aburrido a proposito.
    const crawl = kit.keep(
      head.animate([{ left: "0%" }, { left: "17%" }], { duration: T.call - T.open, easing: "linear", fill: "forwards" }),
    );
    let seconds = 1;
    const clock = window.setInterval(() => {
      seconds += 1;
      tc.textContent = `00:00:${String(seconds).padStart(2, "0")}`;
    }, 420);
    kit.onCleanup(() => window.clearInterval(clock));

    // Se le cierran los ojos con su propio discurso.
    kit.at(T.yawn, () => kit.frame("stand", { body: "idle", face: "blink" }));

    kit.at(T.call, () => {
      const at = kit.heart();
      kit.frame("stand", { body: "point", face: "angry" });
      kit.lunge(0.06, 220);
      if (at) kit.shout("キング・クリムゾン!", kit.vw / 2, at.y - kit.tall() * 0.2, "power-pop-word is-crimson is-big", 1100);
    });

    // El tiempo se borra: dos cuadros carmesi, el clip aburrido desaparece y el Stand ya no esta donde estaba.
    kit.at(T.erase, () => {
      kit.hush();
      window.clearInterval(clock);
      crawl.cancel();
      const flash = kit.fx("kc-erase");
      flash.innerHTML = `<span class="kc-erase-word">結果だけだ!!</span>`;
      kit.later(560, () => flash.remove());
      kit.stage.classList.add("kc-hidden-stand");
      long.classList.add("is-cut");
      head.style.left = "17%";
    });
    kit.at(T.erase + 260, () => {
      // Cierre del hueco: lo que venia despues se pega a donde ibas.
      kit.keep(long.animate([{ flexGrow: "1", opacity: "1" }, { flexGrow: "0", opacity: "0" }], { duration: 240, easing: "cubic-bezier(0.7, 0, 0.3, 1)", fill: "forwards" }));
      kit.keep(head.animate([{ left: "17%" }, { left: "44%" }], { duration: 240, easing: "cubic-bezier(0.7, 0, 0.3, 1)", fill: "forwards" }));
      tc.textContent = "00:47:00";
      slide.textContent = fill(lines.slide, 47);
      slide.classList.add("is-done");
    });

    // Ya esta del otro lado, posando. No se lo vio llegar: King Crimson.
    kit.at(T.back, () => {
      kit.stage.classList.remove("kc-hidden-stand");
      kit.jumpAside(pose, "smug");
      const at = kit.heart();
      if (at) pop("バァーン", Math.min(kit.vw - 70, Math.max(70, at.x)), Math.max(124, at.y - kit.tall() * 0.66), "power-pop-word is-crimson is-big", 1000);
    });
    kit.at(T.first, () => kit.talk(first, 1100));
    kit.at(T.second, () => {
      kit.frame("stand", { body: pose, face: "wink" });
      kit.talk(second, 900);
    });
    kit.at(T.leave, () => deck.classList.add("is-leaving"));
    kit.onCleanup(() => kit.stage.classList.remove("kc-hidden-stand"));
    kit.at(T.relay, kit.relay);
  },
};
