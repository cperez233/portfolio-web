import { LegalContent, buildPrivacyMetadata } from "@/components/legal-shell";

export const metadata = buildPrivacyMetadata("es");

/** Politica de privacidad en espanol, en "/es/privacidad". */
export default function Page() {
  return <LegalContent language="es" />;
}
