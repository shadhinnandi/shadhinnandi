import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

// On navigation: scroll to the hash target or the top, and move focus to
// <main> so screen readers announce the new page instead of staying on the
// link that was activated.
export default function RouteEffects() {
  const { pathname, hash } = useLocation();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      if (!hash) return;
    }
    if (hash) {
      // Lazily loaded pages may not have rendered yet: retry for ~1s.
      const id = decodeURIComponent(hash.slice(1));
      let tries = 0;
      let frame;
      const find = () => {
        const target = document.getElementById(id);
        if (target) target.scrollIntoView();
        else if (tries++ < 60) frame = requestAnimationFrame(find);
      };
      find();
      return () => cancelAnimationFrame(frame);
    }
    window.scrollTo(0, 0);
    document.getElementById('main')?.focus({ preventScroll: true });
  }, [pathname, hash]);

  return null;
}
