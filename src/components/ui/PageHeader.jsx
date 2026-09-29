// Header for dedicated pages. One <h1> per page.
export default function PageHeader({ label, title, lead, children }) {
  return (
    <header className="page-header">
      <div className="container">
        {label && <p className="label">{label}</p>}
        <h1>{title}</h1>
        {lead && <p className="lead">{lead}</p>}
        {children}
      </div>
    </header>
  );
}
