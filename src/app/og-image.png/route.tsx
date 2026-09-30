import { ImageResponse } from "next/og";
import { dictionaries } from "@/data/content";
import { site } from "@/data/site";

/**
 * /og-image.png: la tarjeta que muestran WhatsApp, LinkedIn y Discord al
 * pegar el enlace. 1200x630, generada en el build desde codigo en vez de
 * un PNG exportado a mano: si cambian el rol o el tagline, la imagen se
 * regenera sola con el siguiente deploy.
 */
export const dynamic = "force-static";

const size = { width: 1200, height: 630 };

/**
 * Fuentes en TTF desde Google Fonts: Satori, el motor de ImageResponse, no
 * lee woff2, que es lo que sirve next/font. Las mismas del sitio: Anton
 * para el nombre, Archivo para el texto y Dela Gothic solo con los glifos
 * de ゴ (el parametro `text` recorta la fuente a esos caracteres). Un
 * reintento cubre los fallos puntuales de red durante el build; si aun
 * asi falla, la imagen sale con la fuente por defecto en lugar de romper
 * el build.
 */
async function loadFont(query: string, attempts = 2): Promise<ArrayBuffer | null> {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const css = await fetch(
        `https://fonts.googleapis.com/css2?${query}`,
      ).then((response) => response.text());
      const url = css.match(
        /src: url\((.+?)\) format\('(?:opentype|truetype)'\)/,
      )?.[1];
      if (url) {
        const font = await fetch(url);
        if (font.ok) return await font.arrayBuffer();
      }
    } catch {
      // Se reintenta abajo; el ultimo intento cae al respaldo.
    }
  }
  return null;
}

/*
  A nivel de modulo, como pide la guia de ImageResponse: las fuentes no
  dependen de la peticion, asi que se descargan una sola vez.
*/
const MENACING = "ゴゴゴ";
const ogFonts = Promise.all([
  loadFont("family=Anton"),
  loadFont("family=Archivo:wght@500"),
  loadFont(`family=Dela+Gothic+One&text=${encodeURIComponent(MENACING)}`),
]);

/* Paleta del modo oscuro del sitio (globals.css). */
const ink = "#111013";
const cream = "#ece6d8";
const gold = "#e3b341";
const muted = "#a39d90";

export async function GET() {
  const [anton, archivo, dela] = await ogFonts;
  const fonts = [
    ...(anton ? [{ name: "Anton", data: anton, weight: 400 as const, style: "normal" as const }] : []),
    ...(archivo ? [{ name: "Archivo", data: archivo, weight: 500 as const, style: "normal" as const }] : []),
    ...(dela ? [{ name: "Dela", data: dela, weight: 400 as const, style: "normal" as const }] : []),
  ];
  // La clave se omite, no se pone a undefined: satori trocea `fontFamily`
  // con split() y con undefined rompia el build en el caso de respaldo.
  const family = (name: string, loaded: ArrayBuffer | null) =>
    loaded ? { fontFamily: name } : {};

  const [firstName, ...lastName] = site.name.toUpperCase().split(" ");
  const githubHandle = site.githubUrl.replace(/^https?:\/\//, "");

  /*
    lineHeight 0.95: la tilde de la "É" sobresale por encima de la
    mayuscula y, con las lineas mas juntas, tocaba la linea de arriba.
  */
  const nameLine = {
    fontSize: 132,
    lineHeight: 1,
    letterSpacing: "0.01em",
    ...family("Anton", anton),
  } as const;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          backgroundColor: ink,
          color: cream,
          ...family("Archivo", archivo),
        }}
      >
        {/* Vineta: marco de tinta crema con sombra dura en oro. */}
        <div
          style={{
            position: "absolute",
            top: 40,
            left: 40,
            right: 52,
            bottom: 52,
            display: "flex",
            border: `4px solid ${cream}`,
            boxShadow: `12px 12px 0 ${gold}`,
            backgroundColor: "rgba(17, 16, 19, 0.82)",
          }}
        />

        {/*
          Trama de puntos de manga que se desvanece hacia la izquierda,
          como en el hero. En SVG: satori no repite un radial-gradient
          con backgroundSize.
        */}
        <svg
          width="560"
          height="524"
          viewBox="0 0 560 524"
          style={{ position: "absolute", top: 44, right: 56 }}
        >
          <defs>
            <pattern id="dots" width="18" height="18" patternUnits="userSpaceOnUse">
              <circle cx="9" cy="9" r="2.6" fill={gold} />
            </pattern>
            <linearGradient id="fade" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="white" stopOpacity="0" />
              <stop offset="1" stopColor="white" stopOpacity="0.35" />
            </linearGradient>
            <mask id="fadeMask">
              <rect width="560" height="524" fill="url(#fade)" />
            </mask>
          </defs>
          <rect width="560" height="524" fill="url(#dots)" mask="url(#fadeMask)" />
        </svg>
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            padding: "70px 96px 84px 80px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            {/* Placa "Part 1", como las de cada seccion. */}
            <div
              style={{
                display: "flex",
                padding: "6px 16px",
                backgroundColor: gold,
                color: ink,
                fontSize: 26,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                ...family("Anton", anton),
              }}
            >
              {`${dictionaries.en.jojo.part} 1 · Portfolio`}
            </div>
            {dela ? (
              <div style={{ display: "flex", fontSize: 58, color: gold, fontFamily: "Dela" }}>
                {MENACING}
              </div>
            ) : null}
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ ...nameLine, color: cream }}>{firstName}</div>
            <div style={{ ...nameLine, color: gold }}>{lastName.join(" ")}</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontSize: 30, color: cream }}>
              {dictionaries.en.hero.tagline}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 8,
                paddingTop: 14,
                borderTop: `2px solid rgba(236, 230, 216, 0.25)`,
                fontSize: 22,
                color: muted,
              }}
            >
              <div>{site.role}</div>
              <div>{`${site.location} · ${githubHandle}`}</div>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: fonts.length ? fonts : undefined },
  );
}
