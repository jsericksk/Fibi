import * as THREE from 'three';
import { renderer, scene, camera, updateWorld } from './world.js';
import { createFibi, resetFibi, animateFibi } from './fibi.js';
import { spawnObstacles } from './obstacles.js';
import { beep } from './audio.js';

const GRAVITY = 34;
const JUMP_SPEED = 12.5;
const START_SPEED = 9;
const MAX_SPEED = 24;
const HIT_HALF_WIDTH = 0.23; // player half-width used for collisions
const RESTART_DELAY_MS = 500;

const $score = document.getElementById('sc');
const $hi = document.getElementById('hi');
const $msg = document.getElementById('msg');
const pad = n => String(Math.floor(n)).padStart(5, '0');

const fibi = createFibi(scene);

// Game state: 'ready' | 'running' | 'dead'
let state = 'ready';
let speed, score, y, vy, onGround, obstacles, nextGap, runPhase, deadT, deadAt, lastMilestone;
let fastFall = false;
let hi = 0;
try { hi = +localStorage.getItem('fibi-hi') || 0; } catch { /* storage unavailable */ }
$hi.textContent = pad(hi);

function reset() {
  obstacles?.forEach(o => scene.remove(o.g));
  obstacles = [];
  speed = START_SPEED;
  score = 0;
  y = 0;
  vy = 0;
  onGround = true;
  nextGap = 20;
  runPhase = 0;
  deadT = 0;
  lastMilestone = 0;
  resetFibi(fibi);
}
reset();

function showMessage(title, hint) {
  $msg.innerHTML = `<h1>${title}</h1><p>${hint}</p>`;
  $msg.style.display = 'block';
}

function startRun() {
  state = 'running';
  $msg.style.display = 'none';
}

// Single action button: starts, jumps or restarts depending on the state
function onAction() {
  if (state === 'ready') {
    startRun();
  } else if (state === 'dead') {
    if (performance.now() - deadAt < RESTART_DELAY_MS) return;
    reset();
    startRun();
  }
  if (state === 'running' && onGround) {
    vy = JUMP_SPEED;
    onGround = false;
    beep(380, 760, 0.16);
  }
}

addEventListener('keydown', e => {
  if (['Space', 'ArrowUp', 'KeyW'].includes(e.code)) {
    e.preventDefault();
    if (!e.repeat) onAction();
  }
  if (e.code === 'ArrowDown') fastFall = true;
});
addEventListener('keyup', e => { if (e.code === 'ArrowDown') fastFall = false; });
addEventListener('pointerdown', onAction);

function spawn() {
  const created = spawnObstacles(scene, 24, speed > 14);
  obstacles.push(...created);
  nextGap = speed * (0.85 + Math.random() * 0.75) + 5 + (created.length - 1) * 3;
}

function gameOver() {
  state = 'dead';
  deadAt = performance.now();
  deadT = 0;
  beep(300, 60, 0.5, 'sawtooth', 0.08);
  if (score > hi) {
    hi = score;
    $hi.textContent = pad(hi);
    try { localStorage.setItem('fibi-hi', Math.floor(hi)); } catch { /* storage unavailable */ }
  }
  showMessage('Ops! A Fibi bateu', 'Pressione ESPAÇO para tentar de novo');
}

function updateRun(dt) {
  speed = Math.min(MAX_SPEED, speed + dt * 0.25);
  score += speed * dt * 1.5;
  $score.textContent = pad(score);

  // Milestone beep every 200 points
  if (Math.floor(score / 200) > lastMilestone) {
    lastMilestone = Math.floor(score / 200);
    beep(700, 1100, 0.18, 'triangle');
  }

  // Jump physics
  vy -= GRAVITY * (fastFall && !onGround ? 2 : 1) * dt;
  y += vy * dt;
  if (y <= 0) { y = 0; vy = 0; onGround = true; }
  runPhase += speed * dt * 0.75;

  nextGap -= speed * dt;
  if (nextGap <= 0) spawn();

  // Move obstacles toward the player and check collisions
  for (let i = obstacles.length - 1; i >= 0; i--) {
    const o = obstacles[i];
    o.x -= speed * dt;
    o.g.position.x = o.x;
    if (Math.abs(o.x) < o.halfW + HIT_HALF_WIDTH && y < o.h - 0.15) gameOver();
    if (o.x < -14) {
      scene.remove(o.g);
      obstacles.splice(i, 1);
    }
  }
}

const clock = new THREE.Clock();
let t = 0;

function frame() {
  requestAnimationFrame(frame);
  const dt = Math.min(clock.getDelta(), 0.05);
  t += dt;

  if (state === 'running') updateRun(dt);
  if (state === 'dead') deadT += dt;

  updateWorld(dt, state === 'running' ? speed : 0, t);
  animateFibi(fibi, { state, onGround, y, vy, runPhase, deadT }, dt, t);
  renderer.render(scene, camera);
}
frame();
