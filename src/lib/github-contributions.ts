import snapshot from "@/data/github-snapshot.json";

/**
 * Contribuciones de GitHub del ultimo ano, para el tablero 3D de la
 * seccion GitHub.
 *
 * GitHub no da el calendario sin token, asi que se lee de
 * github-contributions-api.jogruber.de, que lo saca del perfil publico.
 * Se revalida una vez al dia (ISR): la pagina sigue siendo estatica y el
 * tablero se pone al dia solo.
 *
 * Si la API falla (sin red en el build, caida), se usa la copia de
 * data/github-snapshot.json. Mejor un tablero de hace unos dias que una
 * seccion vacia o un build roto.
 */

export const GITHUB_USER = "cperez233";

/** Semanas del tablero: 53 columnas, como el calendario de GitHub. */
const WEEKS = 53;

export interface ContributionYear {
  /** Primer dia del tablero (siempre domingo), YYYY-MM-DD. */
  start: string;
  /** Contribuciones por dia desde `start`, hasta hoy incluido. */
  days: number[];
  total: number;
  activeDays: number;
  best: { date: string; count: number } | null;
  /** Totales por ano calendario, del mas antiguo al mas reciente. */
  years: { year: string; total: number }[];
}

interface ApiResponse {
  total: Record<string, number>;
  contributions: { date: string; count: number }[];
}

async function fetchCounts(): Promise<{ counts: Map<string, number>; totals: Record<string, number> }> {
  try {
    const response = await fetch(
      `https://github-contributions-api.jogruber.de/v4/${GITHUB_USER}`,
      { next: { revalidate: 86400 }, signal: AbortSignal.timeout(8000) },
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = (await response.json()) as ApiResponse;
    const counts = new Map<string, number>();
    for (const day of data.contributions) if (day.count > 0) counts.set(day.date, day.count);
    return { counts, totals: data.total };
  } catch {
    return {
      counts: new Map(snapshot.days.map(([date, count]) => [date as string, count as number])),
      totals: snapshot.totals,
    };
  }
}

const isoDay = (date: Date) => date.toISOString().slice(0, 10);

export async function getContributionYear(): Promise<ContributionYear> {
  const { counts, totals } = await fetchCounts();

  /*
    Hoy en hora de Colombia (UTC-5, sin horario de verano): en UTC, a las
    8 p. m. de Bucaramanga ya seria manana y el tablero tendria un dia de
    mas sin commits.
  */
  const today = new Date(Date.now() - 5 * 3600 * 1000);
  today.setUTCHours(0, 0, 0, 0);
  const start = new Date(today);
  start.setUTCDate(start.getUTCDate() - start.getUTCDay() - (WEEKS - 1) * 7);

  const days: number[] = [];
  let best: ContributionYear["best"] = null;
  for (const cursor = new Date(start); cursor <= today; cursor.setUTCDate(cursor.getUTCDate() + 1)) {
    const date = isoDay(cursor);
    const count = counts.get(date) ?? 0;
    days.push(count);
    if (count > 0 && (!best || count > best.count)) best = { date, count };
  }

  return {
    start: isoDay(start),
    days,
    total: days.reduce((sum, count) => sum + count, 0),
    activeDays: days.filter((count) => count > 0).length,
    best,
    years: Object.entries(totals)
      .map(([year, total]) => ({ year, total }))
      .sort((a, b) => a.year.localeCompare(b.year)),
  };
}
