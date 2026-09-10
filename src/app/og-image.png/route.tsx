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
 * Geist en TTF desde Google Fonts. Satori, el motor de ImageResponse, no
 * lee woff2, que es lo que sirve next/font. Un reintento cubre los fallos
 * puntuales de red durante el build; si aun asi falla, la imagen sale con
 * la fuente por defecto en lugar de romper el build.
 */
async function loadGeist(weight: 500 | 900, attempts = 2): Promise<ArrayBuffer | null> {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const css = await fetch(
        `https://fonts.googleapis.com/css2?family=Geist:wght@${weight}`,
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
  A nivel de modulo, como pide la guia de ImageResponse: la fuente no
  depende de la peticion, asi que se descarga una sola vez.
*/
const geistFonts = Promise.all([loadGeist(500), loadGeist(900)]);

export async function GET() {
  const [medium, black] = await geistFonts;
  const fonts = [
    ...(medium
      ? [{ name: "Geist", data: medium, weight: 500 as const, style: "normal" as const }]
      : []),
    ...(black
      ? [{ name: "Geist", data: black, weight: 900 as const, style: "normal" as const }]
      : []),
  ];

  const [firstName, ...lastName] = site.name.toUpperCase().split(" ");
  const githubHandle = site.githubUrl.replace(/^https?:\/\//, "");

  /*
    lineHeight 0.95 y no el 0.8 del hero: la tilde de la "É" sobresale por
    encima de la mayuscula y, con las lineas tan juntas, se metia en la
    linea de arriba y tocaba la "R" de CRISTIAN. En la web no se nota
    porque el retrato tapa ese hueco; aqui no hay retrato.
  */
  const nameLine = {
    fontSize: 150,
    fontWeight: 900,
    lineHeight: 0.95,
    letterSpacing: "-0.05em",
    color: "#c46d79",
  } as const;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          backgroundColor: "#09090b",
          backgroundImage:
            "radial-gradient(circle at 88% 12%, rgba(140, 59, 69, 0.4), transparent 45%)",
          color: "#fafafa",
          // La clave se omite, no se pone a undefined: satori trocea
          // `fontFamily` con split() y con undefined rompia el build justo
          // en el caso de respaldo (Google Fonts sin respuesta).
          ...(fonts.length ? { fontFamily: "Geist" } : {}),
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 24,
            fontWeight: 500,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            color: "#c98d95",
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 999,
              backgroundColor: "#10b981",
            }}
          />
          Portfolio
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={nameLine}>{firstName}</div>
          <div style={nameLine}>{lastName.join(" ")}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 44, fontWeight: 500 }}>{site.role}</div>
          <div style={{ fontSize: 28, fontWeight: 500, color: "#a1a1aa" }}>
            {dictionaries.en.hero.tagline}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 18,
              paddingTop: 22,
              borderTop: "1px solid rgba(255, 255, 255, 0.12)",
              fontSize: 24,
              fontWeight: 500,
              color: "#71717a",
            }}
          >
            <div>{githubHandle}</div>
            <div>{site.location}</div>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: fonts.length ? fonts : undefined },
  );
}
