import { Link } from 'react-router-dom';
import { profile } from '../data/profile';
import { degree } from '../data/education';
import Img from './Img.jsx';
import Icon from './Icon.jsx';

export default function Hero() {
  const [linkedin, github] = profile.links;
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="container hero__grid">
        <div className="hero__text">
          <p className="eyebrow">{profile.discipline} · {profile.university}</p>
          <h1 id="hero-title" className="hero__name">
            {profile.name}
          </h1>
          <p className="hero__role">{profile.roles.join(' · ')}</p>
          <p className="hero__focus">{profile.focus.join(' · ')}</p>

          <div className="hero__actions">
            <Link to="/projects" className="btn btn--primary">
              View Projects
            </Link>
            <a href={profile.resume} className="btn btn--outline" target="_blank" rel="noopener">
              View Resume
            </a>
          </div>

          <ul className="hero__links link-row">
            {[linkedin, github].map((l) => (
              <li key={l.label}>
                <a className="text-link" href={l.href} target="_blank" rel="noopener noreferrer me">
                  {l.label}
                  <Icon name="external" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <figure className="hero__portrait">
          <Img media={profile.portrait} sizes="(min-width: 960px) 380px, 60vw" eager />
        </figure>
      </div>

      <div className="container">
        <dl className="hero__facts">
          <div>
            <dt>Currently</dt>
            <dd>Undergraduate Teaching Assistant, Department of CSE, UIU</dd>
          </div>
          <div>
            <dt>Studying</dt>
            <dd>
              {degree.title} · expected Jan 2027
            </dd>
          </div>
          <div>
            <dt>Based in</dt>
            <dd>{profile.location}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
