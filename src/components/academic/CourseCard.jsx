import { Link } from 'react-router-dom';
import Icon from '../ui/Icon.jsx';
import StackList from '../ui/StackList.jsx';
import { coursePath } from '../../data/courses';

// Course card for the Academic page. Same card recipe as project cards; the
// title link stretches over the whole card so any click opens the course.
export default function CourseCard({ course, headingLevel = 3 }) {
  const H = `h${headingLevel}`;
  return (
    <article className="card course-card">
      <div className="course-card__cover" aria-hidden="true">
        <span className="course-card__mark">{course.mark}</span>
      </div>
      <div className="card__body">
        {course.label && <p className="meta">{course.label}</p>}
        <H className="card__title">
          <Link to={coursePath(course)} className="course-card__link">
            {course.title}
          </Link>
        </H>
        <p className="card__summary">{course.summary}</p>
        <div className="card__foot">
          <StackList items={course.facts} label="Course contents" />
          <p className="link-row course-card__cta" aria-hidden="true">
            <span className="text-link">
              Open course
              <Icon name="arrowRight" />
            </span>
          </p>
        </div>
      </div>
    </article>
  );
}
