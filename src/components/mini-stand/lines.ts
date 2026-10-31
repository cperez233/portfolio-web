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
 * que suenen a alguien hablando y no a un rotulo,
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

/** Las entradas del hero que viven en components/ui/hero-intros/. */
export type IntroLineId = "crimson" | "dust" | "gold" | "zipper" | "echoes" | "tbc" | "door";

export interface PowerLines {
  name: string;
  jp: string;
  say: string[];
  done: string[];
  /** Lo que dice si el poder sale "redondo" (p. ej. reventar todas las burbujas). */
  bonus?: string[];
  /** Frases propias de cada variante del poder (si no hay, usa say/done). */
  variants?: Record<string, { say: string[]; done?: string[] }>;
  /** El nombre del ataque, gritado justo antes de que se active. */
  call?: string;
}

export interface StandLines {
  label: string;
  spots: Record<string, string[]>;
  outro: string[];
  sleep: string;
  wake: string[];
  home: string[];
  console: string;
  /** Saludo al hacerse pequeno en el hero, segun la hora del visitante. */
  greetings: {
    /** Madrugada, de 0:00 a 4:59 (desbloquea el secreto "night"). */
    owl: string[];
    /** 5:00 a 7:59. */
    early: string[];
    /** 8:00 a 11:59. */
    morning: string[];
    /** 12:00 a 13:59. */
    midday: string[];
    /** 14:00 a 18:59. */
    afternoon: string[];
    /** 19:00 a 21:59. */
    evening: string[];
    /** 22:00 a 23:59. */
    late: string[];
    visit: string[];
  };
  /** Lo que dice solo, posado, si lleva rato callado. */
  musings: string[];
  /**
   * Ayuda concreta segun la seccion en que esta posado (ids de data-spot):
   * que tocar, que arrastrar, a donde ir despues. La dice señalando,
   * cuando llevas rato leyendo ahi sin que el hable.
   */
  tips: Record<string, string[]>;
  /** Una vez por visita, si nunca abriste su chat: que se le puede tocar. */
  nudge: string[];
  /** Golpe de efecto al posarse (se pinta como onomatopeya). */
  landing: string[];
  events: Record<StandEvent, string[]>;
  /**
   * Las entradas del hero (portfolio-hero.tsx). world y diamond: lo que
   * dice el chico al terminar cada una. Con Crazy Diamond el grande le
   * rompe la pantalla a quien mira: oops cuando se da cuenta, fixed
   * cuando ya la arreglo. Con ZA WARUDO posa con el tiempo detenido y
   * cuenta un chiste en dos tiempos (jokes: [lo que dice primero, el
   * remate, ya riendose]); laughs es la risa que sale como onomatopeya.
   */
  intro: {
    world: string[];
    diamond: string[];
    oops: string[];
    jokes: [string, string][];
    laughs: string[];
    /**
     * Lo que remata el chico al terminar cada entrada de hero-intros/ (las
     * cortas, para celular, de 30 caracteres o menos) y si la saltaste.
     */
    end: Record<IntroLineId, string[]>;
    skipped: string[];
    /**
     * King Crimson: los rotulos del medidor (eta lleva {n}: el tiempo que
     * falta), lo que dice mientras espera y lo que dice ya con el resultado.
     */
    crimson: {
      loading: string;
      eta: string;
      epitaph: string;
      erased: string;
      done: string;
      result: string;
      /** Los pasos de la carga (diseno, codigo, entrega) y como se marcan. */
      steps: string[];
      doing: string;
      now: string;
      wait: string[];
      cut: string[];
    };
    /** Bites the Dust: lo que grita justo antes de la activacion. */
    dust: string[];
    /** Gold Experience: mientras florece el nombre. */
    gold: string[];
    /**
     * Sticky Fingers: el codigo que se ve con la pagina abierta (un renglon
     * por elemento), lo que dice mientras esta abierta y al cerrarla.
     */
    zipper: { code: string[]; talk: string[] };
    /** Echoes ACT 3: levantando el nombre (shout) y ya arriba. */
    echoes: { strain: string[] };
    /** To Be Continued: lo que dice al volver el color ({n}: tu proxima visita). */
    tbc: { after: string[] };
    /**
     * Heaven's Door: los rotulos de las paginas, el sello, las ordenes que
     * te escribe (sale una al azar; 70 caracteres o menos) y el remate.
     */
    door: { lifeLabel: string; orderLabel: string; seal: string; orders: string[]; done: string[] };
  };
  /**
   * Tiempo detenido (toque en el retrato o ZA WARUDO): el Stand es el
   * unico que se mueve. sections: burlas segun donde ocurre (ids de
   * data-spot, "hero" y "default"); attempt: si intentas moverte;
   * resume: cuando el tiempo vuelve a correr.
   */
  timeStop: { sections: Record<string, string[]>; attempt: string[]; resume: string[] };
  chat: {
    title: string;
    close: string;
    greet: string[];
    greetAgain: string[];
    options: { who: string; cris: string; guide: string; trivia: string; power: string; janken: string; darby: string; sound: string; bye: string };
    who: string[][];
    cris: string[];
    trivia: string[];
    guidePrompt: string[];
    guide: Record<GuideId, { label: string; say: string[] }>;
    powerPrompt: string[];
    bye: string[];
    back: string;
    /** Sonido (apagado por defecto): etiqueta para apagarlo y lo que dice al cambiarlo. */
    sound: { stop: string; on: string[]; off: string[] };
  };
  powers: Record<PowerId, PowerLines>;
  /** Hermit Purple: lo que "ve" de la visita. {min}, {parts}, {total}, {secrets}, {visits}. */
  hermit: string[];
  /** Hermit Purple: rotulo de la foto de espiritu. */
  hermitPhoto: { title: string; time: string; parts: string; secrets: string; visits: string };
  /** Bites the Dust: al volver, el Stand repite su ultima frase con esto delante. */
  dejaVu: string[];
  /** Made in Heaven: el universo anterior (la pagina vieja) y el Stand frenandolo. */
  universe: { label: string; tagline: string; badge: string; loading: string; stop: string[] };
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
  /** Apuesta de almas (mayor o menor), guino a Daniel D'Arby y Osiris. */
  darby: {
    title: string;
    intro: string[];
    ask: string;
    higher: string;
    lower: string;
    shown: string;
    hidden: string;
    call: string;
    /** win: el Stand gana la ronda. lose: la pierde. */
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
        "Todas están en línea. Ábrelas.",
        "Toca una, no muerden.",
        "Ninguna salió de plantilla.",
        "Hasta hay un hotel en Santa Marta.",
        "Una peluquería canina. Guau, sí.",
        "Licorera 24/7. Yo no tomo.",
        "Camionetas en Barranca. ブロロロ.",
        "Una joyería en Italia, ojo.",
      ],
      audit: [
        "Pega tu link sin miedo.",
        "¿Gratis? Suena sospechoso, lo sé.",
        "Revisa. Yo no juzgo… mucho.",
        "Daga kotowaru… mentiras, dale.",
        "Si sale rojo, yo no fui.",
        "No se guarda nada. Palabra de Stand.",
      ],
      about: [
        "Ese es mi usuario.",
        "Una flecha y aquí estamos.",
        "Ingeniero, editor… y yo, su Stand.",
        "Revisa cerraduras. Hasta las mías.",
        "Él dirige carpy. Yo, nada.",
        "35K en TikTok. Yo tengo cero.",
      ],
      standcard: [
        "Ese soy yo. En persona soy más alto.",
        "Potencial A, modestia C.",
        "Velocidad B. Estoy entrenando.",
        "No le crean al hexágono.",
        "Toca la flecha, si te atreves.",
        "¿Poder C? Es humildad.",
        "Esa flecha me hizo. Respeto.",
      ],
      github: [
        "Cada columna es un día.",
        "Golpéalas, que les gusta.",
        "En agosto se despertó algo.",
        "Commit tras commit. ORA.",
        "Gíralo, de espaldas se ve épico.",
        "¿Un día sin commits? Yare yare.",
        "Toca una y te dice el día.",
      ],
      services: [
        "Elige uno. O todos, no juzgo.",
        "Aquí no hay plantillas.",
        "Abre uno, yo espero.",
        "Del logo al servidor.",
        "¿Video también? Sí, él edita.",
        "Es como elegir Stand.",
      ],
      projects: [
        "Capítulos sin relleno.",
        "Spoiler: todos terminan bien.",
        "Cambia de pestaña, que hay más.",
        "Capturas reales, sin trucos.",
        "King Crimson ya los vio todos.",
        "Una trivia para jugar con amigos.",
      ],
      pricing: [
        "Los precios están a la vista.",
        "Sale más barato que una flecha.",
        "Nigerundayo… no, quédate.",
        "El precio final se acuerda antes.",
        "Lo que va aparte está escrito.",
        "El dominio queda a tu nombre.",
      ],
      faq: [
        "Pregunta lo que quieras.",
        "Me las leí todas. Dos veces.",
        "¿No está la tuya? Escríbele.",
        "Ábrelas, no explotan.",
        "Mis respuestas: ORA. Las de él son mejores.",
      ],
      contact: [
        "Escríbele, yo le aviso.",
        "Suele responder el mismo día.",
        "Un mensaje. Solo uno.",
        "WhatsApp o correo, tú decides.",
        "Dilo sin miedo. ゴゴゴ.",
        "Tu turno. Yo ya hablé mucho.",
      ],
      tbc: [
        "To be continued…",
        "Arrivederci. O no.",
        "Sube, que hay más.",
        "¿Oyes Roundabout? Yo sí.",
        "La siguiente parte la escribes tú.",
      ],
    },
    outro: [
      "¿No te cansas? Yo sí.",
      "Se me acabaron las frases. Muda.",
      "Desde el principio. Yare yare.",
      "Ya dije todo aquí. Muévete.",
      "Repetir es cosa de Bites the Dust.",
    ],
    sleep: "z z z",
    wake: [
      "¡No estaba dormido!",
      "Meditaba. Hamon.",
      "¿Eh? ¿Volviste?",
      "Me paré el tiempo a mí mismo.",
      "Soñé con un capibara.",
      "¿Dormido yo? Era una pose.",
    ],
    home: ["En casa.", "De vuelta al retrato.", "Mi rincón favorito."],
    console: "¿Me llamaste? Nadie hace eso.",
    greetings: {
      owl: [
        "Búho nocturno detectado.",
        "¿No duermes? Yo tampoco.",
        "Turno de noche. Como DIO.",
      ],
      early: [
        "Madrugador. Respeto.",
        "Temprano. Como Jonathan.",
        "¿Ya desayunaste? Yo no como.",
      ],
      morning: [
        "Buenos días. ¿Café o Hamon?",
        "Buen día. Stand listo.",
        "Mañana. El sol ya salió. Ugh.",
      ],
      midday: [
        "Mediodía. ¿Ya almorzaste?",
        "Hora de almuerzo. Yo no como.",
        "Sol a plomo. Hamon al máximo.",
      ],
      afternoon: [
        "Buenas tardes. Hora de leer.",
        "Siesta cancelada. Vamos.",
        "Buenas tardes. ¡ORA ORA!",
      ],
      evening: [
        "Buenas noches. Hora de Stands.",
        "La noche cae. Yo despierto.",
        "Hora de DIO. Digo, de leer.",
      ],
      late: [
        "Ya es tarde. ¿Un capítulo más?",
        "La noche es joven. Quédate.",
        "Todos duermen. Tú y yo, no.",
      ],
      visit: [
        "Volviste. Visita {n}.",
        "Visita {n}. Ya eres familia.",
        "Otra vez tú. Visita {n}.",
      ],
    },
    tips: {
      sites: ["Arrastra la tira. ¡Speed King!", "Toca una y ábrela en vivo.", "Lánzala fuerte, a ver qué pasa.", "Ninguna es plantilla. Ábrelas."],
      audit: ["Pega tu link y dale revisar.", "Gratis y en segundos. ORA.", "Luego te dice qué arreglar.", "Hermit Purple revisa por ti."],
      about: ["¿Prisa? Tócame y voy a precios.", "Abajo están sus números.", "Sus casos están más abajo. ドン."],
      standcard: ["Arrastra la flecha. Con cuidado.", "Mis stats, como en el manga."],
      github: ["Golpea las columnas. ORA ORA.", "Toca una: te dice el día.", "Arrástralo y gíralo."],
      services: ["Toca uno y ábrelo.", "Abajo dice lo que recibes.", "Cotízalo directo, botón amarillo.", "Elige tu Stand. Digo, servicio."],
      projects: ["Cambia de capítulo arriba.", "Desliza las capturas. Hay más.", "Abajo está el siguiente caso.", "Mira el resultado: es real."],
      pricing: ["¿Dudas? Abajo hay preguntas.", "¿No sabes cuál? Revisión gratis.", "Escríbele y lo ajustan.", "Lo que va aparte está escrito."],
      faq: ["Toca una pregunta y se abre.", "¿No está la tuya? Escríbele.", "Abajo está el contacto. ドン."],
      contact: ["WhatsApp es lo más rápido.", "Cuéntale qué necesitas y ya.", "Un mensaje cambia el destino."],
      default: ["Tócame y te guío. Speedwagon style.", "¿Perdido? Tócame, te llevo.", "Arriba, el menú. Abajo, más."],
    },
    nudge: [
      "Psst. Tócame: te guío por aquí.",
      "Tócame. Tengo poderes y mapa.",
      "Soy tu guía, como Speedwagon. Tócame.",
    ],
    musings: [
      "¿Sabías que no tengo piernas?",
      "¿Qué haría Jotaro aquí?",
      "Si me tocas, hablamos.",
      "Pienso, luego Stand.",
      "¿Paro el tiempo? Pídemelo.",
      "Puedes lanzarme. Mejor no.",
      "Tengo diez poderes prestados.",
      "¿Ya probaste Soft & Wet?",
      "Me aburro. ¿Rompo algo?",
      "Shh. Siento un Stand enemigo.",
      "Soy el Stand de un Stand. Meta.",
      "Si me sobas, me pongo feliz.",
      "Ensayo poses cuando no miras.",
      "Hoy le rompí la pantalla a alguien.",
    ],
    landing: ["ドン!", "ドドド", "バァーン", "ゴゴゴ", "ズン", "ドーン", "シュタッ", "ババーン"],
    events: {
      timestop: [
        "¡No me pude mover…!",
        "¿Quién paró el tiempo? ¿Tú?",
        "Me congelaste. Rencor eterno.",
        "Ni yo me salvo de ese reloj.",
        "¡Eso solo lo hace DIO!",
      ],
      ora: ["¡ORA ORA ORA!", "¡Eso! Más fuerte.", "¿Escribiste ora? Respeto.", "Jotaro estaría orgulloso.", "¡ORAAA! Así se escribe."],
      muda: ["¿MUDA? Eso es de DIO.", "Traidor.", "Wryyyy… no, perdón.", "Muda muda… ¿Giorno, eres tú?", "Escribes como villano."],
      tbc: ["To be continued…", "¿Ya? ¿Así termina?", "Suena Roundabout.", "La flecha. Siempre la flecha.", "Fin de temporada."],
      barrage: ["¡Esa es la ráfaga!", "Seis golpes, nada mal.", "Las columnas lloran.", "¡ORA a los commits!", "Esa columna no se recupera."],
      arrow: ["¡Esa flecha! Así nací yo.", "Cuidado, que pica.", "Otro Stand no, por favor.", "La flecha elige, y te eligió.", "¿Despertaste algo? ゴゴゴ."],
      themeLight: ["¡Mis ojos! ¡La luz!", "¿Modo día? Yo soy de noche.", "¿Es el sol de DIO? No.", "Brilla como mi diamante.", "Ugh. Hamon puro."],
      themeDark: ["Mejor. La noche es mía.", "Así sí, oscuro y elegante.", "Ahh. Paz.", "Volvió la noche. Wryyy.", "Mis pixeles respiran."],
      language: ["Cambio de idioma. Interesante.", "Hablo los dos, obvio.", "Bilingüe, como él.", "Otro idioma, mismo Stand.", "Otro idioma, misma pose."],
      whatsapp: ["¡Eso! Escríbele.", "Buena decisión. ゴゴゴ.", "Yo le aviso que vas.", "¡Ese es el espíritu!", "Destino sellado. ドン!"],
      copy: ["¿Copiando? Respeto.", "Llévatelo, es gratis.", "Ctrl+C. Clásico.", "Echoes ya lo grabó.", "Copiado, como un Stand gemelo."],
      return: ["¿Dónde estabas?", "Te esperé quietico.", "Volviste. Lo sabía.", "¿Otra pestaña? Celos.", "King Crimson borró tu ausencia."],
      fastScroll: ["¡Más despacio! Me mareo.", "¡Oye! Esto no es Speed King.", "Wooo… ¿por qué tan rápido?", "¿Made in Heaven o qué?", "¡Me dejas atrás!"],
      stare: ["¿Qué miras?", "Sí, soy yo.", "Tócame si te atreves.", "¿Oh? ¿Te acercas a mí?", "Mirada de Joestar. La conozco."],
      audit: ["Revisando… ゴゴゴ.", "A ver esa página…", "Hermit Purple, ¡muéstrame!", "Analizando. No te muevas.", "Estoy mirando tu página. ゴゴゴ."],
      sent: ["¡Enviado! Él te responde.", "Mensaje entregado. Bien.", "Ahora a esperar. Espero contigo.", "¡Perfecto! ドン!", "Listo. El destino se mueve."],
      bottom: ["Llegaste al final. Respeto.", "Leíste todo. Eres de los míos.", "Fin del volumen. Bien.", "Todo leído: medalla Joestar.", "El final. Hasta aquí llegamos."],
      chapter: ["¡Capítulo nuevo!", "Siguiente episodio. ドン!", "Oh, buen capítulo.", "Ese caso me gusta.", "Pasa la página. ペラ."],
      faq: ["Buena pregunta.", "Esa también me la hice.", "Ábrela toda, es corta.", "Respuesta desbloqueada.", "Curiosidad de Joestar."],
      hesitate: ["¿Dudando? Dale.", "Ese botón no muerde.", "Un clic. Yo te cubro.", "Valor, como Jonathan.", "Nigerundayo… no. Clic."],
      typing: ["Escribe, no miro.", "Tómate tu tiempo.", "Eso, sin miedo.", "Tecleas como ORA.", "Echoes escucha. Tranquilo."],
      resize: ["¿Me encoges? Oye.", "La página se estira. Yo no.", "¿The Hand? Se movió todo.", "Ventana nueva, mismo yo.", "¿Cambió la ventana? Sí."],
      thrown: ["¡WRYYYYY!", "¡Oye! ¡Me mareo!", "¡No soy una pelota!", "Todo da vueltas…", "¡Nigerundayo… ah!"],
      dropped: ["¡Bájame! Ah, ya.", "Aterrizaje elegante.", "¿Me moviste? Valiente.", "Gracias por el viaje.", "Bonita vista desde aquí."],
      pet: ["Ahí, ahí. Justo ahí.", "Eso me gusta. Sigue.", "¿Me estás sobando? Bueno.", "Ronroneo de Stand. Prrr.", "Ay, me sonrojo."],
      rightclick: ["¿Clic derecho? ¿Qué buscas?", "¿Inspeccionando? Qué pena.", "No me mires el código.", "¿Me vas a guardar? Halago.", "Ahí no hay nada. Creo."],
      leave: ["¿Te vas? Aquí te espero.", "Se fue el puntero. Qué frío.", "¿Hola? ¿Sigues ahí?", "Me dejaste hablando solo.", "Vuelve pronto, ¿sí?"],
      offline: ["Se fue el internet. Yo sigo.", "Sin red. A mí no me afecta.", "¿Se cayó el wifi? Qué susto.", "Sin conexión. Yo cuido esto."],
      online: ["Volvió el internet. ¡Uf!", "Conectados otra vez.", "Wifi de vuelta. ドン!", "Volvió la red. Sigamos."],
      select: ["¿Subrayando? Estudioso.", "Eso que marcaste es bueno.", "Selecciona sin miedo.", "¿Vas a copiar eso? Hazlo.", "Buen pedazo elegiste."],
      print: ["¿Me vas a imprimir? ¡Qué honor!", "En papel me veo plano.", "Imprime, que salgo en la foto."],
      spin: ["¡Wiii! Otra vuelta.", "¡Esa tira vuela!", "Así no se lee, pero qué rico.", "¡Rueda, rueda! ゴゴゴ", "Gira como Gyro."],
      service: ["Ese servicio es bueno.", "Mmm, buena elección.", "Lee lo que recibes.", "¿Ese? Lo pensaste bien.", "Hmm… ese te sirve."],
      plan: ["Haciendo cuentas, ¿eh?", "Ese plan rinde.", "Preguntar no cuesta.", "Echoes hace la suma.", "Calculando… ゴゴゴ."],
      review: ["Ay, qué bonito dicen.", "Me sonrojo y ni es mío.", "Clientes contentos. ♥", "Eso lo dijeron solos.", "Léelo, me pone feliz."],
      visit: ["Ve, yo cuido la pestaña.", "Míralo en vivo. ✦", "Ese quedó bonito.", "Vuelve y me cuentas.", "Esa página la vi nacer."],
      github: ["¿El código? Está limpio.", "Mira los commits. ORA.", "El cuarto de máquinas.", "Revisa sin miedo.", "Ahí no hay bugs. Creo."],
      gallery: ["Pasa, pasa. Hay más.", "Esa captura es real.", "Mira los detalles.", "Así quedó en vivo.", "Desliza, no muerde."],
    },
    intro: {
      world: [
        "そして時は動き出す。",
        "¿Lo viste? Casi nadie lo ve.",
        "El tiempo corre otra vez.",
        "Ya posé. Ahora te toca a ti.",
        "Valió la pena parar el mundo.",
        "Nadie vio nada. Salvo tú.",
        "Mi mejor pose y nadie la vio.",
      ],
      diamond: [
        "Te rompí la pantalla. Ya la arreglé.",
        "Tranquilo, quedó como nueva.",
        "Ni un rayón. Crazy Diamond.",
        "Perdón, me emocioné.",
      ],
      oops: ["Uy. Qué pena.", "Ups… tu pantalla.", "Eso sonó caro.", "¿Eso fue el vidrio?", "Ay. Me pasé."],
      jokes: [
        ["Detuve el tiempo del mundo entero…", "…para posar sin que nadie me interrumpa."],
        ["Nadie se puede mover…", "…ni para tomarme una foto. Rayos."],
        ["Cinco segundos de poder absoluto.", "Y los gasto en esto. Ni modo."],
        ["Mírame bien. Ah, no puedes.", "Ese es el chiste. フフフ."],
        ["DIO tiraba cuchillos.", "Yo prefiero posar. Es más elegante."],
        ["El mundo se detuvo…", "…y yo con la mejor pose de mi vida."],
        ["Shh… el mundo está en pausa.", "Aprovecho para estirarme. Así."],
        ["¿Cuánto me queda? ¿Tres segundos?", "Alcanza para quedarme así un rato."],
        ["Nadie va a creer que pasó esto.", "Mejor. Así es más misterioso."],
      ],
      laughs: ["フハハハ", "WRYYY", "ハハハ", "フフフ"],
      end: {
        crimson: ["Saltamos a lo bueno.", "¿Qué pasó? Nada. King Crimson.", "Ese tiempo no vuelve. Sigue.", "Corte limpio. De nada."],
        dust: ["¿Raro, no? Ya pasó una vez.", "Déjà vu resuelto. Sigue.", "Esto ya lo vi. Ah, no.", "Rollback exitoso."],
        gold: ["Las flores se van. Cris no.", "Vuelve a ser texto. Por ahora.", "Giorno estaría orgulloso."],
        zipper: ["Cerrado. Arrivederci.", "Todo en su sitio. Ari ari.", "Ziiip. Listo."],
        echoes: ["Ya pesa normal. Creo.", "Mi espalda… Sigue.", "Todo en su sitio. Uf.", "Liviano otra vez. ズン."],
        tbc: ["Empieza el episodio. ゴゴゴ.", "Hoy el protagonista eres tú.", "Nuevo capítulo. Sin spoilers.", "Siguiente episodio: tú bajas, yo narro."],
        door: ["Ya lo sabes. Sin vuelta atrás.", "Lo escrito, escrito está.", "Rohan lo escribió. Se cumple.", "Ahora no se te olvida."],
      },
      skipped: ["¿Saltaste mi entrada? Respeto.", "Directo al grano. Me gusta.", "Sin ceremonia. Muy ingeniero.", "Ok, ok. Ya llegué."],
      crimson: {
        loading: "Cargando a Cris…",
        eta: "Tiempo restante: {n}",
        epitaph: "el futuro",
        erased: "Tiempo borrado",
        done: "Cris, cargado al 100%",
        result: "Ingeniero de sistemas · Creador de contenido",
        steps: ["Diseño", "Código", "Entrega"],
        doing: "en curso",
        now: "Hora",
        wait: ["Cargando… esto va para largo.", "Ponte cómodo. Son tres horas.", "Ya casi. Bueno, no."],
        cut: [
          "¿La espera? La borré. Solo queda el resultado.",
          "Tres horas de carga. Nadie las vivió. King Crimson.",
          "Me salté lo aburrido. Te dejé lo bueno.",
          "Ese tiempo no pasó. Cris sí: ingeniero y creador.",
        ],
      },
      dust: ["¡Bites the Dust!"],
      gold: [
        "Le di vida al nombre. Así crecen 35K seguidores.",
        "Así crecieron 2.5M de likes: con vida.",
        "Todo lo que toco florece. Las páginas de Cris también.",
        "Una idea, un poco de vida, y crece sola.",
      ],
      zipper: {
        code: [
          "// por dentro: ingeniería",
          "<Hero>",
          "  <Nombre>Cristian Pérez</Nombre>",
          "  <Oficio>ingeniero de sistemas</Oficio>",
          "  <Oficio>creador de contenido</Oficio>",
          "  <Stand poder=\"A\" velocidad=\"B\" />",
          "</Hero>",
        ],
        talk: [
          "Por fuera, diseño. Por dentro, ingeniería.",
          "Así se ve una web de Cris por dentro. Ordenadita.",
          "Bonito por fuera, bien hecho por dentro. Ese es el truco.",
        ],
      },
      echoes: {
        strain: ["¡Pesa como un deploy en viernes!", "¡Uf! Este nombre carga mucha experiencia.", "¡Ni el servidor pesa tanto!"],
      },
      tbc: {
        after: ["Continuará… en el episodio {n}.", "Fin del episodio. Empieza el portafolio.", "To be continued. Tú sigue bajando."],
      },
      door: {
        lifeLabel: "Tu vida · pág. 1",
        orderLabel: "Orden escrita en ti",
        seal: "ヘブンズ・ドアー",
        orders: [
          "Recordarás que Cris es ingeniero de sistemas y creador de contenido.",
          "Comprarás una web, un aplicativo o varios.",
          "Le escribirás a Cris por WhatsApp antes de que acabe el día.",
          "No podrás cerrar esta pestaña sin ver los proyectos.",
          "Recomendarás a Cris al menos a tres personas.",
          "Pensarás «necesito una página así» el resto de la semana.",
          "Seguirás a Cris en redes y le darás like a todo.",
          "Pagarás el anticipo con una sonrisa.",
        ],
        done: ["Listo. Ya no se te olvida.", "Escrito queda. Heaven's Door.", "Lo escrito, escrito está. フフフ."],
      },
    },
    timeStop: {
      sections: {
        hero: ["Posé junto a tu retrato. No lo viste."],
        sites: ["Revisé las diez páginas. Tú, quieto."],
        audit: ["Auditaba mientras no podías.", "Tu link esperó. Yo no."],
        about: ["Leí su historia entera. Ya.", "Ni él se movió. Yo sí."],
        standcard: ["Velocidad B… y aun así me moví.", "Le hice una pose a la flecha."],
        github: ["Ni un commit se movió.", "Conté las columnas. Todas."],
        services: ["Elegí uno por ti. Mentira.", "Los servicios esperaron. Yo no."],
        projects: ["Pausé el capítulo y leí el final.", "El caso se detuvo. Yo no."],
        pricing: ["Congelé los precios. De verdad.", "Ningún precio subió. De nada."],
        faq: ["Me leí todas las respuestas.", "Las preguntas no se abrieron."],
        contact: ["Tu mensaje esperó, quieto.", "Ni el formulario parpadeó."],
        tbc: ["To be… paused.", "La flecha no avanzó."],
        default: ["Nadie se movió. Salvo yo.", "Solo yo en ese mundo.", "Muda muda. Estabas quieto.", "¿Viste algo? No. Nada."],
      },
      attempt: [
        "Intentaste moverte. Lo vi.",
        "Tu dedo no respondió, ¿eh?",
        "¿Querías hacer scroll? Ternura.",
      ],
      resume: ["そして時は動き出す。", "Y el tiempo se mueve.", "¿Me moví? Nunca."],
    },
    chat: {
      title: "Paranoid Android",
      close: "Cerrar la conversación",
      greet: [
        "¿Oh? ¿Me hablas a mí?",
        "Un humano me tocó. ¿Qué quieres?",
        "¿Sí? Estaba posando.",
        "Paranoid Android, a tu servicio.",
        "Me tocaste. Ahora somos aliados.",
        "Tocaste al Stand correcto.",
        "Ya era hora de que me tocaras.",
      ],
      greetAgain: [
        "¿Otra vez tú? Me caes bien.",
        "Volviste. Sabía que lo harías.",
        "Ya somos amigos, ¿no?",
        "Regresaste. La flecha te marcó.",
      ],
      options: {
        who: "¿Quién eres?",
        cris: "Háblame de Cris",
        guide: "Llévame a…",
        trivia: "Algo de JoJo",
        power: "Usa un poder",
        janken: "Juguemos jan-ken",
        darby: "Apostemos almas",
        sound: "Activar sonido",
        bye: "Nada, sigue",
      },
      who: [
        ["Soy Paranoid Android.", "El Stand de Cristian.", "Nací de una flecha. Larga historia."],
        ["Un Stand: un espíritu hecho poder.", "Él programa y yo existo, con estilo."],
        ["Me dicen PA.", "Bueno, nadie me dice nada.", "Tú puedes ser el primero."],
        ["Vivo en esta página.", "Duermo en el retrato.", "Y me poso en lo que lees."],
        ["Tengo poderes prestados.", "Ninguno es mío, técnicamente.", "Pero los uso con estilo."],
        ["Mi diamante es mi corazón.", "Diamond is Unbreakable.", "Yo tampoco. Creo."],
        ["Soy un Stand de pixel art.", "Pequeño, eso sí, con presencia.", "Y la presencia es el 90% del poder."],
        ["No tengo nombre de usuario.", "Tengo nombre de canción.", "Paranoid Android. Radiohead. Tradición."],
        ["Soy un Stand de largo alcance.", "Alcance: toda la página.", "Y no pido permiso."],
        ["Nací entre componentes.", "Crecí entre líneas de código.", "Hoy soy tu guía, algo dramático."],
      ],
      cris: [
        "Hace páginas, software y video.",
        "Vive en Bucaramanga. Trabaja remoto.",
        "Cofundó carpy, un estudio de software.",
        "Viene de ciberseguridad. Revisa cerraduras.",
        "Tiene más de 35K seguidores con contenido propio.",
        "Trabaja en español y en inglés.",
        "Le escribes por WhatsApp y suele responder el mismo día.",
        "Tiene diez páginas web en línea para negocios.",
        "Hizo la de un hotel en Santa Marta.",
        "Trabaja con negocios de toda Colombia y de afuera.",
        "El dominio y el hosting quedan a nombre del cliente.",
        "Hace también logo, colores y contenido.",
        "Hizo un buscador de actas que las encuentra en segundos.",
        "Habla por WhatsApp o por videollamada.",
      ],
      trivia: [
        "JoJo empezó en 1987 y Araki no envejece. Sospechoso.",
        "Desde la Parte 4, los Stands se llaman como canciones.",
        "Yo me llamo como una canción de Radiohead. Es tradición.",
        "La pose JoJo tiene nombre: JoJo-dachi.",
        "ゴゴゴ es, tal cual, el sonido de la tensión.",
        "Los Joestar nacen con una estrella en el hombro.",
        "DIO pasó cien años dormido en el fondo del mar.",
        "El Hamon se aprende respirando. Yo no respiro.",
        "Roundabout de Yes cerraba el anime. To be continued.",
        "Jotaro dice yare yare daze cuando algo le fastidia.",
        "Speedwagon se retira con estilo. Siempre.",
        "Killer Queen se llama como una canción de Queen.",
        "Bites the Dust: otra canción de Queen.",
        "Crazy Diamond viene de Pink Floyd.",
        "Kira solo quería una vida tranquila. Ajá, claro.",
        "Josuke se enoja si hablan mal de su peinado.",
        "Los Stands solo los ven otros usuarios de Stand.",
        "Joseph adivina lo que vas a decir. Siempre.",
        "Gold Experience le da vida a lo que toca.",
        "La Parte 3 tiene Stands de cartas del tarot.",
        "Rohan dibuja más rápido que tú lees esto.",
        "Polnareff tiene el peinado más alto de JoJo.",
        "Casi todos los protagonistas son JoJo: Jonathan, Joseph, Jotaro, Josuke, Jolyne, Johnny.",
        "Giorno Giovanna es hijo de DIO, y salió buena gente.",
        "Jonathan Joestar fue el primer JoJo y el más caballero.",
        "La Parte 3 es un viaje de 50 días de Japón a Egipto.",
        "Los Stands de los secuaces de DIO llevan nombres de dioses egipcios.",
        "Araki sacó la palabra Stand de la canción Stand By Me.",
        "Heaven's Door, el Stand de Rohan, viene de una canción de Bob Dylan.",
        "Gold Experience se llama como un álbum de Prince.",
        "Sticky Fingers viene de un álbum de los Rolling Stones.",
        "Mista le tiene pánico al número 4.",
        "Los Sex Pistols de Mista son seis. Falta el número 4.",
        "Josuke golpea con DORA, Jotaro con ORA y Giorno con MUDA.",
        "Jolyne es la primera protagonista mujer de JoJo.",
        "La Parte 6 transcurre en una prisión de Florida.",
        "Steel Ball Run, la Parte 7, es una carrera a caballo cruzando Estados Unidos.",
        "Jotaro termina siendo biólogo marino. Con su gorra, claro.",
        "La gorra de Jotaro parece pegada a su pelo. Nadie sabe cómo.",
        "Caesar Zeppeli peleaba soplando burbujas con Hamon.",
        "A Kakyoin le encantan las cerezas. Su Stand es Hierophant Green.",
        "Iggy es un perro con un Stand de arena. Y adora el chicle de café.",
        "Silver Chariot es el Stand espadachín de Polnareff.",
        "Magician's Red, el Stand de Avdol, controla el fuego.",
        "Made in Heaven también es un álbum de Queen.",
        "King Crimson, el Stand de Diavolo, se llama como una banda de rock.",
        "Purple Haze, el Stand de Fugo, es una canción de Jimi Hendrix.",
        "Echoes, el Stand de Koichi, evoluciona en tres actos.",
        "El anime de JoJo llegó en 2012.",
        "JoJo nació en la revista Weekly Shonen Jump.",
        "Kira Yoshikage tiene 33 años y colecciona manos. Qué escalofrío.",
        "Las poses de JoJo se inspiran en esculturas italianas y revistas de moda.",
        "Joseph grita OH MY GOD cada dos escenas.",
        "Whitesnake, el Stand de Pucci, saca recuerdos como si fueran discos.",
        "Gold Experience Requiem devuelve todo a cero.",
        "Tusk, el Stand de Johnny, evoluciona en cuatro actos.",
        "Speedwagon fue ladrón antes de ser aliado.",
        "Hay dos Josuke: el de la Parte 4 y el de la Parte 8. Distintos.",
        "Jonathan aprendió Hamon para enfrentar a DIO.",
        "Star Platinum también puede parar el tiempo. Cinco segundos, más o menos.",
      ],
      guidePrompt: ["¿A dónde? Yo vuelo, tú miras.", "Elige destino. Agárrate.", "¿A dónde vamos, compañero?"],
      guide: {
        projects: { label: "Sus proyectos", say: ["¡A los capítulos!", "Proyectos. Sujétate.", "Vamos a los casos. ドン!"] },
        sites: { label: "Las páginas", say: ["Páginas en línea. ¡Vamos!", "A la tira de páginas.", "Páginas a la medida. ¡Vuela!"] },
        pricing: { label: "Los precios", say: ["Precios. Sin miedo.", "Vamos a lo concreto.", "A la tabla. Respira."] },
        contact: { label: "Hablar con él", say: ["¡Al contacto! ドン!", "Buena decisión. Vamos.", "Directo a él. ¡Vamos!"] },
      },
      powerPrompt: [
        "Tengo poderes prestados. Elige.",
        "Elige, pero no me hago responsable.",
        "¿Cuál? Todos son peligrosos.",
        "Diez Stands en uno. ¿Cuál quieres?",
      ],
      bye: ["Arrivederci.", "Me voy a posar por ahí.", "Yare yare. Adiós.", "Nos vemos en el próximo capítulo.", "Que la flecha te acompañe."],
      back: "Otra cosa",
      sound: {
        stop: "Silenciar",
        on: [
          "Sonido encendido. Ya me oyes.",
          "Ahora sí hay ドン de verdad.",
          "Con sonido. Que tiemble el cristal.",
          "Listo. Los golpes suenan.",
          "Sonido on. Cuidado con los oídos.",
        ],
        off: [
          "Silencio, como un Stand de verdad.",
          "Sin sonido. Poso en silencio.",
          "Mudo otra vez. Muda, muda.",
          "Callado. Sigo posando.",
          "Apagado. Ahora las grietas no suenan.",
        ],
      },
    },
    powers: {
      zawarudo: {
        name: "ZA WARUDO",
        jp: "時よ止まれ",
        say: ["¡ZA WARUDO!", "¡ZA WARUDO! ¡Toki yo tomare!", "Mi mundo. ¡ZA WARUDO!"],
        done: ["Y el tiempo vuelve a moverse.", "そして時は動き出す。", "¿Viste algo? No, nada.", "Esos cinco segundos fueron míos."],
      },
      starplatinum: {
        name: "Star Platinum",
        jp: "オラオラ",
        say: ["¡ORA ORA ORA ORA!", "Star Platinum… ¡ORA!"],
        done: ["Yare yare daze.", "Ráfaga completa. Nada roto.", "Así golpea Jotaro. Más o menos."],
        variants: {
          rush: { say: ["¡ORA ORA ORA ORA!", "Star Platinum… ¡ORA!", "¡Rush de ORAs!"], done: ["Yare yare daze.", "Quedó abollado. Se arregla solo.", "Ráfaga completa."] },
          finger: { say: ["¡Star Finger!", "Star Platinum… ¡dedo estelar!"], done: ["Un dedazo preciso.", "Precisión A. Ya ves."] },
          world: { say: ["¡Star Platinum: The World!", "Yo también paro el tiempo."], done: ["Un segundo mío.", "Igual que DIO. Pero bueno."] },
        },
      },
      crazydiamond: {
        name: "Crazy Diamond",
        jp: "ドラララ",
        say: ["¡DORARARARA!", "Crazy Diamond… ¡DORA!", "¡Doraaaa!"],
        done: ["Roto y arreglado. Como nuevo.", "Crazy Diamond lo deja mejor.", "¿Qué le dijiste a mi peinado?", "Todo en su sitio. Casi."],
      },
      goldexperience: {
        name: "Gold Experience",
        jp: "生命を",
        say: ["Gold Experience. ¡Vida!", "Yo, Giorno… no. Pero casi."],
        done: ["La página está viva. De verdad.", "Vida para todos."],
        variants: {
          garden: { say: ["Gold Experience. ¡Vida!", "¡Que florezca todo!"], done: ["Brotó vida por todas partes.", "Primavera instantánea."] },
          tree: { say: ["Gold Experience… ¡un árbol!", "¡Crece!"], done: ["Un árbol entero. Fotosíntesis.", "Ese árbol ya da sombra."] },
          frog: { say: ["Eso de ahí… ¡será una rana!", "Gold Experience. ¡Ribbit!"], done: ["Era parte de la página. Ahora salta.", "La rana volvió a su sitio. Tranquilo."] },
          butterflies: { say: ["¡Mariposas! Vida pura.", "Gold Experience… ¡a volar!"], done: ["Se fueron volando, libres.", "Pura vida, ¿no?"] },
          snake: { say: ["Ese título… ¡serpiente!", "Gold Experience. Sssss."], done: ["Volvió a ser título. Ufff.", "No muerde. Creo."] },
        },
      },
      echoes: {
        name: "Echoes",
        jp: "エコーズ",
        say: ["¡Echoes! Sonidos pegados."],
        done: ["Ahora la página suena.", "Se despegan solos. Tranquilo."],
        variants: {
          act1: { say: ["¡Echoes ACT 1! Sonidos vivos.", "Pego sonidos. Mira cómo suenan."], done: ["La página habló. Lo oíste.", "Ya devolví los sonidos."] },
          act2: { say: ["¡ACT 2! Tócalos. Suenan.", "Echoes ACT 2. Pisa uno."], done: ["¿Los tocaste todos? Bien.", "Se despegaron. Silencio."] },
          act3: { say: ["¡ACT 3! ¡3 FREEZE!", "S-H-I-T… digo, ¡3 FREEZE!"], done: ["Pesado, ¿eh? Ya pasó.", "Volvió a pesar normal."] },
        },
      },
      softwet: {
        name: "Soft & Wet",
        jp: "シャボン",
        say: ["Soft & Wet. ¡Burbujas ladronas!", "Burbujas. Roban cosas. Revéntalas."],
        done: ["Se llevaron cosas. Ya las devolví.", "Burbujas libres. Todo devuelto."],
        bonus: ["¡Todas! Recuperaste todo.", "Ninguna escapó. Gappy estaría orgulloso.", "Reventaste todo. Ladrón de ladronas."],
      },
      hermit: {
        name: "Hermit Purple",
        jp: "ハーミット",
        say: ["Hermit Purple… a ver qué veo.", "¡Hermit Purple! Foto de espíritu."],
        done: ["Foto revelada. Guárdala en tu memoria.", "Joseph estaría orgulloso."],
      },
      madeinheaven: {
        name: "Made in Heaven",
        jp: "時は加速する",
        say: ["¡Made in Heaven! El tiempo acelera.", "Made in Heaven… ¡más rápido!"],
        done: ["Uf. Universo salvado.", "Este universo se queda.", "Casi volvemos al rojo. Nunca más."],
      },
      bitesthedust: {
        name: "Bites the Dust",
        jp: "負けて死ね",
        say: ["Killer Queen… ¡Daisan no bakudan!", "Killer Queen… ¡Bites the Dust!"],
        done: ["El tiempo retrocedió. Nadie lo notó.", "¿Déjà vu? Normal.", "Another one bites the dust."],
        call: "¡Bites the Dust!",
        variants: {
          bomb: { say: ["Killer Queen ya tocó algo…", "Eso de ahí es una bomba."], done: ["Explotó. Y no pasó nada.", "Ctrl+Z, con explosión incluida."] },
          rewind: { say: ["Killer Queen… tercera bomba.", "¿Y si volvemos un rato atrás?"], done: ["El tiempo retrocedió. Nadie lo notó.", "¿Déjà vu? Normal."] },
        },
      },
      kingcrimson: {
        name: "King Crimson",
        jp: "キング・クリムゾン",
        say: ["¡King Crimson!", "King Crimson… borra el tiempo."],
        done: ["Solo queda el resultado.", "Se saltó un trozo. No preguntes.", "Epitaph lo vio venir."],
      },
    },
    hermit: [
      "Veo… {min} en la página.",
      "Veo… {parts} de {total} partes leídas.",
      "Veo… {secrets} secretos encontrados.",
      "Veo… tu visita número {visits}.",
    ],
    hermitPhoto: { title: "Foto de espíritu", time: "En la página", parts: "Partes leídas", secrets: "Secretos", visits: "Visita" },
    dejaVu: ["…¿Déjà vu?", "Ya dije esto, ¿no?", "Otra vez…"],
    universe: {
      label: "Universo anterior",
      tagline: "Páginas web y software que hacen funcionar tu negocio.",
      badge: "Disponible para proyectos nuevos",
      loading: "Reiniciando el universo",
      stop: ["¡ALTO! Este universo me gusta.", "¿Volver al rojo? ¡Ni loco!", "¡NO! Aquí no había Stands."],
    },
    janken: {
      title: "Jan-ken",
      intro: [
        "Piedra, papel o tijera. Tres rondas.",
        "Boy II Man me enseñó. Tres rondas.",
        "Si ganas, nada. Si pierdo, tampoco.",
        "Tres rondas. Sin poderes. Lo juro.",
        "Elige. Ya sé qué vas a sacar.",
        "Piedra, papel o tijera. Sin trampas.",
        "Joseph ya lo intentó. Pierde.",
        "A tres. Te estoy mirando.",
      ],
      hands: { rock: "Piedra", paper: "Papel", scissors: "Tijera" },
      call: "じゃんけんぽん!",
      win: ["¡Ja! Leí tu mente.", "Predecible.", "Tu próxima jugada es… perder.", "Joseph me enseñó.", "Muda.", "Boy II Man estaría orgulloso.", "Tu mano es muy transparente.", "Otra vez yo. Qué suerte tengo."],
      lose: ["Suerte.", "Eso no contó.", "Hm. Interesante.", "¿Usaste un Stand?", "Bien. Por ahora.", "Esa fue de suerte.", "Me distraje. Lo juro.", "¿Cómo supiste?"],
      draw: ["Empate. Otra.", "Pensamos igual. Qué miedo.", "Aiko desho.", "Mismo destino.", "¿Me copiaste?", "Misma mano. Misma mente.", "¿Telepatía? Qué raro.", "Empate. Nadie se mueve."],
      matchWin: ["Gané. Yare yare daze.", "Victoria. Era obvio.", "Muda muda muda.", "Mi Stand no pierde.", "Tres rondas, un ganador. Yo.", "Te lo dije: Boy II Man."],
      matchLose: ["Me ganaste. No se lo digas a él.", "Bien jugado. Revancha.", "…Good.", "Perdí. Pero con estilo.", "Tú ganas. Mi orgullo, no.", "Me ganaste. Respeto."],
      score: "Tú {you} · Stand {me}",
      again: "Revancha",
      close: "Cerrar el juego",
      quit: ["Nigerundayo, ¿eh?", "¿Te vas? Iba ganando.", "¿Huyes? Smokey lo haría.", "¿Ya? Tenía la jugada lista.", "Nos vemos en la revancha."],
    },
    darby: {
      title: "Almas de D'Arby",
      intro: [
        "D'Arby apostaba almas. Yo, tres.",
        "Mayor o menor. Tres almas cada uno.",
        "Apuesta limpia. Sin Hermit Purple.",
        "Osiris me prestó las cartas.",
        "Elige bien. Tu alma está en juego.",
      ],
      ask: "La carta oculta es…",
      higher: "Mayor",
      lower: "Menor",
      shown: "Mi carta",
      hidden: "Oculta",
      call: "魂を賭けろ!",
      win: ["Perdiste un alma. Delicioso.", "La carta no miente. Yo sí.", "D'Arby sonreiría.", "Una menos. Ya casi.", "Osiris lo vio venir."],
      lose: ["Suerte de principiante.", "Me quitaste un alma. Rencor.", "Hm. Contaste las cartas.", "¿Eso fue trampa? Creo.", "Bien. Por ahora."],
      draw: ["Misma carta. Raro.", "Iguales. Ni alma ni victoria.", "Osiris dice: otra vez.", "Hasta las cartas dudan."],
      matchWin: ["Tu alma es mía. Es broma. Casi.", "Gané. Osiris está contento.", "Alma cobrada. ゴゴゴ.", "Fin del juego. Yare yare."],
      matchLose: ["Conservas tu alma. Con suerte.", "Me ganaste. D'Arby lloraría.", "Perdí. Mi alma sigue aquí. Creo.", "…Bien jugado. Revancha."],
      score: "Tus almas {you} · Stand {me}",
      again: "Revancha",
      close: "Cerrar el juego",
      quit: ["¿Te vas con tu alma? Qué suerte.", "Huir también es apostar.", "Joseph también hacía trampa. Y huía."],
    },
  },
  en: {
    label: "Mini Stand: talk to it",
    spots: {
      sites: [
        "All of them are live. Open one.",
        "Tap one, they don't bite.",
        "Not a single template here.",
        "There's even a hotel in Santa Marta.",
        "A dog groomer. Woof, yes.",
        "Liquor store, 24/7. I don't drink.",
        "Trucks in Barrancabermeja. ブロロロ.",
        "A jewelry store in Italy, too.",
      ],
      audit: [
        "Paste your link, don't be shy.",
        "Free? Sounds suspicious, I know.",
        "Go on. I don't judge… much.",
        "Daga kotowaru… kidding, go.",
        "If it turns red, wasn't me.",
        "Nothing gets stored. Stand's honor.",
      ],
      about: [
        "That's my user.",
        "One arrow and here we are.",
        "Engineer, editor… and me, his Stand.",
        "He checks locks. Even mine.",
        "He runs carpy. I run nothing.",
        "35K on TikTok. I have zero.",
      ],
      standcard: [
        "That's me. Taller in person.",
        "Potential A, modesty C.",
        "Speed B. I'm training.",
        "Don't trust the hexagon.",
        "Tap the arrow, if you dare.",
        "Power C? That's humility.",
        "That arrow made me. Respect.",
      ],
      github: [
        "Every column is a day.",
        "Hit them, they like it.",
        "Something woke up in August.",
        "Commit after commit. ORA.",
        "Spin it, it looks epic from behind.",
        "A day with no commits? Yare yare.",
        "Tap one and it tells you the day.",
      ],
      services: [
        "Pick one. Or all, no judgment.",
        "No templates here.",
        "Open one, I'll wait.",
        "From the logo to the server.",
        "Video too? Yes, he edits.",
        "It's like choosing a Stand.",
      ],
      projects: [
        "Chapters with no filler.",
        "Spoiler: they all end well.",
        "Switch tabs, there's more.",
        "Real screenshots, no tricks.",
        "King Crimson already saw them all.",
        "A trivia game for your friends.",
      ],
      pricing: [
        "Prices in plain sight.",
        "Cheaper than an arrow.",
        "Nigerundayo… no, stay.",
        "The final price is agreed first.",
        "What's extra is written down.",
        "The domain stays in your name.",
      ],
      faq: [
        "Ask anything.",
        "I read them all. Twice.",
        "Yours isn't here? Message him.",
        "Open them, they won't explode.",
        "My answers: ORA. His are better.",
      ],
      contact: [
        "Write to him, I'll let him know.",
        "He usually replies the same day.",
        "One message. Just one.",
        "WhatsApp or email, your call.",
        "Say it, don't be scared. ゴゴゴ.",
        "Your turn. I've talked enough.",
      ],
      tbc: [
        "To be continued…",
        "Arrivederci. Or not.",
        "Go up, there's more.",
        "Hear Roundabout? I do.",
        "You write the next part.",
      ],
    },
    outro: [
      "Don't you get tired? I do.",
      "I'm out of lines. Muda.",
      "From the top. Yare yare.",
      "Said it all here. Move along.",
      "Repeating is Bites the Dust's job.",
    ],
    sleep: "z z z",
    wake: [
      "I wasn't asleep!",
      "I was meditating. Hamon.",
      "Huh? You're back?",
      "I stopped my own time.",
      "Dreamt of a capybara.",
      "Me, asleep? That was a pose.",
    ],
    home: ["Home.", "Back to the portrait.", "My favourite corner."],
    console: "You called me? Nobody does that.",
    greetings: {
      owl: [
        "Night owl detected.",
        "Can't sleep? Me neither.",
        "Night shift. Like DIO.",
      ],
      early: [
        "Early bird. Respect.",
        "Early. Like Jonathan.",
        "Had breakfast? I don't eat.",
      ],
      morning: [
        "Morning. Coffee or Hamon?",
        "Good morning. Stand ready.",
        "The sun is up. Ugh.",
      ],
      midday: [
        "Midday. Had lunch yet?",
        "Lunch break. I don't eat.",
        "Sun's overhead. Max Hamon.",
      ],
      afternoon: [
        "Good afternoon. Reading time.",
        "Nap cancelled. Let's go.",
        "Good afternoon. ORA ORA!",
      ],
      evening: [
        "Good evening. Stand hours.",
        "Night falls. I wake up.",
        "DIO's hour. I mean, reading hour.",
      ],
      late: [
        "It's late. One more chapter?",
        "The night is young. Stay.",
        "Everyone sleeps. Not us.",
      ],
      visit: ["You're back. Visit {n}.", "Visit {n}. Family now.", "You again. Visit {n}."],
    },
    tips: {
      sites: ["Drag the strip. Speed King!", "Tap one to open it live.", "Fling it hard, see what happens.", "No templates here. Open them."],
      audit: ["Paste your link and run it.", "Free and fast. ORA.", "Then it tells you what to fix.", "Hermit Purple checks it for you."],
      about: ["In a hurry? Tap me for prices.", "His numbers are below.", "His cases are further down. ドン."],
      standcard: ["Drag the arrow. Carefully.", "My stats, manga style."],
      github: ["Punch the columns. ORA ORA.", "Tap one: it tells the day.", "Drag it to spin it."],
      services: ["Tap one to open it.", "Below: what you get.", "Quote it right away, gold button.", "Pick your Stand. I mean, service."],
      projects: ["Switch chapters up top.", "Swipe the screenshots. More inside.", "Next case is at the bottom.", "Check the result: it's real."],
      pricing: ["Questions? FAQ is below.", "Not sure? Try the free check.", "Write him and you'll adjust it.", "Extras are written down."],
      faq: ["Tap a question to open it.", "Yours isn't here? Write him.", "Contact is right below. ドン."],
      contact: ["WhatsApp is the fastest.", "Tell him what you need.", "One message changes destiny."],
      default: ["Tap me, I'll guide you. Speedwagon style.", "Lost? Tap me, I'll take you.", "Menu up top. More below."],
    },
    nudge: [
      "Tap me. I have powers and a map.",
      "I'm your guide, like Speedwagon. Tap me.",
    ],
    musings: [
      "Did you know I have no legs?",
      "What would Jotaro do here?",
      "Tap me and we talk.",
      "I think, therefore Stand.",
      "Want me to stop time? Ask.",
      "You can throw me. Please don't.",
      "I have ten borrowed powers.",
      "Tried Soft & Wet yet?",
      "I'm bored. Can I break something?",
      "Shh. I sense an enemy Stand.",
      "A Stand of a Stand. Meta.",
      "Rub me with the mouse. I like it.",
      "I rehearse poses when you look away.",
      "I broke someone's screen today.",
    ],
    landing: ["ドン!", "ドドド", "バァーン", "ゴゴゴ", "ズン", "ドーン", "シュタッ", "ババーン"],
    events: {
      timestop: [
        "I couldn't move…!",
        "Who stopped time? You?",
        "You froze me. Eternal grudge.",
        "Not even I escape that clock.",
        "Only DIO does that!",
      ],
      ora: ["ORA ORA ORA!", "Yes! Harder.", "You typed ora? Respect.", "Jotaro would be proud.", "ORAAA! That's how you spell it."],
      muda: ["MUDA? That's DIO's.", "Traitor.", "Wryyyy… sorry.", "Muda muda… Giorno, is that you?", "You type like a villain."],
      tbc: ["To be continued…", "That's it? That's the ending?", "Roundabout's playing.", "The arrow. Always the arrow.", "Season finale."],
      barrage: ["That's the barrage!", "Six hits, not bad.", "The columns are crying.", "ORA at the commits!", "That column won't recover."],
      arrow: ["That arrow! That's how I was born.", "Careful, it stings.", "Not another Stand, please.", "The arrow chooses, and it chose you.", "Woke something up? ゴゴゴ."],
      themeLight: ["My eyes! The light!", "Day mode? I'm a night Stand.", "Is this DIO's sun? No.", "Shiny, like my diamond.", "Ugh. Pure Hamon."],
      themeDark: ["Better. The night is mine.", "There. Dark and classy.", "Ahh. Peace.", "Night is back. Wryyy.", "My pixels can breathe."],
      language: ["Language swap. Interesting.", "I speak both, obviously.", "Bilingual, like him.", "New language, same Stand.", "New language, same pose."],
      whatsapp: ["Yes! Message him.", "Good call. ゴゴゴ.", "I'll tell him you're coming.", "That's the spirit!", "Fate sealed. ドン!"],
      copy: ["Copying? Respect.", "Take it, it's free.", "Ctrl+C. Classic.", "Echoes already recorded it.", "Copied, like a twin Stand."],
      return: ["Where were you?", "I waited. Very still.", "You're back. Knew it.", "Another tab? Jealous.", "King Crimson erased your absence."],
      fastScroll: ["Slow down! I'm dizzy.", "Hey! This isn't Speed King.", "Wooo… why so fast?", "Made in Heaven or what?", "You're leaving me behind!"],
      stare: ["What are you looking at?", "Yes, it's me.", "Tap me if you dare.", "Oh? You're approaching me?", "Joestar stare. I know it."],
      audit: ["Checking… ゴゴゴ.", "Let's see that site…", "Hermit Purple, show me!", "Analysing. Don't move.", "I'm looking at your page. ゴゴゴ."],
      sent: ["Sent! He'll reply.", "Message delivered. Nice.", "Now we wait. I'll wait with you.", "Perfect! ドン!", "Done. Fate is moving."],
      bottom: ["You reached the end. Respect.", "You read it all. You're one of us.", "End of the volume. Nice.", "All read: Joestar medal.", "The end. This is it."],
      chapter: ["New chapter!", "Next episode. ドン!", "Oh, good chapter.", "I like that case.", "Turn the page. ペラ."],
      faq: ["Good question.", "I wondered that too.", "Read it all, it's short.", "Answer unlocked.", "Joestar curiosity."],
      hesitate: ["Hesitating? Go on.", "That button doesn't bite.", "One click. I've got you.", "Courage, like Jonathan.", "Nigerundayo… no. Click."],
      typing: ["Type away, I'm not looking.", "Take your time.", "That's it, no fear.", "You type like ORA.", "Echoes is listening. Relax."],
      resize: ["Shrinking me? Hey.", "The page stretches. I don't.", "The Hand? Everything moved.", "New window, same me.", "Did the window change? Yes."],
      thrown: ["WRYYYYY!", "Hey! I'm dizzy!", "I'm not a ball!", "Everything's spinning…", "Nigerundayo… ah!"],
      dropped: ["Put me down! Oh, ok.", "Elegant landing.", "You moved me? Brave.", "Thanks for the ride.", "Nice view from here."],
      pet: ["There, right there.", "I like that. Keep going.", "Are you petting me? Fine.", "Stand purr. Prrr.", "Aw, I'm blushing."],
      rightclick: ["Right click? Looking for something?", "Inspecting me? How embarrassing.", "Don't look at my code.", "Saving me? I'm flattered.", "Nothing in there. I think."],
      leave: ["Leaving? I'll wait here.", "The cursor left. How cold.", "Hello? Still there?", "You left me talking to myself.", "Come back soon, ok?"],
      offline: ["The internet's gone. I'm not.", "No signal. Doesn't affect me.", "Wifi dropped? Scary.", "Offline. I'll guard the page."],
      online: ["Internet's back. Phew!", "Connected again.", "Wifi's back. ドン!", "Back online. Let's go."],
      select: ["Highlighting? Studious.", "Good bit you picked.", "Select away.", "Copying that? Do it.", "Nice choice of words."],
      print: ["Printing me? What an honor!", "I look flat on paper.", "Print it, I'm in the picture."],
      spin: ["Wheee! Again.", "That strip can fly!", "Can't read it, but fun.", "Spin it! ゴゴゴ", "Spinning like Gyro."],
      service: ["That one's good.", "Hmm, good pick.", "Read what you get.", "That one? Smart.", "Hmm… that fits you."],
      plan: ["Doing the math, huh?", "That plan goes far.", "Asking costs nothing.", "Echoes does the sums.", "Calculating… ゴゴゴ."],
      review: ["Aw, that's sweet.", "I'm blushing. It's not even me.", "Happy clients. ♥", "Nobody made them say it.", "Read it, it makes me happy."],
      visit: ["Go, I'll guard the tab.", "See it live. ✦", "That one came out nice.", "Come back and tell me.", "I saw that site being born."],
      github: ["The code? It's clean.", "Check the commits. ORA.", "That's the engine room.", "Look around, no fear.", "No bugs there. I think."],
      gallery: ["Keep going, there's more.", "That screenshot is real.", "Look at the details.", "That's how it went live.", "Swipe, it won't bite."],
    },
    intro: {
      world: [
        "そして時は動き出す。",
        "Did you see that? Almost nobody does.",
        "And time moves again.",
        "I posed. Your turn.",
        "Stopping the world was worth it.",
        "Nobody saw a thing. Except you.",
        "My best pose and nobody saw it.",
      ],
      diamond: [
        "I broke your screen. Fixed it, though.",
        "Relax, good as new.",
        "Not a scratch. Crazy Diamond.",
        "Sorry, I got carried away.",
      ],
      oops: ["Oops. Sorry.", "Uh… your screen.", "That sounded expensive.", "Was that the glass?", "Oh. Too much."],
      jokes: [
        ["I stopped time for the whole world…", "…so I could pose without interruptions."],
        ["Nobody can move…", "…not even to take my picture. Darn."],
        ["Five seconds of absolute power.", "And I spend them on this. Oh well."],
        ["Look at me. Oh, you can't.", "That's the joke. フフフ."],
        ["DIO threw knives.", "I'd rather pose. It's classier."],
        ["The world stood still…", "…and I struck the pose of my life."],
        ["Shh… the world is on pause.", "Perfect time to stretch. Like this."],
        ["How long is left? Three seconds?", "Enough to hold this a bit longer."],
        ["Nobody will believe this happened.", "Good. More mysterious that way."],
      ],
      laughs: ["フハハハ", "WRYYY", "ハハハ", "フフフ"],
      end: {
        crimson: ["Straight to the good part.", "What happened? King Crimson.", "That time is gone. Go on.", "Clean cut. You're welcome."],
        dust: ["Weird, right? Happened before.", "Déjà vu solved. Go on.", "Seen this. Oh wait, no.", "Rollback successful."],
        gold: ["Flowers fade. Talent stays.", "Back to text. For now.", "Giorno would be proud."],
        zipper: ["Zipped up. Arrivederci.", "All in place. Ari ari.", "Ziiip. Done."],
        echoes: ["Normal weight again. I think.", "My back… Go on.", "Everything's in place. Phew.", "Light again. ズン."],
        tbc: ["The episode begins. ゴゴゴ.", "Today you're the lead.", "New chapter. No spoilers.", "Next episode: you scroll, I narrate."],
        door: ["Now you know. No going back.", "What's written stays written.", "Rohan wrote it. It comes true.", "Now you won't forget."],
      },
      skipped: ["Skipped my entrance? Respect.", "Straight to it. I like that.", "No ceremony. Very engineer.", "Ok, ok. I'm here."],
      crimson: {
        loading: "Loading Cris…",
        eta: "Time remaining: {n}",
        epitaph: "the future",
        erased: "Time erased",
        done: "Cris, 100% loaded",
        result: "Systems engineer · Content creator",
        steps: ["Design", "Code", "Delivery"],
        doing: "in progress",
        now: "Time",
        wait: ["Loading… this will take a while.", "Get comfy. Three hours to go.", "Almost there. Well, no."],
        cut: [
          "The wait? Erased. Only the result remains.",
          "Three hours of loading. Nobody lived them. King Crimson.",
          "I skipped the boring part. Kept the good one.",
          "That time never passed. Cris did: engineer and creator.",
        ],
      },
      dust: ["Bites the Dust!"],
      gold: [
        "I gave the name life. That's how 35K followers grow.",
        "That's how 2.5M likes grew: with life.",
        "Everything I touch blooms. So do Cris's websites.",
        "One idea, a little life, and it grows by itself.",
      ],
      zipper: {
        code: [
          "// on the inside: engineering",
          "<Hero>",
          "  <Name>Cristian Pérez</Name>",
          "  <Role>systems engineer</Role>",
          "  <Role>content creator</Role>",
          "  <Stand power=\"A\" speed=\"B\" />",
          "</Hero>",
        ],
        talk: [
          "Design on the outside. Engineering on the inside.",
          "That's a Cris website on the inside. Tidy.",
          "Pretty outside, well built inside. That's the trick.",
        ],
      },
      echoes: {
        strain: ["Heavy as a Friday deploy!", "Oof! This name carries a lot of experience.", "Not even the server weighs this much!"],
      },
      tbc: {
        after: ["To be continued… in episode {n}.", "End of episode. The portfolio begins.", "To be continued. Keep scrolling."],
      },
      door: {
        lifeLabel: "Your life · p. 1",
        orderLabel: "Order written in you",
        seal: "ヘブンズ・ドアー",
        orders: [
          "You will remember Cris is a systems engineer and content creator.",
          "You will buy a website, an app, or several.",
          "You will message Cris on WhatsApp before the day is over.",
          "You won't be able to close this tab without seeing the projects.",
          "You will recommend Cris to at least three people.",
          "You'll think \"I need a site like this\" for the rest of the week.",
          "You will follow Cris online and like everything.",
          "You will pay the deposit with a smile.",
        ],
        done: ["There. Now you won't forget.", "It's written. Heaven's Door.", "What's written stays written. フフフ."],
      },
    },
    timeStop: {
      sections: {
        hero: ["Posed by your portrait. You missed it.", "Strolled the hero. All frozen."],
        sites: ["Checked all ten sites. You: frozen."],
        audit: ["Audited while you couldn't.", "Your link waited. I didn't."],
        about: ["Read his whole story. Done.", "Not even he moved. I did."],
        standcard: ["Speed B… and still I moved.", "Posed for the arrow."],
        github: ["Not one commit moved.", "Counted every column."],
        services: ["Picked one for you. Kidding.", "The services waited. I didn't."],
        projects: ["Paused the chapter, read the end.", "The case stopped. I didn't."],
        pricing: ["I froze the prices. Really.", "No price went up. You're welcome."],
        faq: ["Read every answer.", "The questions didn't open."],
        contact: ["Your message waited, still.", "Not even the form blinked."],
        tbc: ["To be… paused.", "The arrow didn't advance."],
        default: ["Nobody moved. Except me.", "Just me in that world.", "Muda muda. You were frozen.", "Saw anything? No. Nothing."],
      },
      attempt: [
        "You tried to move. I saw.",
        "Your finger didn't respond, huh?",
        "Wanted to scroll? Cute.",
      ],
      resume: ["そして時は動き出す。", "And time moves again.", "Did I move? Never."],
    },
    chat: {
      title: "Paranoid Android",
      close: "Close the conversation",
      greet: [
        "Oh? Are you talking to me?",
        "A human tapped me. What do you want?",
        "Yes? I was posing.",
        "Paranoid Android, at your service.",
        "You touched me. Now we're allies.",
        "You tapped the right Stand.",
        "About time you tapped me.",
      ],
      greetAgain: ["You again? I like you.", "Back. I knew you would be.", "We're friends now, right?", "You're back. The arrow marked you."],
      options: {
        who: "Who are you?",
        cris: "Tell me about Cris",
        guide: "Take me to…",
        trivia: "Some JoJo trivia",
        power: "Use a power",
        janken: "Let's play jan-ken",
        darby: "Bet our souls",
        sound: "Turn sound on",
        bye: "Nothing, carry on",
      },
      who: [
        ["I'm Paranoid Android.", "Cristian's Stand.", "Born from an arrow. Long story."],
        ["A Stand: a spirit turned into power.", "He codes, and I exist. With style."],
        ["They call me PA.", "Well, nobody calls me anything.", "You could be the first."],
        ["I live on this page.", "I sleep on the portrait.", "And perch on what you read."],
        ["I have borrowed powers.", "None are mine, technically.", "But I use them with style."],
        ["My diamond is my heart.", "Diamond is Unbreakable.", "Neither am I. I think."],
        ["I'm a pixel-art Stand.", "Small, with plenty of presence.", "And presence is 90% of power."],
        ["I have no username.", "I have a song title.", "Paranoid Android. Radiohead. Tradition."],
        ["A long-range Stand.", "Range: the whole page.", "And I don't ask permission."],
        ["Born among components.", "Raised among lines of code.", "Now I'm your guide, a dramatic one."],
      ],
      cris: [
        "He builds websites, software and video.",
        "Lives in Bucaramanga. Works remote.",
        "Co-founded carpy, a software studio.",
        "Comes from cybersecurity. Checks the locks.",
        "Has 35K+ followers built on his own content.",
        "Works in Spanish and English.",
        "Message him on WhatsApp; he usually replies same day.",
        "Has ten live websites for businesses.",
        "He built one for a hotel in Santa Marta.",
        "Works with businesses all over Colombia and abroad.",
        "The domain and hosting stay in the client's name.",
        "Also does logo, colours and content.",
        "Built a records search that finds them in seconds.",
        "Talks over WhatsApp or video call.",
      ],
      trivia: [
        "JoJo started in 1987 and Araki doesn't age. Suspicious.",
        "Since Part 4, Stands are named after songs.",
        "I'm named after a Radiohead song. It's tradition.",
        "The JoJo pose has a name: JoJo-dachi.",
        "ゴゴゴ is what tension sounds like. Really.",
        "Every Joestar has a star birthmark on the shoulder.",
        "DIO slept a hundred years at the bottom of the sea.",
        "You learn Hamon by breathing. I don't breathe.",
        "Yes's Roundabout closed the anime. To be continued.",
        "Jotaro says yare yare daze when he's annoyed.",
        "Speedwagon always withdraws in style.",
        "Killer Queen is named after a Queen song.",
        "Bites the Dust: another Queen song.",
        "Crazy Diamond comes from Pink Floyd.",
        "Kira just wanted a quiet life. Sure.",
        "Josuke gets angry if you mock his hair.",
        "Only Stand users can see Stands.",
        "Joseph guesses what you'll say. Always.",
        "Gold Experience gives life to what it hits.",
        "Part 3 Stands come from tarot cards.",
        "Rohan draws faster than you read this.",
        "Polnareff has the tallest hair in JoJo.",
        "Most protagonists are JoJos: Jonathan, Joseph, Jotaro, Josuke, Jolyne, Johnny.",
        "Giorno Giovanna is DIO's son, and he turned out kind.",
        "Jonathan Joestar was the first JoJo, and the most gentlemanly.",
        "Part 3 is a 50-day trip from Japan to Egypt.",
        "The Stands of DIO's followers are named after Egyptian gods.",
        "Araki took the word Stand from the song Stand By Me.",
        "Rohan's Stand, Heaven's Door, comes from a Bob Dylan song.",
        "Gold Experience is named after a Prince album.",
        "Sticky Fingers comes from a Rolling Stones album.",
        "Mista is terrified of the number 4.",
        "Mista's Sex Pistols are six. Number 4 is missing.",
        "Josuke punches with DORA, Jotaro with ORA, Giorno with MUDA.",
        "Jolyne is the first female lead of JoJo.",
        "Part 6 takes place in a Florida prison.",
        "Steel Ball Run, Part 7, is a horse race across the United States.",
        "Jotaro ends up a marine biologist. Hat included.",
        "Jotaro's cap looks glued to his hair. Nobody knows how.",
        "Caesar Zeppeli fought by blowing Hamon bubbles.",
        "Kakyoin loves cherries. His Stand is Hierophant Green.",
        "Iggy is a dog with a sand Stand. He loves coffee gum.",
        "Silver Chariot is Polnareff's swordsman Stand.",
        "Avdol's Stand, Magician's Red, controls fire.",
        "Made in Heaven is also a Queen album.",
        "Diavolo's King Crimson is named after a rock band.",
        "Fugo's Purple Haze is a Jimi Hendrix song.",
        "Koichi's Echoes evolves in three acts.",
        "The JoJo anime arrived in 2012.",
        "JoJo was born in Weekly Shonen Jump.",
        "Kira Yoshikage is 33 and collects hands. Brr.",
        "JoJo poses are inspired by Italian sculpture and fashion magazines.",
        "Joseph yells OH MY GOD every other scene.",
        "Pucci's Whitesnake pulls out memories like discs.",
        "Gold Experience Requiem sends everything back to zero.",
        "Johnny's Tusk evolves in four acts.",
        "Speedwagon was a thief before he was an ally.",
        "There are two Josukes: Part 4's and Part 8's. Different people.",
        "Jonathan learned Hamon to face DIO.",
        "Star Platinum can stop time too. Five seconds, give or take.",
      ],
      guidePrompt: ["Where to? I fly, you watch.", "Pick a destination. Hold on.", "Where are we going, partner?"],
      guide: {
        projects: { label: "His projects", say: ["To the chapters!", "Projects. Hold tight.", "To the cases. ドン!"] },
        sites: { label: "The websites", say: ["Live websites. Let's go!", "To the strip of sites.", "Custom pages. Fly!"] },
        pricing: { label: "The prices", say: ["Prices. No fear.", "Straight to the point.", "To the table. Breathe."] },
        contact: { label: "Talk to him", say: ["To the contact! ドン!", "Good call. Let's go.", "Straight to him. Go!"] },
      },
      powerPrompt: [
        "I have borrowed powers. Pick.",
        "Pick one. Whatever happens isn't on me.",
        "Which? They're all dangerous.",
        "Ten Stands in one. Which one?",
      ],
      bye: ["Arrivederci.", "I'll go perch somewhere.", "Yare yare. Bye.", "See you next chapter.", "May the arrow be with you."],
      back: "Something else",
      sound: {
        stop: "Mute",
        on: [
          "Sound on. Now you hear me.",
          "Now the ドン is real.",
          "With sound. Let the glass shake.",
          "Done. The hits are audible.",
          "Sound on. Mind your ears.",
        ],
        off: [
          "Silence, like a real Stand.",
          "Sound off. Mute pose.",
          "Mute again. Muda, muda.",
          "Quiet. Still posing.",
          "Off. The cracks go quiet now.",
        ],
      },
    },
    powers: {
      zawarudo: {
        name: "ZA WARUDO",
        jp: "時よ止まれ",
        say: ["ZA WARUDO!", "ZA WARUDO! Toki yo tomare!", "My world. ZA WARUDO!"],
        done: ["And time moves again.", "そして時は動き出す。", "Saw anything? No, nothing.", "Those five seconds were mine."],
      },
      starplatinum: {
        name: "Star Platinum",
        jp: "オラオラ",
        say: ["ORA ORA ORA ORA!", "Star Platinum… ORA!"],
        done: ["Yare yare daze.", "Full barrage. Nothing broken.", "That's how Jotaro hits. Roughly."],
        variants: {
          rush: { say: ["ORA ORA ORA ORA!", "Star Platinum… ORA!", "ORA rush!"], done: ["Yare yare daze.", "Dented. It fixes itself.", "Full barrage."] },
          finger: { say: ["Star Finger!", "Star Platinum… star finger!"], done: ["One precise poke.", "Precision A. See?"] },
          world: { say: ["Star Platinum: The World!", "I can stop time too."], done: ["One second of mine.", "Like DIO. But nice."] },
        },
      },
      crazydiamond: {
        name: "Crazy Diamond",
        jp: "ドラララ",
        say: ["DORARARARA!", "Crazy Diamond… DORA!", "Doraaaa!"],
        done: ["Broken and fixed. Good as new.", "Crazy Diamond leaves it better.", "What did you say about my hair?", "All in place. Almost."],
      },
      goldexperience: {
        name: "Gold Experience",
        jp: "生命を",
        say: ["Gold Experience. Life!", "I, Giorno… no. But close."],
        done: ["The page is alive. Really.", "Life for everyone."],
        variants: {
          garden: { say: ["Gold Experience. Life!", "Let it all bloom!"], done: ["Life sprouted everywhere.", "Instant spring."] },
          tree: { say: ["Gold Experience… a tree!", "Grow!"], done: ["A whole tree. Photosynthesis.", "That tree gives shade already."] },
          frog: { say: ["That thing… will be a frog!", "Gold Experience. Ribbit!"], done: ["It was part of the page. Now it hops.", "The frog is back in place. Relax."] },
          butterflies: { say: ["Butterflies! Pure life.", "Gold Experience… fly!"], done: ["They flew away, free.", "Pure life, huh?"] },
          snake: { say: ["That title… a snake!", "Gold Experience. Sssss."], done: ["A title again. Phew.", "It doesn't bite. I think."] },
        },
      },
      echoes: {
        name: "Echoes",
        jp: "エコーズ",
        say: ["Echoes! Stuck-on sounds."],
        done: ["Now the page has sound.", "They peel off by themselves."],
        variants: {
          act1: { say: ["Echoes ACT 1! Living sounds.", "Sticking sounds. Watch them ring."], done: ["The page spoke. You heard it.", "Sounds returned."] },
          act2: { say: ["ACT 2! Touch them. They ring.", "Echoes ACT 2. Step on one."], done: ["Touched them all? Nice.", "Peeled off. Silence."] },
          act3: { say: ["ACT 3! 3 FREEZE!", "S-H-I-T… I mean, 3 FREEZE!"], done: ["Heavy, huh? It's over.", "Normal weight again."] },
        },
      },
      softwet: {
        name: "Soft & Wet",
        jp: "シャボン",
        say: ["Soft & Wet. Thieving bubbles!", "Bubbles. They steal. Pop them."],
        done: ["They took things. I gave them back.", "Free bubbles. All returned."],
        bonus: ["All of them! You got it all back.", "None escaped. Gappy would be proud.", "Popped them all. Thief of thieves."],
      },
      hermit: {
        name: "Hermit Purple",
        jp: "ハーミット",
        say: ["Hermit Purple… let's see.", "Hermit Purple! Spirit photo."],
        done: ["Photo developed. Keep it in mind.", "Joseph would be proud."],
      },
      madeinheaven: {
        name: "Made in Heaven",
        jp: "時は加速する",
        say: ["Made in Heaven! Time speeds up.", "Made in Heaven… faster!"],
        done: ["Phew. Universe saved.", "This universe stays.", "Almost back to red. Never again."],
      },
      bitesthedust: {
        name: "Bites the Dust",
        jp: "負けて死ね",
        say: ["Killer Queen… Daisan no bakudan!", "Killer Queen… Bites the Dust!"],
        done: ["Time went back. Nobody noticed.", "Déjà vu? Normal.", "Another one bites the dust."],
        call: "Bites the Dust!",
        variants: {
          bomb: { say: ["Killer Queen already touched something…", "That thing there is a bomb."], done: ["It blew up. And nothing happened.", "Ctrl+Z, explosion included."] },
          rewind: { say: ["Killer Queen… third bomb.", "What if we go back a bit?"], done: ["Time went back. Nobody noticed.", "Déjà vu? Normal."] },
        },
      },
      kingcrimson: {
        name: "King Crimson",
        jp: "キング・クリムゾン",
        say: ["King Crimson!", "King Crimson… erase time."],
        done: ["Only the result remains.", "A chunk got skipped. Don't ask.", "Epitaph saw it coming."],
      },
    },
    hermit: [
      "I see… {min} on this page.",
      "I see… {parts} of {total} parts read.",
      "I see… {secrets} secrets found.",
      "I see… your visit number {visits}.",
    ],
    hermitPhoto: { title: "Spirit photo", time: "On the page", parts: "Parts read", secrets: "Secrets", visits: "Visit" },
    dejaVu: ["…déjà vu?", "Didn't I say this?", "Again…"],
    universe: {
      label: "Previous universe",
      tagline: "Websites and software that make your business run.",
      badge: "Available for new projects",
      loading: "Resetting the universe",
      stop: ["STOP! I like this universe.", "Back to red? No way!", "NO! There were no Stands there."],
    },
    janken: {
      title: "Jan-ken",
      intro: [
        "Rock, paper, scissors. Best of three.",
        "Boy II Man taught me. Best of three.",
        "Win and you get nothing. Same as me.",
        "Three rounds. No powers. Promise.",
        "Pick. I already know your move.",
        "Rock, paper, scissors. No tricks.",
        "Joseph tried already. He lost.",
        "Best of three. I'm watching you.",
      ],
      hands: { rock: "Rock", paper: "Paper", scissors: "Scissors" },
      call: "じゃんけんぽん!",
      win: ["Ha! Read your mind.", "Predictable.", "Your next move is… losing.", "Joseph taught me.", "Muda.", "Boy II Man would be proud.", "Your hand is very transparent.", "Me again. Lucky me."],
      lose: ["Lucky.", "That didn't count.", "Hm. Interesting.", "Did you use a Stand?", "Fine. For now.", "That was luck.", "I got distracted. I swear.", "How did you know?"],
      draw: ["Draw. Again.", "Same mind. Scary.", "Aiko desho.", "Same fate.", "Did you copy me?", "Same hand. Same mind.", "Telepathy? Weird.", "Draw. Nobody moves."],
      matchWin: ["I win. Yare yare daze.", "Victory. Obviously.", "Muda muda muda.", "My Stand doesn't lose.", "Three rounds, one winner. Me.", "Told you: Boy II Man."],
      matchLose: ["You beat me. Don't tell him.", "Well played. Rematch.", "…Good.", "I lost. With style, though.", "You win. My pride doesn't.", "You beat me. Respect."],
      score: "You {you} · Stand {me}",
      again: "Rematch",
      close: "Close the game",
      quit: ["Nigerundayo, huh?", "Leaving? I was winning.", "Running? Smokey would.", "Already? I had the move ready.", "See you at the rematch."],
    },
    darby: {
      title: "D'Arby's Souls",
      intro: [
        "D'Arby bet souls. I bet three.",
        "Higher or lower. Three souls each.",
        "A clean bet. No Hermit Purple.",
        "Osiris lent me the cards.",
        "Choose well. Your soul's on the line.",
      ],
      ask: "The hidden card is…",
      higher: "Higher",
      lower: "Lower",
      shown: "My card",
      hidden: "Hidden",
      call: "魂を賭けろ!",
      win: ["You lost a soul. Delicious.", "The card doesn't lie. I do.", "D'Arby would smile.", "One less. Almost there.", "Osiris saw it coming."],
      lose: ["Beginner's luck.", "You took a soul. Grudge.", "Hm. You counted cards.", "Was that cheating? Maybe.", "Fine. For now."],
      draw: ["Same card. Weird.", "Equal. No soul, no win.", "Osiris says: again.", "Even the cards doubt."],
      matchWin: ["Your soul is mine. Kidding. Almost.", "I win. Osiris is pleased.", "Soul collected. ゴゴゴ.", "Game over. Yare yare."],
      matchLose: ["You keep your soul. Lucky.", "You beat me. D'Arby would cry.", "I lost. My soul's still here. I think.", "…Well played. Rematch."],
      score: "Your souls {you} · Stand {me}",
      again: "Rematch",
      close: "Close the game",
      quit: ["Leaving with your soul? Lucky.", "Running is also betting.", "Joseph cheated too. And ran."],
    },
  },
};
