import { Navigate, useParams } from 'react-router-dom';
import { getCourse } from '../data/courses';
import { courseViews } from '../components/academic/courseViews';
import NotFound from './NotFound.jsx';

// /academic/:slug/* — a course and everything under it (chapters, question
// bank). Each course view reads the rest of the path itself.
export default function Course() {
  const { slug, '*': rest } = useParams();
  const course = getCourse(slug);
  const View = course && courseViews[course.slug];

  if (View) return <View course={course} />;
  // Older URLs: course projects used to live under /academic/:slug.
  if (!rest) return <Navigate to={`/projects/${slug}`} replace />;
  return <NotFound />;
}
