// Drawing for Skyline Run: a simple perspective projection (camera behind
// and above the runner), painter's-order boxes for obstacles and buildings,
// and a procedurally animated runner. Everything is Canvas 2D.

import { LANE_W, OBSTACLES, VIEW_DIST, score } from './world.js';
import { TAU, clamp, fmt, hudText } from '../shared/math.js';

const CAMZ = 5.2;
const CAMH = 3.0;
const ROAD_HALF = LANE_W * 1.5;
const FOG = [74, 31, 92]; // horizon colour, used to fade distant objects

const hash = (n) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

// Far skyline silhouettes, generated once.
const SKYLINE = Array.from({ length: 2 }, (_, layer) => {
  const out = [];
  let x = 0;
  let i = 0;
  while (x < 2400) {
    const w = 40 + hash(i * 3.1 + layer * 77) * 90;
    const h = (layer === 0 ? 50 : 80) + hash(i * 1.7 + layer * 13) * (layer === 0 ? 90 : 130);
    out.push({ x, w, h, lit: hash(i * 9.3 + layer) });
    x += w + 4 + hash(i * 5.3) * 10;
    i += 1;
  }
  return out;
});
const STARS = Array.from({ length: 70 }, (_, i) => ({ x: hash(i * 4.7), y: hash(i * 8.3) * 0.9, r: 0.6 + hash(i * 2.1) * 1.1, tw: hash(i * 6.6) * TAU }));

export function makeCamera(view, camX) {
  const { width: W, height: H } = view;
  const F = Math.min(0.8 * H, (0.3 * W * CAMZ) / LANE_W);
  const ground = H * 0.88;
  const horizon = ground - (CAMH * F) / CAMZ;
  return { F, horizon, cx: W / 2, camX, W, H };
}

function proj(cam, x, y, z) {
  const d = Math.max(0.35, z + CAMZ);
  const s = cam.F / d;
  return { x: cam.cx + (x - cam.camX) * s, y: cam.horizon + (CAMH - y) * s, s };
}

const fogAlpha = (z) => clamp(1 - (z - VIEW_DIST * 0.62) / (VIEW_DIST * 0.38), 0, 1);

function quad(ctx, a, b, c, d) {
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.lineTo(c.x, c.y);
  ctx.lineTo(d.x, d.y);
  ctx.closePath();
}

/** Axis-aligned box: draws the faces the camera can see, front face last. */
function box(ctx, cam, x0, x1, y0, y1, z0, z1, c) {
  z0 = Math.max(z0, -CAMZ + 0.4);
  if (z1 <= z0) return;
  const P = (x, y, z) => proj(cam, x, y, z);
  if (CAMH > y1 && c.top) {
    ctx.fillStyle = c.top;
    quad(ctx, P(x0, y1, z0), P(x1, y1, z0), P(x1, y1, z1), P(x0, y1, z1));
    ctx.fill();
  }
  if (cam.camX < x0 && c.side) {
    ctx.fillStyle = c.side;
    quad(ctx, P(x0, y0, z0), P(x0, y1, z0), P(x0, y1, z1), P(x0, y0, z1));
    ctx.fill();
  }
  if (cam.camX > x1 && c.side) {
    ctx.fillStyle = c.side;
    quad(ctx, P(x1, y0, z0), P(x1, y1, z0), P(x1, y1, z1), P(x1, y0, z1));
    ctx.fill();
  }
  const a = P(x0, y1, z0);
  const b = P(x1, y0, z0);
  ctx.fillStyle = c.front;
  ctx.fillRect(a.x, a.y, b.x - a.x, b.y - a.y);
  return { x: a.x, y: a.y, w: b.x - a.x, h: b.y - a.y, s: a.s };
}

export function renderRunner(ctx, w, view, cam, opts) {
  const { width: W, height: H } = view;
  const shake = opts.shake ? w.shake : 0;
  ctx.save();
  if (shake > 0.01) ctx.translate((Math.random() - 0.5) * shake * 14, (Math.random() - 0.5) * shake * 14);

  drawSky(ctx, cam, w);
  drawGround(ctx, cam, w);
  drawBuildings(ctx, cam, w);

  // Road objects and the runner, far to near.
  const items = [];
  for (const o of w.obstacles) items.push({ z: o.s - w.dist, kind: 'obstacle', o });
  for (const c of w.coins) items.push({ z: c.s - w.dist, kind: 'coin', c });
  items.push({ z: 0.01, kind: 'player' });
  items.sort((a, b) => b.z - a.z);
  for (const it of items) {
    if (it.z > VIEW_DIST || it.z < -CAMZ + 0.5) continue;
    ctx.globalAlpha = fogAlpha(it.z);
    if (it.kind === 'obstacle') drawObstacle(ctx, cam, it.o, it.z, w);
    else if (it.kind === 'coin') drawCoin(ctx, cam, it.c, it.z);
    else {
      ctx.globalAlpha = 1;
      drawRunner(ctx, cam, w);
    }
  }
  ctx.globalAlpha = 1;
  drawParticles(ctx, cam, w);
  ctx.restore();

  if (w.flash > 0) {
    ctx.fillStyle = `rgba(255,255,255,${w.flash * 1.6})`;
    ctx.fillRect(0, 0, W, H);
  }
  if (opts.hud) drawHud(ctx, w, view, opts);
}

// ---------- scenery ----------

function drawSky(ctx, cam, w) {
  const { W, horizon } = cam;
  const g = ctx.createLinearGradient(0, 0, 0, horizon);
  g.addColorStop(0, '#060a1c');
  g.addColorStop(0.6, '#1d1442');
  g.addColorStop(1, `rgb(${FOG.join(',')})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, horizon + 1);
  for (const s of STARS) {
    const y = s.y * horizon * 0.85;
    ctx.globalAlpha = 0.45 + 0.35 * Math.sin(w.time * 1.5 + s.tw);
    ctx.fillStyle = '#e9ecff';
    ctx.fillRect(s.x * W, y, s.r, s.r);
  }
  ctx.globalAlpha = 1;
  // Moon
  const mx = W * 0.78 - cam.camX * 2;
  const my = horizon * 0.32;
  const mg = ctx.createRadialGradient(mx, my, 4, mx, my, 70);
  mg.addColorStop(0, 'rgba(255,235,200,0.35)');
  mg.addColorStop(1, 'rgba(255,235,200,0)');
  ctx.fillStyle = mg;
  ctx.fillRect(mx - 70, my - 70, 140, 140);
  ctx.fillStyle = '#f6e9cf';
  ctx.beginPath();
  ctx.arc(mx, my, 16, 0, TAU);
  ctx.fill();
  // Skyline layers (parallax with the camera's sideways movement)
  const scale = clamp(cam.H / 700, 0.6, 1.3);
  SKYLINE.forEach((layer, li) => {
    const off = -cam.camX * (li === 0 ? 6 : 14) - 300;
    ctx.fillStyle = li === 0 ? '#2a1a4a' : '#170f2e';
    for (const b of layer) {
      const x = b.x + off;
      if (x > W + 10 || x + b.w < -10) continue;
      ctx.fillRect(x, horizon - b.h * scale, b.w, b.h * scale + 1);
      if (li === 1 && b.lit > 0.4) {
        ctx.fillStyle = 'rgba(255,200,120,0.5)';
        for (let k = 0; k < 6; k += 1) {
          const wx = x + 6 + hash(b.x + k) * (b.w - 12);
          const wy = horizon - b.h * scale + 8 + hash(b.x * 2 + k) * (b.h * scale - 16);
          ctx.fillRect(wx, wy, 2, 3);
        }
        ctx.fillStyle = '#170f2e';
      }
    }
  });
}

function drawGround(ctx, cam, w) {
  const { W, H, horizon } = cam;
  const g = ctx.createLinearGradient(0, horizon, 0, H);
  g.addColorStop(0, '#1b1233');
  g.addColorStop(1, '#0b0916');
  ctx.fillStyle = g;
  ctx.fillRect(0, horizon, W, H - horizon);

  const zN = -CAMZ + 0.45;
  const zF = VIEW_DIST;
  const P = (x, z) => proj(cam, x, 0, z);
  // Road surface
  ctx.fillStyle = '#16152a';
  quad(ctx, P(-ROAD_HALF, zN), P(ROAD_HALF, zN), P(ROAD_HALF, zF), P(-ROAD_HALF, zF));
  ctx.fill();
  // Moving cross bands give a sense of speed
  const band = 5;
  const off = w.dist % (band * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.025)';
  for (let z = -off; z < 70; z += band * 2) {
    if (z + band < zN) continue;
    quad(ctx, P(-ROAD_HALF, Math.max(z, zN)), P(ROAD_HALF, Math.max(z, zN)), P(ROAD_HALF, z + band), P(-ROAD_HALF, z + band));
    ctx.fill();
  }
  // Lane dashes
  const dash = 3;
  const period = 8;
  const doff = w.dist % period;
  ctx.fillStyle = 'rgba(235,235,255,0.5)';
  for (const lx of [-LANE_W / 2, LANE_W / 2]) {
    for (let z = -doff; z < 90; z += period) {
      const z0 = Math.max(z, zN);
      const z1 = z + dash;
      if (z1 <= z0) continue;
      ctx.globalAlpha = fogAlpha(z) * 0.9;
      quad(ctx, P(lx - 0.06, z0), P(lx + 0.06, z0), P(lx + 0.06, z1), P(lx - 0.06, z1));
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
  // Neon edges
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (const [x, color] of [
    [-ROAD_HALF, '255,79,216'],
    [ROAD_HALF, '69,225,255'],
  ]) {
    const a = P(x, zN);
    const b = P(x, zF);
    ctx.strokeStyle = `rgba(${color},0.25)`;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    ctx.strokeStyle = `rgba(${color},0.9)`;
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }
  ctx.restore();
}

function drawBuildings(ctx, cam, w) {
  const SEG = 14;
  const first = Math.floor((w.dist - CAMZ) / SEG);
  const last = Math.floor((w.dist + VIEW_DIST) / SEG);
  const list = [];
  for (let i = last; i >= first; i -= 1) {
    for (const side of [-1, 1]) {
      const h = hash(i * 2 + (side > 0 ? 1 : 0));
      if (h < 0.12) continue; // occasional gap
      const z0 = i * SEG - w.dist;
      const z1 = z0 + SEG * (0.7 + hash(i + side * 7) * 0.25);
      const inner = ROAD_HALF + 3.2 + hash(i * 3 + side) * 2.2;
      const height = 6 + hash(i * 5 + side * 3) * 22;
      list.push({ z0, z1, side, inner, height, i, h });
    }
  }
  list.sort((a, b) => b.z0 - a.z0);
  for (const b of list) {
    ctx.globalAlpha = fogAlpha(b.z0);
    const x0 = b.side < 0 ? -b.inner - 9 : b.inner;
    const x1 = b.side < 0 ? -b.inner : b.inner + 9;
    const tone = 18 + Math.floor(b.h * 14);
    const face = box(ctx, cam, x0, x1, 0, b.height, b.z0, b.z1, {
      front: `rgb(${tone},${tone - 4},${tone + 22})`,
      side: `rgb(${tone + 10},${tone + 4},${tone + 36})`,
      top: `rgb(${tone + 16},${tone + 10},${tone + 44})`,
    });
    // Lit windows on the side facing the road
    if (b.z0 < 70) {
      const xs = b.side < 0 ? x1 : x0;
      ctx.fillStyle = b.h > 0.55 ? 'rgba(255,196,110,0.32)' : 'rgba(120,200,255,0.28)';
      for (let fl = 1; fl < b.height / 3.2; fl += 1) {
        for (let k = 0; k < 3; k += 1) {
          if (hash(b.i * 31 + fl * 7 + k + b.side) < 0.45) continue;
          const za = b.z0 + 1 + k * ((b.z1 - b.z0 - 2) / 3);
          const zb = za + 1.6;
          const ya = fl * 3.2;
          const P = (y, z) => proj(cam, xs, y, z);
          quad(ctx, P(ya, Math.max(za, -CAMZ + 0.45)), P(ya + 1.4, Math.max(za, -CAMZ + 0.45)), P(ya + 1.4, zb), P(ya, zb));
          ctx.fill();
        }
      }
    }
    if (face && b.side !== 0 && face.w > 6) {
      // Roof light
      ctx.fillStyle = b.side < 0 ? 'rgba(255,79,216,0.7)' : 'rgba(69,225,255,0.7)';
      ctx.fillRect(face.x, face.y, face.w, Math.max(1, face.s * 0.12));
    }
  }
  // Lamp posts along the road
  const LP = 12;
  const loff = w.dist % LP;
  for (let z = VIEW_DIST - loff; z > -CAMZ + 0.6; z -= LP) {
    ctx.globalAlpha = fogAlpha(z);
    for (const side of [-1, 1]) {
      const x = side * (ROAD_HALF + 0.6);
      const base = proj(cam, x, 0, z);
      const top = proj(cam, x, 4.2, z);
      ctx.strokeStyle = '#2b2846';
      ctx.lineWidth = Math.max(1, base.s * 0.12);
      ctx.beginPath();
      ctx.moveTo(base.x, base.y);
      ctx.lineTo(top.x, top.y);
      ctx.stroke();
      ctx.fillStyle = side < 0 ? 'rgba(255,120,220,0.9)' : 'rgba(120,230,255,0.9)';
      ctx.beginPath();
      ctx.arc(top.x, top.y, Math.max(1.5, base.s * 0.14), 0, TAU);
      ctx.fill();
      ctx.fillStyle = side < 0 ? 'rgba(255,120,220,0.12)' : 'rgba(120,230,255,0.12)';
      ctx.beginPath();
      ctx.arc(top.x, top.y, Math.max(4, base.s * 0.7), 0, TAU);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}

// ---------- obstacles and coins ----------

function stripes(ctx, r, colorA, colorB, width) {
  if (!r || r.w <= 0 || r.h <= 0) return;
  ctx.save();
  ctx.beginPath();
  ctx.rect(r.x, r.y, r.w, r.h);
  ctx.clip();
  ctx.fillStyle = colorA;
  ctx.fillRect(r.x, r.y, r.w, r.h);
  ctx.strokeStyle = colorB;
  ctx.lineWidth = width;
  ctx.beginPath();
  for (let x = r.x - r.h; x < r.x + r.w + r.h; x += width * 2.2) {
    ctx.moveTo(x, r.y + r.h);
    ctx.lineTo(x + r.h, r.y);
  }
  ctx.stroke();
  ctx.restore();
}

function drawObstacle(ctx, cam, o, z, w) {
  const def = OBSTACLES[o.type];
  const cx = o.lane * LANE_W;
  const half = LANE_W * 0.44;
  if (o.type === 'barrier') {
    box(ctx, cam, cx - half, cx - half + 0.14, 0, 1.0, z, z + 0.2, { front: '#3a3550', side: '#4a4566', top: '#57527a' });
    box(ctx, cam, cx + half - 0.14, cx + half, 0, 1.0, z, z + 0.2, { front: '#3a3550', side: '#4a4566', top: '#57527a' });
    const r = box(ctx, cam, cx - half, cx + half, 0.55, 1.0, z, z + def.len, { front: '#ffcc33', side: '#b8901f', top: '#ffe07a' });
    stripes(ctx, r, '#ffcc33', '#1a1426', Math.max(2, r ? r.s * 0.14 : 2));
  } else if (o.type === 'beam') {
    const post = { front: '#3a3550', side: '#4a4566', top: '#57527a' };
    box(ctx, cam, cx - half - 0.1, cx - half + 0.08, 0, def.top, z, z + 0.25, post);
    box(ctx, cam, cx + half - 0.08, cx + half + 0.1, 0, def.top, z, z + 0.25, post);
    const r = box(ctx, cam, cx - half, cx + half, def.bottom, def.bottom + 0.42, z, z + def.len, { front: '#ff4d6d', side: '#a82845', top: '#ff8099' });
    stripes(ctx, r, '#ff4d6d', '#2a0c18', Math.max(2, r ? r.s * 0.12 : 2));
    if (r) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = 'rgba(255,77,109,0.18)';
      ctx.fillRect(r.x - r.s * 0.2, r.y - r.s * 0.2, r.w + r.s * 0.4, r.h + r.s * 0.4);
      ctx.restore();
    }
  } else if (o.type === 'block') {
    const r = box(ctx, cam, cx - half, cx + half, 0, def.top, z, z + def.len, { front: '#2e3d63', side: '#22304f', top: '#3e5182' });
    if (r) {
      ctx.strokeStyle = 'rgba(140,170,255,0.45)';
      ctx.lineWidth = Math.max(1, r.s * 0.06);
      ctx.strokeRect(r.x + r.w * 0.06, r.y + r.h * 0.06, r.w * 0.88, r.h * 0.42);
      ctx.strokeRect(r.x + r.w * 0.06, r.y + r.h * 0.52, r.w * 0.88, r.h * 0.42);
      ctx.beginPath();
      ctx.moveTo(r.x + r.w * 0.06, r.y + r.h * 0.06);
      ctx.lineTo(r.x + r.w * 0.94, r.y + r.h * 0.48);
      ctx.moveTo(r.x + r.w * 0.94, r.y + r.h * 0.52);
      ctx.lineTo(r.x + r.w * 0.06, r.y + r.h * 0.94);
      ctx.stroke();
    }
  } else {
    const r = box(ctx, cam, cx - half, cx + half, 0, def.top, z, z + def.len, { front: '#1f7a86', side: '#155660', top: '#2a97a5' });
    if (r) {
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      for (let k = 1; k < 6; k += 1) ctx.fillRect(r.x + (r.w * k) / 6, r.y + r.h * 0.05, Math.max(1, r.s * 0.05), r.h * 0.9);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const glow = Math.max(3, r.s * 0.22);
      for (const lx of [0.18, 0.82]) {
        ctx.fillStyle = 'rgba(255,240,200,0.9)';
        ctx.beginPath();
        ctx.arc(r.x + r.w * lx, r.y + r.h * 0.82, glow * 0.5, 0, TAU);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,220,150,0.18)';
        ctx.beginPath();
        ctx.arc(r.x + r.w * lx, r.y + r.h * 0.82, glow * 2, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
    }
  }
}

function drawCoin(ctx, cam, c, z) {
  const p = proj(cam, c.lane * LANE_W, c.y, z);
  const r = 0.3 * p.s;
  if (r < 0.6) return;
  const k = Math.abs(Math.cos(c.spin));
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = 'rgba(255,200,60,0.18)';
  ctx.beginPath();
  ctx.arc(p.x, p.y, r * 2, 0, TAU);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#c98a12';
  ctx.beginPath();
  ctx.ellipse(p.x, p.y, Math.max(1, r * k), r, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#ffd34d';
  ctx.beginPath();
  ctx.ellipse(p.x, p.y, Math.max(0.8, r * k * 0.78), r * 0.78, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.fillRect(p.x - r * k * 0.25, p.y - r * 0.5, Math.max(1, r * k * 0.2), r * 0.6);
}

// ---------- runner ----------

function drawRunner(ctx, cam, w) {
  const p = w.player;
  const base = proj(cam, p.x, 0, 0);
  const at = proj(cam, p.x, p.y, 0);
  const s = base.s; // pixels per metre
  // Shadow
  const lift = clamp(1 - p.y / 2, 0.3, 1);
  ctx.fillStyle = `rgba(0,0,0,${0.45 * lift})`;
  ctx.beginPath();
  ctx.ellipse(base.x, base.y, 0.42 * s * lift, 0.12 * s * lift, 0, 0, TAU);
  ctx.fill();

  if (!p.alive && Math.floor(p.crash * 14) % 2 === 0 && p.crash < 0.8) return;

  ctx.save();
  ctx.translate(at.x, at.y);
  ctx.scale(s, s); // draw in metres, y up is negative
  const crashTilt = p.alive ? 0 : Math.min(1.3, p.crash * 2.5);
  ctx.rotate(clamp(p.tilt, -0.35, 0.35) + crashTilt);
  const sliding = p.slide > 0;
  const airborne = p.y > 0.05;
  const ph = p.stride * TAU;
  const squash = sliding ? 0.55 : 1;
  ctx.scale(1, squash);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Legs
  const legW = 0.17;
  ctx.strokeStyle = '#262b45';
  ctx.lineWidth = legW;
  for (const side of [-1, 1]) {
    const swing = airborne ? 0.3 : Math.sin(ph + (side > 0 ? Math.PI : 0));
    const footUp = airborne ? 0.35 : Math.max(0, swing) * 0.32;
    const kneeX = side * 0.13;
    ctx.beginPath();
    ctx.moveTo(side * 0.12, -0.92);
    ctx.lineTo(kneeX, -0.5 - footUp * 0.6);
    ctx.lineTo(side * 0.14, -0.08 - footUp);
    ctx.stroke();
    ctx.fillStyle = '#45e1ff';
    ctx.beginPath();
    ctx.ellipse(side * 0.14, -0.05 - footUp, 0.1, 0.06, 0, 0, TAU);
    ctx.fill();
  }
  // Torso
  ctx.fillStyle = '#ff5d8f';
  ctx.beginPath();
  ctx.moveTo(-0.24, -1.5);
  ctx.lineTo(0.24, -1.5);
  ctx.lineTo(0.2, -0.9);
  ctx.lineTo(-0.2, -0.9);
  ctx.closePath();
  ctx.fill();
  // Backpack with a light strip
  ctx.fillStyle = '#2a1f3d';
  ctx.fillRect(-0.15, -1.42, 0.3, 0.36);
  ctx.fillStyle = '#45e1ff';
  ctx.fillRect(-0.15, -1.2, 0.3, 0.035);
  // Arms
  ctx.strokeStyle = '#ff5d8f';
  ctx.lineWidth = 0.12;
  for (const side of [-1, 1]) {
    const swing = airborne ? -0.6 : Math.sin(ph + (side < 0 ? Math.PI : 0)) * 0.35;
    ctx.beginPath();
    ctx.moveTo(side * 0.24, -1.45);
    ctx.lineTo(side * 0.36, -1.15 + swing * 0.2);
    ctx.lineTo(side * 0.32, -0.92 + swing * 0.35);
    ctx.stroke();
  }
  // Head
  ctx.fillStyle = '#2a1d1a';
  ctx.beginPath();
  ctx.arc(0, -1.68, 0.15, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = '#45e1ff';
  ctx.lineWidth = 0.04;
  ctx.beginPath();
  ctx.arc(0, -1.68, 0.16, Math.PI * 1.05, Math.PI * 1.95);
  ctx.stroke();
  ctx.restore();
}

function drawParticles(ctx, cam, w) {
  for (const q of w.particles) {
    const p = proj(cam, q.x, q.y, q.z);
    ctx.globalAlpha = clamp(q.life / q.max, 0, 1);
    ctx.fillStyle = q.color;
    const r = Math.max(1, q.size * p.s);
    ctx.fillRect(p.x - r / 2, p.y - r / 2, r, r);
  }
  ctx.globalAlpha = 1;
}

// ---------- HUD ----------

function drawHud(ctx, w, view, opts) {
  const { width: W } = view;
  const small = W < 600;
  const pad = small ? 14 : 20;
  hudText(ctx, `${fmt(w.dist)} m`, pad, pad + (small ? 20 : 26), { size: small ? 22 : 30, weight: 600 });
  hudText(ctx, `SCORE ${fmt(score(w))}`, pad, pad + (small ? 38 : 48), { size: 11, mono: true, weight: 500, color: 'rgba(240,240,255,0.7)' });
  if (opts.best > 0) hudText(ctx, `BEST ${fmt(opts.best)}`, pad, pad + (small ? 53 : 64), { size: 10, mono: true, weight: 400, color: 'rgba(240,240,255,0.5)' });

  // Coins
  const cx = W - pad - 8;
  const cy = pad + 14;
  ctx.fillStyle = '#c98a12';
  ctx.beginPath();
  ctx.arc(cx, cy, 8, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#ffd34d';
  ctx.beginPath();
  ctx.arc(cx, cy, 6, 0, TAU);
  ctx.fill();
  hudText(ctx, fmt(w.collected), cx - 14, cy + 6, { size: small ? 18 : 22, weight: 600, align: 'right', color: '#ffe48a' });
  hudText(ctx, `${Math.round(w.speed * 3.6)} km/h`, W - pad, pad + 42, { size: 11, mono: true, weight: 500, align: 'right', color: 'rgba(240,240,255,0.65)' });

  if (w.time < 5 && w.player.alive) {
    const a = clamp((5 - w.time) / 1, 0, 1);
    hudText(ctx, opts.touch ? 'Swipe to switch lanes, jump and slide' : 'Arrows or WASD: change lane, jump, slide', W / 2, view.height - 26, { size: 13, align: 'center', weight: 500, alpha: a, color: '#f2f2ff' });
  }
}
