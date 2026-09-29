import { profile, primaryLinks } from '../../data/profile';
import { degree } from '../../data/education';
import Img from '../ui/Img.jsx';
import Icon from '../ui/Icon.jsx';
import ExternalLink from '../ui/ExternalLink.jsx';

// Identity, direction and proof points, readable in the first ten seconds.
const facts = [
  { label: 'Teaching', value: 'Labs in OOP, Computer Systems, DSA I & II and Electronics at CSE, UIU' },
  { label: 'Degree', value: `B.Sc. CSE · CGPA ${degree.facts[0].value} · graduating Jan 2027` },
  { label: 'Recognition', value: '3rd Runner-Up at UIU’s CSE Project Show, twice in 2025' },
];

export default function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="container">
        <div className="hero__grid">
          <div className="hero__copy">
            <p className="label hero__label">
              {profile.role} · {profile.location}
            </p>
            <h1 id="hero-title" className="hero__name">
              {profile.name}
            </h1>
            <p className="hero__headline">{profile.headline}</p>
            <p className="hero__summary">{profile.summary}</p>

            <div className="hero__actions">
              <a className="btn btn--primary" href="#work">
                View selected work
                <Icon name="arrowRight" />
              </a>
              <ul className="hero__links">
                {primaryLinks.map((l) => (
                  <li key={l.label}>
                    <ExternalLink className="btn btn--ghost" href={l.href} rel="me">
                      {l.label}
                      <Icon name="arrowUpRight" />
                    </ExternalLink>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <figure className="hero__portrait">
            <Img media={profile.portrait} sizes="(min-width: 960px) 340px, 112px" eager />
          </figure>
        </div>

        <dl className="hero__facts">
          {facts.map((f) => (
            <div key={f.label}>
              <dt>{f.label}</dt>
              <dd>{f.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
