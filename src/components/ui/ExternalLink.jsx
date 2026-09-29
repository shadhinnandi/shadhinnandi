// Link to another origin, opened in a new tab.
// rel="noopener noreferrer": the new page gets no window.opener handle
// (reverse tabnabbing) and no Referer header.
export default function ExternalLink({ href, children, rel, newTab = true, ...rest }) {
  if (!href) return null;
  const relValue = ['noopener', 'noreferrer', rel].filter(Boolean).join(' ');
  return (
    <a href={href} target={newTab ? '_blank' : undefined} rel={relValue} {...rest}>
      {children}
      {newTab && <span className="visually-hidden"> (opens in a new tab)</span>}
    </a>
  );
}
