// Small math and drawing helpers shared by the games. No DOM access, so the
// game logic that uses them can also run in Node for testing.

export const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const rand = (lo, hi) => lo + Math.random() * (hi - lo);
export const randInt = (lo, hi) => Math.floor(rand(lo, hi + 1));
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
export const dist = (ax, ay, bx, by) => Math.hypot(bx - ax, by - ay);
export const TAU = Math.PI * 2;

/** Frame-rate independent exponential approach: rate is "per second". */
export const damp = (a, b, rate, dt) => lerp(a, b, 1 - Math.exp(-rate * dt));

/** Shortest signed difference between two angles. */
export function angleDiff(a, b) {
  let d = (b - a) % TAU;
  if (d > Math.PI) d -= TAU;
  if (d < -Math.PI) d += TAU;
  return d;
}

/** Fixed-size pool of plain objects, reused to avoid garbage in hot loops. */
export function createPool(make, size) {
  const items = Array.from({ length: size }, make);
  let cursor = 0;
  return {
    items,
    /** Returns a dead item (or recycles the oldest) to be filled in. */
    spawn() {
      for (let i = 0; i < size; i += 1) {
        const it = items[(cursor + i) % size];
        if (!it.alive) {
          cursor = (cursor + i + 1) % size;
          it.alive = true;
          return it;
        }
      }
      const it = items[cursor];
      cursor = (cursor + 1) % size;
      it.alive = true;
      return it;
    },
    clear() {
      items.forEach((it) => {
        it.alive = false;
      });
    },
  };
}

/** Number formatting for HUDs: 12345 -> "12,345". */
export const fmt = (n) => Math.floor(n).toLocaleString('en-US');

/** mm:ss from seconds. */
export function clock(seconds) {
  const s = Math.floor(seconds);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

export function roundRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

/** HUD text with a soft shadow so it reads on any background. */
export function hudText(ctx, text, x, y, { size = 14, weight = 600, color = '#f2f4f8', align = 'left', base = 'alphabetic', mono = false, alpha = 1 } = {}) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = `${weight} ${size}px ${mono ? "'IBM Plex Mono', ui-monospace, monospace" : "'IBM Plex Sans', system-ui, sans-serif"}`;
  ctx.textAlign = align;
  ctx.textBaseline = base;
  ctx.shadowColor = 'rgba(0,0,0,0.55)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 1;
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  ctx.restore();
}

/** Rounded progress bar used by every HUD. */
export function bar(ctx, x, y, w, h, t, color, { back = 'rgba(255,255,255,0.12)', ghost = null } = {}) {
  ctx.save();
  roundRect(ctx, x, y, w, h, h / 2);
  ctx.fillStyle = back;
  ctx.fill();
  ctx.clip();
  if (ghost !== null) {
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillRect(x, y, w * clamp(ghost, 0, 1), h);
  }
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w * clamp(t, 0, 1), h);
  ctx.restore();
}
