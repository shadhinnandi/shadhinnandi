import PageHeader from '../components/ui/PageHeader.jsx';
import Img from '../components/ui/Img.jsx';
import { DegreeCard } from '../components/sections/Education.jsx';
import { profile } from '../data/profile';
import { schooling } from '../data/education';
import usePageTitle from '../lib/usePageTitle';

export default function About() {
  usePageTitle('About', 'About Shadhin Nandi: final-year CSE student at United International University, Undergraduate Teaching Assistant with hands-on work in software, machine learning and research.');
  return (
    <div className="page">
      <PageHeader label="About" title="About" className="page-header--about" />

      <div className="container about">
        <div className="prose">
          {profile.about.map((p) => (
            <p key={p.slice(0, 32)}>{p}</p>
          ))}
          <p className="muted">{profile.interests}</p>
        </div>

        <aside className="about__aside">
          <figure className="about__portrait">
            <Img media={profile.portrait} sizes="390px" />
          </figure>
        </aside>
      </div>

      <div className="container">
        <section id="education" className="block" aria-labelledby="education-title">
          <h2 id="education-title" className="block__title">
            Education
          </h2>
          <DegreeCard photo />

          <h3 className="label schooling__label">Before university</h3>
          <ul className="schooling">
            {schooling.map((s) => (
              <li key={s.title}>
                <p className="meta">{s.period}</p>
                <div>
                  <h4 className="schooling__title">{s.title}</h4>
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
