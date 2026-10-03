import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams } from 'react-router-dom';
import { coursePath } from '../../../data/courses';
import usePageTitle from '../../../lib/usePageTitle';
import NotFound from '../../../pages/NotFound.jsx';
import { ENTRIES } from './content.js';
import Landing from './Landing.jsx';
import Reader from './Reader.jsx';
import './beginner-c.css';

/**
 * Beginner C Programming course.
 *   /academic/beginner-c-programming                course overview
 *   /academic/beginner-c-programming/chapter/:id    reader at chapter :id (00–14)
 *   /academic/beginner-c-programming/question-bank  reader at the question bank
 * The overview stays mounted under the reader, as in the original course page.
 */

/** Reading progress along the top edge of the window. */
function ScrollProgress() {
  const ref = useRef(null);
  useEffect(() => {
    const onScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
      if (ref.current) ref.current.style.width = `${pct}%`;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);
  return createPortal(
    <div className="bc">
      <div className="bc-scroll-progress" ref={ref} aria-hidden="true" />
    </div>,
    document.body,
  );
}

export default function BeginnerC({ course }) {
  const { '*': rest = '' } = useParams();
  const basePath = coursePath(course);
  const subPath = rest.replace(/\/+$/, '');
  const entryIndex = subPath ? ENTRIES.findIndex((e) => e.path === subPath) : -1;
  const entry = ENTRIES[entryIndex];

  const notFound = Boolean(subPath) && !entry;
  let title = course.title;
  if (notFound) title = 'Page not found';
  else if (entry) title = `${entry.kind === 'chapter' ? `${entry.id} · ` : ''}${entry.name} · ${course.title}`;
  usePageTitle(title, notFound ? undefined : course.summary);

  if (notFound) return <NotFound />;

  return (
    <div className="page bc bc-page">
      <ScrollProgress />
      <Landing basePath={basePath} />
      {entry && <Reader entryIndex={entryIndex} basePath={basePath} />}
    </div>
  );
}
