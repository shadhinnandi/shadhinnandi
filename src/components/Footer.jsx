import { Link } from 'react-router-dom';
import { profile } from '../data/profile';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div className="site-footer__id">
          <p className="site-footer__name">{profile.name}</p>
          <p className="muted">{profile.roles.join(' · ')}</p>
          <p className="muted small">{profile.location}</p>
        </div>

        <nav aria-label="Profiles and contact">
          <ul className="footer-links">
            {profile.links.map((l) => (
              <li key={l.label}>
                <a href={l.href} target="_blank" rel="noopener noreferrer me">
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <a href={`mailto:${profile.email}`}>Email</a>
            </li>
            <li>
              <a href={profile.resume} target="_blank" rel="noopener">
                Resume
              </a>
            </li>
            <li>
              <Link to="/contact">Contact</Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="container site-footer__base">
        <p className="small muted">© 2026 Shadhin Nandi. All rights reserved.</p>
      </div>
    </footer>
  );
}
