import { track } from "@vercel/analytics";
import { site } from "@/data/site";

/** Numero de WhatsApp en formato internacional, sin signos (sale de site.ts). */
const WHATSAPP_NUMBER = site.phone.replace(/\D/g, "");

/**
 * Construye el enlace de WhatsApp con el mensaje ya escrito.
 *
 * El mensaje se pasa desde el diccionario, asi que quien navega en
 * espanol abre WhatsApp con un texto en espanol. Antes estaba fijo en
 * ingles dentro de la URL.
 */
export function buildWhatsappUrl(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/**
 * Evento de Vercel Analytics al abrir WhatsApp: es la conversion del
 * sitio, y sin medirla no hay forma de saber si el SEO trae clientes.
 * `location` dice que boton fue; `language`, en que version del sitio.
 *
 * Los eventos personalizados solo se registran en planes Pro de Vercel;
 * en Hobby la llamada no hace nada y las visitas se siguen contando.
 */
export function trackWhatsappClick(location: string, language: string) {
  track("whatsapp_click", { location, language });
}
