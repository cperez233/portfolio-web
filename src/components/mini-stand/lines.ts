import type { Language } from "@/data/content";
import type { StandEvent } from "@/lib/stand-events";

export type { StandEvent };

/**
 * Lo que dice el mini Stand. Frases cortas, en su voz, y nada inventado:
 * cada comentario apunta a algo que de verdad esta en esa seccion.
 */
interface StandLines {
  label: string;
  dismiss: string;
  greet: string;
  punch: string;
  /** Pistas de los easter eggs, una por toque (con raton / en tactil). */
  hintsPointer: string[];
  hintsTouch: string[];
  /** Comentario al llegar a cada seccion, por id. */
  sections: Record<string, string>;
  events: Record<StandEvent, string>;
}

export const standLines: Record<Language, StandLines> = {
  es: {
    label: "Mini Stand: tócalo para una pista",
    dismiss: "Guardar el Stand",
    greet: "¿Oh? ¿Te acercas? Tócame y te cuento un secreto.",
    punch: "¡ORA ORA ORA!",
    hintsPointer: [
      "Secreto 1: toca la foto de arriba. El tiempo se detiene.",
      "Secreto 2: escribe «ora» con el teclado. O «muda».",
      "Secreto 3: ↑ ↑ ↓ ↓ ← → ← → B A.",
      "Secreto 4: golpea seis veces una columna del tablero de GitHub.",
      "Ya te lo conté todo. Yare yare daze.",
    ],
    hintsTouch: [
      "Secreto 1: toca la foto de arriba. El tiempo se detiene.",
      "Secreto 2: golpea seis veces seguidas una columna del tablero de GitHub.",
      "Secreto 3: con teclado hay más. Escribe «ora».",
      "Ya te lo conté todo. Yare yare daze.",
    ],
    sections: {
      sites: "Todas están en línea. Toca una y la visitas.",
      audit: "Pega la dirección de tu página. Te digo qué le falta.",
      about: "Ese de la tarjeta es mi usuario.",
      github: "Golpea una columna. Cada una es un día de código.",
      services: "Toca un servicio y se abre.",
      projects: "Tres capítulos. Cambia de pestaña.",
      pricing: "Los precios están a la vista. Lo final se acuerda antes de empezar.",
      faq: "¿No está tu pregunta? Escríbele por WhatsApp.",
      contact: "¿Oh? ¿Te acercas? Escríbele, suele responder el mismo día.",
    },
    events: {
      timestop: "時よ止まれ… ¡no me puedo mover!",
      ora: "¡ORA ORA ORA!",
      muda: "¿MUDA? Eso es de DIO…",
      tbc: "To be continued…",
      barrage: "¡Esa es la ráfaga!",
    },
  },
  en: {
    label: "Mini Stand: tap it for a hint",
    dismiss: "Put the Stand away",
    greet: "Oh? You're approaching me? Tap me for a secret.",
    punch: "ORA ORA ORA!",
    hintsPointer: [
      "Secret 1: tap the photo up top. Time stops.",
      "Secret 2: type “ora” on your keyboard. Or “muda”.",
      "Secret 3: ↑ ↑ ↓ ↓ ← → ← → B A.",
      "Secret 4: hit a column of the GitHub board six times.",
      "That's all of them. Yare yare daze.",
    ],
    hintsTouch: [
      "Secret 1: tap the photo up top. Time stops.",
      "Secret 2: hit a column of the GitHub board six times in a row.",
      "Secret 3: there's more with a keyboard. Type “ora”.",
      "That's all of them. Yare yare daze.",
    ],
    sections: {
      sites: "All of them are live. Tap one to visit it.",
      audit: "Paste your site's address. I'll tell you what it's missing.",
      about: "The one on the card is my user.",
      github: "Hit a column. Each one is a day of code.",
      services: "Tap a service to open it.",
      projects: "Three chapters. Switch tabs.",
      pricing: "Prices are out in the open. The final one is agreed before starting.",
      faq: "Question not there? Message him on WhatsApp.",
      contact: "Oh? You're approaching? Write to him, he usually replies the same day.",
    },
    events: {
      timestop: "時よ止まれ… I can't move!",
      ora: "ORA ORA ORA!",
      muda: "MUDA? That's DIO's line…",
      tbc: "To be continued…",
      barrage: "That's the barrage!",
    },
  },
};
