import {
  AmbientLight,
  BackSide,
  CanvasTexture,
  CylinderGeometry,
  DirectionalLight,
  ExtrudeGeometry,
  Group,
  LatheGeometry,
  Mesh,
  MeshBasicMaterial,
  Path,
  PerspectiveCamera,
  Scene,
  Shape,
  SRGBColorSpace,
  Vector2,
  WebGLRenderer,
  type BufferGeometry,
  type Material,
  type MeshToonMaterial,
} from "three";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { toon, toonRamp } from "./toon";
import { isTimeStopped } from "@/lib/time-stop";

/**
 * La Flecha: la que despierta los Stands, dibujada de las vinetas y del
 * anime (Partes 4 y 5). La punta es un arco ojival ancho con el filo en
 * media luna plateada, dos puas que caen hacia atras y una muesca en C a
 * cada lado de la nervadura central. Tiene un agujero en forma de pica
 * cerca de la punta y filigrana dorada sobre fondo oscuro. Detras, un cuello
 * que se afina, dos anillos y el asta de madera, sin plumas. Se mece
 * mostrando la cara, se arrastra para girarla y, al tocarla, se lanza hacia
 * adelante (hacia la tarjeta de Stand) y vuelve.
 *
 * three.js a pelo, cargado bajo demanda como el tablero de GitHub.
 */

export interface ArrowScene {
  pierce: () => void;
  setVisible: (visible: boolean) => void;
  dispose: () => void;
}

interface Options {
  canvas: HTMLCanvasElement;
  reducedMotion: boolean;
  onPierce: () => void;
}

/** Lo que tienen en comun Shape, Path y el contexto de un canvas para trazar. */
interface Tracer {
  moveTo: (x: number, y: number) => unknown;
  lineTo: (x: number, y: number) => unknown;
  bezierCurveTo: (ax: number, ay: number, bx: number, by: number, x: number, y: number) => unknown;
}

/* La punta mira a +X. Estas medidas salen de las capturas de la serie. */
const TIP = 2.7;
const BARB: [number, number] = [0, 1.06];
const FIELD = { left: -0.6, width: 3.4, height: 2.5 };

/** Silueta de la punta: filo, pua, muesca en C y nervadura, y lo mismo al espejo. */
function traceHead(t: Tracer) {
  t.moveTo(TIP, 0);
  for (const k of [1, -1]) {
    if (k === 1) {
      t.bezierCurveTo(2.25, 0.72, 1.1, 1.16, BARB[0], BARB[1]);
      t.lineTo(0.16, 0.66);
      t.bezierCurveTo(0.45, 0.7, 0.92, 0.74, 0.98, 0.5);
      t.bezierCurveTo(1.02, 0.3, 0.62, 0.2, 0.22, 0.17);
      t.lineTo(-0.02, 0.2);
      t.lineTo(-0.45, 0.095);
    } else {
      t.lineTo(-0.45, -0.095);
      t.lineTo(-0.02, -0.2);
      t.lineTo(0.22, -0.17);
      t.bezierCurveTo(0.62, -0.2, 1.02, -0.3, 0.98, -0.5);
      t.bezierCurveTo(0.92, -0.74, 0.45, -0.7, 0.16, -0.66);
      t.lineTo(BARB[0], -BARB[1]);
      t.bezierCurveTo(1.1, -1.16, 2.25, -0.72, TIP, 0);
    }
  }
}

/** El agujero de la pica: redondo, con dos lobulos y la cola hacia el asta. */
function traceSpade(t: Tracer) {
  t.moveTo(1.9, 0);
  t.bezierCurveTo(1.88, 0.13, 1.74, 0.17, 1.66, 0.15);
  t.bezierCurveTo(1.6, 0.21, 1.48, 0.2, 1.46, 0.11);
  t.bezierCurveTo(1.44, 0.06, 1.46, 0.04, 1.34, 0);
  t.bezierCurveTo(1.46, -0.04, 1.44, -0.06, 1.46, -0.11);
  t.bezierCurveTo(1.48, -0.2, 1.6, -0.21, 1.66, -0.15);
  t.bezierCurveTo(1.74, -0.17, 1.88, -0.13, 1.9, 0);
}

/** Azar repetible: la filigrana sale igual en cada carga y en las dos alas. */
function seeded(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

/** Una celda de la filigrana: anillo irregular, con su sombra y un punto de luz. */
function lace(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, random: () => number) {
  const n = 7;
  const points = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const k = r * (0.6 + random() * 0.8);
    return [x + Math.cos(a) * k, y + Math.sin(a) * k];
  });
  ctx.beginPath();
  points.forEach(([px, py], i) => {
    const [nx, ny] = points[(i + 1) % n];
    const mx = (px + nx) / 2;
    const my = (py + ny) / 2;
    if (i === 0) ctx.moveTo(mx, my);
    else ctx.quadraticCurveTo(px, py, mx, my);
  });
  const [fx, fy] = points[0];
  const [sx, sy] = points[1];
  ctx.quadraticCurveTo(fx, fy, (fx + sx) / 2, (fy + sy) / 2);
  ctx.closePath();
  ctx.fillStyle = "#2d2008";
  ctx.fill();
  ctx.lineWidth = 0.024;
  ctx.strokeStyle = "#f4cf58";
  ctx.stroke();
}

/** Lo que va pintado sobre la cara de la punta: el metal, el filo, la filigrana y la nervadura. */
function headTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 1360;
  canvas.height = 1000;
  const ctx = canvas.getContext("2d")!;
  const scale = canvas.width / FIELD.width;
  ctx.setTransform(scale, 0, 0, -scale, -FIELD.left * scale, canvas.height / 2);

  const metal = ctx.createLinearGradient(TIP, 0.9, -0.2, -0.9);
  metal.addColorStop(0, "#7a5c16");
  metal.addColorStop(0.5, "#54400e");
  metal.addColorStop(1, "#33270a");
  ctx.fillStyle = metal;
  ctx.fillRect(FIELD.left, -FIELD.height / 2, FIELD.width, FIELD.height);

  // Las dos alas son espejo: se pintan una vez y se repite con la Y invertida.
  for (const flip of [1, -1]) {
    ctx.save();
    ctx.scale(1, flip);
    const random = seeded(29);
    const vine: [number, number, number][] = [
      [2.06, 0.2, 0.08],
      [1.84, 0.32, 0.09],
      [1.58, 0.42, 0.1],
      [1.34, 0.54, 0.11],
      [1.08, 0.68, 0.12],
      [0.8, 0.82, 0.11],
      [0.5, 0.84, 0.1],
      [0.24, 0.86, 0.08],
    ];
    // El tallo que une las celdas, y sus ramas hacia la nervadura.
    ctx.lineWidth = 0.024;
    ctx.strokeStyle = "#e9bc41";
    ctx.lineCap = "round";
    ctx.beginPath();
    vine.forEach(([x, y], i) => (i ? ctx.lineTo(x + (random() - 0.5) * 0.05, y + (random() - 0.5) * 0.05) : ctx.moveTo(x, y)));
    ctx.stroke();
    for (const [fromX, fromY, toX, toY, midX, midY] of [
      [1.58, 0.42, 1.14, 0.29, 1.32, 0.42],
      [1.34, 0.54, 1.12, 0.5, 1.24, 0.46],
      [1.84, 0.32, 1.92, 0.08, 1.96, 0.2],
      [1.08, 0.68, 1.3, 0.82, 1.14, 0.8],
      [0.8, 0.82, 1.0, 0.92, 0.88, 0.9],
      [0.5, 0.84, 0.56, 0.72, 0.6, 0.78],
      [1.58, 0.42, 1.68, 0.66, 1.68, 0.52],
    ]) {
      ctx.beginPath();
      ctx.moveTo(fromX, fromY);
      ctx.quadraticCurveTo(midX, midY, toX, toY);
      ctx.stroke();
    }
    vine.forEach(([x, y, r]) => lace(ctx, x, y, r, random));
    lace(ctx, 1.2, 0.33, 0.07, random);
    lace(ctx, 1.12, 0.5, 0.05, random);
    // Puntos sueltos entre las celdas.
    ctx.fillStyle = "#f4cf58";
    for (const [x, y] of [[1.45, 0.7], [1.2, 0.86], [1.7, 0.56], [0.92, 0.92], [0.62, 0.98], [1.96, 0.42]]) {
      ctx.beginPath();
      ctx.arc(x, y, 0.02, 0, Math.PI * 2);
      ctx.fill();
    }

    // El filo: media luna plateada, ancha en el medio y fina en los extremos.
    ctx.beginPath();
    ctx.moveTo(TIP, 0);
    ctx.bezierCurveTo(2.25, 0.72, 1.1, 1.16, BARB[0], BARB[1]);
    ctx.lineTo(0.05, 0.94);
    ctx.bezierCurveTo(1.0, 0.98, 2.04, 0.56, TIP - 0.1, 0);
    ctx.closePath();
    const edge = ctx.createLinearGradient(1.6, 1.1, 1.3, 0.7);
    edge.addColorStop(0, "#ffffff");
    edge.addColorStop(0.55, "#dfe3e8");
    edge.addColorStop(1, "#8d97a3");
    ctx.fillStyle = edge;
    ctx.fill();
    ctx.lineWidth = 0.03;
    ctx.strokeStyle = "#0b0805";
    ctx.beginPath();
    ctx.moveTo(0.05, 0.94);
    ctx.bezierCurveTo(1.0, 0.98, 2.04, 0.56, TIP - 0.1, 0);
    ctx.stroke();

    // La nervadura: dos planos que se encuentran en una arista.
    ctx.beginPath();
    ctx.moveTo(1.3, 0);
    ctx.lineTo(0.92, 0.1);
    ctx.lineTo(0.22, 0.17);
    ctx.lineTo(-0.02, 0.2);
    ctx.lineTo(-0.45, 0.095);
    ctx.lineTo(-0.45, 0);
    ctx.closePath();
    ctx.fillStyle = flip > 0 ? "#f0c84f" : "#a9801f";
    ctx.fill();
    ctx.lineWidth = 0.022;
    ctx.strokeStyle = "#1a1206";
    ctx.stroke();
    ctx.restore();
  }

  // Filo interior del agujero de la pica.
  ctx.beginPath();
  traceSpade(ctx);
  ctx.closePath();
  ctx.lineWidth = 0.05;
  ctx.strokeStyle = "#f4cf58";
  ctx.stroke();

  // Las dos muescas de la cintura de la nervadura.
  ctx.lineWidth = 0.03;
  ctx.strokeStyle = "#1a1206";
  ctx.beginPath();
  ctx.moveTo(-0.02, -0.2);
  ctx.lineTo(-0.02, 0.2);
  ctx.stroke();

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  // Las caras del Extrude tienen por UV sus coordenadas: se llevan a 0..1.
  texture.repeat.set(1 / FIELD.width, 1 / FIELD.height);
  texture.offset.set(-FIELD.left / FIELD.width, 0.5);
  return texture;
}

/** El asta: madera con la veta a lo largo. */
function woodTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 96;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#6e4122";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const random = seeded(7);
  for (let i = 0; i < 46; i++) {
    const y = random() * canvas.height;
    ctx.strokeStyle = random() < 0.65 ? "#3f2210" : "#a06a38";
    ctx.lineWidth = 0.8 + random() * 2;
    ctx.beginPath();
    ctx.moveTo(random() * 160 - 40, y);
    ctx.bezierCurveTo(170, y + random() * 8 - 4, 340, y + random() * 8 - 4, canvas.width - random() * 120 + 40, y + random() * 6 - 3);
    ctx.stroke();
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

/*
  Contorno de tinta: la copia negra se infla por sus normales. Escalarla
  desde el centro, como las otras escenas, deja un trazo desparejo en una
  silueta con entrantes como esta. Las normales se recalculan sobre los
  vertices unidos, para que no se abra en las esquinas.
*/
function outlined(geometry: BufferGeometry, material: MeshToonMaterial | MeshToonMaterial[], ink: Material) {
  const mesh = new Mesh(geometry, material);
  const bare = geometry.clone();
  bare.deleteAttribute("uv");
  bare.deleteAttribute("normal");
  const hull = mergeVertices(bare, 1e-3);
  hull.computeVertexNormals();
  bare.dispose();
  mesh.add(new Mesh(hull, ink));
  return { mesh, hull };
}

export function createArrowScene({ canvas, reducedMotion, onPierce }: Options): ArrowScene {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const camera = new PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0.6, 9.5);
  camera.lookAt(0, 0, 0);
  scene.add(new AmbientLight(0xffffff, 1.2));
  const sun = new DirectionalLight(0xffffff, 2.4);
  sun.position.set(-4, 6, 8);
  scene.add(sun);

  const ramp = toonRamp();
  const ink = new MeshBasicMaterial({ color: "#060507", side: BackSide });
  ink.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader.replace("#include <begin_vertex>", "vec3 transformed = position + normal * 0.03;");
  };
  const face = toon("#ffffff", ramp);
  const headMap = headTexture();
  headMap.anisotropy = renderer.capabilities.getMaxAnisotropy();
  face.map = headMap;
  const blade = toon("#d9dde2", ramp);
  const gold = toon("#e3b341", ramp);
  const darkGold = toon("#a87a1f", ramp);
  const wood = toon("#ffffff", ramp);
  const woodMap = woodTexture();
  wood.map = woodMap;
  const geometries: BufferGeometry[] = [];
  const materials: Material[] = [ink, face, blade, gold, darkGold, wood];
  const track = <T extends BufferGeometry>(g: T) => {
    geometries.push(g);
    return g;
  };
  const inkedMesh = (geometry: BufferGeometry, material: MeshToonMaterial | MeshToonMaterial[]) => {
    const { mesh, hull } = outlined(track(geometry), material, ink);
    track(hull);
    return mesh;
  };

  // Todo cuelga de `arrow`, que gira sobre su eje largo (X).
  const arrow = new Group();
  const spin = new Group();
  // La punta, un poco mas grande que al natural: es lo que se reconoce.
  const tip = new Group();
  tip.scale.setScalar(1.22);
  tip.position.x = 0.75;
  spin.add(tip);
  arrow.add(spin);
  scene.add(arrow);

  const head = new Shape();
  traceHead(head);
  const spade = new Path();
  traceSpade(spade);
  head.holes.push(spade);
  // Fina, con el canto en bisel: la cara lleva el dibujo y el canto, el plateado.
  const plate = new ExtrudeGeometry(head, { depth: 0.07, bevelEnabled: true, bevelSize: 0.022, bevelThickness: 0.035, bevelSegments: 1, curveSegments: 26 });
  plate.translate(0, 0, -0.035);
  tip.add(inkedMesh(plate, [face, blade]));

  // Cuello: se afina al salir de la punta, dos anillos y el casquillo del asta.
  const profile = [
    [0, 0],
    [0.07, 0],
    [0.09, 0.12],
    [0.1, 0.22],
    [0.17, 0.27],
    [0.185, 0.33],
    [0.17, 0.39],
    [0.115, 0.42],
    [0.115, 0.5],
    [0.17, 0.53],
    [0.185, 0.59],
    [0.17, 0.65],
    [0.12, 0.68],
    [0.125, 0.98],
    [0.15, 1.02],
    [0.15, 1.08],
    [0, 1.08],
  ].map(([r, y]) => new Vector2(r, y));
  const collar = inkedMesh(new LatheGeometry(profile, 20), gold);
  collar.rotation.z = Math.PI / 2;
  // La boca del cuello se mete en la base de la nervadura.
  collar.position.x = tip.position.x - 0.45 * tip.scale.x + 0.02;
  spin.add(collar);
  const bands = inkedMesh(new CylinderGeometry(0.128, 0.128, 0.05, 20), darkGold);
  bands.rotation.z = Math.PI / 2;
  bands.position.x = collar.position.x - 0.46;
  spin.add(bands);

  // El asta: madera lisa, sin plumas, como en la serie.
  const shaftLength = 3.2;
  const shaft = inkedMesh(new CylinderGeometry(0.088, 0.1, shaftLength, 14), wood);
  shaft.rotation.z = Math.PI / 2;
  shaft.position.x = collar.position.x - 1.02 - shaftLength / 2;
  spin.add(shaft);

  // Apunta en diagonal hacia abajo, a la tarjeta de Stand.
  arrow.rotation.z = -0.16;

  // ---- Interaccion ----------------------------------------------------
  let width = 1;
  let height = 1;
  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    // La flecha mide ~8 de largo y ~2.6 de alto: distancia que la deja
    // entera en cuadro, a lo ancho y a lo alto.
    const tan = Math.tan((camera.fov * Math.PI) / 360);
    camera.position.z = Math.max(8.4 / (2 * tan * camera.aspect), 3.3 / (2 * tan)) + 1;
    camera.updateProjectionMatrix();
    dirty = true;
  }
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);

  let spinAngle = 0;
  let spinVelocity = 0;
  let dragging: { x: number; moved: boolean; id: number } | null = null;
  let pierceStart = -1;
  let visible = false;
  let raf = 0;
  let dirty = true;
  let last = performance.now();

  function onDown(event: PointerEvent) {
    dragging = { x: event.clientX, moved: false, id: event.pointerId };
  }
  function onMove(event: PointerEvent) {
    if (!dragging || dragging.id !== event.pointerId) return;
    const dx = event.clientX - dragging.x;
    if (!dragging.moved && Math.abs(dx) > 5) {
      dragging.moved = true;
      canvas.setPointerCapture(event.pointerId);
    }
    if (dragging.moved) {
      spinAngle += (dx / width) * 6;
      spinVelocity = (dx / width) * 6 * 60;
      dragging.x = event.clientX;
      dirty = true;
    }
  }
  function onUp(event: PointerEvent) {
    const wasTap = dragging && !dragging.moved;
    dragging = null;
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    if (wasTap) pierce();
  }
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", () => (dragging = null));

  function pierce() {
    if (pierceStart >= 0) return;
    pierceStart = performance.now();
    onPierce();
    start();
  }

  function tick(now: number) {
    raf = 0;
    if (!visible) return;
    // Tiempo detenido (ZA WARUDO): la flecha tambien se queda quieta.
    if (isTimeStopped()) {
      last = now;
      raf = requestAnimationFrame(tick);
      return;
    }
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    /*
      Giro: lo que le dio el arrastre se va apagando y queda meciendose con
      una cara hacia quien mira. Una punta plana de canto no se reconoce, y
      girando sin parar pasaba la mitad del tiempo asi.
    */
    if (!dragging) {
      spinVelocity *= Math.max(0, 1 - dt * 2.2);
      spinAngle += spinVelocity * dt;
      if (Math.abs(spinVelocity) < 1.2) {
        const facing = Math.round(spinAngle / Math.PI) * Math.PI;
        const sway = reducedMotion ? 0 : Math.sin(now / 1500) * 0.52;
        spinAngle += (facing + sway - spinAngle) * Math.min(1, dt * 2.4);
      }
    }
    spin.rotation.x = spinAngle;

    // Flota; al atravesar se lanza 3 unidades y vuelve.
    let x = 0;
    if (pierceStart >= 0) {
      const t = (now - pierceStart) / 900;
      if (t >= 1) pierceStart = -1;
      else x = t < 0.25 ? -0.8 * Math.sin((t / 0.25) * Math.PI * 0.5) : t < 0.45 ? -0.8 + 4.2 * ((t - 0.25) / 0.2) : 3.4 * (1 - (t - 0.45) / 0.55) ** 2;
    }
    // El lanzamiento sigue la direccion de la flecha.
    arrow.position.x = x * Math.cos(arrow.rotation.z);
    // La punta queda debajo del eje por la inclinacion: se sube para centrarla.
    arrow.position.y = 0.35 + x * Math.sin(arrow.rotation.z) + (reducedMotion ? 0 : Math.sin(now / 900) * 0.12);

    renderer.render(scene, camera);
    dirty = false;
    if (!reducedMotion || pierceStart >= 0 || dragging || Math.abs(spinVelocity) > 0.01 || dirty) {
      raf = requestAnimationFrame(tick);
    }
  }

  function start() {
    if (!raf && visible) {
      last = performance.now();
      raf = requestAnimationFrame(tick);
    }
  }

  resize();
  renderer.render(scene, camera);

  return {
    pierce,
    setVisible(next) {
      visible = next;
      if (next) start();
      else if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    },
    dispose() {
      if (raf) cancelAnimationFrame(raf);
      observer.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      headMap.dispose();
      woodMap.dispose();
      ramp.dispose();
      renderer.dispose();
    },
  };
}
