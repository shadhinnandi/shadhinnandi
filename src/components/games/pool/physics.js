// Ball physics for Eight Ball. Table units: the playing surface is 1000 × 500
// and every ball has radius R. No DOM access, so the AI can run exact copies
// of a shot (see simulate) and scripts can test the physics in Node.
//
// Model
//   - rolling friction: constant deceleration until the ball stops
//   - ball-ball: equal-mass collision along the line of centres (restitution E)
//   - cushions: reflect with energy loss, except at pocket mouths
//   - pockets: a ball whose centre comes within a pocket's radius drops in
// Each fixed step is split into substeps so a fast ball moves less than a
// quarter of its radius per substep and cannot pass through another ball.

export const TABLE = { w: 1000, h: 500 };
export const R = 12;
export const HEAD_X = 250; // head string: the break is played from behind it
export const FOOT_SPOT = { x: 750, y: 250 };
export const MAX_SPEED = 1500;

export const POCKETS = [
  { x: -2, y: -2, r: 26 },
  { x: 500, y: -9, r: 22 },
  { x: 1002, y: -2, r: 26 },
  { x: -2, y: 502, r: 26 },
  { x: 500, y: 509, r: 22 },
  { x: 1002, y: 502, r: 26 },
];

const CORNER_GAP = 32;
const SIDE_GAP = 21;
export const FRICTION = 215;
const STOP_SPEED = 6;
const CUSHION = 0.76;
const E = 0.95;

const openLeftRight = (y) => y < CORNER_GAP || y > TABLE.h - CORNER_GAP;
const openTopBottom = (x) => x < CORNER_GAP || x > TABLE.w - CORNER_GAP || Math.abs(x - TABLE.w / 2) < SIDE_GAP;

export function newEvents() {
  return { firstHit: null, pots: [], cushionHits: 0, ballHits: 0, hits: [] };
}

function sink(b, pocket, ev) {
  b.sunk = true;
  b.vx = 0;
  b.vy = 0;
  b.sinkT = 0.22;
  b.pocket = pocket;
  ev.pots.push(b.id);
}

function nearestPocket(b) {
  let best = POCKETS[0];
  let bd = Infinity;
  for (const p of POCKETS) {
    const d = (p.x - b.x) ** 2 + (p.y - b.y) ** 2;
    if (d < bd) {
      bd = d;
      best = p;
    }
  }
  return best;
}

function substep(balls, dt, ev) {
  // Move and slow down
  for (const b of balls) {
    if (b.sunk) continue;
    const sp = Math.hypot(b.vx, b.vy);
    if (sp === 0) continue;
    const ns = sp - FRICTION * dt;
    if (ns <= STOP_SPEED && sp <= STOP_SPEED * 3) {
      b.vx = 0;
      b.vy = 0;
      continue;
    }
    const k = Math.max(ns, 0) / sp;
    b.vx *= k;
    b.vy *= k;
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.roll += sp * dt;
  }

  // Ball-ball collisions
  const D = R * 2;
  for (let i = 0; i < balls.length; i += 1) {
    const a = balls[i];
    if (a.sunk) continue;
    for (let j = i + 1; j < balls.length; j += 1) {
      const b = balls[j];
      if (b.sunk) continue;
      if (a.vx === 0 && a.vy === 0 && b.vx === 0 && b.vy === 0) continue;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const d2 = dx * dx + dy * dy;
      if (d2 >= D * D || d2 === 0) continue;
      const d = Math.sqrt(d2);
      const nx = dx / d;
      const ny = dy / d;
      const overlap = (D - d) / 2;
      a.x -= nx * overlap;
      a.y -= ny * overlap;
      b.x += nx * overlap;
      b.y += ny * overlap;
      const vrel = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
      if (vrel <= 0) continue;
      const imp = ((1 + E) / 2) * vrel;
      a.vx -= imp * nx;
      a.vy -= imp * ny;
      b.vx += imp * nx;
      b.vy += imp * ny;
      ev.ballHits += 1;
      if (ev.firstHit === null) {
        if (a.id === 0) ev.firstHit = b.id;
        else if (b.id === 0) ev.firstHit = a.id;
      }
      if (ev.hits.length < 24) ev.hits.push({ x: a.x + nx * R, y: a.y + ny * R, v: vrel });
    }
  }

  // Cushions and pockets
  for (const b of balls) {
    if (b.sunk) continue;
    for (const p of POCKETS) {
      if ((p.x - b.x) ** 2 + (p.y - b.y) ** 2 < p.r * p.r) {
        sink(b, p, ev);
        break;
      }
    }
    if (b.sunk) continue;
    let hit = false;
    if (b.x < R && !openLeftRight(b.y)) {
      b.x = R;
      b.vx = Math.abs(b.vx) * CUSHION;
      b.vy *= 0.96;
      hit = true;
    } else if (b.x > TABLE.w - R && !openLeftRight(b.y)) {
      b.x = TABLE.w - R;
      b.vx = -Math.abs(b.vx) * CUSHION;
      b.vy *= 0.96;
      hit = true;
    }
    if (b.y < R && !openTopBottom(b.x)) {
      b.y = R;
      b.vy = Math.abs(b.vy) * CUSHION;
      b.vx *= 0.96;
      hit = true;
    } else if (b.y > TABLE.h - R && !openTopBottom(b.x)) {
      b.y = TABLE.h - R;
      b.vy = -Math.abs(b.vy) * CUSHION;
      b.vx *= 0.96;
      hit = true;
    }
    if (hit) ev.cushionHits += 1;
    // A ball that has rolled past the cushion line inside a pocket mouth
    // has dropped into that pocket.
    if (b.x < -R * 0.6 || b.x > TABLE.w + R * 0.6 || b.y < -R * 0.6 || b.y > TABLE.h + R * 0.6) sink(b, nearestPocket(b), ev);
  }
}

/** Advance the table by dt seconds. */
export function step(balls, dt, ev) {
  let fastest = 0;
  for (const b of balls) if (!b.sunk) fastest = Math.max(fastest, Math.hypot(b.vx, b.vy));
  const n = Math.max(1, Math.min(16, Math.ceil((fastest * dt) / (R * 0.25))));
  for (let i = 0; i < n; i += 1) substep(balls, dt / n, ev);
  for (const b of balls) if (b.sinkT > 0) b.sinkT = Math.max(0, b.sinkT - dt);
}

export const moving = (balls) => balls.some((b) => !b.sunk && (b.vx !== 0 || b.vy !== 0));
export const settling = (balls) => balls.some((b) => b.sinkT > 0);

export const cloneBalls = (balls) => balls.map((b) => ({ ...b }));

/**
 * Play a shot on a copy of the table and return what happened.
 * Used by the computer opponent to compare candidate shots.
 */
export function simulate(balls, angle, power, dt = 1 / 120, maxTime = 14) {
  const copy = cloneBalls(balls);
  const cue = copy.find((b) => b.id === 0);
  cue.vx = Math.cos(angle) * power * MAX_SPEED;
  cue.vy = Math.sin(angle) * power * MAX_SPEED;
  const ev = newEvents();
  for (let t = 0; t < maxTime; t += dt) {
    step(copy, dt, ev);
    if (!moving(copy)) break;
  }
  return { balls: copy, ev };
}

/** True if a ball of radius R can sit at (x, y) without touching another. */
export function freeSpot(balls, x, y, ignoreId = 0) {
  if (x < R || x > TABLE.w - R || y < R || y > TABLE.h - R) return false;
  return balls.every((b) => b.sunk || b.id === ignoreId || (b.x - x) ** 2 + (b.y - y) ** 2 >= (R * 2 + 0.5) ** 2);
}

/** Nearest free spot to (x, y), searching outward along the table's long axis. */
export function nearestFree(balls, x, y, ignoreId) {
  for (let r = 0; r < 600; r += 3) {
    for (const [dx, dy] of [
      [-r, 0],
      [r, 0],
      [0, -r],
      [0, r],
    ]) {
      if (freeSpot(balls, x + dx, y + dy, ignoreId)) return { x: x + dx, y: y + dy };
    }
  }
  return { x, y };
}
