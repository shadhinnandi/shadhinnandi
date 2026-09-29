import { Link } from 'react-router-dom';
import Icon from '../ui/Icon.jsx';

const statusTone = {
  Ongoing: 'active',
  'Ongoing research': 'active',
  'In progress': 'active',
};

export function StatusTag({ children }) {
  return <span className={`status-tag status-tag--${statusTone[children] || 'quiet'}`}>{children}</span>;
}

// Ongoing research, written first for any reader. `compact` (home page) keeps
// the plain-language description and links to the methods; the Research page
// shows the approaches as well.
export function CurrentResearch({ item, compact = false, headingLevel = 3 }) {
  const H = `h${headingLevel}`;
  return (
    <article className={`current-research panel panel--glass${compact ? ' current-research--compact' : ''}`}>
      <div className="current-research__main">
        <p className="current-research__meta">
          <span className="label">{item.area}</span>
          <StatusTag>{item.status}</StatusTag>
        </p>
        <H className="current-research__title">{item.title}</H>
        <p className="current-research__plain">{item.plain}</p>
        {compact && (
          <Link className="text-link" to="/research">
            Approach and methods
            <Icon name="arrowRight" />
          </Link>
        )}
      </div>
      {!compact && (
        <div className="current-research__methods">
          <p className="label">Approaches I am working with</p>
          <ul className="points">
            {item.methods.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
          <p className="current-research__note">{item.note}</p>
        </div>
      )}
    </article>
  );
}

// Research areas with an honest involvement level on each. `detailed` adds
// the technical topics (second level of detail).
export function ResearchAreas({ areas, detailed = false, headingLevel = 3 }) {
  const H = `h${headingLevel}`;
  return (
    <ul className={`areas${detailed ? ' areas--detailed' : ''}`}>
      {areas.map((a) => (
        <li key={a.area} className="area">
          <StatusTag>{a.involvement}</StatusTag>
          <H className="area__title">{a.area}</H>
          <p className="area__summary">{a.summary}</p>
          {detailed && a.details?.length > 0 && (
            <ul className="area__details" aria-label={`${a.area} topics`}>
              {a.details.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}
