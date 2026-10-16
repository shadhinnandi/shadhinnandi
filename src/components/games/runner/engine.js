// Skyline Run engine: keyboard and swipe input, camera and drawing.

import { createWorld, resetWorld, score, updateWorld } from './world.js';
import { makeCamera, renderRunner } from './render.js';
import { clock, damp } from '../shared/math.js';
import { loadNumber } from '../shared/storage.js';

const SWIPE = 32;

export function createRunner(api) {
  const { input } = api;
  const world = createWorld();
  const view = { width: 1, height: 1 };
  const pending = { left: false, right: false, jump: false, slide: false };
  const anchors = new Map();
  let camX = 0;
  let active = false;
  let reported = false;
  let usingTouch = false;
  let best = loadNumber('runner', 0);

  // Swipes: each drag of SWIPE pixels triggers one move, so one long swipe
  // across the screen can change two lanes.
  function swipe(dx, dy) {
    if (Math.abs(dx) > Math.abs(dy)) pending[dx < 0 ? 'left' : 'right'] = true;
    else pending[dy < 0 ? 'jump' : 'slide'] = true;
  }
  input.on('down', (p) => {
    usingTouch = p.type !== 'mouse';
    anchors.set(p.id, { x: p.x, y: p.y, used: false });
  });
  input.on('move', (p) => {
    const a = anchors.get(p.id);
    if (!a) return;
    const dx = p.x - a.x;
    const dy = p.y - a.y;
    if (Math.hypot(dx, dy) > SWIPE) {
      swipe(dx, dy);
      anchors.set(p.id, { x: p.x, y: p.y, used: true });
    }
  });
  input.on('up', (p) => {
    const a = anchors.get(p.id);
    anchors.delete(p.id);
    if (!a || a.used) return;
    const dx = p.x - a.x;
    const dy = p.y - a.y;
    if (Math.hypot(dx, dy) > SWIPE * 0.6) swipe(dx, dy);
  });

  function intent() {
    const i = {
      left: pending.left || input.take('ArrowLeft', 'KeyA'),
      right: pending.right || input.take('ArrowRight', 'KeyD'),
      jump: pending.jump || input.take('ArrowUp', 'KeyW', 'Space'),
      slide: pending.slide || input.take('ArrowDown', 'KeyS'),
    };
    pending.left = pending.right = pending.jump = pending.slide = false;
    return i;
  }

  return {
    reset() {
      resetWorld(world);
      active = true;
      reported = false;
      camX = 0;
      best = loadNumber('runner', 0);
    },
    update(dt) {
      updateWorld(world, intent(), dt);
      camX = damp(camX, world.player.x * 0.7, 6, dt);
      if (world.over && !reported) {
        reported = true;
        api.over({
          title: 'Wiped out',
          subtitle: `You ran ${Math.floor(world.dist).toLocaleString('en-US')} m`,
          score: score(world),
          stats: [
            ['Distance', `${Math.floor(world.dist).toLocaleString('en-US')} m`],
            ['Coins', world.collected],
            ['Top speed', `${Math.round(world.topSpeed * 3.6)} km/h`],
            ['Time', clock(world.time)],
          ],
        });
      }
    },
    idle(dt) {
      world.dist += 9 * dt;
      world.time += dt;
      world.player.stride += 9 * dt * 0.42;
    },
    resize(width, height) {
      view.width = width;
      view.height = height;
    },
    render(ctx) {
      const cam = makeCamera(view, camX);
      renderRunner(ctx, world, view, cam, { hud: active, shake: !api.reducedMotion, best, touch: usingTouch });
    },
  };
}

