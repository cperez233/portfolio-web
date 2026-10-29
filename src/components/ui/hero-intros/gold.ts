/* editorial-ui · Cristian Pérez · cristianperez.me */

import { pickLine } from "@/components/mini-stand/pick";
import { pop, rand } from "@/components/mini-stand/power-kit";
import { BUTTERFLY, FLOWER, impact, LEAF } from "@/components/mini-stand/powers";
import { playSfx } from "@/lib/sfx";
import { place, type IntroDef } from "./kit";
import { copyPieces, movePiece } from "./parts";

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

  El arbol vive dentro del hero (kit.behind): el Stand y el retrato
  quedan delante de las ramas.
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

interface Limb {
  d: string;
  width: number;
  delay: number;
  tip: [number, number];
  depth: number;
}

/** Ramas que salen de (x, y) hacia `angle`, y se abren en otras mas finas. */
function grow(out: Limb[], x: number, y: number, angle: number, len: number, width: number, delay: number, depth: number) {
  const bend = rand(-0.35, 0.35);
  const x1 = x + Math.cos(angle) * len;
  const y1 = y + Math.sin(angle) * len;
  const cx = (x + x1) / 2 + Math.cos(angle + Math.PI / 2) * len * bend * 0.4;
  const cy = (y + y1) / 2 + Math.sin(angle + Math.PI / 2) * len * bend * 0.4;
  const ms = 180 + len * 0.55;
  out.push({ d: `M${x.toFixed(1)} ${y.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`, width, delay, tip: [x1, y1], depth });
  if (depth >= 2) return;
  // Hijas: una a media rama y dos en la punta, cada una mas fina.
  const at = (t: number) => {
    const u = 1 - t;
    return [u * u * x + 2 * u * t * cx + t * t * x1, u * u * y + 2 * u * t * cy + t * t * y1] as const;
  };
  const [mx, my] = at(0.55);
  const side = Math.random() < 0.5 ? -1 : 1;
  grow(out, mx, my, angle + side * rand(0.5, 0.85), len * rand(0.45, 0.6), width * 0.55, delay + ms * 0.55, depth + 1);
  grow(out, x1, y1, angle - rand(0.3, 0.6), len * rand(0.55, 0.72), width * 0.62, delay + ms, depth + 1);
  grow(out, x1, y1, angle + rand(0.3, 0.6), len * rand(0.5, 0.68), width * 0.6, delay + ms + 40, depth + 1);
}

export const gold: IntroDef = {
  start: T.open,
  condense: 9300,
  run(kit) {
    const { vw, vh, small } = kit;
    const fx = kit.fx("ge-fx");
    const letters = kit.letters();
    if (!letters.length) return kit.at(T.open + 900, kit.relay);
    const woody: HTMLElement[] = [];
    const blooms: HTMLElement[] = [];
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
    const svgNs = "http://www.w3.org/2000/svg";
    let art: SVGSVGElement | null = null;
    const paths: SVGPathElement[] = [];
    kit.at(T.tree, () => {
      const layer = kit.behind("ge-tree");
      art = document.createElementNS(svgNs, "svg");
      art.setAttribute("class", "ge-branches");
      art.setAttribute("width", String(vw));
      art.setAttribute("height", String(vh));
      layer.appendChild(art);
      const limbs: Limb[] = [];
      const scale = small ? 0.55 : 1;
      const reach = Math.min(vw, vh * 1.5);
      // Brazos principales, abiertos hacia arriba y a los lados.
      const arms = small ? [-2.5, -1.75, -1.1, -0.55, 0.35, 2.8] : [-2.85, -2.3, -1.75, -1.2, -0.6, -0.2, 0.3, 2.85];
      arms.forEach((a, i) => grow(limbs, hit.x, hit.y, a + rand(-0.12, 0.12), reach * rand(0.2, 0.28), 26 * scale, i * 40, 0));
      // Y unas raices que bajan entre las letras.
      [0.7, 1.6, 2.4].forEach((a) => grow(limbs, hit.x, hit.y, a + rand(-0.15, 0.15), reach * 0.13, 14 * scale, 120, 3));

      for (const limb of limbs) {
        for (const [cls, w] of [
          ["ge-ink", limb.width + 6],
          ["ge-bark", limb.width],
          ["ge-grain", Math.max(1.5, limb.width * 0.18)],
        ] as const) {
          const path = document.createElementNS(svgNs, "path");
          path.setAttribute("d", limb.d);
          path.setAttribute("class", cls);
          path.setAttribute("pathLength", "1");
          path.style.strokeWidth = `${w.toFixed(1)}px`;
          art.appendChild(path);
          paths.push(path);
          kit.keep(
            path.animate([{ strokeDashoffset: "1" }, { strokeDashoffset: "0" }], {
              duration: 260 + limb.width * 6,
              delay: limb.delay,
              easing: "cubic-bezier(0.2, 0.8, 0.3, 1)",
              fill: "both",
            }),
          );
        }
        // Hojas y flores en las puntas finas.
        if (limb.depth >= 1 && limb.depth <= 2) {
          const flowers = [FLOWER("#f4c6e0", "#e891c4"), FLOWER("#fbf7ec", "#e3d6b8"), FLOWER("#e3b341", "#a87a1f")];
          const n = limb.depth === 2 ? 3 : 1;
          for (let k = 0; k < n; k++) {
            const flower = k === 0 && Math.random() < 0.45;
            const el = place(layer, "ge-bloom", limb.tip[0] + rand(-14, 14), limb.tip[1] + rand(-14, 14), flower ? flowers[Math.floor(rand(0, 3))] : LEAF);
            el.style.setProperty("--s", String((flower ? rand(1.1, 1.45) : rand(0.95, 1.4)) * (small ? 0.8 : 1.3)));
            el.style.setProperty("--r", `${rand(-90, 90).toFixed(0)}deg`);
            el.style.animationDelay = `${(limb.delay + 260 + k * 60).toFixed(0)}ms`;
            if (flower) el.dataset.flower = "";
            blooms.push(el);
          }
        }
      }
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
      blooms
        .filter((el) => "flower" in el.dataset)
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
      // Las hojas caen; las flores se cierran.
      blooms.forEach((el, i) => {
        el.style.animationDelay = "";
        if ("flower" in el.dataset) {
          el.style.setProperty("--d", `${(i % 10) * 30}ms`);
          el.classList.add("is-closing");
          return;
        }
        el.classList.add("is-falling");
        kit.keep(
          el.animate(
            [
              { translate: "-50% -50%", rotate: getComputedStyle(el).rotate, opacity: 1 },
              { translate: `calc(-50% + ${rand(-60, 60).toFixed(0)}px) calc(-50% + ${rand(140, 320).toFixed(0)}px)`, rotate: `${rand(-200, 200).toFixed(0)}deg`, opacity: 0 },
            ],
            { duration: rand(700, 1100), delay: (i % 14) * 25, easing: "cubic-bezier(0.4, 0, 0.8, 0.6)", fill: "forwards" },
          ),
        );
      });
      // Las ramas se recogen hacia la letra.
      paths.forEach((path) =>
        kit.keep(path.animate([{ strokeDashoffset: "0" }, { strokeDashoffset: "1" }], { duration: 520, delay: 380, easing: "cubic-bezier(0.6, 0, 0.7, 0.3)", fill: "both" })),
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
