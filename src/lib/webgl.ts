/**
 * Prueba de soporte WebGL para las escenas three.js (r163 en adelante solo
 * usa WebGL 2). Suelta el contexto al terminar: los celulares aguantan
 * pocos a la vez y este no es el de la escena.
 */
export function hasWebGL() {
  try {
    const gl = document.createElement("canvas").getContext("webgl2");
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return Boolean(gl);
  } catch {
    return false;
  }
}
