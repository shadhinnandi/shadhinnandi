// Eight Ball engine: input, the computer's turn, animation and drawing.
// Rules live in match.js / rules.js, physics in physics.js, the opponent's
// shot planning in ai.js.
//
// Controls
//   mouse   move to aim; press, pull back and release to shoot
//   touch   drag on the table to aim; pull the power slider down and release
//   keys    left/right (A/D) aim, hold Shift for fine aim; up/down power; Space shoots
//   ball in hand: drag the white ball

import { HEAD_X, R, TABLE, freeSpot, moving, settling, step } from './physics.js';
import { beginShot, cueBall, finishShot, newMatch } from './match.js';
import { choosePlacement, planShot } from './ai.js';
import { renderPool, FRAME } from './render.js';
import { angleDiff, clamp } from '../shared/math.js';
import { loadNumber, saveNumber } from '../shared/storage.js';

const HUD = 64;
const PAD = 14;
const SLIDER_W = 56;
const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;

export function createPool(api) {
  const { input } = api;
  const view = { width: 1, height: 1, scale: 1, cx: 0, cy: 0, rotated: false, slider: { x: 0, y: 0, w: 0, h: 0 } };
  let m = newMatch();
  const ui = {
    phase: 'aim', // aim | rolling | over
    aim: 0,
    power: 0,
    charging: null,
    dragCue: null,
    slider: null,
    touchAim: null,
    message: null,
    ai: null,
    overT: 0,
    reported: false,
    time: 0,
    strike: 0,
    sparks: [],
    usingTouch: false,
    active: false,
  };

  const say = (text, tone = 'info', life = 3.2) => {
    ui.message = { text, tone, t: 0, life };
  };

  function resetAll() {
    m = newMatch();
    Object.assign(ui, { phase: 'aim', aim: 0, power: 0, charging: null, dragCue: null, slider: null, touchAim: null, ai: null, overT: 0, reported: false, strike: 0, sparks: [] });
    say('Your break. Drag the white ball behind the line if you like, then shoot', 'info', 5);
  }

  // ---------- coordinates ----------

  function toWorld(sx, sy) {
    const dx = (sx - view.cx) / view.scale;
    const dy = (sy - view.cy) / view.scale;
    return view.rotated ? { x: TABLE.w / 2 + dy, y: TABLE.h / 2 - dx } : { x: TABLE.w / 2 + dx, y: TABLE.h / 2 + dy };
  }
  function toScreen(x, y) {
    const a = (x - TABLE.w / 2) * view.scale;
    const b = (y - TABLE.h / 2) * view.scale;
    return view.rotated ? { x: view.cx - b, y: view.cy + a } : { x: view.cx + a, y: view.cy + b };
  }
  const inSlider = (p) => {
    const s = view.slider;
    return p.x >= s.x - 16 && p.x <= s.x + s.w + 16 && p.y >= s.y - 16 && p.y <= s.y + s.h + 16;
  };

  const playerTurn = () => ui.phase === 'aim' && m.turn === 'player' && !m.result;

  // ---------- player input ----------

  function shoot(who, angle, power) {
    beginShot(m, who, angle, power);
    ui.phase = 'rolling';
    ui.power = 0;
    ui.strike = 0.1;
    ui.charging = ui.slider = ui.dragCue = ui.touchAim = null;
    ui.message = null;
  }

  function placeCue(w) {
    const cue = cueBall(m);
    const maxX = m.kitchen ? HEAD_X - R * 0.2 : TABLE.w - R;
    const x = clamp(w.x, R, maxX);
    const y = clamp(w.y, R, TABLE.h - R);
    if (freeSpot(m.balls, x, y, 0)) {
      cue.x = x;
      cue.y = y;
    }
  }

  input.on('down', (p) => {
    ui.usingTouch = p.type !== 'mouse';
    if (!playerTurn()) return;
    if (inSlider(p)) {
      ui.slider = { id: p.id, y0: p.y };
      ui.power = 0;
      return;
    }
    const w = toWorld(p.x, p.y);
    const cue = cueBall(m);
    if (m.ballInHand && Math.hypot(w.x - cue.x, w.y - cue.y) < R * 2.8) {
      ui.dragCue = p.id;
      return;
    }
    ui.aim = Math.atan2(w.y - cue.y, w.x - cue.x);
    if (p.type === 'mouse') {
      if (p.button === 0) {
        ui.charging = { id: p.id, x: w.x, y: w.y };
        ui.power = 0;
      }
    } else {
      ui.touchAim = p.id;
    }
  });

  input.on('move', (p) => {
    if (!playerTurn()) return;
    const w = toWorld(p.x, p.y);
    const cue = cueBall(m);
    if (ui.dragCue !== null && ui.dragCue === p.id) {
      placeCue(w);
      return;
    }
    if (ui.slider && ui.slider.id === p.id) {
      ui.power = clamp((p.y - ui.slider.y0) / (view.slider.h * 0.85), 0, 1);
      return;
    }
    if (ui.charging && ui.charging.id === p.id) {
      const pull = -((w.x - ui.charging.x) * Math.cos(ui.aim) + (w.y - ui.charging.y) * Math.sin(ui.aim));
      ui.power = clamp(pull / 260, 0, 1);
      return;
    }
    if (ui.touchAim === p.id || (p.hover && p.type === 'mouse')) {
      if (Math.hypot(w.x - cue.x, w.y - cue.y) > R) ui.aim = Math.atan2(w.y - cue.y, w.x - cue.x);
    }
  });

  input.on('up', (p) => {
    if (ui.dragCue === p.id) ui.dragCue = null;
    else if (ui.slider && ui.slider.id === p.id) {
      const power = ui.power;
      ui.slider = null;
      if (power > 0.03 && playerTurn()) shoot('player', ui.aim, power);
      else ui.power = 0;
    } else if (ui.charging && ui.charging.id === p.id) {
      const power = ui.power;
      ui.charging = null;
      if (power > 0.03 && playerTurn()) shoot('player', ui.aim, power);
      else ui.power = 0;
    } else if (ui.touchAim === p.id) ui.touchAim = null;
  });

  function keyboard(dt) {
    const fine = input.down('ShiftLeft', 'ShiftRight') ? 0.12 : 0.9;
    if (input.down('ArrowLeft', 'KeyA')) ui.aim -= fine * dt;
    if (input.down('ArrowRight', 'KeyD')) ui.aim += fine * dt;
    if (!ui.charging && !ui.slider) {
      if (input.down('ArrowUp', 'KeyW')) ui.power = clamp(ui.power + 0.7 * dt, 0, 1);
      if (input.down('ArrowDown', 'KeyS')) ui.power = clamp(ui.power - 0.7 * dt, 0, 1);
    }
    if (input.take('Space')) shoot('player', ui.aim, ui.power > 0.03 ? ui.power : 0.5);
  }

  // ---------- computer turn ----------

  function startAi() {
    ui.ai = { stage: m.ballInHand ? 'place' : 'think', t: 0, gen: null, plan: null, from: null, to: null };
    say(m.ballInHand ? 'Computer has ball in hand' : 'Computer is thinking', 'ai', 2);
  }

  function aiUpdate(dt) {
    const a = ui.ai;
    a.t += dt;
    const cue = cueBall(m);
    if (a.stage === 'place') {
      if (!a.to) {
        a.to = choosePlacement(m.balls, m.groups.ai, m.kitchen);
        a.from = { x: cue.x, y: cue.y };
        a.t = 0;
      }
      const k = ease(Math.min(1, a.t / 0.7));
      cue.x = a.from.x + (a.to.x - a.from.x) * k;
      cue.y = a.from.y + (a.to.y - a.from.y) * k;
      if (k >= 1) {
        m.ballInHand = false;
        Object.assign(a, { stage: 'think', t: 0, from: null, to: null });
      }
    } else if (a.stage === 'think') {
      if (!a.gen) a.gen = planShot(m.balls, m.groups.ai, m.isBreak);
      for (let i = 0; i < 4 && !a.plan; i += 1) {
        const r = a.gen.next();
        if (r.done) a.plan = r.value;
      }
      if (a.plan && a.t > 0.8) {
        // Human-like error: a fraction of a degree, a little more on long shots.
        const angle = a.plan.angle + gauss() * 0.011;
        Object.assign(a, { stage: 'aim', t: 0, from: ui.aim, to: angle, power: clamp(a.plan.power * (1 + gauss() * 0.05), 0.12, 1) });
      }
    } else if (a.stage === 'aim') {
      const k = ease(Math.min(1, a.t / 0.85));
      ui.aim = a.from + angleDiff(a.from, a.to) * k;
      if (k >= 1) Object.assign(a, { stage: 'pull', t: 0 });
    } else if (a.stage === 'pull') {
      ui.power = a.power * ease(Math.min(1, a.t / 0.5));
      if (a.t > 0.65) {
        ui.ai = null;
        shoot('ai', a.to, a.power);
      }
    }
  }

  // ---------- flow ----------

  function afterShot() {
    const msg = finishShot(m);
    if (m.result) {
      ui.phase = 'over';
      ui.overT = 1.3;
      say(msg.text, m.result.winner === 'player' ? 'good' : 'foul', 3);
      return;
    }
    ui.phase = 'aim';
    say(msg.text, msg.tone);
    if (m.turn === 'ai') startAi();
  }

  function report() {
    ui.reported = true;
    const win = m.result.winner === 'player';
    const wins = loadNumber('pool', 0) + (win ? 1 : 0);
    if (win) saveNumber('pool', wins);
    api.over({
      title: win ? 'You win' : 'You lose',
      subtitle: m.result.reason,
      win,
      stats: [
        ['Your shots', m.shots.player],
        ['Balls you potted', m.potted.player],
        ['Computer potted', m.potted.ai],
        ['Your fouls', m.fouls.player],
      ],
      best: { best: wins, isNew: false },
    });
  }

  resetAll();

  return {
    reset() {
      resetAll();
      ui.active = true;
    },

    update(dt) {
      ui.time += dt;
      if (ui.message) {
        ui.message.t += dt;
        if (ui.message.t > ui.message.life) ui.message = null;
      }
      ui.strike = Math.max(0, ui.strike - dt);
      for (const s of ui.sparks) s.t -= dt;
      ui.sparks = ui.sparks.filter((s) => s.t > 0);

      if (ui.phase === 'rolling') {
        step(m.balls, dt, m.ev);
        for (const h of m.ev.hits) if (h.v > 120) ui.sparks.push({ x: h.x, y: h.y, t: 0.25, a: Math.min(1, h.v / 900) });
        m.ev.hits.length = 0;
        if (!moving(m.balls) && !settling(m.balls)) afterShot();
      } else if (ui.phase === 'aim') {
        if (m.turn === 'player') keyboard(dt);
        else if (ui.ai) aiUpdate(dt);
      } else if (ui.phase === 'over') {
        ui.overT -= dt;
        if (ui.overT <= 0 && !ui.reported) report();
      }
    },

    resize(width, height) {
      view.width = width;
      view.height = height;
      view.rotated = height > width * 1.05;
      const outerW = TABLE.w + FRAME * 2;
      const outerH = TABLE.h + FRAME * 2;
      const availW = width - PAD * 2 - SLIDER_W;
      const availH = height - HUD - PAD * 2;
      view.scale = view.rotated ? Math.min(availW / outerH, availH / outerW) : Math.min(availW / outerW, availH / outerH);
      view.cx = PAD + availW / 2;
      view.cy = HUD + PAD + availH / 2;
      const sh = Math.min(availH - 40, 320);
      view.slider = { x: width - PAD - 30, y: view.cy - sh / 2, w: 22, h: sh };
    },

    render(ctx) {
      renderPool(ctx, m, ui, view, { toScreen, playerTurn: playerTurn(), hud: ui.active });
    },
  };
}
