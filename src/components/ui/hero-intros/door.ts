/* editorial-ui · Cristian Pérez · cristianperez.me */

import { pickLine } from "@/components/mini-stand/pick";
import { pop, rand } from "@/components/mini-stand/power-kit";
import { playSfx } from "@/lib/sfx";
import { ease, type IntroDef, type IntroKit } from "./kit";

/*
  Heaven's Door: el Stand de Rohan, el mangaka, vuelve libro a quien
  toca y le escribe ordenes en las paginas. Aqui el libro eres tu: el
  Stand traza el garabato en el aire (como Rohan dibujando a Pink Dark
  Boy), la pantalla se abre en paginas que pasan a toda velocidad y
  queda abierta una pagina de manga, con vinetas, trama, lineas de
  velocidad y globos. En la vineta grande el Stand te escribe la orden a
  mano: una al azar, todas sobre lo que hace Cris ("Compraras una web,
  un aplicativo o varios"). La firma con un sello, se rie y el libro se
  cierra.

  En escritorio va a doble pagina (la izquierda es tu pagina "de vida",
  llena de texto, como en el anime); en celular, una sola. El libro va
  donde no tapa al Stand: a su lado o debajo.
*/
const T = {
  open: 1600,
  stroke: 1820,
  book: 2280,
  riffle: 2380,
  write: 3050,
  closeAfter: 1250,
  relay: 8200,
} as const;

const WRITE_STEP = 36;

const esc = (text: string) => text.replace(/[&<>"]/g, (ch) => `&#${ch.charCodeAt(0)};`);

/** Renglones de "texto" de manga: rayas de tinta de largo distinto. */
const scribble = (n: number) =>
  Array.from({ length: n }, () => `<i style="width:${Math.round(rand(55, 100))}%"></i>`).join("");

/** Donde va el libro: al lado del Stand si hay sitio, si no debajo. */
function placeBook(kit: IntroKit) {
  const stand = kit.stage.querySelector(".hero-stand-core svg")?.getBoundingClientRect();
  const { vw, vh } = kit;
  const top = 84;
  const roomLeft = (stand?.left ?? vw) - 28;
  const roomRight = vw - (stand?.right ?? vw) - 28;
  const side = Math.max(roomLeft, roomRight);
  if (!kit.small && side >= 560) {
    const height = Math.min(600, vh - top - 90);
    const width = Math.min(side - 16, height * 1.45, 1000);
    const left = roomLeft >= roomRight ? Math.max(16, roomLeft - width) : vw - roomRight + 12;
    return { left, top: Math.max(top, (vh - height) / 2 - 10), width, height, spread: true };
  }
  const below = Math.max(top, (stand?.bottom ?? vh * 0.35) - 8);
  const height = Math.min(520, vh - below - 76);
  const width = Math.min(vw - 24, height * 0.78);
  return { left: (vw - width) / 2, top: below, width, height, spread: false };
}

export const door: IntroDef = {
  start: T.open,
  condense: 10400,
  prepare() {
    // La letra a mano, antes de que haga falta.
    try {
      const family = getComputedStyle(document.documentElement).getPropertyValue("--font-caveat").trim();
      if (family) void document.fonts.load(`700 32px ${family}`).catch(() => {});
    } catch {}
  },
  run(kit) {
    const lines = kit.lines.door;
    const order = pickLine(lines.orders);
    const fx = kit.fx("hd-fx");
    const box = placeBook(kit);

    kit.frame("stand", { body: "point", face: "smug" });
    kit.lunge(0.05, 240);
    const hand0 = kit.hand("point");
    if (hand0) kit.shout("ヘブンズ・ドアー!", kit.vw / 2, hand0.y - kit.tall() * 0.6, "power-pop-word is-gold is-big", 1200);

    // El garabato en el aire: de la mano al centro del libro, en tres rizos.
    kit.at(T.stroke, () => {
      const from = kit.hand("point");
      if (!from) return;
      const cx = box.left + box.width / 2;
      const cy = box.top + box.height / 2;
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("class", "hd-stroke");
      svg.setAttribute("width", String(kit.vw));
      svg.setAttribute("height", String(kit.vh));
      const r = Math.min(box.width, box.height) * 0.16;
      let d = `M${from.x.toFixed(0)} ${from.y.toFixed(0)}`;
      for (let i = 1; i <= 3; i++) {
        const t = i / 3;
        const x = from.x + (cx - from.x) * t;
        const y = from.y + (cy - from.y) * t;
        d += ` C${(x - r * 1.4).toFixed(0)} ${(y - r * 1.6).toFixed(0)} ${(x + r * 1.5).toFixed(0)} ${(y - r * 1.2).toFixed(0)} ${x.toFixed(0)} ${y.toFixed(0)}`;
      }
      svg.innerHTML = `<path class="hd-stroke-ink" pathLength="1" d="${d}"/><path pathLength="1" d="${d}"/>`;
      fx.appendChild(svg);
      for (const path of svg.querySelectorAll("path")) {
        kit.keep(path.animate([{ strokeDashoffset: "1" }, { strokeDashoffset: "0" }], { duration: 380, easing: "cubic-bezier(0.5, 0, 0.3, 1)", fill: "both" }));
      }
      pop("シュッ", Math.min(kit.vw - 60, cx + 40), Math.max(110, cy - r * 2), "power-pop-word is-gold", 700);
      kit.later(560, () => svg.classList.add("is-leaving"));
      kit.later(900, () => svg.remove());
    });

    // El libro: la pantalla se abre en paginas que pasan solas.
    let book: HTMLElement | null = null;
    let ink: HTMLElement | null = null;
    kit.at(T.book, () => {
      fx.classList.add("is-dim");
      book = document.createElement("div");
      book.className = box.spread ? "hd-book is-spread" : "hd-book";
      Object.assign(book.style, { left: `${box.left}px`, top: `${box.top}px`, width: `${box.width}px`, height: `${box.height}px` });
      const life =
        `<div class="hd-page is-life">` +
        `<span class="hd-folio">${esc(lines.lifeLabel)}</span>` +
        `<div class="hd-grid is-life">` +
        `<div class="hd-panel is-tone"><span class="hd-lines">${scribble(7)}</span></div>` +
        `<div class="hd-panel is-speed"><b class="hd-sfx">ドドド</b></div>` +
        `<div class="hd-panel is-wide"><span class="hd-lines">${scribble(9)}</span></div>` +
        `<div class="hd-panel"><span class="hd-lines">${scribble(5)}</span></div>` +
        `<div class="hd-panel is-tone is-dark"><span class="hd-lines">${scribble(5)}</span></div>` +
        `</div></div>`;
      const orderPage =
        `<div class="hd-page is-order">` +
        `<span class="hd-folio">${esc(lines.orderLabel)}</span>` +
        `<div class="hd-grid is-order">` +
        `<div class="hd-panel is-speed is-small"><b class="hd-sfx is-gold">ヘブンズ・ドアー</b></div>` +
        `<div class="hd-panel is-tone is-small"><b class="hd-sfx">カキカキ</b></div>` +
        `<div class="hd-panel is-big"><p class="hd-balloon"><span class="hd-text"><span class="hd-ink"></span><i class="hd-nib"></i></span>` +
        `<svg class="hd-under" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M2 6 Q30 2 55 6 T98 4"/></svg></p>` +
        `<span class="hd-seal">${esc(lines.seal)}</span></div>` +
        `</div></div>`;
      book.innerHTML = (box.spread ? life : "") + orderPage + `<div class="hd-leaves"></div>`;
      fx.appendChild(book);
      ink = book.querySelector<HTMLElement>(".hd-ink");
      kit.keep(
        book.animate(
          [
            { scale: "0.2 0.02", opacity: 0 },
            { scale: "1 0.04", opacity: 1, offset: 0.35 },
            { scale: "1", opacity: 1 },
          ],
          { duration: 360, easing: "cubic-bezier(0.2, 0.9, 0.3, 1)", fill: "backwards" },
        ),
      );
      kit.shake(kit.small ? 4 : 7, 260);
      playSfx("thud");
      pop("バララッ", box.left + box.width * 0.8, Math.max(100, box.top - 6), "power-pop-word is-gold is-big", 900);
    });

    // Las paginas pasan a toda velocidad (riffle), de derecha a izquierda.
    kit.at(T.riffle, () => {
      const leaves = book?.querySelector<HTMLElement>(".hd-leaves");
      if (!leaves) return;
      const count = kit.small ? 6 : 9;
      for (let i = 0; i < count; i++) {
        const leaf = document.createElement("span");
        leaf.className = "hd-leaf";
        leaf.innerHTML = `<span class="hd-lines">${scribble(10)}</span>`;
        leaves.appendChild(leaf);
        kit.keep(
          leaf.animate(
            [
              { transform: "rotateY(0deg)", filter: "brightness(1)" },
              { transform: "rotateY(-90deg)", filter: "brightness(0.75)", offset: 0.5 },
              { transform: "rotateY(-180deg)", filter: "brightness(1)" },
            ],
            { duration: 300, delay: i * 55, easing: "cubic-bezier(0.4, 0, 0.6, 1)", fill: "both" },
          ),
        ).onfinish = () => leaf.remove();
      }
    });

    // La orden, a mano, letra por letra; la pluma va delante.
    let written = 0;
    kit.at(T.write, () => {
      kit.frame("stand", { body: "point", face: "laugh" });
      if (!ink) return;
      const target = ink;
      const chars = Array.from(order);
      const timer = window.setInterval(() => {
        written += 1;
        target.textContent = chars.slice(0, written).join("");
        if (written % 14 === 1) {
          const r = target.getBoundingClientRect();
          pop(written % 28 === 1 ? "カキッ" : "カリカリ", Math.min(kit.vw - 50, r.right + 10), Math.max(100, r.top - 24), "power-pop-word is-gold", 520);
        }
        if (written >= chars.length) window.clearInterval(timer);
      }, WRITE_STEP);
      kit.onCleanup(() => window.clearInterval(timer));
    });

    const done = T.write + Array.from(order).length * WRITE_STEP + 140;
    // Subrayado de un trazo y el sello: ドン.
    kit.at(done, () => book?.classList.add("is-signed"));
    kit.at(done + 380, () => {
      book?.classList.add("is-sealed");
      kit.frame("stand", { body: "high", face: "smug" });
      const seal = book?.querySelector(".hd-seal")?.getBoundingClientRect();
      if (seal) kit.shout("ドン!", seal.right + 40, seal.top + 10, "power-pop-word is-gold is-big", 900);
      kit.shake(kit.small ? 5 : 8, 280);
      playSfx("thud");
    });

    // Se rie y el libro se cierra: las paginas pasan al reves y se va.
    const close = done + 380 + T.closeAfter;
    kit.at(close, () => {
      book?.classList.add("is-closing");
      kit.frame("stand", { body: "idle", face: "laugh" });
      if (book) {
        const b = book;
        kit.tween(
          420,
          (t) => {
            b.style.scale = `${1 - t * 0.12} ${1 - t * 0.98}`;
            b.style.opacity = String(1 - t * t);
          },
          ease.in,
        );
      }
      kit.later(260, () => fx.classList.remove("is-dim"));
    });
    kit.at(close + 520, () => {
      fx.classList.add("is-leaving");
      kit.frame("stand", { face: "wink" });
      kit.talk(pickLine(lines.done), 1100);
    });
    kit.at(Math.min(9600, Math.max(T.relay, close + 1900)), kit.relay);
  },
};
