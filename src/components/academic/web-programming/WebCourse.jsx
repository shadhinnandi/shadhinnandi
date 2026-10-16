import { useParams } from 'react-router-dom';
import { coursePath } from '../../../data/courses';
import usePageTitle from '../../../lib/usePageTitle';
import NotFound from '../../../pages/NotFound.jsx';
import { ENTRIES } from './content.js';
import Landing from './Landing.jsx';
import Reader from './Reader.jsx';
import '../computer-security/computer-security.css';
import './web-programming.css';

/**
 * Web Programming course (CSE 4165), built like the Computer Security course
 * and sharing its styles.
 *   /academic/web-programming                    course overview
 *   /academic/web-programming/topic/:id          reader at topic :id (00 to 19)
 *   /academic/web-programming/paper/:id          reader at a final exam paper (e.g. spring-2026-set-a)
 */
export default function WebCourse({ course }) {
  const { '*': rest = '' } = useParams();
  const basePath = coursePath(course);
  const subPath = rest.replace(/\/+$/, '');
  const entryIndex = subPath ? ENTRIES.findIndex((e) => e.path === subPath) : -1;
  const entry = ENTRIES[entryIndex];

  const notFound = Boolean(subPath) && !entry;
  let title = course.title;
  if (notFound) title = 'Page not found';
  else if (entry) title = `${entry.kind === 'topic' ? `${entry.id} · ` : `Final Exam ${entry.code} `}${entry.name} · ${course.title}`;
  usePageTitle(title, notFound ? undefined : course.summary);

  if (notFound) return <NotFound />;

  return (
    <div className="page csec csec--web">
      <Landing basePath={basePath} />
      {entry && <Reader entryIndex={entryIndex} basePath={basePath} />}
    </div>
  );
}
