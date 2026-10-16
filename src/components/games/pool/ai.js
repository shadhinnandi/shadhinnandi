// Computer opponent for Eight Ball.
//
// 1. Geometry: for every legal ball and pocket, find the "ghost ball"
//    position the cue ball must reach to send that ball into the pocket,
//    and keep shots with clear paths and a makeable cut angle.
// 2. Simulation: play the best candidates (at two speeds each) on a copy of
//    the table with the real physics, judge each result with the real rules,
//    and score it: pots and keeping the table are good, fouls and leaving the
//    opponent an easy shot are bad, pocketing the 8 early is avoided at all costs.
// 3. The engine adds a small aiming error so the computer can miss.
//
// planShot is a generator: it yields after each simulation so the engine can
// spread the work over several frames.

import { FOOT_SPOT, FRICTION, HEAD_X, MAX_SPEED, POCKETS, R, TABLE, freeSpot, simulate } from './physics.js';
import { groupOf, judge, legalTargets, opposite } from './rules.js';

const TAU = Math.PI * 2;

function segDist2(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const l2 = dx * dx + dy * dy || 1;
  let t = ((px - ax) * dx + (py - ay) * dy) / l2;
  t = Math.max(0, Math.min(1, t));
  const cx = ax + dx * t - px;
  const cy = ay + dy * t - py;
  return cx * cx + cy * cy;
}

function pathClear(balls, ax, ay, bx, by, ignore) {
  const lim = (R * 2 - 0.5) ** 2;
  for (const b of balls) {
    if (b.sunk || ignore.includes(b.id)) continue;
    if (segDist2(b.x, b.y, ax, ay, bx, by) < lim) return false;
  }
  return true;
}

/** Direct pots available from `cue` on `targets`, best first. */
export function geometricShots(balls, cue, targets) {
  const shots = [];
  for (const id of targets) {
    const t = balls.find((b) => b.id === id);
    if (!t || t.sunk) continue;
    for (const p of POCKETS) {
      // Aim a little inside the pocket so the ball drops cleanly.
      const px = p.x + (p.x < 1 ? 6 : p.x > TABLE.w - 1 ? -6 : 0);
      const py = p.y + (p.y < 1 ? 6 : -6);
      let ux = px - t.x;
      let uy = py - t.y;
      const d2 = Math.hypot(ux, uy);
      ux /= d2;
      uy /= d2;
      const side = Math.abs(p.x - TABLE.w / 2) < 1;
      if (side && Math.abs(uy) < 0.5) continue; // too shallow for a side pocket
      const gx = t.x - ux * R * 2;
      const gy = t.y - uy * R * 2;
      if (gx < R - 1 || gx > TABLE.w - R + 1 || gy < R - 1 || gy > TABLE.h - R + 1) continue;
      let cx = gx - cue.x;
      let cy = gy - cue.y;
      const d1 = Math.hypot(cx, cy);
      if (d1 < 1) continue;
      cx /= d1;
      cy /= d1;
      const cos = cx * ux + cy * uy;
      if (cos < 0.22) continue;
      if (!pathClear(balls, cue.x, cue.y, gx, gy, [0, id])) continue;
      if (!pathClear(balls, t.x, t.y, px, py, [0, id])) continue;
      const vObj = Math.sqrt(2 * FRICTION * d2) + 90;
      const vCue = Math.sqrt((vObj / Math.max(cos, 0.3)) ** 2 + 2 * FRICTION * d1);
      shots.push({
        id,
        angle: Math.atan2(cy, cx),
        power: Math.min(1, Math.max(0.16, (vCue / MAX_SPEED) * 1.1)),
        quality: (cos * cos) / (1 + (d1 + d2) / 900),
      });
    }
  }
  return shots.sort((a, b) => b.quality - a.quality);
}

const bestQuality = (balls, group) => {
  const cue = balls.find((b) => b.id === 0);
  if (!cue || cue.sunk) return 0;
  const s = geometricShots(balls, cue, legalTargets(balls, group));
  return s.length ? s[0].quality : 0;
};

function score(verdict, sim, group) {
  if (verdict.result === 'win') return 1e6;
  if (verdict.result === 'lose') return -1e6;
  const g = group || verdict.assign;
  let s = 0;
  if (verdict.foul) s -= 600;
  for (const id of sim.ev.pots) {
    if (id === 0 || id === 8) continue;
    if (!g || groupOf(id) === g) s += 260;
    else s -= 90;
  }
  if (verdict.keepTurn) {
    s += 180 + 220 * bestQuality(sim.balls, g);
  } else {
    // Leave the opponent as little as possible.
    const opp = g ? opposite(g) : null;
    s -= 260 * bestQuality(sim.balls, opp) * (verdict.foul ? 1.6 : 1);
  }
  return s + Math.random() * 4;
}

export function* planShot(balls, group, isBreak) {
  const cue = balls.find((b) => b.id === 0);
  if (isBreak) {
    return { angle: Math.atan2(FOOT_SPOT.y - cue.y, FOOT_SPOT.x - cue.x) + (Math.random() - 0.5) * 0.02, power: 0.96 };
  }
  const targets = legalTargets(balls, group);
  const candidates = [];
  for (const s of geometricShots(balls, cue, targets).slice(0, 9)) {
    candidates.push({ angle: s.angle, power: s.power });
    candidates.push({ angle: s.angle, power: Math.min(1, s.power * 1.4) });
  }
  // Plain contact shots on each legal ball, for safeties.
  for (const id of targets) {
    const t = balls.find((b) => b.id === id);
    if (pathClear(balls, cue.x, cue.y, t.x, t.y, [0, id])) {
      const a = Math.atan2(t.y - cue.y, t.x - cue.x);
      candidates.push({ angle: a, power: 0.32 }, { angle: a + 0.04, power: 0.5 });
    }
    if (candidates.length > 34) break;
  }
  // Snookered: try kicks off the cushions all around.
  if (!candidates.length) {
    for (let a = 0; a < TAU; a += TAU / 36) candidates.push({ angle: a, power: 0.6 });
  }

  let best = candidates[0];
  let bestScore = -Infinity;
  for (const c of candidates) {
    const sim = simulate(balls, c.angle, c.power);
    const verdict = judge(sim.balls, sim.ev, { who: 'ai', groups: { ai: group, player: group ? opposite(group) : null }, isBreak: false, targetsBefore: targets });
    const s = score(verdict, sim, group);
    if (s > bestScore) {
      bestScore = s;
      best = c;
    }
    yield;
  }
  return best;
}

/** Where to put the cue ball with ball in hand: the spot with the easiest pot. */
export function choosePlacement(balls, group, kitchen) {
  const targets = legalTargets(balls, group);
  let best = null;
  let bestQ = -1;
  for (let i = 0; i < 70; i += 1) {
    const x = R + Math.random() * ((kitchen ? HEAD_X : TABLE.w) - R * 2);
    const y = R + Math.random() * (TABLE.h - R * 2);
    if (!freeSpot(balls, x, y, 0)) continue;
    const shots = geometricShots(balls, { x, y }, targets);
    const q = shots.length ? shots[0].quality : 0;
    if (q > bestQ) {
      bestQ = q;
      best = { x, y };
    }
  }
  return best || { x: HEAD_X - 80, y: TABLE.h / 2 };
}
