import {
  RootShell,
  buildMetadata,
  viewport as sharedViewport,
} from "@/components/root-shell";

export const viewport = sharedViewport;

/** Version en ingles, en "/". Ver RootShell. */
export const metadata = buildMetadata("en");

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <RootShell language="en">{children}</RootShell>;
}
