import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import ProjectCard from '../components/ProjectCard.jsx';
import Img from '../components/Img.jsx';
import Icon from '../components/Icon.jsx';
import { degree, schooling } from '../data/education';
import { academicProjects } from '../data/projects';
import { awards } from '../data/achievements';
import usePageTitle from '../lib/usePageTitle';

export default function Academic() {
  usePageTitle(
    'Academic',
    'Education and course projects of Shadhin Nandi: B.Sc. in Computer Science & Engineering at United International University, CGPA 3.93/4.00.',
  );
  const showAwards = awards.filter((a) => a.id.startsWith('project-show'));

  return (
    <div className="page">
      <PageHeader
        eyebrow="Academic"
        title="Academic background"
        lead="Undergraduate study in Computer Science & Engineering at United International University, Dhaka, and the projects built for its courses."
      />

      <div className="container">
        <section className="block" aria-labelledby="degree-title">
          <div className="degree-feature">
            <div>
              <p className="meta">{degree.period}</p>
              <h2 id="degree-title" className="h3-size">
                {degree.title}
              </h2>
              <p className="degree__school">
                {degree.institution} · {degree.location}
              </p>
              <dl className="facts">
                {degree.facts.map((f) => (
                  <div key={f.label}>
                    <dt>{f.label}</dt>
                    <dd>{f.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <figure className="degree-feature__photo">
              <Img media={degree.photo} sizes="(min-width: 960px) 480px, 100vw" />
            </figure>
          </div>
        </section>

        <section className="block" aria-labelledby="academic-projects-title">
          <h2 id="academic-projects-title" className="block__title">
            Academic projects
          </h2>
          <p className="muted block__intro">
            Projects built for UIU courses, with the course each was made for. Independent work is on the{' '}
            <Link to="/projects">Projects</Link> page.
          </p>
          <div className="project-list project-list--academic">
            {academicProjects.map((p) => (
              <ProjectCard key={p.slug} project={p} showType={false} />
            ))}
          </div>
        </section>

        <section className="block" aria-labelledby="recognition-title">
          <h2 id="recognition-title" className="block__title">
            Scholarships and recognition
          </h2>
          <ul className="plain-list">
            <li>
              <strong>Merit scholarships</strong> — 8 × 100% and 2 × 25%, awarded by UIU for academic performance.
            </li>
            {showAwards.map((a) => (
              <li key={a.id}>
                <strong>{a.title}</strong> — {a.date}. {a.context}.
              </li>
            ))}
          </ul>
          <Link className="text-link" to="/achievements">
            All achievements
            <Icon name="arrowRight" />
          </Link>
        </section>

        <section className="block" aria-labelledby="school-title">
          <h2 id="school-title" className="block__title">
            Secondary education
          </h2>
          <ul className="edu-list">
            {schooling.map((s) => (
              <li key={s.title}>
                <p className="meta">{s.period}</p>
                <div>
                  <h3 className="edu-list__title">{s.title}</h3>
                  <p className="muted">
                    {s.institution} · {s.result}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
