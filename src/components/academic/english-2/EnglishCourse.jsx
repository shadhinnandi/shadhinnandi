import { useParams } from 'react-router-dom';
import { coursePath } from '../../../data/courses';
import usePageTitle from '../../../lib/usePageTitle';
import NotFound from '../../../pages/NotFound.jsx';
import { ENTRIES } from './content.js';
import Landing from './Landing.jsx';
import Reader from './Reader.jsx';
import '../computer-security/computer-security.css';
import './english.css';

/**
 * English II (ENG 1013), built like the Biology and Web Programming courses
 * and sharing their styles.
 *   /academic/english-2                       course overview
 *   /academic/english-2/introduction          general introduction
 *   /academic/english-2/mid/<topic>           midterm lessons
 *   /academic/english-2/final/<topic>         final lessons
 *   /academic/english-2/questions[/<paper>]   question bank and full papers
 */
export default function EnglishCourse({ course }) {
  const { '*': rest = '' } = useParams();
  const basePath = coursePath(course);
  const subPath = rest.replace(/\/+$/, '');
  const entryIndex = subPath ? ENTRIES.findIndex((e) => e.path === subPath) : -1;
  const entry = ENTRIES[entryIndex];

  const notFound = Boolean(subPath) && !entry;
  let title = course.title;
  if (notFound) title = 'Page not found';
  else if (entry) title = `${entry.name} · ${course.title}`;
  usePageTitle(title, notFound ? undefined : course.summary);

  if (notFound) return <NotFound />;

  return (
    <div className="page csec csec--eng">
      <Landing basePath={basePath} />
      {entry && <Reader entryIndex={entryIndex} basePath={basePath} />}
    </div>
  );
}
