// Personal bests, kept in localStorage on this device only. Every access is
// guarded: private windows and blocked storage simply mean no saved best.

const PREFIX = 'games:';

export function loadNumber(key, fallback = 0) {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    const n = Number(raw);
    return raw !== null && Number.isFinite(n) ? n : fallback;
  } catch {
    return fallback;
  }
}

export function saveNumber(key, value) {
  try {
    window.localStorage.setItem(PREFIX + key, String(value));
  } catch {
    /* storage unavailable: keep playing without saving */
  }
}

/** Saves `value` if it beats the stored best. Returns { best, isNew }. */
export function submitBest(key, value) {
  const prev = loadNumber(key, 0);
  if (value > prev) {
    saveNumber(key, value);
    return { best: value, isNew: true };
  }
  return { best: prev, isNew: false };
}
