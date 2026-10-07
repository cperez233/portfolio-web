import {
  AmbientLight,
  DirectionalLight,
  ExtrudeGeometry,
  Group,
  PerspectiveCamera,
  Scene,
  Shape,
  WebGLRenderer,
} from "three";
import { inked, inkMaterial, toon, toonRamp } from "./toon";

/**
 * ゴゴゴ en 3D: el "menacing" de JoJo hecho de bloques gruesos dorados con
 * contorno de tinta. Cada ゴ es una コ (corchete abierto a la izquierda)
 * mas su dakuten (las dos rayitas), extruidos. Tiemblan a destiempo,
 * siguen un poco al puntero y, al tocarlos, laten (ドン).
 */

export interface MenacingScene {
  pulse: () => void;
  setVisible: (visible: boolean) => void;
  dispose: () => void;
}

/** コ: corchete abierto a la izquierda, centrado en su origen. */
function koShape() {
  const s = new Shape();
  s.moveTo(-0.52, 0.56);
  s.lineTo(0.52, 0.56);
  s.lineTo(0.52, -0.6);
  s.lineTo(-0.56, -0.6);
  s.lineTo(-0.56, -0.33);
  s.lineTo(0.24, -0.33);
  s.lineTo(0.24, 0.29);
  s.lineTo(-0.52, 0.29);
  s.closePath();
  return s;
}

/** Una rayita del dakuten (゛), inclinada, centrada en su origen. */
function tickShape() {
  const s = new Shape();
  s.moveTo(-0.02, 0.2);
  s.lineTo(0.13, 0.2);
  s.lineTo(0.06, -0.2);
  s.lineTo(-0.09, -0.2);
  s.closePath();
  return s;
}

/*
  Columna en zigzag como el ゴゴゴ del manga. Profundidades alternas: con
  todas en el mismo plano, dos ゴ vecinas se atravesaban al temblar.
*/
const GLYPHS = [
  { x: -0.55, y: 2.55, z: 0, size: 0.8, rot: -0.2, phase: 0 },
  { x: 0.5, y: 0.9, z: -0.7, size: 0.95, rot: -0.1, phase: 1.3 },
  { x: -0.45, y: -0.8, z: 0, size: 1.1, rot: -0.26, phase: 2.1 },
  { x: 0.55, y: -2.6, z: -0.7, size: 0.9, rot: -0.14, phase: 3.4 },
];

export function createMenacingScene({
  canvas,
  reducedMotion,
}: {
  canvas: HTMLCanvasElement;
  reducedMotion: boolean;
}): MenacingScene {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  const scene = new Scene();
  const camera = new PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, 11);
  scene.add(new AmbientLight(0xffffff, 1.2));
  const sun = new DirectionalLight(0xffffff, 2.4);
  sun.position.set(-5, 6, 8);
  scene.add(sun);

  const ramp = toonRamp();
  const ink = inkMaterial();
  const gold = toon("#e3b341", ramp);
  const extrude = { depth: 0.34, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 1 };
  // Cada pieza con su propia geometria centrada: el contorno de tinta se
  // escala desde el centro de la pieza y queda pegado a ella. Con todo en
  // una sola geometria las rayitas quedaban con el contorno corrido.
  const koGeo = new ExtrudeGeometry(koShape(), extrude);
  koGeo.center();
  const tickGeo = new ExtrudeGeometry(tickShape(), extrude);
  tickGeo.center();

  function makeGo() {
    const group = new Group();
    group.add(inked(koGeo, gold, ink, 1.05));
    for (const x of [0.6, 0.92]) {
      const tick = inked(tickGeo, gold, ink, 1.18);
      tick.position.set(x, 0.62, 0);
      group.add(tick);
    }
    return group;
  }

  const root = new Group();
  scene.add(root);
  const glyphs = GLYPHS.map((g) => {
    const mesh = makeGo();
    mesh.position.set(g.x, g.y, g.z);
    mesh.scale.setScalar(g.size);
    mesh.rotation.z = g.rot;
    root.add(mesh);
    return { mesh, ...g };
  });

  let width = 1;
  let height = 1;
  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    const tan = Math.tan((camera.fov * Math.PI) / 360);
    // Columna de ~3 x 7 unidades.
    camera.position.z = Math.max(7.2 / (2 * tan), 3.2 / (2 * tan * camera.aspect)) + 0.8;
    camera.updateProjectionMatrix();
  }
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);

  let pointerX = 0;
  let pointerY = 0;
  function onPointer(event: PointerEvent) {
    pointerX = (event.clientX / window.innerWidth) * 2 - 1;
    pointerY = (event.clientY / window.innerHeight) * 2 - 1;
  }
  window.addEventListener("pointermove", onPointer, { passive: true });

  let pulseAt = -Infinity;
  function pulse() {
    pulseAt = performance.now();
    start();
  }
  canvas.addEventListener("pointerdown", pulse);

  let visible = false;
  let raf = 0;
  let tiltX = 0;
  let tiltY = 0;

  function tick(now: number) {
    raf = 0;
    if (!visible) return;
    tiltY += (pointerX * 0.5 - tiltY) * 0.06;
    tiltX += (pointerY * 0.3 - tiltX) * 0.06;
    root.rotation.y = reducedMotion ? -0.35 : -0.35 + tiltY;
    root.rotation.x = reducedMotion ? 0.1 : 0.1 + tiltX;

    const sincePulse = (now - pulseAt) / 600;
    for (const g of glyphs) {
      // Temblor: dos senos rapidos a destiempo, como el ゴ del manga.
      const shake = reducedMotion ? 0 : Math.sin(now / 70 + g.phase * 5) * Math.sin(now / 900 + g.phase);
      g.mesh.rotation.z = g.rot + shake * 0.05;
      g.mesh.position.x = g.x + shake * 0.03;
      const beat = sincePulse >= 0 && sincePulse < 1 ? Math.sin(Math.min(1, sincePulse + g.phase * 0.05) * Math.PI) * 0.35 : 0;
      g.mesh.scale.setScalar(g.size * (1 + beat));
    }
    renderer.render(scene, camera);
    if (!reducedMotion || sincePulse < 1) raf = requestAnimationFrame(tick);
  }

  function start() {
    if (!raf && visible) raf = requestAnimationFrame(tick);
  }

  resize();

  return {
    pulse,
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
      window.removeEventListener("pointermove", onPointer);
      canvas.removeEventListener("pointerdown", pulse);
      koGeo.dispose();
      tickGeo.dispose();
      gold.dispose();
      ink.dispose();
      ramp.dispose();
      renderer.dispose();
    },
  };
}
