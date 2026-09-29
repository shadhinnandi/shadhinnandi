import { degree } from '../../data/education';
import Img from '../ui/Img.jsx';

// Degree summary: programme, institution, dates, CGPA and credits.
export function DegreeCard({ headingLevel = 3, photo = false }) {
  const H = `h${headingLevel}`;
  return (
    <div className={`degree panel${photo ? ' degree--photo' : ''}`}>
      {photo && degree.photo && (
        <figure className="degree__photo">
          <Img media={degree.photo} sizes="(min-width: 960px) 520px, 100vw" />
        </figure>
      )}
      <div className="degree__body">
        <p className="meta">{degree.period}</p>
        <H className="degree__title">{degree.title}</H>
        <p className="degree__school">
          {degree.institution}, {degree.location}
        </p>

        <dl className="degree__facts">
          {degree.facts.map((f) => (
            <div key={f.label}>
              <dt>{f.label}</dt>
              <dd>
                {f.value}
                {f.unit && <span className="degree__unit"> {f.unit}</span>}
              </dd>
            </div>
          ))}
        </dl>

      </div>
    </div>
  );
}
