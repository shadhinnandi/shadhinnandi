import EvidenceLink from '../ui/EvidenceLink.jsx';

// Roles in reverse-chronological order: role, organisation, dates, courses and
// responsibilities. The full view (Experience page) adds the recommendation
// quote and supporting documents.
export default function ExperienceList({ items, compact = false, headingLevel = 3 }) {
  const H = `h${headingLevel}`;
  const sorted = [...items].sort((a, b) => (a.end === 'Present' ? -1 : b.end === 'Present' ? 1 : 0));
  return (
    <ol className={`experience${compact ? ' experience--compact' : ''}`}>
      {sorted.map((item) => (
        <li key={item.id} className="experience__item">
          <p className="experience__date meta">
            {item.start} – {item.end}
          </p>
          <div className="experience__body">
            <H className="experience__role">{item.role}</H>
            <p className="experience__org">
              {item.organization}
              <span className="muted"> · {item.type}</span>
            </p>
            <p className="experience__summary">{item.summary}</p>

            {item.courses && (
              <ul className="stack stack--wrap" aria-label="Courses supported">
                {item.courses.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            )}

            <ul className="points">
              {item.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>

            {!compact && (
              <>
                {item.quote && (
                  <figure className="quote">
                    <blockquote>
                      <p>{item.quote.text}</p>
                    </blockquote>
                    <figcaption>{item.quote.source}</figcaption>
                  </figure>
                )}
                {item.documents && (
                  <ul className="link-row">
                    {item.documents.map((d) => (
                      <li key={d.label}>
                        <EvidenceLink href={d.href || d.image?.full} kind={d.href ? 'pdf' : 'image'}>
                          {d.label} (PDF)
                        </EvidenceLink>
                      </li>
                    ))}
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
