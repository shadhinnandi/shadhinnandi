import PageHeader from '../components/ui/PageHeader.jsx';
import CourseCard from '../components/academic/CourseCard.jsx';
import { courses } from '../data/courses';
import usePageTitle from '../lib/usePageTitle';

export default function Academic() {
  usePageTitle('Academic', 'Self-study courses by Shadhin Nandi for university Computer Science, starting with Beginner C Programming.');
  return (
    <div className="page">
      <PageHeader
        label="Academic"
        title="Academic"
        lead="Self-study material for university Computer Science courses: chapters, worked examples and practice problems."
      />

      <div className="container">
        <section className="block" aria-labelledby="courses-title">
          <h2 id="courses-title" className="block__title">
            Courses
          </h2>
          <div className="card-grid">
            {courses.map((c) => (
              <CourseCard key={c.slug} course={c} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
