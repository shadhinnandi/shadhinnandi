// Drawing for Last Train Home: a side view with parallax layers. The sky
// follows the clock (dawn, day, dusk, night); scenery comes from the line's
// region; tunnels, bridges, signs, people and stations sit at their real
// distances along the line, and the steam train stays put while the world
// scrolls past.

import { LINES, REGION_NAMES, STATIONS, lineById } from './world.js';
import { DEADLINE, blockPresent, clockOf, isHiddenOpen } from './game.js';
import { TAU, bar, clamp, hudText, roundRect } from '../shared/math.js';

const PX_PER_KM = 260;

const hash = (n, k = 0) => {
  const s = Math.sin(n * 127.1 + k * 311.7) * 43758.5453;
  return s - Math.floor(s);
};

// Sky colours through the day: [hour, top, bottom]
const SKY = [
  [0, '#070b1c', '#1a2244'],
  [5, '#141a3a', '#4a3a6a'],
  [6.5, '#f0a07a', '#f6d2a0'],
  [9, '#5f9fe0', '#bfe0f5'],
  [16, '#5a96d8', '#cfe6f5'],
  [18, '#e8875a', '#f6c37a'],
  [19.5, '#3a2f5f', '#a0607a'],
  [21, '#0b1028', '#25284a'],
  [24, '#070b1c', '#1a2244'],
];

const mix = (a, b, t) => {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (s) => Math.round(((pa >> s) & 255) + (((pb >> s) & 255) - ((pa >> s) & 255)) * t);
  return `rgb(${ch(16)},${ch(8)},${ch(0)})`;
};

function skyAt(h) {
  for (let i = 0; i < SKY.length - 1; i += 1) {
    const [h0, t0, b0] = SKY[i];
    const [h1, t1, b1] = SKY[i + 1];
    if (h >= h0 && h <= h1) {
      const t = (h - h0) / (h1 - h0);
      return { top: mix(t0, t1, t), bottom: mix(b0, b1, t) };
    }
  }
  return { top: SKY[0][1], bottom: SKY[0][2] };
}

export const nightness = (h) => (h < 5 ? 1 : h < 7 ? 1 - (h - 5) / 2 : h < 18 ? 0 : h < 20.5 ? (h - 18) / 2.5 : 1);

const PAL = {
  country: { far: '#7aa36a', mid: '#5f8f4f', ground: '#6f9a4a', near: '#4f7a38' },
  mountain: { far: '#8a93a8', mid: '#4f6a58', ground: '#6a7060', near: '#5a5f52' },
  coast: { far: '#6aa8c8', mid: '#c9b98a', ground: '#d8c89a', near: '#a8b06a' },
  forest: { far: '#3f6a52', mid: '#2f5a3f', ground: '#3f5f34', near: '#2a4a2a' },
  snow: { far: '#c9d6e8', mid: '#a8bccf', ground: '#e9eff6', near: '#cfdbe8' },
};

export function renderTrain(ctx, g, view, opts) {
  const { width: W, height: H } = view;
  const clk = clockOf(g);
  const hour = clk.hourOfDay;
  const night = nightness(hour);
  const line = g.line ? lineById(g.line) : null;
  const region = line ? line.region : STATIONS[g.station].region;
  const pal = PAL[region];
  const pos = line ? g.pos : 0;
  const scroll = (pos + (opts.idleScroll || 0)) * PX_PER_KM;
  const groundY = Math.round(H * 0.7);
  const trainX = W * 0.34;

  // Sky
  const sky = skyAt(hour);
  const sg = ctx.createLinearGradient(0, 0, 0, groundY);
  sg.addColorStop(0, sky.top);
  sg.addColorStop(1, sky.bottom);
  ctx.fillStyle = sg;
  ctx.fillRect(0, 0, W, groundY + 2);
  if (night > 0.3) {
    ctx.fillStyle = `rgba(255,255,255,${(night - 0.3) * 0.9})`;
    for (let k = 0; k < 80; k += 1) ctx.fillRect(hash(k) * W, hash(k, 2) * groundY * 0.7, 1.4, 1.4);
    if (region === 'snow') {
      // Northern lights
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (let k = 0; k < 3; k += 1) {
        ctx.strokeStyle = `rgba(${k === 1 ? '120,255,200' : '90,200,255'},${0.12 * night})`;
        ctx.lineWidth = 30;
        ctx.beginPath();
        for (let x = 0; x <= W; x += 30) ctx.lineTo(x, groundY * 0.25 + Math.sin(x / 140 + opts.time * 0.3 + k) * 30 + k * 20);
        ctx.stroke();
      }
      ctx.restore();
    }
  }
  // Sun or moon on an arc
  const dayT = (hour - 6) / 13;
  if (dayT > 0 && dayT < 1) {
    const sx = W * (0.1 + 0.8 * dayT);
    const sy = groundY - Math.sin(dayT * Math.PI) * groundY * 0.7;
    const sun = ctx.createRadialGradient(sx, sy, 4, sx, sy, 70);
    sun.addColorStop(0, 'rgba(255,240,200,0.9)');
    sun.addColorStop(1, 'rgba(255,220,150,0)');
    ctx.fillStyle = sun;
    ctx.fillRect(sx - 70, sy - 70, 140, 140);
    ctx.fillStyle = '#fff4d6';
    ctx.beginPath();
    ctx.arc(sx, sy, 16, 0, TAU);
    ctx.fill();
  } else {
    ctx.fillStyle = '#f2ead8';
    ctx.beginPath();
    ctx.arc(W * 0.8, groundY * 0.22, 13, 0, TAU);
    ctx.fill();
  }
  // Clouds
  for (let k = 0; k < 7; k += 1) {
    const cx = (((hash(k, 5) * W * 1.6 - scroll * 0.03 - opts.time * (6 + k)) % (W * 1.6)) + W * 1.6) % (W * 1.6) - W * 0.3;
    const cy = groundY * (0.12 + hash(k, 6) * 0.35);
    ctx.fillStyle = night > 0.5 ? 'rgba(160,170,210,0.18)' : 'rgba(255,255,255,0.75)';
    for (let j = 0; j < 4; j += 1) {
      ctx.beginPath();
      ctx.ellipse(cx + j * 22, cy + (j % 2) * 4, 30 - j * 3, 13, 0, 0, TAU);
      ctx.fill();
    }
  }

  drawFar(ctx, region, pal, W, groundY, scroll);
  drawMid(ctx, region, pal, W, groundY, scroll, opts.time);

  // Ground and the bridge gaps
  const bridges = line ? line.events.filter((e) => e.type === 'bridge') : [];
  const toX = (km) => trainX + (km - pos) * PX_PER_KM;
  ctx.fillStyle = pal.ground;
  ctx.fillRect(0, groundY, W, H - groundY);
  for (const b of bridges) {
    const x0 = toX(b.from);
    const x1 = toX(b.to);
    if (x1 < 0 || x0 > W) continue;
    const vg = ctx.createLinearGradient(0, groundY, 0, H);
    vg.addColorStop(0, region === 'coast' ? '#2f86b3' : '#4f6a58');
    vg.addColorStop(1, region === 'coast' ? '#1d5f8f' : '#2a3a30');
    ctx.fillStyle = vg;
    ctx.fillRect(x0, groundY, x1 - x0, H - groundY);
    ctx.fillStyle = region === 'coast' ? 'rgba(255,255,255,0.4)' : '#3f86b3';
    ctx.fillRect(x0, H - 24, x1 - x0, region === 'coast' ? 3 : 24);
    // Truss
    ctx.strokeStyle = '#5a4a3a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let x = x0; x < x1; x += 40) {
      ctx.moveTo(x, groundY + 4);
      ctx.lineTo(x + 20, groundY + 34);
      ctx.lineTo(x + 40, groundY + 4);
    }
    ctx.moveTo(x0, groundY + 34);
    ctx.lineTo(x1, groundY + 34);
    ctx.stroke();
    for (let x = x0 + 60; x < x1; x += 160) {
      ctx.fillStyle = '#6a5a48';
      ctx.fillRect(x, groundY + 34, 12, H - groundY);
    }
  }

  // Track: ballast, sleepers, rails
  ctx.fillStyle = 'rgba(80,70,60,0.85)';
  ctx.fillRect(0, groundY - 4, W, 10);
  ctx.fillStyle = '#4a3a2a';
  const sleeperGap = 16;
  for (let x = -(scroll % sleeperGap); x < W; x += sleeperGap) ctx.fillRect(x, groundY - 3, 9, 6);
  ctx.fillStyle = '#9aa0a8';
  ctx.fillRect(0, groundY - 6, W, 3);

  // Trackside objects at real distances
  if (line) {
    drawStation(ctx, STATIONS[line.from], toX(0), groundY, night, 'from');
    drawStation(ctx, STATIONS[line.to], toX(line.km), groundY, night, 'to');
    for (const e of line.events) {
      if (e.type === 'limit') drawSign(ctx, toX(e.from), groundY, String(e.limit));
      if (e.type === 'block' && blockPresent(g, line, e)) drawBlock(ctx, e.kind, toX(e.km), groundY, opts.time);
      if (e.type === 'flag' && !g.doneEvents[`${line.id}:flag:${e.km}`]) drawPerson(ctx, toX(e.km), groundY, opts.time, e.kind);
    }
    for (let k = Math.floor(pos * 4) - 6; k < Math.floor(pos * 4) + 12; k += 1) {
      const x = toX(k / 4);
      if (x < -20 || x > W + 20) continue;
      drawNear(ctx, region, pal, x, groundY, k);
    }
  } else {
    drawStation(ctx, STATIONS[g.station], trainX - 40, groundY, night, 'here');
  }

  // The train
  drawTrainSet(ctx, g, trainX, groundY, night, opts.time, opts.smoke);

  // Tunnel: darkness with passing lamps
  const tunnel = line && line.events.find((e) => e.type === 'tunnel' && pos > e.from && pos < e.to);
  if (line) {
    for (const t of line.events.filter((e) => e.type === 'tunnel')) {
      for (const km of [t.from, t.to]) {
        const x = toX(km);
        if (x < -80 || x > W + 80) continue;
        ctx.fillStyle = '#5a554c';
        ctx.fillRect(x - 30, groundY - 120, 60, 120);
        ctx.fillStyle = '#16140f';
        ctx.beginPath();
        ctx.moveTo(x - 20, groundY);
        ctx.lineTo(x - 20, groundY - 80);
        ctx.arc(x, groundY - 80, 20, Math.PI, 0);
        ctx.lineTo(x + 20, groundY);
        ctx.fill();
      }
    }
  }
  if (tunnel) {
    ctx.fillStyle = 'rgba(8,8,10,0.86)';
    ctx.fillRect(0, 0, W, H);
    for (let x = -((scroll * 1.0) % 180); x < W; x += 180) {
      const lg = ctx.createRadialGradient(x, groundY - 120, 2, x, groundY - 120, 50);
      lg.addColorStop(0, 'rgba(255,200,120,0.8)');
      lg.addColorStop(1, 'rgba(255,200,120,0)');
      ctx.fillStyle = lg;
      ctx.fillRect(x - 50, groundY - 170, 100, 100);
    }
    drawTrainSet(ctx, g, trainX, groundY, 1, opts.time, false, true);
  } else if (night > 0) {
    ctx.fillStyle = `rgba(10,14,36,${night * 0.45})`;
    ctx.fillRect(0, 0, W, H);
    drawLights(ctx, g, trainX, groundY, night);
  }

  // Weather
  const wx = line && line.events.find((e) => e.type === 'weather' && pos > e.from && pos < e.to);
  if (wx || region === 'snow') {
    const snow = (wx && wx.kind === 'snow') || region === 'snow';
    ctx.fillStyle = snow ? 'rgba(255,255,255,0.85)' : 'rgba(180,200,230,0.5)';
    for (let k = 0; k < (snow ? 90 : 120); k += 1) {
      const x = (((hash(k, 7) * W - opts.time * (snow ? 40 : 30) - scroll * 0.4) % W) + W) % W;
      const y = (hash(k, 8) * H + opts.time * (snow ? 60 : 500)) % H;
      if (snow) ctx.fillRect(x, y, 2.5, 2.5);
      else ctx.fillRect(x, y, 1.2, 10);
    }
  }
  if (g.crash > 0) {
    ctx.fillStyle = `rgba(255,80,60,${g.crash * 0.5})`;
    ctx.fillRect(0, 0, W, H);
  }

  if (opts.hud) drawHud(ctx, g, view, opts, line, clk);
}

// ---------- scenery ----------

function drawFar(ctx, region, pal, W, gy, scroll) {
  const off = scroll * 0.06;
  ctx.fillStyle = pal.far;
  ctx.beginPath();
  ctx.moveTo(0, gy);
  for (let x = 0; x <= W + 20; x += 20) {
    const u = (x + off) / 120;
    let h;
    if (region === 'mountain' || region === 'snow') h = 120 + Math.abs(Math.sin(u * 0.9)) * 120 + Math.sin(u * 2.3) * 30;
    else if (region === 'coast') h = 26 + Math.sin(u) * 8;
    else h = 70 + Math.sin(u) * 30 + Math.sin(u * 2.7) * 15;
    ctx.lineTo(x, gy - h);
  }
  ctx.lineTo(W, gy);
  ctx.fill();
  if (region === 'mountain' || region === 'snow') {
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    for (let k = 0; k < 8; k += 1) {
      const x = ((k * 260 - off * 1) % (W + 300) + W + 300) % (W + 300) - 100;
      const u = (x + off) / 120;
      const h = 120 + Math.abs(Math.sin(u * 0.9)) * 120 + Math.sin(u * 2.3) * 30;
      ctx.beginPath();
      ctx.moveTo(x - 24, gy - h + 34);
      ctx.lineTo(x, gy - h);
      ctx.lineTo(x + 24, gy - h + 34);
      ctx.fill();
    }
  }
  if (region === 'coast') {
    // Sea in front of the far hills
    ctx.fillStyle = '#3f8fb8';
    ctx.fillRect(0, gy - 26, W, 26);
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    for (let k = 0; k < 20; k += 1) ctx.fillRect(((hash(k) * W - off * 2) % W + W) % W, gy - 20 + hash(k, 1) * 16, 14, 1.5);
    for (let k = 0; k < 3; k += 1) {
      const x = ((hash(k, 3) * W - off * 1.5) % W + W) % W;
      ctx.fillStyle = '#f4f1ea';
      ctx.beginPath();
      ctx.moveTo(x, gy - 30);
      ctx.lineTo(x, gy - 48);
      ctx.lineTo(x + 12, gy - 30);
      ctx.fill();
    }
  }
}

function drawMid(ctx, region, pal, W, gy, scroll, time) {
  const off = scroll * 0.25;
  const spacing = 70;
  const k0 = Math.floor(off / spacing) - 2;
  for (let k = k0; k < k0 + W / spacing + 4; k += 1) {
    const x = k * spacing - off;
    const h = hash(k, region.length);
    if (region === 'country') {
      if (h < 0.18) drawBarn(ctx, x, gy - 14, h);
      else if (h < 0.26) drawWindmill(ctx, x, gy - 14, time);
      else if (h < 0.6) drawTree(ctx, x, gy - 12, 18 + h * 10, '#4f8a45');
      ctx.fillStyle = h > 0.5 ? '#c9b25a' : '#86b05a';
      ctx.fillRect(x, gy - 14, spacing, 6);
    } else if (region === 'mountain') {
      for (let j = 0; j < 2; j += 1) drawPine(ctx, x + j * 30, gy - 10 - hash(k, j) * 30, 22 + hash(k, j + 3) * 14, '#3f5f48');
    } else if (region === 'coast') {
      if (h < 0.12) drawLighthouse(ctx, x, gy - 30);
      else if (h < 0.3) drawHut(ctx, x, gy - 12, h);
      else if (h < 0.5) drawPalm(ctx, x, gy - 10);
    } else if (region === 'forest') {
      for (let j = 0; j < 3; j += 1) drawTree(ctx, x + j * 22, gy - 8 - hash(k, j) * 18, 26 + hash(k, j + 1) * 14, j % 2 ? '#2f5a3f' : '#3a6a48');
    } else {
      for (let j = 0; j < 2; j += 1) drawPine(ctx, x + j * 34, gy - 10 - hash(k, j) * 24, 24 + hash(k, j + 2) * 12, '#4f6a60', true);
    }
  }
}

function drawNear(ctx, region, pal, x, gy, k) {
  const h = hash(k, 11);
  if (k % 2 === 0) {
    // Telegraph pole
    ctx.fillStyle = '#4a3a2a';
    ctx.fillRect(x, gy - 90, 4, 92);
    ctx.fillRect(x - 10, gy - 84, 24, 3);
    ctx.strokeStyle = 'rgba(30,30,30,0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x - 10, gy - 83);
    ctx.quadraticCurveTo(x + PX_PER_KM / 4, gy - 70, x + PX_PER_KM / 2 - 10, gy - 83);
    ctx.stroke();
  }
  if (region === 'country' && h < 0.5) {
    ctx.fillStyle = '#8a6a44';
    for (let j = 0; j < 4; j += 1) ctx.fillRect(x + 10 + j * 14, gy + 14, 3, 14);
    ctx.fillRect(x + 10, gy + 18, 45, 2);
  }
  if (region === 'forest' && h < 0.7) drawTree(ctx, x + 20, gy + 40, 40, '#24442a');
  if (region === 'mountain' && h < 0.4) {
    ctx.fillStyle = '#6a6458';
    ctx.beginPath();
    ctx.ellipse(x + 30, gy + 30, 30, 14, 0, 0, TAU);
    ctx.fill();
  }
  if (region === 'snow' && h < 0.5) drawPine(ctx, x + 20, gy + 40, 38, '#3f5a50', true);
  if (region === 'coast' && h < 0.5) {
    ctx.strokeStyle = '#8aa05a';
    ctx.lineWidth = 2;
    for (let j = 0; j < 5; j += 1) {
      ctx.beginPath();
      ctx.moveTo(x + j * 6, gy + 26);
      ctx.lineTo(x + j * 6 - 4, gy + 12);
      ctx.stroke();
    }
  }
}

function drawTree(ctx, x, y, s, col) {
  ctx.fillStyle = '#4a3420';
  ctx.fillRect(x - 2, y - s * 0.4, 4, s * 0.4 + 2);
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.arc(x, y - s * 0.6, s * 0.42, 0, TAU);
  ctx.arc(x - s * 0.25, y - s * 0.45, s * 0.3, 0, TAU);
  ctx.arc(x + s * 0.25, y - s * 0.45, s * 0.3, 0, TAU);
  ctx.fill();
}

function drawPine(ctx, x, y, s, col, snow = false) {
  ctx.fillStyle = col;
  for (let k = 0; k < 3; k += 1) {
    ctx.beginPath();
    ctx.moveTo(x, y - s + k * s * 0.25);
    ctx.lineTo(x + s * 0.35 - k * 2, y - s * 0.35 + k * s * 0.2);
    ctx.lineTo(x - s * 0.35 + k * 2, y - s * 0.35 + k * s * 0.2);
    ctx.fill();
  }
  if (snow) {
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.beginPath();
    ctx.moveTo(x, y - s);
    ctx.lineTo(x + 6, y - s + 10);
    ctx.lineTo(x - 6, y - s + 10);
    ctx.fill();
  }
}

function drawBarn(ctx, x, y, h) {
  ctx.fillStyle = '#b8483a';
  ctx.fillRect(x, y - 26, 36, 26);
  ctx.fillStyle = '#7a2f26';
  ctx.beginPath();
  ctx.moveTo(x - 4, y - 26);
  ctx.lineTo(x + 18, y - 42);
  ctx.lineTo(x + 40, y - 26);
  ctx.fill();
  ctx.fillStyle = '#f4efe4';
  ctx.fillRect(x + 13, y - 16, 10, 16);
  if (h > 0.1) {
    ctx.fillStyle = '#c9c2b0';
    ctx.fillRect(x + 42, y - 40, 10, 40);
    ctx.beginPath();
    ctx.arc(x + 47, y - 40, 5, Math.PI, 0);
    ctx.fill();
  }
}

function drawWindmill(ctx, x, y, time) {
  ctx.fillStyle = '#e9e2d3';
  ctx.beginPath();
  ctx.moveTo(x - 8, y);
  ctx.lineTo(x - 4, y - 44);
  ctx.lineTo(x + 4, y - 44);
  ctx.lineTo(x + 8, y);
  ctx.fill();
  ctx.strokeStyle = '#6a5a48';
  ctx.lineWidth = 3;
  for (let k = 0; k < 4; k += 1) {
    const a = time * 1.2 + (k * Math.PI) / 2;
    ctx.beginPath();
    ctx.moveTo(x, y - 44);
    ctx.lineTo(x + Math.cos(a) * 24, y - 44 + Math.sin(a) * 24);
    ctx.stroke();
  }
}

function drawLighthouse(ctx, x, y) {
  for (let k = 0; k < 5; k += 1) {
    ctx.fillStyle = k % 2 ? '#d6403a' : '#f4f1ea';
    ctx.fillRect(x - 7 + k * 0.5, y - 16 - k * 14, 14 - k, 14);
  }
  ctx.fillStyle = '#ffe9a0';
  ctx.fillRect(x - 5, y - 96, 10, 10);
}

function drawHut(ctx, x, y, h) {
  ctx.fillStyle = h < 0.2 ? '#3f8fb0' : '#e0b04a';
  ctx.fillRect(x, y - 18, 28, 18);
  ctx.fillStyle = '#5a3a22';
  ctx.beginPath();
  ctx.moveTo(x - 3, y - 18);
  ctx.lineTo(x + 14, y - 30);
  ctx.lineTo(x + 31, y - 18);
  ctx.fill();
}

function drawPalm(ctx, x, y) {
  ctx.strokeStyle = '#8a6a44';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + 6, y - 20, x + 2, y - 36);
  ctx.stroke();
  ctx.fillStyle = '#3f8a4a';
  for (let k = 0; k < 5; k += 1) {
    const a = -Math.PI / 2 + (k - 2) * 0.6;
    ctx.beginPath();
    ctx.ellipse(x + 2 + Math.cos(a) * 10, y - 36 + Math.sin(a) * 6, 12, 3, a, 0, TAU);
    ctx.fill();
  }
}

function drawStation(ctx, st, x, gy, night, which) {
  if (x < -320 || x > ctx.canvas.width + 320) return;
  // Platform
  ctx.fillStyle = '#9a9488';
  ctx.fillRect(x - 160, gy - 12, 320, 12);
  ctx.fillStyle = '#c9c2b0';
  ctx.fillRect(x - 160, gy - 14, 320, 3);
  // Building
  ctx.fillStyle = st.color;
  ctx.fillRect(x - 70, gy - 74, 140, 60);
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.moveTo(x - 82, gy - 74);
  ctx.lineTo(x, gy - 104);
  ctx.lineTo(x + 82, gy - 74);
  ctx.fill();
  ctx.fillStyle = night > 0.4 ? '#ffd88a' : '#2a3038';
  for (let k = 0; k < 4; k += 1) ctx.fillRect(x - 58 + k * 32, gy - 60, 16, 20);
  // Name board
  ctx.font = "600 13px 'IBM Plex Sans', sans-serif";
  const tw = ctx.measureText(st.name).width;
  ctx.fillStyle = '#1f2a3a';
  roundRect(ctx, x - tw / 2 - 12, gy - 132, tw + 24, 24, 4);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText(st.name, x, gy - 115);
  ctx.textAlign = 'left';
  // Lamps
  for (const lx of [x - 140, x + 140]) {
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(lx, gy - 64, 3, 52);
    ctx.fillStyle = night > 0.3 ? '#ffe6a0' : '#d8d2c0';
    ctx.beginPath();
    ctx.arc(lx + 1.5, gy - 66, 5, 0, TAU);
    ctx.fill();
  }
  if (which === 'to') {
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillRect(x - 2, gy - 8, 4, 8);
  }
}

function drawSign(ctx, x, gy, text) {
  if (x < -30 || x > ctx.canvas.width + 30) return;
  ctx.fillStyle = '#4a4a4a';
  ctx.fillRect(x - 1.5, gy - 54, 3, 54);
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(x, gy - 62, 13, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = '#d6403a';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = '#16171a';
  ctx.font = "700 11px 'IBM Plex Sans', sans-serif";
  ctx.textAlign = 'center';
  ctx.fillText(text, x, gy - 58);
  ctx.textAlign = 'left';
}

function drawBlock(ctx, kind, x, gy, time) {
  if (x < -80 || x > ctx.canvas.width + 80) return;
  if (kind === 'rocks') {
    for (const [dx, r, c] of [
      [-14, 16, '#7a746a'],
      [10, 20, '#8a847a'],
      [30, 12, '#6a645a'],
      [-30, 10, '#8a847a'],
    ]) {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(x + dx, gy - r * 0.7, r, 0, TAU);
      ctx.fill();
    }
  } else if (kind === 'tree') {
    ctx.save();
    ctx.translate(x, gy - 10);
    ctx.rotate(-0.08);
    ctx.fillStyle = '#5a3d23';
    ctx.fillRect(-60, -6, 120, 12);
    ctx.fillStyle = '#2f5a3f';
    ctx.beginPath();
    ctx.ellipse(50, -10, 30, 18, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
  } else {
    for (let k = 0; k < 3; k += 1) {
      const dx = k * 26 - 26 + Math.sin(time * 2 + k) * 2;
      ctx.fillStyle = '#8a5a34';
      ctx.fillRect(x + dx - 10, gy - 26, 20, 10);
      ctx.fillRect(x + dx - 8, gy - 16, 3, 14);
      ctx.fillRect(x + dx + 6, gy - 16, 3, 14);
      ctx.fillRect(x + dx + 8, gy - 34, 6, 10);
    }
  }
}

function drawPerson(ctx, x, gy, time, kind) {
  if (x < -40 || x > ctx.canvas.width + 40) return;
  const wave = Math.sin(time * 6) * 0.6;
  ctx.fillStyle = kind === 'fisher' ? '#3f6a8a' : kind === 'hiker' ? '#8a5a3a' : '#a5532c';
  ctx.fillRect(x - 5, gy - 32, 10, 18);
  ctx.fillRect(x - 5, gy - 14, 4, 14);
  ctx.fillRect(x + 1, gy - 14, 4, 14);
  ctx.fillStyle = '#e0b48a';
  ctx.beginPath();
  ctx.arc(x, gy - 38, 5, 0, TAU);
  ctx.fill();
  ctx.strokeStyle = '#e0b48a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + 4, gy - 30);
  ctx.lineTo(x + 10 + Math.cos(-1.2 + wave) * 6, gy - 44 + Math.sin(-1.2 + wave) * 6);
  ctx.stroke();
  ctx.fillStyle = '#ffd34d';
  ctx.fillRect(x + 12 + Math.cos(-1.2 + wave) * 6, gy - 54, 10, 7);
}

// ---------- train ----------

function drawTrainSet(ctx, g, x, gy, night, time, smoke, silhouette = false) {
  const roll = ((g.km || 0) * 14) % TAU;
  const wheel = (wx, r) => {
    ctx.fillStyle = silhouette ? '#111' : '#2a2a2e';
    ctx.beginPath();
    ctx.arc(wx, gy - r - 4, r, 0, TAU);
    ctx.fill();
    if (silhouette) return;
    ctx.strokeStyle = '#8a8a90';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(wx, gy - r - 4);
    ctx.lineTo(wx + Math.cos(roll) * r, gy - r - 4 + Math.sin(roll) * r);
    ctx.stroke();
  };
  // Carriages
  for (let k = 0; k < 2; k += 1) {
    const cx = x - 230 - k * 120;
    ctx.fillStyle = silhouette ? '#151515' : k ? '#2f5f4a' : '#3a6a55';
    roundRect(ctx, cx, gy - 70, 112, 54, 6);
    ctx.fill();
    if (!silhouette) {
      ctx.fillStyle = '#e9dcc0';
      ctx.fillRect(cx, gy - 70, 112, 6);
      for (let w = 0; w < 4; w += 1) {
        ctx.fillStyle = night > 0.3 ? '#ffd88a' : '#9ac0d8';
        ctx.fillRect(cx + 8 + w * 26, gy - 58, 18, 16);
      }
    }
    wheel(cx + 22, 9);
    wheel(cx + 90, 9);
  }
  // Tender
  ctx.fillStyle = silhouette ? '#151515' : '#24262c';
  ctx.fillRect(x - 112, gy - 58, 76, 42);
  if (!silhouette) {
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.ellipse(x - 74, gy - 58, 34, 8, 0, Math.PI, 0);
    ctx.fill();
  }
  wheel(x - 96, 9);
  wheel(x - 52, 9);
  // Locomotive
  ctx.fillStyle = silhouette ? '#151515' : '#1f2a3a';
  ctx.fillRect(x - 34, gy - 88, 40, 70); // cab
  ctx.fillStyle = silhouette ? '#151515' : '#2a3a50';
  roundRect(ctx, x, gy - 66, 90, 40, 18); // boiler
  ctx.fill();
  if (!silhouette) {
    ctx.fillStyle = '#c9a34a';
    for (let k = 0; k < 3; k += 1) ctx.fillRect(x + 18 + k * 24, gy - 66, 4, 40);
    ctx.fillStyle = night > 0.3 ? '#ffd88a' : '#9ac0d8';
    ctx.fillRect(x - 26, gy - 80, 18, 18);
    ctx.fillStyle = '#c0392b';
    ctx.fillRect(x - 38, gy - 92, 48, 6);
  }
  ctx.fillStyle = silhouette ? '#151515' : '#16171a';
  ctx.fillRect(x + 64, gy - 90, 14, 26); // chimney
  ctx.fillRect(x + 60, gy - 94, 22, 6);
  ctx.beginPath();
  ctx.moveTo(x + 90, gy - 24);
  ctx.lineTo(x + 108, gy - 10);
  ctx.lineTo(x + 90, gy - 10);
  ctx.fill(); // cowcatcher
  wheel(x + 14, 14);
  wheel(x + 48, 14);
  wheel(x + 80, 9);
  if (!silhouette) {
    ctx.strokeStyle = '#9aa0a8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + 14 + Math.cos(roll) * 8, gy - 18 + Math.sin(roll) * 8);
    ctx.lineTo(x + 48 + Math.cos(roll) * 8, gy - 18 + Math.sin(roll) * 8);
    ctx.stroke();
  }
  // Smoke puffs drift back with speed
  if (smoke) {
    const sp = Math.max(0.5, Math.abs(g.speed) / 20);
    for (let k = 0; k < 9; k += 1) {
      const t = ((time * (0.8 + g.throttle) + k / 9) % 1);
      const px = x + 71 - t * (40 + sp * 40);
      const py = gy - 96 - t * 60 - Math.sin(k) * 6;
      ctx.fillStyle = `rgba(${night > 0.5 ? '90,90,100' : '230,230,235'},${(1 - t) * 0.55})`;
      ctx.beginPath();
      ctx.arc(px, py, 8 + t * 18, 0, TAU);
      ctx.fill();
    }
  }
}

function drawLights(ctx, g, x, gy, night) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const head = ctx.createRadialGradient(x + 104, gy - 40, 2, x + 104, gy - 40, 220);
  head.addColorStop(0, `rgba(255,230,160,${0.55 * night})`);
  head.addColorStop(1, 'rgba(255,230,160,0)');
  ctx.fillStyle = head;
  ctx.beginPath();
  ctx.moveTo(x + 100, gy - 46);
  ctx.lineTo(x + 420, gy - 110);
  ctx.lineTo(x + 420, gy + 30);
  ctx.closePath();
  ctx.fill();
  for (let k = 0; k < 2; k += 1) {
    const cx = x - 230 - k * 120;
    for (let w = 0; w < 4; w += 1) {
      ctx.fillStyle = `rgba(255,210,130,${0.35 * night})`;
      ctx.fillRect(cx + 4 + w * 26, gy - 62, 26, 24);
    }
  }
  ctx.restore();
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

function drawHud(ctx, g, view, opts, line, clk) {
  const { width: W, height: H } = view;
  const small = W < 640;
  const pad = small ? 10 : 16;

  // Destination
  const pw = small ? Math.min(230, W - 140) : 300;
  panel(ctx, pad, pad, pw, 70);
  if (line) {
    const to = STATIONS[line.to];
    hudText(ctx, `NEXT · ${REGION_NAMES[line.region].toUpperCase()}`, pad + 12, pad + 18, { size: 10, mono: true, weight: 600, color: '#ffd34d' });
    hudText(ctx, to.name, pad + 12, pad + 40, { size: small ? 15 : 18, weight: 600 });
    hudText(ctx, `${Math.max(0, line.km - g.pos).toFixed(1)} km`, pad + pw - 12, pad + 40, { size: small ? 13 : 15, weight: 600, align: 'right', mono: true });
    bar(ctx, pad + 12, pad + 52, pw - 24, 5, g.pos / line.km, '#8fd8ff');
  } else {
    hudText(ctx, 'AT THE STATION', pad + 12, pad + 18, { size: 10, mono: true, weight: 600, color: '#ffd34d' });
    hudText(ctx, STATIONS[g.station].name, pad + 12, pad + 42, { size: small ? 15 : 18, weight: 600 });
  }

  // Clock
  const cw = small ? 132 : 150;
  panel(ctx, W - pad - cw, pad, cw, 52);
  hudText(ctx, clk.text, W - pad - cw / 2, pad + 22, { size: small ? 12 : 14, weight: 600, align: 'center', mono: true });
  const left = DEADLINE - g.hours;
  hudText(ctx, left > 0 ? `Pass closes in ${Math.floor(left)} h` : 'The pass is closing', W - pad - cw / 2, pad + 40, { size: 10, mono: true, weight: 500, align: 'center', color: left > 6 ? 'rgba(255,255,255,0.65)' : '#ff9a8a' });

  // Resources
  const rw = small ? W - pad * 2 - 120 : 330;
  const ry = H - pad - (small ? 76 : 64);
  panel(ctx, pad, ry, rw, small ? 76 : 64);
  hudText(ctx, 'FUEL', pad + 12, ry + 18, { size: 9.5, mono: true, weight: 600, color: 'rgba(255,255,255,0.7)' });
  bar(ctx, pad + 52, ry + 11, small ? rw - 100 : 110, 7, g.fuel / g.tank, g.fuel > 30 ? '#5ef0a0' : g.fuel > 12 ? '#ffd166' : '#ff5d6c');
  hudText(ctx, 'TRAIN', pad + 12, ry + 34, { size: 9.5, mono: true, weight: 600, color: 'rgba(255,255,255,0.7)' });
  bar(ctx, pad + 52, ry + 27, small ? rw - 100 : 110, 7, g.condition / 100, g.condition > 50 ? '#8fd8ff' : '#ff9a8a');
  const info = `${g.credits} credits · ${g.supplies} supplies · letter ${g.fragments.length}/3${g.cargo ? ` · ${g.cargo.item}` : ''}`;
  if (small) hudText(ctx, info, pad + 12, ry + 58, { size: 10.5, weight: 500 });
  else {
    hudText(ctx, `${g.credits} credits`, pad + 178, ry + 18, { size: 12, weight: 600 });
    hudText(ctx, `${g.supplies} supplies`, pad + 178, ry + 34, { size: 12, weight: 600 });
    hudText(ctx, `Letter pages ${g.fragments.length}/3${g.cargo ? ` · carrying ${g.cargo.item}` : ''}`, pad + 12, ry + 54, { size: 11, weight: 500, color: '#ffe9a0' });
  }

  // Speed and throttle
  if (line) {
    const sx = W - pad - (opts.touch ? 74 : 64);
    const sy = opts.touch ? pad + 180 : H - pad - 66;
    ctx.lineCap = 'round';
    ctx.lineWidth = 7;
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.beginPath();
    ctx.arc(sx, sy, 44, Math.PI * 0.75, Math.PI * 2.25);
    ctx.stroke();
    ctx.strokeStyle = g.warn && g.warn.limit && g.speed > g.warn.limit ? '#ff6b6b' : '#8fd8ff';
    ctx.beginPath();
    ctx.arc(sx, sy, 44, Math.PI * 0.75, Math.PI * 0.75 + Math.PI * 1.5 * clamp(Math.abs(g.speed) / 110, 0, 1));
    ctx.stroke();
    ctx.lineCap = 'butt';
    hudText(ctx, `${Math.round(g.speed)}`, sx, sy + 6, { size: 22, weight: 700, align: 'center', mono: true });
    hudText(ctx, 'KM/H', sx, sy + 20, { size: 9, weight: 500, align: 'center', mono: true, color: 'rgba(255,255,255,0.6)' });
    hudText(ctx, `THROTTLE ${Math.round(g.throttle * 100)}%${g.brake ? ' · BRAKE' : ''}`, sx, sy + 60, { size: 9.5, mono: true, weight: 600, align: 'center', color: g.brake ? '#ff9a8a' : 'rgba(255,255,255,0.75)' });
  }

  // Warning
  if (g.warn && line) {
    const text = g.warn.text;
    ctx.font = "600 13px 'IBM Plex Sans', sans-serif";
    const tw = Math.min(ctx.measureText(text).width, W - 40);
    const wy = pad + 92;
    roundRect(ctx, W / 2 - tw / 2 - 14, wy - 18, tw + 28, 28, 14);
    ctx.fillStyle = g.warn.danger ? 'rgba(160,30,30,0.85)' : g.warn.flag ? 'rgba(30,90,60,0.85)' : 'rgba(120,80,10,0.85)';
    ctx.fill();
    hudText(ctx, text, W / 2, wy + 1, { size: 13, weight: 600, align: 'center' });
  }
  g.toasts.forEach((t, i) => {
    const a = clamp(Math.min(t.t / 0.2, (3.5 - t.t) / 0.5), 0, 1);
    hudText(ctx, t.text, W / 2, H * 0.36 + i * 24, { size: 14, weight: 600, align: 'center', alpha: a, color: t.tone === 'bad' ? '#ff9a8a' : t.tone === 'good' ? '#ffe9a0' : '#ffffff' });
  });

  if (line && g.km < 1.5 && !opts.touch) {
    hudText(ctx, 'Hold W or up to open the throttle · S or down to ease off · Space to brake · M map · L log', W / 2, H * 0.3, { size: 12, align: 'center', weight: 500 });
  }

  if (opts.touch) {
    for (const b of opts.buttons) {
      ctx.fillStyle = b.down ? 'rgba(255,255,255,0.3)' : 'rgba(14,16,22,0.5)';
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, TAU);
      ctx.fill();
      ctx.stroke();
      hudText(ctx, b.label, b.x, b.y + 4, { size: b.r > 30 ? 11 : 9.5, weight: 700, align: 'center', mono: true });
    }
  }

  if (opts.mapOpen) drawRouteMap(ctx, g, view);
}

function drawRouteMap(ctx, g, view) {
  const { width: W, height: H } = view;
  ctx.fillStyle = 'rgba(6,8,12,0.84)';
  ctx.fillRect(0, 0, W, H);
  const mw = Math.min(W - 40, (H - 90) * 1.4);
  const mh = mw / 1.4;
  const mx = (W - mw) / 2;
  const my = (H - mh) / 2 + 10;
  roundRect(ctx, mx, my, mw, mh, 12);
  ctx.fillStyle = '#e9dcc0';
  ctx.fill();
  hudText(ctx, 'ROUTE MAP', W / 2, my - 14, { size: 13, mono: true, weight: 600, align: 'center', color: '#ffd34d' });
  const P = (st) => [mx + 30 + STATIONS[st].x * (mw - 60), my + 20 + STATIONS[st].y * (mh - 40)];
  // Region washes
  const wash = { country: 'rgba(120,170,90,0.25)', mountain: 'rgba(120,120,140,0.25)', coast: 'rgba(80,150,200,0.25)', forest: 'rgba(60,120,70,0.28)', snow: 'rgba(200,215,235,0.6)' };
  for (const st of Object.keys(STATIONS)) {
    const [x, y] = P(st);
    ctx.fillStyle = wash[STATIONS[st].region];
    ctx.beginPath();
    ctx.arc(x, y, mw * 0.12, 0, TAU);
    ctx.fill();
  }
  const known = (st) => !STATIONS[st].hidden || g.revealed.includes('pinecross-whisperwood');
  for (const l of LINES) {
    if (!isHiddenOpen(g, l) || !known(l.from) || !known(l.to)) continue;
    const [x0, y0] = P(l.from);
    const [x1, y1] = P(l.to);
    ctx.strokeStyle = l.hidden ? '#7a5a8a' : '#5a4a3a';
    ctx.lineWidth = 4;
    ctx.setLineDash(l.hidden ? [8, 6] : []);
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    ctx.setLineDash([]);
    hudText(ctx, `${l.km} km`, (x0 + x1) / 2 + 6, (y0 + y1) / 2 - 4, { size: 9.5, mono: true, weight: 500, color: '#3a2e20' });
  }
  for (const st of Object.keys(STATIONS)) {
    const s = STATIONS[st];
    if (s.hidden && !g.revealed.includes('pinecross-whisperwood')) continue;
    const [x, y] = P(st);
    ctx.fillStyle = g.visited.includes(st) ? s.color : '#f4efe4';
    ctx.strokeStyle = '#3a2e20';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(x, y, s.final ? 10 : 8, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#2a2018';
    ctx.font = "600 12px 'IBM Plex Sans', sans-serif";
    ctx.textAlign = x > mx + mw * 0.7 ? 'right' : 'left';
    ctx.fillText(s.name, x + (ctx.textAlign === 'right' ? -14 : 14), y + 4);
    ctx.textAlign = 'left';
  }
  // You are here
  let here;
  if (g.line) {
    const l = lineById(g.line);
    const [x0, y0] = P(l.from);
    const [x1, y1] = P(l.to);
    const t = clamp(g.pos / l.km, 0, 1);
    here = [x0 + (x1 - x0) * t, y0 + (y1 - y0) * t];
  } else here = P(g.station);
  ctx.fillStyle = '#e8473f';
  ctx.beginPath();
  ctx.arc(here[0], here[1], 6, 0, TAU);
  ctx.fill();
  hudText(ctx, 'Filled stops: visited · Dashed line: the hidden branch · Red dot: you · M to close', W / 2, my + mh + 22, { size: 11, mono: true, weight: 500, align: 'center', color: 'rgba(255,255,255,0.75)' });
}
