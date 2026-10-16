// Keyboard and pointer input for one game canvas.
//
// Input only counts while `enabled` (the shell turns it on while a game is
// being played). Keys pressed while focus is on a link, button or form field
// are ignored, so the navbar and menus keep working, and game keys only
// prevent the browser default (page scrolling) while enabled.
//
// Pointer coordinates are CSS pixels relative to the canvas.

const GAME_KEYS = new Set([
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'Space',
  'KeyW',
  'KeyA',
  'KeyS',
  'KeyD',
  'ShiftLeft',
  'ShiftRight',
]);

const INTERACTIVE = 'a, button, input, textarea, select, summary, [contenteditable="true"]';

export function createInput(canvas) {
  const held = new Set();
  const pressed = new Set();
  const pointers = new Map(); // pointerId -> { id, x, y, startX, startY, startTime, type, button }
  const listeners = { down: [], move: [], up: [] };
  const mouse = { x: 0, y: 0, inside: false, down: false, seen: false };
  let enabled = false;

  const local = (e) => {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const emit = (type, p, e) => listeners[type].forEach((fn) => fn(p, e));

  function onKeyDown(e) {
    if (!enabled || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.target instanceof Element && e.target.closest(INTERACTIVE)) return;
    if (GAME_KEYS.has(e.code)) e.preventDefault();
    if (!e.repeat) pressed.add(e.code);
    held.add(e.code);
  }
  function onKeyUp(e) {
    held.delete(e.code);
  }
  function clearAll() {
    held.clear();
    pressed.clear();
    pointers.clear();
    mouse.down = false;
  }

  function onPointerDown(e) {
    if (!enabled) return;
    e.preventDefault();
    canvas.focus({ preventScroll: true });
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch {
      /* capture is a nicety */
    }
    const { x, y } = local(e);
    const p = { id: e.pointerId, x, y, startX: x, startY: y, startTime: performance.now(), type: e.pointerType, button: e.button };
    pointers.set(e.pointerId, p);
    if (e.pointerType === 'mouse') {
      Object.assign(mouse, { x, y, inside: true, seen: true });
      if (e.button === 0) mouse.down = true;
    }
    emit('down', p, e);
  }
  function onPointerMove(e) {
    const { x, y } = local(e);
    if (e.pointerType === 'mouse') Object.assign(mouse, { x, y, inside: true, seen: true });
    const p = pointers.get(e.pointerId);
    if (p) {
      p.x = x;
      p.y = y;
    }
    if (enabled) emit('move', p || { id: e.pointerId, x, y, type: e.pointerType, hover: true }, e);
  }
  function onPointerUp(e) {
    const p = pointers.get(e.pointerId);
    if (e.pointerType === 'mouse' && e.button === 0) mouse.down = false;
    if (!p) return;
    const { x, y } = local(e);
    p.x = x;
    p.y = y;
    pointers.delete(e.pointerId);
    if (enabled) emit('up', p, e);
  }
  function onPointerLeave(e) {
    if (e.pointerType === 'mouse') mouse.inside = false;
  }
  const onContextMenu = (e) => enabled && e.preventDefault();

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('blur', clearAll);
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointercancel', onPointerUp);
  canvas.addEventListener('pointerleave', onPointerLeave);
  canvas.addEventListener('contextmenu', onContextMenu);

  return {
    mouse,
    pointers,
    /** True while any of the given key codes is held. */
    down: (...codes) => codes.some((c) => held.has(c)),
    /** True once per key press (consumes it). */
    take(...codes) {
      for (const c of codes) {
        if (pressed.has(c)) {
          pressed.delete(c);
          return true;
        }
      }
      return false;
    },
    /** Horizontal / vertical axis from WASD + arrows, each in -1..1. */
    axis() {
      const x = (held.has('KeyD') || held.has('ArrowRight') ? 1 : 0) - (held.has('KeyA') || held.has('ArrowLeft') ? 1 : 0);
      const y = (held.has('KeyS') || held.has('ArrowDown') ? 1 : 0) - (held.has('KeyW') || held.has('ArrowUp') ? 1 : 0);
      return { x, y };
    },
    on(type, fn) {
      listeners[type].push(fn);
    },
    setEnabled(v) {
      enabled = v;
      if (!v) clearAll();
    },
    clearPressed: () => pressed.clear(),
    destroy() {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', clearAll);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
      canvas.removeEventListener('pointerleave', onPointerLeave);
      canvas.removeEventListener('contextmenu', onContextMenu);
      listeners.down.length = listeners.move.length = listeners.up.length = 0;
    },
  };
}
