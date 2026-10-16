// Drawing for Last Stand. Everything is procedural Canvas 2D: no images.
// World space is drawn through the camera; the HUD is drawn in screen space.

import { ARENA, ENEMIES, PILLARS, PLAYER } from './config.js';
import { POWER_COLORS, comboMultiplier } from './world.js';
import { TAU, bar, clamp, clock, fmt, hudText, roundRect } from '../shared/math.js';

const FLOOR = '#10141c';
const FLOOR_ALT = '#121722';
const GRID = 'rgba(120,140,180,0.07)';
const GRID_MAJOR = 'rgba(120,140,180,0.13)';
const PLAYER_COLOR = '#5ee6ff';

const hash = (i, j) => {
  const s = Math.sin(i * 127.1 + j * 311.7) * 43758.5453;
  return s - Math.floor(s);
};

export function renderShooter(ctx, w, view, cam, opts) {
  const { width, height } = view;
  ctx.fillStyle = '#06080b';
  ctx.fillRect(0, 0, width, height);

  const sx = opts.shake ? (Math.random() - 0.5) * w.shake : 0;
  const sy = opts.shake ? (Math.random() - 0.5) * w.shake : 0;

  ctx.save();
  ctx.translate(width / 2 + sx, height / 2 + sy);
  ctx.scale(cam.zoom, cam.zoom);
  ctx.translate(-cam.x, -cam.y);

  const halfW = width / 2 / cam.zoom;
  const halfH = height / 2 / cam.zoom;
  const vis = { x0: cam.x - halfW - 40, y0: cam.y - halfH - 40, x1: cam.x + halfW + 40, y1: cam.y + halfH + 40 };

  drawFloor(ctx, vis, w.time);
  drawMarks(ctx, w);
  drawSpawns(ctx, w);
  drawPickups(ctx, w);
  drawPillars(ctx);
  for (const e of w.enemies) drawEnemyShadow(ctx, e);
  if (w.player.alive) drawShadow(ctx, w.player.x, w.player.y, w.player.r);
  drawShots(ctx, w);
  for (const e of w.enemies) drawEnemy(ctx, e, w);
  drawParticles(ctx, w, 'under');
  if (w.player.alive) drawPlayer(ctx, w.player, w.time);
  drawBullets(ctx, w);
  drawParticles(ctx, w, 'over');
  drawTexts(ctx, w);
  ctx.restore();

  if (opts.hud) drawHud(ctx, w, view, cam, opts);
}

// ---------- arena ----------

function drawFloor(ctx, vis, time) {
  const T = 100;
  ctx.fillStyle = FLOOR;
  ctx.fillRect(0, 0, ARENA.w, ARENA.h);

  const i0 = Math.max(0, Math.floor(vis.x0 / T));
  const j0 = Math.max(0, Math.floor(vis.y0 / T));
  const i1 = Math.min(ARENA.w / T - 1, Math.floor(vis.x1 / T));
  const j1 = Math.min(ARENA.h / T - 1, Math.floor(vis.y1 / T));

  // Panels: slight tone variation, a few with vents or bolts.
  for (let i = i0; i <= i1; i += 1) {
    for (let j = j0; j <= j1; j += 1) {
      const h = hash(i, j);
      if (h > 0.55) {
        ctx.fillStyle = FLOOR_ALT;
        ctx.fillRect(i * T + 2, j * T + 2, T - 4, T - 4);
      }
      if (h > 0.93) {
        ctx.strokeStyle = 'rgba(140,160,200,0.08)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let k = 0; k < 4; k += 1) {
          ctx.moveTo(i * T + 28, j * T + 34 + k * 11);
          ctx.lineTo(i * T + 72, j * T + 34 + k * 11);
        }
        ctx.stroke();
      } else if (h < 0.08) {
        ctx.fillStyle = 'rgba(140,160,200,0.10)';
        for (const [bx, by] of [
          [10, 10],
          [90, 10],
          [10, 90],
          [90, 90],
        ]) {
          ctx.fillRect(i * T + bx - 2, j * T + by - 2, 4, 4);
        }
      }
    }
  }

  ctx.lineWidth = 2;
  ctx.strokeStyle = GRID;
  ctx.beginPath();
  for (let i = i0; i <= i1 + 1; i += 1) {
    if (i % 5 === 0) continue;
    ctx.moveTo(i * T, Math.max(0, vis.y0));
    ctx.lineTo(i * T, Math.min(ARENA.h, vis.y1));
  }
  for (let j = j0; j <= j1 + 1; j += 1) {
    if (j % 5 === 0) continue;
    ctx.moveTo(Math.max(0, vis.x0), j * T);
    ctx.lineTo(Math.min(ARENA.w, vis.x1), j * T);
  }
  ctx.stroke();
  ctx.strokeStyle = GRID_MAJOR;
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i <= ARENA.w; i += T * 5) {
    ctx.moveTo(i, 0);
    ctx.lineTo(i, ARENA.h);
  }
  for (let j = 0; j <= ARENA.h; j += T * 5) {
    ctx.moveTo(0, j);
    ctx.lineTo(ARENA.w, j);
  }
  ctx.stroke();

  // Centre ring
  ctx.strokeStyle = 'rgba(94,230,255,0.08)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(ARENA.w / 2, ARENA.h / 2, 150, 0, TAU);
  ctx.stroke();
  ctx.setLineDash([18, 22]);
  ctx.beginPath();
  ctx.arc(ARENA.w / 2, ARENA.h / 2, 190, time * 0.05, time * 0.05 + TAU);
  ctx.stroke();
  ctx.setLineDash([]);

  // Hazard band and wall
  const band = 34;
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, ARENA.w, ARENA.h);
  ctx.rect(band, band, ARENA.w - band * 2, ARENA.h - band * 2);
  ctx.clip('evenodd');
  ctx.fillStyle = 'rgba(255,190,80,0.05)';
  ctx.fillRect(0, 0, ARENA.w, ARENA.h);
  ctx.strokeStyle = 'rgba(255,190,80,0.10)';
  ctx.lineWidth = 12;
  ctx.beginPath();
  for (let k = -ARENA.h; k < ARENA.w; k += 44) {
    ctx.moveTo(k, 0);
    ctx.lineTo(k + ARENA.h, ARENA.h);
  }
  ctx.stroke();
  ctx.restore();

  ctx.lineWidth = 16;
  ctx.strokeStyle = '#1d2433';
  ctx.strokeRect(-8, -8, ARENA.w + 16, ARENA.h + 16);
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(94,230,255,0.35)';
  ctx.strokeRect(1, 1, ARENA.w - 2, ARENA.h - 2);
}

function drawMarks(ctx, w) {
  for (const m of w.marks.items) {
    if (!m.alive) continue;
    ctx.globalAlpha = clamp(m.life / 4, 0, 1) * 0.9;
    ctx.fillStyle = m.color;
    ctx.beginPath();
    for (let k = 0; k < 9; k += 1) {
      const a = m.rot + (k / 9) * TAU;
      const r = m.r * (0.65 + 0.35 * Math.abs(Math.sin(k * 2.3 + m.rot)));
      if (k === 0) ctx.moveTo(m.x + Math.cos(a) * r, m.y + Math.sin(a) * r);
      else ctx.lineTo(m.x + Math.cos(a) * r, m.y + Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawSpawns(ctx, w) {
  for (const s of w.spawns) {
    const t = 1 - s.t / s.max;
    const color = ENEMIES[s.type].color;
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.globalAlpha = 0.3 + t * 0.7;
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 8]);
    ctx.rotate(w.time * 3);
    ctx.beginPath();
    ctx.arc(0, 0, 34 - t * 16, 0, TAU);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = color;
    ctx.globalAlpha = t * 0.5;
    ctx.beginPath();
    ctx.arc(0, 0, 6 + t * 10, 0, TAU);
    ctx.fill();
    ctx.restore();
  }
}

function drawPillars(ctx) {
  for (const p of PILLARS) {
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.beginPath();
    ctx.ellipse(p.x + 10, p.y + 14, p.r * 1.02, p.r * 0.98, 0, 0, TAU);
    ctx.fill();
    const g = ctx.createRadialGradient(p.x - p.r * 0.35, p.y - p.r * 0.4, p.r * 0.1, p.x, p.y, p.r);
    g.addColorStop(0, '#3a4560');
    g.addColorStop(1, '#1b2130');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, TAU);
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#4b5878';
    ctx.stroke();
    ctx.strokeStyle = 'rgba(94,230,255,0.25)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r * 0.62, 0, TAU);
    ctx.stroke();
    ctx.fillStyle = 'rgba(94,230,255,0.35)';
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, TAU);
    ctx.fill();
  }
}

function drawShadow(ctx, x, y, r) {
  ctx.fillStyle = 'rgba(0,0,0,0.38)';
  ctx.beginPath();
  ctx.ellipse(x + 4, y + 7, r * 1.05, r * 0.9, 0, 0, TAU);
  ctx.fill();
}

function drawEnemyShadow(ctx, e) {
  const s = 1 - e.spawnIn / 0.35;
  drawShadow(ctx, e.x, e.y, e.r * s);
}

// ---------- pickups ----------

function drawPickups(ctx, w) {
  for (const k of w.pickups) {
    if (k.t < 3 && Math.floor(k.t * 8) % 2 === 0) continue;
    const color = POWER_COLORS[k.kind];
    const y = k.y + Math.sin(k.bob) * 3;
    ctx.save();
    ctx.translate(k.x, y);
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.16 + Math.sin(k.bob * 2) * 0.05;
    ctx.beginPath();
    ctx.arc(0, 0, 24, 0, TAU);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#0d1118';
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    roundRect(ctx, -13, -13, 26, 26, 7);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    if (k.kind === 'health') {
      ctx.fillRect(-2.5, -7, 5, 14);
      ctx.fillRect(-7, -2.5, 14, 5);
    } else if (k.kind === 'rapid') {
      ctx.beginPath();
      ctx.moveTo(-6, -6);
      ctx.lineTo(-1, 0);
      ctx.lineTo(-6, 6);
      ctx.moveTo(1, -6);
      ctx.lineTo(6, 0);
      ctx.lineTo(1, 6);
      ctx.stroke();
    } else if (k.kind === 'spread') {
      ctx.beginPath();
      ctx.moveTo(-6, 5);
      ctx.lineTo(-7, -6);
      ctx.moveTo(0, 6);
      ctx.lineTo(0, -7);
      ctx.moveTo(6, 5);
      ctx.lineTo(7, -6);
      ctx.stroke();
    } else {
      ctx.beginPath();
      for (let i = 0; i < 6; i += 1) {
        const a = (i / 6) * TAU - Math.PI / 2;
        ctx.lineTo(Math.cos(a) * 7, Math.sin(a) * 7);
      }
      ctx.closePath();
      ctx.stroke();
    }
    ctx.restore();
  }
}

// ---------- characters ----------

function drawPlayer(ctx, p, time) {
  if (p.invuln > 0 && p.dashT <= 0 && Math.floor(time * 24) % 2 === 0) return;
  ctx.save();
  ctx.translate(p.x, p.y);

  if (p.power.shield > 0) {
    const fade = p.power.shield < 2 ? 0.5 + 0.5 * Math.sin(time * 20) : 1;
    ctx.globalAlpha = 0.22 * fade;
    ctx.fillStyle = POWER_COLORS.shield;
    ctx.beginPath();
    ctx.arc(0, 0, p.r + 14, 0, TAU);
    ctx.fill();
    ctx.globalAlpha = 0.8 * fade;
    ctx.strokeStyle = POWER_COLORS.shield;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  ctx.rotate(p.angle);
  const kick = p.recoil * 4;

  // Gun
  ctx.fillStyle = '#2b3a4d';
  roundRect(ctx, p.r - 6 - kick, -5, 22, 10, 3);
  ctx.fill();
  ctx.fillStyle = '#c8d6e8';
  ctx.fillRect(p.r + 10 - kick, -2.5, 6, 5);

  // Shoulders and body
  ctx.fillStyle = '#16212e';
  ctx.beginPath();
  ctx.ellipse(-2, 0, p.r * 0.75, p.r * 1.12, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = p.flash > 0 ? '#ffffff' : '#1f3346';
  ctx.beginPath();
  ctx.arc(0, 0, p.r, 0, TAU);
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = PLAYER_COLOR;
  ctx.stroke();
  // Visor
  ctx.fillStyle = PLAYER_COLOR;
  ctx.beginPath();
  ctx.arc(0, 0, p.r * 0.55, -0.7, 0.7);
  ctx.lineTo(0, 0);
  ctx.closePath();
  ctx.fill();

  if (p.muzzle > 0) {
    ctx.globalCompositeOperation = 'lighter';
    // Stays near full brightness for most of its short life, then snaps off.
    const m = Math.min(1, (p.muzzle / 0.06) * 1.6);
    const mx = p.r + 18 - kick;
    ctx.fillStyle = `rgba(255,170,70,${0.4 * m})`;
    ctx.beginPath();
    ctx.arc(mx, 0, 16, 0, TAU);
    ctx.fill();
    ctx.fillStyle = `rgba(255,226,150,${m})`;
    ctx.beginPath();
    for (let i = 0; i < 8; i += 1) {
      const a = (i / 8) * TAU;
      const r = i % 2 === 0 ? 10 * m + 5 : 3.5;
      ctx.lineTo(mx + Math.cos(a) * r * (i === 0 ? 1.8 : 1), Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = `rgba(255,255,240,${m})`;
    ctx.beginPath();
    ctx.arc(mx, 0, 3.5, 0, TAU);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }
  ctx.restore();
}

function polygon(ctx, sides, r, rot = 0) {
  ctx.beginPath();
  for (let i = 0; i < sides; i += 1) {
    const a = rot + (i / sides) * TAU;
    ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  ctx.closePath();
}

function drawEnemy(ctx, e, w) {
  const def = ENEMIES[e.type];
  const s = 1 - e.spawnIn / 0.35;
  const fill = e.flash > 0 ? '#ffffff' : '#141922';
  const color = def.color;
  ctx.save();
  ctx.translate(e.x, e.y);
  ctx.scale(s, s);

  if (e.type === 'grunt') {
    ctx.rotate(e.face);
    ctx.fillStyle = color;
    for (let i = 0; i < 6; i += 1) {
      const a = (i / 6) * TAU + e.bob * 0.12;
      ctx.save();
      ctx.rotate(a);
      ctx.beginPath();
      ctx.moveTo(e.r - 2, -4);
      ctx.lineTo(e.r + 6, 0);
      ctx.lineTo(e.r - 2, 4);
      ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.arc(0, 0, e.r, 0, TAU);
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = color;
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(e.r * 0.4, 0, 4, 0, TAU);
    ctx.fill();
  } else if (e.type === 'runner') {
    const heading = Math.hypot(e.vx, e.vy) > 30 ? Math.atan2(e.vy, e.vx) : e.face;
    ctx.rotate(heading);
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.moveTo(e.r + 7, 0);
    ctx.lineTo(-e.r, -e.r);
    ctx.lineTo(-e.r * 0.45, 0);
    ctx.lineTo(-e.r, e.r);
    ctx.closePath();
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = color;
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = 'rgba(255,181,71,0.45)';
    ctx.beginPath();
    ctx.moveTo(-e.r * 0.5, -4);
    ctx.lineTo(-e.r * 1.6 - Math.random() * 6, 0);
    ctx.lineTo(-e.r * 0.5, 4);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  } else if (e.type === 'gunner') {
    ctx.rotate(e.face);
    if (e.telegraph > 0) {
      ctx.strokeStyle = `rgba(200,160,255,${0.25 + 0.5 * (1 - e.telegraph / 0.45)})`;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 8]);
      ctx.beginPath();
      ctx.moveTo(e.r + 10, 0);
      ctx.lineTo(420, 0);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.fillStyle = '#2a2140';
    ctx.fillRect(e.r - 4, -4, 16, 8);
    ctx.fillStyle = fill;
    polygon(ctx, 6, e.r + 2, Math.PI / 6);
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = color;
    ctx.stroke();
    const glow = e.telegraph > 0 ? 1 - e.telegraph / 0.45 : 0.25;
    ctx.fillStyle = `rgba(214,190,255,${0.4 + glow * 0.6})`;
    ctx.beginPath();
    ctx.arc(0, 0, 5 + glow * 3, 0, TAU);
    ctx.fill();
  } else if (e.type === 'brute') {
    ctx.rotate(e.face);
    if (e.state === 'windup') {
      const t = 1 - e.stateT / 0.7;
      ctx.fillStyle = `rgba(255,90,90,${0.12 + 0.18 * t})`;
      ctx.beginPath();
      ctx.moveTo(e.r, -e.r * 0.8);
      ctx.lineTo(e.r + 220 * t + 40, -e.r * 0.5);
      ctx.lineTo(e.r + 220 * t + 40, e.r * 0.5);
      ctx.lineTo(e.r, e.r * 0.8);
      ctx.closePath();
      ctx.fill();
      ctx.translate((Math.random() - 0.5) * 3 * t, (Math.random() - 0.5) * 3 * t);
    }
    ctx.fillStyle = fill;
    roundRect(ctx, -e.r, -e.r, e.r * 2, e.r * 2, 10);
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = e.state === 'windup' ? '#ff6b6b' : color;
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.85;
    roundRect(ctx, -e.r * 0.55, -e.r * 0.55, e.r * 1.1, e.r * 1.1, 6);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(e.r * 0.25, -e.r * 0.4, 6, e.r * 0.8);
    ctx.fillStyle = color;
    ctx.fillRect(e.r - 2, -e.r * 0.8, 7, 9);
    ctx.fillRect(e.r - 2, e.r * 0.8 - 9, 7, 9);
  }
  ctx.restore();

  if (e.hp < e.maxHp && s >= 1) {
    const bw = Math.max(24, e.r * 2);
    bar(ctx, e.x - bw / 2, e.y - e.r - 14, bw, 4, e.hp / e.maxHp, color, { back: 'rgba(0,0,0,0.5)' });
  }
}

// ---------- projectiles and particles ----------

function drawBullets(ctx, w) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';
  ctx.strokeStyle = 'rgba(255,190,90,0.5)';
  ctx.lineWidth = 8;
  ctx.beginPath();
  for (const b of w.bullets.items) {
    if (!b.alive) continue;
    ctx.moveTo(b.x - b.vx * 0.03, b.y - b.vy * 0.03);
    ctx.lineTo(b.x, b.y);
  }
  ctx.stroke();
  ctx.strokeStyle = '#fff6dc';
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (const b of w.bullets.items) {
    if (!b.alive) continue;
    ctx.moveTo(b.x - b.vx * 0.02, b.y - b.vy * 0.02);
    ctx.lineTo(b.x, b.y);
  }
  ctx.stroke();
  ctx.restore();
}

function drawShots(ctx, w) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (const s of w.shots.items) {
    if (!s.alive) continue;
    ctx.strokeStyle = 'rgba(180,140,255,0.35)';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(s.x - s.vx * 0.06, s.y - s.vy * 0.06);
    ctx.lineTo(s.x, s.y);
    ctx.stroke();
    ctx.fillStyle = 'rgba(190,150,255,0.35)';
    ctx.beginPath();
    ctx.arc(s.x, s.y, 10, 0, TAU);
    ctx.fill();
    ctx.fillStyle = '#efe4ff';
    ctx.beginPath();
    ctx.arc(s.x, s.y, 4.5, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

function drawParticles(ctx, w, layer) {
  ctx.save();
  for (const q of w.particles.items) {
    if (!q.alive) continue;
    const under = q.kind === 'smoke' || q.kind === 'ghost';
    if ((layer === 'under') !== under) continue;
    const t = q.life / q.max;
    if (q.kind === 'spark') {
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = t;
      ctx.strokeStyle = q.color;
      ctx.lineWidth = q.size * 0.8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(q.x, q.y);
      ctx.lineTo(q.x - q.vx * 0.035, q.y - q.vy * 0.035);
      ctx.stroke();
    } else if (q.kind === 'shard') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = Math.min(1, t * 1.6);
      ctx.fillStyle = q.color;
      ctx.save();
      ctx.translate(q.x, q.y);
      ctx.rotate(q.rot);
      ctx.fillRect(-q.size / 2, -q.size / 2, q.size, q.size * 0.6);
      ctx.restore();
    } else if (q.kind === 'smoke') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = t * 0.5;
      ctx.fillStyle = q.color;
      ctx.beginPath();
      ctx.arc(q.x, q.y, q.size * (1.6 - t * 0.6), 0, TAU);
      ctx.fill();
    } else if (q.kind === 'ring') {
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = t * 0.8;
      ctx.strokeStyle = q.color;
      ctx.lineWidth = 3 * t + 1;
      ctx.beginPath();
      ctx.arc(q.x, q.y, q.size * (1 - t * 0.7), 0, TAU);
      ctx.stroke();
    } else if (q.kind === 'ghost') {
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = t * 0.35;
      ctx.fillStyle = q.color;
      ctx.beginPath();
      ctx.arc(q.x, q.y, q.size, 0, TAU);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawTexts(ctx, w) {
  for (const t of w.texts.items) {
    if (!t.alive) continue;
    hudText(ctx, t.text, t.x, t.y, { size: t.size, weight: 600, color: t.color, align: 'center', alpha: clamp(t.life / t.max * 1.5, 0, 1) });
  }
}

// ---------- HUD ----------

function drawHud(ctx, w, view, cam, opts) {
  const { width, height } = view;
  const p = w.player;
  const small = width < 600;
  const pad = small ? 12 : 18;

  // Damage vignette, stronger when low on health.
  const low = p.alive && p.hp < 35 ? (0.25 + 0.15 * Math.sin(w.time * 6)) * (1 - p.hp / 35) : 0;
  const v = Math.max(w.hurt * 0.6, low);
  if (v > 0.01) {
    const g = ctx.createRadialGradient(width / 2, height / 2, Math.min(width, height) * 0.3, width / 2, height / 2, Math.max(width, height) * 0.75);
    g.addColorStop(0, 'rgba(255,40,60,0)');
    g.addColorStop(1, `rgba(255,40,60,${v})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);
  }

  drawOffscreen(ctx, w, view, cam);

  // Health
  const hbW = small ? 120 : 210;
  hudText(ctx, 'HEALTH', pad, pad + 10, { size: 10, mono: true, color: 'rgba(230,236,245,0.7)', weight: 500 });
  hudText(ctx, `${Math.ceil(p.hp)}`, pad + hbW, pad + 10, { size: 11, mono: true, align: 'right', weight: 500 });
  const hpColor = p.hp > 50 ? '#5ef0a0' : p.hp > 25 ? '#ffd166' : '#ff5d6c';
  bar(ctx, pad, pad + 16, hbW, 8, p.hp / PLAYER.maxHp, hpColor, { ghost: p.shownHp / PLAYER.maxHp });

  // Dash and power-ups
  let y = pad + 40;
  const dashReady = p.dashCd <= 0;
  hudText(ctx, dashReady ? 'DASH READY' : 'DASH', pad, y, { size: 10, mono: true, color: dashReady ? PLAYER_COLOR : 'rgba(230,236,245,0.5)', weight: 500 });
  if (!dashReady) bar(ctx, pad + 40, y - 7, 50, 4, 1 - p.dashCd / PLAYER.dashCooldown, 'rgba(94,230,255,0.7)');
  for (const k of ['rapid', 'spread', 'shield']) {
    if (p.power[k] <= 0) continue;
    y += 18;
    hudText(ctx, { rapid: 'RAPID', spread: 'SPREAD', shield: 'SHIELD' }[k], pad, y, { size: 10, mono: true, color: POWER_COLORS[k], weight: 500 });
    bar(ctx, pad + 52, y - 7, 60, 4, p.power[k] / 9, POWER_COLORS[k]);
  }

  // Wave and time: centred on wide screens, under the score on narrow ones.
  const left = w.queue.length + w.enemies.length + w.spawns.length;
  const waveX = small ? width - pad : width / 2;
  const waveAlign = small ? 'right' : 'center';
  const waveY = small ? pad + 54 : pad + 12;
  hudText(ctx, `WAVE ${w.wave}`, waveX, waveY, { size: small ? 12 : 15, mono: true, align: waveAlign, weight: 500 });
  hudText(ctx, `${clock(w.clock)}  ·  ${left} left`, waveX, waveY + (small ? 15 : 18), { size: 11, mono: true, align: waveAlign, color: 'rgba(230,236,245,0.65)', weight: 400 });

  // Score and combo
  hudText(ctx, fmt(w.score), width - pad, pad + 20, { size: small ? 20 : 26, align: 'right', weight: 600 });
  hudText(ctx, 'SCORE', width - pad, pad + 36, { size: 10, mono: true, align: 'right', color: 'rgba(230,236,245,0.6)', weight: 500 });
  const mult = comboMultiplier(w);
  if (w.combo >= 2) {
    hudText(ctx, `${w.combo} combo${mult > 1 ? `  ×${mult}` : ''}`, width - pad, small ? pad + 92 : pad + 54, { size: 12, mono: true, align: 'right', color: mult > 1 ? '#ffd166' : 'rgba(230,236,245,0.8)', weight: 500 });
  }

  // Wave banner
  if (w.banner) {
    const b = w.banner;
    const a = clamp(Math.min(b.t / 0.25, (b.life - b.t) / 0.4), 0, 1);
    const yb = height * 0.3 - (1 - a) * 10;
    hudText(ctx, b.title.toUpperCase(), width / 2, yb, { size: small ? 26 : 38, align: 'center', weight: 600, alpha: a });
    hudText(ctx, b.sub, width / 2, yb + (small ? 24 : 30), { size: small ? 12 : 14, align: 'center', color: 'rgba(230,236,245,0.75)', weight: 400, alpha: a, mono: true });
  }

  // Touch sticks
  if (opts.touch) {
    for (const stick of [opts.touch.move, opts.touch.aim]) {
      if (!stick) continue;
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(stick.sx, stick.sy, 56, 0, TAU);
      ctx.stroke();
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.beginPath();
      ctx.arc(stick.x, stick.y, 22, 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    if (!opts.touch.move && !opts.touch.aim && w.time < 8) {
      hudText(ctx, 'Left thumb: move   ·   Right thumb: aim and fire', width / 2, height - 22, { size: 12, align: 'center', color: 'rgba(230,236,245,0.7)', weight: 400 });
    }
  }

  // Crosshair
  if (opts.mouse && p.alive) {
    const { x, y: my } = opts.mouse;
    ctx.strokeStyle = '#eafcff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, my, 9, 0, TAU);
    for (const [ax, ay] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      ctx.moveTo(x + ax * 5, my + ay * 5);
      ctx.lineTo(x + ax * 14, my + ay * 14);
    }
    ctx.stroke();
  }
}

/** Arrows on the screen edge pointing at enemies outside the view. */
function drawOffscreen(ctx, w, view, cam) {
  const { width, height } = view;
  const m = 26;
  let shown = 0;
  for (const e of w.enemies) {
    const sx = (e.x - cam.x) * cam.zoom + width / 2;
    const sy = (e.y - cam.y) * cam.zoom + height / 2;
    if (sx > -10 && sx < width + 10 && sy > -10 && sy < height + 10) continue;
    if (shown++ > 14) break;
    const a = Math.atan2(sy - height / 2, sx - width / 2);
    const ex = clamp(sx, m, width - m);
    const ey = clamp(sy, m + 50, height - m);
    ctx.save();
    ctx.translate(ex, ey);
    ctx.rotate(a);
    ctx.globalAlpha = 0.75;
    ctx.fillStyle = ENEMIES[e.type].color;
    ctx.beginPath();
    ctx.moveTo(8, 0);
    ctx.lineTo(-5, -6);
    ctx.lineTo(-5, 6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}
