// Race flow for Apex Rush: grid, countdown, checkpoints and laps, live
// positions, the finish and results, plus ghost recording and playback.
// Pure state, no drawing, so whole races can be simulated in Node.
//
// Lap counting: each lap has CPS checkpoints that must be passed in order;
// crossing the start line after all of them completes the lap, so cutting
// back across the line or driving the wrong way never counts.

import { TRACKS, buildTrack, at } from './tracks.js';
import { collideCars, createCar, stepCar } from './physics.js';
import { DIFFICULTY, createDriver, drive } from './ai.js';

export const LAPS = 3;
export const CPS = 12;
const GHOST_DT = 1 / 30;

const RIVALS = [
  { name: 'Vega', color: '#f2a531' },
  { name: 'Kato', color: '#2fbf71' },
  { name: 'Moreau', color: '#b65cf0' },
];

export function createRace({ track: trackId = 'coast', mode = 'race', difficulty = 'pro', ghost = null } = {}) {
  const def = TRACKS.find((t) => t.id === trackId) || TRACKS[0];
  const track = buildTrack(def);
  const L = track.length;
  const slot = (k) => ({ s: L - 70 - Math.floor(k / 2) * 80, lat: k % 2 === 0 ? 22 : -22 });
  const cars = [];
  let player;
  if (mode === 'race') {
    const skills = DIFFICULTY[difficulty]?.skill || DIFFICULTY.pro.skill;
    RIVALS.forEach((r, k) => {
      const sl = slot(k);
      const skill = skills[k];
      cars.push(
        createCar(track, sl.s, sl.lat, {
          ...r,
          ai: createDriver(skill, [-0.22, 0.24, 0][k]),
          tune: { vmax: Math.min(1.04, Math.max(0.86, skill)), accel: 0.94 + 0.08 * skill, grip: 1 },
        }),
      );
    });
    const sl = slot(3);
    player = createCar(track, sl.s, sl.lat, { name: 'You', color: '#2f7ff0' });
  } else {
    player = createCar(track, L - 70, 0, { name: 'You', color: '#2f7ff0' });
  }
  player.isPlayer = true;
  cars.push(player);
  for (const c of cars) {
    Object.assign(c, { started: false, lap: 0, cp: 0, lapStart: 0, lapTimes: [], bestLap: null, finished: false, finishTime: null, prevS: c.loc.s, raceDist: c.loc.s - L, splits: [], wrongT: 0 });
  }
  const cps = Array.from({ length: CPS }, (_, k) => (L * (k + 1)) / (CPS + 1));

  return {
    track,
    def,
    mode,
    difficulty,
    cars,
    player,
    cps,
    phase: 'countdown', // countdown | racing | finished
    countdown: 3.4,
    time: 0,
    afterT: 0,
    done: false,
    fx: { skid: [], sparks: [], dust: [], driftBank: 0 },
    driftTotal: 0,
    events: [],
    ghost: ghost && ghost.frames && ghost.frames.length > 6 ? { data: ghost, x: 0, y: 0, heading: 0, ghost: true, visible: true } : null,
    record: { frames: [], acc: 0 },
    delta: null,
    lapFlash: null,
    finalLap: false,
  };
}

const ord = (n) => `${n}${['th', 'st', 'nd', 'rd'][n % 100 > 10 && n % 100 < 14 ? 0 : n % 10 < 4 ? n % 10 : 0]}`;
export { ord };

function passed(prev, s, c, L) {
  return prev < c && s >= c && s - prev < L / 2;
}

function progress(race, car) {
  const L = race.track.length;
  const s = car.loc.s;
  const prev = car.prevS;
  car.prevS = s;
  const wrapF = prev > L * 0.75 && s < L * 0.25;
  if (!car.started) {
    if (wrapF) car.started = true;
  } else if (!car.finished) {
    while (car.cp < CPS && passed(prev, s, race.cps[car.cp], L)) {
      car.cp += 1;
      car.splits.push(race.time);
      if (car === race.player) splitDelta(race);
    }
    if (wrapF && car.cp >= CPS) {
      const lapTime = race.time - car.lapStart;
      car.lapTimes.push(lapTime);
      car.bestLap = car.bestLap === null ? lapTime : Math.min(car.bestLap, lapTime);
      car.lap += 1;
      car.cp = 0;
      car.lapStart = race.time;
      car.splits.push(race.time);
      if (car === race.player) {
        splitDelta(race);
        race.lapFlash = { time: lapTime, best: car.bestLap === lapTime, t: 0 };
        if (car.lap === LAPS - 1) race.finalLap = true;
      }
      if (car.lap >= LAPS) {
        car.finished = true;
        car.finishTime = race.time;
      }
    }
  }
  car.raceDist = car.started ? car.lap * L + s - (car.cp === 0 && s > L / 2 ? L : 0) : s - L;
  // Wrong way: moving backwards along the track for a moment.
  const p = at(race.track, s);
  const along = car.vx * p.tx + car.vy * p.ty;
  car.wrongT = along < -60 ? car.wrongT + 1 / 120 : 0;
}

function splitDelta(race) {
  const g = race.ghost?.data;
  const n = race.player.splits.length - 1;
  if (!g || !g.splits || g.splits[n] === undefined) return;
  race.delta = { value: race.player.splits[n] - g.splits[n], t: 0 };
}

/** Positions, leader first. */
export function standings(race) {
  return [...race.cars].sort((a, b) => {
    if (a.finished && b.finished) return a.finishTime - b.finishTime;
    if (a.finished) return -1;
    if (b.finished) return 1;
    return b.raceDist - a.raceDist;
  });
}

export function positionOf(race, car) {
  return standings(race).indexOf(car) + 1;
}

/** One fixed step. `controls` are the player's inputs. */
export function stepRace(race, controls, dt) {
  const { track, cars, player } = race;
  race.fx.skid.length = 0;
  race.fx.sparks.length = 0;
  race.fx.dust.length = 0;
  race.fx.driftBank = 0;
  if (race.delta) race.delta.t += dt;
  if (race.lapFlash) race.lapFlash.t += dt;

  if (race.phase === 'countdown') {
    race.countdown -= dt;
    if (race.countdown <= 0) {
      race.phase = 'racing';
      race.time = 0;
    }
    updateGhost(race);
    return;
  }

  race.time += dt;
  for (const car of cars) {
    let c;
    if (car === player && race.phase === 'racing') c = controls;
    else if (car.ai) c = drive(car, cars, track, dt);
    else {
      // Player after the finish: a computer driver brings the car round.
      if (!car.ai) car.ai = createDriver(0.8, 0);
      c = drive(car, cars, track, dt);
      c.throttle *= 0.6;
    }
    stepCar(car, c, track, dt, race.fx);
  }
  collideCars(cars, race.fx);
  for (const car of cars) progress(race, car);
  if (race.fx.driftBank) race.driftTotal += race.fx.driftBank;

  if (race.mode === 'trial' && race.phase === 'racing') recordGhost(race, dt);
  updateGhost(race);

  if (race.phase === 'racing' && player.finished) {
    race.phase = 'finished';
    race.afterT = 0;
  }
  if (race.phase === 'finished') {
    race.afterT += dt;
    if (race.afterT > 2.8) race.done = true;
  }
}

function recordGhost(race, dt) {
  const r = race.record;
  r.acc += dt;
  if (r.acc >= GHOST_DT) {
    r.acc -= GHOST_DT;
    const p = race.player;
    r.frames.push(Math.round(p.x), Math.round(p.y), Math.round(p.heading * 1000));
  }
}

function updateGhost(race) {
  const g = race.ghost;
  if (!g) return;
  const f = g.data.frames;
  const n = f.length / 3;
  const t = Math.max(0, race.time) / (g.data.dt || GHOST_DT);
  const i = Math.min(n - 1, Math.floor(t));
  const j = Math.min(n - 1, i + 1);
  const k = Math.min(1, t - i);
  g.x = f[i * 3] + (f[j * 3] - f[i * 3]) * k;
  g.y = f[i * 3 + 1] + (f[j * 3 + 1] - f[i * 3 + 1]) * k;
  const h0 = f[i * 3 + 2] / 1000;
  let dh = f[j * 3 + 2] / 1000 - h0;
  if (dh > Math.PI) dh -= Math.PI * 2;
  if (dh < -Math.PI) dh += Math.PI * 2;
  g.heading = h0 + dh * k;
  g.visible = race.time * 1 < n * (g.data.dt || GHOST_DT) + 1;
}

/** Ghost data for the run just finished (time trial only). */
export function ghostOf(race) {
  return { time: race.player.finishTime, splits: race.player.splits.slice(), frames: race.record.frames.slice(), dt: GHOST_DT, laps: LAPS };
}

/** Results table once the player has finished. */
export function results(race) {
  const L = race.track.length;
  return standings(race).map((c, i) => {
    let time = c.finishTime;
    let estimated = false;
    if (!c.finished) {
      const left = LAPS * L - c.raceDist;
      const pace = Math.max(260, (c.raceDist + L) / Math.max(1, race.time));
      time = race.time + left / pace;
      estimated = true;
    }
    return { pos: i + 1, name: c.name, color: c.color, time, estimated, bestLap: c.bestLap, player: c === race.player };
  });
}

export const fmtTime = (t) => {
  if (t === null || t === undefined || !Number.isFinite(t)) return '--:--.--';
  const m = Math.floor(t / 60);
  const s = t - m * 60;
  return `${m}:${s.toFixed(2).padStart(5, '0')}`;
};
