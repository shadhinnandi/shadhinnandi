import { useSyncExternalStore } from 'react';

// Learning progress for DSA I, kept in this browser only (localStorage), like
// the site's other per-device settings. Every access is guarded: a private
// window, blocked storage or a malformed saved value simply means no saved
// progress, never an error.
//
//   lessons:  { [module id]: true }               lessons marked complete
//   problems: { [problem id]: 'solved' | 'review' } problem status

const KEY = 'dsa-1:progress:v1';
const EMPTY = { lessons: {}, problems: {} };
const STATUSES = new Set(['solved', 'review']);

function sanitise(value) {
  if (!value || typeof value !== 'object') return EMPTY;
  const lessons = {};
  const problems = {};
  if (value.lessons && typeof value.lessons === 'object') {
    for (const [k, v] of Object.entries(value.lessons)) if (v === true && /^[\w]{1,4}$/.test(k)) lessons[k] = true;
  }
  if (value.problems && typeof value.problems === 'object') {
    for (const [k, v] of Object.entries(value.problems)) if (STATUSES.has(v) && /^DSA[\w-]{2,12}$/.test(k)) problems[k] = v;
  }
  return { lessons, problems };
}

function read() {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? sanitise(JSON.parse(raw)) : EMPTY;
  } catch {
    return EMPTY;
  }
}

let state = typeof window === 'undefined' ? EMPTY : read();
const listeners = new Set();

function write(next) {
  state = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable: progress lasts for this visit only */
  }
  listeners.forEach((l) => l());
}

// Keep several open tabs in step.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key !== KEY) return;
    state = read();
    listeners.forEach((l) => l());
  });
}

const subscribe = (l) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function useProgress() {
  return useSyncExternalStore(subscribe, () => state, () => EMPTY);
}

export function setLessonDone(id, done) {
  const lessons = { ...state.lessons };
  if (done) lessons[id] = true;
  else delete lessons[id];
  write({ ...state, lessons });
}

/** status: 'solved', 'review' or null (clear). */
export function setProblemStatus(id, status) {
  const problems = { ...state.problems };
  if (STATUSES.has(status)) problems[id] = status;
  else delete problems[id];
  write({ ...state, problems });
}

export function resetProgress() {
  write(EMPTY);
}
