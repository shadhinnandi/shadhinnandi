// Game state and rules for Skyline Run. Units are metres and seconds.
// The track runs along +z; the runner stays at z = 0 and the world moves
// towards it. Objects are stored by track position `s` (metres from the
// start), so their distance ahead is s - world.dist.
//
//   intent = { left, right, jump, slide }   one-shot presses for this step
//
// No DOM access: the same code runs in Node for testing.

import { clamp, damp, rand } from '../shared/math.js';

export const LANE_W = 2.2;
export const VIEW_DIST = 120;
const GRAVITY = 28;
const JUMP_V = 9.4;
const SLIDE_TIME = 0.72;

/*
  Obstacles
    barrier  knee-high hurdle: jump it (or change lane)
    beam     bar at head height: slide under it (or change lane)
    block    stack of crates: change lane
    long     parked container, 10 m long: change lane
*/
export const OBSTACLES = {
  barrier: { len: 0.6, top: 1.0, bottom: 0 },
  beam: { len: 0.6, top: 2.3, bottom: 1.15 },
  block: { len: 2.2, top: 2.6, bottom: 0 },
  long: { len: 10, top: 2.8, bottom: 0 },
};

export const speedAt = (dist) => 13 + 17 * (1 - Math.exp(-dist / 1500));

export function createWorld() {
  const w = { obstacles: [], coins: [], particles: [] };
  resetWorld(w);
  return w;
}

export function resetWorld(w) {
  Object.assign(w, {
    time: 0,
    dist: 0,
    speed: speedAt(0),
    topSpeed: 0,
    coins: [],
    obstacles: [],
    particles: [],
    collected: 0,
    nextRow: 75, // a few seconds of free running to start
    dying: 0,
    over: false,
    shake: 0,
    flash: 0,
    bump: 0,
  });
  w.player = { lane: 0, x: 0, y: 0, vy: 0, slide: 0, alive: true, stride: 0, tilt: 0, fastFall: false, crash: 0 };
}

export const score = (w) => Math.floor(w.dist) + w.collected * 10;

// ---------- generation ----------

function addCoins(w, lane, s, count, arcOver = null) {
  for (let i = 0; i < count; i += 1) {
    const cs = s + i * 2.4;
    let y = 0.9;
    if (arcOver !== null) {
      const t = (cs - arcOver) / 5;
      if (Math.abs(t) < 1) y = 0.9 + 1.3 * (1 - t * t);
    }
    w.coins.push({ lane, s: cs, y, spin: Math.random() * 6, taken: false });
  }
}

/** Places the next row of obstacles, always leaving a way through. */
function spawnRow(w) {
  const s = w.nextRow;
  const progress = clamp(w.dist / 2500, 0, 1);
  const lanes = [-1, 0, 1].sort(() => Math.random() - 0.5);
  const blocked = Math.random() < 0.35 + progress * 0.35 ? 2 : 1;
  const used = new Set();
  for (let i = 0; i < blocked; i += 1) {
    const lane = lanes[i];
    const r = Math.random();
    let type;
    if (blocked === 2 && i === 1 && Math.random() < 0.5) type = Math.random() < 0.5 ? 'barrier' : 'beam';
    else type = r < 0.28 ? 'barrier' : r < 0.52 ? 'beam' : r < 0.8 ? 'block' : 'long';
    w.obstacles.push({ type, lane, s, hit: false });
    used.add(lane);
    if (type === 'barrier' && Math.random() < 0.6) addCoins(w, lane, s - 4.8, 5, s);
  }
  // Coins in a free lane
  const free = lanes.filter((l) => !used.has(l));
  if (free.length && Math.random() < 0.75) addCoins(w, free[Math.floor(Math.random() * free.length)], s - 6 + rand(-2, 6), Math.floor(rand(4, 8)));
  // Gap to the next row: enough reaction time at the current speed.
  const gap = Math.max(16, w.speed * rand(1.05, 1.55) - progress * 6);
  const lastLong = [...used].some((l) => w.obstacles.some((o) => o.s === s && o.lane === l && o.type === 'long'));
  w.nextRow = s + gap + (lastLong ? 10 : 0);
}

// ---------- effects ----------

export function puff(w, x, y, z, color, n, speed = 3, life = 0.5, size = 0.12) {
  for (let i = 0; i < n; i += 1) {
    const a = Math.random() * Math.PI * 2;
    w.particles.push({
      x,
      y,
      z,
      vx: Math.cos(a) * speed * Math.random(),
      vy: Math.random() * speed,
      vz: Math.sin(a) * speed * Math.random() - 2,
      life,
      max: life,
      color,
      size: size * (0.6 + Math.random() * 0.8),
    });
  }
}

// ---------- update ----------

function obstacleHit(p, o) {
  const def = OBSTACLES[o.type];
  const head = p.y + (p.slide > 0 ? 0.85 : 1.75);
  const feet = p.y;
  return feet < def.top - 0.08 && head > def.bottom + 0.05;
}

export function updateWorld(w, intent, rawDt) {
  const p = w.player;
  const dt = w.dying > 0 ? rawDt * 0.35 : rawDt;
  w.time += dt;
  w.shake = damp(w.shake, 0, 8, rawDt);
  w.flash = Math.max(0, w.flash - rawDt);
  w.bump = Math.max(0, w.bump - rawDt);

  if (w.dying > 0) {
    w.dying -= rawDt;
    if (w.dying <= 0) w.over = true;
  }

  if (p.alive) {
    // Input
    if (intent.left && p.lane > -1) p.lane -= 1;
    if (intent.right && p.lane < 1) p.lane += 1;
    const grounded = p.y <= 0.0001;
    if (intent.jump) {
      if (grounded) {
        p.vy = JUMP_V;
        p.slide = 0;
        p.fastFall = false;
      }
    }
    if (intent.slide) {
      if (grounded) p.slide = SLIDE_TIME;
      else {
        p.vy = Math.min(p.vy, -16);
        p.fastFall = true;
      }
    }

    w.speed = speedAt(w.dist);
    w.topSpeed = Math.max(w.topSpeed, w.speed);
    w.dist += w.speed * dt;
  }

  // Runner body
  const prevX = p.x;
  p.x = damp(p.x, p.lane * LANE_W, 16, dt);
  p.tilt = damp(p.tilt, (p.x - prevX) / Math.max(dt, 1e-4) / 30, 12, dt);
  if (p.y > 0 || p.vy > 0) {
    p.vy -= GRAVITY * dt;
    p.y += p.vy * dt;
    if (p.y <= 0) {
      p.y = 0;
      p.vy = 0;
      if (p.alive) puff(w, p.x, 0.05, 0.2, 'rgba(200,190,255,0.6)', 6, 2.2, 0.4);
      if (p.fastFall && p.alive) p.slide = SLIDE_TIME;
      p.fastFall = false;
    }
  }
  if (p.slide > 0) p.slide = Math.max(0, p.slide - dt);
  if (p.alive) p.stride += w.speed * dt * 0.42;
  if (!p.alive) p.crash += rawDt;

  // Spawning and cleanup
  while (w.nextRow < w.dist + VIEW_DIST) spawnRow(w);
  w.obstacles = w.obstacles.filter((o) => o.s + OBSTACLES[o.type].len > w.dist - 6);
  w.coins = w.coins.filter((c) => !c.taken && c.s > w.dist - 4);

  // Collisions
  if (p.alive) {
    for (const o of w.obstacles) {
      const def = OBSTACLES[o.type];
      const z0 = o.s - w.dist;
      const z1 = z0 + def.len;
      if (z1 < -0.3 || z0 > 0.35) continue;
      if (Math.abs(p.x - o.lane * LANE_W) > LANE_W * 0.62) continue;
      if (!obstacleHit(p, o)) continue;
      const switching = Math.abs(p.x - p.lane * LANE_W) > 0.25;
      if (switching && o.lane === p.lane && z0 < -0.2) {
        // Clipped the side of an obstacle while changing lane: bounce back.
        p.lane = Math.round(prevX / LANE_W);
        p.x = prevX;
        w.bump = 0.3;
        w.shake = Math.max(w.shake, 0.25);
        puff(w, p.x + (o.lane - p.lane) * 0.8, 1, 0.2, 'rgba(255,220,150,0.8)', 8, 3, 0.35);
        continue;
      }
      p.alive = false;
      w.dying = 1.4;
      w.shake = 0.9;
      w.flash = 0.25;
      o.hit = true;
      puff(w, p.x, 1, 0.3, 'rgba(255,120,170,0.9)', 26, 6, 0.8, 0.14);
      puff(w, p.x, 1, 0.3, 'rgba(120,230,255,0.9)', 16, 5, 0.7, 0.1);
      break;
    }
    for (const c of w.coins) {
      const z = c.s - w.dist;
      if (z > 0.9 || z < -0.6) continue;
      if (Math.abs(p.x - c.lane * LANE_W) > LANE_W * 0.55) continue;
      const mid = p.y + (p.slide > 0 ? 0.45 : 0.9);
      if (Math.abs(mid - c.y) > 1.15) continue;
      c.taken = true;
      w.collected += 1;
      puff(w, c.lane * LANE_W, c.y, 0.4, 'rgba(255,214,90,0.95)', 7, 2.5, 0.35, 0.08);
    }
  }

  for (const q of w.particles) {
    q.life -= dt;
    q.vy -= 9 * dt;
    q.x += q.vx * dt;
    q.y = Math.max(0, q.y + q.vy * dt);
    q.z += q.vz * dt;
  }
  w.particles = w.particles.filter((q) => q.life > 0);
  for (const c of w.coins) c.spin += dt * 5;
}
