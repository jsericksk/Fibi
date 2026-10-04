import * as THREE from 'three';
import { M, sphere } from './utils.js';
import { buildPine } from './obstacles.js';

const SKY = 0xcdd6ee;
const GROUND_W = 130;
const GROUND_REPEAT_X = 16;
const WRAP = 66; // distance a recycled scenery piece jumps ahead

export const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

export const scene = new THREE.Scene();
scene.background = new THREE.Color(SKY);
scene.fog = new THREE.Fog(SKY, 22, 60);

export const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 200);

// Keeps the view wide enough on any aspect ratio
function resize() {
  const w = innerWidth, h = innerHeight, aspect = w / h;
  renderer.setSize(w, h);
  camera.aspect = aspect;
  const dist = Math.max(10.5, 8.5 / (Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * aspect));
  camera.position.set(3.2, 3.4 + dist * 0.14, dist);
  camera.lookAt(4.2, 1.15, 0);
  camera.updateProjectionMatrix();
}
addEventListener('resize', resize);
resize();

// Lighting
scene.add(new THREE.HemisphereLight(0xffffff, 0xb8c4ea, 1.7));
const sun = new THREE.DirectionalLight(0xfff2e0, 1.2);
sun.position.set(-4, 12, 8);
sun.target.position.set(8, 0, 0);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -16, right: 28, top: 14, bottom: -14, near: 1, far: 40 });
sun.shadow.bias = -0.0005;
scene.add(sun, sun.target);

// Procedural seamless snow texture
function makeSnowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#f2f6ff';
  g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 60; i++) {
    const x = Math.random() * 256, y = Math.random() * 256, r = 8 + Math.random() * 24;
    const grad = g.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, 'rgba(190,205,238,.45)');
    grad.addColorStop(1, 'rgba(190,205,238,0)');
    g.fillStyle = grad;
    // Draw wrapped copies so the tile edges match
    for (const ox of [-256, 0, 256]) for (const oy of [-256, 0, 256]) {
      g.save(); g.translate(ox, oy); g.fillRect(x - r, y - r, r * 2, r * 2); g.restore();
    }
  }
  for (let i = 0; i < 500; i++) {
    g.fillStyle = Math.random() < 0.5 ? '#ffffff' : '#dbe4fa';
    g.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.repeat.set(GROUND_REPEAT_X, 8);
  return tex;
}

const groundTex = makeSnowTexture();
const ground = new THREE.Mesh(new THREE.PlaneGeometry(GROUND_W, 64), new THREE.MeshStandardMaterial({ map: groundTex, roughness: 0.95 }));
ground.rotation.x = -Math.PI / 2;
ground.position.set(18, 0, -14);
ground.receiveShadow = true;
scene.add(ground);

// Background pines and snow mounds, recycled as they scroll past
const scenery = [];
for (let x = -14; x < 50; x += 3.2) {
  const pine = buildPine().g;
  pine.scale.setScalar(0.9 + Math.random() * 1.3);
  pine.position.set(x + Math.random() * 2, 0, -5 - Math.random() * 14);
  scene.add(pine);
  scenery.push(pine);
}
for (let i = 0; i < 26; i++) {
  const mound = new THREE.Mesh(sphere, M(0xf8faff));
  mound.scale.set(0.6 + Math.random(), 0.15 + Math.random() * 0.15, 0.5 + Math.random() * 0.6);
  mound.position.set(-14 + Math.random() * 64, 0, 1.5 + Math.random() * 3 * (Math.random() < 0.5 ? 1 : -2));
  mound.receiveShadow = true;
  scene.add(mound);
  scenery.push(mound);
}

// Falling snow particles
const FLAKES = 700;
const flakeGeo = new THREE.BufferGeometry();
const flakePos = new Float32Array(FLAKES * 3);
for (let i = 0; i < FLAKES; i++) flakePos.set([Math.random() * 40 - 10, Math.random() * 14, Math.random() * 30 - 22], i * 3);
flakeGeo.setAttribute('position', new THREE.BufferAttribute(flakePos, 3));
const flakes = new THREE.Points(flakeGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.12, transparent: true, opacity: 0.9, depthWrite: false }));
flakes.frustumCulled = false;
scene.add(flakes);

// Scrolls ground and scenery left at the given speed (0 when idle) and animates snowfall
export function updateWorld(dt, speed, t) {
  groundTex.offset.x += speed * dt / (GROUND_W / GROUND_REPEAT_X);
  for (const o of scenery) {
    o.position.x -= speed * dt;
    if (o.position.x < -16) o.position.x += WRAP;
  }
  const p = flakeGeo.attributes.position.array;
  for (let i = 0; i < FLAKES; i++) {
    p[i * 3] += (-speed * 0.35 + Math.sin(t + i) * 0.4) * dt;
    p[i * 3 + 1] -= (1.2 + (i % 5) * 0.25) * dt;
    if (p[i * 3 + 1] < 0) p[i * 3 + 1] = 14;
    if (p[i * 3] < -10) p[i * 3] += 40;
    if (p[i * 3] > 30) p[i * 3] -= 40;
  }
  flakeGeo.attributes.position.needsUpdate = true;
}
