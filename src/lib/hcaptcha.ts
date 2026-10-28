/**
 * hCaptcha para el formulario de contacto (el antispam que ofrece
 * Web3Forms en el plan gratis). Se carga solo cuando la persona empieza a
 * escribir, para no contactar a un tercero con solo visitar la pagina.
 */
interface HCaptcha {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  reset: (id?: string) => void;
}

declare global {
  interface Window {
    hcaptcha?: HCaptcha;
    portfolioHcaptchaReady?: () => void;
  }
}

let loading: Promise<HCaptcha> | null = null;

export function loadHcaptcha(hl: string): Promise<HCaptcha> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.hcaptcha) return Promise.resolve(window.hcaptcha);
  loading ??= new Promise<HCaptcha>((resolve, reject) => {
    const script = document.createElement("script");
    window.portfolioHcaptchaReady = () =>
      window.hcaptcha ? resolve(window.hcaptcha) : reject(new Error("hcaptcha unavailable"));
    script.src = `https://js.hcaptcha.com/1/api.js?render=explicit&onload=portfolioHcaptchaReady&hl=${encodeURIComponent(hl)}`;
    script.async = true;
    script.onerror = () => {
      loading = null;
      reject(new Error("hcaptcha failed to load"));
    };
    document.head.appendChild(script);
  });
  return loading;
}
