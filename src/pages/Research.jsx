import PageHeader from '../components/PageHeader.jsx';
import Icon from '../components/Icon.jsx';
import { researchSummary, researchAreas, researchWork } from '../data/research';
import usePageTitle from '../lib/usePageTitle';

export default function Research() {
  usePageTitle('Research', 'Research interests of Shadhin Nandi: machine learning, bioinformatics, computer vision and human-computer interaction.');
  return (
    <div className="page">
      <PageHeader eyebrow="Research" title="Research" lead={researchSummary} />

      <div className="container">
        {researchWork.length > 0 && (
          <section className="block" aria-labelledby="work-title">
            <h2 id="work-title" className="block__title">
              Research work
            </h2>
            {researchWork.map((w) => (
              <article key={w.title} className="paper">
                {w.kind && <p className="meta">{w.kind}</p>}
                <h3 className="paper__title">{w.title}</h3>
                {w.authors && <p className="paper__authors">{w.authors.join(', ')}</p>}
                {w.supervisor && <p className="small muted">Supervisor: {w.supervisor}</p>}
                {w.abstract && <p>{w.abstract}</p>}
                {w.links?.length > 0 && (
                  <ul className="link-row">
                    {w.links.map((l) => (
                      <li key={l.href}>
                        <a className="text-link" href={l.href} target="_blank" rel="noopener noreferrer">
                          {l.label}
                          <Icon name="external" />
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </section>
        )}

        <section className="block" aria-labelledby="areas-title">
          <h2 id="areas-title" className="block__title">
            Areas of interest
          </h2>
          <ul className="area-list">
            {researchAreas.map((a) => (
              <li key={a.area}>
                <h3>{a.area}</h3>
                <p className="muted">{a.note}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
