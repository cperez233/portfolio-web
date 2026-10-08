import {
  AmbientLight,
  CylinderGeometry,
  DirectionalLight,
  ExtrudeGeometry,
  Group,
  PerspectiveCamera,
  Scene,
  Shape,
  SphereGeometry,
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

/** Silueta de la punta, mirando a +X: hoja con dos muescas laterales. */
function bladeShape() {
  const s = new Shape();
  s.moveTo(2.5, 0);
  s.lineTo(1.1, 0.62);
  s.lineTo(0.85, 0.42);
  s.lineTo(0.35, 0.82);
  s.lineTo(0.05, 0.28);
  s.lineTo(0.05, -0.28);
  s.lineTo(0.35, -0.82);
  s.lineTo(0.85, -0.42);
  s.lineTo(1.1, -0.62);
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
  // La punta, un poco mas grande que al natural: es lo que se reconoce.
  const tip = new Group();
  tip.scale.setScalar(1.35);
  spin.add(tip);
  arrow.add(spin);
  scene.add(arrow);

  const blade = track(new ExtrudeGeometry(bladeShape(), { depth: 0.16, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, bevelSegments: 1 }));
  blade.center();
  const bladeMesh = inked(blade, gold, ink, 1.05);
  bladeMesh.position.x = 1.25;
  tip.add(bladeMesh);

  // Escarabajo del centro.
  const beetle = track(new SphereGeometry(0.3, 16, 12));
  const beetleMesh = inked(beetle, darkGold, ink, 1.1);
  beetleMesh.scale.set(1.25, 0.85, 0.55);
  beetleMesh.position.set(0.95, 0, 0.12);
  tip.add(beetleMesh);
  const head = track(new SphereGeometry(0.13, 12, 10));
  const headMesh = inked(head, darkGold, ink, 1.15);
  headMesh.position.set(1.38, 0, 0.12);
  tip.add(headMesh);

  // Collar y asta.
  const collar = track(new CylinderGeometry(0.2, 0.2, 0.35, 16));
  const collarMesh = inked(collar, gold, ink, 1.08);
  collarMesh.rotation.z = Math.PI / 2;
  collarMesh.position.x = -0.1;
  tip.add(collarMesh);
  const shaft = track(new CylinderGeometry(0.1, 0.1, 3.4, 12));
  const shaftMesh = inked(shaft, wood, ink, 1.12);
  shaftMesh.rotation.z = Math.PI / 2;
  shaftMesh.position.x = -1.85;
  spin.add(shaftMesh);

  // Plumas: tres hojas finas alrededor del asta.
  const feather = new Shape();
  feather.moveTo(0, 0);
  feather.lineTo(1.1, 0);
  feather.lineTo(0.75, 0.42);
  feather.lineTo(-0.15, 0.42);
  feather.closePath();
  const featherGeo = track(new ExtrudeGeometry(feather, { depth: 0.03, bevelEnabled: false }));
  featherGeo.center();
  for (let i = 0; i < 3; i++) {
    const holder = new Group();
    holder.rotation.x = (i / 3) * Math.PI * 2;
    const mesh = inked(featherGeo, cream, ink, 1.08);
    mesh.position.set(-3.3, 0.3, 0);
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
    camera.position.z = Math.max(8 / (2 * tan * camera.aspect), 2.4 / (2 * tan)) + 1;
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
