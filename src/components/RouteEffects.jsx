import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

// On navigation: reset scroll and move keyboard/screen-reader focus to <main>,
// so the new page is announced instead of leaving focus on the old link.
export default function RouteEffects() {
  const { pathname, hash } = useLocation();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (hash) {
      const target = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (target) {
        target.scrollIntoView();
        return;
      }
    }
    window.scrollTo(0, 0);
    const main = document.getElementById('main');
    if (main) main.focus({ preventScroll: true });
  }, [pathname, hash]);

  return null;
}
