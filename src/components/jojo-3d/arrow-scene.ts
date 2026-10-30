import {
  AmbientLight,
  ConeGeometry,
  CylinderGeometry,
  DirectionalLight,
  ExtrudeGeometry,
  Group,
  Mesh,
  PerspectiveCamera,
  RingGeometry,
  Scene,
  Shape,
  ShapeGeometry,
  SphereGeometry,
  TorusGeometry,
  Vector3,
  WebGLRenderer,
  type BufferGeometry,
  type Material,
} from "three";
import { inked, inkMaterial, toon, toonRamp } from "./toon";
import { isTimeStopped } from "@/lib/time-stop";

/**
 * La Flecha: la que despierta los Stands (la "flecha del escarabajo" de la
 * serie). Una placa ancha en forma de ancla, de cara amarilla con borde de
 * acero, con una muesca en arco por donde entra el cuello dorado; sobre
 * ella, un escarabajo en relieve con un cuerno largo hacia la punta y aros
 * verdes grabados. Asta de madera con dos anillos de oro. Gira sola sobre
 * su eje, se arrastra para girarla y, al tocarla, se lanza hacia adelante
 * (hacia la tarjeta de Stand) y vuelve, sin salirse nunca del lienzo.
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

/** Donde acaba la punta de la placa (x = 0 es la linea de los cuernos). */
const TIP = 2.7;
/** Centro de la placa a lo largo del eje, para que el contorno de tinta quede parejo. */
const MID = 1.2;

/**
 * La placa, mirando su punta a +X: dos cuernos hacia atras, los lados
 * rectos hasta la punta y una muesca en arco (de herradura) en el medio.
 */
function plateShape() {
  const s = new Shape();
  s.moveTo(TIP, 0);
  s.quadraticCurveTo(1.5, 0.98, -0.1, 1.36);
  // El cuerno vuelve hacia el asta y se mete en el arco.
  s.lineTo(0.3, 0.92);
  s.lineTo(0.34, 0.62);
  s.bezierCurveTo(0.68, 0.62, 0.96, 0.34, 0.96, 0);
  s.bezierCurveTo(0.96, -0.34, 0.68, -0.62, 0.34, -0.62);
  s.lineTo(0.3, -0.92);
  s.lineTo(-0.1, -1.36);
  s.quadraticCurveTo(1.5, -0.98, TIP, 0);
  return s;
}

/** El cuello: un pilar plano y dorado que baja del asta, se ensancha y se hunde en el arco. */
function neckShape() {
  const s = new Shape();
  s.moveTo(-0.95, 0.13);
  s.lineTo(-0.5, 0.16);
  s.lineTo(-0.22, 0.26);
  s.lineTo(0.3, 0.17);
  s.lineTo(0.8, 0.1);
  s.lineTo(1.1, 0.07);
  s.lineTo(1.1, -0.07);
  s.lineTo(0.8, -0.1);
  s.lineTo(0.3, -0.17);
  s.lineTo(-0.22, -0.26);
  s.lineTo(-0.5, -0.16);
  s.lineTo(-0.95, -0.13);
  s.closePath();
  return s;
}

/** Un cilindro fino de `a` a `b` (las patas del escarabajo). */
function limb(a: Vector3, b: Vector3, radius: number) {
  const dir = b.clone().sub(a);
  const geometry = new CylinderGeometry(radius, radius, dir.length(), 8);
  const mesh = new Mesh(geometry);
  mesh.position.copy(a).add(b).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), dir.normalize());
  return mesh;
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
  const geometries: BufferGeometry[] = [];
  const materials: Material[] = [ink];
  const track = <T extends BufferGeometry>(g: T) => {
    geometries.push(g);
    return g;
  };

  // Todo cuelga de `arrow`, que gira sobre su eje largo (X).
  const arrow = new Group();
  const spin = new Group();
  // El conjunto se corre para que el centro de la flecha (asta incluida) quede en el origen.
  spin.position.x = 0.8;
  arrow.add(spin);
  scene.add(arrow);

  const yellow = toon("#f0d868", ramp);
  const steel = toon("#aab1bb", ramp);
  const green = toon("#4c7d2b", ramp);
  const brass = toon("#d6a22c", ramp);
  const brassDark = toon("#9a6c14", ramp);
  const redEye = toon("#d2222d", ramp);
  const darkWood = toon("#5a3624", ramp);
  const mats = [yellow, steel, green, brass, brassDark, redEye, darkWood];
  materials.push(...mats);

  /** Pone una pieza dentro del grupo que se gira con la flecha; las geometrias se liberan al salir. */
  const add = (parent: Group, geometry: BufferGeometry, material: Material, x = 0, y = 0, z = 0) => {
    const mesh = new Mesh(track(geometry), material);
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
  };

  // La placa: acero por el borde (grueso, con bisel y contorno de tinta) y la cara amarilla un poco metida.
  const thick = 0.16;
  const plate = track(
    new ExtrudeGeometry(plateShape(), { depth: thick, bevelEnabled: true, bevelSize: 0.035, bevelThickness: 0.035, bevelSegments: 2, curveSegments: 16 }),
  );
  plate.translate(-MID, 0, -thick / 2);
  const plateMesh = inked(plate, steel, ink, 1.03);
  plateMesh.position.x = MID;
  spin.add(plateMesh);

  /*
    Las dos caras llevan lo mismo: la de atras es la de adelante girada media
    vuelta sobre el eje largo, y asi la flecha se ve igual de bien al girar.
  */
  for (const side of [1, -1]) {
    const face = new Group();
    face.position.z = side * (thick / 2 + 0.041);
    if (side < 0) face.rotation.x = Math.PI;
    spin.add(face);

    // Cara amarilla: la misma silueta, un poco mas chica, para que quede el borde de acero.
    const skin = new ShapeGeometry(plateShape(), 18);
    skin.translate(-MID, 0, 0);
    skin.scale(0.93, 0.92, 1);
    skin.translate(MID, 0, 0);
    add(face, skin, yellow, 0, 0, 0);

    // Aros verdes grabados: una cadena de circulos por cada borde, de mas grande a mas chico hacia la punta.
    for (const k of [1, -1]) {
      for (const [x, y, r] of [
        [0.7, 0.86, 0.16],
        [1.1, 0.7, 0.15],
        [1.5, 0.54, 0.13],
        [1.9, 0.36, 0.1],
      ] as const) {
        add(face, new RingGeometry(r - 0.024, r + 0.024, 28), green, x, k * y, 0.004);
      }
    }

    // Escarabajo: segmentos del cuerpo (el contorno de tinta marca las uniones), cabeza con ojo rojo y cuerno.
    const body = new Group();
    face.add(body);
    const segs: [number, number, number, number][] = [
      [1.1, 0.3, 0.27, 0.15],
      [1.44, 0.34, 0.32, 0.19],
      [1.76, 0.3, 0.29, 0.19],
      [2.04, 0.24, 0.23, 0.17],
    ];
    for (const [x, rx, ry, rz] of segs) {
      const seg = inked(track(new SphereGeometry(1, 20, 14)), brass, ink, 1.12);
      seg.scale.set(rx, ry, rz);
      seg.position.set(x, 0, rz * 0.8);
      body.add(seg);
    }
    const head = inked(track(new SphereGeometry(1, 16, 12)), brass, ink, 1.1);
    head.scale.set(0.18, 0.16, 0.15);
    head.position.set(2.3, 0, 0.14);
    body.add(head);
    add(body, new SphereGeometry(0.055, 10, 8), redEye, 2.38, 0.09, 0.27);
    add(body, new SphereGeometry(0.055, 10, 8), redEye, 2.38, -0.09, 0.27);
    // Cuerno: largo, hacia la punta, un poco levantado.
    const horn = inked(track(new ConeGeometry(0.08, 0.85, 10)), brassDark, ink, 1.12);
    horn.rotation.z = -Math.PI / 2;
    horn.position.set(2.72, 0, 0.1);
    body.add(horn);
    // Patas: tres por lado, abiertas hacia el borde y dobladas hacia atras.
    for (const k of [1, -1]) {
      for (const x of [1.3, 1.64, 1.94]) {
        const knee = new Vector3(x + 0.1, k * 0.58, 0.06);
        const foot = new Vector3(x - 0.22, k * 0.92, 0.01);
        for (const [from, to] of [
          [new Vector3(x, k * 0.26, 0.08), knee],
          [knee, foot],
        ] as const) {
          const leg = limb(from, to, 0.03);
          leg.material = brassDark;
          track(leg.geometry);
          body.add(leg);
        }
      }
    }
  }

  // El cuello atraviesa la placa por el arco; mas grueso que ella, para que sobresalga en relieve.
  const neckDepth = 0.3;
  const neck = track(new ExtrudeGeometry(neckShape(), { depth: neckDepth, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 1 }));
  neck.translate(0, 0, -neckDepth / 2);
  spin.add(inked(neck, brass, ink, 1.06));

  // Dos anillos de oro donde el cuello se junta con el asta.
  for (const x of [-1.02, -1.26]) {
    const band = track(new TorusGeometry(0.2, 0.06, 10, 24));
    const bandMesh = inked(band, brass, ink, 1.1);
    bandMesh.rotation.y = Math.PI / 2;
    bandMesh.position.x = x;
    spin.add(bandMesh);
  }

  // Asta: madera oscura y larga, un poco mas fina hacia la cola.
  const shaft = track(new CylinderGeometry(0.1, 0.13, 3.3, 14));
  const shaftMesh = inked(shaft, darkWood, ink, 1.12);
  shaftMesh.rotation.z = Math.PI / 2;
  shaftMesh.position.x = -2.95;
  spin.add(shaftMesh);

  // Apunta en diagonal hacia abajo, a la tarjeta de Stand.
  arrow.rotation.z = -0.14;

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
    camera.position.z = Math.max(9.4 / (2 * tan * camera.aspect), 3.9 / (2 * tan)) + 1;
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

    // Flota; al atravesar se lanza 2 unidades y vuelve (sin salirse del lienzo: ver resize).
    let x = 0;
    if (pierceStart >= 0) {
      const t = (now - pierceStart) / 900;
      if (t >= 1) pierceStart = -1;
      else x = t < 0.25 ? -0.6 * Math.sin((t / 0.25) * Math.PI * 0.5) : t < 0.45 ? -0.6 + 2.6 * ((t - 0.25) / 0.2) : 2 * (1 - (t - 0.45) / 0.55) ** 2;
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
