// Drawing for Ring Pilot: a dusk sky, layered mountains and a moving ground
// grid for speed, then rings, obstacles and clouds in depth order around the
// plane. Everything is Canvas 2D; the one cloud sprite is drawn once.

import { VIEW_DIST } from './world.js';
import { TAU, bar, clamp, fmt, hudText } from '../shared/math.js';

export const CAMZ = 9;

const hash = (n) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

const RIDGES = [0, 1].map((layer) => Array.from({ length: 40 }, (_, i) => 0.35 + hash(i * 3.3 + layer * 19) * 0.65));

let cloudSprite = null;
function getCloudSprite() {
  if (cloudSprite) return cloudSprite;
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 150;
  const x = c.getContext('2d');
  const puffs = [
    [128, 92, 58],
    [80, 98, 40],
    [176, 100, 42],
    [108, 64, 40],
    [152, 66, 36],
    [48, 112, 26],
    [210, 112, 28],
  ];
  for (const [px, py, r] of puffs) {
    const g = x.createRadialGradient(px, py - r * 0.3, r * 0.2, px, py, r);
    g.addColorStop(0, 'rgba(255,255,255,0.95)');
    g.addColorStop(0.7, 'rgba(250,244,240,0.85)');
    g.addColorStop(1, 'rgba(240,226,225,0)');
    x.fillStyle = g;
    x.beginPath();
    x.arc(px, py, r, 0, TAU);
    x.fill();
  }
  cloudSprite = c;
  return c;
}

export function makeCamera(view, camX, camY) {
  const { width: W, height: H } = view;
  return { F: 0.26 * Math.min(W * 1.45, H * 1.7), cx: W / 2, cy: H * 0.34, camX, camY, W, H };
}

function proj(cam, x, y, z) {
  const d = Math.max(0.5, z + CAMZ);
  const s = cam.F / d;
  return { x: cam.cx + (x - cam.camX) * s, y: cam.cy + (cam.camY - y) * s, s };
}

const fog = (z) => clamp(1 - (z - VIEW_DIST * 0.7) / (VIEW_DIST * 0.3), 0, 1);

export function renderFlight(ctx, w, view, cam, opts) {
  const { width: W, height: H } = view;
  ctx.save();
  if (opts.shake && w.shake > 0.01) ctx.translate((Math.random() - 0.5) * w.shake * 16, (Math.random() - 0.5) * w.shake * 16);
  drawSky(ctx, cam, w);

  const items = [];
  for (const r of w.rings) items.push({ z: r.s - w.dist, kind: 'ring', o: r });
  for (const o of w.obstacles) items.push({ z: o.s - w.dist, kind: 'obstacle', o });
  for (const c of w.clouds) items.push({ z: c.s - w.dist, kind: 'cloud', o: c });
  items.push({ z: 0, kind: 'plane' });
  items.sort((a, b) => b.z - a.z);
  for (const it of items) {
    if (it.z > VIEW_DIST || it.z < -CAMZ + 1) continue;
    ctx.globalAlpha = fog(it.z);
    if (it.kind === 'ring') drawRing(ctx, cam, it.o, it.z, w);
    else if (it.kind === 'obstacle') drawObstacle(ctx, cam, it.o, it.z, w);
    else if (it.kind === 'cloud') drawCloud(ctx, cam, it.o, it.z);
    else {
      ctx.globalAlpha = 1;
      drawPlane(ctx, cam, w);
    }
  }
  ctx.globalAlpha = 1;
  for (const q of w.particles) {
    if (q.z < -2) continue; // passed the camera
    const p = proj(cam, q.x, q.y, q.z);
    ctx.globalAlpha = clamp(q.life / q.max, 0, 1) * clamp((q.z + 2) / 3, 0, 1);
    ctx.fillStyle = q.color;
    const r = Math.max(1, q.size * p.s);
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.restore();

  if (w.flash > 0) {
    ctx.fillStyle = `rgba(255,80,80,${w.flash})`;
    ctx.fillRect(0, 0, W, H);
  }
  if (opts.hud) drawHud(ctx, w, view, cam, opts);
}

// ---------- scenery ----------

function drawSky(ctx, cam, w) {
  const { W, H, cy } = cam;
  const g = ctx.createLinearGradient(0, 0, 0, cy);
  g.addColorStop(0, '#2f5f9e');
  g.addColorStop(0.55, '#7aa7d6');
  g.addColorStop(0.88, '#f1c08f');
  g.addColorStop(1, '#f39a6b');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, cy + 1);

  // Sun
  const sx = W * 0.26 - cam.camX * 1.5;
  const sy = cy - H * 0.09 + cam.camY * 0.6;
  const sg = ctx.createRadialGradient(sx, sy, 6, sx, sy, H * 0.28);
  sg.addColorStop(0, 'rgba(255,236,190,0.9)');
  sg.addColorStop(0.15, 'rgba(255,214,160,0.45)');
  sg.addColorStop(1, 'rgba(255,200,150,0)');
  ctx.fillStyle = sg;
  ctx.fillRect(0, 0, W, cy);
  ctx.fillStyle = '#fff1d0';
  ctx.beginPath();
  ctx.arc(sx, sy, Math.max(10, H * 0.035), 0, TAU);
  ctx.fill();

  // Mountains: two layers with parallax
  RIDGES.forEach((ridge, li) => {
    const off = -cam.camX * (li === 0 ? 3 : 7) - W * 0.1;
    const step = (W * 1.3) / (ridge.length - 1);
    const top = (li === 0 ? 0.11 : 0.07) * H + (cam.camY - 9) * (li === 0 ? 0.5 : 1);
    ctx.fillStyle = li === 0 ? 'rgba(93,111,154,0.75)' : '#46557d';
    ctx.beginPath();
    ctx.moveTo(off, cy + 1);
    ridge.forEach((h, i) => ctx.lineTo(off + i * step, cy - h * top));
    ctx.lineTo(off + (ridge.length - 1) * step, cy + 1);
    ctx.closePath();
    ctx.fill();
  });

  // Ground with a moving grid
  const gg = ctx.createLinearGradient(0, cy, 0, H);
  gg.addColorStop(0, '#5a6a8f');
  gg.addColorStop(0.25, '#3b4a70');
  gg.addColorStop(1, '#1f2a47');
  ctx.fillStyle = gg;
  ctx.fillRect(0, cy, W, H - cy);
  ctx.strokeStyle = 'rgba(255,220,180,0.13)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  const period = 24;
  for (let z = period - (w.dist % period); z < VIEW_DIST * 1.5; z += period) {
    const y = proj(cam, 0, 0, z).y;
    if (y > H) continue;
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
  }
  for (let k = -14; k <= 14; k += 1) {
    const a = proj(cam, k * 26, 0, 0.5);
    const b = proj(cam, k * 26, 0, VIEW_DIST * 1.5);
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
  }
  ctx.stroke();
  // Haze over the horizon line
  const hz = ctx.createLinearGradient(0, cy - 30, 0, cy + 40);
  hz.addColorStop(0, 'rgba(243,170,120,0)');
  hz.addColorStop(0.5, 'rgba(243,170,120,0.35)');
  hz.addColorStop(1, 'rgba(243,170,120,0)');
  ctx.fillStyle = hz;
  ctx.fillRect(0, cy - 30, W, 70);
}

// ---------- objects ----------

function drawRing(ctx, cam, r, z, w) {
  const p = proj(cam, r.x, r.y, z);
  const R = r.r * p.s;
  if (R < 1) return;
  const th = Math.max(1.5, 0.42 * p.s);
  const base = r.gold ? '#ffd34d' : '#ffb84a';
  ctx.save();
  if (r.state === 'missed') ctx.globalAlpha *= 0.35;
  // shadow side, body, highlight
  ctx.lineWidth = th;
  ctx.strokeStyle = 'rgba(120,60,0,0.45)';
  ctx.beginPath();
  ctx.arc(p.x + th * 0.25, p.y + th * 0.35, R, 0, TAU);
  ctx.stroke();
  ctx.strokeStyle = base;
  ctx.beginPath();
  ctx.arc(p.x, p.y, R, 0, TAU);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.7)';
  ctx.lineWidth = th * 0.3;
  ctx.beginPath();
  ctx.arc(p.x, p.y, R + th * 0.15, Math.PI * 1.05, Math.PI * 1.55);
  ctx.stroke();
  if (r.gold) {
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = 'rgba(255,220,120,0.25)';
    ctx.lineWidth = th * 2.2;
    ctx.beginPath();
    ctx.arc(p.x, p.y, R, 0, TAU);
    ctx.stroke();
  }
  if (r.fx > 0) {
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = r.fx * 2;
    ctx.strokeStyle = '#fff6d0';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(p.x, p.y, R * (1 + (0.5 - r.fx) * 1.5), 0, TAU);
    ctx.stroke();
  }
  ctx.restore();
}

function drawObstacle(ctx, cam, o, z, w) {
  const y = o.y + Math.sin(o.bob * 1.4) * 0.4;
  const p = proj(cam, o.x, y, z);
  const R = o.r * p.s;
  if (R < 0.8 || o.hit) return;
  ctx.save();
  ctx.translate(p.x, p.y);
  if (o.type === 'balloon') {
    ctx.strokeStyle = 'rgba(80,50,30,0.8)';
    ctx.lineWidth = Math.max(1, R * 0.05);
    ctx.beginPath();
    ctx.moveTo(0, R * 0.95);
    ctx.lineTo(0, R * 1.6);
    ctx.stroke();
    ctx.fillStyle = '#6b4424';
    ctx.fillRect(-R * 0.22, R * 1.55, R * 0.44, R * 0.32);
    const g = ctx.createRadialGradient(-R * 0.35, -R * 0.4, R * 0.1, 0, 0, R * 1.1);
    g.addColorStop(0, '#ff9aa4');
    g.addColorStop(0.5, '#ff5d6c');
    g.addColorStop(1, '#b8283a');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(0, 0, R * 0.92, R * 1.05, 0, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = Math.max(1, R * 0.04);
    ctx.beginPath();
    ctx.ellipse(0, 0, R * 0.35, R * 1.03, 0, 0, TAU);
    ctx.stroke();
  } else {
    ctx.rotate(o.bob);
    ctx.fillStyle = '#2b2f3d';
    for (let i = 0; i < 8; i += 1) {
      ctx.save();
      ctx.rotate((i / 8) * TAU);
      ctx.beginPath();
      ctx.moveTo(R * 0.7, -R * 0.14);
      ctx.lineTo(R * 1.35, 0);
      ctx.lineTo(R * 0.7, R * 0.14);
      ctx.fill();
      ctx.restore();
    }
    const g = ctx.createRadialGradient(-R * 0.3, -R * 0.3, R * 0.1, 0, 0, R);
    g.addColorStop(0, '#5a6078');
    g.addColorStop(1, '#1a1d28');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, R, 0, TAU);
    ctx.fill();
    const blink = Math.sin(w.time * 8 + o.s) > 0;
    ctx.fillStyle = blink ? '#ff4d4d' : '#7a1e1e';
    ctx.beginPath();
    ctx.arc(0, 0, R * 0.25, 0, TAU);
    ctx.fill();
    if (blink) {
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = 'rgba(255,60,60,0.25)';
      ctx.beginPath();
      ctx.arc(0, 0, R * 0.8, 0, TAU);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawCloud(ctx, cam, c, z) {
  const p = proj(cam, c.x, c.y, z);
  const wpx = c.size * 2 * p.s;
  if (wpx < 4 || wpx > cam.W * 4) return;
  // Clouds right in front of the camera fade so they never blind the player.
  const near = clamp((z - 2) / 25, 0, 1);
  ctx.globalAlpha *= 0.85 * near;
  ctx.drawImage(getCloudSprite(), p.x - wpx / 2, p.y - wpx * 0.35, wpx, wpx * 0.59);
}

function drawPlane(ctx, cam, w) {
  const pl = w.plane;
  if (w.invuln > 0 && Math.floor(w.time * 16) % 2 === 0) return;
  const p = proj(cam, pl.x, pl.y, 0);
  const s = p.s;
  ctx.save();
  ctx.translate(p.x, p.y);
  // Drawn a little smaller than true scale so the plane visibly fits the rings.
  ctx.scale(s * 0.62, s * 0.62);
  const crash = pl.alive ? 0 : pl.crash * 2;
  ctx.rotate(pl.bank + crash);
  const pitch = pl.pitch * 0.5;
  // Shadow on the ground is implied by the haze; draw contrail glow when boosting.
  if (pl.boost) {
    ctx.fillStyle = 'rgba(255,200,120,0.35)';
    ctx.beginPath();
    ctx.arc(0, 0.1, 1.1, 0, TAU);
    ctx.fill();
  }
  // Wings
  ctx.fillStyle = '#e9eef7';
  ctx.strokeStyle = '#8a99b6';
  ctx.lineWidth = 0.06;
  ctx.beginPath();
  ctx.moveTo(-4, 0.05);
  ctx.lineTo(-0.5, -0.12);
  ctx.lineTo(0.5, -0.12);
  ctx.lineTo(4, 0.05);
  ctx.lineTo(4, 0.32);
  ctx.lineTo(0.5, 0.22);
  ctx.lineTo(-0.5, 0.22);
  ctx.lineTo(-4, 0.32);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#ff5d6c';
  ctx.fillRect(-4, 0.05, 0.4, 0.27);
  ctx.fillStyle = '#45c1ff';
  ctx.fillRect(3.6, 0.05, 0.4, 0.27);
  // Tail
  ctx.fillStyle = '#dfe6f2';
  ctx.fillRect(-1.4, -0.75 + pitch, 2.8, 0.2);
  ctx.fillStyle = '#ff8a3d';
  ctx.beginPath();
  ctx.moveTo(-0.12, -0.6 + pitch);
  ctx.lineTo(0.12, -0.6 + pitch);
  ctx.lineTo(0.08, -1.8 + pitch);
  ctx.lineTo(-0.08, -1.8 + pitch);
  ctx.closePath();
  ctx.fill();
  // Fuselage
  ctx.fillStyle = '#f3f6fb';
  ctx.beginPath();
  ctx.ellipse(0, 0.05, 0.62, 0.68, 0, 0, TAU);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#26324d';
  ctx.beginPath();
  ctx.ellipse(0, -0.25, 0.34, 0.24, 0, 0, TAU);
  ctx.fill();
  // Propeller blur
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.beginPath();
  ctx.arc(0, 0.1, 1.0, 0, TAU);
  ctx.fill();
  ctx.restore();
}

// ---------- HUD ----------

function drawHud(ctx, w, view, cam, opts) {
  const { width: W, height: H } = view;
  const small = W < 600;
  const pad = small ? 14 : 20;

  // Fuel and lives
  hudText(ctx, 'FUEL', pad, pad + 10, { size: 10, mono: true, weight: 500, color: 'rgba(255,255,255,0.85)' });
  const fc = w.fuel > 50 ? '#5ef0a0' : w.fuel > 25 ? '#ffd166' : '#ff5d6c';
  bar(ctx, pad, pad + 16, small ? 120 : 180, 8, w.fuel / 100, fc, { back: 'rgba(0,0,0,0.25)' });
  for (let i = 0; i < 3; i += 1) {
    const x = pad + 7 + i * 20;
    const y = pad + 42;
    ctx.fillStyle = i < w.lives ? '#ff5d6c' : 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.moveTo(x, y + 5);
    ctx.bezierCurveTo(x - 9, y - 2, x - 5, y - 9, x, y - 4);
    ctx.bezierCurveTo(x + 5, y - 9, x + 9, y - 2, x, y + 5);
    ctx.fill();
  }
  if (w.fuel < 25 && w.plane.alive && Math.floor(w.time * 3) % 2 === 0) {
    hudText(ctx, 'LOW FUEL: FLY THROUGH RINGS', W / 2, H - 28, { size: 12, mono: true, align: 'center', weight: 600, color: '#ffdddd' });
  }

  // Distance and stage
  hudText(ctx, `${(w.dist / 1000).toFixed(2)} km`, W / 2, pad + 14, { size: small ? 15 : 18, align: 'center', weight: 600 });
  hudText(ctx, `STAGE ${w.stage}`, W / 2, pad + 32, { size: 10, mono: true, align: 'center', weight: 500, color: 'rgba(255,255,255,0.75)' });

  // Score and rings
  hudText(ctx, fmt(w.score), W - pad, pad + 20, { size: small ? 20 : 26, align: 'right', weight: 600 });
  hudText(ctx, `RINGS ${w.passed}${w.combo > 1 ? `  ×${w.combo}` : ''}`, W - pad, pad + 38, { size: 11, mono: true, align: 'right', weight: 500, color: w.combo > 2 ? '#ffe08a' : 'rgba(255,255,255,0.8)' });
  if (opts.best > 0) hudText(ctx, `BEST ${fmt(opts.best)}`, W - pad, pad + 54, { size: 10, mono: true, align: 'right', weight: 400, color: 'rgba(255,255,255,0.6)' });

  // Floating messages
  w.texts.forEach((t, i) => {
    const a = clamp(1 - t.t / t.life, 0, 1);
    hudText(ctx, t.msg, W / 2, H * 0.24 - t.t * 24 - i * 18, { size: 16, align: 'center', weight: 600, color: t.color, alpha: a });
  });
  if (w.banner) {
    const b = w.banner;
    const a = clamp(Math.min(b.t / 0.25, (b.life - b.t) / 0.4), 0, 1);
    hudText(ctx, b.title.toUpperCase(), W / 2, H * 0.36, { size: small ? 24 : 34, align: 'center', weight: 600, alpha: a });
    hudText(ctx, b.sub, W / 2, H * 0.36 + (small ? 22 : 28), { size: 13, align: 'center', weight: 500, alpha: a, color: 'rgba(255,255,255,0.85)' });
  }

  // Next ring arrow when it is outside the view
  const next = w.rings.filter((r) => r.state === 'ahead' && r.s > w.dist).sort((a, b) => a.s - b.s)[0];
  if (next) {
    const p = proj(cam, next.x, next.y, next.s - w.dist);
    if (p.x < 10 || p.x > W - 10 || p.y < 10 || p.y > H - 10) {
      const a = Math.atan2(p.y - H / 2, p.x - W / 2);
      const ex = clamp(p.x, 24, W - 24);
      const ey = clamp(p.y, 70, H - 24);
      ctx.save();
      ctx.translate(ex, ey);
      ctx.rotate(a);
      ctx.fillStyle = '#ffd34d';
      ctx.beginPath();
      ctx.moveTo(10, 0);
      ctx.lineTo(-6, -7);
      ctx.lineTo(-6, 7);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  // Touch steering indicator
  if (opts.stick) {
    const s = opts.stick;
    ctx.strokeStyle = 'rgba(255,255,255,0.45)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(s.sx, s.sy, 60, 0, TAU);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    ctx.arc(s.x, s.y, 20, 0, TAU);
    ctx.fill();
  }
  if (w.time < 4 && w.plane.alive) {
    hudText(ctx, opts.touch ? 'Drag to steer · second finger to boost' : 'Arrows or WASD to steer · Shift to boost', W / 2, H - 50, { size: 13, align: 'center', weight: 500, alpha: clamp(4 - w.time, 0, 1) });
  }
}
