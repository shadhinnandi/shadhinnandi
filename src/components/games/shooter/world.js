// Game state and rules for Last Stand. No DOM access: the engine turns input
// into an `intent` each step and the renderer draws whatever is here, so this
// module can also be driven by a script in Node for testing.
//
//   intent = { mx, my, aim, fire, dash }
//     mx, my  movement in -1..1 (keyboard or left stick)
//     aim     angle in radians the gun points at
//     fire    true while the trigger is held
//     dash    true on the step the dash was requested

import { ARENA, ENEMIES, PILLARS, PLAYER, POWER_TIME, waveRoster, waveScaling } from './config.js';
import { think } from './ai.js';
import { TAU, clamp, createPool, damp, rand } from '../shared/math.js';

const POWER_COLORS = { health: '#5ef0a0', rapid: '#ffd166', spread: '#6cc6ff', shield: '#c9a6ff' };
export { POWER_COLORS };

export function createWorld() {
  const w = {
    bullets: createPool(() => ({ alive: false }), 180),
    shots: createPool(() => ({ alive: false }), 140),
    particles: createPool(() => ({ alive: false }), 900),
    texts: createPool(() => ({ alive: false }), 48),
    marks: createPool(() => ({ alive: false }), 70),
    enemies: [],
    pickups: [],
    spawns: [],
  };
  w.enemyFire = (e, angle, speed, damage) => enemyFire(w, e, angle, speed, damage);
  w.endCharge = (e) => endCharge(w, e);
  resetWorld(w);
  return w;
}

export function resetWorld(w) {
  Object.assign(w, {
    time: 0,
    clock: 0,
    score: 0,
    kills: 0,
    wave: 0,
    phase: 'intro',
    phaseT: 0,
    queue: [],
    spawnT: 0,
    slotCounter: 0,
    combo: 0,
    comboT: 0,
    shake: 0,
    hurt: 0,
    dying: 0,
    over: false,
    banner: null,
    shotsFired: 0,
    shotsHit: 0,
    scale: waveScaling(1),
  });
  w.player = {
    x: ARENA.w / 2,
    y: ARENA.h / 2,
    vx: 0,
    vy: 0,
    r: PLAYER.r,
    hp: PLAYER.maxHp,
    shownHp: PLAYER.maxHp,
    angle: -Math.PI / 2,
    fireCd: 0,
    dashT: 0,
    dashCd: 0,
    dashX: 1,
    dashY: 0,
    invuln: 0,
    flash: 0,
    muzzle: 0,
    recoil: 0,
    stride: 0,
    power: { rapid: 0, spread: 0, shield: 0 },
    alive: true,
  };
  w.enemies.length = 0;
  w.pickups.length = 0;
  w.spawns.length = 0;
  w.bullets.clear();
  w.shots.clear();
  w.particles.clear();
  w.texts.clear();
  w.marks.clear();
  startWave(w, 1);
}

function startWave(w, n) {
  w.wave = n;
  w.queue = waveRoster(n);
  w.scale = waveScaling(n);
  w.phase = 'intro';
  w.phaseT = n === 1 ? 1.6 : 1.4;
  w.spawnT = 0;
  w.banner = { title: `Wave ${n}`, sub: n === 1 ? 'Hold the arena' : `${w.queue.length} hostiles incoming`, t: 0, life: w.phaseT + 0.6 };
}

// ---------- effects ----------

export function burst(w, x, y, color, count, { speed = 260, life = 0.5, size = 3, drag = 4, kind = 'spark', spread = TAU, angle = 0 } = {}) {
  for (let i = 0; i < count; i += 1) {
    const p = w.particles.spawn();
    const a = angle + (Math.random() - 0.5) * spread;
    const s = speed * (0.35 + Math.random() * 0.65);
    p.x = x;
    p.y = y;
    p.vx = Math.cos(a) * s;
    p.vy = Math.sin(a) * s;
    p.life = p.max = life * (0.6 + Math.random() * 0.6);
    p.size = size * (0.6 + Math.random() * 0.8);
    p.color = color;
    p.drag = drag;
    p.kind = kind;
    p.rot = Math.random() * TAU;
    p.spin = (Math.random() - 0.5) * 14;
  }
}

function ring(w, x, y, color, radius, life = 0.35) {
  const p = w.particles.spawn();
  Object.assign(p, { x, y, vx: 0, vy: 0, life, max: life, size: radius, color, drag: 0, kind: 'ring', rot: 0, spin: 0 });
}

function floatText(w, x, y, text, color = '#fff', size = 14) {
  const t = w.texts.spawn();
  Object.assign(t, { x, y, text, color, size, life: 0.9, max: 0.9 });
}

function mark(w, x, y, r, color) {
  const m = w.marks.spawn();
  Object.assign(m, { x, y, r, color, life: 22, max: 22, rot: Math.random() * TAU });
}

const shake = (w, amount) => {
  w.shake = Math.max(w.shake, amount);
};

// ---------- spawning ----------

function spawnPoint(w) {
  const p = w.player;
  let best = null;
  let bestScore = -Infinity;
  for (let i = 0; i < 14; i += 1) {
    const side = Math.floor(Math.random() * 4);
    const t = Math.random();
    const x = side === 0 ? 70 + t * (ARENA.w - 140) : side === 1 ? ARENA.w - 70 : side === 2 ? 70 + t * (ARENA.w - 140) : 70;
    const y = side === 0 ? 70 : side === 1 ? 70 + t * (ARENA.h - 140) : side === 2 ? ARENA.h - 70 : 70 + t * (ARENA.h - 140);
    if (PILLARS.some((pl) => Math.hypot(pl.x - x, pl.y - y) < pl.r + 40)) continue;
    const d = Math.hypot(x - p.x, y - p.y);
    const score = d < 480 ? -1000 + d : -Math.abs(d - 820);
    if (score > bestScore) {
      bestScore = score;
      best = { x, y };
    }
  }
  return best || { x: 70, y: 70 };
}

function createEnemy(w, type, x, y) {
  const def = ENEMIES[type];
  const hp = def.hp * w.scale.hp;
  w.slotCounter += 1;
  return {
    type,
    x,
    y,
    vx: 0,
    vy: 0,
    dx: 0,
    dy: 0,
    r: def.r,
    hp,
    maxHp: hp,
    speedMul: w.scale.speed * rand(0.92, 1.08),
    dmgMul: w.scale.damage,
    slot: (w.slotCounter * 2.39996) % TAU,
    side: Math.random() < 0.5 ? -1 : 1,
    face: 0,
    fireCd: rand(0.8, 1.8),
    telegraph: 0,
    strafeT: rand(1, 2.4),
    state: 'chase',
    stateT: 0,
    chargeCd: rand(0.8, 1.8),
    chargeDir: 0,
    attackCd: 0.4,
    flash: 0,
    spawnIn: 0.35,
    wander: Math.random() * TAU,
    bob: Math.random() * TAU,
    dead: false,
  };
}

// ---------- combat ----------

function fire(w) {
  const p = w.player;
  const spread = p.power.spread > 0;
  const angles = spread ? [-0.16, 0, 0.16] : [0];
  for (const off of angles) {
    const a = p.angle + off + (Math.random() - 0.5) * 0.04;
    const b = w.bullets.spawn();
    const mx = p.x + Math.cos(p.angle) * (p.r + 14);
    const my = p.y + Math.sin(p.angle) * (p.r + 14);
    Object.assign(b, {
      x: mx,
      y: my,
      px: mx,
      py: my,
      vx: Math.cos(a) * PLAYER.bulletSpeed,
      vy: Math.sin(a) * PLAYER.bulletSpeed,
      life: PLAYER.bulletLife,
      damage: PLAYER.bulletDamage * (spread ? 0.8 : 1),
    });
  }
  w.shotsFired += 1;
  p.muzzle = 0.06;
  p.recoil = 1;
  p.vx -= Math.cos(p.angle) * 22;
  p.vy -= Math.sin(p.angle) * 22;
  const mx = p.x + Math.cos(p.angle) * (p.r + 16);
  const my = p.y + Math.sin(p.angle) * (p.r + 16);
  burst(w, mx, my, '#ffe39a', 2, { speed: 220, life: 0.12, size: 2, angle: p.angle, spread: 0.7 });
}

function enemyFire(w, e, angle, speed, damage) {
  const s = w.shots.spawn();
  const x = e.x + Math.cos(angle) * (e.r + 6);
  const y = e.y + Math.sin(angle) * (e.r + 6);
  Object.assign(s, { x, y, px: x, py: y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 2.6, damage });
  burst(w, x, y, '#d9b8ff', 5, { speed: 160, life: 0.18, size: 2, angle, spread: 0.9 });
}

function endCharge(w, e) {
  e.state = 'recover';
  e.stateT = 0.85;
  e.chargeCd = rand(2.2, 3.4);
  e.vx *= 0.2;
  e.vy *= 0.2;
}

function hurtPlayer(w, damage, fromX, fromY) {
  const p = w.player;
  if (!p.alive || p.invuln > 0) return;
  const dx = p.x - fromX;
  const dy = p.y - fromY;
  const d = Math.hypot(dx, dy) || 1;
  if (p.power.shield > 0) {
    p.invuln = 0.25;
    ring(w, p.x, p.y, '#c9a6ff', p.r + 18, 0.3);
    burst(w, p.x - (dx / d) * p.r, p.y - (dy / d) * p.r, '#d8c2ff', 8, { speed: 200, life: 0.3 });
    return;
  }
  p.hp -= damage;
  p.invuln = PLAYER.hurtInvuln;
  p.flash = 0.18;
  p.vx += (dx / d) * 260;
  p.vy += (dy / d) * 260;
  w.hurt = 1;
  w.combo = 0;
  shake(w, 9);
  burst(w, p.x, p.y, '#ff6b7a', 12, { speed: 260, life: 0.45, size: 3 });
  if (p.hp <= 0) {
    p.hp = 0;
    p.alive = false;
    w.dying = 1.8;
    shake(w, 20);
    burst(w, p.x, p.y, '#7fe7ff', 46, { speed: 520, life: 1, size: 4, drag: 2.5 });
    burst(w, p.x, p.y, '#ffffff', 18, { speed: 300, life: 0.6, size: 3 });
    burst(w, p.x, p.y, 'rgba(120,130,150,0.5)', 14, { speed: 120, life: 1.4, size: 16, kind: 'smoke', drag: 1.5 });
    ring(w, p.x, p.y, '#7fe7ff', 140, 0.6);
    mark(w, p.x, p.y, 46, 'rgba(0,0,0,0.5)');
  }
}

function killEnemy(w, e) {
  const def = ENEMIES[e.type];
  e.dead = true;
  w.kills += 1;
  w.combo += 1;
  w.comboT = 1.8;
  const mult = Math.min(4, 1 + Math.floor(w.combo / 5) * 0.5);
  const gained = Math.round(def.score * mult);
  w.score += gained;
  floatText(w, e.x, e.y - e.r - 6, `+${gained}`, mult > 1 ? '#ffd166' : '#ffffff', e.type === 'brute' ? 18 : 13);

  const big = e.type === 'brute';
  burst(w, e.x, e.y, def.color, big ? 34 : 18, { speed: big ? 420 : 320, life: 0.7, size: big ? 5 : 3.5, kind: 'shard', drag: 3 });
  burst(w, e.x, e.y, '#ffffff', big ? 12 : 6, { speed: 360, life: 0.25, size: 2 });
  burst(w, e.x, e.y, 'rgba(110,115,130,0.45)', big ? 10 : 5, { speed: 90, life: 1.1, size: big ? 20 : 12, kind: 'smoke', drag: 1.8 });
  ring(w, e.x, e.y, def.color, e.r * (big ? 4 : 3), big ? 0.5 : 0.35);
  mark(w, e.x, e.y, e.r * 1.4, 'rgba(0,0,0,0.35)');
  shake(w, big ? 10 : 2.5);

  // Drops
  const roll = Math.random();
  const hurtBonus = w.player.hp < 50 ? 0.06 : 0;
  if (big || roll < 0.08 + hurtBonus) {
    w.pickups.push({ x: e.x, y: e.y, kind: big && w.player.hp > 70 ? pickPower() : 'health', t: 12, bob: Math.random() * TAU });
  } else if (roll < 0.13 + hurtBonus) {
    w.pickups.push({ x: e.x, y: e.y, kind: pickPower(), t: 12, bob: Math.random() * TAU });
  }
}

const pickPower = () => ['rapid', 'spread', 'shield'][Math.floor(Math.random() * 3)];

function collect(w, k) {
  const p = w.player;
  if (k.kind === 'health') {
    const before = p.hp;
    p.hp = Math.min(PLAYER.maxHp, p.hp + 25);
    floatText(w, p.x, p.y - 28, `+${Math.round(p.hp - before)} HP`, POWER_COLORS.health, 14);
  } else {
    p.power[k.kind] = POWER_TIME[k.kind];
    floatText(w, p.x, p.y - 28, { rapid: 'Rapid fire', spread: 'Spread shot', shield: 'Shield' }[k.kind], POWER_COLORS[k.kind], 14);
  }
  ring(w, k.x, k.y, POWER_COLORS[k.kind], 34, 0.35);
  burst(w, k.x, k.y, POWER_COLORS[k.kind], 12, { speed: 200, life: 0.4 });
}

// ---------- collisions ----------

function keepInArena(o, bounce = 0) {
  let hit = false;
  if (o.x < o.r) {
    o.x = o.r;
    o.vx = Math.abs(o.vx) * bounce;
    hit = true;
  } else if (o.x > ARENA.w - o.r) {
    o.x = ARENA.w - o.r;
    o.vx = -Math.abs(o.vx) * bounce;
    hit = true;
  }
  if (o.y < o.r) {
    o.y = o.r;
    o.vy = Math.abs(o.vy) * bounce;
    hit = true;
  } else if (o.y > ARENA.h - o.r) {
    o.y = ARENA.h - o.r;
    o.vy = -Math.abs(o.vy) * bounce;
    hit = true;
  }
  return hit;
}

function pushOutOfPillars(o) {
  let hit = false;
  for (const pl of PILLARS) {
    const dx = o.x - pl.x;
    const dy = o.y - pl.y;
    const d = Math.hypot(dx, dy) || 1;
    const min = pl.r + o.r;
    if (d < min) {
      const nx = dx / d;
      const ny = dy / d;
      o.x = pl.x + nx * min;
      o.y = pl.y + ny * min;
      const vn = o.vx * nx + o.vy * ny;
      if (vn < 0) {
        o.vx -= vn * nx;
        o.vy -= vn * ny;
      }
      hit = true;
    }
  }
  return hit;
}

const insidePillar = (x, y) => PILLARS.find((pl) => (x - pl.x) ** 2 + (y - pl.y) ** 2 < pl.r * pl.r);
const outsideArena = (x, y) => x < 0 || y < 0 || x > ARENA.w || y > ARENA.h;

// ---------- update ----------

export function updateWorld(w, intent, rawDt) {
  const dt = w.dying > 0 ? rawDt * 0.4 : rawDt;
  const p = w.player;
  w.time += dt;
  if (p.alive) w.clock += rawDt;

  if (w.dying > 0) {
    w.dying -= rawDt;
    if (w.dying <= 0) w.over = true;
  }

  // Waves
  if (w.banner) {
    w.banner.t += rawDt;
    if (w.banner.t > w.banner.life) w.banner = null;
  }
  if (p.alive) {
    if (w.phase === 'intro') {
      w.phaseT -= dt;
      if (w.phaseT <= 0) w.phase = 'fight';
    } else if (w.phase === 'fight') {
      w.spawnT -= dt;
      const alive = w.enemies.length + w.spawns.length;
      if (w.queue.length && w.spawnT <= 0 && alive < w.scale.maxAlive) {
        const type = w.queue.shift();
        const at = spawnPoint(w);
        w.spawns.push({ ...at, type, t: 0.75, max: 0.75 });
        w.spawnT = w.scale.spawnGap * rand(0.7, 1.3);
      }
      if (!w.queue.length && !w.enemies.length && !w.spawns.length) {
        w.phase = 'clear';
        w.phaseT = 2.4;
        const bonus = 250 * w.wave;
        w.score += bonus;
        p.hp = Math.min(PLAYER.maxHp, p.hp + 10);
        w.banner = { title: `Wave ${w.wave} cleared`, sub: `+${bonus} bonus · +10 HP`, t: 0, life: 2.2 };
      }
    } else if (w.phase === 'clear') {
      w.phaseT -= dt;
      if (w.phaseT <= 0) startWave(w, w.wave + 1);
    }
  }

  for (let i = w.spawns.length - 1; i >= 0; i -= 1) {
    const s = w.spawns[i];
    s.t -= dt;
    if (s.t <= 0) {
      w.spawns.splice(i, 1);
      w.enemies.push(createEnemy(w, s.type, s.x, s.y));
      burst(w, s.x, s.y, ENEMIES[s.type].color, 10, { speed: 200, life: 0.35 });
    }
  }

  updatePlayer(w, intent, dt);
  updateBullets(w, dt);
  updateEnemies(w, dt);
  updateShots(w, dt);
  updatePickups(w, dt);
  updateEffects(w, dt);

  w.comboT -= dt;
  if (w.comboT <= 0) w.combo = 0;
  w.shake = damp(w.shake, 0, 9, rawDt);
  w.hurt = damp(w.hurt, 0, 4, rawDt);
}

function updatePlayer(w, intent, dt) {
  const p = w.player;
  p.shownHp = damp(p.shownHp, p.hp, 5, dt);
  if (!p.alive) return;
  for (const k of ['rapid', 'spread', 'shield']) p.power[k] = Math.max(0, p.power[k] - dt);
  p.invuln = Math.max(0, p.invuln - dt);
  p.flash = Math.max(0, p.flash - dt);
  p.muzzle = Math.max(0, p.muzzle - dt);
  p.recoil = damp(p.recoil, 0, 18, dt);
  p.dashCd -= dt;
  p.angle = intent.aim;

  const ml = Math.hypot(intent.mx, intent.my);
  if (intent.dash && p.dashCd <= 0) {
    const dx = ml > 0.1 ? intent.mx / ml : Math.cos(p.angle);
    const dy = ml > 0.1 ? intent.my / ml : Math.sin(p.angle);
    p.dashX = dx;
    p.dashY = dy;
    p.dashT = PLAYER.dashTime;
    p.dashCd = PLAYER.dashCooldown;
    burst(w, p.x, p.y, '#7fe7ff', 10, { speed: 220, life: 0.3, angle: Math.atan2(-dy, -dx), spread: 1.2 });
  }

  if (p.dashT > 0) {
    p.dashT -= dt;
    p.vx = p.dashX * PLAYER.dashSpeed;
    p.vy = p.dashY * PLAYER.dashSpeed;
    p.invuln = Math.max(p.invuln, 0.06);
    if (Math.random() < 0.7) {
      const a = w.particles.spawn();
      Object.assign(a, { x: p.x, y: p.y, vx: 0, vy: 0, life: 0.22, max: 0.22, size: p.r, color: '#7fe7ff', drag: 0, kind: 'ghost', rot: p.angle, spin: 0 });
    }
  } else {
    const m = Math.min(1, ml);
    const tx = ml > 0 ? (intent.mx / ml) * m * PLAYER.speed : 0;
    const ty = ml > 0 ? (intent.my / ml) * m * PLAYER.speed : 0;
    p.vx = damp(p.vx, tx, PLAYER.accel, dt);
    p.vy = damp(p.vy, ty, PLAYER.accel, dt);
  }
  p.x += p.vx * dt;
  p.y += p.vy * dt;
  keepInArena(p);
  pushOutOfPillars(p);
  p.stride += Math.hypot(p.vx, p.vy) * dt * 0.05;

  p.fireCd -= dt;
  if (intent.fire && p.fireCd <= 0) {
    fire(w);
    p.fireCd = p.power.rapid > 0 ? PLAYER.rapidDelay : PLAYER.fireDelay;
  }
}

function updateBullets(w, dt) {
  for (const b of w.bullets.items) {
    if (!b.alive) continue;
    b.px = b.x;
    b.py = b.y;
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.life -= dt;
    if (b.life <= 0) {
      b.alive = false;
      continue;
    }
    if (outsideArena(b.x, b.y) || insidePillar(b.x, b.y)) {
      b.alive = false;
      burst(w, b.px, b.py, '#ffd98a', 5, { speed: 200, life: 0.2, size: 2, angle: Math.atan2(-b.vy, -b.vx), spread: 1.6 });
      continue;
    }
    for (const e of w.enemies) {
      if (e.dead) continue;
      const dx = e.x - b.x;
      const dy = e.y - b.y;
      if (dx * dx + dy * dy < (e.r + 3) * (e.r + 3)) {
        b.alive = false;
        w.shotsHit += 1;
        e.hp -= b.damage;
        e.flash = 0.08;
        const sp = Math.hypot(b.vx, b.vy) || 1;
        const kb = e.type === 'brute' ? 18 : 70;
        e.vx += (b.vx / sp) * kb;
        e.vy += (b.vy / sp) * kb;
        burst(w, b.x, b.y, '#fff1c4', 4, { speed: 240, life: 0.18, size: 2, angle: Math.atan2(-b.vy, -b.vx), spread: 1.4 });
        burst(w, b.x, b.y, ENEMIES[e.type].color, 3, { speed: 160, life: 0.3, size: 2.5, angle: Math.atan2(b.vy, b.vx), spread: 1 });
        if (e.hp <= 0) killEnemy(w, e);
        break;
      }
    }
  }
}

function updateEnemies(w, dt) {
  const p = w.player;
  const list = w.enemies;
  for (const e of list) {
    e.flash = Math.max(0, e.flash - dt);
    e.spawnIn = Math.max(0, e.spawnIn - dt);
    e.attackCd -= dt;
    e.bob += dt * 6;
    think(e, w, dt);
  }
  // Separation: enemies keep a little space so a crowd spreads out.
  for (let i = 0; i < list.length; i += 1) {
    const a = list[i];
    for (let j = i + 1; j < list.length; j += 1) {
      const b = list[j];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const min = a.r + b.r + 8;
      const d2 = dx * dx + dy * dy;
      if (d2 >= min * min || d2 === 0) continue;
      const d = Math.sqrt(d2);
      const push = (min - d) / min;
      const nx = dx / d;
      const ny = dy / d;
      const wa = b.r / (a.r + b.r);
      const wb = a.r / (a.r + b.r);
      a.dx -= nx * push * 260 * wa;
      a.dy -= ny * push * 260 * wa;
      b.dx += nx * push * 260 * wb;
      b.dy += ny * push * 260 * wb;
      // Hard overlap: move them apart directly.
      if (d < a.r + b.r) {
        const o = (a.r + b.r - d) / 2;
        a.x -= nx * o * wa * 2;
        a.y -= ny * o * wa * 2;
        b.x += nx * o * wb * 2;
        b.y += ny * o * wb * 2;
      }
    }
  }
  for (const e of list) {
    const def = ENEMIES[e.type];
    const charging = e.type === 'brute' && e.state === 'charge';
    if (charging) {
      e.vx = e.dx;
      e.vy = e.dy;
    } else {
      e.vx = damp(e.vx, e.dx, def.accel, dt);
      e.vy = damp(e.vy, e.dy, def.accel, dt);
    }
    e.x += e.vx * dt;
    e.y += e.vy * dt;
    const wall = keepInArena(e);
    const pillar = pushOutOfPillars(e);
    if (charging && (wall || pillar)) {
      shake(w, 7);
      burst(w, e.x + Math.cos(e.chargeDir) * e.r, e.y + Math.sin(e.chargeDir) * e.r, '#c8d0e0', 14, { speed: 260, life: 0.4, size: 3 });
      endCharge(w, e);
    }
    if (charging && Math.random() < 0.5) {
      burst(w, e.x, e.y, 'rgba(160,170,190,0.35)', 1, { speed: 30, life: 0.5, size: 10, kind: 'smoke', drag: 2 });
    }

    // Contact with the player
    if (!p.alive || e.spawnIn > 0.15) continue;
    const dx = p.x - e.x;
    const dy = p.y - e.y;
    const d = Math.hypot(dx, dy) || 1;
    const touch = e.r + p.r;
    if (d < touch) {
      const o = touch - d;
      e.x -= (dx / d) * o;
      e.y -= (dy / d) * o;
      if (e.attackCd <= 0) {
        hurtPlayer(w, def.damage * e.dmgMul * (charging ? 1.25 : 1), e.x, e.y);
        e.attackCd = 1;
        e.vx -= (dx / d) * 160;
        e.vy -= (dy / d) * 160;
        if (charging) endCharge(w, e);
      }
    }
  }
  if (list.some((e) => e.dead)) w.enemies = list.filter((e) => !e.dead);
}

function updateShots(w, dt) {
  const p = w.player;
  for (const s of w.shots.items) {
    if (!s.alive) continue;
    s.px = s.x;
    s.py = s.y;
    s.x += s.vx * dt;
    s.y += s.vy * dt;
    s.life -= dt;
    if (s.life <= 0 || outsideArena(s.x, s.y) || insidePillar(s.x, s.y)) {
      s.alive = false;
      burst(w, s.px, s.py, '#cfa8ff', 5, { speed: 150, life: 0.25, size: 2 });
      continue;
    }
    if (p.alive) {
      const dx = p.x - s.x;
      const dy = p.y - s.y;
      if (dx * dx + dy * dy < (p.r + 5) * (p.r + 5)) {
        s.alive = false;
        hurtPlayer(w, s.damage, s.x - s.vx * 0.05, s.y - s.vy * 0.05);
      }
    }
  }
}

function updatePickups(w, dt) {
  const p = w.player;
  for (let i = w.pickups.length - 1; i >= 0; i -= 1) {
    const k = w.pickups[i];
    k.t -= dt;
    k.bob += dt * 3;
    if (k.t <= 0) {
      w.pickups.splice(i, 1);
      continue;
    }
    if (!p.alive) continue;
    const dx = p.x - k.x;
    const dy = p.y - k.y;
    const d = Math.hypot(dx, dy) || 1;
    if (d < 120) {
      const pull = 420 * (1 - d / 140);
      k.x += (dx / d) * pull * dt;
      k.y += (dy / d) * pull * dt;
    }
    if (d < p.r + 16) {
      w.pickups.splice(i, 1);
      collect(w, k);
    }
  }
}

function updateEffects(w, dt) {
  for (const q of w.particles.items) {
    if (!q.alive) continue;
    q.life -= dt;
    if (q.life <= 0) {
      q.alive = false;
      continue;
    }
    const f = Math.exp(-q.drag * dt);
    q.vx *= f;
    q.vy *= f;
    q.x += q.vx * dt;
    q.y += q.vy * dt;
    q.rot += q.spin * dt;
  }
  for (const t of w.texts.items) {
    if (!t.alive) continue;
    t.life -= dt;
    t.y -= 34 * dt;
    if (t.life <= 0) t.alive = false;
  }
  for (const m of w.marks.items) {
    if (!m.alive) continue;
    m.life -= dt;
    if (m.life <= 0) m.alive = false;
  }
}

export function comboMultiplier(w) {
  return clamp(1 + Math.floor(w.combo / 5) * 0.5, 1, 4);
}
