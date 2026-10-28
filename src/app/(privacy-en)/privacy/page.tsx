import { LegalContent, buildPrivacyMetadata } from "@/components/legal-shell";

export const metadata = buildPrivacyMetadata("en");

/** Politica de privacidad en ingles, en "/privacy". */
export default function Page() {
  return <LegalContent language="en" />;
}
