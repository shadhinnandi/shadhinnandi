// Last Train Home engine: driving controls, station menus and choices
// (through the shell's dialog), the route map and travel log, saving and
// the ending.

import { choose, newGame, score, stationMenu, update } from './game.js';
import { STATIONS } from './world.js';
import { renderTrain } from './render.js';
import { loadJSON, loadNumber, removeKey, saveJSON, saveNumber } from '../shared/storage.js';

export const SAVE_KEY = 'train:save';

export function createTrain(api) {
  const { input } = api;
  const view = { width: 1, height: 1 };
  let g = newGame();
  let active = false;
  let reported = false;
  let usingTouch = false;
  let mapOpen = false;
  let buttons = [];
  let idleScroll = 0;

  const save = () => {
    if (g.over) return;
    const { toasts, hold, warn, ...rest } = g;
    saveJSON(SAVE_KEY, rest);
  };

  function show(spec) {
    if (!spec) {
      api.dialog.close();
      return;
    }
    api.dialog.open({
      ...spec,
      onChoose: (id) => {
        const next = choose(g, id);
        save();
        if (next) show(next);
        else {
          api.dialog.close();
          if (g.phase === 'station' && !g.over) show(stationMenu(g));
        }
      },
    });
  }

  function travelLog() {
    const entries = g.log.slice(-9).map((e) => e.text);
    api.dialog.open({
      eyebrow: 'Travel log',
      title: 'The journey so far',
      body: entries,
      rows: [
        ['Stations visited', g.visited.length],
        ['Letter pages', `${g.fragments.length} of 3`],
        ['Distance', `${Math.round(g.km)} km`],
      ],
      choices: [{ id: 'close', label: 'Close the log', primary: true }],
      cancel: 'close',
      onChoose: () => {
        api.dialog.close();
        if (g.phase === 'station') show(stationMenu(g));
      },
    });
  }

  input.on('down', (p) => {
    usingTouch = p.type !== 'mouse';
    if (!usingTouch) return;
    for (const b of buttons) {
      if ((p.x - b.x) ** 2 + (p.y - b.y) ** 2 < (b.r + 10) ** 2) {
        if (b.id === 'map') mapOpen = !mapOpen;
        if (b.id === 'log') travelLog();
      }
    }
  });

  function controls() {
    let up = input.down('ArrowUp', 'KeyW');
    let down = input.down('ArrowDown', 'KeyS');
    let brake = input.down('Space');
    for (const b of buttons) b.down = false;
    for (const p of input.pointers.values()) {
      for (const b of buttons) {
        if ((p.x - b.x) ** 2 + (p.y - b.y) ** 2 < (b.r + 10) ** 2) b.down = true;
      }
    }
    for (const b of buttons) {
      if (!b.down) continue;
      if (b.id === 'up') up = true;
      if (b.id === 'down') down = true;
      if (b.id === 'brake') brake = true;
    }
    return { up, down, brake };
  }

  return {
    reset(options) {
      const data = options?.mode === 'continue' ? loadJSON(SAVE_KEY) : null;
      if (!data) removeKey(SAVE_KEY);
      g = data ? { ...newGame(), ...data, toasts: [], hold: null, warn: null } : newGame();
      active = true;
      reported = false;
      mapOpen = false;
      if (g.phase === 'station') show(stationMenu(g));
      else if (g.phase === 'travel') {
        g.speed = 0;
        g.throttle = 0;
      }
      save();
    },

    update(dt) {
      if (input.take('KeyM')) mapOpen = !mapOpen;
      if (input.take('KeyL')) travelLog();
      if (g.crash > 0) g.crash = Math.max(0, g.crash - dt);
      update(g, mapOpen ? { up: false, down: false, brake: true } : controls(), dt);
      if (g.hold && !api.dialog.isOpen()) {
        const spec = g.hold;
        g.hold = null;
        show(spec);
        save();
      }
      if (g.over && !reported) {
        reported = true;
        removeKey(SAVE_KEY);
        const arrived = g.over.reason === 'arrived';
        const n = loadNumber('train', 0) + (arrived ? 1 : 0);
        if (arrived) saveNumber('train', n);
        api.over({
          title: arrived ? (g.fragments.length === 3 ? 'The whole letter, home' : 'Home to Northwatch') : 'Stranded',
          subtitle: arrived ? `Arrived ${g.hours <= 36 ? 'before the pass closed' : 'as the pass closed'}` : `Between ${STATIONS[g.station].name} and the next stop`,
          win: arrived,
          score: arrived ? score(g) : undefined,
          scoreLabel: 'Journey score',
          stats: [
            ['Letter pages', `${g.fragments.length} of 3`],
            ['Stations visited', g.visited.length],
            ['Deliveries', g.deliveries],
            ['Distance', `${Math.round(g.km)} km`],
          ],
          best: { best: n, isNew: false },
        });
      }
    },

    idle(dt) {
      idleScroll += dt * 0.35;
      g.hours = (g.hours + dt * 0.05) % 24;
    },

    resize(width, height) {
      view.width = width;
      view.height = height;
      const pad = 18;
      const by = height - pad - (width < 640 ? 120 : 110);
      buttons = [
        { id: 'up', label: 'FASTER', x: width - pad - 46, y: by - 20, r: 36 },
        { id: 'down', label: 'SLOWER', x: width - pad - 46 - 88, y: by + 16, r: 30 },
        { id: 'brake', label: 'BRAKE', x: width - pad - 46, y: by + 64, r: 32 },
        { id: 'map', label: 'MAP', x: width - pad - 24, y: 104, r: 20 },
        { id: 'log', label: 'LOG', x: width - pad - 24 - 50, y: 104, r: 20 },
      ].map((b) => ({ ...b, down: false }));
    },

    render(ctx, w, h, time) {
      renderTrain(ctx, g, view, { hud: active, time, touch: active && usingTouch, buttons, mapOpen, smoke: true, idleScroll: active ? 0 : idleScroll });
    },
  };
}
