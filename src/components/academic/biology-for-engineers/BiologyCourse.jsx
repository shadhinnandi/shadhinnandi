import { useParams } from 'react-router-dom';
import { coursePath } from '../../../data/courses';
import usePageTitle from '../../../lib/usePageTitle';
import NotFound from '../../../pages/NotFound.jsx';
import { ENTRIES } from './content.js';
import Landing from './Landing.jsx';
import Reader from './Reader.jsx';
import '../computer-security/computer-security.css';
import './biology.css';

/**
 * Biology for Engineers (BIO 3105), built like the Computer Security and Web
 * Programming courses and sharing their styles.
 *   /academic/biology-for-engineers                       course overview
 *   /academic/biology-for-engineers/introduction          general introduction
 *   /academic/biology-for-engineers/mid/<section>         midterm pages
 *   /academic/biology-for-engineers/final/<section>       final pages
 *   /academic/biology-for-engineers/questions[/<paper>]   question bank
 */
export default function BiologyCourse({ course }) {
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
    <div className="page csec csec--bio">
      <Landing basePath={basePath} />
      {entry && <Reader entryIndex={entryIndex} basePath={basePath} />}
    </div>
  );
}
