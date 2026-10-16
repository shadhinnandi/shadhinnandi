// Drawing for Eight Ball. The table is drawn in table units through one
// transform (rotated 90° on portrait screens); the HUD is in screen pixels.

import { HEAD_X, FOOT_SPOT, POCKETS, R, TABLE } from './physics.js';
import { ballColor } from './rules.js';
import { remainingFor } from './match.js';
import { TAU, clamp, hudText, roundRect } from '../shared/math.js';

export const FRAME = 46; // cushion + wooden rail around the playing surface
const CUSHION_W = 18;

export function renderPool(ctx, m, ui, view, opts) {
  const { width, height } = view;
  ctx.fillStyle = '#0a0c0f';
  ctx.fillRect(0, 0, width, height);
  const glow = ctx.createRadialGradient(view.cx, view.cy, 40, view.cx, view.cy, Math.max(width, height) * 0.7);
  glow.addColorStop(0, 'rgba(60,110,90,0.18)');
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.translate(view.cx, view.cy);
  if (view.rotated) ctx.rotate(Math.PI / 2);
  ctx.scale(view.scale, view.scale);
  ctx.translate(-TABLE.w / 2, -TABLE.h / 2);

  drawTable(ctx, m, ui, opts);
  const cue = m.balls.find((b) => b.id === 0);
  const showCue = !m.result && cue && !cue.sunk && ui.dragCue === null && ((ui.phase === 'aim' && (opts.playerTurn || (ui.ai && (ui.ai.stage === 'aim' || ui.ai.stage === 'pull')))) || ui.strike > 0);
  if (showCue && opts.playerTurn && !ui.strike) drawGuide(ctx, m, cue, ui.aim);
  drawBalls(ctx, m, ui);
  if (opts.playerTurn && m.ballInHand && cue && !cue.sunk) {
    ctx.strokeStyle = 'rgba(255,255,255,0.75)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.lineDashOffset = -ui.time * 12;
    ctx.beginPath();
    ctx.arc(cue.x, cue.y, R + 7, 0, TAU);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  if (showCue) drawCue(ctx, cue, ui);
  for (const s of ui.sparks) {
    ctx.globalAlpha = (s.t / 0.25) * s.a * 0.8;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(s.x, s.y, 4 + (1 - s.t / 0.25) * 10, 0, TAU);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.restore();

  if (opts.hud) drawHud(ctx, m, ui, view, opts);
}

// ---------- table ----------

function drawTable(ctx, m, ui, opts) {
  const W = TABLE.w;
  const H = TABLE.h;
  // Shadow under the table
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  roundRect(ctx, -FRAME + 10, -FRAME + 16, W + FRAME * 2, H + FRAME * 2, 30);
  ctx.fill();
  // Wooden rail
  const wood = ctx.createLinearGradient(0, -FRAME, 0, H + FRAME);
  wood.addColorStop(0, '#7a4526');
  wood.addColorStop(0.5, '#5a3019');
  wood.addColorStop(1, '#43230f');
  ctx.fillStyle = wood;
  roundRect(ctx, -FRAME, -FRAME, W + FRAME * 2, H + FRAME * 2, 28);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,220,180,0.18)';
  ctx.lineWidth = 2;
  roundRect(ctx, -FRAME + 3, -FRAME + 3, W + FRAME * 2 - 6, H + FRAME * 2 - 6, 25);
  ctx.stroke();
  // Diamonds
  ctx.fillStyle = '#efe3c4';
  const dm = (x, y) => {
    ctx.beginPath();
    ctx.moveTo(x, y - 4);
    ctx.lineTo(x + 3, y);
    ctx.lineTo(x, y + 4);
    ctx.lineTo(x - 3, y);
    ctx.closePath();
    ctx.fill();
  };
  for (const x of [125, 250, 375, 625, 750, 875]) {
    dm(x, -FRAME / 2 - 6);
    dm(x, H + FRAME / 2 + 6);
  }
  for (const y of [125, 250, 375]) {
    dm(-FRAME / 2 - 6, y);
    dm(W + FRAME / 2 + 6, y);
  }
  // Cushions
  ctx.fillStyle = '#145a3d';
  ctx.fillRect(-CUSHION_W, -CUSHION_W, W + CUSHION_W * 2, H + CUSHION_W * 2);
  // Felt
  const felt = ctx.createRadialGradient(W / 2, H / 2, 40, W / 2, H / 2, W * 0.62);
  felt.addColorStop(0, '#22895f');
  felt.addColorStop(1, '#156244');
  ctx.fillStyle = felt;
  ctx.fillRect(0, 0, W, H);
  // Cushion noses
  ctx.strokeStyle = 'rgba(0,0,0,0.28)';
  ctx.lineWidth = 3;
  ctx.strokeRect(1.5, 1.5, W - 3, H - 3);
  ctx.strokeStyle = 'rgba(140,230,180,0.18)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(-CUSHION_W + 2, -CUSHION_W + 2, W + CUSHION_W * 2 - 4, H + CUSHION_W * 2 - 4);
  // Head string, foot spot, kitchen while placing for the break
  if (m.ballInHand && m.kitchen && opts.playerTurn) {
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fillRect(0, 0, HEAD_X, H);
  }
  ctx.strokeStyle = 'rgba(255,255,255,0.10)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(HEAD_X, 0);
  ctx.lineTo(HEAD_X, H);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  ctx.beginPath();
  ctx.arc(FOOT_SPOT.x, FOOT_SPOT.y, 2.5, 0, TAU);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(HEAD_X, H / 2, 2.5, 0, TAU);
  ctx.fill();
  // Pockets
  for (const p of POCKETS) {
    ctx.fillStyle = '#1d140c';
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r + 6, 0, TAU);
    ctx.fill();
    const g = ctx.createRadialGradient(p.x, p.y, 2, p.x, p.y, p.r);
    g.addColorStop(0, '#000000');
    g.addColorStop(0.75, '#050505');
    g.addColorStop(1, '#1a1a1a');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, TAU);
    ctx.fill();
  }
}

// ---------- balls ----------

function drawBalls(ctx, m, ui) {
  // Shadows first so no shadow lands on a neighbouring ball.
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  for (const b of m.balls) {
    if (b.sunk) continue;
    ctx.beginPath();
    ctx.ellipse(b.x + 3, b.y + 4.5, R * 0.95, R * 0.85, 0, 0, TAU);
    ctx.fill();
  }
  for (const b of m.balls) {
    if (b.sunk && !(b.sinkT > 0)) continue;
    let { x, y } = b;
    let s = 1;
    if (b.sunk && b.pocket) {
      const k = b.sinkT / 0.22;
      x = b.pocket.x + (b.x - b.pocket.x) * k;
      y = b.pocket.y + (b.y - b.pocket.y) * k;
      s = 0.55 + 0.45 * k;
    }
    if (b.vx || b.vy) b.dir = Math.atan2(b.vy, b.vx);
    drawBall(ctx, b, x, y, s);
  }
}

export function drawBall(ctx, b, x, y, s = 1) {
  const r = R * s;
  const color = ballColor(b.id);
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, TAU);
  ctx.clip();
  if (b.id > 8) {
    ctx.fillStyle = '#f4efe4';
    ctx.fillRect(-r, -r, r * 2, r * 2);
    ctx.fillStyle = color;
    ctx.fillRect(-r, -r * 0.55, r * 2, r * 1.1);
  } else {
    ctx.fillStyle = color;
    ctx.fillRect(-r, -r, r * 2, r * 2);
  }
  if (b.id !== 0) {
    // Number disc slides across the ball as it rolls.
    const phase = ((b.roll || 0) / R) % TAU;
    const c = Math.cos(phase);
    if (c > -0.2) {
      const off = Math.sin(phase) * r * 0.6;
      const dir = b.dir || 0;
      ctx.save();
      ctx.translate(Math.cos(dir) * off, Math.sin(dir) * off);
      ctx.rotate(dir);
      ctx.scale(Math.max(0.15, c), 1);
      ctx.fillStyle = '#faf7f0';
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.48, 0, TAU);
      ctx.fill();
      ctx.rotate(-dir);
      ctx.fillStyle = '#16171a';
      ctx.font = `600 ${r * 0.62}px 'IBM Plex Sans', system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(b.id), 0, r * 0.04);
      ctx.restore();
    }
  }
  // Shading and highlight
  const shade = ctx.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r * 1.05);
  shade.addColorStop(0, 'rgba(255,255,255,0.35)');
  shade.addColorStop(0.35, 'rgba(255,255,255,0)');
  shade.addColorStop(1, 'rgba(0,0,0,0.38)');
  ctx.fillStyle = shade;
  ctx.fillRect(-r, -r, r * 2, r * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.beginPath();
  ctx.arc(-r * 0.38, -r * 0.42, r * 0.16, 0, TAU);
  ctx.fill();
  ctx.restore();
}

// ---------- cue and guide ----------

function drawCue(ctx, cue, ui) {
  const pull = ui.strike > 0 ? 2 : 10 + ui.power * 95 + Math.sin(ui.time * 3) * (ui.power ? 0 : 1.5);
  ctx.save();
  ctx.translate(cue.x, cue.y);
  ctx.rotate(ui.aim + Math.PI);
  const start = R + pull;
  const len = 560;
  // shadow
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.moveTo(start + 4, 5);
  ctx.lineTo(start + len + 4, 9);
  ctx.lineTo(start + len + 4, -1);
  ctx.closePath();
  ctx.fill();
  // shaft
  const g = ctx.createLinearGradient(0, -6, 0, 6);
  g.addColorStop(0, '#f1d9a6');
  g.addColorStop(0.5, '#d9b779');
  g.addColorStop(1, '#a8844c');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(start, -2.6);
  ctx.lineTo(start + len, -6);
  ctx.lineTo(start + len, 6);
  ctx.lineTo(start, 2.6);
  ctx.closePath();
  ctx.fill();
  // butt
  ctx.fillStyle = '#2b1a10';
  ctx.beginPath();
  ctx.moveTo(start + len * 0.62, -4.7);
  ctx.lineTo(start + len, -6);
  ctx.lineTo(start + len, 6);
  ctx.lineTo(start + len * 0.62, 4.7);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#c9a46a';
  ctx.fillRect(start + len * 0.62, -4.7, 4, 9.4);
  // ferrule and tip
  ctx.fillStyle = '#f3efe6';
  ctx.fillRect(start, -2.6, 9, 5.2);
  ctx.fillStyle = '#3d6fd6';
  ctx.fillRect(start - 2, -2.4, 2.5, 4.8);
  ctx.restore();
}

function drawGuide(ctx, m, cue, angle) {
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  let tBall = Infinity;
  let hit = null;
  for (const b of m.balls) {
    if (b.sunk || b.id === 0) continue;
    const fx = cue.x - b.x;
    const fy = cue.y - b.y;
    const B = fx * dx + fy * dy;
    const C = fx * fx + fy * fy - 4 * R * R;
    const disc = B * B - C;
    if (disc < 0) continue;
    const t = -B - Math.sqrt(disc);
    if (t > 0 && t < tBall) {
      tBall = t;
      hit = b;
    }
  }
  const tx = dx > 0 ? (TABLE.w - R - cue.x) / dx : dx < 0 ? (R - cue.x) / dx : Infinity;
  const ty = dy > 0 ? (TABLE.h - R - cue.y) / dy : dy < 0 ? (R - cue.y) / dy : Infinity;
  const tWall = Math.max(0, Math.min(tx, ty));
  const t = Math.min(tBall, tWall);
  const gx = cue.x + dx * t;
  const gy = cue.y + dy * t;

  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineWidth = 1.6;
  ctx.setLineDash([6, 7]);
  ctx.beginPath();
  ctx.moveTo(cue.x + dx * R, cue.y + dy * R);
  ctx.lineTo(gx, gy);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.arc(gx, gy, R, 0, TAU);
  ctx.stroke();
  if (hit && tBall <= tWall) {
    let nx = hit.x - gx;
    let ny = hit.y - gy;
    const nl = Math.hypot(nx, ny) || 1;
    nx /= nl;
    ny /= nl;
    const along = dx * nx + dy * ny;
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(hit.x + nx * R, hit.y + ny * R);
    ctx.lineTo(hit.x + nx * (R + 30 + 70 * along), hit.y + ny * (R + 30 + 70 * along));
    ctx.stroke();
    const tx2 = dx - along * nx;
    const ty2 = dy - along * ny;
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(gx, gy);
    ctx.lineTo(gx + tx2 * 60, gy + ty2 * 60);
    ctx.stroke();
  }
  ctx.restore();
}

// ---------- HUD ----------

function miniBall(ctx, id, x, y, r) {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, TAU);
  ctx.clip();
  ctx.fillStyle = id > 8 ? '#f4efe4' : ballColor(id);
  ctx.fillRect(-r, -r, r * 2, r * 2);
  if (id > 8) {
    ctx.fillStyle = ballColor(id);
    ctx.fillRect(-r, -r * 0.55, r * 2, r * 1.1);
  }
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.arc(r * 0.3, r * 0.35, r, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function panel(ctx, m, ui, who, x, align, small) {
  const active = !m.result && m.turn === who;
  const name = who === 'player' ? 'YOU' : 'COMPUTER';
  const g = m.groups[who];
  const sign = align === 'left' ? 1 : -1;
  if (active) {
    ctx.fillStyle = who === 'player' ? '#5ee6ff' : '#ffb547';
    const bw = small ? 34 : 46;
    ctx.fillRect(align === 'left' ? x : x - bw, 8, bw, 3);
  }
  hudText(ctx, name, x, 28, { size: small ? 11 : 12, mono: true, align, weight: 600, color: active ? '#ffffff' : 'rgba(230,236,245,0.55)' });
  const label = g ? (g === 'solids' ? 'Solids' : 'Stripes') : 'Open table';
  const nameW = small ? (who === 'player' ? 30 : 70) : who === 'player' ? 34 : 80;
  hudText(ctx, label, x + sign * nameW, 28, { size: small ? 11 : 12, align, weight: 400, color: 'rgba(230,236,245,0.6)' });
  const left = remainingFor(m, who);
  const r = small ? 5 : 6.5;
  const gap = r * 2 + 3;
  const ids = g ? (left.length ? left : [8]) : [];
  ids.forEach((id, i) => miniBall(ctx, id, x + sign * (r + i * gap), 46, r));
  if (g && !left.length) hudText(ctx, 'on the 8', x + sign * (r * 2 + 8), 50, { size: 11, align, weight: 400, color: 'rgba(230,236,245,0.6)' });
}

function drawHud(ctx, m, ui, view, opts) {
  const { width, height } = view;
  const small = width < 560;
  panel(ctx, m, ui, 'player', 16, 'left', small);
  panel(ctx, m, ui, 'ai', width - 16, 'right', small);

  if (!small && !m.result) {
    const text = m.turn === 'player' ? (m.isBreak ? 'YOUR BREAK' : 'YOUR SHOT') : ui.phase === 'rolling' ? 'COMPUTER' : 'COMPUTER THINKING';
    hudText(ctx, text, width / 2, 30, { size: 12, mono: true, align: 'center', weight: 500, color: m.turn === 'player' ? '#8fe9ff' : '#ffc773' });
  }

  // Power slider
  const s = view.slider;
  const pw = ui.power;
  roundRect(ctx, s.x, s.y, s.w, s.h, s.w / 2);
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.14)';
  ctx.lineWidth = 1;
  ctx.stroke();
  if (pw > 0) {
    ctx.save();
    roundRect(ctx, s.x, s.y, s.w, s.h, s.w / 2);
    ctx.clip();
    const g = ctx.createLinearGradient(0, s.y, 0, s.y + s.h);
    g.addColorStop(0, '#5ef0a0');
    g.addColorStop(0.6, '#ffd166');
    g.addColorStop(1, '#ff5d6c');
    ctx.fillStyle = g;
    ctx.fillRect(s.x, s.y, s.w, s.h * pw);
    ctx.restore();
  }
  ctx.fillStyle = '#f2f4f8';
  roundRect(ctx, s.x - 4, s.y + s.h * pw - 4, s.w + 8, 8, 4);
  ctx.fill();
  hudText(ctx, 'POWER', s.x + s.w / 2, s.y - 10, { size: 9, mono: true, align: 'center', weight: 500, color: 'rgba(230,236,245,0.55)' });
  if (opts.playerTurn && ui.usingTouch && !pw) {
    hudText(ctx, 'pull', s.x + s.w / 2, s.y + s.h + 16, { size: 10, mono: true, align: 'center', weight: 400, color: 'rgba(230,236,245,0.55)' });
  }

  // Message toast (wraps to two lines on narrow screens)
  if (ui.message) {
    const msg = ui.message;
    const a = clamp(Math.min(msg.t / 0.2, (msg.life - msg.t) / 0.4), 0, 1);
    const size = small ? 12 : 13;
    ctx.save();
    ctx.font = `500 ${size}px 'IBM Plex Sans', system-ui, sans-serif`;
    const maxW = Math.min(width - 48, 640);
    const lines = [];
    let line = '';
    for (const word of msg.text.split(' ')) {
      const next = line ? `${line} ${word}` : word;
      if (ctx.measureText(next).width > maxW - 28 && line) {
        lines.push(line);
        line = word;
      } else line = next;
    }
    lines.push(line);
    const tw = Math.max(...lines.map((l) => ctx.measureText(l).width));
    const lh = size + 5;
    const bh = 14 + lines.length * lh;
    const bx = width / 2 - tw / 2 - 14;
    const by = height - 12 - bh;
    ctx.globalAlpha = a;
    roundRect(ctx, bx, by, tw + 28, bh, Math.min(14, bh / 2));
    ctx.fillStyle = 'rgba(8,10,14,0.85)';
    ctx.fill();
    ctx.strokeStyle = msg.tone === 'foul' ? 'rgba(255,93,108,0.6)' : msg.tone === 'good' ? 'rgba(94,240,160,0.5)' : msg.tone === 'ai' ? 'rgba(255,181,71,0.5)' : 'rgba(255,255,255,0.15)';
    ctx.stroke();
    ctx.restore();
    lines.forEach((l, i) => hudText(ctx, l, width / 2, by + 7 + lh * (i + 1) - 4, { size, align: 'center', weight: 500, alpha: a, color: '#f2f4f8' }));
  }

  // Ball-in-hand hint next to the white ball
  const cue = m.balls.find((b) => b.id === 0);
  if (opts.playerTurn && m.ballInHand && cue && !cue.sunk && ui.dragCue === null) {
    const p = opts.toScreen(cue.x, cue.y);
    hudText(ctx, 'Drag to place', p.x, p.y - R * view.scale - 14, { size: 11, align: 'center', weight: 500, color: '#ffffff', alpha: 0.85 });
  }
}

