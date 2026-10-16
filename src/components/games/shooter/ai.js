// Enemy behaviour for Last Stand. Each enemy picks a desired velocity
// (e.dx, e.dy) every step; the world then blends in separation from other
// enemies, smooths the velocity and resolves collisions.
//
//   grunt   heads for its own slot on a ring around the player, so a group
//           closes in from several sides instead of queueing behind each other
//   runner  swings out to the side and flanks before committing
//   gunner  holds a firing range, strafes, and fires a leading shot after a
//           short visible wind-up (only with a clear line of sight)
//   brute   chases, winds up, then charges in a straight line and recovers

import { ENEMIES, PILLARS } from './config.js';
import { clamp, rand } from '../shared/math.js';

/** True if the segment a -> b passes through a pillar (grown by `pad`). */
export function segmentBlocked(ax, ay, bx, by, pad = 0) {
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy || 1;
  for (const p of PILLARS) {
    const t = clamp(((p.x - ax) * dx + (p.y - ay) * dy) / len2, 0, 1);
    const cx = ax + dx * t - p.x;
    const cy = ay + dy * t - p.y;
    if (cx * cx + cy * cy < (p.r + pad) * (p.r + pad)) return true;
  }
  return false;
}

/** Steer the direction (tx, ty) around pillars ahead. Returns [tx, ty] normalised. */
function avoidPillars(e, tx, ty) {
  for (const p of PILLARS) {
    const ox = p.x - e.x;
    const oy = p.y - e.y;
    const od = Math.hypot(ox, oy) || 1;
    const gap = od - p.r - e.r;
    if (gap > 90) continue;
    const nx = ox / od;
    const ny = oy / od;
    const ahead = tx * nx + ty * ny;
    if (ahead <= 0) continue;
    // Slide along the side of the pillar we are already heading for.
    let px = tx - ahead * nx;
    let py = ty - ahead * ny;
    let pl = Math.hypot(px, py);
    if (pl < 1e-3) {
      px = -ny;
      py = nx;
      pl = 1;
    }
    const w = clamp(1 - gap / 90, 0, 1) * ahead;
    tx += (px / pl) * w * 2 - nx * w;
    ty += (py / pl) * w * 2 - ny * w;
  }
  const l = Math.hypot(tx, ty) || 1;
  return [tx / l, ty / l];
}

function toward(e, x, y) {
  const dx = x - e.x;
  const dy = y - e.y;
  const d = Math.hypot(dx, dy) || 1;
  return [dx / d, dy / d];
}

export function think(e, world, dt) {
  const p = world.player;
  const def = ENEMIES[e.type];
  const dx = p.x - e.x;
  const dy = p.y - e.y;
  const d = Math.hypot(dx, dy) || 1;
  const ux = dx / d;
  const uy = dy / d;
  const speed = def.speed * e.speedMul;
  const hunting = p.alive;
  let tx = ux;
  let ty = uy;
  let sp = speed;
  e.face = Math.atan2(uy, ux);

  if (!hunting) {
    // Player is down: drift around loosely.
    e.wander += dt * 0.8;
    tx = Math.cos(e.wander);
    ty = Math.sin(e.wander);
    sp = speed * 0.25;
  } else if (e.type === 'grunt') {
    if (d > 160) {
      const a = e.slot + world.time * 0.2;
      [tx, ty] = toward(e, p.x + Math.cos(a) * 95, p.y + Math.sin(a) * 95);
    }
  } else if (e.type === 'runner') {
    if (d > 200) {
      const from = Math.atan2(e.y - p.y, e.x - p.x) + e.side * 1.05;
      [tx, ty] = toward(e, p.x + Math.cos(from) * 160, p.y + Math.sin(from) * 160);
    } else {
      sp = speed * 1.12;
    }
  } else if (e.type === 'gunner') {
    e.strafeT -= dt;
    if (e.strafeT <= 0) {
      e.side *= -1;
      e.strafeT = rand(1.2, 2.6);
    }
    if (d > def.range + 80) {
      // approach
    } else if (d < def.range - 110) {
      tx = -ux;
      ty = -uy;
    } else {
      tx = -uy * e.side + ux * 0.1;
      ty = ux * e.side + uy * 0.1;
      sp = speed * 0.75;
    }
    e.fireCd -= dt;
    if (e.telegraph > 0) {
      e.telegraph -= dt;
      sp *= 0.2;
      if (e.telegraph <= 0) {
        // Lead the target a little: aim where the player is heading.
        const t = (d / def.shotSpeed) * 0.65;
        const ax = p.x + p.vx * t - e.x;
        const ay = p.y + p.vy * t - e.y;
        world.enemyFire(e, Math.atan2(ay, ax), def.shotSpeed, def.damage * e.dmgMul);
      }
    } else if (e.fireCd <= 0 && d < def.range + 220 && !segmentBlocked(e.x, e.y, p.x, p.y, 8)) {
      e.telegraph = 0.45;
      e.fireCd = rand(1.4, 2.2) / world.scale.speed;
    }
  } else if (e.type === 'brute') {
    e.stateT -= dt;
    e.chargeCd -= dt;
    if (e.state === 'chase') {
      if (d < 420 && e.chargeCd <= 0 && !segmentBlocked(e.x, e.y, p.x, p.y, e.r * 0.6)) {
        e.state = 'windup';
        e.stateT = 0.7;
        e.chargeDir = Math.atan2(uy, ux);
      }
    } else if (e.state === 'windup') {
      // Keep tracking during the first part of the wind-up only, so the
      // charge can be read and dodged.
      if (e.stateT > 0.3) e.chargeDir = Math.atan2(uy, ux);
      e.face = e.chargeDir;
      sp = 0;
      if (e.stateT <= 0) {
        e.state = 'charge';
        e.stateT = 0.62;
      }
    } else if (e.state === 'charge') {
      e.face = e.chargeDir;
      e.dx = Math.cos(e.chargeDir) * def.chargeSpeed * Math.min(e.speedMul, 1.15);
      e.dy = Math.sin(e.chargeDir) * def.chargeSpeed * Math.min(e.speedMul, 1.15);
      if (e.stateT <= 0) world.endCharge(e);
      return;
    } else {
      sp = speed * 0.25;
      if (e.stateT <= 0) e.state = 'chase';
    }
  }

  [tx, ty] = avoidPillars(e, tx, ty);
  e.dx = tx * sp;
  e.dy = ty * sp;
}
