/* editorial-ui · Cristian Pérez · cristianperez.me */

import { pickLine } from "@/components/mini-stand/pick";
import { pop } from "@/components/mini-stand/power-kit";
import { type IntroDef, typeInto } from "./kit";

/*
  Heaven's Door: el Stand de Rohan, el mangaka, convierte a la gente en
  libros que se pueden leer, y escribe ordenes en sus paginas. Aqui el
  Stand traza una linea en el aire (como un dibujante) y la linea se
  abre en un libro: dos hojas que giran como puertas. La de la izquierda
  es la ficha de Cris, renglon por renglon. En la de la derecha el Stand
  escribe la orden, a ti: recordaras que Cris es ingeniero de sistemas y
  creador de contenido. La subraya, el libro se cierra y se rie.

  El libro se abre donde no tapa al Stand: a su izquierda si hay sitio
  (escritorio), debajo si no (celular).
*/
const T = {
  open: 1600,
  stroke: 1800,
  book: 2100,
  rows: 2450,
  rowStep: 200,
  order: 3600,
  closeAfter: 450,
  relay: 7400,
} as const;

const ORDER_STEP = 24;

const esc = (text: string) => text.replace(/[&<>"]/g, (ch) => `&#${ch.charCodeAt(0)};`);

export const door: IntroDef = {
  start: T.open,
  condense: 9300,
  run(kit) {
    const lines = kit.lines.door;
    const fx = kit.fx("hd-fx");
    kit.frame("stand", { body: "point", face: "smug" });
    kit.lunge(0.05, 240);
    const hand0 = kit.hand("point");
    if (hand0) kit.shout("ヘブンズ・ドアー!", kit.vw / 2, hand0.y - kit.tall() * 0.6, "power-pop-word is-gold is-big", 1200);

    // Donde va el libro: a la izquierda del Stand o debajo.
    const place = () => {
      const stand = kit.stage.querySelector(".hero-stand-core svg")?.getBoundingClientRect();
      const name = kit.letters().map((el) => el.getBoundingClientRect());
      const top = name.length ? Math.min(...name.map((r) => r.top)) : kit.vh * 0.25;
      const bottom = name.length ? Math.max(...name.map((r) => r.bottom)) : kit.vh * 0.6;
      const roomLeft = (stand?.left ?? kit.vw) - 24;
      if (!kit.small && stand && roomLeft > 520) {
        const width = Math.min(720, roomLeft - 16);
        const height = 300;
        return { left: Math.max(16, roomLeft - width), top: Math.max(96, (top + bottom) / 2 - height / 2), width, height };
      }
      const width = kit.vw - 32;
      const below = (stand?.bottom ?? bottom) + 12;
      return { left: 16, top: Math.max(96, Math.min(below, kit.vh - 330)), width, height: 300 };
    };

    // Un trazo de tinta en el aire, de la mano al centro del libro: el dibujante.
    let box = place();
    kit.at(T.stroke, () => {
      box = place();
      const from = kit.hand("point");
      if (!from) return;
      const x1 = box.left + box.width / 2;
      const y1 = box.top + box.height / 2;
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("class", "hd-stroke");
      svg.setAttribute("width", String(kit.vw));
      svg.setAttribute("height", String(kit.vh));
      const cx = (from.x + x1) / 2;
      const cy = Math.min(from.y, y1) - 80;
      svg.innerHTML = `<path pathLength="1" d="M${from.x.toFixed(0)} ${from.y.toFixed(0)} Q${cx.toFixed(0)} ${cy.toFixed(0)} ${x1.toFixed(0)} ${y1.toFixed(0)} L${x1.toFixed(0)} ${(y1 - box.height * 0.42).toFixed(0)} L${x1.toFixed(0)} ${(y1 + box.height * 0.42).toFixed(0)}"/>`;
      fx.appendChild(svg);
      const path = svg.querySelector("path")!;
      kit.keep(path.animate([{ strokeDashoffset: "1" }, { strokeDashoffset: "0" }], { duration: 300, easing: "cubic-bezier(0.5, 0, 0.3, 1)", fill: "both" }));
      kit.later(520, () => svg.remove());
    });

    // El libro: dos hojas que se abren como puertas desde el trazo.
    let order: HTMLElement | null = null;
    let book: HTMLElement | null = null;
    kit.at(T.book, () => {
      book = document.createElement("div");
      book.className = "hd-book";
      Object.assign(book.style, { left: `${box.left}px`, top: `${box.top}px`, width: `${box.width}px`, minHeight: `${box.height}px` });
      book.innerHTML =
        `<div class="hd-page is-left"><span class="hd-head">${esc(lines.rows[0][1].split(" · ")[0])}</span>` +
        `<dl class="hd-rows">${lines.rows.map(([k, v]) => `<div class="hd-row"><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl></div>` +
        `<div class="hd-page is-right"><span class="hd-head is-order">${esc(lines.orderLabel)}</span>` +
        `<p class="hd-order"><span class="hd-ink"></span><i class="hd-nib"></i></p><span class="hd-sign">ヘブンズ・ドアー</span></div>`;
      fx.appendChild(book);
      order = book.querySelector<HTMLElement>(".hd-ink");
      pop("バッ", box.left + box.width / 2, box.top - 8, "power-pop-word is-gold", 700);
    });

    // La ficha, renglon por renglon.
    lines.rows.forEach((_, i) => {
      kit.at(T.rows + i * T.rowStep, () => book?.querySelectorAll(".hd-row")[i]?.classList.add("is-on"));
    });

    // La orden: el Stand la escribe en la otra hoja, a ti.
    const done = T.order + lines.order.length * ORDER_STEP;
    kit.at(T.order, () => {
      kit.frame("stand", { body: "point", face: "laugh" });
      if (order) kit.onCleanup(typeInto(order, lines.order, ORDER_STEP));
    });
    kit.at(done + 120, () => {
      book?.querySelector(".hd-order")?.classList.add("is-signed");
      kit.frame("stand", { body: "high", face: "smug" });
      if (book) {
        const r = book.getBoundingClientRect();
        kit.shout("ドン!", r.left + r.width * 0.75, r.top + r.height * 0.62, "power-pop-word is-gold is-big", 900);
      }
    });
    kit.at(done + 700, () => book?.classList.add("is-closing"));
    kit.at(done + 700 + T.closeAfter, () => {
      fx.classList.add("is-leaving");
      kit.frame("stand", { face: "wink" });
      kit.talk(pickLine(lines.done), 1000);
    });
    kit.at(Math.max(T.relay, done + 2300), kit.relay);
  },
};
