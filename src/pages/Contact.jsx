import PageHeader from '../components/PageHeader.jsx';
import Icon from '../components/Icon.jsx';
import { profile } from '../data/profile';
import usePageTitle from '../lib/usePageTitle';

export default function Contact() {
  usePageTitle('Contact', 'Contact Shadhin Nandi by email or through LinkedIn, GitHub and Codeforces.');
  return (
    <div className="page">
      <PageHeader
        eyebrow="Contact"
        title="Contact"
        lead="Email is the quickest way to reach me about internships, software engineering roles, research, or teaching."
      >
        <p>
          <a className="btn btn--primary" href={`mailto:${profile.email}`}>
            {profile.email}
          </a>
        </p>
      </PageHeader>

      <div className="container">
        <ul className="contact-list">
          {profile.links.map((l) => (
            <li key={l.label}>
              <span className="label">{l.label}</span>
              <a href={l.href} target="_blank" rel="noopener noreferrer me">
                {l.handle}
                <Icon name="external" />
              </a>
            </li>
          ))}
          <li>
            <span className="label">Resume</span>
            <a href={profile.resume} target="_blank" rel="noopener">
              Shadhin_Nandi_Resume.pdf
              <Icon name="document" />
            </a>
          </li>
          <li>
            <span className="label">Location</span>
            <span>{profile.location}</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
