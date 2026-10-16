// Last Stand engine: turns keyboard, mouse and touch input into an intent,
// runs the world, moves the camera and draws a frame. See GameShell.jsx for
// the engine contract.

import { ARENA } from './config.js';
import { createWorld, resetWorld, updateWorld } from './world.js';
import { renderShooter } from './render.js';
import { clamp, clock, damp } from '../shared/math.js';

const STICK = 56;

export function createShooter(api) {
  const { input } = api;
  const world = createWorld();
  const view = { width: 1, height: 1 };
  const cam = { x: ARENA.w / 2, y: ARENA.h / 2, zoom: 1 };
  const touch = { move: null, aim: null, lastTap: 0, dash: false };
  let aim = -Math.PI / 2;
  let reported = false;
  let active = false;
  let usingTouch = false;

  input.on('down', (p) => {
    if (p.type === 'mouse') {
      usingTouch = false;
      return;
    }
    usingTouch = true;
    if (p.x < view.width / 2) {
      if (touch.move === null) {
        touch.move = p.id;
        const now = performance.now();
        if (now - touch.lastTap < 300) touch.dash = true;
        touch.lastTap = now;
      }
    } else if (touch.aim === null) {
      touch.aim = p.id;
    }
  });
  input.on('up', (p) => {
    if (p.id === touch.move) touch.move = null;
    if (p.id === touch.aim) touch.aim = null;
  });

  const toWorld = (sx, sy) => ({ x: cam.x + (sx - view.width / 2) / cam.zoom, y: cam.y + (sy - view.height / 2) / cam.zoom });

  function stick(id) {
    const p = id === null ? null : input.pointers.get(id);
    if (!p) return null;
    let dx = p.x - p.startX;
    let dy = p.y - p.startY;
    const l = Math.hypot(dx, dy);
    if (l > STICK) {
      dx = (dx / l) * STICK;
      dy = (dy / l) * STICK;
    }
    return { sx: p.startX, sy: p.startY, x: p.startX + dx, y: p.startY + dy, dx: dx / STICK, dy: dy / STICK, len: l };
  }

  function nearestEnemy(range) {
    const p = world.player;
    let best = null;
    let bd = range;
    for (const e of world.enemies) {
      const d = Math.hypot(e.x - p.x, e.y - p.y);
      if (d < bd) {
        bd = d;
        best = e;
      }
    }
    return best;
  }

  function intent() {
    const p = world.player;
    let { x: mx, y: my } = input.axis();
    const move = stick(touch.move);
    if (move && move.len > 6) {
      mx = move.dx;
      my = move.dy;
    }
    let fire = false;
    const aimStick = stick(touch.aim);
    if (aimStick) {
      fire = true;
      if (aimStick.len > 12) aim = Math.atan2(aimStick.dy, aimStick.dx);
      else {
        // A tap-and-hold without dragging aims at the nearest enemy.
        const e = nearestEnemy(650);
        if (e) aim = Math.atan2(e.y - p.y, e.x - p.x);
      }
    } else if (!usingTouch && input.mouse.seen) {
      const m = toWorld(input.mouse.x, input.mouse.y);
      aim = Math.atan2(m.y - p.y, m.x - p.x);
      fire = input.mouse.down;
    } else if (Math.hypot(mx, my) > 0.2) {
      aim = Math.atan2(my, mx);
    }
    const dash = input.take('Space', 'ShiftLeft', 'ShiftRight') || touch.dash;
    touch.dash = false;
    return { mx, my, aim, fire, dash };
  }

  function updateCamera(dt, tx, ty) {
    const halfW = view.width / 2 / cam.zoom;
    const halfH = view.height / 2 / cam.zoom;
    const fitX = ARENA.w + 160 <= halfW * 2;
    const fitY = ARENA.h + 160 <= halfH * 2;
    const x = fitX ? ARENA.w / 2 : clamp(tx, halfW - 80, ARENA.w - halfW + 80);
    const y = fitY ? ARENA.h / 2 : clamp(ty, halfH - 80, ARENA.h - halfH + 80);
    cam.x = damp(cam.x, x, 7, dt);
    cam.y = damp(cam.y, y, 7, dt);
  }

  return {
    reset() {
      resetWorld(world);
      aim = -Math.PI / 2;
      reported = false;
      active = true;
      touch.move = touch.aim = null;
      cam.x = world.player.x;
      cam.y = world.player.y;
    },

    update(dt) {
      updateWorld(world, intent(), dt);
      const p = world.player;
      updateCamera(dt, p.x + Math.cos(aim) * 70, p.y + Math.sin(aim) * 70);
      if (world.over && !reported) {
        reported = true;
        const acc = world.shotsFired ? Math.round((world.shotsHit / world.shotsFired) * 100) : 0;
        api.over({
          title: 'Game over',
          subtitle: `You fell on wave ${world.wave}`,
          score: world.score,
          stats: [
            ['Wave reached', world.wave],
            ['Survived', clock(world.clock)],
            ['Kills', world.kills],
            ['Accuracy', `${acc}%`],
          ],
        });
      }
    },

    idle(dt) {
      // Slow drift over the empty arena behind the start screen.
      world.time += dt;
      const t = world.time * 0.12;
      updateCamera(dt, ARENA.w / 2 + Math.cos(t) * 420, ARENA.h / 2 + Math.sin(t) * 260);
    },

    resize(width, height) {
      view.width = width;
      view.height = height;
      cam.zoom = clamp(Math.hypot(width, height) / 1350, 0.55, 1.25);
    },

    render(ctx) {
      const move = stick(touch.move);
      const aimStick = stick(touch.aim);
      renderShooter(ctx, world, view, cam, {
        hud: active,
        shake: !api.reducedMotion,
        touch: active && usingTouch ? { move, aim: aimStick } : null,
        mouse: active && !usingTouch && input.mouse.seen && input.mouse.inside ? input.mouse : null,
      });
    },
  };
}
