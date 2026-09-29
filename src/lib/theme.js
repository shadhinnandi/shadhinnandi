import { useCallback, useEffect, useState } from 'react';

// Theme preference. public/theme-init.js (loaded as a blocking script in
// index.html, deliberately comment-free because it is published verbatim)
// applies the same logic before first paint so there is no flash, and adds
// html.motion-ok when scroll-reveal motion is allowed. This module keeps
// React in sync afterwards.
// An explicit choice is stored; without one, the OS setting is followed live.

const STORAGE_KEY = 'theme';
const THEME_COLORS = { light: '#f5f5f7', dark: '#0a0a0c' };
const query = '(prefers-color-scheme: dark)';

function readStored() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null; // storage blocked (private mode, sandboxed iframe)
  }
}

function writeStored(value) {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    /* preference simply won't persist */
  }
}

const systemTheme = () => (window.matchMedia?.(query).matches ? 'dark' : 'light');

function applyTheme(theme, animate) {
  const root = document.documentElement;
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (animate && !reduce) {
    root.classList.add('theme-transition');
    window.setTimeout(() => root.classList.remove('theme-transition'), 360);
  }
  root.dataset.theme = theme;
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute('content', THEME_COLORS[theme]));
}

export function useTheme() {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || readStored() || systemTheme());

  // Follow the OS setting until the visitor makes an explicit choice.
  useEffect(() => {
    const mq = window.matchMedia?.(query);
    if (!mq) return undefined;
    const onChange = () => {
      if (readStored()) return;
      const next = mq.matches ? 'dark' : 'light';
      applyTheme(next, true);
      setTheme(next);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const toggle = useCallback(() => {
    setTheme((current) => {
      const next = current === 'dark' ? 'light' : 'dark';
      writeStored(next);
      applyTheme(next, true);
      return next;
    });
  }, []);

  return { theme, toggle };
}
