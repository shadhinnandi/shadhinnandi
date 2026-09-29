import { Link } from 'react-router-dom';
import Icon from './Icon.jsx';
import Reveal from './Reveal.jsx';

// Home-page section: heading row (title, one-line intro, optional link) and
// content. `band` switches to the alternate background layer so consecutive
// sections read as distinct without boxing each one in.
export default function Section({ id, title, intro, link, band = false, children, className = '' }) {
  const headingId = `${id}-title`;
  return (
    <section id={id} className={`section${band ? ' section--band' : ''} ${className}`.trim()} aria-labelledby={headingId}>
      <div className="container">
        <Reveal className="section__head">
          <div>
            <h2 id={headingId}>{title}</h2>
            {intro && <p className="section__intro">{intro}</p>}
          </div>
          {link && (
            <Link className="text-link section__link" to={link.to}>
              {link.label}
              <Icon name="arrowRight" />
            </Link>
          )}
        </Reveal>
        {children}
      </div>
    </section>
  );
}
