// Drawing for Apex Rush. A top-down world seen through a chase camera that
// turns with the car (the car always points up the screen) and zooms out
// with speed. Tall things (buildings, trees, the lighthouse) are drawn with
// their tops pushed away from the view centre, which gives a cheap sense of
// height that moves naturally as the camera turns. Only what is near the
// camera is drawn.

import { CAR, KMH } from './physics.js';
import { DS } from './tracks.js';
import { LAPS, fmtTime, ord, positionOf } from './race.js';
import { TAU, clamp, hudText, roundRect } from '../shared/math.js';

const SUN = { x: 16, y: 13 }; // shadow direction in world units per unit height

export function renderRace(ctx, race, view, cam, opts) {
  const { width: W, height: H } = view;
  const t = race.track;
  const theme = t.def.theme;
  const fx = opts.fx;
  const time = opts.time;

  ctx.fillStyle = theme.ground;
  ctx.fillRect(0, 0, W, H);

  const anchorY = H * (opts.touch ? 0.6 : 0.66);
  const sx = cam.shake ? (Math.random() - 0.5) * cam.shake : 0;
  const sy = cam.shake ? (Math.random() - 0.5) * cam.shake : 0;
  ctx.save();
  ctx.translate(W / 2 + sx, anchorY + sy);
  ctx.rotate(cam.rot);
  ctx.scale(cam.zoom, cam.zoom);
  ctx.translate(-cam.x, -cam.y);

  // The world point under the screen centre, and how far the screen reaches.
  const fwdX = Math.cos(cam.heading);
  const fwdY = Math.sin(cam.heading);
  const lead = (anchorY - H / 2) / cam.zoom;
  const vc = { x: cam.x + fwdX * lead, y: cam.y + fwdY * lead, r: (Math.hypot(W, H) * 0.56) / cam.zoom };

  drawGround(ctx, t, vc, time);
  drawTrack(ctx, race, vc);
  drawSkids(ctx, fx.skids);
  drawScenery(ctx, t, vc, time);

  if (race.ghost && race.ghost.visible && race.phase !== 'countdown') drawCar(ctx, race.ghost, { ghost: true, time });
  for (const car of race.cars) drawCarShadow(ctx, car);
  for (const car of race.cars) drawCar(ctx, car, { time });
  drawParticles(ctx, fx.particles);
  ctx.restore();

  const toScreen = (x, y) => {
    const dx = (x - cam.x) * cam.zoom;
    const dy = (y - cam.y) * cam.zoom;
    const c = Math.cos(cam.rot);
    const s = Math.sin(cam.rot);
    return { x: W / 2 + dx * c - dy * s, y: anchorY + dx * s + dy * c };
  };
  // Name tags over rival cars
  if (race.mode === 'race') {
    for (const car of race.cars) {
      if (car === race.player) continue;
      const p = toScreen(car.x, car.y);
      if (p.x < -20 || p.x > W + 20 || p.y < -20 || p.y > H + 20) continue;
      hudText(ctx, `${car.name} · ${ord(positionOf(race, car))}`, p.x, p.y - 26 * cam.zoom - 6, { size: 10, mono: true, align: 'center', weight: 500, color: 'rgba(255,255,255,0.85)' });
    }
  }

  if (opts.hud) drawHud(ctx, race, view, opts);
}

// ---------- ground ----------

function drawGround(ctx, t, vc, time) {
  const theme = t.def.theme;
  const { decals } = t.scenery;
  ctx.fillStyle = theme.ground;
  ctx.fillRect(vc.x - vc.r, vc.y - vc.r, vc.r * 2, vc.r * 2);
  ctx.fillStyle = theme.ground2;
  for (const d of decals) {
    if (Math.abs(d.x - vc.x) > vc.r + d.r || Math.abs(d.y - vc.y) > vc.r + d.r) continue;
    ctx.beginPath();
    ctx.ellipse(d.x, d.y, d.r, d.r * 0.6, d.a, 0, TAU);
    ctx.fill();
  }

  if (theme.sea) {
    const x0 = vc.x - vc.r - 40;
    const x1 = vc.x + vc.r + 40;
    const coast = t.coast;
    if (coast(vc.x) - 200 < vc.y + vc.r) {
      // Wet sand, then sea
      ctx.fillStyle = '#d9ca98';
      ctx.beginPath();
      ctx.moveTo(x0, coast(x0) - 70);
      for (let x = x0; x <= x1; x += 40) ctx.lineTo(x, coast(x) - 70);
      ctx.lineTo(x1, vc.y + vc.r + 400);
      ctx.lineTo(x0, vc.y + vc.r + 400);
      ctx.fill();
      const sea = ctx.createLinearGradient(0, coast(vc.x), 0, coast(vc.x) + 700);
      sea.addColorStop(0, '#3fb5c9');
      sea.addColorStop(0.3, '#2a8fb5');
      sea.addColorStop(1, '#1d5f8f');
      ctx.fillStyle = sea;
      ctx.beginPath();
      ctx.moveTo(x0, coast(x0));
      for (let x = x0; x <= x1; x += 40) ctx.lineTo(x, coast(x));
      ctx.lineTo(x1, vc.y + vc.r + 400);
      ctx.lineTo(x0, vc.y + vc.r + 400);
      ctx.fill();
      // Foam lines rolling in
      ctx.strokeStyle = 'rgba(255,255,255,0.55)';
      ctx.lineWidth = 4;
      for (let k = 0; k < 3; k += 1) {
        const off = ((time * 18 + k * 30) % 90) - 10;
        ctx.globalAlpha = 0.6 * (1 - off / 80);
        ctx.beginPath();
        for (let x = x0; x <= x1; x += 40) {
          const y = coast(x) + 18 + k * 26 - off * 0.4;
          if (x === x0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
  }
  if (theme.river) {
    const r = t.river;
    const y0 = vc.y - vc.r - 50;
    const y1 = vc.y + vc.r + 50;
    if (Math.abs(r.x - vc.x) < vc.r + r.w) {
      ctx.fillStyle = '#7a8a62';
      ctx.fillRect(r.x - r.w / 2 - 22, y0, r.w + 44, y1 - y0);
      const g = ctx.createLinearGradient(r.x - r.w / 2, 0, r.x + r.w / 2, 0);
      g.addColorStop(0, '#2f6f8f');
      g.addColorStop(0.5, '#3f8fb0');
      g.addColorStop(1, '#2f6f8f');
      ctx.fillStyle = g;
      ctx.fillRect(r.x - r.w / 2, y0, r.w, y1 - y0);
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.lineWidth = 3;
      ctx.setLineDash([30, 50]);
      ctx.lineDashOffset = -time * 60;
      for (const dx of [-30, 0, 28]) {
        ctx.beginPath();
        ctx.moveTo(r.x + dx, y0);
        ctx.lineTo(r.x + dx, y1);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }
  }
  if (theme.city) {
    // Street grid between the blocks
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 3;
    const g = 260;
    const gx0 = Math.floor((vc.x - vc.r) / g) * g;
    const gy0 = Math.floor((vc.y - vc.r) / g) * g;
    ctx.beginPath();
    for (let x = gx0; x < vc.x + vc.r; x += g) {
      ctx.moveTo(x, vc.y - vc.r);
      ctx.lineTo(x, vc.y + vc.r);
    }
    for (let y = gy0; y < vc.y + vc.r; y += g) {
      ctx.moveTo(vc.x - vc.r, y);
      ctx.lineTo(vc.x + vc.r, y);
    }
    ctx.stroke();
  }
}

// ---------- track ----------

function visibleRuns(t, vc) {
  const runs = [];
  let start = -1;
  const r2 = (vc.r + t.def.halfWidth + t.def.shoulder + 40) ** 2;
  for (let i = 0; i <= t.N; i += 1) {
    const k = i % t.N;
    const vis = i < t.N && (t.xs[k] - vc.x) ** 2 + (t.ys[k] - vc.y) ** 2 < r2;
    if (vis && start < 0) start = i;
    if (!vis && start >= 0) {
      runs.push([Math.max(0, start - 2), Math.min(t.N, i + 1)]);
      start = -1;
    }
  }
  // Join a run that wraps over index 0
  if (runs.length > 1 && runs[0][0] === 0 && runs[runs.length - 1][1] >= t.N) {
    const last = runs.pop();
    runs[0] = [last[0], runs[0][1] + t.N];
  }
  return runs;
}

function edge(t, i, off) {
  const k = ((i % t.N) + t.N) % t.N;
  return [t.xs[k] + t.nx[k] * off, t.ys[k] + t.ny[k] * off];
}

function band(ctx, t, a, b, o1, o2) {
  ctx.beginPath();
  for (let i = a; i <= b; i += 1) {
    const [x, y] = edge(t, i, o1);
    if (i === a) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  for (let i = b; i >= a; i -= 1) {
    const [x, y] = edge(t, i, o2);
    ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function line(ctx, t, a, b, off) {
  ctx.beginPath();
  for (let i = a; i <= b; i += 1) {
    const [x, y] = edge(t, i, off);
    if (i === a) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
}

function drawTrack(ctx, race, vc) {
  const t = race.track;
  const def = t.def;
  const th = def.theme;
  const hw = def.halfWidth;
  const sh = def.shoulder;
  const runs = visibleRuns(t, vc);
  const onBridge = (i) => th.river && Math.abs(t.xs[((i % t.N) + t.N) % t.N] - t.river.x) < t.river.w / 2 + 34;

  for (const [a, b] of runs) {
    // Shoulders (on the bridge: deck instead of grass)
    ctx.fillStyle = th.shoulder;
    band(ctx, t, a, b, hw, hw + sh);
    ctx.fill();
    band(ctx, t, a, b, -hw, -hw - sh);
    ctx.fill();
    if (th.river) {
      ctx.fillStyle = '#8c7a5c';
      for (let i = a; i < b; i += 1) {
        if (!onBridge(i)) continue;
        band(ctx, t, i, i + 1, hw, hw + sh);
        ctx.fill();
        band(ctx, t, i, i + 1, -hw, -hw - sh);
        ctx.fill();
      }
    }
    // Asphalt
    ctx.fillStyle = th.asphalt;
    band(ctx, t, a, b, hw, -hw);
    ctx.fill();
    ctx.strokeStyle = th.asphaltEdge;
    ctx.lineWidth = 6;
    line(ctx, t, a, b, hw - 3);
    ctx.stroke();
    line(ctx, t, a, b, -hw + 3);
    ctx.stroke();
    // Edge lines
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 2.5;
    line(ctx, t, a, b, hw - 9);
    ctx.stroke();
    line(ctx, t, a, b, -hw + 9);
    ctx.stroke();
    // Centre dashes
    ctx.strokeStyle = th.line;
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = a - (a % 6); i < b; i += 6) {
      const [x1, y1] = edge(t, i, 0);
      const [x2, y2] = edge(t, i + 3, 0);
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
    }
    ctx.stroke();
    // Curbs on the corners
    for (let i = a - (a % 2); i < b; i += 2) {
      const k = ((i % t.N) + t.N) % t.N;
      if (Math.abs(t.curv[k]) < 1 / 650) continue;
      ctx.fillStyle = (i / 2) % 2 === 0 ? th.curbA : th.curbB;
      band(ctx, t, i, i + 2, hw - 1, hw + 9);
      ctx.fill();
      band(ctx, t, i, i + 2, -hw + 1, -hw - 9);
      ctx.fill();
    }
    // Barriers
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 9;
    line(ctx, t, a, b, hw + sh + 2);
    ctx.stroke();
    line(ctx, t, a, b, -hw - sh - 2);
    ctx.stroke();
    ctx.strokeStyle = th.barrier;
    ctx.lineWidth = th.city ? 8 : 5;
    line(ctx, t, a, b, hw + sh);
    ctx.stroke();
    line(ctx, t, a, b, -hw - sh);
    ctx.stroke();
    if (!th.city) {
      ctx.fillStyle = 'rgba(40,40,40,0.55)';
      for (let i = a - (a % 3); i < b; i += 3) {
        for (const o of [hw + sh, -hw - sh]) {
          const [x, y] = edge(t, i, o);
          ctx.fillRect(x - 2, y - 2, 4, 4);
        }
      }
    }
  }

  // Start line (checkered) and grid boxes
  const L = t.length;
  for (const [a, b] of runs) {
    if (!(a <= 0 && b >= 0) && !(a <= t.N && b >= t.N)) continue;
    const sq = 10;
    const cols = Math.round((hw * 2) / sq);
    for (let r = 0; r < 2; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        ctx.fillStyle = (r + c) % 2 === 0 ? '#ffffff' : '#16171a';
        const off = -hw + c * sq;
        const [x, y] = edge(t, 0, off);
        ctx.save();
        ctx.translate(x + t.tx[0] * r * sq, y + t.ty[0] * r * sq);
        ctx.rotate(Math.atan2(t.ty[0], t.tx[0]));
        ctx.fillRect(0, 0, sq, sq);
        ctx.restore();
      }
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.lineWidth = 2;
    for (let k = 0; k < 4; k += 1) {
      const s = L - 70 - Math.floor(k / 2) * 80 + 26;
      const i = Math.floor(s / DS);
      const lat = k % 2 === 0 ? 22 : -22;
      const [x, y] = edge(t, i, lat + 13);
      const [x2, y2] = edge(t, i, lat - 13);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  }
}

function drawSkids(ctx, skids) {
  ctx.lineCap = 'round';
  ctx.lineWidth = 5;
  for (const s of skids) {
    ctx.strokeStyle = `rgba(20,20,22,${0.28 * s.a})`;
    ctx.beginPath();
    ctx.moveTo(s.ax, s.ay);
    ctx.lineTo(s.bx, s.by);
    ctx.moveTo(s.cx, s.cy);
    ctx.lineTo(s.dx, s.dy);
    ctx.stroke();
  }
}

// ---------- scenery ----------

function lift(it, vc, h) {
  return { x: it.x + (it.x - vc.x) * h * 0.06, y: it.y + (it.y - vc.y) * h * 0.06 };
}

function rotRect(ctx, x, y, w, d, rot) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.fillRect(-w / 2, -d / 2, w, d);
  ctx.restore();
}

const HOUSE = ['#c8583f', '#3f7fb8', '#d9a441'];
const BUILD = ['#6b7385', '#8a7b6e', '#5d6b7a', '#7a6f86', '#64737a'];
const UMB = ['#e8473f', '#2f7ff0', '#f2c230', '#2fbf71'];

function drawScenery(ctx, t, vc, time) {
  const items = t.scenery.items;
  const vis = [];
  for (const it of items) {
    if (Math.abs(it.x - vc.x) > vc.r + it.r + 60 || Math.abs(it.y - vc.y) > vc.r + it.r + 60) continue;
    vis.push(it);
  }
  // Shadows first
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  for (const it of vis) {
    const h = it.type === 'building' || it.type === 'tower' ? it.h * 40 : it.type === 'palm' || it.type === 'pine' || it.type === 'tree' ? 26 : it.type === 'lighthouse' ? 90 : 6;
    if (it.type === 'building' || it.type === 'tower' || it.type === 'house' || it.type === 'cabin') {
      ctx.save();
      ctx.translate(it.x + SUN.x * h * 0.05, it.y + SUN.y * h * 0.05);
      ctx.rotate(it.rot || 0);
      ctx.fillRect(-it.w / 2, -it.d / 2, it.w, it.d);
      ctx.restore();
    } else if (it.type !== 'lamp' && it.type !== 'park' && it.type !== 'boat') {
      ctx.beginPath();
      ctx.ellipse(it.x + SUN.x * h * 0.05, it.y + SUN.y * h * 0.05, it.r * 0.9, it.r * 0.7, 0.6, 0, TAU);
      ctx.fill();
    }
  }
  for (const it of vis) drawItem(ctx, it, vc, time);
}

function drawItem(ctx, it, vc, time) {
  switch (it.type) {
    case 'palm': {
      const top = lift(it, vc, 1.1);
      ctx.strokeStyle = '#8a6a44';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(it.x, it.y);
      ctx.lineTo(top.x, top.y);
      ctx.stroke();
      for (let k = 0; k < 7; k += 1) {
        const a = it.rot + (k / 7) * TAU + Math.sin(time * 1.2 + it.x) * 0.05;
        ctx.fillStyle = k % 2 ? '#2f8a4a' : '#3fa35a';
        ctx.beginPath();
        ctx.moveTo(top.x, top.y);
        ctx.quadraticCurveTo(top.x + Math.cos(a - 0.3) * it.r * 0.7, top.y + Math.sin(a - 0.3) * it.r * 0.7, top.x + Math.cos(a) * it.r, top.y + Math.sin(a) * it.r);
        ctx.quadraticCurveTo(top.x + Math.cos(a + 0.3) * it.r * 0.7, top.y + Math.sin(a + 0.3) * it.r * 0.7, top.x, top.y);
        ctx.fill();
      }
      break;
    }
    case 'umbrella': {
      ctx.fillStyle = UMB[it.hue];
      ctx.beginPath();
      ctx.arc(it.x, it.y, it.r, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      for (let k = 0; k < 4; k += 1) {
        ctx.beginPath();
        ctx.moveTo(it.x, it.y);
        ctx.arc(it.x, it.y, it.r, it.rot + (k * TAU) / 4, it.rot + (k * TAU) / 4 + TAU / 8);
        ctx.fill();
      }
      ctx.fillStyle = '#f4efe4';
      ctx.fillRect(it.x + it.r * 0.6, it.y - 6, 10, 16);
      break;
    }
    case 'rock': {
      ctx.fillStyle = '#8b8d90';
      ctx.beginPath();
      for (let k = 0; k < 7; k += 1) {
        const a = it.rot + (k / 7) * TAU;
        const r = it.r * (0.75 + 0.25 * Math.sin(k * 2.7 + it.rot));
        ctx.lineTo(it.x + Math.cos(a) * r, it.y + Math.sin(a) * r);
      }
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.18)';
      ctx.beginPath();
      ctx.arc(it.x - it.r * 0.25, it.y - it.r * 0.25, it.r * 0.4, 0, TAU);
      ctx.fill();
      break;
    }
    case 'house':
    case 'cabin': {
      const top = lift(it, vc, 0.5);
      ctx.fillStyle = it.type === 'cabin' ? '#5a3f2a' : '#e9e2d3';
      rotRect(ctx, it.x, it.y, it.w, it.d, it.rot);
      ctx.save();
      ctx.translate(top.x, top.y);
      ctx.rotate(it.rot);
      ctx.fillStyle = it.type === 'cabin' ? '#7a4f30' : HOUSE[it.hue];
      ctx.fillRect(-it.w / 2, -it.d / 2, it.w, it.d / 2);
      ctx.fillStyle = it.type === 'cabin' ? '#6a4228' : shade(HOUSE[it.hue]);
      ctx.fillRect(-it.w / 2, 0, it.w, it.d / 2);
      ctx.restore();
      break;
    }
    case 'boat': {
      const bob = Math.sin(time * 1.5 + it.x) * 2;
      ctx.save();
      ctx.translate(it.x + bob, it.y);
      ctx.rotate(it.rot);
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-26, -6);
      ctx.lineTo(-60, -16);
      ctx.moveTo(-26, 6);
      ctx.lineTo(-60, 16);
      ctx.stroke();
      ctx.fillStyle = '#f4f1ea';
      ctx.beginPath();
      ctx.ellipse(0, 0, 28, 9, 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#2f5f9e';
      ctx.fillRect(-8, -4, 14, 8);
      ctx.restore();
      break;
    }
    case 'lighthouse': {
      const top = lift(it, vc, 2.6);
      ctx.fillStyle = '#7d7f84';
      ctx.beginPath();
      ctx.arc(it.x, it.y, 46, 0, TAU);
      ctx.fill();
      for (let k = 0; k <= 8; k += 1) {
        const f = k / 8;
        ctx.fillStyle = k % 2 ? '#d6403a' : '#f4f1ea';
        ctx.beginPath();
        ctx.arc(it.x + (top.x - it.x) * f, it.y + (top.y - it.y) * f, 22 - f * 7, 0, TAU);
        ctx.fill();
      }
      ctx.fillStyle = '#ffe9a0';
      ctx.beginPath();
      ctx.arc(top.x, top.y, 9, 0, TAU);
      ctx.fill();
      const a = time * 1.2;
      ctx.fillStyle = 'rgba(255,240,180,0.18)';
      ctx.beginPath();
      ctx.moveTo(top.x, top.y);
      ctx.arc(top.x, top.y, 420, a, a + 0.35);
      ctx.fill();
      break;
    }
    case 'pine': {
      for (let k = 0; k < 3; k += 1) {
        const p = lift(it, vc, 0.35 + k * 0.35);
        ctx.fillStyle = ['#244a2c', '#2d5a35', '#3a6e42'][k];
        ctx.beginPath();
        ctx.arc(p.x, p.y, it.r * (1 - k * 0.28), 0, TAU);
        ctx.fill();
      }
      break;
    }
    case 'tree': {
      for (let k = 0; k < 2; k += 1) {
        const p = lift(it, vc, 0.4 + k * 0.3);
        ctx.fillStyle = k ? '#4f9a50' : '#3b7d3f';
        ctx.beginPath();
        ctx.arc(p.x, p.y, it.r * (1 - k * 0.3), 0, TAU);
        ctx.fill();
      }
      break;
    }
    case 'peak': {
      const cols = ['#6f6a5f', '#7d776a', '#8d877a', '#a39d91', '#e9edf2', '#ffffff'];
      for (let k = 0; k < cols.length; k += 1) {
        const f = k / cols.length;
        const p = lift(it, vc, f * 2.2);
        ctx.fillStyle = cols[k];
        ctx.beginPath();
        for (let j = 0; j < 9; j += 1) {
          const a = (j / 9) * TAU;
          const r = it.r * (1 - f * 0.85) * (0.82 + 0.18 * Math.sin(j * 2.1 + it.x));
          ctx.lineTo(p.x + Math.cos(a) * r, p.y + Math.sin(a) * r);
        }
        ctx.fill();
      }
      break;
    }
    case 'building':
    case 'tower': {
      const h = it.h;
      const top = lift(it, vc, h);
      const hw = it.w / 2;
      const hd = it.d / 2;
      const color = it.type === 'tower' ? '#4d5f7a' : BUILD[it.hue];
      ctx.fillStyle = shade(color);
      // Walls: connect footprint corners to roof corners
      const corners = [
        [-hw, -hd],
        [hw, -hd],
        [hw, hd],
        [-hw, hd],
      ];
      for (let k = 0; k < 4; k += 1) {
        const [ax, ay] = corners[k];
        const [bx, by] = corners[(k + 1) % 4];
        ctx.beginPath();
        ctx.moveTo(it.x + ax, it.y + ay);
        ctx.lineTo(it.x + bx, it.y + by);
        ctx.lineTo(top.x + bx, top.y + by);
        ctx.lineTo(top.x + ax, top.y + ay);
        ctx.fill();
      }
      ctx.fillStyle = color;
      ctx.fillRect(top.x - hw, top.y - hd, it.w, it.d);
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.lineWidth = 3;
      ctx.strokeRect(top.x - hw + 6, top.y - hd + 6, it.w - 12, it.d - 12);
      if (it.type === 'tower') {
        ctx.strokeStyle = '#f2c230';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(top.x, top.y, 60, 0, TAU);
        ctx.stroke();
        ctx.fillStyle = '#f2c230';
        ctx.fillRect(top.x - 22, top.y - 26, 8, 52);
        ctx.fillRect(top.x + 14, top.y - 26, 8, 52);
        ctx.fillRect(top.x - 14, top.y - 4, 28, 8);
      } else {
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        if (it.roof === 0) {
          ctx.fillRect(top.x - 20, top.y - 14, 26, 18);
          ctx.fillRect(top.x + 14, top.y + 10, 16, 16);
        } else if (it.roof === 1) {
          ctx.beginPath();
          ctx.arc(top.x, top.y, 16, 0, TAU);
          ctx.fill();
        } else {
          ctx.fillStyle = 'rgba(90,180,90,0.5)';
          ctx.fillRect(top.x - hw + 16, top.y - hd + 16, it.w - 32, it.d - 32);
        }
      }
      break;
    }
    case 'park': {
      ctx.fillStyle = '#3f6e45';
      ctx.beginPath();
      ctx.arc(it.x, it.y, it.r, 0, TAU);
      ctx.fill();
      ctx.strokeStyle = '#c9b98a';
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.arc(it.x, it.y, it.r * 0.55, 0, TAU);
      ctx.stroke();
      ctx.fillStyle = '#3f8fb0';
      ctx.beginPath();
      ctx.ellipse(it.x, it.y, 70, 44, 0.4, 0, TAU);
      ctx.fill();
      break;
    }
    case 'lamp': {
      ctx.fillStyle = 'rgba(255,230,160,0.16)';
      ctx.beginPath();
      ctx.arc(it.x, it.y, 22, 0, TAU);
      ctx.fill();
      ctx.fillStyle = '#ffe9a0';
      ctx.beginPath();
      ctx.arc(it.x, it.y, 3.5, 0, TAU);
      ctx.fill();
      break;
    }
    default:
  }
}

function shade(hex) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.floor(((n >> 16) & 255) * 0.72);
  const g = Math.floor(((n >> 8) & 255) * 0.72);
  const b = Math.floor((n & 255) * 0.72);
  return `rgb(${r},${g},${b})`;
}

// ---------- cars ----------

function drawCarShadow(ctx, car) {
  ctx.save();
  ctx.translate(car.x + 4, car.y + 5);
  ctx.rotate(car.heading);
  ctx.fillStyle = 'rgba(0,0,0,0.32)';
  roundRect(ctx, -CAR.length / 2, -CAR.width / 2, CAR.length, CAR.width, 7);
  ctx.fill();
  ctx.restore();
}

export function drawCar(ctx, car, { ghost = false } = {}) {
  ctx.save();
  ctx.translate(car.x, car.y);
  ctx.rotate(car.heading);
  if (ghost) ctx.globalAlpha = 0.42;
  const color = ghost ? '#7fe7ff' : car.color;
  // Wheels: front ones turn with the steering, treads move with speed.
  const roll = ((car.wheelRot || 0) % 4 + 4) % 4;
  for (const [wx, wy, front] of [
    [13, -10.5, true],
    [13, 10.5, true],
    [-13, -10.5, false],
    [-13, 10.5, false],
  ]) {
    ctx.save();
    ctx.translate(wx, wy);
    if (front) ctx.rotate((car.steer || 0) * 0.45);
    ctx.fillStyle = '#111215';
    ctx.fillRect(-5, -2.8, 10, 5.6);
    ctx.fillStyle = 'rgba(255,255,255,0.22)';
    ctx.fillRect(-5 + roll * 2.4, -2.8, 1.2, 5.6);
    ctx.restore();
  }
  // Body
  const g = ctx.createLinearGradient(0, -10, 0, 10);
  g.addColorStop(0, shade(color.length === 7 ? color : '#7fe7ff'));
  g.addColorStop(0.5, color);
  g.addColorStop(1, shade(color.length === 7 ? color : '#7fe7ff'));
  ctx.fillStyle = g;
  roundRect(ctx, -22, -9.5, 44, 19, 7);
  ctx.fill();
  // Stripe, glass, spoiler
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.fillRect(-20, -1.6, 40, 3.2);
  ctx.fillStyle = '#1b2433';
  ctx.beginPath();
  ctx.moveTo(9, -7);
  ctx.lineTo(3, -6.5);
  ctx.lineTo(3, 6.5);
  ctx.lineTo(9, 7);
  ctx.closePath();
  ctx.fill();
  ctx.fillRect(-12, -6, 5, 12);
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(-23, -10, 3.5, 20);
  // Lights
  ctx.fillStyle = '#fff6d0';
  ctx.fillRect(19.5, -8, 2.5, 4);
  ctx.fillRect(19.5, 4, 2.5, 4);
  ctx.fillStyle = car.braking ? '#ff3b3b' : '#8a1f1f';
  ctx.fillRect(-22, -8, 2, 4);
  ctx.fillRect(-22, 4, 2, 4);
  if (car.braking && !ghost) {
    ctx.fillStyle = 'rgba(255,60,60,0.25)';
    ctx.beginPath();
    ctx.arc(-24, 0, 12, 0, TAU);
    ctx.fill();
  }
  if (car.boost > 0 && !ghost) {
    ctx.fillStyle = `rgba(120,200,255,${0.4 + Math.random() * 0.4})`;
    ctx.beginPath();
    ctx.moveTo(-22, -4);
    ctx.lineTo(-34 - Math.random() * 10, 0);
    ctx.lineTo(-22, 4);
    ctx.fill();
  }
  if (ghost) {
    ctx.strokeStyle = '#bff6ff';
    ctx.lineWidth = 1.5;
    roundRect(ctx, -22, -9.5, 44, 19, 7);
    ctx.stroke();
  }
  ctx.restore();
}

function drawParticles(ctx, ps) {
  for (const p of ps) {
    const a = clamp(p.life / p.max, 0, 1);
    if (p.kind === 'spark') {
      ctx.strokeStyle = `rgba(255,${180 + Math.floor(60 * a)},90,${a})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - p.vx * 0.03, p.y - p.vy * 0.03);
      ctx.stroke();
    } else {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = a * 0.5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (1.6 - a * 0.6), 0, TAU);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }
}

// ---------- HUD ----------

function panelBox(ctx, x, y, w, h) {
  roundRect(ctx, x, y, w, h, 12);
  ctx.fillStyle = 'rgba(8,10,14,0.55)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawHud(ctx, race, view, opts) {
  const { width: W, height: H } = view;
  const small = W < 640;
  const p = race.player;
  const pad = small ? 10 : 16;

  // Timing panel
  const pw = small ? 150 : 190;
  panelBox(ctx, pad, pad, pw, small ? 78 : 92);
  const lap = Math.min(LAPS, p.lap + 1);
  hudText(ctx, `LAP ${lap}/${LAPS}`, pad + 12, pad + 18, { size: 11, mono: true, weight: 600, color: race.finalLap && !p.finished ? '#ffd166' : '#8fe9ff' });
  hudText(ctx, fmtTime(p.finished ? p.finishTime : Math.max(0, race.time)), pad + 12, pad + (small ? 42 : 46), { size: small ? 20 : 26, weight: 600, mono: true });
  const lapNow = race.phase === 'countdown' ? 0 : race.time - p.lapStart;
  hudText(ctx, `LAP  ${fmtTime(p.finished ? p.lapTimes[p.lapTimes.length - 1] : lapNow)}`, pad + 12, pad + (small ? 58 : 66), { size: 10, mono: true, weight: 400, color: 'rgba(240,240,250,0.75)' });
  hudText(ctx, `BEST ${fmtTime(p.bestLap ?? opts.bestLap)}`, pad + 12, pad + (small ? 71 : 81), { size: 10, mono: true, weight: 400, color: 'rgba(240,240,250,0.6)' });

  // Position or ghost
  if (race.mode === 'race') {
    const pos = positionOf(race, p);
    hudText(ctx, ord(pos), W / 2 - 6, pad + (small ? 30 : 38), { size: small ? 28 : 38, weight: 700, align: 'right' });
    hudText(ctx, `/ ${race.cars.length}`, W / 2, pad + (small ? 30 : 38), { size: small ? 14 : 18, weight: 500, color: 'rgba(240,240,250,0.65)' });
  } else {
    hudText(ctx, race.ghost ? `GHOST ${fmtTime(race.ghost.data.time)}` : 'TIME TRIAL · NO GHOST YET', W / 2, pad + 18, { size: 11, mono: true, align: 'center', weight: 500, color: '#bff6ff' });
    if (race.delta && race.delta.t < 2.6) {
      const v = race.delta.value;
      hudText(ctx, `${v <= 0 ? '−' : '+'}${Math.abs(v).toFixed(2)}`, W / 2, pad + 46, { size: small ? 22 : 28, weight: 700, align: 'center', mono: true, color: v <= 0 ? '#5ef0a0' : '#ff6b7a', alpha: clamp(2.6 - race.delta.t, 0, 1) });
    }
  }

  // Minimap
  const mm = small ? 92 : 132;
  const mx = W - pad - mm;
  const my = pad;
  panelBox(ctx, mx, my, mm, mm * 0.78);
  drawMinimap(ctx, race, mx + 8, my + 8, mm - 16, mm * 0.78 - 16);

  // Speedometer
  const kmh = Math.round(p.speed * KMH);
  const gx = opts.touch ? W - pad - 50 : W - pad - 62;
  const gy = opts.touch ? my + mm * 0.78 + 56 : H - pad - 62;
  const gr = opts.touch ? 38 : 50;
  ctx.lineCap = 'round';
  ctx.lineWidth = opts.touch ? 6 : 8;
  ctx.strokeStyle = 'rgba(255,255,255,0.14)';
  ctx.beginPath();
  ctx.arc(gx, gy, gr, Math.PI * 0.75, Math.PI * 2.25);
  ctx.stroke();
  ctx.strokeStyle = p.boost > 0 ? '#7fd0ff' : kmh > 220 ? '#ffd166' : '#5ef0a0';
  ctx.beginPath();
  ctx.arc(gx, gy, gr, Math.PI * 0.75, Math.PI * 0.75 + Math.PI * 1.5 * clamp(kmh / 280, 0, 1));
  ctx.stroke();
  ctx.lineCap = 'butt';
  hudText(ctx, String(kmh), gx, gy + 6, { size: opts.touch ? 18 : 24, weight: 700, align: 'center', mono: true });
  hudText(ctx, 'KM/H', gx, gy + (opts.touch ? 20 : 24), { size: 9, mono: true, align: 'center', weight: 500, color: 'rgba(240,240,250,0.6)' });

  // Drift meter
  const drift = p.drifting ? Math.round(p.driftScore) : 0;
  if (drift > 20) {
    hudText(ctx, `DRIFT ${drift}`, W / 2, H * 0.3, { size: small ? 18 : 22, weight: 700, align: 'center', mono: true, color: '#ffb547' });
  }
  if (opts.driftFlash && opts.driftFlash.t < 1.4) {
    hudText(ctx, `+${opts.driftFlash.points} drift · boost`, W / 2, H * 0.3 + 26, { size: 13, weight: 600, align: 'center', color: '#ffe08a', alpha: clamp(1.4 - opts.driftFlash.t, 0, 1) });
  }
  if (race.mode === 'race' || race.driftTotal > 0) {
    hudText(ctx, `DRIFT POINTS ${race.driftTotal}`, pad + 12, pad + (small ? 92 : 108), { size: 10, mono: true, weight: 500, color: 'rgba(255,200,120,0.85)' });
  }

  // Countdown lights
  if (race.phase === 'countdown') {
    const n = Math.ceil(race.countdown);
    const lit = clamp(4 - n, 0, 3);
    const cw = 150;
    panelBox(ctx, W / 2 - cw / 2, H * 0.36 - 30, cw, 60);
    for (let k = 0; k < 3; k += 1) {
      ctx.fillStyle = k < lit ? '#ff3b3b' : 'rgba(255,255,255,0.12)';
      ctx.beginPath();
      ctx.arc(W / 2 - 44 + k * 44, H * 0.36, 16, 0, TAU);
      ctx.fill();
    }
  } else if (race.time < 1) {
    hudText(ctx, 'GO!', W / 2, H * 0.38, { size: 54, weight: 800, align: 'center', color: '#5ef0a0', alpha: clamp(1 - race.time, 0, 1) });
  }
  if (race.lapFlash && race.lapFlash.t < 2.2 && !p.finished) {
    const lf = race.lapFlash;
    const txt = race.finalLap && p.lap === LAPS - 1 ? 'FINAL LAP' : `LAP ${fmtTime(lf.time)}${lf.best ? ' · BEST' : ''}`;
    hudText(ctx, txt, W / 2, H * 0.22, { size: small ? 18 : 24, weight: 700, align: 'center', color: race.finalLap ? '#ffd166' : '#ffffff', alpha: clamp(2.2 - lf.t, 0, 1) });
  }
  if (p.wrongT > 0.8 && !p.finished) {
    hudText(ctx, 'WRONG WAY', W / 2, H * 0.44, { size: 30, weight: 800, align: 'center', color: '#ff5d6c' });
  }
  if (race.phase === 'finished') {
    hudText(ctx, 'FINISH', W / 2, H * 0.34, { size: small ? 36 : 52, weight: 800, align: 'center', color: '#ffffff' });
    if (race.mode === 'race') hudText(ctx, `${ord(positionOf(race, p))} place`, W / 2, H * 0.34 + 32, { size: 18, weight: 600, align: 'center', color: '#ffd166' });
  }

  // Touch buttons
  if (opts.touch && opts.buttons) {
    for (const b of opts.buttons) {
      ctx.fillStyle = b.down ? 'rgba(255,255,255,0.32)' : 'rgba(10,12,16,0.35)';
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, TAU);
      ctx.fill();
      ctx.stroke();
      hudText(ctx, b.label, b.x, b.y + 5, { size: b.r > 40 ? 13 : 11, weight: 700, align: 'center', mono: true });
    }
  }
}

function drawMinimap(ctx, race, x, y, w, h) {
  const t = race.track;
  const b = t.bounds;
  const s = Math.min(w / (b.x1 - b.x0), h / (b.y1 - b.y0));
  const ox = x + (w - (b.x1 - b.x0) * s) / 2;
  const oy = y + (h - (b.y1 - b.y0) * s) / 2;
  const P = (px, py) => [ox + (px - b.x0) * s, oy + (py - b.y0) * s];
  ctx.strokeStyle = 'rgba(255,255,255,0.75)';
  ctx.lineWidth = 3;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  for (let i = 0; i <= t.N; i += 6) {
    const [px, py] = P(t.xs[i % t.N], t.ys[i % t.N]);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.stroke();
  const [sx, sy] = P(t.xs[0], t.ys[0]);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(sx - 1.5, sy - 4, 3, 8);
  if (race.ghost && race.ghost.visible && race.phase !== 'countdown') {
    const [gx, gy] = P(race.ghost.x, race.ghost.y);
    ctx.fillStyle = '#7fe7ff';
    ctx.beginPath();
    ctx.arc(gx, gy, 3, 0, TAU);
    ctx.fill();
  }
  for (const car of race.cars) {
    const [cx, cy] = P(car.x, car.y);
    ctx.fillStyle = car.color;
    ctx.strokeStyle = car === race.player ? '#ffffff' : 'rgba(0,0,0,0.5)';
    ctx.lineWidth = car === race.player ? 2 : 1;
    ctx.beginPath();
    ctx.arc(cx, cy, car === race.player ? 4.5 : 3.5, 0, TAU);
    ctx.fill();
    ctx.stroke();
  }
}
