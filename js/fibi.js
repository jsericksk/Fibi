import * as THREE from 'three';
import { M, add, sphere, cyl, box } from './utils.js';

const COLORS = { skin: 0xffe3d2, hair: 0xf6e7ae, white: 0xfbfbff, black: 0x25222e, purple: 0x7b5fd0, blue: 0x2f9be0, pink: 0xffa9b4 };
const FACE_ANGLE = 0.95; // 3/4 view so the face stays visible while running right
const HAT_TILT = -0.12;

// Builds the character from primitives. Y = 0 is the sole of the feet, front faces +Z
function buildModel() {
  const root = new THREE.Group();   // world position / fall rotation
  const model = new THREE.Group();  // 3/4 view rotation and squash
  model.rotation.y = FACE_ANGLE;
  root.add(model);

  // Legs: striped socks + shoes, pivoting at the hips
  const legs = [];
  for (const s of [-1, 1]) {
    const leg = new THREE.Group();
    leg.position.set(s * 0.17, 0.52, 0);
    [-0.07, -0.19, -0.31].forEach((y, i) => add(leg, cyl, M(i % 2 ? COLORS.white : COLORS.black), [0, y, 0], [0.1, 0.06, 0.1]));
    add(leg, sphere, M(COLORS.black), [0, -0.44, 0.07], [0.13, 0.08, 0.2]);
    model.add(leg);
    legs.push(leg);
  }

  // Body: white coat with black trim and blue tie
  const body = new THREE.Group();
  model.add(body);
  add(body, new THREE.CylinderGeometry(0.27, 0.4, 0.5, 32), M(COLORS.white), [0, 0.78, 0]);
  add(body, new THREE.CylinderGeometry(0.405, 0.41, 0.07, 32), M(COLORS.black), [0, 0.54, 0]);
  add(body, box, M(COLORS.black), [0.2, 0.8, 0.22], [0.05, 0.4, 0.08], [0, 0.4, -0.2]);
  add(body, new THREE.ConeGeometry(0.1, 0.5, 4), M(COLORS.blue), [0, 0.8, 0.31], [1, 1, 0.25], [Math.PI, 0, 0]);
  add(body, box, M(COLORS.blue), [0, 1.02, 0.28], [0.18, 0.1, 0.06]);
  add(body, new THREE.TorusGeometry(0.27, 0.05, 12, 32), M(COLORS.black), [0, 1.02, 0], [1, 1, 1], [Math.PI / 2, 0, 0]);

  // Arms: white sleeves with black gloves, pivoting at the shoulders
  const arms = [];
  for (const s of [-1, 1]) {
    const arm = new THREE.Group();
    arm.position.set(s * 0.33, 1.0, 0);
    add(arm, new THREE.CylinderGeometry(0.1, 0.15, 0.5, 20), M(COLORS.white), [0, -0.25, 0]);
    add(arm, cyl, M(COLORS.black), [0, -0.38, 0], [0.153, 0.025, 0.153]);
    add(arm, sphere, M(COLORS.black), [0, -0.58, 0], [0.14, 0.14, 0.14]);
    body.add(arm);
    arms.push(arm);
  }

  // Head with big purple eyes
  const head = new THREE.Group();
  head.position.y = 1.5;
  model.add(head);
  add(head, sphere, M(COLORS.skin), [0, 0, 0], [0.62, 0.56, 0.58]);
  for (const s of [-1, 1]) {
    const eye = new THREE.Group();
    eye.position.set(s * 0.24, -0.04, 0.5);
    eye.rotation.y = s * 0.35;
    head.add(eye);
    add(eye, sphere, M(0x5a3fb5), [0, 0, 0], [0.17, 0.2, 0.06]);
    add(eye, sphere, M(0x9a84f0), [0, -0.04, 0.03], [0.13, 0.14, 0.04]);
    add(eye, sphere, M(0x1b1530), [0, 0.01, 0.045], [0.07, 0.08, 0.03]);
    add(eye, sphere, M(0xffffff, { emissive: 0xffffff, emissiveIntensity: 0.6 }), [-0.04, 0.07, 0.07], [0.05, 0.05, 0.02]);
    add(eye, sphere, M(0xffffff), [0.05, -0.07, 0.07], [0.025, 0.025, 0.015]);
    add(eye, sphere, M(COLORS.black), [0, 0.13, 0.02], [0.2, 0.06, 0.05]); // upper eyelid
    add(head, box, M(0x4a3a30), [s * 0.26, 0.21, 0.5], [0.15, 0.035, 0.03], [0, s * 0.35, s * -0.15]); // eyebrow
    add(head, sphere, M(COLORS.pink, { transparent: true, opacity: 0.7 }), [s * 0.35, -0.2, 0.44], [0.1, 0.06, 0.03], [0, s * 0.6, 0]); // blush
  }
  add(head, sphere, M(0xb24a5a), [0, -0.24, 0.55], [0.045, 0.03, 0.02]); // mouth

  // Hair: top cap + bangs, back hair and side locks
  const hair = new THREE.Group();
  head.add(hair);
  add(hair, new THREE.SphereGeometry(1, 32, 24, 0, Math.PI * 2, 0, 1.15), M(COLORS.hair), [0, 0.02, 0], [0.655, 0.6, 0.62]);
  for (let i = -3; i <= 3; i++) {
    const a = i * 0.2;
    add(hair, sphere, M(COLORS.hair), [Math.sin(a) * 0.6, 0.2, Math.cos(a) * 0.54], [0.1, 0.16, 0.07], [0, a, 0]);
  }
  const hairBack = new THREE.Group();
  hairBack.position.set(0, 0.35, -0.1);
  hair.add(hairBack);
  add(hairBack, new THREE.CylinderGeometry(0.6, 0.5, 0.62, 32), M(COLORS.hair), [0, -0.36, -0.1]);
  add(hairBack, sphere, M(COLORS.hair), [0, -0.67, -0.1], [0.5, 0.15, 0.48]);
  add(hairBack, sphere, M(COLORS.hair), [0, 0, 0], [0.66, 0.62, 0.66]);
  for (const s of [-1, 1]) {
    add(hair, new THREE.CapsuleGeometry(0.14, 0.4, 8, 16), M(COLORS.hair), [s * 0.58, -0.32, 0.1], [1, 1, 1], [0, 0, s * -0.08]);
  }

  // Blue X hairclip and black ribbon
  const clip = new THREE.Group();
  clip.position.set(0.5, 0.35, 0.38);
  clip.rotation.y = 0.9;
  head.add(clip);
  add(clip, box, M(COLORS.blue), [0, 0, 0], [0.18, 0.06, 0.03], [0, 0, 0.8]);
  add(clip, box, M(0x1f6fb0), [0, 0, 0.01], [0.18, 0.06, 0.03], [0, 0, -0.8]);
  add(head, sphere, M(COLORS.black), [-0.6, 0.38, 0.2], [0.09, 0.12, 0.07]);

  // Wide-brim white hat with black band and purple trim
  const hat = new THREE.Group();
  hat.position.set(0, 0.5, -0.02);
  hat.rotation.x = HAT_TILT;
  hat.scale.setScalar(1.05);
  head.add(hat);
  add(hat, cyl, M(COLORS.white), [0, 0, 0], [1.2, 0.04, 1.2]);
  add(hat, new THREE.TorusGeometry(1.2, 0.04, 10, 48), M(COLORS.black), [0, 0, 0], [1, 1, 1], [Math.PI / 2, 0, 0]);
  add(hat, new THREE.TorusGeometry(0.95, 0.035, 10, 48), M(COLORS.purple), [0, 0.04, 0], [1, 1, 1], [Math.PI / 2, 0, 0]);
  add(hat, new THREE.SphereGeometry(1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), M(COLORS.white), [0, 0.02, 0], [0.56, 0.5, 0.56]);
  add(hat, cyl, M(COLORS.black), [0, 0.1, 0], [0.565, 0.07, 0.565]);
  add(hat, cyl, M(COLORS.purple), [0, 0.03, 0], [0.57, 0.03, 0.57]);

  return { root, model, legs, arms, head, hairBack, hat };
}

// Creates the character plus a blob shadow and adds both to the scene
export function createFibi(scene) {
  const fibi = buildModel();
  fibi.root.scale.setScalar(1.25);
  scene.add(fibi.root);

  fibi.blob = new THREE.Mesh(
    new THREE.CircleGeometry(0.55, 24),
    new THREE.MeshBasicMaterial({ color: 0x5b5f8a, transparent: true, opacity: 0.25, depthWrite: false })
  );
  fibi.blob.rotation.x = -Math.PI / 2;
  fibi.blob.position.y = 0.01;
  scene.add(fibi.blob);
  return fibi;
}

export function resetFibi(fibi) {
  fibi.root.rotation.z = 0;
  fibi.root.position.set(0, 0, 0);
  fibi.model.rotation.y = FACE_ANGLE;
  fibi.hat.position.y = 0.5;
}

const ease = (a, b, k, dt) => a + (b - a) * Math.min(1, k * dt);
const clamp = THREE.MathUtils.clamp;

// Poses the character for the current state: 'ready' | 'running' | 'dead'
export function animateFibi(f, { state, onGround, y, vy, runPhase, deadT }, dt, t) {
  const r = f.root;
  const [lA, rA] = f.arms;
  const [lL, rL] = f.legs;

  r.position.y = y;
  f.blob.scale.setScalar(Math.max(0.35, 1 - y * 0.25));

  if (state === 'dead') {
    // Tip over backwards, arms flung up, hat pops off the head
    r.rotation.z = ease(r.rotation.z, 1.45, 8, dt);
    r.position.y = Math.max(0, y) + 0.1;
    lA.rotation.z = ease(lA.rotation.z, 2.6, 10, dt);
    rA.rotation.z = ease(rA.rotation.z, -2.6, 10, dt);
    f.hat.position.y = 0.5 + Math.min(0.2, deadT);
  } else if (!onGround) {
    // Jump pose: arms up, legs tucked, hair and hat follow vertical speed
    lA.rotation.z = ease(lA.rotation.z, 2.5, 14, dt);
    rA.rotation.z = ease(rA.rotation.z, -2.5, 14, dt);
    lL.rotation.x = ease(lL.rotation.x, -0.7, 14, dt);
    rL.rotation.x = ease(rL.rotation.x, 0.5, 14, dt);
    f.hairBack.rotation.x = ease(f.hairBack.rotation.x, clamp(vy * 0.02, -0.3, 0.3), 10, dt);
    f.hat.rotation.x = HAT_TILT + clamp(vy * 0.012, -0.2, 0.2);
    f.model.scale.set(0.95, 1.06, 0.95);
  } else if (state === 'running') {
    // Run cycle: swinging legs and arms, small bounce
    const s = Math.sin(runPhase * 2);
    lL.rotation.x = s * 0.95;
    rL.rotation.x = -s * 0.95;
    lA.rotation.z = ease(lA.rotation.z, 1.35 + s * 0.25, 20, dt);
    rA.rotation.z = ease(rA.rotation.z, -(1.35 - s * 0.25), 20, dt);
    r.position.y = Math.abs(s) * 0.1;
    f.hairBack.rotation.x = Math.sin(runPhase * 2 + 1) * 0.1 + 0.05;
    f.hat.rotation.x = HAT_TILT + Math.sin(runPhase * 2) * 0.03;
    f.model.scale.set(1, 1 - Math.abs(s) * 0.03, 1);
  } else {
    // Idle on the title screen: gentle breathing and head turn
    const b = Math.sin(t * 3);
    lL.rotation.x = rL.rotation.x = 0;
    lA.rotation.z = ease(lA.rotation.z, 1.3 + b * 0.15, 8, dt);
    rA.rotation.z = ease(rA.rotation.z, -(1.3 + b * 0.15), 8, dt);
    f.hairBack.rotation.x = 0;
    f.hat.rotation.x = HAT_TILT;
    f.model.scale.set(1, 1 + b * 0.015, 1);
    f.model.rotation.y = FACE_ANGLE + Math.sin(t * 1.2) * 0.12;
  }
}
