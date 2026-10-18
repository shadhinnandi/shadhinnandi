import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { coursePath } from '../../../data/courses';
import usePageTitle from '../../../lib/usePageTitle';
import NotFound from '../../../pages/NotFound.jsx';
import { ENTRIES, problemById } from './content.js';
import Landing from './Landing.jsx';
import Reader from './Reader.jsx';
import '../beginner-java/java-course.css';
import '../beginner-c/beginner-c.css';
import './dsa.css';

/** The reader entry for a URL path below the course: a module, a page or one problem. */
export function entryForPath(subPath) {
  const entry = ENTRIES.find((e) => e.path === subPath);
  if (entry) return entry;
  const m = /^problem\/(DSA[\w-]+)$/.exec(subPath);
  const p = m && problemById(m[1]);
  return p ? { kind: 'problem', id: p.id, idx: p.id, name: `${p.id} · ${p.title}`, path: subPath, problem: p } : null;
}

/**
 * Data Structures and Algorithms I, built on the Object Oriented Programming
 * course's layout and styles.
 *   /academic/dsa-1                       course overview and progress
 *   /academic/dsa-1/topic/<slug>          lesson and practice list of one module
 *   /academic/dsa-1/problem/<ID>          one problem (canonical record)
 *   /academic/dsa-1/question-bank         every problem: filters, search, sorting
 *   /academic/dsa-1/challenges            completion-level challenges
 *   /academic/dsa-1/lab-preparation, interview-preparation, coverage
 */
export default function DsaCourse({ course }) {
  const { '*': rest = '' } = useParams();
  const basePath = coursePath(course);
  const subPath = rest.replace(/\/+$/, '');
  const entry = useMemo(() => (subPath ? entryForPath(subPath) : null), [subPath]);

  const notFound = Boolean(subPath) && !entry;
  let title = course.title;
  if (notFound) title = 'Page not found';
  else if (entry) title = `${entry.kind === 'topic' ? `${entry.id} · ` : ''}${entry.name} · ${course.title}`;
  usePageTitle(title, notFound ? undefined : course.summary);

  if (notFound) return <NotFound />;

  return (
    <div className="page oop dsa">
      <Landing basePath={basePath} />
      {entry && <Reader entry={entry} basePath={basePath} />}
    </div>
  );
}
