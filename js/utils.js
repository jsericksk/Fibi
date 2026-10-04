import * as THREE from 'three';

// Shared geometries (unit-sized, scaled per mesh)
export const sphere = new THREE.SphereGeometry(1, 32, 24);
export const cyl = new THREE.CylinderGeometry(1, 1, 1, 32);
export const box = new THREE.BoxGeometry(1, 1, 1);

// Cached standard material per color + options
const materials = {};
export const M = (color, opts = {}) =>
  materials[color + JSON.stringify(opts)] ??= new THREE.MeshStandardMaterial({ color, roughness: 0.6, ...opts });

// Creates a shadow-casting mesh and attaches it to a parent
export function add(parent, geo, mat, pos = [0, 0, 0], scale = [1, 1, 1], rot = [0, 0, 0]) {
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(...pos);
  mesh.scale.set(...scale);
  mesh.rotation.set(...rot);
  mesh.castShadow = true;
  parent.add(mesh);
  return mesh;
}
