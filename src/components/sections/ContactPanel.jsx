import { useEffect, useRef, useState } from 'react';
import { profile, primaryLinks, secondaryLinks } from '../../data/profile';
import Icon from '../ui/Icon.jsx';
import ExternalLink from '../ui/ExternalLink.jsx';

// Email first, then profile links. No form: there is no backend to receive
// one, and a mailto link is the most direct channel for a recruiter.
export default function ContactPanel({ headingLevel = 2, headingId, title = 'Contact', all = false }) {
  const H = `h${headingLevel}`;
  const [copied, setCopied] = useState(false);
  const timer = useRef();
  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable: the address is still visible and selectable */
    }
  };

  const links = all ? [...primaryLinks, ...secondaryLinks] : primaryLinks;

  return (
    <div className="contact panel panel--glass">
      <div className="contact__lead">
        <H id={headingId} className="contact__title">
          {title}
        </H>
        <p className="contact__text">{profile.availability} Email is the quickest way to reach me.</p>
      </div>

      <div className="contact__email">
        <a href={`mailto:${profile.email}`} className="contact__address">
          {profile.email}
        </a>
        <button type="button" className="btn btn--small btn--quiet" onClick={copy}>
          <Icon name={copied ? 'check' : 'copy'} />
          {copied ? 'Copied' : 'Copy'}
          <span className="visually-hidden"> email address</span>
        </button>
        <span className="visually-hidden" aria-live="polite">
          {copied ? 'Email address copied' : ''}
        </span>
      </div>

      <ul className="contact__links">
        {links.map((l) => (
          <li key={l.label}>
            <ExternalLink href={l.href} rel="me">
              <span className="contact__service">{l.label}</span>
              <span className="contact__handle">{l.handle}</span>
              <Icon name="arrowUpRight" />
            </ExternalLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
