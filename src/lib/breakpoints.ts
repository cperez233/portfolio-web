/**
 * Escritorio de verdad: ancho lg y un puntero que no sea tactil.
 *
 * Es la misma condicion que la variante `desktop` de globals.css; si
 * cambia una, tiene que cambiar la otra. Esta copia existe para las
 * decisiones que no son CSS, como no montar un componente.
 */
export const DESKTOP_QUERY = "(min-width: 64rem) and (not (pointer: coarse))";
