/* editorial-ui · Cristian Pérez · cristianperez.me */

import { POSES } from "@/components/mini-stand/sprite";
import { pickLine } from "@/components/mini-stand/pick";
import { pop } from "@/components/mini-stand/power-kit";
import { playSfx } from "@/lib/sfx";
import { fill, type IntroDef } from "./kit";

/*
  King Crimson: borra el tiempo y solo queda el resultado.

  En el centro aparece un medidor de carga enorme, "Cargando a Cris…",
  que avanza a paso de tortuga: tres horas por delante, con sus pasos
  (diseno, codigo, entrega) y la hora de verdad. Epitaph (la cara de la
  frente de King Crimson, que ve el futuro) muestra un cuadro de lo que
  viene: el medidor al 100%. Entonces キング・クリムゾン.

  El salto es el del anime: la imagen se corrompe un par de cuadros, como
  si la animacion se saltara, y cae el vacio rojo y negro. En el vacio no
  pasa nada que se vea: la pagina no esta (ni el medidor, ni el menu, ni
  el retrato), solo King Crimson, quieto, en rojo. Quien mira no vive ese
  tiempo. Vuelve con otro corte corrupto y la pagina ya esta en otro
  punto, sin transicion: el medidor lleno con los tres pasos hechos, la
  hora tres horas despues y el Stand en otro sitio y otra pose. Despues
  del corte, 結果だけだ: solo queda el resultado.

  El vacio vive dentro del hero (kit.behind), asi que el Stand sigue
  delante; lo de fuera del hero (menu, copy, retrato) se esconde.
*/
const T = {
  open: 1600,
  // El medidor se queda un buen rato a paso de tortuga: que se lea el
  // globo y se vea lo lento que va antes de borrar el tiempo.
  yawn: 3400,
  epitaph: 3900,
  call: 4750,
  erase: 5000,
  resume: 6450,
  result: 6750,
  talk: 7400,
  leave: 8800,
  relay: 9500,
} as const;

/** Cuadros del medidor. */
const SEGMENTS = 40;
/** Tres horas de espera, en segundos de la cuenta. */
const TOTAL = 3 * 3600;

const clock = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  return [h, m, sec].map((n) => String(n).padStart(2, "0")).join(":");
};

/** La hora de verdad, mas `plus` minutos. */
const wall = (plus = 0) => {
  const d = new Date(Date.now() + plus * 60000);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

const SPIN = ["◐", "◓", "◑", "◒"];

export const crimson: IntroDef = {
  name: "King Crimson",
  nameAt: T.call,
  start: T.open,
  condense: 11000,
  run(kit) {
    const lines = kit.lines.crimson;
    const root = document.documentElement;
    const pose = POSES[Math.floor(Math.random() * POSES.length)];
    const { vw, vh, small } = kit;

    // El medidor: centrado, grande, debajo del Stand (que no lo tape ni lo tape a el).
    const stand = kit.stage.querySelector(".hero-stand-core svg")?.getBoundingClientRect();
    const meterW = Math.min(880, vw - 32);
    const meterH = small ? 196 : 222;
    const meterTop = Math.min(vh - meterH - 86, Math.max(vh * 0.5 - meterH / 2, (stand?.bottom ?? vh * 0.4) + 14));
    const deck = kit.fx("kc-deck");
    deck.innerHTML =
      `<div class="kc-meter">` +
      `<div class="kc-meter-head"><b class="kc-title">${lines.loading}</b><span class="kc-tc"><i>00:00:01</i> / ${clock(TOTAL)}</span></div>` +
      `<div class="kc-bar">${Array.from({ length: SEGMENTS }, () => "<i></i>").join("")}<b class="kc-pct">1%</b></div>` +
      `<ol class="kc-steps">${lines.steps.map((step, i) => `<li${i ? "" : ' class="is-doing"'}><b>${i ? "▢" : SPIN[0]}</b><span>${step}</span><em>${i ? "" : lines.doing}</em></li>`).join("")}</ol>` +
      `<div class="kc-meter-foot"><span class="kc-eta">${fill(lines.eta, "2 h 59 min")}</span><span class="kc-wall">${lines.now} <b>${wall()}</b></span><span class="kc-rec">● REC</span></div>` +
      `</div>`;
    const meter = deck.querySelector<HTMLElement>(".kc-meter")!;
    Object.assign(meter.style, { width: `${meterW}px`, left: `${(vw - meterW) / 2}px`, top: `${meterTop}px` });
    const segs = [...deck.querySelectorAll<HTMLElement>(".kc-bar i")];
    const steps = [...deck.querySelectorAll<HTMLElement>(".kc-steps li")];
    const title = deck.querySelector<HTMLElement>(".kc-title")!;
    const tc = deck.querySelector<HTMLElement>(".kc-tc i")!;
    const pct = deck.querySelector<HTMLElement>(".kc-pct")!;
    const eta = deck.querySelector<HTMLElement>(".kc-eta")!;
    const now = deck.querySelector<HTMLElement>(".kc-wall b")!;

    // Avanza lentisimo: un segundo de la cuenta cada medio segundo de verdad.
    let seconds = 1;
    let shown = 1;
    const show = (n: number) => {
      shown = n;
      segs.forEach((seg, i) => seg.classList.toggle("is-on", i < Math.max(1, Math.round((n / 100) * SEGMENTS))));
      pct.textContent = `${n}%`;
    };
    show(1);
    const spinner = steps[0].querySelector("b")!;
    const crawl = window.setInterval(() => {
      seconds += 1;
      tc.textContent = clock(seconds);
      spinner.textContent = SPIN[seconds % SPIN.length];
      if (seconds % 2 === 0 && shown < 4) show(shown + 1);
    }, 480);
    kit.onCleanup(() => window.clearInterval(crawl));

    kit.frame("stand", { body: "idle", face: "happy" });
    kit.at(T.open + 150, () => kit.talk(pickLine(lines.wait), 2600));
    kit.at(T.yawn, () => kit.frame("stand", { body: "idle", face: "blink" }));

    // Epitaph: un cuadro del futuro, el medidor lleno.
    kit.at(T.epitaph, () => {
      kit.frame("stand", { body: "idle", face: "shock" });
      const vision = document.createElement("div");
      vision.className = "kc-epitaph";
      vision.innerHTML =
        `<span class="kc-epitaph-label">エピタフ · ${lines.epitaph}</span>` +
        `<span class="kc-epitaph-bar"><i></i></span><b>100%</b>`;
      deck.appendChild(vision);
      const r = meter.getBoundingClientRect();
      const w = Math.min(small ? 220 : 300, vw - 32);
      Object.assign(vision.style, { width: `${w}px`, left: `${Math.min(vw - w - 16, r.right - w - 8)}px`, top: `${r.top - (small ? 74 : 86)}px` });
      kit.later(T.erase - T.epitaph - 80, () => vision.remove());
    });

    kit.at(T.call, () => {
      const at = kit.heart();
      kit.frame("stand", { body: "point", face: "angry" });
      kit.lunge(0.07, 220);
      kit.shout("キング・クリムゾン!", vw / 2, (at?.y ?? vh * 0.3) - kit.tall() * 0.45, "power-pop-word is-crimson is-big", 1100);
    });

    /*
      El corte del anime: la imagen se corrompe dos o tres cuadros (franjas
      corridas, el color partido) y salta. Va en una clase de la raiz para
      que tambien lo sufran el medidor y el menu.
    */
    const skip = () => {
      root.classList.add("kc-skip");
      kit.later(230, () => root.classList.remove("kc-skip"));
    };
    kit.onCleanup(() => root.classList.remove("kc-skip"));

    // El tiempo se borra: el vacio. Nada de la pagina se ve ni se mueve.
    let voidLayer: HTMLElement | null = null;
    kit.at(T.erase, () => {
      kit.hush();
      window.clearInterval(crawl);
      playSfx("warudo");
      skip();
      kit.later(110, () => {
        voidLayer = kit.behind("kc-void");
        voidLayer.innerHTML = `<span class="kc-stars"></span><span class="kc-stars is-far"></span><span class="kc-bands"></span>`;
        root.classList.add("kc-erased");
        deck.classList.add("is-erased");
        kit.frame("stand", { body: "idle", face: "smug" });
      });
    });

    // El tiempo vuelve de golpe y ya paso todo: tres horas despues.
    kit.at(T.resume, () => {
      playSfx("resume");
      skip();
      root.classList.remove("kc-erased");
      voidLayer?.remove();
      deck.classList.remove("is-erased");
      deck.classList.add("is-done");
      show(100);
      tc.textContent = clock(TOTAL);
      title.textContent = lines.done;
      eta.textContent = lines.result;
      now.textContent = wall(180);
      steps.forEach((step, i) => {
        step.className = "is-done";
        step.querySelector("b")!.textContent = "✓";
        step.querySelector("em")!.textContent = wall(52 + i * 64);
      });
      // Ya esta en otro sitio, en otra pose: no se le vio ir.
      kit.jumpAside(pose, "wink");
      const r = meter.getBoundingClientRect();
      pop("バァーン", r.right - 70, r.top - 10, "power-pop-word is-crimson is-big", 1000);
    });
    kit.onCleanup(() => root.classList.remove("kc-erased"));

    kit.at(T.result, () => {
      const at = kit.heart();
      kit.shout("結果だけだ!!", vw / 2, Math.max(150, (at?.y ?? vh * 0.3) - kit.tall() * 0.5), "power-pop-word is-crimson is-big", 1300);
      kit.shake(small ? 4 : 7, 300);
    });

    kit.at(T.talk, () => kit.talk(pickLine(lines.cut), 1300));
    kit.at(T.leave, () => deck.classList.add("is-leaving"));
    kit.at(T.relay, kit.relay);
  },
};
