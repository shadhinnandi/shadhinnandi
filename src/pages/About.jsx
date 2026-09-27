import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader.jsx';
import Img from '../components/Img.jsx';
import Icon from '../components/Icon.jsx';
import { profile } from '../data/profile';
import usePageTitle from '../lib/usePageTitle';

const quickLinks = [
  { to: '/academic', label: 'Academic background' },
  { to: '/experience', label: 'Experience' },
  { to: '/projects', label: 'Projects' },
  { to: '/research', label: 'Research' },
];

export default function About() {
  usePageTitle('About', 'About Shadhin Nandi: CSE undergraduate at UIU, Undergraduate Teaching Assistant, and software engineer.');
  return (
    <div className="page">
      <PageHeader eyebrow="About" title="About me" lead={profile.intro} />

      <div className="container two-col">
        <div className="prose">
          {profile.about.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
          <p className="muted">{profile.interests}</p>

          <ul className="link-row">
            <li>
              <a className="btn btn--primary" href={profile.resume} download="Shadhin_Nandi_Resume.pdf">
                Download resume
                <Icon name="download" />
              </a>
            </li>
            <li>
              <Link className="btn btn--outline" to="/contact">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        <aside className="aside">
          <figure className="aside__portrait">
            <Img media={profile.portrait} sizes="(min-width: 960px) 320px, 80vw" />
          </figure>
          <nav aria-label="Continue reading" className="aside__nav">
            <p className="label">Continue</p>
            <ul>
              {quickLinks.map((l) => (
                <li key={l.to}>
                  <Link className="text-link" to={l.to}>
                    {l.label}
                    <Icon name="arrowRight" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      </div>
    </div>
  );
}
