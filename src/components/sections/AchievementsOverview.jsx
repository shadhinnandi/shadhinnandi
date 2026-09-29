import { Link } from 'react-router-dom';
import Icon from '../ui/Icon.jsx';
import Img from '../ui/Img.jsx';
import EvidenceLink from '../ui/EvidenceLink.jsx';
import { awards, scholarships, certifications } from '../../data/achievements';

// Achievements as evidence: what was achieved, where, when and for what.
// Everything is visible on the page; certificates open as ordinary links.
// `full` (Achievements page) shows both event photos per award.
export default function AchievementsOverview({ headingLevel = 3, full = false }) {
  const H = `h${headingLevel}`;
  const H2 = `h${headingLevel + 1}`;
  return (
    <div className="achievements">
      <section className="achievements__group" aria-labelledby="ach-projects">
        <H id="ach-projects" className="achievements__label">
          Project recognition
        </H>
        <div className="recognition-grid">
          {awards.map((a) => (
            <article key={a.id} className="recognition panel">
              <div className="recognition__body">
                <p className="meta">
                  {a.event} · {a.date}
                </p>
                <H2 className="recognition__result">
                  <Icon name="award" size={20} />
                  {a.result}
                </H2>
                <p className="recognition__project">
                  <Link to={`/projects/${a.project.slug}`}>{a.project.name}</Link>
                </p>
                <dl className="recognition__facts">
                  <div>
                    <dt>Category</dt>
                    <dd>{a.category}</dd>
                  </div>
                  <div>
                    <dt>Field</dt>
                    <dd>{a.teams} teams</dd>
                  </div>
                </dl>
                <ul className="link-row">
                  <li>
                    <Link className="text-link" to={`/projects/${a.project.slug}`}>
                      Project details
                      <Icon name="arrowRight" />
                    </Link>
                  </li>
                  <li>
                    <EvidenceLink href={a.certificate?.full}>Certificate</EvidenceLink>
                  </li>
                </ul>
              </div>
              <div className={`recognition__photos${full ? ' recognition__photos--full' : ''}`}>
                {(full ? a.photos : a.photos.slice(-1)).map((p) => (
                  <figure key={p.name}>
                    <Img media={p} sizes={full ? '(min-width: 960px) 260px, 50vw' : '(min-width: 960px) 220px, 40vw'} />
                  </figure>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="achievements__split">
        <section className="achievements__group" aria-labelledby="ach-academic">
          <H id="ach-academic" className="achievements__label">
            Academic
          </H>
          <div className="achievement">
            <H2 className="achievement__title">{scholarships.title}</H2>
            <p className="achievement__text">{scholarships.description}</p>
            <ul className="achievement__counts">
              {scholarships.awards.map((s) => (
                <li key={s.label}>
                  <span className="achievement__count">{s.count}</span>
                  <span>{s.label}</span>
                </li>
              ))}
            </ul>
            <p className="meta">{scholarships.context}</p>
          </div>
        </section>

        <section className="achievements__group" aria-labelledby="ach-learning">
          <H id="ach-learning" className="achievements__label">
            Certifications
          </H>
          <ul className="achievement-list">
            {certifications.map((c) => (
              <li key={c.id} className="achievement">
                <H2 className="achievement__title">{c.title}</H2>
                <p className="meta">
                  {c.issuer} · {c.date}
                </p>
                <p className="achievement__text">{c.detail}</p>
                <ul className="link-row">
                  {c.links.map((l) => (
                    <li key={l.label}>
                      {l.to ? (
                        <Link className="text-link" to={l.to}>
                          {l.label}
                          <Icon name="arrowRight" />
                        </Link>
                      ) : (
                        <EvidenceLink href={l.href} kind={l.kind}>
                          {l.label}
                        </EvidenceLink>
                      )}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
