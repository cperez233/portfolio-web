import type { Language } from "@/data/content";
import type { StandEvent } from "@/lib/stand-events";

export type { StandEvent };

/**
 * Lo que dice el mini Stand.
 *
 * Su personalidad: un Stand dramatico y algo creido que narra la pagina
 * como si fuera un capitulo de JoJo. Habla de "el" (su usuario), exagera
 * todo con tension de manga (ゴゴゴ, ドドド) y suelta referencias distintas
 * de las nueve partes, no siempre la misma.
 *
 * Reglas: frases cortas (en celular solo salen las de 30 letras o menos),
 * barajadas sin repetir, nunca explica los secretos, y nada inventado
 * sobre el trabajo: lo que dice de Cris sale de lo que la pagina ya dice.
 */

export type PowerId = "zawarudo" | "crazydiamond" | "echoes" | "hermit" | "bitesthedust" | "kingcrimson";

export interface StandLines {
  label: string;
  spots: Record<string, string[]>;
  outro: string[];
  sleep: string;
  wake: string[];
  home: string[];
  night: string;
  console: string;
  /** Golpe de efecto al posarse (se pinta como onomatopeya). */
  landing: string[];
  events: Record<StandEvent, string[]>;
  chat: {
    title: string;
    close: string;
    greet: string[];
    options: { who: string; cris: string; power: string; janken: string; bye: string };
    who: string[][];
    cris: string[];
    powerPrompt: string[];
    bye: string[];
    back: string;
  };
  powers: Record<PowerId, { name: string; jp: string; say: string[]; done: string[] }>;
  /** Hermit Purple: lo que "ve" de la visita. {min}, {parts}, {total}, {secrets}. */
  hermit: string[];
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
    label: "Mini Stand: hablar con él",
    spots: {
      sites: [
        "Todas en línea. Ninguna en obra.",
        "Toca una. No muerden.",
        "Él las hizo. Yo vigilé.",
        "Esta tira la ordené yo.",
        "Cero plantillas. Todas a medida.",
        "¿Ves la del bebé? Adorable.",
        "Míralas. Ninguna se repite.",
      ],
      audit: [
        "Pega tu link. Sin miedo.",
        "Gratis. Sospechoso, ¿no?",
        "Tu página me está mirando.",
        "Revisa. Yo no juzgo. Mucho.",
        "Seis puntos. Como mis dedos.",
        "Daga kotowaru… no, dale.",
      ],
      about: [
        "Ese es mi usuario.",
        "Una flecha y aquí estamos.",
        "Él escribe. Yo existo.",
        "Ingeniero y editor. Yo, Stand.",
        "Seguridad primero. Y yo segundo.",
        "Lee despacio. Hay tensión.",
      ],
      standcard: [
        "Ese soy yo. Más alto en persona.",
        "Potencial A. Modestia C.",
        "Velocidad B. Estoy entrenando.",
        "No le crean al hexágono.",
        "Mi mejor ángulo. Ese.",
        "Paranoid Android. Sí, la canción.",
      ],
      github: [
        "Cada columna es un día.",
        "Golpéalas. Les gusta.",
        "Agosto despertó algo.",
        "La más alta la puse yo.",
        "ゴゴゴゴゴ…",
        "Commit tras commit. ORA.",
        "Gíralo. Desde atrás se ve épico.",
      ],
      services: [
        "Elige uno. O todos.",
        "Nada de plantillas.",
        "Todo a mano. Bueno, a teclado.",
        "Abre uno. Yo espero.",
        "¿Otra cosa? Pregúntale.",
        "Del logo al servidor. Todo.",
      ],
      projects: [
        "Tres capítulos. Sin relleno.",
        "El capítulo 2 es mi favorito.",
        "Spoiler: terminan bien.",
        "Esto no es anime. Es real.",
        "Cambia de pestaña. Hay más.",
        "Capturas reales. Sin trucos.",
      ],
      pricing: [
        "Precios a la vista.",
        "Más barato que una flecha.",
        "El del medio es el elegido.",
        "Nigerundayo… no, quédate.",
        "Lo final se acuerda antes.",
        "Lo que va aparte, está escrito.",
      ],
      faq: [
        "Pregunta lo que sea.",
        "Leí todas. Dos veces.",
        "¿No está? Escríbele.",
        "Ábrelas. No explotan.",
        "Cortas y al grano.",
      ],
      contact: [
        "Escribe. Yo le aviso.",
        "Suele responder el mismo día.",
        "Un mensaje. Solo uno.",
        "WhatsApp o correo. Tú eliges.",
        "Ya llegaste hasta aquí…",
        "Dilo sin miedo. ゴゴゴ.",
      ],
      tbc: [
        "To be continued…",
        "Fin de la Parte 9.",
        "Arrivederci. O no.",
        "Sube. Hay más.",
        "Suena Roundabout, ¿la oyes?",
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
      "Soñé con un capibara.",
    ],
    home: ["En casa.", "Al retrato.", "Aquí se está bien."],
    night: "Turno de noche. Como DIO.",
    console: "¿Me llamaste? Nadie hace eso.",
    landing: ["ドン!", "ドドド", "バァーン", "ゴゴゴ"],
    events: {
      timestop: ["¡No me puedo mover…!", "時よ止まれ… ¿y yo qué?", "Ugh. Otra vez el tiempo."],
      ora: ["¡ORA ORA ORA!", "¡Eso! Más fuerte.", "¿Escribiste ora? Respeto."],
      muda: ["¿MUDA? Eso es de DIO.", "Traidor.", "Wryyyy… no, perdón."],
      tbc: ["To be continued…", "¿Ya? ¿Así termina?", "Roundabout sonando."],
      barrage: ["¡Esa es la ráfaga!", "Seis golpes. Nada mal.", "Las columnas lloran."],
      arrow: ["¡Esa flecha! Así nací yo.", "Cuidado con eso. Pica.", "Otro Stand no, por favor."],
      themeLight: ["¡Mis ojos! ¡La luz!", "¿Modo día? Soy de noche.", "Esto es el sol de DIO… no."],
      themeDark: ["Mejor. La noche es mía.", "Así sí. Oscuro y elegante.", "Ahh. Paz."],
      language: ["Cambio de idioma. Interesante.", "Hablo los dos. Obvio."],
      whatsapp: ["¡Eso! Escríbele.", "Buena decisión. ゴゴゴ.", "Yo le aviso que vas."],
      copy: ["¿Copiando? Respeto.", "Llévatelo. Es gratis.", "Ctrl+C. Clásico."],
      return: ["¿Dónde estabas?", "Te esperé. Quieto.", "Volviste. Sabía."],
      fastScroll: ["¡Más despacio! Me mareo.", "¡Oye! Esto no es Speed King.", "Wooo… ¿por qué tan rápido?"],
      stare: ["¿Qué miras?", "Sí, soy yo.", "Tócame si te atreves."],
      audit: ["Revisando… ゴゴゴ.", "A ver esa página…"],
      sent: ["¡Enviado! Él te responde.", "Mensaje entregado. Bien.", "Ahora a esperar. Yo espero contigo."],
      bottom: ["Llegaste al final. Respeto.", "Leíste todo. Eres de los míos."],
    },
    chat: {
      title: "Paranoid Android",
      close: "Cerrar la conversación",
      greet: [
        "¿Oh? ¿Me hablas a mí?",
        "Un humano me tocó. ¿Qué quieres?",
        "Habla. El tiempo corre. Salvo que lo pare.",
        "¿Sí? Estaba posando.",
      ],
      options: {
        who: "¿Quién eres?",
        cris: "Háblame de él",
        power: "Usa un poder",
        janken: "Juguemos jan-ken",
        bye: "Nada, sigue",
      },
      who: [
        ["Soy Paranoid Android.", "El Stand de Cristian.", "Nací de una flecha. Larga historia."],
        ["Un Stand. Espíritu hecho poder.", "Él programa. Yo existo con estilo."],
        ["Me dicen PA.", "Bueno, nadie me dice nada.", "Tú puedes ser el primero."],
      ],
      cris: [
        "Hace páginas, software y video.",
        "Vive en Bucaramanga. Trabaja remoto.",
        "Cofundó carpy, un estudio de software.",
        "Viene de ciberseguridad. Revisa cerraduras.",
        "Tiene más de 32K seguidores con contenido propio.",
        "Trabaja en español y en inglés.",
        "Le escribes por WhatsApp y suele responder el mismo día.",
      ],
      powerPrompt: ["Tengo poderes prestados. Elige.", "Elige. No me hago responsable.", "¿Cuál? Todos son peligrosos."],
      bye: ["Arrivederci.", "Me voy a posar por ahí.", "Yare yare. Adiós."],
      back: "Otra cosa",
    },
    powers: {
      zawarudo: {
        name: "ZA WARUDO",
        jp: "時よ止まれ",
        say: ["¡ZA WARUDO!"],
        done: ["Y el tiempo vuelve a moverse.", "そして時は動き出す。"],
      },
      crazydiamond: {
        name: "Crazy Diamond",
        jp: "ドラララ",
        say: ["¡DORARARARA!"],
        done: ["Roto y arreglado. Como nuevo.", "Crazy Diamond lo deja mejor."],
      },
      echoes: {
        name: "Echoes",
        jp: "エコーズ",
        say: ["¡Echoes! Sonidos pegados."],
        done: ["Ahora la página suena.", "Se despegan solos. Tranquilo."],
      },
      hermit: {
        name: "Hermit Purple",
        jp: "ハーミット",
        say: ["Hermit Purple… a ver qué veo."],
        done: [],
      },
      bitesthedust: {
        name: "Bites the Dust",
        jp: "負けて死ね",
        say: ["Killer Queen… ¡Bites the Dust!"],
        done: ["El tiempo retrocedió. Nadie lo notó.", "¿Déjà vu? Normal."],
      },
      kingcrimson: {
        name: "King Crimson",
        jp: "キング・クリムゾン",
        say: ["¡King Crimson!"],
        done: ["Solo queda el resultado.", "Se saltó un trozo. No preguntes."],
      },
    },
    hermit: [
      "Veo… {min} en la página.",
      "Veo… {parts} de {total} partes leídas.",
      "Veo… {secrets} secretos encontrados.",
    ],
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
    label: "Mini Stand: talk to it",
    spots: {
      sites: [
        "All live. None in progress.",
        "Tap one. They don't bite.",
        "He built them. I watched.",
        "I sorted this strip.",
        "Zero templates. All made to fit.",
        "See the baby store? Adorable.",
        "No two look alike.",
      ],
      audit: [
        "Paste your link. No fear.",
        "Free. Suspicious, right?",
        "Your site is staring at me.",
        "I don't judge. Much.",
        "Six checks. Like my fingers.",
        "Daga kotowaru… no, go on.",
      ],
      about: [
        "That's my user.",
        "One arrow, and here we are.",
        "He types. I exist.",
        "Engineer and editor. Me: Stand.",
        "Security first. Me second.",
        "Read slowly. There's tension.",
      ],
      standcard: [
        "That's me. Taller in person.",
        "Potential A. Modesty C.",
        "Speed B. I'm training.",
        "Don't trust the hexagon.",
        "My best angle. That one.",
        "Paranoid Android. Yes, the song.",
      ],
      github: [
        "Every column is a day.",
        "Hit them. They like it.",
        "August woke something up.",
        "I stacked the tall one.",
        "ゴゴゴゴゴ…",
        "Commit after commit. ORA.",
        "Spin it. Epic from behind.",
      ],
      services: [
        "Pick one. Or all of them.",
        "No templates.",
        "All by hand. Well, keyboard.",
        "Open one. I'll wait.",
        "Something else? Ask him.",
        "From logo to server. All of it.",
      ],
      projects: [
        "Three chapters. No filler.",
        "Chapter 2 is my favourite.",
        "Spoiler: they end well.",
        "Not an anime. It's real.",
        "Switch tabs. There's more.",
        "Real screenshots. No tricks.",
      ],
      pricing: [
        "Prices out in the open.",
        "Cheaper than an arrow.",
        "The middle one is the chosen.",
        "Nigerundayo… no, stay.",
        "Final price agreed up front.",
        "Extras are written down.",
      ],
      faq: [
        "Ask anything.",
        "I read them all. Twice.",
        "Not there? Message him.",
        "Open them. They won't explode.",
        "Short and to the point.",
      ],
      contact: [
        "Write. I'll let him know.",
        "He usually replies same day.",
        "One message. Just one.",
        "WhatsApp or email. Your call.",
        "You made it this far…",
        "Say it. ゴゴゴ.",
      ],
      tbc: ["To be continued…", "End of Part 9.", "Arrivederci. Or not.", "Scroll up. There's more.", "Hear Roundabout?"],
    },
    outro: ["Don't you get tired? I do.", "I'm out of lines. Muda.", "From the top. Yare yare."],
    sleep: "z z z",
    wake: [
      "I wasn't asleep!",
      "I was meditating. Hamon.",
      "Huh? You're back?",
      "Strategic pause.",
      "I stopped my own time.",
      "Dreamt of a capybara.",
    ],
    home: ["Home.", "Back to the portrait.", "Nice spot."],
    night: "Night shift. Like DIO.",
    console: "You called me? Nobody does that.",
    landing: ["ドン!", "ドドド", "バァーン", "ゴゴゴ"],
    events: {
      timestop: ["I can't move…!", "時よ止まれ… what about me?", "Ugh. Time again."],
      ora: ["ORA ORA ORA!", "Yes! Harder.", "You typed ora? Respect."],
      muda: ["MUDA? That's DIO's.", "Traitor.", "Wryyyy… sorry."],
      tbc: ["To be continued…", "That's it? That's the ending?", "Roundabout playing."],
      barrage: ["That's the barrage!", "Six hits. Not bad.", "The columns are crying."],
      arrow: ["That arrow! That's how I was born.", "Careful. It stings.", "Not another Stand, please."],
      themeLight: ["My eyes! The light!", "Day mode? I'm a night Stand.", "Is this DIO's sun… no."],
      themeDark: ["Better. The night is mine.", "There. Dark and classy.", "Ahh. Peace."],
      language: ["Language swap. Interesting.", "I speak both. Obviously."],
      whatsapp: ["Yes! Message him.", "Good call. ゴゴゴ.", "I'll tell him you're coming."],
      copy: ["Copying? Respect.", "Take it. It's free.", "Ctrl+C. Classic."],
      return: ["Where were you?", "I waited. Very still.", "You're back. Knew it."],
      fastScroll: ["Slow down! I'm dizzy.", "Hey! This isn't Speed King.", "Wooo… why so fast?"],
      stare: ["What are you looking at?", "Yes, it's me.", "Tap me if you dare."],
      audit: ["Checking… ゴゴゴ.", "Let's see that site…"],
      sent: ["Sent! He'll reply.", "Message delivered. Nice.", "Now we wait. I'll wait with you."],
      bottom: ["You reached the end. Respect.", "You read it all. You're one of us."],
    },
    chat: {
      title: "Paranoid Android",
      close: "Close the conversation",
      greet: [
        "Oh? Are you talking to me?",
        "A human tapped me. What do you want?",
        "Speak. Time is running. Unless I stop it.",
        "Yes? I was posing.",
      ],
      options: {
        who: "Who are you?",
        cris: "Tell me about him",
        power: "Use a power",
        janken: "Let's play jan-ken",
        bye: "Nothing, carry on",
      },
      who: [
        ["I'm Paranoid Android.", "Cristian's Stand.", "Born from an arrow. Long story."],
        ["A Stand. Spirit turned power.", "He codes. I exist, with style."],
        ["They call me PA.", "Well, nobody calls me anything.", "You could be the first."],
      ],
      cris: [
        "He builds websites, software and video.",
        "Lives in Bucaramanga. Works remote.",
        "Co-founded carpy, a software studio.",
        "Comes from cybersecurity. Checks the locks.",
        "Has 32K+ followers built on his own content.",
        "Works in Spanish and English.",
        "Message him on WhatsApp; he usually replies same day.",
      ],
      powerPrompt: ["I have borrowed powers. Pick.", "Pick one. Not my fault after.", "Which? They're all dangerous."],
      bye: ["Arrivederci.", "I'll go perch somewhere.", "Yare yare. Bye."],
      back: "Something else",
    },
    powers: {
      zawarudo: {
        name: "ZA WARUDO",
        jp: "時よ止まれ",
        say: ["ZA WARUDO!"],
        done: ["And time moves again.", "そして時は動き出す。"],
      },
      crazydiamond: {
        name: "Crazy Diamond",
        jp: "ドラララ",
        say: ["DORARARARA!"],
        done: ["Broken and fixed. Good as new.", "Crazy Diamond leaves it better."],
      },
      echoes: {
        name: "Echoes",
        jp: "エコーズ",
        say: ["Echoes! Stuck-on sounds."],
        done: ["Now the page has sound.", "They peel off by themselves."],
      },
      hermit: {
        name: "Hermit Purple",
        jp: "ハーミット",
        say: ["Hermit Purple… let's see."],
        done: [],
      },
      bitesthedust: {
        name: "Bites the Dust",
        jp: "負けて死ね",
        say: ["Killer Queen… Bites the Dust!"],
        done: ["Time went back. Nobody noticed.", "Déjà vu? Normal."],
      },
      kingcrimson: {
        name: "King Crimson",
        jp: "キング・クリムゾン",
        say: ["King Crimson!"],
        done: ["Only the result remains.", "A chunk got skipped. Don't ask."],
      },
    },
    hermit: [
      "I see… {min} on this page.",
      "I see… {parts} of {total} parts read.",
      "I see… {secrets} secrets found.",
    ],
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
