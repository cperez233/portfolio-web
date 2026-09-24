import {
  RootShell,
  buildMetadata,
  viewport as sharedViewport,
} from "@/components/root-shell";

export const viewport = sharedViewport;

/** Version en espanol, en "/es". Ver RootShell. */
export const metadata = buildMetadata("es");

export default function RootLayout({ children }: LayoutProps<"/es">) {
  return <RootShell language="es">{children}</RootShell>;
}
