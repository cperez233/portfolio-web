import { LegalRoot } from "@/components/legal-shell";

/** Layout raiz propio de la politica de privacidad (en). Ver LegalShell. */
export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <LegalRoot language="en">{children}</LegalRoot>;
}
