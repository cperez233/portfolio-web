/* editorial-ui · Cristian Pérez · cristianperez.me */

import { pickLine } from "@/components/mini-stand/pick";
import { pop, rand } from "@/components/mini-stand/power-kit";
import { FLOWER, LADYBUG, LEAF } from "@/components/mini-stand/powers";
import { place, type IntroDef } from "./kit";

/*
  Gold Experience: le da vida al nombre. El Stand lo toca con el puno en
  alto y desde ahi una onda dorada recorre las letras, que se vuelven
  madera. De cada una brotan ramas (trazos que se dibujan), con hojas y
  flores en las puntas, y una mariquita (el broche de Giorno) camina por
  encima de CRISTIAN. Las flores sueltan petalos en forma de corazon (los
  likes), el Stand lo dice, y todo se recoge: las ramas se borran hacia
  la letra, las flores se cierran y las letras vuelven a ser texto.
*/
const T = {
  open: 1600,
  touch: 1800,
  grow: 2000,
  hearts: 3700,
  talk: 3500,
  wither: 5100,
  relay: 6600,
} as const;

interface Branch {
  d: string;
  /** Punta y punto medio, en px de la ventana. */
  tip: [number, number];
  mid: [number, number];
  delay: number;
  width: number;
}

export const gold: IntroDef = {
  start: T.open,
  condense: 8200,
  run(kit) {
    const fx = kit.fx("ge-fx");
    const svgNs = "http://www.w3.org/2000/svg";
    const art = document.createElementNS(svgNs, "svg");
    art.setAttribute("class", "ge-branches");
    art.setAttribute("width", String(kit.vw));
    art.setAttribute("height", String(kit.vh));
    fx.appendChild(art);
    const blooms: HTMLElement[] = [];
    const paths: SVGPathElement[] = [];
    const woody: HTMLElement[] = [];

    kit.stage.classList.add("ge-tween");
    kit.onCleanup(() => kit.stage.classList.remove("ge-tween"));
    kit.frame("stand", { body: "high", face: "happy" });
    kit.lunge(0.05, 260);
    const raised = kit.hand("high");
    if (raised) pop("ゴールド・エクスペリエンス", Math.min(kit.vw - 150, Math.max(150, raised.x)), Math.max(96, raised.y - 40), "power-pop-word is-gold", 1300);

    kit.at(T.touch, () => {
      kit.frame("stand", { body: "point", face: "happy" });
      kit.lunge(0.07, 260);
      const hand = kit.hand("point");
      const letters = kit.letters();
      if (!hand || !letters.length) return;
      // La letra mas cercana a la mano: de ahi sale la onda.
      const origin = letters
        .map((el) => {
          const r = el.getBoundingClientRect();
          return { el, x: r.left + r.width / 2, y: r.top + r.height / 2 };
        })
        .sort((a, b) => Math.hypot(a.x - hand.x, a.y - hand.y) - Math.hypot(b.x - hand.x, b.y - hand.y))[0];
      const ring = place(fx, "ge-ring", origin.x, origin.y);
      kit.keep(ring.animate([{ scale: "0.1", opacity: 1 }, { scale: "4", opacity: 0 }], { duration: 700, easing: "cubic-bezier(0.2, 0.9, 0.3, 1)", fill: "forwards" }));
      kit.shout("無駄ァ!", origin.x, origin.y - (kit.small ? 90 : 150), "power-pop-word is-gold is-big", 900);

      // La onda: cada letra se vuelve madera segun su distancia al toque.
      const branches: Branch[] = [];
      for (const el of letters) {
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const dist = Math.hypot(cx - origin.x, r.top + r.height / 2 - origin.y);
        const delay = 120 + dist * 0.55;
        kit.later(delay, () => {
          el.classList.add("ge-wood");
          woody.push(el);
          kit.keep(el.animate([{ scale: "1" }, { scale: "1.08 1.12" }, { scale: "1" }], { duration: 320, easing: "ease-out" }));
        });
        // Ramas: de arriba de la letra, curvas hacia afuera; alguna de un costado.
        const h = r.height;
        const count = kit.small ? 1 + (Math.random() < 0.5 ? 1 : 0) : 2;
        for (let i = 0; i < count; i++) {
          const side = Math.random() < 0.5 ? -1 : 1;
          const fromTop = i === 0 || Math.random() < 0.6;
          const x0 = fromTop ? r.left + r.width * rand(0.25, 0.75) : side < 0 ? r.left + r.width * 0.12 : r.right - r.width * 0.12;
          const y0 = fromTop ? r.top + h * 0.12 : r.top + h * rand(0.3, 0.6);
          const len = h * rand(0.45, 0.8);
          const angle = fromTop ? -Math.PI / 2 + side * rand(0.25, 0.75) : (side < 0 ? Math.PI : 0) + rand(-0.6, -0.15) * (side < 0 ? -1 : 1);
          // Sin subir sobre la barra de navegacion.
          const rise = -Math.sin(angle) * len;
          const reach = rise > 0 ? Math.min(len, (len * Math.max(0, y0 - 96)) / rise) : len;
          const x1 = x0 + Math.cos(angle) * reach;
          const y1 = y0 + Math.sin(angle) * reach;
          const bend = side * reach * rand(0.18, 0.32);
          const cx1 = (x0 + x1) / 2 + Math.cos(angle + Math.PI / 2) * bend;
          const cy1 = (y0 + y1) / 2 + Math.sin(angle + Math.PI / 2) * bend;
          branches.push({
            d: `M${x0.toFixed(1)} ${y0.toFixed(1)} Q${cx1.toFixed(1)} ${cy1.toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`,
            tip: [x1, y1],
            mid: [(x0 + 2 * cx1 + x1) / 4, (y0 + 2 * cy1 + y1) / 4],
            delay: delay + 140 + i * 90,
            width: Math.max(3, h * 0.045),
          });
        }
      }

      const flowers = [FLOWER("#f4c6e0", "#e891c4"), FLOWER("#fbf7ec", "#e3d6b8"), FLOWER("#e3b341", "#a87a1f")];
      const scale = kit.small ? 0.7 : 1.05;
      branches.forEach((b, i) => {
        // Dos trazos: la tinta, mas gruesa, debajo; la corteza encima.
        for (const [cls, w] of [
          ["ge-ink", b.width + 4],
          ["ge-bark", b.width],
        ] as const) {
          const path = document.createElementNS(svgNs, "path");
          path.setAttribute("d", b.d);
          path.setAttribute("class", cls);
          path.setAttribute("pathLength", "1");
          path.style.strokeWidth = `${w}px`;
          art.appendChild(path);
          paths.push(path);
          kit.keep(path.animate([{ strokeDashoffset: "1" }, { strokeDashoffset: "0" }], { duration: 420, delay: b.delay, easing: "cubic-bezier(0.3, 0.7, 0.4, 1)", fill: "both" }));
        }
        // Hoja a mitad de rama, flor (o hoja) en la punta.
        const leaf = place(fx, "ge-bloom", b.mid[0], b.mid[1], LEAF);
        leaf.style.setProperty("--s", String(scale * 0.8));
        leaf.style.setProperty("--r", `${rand(-80, 80).toFixed(0)}deg`);
        leaf.style.animationDelay = `${b.delay + 260}ms`;
        const tipArt = i % 3 === 2 ? LEAF : flowers[i % flowers.length];
        const tip = place(fx, "ge-bloom", b.tip[0], b.tip[1], tipArt);
        tip.style.setProperty("--s", String(scale * rand(0.9, 1.15)));
        tip.style.setProperty("--r", `${rand(-30, 30).toFixed(0)}deg`);
        tip.style.animationDelay = `${b.delay + 380}ms`;
        if (tipArt !== LEAF) tip.dataset.flower = "";
        blooms.push(leaf, tip);
      });

      // La mariquita camina por encima de la primera linea.
      const firstLine = letters.filter((el) => el.closest(".hero-name-first"));
      if (firstLine.length > 1) {
        const a = firstLine[0].getBoundingClientRect();
        const z = firstLine[firstLine.length - 1].getBoundingClientRect();
        const bug = place(fx, "ge-bug", a.left + a.width * 0.3, a.top + a.height * 0.06, LADYBUG);
        kit.keep(
          bug.animate([{ translate: "0 0", opacity: 0 }, { opacity: 1, offset: 0.08 }, { opacity: 1, offset: 0.9 }, { translate: `${(z.right - a.left - a.width * 0.6).toFixed(0)}px 0`, opacity: 0 }], {
            duration: 2900,
            delay: 600,
            easing: "linear",
            fill: "both",
          }),
        );
      }
    });

    kit.at(T.talk, () => {
      kit.frame("stand", { body: "high", face: "blush" });
      kit.talk(pickLine(kit.lines.gold), 1300);
    });

    // Las flores sueltan corazones: los likes.
    kit.at(T.hearts, () => {
      const flowers = blooms.filter((el) => "flower" in el.dataset);
      flowers.forEach((el, i) => {
        const r = el.getBoundingClientRect();
        for (let j = 0; j < (kit.small ? 1 : 2); j++) {
          const heart = place(fx, "ge-heart", r.left + r.width / 2, r.top + r.height / 2, "♥");
          heart.style.setProperty("--hx", `${rand(-50, 50).toFixed(0)}px`);
          heart.style.setProperty("--hy", `${rand(-160, -90).toFixed(0)}px`);
          heart.style.animationDelay = `${i * 70 + j * 180}ms`;
        }
      });
    });

    // Todo se recoge: ramas hacia la letra, flores que se cierran, letras de vuelta.
    kit.at(T.wither, () => {
      kit.frame("stand", { body: "idle", face: "happy" });
      blooms.forEach((el, i) => {
        el.style.animationDelay = "";
        el.style.setProperty("--d", `${(i % 12) * 25}ms`);
        el.classList.add("is-closing");
      });
      paths.forEach((path) =>
        kit.keep(path.animate([{ strokeDashoffset: "0" }, { strokeDashoffset: "1" }], { duration: 460, delay: 120, easing: "cubic-bezier(0.6, 0, 0.7, 0.3)", fill: "both" })),
      );
      kit.later(420, () => woody.forEach((el) => el.classList.remove("ge-wood")));
      kit.later(1000, () => fx.classList.add("is-leaving"));
    });
    kit.onCleanup(() => woody.forEach((el) => el.classList.remove("ge-wood")));
    kit.at(T.relay, kit.relay);
  },
};
