import {
  Bot,
  CodeXml,
  Database,
  FileScan,
  Globe,
  GraduationCap,
  Monitor,
  PenLine,
  ScanText,
  Scissors,
  Search,
  Send,
  Server,
  ShieldCheck,
  Video,
  Webhook,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import type { DiagramIcon } from "@/data/diagrams";

/**
 * Los datos nombran el icono con una clave y aqui se resuelve el
 * componente: asi data/diagrams.ts sigue siendo datos, sin importar React.
 */
const ICONS: Record<DiagramIcon, LucideIcon> = {
  monitor: Monitor,
  server: Server,
  bot: Bot,
  graduation: GraduationCap,
  database: Database,
  scan: FileScan,
  ocr: ScanText,
  code: CodeXml,
  search: Search,
  webhook: Webhook,
  workflow: Workflow,
  globe: Globe,
  pen: PenLine,
  video: Video,
  scissors: Scissors,
  send: Send,
  shield: ShieldCheck,
};

export function DiagramIconGlyph({
  icon,
  className,
}: {
  icon: DiagramIcon;
  className?: string;
}) {
  const Icon = ICONS[icon];
  return <Icon className={className} aria-hidden="true" />;
}
