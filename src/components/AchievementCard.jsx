import { Link } from 'react-router-dom';
import CertificateButton from './CertificateButton.jsx';
import Img from './Img.jsx';
import Icon from './Icon.jsx';
import { getProject, projectPath } from '../data/projects';

export default function AchievementCard({ award, detailed = false, headingLevel = 3 }) {
  const H = `h${headingLevel}`;
  return (
    <article className={`award${detailed ? ' award--detailed' : ''}`}>
      <p className="award__date meta">{award.date}</p>
      <div className="award__body">
        <H className="award__title">{award.title}</H>
        <p className="award__context">{award.context}</p>
        {detailed && award.issuer && <p className="small muted">{award.issuer}</p>}
        {(award.project || award.certificate) && (
          <ul className="link-row">
            {award.project && (
              <li>
                <Link className="text-link" to={projectPath(getProject(award.project.slug))}>
                  Project: {award.project.name}
                  <Icon name="arrowRight" />
                </Link>
              </li>
            )}
            {detailed && award.certificate && (
              <li>
                <CertificateButton image={award.certificate} title={`Certificate — ${award.title}`} />
              </li>
            )}
          </ul>
        )}
        {detailed && award.photos?.length > 0 && (
          <div className="award__photos">
            {award.photos.map((p) => (
              <figure key={p.name}>
                <Img media={p} sizes="(min-width: 960px) 360px, 50vw" />
              </figure>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
