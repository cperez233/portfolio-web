"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { emitStandEvent } from "@/lib/stand-events";
import { ArrowUpRight, Check } from "lucide-react";
import { site } from "@/data/site";
import { loadHcaptcha } from "@/lib/hcaptcha";
import { PRIVACY_PATHS } from "@/lib/language-detection";
import { useLanguage } from "@/lib/language";
import { cn } from "@/lib/utils";

type Status = "idle" | "sending" | "success" | "error" | "captcha";

// Campo de manga: trazo de tinta y sombra dorada al enfocarlo (manga-field).
const fieldClass =
  "manga-field mt-2 block w-full min-w-0 bg-canvas px-4 py-3 text-base text-ink placeholder:text-ink-subtle";

/**
 * Formulario de contacto por Web3Forms. Reemplaza al mailto: el correo
 * llega a la bandeja sin abrir la app de correo de quien escribe.
 *
 * El envio va desde el navegador porque asi lo exige Web3Forms en el
 * plan gratis. `botcheck` es el honeypot: un campo oculto que solo
 * rellenan los bots, y Web3Forms descarta esos envios.
 *
 * hCaptcha va encima del honeypot: se carga al empezar a escribir y su
 * token viaja como `h-captcha-response`. Hay que tener hCaptcha activado
 * como "Block Spam" en el panel de Web3Forms para que se compruebe.
 */
export function ContactForm() {
  const { t, language } = useLanguage();
  const copy = t.footer.form;
  const [status, setStatus] = useState<Status>("idle");
  const captchaEl = useRef<HTMLDivElement>(null);
  const captchaId = useRef<string | null>(null);
  const [wantCaptcha, setWantCaptcha] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  // Sin captcha (bloqueado o sin red) el envio no puede validarse: se remite a WhatsApp.
  const [captchaFailed, setCaptchaFailed] = useState(false);

  useEffect(() => {
    if (!wantCaptcha || !captchaEl.current) return;
    const el = captchaEl.current;
    let cancelled = false;
    loadHcaptcha(language)
      .then((hcaptcha) => {
        if (cancelled || el.childElementCount > 0) return;
        captchaId.current = hcaptcha.render(el, {
          sitekey: site.hcaptchaSiteKey,
          callback: (token: string) => setCaptchaToken(token),
          "expired-callback": () => setCaptchaToken(""),
          "error-callback": () => setCaptchaToken(""),
        });
      })
      .catch(() => !cancelled && setCaptchaFailed(true));
    return () => {
      cancelled = true;
    };
  }, [wantCaptcha, language]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (captchaFailed) {
      setStatus("error");
      return;
    }
    if (!captchaToken) {
      setWantCaptcha(true);
      setStatus("captcha");
      return;
    }
    const form = event.currentTarget;
    const data = new FormData(form);
    data.set("h-captcha-response", captchaToken);
    data.append("access_key", site.web3formsKey);
    data.append("subject", copy.subject);
    data.append("from_name", `Portafolio (${language})`);

    setStatus("sending");
    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: data,
      });
      const result: { success?: boolean } = await response.json();
      if (!response.ok || !result.success) throw new Error("web3forms");
      form.reset();
      setStatus("success");
      emitStandEvent("sent");
    } catch {
      setStatus("error");
    }
    // El token solo vale una vez.
    if (captchaId.current) window.hcaptcha?.reset(captchaId.current);
    setCaptchaToken("");
  }

  const sending = status === "sending";

  return (
    <form
      id="contact-form"
      onSubmit={handleSubmit}
      onFocus={() => setWantCaptcha(true)}
      // Una carta en vineta: el titulo va en el cartel de tinta de arriba.
      // En escritorio llena el alto de su columna: crece el cuadro del mensaje.
      className="manga-form scroll-mt-24 p-5 sm:p-6 lg:flex lg:flex-1 lg:flex-col"
    >
      <p className="manga-form-title">{copy.title}</p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="manga-label block min-w-0">
          {copy.name}
          <input
            type="text"
            name="name"
            required
            autoComplete="name"
            maxLength={120}
            className={fieldClass}
          />
        </label>
        <label className="manga-label block min-w-0">
          {copy.email}
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            maxLength={200}
            className={fieldClass}
          />
        </label>
      </div>

      <label className="manga-label mt-4 block lg:flex lg:flex-1 lg:flex-col">
        {copy.message}
        <textarea
          name="message"
          required
          rows={5}
          maxLength={4000}
          placeholder={copy.messagePlaceholder}
          className={cn(fieldClass, "resize-y leading-relaxed lg:min-h-40 lg:flex-1")}
        />
      </label>

      {/* Honeypot: fuera de la vista y del foco, solo lo ven los bots. */}
      <input
        type="checkbox"
        name="botcheck"
        tabIndex={-1}
        aria-hidden="true"
        autoComplete="off"
        className="hidden"
      />

      <div ref={captchaEl} className="mt-5" />

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={sending}
          className="accent-fill group inline-flex min-h-12 shrink-0 items-center justify-center gap-2 px-6 text-sm disabled:cursor-wait disabled:opacity-60"
        >
          {sending ? copy.sending : copy.submit}
          <ArrowUpRight
            className="size-4 transition-transform duration-300 ease-[var(--ease-premium)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </button>

        <p
          role="status"
          aria-live="polite"
          className={cn(
            "text-sm leading-relaxed",
            status === "error" || status === "captcha" ? "text-accent-ink" : "text-ink-muted",
          )}
        >
          {status === "success" ? (
            <span className="inline-flex items-start gap-1.5">
              <Check className="mt-0.5 size-4 shrink-0 text-accent-ink" aria-hidden="true" />
              {copy.success}
            </span>
          ) : status === "error" ? (
            copy.error
          ) : status === "captcha" && !captchaToken ? (
            copy.captchaError
          ) : null}
        </p>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-ink-subtle">
        {copy.consent}{" "}
        <a
          href={PRIVACY_PATHS[language]}
          target="_blank"
          rel="noopener"
          className="underline underline-offset-4 hover:text-ink"
        >
          {copy.consentLink}
        </a>
        .
      </p>
    </form>
  );
}
