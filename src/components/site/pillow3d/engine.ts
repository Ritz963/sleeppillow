import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

/**
 * Interactive 3D SleepPillow, built procedurally (no model download).
 *
 * The pillow is a parametric surface over (u, v) ∈ [-1, 1]²: puffed in the middle, pinched along the
 * edges, with a piped seam. Feature anchors are points on that surface given in (u, v); every frame we
 * project them to screen space and report how much each one faces the camera, so the HTML callouts can
 * track the pillow while it spins.
 */

export type AnchorFrame = { x: number; y: number; visibility: number };

export type FrameInfo = {
  anchors: AnchorFrame[];
  width: number;
  height: number;
  /** Seconds since the viewer started; drives the callout sway. */
  time: number;
  /** True when the visitor prefers reduced motion. */
  reduced: boolean;
};

export type PillowViewerOptions = {
  /** Points on the front face, in surface coordinates (u, v) ∈ [-1, 1]². */
  anchors: [number, number][];
  onFrame: (frame: FrameInfo) => void;
  /** Called once, the first time the user drags or uses the keyboard. */
  onInteract?: () => void;
};

export type PillowViewer = { dispose: () => void };

// ---------- Shape ----------

const HALF_W = 1.25; // half width
const HALF_H = 0.86; // half height
const LOFT = 0.6; // half thickness at the centre
const SEGMENTS = 80;

/** Point on the pillow surface. `side` is 1 for the front face, -1 for the back. */
function surfacePoint(u: number, v: number, side: 1 | -1, out = new THREE.Vector3()) {
  const s = (1 - u * u) * (1 - v * v); // 1 in the centre, 0 on the seam
  // Edges bow inward between the corners, like a stuffed pillow.
  const x = HALF_W * u * (1 - 0.07 * (1 - v * v));
  const y = HALF_H * v * (1 - 0.1 * (1 - u * u));
  // Soft folds that radiate from the seam and fade out toward the middle.
  const fold = 0.016 * Math.sin(Math.atan2(v, u) * 18) * Math.pow(1 - s, 5) * Math.pow(s, 0.3);
  const z = side * (LOFT * Math.pow(s, 0.72) + fold);
  return out.set(x, y, z);
}

/** Spacing that clusters vertices near the seam, where the surface curves most. */
const spread = (t: number) => Math.sin((Math.PI / 2) * t);

function buildPillowGeometry() {
  const n = SEGMENTS;
  const perFace = (n + 1) * (n + 1);
  const positions = new Float32Array(perFace * 2 * 3);
  const uvs = new Float32Array(perFace * 2 * 2);
  const indices: number[] = [];
  const p = new THREE.Vector3();

  ([1, -1] as const).forEach((side, f) => {
    const base = f * perFace;
    for (let j = 0; j <= n; j++) {
      for (let i = 0; i <= n; i++) {
        const u = spread(-1 + (2 * i) / n);
        const v = spread(-1 + (2 * j) / n);
        surfacePoint(u, v, side, p);
        const k = base + j * (n + 1) + i;
        positions.set([p.x, p.y, p.z], k * 3);
        uvs.set([(u + 1) / 2, (v + 1) / 2], k * 2);
      }
    }
    for (let j = 0; j < n; j++) {
      for (let i = 0; i < n; i++) {
        const a = base + j * (n + 1) + i;
        const b = a + 1;
        const c = a + n + 2;
        const d = a + n + 1;
        if (side === 1) indices.push(a, b, c, a, c, d);
        else indices.push(a, c, b, a, d, c);
      }
    }
  });

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

function buildSeamGeometry() {
  const pts: THREE.Vector3[] = [];
  const steps = 60;
  const edge = (u: number, v: number) => pts.push(surfacePoint(u, v, 1));
  for (let i = 0; i < steps; i++) edge(-1 + (2 * i) / steps, -1);
  for (let i = 0; i < steps; i++) edge(1, -1 + (2 * i) / steps);
  for (let i = 0; i < steps; i++) edge(1 - (2 * i) / steps, 1);
  for (let i = 0; i < steps; i++) edge(-1, 1 - (2 * i) / steps);
  const curve = new THREE.CatmullRomCurve3(pts, true, "centripetal");
  return new THREE.TubeGeometry(curve, 480, 0.026, 10, true);
}

/** Fine noise used as a bump map, so the surface reads as woven fabric up close. */
function fabricTexture() {
  const size = 128;
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const weave = (Math.sin(x * 1.6) + Math.sin(y * 1.6)) * 18;
      const v = Math.max(0, Math.min(255, 128 + weave + (Math.random() - 0.5) * 50));
      data.set([v, v, v, 255], (y * size + x) * 4);
    }
  }
  const tex = new THREE.DataTexture(data, size, size);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(10, 7);
  tex.needsUpdate = true;
  return tex;
}

function shadowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(40, 30, 140, 0.55)");
  g.addColorStop(0.5, "rgba(58, 44, 242, 0.18)");
  g.addColorStop(1, "rgba(58, 44, 242, 0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(canvas);
}

// ---------- Motion ----------

const BASE_PITCH = -0.28; // face tipped up a little toward the camera
const BASE_YAW = -0.75;
const BASE_ROLL = 0.1;
const TAU = Math.PI * 2;
const RETURN_DELAY = 2.4; // seconds after the last interaction before easing back to the front
const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));
const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
/** Frame-rate independent easing factor. */
const ease = (rate: number, dt: number) => 1 - Math.exp(-rate * dt);

export function createPillowViewer(host: HTMLElement, options: PillowViewerOptions): PillowViewer {
  // Throws when WebGL is unavailable; the caller falls back to the static image.
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.92;
  const canvas = renderer.domElement;
  canvas.style.display = "block";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  host.appendChild(canvas);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTarget = pmrem.fromScene(new RoomEnvironment(), 0.04);
  scene.environment = envTarget.texture;
  scene.environmentIntensity = 0.22;

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  camera.position.set(0, 1.0, 6.0);
  camera.lookAt(0, -0.08, 0);

  // Lavender sky above, cool floor bounce below, a warm-white key and an iris rim.
  // A low-ish key from the upper left rakes across the dome so the puff shades.
  scene.add(new THREE.HemisphereLight(0xf3f1ff, 0x6f64cf, 0.35));
  const key = new THREE.DirectionalLight(0xfffdf8, 3);
  key.position.set(-3.2, 3.6, 2.4);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xc9c3ff, 0.45);
  fill.position.set(3.5, -0.5, 3);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0x8f82ff, 1.6);
  rim.position.set(3, 2.5, -3.5);
  scene.add(rim);

  const bump = fabricTexture();
  const fabric = new THREE.MeshPhysicalMaterial({
    color: 0xf1effb,
    roughness: 0.9,
    sheen: 1,
    sheenRoughness: 0.55,
    sheenColor: new THREE.Color(0xd7d1f6),
    bumpMap: bump,
    bumpScale: 0.08,
  });
  const piping = new THREE.MeshPhysicalMaterial({ color: 0xe7e3fb, roughness: 0.6, sheen: 0.6, sheenColor: new THREE.Color(0xb9b0ee) });

  const pillowGeo = buildPillowGeometry();
  const seamGeo = buildSeamGeometry();

  // Nesting: float (bob) → yaw (turntable spin about the vertical) → pitch (tipped back) → roll → mesh.
  const float = new THREE.Group();
  const yawGroup = new THREE.Group();
  const pitchGroup = new THREE.Group();
  const rollGroup = new THREE.Group();
  rollGroup.add(new THREE.Mesh(pillowGeo, fabric), new THREE.Mesh(seamGeo, piping));
  pitchGroup.add(rollGroup);
  yawGroup.add(pitchGroup);
  float.add(yawGroup);
  scene.add(float);

  const shadowTex = shadowTexture();
  const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false });
  const shadowGeo = new THREE.PlaneGeometry(3.4, 1.1);
  const shadow = new THREE.Mesh(shadowGeo, shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -1.32;
  scene.add(shadow);

  // Anchor points and their surface normals, in the pillow's local space.
  const anchors = options.anchors.map(([u, v]) => {
    const e = 1e-3;
    const point = surfacePoint(u, v, 1);
    const du = surfacePoint(u + e, v, 1).sub(surfacePoint(u - e, v, 1));
    const dv = surfacePoint(u, v + e, 1).sub(surfacePoint(u, v - e, 1));
    return { point, normal: du.cross(dv).normalize() };
  });

  // ---------- State ----------
  const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let reduced = reducedQuery.matches;
  const onReducedChange = () => (reduced = reducedQuery.matches);
  reducedQuery.addEventListener("change", onReducedChange);

  let width = 1;
  let height = 1;
  let yaw = 0; // user spin, on top of the idle sway
  let yawVel = 0;
  let pitch = 0;
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  let lastMoveAt = 0;
  let lastInteractAt = -Infinity;
  let interacted = false;
  let elapsed = 0;
  let prevStamp = 0;
  let raf = 0;
  let onScreen = true;

  const nowSec = () => performance.now() / 1000;
  const markInteraction = () => {
    lastInteractAt = nowSec();
    if (!interacted) {
      interacted = true;
      options.onInteract?.();
    }
  };

  // ---------- Input ----------
  const onPointerDown = (e: PointerEvent) => {
    if (e.button !== 0) return;
    dragging = true;
    yawVel = 0;
    lastX = e.clientX;
    lastY = e.clientY;
    lastMoveAt = e.timeStamp;
    host.setPointerCapture(e.pointerId);
    host.dataset.dragging = "";
    markInteraction();
  };
  const onPointerMove = (e: PointerEvent) => {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    const dt = Math.max((e.timeStamp - lastMoveAt) / 1000, 1 / 240);
    lastX = e.clientX;
    lastY = e.clientY;
    lastMoveAt = e.timeStamp;
    const dYaw = dx * 0.0095;
    yaw += dYaw;
    // Smoothed velocity so a flick carries on spinning after release.
    yawVel = yawVel * 0.6 + (dYaw / dt) * 0.4;
    // Touch keeps vertical scrolling (touch-action: pan-y), so only mouse and pen tilt.
    if (e.pointerType !== "touch") pitch = clamp(pitch + dy * 0.006, -0.55, 0.55);
    lastInteractAt = nowSec();
  };
  const endDrag = (e: PointerEvent) => {
    if (!dragging) return;
    dragging = false;
    delete host.dataset.dragging;
    if (host.hasPointerCapture(e.pointerId)) host.releasePointerCapture(e.pointerId);
    // A drag that paused before release should not fling.
    if (e.timeStamp - lastMoveAt > 80 || reduced) yawVel = 0;
    yawVel = clamp(yawVel, -14, 14);
    lastInteractAt = nowSec();
  };
  const onKeyDown = (e: KeyboardEvent) => {
    const step = e.shiftKey ? 0.6 : 0.3;
    if (e.key === "ArrowLeft") yaw -= step;
    else if (e.key === "ArrowRight") yaw += step;
    else if (e.key === "ArrowUp") pitch = clamp(pitch - 0.15, -0.55, 0.55);
    else if (e.key === "ArrowDown") pitch = clamp(pitch + 0.15, -0.55, 0.55);
    else return;
    e.preventDefault();
    yawVel = 0;
    markInteraction();
  };
  host.addEventListener("pointerdown", onPointerDown);
  host.addEventListener("pointermove", onPointerMove);
  host.addEventListener("pointerup", endDrag);
  host.addEventListener("pointercancel", endDrag);
  host.addEventListener("keydown", onKeyDown);

  // ---------- Layout ----------
  const resize = () => {
    width = Math.max(1, host.clientWidth);
    height = Math.max(1, host.clientHeight);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  resize();

  // ---------- Frame ----------
  const world = new THREE.Vector3();
  const normal = new THREE.Vector3();
  const toCamera = new THREE.Vector3();
  const anchorFrames: AnchorFrame[] = anchors.map(() => ({ x: 0, y: 0, visibility: 0 }));

  const frame = (stamp: number) => {
    raf = 0;
    const dt = prevStamp ? Math.min((stamp - prevStamp) / 1000, 0.05) : 0;
    prevStamp = stamp;
    elapsed += dt;
    const t = elapsed;
    const idle = reduced ? 0 : 1;

    if (!dragging) {
      yaw += yawVel * dt;
      yawVel *= Math.exp(-dt * 2.6);
      // After a pause, glide back to face the front (the nearest full turn, so it never unwinds).
      if (!reduced && nowSec() - lastInteractAt > RETURN_DELAY && Math.abs(yawVel) < 0.4) {
        const target = Math.round(yaw / TAU) * TAU;
        yaw += (target - yaw) * ease(1.6, dt);
        pitch += (0 - pitch) * ease(1.6, dt);
      }
    }

    float.position.y = idle * 0.07 * Math.sin(t * 0.8);
    pitchGroup.rotation.x = BASE_PITCH + pitch + idle * 0.035 * Math.sin(t * 0.5 + 1);
    yawGroup.rotation.y = BASE_YAW + yaw + idle * 0.22 * Math.sin(t * 0.32);
    rollGroup.rotation.z = BASE_ROLL + idle * 0.04 * Math.sin(t * 0.6 + 2);

    // The shadow tightens and darkens as the pillow sinks toward it.
    const lift = float.position.y / 0.07; // -1 … 1
    shadow.scale.setScalar(1 - lift * 0.06);
    shadowMat.opacity = 0.75 - lift * 0.12;

    float.updateMatrixWorld(true);
    const m = rollGroup.matrixWorld;
    anchors.forEach((a, i) => {
      world.copy(a.point).applyMatrix4(m);
      normal.copy(a.normal).transformDirection(m);
      toCamera.copy(camera.position).sub(world).normalize();
      const facing = normal.dot(toCamera);
      world.project(camera);
      const out = anchorFrames[i];
      out.x = ((world.x + 1) / 2) * width;
      out.y = ((1 - world.y) / 2) * height;
      out.visibility = smoothstep(0.05, 0.35, facing);
    });

    renderer.render(scene, camera);
    options.onFrame({ anchors: anchorFrames, width, height, time: t, reduced });
    schedule();
  };

  const schedule = () => {
    if (!raf && onScreen) raf = requestAnimationFrame(frame);
  };

  // Stop rendering while the hero is scrolled out of view.
  const visibilityObserver = new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    if (onScreen) {
      prevStamp = 0;
      schedule();
    } else if (raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  });
  visibilityObserver.observe(host);
  schedule();

  return {
    dispose() {
      if (raf) cancelAnimationFrame(raf);
      visibilityObserver.disconnect();
      resizeObserver.disconnect();
      reducedQuery.removeEventListener("change", onReducedChange);
      host.removeEventListener("pointerdown", onPointerDown);
      host.removeEventListener("pointermove", onPointerMove);
      host.removeEventListener("pointerup", endDrag);
      host.removeEventListener("pointercancel", endDrag);
      host.removeEventListener("keydown", onKeyDown);
      pillowGeo.dispose();
      seamGeo.dispose();
      shadowGeo.dispose();
      fabric.dispose();
      piping.dispose();
      shadowMat.dispose();
      bump.dispose();
      shadowTex.dispose();
      envTarget.dispose();
      pmrem.dispose();
      renderer.dispose();
      canvas.remove();
    },
  };
}
