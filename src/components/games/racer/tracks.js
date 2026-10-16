// Track geometry for Apex Rush. A track is a closed centripetal Catmull-Rom
// spline through hand-placed control points, resampled every DS units into
// a centreline with tangents, normals and curvature. Cars find their place
// on the track with `locate`, which searches near the previous answer.
//
// Scenery is placed with a seeded random generator, so every visit to a
// track looks the same, and is kept clear of the road.
//
// No DOM access: used by the game, the AI, the setup screen and tests.

export const DS = 8;

const mulberry = (seed) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

export const TRACKS = [
  {
    id: 'coast',
    name: 'Coastal Highway',
    blurb: 'Fast sweepers along the sea',
    halfWidth: 60,
    shoulder: 48,
    seed: 11,
    theme: {
      ground: '#c9b98a',
      ground2: '#b9aa78',
      shoulder: '#d8cfae',
      asphalt: '#4a4e57',
      asphaltEdge: '#3d4048',
      line: 'rgba(255,255,255,0.75)',
      curbA: '#e8473f',
      curbB: '#f4f1ea',
      barrier: '#e9edf2',
      sea: true,
    },
    points: [
      [700, -75],
      [1400, -150],
      [2700, -60],
      [3600, 380],
      [4000, 1200],
      [3700, 1900],
      [2900, 2150],
      [2300, 1800],
      [1700, 1950],
      [1100, 2480],
      [300, 2600],
      [-500, 2250],
      [-820, 1350],
      [-620, 520],
      [0, 0],
    ],
  },
  {
    id: 'mountain',
    name: 'Mountain Pass',
    blurb: 'Tight hairpins and a river bridge',
    halfWidth: 52,
    shoulder: 40,
    seed: 23,
    theme: {
      ground: '#5f7550',
      ground2: '#536847',
      shoulder: '#8b8a78',
      asphalt: '#3f4248',
      asphaltEdge: '#34363b',
      line: 'rgba(255,214,90,0.85)',
      curbA: '#d8d4c8',
      curbB: '#56595f',
      barrier: '#b08d5a',
      river: true,
    },
    points: [
      [450, -100],
      [900, -200],
      [1500, 180],
      [1320, 760],
      [720, 880],
      [430, 1380],
      [900, 1880],
      [1700, 1700],
      [2280, 1100],
      [2420, 420],
      [2900, -80],
      [3520, 300],
      [3420, 1100],
      [3820, 1880],
      [3220, 2600],
      [2200, 2700],
      [1200, 2820],
      [220, 2700],
      [-480, 2200],
      [-620, 1200],
      [-420, 420],
      [0, 0],
    ],
  },
  {
    id: 'city',
    name: 'City Circuit',
    blurb: 'Street corners between towers',
    halfWidth: 56,
    shoulder: 30,
    seed: 37,
    theme: {
      ground: '#3a3d45',
      ground2: '#34373e',
      shoulder: '#8e9098',
      asphalt: '#2b2d33',
      asphaltEdge: '#24262b',
      line: 'rgba(255,255,255,0.6)',
      curbA: '#e8473f',
      curbB: '#f4f1ea',
      barrier: '#c9ccd3',
      city: true,
    },
    points: [
      [0, 0],
      [1000, 0],
      [2000, 0],
      [2300, -80],
      [2400, -300],
      [2400, -1100],
      [2300, -1330],
      [2050, -1400],
      [1500, -1400],
      [1250, -1250],
      [1050, -1060],
      [800, -1000],
      [550, -1080],
      [420, -1300],
      [400, -1750],
      [300, -1960],
      [50, -2050],
      [-700, -2050],
      [-950, -1950],
      [-1050, -1700],
      [-1050, -300],
      [-950, -80],
      [-700, 0],
    ],
  },
];

// ---------- spline ----------

function catmull(p0, p1, p2, p3, t) {
  // Centripetal parametrisation avoids cusps and loops on uneven spacing.
  const d = (a, b) => Math.max(1e-6, Math.hypot(b[0] - a[0], b[1] - a[1]) ** 0.5);
  const t0 = 0;
  const t1 = t0 + d(p0, p1);
  const t2 = t1 + d(p1, p2);
  const t3 = t2 + d(p2, p3);
  const u = t1 + (t2 - t1) * t;
  const lerp = (a, b, ta, tb) => [((tb - u) / (tb - ta)) * a[0] + ((u - ta) / (tb - ta)) * b[0], ((tb - u) / (tb - ta)) * a[1] + ((u - ta) / (tb - ta)) * b[1]];
  const a1 = lerp(p0, p1, t0, t1);
  const a2 = lerp(p1, p2, t1, t2);
  const a3 = lerp(p2, p3, t2, t3);
  const b1 = lerp(a1, a2, t0, t2);
  const b2 = lerp(a2, a3, t1, t3);
  return lerp(b1, b2, t1, t2);
}

const cache = new Map();

/** Sampled geometry for a track definition (cached). */
export function buildTrack(def) {
  if (cache.has(def.id)) return cache.get(def.id);
  const P = def.points;
  const n = P.length;
  const dense = [];
  for (let i = 0; i < n; i += 1) {
    const p0 = P[(i - 1 + n) % n];
    const p1 = P[i];
    const p2 = P[(i + 1) % n];
    const p3 = P[(i + 2) % n];
    const steps = Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / 2);
    for (let k = 0; k < steps; k += 1) dense.push(catmull(p0, p1, p2, p3, k / steps));
  }
  // Resample at even spacing.
  const xs = [];
  const ys = [];
  let carry = 0;
  for (let i = 0; i < dense.length; i += 1) {
    const a = dense[i];
    const b = dense[(i + 1) % dense.length];
    const seg = Math.hypot(b[0] - a[0], b[1] - a[1]);
    let pos = carry;
    while (pos < seg) {
      const t = pos / seg;
      xs.push(a[0] + (b[0] - a[0]) * t);
      ys.push(a[1] + (b[1] - a[1]) * t);
      pos += DS;
    }
    carry = pos - seg;
  }
  const N = xs.length;
  const tx = new Float32Array(N);
  const ty = new Float32Array(N);
  const nx = new Float32Array(N);
  const ny = new Float32Array(N);
  const curv = new Float32Array(N);
  for (let i = 0; i < N; i += 1) {
    const j = (i + 1) % N;
    const h = (i - 1 + N) % N;
    let dx = xs[j] - xs[h];
    let dy = ys[j] - ys[h];
    const l = Math.hypot(dx, dy) || 1;
    dx /= l;
    dy /= l;
    tx[i] = dx;
    ty[i] = dy;
    nx[i] = -dy; // left of travel
    ny[i] = dx;
  }
  for (let i = 0; i < N; i += 1) {
    // Smoothed signed curvature (1 / radius) over a few samples.
    const a = (i - 4 + N) % N;
    const b = (i + 4) % N;
    let da = Math.atan2(ty[b], tx[b]) - Math.atan2(ty[a], tx[a]);
    if (da > Math.PI) da -= Math.PI * 2;
    if (da < -Math.PI) da += Math.PI * 2;
    curv[i] = da / (DS * 8);
  }
  const track = { def, N, length: N * DS, xs: Float32Array.from(xs), ys: Float32Array.from(ys), tx, ty, nx, ny, curv };
  track.bounds = bounds(track);
  track.scenery = scenery(track);
  cache.set(def.id, track);
  return track;
}

function bounds(t) {
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (let i = 0; i < t.N; i += 1) {
    x0 = Math.min(x0, t.xs[i]);
    y0 = Math.min(y0, t.ys[i]);
    x1 = Math.max(x1, t.xs[i]);
    y1 = Math.max(y1, t.ys[i]);
  }
  return { x0, y0, x1, y1 };
}

/**
 * Where (x, y) is relative to the track, searching around index `hint`
 * (or the whole track when hint < 0). lateral > 0 is left of travel.
 */
export function locate(t, x, y, hint = -1, span = 60) {
  let best = 0;
  let bd = Infinity;
  const from = hint < 0 ? 0 : hint - span;
  const to = hint < 0 ? t.N : hint + span;
  const step = hint < 0 ? 4 : 1;
  for (let k = from; k < to; k += step) {
    const i = ((k % t.N) + t.N) % t.N;
    const d = (t.xs[i] - x) ** 2 + (t.ys[i] - y) ** 2;
    if (d < bd) {
      bd = d;
      best = i;
    }
  }
  if (hint < 0) return locate(t, x, y, best, 6);
  // Refine within the segment towards the next sample.
  const along = (x - t.xs[best]) * t.tx[best] + (y - t.ys[best]) * t.ty[best];
  const lateral = (x - t.xs[best]) * t.nx[best] + (y - t.ys[best]) * t.ny[best];
  let s = best * DS + along;
  if (s < 0) s += t.length;
  if (s >= t.length) s -= t.length;
  return { idx: best, s, lateral };
}

/** Centreline point and frame at distance s along the track. */
export function at(t, s) {
  const u = ((s % t.length) + t.length) % t.length;
  const i = Math.floor(u / DS);
  const f = u / DS - i;
  const j = (i + 1) % t.N;
  return {
    x: t.xs[i] + (t.xs[j] - t.xs[i]) * f,
    y: t.ys[i] + (t.ys[j] - t.ys[i]) * f,
    tx: t.tx[i],
    ty: t.ty[i],
    nx: t.nx[i],
    ny: t.ny[i],
    idx: i,
  };
}

/** Distance from (x, y) to the centreline (full search, for scenery placement). */
function distToTrack(t, x, y) {
  let bd = Infinity;
  for (let i = 0; i < t.N; i += 2) {
    const d = (t.xs[i] - x) ** 2 + (t.ys[i] - y) ** 2;
    if (d < bd) bd = d;
  }
  return Math.sqrt(bd);
}

// ---------- scenery ----------

function scenery(t) {
  const def = t.def;
  const rnd = mulberry(def.seed);
  const items = [];
  const decals = [];
  const { x0, y0, x1, y1 } = t.bounds;
  const pad = 700;
  const clear = def.halfWidth + def.shoulder + 30;
  const tryPlace = (count, make, minDist = clear, maxDist = 900) => {
    for (let k = 0; k < count; k += 1) {
      const x = x0 - pad + rnd() * (x1 - x0 + pad * 2);
      const y = y0 - pad + rnd() * (y1 - y0 + pad * 2);
      const d = distToTrack(t, x, y);
      const it = make(x, y, d);
      if (!it) continue;
      if (d - (it.r || 0) < minDist || d > maxDist) continue;
      if (items.some((o) => (o.x - x) ** 2 + (o.y - y) ** 2 < ((o.r || 10) + (it.r || 10)) ** 2)) continue;
      items.push(it);
    }
  };

  // Hand-placed landmarks are pushed out until they clear the road (their
  // drawn tops lean away from the camera, so they get extra room).
  const landmark = (it) => {
    // Nearest spot (searching outward in rings) that clears the road.
    const need = it.r + clear + 160;
    const ox = it.x;
    const oy = it.y;
    search: for (let rr = 0; rr < 4000; rr += 60) {
      const steps = rr === 0 ? 1 : 24;
      for (let k = 0; k < steps; k += 1) {
        const a = (k / steps) * Math.PI * 2;
        const x = ox + Math.cos(a) * rr;
        const y = oy + Math.sin(a) * rr;
        if (distToTrack(t, x, y) >= need) {
          it.x = x;
          it.y = y;
          break search;
        }
      }
    }
    items.push(it);
    return it;
  };

  for (let k = 0; k < 140; k += 1) {
    decals.push({ x: x0 - pad + rnd() * (x1 - x0 + pad * 2), y: y0 - pad + rnd() * (y1 - y0 + pad * 2), r: 60 + rnd() * 220, a: rnd() * Math.PI });
  }

  if (def.theme.sea) {
    t.coast = (x) => 2860 + Math.sin(x / 520) * 120 + Math.sin(x / 190) * 30;
    const onLand = (x, y) => y < t.coast(x) - 40;
    landmark({ type: 'lighthouse', x: 1650, y: 2880, r: 60, h: 1 });
    tryPlace(260, (x, y) => (onLand(x, y) ? { type: 'palm', x, y, r: 26 + rnd() * 12, rot: rnd() * 6.28 } : null), clear, 520);
    tryPlace(60, (x, y) => (onLand(x, y) && y > t.coast(x) - 260 ? { type: 'umbrella', x, y, r: 18, hue: Math.floor(rnd() * 4), rot: rnd() * 6.28 } : null), clear, 900);
    tryPlace(80, (x, y) => (onLand(x, y) ? { type: 'rock', x, y, r: 14 + rnd() * 22, rot: rnd() * 6.28 } : null), clear, 700);
    tryPlace(24, (x, y) => (onLand(x, y) ? { type: 'house', x, y, r: 48, w: 70 + rnd() * 30, d: 50 + rnd() * 20, rot: rnd() * 6.28, hue: Math.floor(rnd() * 3) } : null), clear + 40, 700);
    tryPlace(14, (x, y) => (!onLand(x, y) && y > t.coast(x) + 120 ? { type: 'boat', x, y, r: 30, rot: rnd() * 6.28 } : null), 0, 2000);
  } else if (def.theme.river) {
    // River crossing the long bottom straight, under a bridge.
    t.river = { x: 1700, w: 120 };
    landmark({ type: 'peak', x: 1900, y: 1300, r: 330 });
    landmark({ type: 'peak', x: -1150, y: 600, r: 260 });
    landmark({ type: 'peak', x: 4500, y: 1000, r: 300 });
    tryPlace(420, (x, y) => (Math.abs(x - t.river.x) > 110 ? { type: 'pine', x, y, r: 18 + rnd() * 16 } : null), clear, 650);
    tryPlace(110, (x, y) => ({ type: 'rock', x, y, r: 16 + rnd() * 30, rot: rnd() * 6.28 }), clear, 800);
    tryPlace(10, (x, y) => (Math.abs(x - t.river.x) > 160 ? { type: 'cabin', x, y, r: 40, w: 56, d: 44, rot: rnd() * 6.28 } : null), clear + 40, 600);
  } else if (def.theme.city) {
    const tower = landmark({ type: 'tower', x: 1450, y: -700, r: 210, w: 300, d: 300, h: 3.2 });
    const park = landmark({ type: 'park', x: -420, y: -1050, r: 360 });
    // City blocks on a grid, kept off the road.
    for (let gx = x0 - 900; gx < x1 + 900; gx += 260) {
      for (let gy = y0 - 900; gy < y1 + 900; gy += 260) {
        const x = gx + 130 + (rnd() - 0.5) * 30;
        const y = gy + 130 + (rnd() - 0.5) * 30;
        const w = 150 + rnd() * 80;
        const d = 150 + rnd() * 80;
        const r = Math.hypot(w, d) / 2;
        if (distToTrack(t, x, y) - r < clear) continue;
        if ([tower, park].some((o) => Math.hypot(o.x - x, o.y - y) < o.r + r)) continue;
        items.push({ type: 'building', x, y, r, w, d, h: 0.6 + rnd() * 1.6, hue: Math.floor(rnd() * 5), rot: 0, roof: Math.floor(rnd() * 3) });
      }
    }
    tryPlace(80, (x, y) => (Math.hypot(x - park.x, y - park.y) < park.r - 30 ? { type: 'tree', x, y, r: 22 + rnd() * 10 } : null), 0, 2000);
    // Street lamps along both edges
    for (let i = 0; i < t.N; i += 22) {
      for (const side of [-1, 1]) {
        const off = def.halfWidth + def.shoulder * 0.55;
        items.push({ type: 'lamp', x: t.xs[i] + t.nx[i] * off * side, y: t.ys[i] + t.ny[i] * off * side, r: 4 });
      }
    }
  }
  return { items, decals };
}
