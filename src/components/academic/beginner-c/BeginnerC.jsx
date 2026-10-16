import { useParams } from 'react-router-dom';
import { coursePath } from '../../../data/courses';
import usePageTitle from '../../../lib/usePageTitle';
import NotFound from '../../../pages/NotFound.jsx';
import { ENTRIES } from './content.js';
import Landing from './Landing.jsx';
import Reader from './Reader.jsx';
import '../beginner-java/java-course.css';
import './beginner-c.css';

/**
 * Beginner C Programming course.
 *   /academic/beginner-c-programming                course overview
 *   /academic/beginner-c-programming/chapter/:id    reader at chapter :id (00–14)
 *   /academic/beginner-c-programming/question-bank  reader at the question bank
 * Shares its layout and styles (light and dark themes) with the Java course;
 * the overview stays mounted under the reader.
 */
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
    <div className="page oop">
      <Landing basePath={basePath} />
      {entry && <Reader entryIndex={entryIndex} basePath={basePath} />}
    </div>
  );
}
