import * as THREE from 'three';
import { M, add, sphere, cyl } from './utils.js';

const BLACK = 0x25222e;

// Each builder returns { g: Group, halfW, h } where halfW/h are collision extents
const builders = {
  snowman() {
    const g = new THREE.Group();
    add(g, sphere, M(0xffffff), [0, 0.38, 0], [0.42, 0.38, 0.42]);
    add(g, sphere, M(0xffffff), [0, 0.92, 0], [0.31, 0.29, 0.31]);
    add(g, sphere, M(0xffffff), [0, 1.35, 0], [0.24, 0.23, 0.24]);
    add(g, new THREE.ConeGeometry(0.04, 0.22, 8), M(0xff8a2a), [0.07, 1.35, 0.26], [1, 1, 1], [Math.PI / 2, 0, 0.3]); // carrot nose
    for (const s of [-1, 1]) add(g, sphere, M(BLACK), [s * 0.09, 1.42, 0.2], [0.03, 0.03, 0.03]); // eyes
    add(g, cyl, M(0xd04a5a), [0, 1.17, 0], [0.26, 0.05, 0.26]); // scarf
    return { g, halfW: 0.38, h: 1.5 };
  },

  crystal() {
    const g = new THREE.Group();
    const mat = M(0x8fd8ff, { roughness: 0.15, metalness: 0.1, transparent: true, opacity: 0.9, emissive: 0x2a6a9a, emissiveIntensity: 0.35 });
    const n = 2 + (Math.random() * 2 | 0);
    for (let i = 0; i < n; i++) {
      const h = 0.8 + Math.random() * 0.9;
      add(g, new THREE.ConeGeometry(0.22 + Math.random() * 0.1, h, 5), mat,
        [(i - (n - 1) / 2) * 0.32, h / 2, (Math.random() - 0.5) * 0.2], [1, 1, 1],
        [0, Math.random() * 3, (Math.random() - 0.5) * 0.3]);
    }
    return { g, halfW: n * 0.15 + 0.1, h: 1.5 };
  },

  rock() {
    const g = new THREE.Group();
    add(g, new THREE.DodecahedronGeometry(0.55, 0), M(0x8d93a8), [0, 0.3, 0], [1.1, 0.75, 0.9], [0.3, 0.6, 0]);
    add(g, sphere, M(0xffffff), [0, 0.55, 0], [0.55, 0.16, 0.45]); // snow cap
    add(g, new THREE.DodecahedronGeometry(0.3, 0), M(0x8d93a8), [0.6, 0.15, 0.2], [1, 0.7, 1]);
    return { g, halfW: 0.7, h: 0.8 };
  },

  pine() {
    const g = new THREE.Group();
    add(g, cyl, M(0x6b4a3a), [0, 0.15, 0], [0.1, 0.3, 0.1]);
    for (const [r, y] of [[0.7, 0.95], [0.5, 1.4], [0.32, 1.8]]) {
      add(g, new THREE.ConeGeometry(r, 0.8, 10), M(0x3f7a6a), [0, y - 0.1, 0]);
      add(g, new THREE.ConeGeometry(r * 0.7, 0.4, 10), M(0xffffff), [0, y + 0.18, 0]); // snow layer
    }
    return { g, halfW: 0.4, h: 1.6 };
  },
};

// Pines are used as background decoration only, not as obstacles
const OBSTACLE_KINDS = ['snowman', 'crystal', 'rock', 'pine'];

export const buildPine = () => builders.pine();

// Spawns one obstacle or a small cluster; returns the created obstacles
export function spawnObstacles(scene, x, allowGroup) {
  const kind = OBSTACLE_KINDS[Math.random() * OBSTACLE_KINDS.length | 0];
  const count = allowGroup && Math.random() < 0.28 ? 2 : 1;
  const scale = kind === 'pine' ? 0.8 : 1;
  const created = [];
  for (let i = 0; i < count; i++) {
    const o = builders[kind]();
    o.g.scale.setScalar(scale);
    o.halfW *= scale;
    o.h *= scale;
    o.x = x;
    o.g.position.set(x, 0, 0);
    scene.add(o.g);
    created.push(o);
    x += o.halfW * 2 + 0.15;
  }
  return created;
}
