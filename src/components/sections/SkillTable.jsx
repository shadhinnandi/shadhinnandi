// Skills as labelled rows: scannable in a few seconds, no bars or ratings.
export default function SkillTable({ groups, showEvidence = false, headingLevel = 3 }) {
  const H = `h${headingLevel}`;
  return (
    <div className="skills">
      {groups.map((g) => (
        <div key={g.group} className="skills__row">
          <H className="skills__group">{g.group}</H>
          <div>
            <ul className="skills__items">
              {g.items.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            {showEvidence && g.evidence && <p className="skills__evidence">{g.evidence}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
