// The island of Lost Horizons: tile map and every placed object.
//
// The map is built once from a seeded noise function plus hand-placed
// regions, so it looks organic but is identical on every visit. Each region
// is sealed by cliffs, walls or deep water, and opens through exactly one
// gate, which is what makes the progression work:
//
//   beach (start)  -> meadow                open
//   meadow -> forest                        vines: need the machete (shipwreck)
//   meadow -> cave                          darkness: need the lantern (forest camp)
//   meadow -> ruins                         gate: need the bronze key (cave)
//   meadow -> mountain                      sun gate: need three sun shards
//
// No DOM access: used by the game, the renderer and the Node tests.

export const TILE = 32;
export const W = 112;
export const H = 84;

// Tile ids
export const T = {
  DEEP: 0,
  SHALLOW: 1,
  SAND: 2,
  GRASS: 3,
  FOREST: 4,
  PATH: 5,
  ROCK: 6,
  RUIN: 7,
  WALL: 8,
  CAVE: 9,
  CAVEWALL: 10,
  SNOW: 11,
  BRIDGE: 12,
  DECK: 13,
  HULL: 14,
  FALLS: 15,
  RIVER: 16,
};

export const SOLID = new Set([T.DEEP, T.ROCK, T.WALL, T.CAVEWALL, T.HULL, T.RIVER]);
export const SLOW = { [T.SHALLOW]: 0.55, [T.SNOW]: 0.85, [T.FALLS]: 0.6 };

const mulberry = (seed) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

// Smooth value noise for organic shapes
function makeNoise(seed) {
  const rnd = mulberry(seed);
  const g = Array.from({ length: 64 * 64 }, () => rnd());
  const at = (x, y) => g[(((y % 64) + 64) % 64) * 64 + (((x % 64) + 64) % 64)];
  const sm = (t) => t * t * (3 - 2 * t);
  return (x, y) => {
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const fx = sm(x - x0);
    const fy = sm(y - y0);
    const a = at(x0, y0) + (at(x0 + 1, y0) - at(x0, y0)) * fx;
    const b = at(x0, y0 + 1) + (at(x0 + 1, y0 + 1) - at(x0, y0 + 1)) * fx;
    return a + (b - a) * fy;
  };
}

export const REGIONS = {
  beach: { name: 'Wreck Beach', color: '#e8d29a' },
  meadow: { name: 'Windward Meadow', color: '#8cc06a' },
  forest: { name: 'Whispering Forest', color: '#3f7d4a' },
  cave: { name: 'Crystal Caves', color: '#5a5a8a' },
  ruins: { name: 'Sun Temple Ruins', color: '#c9a66b' },
  mountain: { name: 'Beacon Peak', color: '#e9eef5' },
};

let built = null;

/** The island (built once). */
export function getWorld() {
  if (built) return built;
  const tiles = new Uint8Array(W * H);
  const region = new Array(W * H).fill('beach');
  const n1 = makeNoise(7);
  const n2 = makeNoise(19);
  const idx = (x, y) => y * W + x;
  const inb = (x, y) => x >= 0 && y >= 0 && x < W && y < H;
  const set = (x, y, t) => {
    if (inb(x, y)) tiles[idx(x, y)] = t;
  };
  const get = (x, y) => (inb(x, y) ? tiles[idx(x, y)] : T.DEEP);
  const rect = (x0, y0, x1, y1, t) => {
    for (let y = y0; y <= y1; y += 1) for (let x = x0; x <= x1; x += 1) set(x, y, t);
  };
  const disc = (cx, cy, r, t, only = null) => {
    for (let y = Math.floor(cy - r); y <= cy + r; y += 1)
      for (let x = Math.floor(cx - r); x <= cx + r; x += 1) if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r && (!only || only.includes(get(x, y)))) set(x, y, t);
  };
  const path = (pts, width, t, only = null) => {
    for (let i = 0; i < pts.length - 1; i += 1) {
      const [ax, ay] = pts[i];
      const [bx, by] = pts[i + 1];
      const steps = Math.ceil(Math.hypot(bx - ax, by - ay) * 2);
      for (let k = 0; k <= steps; k += 1) {
        const x = ax + ((bx - ax) * k) / steps;
        const y = ay + ((by - ay) * k) / steps;
        disc(x, y, width / 2, t, only);
      }
    }
  };

  // 1. Island shape: deep sea, land, a shallow wading shelf only along the south.
  for (let y = 0; y < H; y += 1) {
    for (let x = 0; x < W; x += 1) {
      const d = ((x - 56) / 51) ** 2 + ((y - 42) / 39) ** 2 + (n1(x / 6, y / 6) - 0.5) * 0.22;
      let t = T.DEEP;
      if (d < 0.86) t = T.GRASS;
      else if (d < 1.0) t = y > 58 ? T.SAND : T.ROCK;
      else if (d < 1.13 && y > 60) t = T.SHALLOW;
      tiles[idx(x, y)] = t;
      if (t === T.GRASS && y > 60) tiles[idx(x, y)] = T.SAND;
    }
  }
  const mark = (x0, y0, x1, y1, r) => {
    for (let y = y0; y <= y1; y += 1) for (let x = x0; x <= x1; x += 1) if (inb(x, y)) region[idx(x, y)] = r;
  };
  for (let y = 0; y < H; y += 1) for (let x = 0; x < W; x += 1) region[idx(x, y)] = y > 60 ? 'beach' : 'meadow';

  // 2. Forest (west), sealed by a cliff on its east and south sides.
  for (let y = 14; y <= 60; y += 1) {
    for (let x = 0; x <= 44; x += 1) {
      if (get(x, y) === T.GRASS) set(x, y, T.FOREST);
      if (get(x, y) !== T.DEEP) region[idx(x, y)] = 'forest';
    }
  }
  rect(44, 14, 45, 61, T.ROCK); // east cliff
  rect(0, 60, 45, 61, T.ROCK); // south cliff
  for (let x = 0; x < 46; x += 1) for (let y = 62; y < H; y += 1) if (get(x, y) === T.SHALLOW) set(x, y, T.DEEP); // no wading round into it
  // Trails, clearings and the camp
  path(
    [
      [36, 62],
      [36, 57],
      [31, 52],
      [33, 46],
      [27, 41],
      [20, 44],
      [16, 47],
    ],
    2.2,
    T.PATH,
  );
  path(
    [
      [27, 41],
      [26, 35],
      [29, 29],
    ],
    2.2,
    T.PATH,
  );
  path(
    [
      [31, 22],
      [28, 18],
      [26, 15],
    ],
    2,
    T.PATH,
  );
  rect(35, 60, 37, 61, T.PATH); // gap in the south cliff (vines sit here)
  disc(29, 27, 5, T.GRASS); // totem clearing
  disc(16, 47, 4.2, T.GRASS); // explorer camp
  // Hidden alcove behind a waterfall in the north cliff; the river it feeds
  // runs south through the forest and every trail crossing gets a bridge.
  rect(22, 10, 35, 13, T.ROCK);
  rect(23, 11, 26, 12, T.CAVE); // alcove
  rect(24, 13, 25, 13, T.FALLS); // walkable curtain of water
  const trails = [
    [
      [36, 62],
      [36, 57],
      [31, 52],
      [33, 46],
      [27, 41],
      [20, 44],
      [16, 47],
    ],
    [
      [27, 41],
      [26, 35],
      [29, 29],
    ],
    [
      [31, 22],
      [28, 18],
      [26, 15],
    ],
  ];
  path(
    [
      [24.5, 14.5],
      [20, 19],
      [14, 26],
      [20, 34],
      [24, 40],
      [22, 50],
      [14, 58],
    ],
    2,
    T.RIVER,
    [T.FOREST, T.GRASS, T.PATH],
  );
  for (const tr of trails) path(tr, 2.2, T.BRIDGE, [T.RIVER]);
  rect(24, 14, 25, 15, T.PATH); // pool bank in front of the falls

  // 3. Mountain (north), a cliff ring around a snowy plateau, opened by the sun gate.
  for (let y = 0; y <= 22; y += 1) {
    for (let x = 30; x <= 82; x += 1) {
      const e = ((x - 56) / 24) ** 2 + ((y - 10) / 11) ** 2;
      if (e < 1.0 && get(x, y) !== T.DEEP) {
        set(x, y, e > 0.72 ? T.ROCK : T.SNOW);
        region[idx(x, y)] = 'mountain';
      }
    }
  }
  rect(55, 17, 57, 20, T.PATH); // gap where the sun gate stands
  path(
    [
      [56, 17],
      [50, 14],
      [62, 11],
      [56, 7],
    ],
    1.6,
    T.PATH,
    [T.SNOW],
  );
  disc(56, 6, 2.2, T.RUIN); // beacon platform
  rect(40, 13, 52, 13, T.ROCK); // ridges that make the climb zigzag
  rect(58, 9, 70, 9, T.ROCK);

  // 4. Cave (north-east): a rock mass with carved passages.
  rect(72, 4, 106, 25, T.CAVEWALL);
  for (let y = 4; y <= 25; y += 1) for (let x = 72; x <= 106; x += 1) region[idx(x, y)] = 'cave';
  for (let y = 0; y < H; y += 1) for (let x = 72; x <= 106; x += 1) if (y <= 25 && get(x, y) === T.DEEP) set(x, y, T.DEEP);
  path(
    [
      [72, 21],
      [78, 21],
      [80, 16],
      [86, 15],
    ],
    2.2,
    T.CAVE,
  );
  rect(87, 10, 97, 19, T.CAVE); // boulder room
  rect(98, 13, 98, 15, T.CAVE); // crystal gate opening
  rect(99, 9, 104, 17, T.CAVE); // treasure chamber
  rect(70, 20, 72, 22, T.PATH); // entrance mouth from the meadow
  disc(83, 23, 1.6, T.CAVE); // crystal grotto off the passage
  path(
    [
      [78, 21],
      [83, 23],
    ],
    1.4,
    T.CAVE,
  );

  // 5. Ruins (east): walled temple, gate on the south, sanctum on the north.
  rect(72, 30, 100, 56, T.RUIN);
  for (let y = 30; y <= 56; y += 1) for (let x = 72; x <= 100; x += 1) region[idx(x, y)] = 'ruins';
  rect(72, 30, 100, 30, T.WALL);
  rect(72, 56, 100, 56, T.WALL);
  rect(72, 30, 72, 56, T.WALL);
  rect(100, 30, 100, 56, T.WALL);
  rect(73, 38, 99, 38, T.WALL); // sanctum wall
  rect(84, 56, 86, 56, T.RUIN); // gate opening (gate object here)
  rect(85, 38, 85, 38, T.RUIN); // sanctum door (door object here)
  rect(101, 42, 104, 46, T.RUIN); // secret room behind the cracked wall
  rect(105, 41, 105, 47, T.WALL);
  rect(101, 41, 104, 41, T.WALL);
  rect(101, 47, 104, 47, T.WALL);
  for (let y = 41; y <= 47; y += 1) for (let x = 101; x <= 105; x += 1) if (inb(x, y)) region[idx(x, y)] = 'ruins';
  rect(100, 44, 100, 44, T.RUIN); // cracked section (object blocks it)
  for (let x = 72; x <= 106; x += 1) for (let y = 26; y <= 29; y += 1) if (get(x, y) === T.DEEP || get(x, y) === T.ROCK) set(x, y, T.GRASS);

  // 6. Meadow roads and the beach
  path(
    [
      [60, 72],
      [58, 64],
      [57, 52],
      [56, 40],
      [56, 22],
    ],
    2.2,
    T.PATH,
    [T.GRASS, T.SAND],
  );
  path(
    [
      [57, 52],
      [66, 48],
      [76, 58],
      [85, 58],
    ],
    2,
    T.PATH,
    [T.GRASS, T.SAND],
  );
  path(
    [
      [56, 34],
      [63, 28],
      [70, 21],
    ],
    2,
    T.PATH,
    [T.GRASS],
  );
  path(
    [
      [58, 64],
      [48, 63],
      [40, 63],
      [36, 62],
    ],
    2,
    T.PATH,
    [T.GRASS, T.SAND],
  );
  for (let y = 57; y <= 60; y += 1) for (let x = 72; x <= 100; x += 1) if (get(x, y) === T.ROCK) set(x, y, T.GRASS);
  // Shipwreck: a hull outline with a deck inside, opening to the north.
  for (let y = 66; y <= 74; y += 1) {
    for (let x = 44; x <= 56; x += 1) {
      const e = ((x - 50) / 6) ** 2 + ((y - 70) / 4) ** 2;
      if (e <= 1) set(x, y, e > 0.62 ? T.HULL : T.DECK);
    }
  }
  rect(50, 66, 51, 67, T.DECK);
  // Secret cove (east beach): rocks wall it off from the land; reach it by wading.
  rect(88, 60, 89, 72, T.ROCK);
  rect(88, 60, 104, 61, T.ROCK);
  for (let y = 62; y <= 71; y += 1) for (let x = 90; x <= 104; x += 1) if (get(x, y) !== T.DEEP) set(x, y, T.SAND);
  for (let y = 72; y <= 76; y += 1) for (let x = 80; x <= 104; x += 1) if (get(x, y) === T.DEEP || get(x, y) === T.SAND) set(x, y, y > 73 ? T.SHALLOW : T.SAND);
  for (let y = 62; y <= 71; y += 1) for (let x = 105; x <= 108; x += 1) if (get(x, y) !== T.DEEP) set(x, y, T.ROCK);

  // Map every tile's region for the minimap and lighting.
  const objects = placeObjects(get, n2);
  built = { tiles, region, get, objects, n1, n2 };
  return built;
}

export const tileAt = (w, px, py) => w.get(Math.floor(px / TILE), Math.floor(py / TILE));
export const regionAt = (w, px, py) => {
  const x = Math.floor(px / TILE);
  const y = Math.floor(py / TILE);
  if (x < 0 || y < 0 || x >= W || y >= H) return 'beach';
  return w.region[y * W + x];
};

/*
  Objects. Static props (trees, rocks...) never change; interactive objects
  carry an id the game uses for state (opened, taken, lit...).
    solid   blocks movement (radius in px, or a tile box)
*/
function placeObjects(get, noise) {
  const rnd = mulberry(91);
  const props = [];
  const C = (tx, ty) => ({ x: tx * TILE + TILE / 2, y: ty * TILE + TILE / 2 });
  const near = (x, y, list, d) => list.some((p) => (p.x - x) ** 2 + (p.y - y) ** 2 < d * d);

  // Trees fill the forest except on trails, the river, and near interactive spots.
  const keepClear = [C(29, 27), C(16, 47), C(36, 58), C(24, 15)];
  for (let ty = 14; ty < 60; ty += 1) {
    for (let tx = 1; tx < 44; tx += 1) {
      if (get(tx, ty) !== T.FOREST) continue;
      if (noise(tx / 3, ty / 3) < 0.38 && rnd() < 0.6) continue;
      if (rnd() < 0.35) continue;
      const p = { x: tx * TILE + 6 + rnd() * 20, y: ty * TILE + 6 + rnd() * 20 };
      if (near(p.x, p.y, keepClear, TILE * 2.6)) continue;
      if ([[-1, 0], [1, 0], [0, -1], [0, 1]].some(([dx, dy]) => [T.PATH, T.BRIDGE, T.GRASS].includes(get(tx + dx, ty + dy)))) continue;
      props.push({ kind: 'tree', ...p, r: 12, size: 26 + rnd() * 14, tone: rnd(), solid: 11 });
    }
  }
  // Meadow trees, bushes and flowers
  for (let k = 0; k < 420; k += 1) {
    const tx = Math.floor(rnd() * 112);
    const ty = Math.floor(rnd() * 84);
    const t = get(tx, ty);
    const p = { x: tx * TILE + 4 + rnd() * 24, y: ty * TILE + 4 + rnd() * 24 };
    if (t === T.GRASS && ty > 22 && ty < 60 && tx > 46 && tx < 71) {
      if ([[-1, 0], [1, 0], [0, -1], [0, 1], [0, 0]].some(([dx, dy]) => get(tx + dx, ty + dy) === T.PATH)) continue;
      const r = rnd();
      if (r < 0.25) props.push({ kind: 'tree', ...p, size: 28 + rnd() * 12, tone: rnd() * 0.5 + 0.5, solid: 11 });
      else if (r < 0.6) props.push({ kind: 'bush', ...p, size: 10 + rnd() * 6 });
      else props.push({ kind: 'flowers', ...p, hue: Math.floor(rnd() * 3) });
    } else if (t === T.SAND && ty > 61) {
      if (near(p.x, p.y, [C(60, 72), C(50, 70)], TILE * 3)) continue;
      const r = rnd();
      if (r < 0.18) props.push({ kind: 'palm', ...p, size: 30 + rnd() * 10, rot: rnd() * 6.28, solid: 8 });
      else if (r < 0.32) props.push({ kind: 'shell', ...p, rot: rnd() * 6.28 });
      else if (r < 0.4) props.push({ kind: 'rock', ...p, size: 8 + rnd() * 8, solid: 8 });
    } else if (t === T.SNOW) {
      if (rnd() < 0.3 && get(tx, ty) === T.SNOW && ![[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => get(tx + dx, ty + dy) === T.PATH)) props.push({ kind: 'pine', ...p, size: 22 + rnd() * 8, solid: 9 });
    } else if (t === T.RUIN && ty > 38 && ty < 56 && tx > 72 && tx < 100) {
      if (rnd() < 0.12 && !near(p.x, p.y, [C(80, 47), C(86, 47), C(92, 47), C(80, 42), C(92, 42), C(86, 52), C(86, 40), C(86, 54)], TILE * 2.2)) props.push({ kind: 'rubble', ...p, size: 6 + rnd() * 6 });
    }
  }
  // Ruins pillars along the courtyard
  for (const tx of [75, 97]) for (let ty = 41; ty <= 53; ty += 4) props.push({ kind: 'pillar', ...C(tx, ty), solid: 12 });
  for (const [tx, ty] of [
    [64, 30],
    [68, 34],
    [66, 26],
  ])
    props.push({ kind: 'pillar', ...C(tx, ty), broken: true, solid: 12 });
  // Crystals in the caves
  for (const [tx, ty, hue] of [
    [80, 18, 0],
    [84, 13, 1],
    [83, 23, 2],
    [88, 11, 0],
    [96, 18, 1],
    [103, 10, 2],
    [100, 16, 0],
    [76, 22, 1],
  ])
    props.push({ kind: 'crystal', ...C(tx, ty), hue, solid: 10 });
  // Wreck debris
  for (const [tx, ty, rot] of [
    [42, 72, 0.4],
    [58, 68, 2.2],
    [62, 74, 1.2],
    [46, 76, 2.8],
  ])
    props.push({ kind: 'plank', ...C(tx, ty), rot });
  props.push({ kind: 'mast', ...C(48, 69), rot: -0.6 });

  // Interactive objects
  const items = [
    // Beach
    { id: 'fire-beach', kind: 'campfire', ...C(61, 71), label: 'Rest at the campfire', checkpoint: 'Wreck Beach camp' },
    { id: 'log', kind: 'book', ...C(52, 71), label: "Read the captain's log" },
    { id: 'wreck-chest', kind: 'chest', ...C(48, 70), label: 'Open the sea chest', gives: ['machete', 'map-beach'] },
    { id: 'sign-forest', kind: 'sign', ...C(39, 63), label: 'Read the sign', text: 'Whispering Forest. Path overgrown.' },
    { id: 'relic-cove', kind: 'relic', ...C(97, 66), label: 'Pick up the relic', gives: ['relic-cove'], secret: true },
    // Forest
    { id: 'vines', kind: 'vines', ...C(36, 61), w: 3, label: 'Cut the vines', needs: 'machete', solidBox: [35, 60, 37, 61] },
    { id: 'fire-camp', kind: 'campfire', ...C(17, 48), label: 'Rest at the campfire', checkpoint: 'Explorer camp' },
    { id: 'tent', kind: 'tent', ...C(14, 45), solid: 26 },
    { id: 'camp-crate', kind: 'crate', ...C(19, 45), label: 'Search the crate', gives: ['lantern', 'map-forest'] },
    { id: 'diary', kind: 'book', ...C(15, 49), label: "Read the explorer's diary" },
    { id: 'tablet', kind: 'tablet', ...C(29, 22), label: 'Read the stone tablet', solid: 14 },
    { id: 'totem-sun', kind: 'totem', glyph: 'sun', ...C(25, 25), label: 'Touch the Sun totem', solid: 12 },
    { id: 'totem-wave', kind: 'totem', glyph: 'wave', ...C(33, 25), label: 'Touch the Wave totem', solid: 12 },
    { id: 'totem-star', kind: 'totem', glyph: 'star', ...C(25, 30), label: 'Touch the Star totem', solid: 12 },
    { id: 'totem-moon', kind: 'totem', glyph: 'moon', ...C(33, 30), label: 'Touch the Moon totem', solid: 12 },
    { id: 'altar', kind: 'altar', ...C(29, 27), label: 'Take the sun shard', gives: ['shard-forest'], needsFlag: 'totems' },
    { id: 'relic-falls', kind: 'relic', ...C(23, 11), label: 'Pick up the relic', gives: ['relic-falls'], secret: true },
    // Meadow
    { id: 'fire-meadow', kind: 'campfire', ...C(58, 47), label: 'Rest at the campfire', checkpoint: 'Meadow crossroads' },
    { id: 'statue', kind: 'statue', ...C(54, 25), label: 'Read the statue inscription', solid: 14 },
    { id: 'sungate', kind: 'sungate', ...C(56, 20), label: 'Place the sun shards', needs: 'shards', solidBox: [55, 19, 57, 20] },
    // Cave
    { id: 'dark', kind: 'darkness', ...C(73, 21), label: 'Too dark to go on', needs: 'lantern', solidBox: [73, 20, 73, 22] },
    { id: 'carving', kind: 'carving', ...C(87, 9), label: 'Read the wall carving' },
    { id: 'plate-a', kind: 'plate', ...C(90, 12) },
    { id: 'plate-b', kind: 'plate', ...C(95, 17) },
    { id: 'boulder-a', kind: 'boulder', tx: 91, ty: 15, home: [91, 15] },
    { id: 'boulder-b', kind: 'boulder', tx: 93, ty: 13, home: [93, 13] },
    { id: 'lever', kind: 'lever', ...C(88, 18), label: 'Pull the reset lever' },
    { id: 'crystal-gate', kind: 'crystalgate', ...C(98, 14), solidBox: [98, 13, 98, 15], needsFlag: 'plates' },
    { id: 'cave-chest', kind: 'chest', ...C(102, 13), label: 'Open the crystal chest', gives: ['key', 'shard-cave', 'map-cave'] },
    { id: 'fire-cave', kind: 'campfire', ...C(68, 22), label: 'Rest at the campfire', checkpoint: 'Cave mouth' },
    // Ruins
    { id: 'gate', kind: 'gate', ...C(85, 56), label: 'Unlock the bronze gate', needs: 'key', solidBox: [84, 56, 86, 56] },
    { id: 'fire-ruins', kind: 'campfire', ...C(82, 59), label: 'Rest at the campfire', checkpoint: 'Temple steps' },
    { id: 'emitter', kind: 'emitter', tx: 74, ty: 47, dir: [1, 0] },
    { id: 'mirror-1', kind: 'mirror', tx: 80, ty: 47, label: 'Turn the mirror', orient: 0 },
    { id: 'mirror-2', kind: 'mirror', tx: 80, ty: 42, label: 'Turn the mirror', orient: 0 },
    { id: 'mirror-3', kind: 'mirror', tx: 86, ty: 42, label: 'Turn the mirror', orient: 0 },
    { id: 'receptor', kind: 'receptor', tx: 86, ty: 39 },
    { id: 'sanctum-door', kind: 'door', ...C(85, 38), solidBox: [85, 38, 85, 38], needsFlag: 'beam' },
    { id: 'mural', kind: 'mural', ...C(78, 55), label: 'Study the mural' },
    { id: 'sanctum-chest', kind: 'chest', ...C(86, 33), label: 'Open the reliquary', gives: ['shard-ruins', 'map-ruins'] },
    { id: 'cracked', kind: 'cracked', ...C(100, 44), label: 'Push the cracked wall', solidBox: [100, 44, 100, 44] },
    { id: 'relic-ruins', kind: 'relic', ...C(103, 44), label: 'Pick up the relic', gives: ['relic-ruins'], secret: true },
    // Mountain
    { id: 'fire-peak', kind: 'campfire', ...C(58, 17), label: 'Rest at the campfire', checkpoint: 'Foot of the peak' },
    { id: 'beacon', kind: 'beacon', ...C(56, 6), label: 'Light the beacon', solid: 22 },
  ];
  return { props, items };
}

export const START = { x: 60 * TILE + 16, y: 73 * TILE + 16 };
