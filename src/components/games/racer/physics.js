// Car handling for Apex Rush, shared by the player and the AI drivers.
//
// An arcade model in the car's own frame: forward speed changes with
// throttle, brakes and drag; steering turns the heading at a rate that
// depends on speed; sideways speed is bled off by tyre grip. Low grip
// (handbrake, sharp steering at speed, off-road) lets the tail slide out:
// that slide is the drift, scored while it lasts and rewarded with a short
// boost when it ends cleanly.
//
//   controls = { throttle: 0..1, brake: 0..1, steer: -1..1, handbrake: bool }
//
// Units: world units (a car is 44 long), seconds. km/h = speed * KMH.

import { at, locate } from './tracks.js';

export const KMH = 0.36;
export const CAR = { length: 44, width: 22, radius: 19 };

const BASE = {
  vmax: 720,
  accel: 560,
  brake: 980,
  reverse: 180,
  drag: 0.18,
  grip: 14,
  driftGrip: 2.8, // handbrake held
  holdGrip: 4.4, // drift kept alive with steering and throttle
  offGrip: 5,
};

export function createCar(track, s, lateral, opts = {}) {
  const p = at(track, s);
  return {
    x: p.x + p.nx * lateral,
    y: p.y + p.ny * lateral,
    heading: Math.atan2(p.ty, p.tx),
    vx: 0,
    vy: 0,
    speed: 0,
    vF: 0,
    vR: 0,
    steer: 0,
    wheelRot: 0,
    loc: locate(track, p.x + p.nx * lateral, p.y + p.ny * lateral, p.idx, 8),
    offroad: false,
    drifting: false,
    driftScore: 0,
    driftTime: 0,
    calmT: 0,
    boost: 0,
    braking: false,
    hit: 0,
    tune: { vmax: 1, accel: 1, grip: 1, ...opts.tune },
    color: opts.color || '#e8473f',
    name: opts.name || 'Car',
    ai: opts.ai || null,
  };
}

/**
 * Advance one car. `fx` collects events for effects and scoring:
 * { skid: [[x, y]], sparks: [[x, y]], dust: [[x, y]], driftBank: points }.
 */
export function stepCar(car, c, track, dt, fx) {
  const t = car.tune;
  const def = track.def;
  const half = def.halfWidth;
  const off = Math.abs(car.loc.lateral) > half + 4;
  car.offroad = off;
  const vmax = BASE.vmax * t.vmax * (off ? 0.55 : 1) * (car.boost > 0 ? 1.12 : 1);
  const frac = Math.min(1, Math.abs(car.vF) / (BASE.vmax * t.vmax));

  // Steering turns the car; the velocity is left alone, so momentum carries
  // the car wide until the tyres pull it round (that lag is the slide).
  car.steer += (c.steer - car.steer) * Math.min(1, 12 * dt);
  const rate = (2.75 - 1.15 * frac) * Math.min(1, Math.abs(car.vF) / 120) * (c.handbrake ? 1.25 : car.drifting ? 0.85 : 1);
  car.heading += car.steer * rate * Math.sign(car.vF || 1) * dt;

  // World velocity in the car's new frame
  const fX = Math.cos(car.heading);
  const fY = Math.sin(car.heading);
  let vF = car.vx * fX + car.vy * fY;
  let vR = -car.vx * fY + car.vy * fX;

  // Engine, brakes, drag
  if (c.throttle > 0) {
    if (vF < vmax) vF += BASE.accel * t.accel * c.throttle * (1 - (vF / vmax) ** 2) * (car.boost > 0 ? 1.5 : 1) * dt;
  }
  car.braking = c.brake > 0 && vF > 20;
  if (c.brake > 0) {
    if (vF > 15) vF -= BASE.brake * c.brake * dt;
    else vF = Math.max(-BASE.reverse, vF - BASE.reverse * 1.5 * c.brake * dt);
  }
  if (c.handbrake) vF -= Math.sign(vF) * 140 * dt;
  vF -= vF * (BASE.drag + (off ? 1.4 : 0)) * dt;
  if (c.throttle === 0 && c.brake === 0) vF -= Math.sign(vF) * Math.min(Math.abs(vF), 60 * dt);
  if (vF > vmax) vF += (vmax - vF) * Math.min(1, 2 * dt);

  // Grip: the tail slides when grip is low. Tap the handbrake to start a
  // drift, keep steering and throttle to hold it, let go to straighten up.
  const hardTurn = Math.abs(car.steer) > 0.85 && frac > 0.72;
  let grip = BASE.grip * t.grip;
  if (c.handbrake && Math.abs(vF) > 140) grip = BASE.driftGrip;
  else if (car.drifting && Math.abs(c.steer) > 0.5 && c.throttle > 0) grip = BASE.holdGrip;
  else if (hardTurn) grip = BASE.grip * 0.55;
  if (off) grip = Math.min(grip, BASE.offGrip);
  // Past about 30 degrees of slide the tyres bite harder, so a drift
  // settles into a held angle instead of spinning the car round.
  const slipNow = Math.abs(Math.atan2(vR, Math.max(Math.abs(vF), 1)));
  grip += Math.max(0, slipNow - 0.5) * 22;
  vR *= Math.exp(-grip * dt);

  car.vx = fX * vF - fY * vR;
  car.vy = fY * vF + fX * vR;
  car.x += car.vx * dt;
  car.y += car.vy * dt;
  car.vF = vF;
  car.vR = vR;
  car.speed = Math.hypot(car.vx, car.vy);
  car.wheelRot += vF * dt * 0.25;
  car.boost = Math.max(0, car.boost - dt);
  car.hit = Math.max(0, car.hit - dt);
  const nfX = fX;
  const nfY = fY;

  car.loc = locate(track, car.x, car.y, car.loc.idx);

  // Drift: sideways slip at speed.
  const slip = Math.abs(Math.atan2(vR, Math.max(Math.abs(vF), 1)));
  const sliding = slip > 0.22 && car.speed > 160 && !off;
  if (sliding) {
    car.drifting = true;
    car.calmT = 0;
    car.driftTime += dt;
    car.driftScore += car.speed * slip * dt * 0.6;
    if (fx) {
      const rx = car.x - nfX * 15;
      const ry = car.y - nfY * 15;
      fx.skid.push([rx - nfY * 9, ry + nfX * 9, rx + nfY * 9, ry - nfX * 9, car]);
    }
  } else if (car.drifting) {
    car.calmT += dt;
    if (car.calmT > 0.25) {
      // Clean exit: bank the points and earn a little boost.
      if (car.driftTime > 0.5 && fx && car.isPlayer) fx.driftBank = (fx.driftBank || 0) + Math.round(car.driftScore);
      if (car.driftTime > 0.5) car.boost = Math.min(1.6, car.driftTime * 0.5);
      car.drifting = false;
      car.driftScore = 0;
      car.driftTime = 0;
    }
  }
  if (fx && c.brake > 0.5 && vF > 380 && !sliding) {
    const rx = car.x - nfX * 15;
    const ry = car.y - nfY * 15;
    fx.skid.push([rx - nfY * 9, ry + nfX * 9, rx + nfY * 9, ry - nfX * 9, car]);
  }
  if (fx && off && car.speed > 80 && Math.random() < 0.5) fx.dust.push([car.x - nfX * 18, car.y - nfY * 18]);

  // Walls at the outer edge of the shoulder.
  const wall = half + def.shoulder;
  const lat = car.loc.lateral;
  if (Math.abs(lat) > wall - CAR.width / 2) {
    const p = at(track, car.loc.s);
    const side = Math.sign(lat);
    const nX = p.nx * side; // outward normal
    const nY = p.ny * side;
    const push = Math.abs(lat) - (wall - CAR.width / 2);
    car.x -= nX * push;
    car.y -= nY * push;
    const vn = car.vx * nX + car.vy * nY;
    if (vn > 0) {
      car.vx -= nX * vn * 1.35;
      car.vy -= nY * vn * 1.35;
      const keep = Math.max(0.55, 1 - vn / 900);
      car.vx *= keep;
      car.vy *= keep;
      if (vn > 60) {
        car.hit = 0.3;
        if (car.drifting) {
          car.drifting = false;
          car.driftScore = 0;
          car.driftTime = 0;
        }
        if (fx) fx.sparks.push([car.x + nX * 11, car.y + nY * 11, vn]);
      }
    }
    car.loc = locate(track, car.x, car.y, car.loc.idx);
  }
}

/** Push overlapping cars apart and trade some momentum. */
export function collideCars(cars, fx) {
  const R = CAR.radius;
  for (let i = 0; i < cars.length; i += 1) {
    for (let j = i + 1; j < cars.length; j += 1) {
      const a = cars[i];
      const b = cars[j];
      if (a.ghost || b.ghost) continue;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const d2 = dx * dx + dy * dy;
      if (d2 >= (R * 2) ** 2 || d2 === 0) continue;
      const d = Math.sqrt(d2);
      const nx = dx / d;
      const ny = dy / d;
      const o = (R * 2 - d) / 2;
      a.x -= nx * o;
      a.y -= ny * o;
      b.x += nx * o;
      b.y += ny * o;
      const vrel = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
      if (vrel > 0) {
        const imp = vrel * 0.65;
        a.vx -= nx * imp;
        a.vy -= ny * imp;
        b.vx += nx * imp;
        b.vy += ny * imp;
        // Light contact is free; real impacts cost both cars some speed.
        if (vrel > 60) {
          const keep = 1 - Math.min(0.15, vrel / 2000);
          a.vx *= keep;
          a.vy *= keep;
          b.vx *= keep;
          b.vy *= keep;
        }
        if (vrel > 80) {
          a.hit = b.hit = 0.25;
          if (fx) fx.sparks.push([(a.x + b.x) / 2, (a.y + b.y) / 2, vrel]);
        }
      }
    }
  }
}
