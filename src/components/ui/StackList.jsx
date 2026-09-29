// Technologies as a quiet mono line ("Java · Spring Boot · MySQL"), not pills.
export default function StackList({ items, limit, label = 'Technologies' }) {
  if (!items?.length) return null;
  const shown = limit ? items.slice(0, limit) : items;
  const rest = items.length - shown.length;
  return (
    <ul className="stack" aria-label={label}>
      {shown.map((t) => (
        <li key={t}>{t}</li>
      ))}
      {rest > 0 && <li className="stack__more">+{rest}</li>}
    </ul>
  );
}
