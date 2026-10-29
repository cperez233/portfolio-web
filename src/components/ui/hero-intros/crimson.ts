/* editorial-ui · Cristian Pérez · cristianperez.me */

import { POSES } from "@/components/mini-stand/sprite";
import { pickLine } from "@/components/mini-stand/pick";
import { pop, rand } from "@/components/mini-stand/power-kit";
import { playSfx } from "@/lib/sfx";
import { fill, type IntroDef } from "./kit";

/*
  King Crimson: borra el tiempo y solo queda el resultado.

  En el centro aparece un medidor de carga enorme, "Cargando a Cris…",
  que avanza a paso de tortuga: tres horas por delante. Epitaph (la cara
  de la frente de King Crimson, que ve el futuro) muestra un cuadro de lo
  que viene: el medidor al 100%. Entonces キング・クリムゾン: el tiempo se
  borra y la pantalla entera cae al vacio carmesi. Ahi solo se mueve el
  Stand; todo lo demas son fantasmas que dejan estelas de lo que "habria
  pasado" (como lo ve Diavolo en el manga), y los cuadros del medidor que
  faltaban se rompen y caen al vacio. El tiempo vuelve de golpe y el
  medidor ya esta lleno: 結果だけだ, solo queda el resultado.

  El vacio vive dentro del hero (kit.behind), asi que el Stand sigue
  delante; lo que queda fuera del hero (menu, copy, retrato) se esconde
  mientras dura, y sus fantasmas lo reemplazan.
*/
const T = {
  open: 1600,
  yawn: 2350,
  epitaph: 2650,
  call: 3250,
  erase: 3480,
  result: 4250,
  resume: 5350,
  talk: 5700,
  leave: 7100,
  relay: 7800,
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

export const crimson: IntroDef = {
  start: T.open,
  condense: 9300,
  run(kit) {
    const lines = kit.lines.crimson;
    const root = document.documentElement;
    const pose = POSES[Math.floor(Math.random() * POSES.length)];
    const { vw, vh, small } = kit;

    // El medidor: centrado, grande, debajo del Stand (que no lo tape ni lo tape a el).
    const stand = kit.stage.querySelector(".hero-stand-core svg")?.getBoundingClientRect();
    const meterW = Math.min(880, vw - 32);
    const meterH = small ? 150 : 176;
    const meterTop = Math.min(vh - meterH - 86, Math.max(vh * 0.5 - meterH / 2, (stand?.bottom ?? vh * 0.4) + 14));
    const deck = kit.fx("kc-deck");
    deck.innerHTML =
      `<div class="kc-meter">` +
      `<div class="kc-meter-head"><b class="kc-title">${lines.loading}</b><span class="kc-tc"><i>00:00:01</i> / ${clock(TOTAL)}</span></div>` +
      `<div class="kc-bar">${Array.from({ length: SEGMENTS }, () => "<i></i>").join("")}<b class="kc-pct">1%</b></div>` +
      `<div class="kc-meter-foot"><span class="kc-eta">${fill(lines.eta, "2 h 59 min")}</span><span class="kc-rec">● REC</span></div>` +
      `</div>`;
    const meter = deck.querySelector<HTMLElement>(".kc-meter")!;
    Object.assign(meter.style, { width: `${meterW}px`, left: `${(vw - meterW) / 2}px`, top: `${meterTop}px` });
    const segs = [...deck.querySelectorAll<HTMLElement>(".kc-bar i")];
    const title = deck.querySelector<HTMLElement>(".kc-title")!;
    const tc = deck.querySelector<HTMLElement>(".kc-tc i")!;
    const pct = deck.querySelector<HTMLElement>(".kc-pct")!;
    const eta = deck.querySelector<HTMLElement>(".kc-eta")!;

    // Avanza lentisimo: un segundo de la cuenta cada medio segundo de verdad.
    let seconds = 1;
    let shown = 1;
    const show = (n: number) => {
      shown = n;
      segs.forEach((seg, i) => seg.classList.toggle("is-on", i < Math.max(1, Math.round((n / 100) * SEGMENTS))));
      pct.textContent = `${n}%`;
    };
    show(1);
    const crawl = window.setInterval(() => {
      seconds += 1;
      tc.textContent = clock(seconds);
      if (seconds % 2 === 0 && shown < 4) show(shown + 1);
    }, 480);
    kit.onCleanup(() => window.clearInterval(crawl));

    kit.frame("stand", { body: "idle", face: "happy" });
    kit.talk(pickLine(lines.wait), 1400);
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

    // El tiempo se borra: el vacio carmesi y los fantasmas de lo que habria pasado.
    let voidLayer: HTMLElement | null = null;
    kit.at(T.erase, () => {
      kit.hush();
      window.clearInterval(crawl);
      playSfx("warudo");
      const cut = kit.fx("kc-cut");
      kit.later(200, () => cut.remove());

      voidLayer = kit.behind("kc-void");
      voidLayer.innerHTML = `<span class="kc-stars"></span><span class="kc-stars is-far"></span><span class="kc-bands"></span>`;
      ghosts(voidLayer);
      root.classList.add("kc-erased");
      deck.classList.add("is-erased");
      title.textContent = lines.erased;
      eta.textContent = "— — —";

      // El Stand, el unico que se mueve en el tiempo borrado.
      kit.later(260, () => {
        kit.jumpAside(pose, "smug");
      });

      // Los cuadros que faltaban se rompen y caen al vacio.
      const from = Math.max(1, Math.round((shown / 100) * SEGMENTS));
      segs.slice(from).forEach((seg, i) => {
        kit.later(120 + i * 22 + rand(0, 80), () => {
          kit.keep(
            seg.animate(
              [
                { translate: "0 0", rotate: "0deg", opacity: 1 },
                { translate: `${rand(-30, 30).toFixed(0)}px ${rand(-24, -8).toFixed(0)}px`, rotate: `${rand(-25, 25).toFixed(0)}deg`, opacity: 1, offset: 0.2 },
                { translate: `${rand(-90, 90).toFixed(0)}px ${rand(220, 420).toFixed(0)}px`, rotate: `${rand(-200, 200).toFixed(0)}deg`, opacity: 0 },
              ],
              { duration: 900, easing: "cubic-bezier(0.4, 0, 0.9, 0.5)", fill: "forwards" },
            ),
          );
        });
      });
      // La cuenta se vuelve loca.
      kit.tween(T.resume - T.erase - 100, (t) => {
        tc.textContent = clock(Math.floor(seconds + (TOTAL - seconds) * t + rand(-900, 900) * (1 - t)));
        pct.textContent = `${Math.floor(rand(0, 99))}%`;
      });
    });

    kit.at(T.result, () => {
      const at = kit.heart();
      kit.shout("結果だけだ!!", vw / 2, Math.max(150, (at?.y ?? vh * 0.3) - kit.tall() * 0.5), "power-pop-word is-crimson is-big", 1300);
      kit.shake(small ? 4 : 7, 300);
    });

    // El tiempo vuelve de golpe: el medidor ya esta lleno.
    kit.at(T.resume, () => {
      playSfx("resume");
      const cut = kit.fx("kc-cut is-back");
      kit.later(180, () => cut.remove());
      root.classList.remove("kc-erased");
      voidLayer?.remove();
      deck.classList.remove("is-erased");
      deck.classList.add("is-done");
      segs.forEach((seg) => seg.getAnimations().forEach((a) => a.cancel()));
      show(100);
      tc.textContent = clock(TOTAL);
      title.textContent = lines.done;
      eta.textContent = lines.result;
      kit.keep(meter.animate([{ scale: "1.06" }, { scale: "1" }], { duration: 380, easing: "cubic-bezier(0.34, 1.56, 0.64, 1)" }));
      const r = meter.getBoundingClientRect();
      pop("バァーン", r.right - 70, r.top - 10, "power-pop-word is-crimson is-big", 1000);
      kit.frame("stand", { body: pose, face: "wink" });
    });
    kit.onCleanup(() => root.classList.remove("kc-erased"));

    kit.at(T.talk, () => kit.talk(pickLine(lines.cut), 1300));
    kit.at(T.leave, () => deck.classList.add("is-leaving"));
    kit.at(T.relay, kit.relay);

    /** Fantasmas: el nombre, el retrato y el copy, con sus estelas. */
    function ghosts(layer: HTMLElement) {
      const groups: HTMLElement[] = [];
      const group = () => {
        const g = document.createElement("div");
        g.className = "kc-ghosts";
        layer.appendChild(g);
        groups.push(g);
        return g;
      };
      const letters = kit.letters();
      const photo = kit.portrait()?.querySelector("img");
      const photoBox = kit.portrait()?.getBoundingClientRect();
      const copy = [...kit.stage.querySelectorAll<HTMLElement>(".hero-rise h1, .hero-rise p")];
      // Cada estela: cuatro copias, cada una un poco mas alla y mas tenue.
      for (let k = 0; k < 4; k++) {
        const g = group();
        if (!k) g.classList.add("is-base");
        g.style.setProperty("--k", String(k));
        for (const el of letters) {
          const r = el.getBoundingClientRect();
          const span = document.createElement("span");
          span.className = "kc-ghost-letter";
          span.textContent = el.textContent;
          Object.assign(span.style, {
            left: `${r.left}px`,
            top: `${r.top}px`,
            width: `${r.width}px`,
            height: `${r.height}px`,
            fontSize: getComputedStyle(el).fontSize,
            lineHeight: `${r.height}px`,
          });
          g.appendChild(span);
        }
        if (photo && photoBox) {
          const img = document.createElement("img");
          img.className = "kc-ghost-photo";
          img.src = photo.currentSrc || photo.src;
          img.alt = "";
          Object.assign(img.style, { left: `${photoBox.left}px`, top: `${photoBox.top}px`, width: `${photoBox.width}px`, height: `${photoBox.height}px` });
          g.appendChild(img);
        }
        for (const el of copy) {
          const r = el.getBoundingClientRect();
          if (r.top > vh || r.bottom < 0) continue;
          const text = document.createElement("span");
          text.className = "kc-ghost-text";
          text.textContent = el.textContent;
          const css = getComputedStyle(el);
          Object.assign(text.style, {
            left: `${r.left}px`,
            top: `${r.top}px`,
            width: `${r.width}px`,
            fontSize: css.fontSize,
            lineHeight: css.lineHeight,
            fontWeight: css.fontWeight,
          });
          g.appendChild(text);
        }
      }
      // Las estelas se abren a tirones, como cuadros que se saltan.
      groups.forEach((g, k) => {
        if (!k) return;
        const dx = (small ? 9 : 16) * k;
        const dy = (small ? 4 : 7) * k;
        kit.keep(
          g.animate([{ translate: "0 0" }, { translate: `${dx}px ${dy}px` }], {
            duration: 900,
            delay: 80 * k,
            easing: "steps(6, end)",
            fill: "forwards",
          }),
        );
      });
    }
  },
};
