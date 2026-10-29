/* editorial-ui · Cristian Pérez · cristianperez.me */

import { pickLine } from "@/components/mini-stand/pick";
import { pop, rand } from "@/components/mini-stand/power-kit";
import { playSfx } from "@/lib/sfx";
import { ease, type IntroDef, type IntroKit } from "./kit";

/*
  Heaven's Door: el Stand de Rohan, el mangaka, vuelve libro a quien
  toca. Como en el anime, no aparece un libro: la persona se abre. Aqui
  la persona es el retrato. El Stand traza el garabato en el aire hasta
  la foto, a la foto le sale una costura por el medio y la cara se parte
  en dos tapas, que se abren hacia los lados (son la piel: no hay portada
  de verdad); de adentro se despliegan las paginas, con su borde de hojas.
  Rohan arranca un trozo de una pagina (ビリッ), que sale volando. En la
  pagina de la orden el Stand escribe a mano una al azar, todas sobre lo
  que hace Cris ("Compraras una web, un aplicativo o varios"), la subraya
  y la sella. Despues las paginas se recogen, las tapas se cierran, la
  costura desaparece y la cara vuelve a ser la foto, en su sitio.

  La cara crece desde el retrato hasta donde no tapa al Stand (a su lado
  o debajo). En escritorio se abre a doble pagina (la de la izquierda es
  tu pagina "de vida"); en celular, una sola.
*/
const T = {
  open: 1600,
  stroke: 1820,
  split: 2240,
  grow: 2400,
  growMs: 420,
  unfold: 2620,
  unfoldMs: 560,
  riffle: 3120,
  tear: 3740,
  write: 3960,
  closeAfter: 950,
  foldMs: 480,
} as const;

const WRITE_STEP = 34;

const esc = (text: string) => text.replace(/[&<>"]/g, (ch) => `&#${ch.charCodeAt(0)};`);

/** Renglones de "texto" de manga: rayas de tinta de largo distinto. */
const scribble = (n: number) =>
  Array.from({ length: n }, () => `<i style="width:${Math.round(rand(55, 100))}%"></i>`).join("");

/** Donde se abre: al lado del Stand si hay sitio, si no debajo. */
function placeBook(kit: IntroKit) {
  const stand = kit.stage.querySelector(".hero-stand-core svg")?.getBoundingClientRect();
  const { vw, vh } = kit;
  const top = 84;
  const roomLeft = (stand?.left ?? vw) - 28;
  const roomRight = vw - (stand?.right ?? vw) - 28;
  const side = Math.max(roomLeft, roomRight);
  if (!kit.small && side >= 560) {
    const height = Math.min(560, vh - top - 110);
    // Lo que sobresalen las tapas abiertas, a cada lado; puede montarse un
    // poco sobre el margen del dibujo del Stand (que es aire).
    const width = Math.min(side + 90 - height * 0.3, height * 1.5, 920);
    const left = roomLeft >= roomRight ? Math.max(16 + height * 0.15, roomLeft + 90 - width - height * 0.15) : vw - roomRight - 78 + height * 0.15;
    return { left, top: Math.max(top, (vh - height) / 2 - 10), width, height, spread: true };
  }
  const below = Math.max(top, (stand?.bottom ?? vh * 0.35) - 8);
  const height = Math.min(500, vh - below - 80);
  const width = Math.min(vw - 72, height * 0.74);
  return { left: (vw - width) / 2, top: below, width, height, spread: false };
}

export const door: IntroDef = {
  name: "Heaven's Door",
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
    const photo = kit.portrait();
    const img = photo?.querySelector("img");

    // El nombre del Stand, al sacarlo.
    kit.frame("stand", { body: "point", face: "smug" });
    kit.lunge(0.05, 240);
    const hand0 = kit.hand("point");
    if (hand0) kit.shout("ヘブンズ・ドアー!", kit.vw / 2, hand0.y - kit.tall() * 0.6, "power-pop-word is-gold is-big", 1200);

    // El garabato en el aire: de la mano a la cara, en tres rizos.
    kit.at(T.stroke, () => {
      const from = kit.hand("point");
      const to = photo?.getBoundingClientRect();
      if (!from || !to) return;
      const cx = to.left + to.width / 2;
      const cy = to.top + to.height / 2;
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("class", "hd-stroke");
      svg.setAttribute("width", String(kit.vw));
      svg.setAttribute("height", String(kit.vh));
      const r = Math.max(28, to.width * 0.45);
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
        kit.keep(path.animate([{ strokeDashoffset: "1" }, { strokeDashoffset: "0" }], { duration: 360, easing: "cubic-bezier(0.5, 0, 0.3, 1)", fill: "both" }));
      }
      pop("シュッ", Math.min(kit.vw - 60, cx + 50), Math.max(110, cy - r * 2), "power-pop-word is-gold", 700);
      kit.later(520, () => svg.classList.add("is-leaving"));
      kit.later(860, () => svg.remove());
    });

    /*
      La cara: en el sitio final (box), pero al principio escalada hasta
      tapar justo el retrato, con su misma foto. cw es el ancho de la cara
      cerrada (la proporcion del retrato); las paginas, abiertas, miden
      box.width.
    */
    const H = box.height;
    const ratio = photo ? photo.offsetWidth / Math.max(1, photo.offsetHeight) : 0.69;
    const cw = Math.min(box.width, H * ratio);
    const half = cw / 2;
    const open = kit.small ? 100 : 128;
    let face: HTMLElement | null = null;
    let book: HTMLElement | null = null;
    let flaps: HTMLElement[] = [];
    let ink: HTMLElement | null = null;
    /** De la cara cerrada (0) a las paginas abiertas del todo (1). */
    const unfold = (t: number) => {
      if (!book) return;
      const width = cw + (box.width - cw) * t;
      book.style.scale = `${(width / box.width).toFixed(4)} 1`;
      const [left, right] = flaps;
      left.style.left = `${(box.width / 2 - width / 2).toFixed(1)}px`;
      right.style.left = `${(box.width / 2 + width / 2 - half).toFixed(1)}px`;
      left.style.transform = `rotateY(${(-open * t).toFixed(1)}deg)`;
      right.style.transform = `rotateY(${(open * t).toFixed(1)}deg)`;
    };
    /*
      La transformacion que lleva la cara cerrada a tapar el retrato, tal
      como esta: del tamano del retrato, inclinado como el (.manga-portrait
      va a -3 grados) y ladeado hacia el puntero como su capa (rotateX/Y con
      perspectiva). Si la cara volviera recta, al cambiarla por el retrato
      se le veria "doblarse" de golpe.
    */
    const tilt = photo?.closest(".hero-paste")?.parentElement ?? null;
    const frame = photo?.querySelector<HTMLElement>(".manga-portrait") ?? photo;
    const toPortrait = () => {
      const r = photo?.getBoundingClientRect();
      if (!r?.width || !frame) return "none";
      const s = frame.offsetHeight / H;
      const dx = r.left + r.width / 2 - (box.left + box.width / 2);
      const dy = r.top + r.height / 2 - (box.top + H / 2);
      const spin = Number.parseFloat(getComputedStyle(frame).rotate) || 0;
      const lean = tilt?.style.transform ?? "";
      const rx = Number.parseFloat(/rotateX\((-?[\d.]+)/.exec(lean)?.[1] ?? "0");
      const ry = Number.parseFloat(/rotateY\((-?[\d.]+)/.exec(lean)?.[1] ?? "0");
      face?.style.setProperty("--k", (1 / s).toFixed(3));
      return `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px) perspective(800px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) rotate(${spin}deg) scale(${s.toFixed(4)})`;
    };

    // La costura: la foto se parte por el medio.
    kit.at(T.split, () => {
      const src = img?.currentSrc || img?.src || "";
      // La foto en la cara, recortada igual que el retrato (cover, al centro).
      const nat = img && img.naturalWidth ? img.naturalWidth / img.naturalHeight : ratio;
      const bw = nat > ratio ? H * nat : cw;
      const bh = nat > ratio ? H : cw / nat;
      const ox = (cw - bw) / 2;
      const oy = (H - bh) / 2;
      const skin = (x: number) =>
        `background-image:url('${src.replace(/'/g, "%27")}');background-size:${bw.toFixed(1)}px ${bh.toFixed(1)}px;background-position:${(ox + x).toFixed(1)}px ${oy.toFixed(1)}px`;
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
      const flap = (side: "left" | "right") =>
        `<div class="hd-flap is-${side}" style="width:${half.toFixed(1)}px">` +
        `<span class="hd-skin" style="${skin(side === "left" ? 0 : -half)}"></span>` +
        `<span class="hd-flip"><span class="hd-lines">${scribble(12)}</span></span>` +
        `</div>`;
      const rim = `left:${((box.width - cw) / 2).toFixed(1)}px;width:${cw.toFixed(1)}px`;
      face = document.createElement("div");
      face.className = "hd-face";
      Object.assign(face.style, { left: `${box.left}px`, top: `${box.top}px`, width: `${box.width}px`, height: `${H}px` });
      face.innerHTML =
        `<div class="${box.spread ? "hd-book is-spread" : "hd-book"}">${(box.spread ? life : "") + orderPage}<div class="hd-leaves"></div></div>` +
        // El marco del retrato (tinta y sombra dorada), solo con la cara cerrada.
        `<span class="hd-frame is-back" style="${rim}"></span>` +
        flap("left") +
        flap("right") +
        `<span class="hd-frame" style="${rim}"></span>` +
        `<span class="hd-seam" style="height:${H}px"></span>`;
      fx.appendChild(face);
      book = face.querySelector<HTMLElement>(".hd-book");
      flaps = [...face.querySelectorAll<HTMLElement>(".hd-flap")];
      ink = face.querySelector<HTMLElement>(".hd-ink");
      face.style.transform = toPortrait();
      unfold(0);
      // La foto de verdad se esconde: ahora la cara es esta.
      if (photo) photo.style.visibility = "hidden";
      kit.onCleanup(() => photo && (photo.style.visibility = ""));
      face.classList.add("is-split");
      kit.shake(kit.small ? 3 : 5, 200);
      const r = photo?.getBoundingClientRect();
      if (r) pop("ズバッ", r.right + 30, Math.max(100, r.top + 10), "power-pop-word is-gold", 700);
      playSfx("crack");
    });

    // La cara crece hasta donde se va a leer.
    kit.at(T.grow, () => {
      if (!face) return;
      fx.classList.add("is-dim");
      kit.keep(
        face.animate([{ transform: toPortrait() }, { transform: "none" }], {
          duration: T.growMs,
          easing: "cubic-bezier(0.3, 0.8, 0.3, 1)",
          fill: "forwards",
        }),
      );
    });

    // Las tapas (la cara) se abren y de adentro salen las paginas.
    kit.at(T.unfold, () => {
      if (!face) return;
      face.classList.add("is-open");
      kit.tween(T.unfoldMs, unfold, ease.out);
      kit.shake(kit.small ? 4 : 7, 260);
      playSfx("thud");
      pop("バララッ", box.left + box.width * 0.85, Math.max(100, box.top - 6), "power-pop-word is-gold is-big", 900);
    });

    // Las paginas pasan a toda velocidad (riffle), de derecha a izquierda.
    const riffle = (back: boolean) => {
      const leaves = book?.querySelector<HTMLElement>(".hd-leaves");
      if (!leaves) return;
      const count = kit.small ? 5 : 6;
      for (let i = 0; i < count; i++) {
        const leaf = document.createElement("span");
        leaf.className = "hd-leaf";
        leaf.innerHTML = `<span class="hd-lines">${scribble(10)}</span>`;
        leaves.appendChild(leaf);
        const turn = [
          { transform: "rotateY(0deg)", filter: "brightness(1)" },
          { transform: "rotateY(-90deg)", filter: "brightness(0.75)", offset: 0.5 },
          { transform: "rotateY(-180deg)", filter: "brightness(1)" },
        ];
        kit.keep(
          leaf.animate(back ? turn.reverse().map((k, j) => ({ ...k, offset: j / 2 })) : turn, {
            duration: 280,
            delay: i * 50,
            easing: "cubic-bezier(0.4, 0, 0.6, 1)",
            fill: "both",
          }),
        ).onfinish = () => leaf.remove();
      }
    };
    kit.at(T.riffle, () => riffle(false));

    // Rohan arranca un trozo de la primera pagina: ビリッ.
    kit.at(T.tear, () => {
      const page = book?.querySelector<HTMLElement>(".hd-page");
      if (!page) return;
      const r = page.getBoundingClientRect();
      const w = r.width * 0.36;
      const h = r.height * 0.22;
      page.classList.add("is-torn");
      const scrap = document.createElement("span");
      scrap.className = "hd-scrap";
      Object.assign(scrap.style, { left: `${r.right - w}px`, top: `${r.bottom - h}px`, width: `${w}px`, height: `${h}px` });
      scrap.innerHTML = `<span class="hd-lines">${scribble(4)}</span>`;
      fx.appendChild(scrap);
      kit.keep(
        scrap.animate(
          [
            { translate: "0 0", rotate: "0deg", opacity: 1 },
            { translate: `${rand(30, 60).toFixed(0)}px -40px`, rotate: "14deg", opacity: 1, offset: 0.25 },
            { translate: `${rand(120, 220).toFixed(0)}px ${rand(140, 260).toFixed(0)}px`, rotate: `${rand(80, 160).toFixed(0)}deg`, opacity: 0 },
          ],
          { duration: 1300, easing: "cubic-bezier(0.3, 0.2, 0.6, 1)", fill: "forwards" },
        ),
      ).onfinish = () => scrap.remove();
      kit.shout("ビリッ!", r.right - w / 2, Math.max(100, r.bottom - h - 20), "power-pop-word is-gold", 700);
      playSfx("crack");
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

    // Se cierra: las paginas se recogen, la cara se junta y vuelve a ser la foto.
    const close = done + 380 + T.closeAfter;
    kit.at(close, () => {
      kit.frame("stand", { body: "idle", face: "laugh" });
      riffle(true);
      kit.later(260, () => kit.tween(T.foldMs, (t) => unfold(1 - t), ease.inOut));
    });
    kit.at(close + 260 + T.foldMs, () => {
      if (!face) return;
      face.classList.remove("is-open");
      fx.classList.remove("is-dim");
      const f = face;
      kit.keep(
        f.animate([{ transform: "none" }, { transform: toPortrait() }], {
          duration: 380,
          easing: "cubic-bezier(0.6, 0, 0.4, 1)",
          fill: "forwards",
        }),
      ).onfinish = () => {
        f.classList.remove("is-split");
        kit.later(160, () => {
          if (photo) photo.style.visibility = "";
          f.remove();
        });
      };
    });
    kit.at(close + 260 + T.foldMs + 600, () => {
      kit.frame("stand", { face: "wink" });
      kit.talk(pickLine(lines.done), 1100);
    });
    kit.at(Math.min(9600, close + 260 + T.foldMs + 1500), kit.relay);
  },
};
