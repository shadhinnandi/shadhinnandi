// Tuning for Last Stand. Distances are world units (pixels at zoom 1),
// speeds are units per second, times are seconds.

export const ARENA = { w: 2200, h: 1500 };

/** Round pillars: cover for the player, obstacles for enemies and bullets. */
export const PILLARS = [
  { x: 560, y: 430, r: 58 },
  { x: 1640, y: 430, r: 58 },
  { x: 560, y: 1070, r: 58 },
  { x: 1640, y: 1070, r: 58 },
  { x: 1100, y: 300, r: 44 },
  { x: 1100, y: 1200, r: 44 },
  { x: 300, y: 750, r: 40 },
  { x: 1900, y: 750, r: 40 },
];

export const PLAYER = {
  r: 16,
  speed: 285,
  accel: 14,
  maxHp: 100,
  fireDelay: 0.115,
  rapidDelay: 0.062,
  bulletSpeed: 980,
  bulletDamage: 12,
  bulletLife: 0.85,
  dashSpeed: 860,
  dashTime: 0.16,
  dashCooldown: 1.1,
  hurtInvuln: 0.5,
};

export const POWER_TIME = { rapid: 9, spread: 9, shield: 8 };

/*
  Enemy types.
    grunt   steady chaser that tries to take a slot around the player (surround)
    runner  fast and fragile, swings wide to flank before it closes in
    gunner  keeps its distance, strafes and fires leading shots
    brute   slow tank that winds up and charges in a straight line
*/
export const ENEMIES = {
  grunt: { r: 15, speed: 138, hp: 36, damage: 12, score: 100, color: '#ff5d6c', accel: 6 },
  runner: { r: 11, speed: 238, hp: 18, damage: 8, score: 120, color: '#ffb547', accel: 9 },
  gunner: { r: 15, speed: 108, hp: 46, damage: 10, score: 160, color: '#b48cff', accel: 5, range: 360, shotSpeed: 390 },
  brute: { r: 27, speed: 80, hp: 230, damage: 24, score: 420, color: '#58d68d', accel: 3.5, chargeSpeed: 560 },
};

/** Enemy list for a wave, harder each time. */
export function waveRoster(wave) {
  const total = wave === 1 ? 6 : 5 + wave * 3;
  const brutes = wave >= 4 ? Math.min(5, 1 + Math.floor((wave - 4) / 2)) : 0;
  const gunners = wave >= 3 ? Math.floor(total * 0.18) : 0;
  const runners = wave >= 2 ? Math.floor(total * 0.26) : 0;
  const grunts = Math.max(3, total - brutes - gunners - runners);
  const list = [
    ...Array(grunts).fill('grunt'),
    ...Array(runners).fill('runner'),
    ...Array(gunners).fill('gunner'),
    ...Array(brutes).fill('brute'),
  ];
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  // Brutes arrive in the second half so the wave builds up.
  list.sort((a, b) => (a === 'brute') - (b === 'brute'));
  return list;
}

export function waveScaling(wave) {
  return {
    hp: 1 + 0.08 * (wave - 1),
    // Early waves hit softer so new players can learn the controls.
    damage: Math.min(1, 0.7 + 0.1 * wave),
    speed: 1 + Math.min(0.3, 0.025 * (wave - 1)),
    spawnGap: Math.max(0.22, 0.62 - wave * 0.035),
    maxAlive: Math.min(30, 8 + wave * 2),
  };
}
