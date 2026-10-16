// Apex Rush engine: controls (keyboard and on-screen buttons), the chase
// camera, skid marks and particles, results, best laps and ghost saving.
// Behind the start screen a demo race runs with every car on autopilot.

import { LAPS, createRace, fmtTime, ghostOf, ord, results, stepRace } from './race.js';
import { createDriver, drive, DIFFICULTY } from './ai.js';
import { renderRace } from './render.js';
import { angleDiff, clamp, damp } from '../shared/math.js';
import { loadJSON, loadNumber, saveJSON, saveNumber } from '../shared/storage.js';

const DEFAULTS = { mode: 'race', track: 'coast', difficulty: 'pro' };

export function createRacer(api) {
  const { input } = api;
  const view = { width: 1, height: 1 };
  const cam = { x: 0, y: 0, heading: 0, rot: 0, zoom: 1, shake: 0, base: 1 };
  const fx = { skids: [], particles: [], last: new Map() };
  let opts = { ...DEFAULTS };
  let race = null;
  let active = false;
  let reported = false;
  let usingTouch = false;
  let driftFlash = null;
  let buttons = [];
  let bestLap = null;

  input.on('down', (p) => {
    usingTouch = p.type !== 'mouse';
  });

  function demo() {
    race = createRace({ track: opts.track, mode: 'race', difficulty: 'elite' });
    race.player.ai = createDriver(0.95, 0.05);
    race.phase = 'racing';
    snapCamera();
  }

  function snapCamera() {
    const p = race.player;
    cam.x = p.x;
    cam.y = p.y;
    cam.heading = p.heading;
    cam.rot = -Math.PI / 2 - cam.heading;
    fx.skids.length = 0;
    fx.particles.length = 0;
    fx.last.clear();
  }

  function controls() {
    let steer = (input.down('ArrowRight', 'KeyD') ? 1 : 0) - (input.down('ArrowLeft', 'KeyA') ? 1 : 0);
    let throttle = input.down('ArrowUp', 'KeyW') ? 1 : 0;
    let brake = input.down('ArrowDown', 'KeyS') ? 1 : 0;
    let handbrake = input.down('Space');
    for (const b of buttons) b.down = false;
    for (const ptr of input.pointers.values()) {
      for (const b of buttons) {
        if ((ptr.x - b.x) ** 2 + (ptr.y - b.y) ** 2 < (b.r + 8) ** 2) b.down = true;
      }
    }
    for (const b of buttons) {
      if (!b.down) continue;
      if (b.id === 'left') steer = -1;
      if (b.id === 'right') steer = 1;
      if (b.id === 'gas') throttle = 1;
      if (b.id === 'brake') brake = 1;
      if (b.id === 'drift') handbrake = true;
    }
    return { throttle, brake, steer, handbrake };
  }

  function effects(dt) {
    // Skid marks: join each car's rear-wheel points into continuous strokes.
    const seen = new Set();
    for (const [ax, ay, bx, by, car] of race.fx.skid) {
      seen.add(car);
      const last = fx.last.get(car);
      if (last && (last[0] - ax) ** 2 + (last[1] - ay) ** 2 < 900) {
        fx.skids.push({ ax: last[0], ay: last[1], bx: ax, by: ay, cx: last[2], cy: last[3], dx: bx, dy: by, a: 1 });
      }
      fx.last.set(car, [ax, ay, bx, by]);
      if (car.drifting && Math.random() < 0.35) {
        fx.particles.push({ kind: 'smoke', x: (ax + bx) / 2, y: (ay + by) / 2, vx: (Math.random() - 0.5) * 30, vy: (Math.random() - 0.5) * 30, life: 0.9, max: 0.9, size: 10, color: 'rgba(225,225,230,1)' });
      }
    }
    for (const car of [...fx.last.keys()]) if (!seen.has(car)) fx.last.delete(car);
    if (fx.skids.length > 900) fx.skids.splice(0, fx.skids.length - 900);
    for (const s of fx.skids) s.a = Math.max(0, s.a - dt * 0.04);
    for (const [x, y, v] of race.fx.sparks) {
      for (let k = 0; k < 8; k += 1) {
        const a = Math.random() * Math.PI * 2;
        const sp = 120 + Math.random() * 260;
        fx.particles.push({ kind: 'spark', x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0.35, max: 0.35 });
      }
      if (active) cam.shake = Math.max(cam.shake, Math.min(14, v / 40));
    }
    const dust = race.track.def.theme.city ? 'rgba(160,160,160,1)' : 'rgba(205,190,140,1)';
    for (const [x, y] of race.fx.dust) {
      fx.particles.push({ kind: 'smoke', x, y, vx: (Math.random() - 0.5) * 40, vy: (Math.random() - 0.5) * 40, life: 0.8, max: 0.8, size: 9, color: dust });
    }
    for (const p of fx.particles) {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 0.96;
      p.vy *= 0.96;
    }
    fx.particles = fx.particles.filter((p) => p.life > 0);
    if (fx.particles.length > 500) fx.particles.splice(0, fx.particles.length - 500);
  }

  function follow(dt) {
    const p = race.player;
    cam.x = damp(cam.x, p.x, 14, dt);
    cam.y = damp(cam.y, p.y, 14, dt);
    cam.heading += angleDiff(cam.heading, p.heading) * Math.min(1, 4.5 * dt);
    cam.rot = -Math.PI / 2 - cam.heading;
    const frac = clamp(p.speed / 720, 0, 1);
    cam.zoom = damp(cam.zoom, cam.base * (1.25 - 0.45 * frac), 3, dt);
    cam.shake = damp(cam.shake, 0, 8, dt);
  }

  function finish() {
    reported = true;
    const res = results(race);
    const me = res.find((r) => r.player);
    const track = race.def;
    const p = race.player;
    const lapKey = `racer:bestlap:${track.id}`;
    const prevLap = loadNumber(lapKey, 0);
    if (p.bestLap && (!prevLap || p.bestLap < prevLap)) saveNumber(lapKey, Number(p.bestLap.toFixed(3)));
    const lapRecord = Math.min(p.bestLap || Infinity, prevLap || Infinity);
    let wins = loadNumber('racer', 0);

    if (race.mode === 'race') {
      if (me.pos === 1) {
        wins += 1;
        saveNumber('racer', wins);
      }
      api.over({
        title: me.pos === 1 ? 'Victory' : `${ord(me.pos)} place`,
        subtitle: `${track.name} · ${DIFFICULTY[race.difficulty].label}`,
        win: me.pos === 1,
        scoreText: fmtTime(me.time),
        scoreLabel: 'Race time',
        stats: [
          ...res.map((r) => [`${r.pos}. ${r.player ? 'You' : r.name}`, `${fmtTime(r.time)}${r.estimated ? ' est.' : ''}`]),
          ['Best lap', fmtTime(p.bestLap)],
          ['Drift points', race.driftTotal],
        ],
        best: { best: wins, isNew: false },
        bestText: `Lap record here ${fmtTime(Number.isFinite(lapRecord) ? lapRecord : null)} · Race wins ${wins}`,
      });
      return;
    }
    const ghostKey = `racer:ghost:${track.id}`;
    const old = race.ghost?.data;
    const isPB = !old || me.time < old.time;
    if (isPB) saveJSON(ghostKey, ghostOf(race));
    api.over({
      title: isPB ? (old ? 'New personal best' : 'First lap record set') : 'Time trial complete',
      subtitle: `${track.name} · ${LAPS} laps`,
      win: isPB,
      scoreText: fmtTime(me.time),
      scoreLabel: 'Total time',
      stats: [
        ['Best lap', fmtTime(p.bestLap)],
        ['Personal best', fmtTime(isPB ? me.time : old.time)],
        ['Vs ghost', old ? `${me.time - old.time <= 0 ? '−' : '+'}${Math.abs(me.time - old.time).toFixed(2)} s` : 'No ghost yet'],
        ['Drift points', race.driftTotal],
      ],
      best: { best: wins, isNew: false },
      bestText: isPB ? 'Your ghost on this track has been updated' : 'Your best run is still the ghost to beat',
    });
  }

  demo();

  return {
    reset(options) {
      opts = { ...DEFAULTS, ...(options || {}) };
      const ghost = opts.mode === 'trial' ? loadJSON(`racer:ghost:${opts.track}`) : null;
      race = createRace({ track: opts.track, mode: opts.mode, difficulty: opts.difficulty, ghost });
      bestLap = loadNumber(`racer:bestlap:${opts.track}`, 0) || null;
      active = true;
      reported = false;
      driftFlash = null;
      snapCamera();
    },

    update(dt) {
      stepRace(race, controls(), dt);
      if (race.fx.driftBank) driftFlash = { points: race.fx.driftBank, t: 0 };
      if (driftFlash) driftFlash.t += dt;
      if (race.player.hit > 0.28) cam.shake = Math.max(cam.shake, 8);
      effects(dt);
      follow(dt);
      if (race.done && !reported) finish();
    },

    idle(dt) {
      stepRace(race, drive(race.player, race.cars, race.track, dt), dt);
      effects(dt);
      follow(dt);
      if (race.cars.some((c) => c.finished)) demo();
    },

    resize(width, height) {
      view.width = width;
      view.height = height;
      // About a second of road ahead at top speed.
      cam.base = Math.max(0.5, Math.min(width, height * 1.25) / 1100);
      const pad = 16;
      const bottom = height - pad;
      if (width < 560) {
        // Narrow screens: steering on the left, pedals stacked on the right.
        buttons = [
          { id: 'left', label: 'LEFT', x: pad + 34, y: bottom - 38, r: 34, down: false },
          { id: 'right', label: 'RIGHT', x: pad + 34 + 80, y: bottom - 38, r: 34, down: false },
          { id: 'gas', label: 'GAS', x: width - pad - 40, y: bottom - 44, r: 40, down: false },
          { id: 'brake', label: 'BRAKE', x: width - pad - 40, y: bottom - 44 - 92, r: 30, down: false },
          { id: 'drift', label: 'DRIFT', x: width - pad - 40 - 84, y: bottom - 34, r: 28, down: false },
        ];
      } else {
        buttons = [
          { id: 'left', label: 'LEFT', x: pad + 46, y: bottom - 50, r: 42, down: false },
          { id: 'right', label: 'RIGHT', x: pad + 46 + 104, y: bottom - 50, r: 42, down: false },
          { id: 'gas', label: 'GAS', x: width - pad - 54, y: bottom - 56, r: 52, down: false },
          { id: 'brake', label: 'BRAKE', x: width - pad - 54 - 112, y: bottom - 40, r: 38, down: false },
          { id: 'drift', label: 'DRIFT', x: width - pad - 54, y: bottom - 56 - 112, r: 34, down: false },
        ];
      }
    },

    render(ctx, w, h, time) {
      renderRace(ctx, race, view, cam, { hud: active, touch: active && usingTouch, buttons, fx, time, driftFlash, bestLap });
    },
  };
}

