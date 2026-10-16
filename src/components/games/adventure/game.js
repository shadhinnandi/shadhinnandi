// Rules and state for Lost Horizons: movement and collision, interactions,
// the three puzzles, inventory, journal, exploration, checkpoints, saving
// and the ending. No DOM access; the engine shows dialogs and the renderer
// draws whatever is here.

import { H, SLOW, SOLID, START, T, TILE, W, getWorld, regionAt, tileAt, REGIONS } from './world.js';

export const ITEMS = {
  machete: { name: 'Machete', text: 'A sailor’s machete. Sharp enough for jungle vines.' },
  lantern: { name: 'Lantern', text: 'An oil lantern. It will light the way through dark places.' },
  key: { name: 'Bronze key', text: 'Heavy and green with age. A sun is cast into the bow.' },
  'shard-forest': { name: 'Sun shard', text: 'A warm golden crystal. It hums faintly.', shard: true },
  'shard-cave': { name: 'Sun shard', text: 'A warm golden crystal. It hums faintly.', shard: true },
  'shard-ruins': { name: 'Sun shard', text: 'A warm golden crystal. It hums faintly.', shard: true },
  'map-beach': { name: 'Map fragment', map: 'beach' },
  'map-forest': { name: 'Map fragment', map: 'forest' },
  'map-cave': { name: 'Map fragment', map: 'cave' },
  'map-ruins': { name: 'Map fragment', map: 'ruins' },
  'relic-cove': { name: 'Tide relic', relic: true, text: 'A carved shell, warm from the sun. A secret of the cove.' },
  'relic-falls': { name: 'River relic', relic: true, text: 'A smooth stone with a spiral cut into it, hidden behind the falls.' },
  'relic-ruins': { name: 'Temple relic', relic: true, text: 'A tiny gold sun, sealed away behind a cracked wall.' },
};

export const TOTEM_ORDER = ['sun', 'wave', 'star', 'moon'];

export const CLUES = {
  log: {
    title: "Captain's log",
    text: [
      'Day 31. Storm took the mainmast. We ran aground on this island.',
      'The old charts speak of a beacon on the peak, lit by three sun shards. Light it and any passing ship will see.',
      'I left my machete in the sea chest. The forest beyond the vines will need it.',
    ],
  },
  diary: {
    title: "Explorer's diary",
    text: [
      'The caves to the north-east are black as ink. Take the lantern from the crate.',
      'In the clearing up the trail, four totems guard a shard. The tablet tells their order.',
    ],
  },
  tablet: {
    title: 'Stone tablet',
    text: ['When the Sun rises, the Wave answers. The Star wakes after, and the Moon rests last.', 'Touch the totems in this order: Sun, Wave, Star, Moon.'],
  },
  statue: {
    title: 'Statue of the Keeper',
    text: ['Three shards of the sun open the way to the peak.', 'One rests with the forest totems, one in the crystal dark, one in the temple of light.'],
  },
  carving: {
    title: 'Wall carving',
    text: ['Two stones must rest where the floor glows.', 'Push the boulders onto both glowing plates. Pull the lever to return the stones if they get stuck.'],
  },
  mural: {
    title: 'Temple mural',
    text: [
      'The sun’s light climbs, turns towards the dawn, then climbs again to the eye above the door.',
      'Turn the mirrors so the beam goes up, then right, then up into the eye. One wall of the temple looks cracked and weak.',
    ],
  },
  sign: { title: 'Weathered sign', text: ['Whispering Forest. Path overgrown.'] },
};

const FLAG_GATE = {
  vines: 'vines',
  dark: 'lit',
  'crystal-gate': 'plates',
  gate: 'gate',
  'sanctum-door': 'beam',
  cracked: 'cracked',
  sungate: 'sungate',
};

const CELL = 4; // exploration cells are 4 x 4 tiles
export const CW = Math.ceil(W / CELL);
export const CH = Math.ceil(H / CELL);
const PW = 9;
const PH = 7;
const SPEED = 165;

export function newGame() {
  const world = getWorld();
  const g = {
    world,
    time: 0,
    player: { x: START.x, y: START.y, vx: 0, vy: 0, face: 0, walk: 0, moving: false },
    inv: [],
    flags: {},
    taken: {},
    read: {},
    totemSeq: [],
    totemFlash: 0,
    boulders: {},
    mirrors: {},
    explored: new Uint8Array(CW * CH),
    checkpoint: { x: START.x, y: START.y, name: 'Wreck Beach camp' },
    visitedRegions: {},
    toasts: [],
    banner: null,
    beam: [],
    beamHit: false,
    pushT: 0,
    ending: 0,
    done: false,
    saves: 0,
  };
  for (const it of world.objects.items) {
    if (it.kind === 'boulder') g.boulders[it.id] = { tx: it.home[0], ty: it.home[1], ax: 0, ay: 0, anim: 0 };
    if (it.kind === 'mirror') g.mirrors[it.id] = it.orient;
  }
  traceBeam(g);
  explore(g);
  return g;
}

// ---------- save / load ----------

export function snapshot(g) {
  return {
    v: 1,
    time: Math.round(g.time),
    p: [Math.round(g.player.x), Math.round(g.player.y)],
    inv: g.inv,
    flags: g.flags,
    taken: g.taken,
    read: g.read,
    boulders: Object.fromEntries(Object.entries(g.boulders).map(([k, b]) => [k, [b.tx, b.ty]])),
    mirrors: g.mirrors,
    explored: Array.from(g.explored).join(''),
    checkpoint: g.checkpoint,
    visited: g.visitedRegions,
  };
}

export function restore(data) {
  const g = newGame();
  if (!data || data.v !== 1) return g;
  g.time = data.time || 0;
  g.inv = data.inv || [];
  g.flags = data.flags || {};
  g.taken = data.taken || {};
  g.read = data.read || {};
  for (const [k, [tx, ty]] of Object.entries(data.boulders || {})) if (g.boulders[k]) Object.assign(g.boulders[k], { tx, ty });
  Object.assign(g.mirrors, data.mirrors || {});
  if (typeof data.explored === 'string') for (let i = 0; i < Math.min(data.explored.length, g.explored.length); i += 1) g.explored[i] = data.explored[i] === '1' ? 1 : 0;
  g.checkpoint = data.checkpoint || g.checkpoint;
  g.visitedRegions = data.visited || {};
  g.player.x = g.checkpoint.x;
  g.player.y = g.checkpoint.y + 26;
  if (collides(g, g.player.x, g.player.y)) g.player.y = g.checkpoint.y - 26;
  traceBeam(g);
  explore(g);
  return g;
}

// ---------- queries ----------

export const has = (g, id) => g.inv.includes(id);
export const shards = (g) => g.inv.filter((i) => ITEMS[i]?.shard).length;
export const relics = (g) => g.inv.filter((i) => ITEMS[i]?.relic).length;
export const mapsFound = (g) => g.inv.filter((i) => ITEMS[i]?.map).map((i) => ITEMS[i].map);

export function isOpen(g, it) {
  const f = FLAG_GATE[it.id];
  return f ? Boolean(g.flags[f]) : false;
}

export function objective(g) {
  if (g.flags.beacon) return 'The beacon is lit. Help is coming.';
  if (!has(g, 'machete')) return 'Search the shipwreck on Wreck Beach';
  if (!g.flags.vines) return 'Cut through the vines on the forest trail, west of the beach';
  if (!has(g, 'lantern')) return 'Find the explorer’s camp in the Whispering Forest';
  if (!has(g, 'shard-forest')) return 'Wake the four forest totems in the right order';
  if (!has(g, 'key')) return 'Explore the Crystal Caves, north-east of the meadow';
  if (!g.flags.gate) return 'Unlock the temple gate, east of the meadow';
  if (!has(g, 'shard-ruins')) return 'Guide the temple light into the sanctum door';
  if (!g.flags.sungate) return 'Bring the three sun shards to the Sun Gate, north of the meadow';
  return 'Climb Beacon Peak and light the beacon';
}

export function exploredFraction(g) {
  // Only count cells that contain land.
  let land = 0;
  let seen = 0;
  for (let cy = 0; cy < CH; cy += 1) {
    for (let cx = 0; cx < CW; cx += 1) {
      const t = g.world.get(cx * CELL + 2, cy * CELL + 2);
      if (t === T.DEEP) continue;
      land += 1;
      if (g.explored[cy * CW + cx]) seen += 1;
    }
  }
  return land ? seen / land : 0;
}

function explore(g) {
  const cx = Math.floor(g.player.x / TILE / CELL);
  const cy = Math.floor(g.player.y / TILE / CELL);
  for (let y = cy - 2; y <= cy + 2; y += 1) {
    for (let x = cx - 2; x <= cx + 2; x += 1) {
      if (x < 0 || y < 0 || x >= CW || y >= CH) continue;
      if ((x - cx) ** 2 + (y - cy) ** 2 <= 5) g.explored[y * CW + x] = 1;
    }
  }
}

// ---------- collision ----------

function boxBlocked(g, it) {
  return it.solidBox && !isOpen(g, it);
}

export function collides(g, x, y) {
  const w = g.world;
  const x0 = x - PW;
  const x1 = x + PW;
  const y0 = y - PH;
  const y1 = y + PH;
  for (let ty = Math.floor(y0 / TILE); ty <= Math.floor(y1 / TILE); ty += 1) {
    for (let tx = Math.floor(x0 / TILE); tx <= Math.floor(x1 / TILE); tx += 1) {
      if (tx < 0 || ty < 0 || tx >= W || ty >= H || SOLID.has(w.get(tx, ty))) return true;
    }
  }
  for (const it of w.objects.items) {
    if (boxBlocked(g, it)) {
      const [bx0, by0, bx1, by1] = it.solidBox;
      if (x1 > bx0 * TILE && x0 < (bx1 + 1) * TILE && y1 > by0 * TILE && y0 < (by1 + 1) * TILE) return true;
    } else if (it.solid && !g.taken[it.id]) {
      if (circleHit(it.x, it.y, it.solid, x0, y0, x1, y1)) return true;
    }
  }
  for (const b of Object.values(g.boulders)) {
    if (x1 > b.tx * TILE + 2 && x0 < (b.tx + 1) * TILE - 2 && y1 > b.ty * TILE + 2 && y0 < (b.ty + 1) * TILE - 2) return true;
  }
  for (const p of w.objects.props) {
    if (!p.solid) continue;
    if (Math.abs(p.x - x) > 40 || Math.abs(p.y - y) > 40) continue;
    if (circleHit(p.x, p.y, p.solid, x0, y0, x1, y1)) return true;
  }
  return false;
}

function circleHit(cx, cy, r, x0, y0, x1, y1) {
  const nx = Math.max(x0, Math.min(cx, x1));
  const ny = Math.max(y0, Math.min(cy, y1));
  return (nx - cx) ** 2 + (ny - cy) ** 2 < r * r;
}

// ---------- puzzles ----------

const mirrorAt = (g, tx, ty) => g.world.objects.items.find((it) => it.kind === 'mirror' && it.tx === tx && it.ty === ty);

/** Trace the temple light from the emitter through the mirrors. */
export function traceBeam(g) {
  const items = g.world.objects.items;
  const em = items.find((it) => it.kind === 'emitter');
  const rec = items.find((it) => it.kind === 'receptor');
  let x = em.tx;
  let y = em.ty;
  let [dx, dy] = em.dir;
  const pts = [[x, y]];
  let hit = false;
  for (let k = 0; k < 80; k += 1) {
    x += dx;
    y += dy;
    if (x === rec.tx && y === rec.ty) {
      pts.push([x, y]);
      hit = true;
      break;
    }
    const t = g.world.get(x, y);
    if (SOLID.has(t) || t === T.WALL) {
      pts.push([x - dx * 0.5, y - dy * 0.5]);
      break;
    }
    if (items.some((it) => it.kind === 'pillar' && Math.floor(it.x / TILE) === x && Math.floor(it.y / TILE) === y)) {
      pts.push([x - dx * 0.5, y - dy * 0.5]);
      break;
    }
    const m = mirrorAt(g, x, y);
    if (m) {
      pts.push([x, y]);
      // orient 0 = "\", orient 1 = "/" (screen coordinates, y down)
      if (g.mirrors[m.id] === 0) [dx, dy] = [dy, dx];
      else [dx, dy] = [-dy, -dx];
    }
  }
  if (!hit) pts.push([x, y]);
  g.beam = pts;
  g.beamHit = hit;
  return hit;
}

function platesCovered(g) {
  const plates = g.world.objects.items.filter((it) => it.kind === 'plate');
  return plates.every((p) => Object.values(g.boulders).some((b) => b.tx === Math.floor(p.x / TILE) && b.ty === Math.floor(p.y / TILE)));
}

function tryPush(g, dirX, dirY) {
  const p = g.player;
  // Tile the player is pushing into
  const fx = Math.floor((p.x + dirX * (PW + 4)) / TILE);
  const fy = Math.floor((p.y + dirY * (PH + 4)) / TILE);
  const entry = Object.entries(g.boulders).find(([, b]) => b.tx === fx && b.ty === fy);
  if (!entry) return false;
  const [, b] = entry;
  const nx = b.tx + dirX;
  const ny = b.ty + dirY;
  const t = g.world.get(nx, ny);
  if (SOLID.has(t) || t !== T.CAVE) return false;
  if (Object.values(g.boulders).some((o) => o.tx === nx && o.ty === ny)) return false;
  if (g.world.objects.items.some((it) => boxBlocked(g, it) && nx >= it.solidBox[0] && nx <= it.solidBox[2] && ny >= it.solidBox[1] && ny <= it.solidBox[3])) return false;
  if (g.world.objects.props.some((pr) => pr.solid && Math.floor(pr.x / TILE) === nx && Math.floor(pr.y / TILE) === ny)) return false;
  Object.assign(b, { tx: nx, ty: ny, ax: -dirX * TILE, ay: -dirY * TILE, anim: 1 });
  if (!g.flags.plates && platesCovered(g)) {
    g.flags.plates = true;
    toast(g, 'The crystal gate slides open', 'good');
  }
  return true;
}

// ---------- messages ----------

function toast(g, text, tone = 'info') {
  g.toasts.push({ text, tone, t: 0 });
  if (g.toasts.length > 3) g.toasts.shift();
}

function give(g, ids) {
  const got = [];
  for (const id of ids) {
    if (has(g, id)) continue;
    g.inv.push(id);
    got.push(id);
  }
  return got;
}

// ---------- interaction ----------

/** The interactive object the player can use right now, if any. */
export function nearbyInteractive(g) {
  const p = g.player;
  let best = null;
  let bd = 48 * 48;
  for (const it of g.world.objects.items) {
    if (!it.label) continue;
    if (g.taken[it.id]) continue;
    if (it.id === 'altar' && !g.flags.totems) continue;
    if (FLAG_GATE[it.id] && isOpen(g, it)) continue;
    if (it.kind === 'relic' && it.id === 'relic-ruins' && !g.flags.cracked) continue;
    if (it.kind === 'beacon' && g.flags.beacon) continue;
    const ix = it.tx !== undefined ? it.tx * TILE + TILE / 2 : it.x;
    const iy = it.ty !== undefined ? it.ty * TILE + TILE / 2 : it.y;
    const d = (ix - p.x) ** 2 + (iy - p.y) ** 2;
    if (d < bd) {
      bd = d;
      best = it;
    }
  }
  return best;
}

/**
 * Use an object. Returns a dialog spec for the engine to show (or null).
 * Dialog specs: { title, eyebrow, body, rows? }.
 */
export function interact(g, it) {
  const clue = (id, eyebrow = 'Clue') => {
    const c = CLUES[id];
    const fresh = !g.read[id];
    g.read[id] = true;
    if (fresh) toast(g, 'Journal updated');
    return { eyebrow, title: c.title, body: c.text };
  };

  switch (it.kind) {
    case 'campfire':
      g.checkpoint = { x: it.x, y: it.y, name: it.checkpoint };
      g.saves += 1;
      toast(g, `Rested at ${it.checkpoint}. Progress saved`, 'good');
      return null;
    case 'book':
      return clue(it.id);
    case 'sign':
      return clue('sign', 'Sign');
    case 'tablet':
    case 'statue':
    case 'carving':
    case 'mural':
      return clue(it.kind);
    case 'chest':
    case 'crate':
    case 'altar':
    case 'relic': {
      g.taken[it.id] = true;
      const got = give(g, it.gives);
      const names = got.map((id) => ITEMS[id].name);
      if (it.kind === 'relic') toast(g, `Secret found: ${ITEMS[got[0]].name}`, 'good');
      else toast(g, `Found: ${names.join(', ')}`, 'good');
      const main = got.find((id) => ITEMS[id].text && !ITEMS[id].relic);
      const extra = [];
      if (got.some((id) => ITEMS[id].shard)) extra.push(`Sun shards: ${shards(g)} of 3`);
      if (got.some((id) => ITEMS[id].map)) extra.push('A map fragment: more of the island is marked on your map (M).');
      if (!main && !extra.length) return null;
      return { eyebrow: 'Found', title: names.join(' and '), body: [...(main ? [ITEMS[main].text] : []), ...extra] };
    }
    case 'vines':
      if (has(g, 'machete')) {
        g.flags.vines = true;
        toast(g, 'You hack through the vines', 'good');
        return null;
      }
      return { eyebrow: 'Blocked', title: 'Thick vines', body: ['Tough jungle vines block the trail. A sharp blade would cut through them.'] };
    case 'darkness':
      if (has(g, 'lantern')) {
        g.flags.lit = true;
        toast(g, 'You light the lantern', 'good');
        return null;
      }
      return { eyebrow: 'Blocked', title: 'Pitch black', body: ['The cave is too dark to go any further without a light.'] };
    case 'gate':
      if (has(g, 'key')) {
        g.flags.gate = true;
        toast(g, 'The bronze key turns. The gate swings open', 'good');
        return null;
      }
      return { eyebrow: 'Locked', title: 'Bronze gate', body: ['A heavy bronze gate with a sun-shaped keyhole.'] };
    case 'sungate': {
      const n = shards(g);
      if (n >= 3) {
        g.flags.sungate = true;
        toast(g, 'The shards blaze. The Sun Gate opens', 'good');
        return null;
      }
      return { eyebrow: 'Sealed', title: 'The Sun Gate', body: [`Three hollows in the stone wait for sun shards. You have ${n} of 3.`] };
    }
    case 'totem': {
      const next = TOTEM_ORDER[g.totemSeq.length];
      if (g.flags.totems) return null;
      if (it.glyph === next) {
        g.totemSeq.push(it.glyph);
        if (g.totemSeq.length === TOTEM_ORDER.length) {
          g.flags.totems = true;
          toast(g, 'The altar stone grinds open', 'good');
        }
      } else {
        g.totemSeq = [];
        g.totemFlash = 0.6;
        toast(g, 'The totems go dark. Read the tablet for the order', 'bad');
      }
      return null;
    }
    case 'lever':
      for (const [id, b] of Object.entries(g.boulders)) {
        const home = g.world.objects.items.find((o) => o.id === id).home;
        Object.assign(b, { tx: home[0], ty: home[1], ax: 0, ay: 0, anim: 0 });
      }
      if (!g.flags.plates) toast(g, 'The boulders roll back to where they started');
      return null;
    case 'mirror':
      g.mirrors[it.id] ^= 1;
      if (traceBeam(g) && !g.flags.beam) {
        g.flags.beam = true;
        toast(g, 'Light fills the eye. The sanctum door opens', 'good');
      }
      return null;
    case 'cracked':
      g.flags.cracked = true;
      toast(g, 'The cracked wall crumbles away', 'good');
      return null;
    case 'beacon':
      g.flags.beacon = true;
      g.ending = 0.0001;
      return null;
    default:
      return null;
  }
}

// ---------- update ----------

/** intent = { x, y } movement in -1..1 */
export function update(g, intent, dt) {
  g.time += dt;
  for (const t of g.toasts) t.t += dt;
  g.toasts = g.toasts.filter((t) => t.t < 3.2);
  if (g.banner) {
    g.banner.t += dt;
    if (g.banner.t > 3) g.banner = null;
  }
  g.totemFlash = Math.max(0, g.totemFlash - dt);
  for (const b of Object.values(g.boulders)) {
    if (b.anim > 0) {
      b.anim = Math.max(0, b.anim - dt * 6);
      b.ax *= b.anim > 0 ? 0.7 : 0;
      b.ay *= b.anim > 0 ? 0.7 : 0;
    }
  }

  if (g.ending > 0) {
    g.ending += dt;
    if (g.ending > 4.5) g.done = true;
    return;
  }

  const p = g.player;
  let { x: ix, y: iy } = intent;
  const len = Math.hypot(ix, iy);
  if (len > 1) {
    ix /= len;
    iy /= len;
  }
  const slow = SLOW[tileAt(g.world, p.x, p.y)] || 1;
  const tvx = ix * SPEED * slow;
  const tvy = iy * SPEED * slow;
  p.vx += (tvx - p.vx) * Math.min(1, 14 * dt);
  p.vy += (tvy - p.vy) * Math.min(1, 14 * dt);
  p.moving = Math.hypot(p.vx, p.vy) > 12;
  if (len > 0.2) p.face = Math.atan2(iy, ix);

  const nx = p.x + p.vx * dt;
  if (!collides(g, nx, p.y)) p.x = nx;
  else p.vx = 0;
  const ny = p.y + p.vy * dt;
  if (!collides(g, p.x, ny)) p.y = ny;
  else p.vy = 0;
  if (p.moving) p.walk += dt * 9;

  // Pushing a boulder: keep walking into it for a moment.
  const ax = Math.abs(ix) > Math.abs(iy) ? Math.sign(ix) : 0;
  const ay = ax === 0 ? Math.sign(iy) : 0;
  if ((ax || ay) && len > 0.5 && Math.hypot(p.vx, p.vy) < 30) {
    g.pushT += dt;
    if (g.pushT > 0.18) {
      g.pushT = 0;
      tryPush(g, ax, ay);
    }
  } else g.pushT = 0;

  explore(g);
  const r = regionAt(g.world, p.x, p.y);
  if (!g.visitedRegions[r]) {
    g.visitedRegions[r] = true;
    g.banner = { title: REGIONS[r].name, t: 0 };
  }
}

export function inCave(g) {
  const t = tileAt(g.world, g.player.x, g.player.y);
  return regionAt(g.world, g.player.x, g.player.y) === 'cave' || t === T.CAVE;
}
