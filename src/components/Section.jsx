import { Link } from 'react-router-dom';
import Icon from './Icon.jsx';

// Two-column editorial section used on the home page: a label column on the
// left (eyebrow + heading + link) and the content on the right.
export default function Section({ id, eyebrow, title, link, children, className = '' }) {
  const headingId = `${id}-title`;
  return (
    <section id={id} className={`section ${className}`} aria-labelledby={headingId}>
      <div className="container section__grid">
        <header className="section__head">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h2 id={headingId}>{title}</h2>
          {link && (
            <Link className="text-link section__link" to={link.to}>
              {link.label}
              <Icon name="arrowRight" />
            </Link>
          )}
        </header>
        <div className="section__body">{children}</div>
      </div>
    </section>
  );
}
