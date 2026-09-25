/**
 * Estructura de los diagramas tecnicos que sustituyen a las fotos de
 * stock: que nodos hay, en que columnas y con que icono.
 *
 * Independiente del idioma, como site.ts. Los textos visibles (titulo y
 * detalle de cada nodo, etiquetas de los tramos, estado y salida del
 * terminal) viven en content.ts bajo `diagrams`, con la misma clave de
 * nodo. Los comandos del terminal si van aqui: son codigo, no se
 * traducen.
 *
 * Los diagramas de proyecto describen lo que hay en cada repositorio,
 * no una arquitectura idealizada: el boton de la tarjeta lleva al codigo,
 * y el diagrama tiene que aguantar esa comparacion.
 */

export type DiagramIcon =
  | "monitor"
  | "server"
  | "bot"
  | "graduation"
  | "database"
  | "scan"
  | "ocr"
  | "code"
  | "search"
  | "webhook"
  | "workflow"
  | "globe"
  | "pen"
  | "video"
  | "scissors"
  | "send"
  | "shield";

export type DiagramId =
  | "svc-fullstack"
  | "svc-seo"
  | "svc-automation"
  | "svc-docai"
  | "svc-audit"
  | "svc-media";

export interface DiagramNode {
  /** Clave del nodo en `content.ts > diagrams[id].nodes`. */
  id: string;
  icon: DiagramIcon;
}

export type LogTone = "ok" | "warn" | "error" | "info";

export type TerminalLine =
  | { kind: "command"; text: string }
  /** El texto sale de content.ts: la n-esima linea `output` lee `log[n]`. */
  | { kind: "output"; tone: LogTone };

export interface DiagramSpec {
  /** Ruta en la barra de la ventana. Literal: es un nombre de archivo. */
  window: string;
  flow?: {
    /** De izquierda a derecha. Una columna con varios nodos es un abanico. */
    columns: DiagramNode[][];
    /** Peticion y respuesta en ambos sentidos, no un pipeline de ida. */
    bidirectional?: boolean;
  };
  terminal?: TerminalLine[];
}

export const diagrams: Record<DiagramId, DiagramSpec> = {
  "svc-fullstack": {
    window: "app / architecture",
    flow: {
      columns: [
        [{ id: "ui", icon: "monitor" }],
        [{ id: "api", icon: "server" }],
        [{ id: "database", icon: "database" }],
      ],
      bidirectional: true,
    },
  },

  /*
    Un sitio, sus datos estructurados y los dos sitios donde se busca hoy:
    el buscador y las respuestas de la IA (abanico en la ultima columna).
  */
  "svc-seo": {
    window: "seo / search-console",
    flow: {
      columns: [
        [{ id: "site", icon: "monitor" }],
        [{ id: "schema", icon: "code" }],
        [
          { id: "google", icon: "search" },
          { id: "ai", icon: "bot" },
        ],
      ],
    },
  },

  "svc-automation": {
    window: "workflows / sync.json",
    flow: {
      columns: [
        [{ id: "webhook", icon: "webhook" }],
        [{ id: "n8n", icon: "workflow" }],
        [{ id: "python", icon: "code" }],
        [{ id: "apis", icon: "globe" }],
      ],
    },
  },

  "svc-docai": {
    window: "pipelines / extract.py",
    flow: {
      columns: [
        [{ id: "scans", icon: "scan" }],
        [{ id: "ocr", icon: "ocr" }],
        [{ id: "llm", icon: "bot" }],
        [{ id: "search", icon: "search" }],
      ],
    },
  },

  "svc-audit": {
    window: "advisory / report.log",
    terminal: [
      { kind: "command", text: "audit --scope funnel,process,security" },
      { kind: "output", tone: "ok" },
      { kind: "output", tone: "warn" },
      { kind: "output", tone: "error" },
      { kind: "output", tone: "info" },
    ],
  },

  "svc-media": {
    window: "projects / launch-video",
    flow: {
      columns: [
        [{ id: "script", icon: "pen" }],
        [{ id: "record", icon: "video" }],
        [{ id: "edit", icon: "scissors" }],
        [{ id: "publish", icon: "send" }],
      ],
    },
  },
};
