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

export type PowerId =
  | "zawarudo"
  | "starplatinum"
  | "crazydiamond"
  | "goldexperience"
  | "echoes"
  | "softwet"
  | "hermit"
  | "madeinheaven"
  | "bitesthedust"
  | "kingcrimson";

/** Lugares a los que el Stand sabe llevarte desde la conversacion. */
export type GuideId = "projects" | "sites" | "pricing" | "contact";

export interface StandLines {
  label: string;
  spots: Record<string, string[]>;
  outro: string[];
  sleep: string;
  wake: string[];
  home: string[];
  night: string;
  console: string;
  /** Saludo al salir del retrato, segun la hora (la madrugada es secreto). */
  greetings: { morning: string[]; afternoon: string[]; evening: string[]; visit: string[] };
  /** Lo que dice solo, posado, si lleva rato callado. */
  musings: string[];
  /** Golpe de efecto al posarse (se pinta como onomatopeya). */
  landing: string[];
  events: Record<StandEvent, string[]>;
  chat: {
    title: string;
    close: string;
    greet: string[];
    greetAgain: string[];
    options: { who: string; cris: string; guide: string; trivia: string; power: string; janken: string; bye: string };
    who: string[][];
    cris: string[];
    trivia: string[];
    guidePrompt: string[];
    guide: Record<GuideId, { label: string; say: string[] }>;
    powerPrompt: string[];
    bye: string[];
    back: string;
  };
  /** bonus: lo que dice si el poder sale "redondo" (p. ej. reventar todas las burbujas). */
  powers: Record<PowerId, { name: string; jp: string; say: string[]; done: string[]; bonus?: string[] }>;
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
        "Ábrela. Está en línea de verdad.",
        "Cada una, su propio Stand.",
        "Reales. Con dominio y todo.",
      ],
      audit: [
        "Pega tu link. Sin miedo.",
        "Gratis. Sospechoso, ¿no?",
        "Tu página me está mirando.",
        "Revisa. Yo no juzgo. Mucho.",
        "Seis puntos. Como mis dedos.",
        "Daga kotowaru… no, dale.",
        "Mi Hermit Purple también revisa.",
        "Si sale rojo, no fui yo.",
        "Te lo dice en segundos.",
      ],
      about: [
        "Ese es mi usuario.",
        "Una flecha y aquí estamos.",
        "Él escribe. Yo existo.",
        "Ingeniero y editor. Yo, Stand.",
        "Seguridad primero. Y yo segundo.",
        "Lee despacio. Hay tensión.",
        "Su sueño es mejor que el de Giorno.",
        "Destino: Bucaramanga.",
        "Aquí empieza su Bizarre Adventure.",
      ],
      standcard: [
        "Ese soy yo. Más alto en persona.",
        "Potencial A. Modestia C.",
        "Velocidad B. Estoy entrenando.",
        "No le crean al hexágono.",
        "Mi mejor ángulo. Ese.",
        "Paranoid Android. Sí, la canción.",
        "Toca la flecha. Si te atreves.",
        "Alcance: toda la página.",
        "Precisión A. Puntería, ni idea.",
      ],
      github: [
        "Cada columna es un día.",
        "Golpéalas. Les gusta.",
        "Agosto despertó algo.",
        "La más alta la puse yo.",
        "ゴゴゴゴゴ…",
        "Commit tras commit. ORA.",
        "Gíralo. Desde atrás se ve épico.",
        "Columnas que suben. Como yo.",
        "Un día sin commits: yare yare.",
        "Cada cubo, un ORA.",
      ],
      services: [
        "Elige uno. O todos.",
        "Nada de plantillas.",
        "Todo a mano. Bueno, a teclado.",
        "Abre uno. Yo espero.",
        "¿Otra cosa? Pregúntale.",
        "Del logo al servidor. Todo.",
        "Cada servicio, su capítulo.",
        "¿Video también? Sí. Él edita.",
        "Más útil que un Stand de tiempo.",
      ],
      projects: [
        "Tres capítulos. Sin relleno.",
        "El capítulo 2 es mi favorito.",
        "Spoiler: terminan bien.",
        "Esto no es anime. Es real.",
        "Cambia de pestaña. Hay más.",
        "Capturas reales. Sin trucos.",
        "Al terminar: To be continued.",
        "El capítulo 3 tampoco está mal.",
        "Esto lo vio King Crimson. Todo.",
      ],
      pricing: [
        "Precios a la vista.",
        "Más barato que una flecha.",
        "El del medio es el elegido.",
        "Nigerundayo… no, quédate.",
        "Lo final se acuerda antes.",
        "Lo que va aparte, está escrito.",
        "Speedwagon aprobaría estos precios.",
        "Sin letra chica. Ni ゴゴゴ.",
        "Elige con calma. Yo no presiono.",
      ],
      faq: [
        "Pregunta lo que sea.",
        "Leí todas. Dos veces.",
        "¿No está? Escríbele.",
        "Ábrelas. No explotan.",
        "Cortas y al grano.",
        "Mis respuestas: ORA. Las de él, mejores.",
        "Si dudas, abre otra.",
        "Hermit Purple ya las leyó.",
      ],
      contact: [
        "Escribe. Yo le aviso.",
        "Suele responder el mismo día.",
        "Un mensaje. Solo uno.",
        "WhatsApp o correo. Tú eliges.",
        "Ya llegaste hasta aquí…",
        "Dilo sin miedo. ゴゴゴ.",
        "Él lee todo. Yo también.",
        "Aquí se cierra el capítulo.",
        "Tu turno. Yo ya hablé mucho.",
      ],
      tbc: [
        "To be continued…",
        "Fin de la Parte 9.",
        "Arrivederci. O no.",
        "Sube. Hay más.",
        "Suena Roundabout, ¿la oyes?",
        "La flecha apunta arriba. Sube.",
        "Fin. O un nuevo comienzo.",
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
    greetings: {
      morning: ["Buenos días. ¿Café o Hamon?", "Temprano. Como Jonathan.", "Mañana. El sol ya salió. Ugh."],
      afternoon: ["Buenas tardes. Hora de leer.", "Tarde de Stands. Buena elección.", "Siesta cancelada. Vamos."],
      evening: ["Buenas noches. Hora de Stands.", "De noche se lee mejor.", "La noche cae. Yo despierto."],
      visit: ["Volviste. Visita {n}.", "Visita {n}. Ya eres familia.", "{n} visitas. Sospechoso. Me gusta."],
    },
    musings: [
      "¿Sabías que no tengo piernas?",
      "Me pregunto qué haría Jotaro aquí.",
      "Este diseño tiene buena pose.",
      "Huele a ゴゴゴ por aquí.",
      "Si me tocas, hablamos.",
      "Pienso, luego Stand.",
      "Un día seré parte del anime.",
      "Sigo aquí. Por si acaso.",
      "Hora de una pose. ¿Lista? No.",
      "¿Y si paro el tiempo? Pídemelo.",
    ],
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
      chapter: ["¡Capítulo nuevo!", "Siguiente episodio. ドン!", "Oh, buen capítulo."],
      faq: ["Buena pregunta.", "Esa también me la hice.", "Ábrela toda. Es corta."],
      hesitate: ["¿Dudando? Dale.", "Ese botón no muerde.", "Un clic. Yo te cubro."],
      typing: ["Escribe. No miro.", "Tómate tu tiempo.", "Eso. Sin miedo."],
      resize: ["¿Me encoges? Oye.", "La página se estira. Yo no."],
      thrown: ["¡WRYYYYY!", "¡Oye! ¡Me mareo!", "¡No soy una pelota!", "Todo da vueltas…"],
      dropped: ["¡Bájame! Ah, ya.", "Aterrizaje elegante.", "¿Me moviste? Valiente."],
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
      greetAgain: ["¿Otra vez tú? Me caes bien.", "Volviste. Sabía que lo harías.", "Nuestro destino era hablar de nuevo."],
      options: {
        who: "¿Quién eres?",
        cris: "Háblame de él",
        guide: "Llévame a…",
        trivia: "Algo de JoJo",
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
      trivia: [
        "JoJo empezó en 1987. Araki no envejece. Sospechoso.",
        "Desde la Parte 4, los Stands se llaman como canciones.",
        "Yo me llamo como una canción de Radiohead. Tradición.",
        "La pose JoJo tiene nombre: JoJo-dachi.",
        "ゴゴゴ es el sonido de la tensión. Literal.",
        "Los Joestar nacen con una estrella en el hombro.",
        "DIO pasó cien años dormido en el fondo del mar.",
        "El Hamon se aprende respirando. Yo no respiro.",
        "Roundabout de Yes cerraba el anime. To be continued.",
        "Jotaro dice yare yare daze cuando algo le fastidia.",
        "Speedwagon se retira con estilo. Siempre.",
      ],
      guidePrompt: ["¿A dónde? Yo vuelo, tú miras.", "Elige destino. Agárrate."],
      guide: {
        projects: { label: "Sus proyectos", say: ["¡A los capítulos!", "Proyectos. Sujétate."] },
        sites: { label: "Las páginas", say: ["Páginas en línea. ¡Vamos!", "A la tira de páginas."] },
        pricing: { label: "Los precios", say: ["Precios. Sin miedo.", "Vamos a lo concreto."] },
        contact: { label: "Hablar con él", say: ["¡Al contacto! ドン!", "Buena decisión. Vamos."] },
      },
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
      starplatinum: {
        name: "Star Platinum",
        jp: "オラオラ",
        say: ["¡ORA ORA ORA ORA!", "Star Platinum… ¡ORA!"],
        done: ["Yare yare daze.", "Ráfaga completa. Nada roto.", "Así golpea Jotaro. Más o menos."],
      },
      crazydiamond: {
        name: "Crazy Diamond",
        jp: "ドラララ",
        say: ["¡DORARARARA!", "Crazy Diamond… ¡DORA!"],
        done: ["Roto y arreglado. Como nuevo.", "Crazy Diamond lo deja mejor.", "¿Qué le dijiste a mi peinado?"],
      },
      goldexperience: {
        name: "Gold Experience",
        jp: "生命を",
        say: ["Gold Experience. ¡Vida!", "Yo, Giorno… no. Pero casi."],
        done: ["La página está viva. Literal.", "Mariquitas incluidas. De nada."],
      },
      echoes: {
        name: "Echoes",
        jp: "エコーズ",
        say: ["¡Echoes! Sonidos pegados."],
        done: ["Ahora la página suena.", "Se despegan solos. Tranquilo."],
      },
      softwet: {
        name: "Soft & Wet",
        jp: "シャボン",
        say: ["Soft & Wet. ¡Revienta las burbujas!", "Burbujas. Tócalas."],
        done: ["Se fueron flotando. Otra vez será.", "Burbujas libres. Qué paz."],
        bonus: ["¡Todas! Te robaste su sonido.", "Ninguna escapó. Gappy estaría orgulloso."],
      },
      hermit: {
        name: "Hermit Purple",
        jp: "ハーミット",
        say: ["Hermit Purple… a ver qué veo."],
        done: [],
      },
      madeinheaven: {
        name: "Made in Heaven",
        jp: "時は加速する",
        say: ["¡Made in Heaven! El tiempo acelera."],
        done: ["Uf. Volvimos a la velocidad normal.", "Un universo nuevo. Igualito al de antes."],
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
        "Open one. It's really live.",
        "Each one, its own Stand.",
        "Real. Domains and all.",
      ],
      audit: [
        "Paste your link. No fear.",
        "Free. Suspicious, right?",
        "Your site is staring at me.",
        "I don't judge. Much.",
        "Six checks. Like my fingers.",
        "Daga kotowaru… no, go on.",
        "My Hermit Purple checks too.",
        "If it goes red, wasn't me.",
        "Takes seconds.",
      ],
      about: [
        "That's my user.",
        "One arrow, and here we are.",
        "He types. I exist.",
        "Engineer and editor. Me: Stand.",
        "Security first. Me second.",
        "Read slowly. There's tension.",
        "His dream beats Giorno's.",
        "Destination: Bucaramanga.",
        "His Bizarre Adventure starts here.",
      ],
      standcard: [
        "That's me. Taller in person.",
        "Potential A. Modesty C.",
        "Speed B. I'm training.",
        "Don't trust the hexagon.",
        "My best angle. That one.",
        "Paranoid Android. Yes, the song.",
        "Tap the arrow. If you dare.",
        "Range: the whole page.",
        "Precision A. Aim, no idea.",
      ],
      github: [
        "Every column is a day.",
        "Hit them. They like it.",
        "August woke something up.",
        "I stacked the tall one.",
        "ゴゴゴゴゴ…",
        "Commit after commit. ORA.",
        "Spin it. Epic from behind.",
        "Columns rising. Like me.",
        "A day without commits: yare yare.",
        "Every cube, one ORA.",
      ],
      services: [
        "Pick one. Or all of them.",
        "No templates.",
        "All by hand. Well, keyboard.",
        "Open one. I'll wait.",
        "Something else? Ask him.",
        "From logo to server. All of it.",
        "Every service, its own chapter.",
        "Video too? Yes. He edits.",
        "More useful than a time Stand.",
      ],
      projects: [
        "Three chapters. No filler.",
        "Chapter 2 is my favourite.",
        "Spoiler: they end well.",
        "Not an anime. It's real.",
        "Switch tabs. There's more.",
        "Real screenshots. No tricks.",
        "Ending: To be continued.",
        "Chapter 3 isn't bad either.",
        "King Crimson saw all of this.",
      ],
      pricing: [
        "Prices out in the open.",
        "Cheaper than an arrow.",
        "The middle one is the chosen.",
        "Nigerundayo… no, stay.",
        "Final price agreed up front.",
        "Extras are written down.",
        "Speedwagon would approve.",
        "No fine print. No ゴゴゴ.",
        "Take your time. No pressure.",
      ],
      faq: [
        "Ask anything.",
        "I read them all. Twice.",
        "Not there? Message him.",
        "Open them. They won't explode.",
        "Short and to the point.",
        "My answers: ORA. His are better.",
        "Unsure? Open another.",
        "Hermit Purple read them already.",
      ],
      contact: [
        "Write. I'll let him know.",
        "He usually replies same day.",
        "One message. Just one.",
        "WhatsApp or email. Your call.",
        "You made it this far…",
        "Say it. ゴゴゴ.",
        "He reads everything. So do I.",
        "The chapter closes here.",
        "Your turn. I've talked enough.",
      ],
      tbc: ["To be continued…", "End of Part 9.", "Arrivederci. Or not.", "Scroll up. There's more.", "Hear Roundabout?", "The arrow points up. Go.", "The end. Or a new beginning."],
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
    greetings: {
      morning: ["Morning. Coffee or Hamon?", "Early. Like Jonathan.", "The sun is up. Ugh."],
      afternoon: ["Good afternoon. Reading time.", "An afternoon of Stands. Good pick.", "Nap cancelled. Let's go."],
      evening: ["Good evening. Stand hours.", "Reads better at night.", "Night falls. I wake up."],
      visit: ["You're back. Visit {n}.", "Visit {n}. Family now.", "{n} visits. Suspicious. I like it."],
    },
    musings: [
      "Did you know I have no legs?",
      "What would Jotaro do here?",
      "This layout has a good pose.",
      "Smells like ゴゴゴ around here.",
      "Tap me and we talk.",
      "I think, therefore Stand.",
      "Someday I'll be in the anime.",
      "Still here. Just in case.",
      "Pose time. Ready? No.",
      "Want me to stop time? Ask.",
    ],
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
      chapter: ["New chapter!", "Next episode. ドン!", "Oh, good chapter."],
      faq: ["Good question.", "I wondered that too.", "Read it all. It's short."],
      hesitate: ["Hesitating? Go on.", "That button doesn't bite.", "One click. I've got you."],
      typing: ["Type away. I'm not looking.", "Take your time.", "That's it. No fear."],
      resize: ["Shrinking me? Hey.", "The page stretches. I don't."],
      thrown: ["WRYYYYY!", "Hey! I'm dizzy!", "I'm not a ball!", "Everything's spinning…"],
      dropped: ["Put me down! Oh, ok.", "Elegant landing.", "You moved me? Brave."],
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
      greetAgain: ["You again? I like you.", "Back. I knew you would be.", "It was our fate to talk again."],
      options: {
        who: "Who are you?",
        cris: "Tell me about him",
        guide: "Take me to…",
        trivia: "Some JoJo trivia",
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
      trivia: [
        "JoJo started in 1987. Araki doesn't age. Suspicious.",
        "Since Part 4, Stands are named after songs.",
        "I'm named after a Radiohead song. Tradition.",
        "The JoJo pose has a name: JoJo-dachi.",
        "ゴゴゴ is the sound of tension. Literally.",
        "Every Joestar has a star birthmark on the shoulder.",
        "DIO slept a hundred years at the bottom of the sea.",
        "You learn Hamon by breathing. I don't breathe.",
        "Yes's Roundabout closed the anime. To be continued.",
        "Jotaro says yare yare daze when he's annoyed.",
        "Speedwagon always withdraws in style.",
      ],
      guidePrompt: ["Where to? I fly, you watch.", "Pick a destination. Hold on."],
      guide: {
        projects: { label: "His projects", say: ["To the chapters!", "Projects. Hold tight."] },
        sites: { label: "The websites", say: ["Live websites. Let's go!", "To the strip of sites."] },
        pricing: { label: "The prices", say: ["Prices. No fear.", "Straight to the point."] },
        contact: { label: "Talk to him", say: ["To the contact! ドン!", "Good call. Let's go."] },
      },
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
      starplatinum: {
        name: "Star Platinum",
        jp: "オラオラ",
        say: ["ORA ORA ORA ORA!", "Star Platinum… ORA!"],
        done: ["Yare yare daze.", "Full barrage. Nothing broken.", "That's how Jotaro hits. Roughly."],
      },
      crazydiamond: {
        name: "Crazy Diamond",
        jp: "ドラララ",
        say: ["DORARARARA!", "Crazy Diamond… DORA!"],
        done: ["Broken and fixed. Good as new.", "Crazy Diamond leaves it better.", "What did you say about my hair?"],
      },
      goldexperience: {
        name: "Gold Experience",
        jp: "生命を",
        say: ["Gold Experience. Life!", "I, Giorno… no. But close."],
        done: ["The page is alive. Literally.", "Ladybugs included. You're welcome."],
      },
      echoes: {
        name: "Echoes",
        jp: "エコーズ",
        say: ["Echoes! Stuck-on sounds."],
        done: ["Now the page has sound.", "They peel off by themselves."],
      },
      softwet: {
        name: "Soft & Wet",
        jp: "シャボン",
        say: ["Soft & Wet. Pop the bubbles!", "Bubbles. Touch them."],
        done: ["They floated away. Next time.", "Free bubbles. So calm."],
        bonus: ["All of them! You stole their sound.", "None escaped. Gappy would be proud."],
      },
      hermit: {
        name: "Hermit Purple",
        jp: "ハーミット",
        say: ["Hermit Purple… let's see."],
        done: [],
      },
      madeinheaven: {
        name: "Made in Heaven",
        jp: "時は加速する",
        say: ["Made in Heaven! Time speeds up."],
        done: ["Phew. Back to normal speed.", "A brand new universe. Same as before."],
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
