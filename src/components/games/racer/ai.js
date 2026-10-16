// Computer drivers for Apex Rush. They drive the same car model as the
// player through the same controls:
//
//   - steering: aim at a point ahead on their racing line (the centreline
//     plus a personal lane offset), further ahead at higher speed
//   - speed: look along the track for the tightest curvature ahead and brake
//     early enough to take it at the speed the car can turn and grip
//   - traffic: move over when a car is close ahead in the same lane
//   - recovery: reverse out when stuck or facing the wrong way
//
// `skill` (about 0.8 to 1.05) scales cornering speed and top speed.

import { DS, at } from './tracks.js';
import { angleDiff, clamp } from '../shared/math.js';

export const DIFFICULTY = {
  rookie: { label: 'Rookie', skill: [0.72, 0.76, 0.8] },
  pro: { label: 'Pro', skill: [0.86, 0.9, 0.94] },
  elite: { label: 'Elite', skill: [0.97, 1.0, 1.03] },
};

export function createDriver(skill, lane) {
  return { skill, lane, laneShift: 0, stuck: 0, reverseT: 0 };
}

export function drive(car, cars, track, dt) {
  const ai = car.ai;
  const half = track.def.halfWidth;
  const s = car.loc.s;
  const speed = car.speed;

  // Traffic: shift lane when someone is right ahead, and do not ram a car
  // that cannot be passed yet.
  let shiftTarget = 0;
  let follow = Infinity;
  for (const o of cars) {
    if (o === car || o.ghost) continue;
    let ds = o.loc.s - s;
    if (ds < -track.length / 2) ds += track.length;
    if (ds > track.length / 2) ds -= track.length;
    const sameLane = Math.abs(o.loc.lateral - car.loc.lateral) < 30;
    if (ds > 0 && ds < 160 && sameLane) shiftTarget = o.loc.lateral > car.loc.lateral ? -0.5 : 0.5;
    if (ds > 0 && ds < 70 && sameLane) follow = Math.min(follow, o.speed * 0.97);
  }
  ai.laneShift += (shiftTarget - ai.laneShift) * Math.min(1, 2 * dt);
  const lane = clamp(ai.lane + ai.laneShift, -0.6, 0.6) * half;

  // Recovery
  const p0 = at(track, s);
  const facing = Math.cos(car.heading) * p0.tx + Math.sin(car.heading) * p0.ty;
  if (ai.reverseT > 0) {
    ai.reverseT -= dt;
    const back = angleDiff(car.heading, Math.atan2(p0.ty, p0.tx));
    return { throttle: 0, brake: 1, steer: clamp(-back * 2, -1, 1), handbrake: false };
  }
  ai.stuck = speed < 40 ? ai.stuck + dt : 0;
  if (ai.stuck > 1.2 || facing < -0.3) {
    ai.stuck = 0;
    ai.reverseT = 0.9;
  }

  // Steering towards a point ahead on the line
  const look = 70 + speed * 0.42;
  const tgt = at(track, s + look);
  const tx = tgt.x + tgt.nx * lane;
  const ty = tgt.y + tgt.ny * lane;
  const want = Math.atan2(ty - car.y, tx - car.x);
  const steer = clamp(angleDiff(car.heading, want) * 2.6, -1, 1);

  // Target speed from the curvature ahead
  const skill = ai.skill;
  const latAcc = 820 * skill * skill;
  const brakeDecel = 820;
  let target = 720 * Math.min(1.04, skill);
  const range = 260 + speed * 1.1;
  const i0 = Math.floor(s / DS);
  for (let d = 0; d < range; d += DS * 2) {
    const i = (i0 + Math.floor(d / DS)) % track.N;
    const k = Math.abs(track.curv[i]) + 1e-5;
    // Fastest speed the car can grip and turn through this curvature.
    const vCorner = Math.min(Math.sqrt(latAcc / k), (1.55 * skill) / k);
    const v = Math.sqrt(vCorner * vCorner + 2 * brakeDecel * d);
    if (v < target) target = v;
  }

  target = Math.min(target, follow);
  let throttle = 1;
  let brake = 0;
  if (speed > target + 20) {
    throttle = 0;
    brake = clamp((speed - target) / 120, 0.3, 1);
  } else if (speed > target - 10) {
    throttle = 0.35;
  }
  // Off-road: ease back towards the tarmac.
  if (car.offroad) throttle = Math.min(throttle, 0.7);
  return { throttle, brake, steer, handbrake: false };
}
