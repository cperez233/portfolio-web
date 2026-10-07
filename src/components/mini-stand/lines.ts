import type { Language } from "@/data/content";
import type { StandEvent } from "@/lib/stand-events";

export type { StandEvent };

/**
 * Lo que dice el mini Stand. Su voz: seco, un poco creido, habla de "el"
 * (su usuario) y suelta referencias de JoJo distintas, no siempre la
 * misma. Frases cortas: en celular solo salen las de 30 letras o menos.
 *
 * Cada lugar tiene varias; se barajan y no se repiten hasta agotarlas.
 * Nunca explica los secretos: para eso esta el contador de Secretos.
 * Nada inventado: cuando habla del trabajo, dice lo que la seccion dice.
 */
export interface StandLines {
  label: string;
  /** Por lugar (data-spot). */
  spots: Record<string, string[]>;
  /** Cuando agota las frases de un lugar. */
  outro: string[];
  sleep: string;
  wake: string[];
  /** Al volver al retrato del hero. */
  home: string[];
  night: string;
  console: string;
  events: Record<StandEvent, string[]>;
  janken: {
    title: string;
    intro: string[];
    hands: { rock: string; paper: string; scissors: string };
    call: string;
    win: string[];
    lose: string[];
    draw: string[];
    matchWin: string[];
    matchLose: string[];
    score: string;
    again: string;
    close: string;
    quit: string[];
  };
}

export const standLines: Record<Language, StandLines> = {
  es: {
    label: "Mini Stand: retarlo a piedra, papel o tijera",
    spots: {
      sites: [
        "Todas en línea. Ninguna en obra.",
        "Toca una. No muerden.",
        "Él las hizo. Yo vigilé.",
        "Yare yare… cuántas páginas.",
        "Esta tira la ordené yo.",
      ],
      audit: [
        "Pega tu link. Sin miedo.",
        "Gratis. Sospechoso, ¿no?",
        "Tu página me está mirando.",
        "Revisa. Yo no juzgo. Mucho.",
      ],
      about: [
        "Ese es mi usuario.",
        "Una flecha y aquí estamos.",
        "Él escribe. Yo existo.",
        "Ingeniero y editor. Yo, Stand.",
      ],
      standcard: [
        "Ese soy yo. Más alto en persona.",
        "Potencial A. Modestia C.",
        "Velocidad B. Estoy entrenando.",
        "Mi foto de perfil oficial.",
        "No le crean al hexágono.",
      ],
      github: [
        "Cada columna es un día.",
        "Golpéalas. Les gusta.",
        "Agosto despertó algo.",
        "La más alta la puse yo.",
        "ゴゴゴゴゴ…",
      ],
      services: [
        "Elige uno. O todos.",
        "Nada de plantillas. Daga kotowaru.",
        "Todo a mano. Bueno, a teclado.",
        "Abre uno. Yo espero.",
      ],
      projects: [
        "Tres capítulos. Sin relleno.",
        "El capítulo 2 es mi favorito.",
        "Spoiler: terminan bien.",
        "Esto no es anime. Es real.",
      ],
      pricing: [
        "Precios a la vista.",
        "Más barato que una flecha.",
        "El del medio es el elegido.",
        "Nigerundayo… no, quédate.",
      ],
      faq: [
        "Pregunta lo que sea.",
        "Leí todas. Dos veces.",
        "¿No está? Escríbele.",
        "Respuesta corta: sí se puede.",
      ],
      contact: [
        "Escribe. Yo le aviso.",
        "Suele responder el mismo día.",
        "Escríbele. Yo no muerdo. Él menos.",
        "Un mensaje. Solo uno.",
      ],
      tbc: [
        "To be continued…",
        "Fin de la Parte 9.",
        "Arrivederci. O no.",
        "Sube. Hay más.",
      ],
    },
    outro: ["¿No te cansas? Yo sí.", "Se me acabaron. Muda.", "Desde el principio. Yare yare."],
    sleep: "z z z",
    wake: [
      "¡No estaba dormido!",
      "Meditaba. Hamon.",
      "¿Eh? ¿Volviste?",
      "Pausa estratégica.",
      "Me paré el tiempo a mí mismo.",
    ],
    home: ["En casa.", "Al retrato.", "Aquí se está bien."],
    night: "Turno de noche. Como DIO.",
    console: "¿Me llamaste? Nadie hace eso.",
    events: {
      timestop: ["¡No me puedo mover…!", "時よ止まれ… ¿y yo qué?", "Ugh. Otra vez el tiempo."],
      ora: ["¡ORA ORA ORA!", "¡Eso! Más fuerte.", "¿Escribiste ora? Respeto."],
      muda: ["¿MUDA? Eso es de DIO.", "Traidor.", "Wryyyy… no, perdón."],
      tbc: ["To be continued…", "¿Ya? ¿Así termina?", "Roundabout sonando."],
      barrage: ["¡Esa es la ráfaga!", "Seis golpes. Nada mal.", "Las columnas lloran."],
      arrow: ["¡Esa flecha! Así nací yo.", "Cuidado con eso. Pica.", "Otro Stand no, por favor."],
    },
    janken: {
      title: "Jan-ken",
      intro: [
        "Piedra, papel o tijera. Tres rondas.",
        "Boy II Man me enseñó. Tres rondas.",
        "Si ganas, nada. Si pierdo, tampoco.",
      ],
      hands: { rock: "Piedra", paper: "Papel", scissors: "Tijera" },
      call: "じゃんけんぽん!",
      win: ["¡Ja! Leí tu mente.", "Predecible.", "Tu próxima jugada es… perder."],
      lose: ["Suerte.", "Eso no contó.", "Hm. Interesante."],
      draw: ["Empate. Otra.", "Pensamos igual. Qué miedo.", "Aiko desho."],
      matchWin: ["Gané. Yare yare daze.", "Victoria. Era obvio.", "Muda muda muda."],
      matchLose: ["Me ganaste. No se lo digas a él.", "Bien jugado. Revancha.", "…Good."],
      score: "Tú {you} · Stand {me}",
      again: "Revancha",
      close: "Cerrar el juego",
      quit: ["Nigerundayo, ¿eh?", "¿Te vas? Iba ganando."],
    },
  },
  en: {
    label: "Mini Stand: challenge it to rock, paper, scissors",
    spots: {
      sites: [
        "All live. None in progress.",
        "Tap one. They don't bite.",
        "He built them. I watched.",
        "Yare yare… so many sites.",
        "I sorted this strip.",
      ],
      audit: [
        "Paste your link. No fear.",
        "Free. Suspicious, right?",
        "Your site is staring at me.",
        "I don't judge. Much.",
      ],
      about: [
        "That's my user.",
        "One arrow, and here we are.",
        "He types. I exist.",
        "Engineer and editor. Me: Stand.",
      ],
      standcard: [
        "That's me. Taller in person.",
        "Potential A. Modesty C.",
        "Speed B. I'm training.",
        "My official headshot.",
        "Don't trust the hexagon.",
      ],
      github: [
        "Every column is a day.",
        "Hit them. They like it.",
        "August woke something up.",
        "I stacked the tall one.",
        "ゴゴゴゴゴ…",
      ],
      services: [
        "Pick one. Or all of them.",
        "No templates. Daga kotowaru.",
        "All by hand. Well, keyboard.",
        "Open one. I'll wait.",
      ],
      projects: [
        "Three chapters. No filler.",
        "Chapter 2 is my favourite.",
        "Spoiler: they end well.",
        "Not an anime. It's real.",
      ],
      pricing: [
        "Prices out in the open.",
        "Cheaper than an arrow.",
        "The middle one is the chosen.",
        "Nigerundayo… no, stay.",
      ],
      faq: [
        "Ask anything.",
        "I read them all. Twice.",
        "Not there? Message him.",
        "Short answer: yes, it can.",
      ],
      contact: [
        "Write. I'll let him know.",
        "He usually replies same day.",
        "Write to him. I don't bite.",
        "One message. Just one.",
      ],
      tbc: ["To be continued…", "End of Part 9.", "Arrivederci. Or not.", "Scroll up. There's more."],
    },
    outro: ["Don't you get tired? I do.", "I'm out of lines. Muda.", "From the top. Yare yare."],
    sleep: "z z z",
    wake: [
      "I wasn't asleep!",
      "I was meditating. Hamon.",
      "Huh? You're back?",
      "Strategic pause.",
      "I stopped my own time.",
    ],
    home: ["Home.", "Back to the portrait.", "Nice spot."],
    night: "Night shift. Like DIO.",
    console: "You called me? Nobody does that.",
    events: {
      timestop: ["I can't move…!", "時よ止まれ… what about me?", "Ugh. Time again."],
      ora: ["ORA ORA ORA!", "Yes! Harder.", "You typed ora? Respect."],
      muda: ["MUDA? That's DIO's.", "Traitor.", "Wryyyy… sorry."],
      tbc: ["To be continued…", "That's it? That's the ending?", "Roundabout playing."],
      barrage: ["That's the barrage!", "Six hits. Not bad.", "The columns are crying."],
      arrow: ["That arrow! That's how I was born.", "Careful. It stings.", "Not another Stand, please."],
    },
    janken: {
      title: "Jan-ken",
      intro: [
        "Rock, paper, scissors. Best of three.",
        "Boy II Man taught me. Best of three.",
        "Win and you get nothing. Same as me.",
      ],
      hands: { rock: "Rock", paper: "Paper", scissors: "Scissors" },
      call: "じゃんけんぽん!",
      win: ["Ha! Read your mind.", "Predictable.", "Your next move is… losing."],
      lose: ["Lucky.", "That didn't count.", "Hm. Interesting."],
      draw: ["Draw. Again.", "Same mind. Scary.", "Aiko desho."],
      matchWin: ["I win. Yare yare daze.", "Victory. Obviously.", "Muda muda muda."],
      matchLose: ["You beat me. Don't tell him.", "Well played. Rematch.", "…Good."],
      score: "You {you} · Stand {me}",
      again: "Rematch",
      close: "Close the game",
      quit: ["Nigerundayo, huh?", "Leaving? I was winning."],
    },
  },
};
