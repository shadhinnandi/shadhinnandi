// Ring Pilot engine: keyboard, mouse-drag and touch steering, camera and drawing.

import { createWorld, resetWorld, updateWorld } from './world.js';
import { makeCamera, renderFlight } from './render.js';
import { clamp, clock, damp } from '../shared/math.js';
import { loadNumber } from '../shared/storage.js';

const STICK = 60;

export function createFlight(api) {
  const { input } = api;
  const world = createWorld();
  const view = { width: 1, height: 1 };
  let camX = 0;
  let camY = 12.4;
  let steerId = null;
  let usingTouch = false;
  let active = false;
  let reported = false;
  let best = loadNumber('flight', 0);

  input.on('down', (p) => {
    usingTouch = p.type !== 'mouse';
    if (steerId === null) steerId = p.id;
  });
  input.on('up', (p) => {
    if (p.id === steerId) steerId = null;
  });

  function stick() {
    const p = steerId === null ? null : input.pointers.get(steerId);
    if (!p) return null;
    let dx = p.x - p.startX;
    let dy = p.y - p.startY;
    const l = Math.hypot(dx, dy);
    if (l > STICK) {
      dx = (dx / l) * STICK;
      dy = (dy / l) * STICK;
    }
    return { sx: p.startX, sy: p.startY, x: p.startX + dx, y: p.startY + dy, dx: dx / STICK, dy: dy / STICK };
  }

  function intent() {
    const a = input.axis();
    let x = a.x;
    let y = -a.y;
    const s = stick();
    if (s) {
      x = s.dx;
      y = -s.dy;
    }
    const boost = input.down('ShiftLeft', 'ShiftRight') || input.pointers.size >= 2;
    return { x: clamp(x, -1, 1), y: clamp(y, -1, 1), boost };
  }

  return {
    reset() {
      resetWorld(world);
      active = true;
      reported = false;
      steerId = null;
      best = loadNumber('flight', 0);
    },
    update(dt) {
      updateWorld(world, intent(), dt);
      // Chase camera: a little above and behind, lagging slightly in turns.
      camX = damp(camX, world.plane.x * 0.85, 4, dt);
      camY = damp(camY, world.plane.y + 3.4, 4, dt);
      if (world.over && !reported) {
        reported = true;
        api.over({
          title: world.reason === 'Ran out of fuel' ? 'Out of fuel' : 'Shot down',
          subtitle: `${world.reason} on stage ${world.stage}`,
          score: Math.floor(world.score),
          stats: [
            ['Distance', `${(world.dist / 1000).toFixed(2)} km`],
            ['Rings', `${world.passed} of ${world.passed + world.missed}`],
            ['Best combo', `×${world.bestCombo}`],
            ['Flight time', clock(world.time)],
          ],
        });
      }
    },
    idle(dt) {
      world.time += dt;
      world.dist += 22 * dt;
      const pl = world.plane;
      pl.x = Math.sin(world.time * 0.5) * 4;
      pl.bank = -Math.cos(world.time * 0.5) * 0.25;
      camX = damp(camX, pl.x * 0.8, 4, dt);
    },
    resize(width, height) {
      view.width = width;
      view.height = height;
    },
    render(ctx) {
      const cam = makeCamera(view, camX, camY);
      renderFlight(ctx, world, view, cam, { hud: active, shake: !api.reducedMotion, best, touch: usingTouch, stick: active && usingTouch ? stick() : null });
    },
  };
}
