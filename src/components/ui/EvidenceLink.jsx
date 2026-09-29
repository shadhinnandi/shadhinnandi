import Icon from './Icon.jsx';

// Plain link to a certificate or document (image or PDF), opened in a new
// tab. Same-origin, so no referrer concerns; noopener keeps the new tab
// isolated from this page.
export default function EvidenceLink({ href, children, kind = 'image' }) {
  if (!href) return null;
  return (
    <a className="text-link" href={href} target="_blank" rel="noopener">
      {children}
      <Icon name={kind === 'pdf' ? 'document' : 'image'} />
      <span className="visually-hidden"> (opens in a new tab)</span>
    </a>
  );
}
