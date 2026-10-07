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

function goShape() {
  // コ: borde exterior y hueco abierto hacia la izquierda.
  const s = new Shape();
  s.moveTo(0, 0);
  s.lineTo(1.05, 0);
  s.lineTo(1.05, -1.15);
  s.lineTo(0, -1.15);
  s.lineTo(0, -0.88);
  s.lineTo(0.76, -0.88);
  s.lineTo(0.76, -0.27);
  s.lineTo(0, -0.27);
  s.closePath();
  return s;
}

function dakuten(x: number) {
  const s = new Shape();
  s.moveTo(x, 0.42);
  s.lineTo(x + 0.14, 0.42);
  s.lineTo(x + 0.26, 0.08);
  s.lineTo(x + 0.12, 0.08);
  s.closePath();
  return s;
}

const GLYPHS = [
  { x: -0.9, y: 1.6, size: 0.85, rot: -0.22, phase: 0 },
  { x: 0.55, y: 0.55, size: 1.05, rot: -0.12, phase: 1.3 },
  { x: -0.55, y: -0.75, size: 1.25, rot: -0.28, phase: 2.1 },
  { x: 0.7, y: -2.05, size: 0.95, rot: -0.16, phase: 3.4 },
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
  const geometry = new ExtrudeGeometry([goShape(), dakuten(0.92), dakuten(1.22)], {
    depth: 0.38,
    bevelEnabled: true,
    bevelSize: 0.04,
    bevelThickness: 0.04,
    bevelSegments: 1,
  });
  geometry.center();

  const root = new Group();
  scene.add(root);
  const glyphs = GLYPHS.map((g) => {
    const mesh = inked(geometry, gold, ink, 1.07);
    mesh.position.set(g.x, g.y, 0);
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
    // Columna de ~3.2 x 5.6 unidades.
    camera.position.z = Math.max(5.8 / (2 * tan), 3.4 / (2 * tan * camera.aspect)) + 0.6;
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
      g.mesh.rotation.z = g.rot + shake * 0.06;
      g.mesh.position.x = g.x + shake * 0.04;
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
      geometry.dispose();
      gold.dispose();
      ink.dispose();
      ramp.dispose();
      renderer.dispose();
    },
  };
}
