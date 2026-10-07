import {
  BackSide,
  BufferGeometry,
  DataTexture,
  Mesh,
  MeshBasicMaterial,
  MeshToonMaterial,
  NearestFilter,
  RedFormat,
  type ColorRepresentation,
} from "three";

/**
 * Piezas comunes de las escenas 3D de manga: sombreado en tres tonos y
 * contorno de tinta con casco invertido (copia un poco mayor, por dentro,
 * en negro). Igual que el tablero de GitHub.
 */

export function toonRamp() {
  const texture = new DataTexture(new Uint8Array([90, 170, 255]), 3, 1, RedFormat);
  texture.minFilter = NearestFilter;
  texture.magFilter = NearestFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}

export function toon(color: ColorRepresentation, ramp: DataTexture) {
  return new MeshToonMaterial({ color, gradientMap: ramp });
}

/** Malla con su contorno de tinta. `ink` es compartida entre mallas. */
export function inked(geometry: BufferGeometry, material: MeshToonMaterial, ink: MeshBasicMaterial, thickness = 1.06) {
  const mesh = new Mesh(geometry, material);
  const outline = new Mesh(geometry, ink);
  outline.scale.setScalar(thickness);
  mesh.add(outline);
  return mesh;
}

export function inkMaterial(color: ColorRepresentation = "#060507") {
  return new MeshBasicMaterial({ color, side: BackSide });
}
