// Lost Horizons engine: movement input (keys, touch stick), interaction,
// journal and map screens, camera, autosave and the ending.

import { CLUES, ITEMS, exploredFraction, interact, nearbyInteractive, newGame, objective, relics, restore, shards, snapshot, update } from './game.js';
import { renderAdventure } from './render.js';
import { clamp, clock, damp } from '../shared/math.js';
import { loadJSON, loadNumber, removeKey, saveJSON, saveNumber } from '../shared/storage.js';

export const SAVE_KEY = 'adventure:save';
const STICK = 52;

export function createAdventure(api) {
  const { input } = api;
  const view = { width: 1, height: 1 };
  const cam = { x: 0, y: 0, scale: 1 };
  let g = newGame();
  let active = false;
  let reported = false;
  let usingTouch = false;
  let mapOpen = false;
  let stickId = null;
  let buttons = [];
  let saveT = 0;
  let lastSaved = '';

  const persist = () => {
    const snap = snapshot(g);
    const key = JSON.stringify(snap);
    if (key !== lastSaved) {
      saveJSON(SAVE_KEY, snap);
      lastSaved = key;
    }
  };

  const closeDialog = () => api.dialog.close();
  const say = (spec) => {
    if (!spec) return;
    api.dialog.open({ ...spec, choices: [{ id: 'ok', label: 'Continue', primary: true }], cancel: 'ok', onChoose: closeDialog });
  };

  function journal() {
    const clues = Object.keys(g.read).filter((k) => CLUES[k]);
    const body = [`Current objective: ${objective(g)}.`];
    for (const k of clues) body.push(`${CLUES[k].title}: ${CLUES[k].text[CLUES[k].text.length - 1]}`);
    if (!clues.length) body.push('No clues yet. Read logs, tablets and carvings to fill the journal.');
    const items = g.inv.filter((i) => !ITEMS[i].map && !ITEMS[i].relic && !ITEMS[i].shard).map((i) => ITEMS[i].name);
    api.dialog.open({
      eyebrow: 'Journal',
      title: 'Notes on Lost Horizons',
      body,
      rows: [
        ['Sun shards', `${shards(g)} of 3`],
        ['Secrets', `${relics(g)} of 3`],
        ['Explored', `${Math.round(exploredFraction(g) * 100)}%`],
        ['Carrying', items.join(', ') || 'Nothing yet'],
      ],
      choices: [{ id: 'close', label: 'Close journal', primary: true }],
      cancel: 'close',
      onChoose: closeDialog,
    });
  }

  function act() {
    if (api.dialog.isOpen() || g.ending) return;
    const it = nearbyInteractive(g);
    if (!it) return;
    say(interact(g, it));
    persist();
  }

  input.on('down', (p) => {
    usingTouch = p.type !== 'mouse';
    if (!usingTouch) return;
    for (const b of buttons) {
      if ((p.x - b.x) ** 2 + (p.y - b.y) ** 2 < (b.r + 10) ** 2) {
        b.down = true;
        if (b.id === 'act') act();
        if (b.id === 'map') mapOpen = !mapOpen;
        if (b.id === 'journal') journal();
        return;
      }
    }
    if (stickId === null && p.x < view.width * 0.6) stickId = p.id;
  });
  input.on('up', (p) => {
    if (p.id === stickId) stickId = null;
    for (const b of buttons) b.down = false;
  });

  function stick() {
    const p = stickId === null ? null : input.pointers.get(stickId);
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

  function snap() {
    cam.x = g.player.x;
    cam.y = g.player.y;
  }

  return {
    reset(options) {
      const data = options?.mode === 'continue' ? loadJSON(SAVE_KEY) : null;
      if (!data) removeKey(SAVE_KEY);
      g = data ? restore(data) : newGame();
      active = true;
      reported = false;
      mapOpen = false;
      lastSaved = '';
      snap();
      persist();
    },

    update(dt) {
      if (input.take('KeyM')) mapOpen = !mapOpen;
      if (input.take('KeyJ')) journal();
      if (input.take('KeyE', 'Space', 'Enter')) act();
      let { x, y } = input.axis();
      const s = stick();
      if (s && s.len > 6) {
        x = s.dx;
        y = s.dy;
      }
      if (mapOpen) {
        x = 0;
        y = 0;
      }
      update(g, { x, y }, dt);
      cam.x = damp(cam.x, g.player.x, 7, dt);
      cam.y = damp(cam.y, g.player.y, 7, dt);
      saveT += dt;
      if (saveT > 15) {
        saveT = 0;
        persist();
      }
      if (g.done && !reported) {
        reported = true;
        removeKey(SAVE_KEY);
        const n = loadNumber('adventure', 0) + 1;
        saveNumber('adventure', n);
        api.over({
          title: 'The beacon is lit',
          subtitle: 'Rescued from Lost Horizons',
          win: true,
          scoreText: clock(g.time),
          scoreLabel: 'Journey time',
          stats: [
            ['Island explored', `${Math.round(exploredFraction(g) * 100)}%`],
            ['Secrets found', `${relics(g)} of 3`],
            ['Clues read', Object.keys(g.read).length],
            ['Campfire rests', g.saves],
          ],
          best: { best: n, isNew: false },
        });
      }
    },

    idle(dt) {
      g.time += dt;
      cam.x = g.player.x + Math.cos(g.time * 0.15) * 140;
      cam.y = g.player.y - 80 + Math.sin(g.time * 0.15) * 60;
    },

    resize(width, height) {
      view.width = width;
      view.height = height;
      cam.scale = clamp(Math.min(width, height) / 560, 1, 1.6);
      const pad = 18;
      buttons = [
        { id: 'act', label: 'ACT', x: width - pad - 40, y: height - pad - 96, r: 36, down: false },
        { id: 'journal', label: 'LOG', x: width - pad - 24, y: height - pad - 168, r: 22, down: false },
        { id: 'map', label: 'MAP', x: width - pad - 24 - 54, y: height - pad - 168, r: 22, down: false },
      ];
    },

    render(ctx, w, h, time) {
      renderAdventure(ctx, g, view, cam, {
        hud: active,
        time,
        touch: active && usingTouch,
        buttons,
        stick: active && usingTouch ? stick() : null,
        near: active ? nearbyInteractive(g) : null,
        mapOpen,
      });
    },
  };
}
