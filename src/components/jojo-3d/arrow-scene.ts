import {
  AmbientLight,
  CylinderGeometry,
  DirectionalLight,
  ExtrudeGeometry,
  Group,
  Mesh,
  PerspectiveCamera,
  Scene,
  Shape,
  ShapeGeometry,
  TorusGeometry,
  WebGLRenderer,
  type BufferGeometry,
  type Material,
} from "three";
import { inked, inkMaterial, toon, toonRamp } from "./toon";
import { isTimeStopped } from "@/lib/time-stop";

/**
 * La Flecha: la que despierta los Stands. Punta dorada con el escarabajo
 * en el centro, collar, asta de madera y plumas. Gira sola sobre su eje,
 * se arrastra para girarla y, al tocarla, se lanza hacia adelante (hacia
 * la tarjeta de Stand) y vuelve.
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

/** Largo de la punta, de la base (x = 0) a la punta afilada. */
const BLADE_LEN = 3.3;

/**
 * Silueta de la punta de la Flecha, mirando a +X: una hoja larga de filos
 * curvos que se ensancha hacia atras y termina en dos aletas barridas, con
 * una muesca donde entra el asta. Es la forma de la serie, no una punta de
 * flecha cualquiera.
 */
function bladeShape() {
  const s = new Shape();
  s.moveTo(BLADE_LEN, 0);
  // Filo de arriba: sale de la punta, se abre y cae en la aleta.
  s.quadraticCurveTo(2.3, 0.32, 1.45, 0.76);
  s.quadraticCurveTo(1.0, 0.94, 0.05, 1.12);
  // La aleta vuelve hacia el asta, con una muesca redondeada.
  s.quadraticCurveTo(0.42, 0.68, 0.5, 0.34);
  s.lineTo(0.3, 0.22);
  s.lineTo(0.3, -0.22);
  s.lineTo(0.5, -0.36);
  s.quadraticCurveTo(0.42, -0.68, 0.05, -1.12);
  s.quadraticCurveTo(1.0, -0.94, 1.45, -0.76);
  s.quadraticCurveTo(2.3, -0.32, BLADE_LEN, 0);
  return s;
}

/** Un trazo grabado: elipse rellena (cuerpo del escarabajo, ojos). */
function ellipse(rx: number, ry: number) {
  const s = new Shape();
  s.absellipse(0, 0, rx, ry, 0, Math.PI * 2, false, 0);
  return s;
}

/** Un trazo grabado: tira fina entre dos puntos, con el ancho dado. */
function stroke(x0: number, y0: number, x1: number, y1: number, width: number) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const len = Math.hypot(dx, dy) || 1;
  const nx = (-dy / len) * (width / 2);
  const ny = (dx / len) * (width / 2);
  const s = new Shape();
  s.moveTo(x0 + nx, y0 + ny);
  s.lineTo(x1 + nx, y1 + ny);
  s.lineTo(x1 - nx, y1 - ny);
  s.lineTo(x0 - nx, y0 - ny);
  s.closePath();
  return s;
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
  const ink = inkMaterial();
  const gold = toon("#e3b341", ramp);
  const darkGold = toon("#a87a1f", ramp);
  const wood = toon("#7a5232", ramp);
  const cream = toon("#ece6d8", ramp);
  const geometries: BufferGeometry[] = [];
  const materials: Material[] = [ink, gold, darkGold, wood, cream];
  const track = <T extends BufferGeometry>(g: T) => {
    geometries.push(g);
    return g;
  };

  // Todo cuelga de `arrow`, que gira sobre su eje largo (X).
  const arrow = new Group();
  const spin = new Group();
  // El conjunto se corre para que el centro de la flecha (asta incluida) quede en el origen.
  spin.position.x = 0.45;
  arrow.add(spin);
  scene.add(arrow);

  const darkWood = toon("#4e3220", ramp);
  const red = toon("#b3202e", ramp);
  const engraving = toon("#3b2606", ramp);
  const rib = toon("#c9962a", ramp);

  // La punta: hoja gruesa con bisel, de oro, centrada para que el contorno de tinta quede parejo.
  const depth = 0.2;
  const blade = track(
    new ExtrudeGeometry(bladeShape(), { depth, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, bevelSegments: 2, curveSegments: 14 }),
  );
  blade.translate(-BLADE_LEN / 2, 0, -depth / 2);
  const bladeMesh = inked(blade, gold, ink, 1.03);
  bladeMesh.position.x = BLADE_LEN / 2;
  spin.add(bladeMesh);

  // Grabado, en las dos caras: nervio central y el escarabajo con sus patas y alas.
  for (const side of [1, -1]) {
    const z = side * (depth / 2 + 0.058);
    const face = new Group();
    face.position.z = z;
    if (side < 0) face.rotation.y = Math.PI;
    bladeMesh.add(face);
    const lay = (geometry: BufferGeometry, material: Material, x: number, y: number, lift = 0) => {
      const mesh = new Mesh(track(geometry), material);
      mesh.position.set(x - BLADE_LEN / 2, y, lift);
      face.add(mesh);
      return mesh;
    };
    // Nervio: un rombo largo y fino del cuello a la punta.
    const nerve = new Shape();
    nerve.moveTo(0.35, 0);
    nerve.lineTo(1.1, 0.1);
    nerve.lineTo(3.05, 0);
    nerve.lineTo(1.1, -0.1);
    nerve.closePath();
    lay(new ShapeGeometry(nerve), rib, 0, 0, 0.004);
    // Escarabajo: caparazon, cabeza y la raya del medio.
    lay(new ShapeGeometry(ellipse(0.44, 0.34), 24), engraving, 1.35, 0, 0.008);
    lay(new ShapeGeometry(ellipse(0.17, 0.14), 20), engraving, 1.92, 0, 0.008);
    lay(new ShapeGeometry(stroke(0.98, 0, 1.78, 0, 0.045)), gold, 0, 0, 0.012);
    // Patas: tres por lado, abiertas hacia atras.
    for (const [x, reach] of [
      [1.12, 0.6],
      [1.35, 0.64],
      [1.58, 0.58],
    ] as const) {
      lay(new ShapeGeometry(stroke(x, 0.26, x - 0.24, reach, 0.06)), engraving, 0, 0, 0.008);
      lay(new ShapeGeometry(stroke(x, -0.26, x - 0.24, -reach, 0.06)), engraving, 0, 0, 0.008);
    }
  }

  // Cuello: anillos de oro con el asta saliendo de ellos.
  const neck = track(new CylinderGeometry(0.2, 0.24, 0.5, 18));
  const neckMesh = inked(neck, gold, ink, 1.08);
  neckMesh.rotation.z = Math.PI / 2;
  neckMesh.position.x = 0.05;
  spin.add(neckMesh);
  for (const x of [-0.12, 0.22]) {
    const band = track(new TorusGeometry(0.235, 0.05, 8, 20));
    const bandMesh = inked(band, darkGold, ink, 1.1);
    bandMesh.rotation.y = Math.PI / 2;
    bandMesh.position.x = x;
    spin.add(bandMesh);
  }

  // Asta: madera oscura, con una cuerda roja enrollada junto al cuello.
  const shaft = track(new CylinderGeometry(0.1, 0.1, 3.4, 12));
  const shaftMesh = inked(shaft, darkWood, ink, 1.14);
  shaftMesh.rotation.z = Math.PI / 2;
  shaftMesh.position.x = -1.95;
  spin.add(shaftMesh);
  const wrap = track(new CylinderGeometry(0.125, 0.125, 0.55, 12));
  const wrapMesh = inked(wrap, red, ink, 1.1);
  wrapMesh.rotation.z = Math.PI / 2;
  wrapMesh.position.x = -0.62;
  spin.add(wrapMesh);

  // Plumas: tres paletas alrededor del asta, crema con una franja oscura y la cola en muesca.
  const feather = new Shape();
  feather.moveTo(0.9, 0);
  feather.lineTo(-0.9, 0);
  feather.lineTo(-1.05, 0.5);
  feather.lineTo(-0.75, 0.46);
  feather.lineTo(-0.5, 0.58);
  feather.lineTo(0.5, 0.5);
  feather.closePath();
  const featherGeo = track(new ExtrudeGeometry(feather, { depth: 0.035, bevelEnabled: false }));
  featherGeo.translate(0, 0, -0.0175);
  const stripe = track(new ShapeGeometry(stroke(-0.55, 0.26, 0.45, 0.24, 0.1)));
  for (let i = 0; i < 3; i++) {
    const holder = new Group();
    holder.rotation.x = (i / 3) * Math.PI * 2;
    const mesh = inked(featherGeo, cream, ink, 1.06);
    mesh.position.set(-3.1, 0.05, 0);
    const mark = new Mesh(stripe, darkWood);
    mark.position.z = 0.024;
    mesh.add(mark);
    holder.add(mesh);
    spin.add(holder);
  }

  // Apunta en diagonal hacia abajo, a la tarjeta de Stand.
  arrow.rotation.z = -0.22;

  // ---- Interaccion ----------------------------------------------------
  let width = 1;
  let height = 1;
  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    // La flecha mide ~7.5 de largo y ~2 de alto: distancia que la deja
    // entera en cuadro, a lo ancho y a lo alto.
    const tan = Math.tan((camera.fov * Math.PI) / 360);
    camera.position.z = Math.max(8.4 / (2 * tan * camera.aspect), 3 / (2 * tan)) + 1;
    camera.updateProjectionMatrix();
    dirty = true;
  }
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);

  let spinAngle = 0;
  let spinVelocity = reducedMotion ? 0 : 0.6;
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

    // Giro: inercia que vuelve a la velocidad de reposo.
    if (!dragging) {
      const rest = reducedMotion ? 0 : 0.6;
      spinVelocity += (rest - spinVelocity) * Math.min(1, dt * 1.5);
      spinAngle += spinVelocity * dt;
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
    arrow.position.y = x * Math.sin(arrow.rotation.z) + (reducedMotion ? 0 : Math.sin(now / 900) * 0.15);

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
      ramp.dispose();
      renderer.dispose();
    },
  };
}
