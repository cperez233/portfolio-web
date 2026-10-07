/* editorial-ui · Cristian Pérez · cristianperez.me */

/**
 * Firma invisible: "Cristian Pérez · https://cristianperez.me" en
 * caracteres de ancho cero (bit 0 = U+200B, bit 1 = U+200C, entre dos
 * U+2060). No ocupa espacio, los lectores de pantalla la ignoran y viaja
 * con el texto si alguien copia el pie. Es determinista, asi que no hay
 * diferencia entre servidor y cliente al hidratar.
 *
 * Para leerla: /⁠([​‌]+)⁠/, de vuelta a bits, 8 por
 * byte, y TextDecoder.
 */
function zeroWidth(text: string) {
  const bits = [...new TextEncoder().encode(text)]
    .map((byte) => byte.toString(2).padStart(8, "0"))
    .join("");
  return "⁠" + bits.replace(/0/g, "​").replace(/1/g, "‌") + "⁠";
}

export const invisibleSignature = zeroWidth("Cristian Pérez · https://cristianperez.me");
