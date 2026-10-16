// Game state and rules for Ring Pilot. Units are metres and seconds. The
// plane stays at z = 0 and flies along +z; rings, obstacles and clouds are
// stored by track position `s`, so their distance ahead is s - world.dist.
//
//   intent = { x, y, boost }   steering in -1..1 (y up), boost held
//
// No DOM access: the same code runs in Node for testing.

import { clamp, damp, rand } from '../shared/math.js';

export const BOUNDS = { x: 12, yMin: 2, yMax: 18 };
export const VIEW_DIST = 260;
const STEER = 15; // max sideways speed
const FUEL_MAX = 100;
const STAGE_LEN = 1000;

export const forwardSpeed = (dist) => 28 + 26 * (1 - Math.exp(-dist / 5000));

export function createWorld() {
  const w = {};
  resetWorld(w);
  return w;
}

export function resetWorld(w) {
  Object.assign(w, {
    time: 0,
    dist: 0,
    speed: forwardSpeed(0),
    score: 0,
    rings: [],
    obstacles: [],
    clouds: [],
    particles: [],
    texts: [],
    passed: 0,
    missed: 0,
    combo: 0,
    bestCombo: 0,
    fuel: FUEL_MAX,
    lives: 3,
    invuln: 0,
    stage: 1,
    banner: { title: 'Stage 1', sub: 'Fly through the rings to refuel', t: 0, life: 2.6 },
    nextRing: 70,
    nextObstacle: 120,
    nextCloud: 0,
    ringPath: { x: 0, y: 9 },
    ringCount: 0,
    dying: 0,
    over: false,
    shake: 0,
    flash: 0,
    reason: '',
  });
  w.plane = { x: 0, y: 9, vx: 0, vy: 0, bank: 0, pitch: 0, alive: true, crash: 0, boost: false };
  for (let s = 0; s < VIEW_DIST; s += 18) spawnCloud(w, s);
}

const progress = (w) => clamp(w.dist / 6000, 0, 1);

// ---------- spawning ----------

function spawnRing(w) {
  const p = progress(w);
  // Each ring is reachable from the last: the offset is limited by how far
  // the plane can steer in the time between them.
  const gap = 58 - p * 12;
  const reach = (STEER * gap) / w.speed * 0.62;
  const path = w.ringPath;
  path.x = clamp(path.x + rand(-reach, reach), -BOUNDS.x + 3, BOUNDS.x - 3);
  path.y = clamp(path.y + rand(-reach, reach) * 0.7, BOUNDS.yMin + 2.5, BOUNDS.yMax - 2.5);
  w.ringCount += 1;
  const gold = w.ringCount % 6 === 0;
  w.rings.push({ s: w.nextRing, x: path.x, y: path.y, r: (gold ? 2.6 : 3.3) - p * 0.95, gold, state: 'ahead', fx: 0 });
  w.nextRing += gap;
}

function spawnObstacle(w) {
  const p = progress(w);
  const nearPath = Math.random() < 0.35 + p * 0.35;
  const x = nearPath ? clamp(w.ringPath.x + rand(-4, 4), -BOUNDS.x, BOUNDS.x) : rand(-BOUNDS.x, BOUNDS.x);
  const y = nearPath ? clamp(w.ringPath.y + rand(-3, 3), BOUNDS.yMin, BOUNDS.yMax) : rand(BOUNDS.yMin, BOUNDS.yMax);
  // Keep obstacles out of the hole of a nearby ring.
  const clash = w.rings.some((r) => Math.abs(r.s - w.nextObstacle) < 10 && Math.hypot(r.x - x, r.y - y) < r.r + 1.6);
  if (!clash) {
    const type = Math.random() < 0.55 ? 'balloon' : 'mine';
    w.obstacles.push({ s: w.nextObstacle, x, y, type, r: type === 'balloon' ? 1.5 : 1.15, bob: Math.random() * 6, hit: false });
  }
  w.nextObstacle += rand(26, 48) * (1 - p * 0.5);
}

function spawnCloud(w, s) {
  const side = Math.random();
  // Most clouds sit outside the flying corridor; a few drift through it.
  const inside = side < 0.25;
  const x = inside ? rand(-BOUNDS.x, BOUNDS.x) : (Math.random() < 0.5 ? -1 : 1) * rand(16, 60);
  w.clouds.push({ s, x, y: inside ? rand(4, 16) : rand(-2, 30), size: rand(5, 11), seed: Math.random() });
  w.nextCloud = s + rand(10, 22);
}

// ---------- effects ----------

function burst(w, x, y, z, color, n, speed = 8, life = 0.7, size = 0.25) {
  for (let i = 0; i < n; i += 1) {
    const a = Math.random() * Math.PI * 2;
    const b = Math.random() * Math.PI;
    w.particles.push({
      x,
      y,
      z,
      vx: Math.cos(a) * Math.sin(b) * speed,
      vy: Math.cos(b) * speed,
      vz: Math.sin(a) * Math.sin(b) * speed,
      life,
      max: life,
      color,
      size: size * (0.6 + Math.random() * 0.8),
    });
  }
}

function text(w, msg, color) {
  w.texts.push({ msg, color, t: 0, life: 1.1 });
}

function hit(w, o) {
  const pl = w.plane;
  o.hit = true;
  w.lives -= 1;
  w.combo = 0;
  w.invuln = 1.6;
  w.shake = 0.8;
  w.flash = 0.2;
  burst(w, o.x, o.y, o.s - w.dist, o.type === 'balloon' ? '#ff6b7a' : '#ffb347', 24, 10, 0.8, 0.35);
  burst(w, pl.x, pl.y, 0, 'rgba(90,90,100,0.8)', 10, 4, 1.1, 0.6);
  text(w, w.lives > 0 ? `${w.lives} ${w.lives === 1 ? 'life' : 'lives'} left` : 'Down!', '#ff8a96');
  if (w.lives <= 0) crash(w, 'Shot down by a ' + (o.type === 'balloon' ? 'balloon' : 'storm mine'));
}

function crash(w, reason) {
  if (!w.plane.alive) return;
  w.plane.alive = false;
  w.dying = 1.6;
  w.reason = reason;
  w.shake = 1;
  burst(w, w.plane.x, w.plane.y, 0, '#ffd166', 30, 12, 1, 0.4);
}

// ---------- update ----------

export function updateWorld(w, intent, rawDt) {
  const pl = w.plane;
  const dt = w.dying > 0 ? rawDt * 0.4 : rawDt;
  w.time += dt;
  w.shake = damp(w.shake, 0, 6, rawDt);
  w.flash = Math.max(0, w.flash - rawDt);
  w.invuln = Math.max(0, w.invuln - dt);
  if (w.banner) {
    w.banner.t += rawDt;
    if (w.banner.t > w.banner.life) w.banner = null;
  }
  for (const t of w.texts) t.t += rawDt;
  w.texts = w.texts.filter((t) => t.t < t.life);

  if (w.dying > 0) {
    w.dying -= rawDt;
    if (w.dying <= 0) w.over = true;
  }

  if (pl.alive) {
    pl.boost = intent.boost && w.fuel > 5;
    const fwd = w.speed * (pl.boost ? 1.45 : 1);
    w.speed = forwardSpeed(w.dist);
    w.dist += fwd * dt;
    w.score += fwd * dt * 0.5;

    // Steering with a little inertia; the plane banks into turns.
    pl.vx = damp(pl.vx, clamp(intent.x, -1, 1) * STEER, 5, dt);
    pl.vy = damp(pl.vy, clamp(intent.y, -1, 1) * STEER * 0.8, 5, dt);
    pl.x += pl.vx * dt;
    pl.y += pl.vy * dt;
    if (pl.x < -BOUNDS.x || pl.x > BOUNDS.x) {
      pl.x = clamp(pl.x, -BOUNDS.x, BOUNDS.x);
      pl.vx *= -0.3;
    }
    if (pl.y < BOUNDS.yMin || pl.y > BOUNDS.yMax) {
      pl.y = clamp(pl.y, BOUNDS.yMin, BOUNDS.yMax);
      pl.vy *= -0.3;
    }
    pl.bank = damp(pl.bank, -pl.vx / STEER * 0.65, 8, dt);
    pl.pitch = damp(pl.pitch, pl.vy / STEER, 8, dt);

    // Fuel
    w.fuel -= (4 + progress(w) * 2.5 + (pl.boost ? 7 : 0)) * dt;
    if (w.fuel <= 0) {
      w.fuel = 0;
      crash(w, 'Ran out of fuel');
    }

    // Stages
    const stage = 1 + Math.floor(w.dist / STAGE_LEN);
    if (stage > w.stage) {
      w.stage = stage;
      w.score += 250;
      w.banner = { title: `Stage ${stage}`, sub: 'Faster, smaller rings', t: 0, life: 2.2 };
    }
  } else {
    pl.crash += rawDt;
    pl.y = Math.max(0.5, pl.y - 6 * dt);
    w.dist += w.speed * 0.5 * dt;
  }

  // Spawning
  while (w.nextRing < w.dist + VIEW_DIST) spawnRing(w);
  while (w.nextObstacle < w.dist + VIEW_DIST) spawnObstacle(w);
  while (w.nextCloud < w.dist + VIEW_DIST) spawnCloud(w, w.nextCloud);

  // Rings: judged when they reach the plane.
  for (const r of w.rings) {
    r.fx = Math.max(0, r.fx - dt);
    if (r.state !== 'ahead' || r.s > w.dist || !pl.alive) continue;
    const d = Math.hypot(pl.x - r.x, pl.y - r.y);
    if (d < r.r - 0.35) {
      r.state = 'passed';
      r.fx = 0.5;
      w.passed += 1;
      w.combo += 1;
      w.bestCombo = Math.max(w.bestCombo, w.combo);
      const pts = Math.round((r.gold ? 300 : 100) * Math.min(5, 1 + (w.combo - 1) * 0.25));
      w.score += pts;
      w.fuel = Math.min(FUEL_MAX, w.fuel + (r.gold ? 30 : 15));
      text(w, `+${pts}${w.combo > 2 ? `  ×${w.combo}` : ''}`, r.gold ? '#ffd166' : '#ffffff');
      burst(w, r.x, r.y, 0.5, r.gold ? '#ffd166' : '#fff2b0', 14, 6, 0.5, 0.18);
    } else {
      r.state = 'missed';
      w.missed += 1;
      w.combo = 0;
      text(w, 'Missed', 'rgba(255,255,255,0.7)');
    }
  }
  // Obstacles: collide when they pass the plane.
  for (const o of w.obstacles) {
    o.bob += dt;
    const z = o.s - w.dist;
    if (o.hit || !pl.alive || w.invuln > 0 || z > 1.2 || z < -1.2) continue;
    const oy = o.y + Math.sin(o.bob * 1.4) * 0.4;
    if (Math.hypot(pl.x - o.x, (pl.y - oy) * 1.4) < o.r + 1.4) hit(w, o);
  }

  w.rings = w.rings.filter((r) => r.s > w.dist - 15);
  w.obstacles = w.obstacles.filter((o) => o.s > w.dist - 15);
  w.clouds = w.clouds.filter((c) => c.s > w.dist - 20);

  for (const q of w.particles) {
    q.life -= dt;
    q.x += q.vx * dt;
    q.y += q.vy * dt;
    q.z += q.vz * dt - w.speed * dt * 0.6;
  }
  w.particles = w.particles.filter((q) => q.life > 0);
  if (pl.boost && pl.alive) {
    for (const side of [-1, 1]) {
      w.particles.push({ x: pl.x + side * 3.6, y: pl.y + 0.1, z: -0.5, vx: 0, vy: 0, vz: -w.speed * 0.4, life: 0.35, max: 0.35, color: 'rgba(255,255,255,0.6)', size: 0.18 });
    }
  }
}
