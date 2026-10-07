import {
  AmbientLight,
  BackSide,
  BoxGeometry,
  Color,
  Fog,
  DataTexture,
  DirectionalLight,
  InstancedMesh,
  Mesh,
  MeshBasicMaterial,
  MeshToonMaterial,
  NearestFilter,
  Object3D,
  PerspectiveCamera,
  Raycaster,
  RedFormat,
  Scene,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";

/**
 * Tablero 3D de contribuciones, dibujado como una vineta de manga:
 * sombreado en tres tonos (MeshToonMaterial), contorno de tinta con la
 * tecnica del casco invertido (una copia un poco mayor, por dentro y en
 * negro) y la sombra dura dorada que llevan todas las vinetas del sitio.
 *
 * Es three.js a pelo y no react-three-fiber: son dos InstancedMesh y una
 * camara, no hace falta un reconciliador. El modulo entero se importa
 * con import() cuando la seccion se acerca a la pantalla.
 *
 * Una semana es una columna (eje X) y un dia una fila (eje Z), como el
 * calendario de GitHub. Las semanas recientes quedan del lado de la
 * camara: es donde esta la actividad.
 */

export interface ArenaColors {
  tile: string;
  base: string;
  ink: string;
  accent: string;
  accentStrong: string;
  shadow: string;
  /** Fondo de la vineta, para la niebla. */
  fog: string;
}

export interface ArenaDay {
  index: number;
  count: number;
  /** Posicion en pantalla, en px relativos al canvas. */
  x: number;
  y: number;
}

export interface ArenaOptions {
  canvas: HTMLCanvasElement;
  days: number[];
  colors: ArenaColors;
  reducedMotion: boolean;
  /** Elementos ゴ que la escena coloca sobre los dias con mas actividad. */
  glyphs: HTMLElement[];
  /** Ficha del dia: la escena la mantiene sobre la columna al girar. */
  tip: HTMLElement;
  onHover: (day: ArenaDay | null) => void;
  onPunch: (day: ArenaDay) => void;
  onReady: () => void;
}

export interface Arena {
  setColors: (colors: ArenaColors) => void;
  setVisible: (visible: boolean) => void;
  /** Levanta las columnas desde el suelo (entrada de la seccion). */
  rise: () => void;
  /** Golpe en todas las columnas a la vez, en ola (combo de ORA). */
  barrage: () => void;
  dispose: () => void;
}

const PITCH = 1.18;
const TILE = 1;
const OUTLINE = 0.055;
const FLAT = 0.14;

function heightFor(count: number) {
  return count === 0 ? FLAT : 0.6 + Math.sqrt(count) * 1.45;
}

/** Rampa de tres tonos: luz, medio tono y sombra, sin degradado. */
function toonRamp() {
  const texture = new DataTexture(new Uint8Array([90, 170, 255]), 3, 1, RedFormat);
  texture.minFilter = NearestFilter;
  texture.magFilter = NearestFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  return texture;
}

export function createArena(options: ArenaOptions): Arena {
  const { canvas, days, reducedMotion, glyphs, tip } = options;
  let colors = options.colors;

  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const camera = new PerspectiveCamera(30, 1, 0.1, 400);
  // El ano se aleja hacia el fondo y se funde: lo reciente manda.
  const fog = new Fog(options.colors.fog, 30, 95);
  scene.fog = fog;

  scene.add(new AmbientLight(0xffffff, 1.15));
  const sun = new DirectionalLight(0xffffff, 2.2);
  sun.position.set(-18, 30, 22);
  scene.add(sun);

  const weeks = Math.ceil(days.length / 7);
  const boardW = weeks * PITCH;
  const boardD = 7 * PITCH;
  const count = days.length;
  const maxCount = Math.max(1, ...days);

  // Geometria con la base en y = 0: escalar en Y la hace crecer hacia arriba.
  const box = new BoxGeometry(1, 1, 1);
  box.translate(0, 0.5, 0);

  const ramp = toonRamp();
  const tileMaterial = new MeshToonMaterial({ gradientMap: ramp });
  const inkMaterial = new MeshBasicMaterial({ side: BackSide });
  const tiles = new InstancedMesh(box, tileMaterial, count);
  const outlines = new InstancedMesh(box, inkMaterial, count);
  // Las columnas cambian de altura: la esfera de recorte por defecto se
  // calcula una vez y las cortaria al girar.
  tiles.frustumCulled = false;
  outlines.frustumCulled = false;
  scene.add(outlines, tiles);

  // Placa base, su contorno y la sombra dura dorada de las vinetas.
  const baseMaterial = new MeshToonMaterial({ gradientMap: ramp });
  const base = new Mesh(box, baseMaterial);
  base.scale.set(boardW + 1.4, 0.6, boardD + 1.4);
  base.position.y = -0.6;
  const baseInk = new Mesh(box, inkMaterial);
  baseInk.scale.set(boardW + 1.4 + OUTLINE * 4, 0.6 + OUTLINE * 4, boardD + 1.4 + OUTLINE * 4);
  baseInk.position.y = -0.6 - OUTLINE * 2;
  const shadowMaterial = new MeshBasicMaterial();
  const shadow = new Mesh(box, shadowMaterial);
  shadow.scale.set(boardW + 1.4, 0.6, boardD + 1.4);
  shadow.position.set(0.9, -1.05, 0.9);
  scene.add(shadow, baseInk, base);

  const positions = days.map((_, i) => {
    const week = Math.floor(i / 7);
    const dow = i % 7;
    return new Vector3((week - (weeks - 1) / 2) * PITCH, 0, (dow - 3) * PITCH);
  });
  const targets = days.map(heightFor);
  const heights = targets.map((h) => (reducedMotion ? h : FLAT));
  const punch = new Float32Array(count);
  const riseDelay = days.map((_, i) => Math.floor(i / 7) * 0.022);

  // Los tres dias con mas actividad llevan un ゴ encima.
  const glyphDays = days
    .map((c, i) => ({ c, i }))
    .filter((d) => d.c > 0)
    .sort((a, b) => b.c - a.c)
    .slice(0, glyphs.length)
    .map((d) => d.i);

  let hovered = -1;
  const dummy = new Object3D();
  const tmpColor = new Color();

  function colorFor(i: number) {
    const value = days[i];
    if (value === 0) return tmpColor.set(colors.tile);
    // Mas commits, mas cerca del oro claro.
    const t = Math.min(1, Math.sqrt(value / maxCount));
    tmpColor.set(colors.accent).lerp(new Color(colors.accentStrong), t);
    return tmpColor;
  }

  function paint() {
    for (let i = 0; i < count; i++) {
      const color = colorFor(i);
      if (i === hovered) color.lerp(new Color("#ffffff"), 0.45);
      tiles.setColorAt(i, color);
    }
    if (tiles.instanceColor) tiles.instanceColor.needsUpdate = true;
    inkMaterial.color.set(colors.ink);
    fog.color.set(colors.fog);
    baseMaterial.color.set(colors.base);
    shadowMaterial.color.set(colors.shadow);
  }

  function writeMatrices() {
    for (let i = 0; i < count; i++) {
      const lift = i === hovered ? 0.18 : 0;
      const squash = 1 - punch[i] * 0.35;
      const h = Math.max(0.05, heights[i] * squash);
      const w = TILE * (1 + punch[i] * 0.18);
      const p = positions[i];
      dummy.position.set(p.x, lift, p.z);
      dummy.scale.set(w, h, w);
      dummy.updateMatrix();
      tiles.setMatrixAt(i, dummy.matrix);
      dummy.position.set(p.x, lift - OUTLINE, p.z);
      dummy.scale.set(w + OUTLINE * 2, h + OUTLINE * 2, w + OUTLINE * 2);
      dummy.updateMatrix();
      outlines.setMatrixAt(i, dummy.matrix);
    }
    tiles.instanceMatrix.needsUpdate = true;
    outlines.instanceMatrix.needsUpdate = true;
  }

  // ---- Camara: orbita alrededor del centro del tablero -------------------
  /*
    La camara mira a las ultimas semanas, que es donde esta la actividad,
    y el resto del ano se aleja en perspectiva detras. Visto entero, el
    tablero era una tira fina con la accion en una esquina.
  */
  const FOCUS_WEEKS = 12;
  const target = new Vector3(boardW / 2 - (FOCUS_WEEKS / 2) * PITCH, 1.2, 0);
  let width = 1;
  let height = 1;
  let restYaw = 1.0;
  let restPitch = 0.45;
  let yaw = restYaw;
  let pitch = restPitch;
  let yawVelocity = 0;
  let distance = 60;
  let lastInteraction = -Infinity;

  function placeCamera(time: number) {
    // Un vaiven minimo en reposo: el tablero respira sin pedir atencion.
    const sway = reducedMotion ? 0 : Math.sin(time * 0.00025) * 0.035;
    const y = yaw + sway;
    camera.position.set(
      target.x + distance * Math.cos(pitch) * Math.sin(y),
      target.y + distance * Math.sin(pitch),
      target.z + distance * Math.cos(pitch) * Math.cos(y),
    );
    camera.lookAt(target);
  }

  /** Distancia que deja el tablero entero en cuadro en la pose de reposo. */
  function fit() {
    const tallest = Math.max(...targets);
    const corners: Vector3[] = [];
    for (const x of [boardW / 2 - FOCUS_WEEKS * PITCH, boardW / 2 + 1])
      for (const z of [-boardD / 2 - 1, boardD / 2 + 1])
        for (const y of [-1.1, tallest]) corners.push(new Vector3(x, y, z));
    const saved = { yaw, pitch };
    yaw = restYaw;
    pitch = restPitch;
    let lo = 5;
    let hi = 300;
    for (let step = 0; step < 24; step++) {
      distance = (lo + hi) / 2;
      placeCamera(0);
      camera.updateMatrixWorld();
      const inside = corners.every((corner) => {
        const p = corner.clone().project(camera);
        return Math.abs(p.x) < 0.9 && Math.abs(p.y) < 0.8 && p.z < 1;
      });
      if (inside) hi = distance;
      else lo = distance;
    }
    distance = hi;
    yaw = saved.yaw;
    pitch = saved.pitch;
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    // En vertical el tablero se mira casi a lo largo: cabe y gana fondo.
    const narrow = camera.aspect < 1.2;
    restYaw = narrow ? 1.2 : 0.95;
    restPitch = narrow ? 0.5 : 0.42;
    camera.updateProjectionMatrix();
    fit();
    if (performance.now() - lastInteraction > 2000) {
      yaw = restYaw;
      pitch = restPitch;
    }
    dirty = true;
  }

  // ---- Entrada y golpes ---------------------------------------------------
  let riseStart = -1;
  let wave = -1;
  const punchStart = new Float32Array(count).fill(-1);

  function project(i: number) {
    const p = positions[i];
    const v = new Vector3(p.x, heights[i] + 0.3, p.z).project(camera);
    return { x: (v.x * 0.5 + 0.5) * width, y: (-v.y * 0.5 + 0.5) * height };
  }

  // ---- Puntero ------------------------------------------------------------
  const raycaster = new Raycaster();
  const ndc = new Vector2();
  let pointerDown: { x: number; y: number; id: number; moved: boolean } | null = null;
  let lastX = 0;
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  function pick(clientX: number, clientY: number) {
    const rect = canvas.getBoundingClientRect();
    ndc.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    const hit = raycaster.intersectObject(tiles, false)[0];
    return hit?.instanceId ?? -1;
  }

  /*
    La ficha va encima de la columna, pero dentro de la vineta: cerca del
    borde superior baja por debajo del punto, y se frena en los lados.
  */
  function placeTip() {
    if (hovered < 0) return;
    const p = project(hovered);
    const half = tip.offsetWidth / 2 + 8;
    const x = Math.min(width - half, Math.max(half, p.x));
    const below = p.y - tip.offsetHeight - 22 < 0;
    tip.style.transform = `translate3d(${x}px, ${below ? p.y + tip.offsetHeight + 40 : p.y}px, 0)`;
  }

  function setHovered(i: number) {
    if (i === hovered) return;
    hovered = i;
    paint();
    dirty = true;
    options.onHover(i < 0 ? null : { index: i, count: days[i], ...project(i) });
    // Despues del render de React, que cambia el texto y el ancho.
    requestAnimationFrame(placeTip);
  }

  function onPointerDown(event: PointerEvent) {
    pointerDown = { x: event.clientX, y: event.clientY, id: event.pointerId, moved: false };
    lastX = event.clientX;
    yawVelocity = 0;
    lastInteraction = performance.now();
  }

  function onPointerMove(event: PointerEvent) {
    if (pointerDown && pointerDown.id === event.pointerId) {
      const dx = event.clientX - pointerDown.x;
      const dy = event.clientY - pointerDown.y;
      if (!pointerDown.moved && Math.hypot(dx, dy) > 6) {
        pointerDown.moved = true;
        canvas.setPointerCapture(event.pointerId);
        canvas.style.cursor = "grabbing";
      }
      if (pointerDown.moved) {
        const step = ((event.clientX - lastX) / width) * 3.2;
        yaw -= step;
        yawVelocity = -step;
        // El arrastre vertical solo inclina con raton: en tactil es scroll.
        if (event.pointerType === "mouse") {
          pitch = Math.min(1.15, Math.max(0.22, pitch + (event.movementY / height) * 1.6));
        }
        lastX = event.clientX;
        lastInteraction = performance.now();
        dirty = true;
      }
      return;
    }
    if (canHover) setHovered(pick(event.clientX, event.clientY));
  }

  function onPointerUp(event: PointerEvent) {
    const down = pointerDown;
    pointerDown = null;
    canvas.style.cursor = "";
    if (!down || down.id !== event.pointerId) return;
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    if (down.moved) return;
    const i = pick(event.clientX, event.clientY);
    if (i < 0) {
      if (!canHover) setHovered(-1);
      return;
    }
    if (!canHover) setHovered(i);
    punchStart[i] = performance.now();
    options.onPunch({ index: i, count: days[i], ...project(i) });
  }

  function onPointerLeave() {
    if (canHover && !pointerDown) setHovered(-1);
  }

  function onPointerCancel() {
    pointerDown = null;
    canvas.style.cursor = "";
  }

  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointerleave", onPointerLeave);
  canvas.addEventListener("pointercancel", onPointerCancel);

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);

  // ---- Bucle --------------------------------------------------------------
  let visible = false;
  let frame = 0;
  let dirty = true;

  function tick(time: number) {
    frame = 0;
    if (!visible) return;
    let animating = !reducedMotion;

    // Inercia al soltar, y vuelta suave a la pose de reposo tras 3 s quieto.
    if (!pointerDown) {
      if (Math.abs(yawVelocity) > 0.0005) {
        yaw += yawVelocity;
        yawVelocity *= 0.92;
        animating = true;
      } else if (time - lastInteraction > 3000) {
        const dYaw = restYaw - yaw;
        const dPitch = restPitch - pitch;
        if (Math.abs(dYaw) + Math.abs(dPitch) > 0.001) {
          yaw += dYaw * 0.035;
          pitch += dPitch * 0.035;
          animating = true;
        }
      }
    }

    let moved = false;
    if (riseStart >= 0) {
      const t = (time - riseStart) / 1000;
      let done = true;
      for (let i = 0; i < count; i++) {
        const local = Math.min(1, Math.max(0, (t - riseDelay[i]) / 0.55));
        // easeOutBack: suben y se pasan un poco, como un golpe de efecto.
        const k = 1.6;
        const e = local === 0 ? 0 : 1 + (k + 1) * Math.pow(local - 1, 3) + k * Math.pow(local - 1, 2);
        heights[i] = FLAT + (targets[i] - FLAT) * e;
        if (local < 1) done = false;
      }
      if (done) riseStart = -1;
      moved = true;
    }

    for (let i = 0; i < count; i++) {
      let value = 0;
      if (punchStart[i] >= 0) {
        const t = (time - punchStart[i]) / 420;
        if (t >= 1) punchStart[i] = -1;
        else value = Math.sin(t * Math.PI) * (1 - t * 0.4);
      }
      if (wave >= 0) {
        // La ola sale de la semana mas reciente y corre hacia el fondo.
        const t = (time - wave - (boardW / 2 - positions[i].x) * 14) / 380;
        if (t > 0 && t < 1) value = Math.max(value, Math.sin(t * Math.PI) * 0.8);
      }
      if (value !== punch[i]) {
        punch[i] = value;
        moved = true;
      }
    }
    if (wave >= 0 && time - wave > boardW * 14 + 400) wave = -1;

    if (moved) writeMatrices();
    if (moved || animating || dirty) {
      placeCamera(time);
      renderer.render(scene, camera);
      for (let g = 0; g < glyphs.length; g++) {
        const i = glyphDays[g];
        if (i === undefined) {
          glyphs[g].style.opacity = "0";
          continue;
        }
        const p = project(i);
        glyphs[g].style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
        glyphs[g].style.opacity = "1";
      }
      placeTip();
      dirty = false;
    }
    frame = requestAnimationFrame(tick);
  }

  function start() {
    if (!frame && visible) frame = requestAnimationFrame(tick);
  }

  paint();
  writeMatrices();
  resize();
  placeCamera(0);
  renderer.render(scene, camera);
  options.onReady();

  return {
    setColors(next) {
      colors = next;
      paint();
      dirty = true;
      start();
    },
    setVisible(next) {
      visible = next;
      if (next) {
        dirty = true;
        start();
      } else if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    },
    rise() {
      if (reducedMotion) return;
      riseStart = performance.now();
      start();
    },
    barrage() {
      if (reducedMotion) return;
      wave = performance.now();
      start();
    },
    dispose() {
      if (frame) cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      canvas.removeEventListener("pointercancel", onPointerCancel);
      box.dispose();
      ramp.dispose();
      tileMaterial.dispose();
      inkMaterial.dispose();
      baseMaterial.dispose();
      shadowMaterial.dispose();
      tiles.dispose();
      outlines.dispose();
      renderer.dispose();
    },
  };
}
