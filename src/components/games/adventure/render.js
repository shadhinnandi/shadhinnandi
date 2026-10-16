// Drawing for Lost Horizons. The terrain is painted tile by tile into
// 16 x 16-tile chunk canvases the first time they come into view (cliff
// faces, shading and texture are baked in); water shimmer, the waterfall,
// objects, the explorer, light and the HUD are drawn every frame.

import { H, T, TILE, W, regionAt } from './world.js';
import { CH, CW, TOTEM_ORDER, exploredFraction, inCave, mapsFound, objective, relics, shards } from './game.js';
import { TAU, clamp, hudText, roundRect } from '../shared/math.js';

const CHUNK = 16;
const chunks = new Map();

const hash = (x, y, k = 0) => {
  const s = Math.sin(x * 127.1 + y * 311.7 + k * 74.7) * 43758.5453;
  return s - Math.floor(s);
};

const BASE = {
  [T.DEEP]: '#1f6a96',
  [T.SHALLOW]: '#46b4c4',
  [T.SAND]: '#ead39b',
  [T.GRASS]: '#86bf63',
  [T.FOREST]: '#4f8b47',
  [T.PATH]: '#cfae74',
  [T.ROCK]: '#9a9284',
  [T.RUIN]: '#cdb98d',
  [T.WALL]: '#a38c65',
  [T.CAVE]: '#4d4866',
  [T.CAVEWALL]: '#2c283f',
  [T.SNOW]: '#eef3f9',
  [T.BRIDGE]: '#a7773f',
  [T.DECK]: '#8a5f37',
  [T.HULL]: '#5a3a22',
  [T.FALLS]: '#9fd8e8',
  [T.RIVER]: '#2f86b3',
};
const WATER = new Set([T.DEEP, T.SHALLOW, T.RIVER, T.FALLS]);
const HIGH = new Set([T.ROCK, T.WALL, T.CAVEWALL, T.HULL]);

// ---------- terrain chunks ----------

function paintTile(c, w, tx, ty, px, py) {
  const t = w.get(tx, ty);
  const h = hash(tx, ty);
  c.fillStyle = BASE[t];
  c.fillRect(px, py, TILE, TILE);
  const below = w.get(tx, ty + 1);
  const above = w.get(tx, ty - 1);

  switch (t) {
    case T.GRASS:
    case T.FOREST: {
      c.fillStyle = t === T.GRASS ? (h > 0.5 ? '#80b95d' : '#8cc468') : h > 0.5 ? '#4a8443' : '#55924c';
      c.fillRect(px, py, TILE, TILE);
      c.strokeStyle = t === T.GRASS ? 'rgba(60,110,40,0.5)' : 'rgba(30,70,30,0.5)';
      c.lineWidth = 1.5;
      for (let k = 0; k < 4; k += 1) {
        const x = px + hash(tx, ty, k) * 28 + 2;
        const y = py + hash(tx, ty, k + 9) * 26 + 4;
        c.beginPath();
        c.moveTo(x, y + 4);
        c.lineTo(x - 2, y);
        c.moveTo(x, y + 4);
        c.lineTo(x + 2, y - 1);
        c.stroke();
      }
      if (t === T.FOREST && h > 0.7) {
        c.fillStyle = 'rgba(255,240,170,0.10)';
        c.beginPath();
        c.ellipse(px + 16, py + 16, 18, 12, h * 3, 0, TAU);
        c.fill();
      }
      break;
    }
    case T.SAND: {
      c.fillStyle = 'rgba(180,150,90,0.35)';
      for (let k = 0; k < 6; k += 1) c.fillRect(px + hash(tx, ty, k) * 30, py + hash(tx, ty, k + 4) * 30, 2, 2);
      break;
    }
    case T.PATH: {
      c.fillStyle = 'rgba(140,110,60,0.45)';
      for (let k = 0; k < 4; k += 1) {
        c.beginPath();
        c.arc(px + hash(tx, ty, k) * 28 + 2, py + hash(tx, ty, k + 3) * 28 + 2, 1.6, 0, TAU);
        c.fill();
      }
      break;
    }
    case T.RUIN: {
      c.strokeStyle = 'rgba(120,100,70,0.55)';
      c.lineWidth = 1.5;
      c.strokeRect(px + 1, py + 1, TILE - 2, TILE - 2);
      if (h > 0.8) {
        c.beginPath();
        c.moveTo(px + 4, py + 8);
        c.lineTo(px + 14, py + 16);
        c.lineTo(px + 12, py + 26);
        c.stroke();
      }
      if (h < 0.15) {
        c.fillStyle = 'rgba(90,140,70,0.45)';
        c.beginPath();
        c.ellipse(px + 10, py + 22, 8, 5, 0, 0, TAU);
        c.fill();
      }
      break;
    }
    case T.CAVE: {
      c.fillStyle = 'rgba(120,110,170,0.25)';
      for (let k = 0; k < 4; k += 1) c.fillRect(px + hash(tx, ty, k) * 30, py + hash(tx, ty, k + 5) * 30, 2, 2);
      break;
    }
    case T.SNOW: {
      c.fillStyle = 'rgba(160,185,220,0.35)';
      for (let k = 0; k < 3; k += 1) {
        c.beginPath();
        c.ellipse(px + hash(tx, ty, k) * 30, py + hash(tx, ty, k + 2) * 30, 5, 2.5, 0, 0, TAU);
        c.fill();
      }
      break;
    }
    case T.BRIDGE:
    case T.DECK: {
      c.strokeStyle = t === T.BRIDGE ? 'rgba(80,50,20,0.7)' : 'rgba(60,35,15,0.7)';
      c.lineWidth = 2;
      for (let k = 0; k < 4; k += 1) {
        c.beginPath();
        c.moveTo(px, py + k * 8 + 1);
        c.lineTo(px + TILE, py + k * 8 + 1);
        c.stroke();
      }
      break;
    }
    case T.DEEP:
    case T.SHALLOW:
    case T.RIVER: {
      c.fillStyle = t === T.DEEP ? 'rgba(10,40,80,0.25)' : 'rgba(255,255,255,0.08)';
      c.fillRect(px, py + (h > 0.5 ? 16 : 0), TILE, 16);
      break;
    }
    default:
  }

  // Raised tiles: a lit top and a shaded face where the ground drops away.
  if (HIGH.has(t)) {
    const face = { [T.ROCK]: '#6c6558', [T.WALL]: '#7e6a4a', [T.CAVEWALL]: '#1b1828', [T.HULL]: '#3f2817' }[t];
    const top = { [T.ROCK]: '#a69e8f', [T.WALL]: '#b39b70', [T.CAVEWALL]: '#3a3452', [T.HULL]: '#6b4729' }[t];
    c.fillStyle = top;
    c.fillRect(px, py, TILE, TILE);
    if (t === T.ROCK) {
      c.strokeStyle = 'rgba(70,64,55,0.5)';
      c.lineWidth = 1.5;
      c.beginPath();
      c.moveTo(px + h * 20, py + 4);
      c.lineTo(px + 10 + h * 10, py + 14);
      c.stroke();
    }
    if (t === T.WALL) {
      c.strokeStyle = 'rgba(90,70,40,0.6)';
      c.lineWidth = 1.5;
      c.strokeRect(px + 1, py + 1, 15, 10);
      c.strokeRect(px + 16, py + 1, 15, 10);
      c.strokeRect(px + 8, py + 11, 16, 10);
    }
    if (!HIGH.has(below)) {
      c.fillStyle = face;
      c.fillRect(px, py + TILE * 0.55, TILE, TILE * 0.45);
      c.fillStyle = 'rgba(0,0,0,0.18)';
      for (let k = 0; k < 4; k += 1) c.fillRect(px + 4 + k * 8, py + TILE * 0.6, 2, TILE * 0.35);
    }
    if (!HIGH.has(above)) {
      c.fillStyle = 'rgba(255,255,255,0.18)';
      c.fillRect(px, py, TILE, 3);
    }
  } else if (HIGH.has(above)) {
    // Shadow cast onto the ground below a cliff or wall
    const g = c.createLinearGradient(0, py, 0, py + 14);
    g.addColorStop(0, 'rgba(0,0,0,0.3)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g;
    c.fillRect(px, py, TILE, 14);
  }

  // Soft shorelines: wet sand and foam where land meets water
  if (!WATER.has(t) && !HIGH.has(t)) {
    for (const [dx, dy] of [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ]) {
      if (!WATER.has(w.get(tx + dx, ty + dy))) continue;
      c.fillStyle = 'rgba(120,90,50,0.22)';
      if (dy === 1) c.fillRect(px, py + TILE - 6, TILE, 6);
      if (dy === -1) c.fillRect(px, py, TILE, 6);
      if (dx === 1) c.fillRect(px + TILE - 6, py, 6, TILE);
      if (dx === -1) c.fillRect(px, py, 6, TILE);
    }
  }
}

function getChunk(w, cx, cy) {
  const key = cy * 100 + cx;
  if (chunks.has(key)) {
    const v = chunks.get(key);
    chunks.delete(key);
    chunks.set(key, v);
    return v;
  }
  const canvas = document.createElement('canvas');
  canvas.width = CHUNK * TILE;
  canvas.height = CHUNK * TILE;
  const c = canvas.getContext('2d');
  for (let y = 0; y < CHUNK; y += 1) {
    for (let x = 0; x < CHUNK; x += 1) {
      const tx = cx * CHUNK + x;
      const ty = cy * CHUNK + y;
      if (tx >= W || ty >= H) continue;
      paintTile(c, w, tx, ty, x * TILE, y * TILE);
    }
  }
  chunks.set(key, canvas);
  if (chunks.size > 28) chunks.delete(chunks.keys().next().value);
  return canvas;
}

// Whole-island colour map for the minimap and the map screen (built once).
let mapCanvas = null;
function islandMap(w) {
  if (mapCanvas) return mapCanvas;
  mapCanvas = document.createElement('canvas');
  mapCanvas.width = W;
  mapCanvas.height = H;
  const c = mapCanvas.getContext('2d');
  for (let y = 0; y < H; y += 1) {
    for (let x = 0; x < W; x += 1) {
      c.fillStyle = BASE[w.get(x, y)];
      c.fillRect(x, y, 1, 1);
    }
  }
  return mapCanvas;
}

// ---------- main ----------

export function renderAdventure(ctx, g, view, cam, opts) {
  const { width: VW, height: VH } = view;
  const w = g.world;
  const s = cam.scale;
  ctx.fillStyle = BASE[T.DEEP];
  ctx.fillRect(0, 0, VW, VH);

  ctx.save();
  ctx.translate(VW / 2, VH / 2);
  ctx.scale(s, s);
  ctx.translate(-cam.x, -cam.y);
  const x0 = cam.x - VW / 2 / s;
  const y0 = cam.y - VH / 2 / s;
  const x1 = cam.x + VW / 2 / s;
  const y1 = cam.y + VH / 2 / s;

  // Terrain
  const px = CHUNK * TILE;
  for (let cy = Math.max(0, Math.floor(y0 / px)); cy <= Math.min(Math.ceil(H / CHUNK) - 1, Math.floor(y1 / px)); cy += 1) {
    for (let cx = Math.max(0, Math.floor(x0 / px)); cx <= Math.min(Math.ceil(W / CHUNK) - 1, Math.floor(x1 / px)); cx += 1) {
      ctx.drawImage(getChunk(w, cx, cy), cx * px, cy * px);
    }
  }
  drawWater(ctx, g, x0, y0, x1, y1, opts.time);

  // Objects, sorted by their base so things overlap correctly
  const list = [];
  for (const p of w.objects.props) if (p.x > x0 - 60 && p.x < x1 + 60 && p.y > y0 - 60 && p.y < y1 + 80) list.push({ y: p.y, draw: () => drawProp(ctx, p, opts.time) });
  for (const it of w.objects.items) {
    const ix = it.tx !== undefined ? it.tx * TILE + 16 : it.x;
    const iy = it.ty !== undefined ? it.ty * TILE + 16 : it.y;
    if (ix < x0 - 80 || ix > x1 + 80 || iy < y0 - 80 || iy > y1 + 100) continue;
    if (it.kind === 'boulder') continue;
    list.push({ y: iy + (it.kind === 'plate' || it.kind === 'darkness' ? -40 : 0), draw: () => drawItem(ctx, g, it, ix, iy, opts.time) });
  }
  for (const [id, b] of Object.entries(g.boulders)) {
    const bx = b.tx * TILE + 16 + b.ax;
    const by = b.ty * TILE + 16 + b.ay;
    list.push({ y: by, draw: () => drawBoulder(ctx, bx, by, id) });
  }
  list.push({ y: g.player.y, draw: () => drawPlayer(ctx, g, opts.time) });
  list.sort((a, b) => a.y - b.y);
  drawBeam(ctx, g, opts.time);
  for (const o of list) o.draw();
  ctx.restore();

  // Atmosphere and light
  const region = regionAt(w, g.player.x, g.player.y);
  if (inCave(g)) {
    const lit = g.inv.includes('lantern');
    const cx = VW / 2 + (g.player.x - cam.x) * s;
    const cy = VH / 2 + (g.player.y - cam.y) * s;
    const flick = 1 + Math.sin(opts.time * 9) * 0.02;
    const r1 = (lit ? 120 : 36) * s * flick;
    const r2 = (lit ? 260 : 90) * s * flick;
    const gr = ctx.createRadialGradient(cx, cy, r1, cx, cy, r2);
    gr.addColorStop(0, 'rgba(8,6,18,0)');
    gr.addColorStop(1, 'rgba(8,6,18,0.94)');
    ctx.fillStyle = gr;
    ctx.fillRect(0, 0, VW, VH);
    // Crystals keep glowing in the dark
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const p of w.objects.props) {
      if (p.kind !== 'crystal') continue;
      const sx = VW / 2 + (p.x - cam.x) * s;
      const sy = VH / 2 + (p.y - cam.y) * s;
      if (sx < -100 || sx > VW + 100 || sy < -100 || sy > VH + 100) continue;
      const col = ['120,220,255', '200,150,255', '255,200,120'][p.hue];
      const cg = ctx.createRadialGradient(sx, sy, 2, sx, sy, 80 * s);
      cg.addColorStop(0, `rgba(${col},0.45)`);
      cg.addColorStop(1, `rgba(${col},0)`);
      ctx.fillStyle = cg;
      ctx.fillRect(sx - 80 * s, sy - 80 * s, 160 * s, 160 * s);
    }
    ctx.restore();
  } else if (region === 'mountain') {
    ctx.fillStyle = 'rgba(190,210,255,0.08)';
    ctx.fillRect(0, 0, VW, VH);
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    for (let k = 0; k < 60; k += 1) {
      const fx = (hash(k, 1) * VW + opts.time * (20 + hash(k, 2) * 30)) % VW;
      const fy = (hash(k, 3) * VH + opts.time * (40 + hash(k, 4) * 40)) % VH;
      ctx.fillRect(fx, fy, 2, 2);
    }
  } else if (region === 'forest') {
    const v = ctx.createRadialGradient(VW / 2, VH / 2, Math.min(VW, VH) * 0.3, VW / 2, VH / 2, Math.max(VW, VH) * 0.75);
    v.addColorStop(0, 'rgba(10,40,20,0)');
    v.addColorStop(1, 'rgba(10,40,20,0.35)');
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, VW, VH);
  }
  // Warm late-afternoon vignette everywhere
  const vg = ctx.createRadialGradient(VW / 2, VH / 2, Math.min(VW, VH) * 0.45, VW / 2, VH / 2, Math.max(VW, VH) * 0.8);
  vg.addColorStop(0, 'rgba(40,20,0,0)');
  vg.addColorStop(1, 'rgba(40,20,0,0.22)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, VW, VH);

  if (g.ending > 0) drawEnding(ctx, g, view);
  if (opts.hud) drawHud(ctx, g, view, cam, opts);
}

// ---------- water ----------

function drawWater(ctx, g, x0, y0, x1, y1, time) {
  const w = g.world;
  const tx0 = Math.max(0, Math.floor(x0 / TILE));
  const ty0 = Math.max(0, Math.floor(y0 / TILE));
  const tx1 = Math.min(W - 1, Math.floor(x1 / TILE));
  const ty1 = Math.min(H - 1, Math.floor(y1 / TILE));
  ctx.lineWidth = 2;
  for (let ty = ty0; ty <= ty1; ty += 1) {
    for (let tx = tx0; tx <= tx1; tx += 1) {
      const t = w.get(tx, ty);
      if (!WATER.has(t)) continue;
      const px = tx * TILE;
      const py = ty * TILE;
      if (t === T.FALLS) {
        ctx.fillStyle = 'rgba(255,255,255,0.65)';
        for (let k = 0; k < 4; k += 1) {
          const off = (time * 90 + hash(tx, k) * 32) % 32;
          ctx.fillRect(px + 3 + k * 7, py + off - 10, 3, 12);
        }
        continue;
      }
      const h = hash(tx, ty);
      const flow = t === T.RIVER ? time * 0.9 : time * 0.35;
      const a = 0.18 + 0.12 * Math.sin(time * 1.5 + h * 6);
      ctx.strokeStyle = `rgba(255,255,255,${a})`;
      ctx.beginPath();
      const ox = ((h * 32 + flow * 14) % 36) - 4;
      ctx.moveTo(px + ox, py + 10 + h * 12);
      ctx.quadraticCurveTo(px + ox + 5, py + 7 + h * 12, px + ox + 10, py + 10 + h * 12);
      ctx.stroke();
      // Foam where water meets sand
      if (t !== T.DEEP) continue;
      for (const [dx, dy] of [
        [0, -1],
        [0, 1],
        [1, 0],
        [-1, 0],
      ]) {
        const n = w.get(tx + dx, ty + dy);
        if (n !== T.SAND && n !== T.SHALLOW) continue;
        ctx.strokeStyle = `rgba(255,255,255,${0.25 + 0.2 * Math.sin(time * 2 + tx + ty)})`;
        ctx.beginPath();
        if (dy) ctx.moveTo(px, py + (dy > 0 ? 28 : 4)), ctx.lineTo(px + TILE, py + (dy > 0 ? 28 : 4));
        else ctx.moveTo(px + (dx > 0 ? 28 : 4), py), ctx.lineTo(px + (dx > 0 ? 28 : 4), py + TILE);
        ctx.stroke();
      }
    }
  }
}

// ---------- props ----------

function shadow(ctx, x, y, rx, ry) {
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.beginPath();
  ctx.ellipse(x + 4, y + 3, rx, ry, 0, 0, TAU);
  ctx.fill();
}

function drawProp(ctx, p, time) {
  switch (p.kind) {
    case 'tree': {
      const r = p.size / 2;
      shadow(ctx, p.x + 6, p.y, r * 0.95, r * 0.55);
      ctx.fillStyle = '#5c3d23';
      ctx.fillRect(p.x - 3, p.y - 10, 6, 12);
      const sway = Math.sin(time * 1.2 + p.x * 0.01) * 1.2;
      const cols = p.tone > 0.5 ? ['#2f6b33', '#3d8240', '#5aa055'] : ['#2a5e3a', '#357248', '#4f9160'];
      for (let k = 0; k < 3; k += 1) {
        ctx.fillStyle = cols[k];
        ctx.beginPath();
        ctx.arc(p.x + sway - k * 2, p.y - 16 - k * 4, r * (1 - k * 0.22), 0, TAU);
        ctx.fill();
      }
      ctx.fillStyle = 'rgba(255,255,220,0.18)';
      ctx.beginPath();
      ctx.arc(p.x + sway - r * 0.3, p.y - 22 - r * 0.3, r * 0.35, 0, TAU);
      ctx.fill();
      break;
    }
    case 'palm': {
      shadow(ctx, p.x + 10, p.y, 16, 7);
      ctx.strokeStyle = '#8a6a44';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.quadraticCurveTo(p.x + 6, p.y - 18, p.x + 2, p.y - 32);
      ctx.stroke();
      for (let k = 0; k < 6; k += 1) {
        const a = p.rot + (k / 6) * TAU + Math.sin(time + p.x) * 0.04;
        ctx.fillStyle = k % 2 ? '#2f8a4a' : '#45a35c';
        ctx.beginPath();
        ctx.moveTo(p.x + 2, p.y - 32);
        ctx.quadraticCurveTo(p.x + 2 + Math.cos(a - 0.35) * 12, p.y - 32 + Math.sin(a - 0.35) * 9, p.x + 2 + Math.cos(a) * p.size * 0.6, p.y - 32 + Math.sin(a) * p.size * 0.45);
        ctx.quadraticCurveTo(p.x + 2 + Math.cos(a + 0.35) * 12, p.y - 32 + Math.sin(a + 0.35) * 9, p.x + 2, p.y - 32);
        ctx.fill();
      }
      break;
    }
    case 'pine': {
      shadow(ctx, p.x + 4, p.y, 11, 5);
      ctx.fillStyle = '#4a3420';
      ctx.fillRect(p.x - 2, p.y - 6, 4, 8);
      for (let k = 0; k < 3; k += 1) {
        ctx.fillStyle = ['#2e5a42', '#3a6b50', '#4a7d60'][k];
        ctx.beginPath();
        ctx.moveTo(p.x, p.y - 30 + k * 4);
        ctx.lineTo(p.x + 12 - k * 3, p.y - 6 - k * 6);
        ctx.lineTo(p.x - 12 + k * 3, p.y - 6 - k * 6);
        ctx.fill();
      }
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.beginPath();
      ctx.moveTo(p.x, p.y - 30);
      ctx.lineTo(p.x + 4, p.y - 23);
      ctx.lineTo(p.x - 4, p.y - 23);
      ctx.fill();
      break;
    }
    case 'bush':
      shadow(ctx, p.x, p.y, p.size * 0.8, p.size * 0.4);
      ctx.fillStyle = '#4f8f45';
      ctx.beginPath();
      ctx.arc(p.x - 4, p.y - 4, p.size * 0.6, 0, TAU);
      ctx.arc(p.x + 4, p.y - 5, p.size * 0.55, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#e8584f';
      ctx.fillRect(p.x - 2, p.y - 8, 2, 2);
      break;
    case 'flowers': {
      const col = ['#ffd34d', '#ff8fb1', '#ffffff'][p.hue];
      ctx.fillStyle = col;
      for (let k = 0; k < 5; k += 1) ctx.fillRect(p.x + Math.cos(k * 1.3) * 6, p.y + Math.sin(k * 2.1) * 4, 2.5, 2.5);
      break;
    }
    case 'shell':
      ctx.fillStyle = '#f6e7d8';
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, 4, 3, p.rot, 0, TAU);
      ctx.fill();
      break;
    case 'rock':
    case 'rubble':
      shadow(ctx, p.x, p.y, p.size * 0.9, p.size * 0.5);
      ctx.fillStyle = p.kind === 'rubble' ? '#b29f7a' : '#8f8a82';
      ctx.beginPath();
      ctx.ellipse(p.x, p.y - p.size * 0.3, p.size, p.size * 0.7, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.beginPath();
      ctx.ellipse(p.x - p.size * 0.3, p.y - p.size * 0.5, p.size * 0.4, p.size * 0.25, 0, 0, TAU);
      ctx.fill();
      break;
    case 'pillar':
      shadow(ctx, p.x + 4, p.y + 2, 14, 7);
      ctx.fillStyle = '#9c8763';
      ctx.fillRect(p.x - 11, p.y - (p.broken ? 22 : 44), 22, p.broken ? 24 : 46);
      ctx.fillStyle = '#c8b38a';
      ctx.beginPath();
      ctx.ellipse(p.x, p.y - (p.broken ? 22 : 44), 13, 6, 0, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = 'rgba(80,60,30,0.45)';
      ctx.lineWidth = 1.5;
      for (let k = -1; k <= 1; k += 1) {
        ctx.beginPath();
        ctx.moveTo(p.x + k * 6, p.y - (p.broken ? 20 : 42));
        ctx.lineTo(p.x + k * 6, p.y);
        ctx.stroke();
      }
      break;
    case 'crystal': {
      const col = ['#8fe6ff', '#c9a6ff', '#ffd08a'][p.hue];
      shadow(ctx, p.x, p.y, 10, 4);
      ctx.fillStyle = col;
      for (const [dx, hgt] of [
        [-6, 18],
        [0, 30],
        [6, 22],
      ]) {
        ctx.beginPath();
        ctx.moveTo(p.x + dx - 4, p.y);
        ctx.lineTo(p.x + dx, p.y - hgt);
        ctx.lineTo(p.x + dx + 4, p.y);
        ctx.fill();
      }
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fillRect(p.x - 1, p.y - 26, 1.5, 18);
      break;
    }
    case 'plank':
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = '#7a5532';
      ctx.fillRect(-18, -4, 36, 8);
      ctx.restore();
      break;
    case 'mast':
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = '#6b4729';
      ctx.fillRect(-70, -5, 140, 10);
      ctx.fillStyle = 'rgba(240,230,210,0.85)';
      ctx.fillRect(-30, 5, 50, 22);
      ctx.restore();
      break;
    default:
  }
}

// ---------- interactive objects ----------

function glyph(ctx, kind, x, y, r, color) {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  if (kind === 'sun') {
    ctx.arc(x, y, r * 0.45, 0, TAU);
    ctx.fill();
    for (let k = 0; k < 8; k += 1) {
      const a = (k / 8) * TAU;
      ctx.moveTo(x + Math.cos(a) * r * 0.65, y + Math.sin(a) * r * 0.65);
      ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
    }
    ctx.stroke();
  } else if (kind === 'moon') {
    ctx.arc(x, y, r * 0.8, 0.6, TAU - 0.6);
    ctx.arc(x + r * 0.35, y, r * 0.6, TAU - 0.9, 0.9, true);
    ctx.fill();
  } else if (kind === 'star') {
    for (let k = 0; k < 10; k += 1) {
      const a = (k / 10) * TAU - Math.PI / 2;
      const rr = k % 2 ? r * 0.4 : r;
      ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    ctx.fill();
  } else {
    for (let k = 0; k < 3; k += 1) {
      ctx.moveTo(x - r, y - r * 0.5 + k * r * 0.5);
      ctx.quadraticCurveTo(x - r * 0.5, y - r * 0.9 + k * r * 0.5, x, y - r * 0.5 + k * r * 0.5);
      ctx.quadraticCurveTo(x + r * 0.5, y - r * 0.1 + k * r * 0.5, x + r, y - r * 0.5 + k * r * 0.5);
    }
    ctx.stroke();
  }
}

function sparkle(ctx, x, y, time, color = '255,230,140') {
  for (let k = 0; k < 3; k += 1) {
    const a = time * 2 + k * 2.1;
    const r = 10 + Math.sin(time * 3 + k) * 4;
    ctx.fillStyle = `rgba(${color},${0.5 + 0.5 * Math.sin(time * 4 + k)})`;
    ctx.fillRect(x + Math.cos(a) * r - 1, y - 10 + Math.sin(a) * r - 1, 2.5, 2.5);
  }
}

function drawItem(ctx, g, it, x, y, time) {
  const taken = g.taken[it.id];
  switch (it.kind) {
    case 'campfire': {
      ctx.fillStyle = '#6f6a62';
      for (let k = 0; k < 7; k += 1) {
        const a = (k / 7) * TAU;
        ctx.beginPath();
        ctx.arc(x + Math.cos(a) * 11, y + Math.sin(a) * 7, 3.5, 0, TAU);
        ctx.fill();
      }
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const gl = ctx.createRadialGradient(x, y - 6, 2, x, y - 6, 70);
      gl.addColorStop(0, 'rgba(255,170,60,0.45)');
      gl.addColorStop(1, 'rgba(255,170,60,0)');
      ctx.fillStyle = gl;
      ctx.fillRect(x - 70, y - 76, 140, 140);
      for (let k = 0; k < 3; k += 1) {
        const f = Math.sin(time * 12 + k * 2) * 2;
        ctx.fillStyle = ['rgba(255,90,30,0.9)', 'rgba(255,170,40,0.9)', 'rgba(255,240,160,0.9)'][k];
        ctx.beginPath();
        ctx.moveTo(x - 7 + k * 2, y);
        ctx.quadraticCurveTo(x + f, y - 22 + k * 5, x + 7 - k * 2, y);
        ctx.fill();
      }
      ctx.restore();
      if (g.checkpoint.name === it.checkpoint) {
        ctx.fillStyle = 'rgba(255,240,200,0.8)';
        ctx.font = "600 10px 'IBM Plex Mono', monospace";
        ctx.textAlign = 'center';
        ctx.fillText('SAVED', x, y + 22);
      }
      break;
    }
    case 'book':
      ctx.fillStyle = '#6b4729';
      ctx.fillRect(x - 8, y - 4, 16, 10);
      ctx.fillStyle = g.read[it.id] ? '#e9dfc8' : '#fff6dc';
      ctx.fillRect(x - 9, y - 10, 8, 8);
      ctx.fillRect(x + 1, y - 10, 8, 8);
      if (!g.read[it.id]) sparkle(ctx, x, y, time);
      break;
    case 'sign':
      ctx.fillStyle = '#6b4729';
      ctx.fillRect(x - 2, y - 18, 4, 20);
      ctx.fillStyle = '#a5794a';
      ctx.fillRect(x - 14, y - 26, 28, 12);
      break;
    case 'chest':
    case 'crate': {
      shadow(ctx, x, y, 14, 5);
      ctx.fillStyle = it.kind === 'crate' ? '#a5794a' : it.id === 'cave-chest' ? '#5f6fb0' : it.id === 'sanctum-chest' ? '#c9a34a' : '#7a4f2d';
      ctx.fillRect(x - 13, y - 14, 26, 16);
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.fillRect(x - 13, y - 14, 26, 3);
      if (taken) {
        ctx.fillStyle = '#2a1a10';
        ctx.fillRect(x - 11, y - 12, 22, 6);
      } else {
        ctx.fillStyle = '#e8c35a';
        ctx.fillRect(x - 2, y - 9, 4, 5);
        sparkle(ctx, x, y - 4, time);
      }
      break;
    }
    case 'relic':
      if (taken || (it.id === 'relic-ruins' && !g.flags.cracked)) break;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = 'rgba(255,220,120,0.25)';
      ctx.beginPath();
      ctx.arc(x, y - 6, 16 + Math.sin(time * 3) * 2, 0, TAU);
      ctx.fill();
      ctx.restore();
      ctx.fillStyle = '#ffd34d';
      ctx.beginPath();
      ctx.arc(x, y - 6, 6, 0, TAU);
      ctx.fill();
      sparkle(ctx, x, y, time);
      break;
    case 'vines':
      if (g.flags.vines) {
        ctx.fillStyle = '#2e5a2a';
        for (let k = -1; k <= 1; k += 1) ctx.fillRect(x + k * 30 - 3, y - 4, 6, 6);
        break;
      }
      for (let k = 0; k < 14; k += 1) {
        const vx = x - 46 + k * 7;
        ctx.strokeStyle = k % 2 ? '#2f6a2c' : '#3f8a3a';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(vx, y - 50);
        ctx.quadraticCurveTo(vx + Math.sin(k) * 10, y - 20, vx + 3, y + 14);
        ctx.stroke();
        ctx.fillStyle = '#58a84e';
        ctx.beginPath();
        ctx.ellipse(vx + 4, y - 20 + (k % 3) * 9, 5, 3, k, 0, TAU);
        ctx.fill();
      }
      break;
    case 'tent':
      shadow(ctx, x, y + 10, 28, 10);
      ctx.fillStyle = '#c96a3a';
      ctx.beginPath();
      ctx.moveTo(x - 26, y + 14);
      ctx.lineTo(x, y - 20);
      ctx.lineTo(x + 26, y + 14);
      ctx.fill();
      ctx.fillStyle = '#a5532c';
      ctx.beginPath();
      ctx.moveTo(x, y - 20);
      ctx.lineTo(x + 26, y + 14);
      ctx.lineTo(x + 6, y + 14);
      ctx.fill();
      ctx.fillStyle = '#3a2416';
      ctx.beginPath();
      ctx.moveTo(x - 6, y + 14);
      ctx.lineTo(x, y);
      ctx.lineTo(x + 6, y + 14);
      ctx.fill();
      break;
    case 'tablet':
      shadow(ctx, x, y, 18, 6);
      ctx.fillStyle = '#8f8a82';
      roundRect(ctx, x - 20, y - 30, 40, 32, 6);
      ctx.fill();
      TOTEM_ORDER.forEach((gl, k) => glyph(ctx, gl, x - 13 + (k % 2) * 26, y - 22 + Math.floor(k / 2) * 14, 5, '#3f3a33'));
      ctx.fillStyle = 'rgba(60,55,50,0.8)';
      ctx.font = "600 7px 'IBM Plex Mono', monospace";
      ctx.textAlign = 'center';
      ['1', '2', '3', '4'].forEach((n, k) => ctx.fillText(n, x - 13 + (k % 2) * 26 + 9, y - 18 + Math.floor(k / 2) * 14));
      break;
    case 'totem': {
      const idx = TOTEM_ORDER.indexOf(it.glyph);
      const lit = g.flags.totems || g.totemSeq.length > idx;
      shadow(ctx, x, y, 14, 5);
      ctx.fillStyle = '#7a5a3a';
      ctx.fillRect(x - 11, y - 46, 22, 48);
      ctx.fillStyle = '#5c4229';
      ctx.fillRect(x - 11, y - 46, 22, 6);
      ctx.fillRect(x - 11, y - 20, 22, 4);
      const col = g.totemFlash > 0 ? '#ff6b6b' : lit ? '#ffd34d' : '#3a2a1a';
      if (lit && g.totemFlash <= 0) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = 'rgba(255,210,90,0.35)';
        ctx.beginPath();
        ctx.arc(x, y - 32, 18, 0, TAU);
        ctx.fill();
        ctx.restore();
      }
      glyph(ctx, it.glyph, x, y - 31, 8, col);
      break;
    }
    case 'altar':
      shadow(ctx, x, y, 22, 7);
      ctx.fillStyle = g.flags.totems ? '#b9b2a6' : '#8f8a82';
      roundRect(ctx, x - 22, y - 16, 44, 18, 4);
      ctx.fill();
      if (g.flags.totems && !taken) {
        ctx.fillStyle = '#ffd34d';
        ctx.beginPath();
        ctx.moveTo(x, y - 30);
        ctx.lineTo(x + 7, y - 16);
        ctx.lineTo(x, y - 8);
        ctx.lineTo(x - 7, y - 16);
        ctx.fill();
        sparkle(ctx, x, y - 10, time);
      }
      break;
    case 'statue':
      shadow(ctx, x, y, 18, 6);
      ctx.fillStyle = '#9d988f';
      ctx.fillRect(x - 16, y - 8, 32, 10);
      ctx.fillStyle = '#b8b2a8';
      ctx.beginPath();
      ctx.moveTo(x - 10, y - 8);
      ctx.lineTo(x, y - 46);
      ctx.lineTo(x + 10, y - 8);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, y - 48, 7, 0, TAU);
      ctx.fill();
      glyph(ctx, 'sun', x, y - 24, 5, '#e8c35a');
      break;
    case 'sungate': {
      const open = g.flags.sungate;
      for (const side of [-1, 1]) {
        ctx.fillStyle = '#a69e8f';
        ctx.fillRect(x + side * 44 - 10, y - 70, 20, 64);
      }
      if (!open) {
        ctx.fillStyle = '#8c8577';
        ctx.fillRect(x - 36, y - 60, 72, 56);
        ctx.strokeStyle = 'rgba(60,55,45,0.6)';
        ctx.strokeRect(x - 36, y - 60, 72, 56);
      }
      ctx.fillStyle = '#b8b0a0';
      ctx.fillRect(x - 56, y - 80, 112, 14);
      const n = open ? 3 : shards(g);
      for (let k = 0; k < 3; k += 1) {
        ctx.fillStyle = k < n ? '#ffd34d' : '#4a463e';
        ctx.beginPath();
        ctx.arc(x - 22 + k * 22, y - 73, 5, 0, TAU);
        ctx.fill();
      }
      if (open) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = 'rgba(255,220,120,0.25)';
        ctx.fillRect(x - 36, y - 66, 72, 66);
        ctx.restore();
      }
      break;
    }
    case 'darkness':
      if (g.flags.lit) break;
      for (let k = 0; k < 4; k += 1) {
        const gr = ctx.createRadialGradient(x + 20, y, 4, x + 20, y, 70);
        gr.addColorStop(0, 'rgba(5,4,12,0.95)');
        gr.addColorStop(1, 'rgba(5,4,12,0)');
        ctx.fillStyle = gr;
        ctx.fillRect(x - 50, y - 70, 140, 140);
      }
      break;
    case 'carving':
      ctx.strokeStyle = 'rgba(200,190,255,0.55)';
      ctx.lineWidth = 2;
      ctx.strokeRect(x - 12, y - 6, 24, 14);
      ctx.beginPath();
      ctx.arc(x - 5, y + 1, 3, 0, TAU);
      ctx.arc(x + 5, y + 1, 3, 0, TAU);
      ctx.stroke();
      break;
    case 'plate': {
      const covered = Object.values(g.boulders).some((b) => b.tx === Math.floor(it.x / TILE) && b.ty === Math.floor(it.y / TILE));
      ctx.fillStyle = covered ? '#9fe8c8' : '#6a6490';
      roundRect(ctx, x - 14, y - 14, 28, 28, 4);
      ctx.fill();
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = `rgba(150,230,255,${0.2 + 0.1 * Math.sin(time * 3)})`;
      ctx.fillRect(x - 12, y - 12, 24, 24);
      ctx.restore();
      break;
    }
    case 'lever':
      ctx.fillStyle = '#5d5873';
      ctx.fillRect(x - 8, y - 4, 16, 8);
      ctx.strokeStyle = '#c9c2b0';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 8, y - 18);
      ctx.stroke();
      ctx.fillStyle = '#e85d4f';
      ctx.beginPath();
      ctx.arc(x + 8, y - 18, 4, 0, TAU);
      ctx.fill();
      break;
    case 'crystalgate':
      if (g.flags.plates) break;
      for (let k = -1; k <= 1; k += 1) {
        ctx.fillStyle = 'rgba(150,220,255,0.85)';
        ctx.beginPath();
        ctx.moveTo(x - 6, y + k * 30 + 14);
        ctx.lineTo(x, y + k * 30 - 22);
        ctx.lineTo(x + 6, y + k * 30 + 14);
        ctx.fill();
      }
      break;
    case 'gate':
      if (g.flags.gate) {
        ctx.fillStyle = '#8a6a2f';
        ctx.fillRect(x - 48, y - 4, 8, 8);
        ctx.fillRect(x + 40, y - 4, 8, 8);
        break;
      }
      ctx.fillStyle = '#b08a3e';
      ctx.fillRect(x - 48, y - 40, 96, 6);
      ctx.fillRect(x - 48, y - 4, 96, 6);
      for (let k = 0; k < 9; k += 1) ctx.fillRect(x - 46 + k * 11.5, y - 40, 4, 42);
      glyph(ctx, 'sun', x, y - 22, 8, '#e8c35a');
      break;
    case 'emitter':
      ctx.fillStyle = '#b8a27a';
      roundRect(ctx, x - 14, y - 14, 28, 28, 6);
      ctx.fill();
      glyph(ctx, 'sun', x, y, 9, '#ffd34d');
      break;
    case 'mirror': {
      const o = g.mirrors[it.id];
      ctx.fillStyle = '#8a7a5c';
      ctx.beginPath();
      ctx.arc(x, y, 14, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = '#e8f6ff';
      ctx.lineWidth = 5;
      ctx.beginPath();
      if (o === 0) {
        ctx.moveTo(x - 10, y - 10);
        ctx.lineTo(x + 10, y + 10);
      } else {
        ctx.moveTo(x - 10, y + 10);
        ctx.lineTo(x + 10, y - 10);
      }
      ctx.stroke();
      break;
    }
    case 'receptor':
      ctx.fillStyle = '#8e7b5a';
      ctx.fillRect(x - 14, y - 22, 28, 18);
      ctx.fillStyle = g.beamHit ? '#ffd34d' : '#3a2e1c';
      ctx.beginPath();
      ctx.ellipse(x, y - 13, 9, 5, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#1a140c';
      ctx.beginPath();
      ctx.arc(x, y - 13, 2.5, 0, TAU);
      ctx.fill();
      break;
    case 'door':
      if (g.flags.beam) break;
      ctx.fillStyle = '#7e6a4a';
      ctx.fillRect(x - 16, y - 30, 32, 40);
      ctx.strokeStyle = 'rgba(40,30,15,0.6)';
      ctx.lineWidth = 2;
      ctx.strokeRect(x - 14, y - 28, 28, 36);
      ctx.beginPath();
      ctx.moveTo(x, y - 28);
      ctx.lineTo(x, y + 8);
      ctx.stroke();
      break;
    case 'mural':
      ctx.fillStyle = '#8e7b5a';
      ctx.fillRect(x - 26, y - 4, 52, 20);
      ctx.strokeStyle = '#ffd34d';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - 20, y + 12);
      ctx.lineTo(x - 20, y + 2);
      ctx.lineTo(x - 4, y + 2);
      ctx.lineTo(x - 4, y - 2);
      ctx.stroke();
      glyph(ctx, 'sun', x + 14, y + 6, 5, '#ffd34d');
      break;
    case 'cracked':
      if (g.flags.cracked) {
        ctx.fillStyle = '#b29f7a';
        for (let k = 0; k < 5; k += 1) ctx.fillRect(x - 12 + hash(k, 1) * 24, y - 6 + hash(k, 2) * 16, 6, 5);
        break;
      }
      ctx.strokeStyle = 'rgba(40,30,15,0.7)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x - 8, y - 14);
      ctx.lineTo(x - 2, y - 2);
      ctx.lineTo(x - 9, y + 8);
      ctx.moveTo(x - 2, y - 2);
      ctx.lineTo(x + 8, y + 4);
      ctx.stroke();
      break;
    case 'beacon': {
      shadow(ctx, x, y, 26, 9);
      ctx.fillStyle = '#8c8577';
      ctx.fillRect(x - 20, y - 50, 40, 52);
      ctx.fillStyle = '#5a4a3a';
      ctx.beginPath();
      ctx.ellipse(x, y - 52, 22, 8, 0, 0, TAU);
      ctx.fill();
      if (g.flags.beacon) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const f = 1 + Math.sin(time * 10) * 0.08;
        const gr = ctx.createRadialGradient(x, y - 60, 4, x, y - 60, 160 * f);
        gr.addColorStop(0, 'rgba(255,200,90,0.9)');
        gr.addColorStop(1, 'rgba(255,160,60,0)');
        ctx.fillStyle = gr;
        ctx.fillRect(x - 170, y - 230, 340, 340);
        ctx.fillStyle = 'rgba(255,220,140,0.35)';
        ctx.fillRect(x - 10, y - 900, 20, 840);
        ctx.restore();
      }
      break;
    }
    default:
  }
}

function drawBoulder(ctx, x, y) {
  shadow(ctx, x, y + 8, 15, 6);
  const g = ctx.createRadialGradient(x - 5, y - 8, 2, x, y - 2, 17);
  g.addColorStop(0, '#9c96b8');
  g.addColorStop(1, '#4e4968');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y - 2, 15, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = 'rgba(30,25,45,0.5)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x - 6, y - 10);
  ctx.lineTo(x + 2, y - 2);
  ctx.lineTo(x - 2, y + 6);
  ctx.stroke();
}

function drawBeam(ctx, g, time) {
  const pts = g.beam;
  if (!pts || pts.length < 2) return;
  // Only drawn when the player can see the temple
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (const [wdt, col] of [
    [12, `rgba(255,200,90,${0.18 + 0.05 * Math.sin(time * 6)})`],
    [4, 'rgba(255,240,180,0.9)'],
  ]) {
    ctx.strokeStyle = col;
    ctx.lineWidth = wdt;
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x * TILE + 16, y * TILE + 16) : ctx.moveTo(x * TILE + 16, y * TILE + 16)));
    ctx.stroke();
  }
  ctx.restore();
}

// ---------- explorer ----------

function drawPlayer(ctx, g, time) {
  const p = g.player;
  const { x, y } = p;
  shadow(ctx, x, y + 2, 10, 5);
  const step = p.moving ? Math.sin(p.walk) : 0;
  ctx.save();
  ctx.translate(x, y - 8);
  // Legs
  ctx.fillStyle = '#4b3b2a';
  ctx.fillRect(-5, 4 + step * 2, 4, 8 - step * 2);
  ctx.fillRect(1, 4 - step * 2, 4, 8 + step * 2);
  // Backpack shows when walking away from the camera
  const facingUp = Math.sin(p.face) < -0.3;
  if (!facingUp) {
    ctx.fillStyle = '#c9a26a';
    roundRect(ctx, -7, -8, 14, 14, 4);
    ctx.fill();
  }
  ctx.fillStyle = '#7a5532';
  roundRect(ctx, -6, facingUp ? -9 : -6, 12, 10, 3);
  if (facingUp) ctx.fill();
  if (facingUp) {
    ctx.fillStyle = '#c9a26a';
    roundRect(ctx, -7, -6, 14, 12, 4);
    ctx.fill();
  }
  // Arms
  ctx.fillStyle = '#e0b48a';
  ctx.fillRect(-9, -4 - step * 1.5, 3, 8);
  ctx.fillRect(6, -4 + step * 1.5, 3, 8);
  // Head and hat
  ctx.fillStyle = '#e0b48a';
  ctx.beginPath();
  ctx.arc(0, -12, 5.5, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#8a6a3c';
  ctx.beginPath();
  ctx.ellipse(0, -15, 10, 4, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#a5824e';
  ctx.beginPath();
  ctx.ellipse(0, -17, 6, 4, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#5a3f22';
  ctx.fillRect(-6, -17, 12, 1.5);
  // Lantern
  if (g.inv.includes('lantern')) {
    const lx = Math.cos(p.face) * 10;
    ctx.fillStyle = '#ffd88a';
    ctx.beginPath();
    ctx.arc(lx + 8, 2, 3, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

// ---------- ending ----------

function drawEnding(ctx, g, view) {
  const { width: VW, height: VH } = view;
  const t = g.ending;
  ctx.fillStyle = `rgba(255,220,150,${Math.min(0.35, t * 0.12)})`;
  ctx.fillRect(0, 0, VW, VH);
  const a = clamp((t - 0.6) / 0.8, 0, 1);
  hudText(ctx, 'The beacon is lit', VW / 2, VH * 0.3, { size: 34, weight: 700, align: 'center', alpha: a });
  hudText(ctx, 'Far out at sea, a ship turns towards the island.', VW / 2, VH * 0.3 + 30, { size: 15, weight: 500, align: 'center', alpha: clamp((t - 1.6) / 0.8, 0, 1) });
}

// ---------- HUD ----------

function panel(ctx, x, y, w, h) {
  roundRect(ctx, x, y, w, h, 12);
  ctx.fillStyle = 'rgba(14,16,22,0.72)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 1;
  ctx.stroke();
}

function wrap(ctx, text, maxW, font) {
  ctx.font = font;
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const wd of words) {
    const next = line ? `${line} ${wd}` : wd;
    if (ctx.measureText(next).width > maxW && line) {
      lines.push(line);
      line = wd;
    } else line = next;
  }
  lines.push(line);
  return lines;
}

function itemIcon(ctx, id, x, y, r) {
  ctx.save();
  ctx.translate(x, y);
  if (id === 'machete') {
    ctx.rotate(-0.7);
    ctx.fillStyle = '#d9e2ea';
    ctx.fillRect(-2, -r, 5, r * 1.4);
    ctx.fillStyle = '#6b4729';
    ctx.fillRect(-3, r * 0.4, 7, r * 0.6);
  } else if (id === 'lantern') {
    ctx.fillStyle = '#ffd88a';
    ctx.fillRect(-r * 0.4, -r * 0.4, r * 0.8, r * 0.9);
    ctx.strokeStyle = '#5a4a3a';
    ctx.lineWidth = 2;
    ctx.strokeRect(-r * 0.4, -r * 0.4, r * 0.8, r * 0.9);
    ctx.beginPath();
    ctx.arc(0, -r * 0.5, r * 0.3, Math.PI, 0);
    ctx.stroke();
  } else if (id === 'key') {
    ctx.strokeStyle = '#d0a24a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(-r * 0.35, 0, r * 0.3, 0, TAU);
    ctx.moveTo(-r * 0.05, 0);
    ctx.lineTo(r * 0.7, 0);
    ctx.lineTo(r * 0.7, r * 0.3);
    ctx.stroke();
  } else if (id === 'shard') {
    ctx.fillStyle = '#ffd34d';
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.8);
    ctx.lineTo(r * 0.45, 0);
    ctx.lineTo(0, r * 0.8);
    ctx.lineTo(-r * 0.45, 0);
    ctx.fill();
  } else if (id === 'empty') {
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.7);
    ctx.lineTo(r * 0.4, 0);
    ctx.lineTo(0, r * 0.7);
    ctx.lineTo(-r * 0.4, 0);
    ctx.closePath();
    ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.restore();
}

function drawHud(ctx, g, view, cam, opts) {
  const { width: VW, height: VH } = view;
  const small = VW < 600;
  const pad = small ? 10 : 16;

  // Objective
  const ow = small ? Math.min(220, VW - 130) : 300;
  const lines = wrap(ctx, objective(g), ow - 24, `500 ${small ? 12 : 13}px 'IBM Plex Sans', sans-serif`);
  const oh = 30 + lines.length * 17 + 18;
  panel(ctx, pad, pad, ow, oh);
  hudText(ctx, 'OBJECTIVE', pad + 12, pad + 18, { size: 10, mono: true, weight: 600, color: '#ffd34d' });
  lines.forEach((l, i) => hudText(ctx, l, pad + 12, pad + 36 + i * 17, { size: small ? 12 : 13, weight: 500 }));
  hudText(ctx, `SUN SHARDS ${shards(g)}/3   ·   SECRETS ${relics(g)}/3`, pad + 12, pad + oh - 10, { size: 9.5, mono: true, weight: 500, color: 'rgba(255,255,255,0.65)' });

  // Minimap
  const mw = small ? 100 : 150;
  const mh = Math.round((mw * H) / W);
  const mx = VW - pad - mw;
  const my = pad;
  panel(ctx, mx - 4, my - 4, mw + 8, mh + 8);
  drawMap(ctx, g, mx, my, mw, mh, false, opts.time);

  // Region banner
  if (g.banner) {
    const a = clamp(Math.min(g.banner.t / 0.4, (3 - g.banner.t) / 0.6), 0, 1);
    hudText(ctx, g.banner.title.toUpperCase(), VW / 2, VH * 0.2, { size: small ? 22 : 30, weight: 600, align: 'center', alpha: a });
  }

  // Toasts
  g.toasts.forEach((t, i) => {
    const a = clamp(Math.min(t.t / 0.2, (3.2 - t.t) / 0.5), 0, 1);
    const font = `500 ${small ? 12 : 13}px 'IBM Plex Sans', sans-serif`;
    ctx.font = font;
    const tw = Math.min(ctx.measureText(t.text).width, VW - 40);
    const ty = VH * 0.28 + 30 + i * 34;
    ctx.globalAlpha = a;
    roundRect(ctx, VW / 2 - tw / 2 - 14, ty - 18, tw + 28, 28, 14);
    ctx.fillStyle = 'rgba(14,16,22,0.8)';
    ctx.fill();
    ctx.strokeStyle = t.tone === 'good' ? 'rgba(255,211,77,0.6)' : t.tone === 'bad' ? 'rgba(255,107,107,0.6)' : 'rgba(255,255,255,0.15)';
    ctx.stroke();
    ctx.globalAlpha = 1;
    hudText(ctx, t.text, VW / 2, ty + 1, { size: small ? 12 : 13, weight: 500, align: 'center', alpha: a });
  });

  // Inventory
  const slots = ['machete', 'lantern', 'key', 'shard', 'shard', 'shard'];
  const sw = small ? 34 : 42;
  const ix = VW / 2 - (slots.length * (sw + 6)) / 2;
  const iy = VH - pad - sw - (opts.touch ? 0 : 0);
  let shardN = shards(g);
  slots.forEach((sl, k) => {
    const x = ix + k * (sw + 6);
    panel(ctx, x, iy, sw, sw);
    const owned = sl === 'shard' ? shardN-- > 0 : g.inv.includes(sl);
    itemIcon(ctx, owned ? sl : sl === 'shard' ? 'empty' : '', x + sw / 2, iy + sw / 2, sw * 0.36);
    if (!owned && sl !== 'shard') {
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.beginPath();
      ctx.arc(x + sw / 2, iy + sw / 2, 3, 0, TAU);
      ctx.fill();
    }
  });

  // Interaction prompt
  const near = opts.near;
  if (near && !g.ending) {
    const nx = near.tx !== undefined ? near.tx * TILE + 16 : near.x;
    const ny = near.ty !== undefined ? near.ty * TILE + 16 : near.y;
    const sx = VW / 2 + (nx - cam.x) * cam.scale;
    const sy = VH / 2 + (ny - cam.y) * cam.scale - 54 * cam.scale;
    const text = `${opts.touch ? 'ACT' : 'E'}  ·  ${near.label}`;
    ctx.font = "600 12px 'IBM Plex Sans', sans-serif";
    const tw = ctx.measureText(text).width;
    roundRect(ctx, sx - tw / 2 - 12, sy - 16, tw + 24, 26, 13);
    ctx.fillStyle = 'rgba(14,16,22,0.85)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,211,77,0.7)';
    ctx.stroke();
    hudText(ctx, text, sx, sy + 2, { size: 12, weight: 600, align: 'center' });
  }

  if (!opts.touch && g.time < 10) {
    hudText(ctx, 'WASD to move · E to interact · J journal · M map', VW / 2, iy - 14, { size: 12, align: 'center', weight: 500, color: 'rgba(255,255,255,0.75)', alpha: clamp(10 - g.time, 0, 1) });
  }

  // Touch controls
  if (opts.touch) {
    for (const b of opts.buttons) {
      ctx.fillStyle = b.down ? 'rgba(255,255,255,0.3)' : 'rgba(14,16,22,0.45)';
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, TAU);
      ctx.fill();
      ctx.stroke();
      hudText(ctx, b.label, b.x, b.y + 4, { size: b.r > 30 ? 13 : 10, weight: 700, align: 'center', mono: true });
    }
    if (opts.stick) {
      const s = opts.stick;
      ctx.strokeStyle = 'rgba(255,255,255,0.45)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(s.sx, s.sy, 52, 0, TAU);
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.beginPath();
      ctx.arc(s.x, s.y, 20, 0, TAU);
      ctx.fill();
    }
  }

  if (opts.mapOpen) drawMapScreen(ctx, g, view, opts.time);
}

const LANDMARKS = {
  beach: [
    ['Shipwreck', 50, 70],
    ['Hidden cove', 97, 66, true],
  ],
  forest: [
    ['Explorer camp', 16, 47],
    ['Totem clearing', 29, 27],
    ['Waterfall', 24, 13, true],
  ],
  cave: [
    ['Crystal Caves', 74, 21],
    ['Boulder hall', 92, 15],
  ],
  ruins: [
    ['Sun Temple', 86, 46],
    ['Cracked wall', 100, 44, true],
  ],
};

function drawMap(ctx, g, x, y, w, h, big, time) {
  const s = w / W;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.fillStyle = '#0e1626';
  ctx.fillRect(x, y, w, h);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(islandMap(g.world), x, y, w, h);
  // Fog over unexplored cells
  ctx.fillStyle = '#0e1626';
  const cs = s * 4;
  for (let cy = 0; cy < CH; cy += 1) {
    for (let cx = 0; cx < CW; cx += 1) {
      if (!g.explored[cy * CW + cx]) ctx.fillRect(x + cx * cs - 0.5, y + cy * cs - 0.5, cs + 1, cs + 1);
    }
  }
  // Map fragments mark landmarks, even unexplored ones
  for (const reg of mapsFound(g)) {
    for (const [name, tx, ty, secret] of LANDMARKS[reg] || []) {
      ctx.fillStyle = secret ? '#c9a6ff' : '#ffd34d';
      ctx.beginPath();
      ctx.arc(x + tx * s, y + ty * s, big ? 5 : 2.5, 0, TAU);
      ctx.fill();
      if (big) hudText(ctx, secret ? `${name}?` : name, x + tx * s + 8, y + ty * s + 4, { size: 11, weight: 500, color: secret ? '#d9c2ff' : '#ffe9a0' });
    }
  }
  if (big) {
    const cp = g.checkpoint;
    ctx.fillStyle = '#ff9a4a';
    ctx.fillRect(x + (cp.x / TILE) * s - 3, y + (cp.y / TILE) * s - 3, 6, 6);
  }
  ctx.restore();
  const px = x + (g.player.x / TILE) * s;
  const py = y + (g.player.y / TILE) * s;
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#0e1626';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(px, py, big ? 5 + Math.sin(time * 5) : 3, 0, TAU);
  ctx.fill();
  ctx.stroke();
}

function drawMapScreen(ctx, g, view, time) {
  const { width: VW, height: VH } = view;
  ctx.fillStyle = 'rgba(6,8,12,0.82)';
  ctx.fillRect(0, 0, VW, VH);
  const mw = Math.min(VW - 40, (VH - 110) * (W / H));
  const mh = (mw * H) / W;
  const mx = (VW - mw) / 2;
  const my = (VH - mh) / 2 + 14;
  hudText(ctx, 'MAP OF THE ISLAND', VW / 2, my - 22, { size: 14, mono: true, weight: 600, align: 'center', color: '#ffd34d' });
  roundRect(ctx, mx - 6, my - 6, mw + 12, mh + 12, 10);
  ctx.fillStyle = '#e9dcc0';
  ctx.fill();
  drawMap(ctx, g, mx, my, mw, mh, true, time);
  const pct = Math.round(exploredFraction(g) * 100);
  hudText(ctx, `Explored ${pct}%  ·  Map fragments ${mapsFound(g).length}/4  ·  Orange square: last campfire  ·  Press M to close`, VW / 2, my + mh + 26, { size: 11, mono: true, weight: 500, align: 'center', color: 'rgba(255,255,255,0.75)' });
}

