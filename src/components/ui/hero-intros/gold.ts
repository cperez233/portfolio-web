/* editorial-ui · Cristian Pérez · cristianperez.me */

import { pickLine } from "@/components/mini-stand/pick";
import { pop, rand } from "@/components/mini-stand/power-kit";
import { BUTTERFLY, impact } from "@/components/mini-stand/powers";
import { playSfx } from "@/lib/sfx";
import { place, type IntroDef } from "./kit";
import { copyPieces, movePiece } from "./parts";
import { along, branch, defs, flower, grow, leaf, svgEl, type Limb } from "./gold-art";

/*
  Gold Experience: le da vida a lo que golpea. El Stand le cae al nombre
  con una rafaga (無駄無駄無駄) y remata (無駄ァ!): una onda dorada
  recorre la pantalla y las letras se vuelven madera de verdad, con veta.
  De la letra del golpe revienta un arbol que atraviesa la pagina (como
  las ramas que rompen el metal del helicoptero en el anime), con hojas y
  flores en las puntas, y los botones del hero se vuelven mariposas (como
  los billetes de Giorno). Las flores sueltan corazones: los likes.
  Despues todo vuelve a ser lo que era: las mariposas regresan a ser
  botones, las hojas caen, las ramas se recogen y la madera vuelve a ser
  texto.

  El arbol va en tres planos (gold-art.ts): ramas lejanas y desenfocadas
  detras del nombre, el arbol principal delante del nombre (le proyecta
  sombra) y detras del retrato y del Stand, y unas hojas grandes y
  borrosas pegadas a la camara, en los bordes. Sin contornos de tinta:
  corteza con luz y sombra, hojas con degradado y flores de petalos
  suaves.
*/
const T = {
  open: 1600,
  rush: 1820,
  hits: 10,
  step: 74,
  finisher: 2620,
  wood: 2700,
  tree: 2880,
  fly: 3650,
  hearts: 4350,
  talk: 4450,
  wither: 6050,
  relay: 7800,
} as const;

export const gold: IntroDef = {
  start: T.open,
  condense: 9300,
  run(kit) {
    const { vw, vh, small } = kit;
    const fx = kit.fx("ge-fx");
    const letters = kit.letters();
    if (!letters.length) return kit.at(T.open + 900, kit.relay);
    const woody: HTMLElement[] = [];
    const flies: { el: HTMLElement; anim: Animation }[] = [];
    const hidden: Animation[] = [];
    // La letra del remate: la del medio de CRISTIAN.
    const firstLine = letters.filter((el) => el.closest(".hero-name-first"));
    const target = firstLine[Math.floor(firstLine.length / 2)] ?? letters[0];
    const centerOf = (el: Element) => {
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2, r };
    };

    kit.frame("stand", { body: "high", face: "happy" });
    kit.lunge(0.05, 260);
    const raised = kit.hand("high");
    if (raised) kit.shout("ゴールド・エクスペリエンス!", vw / 2, raised.y - 30, "power-pop-word is-gold is-big", 1200);

    // 無駄無駄無駄: la rafaga contra el nombre.
    for (let i = 0; i < T.hits; i++) {
      kit.at(T.rush + i * T.step, () => {
        kit.frame("stand", { body: i % 2 ? "jabL" : "jab", face: "angry" });
        const el = letters[Math.floor(rand(0, letters.length))];
        const c = centerOf(el);
        impact(c.x + rand(-20, 20), c.y + rand(-20, 20), false);
        kit.keep(
          el.animate([{ translate: "0 0" }, { translate: `${rand(-8, 8).toFixed(0)}px ${rand(-6, 6).toFixed(0)}px` }, { translate: "0 0" }], {
            duration: 120,
            composite: "add",
          }),
        );
        if (i % 2 === 0) pop("無駄", c.x + rand(-60, 60), Math.max(100, c.y - c.r.height * 0.6), "power-pop-word is-gold is-big", 480);
        if (i % 3 === 0) kit.shake(small ? 3 : 5, 90);
      });
    }

    // 無駄ァ!: el remate, y la onda de vida recorre la pantalla.
    const hit = { x: vw / 2, y: vh * 0.3 };
    kit.at(T.finisher, () => {
      kit.frame("stand", { body: "jab", face: "angry" });
      kit.lunge(0.14, 280);
      const c = centerOf(target);
      hit.x = c.x;
      hit.y = c.y;
      impact(c.x, c.y, true);
      kit.shout("無駄ァ!!", c.x, c.y - (small ? 100 : 170), "power-pop-word is-gold is-big", 1000);
      kit.shake(small ? 9 : 14, 380);
      playSfx("thud");
      const flash = kit.fx("ge-flash");
      kit.later(260, () => flash.remove());
      const ring = place(fx, "ge-ring", c.x, c.y);
      const far = Math.hypot(Math.max(c.x, vw - c.x), Math.max(c.y, vh - c.y)) / 45;
      kit.keep(ring.animate([{ scale: "0.2", opacity: 1 }, { scale: String(far.toFixed(1)), opacity: 0 }], { duration: 900, easing: "cubic-bezier(0.2, 0.8, 0.3, 1)", fill: "forwards" })).onfinish = () => ring.remove();
    });

    // Las letras se vuelven madera, en onda desde el golpe.
    kit.at(T.wood, () => {
      playSfx("heal");
      for (const el of letters) {
        const c = centerOf(el);
        const delay = Math.hypot(c.x - hit.x, c.y - hit.y) * 0.45;
        kit.later(delay, () => {
          el.classList.add("ge-wood");
          woody.push(el);
          kit.keep(el.animate([{ scale: "1" }, { scale: "1.1 1.14" }, { scale: "1" }], { duration: 300, easing: "ease-out" }));
        });
      }
    });
    kit.onCleanup(() => woody.forEach((el) => el.classList.remove("ge-wood")));

    // El arbol: revienta desde la letra del golpe y atraviesa la pagina.
    const strokes: { el: SVGPathElement; f: number }[] = [];
    const leaves: SVGGElement[] = [];
    const flowers: SVGGElement[] = [];
    const grown: Animation[] = [];
    /** Pinta un plano entero: ramas que crecen y, a lo largo de ellas, hojas y flores. */
    const plant = (layer: HTMLElement, id: string, tone: "back" | "mid", limbs: Limb[], size: number) => {
      const svg = svgEl("svg", { class: "ge-branches", width: vw, height: vh });
      layer.appendChild(svg);
      defs(svg, id, tone);
      const wood = svgEl("g");
      const green = svgEl("g");
      svg.append(wood, green);
      for (const limb of limbs) {
        const ms = 260 + limb.width * 7;
        for (const stroke of branch(wood, limb, tone)) {
          strokes.push(stroke);
          grown.push(
            kit.keep(
              stroke.el.animate([{ strokeDashoffset: "1" }, { strokeDashoffset: "0" }], {
                duration: ms,
                delay: limb.delay,
                easing: "cubic-bezier(0.2, 0.8, 0.3, 1)",
                fill: "both",
              }),
            ),
          );
        }
        if (limb.depth < 1) continue;
        // Hojas a lo largo de la rama, a un lado y al otro, hacia afuera.
        const spots = limb.depth >= 2 ? [0.4, 0.7, 0.95] : [0.55, 0.85];
        spots.forEach((t, k) => {
          const [x, y, dir] = along(limb, t);
          const side = k % 2 ? 1 : -1;
          const angle = dir + side * rand(0.55, 1.05);
          const g = svgEl("g", { transform: `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${((angle * 180) / Math.PI).toFixed(0)})` });
          const l = leaf(id, size * rand(0.75, 1.3), tone);
          l.style.setProperty("--d", `${Math.round(limb.delay + ms * t + 60)}ms`);
          g.appendChild(l);
          green.appendChild(g);
          leaves.push(l);
        });
        // Flores en algunas puntas (las del plano lejano no).
        if (tone === "mid" && limb.depth >= 2 && Math.random() < 0.42) {
          const [x, y] = along(limb, 1);
          const g = svgEl("g", { transform: `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rand(0, 72).toFixed(0)})` });
          const f = flower(id, size * rand(0.5, 0.72));
          f.style.setProperty("--d", `${Math.round(limb.delay + ms + 120)}ms`);
          g.appendChild(f);
          green.appendChild(g);
          flowers.push(f);
        }
      }
    };

    kit.at(T.tree, () => {
      const scale = small ? 0.55 : 1;
      const reach = Math.min(vw, vh * 1.5);

      // Lo lejano: ramas largas y oscuras detras del nombre, desenfocadas.
      const box = kit.stage.querySelector(".hero-impact")?.closest(".relative");
      if (box) {
        const back = document.createElement("div");
        back.className = "hero-behind ge-back";
        back.setAttribute("aria-hidden", "true");
        const r = box.getBoundingClientRect();
        Object.assign(back.style, { left: `${-r.left}px`, top: `${-r.top}px`, width: `${vw}px`, height: `${vh}px` });
        box.prepend(back);
        kit.onCleanup(() => back.remove());
        const far: Limb[] = [];
        [-2.6, -1.95, -1.35, -0.75, -0.25, 0.25].forEach((a, i) =>
          grow(far, hit.x + rand(-40, 40), hit.y + rand(-10, 30), a + rand(-0.15, 0.15), reach * rand(0.3, 0.42), 20 * scale, 140 + i * 60, 0, 1),
        );
        plant(back, "ge-far", "back", far, 30 * scale);
      }

      // El arbol principal: delante del nombre, detras del retrato y del Stand.
      const layer = kit.behind("ge-tree");
      const limbs: Limb[] = [];
      const arms = small ? [-2.5, -1.75, -1.1, -0.55, 0.35, 2.8] : [-2.85, -2.3, -1.75, -1.2, -0.6, -0.2, 0.3, 2.85];
      arms.forEach((a, i) => grow(limbs, hit.x, hit.y, a + rand(-0.12, 0.12), reach * rand(0.2, 0.28), 30 * scale, i * 40, 0));
      // Y unas raices que bajan entre las letras.
      [0.7, 1.6, 2.4].forEach((a) => grow(limbs, hit.x, hit.y, a + rand(-0.15, 0.15), reach * 0.13, 14 * scale, 120, 3));
      plant(layer, "ge-near", "mid", limbs, 40 * scale);

      // Lo que esta pegado a la camara: hojas grandes y borrosas en los bordes.
      const front = kit.fx("ge-front");
      const corners: [number, number, number][] = small
        ? [[-0.04, 0.12, 30], [1.02, 0.3, 200], [-0.02, 0.86, -20], [1.04, 0.92, 210]]
        : [[-0.02, 0.1, 25], [0.2, -0.04, 70], [1.02, 0.14, 160], [-0.03, 0.62, -10], [1.03, 0.7, 195], [0.86, 1.04, 245]];
      corners.forEach(([fx0, fy0, deg], i) => {
        const size = (small ? 150 : 250) * rand(0.85, 1.15);
        const svg = svgEl("svg", { class: "ge-front-leaf", width: size * 1.1, height: size * 0.8, viewBox: `${-size * 0.05} ${-size * 0.4} ${size * 1.1} ${size * 0.8}` });
        defs(svg, `ge-cam${i}`, "front");
        svg.appendChild(leaf(`ge-cam${i}`, size, "front"));
        place(front, "ge-cam", fx0 * vw, fy0 * vh).appendChild(svg);
        svg.style.rotate = `${deg}deg`;
        svg.style.animationDelay = `${300 + i * 90}ms`;
      });

      kit.shake(small ? 4 : 7, 260);
      kit.later(200, () => pop("メキメキ", hit.x + (small ? 60 : 120), Math.max(110, hit.y - (small ? 120 : 200)), "power-pop-word is-green is-big", 900));
    });

    // Los botones se vuelven mariposas.
    kit.at(T.fly, () => {
      kit.frame("stand", { body: "high", face: "happy" });
      const colors = [
        ["#e3b341", "#fff3c4"],
        ["#8fd3f4", "#ece6d8"],
        ["#e891c4", "#fbe1ef"],
      ];
      copyPieces(kit.stage)
        .filter((el) => !el.querySelector("h1") && el.tagName !== "P" && !el.querySelector("p"))
        .forEach((el, i) => {
          const c = centerOf(el);
          hidden.push(
            kit.keep(
              movePiece(el, [{ s: 1, opacity: 1 }, { s: 1.12, opacity: 1, offset: 0.4 }, { s: 0.2, opacity: 0 }], {
                duration: 360,
                delay: i * 70,
                easing: "ease-in",
                fill: "both",
              }),
            ),
          );
          const [a, b] = colors[i % colors.length];
          const fly = place(fx, "ge-fly", c.x, c.y, BUTTERFLY(`gef${i}`, a, b));
          fly.style.scale = small ? "1.3" : "1.9";
          const dx = rand(-0.45, 0.45) * vw;
          const dy = -rand(0.35, 0.62) * vh;
          const anim = kit.keep(
            fly.animate(
              [
                { translate: "0 0", rotate: "0deg", opacity: 0 },
                { translate: "0 -20px", opacity: 1, offset: 0.1 },
                { translate: `${(dx * 0.4).toFixed(0)}px ${(dy * 0.5).toFixed(0)}px`, rotate: `${rand(-30, 30).toFixed(0)}deg`, offset: 0.45 },
                { translate: `${dx.toFixed(0)}px ${dy.toFixed(0)}px`, rotate: `${rand(-20, 20).toFixed(0)}deg`, opacity: 1 },
              ],
              { duration: 2000, delay: 200 + i * 70, easing: "ease-in-out", fill: "both" },
            ),
          );
          flies.push({ el: fly, anim });
        });
    });

    // Las flores sueltan corazones: los likes.
    kit.at(T.hearts, () => {
      flowers
        .slice(0, small ? 6 : 12)
        .forEach((el, i) => {
          const r = el.getBoundingClientRect();
          const heart = place(fx, "ge-heart", r.left + r.width / 2, r.top + r.height / 2, "♥");
          heart.style.setProperty("--hx", `${rand(-50, 50).toFixed(0)}px`);
          heart.style.setProperty("--hy", `${rand(-160, -90).toFixed(0)}px`);
          heart.style.animationDelay = `${i * 90}ms`;
        });
    });

    kit.at(T.talk, () => {
      kit.frame("stand", { body: "idle", face: "blush" });
      kit.talk(pickLine(kit.lines.gold), 1400);
    });

    // Todo vuelve a ser lo que era.
    kit.at(T.wither, () => {
      kit.frame("stand", { body: "idle", face: "happy" });
      // Las mariposas regresan a ser botones.
      flies.forEach(({ el, anim }) => {
        anim.playbackRate = -2.4;
        anim.play();
        anim.onfinish = () => el.remove();
      });
      kit.later(700, () =>
        hidden.forEach((a) => {
          a.playbackRate = -1.5;
          a.play();
        }),
      );
      // Las hojas caen; las flores se cierran; las hojas de la camara se van.
      leaves.forEach((el, i) => {
        kit.keep(
          el.animate(
            [
              { translate: "0 0", rotate: "0deg", opacity: 1 },
              { translate: `${rand(-50, 50).toFixed(0)}px ${rand(120, 300).toFixed(0)}px`, rotate: `${rand(-160, 160).toFixed(0)}deg`, opacity: 0 },
            ],
            { duration: rand(700, 1100), delay: (i % 16) * 22, easing: "cubic-bezier(0.4, 0, 0.8, 0.6)", fill: "forwards" },
          ),
        );
      });
      flowers.forEach((el, i) => kit.keep(el.animate([{ scale: "1" }, { scale: "0" }], { duration: 320, delay: (i % 10) * 30, easing: "ease-in", fill: "forwards" })));
      document.querySelectorAll<HTMLElement>(".ge-front .ge-cam").forEach((el) => el.classList.add("is-leaving"));
      // Las ramas se recogen hacia la letra.
      grown.forEach((a) => a.cancel());
      strokes.forEach(({ el }) =>
        kit.keep(el.animate([{ strokeDashoffset: "0" }, { strokeDashoffset: "1" }], { duration: 560, delay: 380, easing: "cubic-bezier(0.6, 0, 0.7, 0.3)", fill: "both" })),
      );
      // La madera vuelve a ser texto, en onda hacia el golpe.
      for (const el of woody) {
        const c = centerOf(el);
        const back = 700 + Math.max(0, 500 - Math.hypot(c.x - hit.x, c.y - hit.y) * 0.4);
        kit.later(back, () => {
          el.classList.remove("ge-wood");
          kit.keep(el.animate([{ scale: "1" }, { scale: "1.12 0.9" }, { scale: "1" }], { duration: 260, easing: "ease-out" }));
        });
      }
      kit.later(1300, () => fx.classList.add("is-leaving"));
    });
    kit.at(T.relay, kit.relay);
  },
};
