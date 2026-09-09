/** Numero de WhatsApp en formato internacional, sin signos. */
const WHATSAPP_NUMBER = "573052669219";

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
