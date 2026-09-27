"use client";

import { useState, type FormEvent } from "react";
import { ArrowUpRight, Check } from "lucide-react";
import { site } from "@/data/site";
import { useLanguage } from "@/lib/language";
import { cn } from "@/lib/utils";

type Status = "idle" | "sending" | "success" | "error";

const fieldClass =
  "mt-2 block w-full min-w-0 rounded-xl border border-line bg-surface px-4 py-3 text-base text-ink placeholder:text-ink-subtle transition-colors duration-200 hover:border-line-strong focus-visible:border-accent-ink";

/**
 * Formulario de contacto por Web3Forms. Reemplaza al mailto: el correo
 * llega a la bandeja sin abrir la app de correo de quien escribe.
 *
 * El envio va desde el navegador porque asi lo exige Web3Forms en el
 * plan gratis. `botcheck` es el honeypot: un campo oculto que solo
 * rellenan los bots, y Web3Forms descarta esos envios.
 */
export function ContactForm() {
  const { t, language } = useLanguage();
  const copy = t.footer.form;
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
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
    } catch {
      setStatus("error");
    }
  }

  const sending = status === "sending";

  return (
    <form
      id="contact-form"
      onSubmit={handleSubmit}
      className="scroll-mt-24 rounded-2xl border border-line bg-surface-2 p-5 sm:p-6"
    >
      <p className="text-base font-medium text-ink">{copy.title}</p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
        <label className="block min-w-0 text-sm text-ink-muted">
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
        <label className="block min-w-0 text-sm text-ink-muted">
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

      <label className="mt-4 block text-sm text-ink-muted">
        {copy.message}
        <textarea
          name="message"
          required
          rows={4}
          maxLength={4000}
          placeholder={copy.messagePlaceholder}
          className={cn(fieldClass, "resize-y leading-relaxed")}
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

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={sending}
          className="group inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full border border-line-strong px-6 text-sm font-medium text-ink transition-colors duration-200 hover:border-accent-ink hover:text-accent-ink disabled:cursor-wait disabled:opacity-60"
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
            status === "error" ? "text-accent-ink" : "text-ink-muted",
          )}
        >
          {status === "success" ? (
            <span className="inline-flex items-start gap-1.5">
              <Check className="mt-0.5 size-4 shrink-0 text-accent-ink" aria-hidden="true" />
              {copy.success}
            </span>
          ) : status === "error" ? (
            copy.error
          ) : null}
        </p>
      </div>
    </form>
  );
}
