import { useParams } from 'react-router-dom';
import { coursePath } from '../../../data/courses';
import usePageTitle from '../../../lib/usePageTitle';
import NotFound from '../../../pages/NotFound.jsx';
import { ENTRIES } from './content.js';
import Landing from './Landing.jsx';
import Reader from './Reader.jsx';
import './java-course.css';

/**
 * Object Oriented Programming (Java) course.
 *   /academic/beginner-java-programming                course overview
 *   /academic/beginner-java-programming/chapter/:id    reader at chapter :id (00–14)
 *   /academic/beginner-java-programming/lab/:id        reader at a practical lab
 *   /academic/beginner-java-programming/question-bank  reader at the question bank
 * The overview stays mounted under the reader, as in the Beginner C course.
 */
export default function JavaCourse({ course }) {
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
