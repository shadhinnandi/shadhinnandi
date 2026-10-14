import { useParams } from 'react-router-dom';
import { coursePath } from '../../../data/courses';
import usePageTitle from '../../../lib/usePageTitle';
import NotFound from '../../../pages/NotFound.jsx';
import { ENTRIES } from './content.js';
import Landing from './Landing.jsx';
import Reader from './Reader.jsx';
import './computer-security.css';

/**
 * Computer Security course.
 *   /academic/computer-security                 course overview
 *   /academic/computer-security/topic/:id       reader at topic :id (00 to 16)
 *   /academic/computer-security/paper/:id       reader at a previous paper (e.g. spring-2025)
 * The overview stays mounted under the reader, as in the other courses.
 */
export default function SecurityCourse({ course }) {
  const { '*': rest = '' } = useParams();
  const basePath = coursePath(course);
  const subPath = rest.replace(/\/+$/, '');
  const entryIndex = subPath ? ENTRIES.findIndex((e) => e.path === subPath) : -1;
  const entry = ENTRIES[entryIndex];

  const notFound = Boolean(subPath) && !entry;
  let title = course.title;
  if (notFound) title = 'Page not found';
  else if (entry) title = `${entry.kind === 'topic' ? `${entry.id} · ` : 'Final Exam '}${entry.name} · ${course.title}`;
  usePageTitle(title, notFound ? undefined : course.summary);

  if (notFound) return <NotFound />;

  return (
    <div className="page csec">
      <Landing basePath={basePath} />
      {entry && <Reader entryIndex={entryIndex} basePath={basePath} />}
    </div>
  );
}
