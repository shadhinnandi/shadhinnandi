export default function SkillGroup({ group, showEvidence = false, headingLevel = 3 }) {
  const H = `h${headingLevel}`;
  return (
    <div className="skill-group">
      <H className="skill-group__title">{group.group}</H>
      <ul className="skill-group__items">
        {group.items.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
      {showEvidence && group.evidence && (
        <p className="skill-group__evidence small muted">
          <span className="label-inline">Evidence:</span> {group.evidence}
        </p>
      )}
    </div>
  );
}
