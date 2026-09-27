// Experience timeline. `compact` shows role, organization and dates only.
import CertificateButton from './CertificateButton.jsx';
import Icon from './Icon.jsx';

export default function Timeline({ items, compact = false, headingLevel = 3 }) {
  const H = `h${headingLevel}`;
  return (
    <ol className={`timeline${compact ? ' timeline--compact' : ''}`}>
      {items.map((item) => (
        <li key={item.id} className="timeline__item">
          <p className="timeline__date meta">
            <time>{item.start}</time> – <time>{item.end}</time>
          </p>
          <div className="timeline__body">
            <H className="timeline__role">{item.role}</H>
            <p className="timeline__org">{item.organization}</p>
            {compact ? (
              <p className="muted">{item.summary}</p>
            ) : (
              <>
                <p className="small muted">
                  {item.type} · {item.location}
                </p>
                {item.courses && (
                  <div className="timeline__block">
                    <p className="label">Courses supported</p>
                    <ul className="tags" aria-label="Courses supported">
                      {item.courses.map((c) => (
                        <li key={c}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <ul className="points">
                  {item.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
                {item.quote && (
                  <figure className="pull-quote">
                    <blockquote>
                      <p>{item.quote.text}</p>
                    </blockquote>
                    <figcaption className="small muted">{item.quote.source}</figcaption>
                  </figure>
                )}
                {item.documents && (
                  <ul className="link-row">
                    {item.documents.map((d) =>
                      d.kind === 'image' ? (
                        <li key={d.label}>
                          <CertificateButton image={d.image} title={`${item.organization} — ${d.label}`} href={d.href}>
                            View {d.label.toLowerCase()}
                          </CertificateButton>
                        </li>
                      ) : (
                        <li key={d.label}>
                          <a className="text-link" href={d.href} target="_blank" rel="noopener">
                            {d.label} (PDF)
                            <Icon name="external" />
                          </a>
                        </li>
                      ),
                    )}
                  </ul>
                )}
              </>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
